import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const CAPABILITY_NAMES = ['skills', 'commands', 'agents', 'hooks', '.mcp.json'];
const REQUIRED_MANIFEST_FIELDS = ['name', 'version', 'description', 'author'];
const DESCRIPTION_WORD_LIMIT = 50;
const PLUGIN_NAME_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const KNOWN_SKILL_FIELDS = ['name', 'description', 'license', 'allowed-tools', 'metadata'];

/** A list of human-readable violation messages for one check. */
type Violations = string[];

/** Frontmatter fields parsed from a SKILL.md, keyed by field name. */
type FrontmatterFields = Record<string, string>;

interface ParsedFrontmatter {
  hasFrontmatter: boolean;
  fields: FrontmatterFields;
}

/** All checks run against a single plugin directory. */
interface PluginCheckResults {
  manifestIsolation: Violations;
  rootPlacement: Violations;
  skillFrontmatter: Violations;
  pluginRootEnvVar: Violations;
  pluginManifest: Violations;
}

interface VerificationResult {
  pluginIds: string[];
  results: Record<string, PluginCheckResults>;
  suggestions: Record<string, Violations>;
  marketplaceConsistency: Violations;
  totalViolations: number;
}

interface PluginManifest {
  name?: string;
  version?: string;
  description?: string;
  author?: string | { name?: string };
}

interface MarketplaceEntry {
  name: string;
  description: string;
}

interface MarketplaceManifest {
  plugins?: MarketplaceEntry[];
}

function parseFrontmatter(content: string): ParsedFrontmatter {
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
  const fields: FrontmatterFields = {};
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
      const collected: string[] = [];
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

export function checkManifestIsolation(pluginDir: string): Violations {
  const manifestDir = path.join(pluginDir, '.claude-plugin');
  if (!fs.existsSync(manifestDir)) {
    return ['.claude-plugin/ directory is missing'];
  }

  const violations: Violations = [];
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

export function checkRootPlacement(pluginDir: string): Violations {
  const violations: Violations = [];

  function walk(dir: string): void {
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

export function checkSkillFrontmatter(pluginDir: string): Violations {
  const violations: Violations = [];
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

function getChangedSkillMdPaths(repoRoot: string): Set<string> {
  try {
    const output = execFileSync('git', ['diff', '--name-only', 'HEAD'], { cwd: repoRoot, encoding: 'utf8' });
    return new Set(output.split('\n').filter((f) => f.endsWith('SKILL.md')));
  } catch {
    return new Set();
  }
}

export function checkUnusedFrontmatterFields(
  pluginDir: string,
  changedSkillPaths: Set<string>,
  repoRoot: string,
): Violations {
  const suggestions: Violations = [];
  const skillsDir = path.join(pluginDir, 'skills');
  if (!fs.existsSync(skillsDir)) return suggestions;

  for (const skillName of fs.readdirSync(skillsDir)) {
    const skillMdPath = path.join(skillsDir, skillName, 'SKILL.md');
    if (!fs.existsSync(skillMdPath)) continue;
    const relFromRepoRoot = path.relative(repoRoot, skillMdPath);
    if (!changedSkillPaths.has(relFromRepoRoot)) continue;

    const rel = path.join('skills', skillName, 'SKILL.md');
    const { fields } = parseFrontmatter(fs.readFileSync(skillMdPath, 'utf8'));
    for (const field of Object.keys(fields)) {
      if (!KNOWN_SKILL_FIELDS.includes(field)) {
        suggestions.push(`${rel}: frontmatter field "${field}" is unused by Claude Code — consider removing it`);
      }
    }
  }
  return suggestions;
}

export function checkPluginRootEnvVar(pluginDir: string): Violations {
  const violations: Violations = [];
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

export function checkPluginManifest(pluginDir: string): Violations {
  const manifestPath = path.join(pluginDir, '.claude-plugin', 'plugin.json');
  if (!fs.existsSync(manifestPath)) {
    return ['.claude-plugin/plugin.json is missing'];
  }

  let manifest: PluginManifest;
  try {
    manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  } catch (err) {
    return [`.claude-plugin/plugin.json is not valid JSON: ${(err as Error).message}`];
  }

  const violations: Violations = [];
  for (const field of REQUIRED_MANIFEST_FIELDS) {
    const value = manifest[field as keyof PluginManifest];
    const isNonEmptyString = typeof value === 'string' && value.trim();
    const isAuthorObject =
      field === 'author' && value && typeof value === 'object' && typeof value.name === 'string' && value.name.trim();
    if (!isNonEmptyString && !isAuthorObject) {
      violations.push(`.claude-plugin/plugin.json is missing required field "${field}"`);
    }
  }

  if (typeof manifest.name === 'string' && manifest.name.trim()) {
    if (!PLUGIN_NAME_PATTERN.test(manifest.name)) {
      violations.push(`.claude-plugin/plugin.json "name" must be lowercase kebab-case (e.g. "my-plugin"), got "${manifest.name}"`);
    }
    const folderName = path.basename(pluginDir);
    if (manifest.name !== folderName) {
      violations.push(`.claude-plugin/plugin.json "name" ("${manifest.name}") must match its folder name ("${folderName}")`);
    }
  }

  return violations;
}

export function checkMarketplaceConsistency(repoRoot: string): Violations {
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

  let marketplace: MarketplaceManifest;
  try {
    marketplace = JSON.parse(fs.readFileSync(marketplacePath, 'utf8'));
  } catch (err) {
    return [`.claude-plugin/marketplace.json is not valid JSON: ${(err as Error).message}`];
  }

  const violations: Violations = [];
  const listed = (marketplace.plugins || []).map((p) => p.name);
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

const README_TABLE_START = '| Plugin | Description |\n|---|---|\n';

export function syncReadme(repoRoot: string): boolean {
  const readmePath = path.join(repoRoot, 'README.md');
  const marketplacePath = path.join(repoRoot, '.claude-plugin', 'marketplace.json');
  if (!fs.existsSync(readmePath) || !fs.existsSync(marketplacePath)) return false;

  const marketplace: MarketplaceManifest = JSON.parse(fs.readFileSync(marketplacePath, 'utf8'));
  const rows = (marketplace.plugins || [])
    .map((p) => `| \`${p.name}\` | ${p.description.replace(/\.$/, '')} |`)
    .join('\n');
  const table = `${README_TABLE_START}${rows}\n`;

  const readme = fs.readFileSync(readmePath, 'utf8');
  const startIdx = readme.indexOf(README_TABLE_START);
  if (startIdx === -1) return false;
  const afterHeader = startIdx + README_TABLE_START.length;
  const endIdx = readme.indexOf('\n\n', afterHeader);
  if (endIdx === -1) return false;

  const updated = readme.slice(0, startIdx) + table + readme.slice(endIdx + 1);
  if (updated === readme) return false;
  fs.writeFileSync(readmePath, updated);
  return true;
}

export function runVerification(repoRoot: string): VerificationResult {
  const pluginsDir = path.join(repoRoot, 'plugins');
  const pluginIds = fs.existsSync(pluginsDir)
    ? fs
        .readdirSync(pluginsDir, { withFileTypes: true })
        .filter((e) => e.isDirectory())
        .map((e) => e.name)
    : [];

  const changedSkillPaths = getChangedSkillMdPaths(repoRoot);
  const results: Record<string, PluginCheckResults> = {};
  const suggestions: Record<string, Violations> = {};
  for (const id of pluginIds) {
    const pluginDir = path.join(pluginsDir, id);
    results[id] = {
      manifestIsolation: checkManifestIsolation(pluginDir),
      rootPlacement: checkRootPlacement(pluginDir),
      skillFrontmatter: checkSkillFrontmatter(pluginDir),
      pluginRootEnvVar: checkPluginRootEnvVar(pluginDir),
      pluginManifest: checkPluginManifest(pluginDir),
    };
    const unusedFields = checkUnusedFrontmatterFields(pluginDir, changedSkillPaths, repoRoot);
    if (unusedFields.length > 0) suggestions[id] = unusedFields;
  }

  const marketplaceConsistency = checkMarketplaceConsistency(repoRoot);
  const totalViolations =
    Object.values(results).reduce((sum, r) => sum + Object.values(r).flat().length, 0) +
    marketplaceConsistency.length;

  return { pluginIds, results, suggestions, marketplaceConsistency, totalViolations };
}

function appendSuggestions(lines: string[], suggestions: Record<string, Violations>): void {
  const ids = Object.keys(suggestions);
  if (ids.length === 0) return;
  lines.push('### Suggestions (frontmatter lint)', '');
  for (const id of ids) {
    for (const s of suggestions[id]) {
      lines.push(`- ${id}/${s}`);
    }
  }
  lines.push('');
}

export function formatReport({
  pluginIds,
  results,
  suggestions = {},
  marketplaceConsistency,
  totalViolations,
}: VerificationResult): string {
  const lines = ['## Marketplace Verification', ''];

  if (totalViolations === 0) {
    if (Object.keys(suggestions).length === 0) {
      lines.push('✅ No violations found.');
      return lines.join('\n');
    }
    lines.push('✅ No violations found.', '');
    appendSuggestions(lines, suggestions);
    return lines.join('\n').trimEnd();
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

  appendSuggestions(lines, suggestions);
  lines.push(`**Total violations:** ${totalViolations}`);
  return lines.join('\n');
}

function main(): void {
  const repoRoot = process.argv[2] ? path.resolve(process.argv[2]) : path.resolve(import.meta.dirname, '../../../..');
  const result = runVerification(repoRoot);
  if (syncReadme(repoRoot)) console.log('📝 README.md plugin table updated.\n');
  console.log(formatReport(result));
  process.exit(result.totalViolations > 0 ? 1 : 0);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
