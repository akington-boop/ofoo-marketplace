import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import {
  checkManifestIsolation,
  checkRootPlacement,
  checkSkillFrontmatter,
  checkPluginRootEnvVar,
  checkPluginManifest,
  checkMarketplaceConsistency,
  syncReadme,
  runVerification,
  formatReport,
} from '../plugins/marketplace-master/skills/marketplace-master/verify.js';

function tmpRepo() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'marketplace-master-'));
}

function writeFile(root, relPath, content) {
  const full = path.join(root, relPath);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content);
}

function goodPluginFiles(pluginId) {
  return {
    [`plugins/${pluginId}/.claude-plugin/plugin.json`]: JSON.stringify({
      name: pluginId,
      version: '1.0.0',
      description: 'A perfectly fine plugin.',
      author: 'Test Author',
    }),
    [`plugins/${pluginId}/skills/${pluginId}/SKILL.md`]:
      '---\nname: ' + pluginId + '\ndescription: A short, valid description under fifty words.\n---\n\n# Skill\n',
  };
}

test('checkManifestIsolation passes when .claude-plugin has only plugin.json', () => {
  const root = tmpRepo();
  for (const [p, c] of Object.entries(goodPluginFiles('foo'))) writeFile(root, p, c);
  const violations = checkManifestIsolation(path.join(root, 'plugins/foo'));
  assert.deepEqual(violations, []);
});

test('checkManifestIsolation flags extra files/dirs inside .claude-plugin', () => {
  const root = tmpRepo();
  for (const [p, c] of Object.entries(goodPluginFiles('foo'))) writeFile(root, p, c);
  writeFile(root, 'plugins/foo/.claude-plugin/skills/nested/SKILL.md', '---\nname: x\ndescription: x\n---\n');
  const violations = checkManifestIsolation(path.join(root, 'plugins/foo'));
  assert.equal(violations.length, 1);
  assert.match(violations[0], /skills/);
});

test('checkManifestIsolation flags a missing .claude-plugin directory', () => {
  const root = tmpRepo();
  writeFile(root, 'plugins/foo/skills/foo/SKILL.md', '---\nname: foo\ndescription: x\n---\n');
  const violations = checkManifestIsolation(path.join(root, 'plugins/foo'));
  assert.equal(violations.length, 1);
  assert.match(violations[0], /missing/);
});

test('checkRootPlacement passes when capability dirs sit at the plugin root', () => {
  const root = tmpRepo();
  for (const [p, c] of Object.entries(goodPluginFiles('foo'))) writeFile(root, p, c);
  writeFile(root, 'plugins/foo/commands/do-thing.md', '# do thing');
  const violations = checkRootPlacement(path.join(root, 'plugins/foo'));
  assert.deepEqual(violations, []);
});

test('checkRootPlacement flags a capability dir nested under another folder', () => {
  const root = tmpRepo();
  for (const [p, c] of Object.entries(goodPluginFiles('foo'))) writeFile(root, p, c);
  writeFile(root, 'plugins/foo/src/commands/do-thing.md', '# do thing');
  const violations = checkRootPlacement(path.join(root, 'plugins/foo'));
  assert.equal(violations.length, 1);
  assert.match(violations[0], /src[\\/]commands/);
});

test('checkSkillFrontmatter passes valid frontmatter with a short description', () => {
  const root = tmpRepo();
  for (const [p, c] of Object.entries(goodPluginFiles('foo'))) writeFile(root, p, c);
  const violations = checkSkillFrontmatter(path.join(root, 'plugins/foo'));
  assert.deepEqual(violations, []);
});

test('checkSkillFrontmatter flags a SKILL.md with no frontmatter at all', () => {
  const root = tmpRepo();
  writeFile(root, 'plugins/foo/skills/foo/SKILL.md', '# Just a heading\n\nNo frontmatter here.\n');
  const violations = checkSkillFrontmatter(path.join(root, 'plugins/foo'));
  assert.equal(violations.length, 1);
  assert.match(violations[0], /missing YAML frontmatter/);
});

test('checkSkillFrontmatter flags a description over 50 words (including folded block scalars)', () => {
  const root = tmpRepo();
  const longDescription = Array.from({ length: 60 }, (_, i) => `word${i}`).join(' ');
  const content = [
    '---',
    'name: foo',
    'description: >',
    '  ' + longDescription.slice(0, 200),
    '  ' + longDescription.slice(200),
    '---',
    '',
    '# Skill',
    '',
  ].join('\n');
  writeFile(root, 'plugins/foo/skills/foo/SKILL.md', content);
  const violations = checkSkillFrontmatter(path.join(root, 'plugins/foo'));
  assert.equal(violations.length, 1);
  assert.match(violations[0], /exceeds 50-word limit/);
});

test('checkSkillFrontmatter parses valid frontmatter with CRLF line endings', () => {
  const root = tmpRepo();
  const content = ['---', 'name: foo', 'description: A short, valid description.', 'version: 4', '---', ''].join(
    '\r\n',
  );
  writeFile(root, 'plugins/foo/skills/foo/SKILL.md', content);
  const violations = checkSkillFrontmatter(path.join(root, 'plugins/foo'));
  assert.deepEqual(violations, []);
});

test('checkSkillFrontmatter flags a missing name field', () => {
  const root = tmpRepo();
  writeFile(root, 'plugins/foo/skills/foo/SKILL.md', '---\ndescription: fine\n---\n');
  const violations = checkSkillFrontmatter(path.join(root, 'plugins/foo'));
  assert.equal(violations.length, 1);
  assert.match(violations[0], /"name"/);
});

test('checkPluginRootEnvVar passes when .mcp.json uses ${CLAUDE_PLUGIN_ROOT}', () => {
  const root = tmpRepo();
  for (const [p, c] of Object.entries(goodPluginFiles('foo'))) writeFile(root, p, c);
  writeFile(
    root,
    'plugins/foo/.mcp.json',
    JSON.stringify({ command: '${CLAUDE_PLUGIN_ROOT}/server.js' }),
  );
  const violations = checkPluginRootEnvVar(path.join(root, 'plugins/foo'));
  assert.deepEqual(violations, []);
});

test('checkPluginRootEnvVar flags a hardcoded absolute path in .mcp.json', () => {
  const root = tmpRepo();
  for (const [p, c] of Object.entries(goodPluginFiles('foo'))) writeFile(root, p, c);
  writeFile(
    root,
    'plugins/foo/.mcp.json',
    JSON.stringify({ command: '/home/someone/ofoo-marketplace/plugins/foo/server.js' }),
  );
  const violations = checkPluginRootEnvVar(path.join(root, 'plugins/foo'));
  assert.equal(violations.length, 1);
  assert.match(violations[0], /CLAUDE_PLUGIN_ROOT/);
});

test('checkPluginManifest passes a well-formed plugin.json', () => {
  const root = tmpRepo();
  for (const [p, c] of Object.entries(goodPluginFiles('foo'))) writeFile(root, p, c);
  const violations = checkPluginManifest(path.join(root, 'plugins/foo'));
  assert.deepEqual(violations, []);
});

test('checkPluginManifest flags missing required fields and invalid JSON', () => {
  const root = tmpRepo();
  writeFile(root, 'plugins/foo/.claude-plugin/plugin.json', JSON.stringify({ name: 'foo' }));
  const violations = checkPluginManifest(path.join(root, 'plugins/foo'));
  assert.equal(violations.length, 3);

  const root2 = tmpRepo();
  writeFile(root2, 'plugins/bar/.claude-plugin/plugin.json', '{ not valid json');
  const violations2 = checkPluginManifest(path.join(root2, 'plugins/bar'));
  assert.equal(violations2.length, 1);
  assert.match(violations2[0], /not valid JSON/);
});

test('checkPluginManifest accepts an author object (the real plugin.json convention)', () => {
  const root = tmpRepo();
  writeFile(
    root,
    'plugins/foo/.claude-plugin/plugin.json',
    JSON.stringify({ name: 'foo', version: '1.0.0', description: 'fine', author: { name: 'Someone' } }),
  );
  const violations = checkPluginManifest(path.join(root, 'plugins/foo'));
  assert.deepEqual(violations, []);
});

test('checkPluginManifest flags a non-kebab-case name', () => {
  const root = tmpRepo();
  writeFile(
    root,
    'plugins/My_Plugin/.claude-plugin/plugin.json',
    JSON.stringify({ name: 'My_Plugin', version: '1.0.0', description: 'fine', author: 'Someone' }),
  );
  const violations = checkPluginManifest(path.join(root, 'plugins/My_Plugin'));
  assert.equal(violations.length, 1);
  assert.match(violations[0], /kebab-case/);
});

test('checkPluginManifest flags a name that does not match its folder', () => {
  const root = tmpRepo();
  writeFile(
    root,
    'plugins/foo/.claude-plugin/plugin.json',
    JSON.stringify({ name: 'bar', version: '1.0.0', description: 'fine', author: 'Someone' }),
  );
  const violations = checkPluginManifest(path.join(root, 'plugins/foo'));
  assert.equal(violations.length, 1);
  assert.match(violations[0], /must match its folder name/);
});

test('checkMarketplaceConsistency passes when plugins/ and marketplace.json agree', () => {
  const root = tmpRepo();
  for (const [p, c] of Object.entries(goodPluginFiles('foo'))) writeFile(root, p, c);
  writeFile(
    root,
    '.claude-plugin/marketplace.json',
    JSON.stringify({ name: 'test-marketplace', plugins: [{ name: 'foo', source: './plugins/foo' }] }),
  );
  const violations = checkMarketplaceConsistency(root);
  assert.deepEqual(violations, []);
});

test('checkMarketplaceConsistency flags a plugin on disk missing from the registry and vice versa', () => {
  const root = tmpRepo();
  for (const [p, c] of Object.entries(goodPluginFiles('foo'))) writeFile(root, p, c);
  writeFile(
    root,
    '.claude-plugin/marketplace.json',
    JSON.stringify({ name: 'test-marketplace', plugins: [{ name: 'bar', source: './plugins/bar' }] }),
  );
  const violations = checkMarketplaceConsistency(root);
  assert.equal(violations.length, 2);
  assert.ok(violations.some((v) => /plugins\/foo/.test(v) && /not listed/.test(v)));
  assert.ok(violations.some((v) => /"bar"/.test(v) && /does not exist/.test(v)));
});

test('syncReadme rewrites the plugin table from marketplace.json', () => {
  const root = tmpRepo();
  writeFile(
    root,
    '.claude-plugin/marketplace.json',
    JSON.stringify({
      name: 'test-marketplace',
      plugins: [
        { name: 'foo', description: 'Does foo things.', source: './plugins/foo' },
        { name: 'bar', description: 'Does bar things.', source: './plugins/bar' },
      ],
    }),
  );
  writeFile(
    root,
    'README.md',
    '# repo\n\n## Plugins\n\n| Plugin | Description |\n|---|---|\n| `old` | stale |\n\n## Next section\n',
  );

  const changed = syncReadme(root);
  assert.equal(changed, true);
  const readme = fs.readFileSync(path.join(root, 'README.md'), 'utf8');
  assert.ok(readme.includes('| `foo` | Does foo things |'));
  assert.ok(readme.includes('| `bar` | Does bar things |'));
  assert.ok(!readme.includes('`old`'));
  assert.ok(readme.includes('## Next section'));

  assert.equal(syncReadme(root), false);
});

test('runVerification aggregates a clean repo to zero violations', () => {
  const root = tmpRepo();
  for (const [p, c] of Object.entries(goodPluginFiles('foo'))) writeFile(root, p, c);
  writeFile(
    root,
    '.claude-plugin/marketplace.json',
    JSON.stringify({ name: 'test-marketplace', plugins: [{ name: 'foo', source: './plugins/foo' }] }),
  );
  const result = runVerification(root);
  assert.equal(result.totalViolations, 0);
  assert.deepEqual(result.pluginIds, ['foo']);
});

test('runVerification surfaces per-plugin and marketplace-level violations', () => {
  const root = tmpRepo();
  writeFile(root, 'plugins/foo/.claude-plugin/plugin.json', JSON.stringify({ name: 'foo' }));
  const result = runVerification(root);
  assert.ok(result.totalViolations > 0);
  assert.ok(result.results.foo.pluginManifest.length > 0);
  assert.ok(result.marketplaceConsistency.length > 0);
});

test('formatReport renders a markdown report (smoke test)', () => {
  const root = tmpRepo();
  for (const [p, c] of Object.entries(goodPluginFiles('foo'))) writeFile(root, p, c);
  writeFile(
    root,
    '.claude-plugin/marketplace.json',
    JSON.stringify({ name: 'test-marketplace', plugins: [{ name: 'foo', source: './plugins/foo' }] }),
  );
  const report = formatReport(runVerification(root));
  assert.match(report, /Marketplace Verification/);
  assert.match(report, /No violations/);
});
