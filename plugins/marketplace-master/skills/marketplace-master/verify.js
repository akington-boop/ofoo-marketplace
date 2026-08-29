import fs from 'node:fs';
import path from 'node:path';

const CAPABILITY_NAMES = ['skills', 'commands', 'agents', 'hooks', '.mcp.json'];
const REQUIRED_MANIFEST_FIELDS = ['name', 'version', 'description', 'author'];
const DESCRIPTION_WORD_LIMIT = 50;

function parseFrontmatter(content) {
  const lines = content.replace(/\r\n/g, '\n').split('\n');
  if (lines[0]?.trim() !== '---') return { hasFrontmatter: false, fields: {} };

  let end = -1;
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === '---') {
      end = i;
      break;
    }
  }
  if (end === -1) return { hasFrontmatter: false, fields: {} };

  const body = lines.slice(1, end);
  const fields = {};
  let i = 0;
  while (i < body.length) {
    const match = body[i].match(/^(\w[\w-]*):\s*(.*)$/);
    if (!match) {
      i++;
      continue;
    }
    const key = match[1];
    let value = match[2].trim();
    const isBlockScalar = value === '' || /^[>|][-+]?$/.test(value);
    if (isBlockScalar) {
      const collected = [];
      let j = i + 1;
      while (j < body.length && (body[j] === '' || /^\s+/.test(body[j]))) {
        collected.push(body[j].trim());
        j++;
      }
      value = collected.filter(Boolean).join(' ');
      i = j;
    } else {
      value = value.replace(/^["']|["']$/g, '');
      i++;
    }
    fields[key] = value;
  }
  return { hasFrontmatter: true, fields };
}

export function checkManifestIsolation(pluginDir) {
  const manifestDir = path.join(pluginDir, '.claude-plugin');
  if (!fs.existsSync(manifestDir)) {
    return ['.claude-plugin/ directory is missing'];
  }

  const violations = [];
  const entries = fs.readdirSync(manifestDir);
  for (const entry of entries) {
    if (entry !== 'plugin.json') {
      violations.push(
        `.claude-plugin/${entry} should not exist — .claude-plugin/ must contain only plugin.json`,
      );
    }
  }
  if (!entries.includes('plugin.json')) {
    violations.push('.claude-plugin/plugin.json is missing');
  }
  return violations;
}

export function checkRootPlacement(pluginDir) {
  const violations = [];

  function walk(dir) {
    if (!fs.existsSync(dir)) return;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (dir === pluginDir && entry.name === '.claude-plugin') continue;
      if (dir !== pluginDir && CAPABILITY_NAMES.includes(entry.name)) {
        violations.push(
          `${path.relative(pluginDir, full)} — "${entry.name}" must live directly under the plugin root`,
        );
      }
      if (entry.isDirectory()) walk(full);
    }
  }

  walk(pluginDir);
  return violations;
}

export function checkSkillFrontmatter(pluginDir) {
  const violations = [];
  const skillsDir = path.join(pluginDir, 'skills');
  if (!fs.existsSync(skillsDir)) return violations;

  for (const skillName of fs.readdirSync(skillsDir)) {
    const skillMdPath = path.join(skillsDir, skillName, 'SKILL.md');
    if (!fs.existsSync(skillMdPath)) continue;

    const rel = path.join('skills', skillName, 'SKILL.md');
    const content = fs.readFileSync(skillMdPath, 'utf8');
    const { hasFrontmatter, fields } = parseFrontmatter(content);

    if (!hasFrontmatter) {
      violations.push(`${rel}: missing YAML frontmatter`);
      continue;
    }
    if (!fields.name) violations.push(`${rel}: frontmatter missing "name"`);
    if (!fields.description) {
      violations.push(`${rel}: frontmatter missing "description"`);
      continue;
    }
    const wordCount = fields.description.split(/\s+/).filter(Boolean).length;
    if (wordCount > DESCRIPTION_WORD_LIMIT) {
      violations.push(`${rel}: description is ${wordCount} words, exceeds 50-word limit`);
    }
  }
  return violations;
}

export function checkPluginRootEnvVar(pluginDir) {
  const violations = [];
  const filesToCheck = [path.join(pluginDir, '.mcp.json'), path.join(pluginDir, 'hooks', 'hooks.json')];

  for (const file of filesToCheck) {
    if (!fs.existsSync(file)) continue;
    const rel = path.relative(pluginDir, file);
    const content = fs.readFileSync(file, 'utf8');
    const absolutePaths = content.match(/"(\/[^"]*)"/g) || [];
    for (const match of absolutePaths) {
      if (!match.includes('${CLAUDE_PLUGIN_ROOT}')) {
        violations.push(`${rel}: hardcoded absolute path ${match} — use \${CLAUDE_PLUGIN_ROOT} instead`);
      }
    }
  }
  return violations;
}

export function checkPluginManifest(pluginDir) {
  const manifestPath = path.join(pluginDir, '.claude-plugin', 'plugin.json');
  if (!fs.existsSync(manifestPath)) {
    return ['.claude-plugin/plugin.json is missing'];
  }

  let manifest;
  try {
    manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  } catch (err) {
    return [`.claude-plugin/plugin.json is not valid JSON: ${err.message}`];
  }

  const violations = [];
  for (const field of REQUIRED_MANIFEST_FIELDS) {
    if (typeof manifest[field] !== 'string' || !manifest[field].trim()) {
      violations.push(`.claude-plugin/plugin.json is missing required field "${field}"`);
    }
  }
  return violations;
}

export function checkMarketplaceConsistency(repoRoot) {
  const marketplacePath = path.join(repoRoot, '.claude-plugin', 'marketplace.json');
  const pluginsDir = path.join(repoRoot, 'plugins');
  const onDisk = fs.existsSync(pluginsDir)
    ? fs
        .readdirSync(pluginsDir, { withFileTypes: true })
        .filter((e) => e.isDirectory())
        .map((e) => e.name)
    : [];

  if (!fs.existsSync(marketplacePath)) {
    return ['.claude-plugin/marketplace.json is missing'];
  }

  let marketplace;
  try {
    marketplace = JSON.parse(fs.readFileSync(marketplacePath, 'utf8'));
  } catch (err) {
    return [`.claude-plugin/marketplace.json is not valid JSON: ${err.message}`];
  }

  const violations = [];
  const listed = (marketplace.plugins || []).map((p) => p.id);
  for (const id of onDisk) {
    if (!listed.includes(id)) {
      violations.push(`plugins/${id} exists but is not listed in marketplace.json`);
    }
  }
  for (const id of listed) {
    if (!onDisk.includes(id)) {
      violations.push(`marketplace.json lists "${id}" but plugins/${id} does not exist`);
    }
  }
  return violations;
}

export function runVerification(repoRoot) {
  const pluginsDir = path.join(repoRoot, 'plugins');
  const pluginIds = fs.existsSync(pluginsDir)
    ? fs
        .readdirSync(pluginsDir, { withFileTypes: true })
        .filter((e) => e.isDirectory())
        .map((e) => e.name)
    : [];

  const results = {};
  for (const id of pluginIds) {
    const pluginDir = path.join(pluginsDir, id);
    results[id] = {
      manifestIsolation: checkManifestIsolation(pluginDir),
      rootPlacement: checkRootPlacement(pluginDir),
      skillFrontmatter: checkSkillFrontmatter(pluginDir),
      pluginRootEnvVar: checkPluginRootEnvVar(pluginDir),
      pluginManifest: checkPluginManifest(pluginDir),
    };
  }

  const marketplaceConsistency = checkMarketplaceConsistency(repoRoot);
  const totalViolations =
    Object.values(results).reduce((sum, r) => sum + Object.values(r).flat().length, 0) +
    marketplaceConsistency.length;

  return { pluginIds, results, marketplaceConsistency, totalViolations };
}

export function formatReport({ pluginIds, results, marketplaceConsistency, totalViolations }) {
  const lines = ['## Marketplace Verification', ''];

  if (totalViolations === 0) {
    lines.push('✅ No violations found.');
    return lines.join('\n');
  }

  for (const id of pluginIds) {
    const checks = results[id];
    const pluginViolations = Object.values(checks).flat();
    if (pluginViolations.length === 0) continue;
    lines.push(`### ${id}`, '');
    for (const [checkName, violations] of Object.entries(checks)) {
      for (const v of violations) {
        lines.push(`- **${checkName}**: ${v}`);
      }
    }
    lines.push('');
  }

  if (marketplaceConsistency.length > 0) {
    lines.push('### marketplace.json', '');
    for (const v of marketplaceConsistency) {
      lines.push(`- ${v}`);
    }
    lines.push('');
  }

  lines.push(`**Total violations:** ${totalViolations}`);
  return lines.join('\n');
}

function main() {
  const repoRoot = process.argv[2] ? path.resolve(process.argv[2]) : path.resolve(import.meta.dirname, '../../../..');
  const result = runVerification(repoRoot);
  console.log(formatReport(result));
  process.exit(result.totalViolations > 0 ? 1 : 0);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
