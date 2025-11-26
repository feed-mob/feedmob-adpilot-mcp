// Simple test to verify plugin structure
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const pluginPath = 'plugins/parse-ad-requirements';
const manifestPath = join(pluginPath, '.claude-plugin', 'plugin.json');
const skillPath = join(pluginPath, 'skills', 'parse-ad-requirements', 'SKILL.md');

console.log('Testing plugin structure...\n');

// Check manifest
if (existsSync(manifestPath)) {
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  console.log('✅ Plugin manifest found');
  console.log(`   Name: ${manifest.name}`);
  console.log(`   Version: ${manifest.version}`);
  console.log(`   Description: ${manifest.description}\n`);
} else {
  console.log('❌ Plugin manifest NOT found at:', manifestPath);
  process.exit(1);
}

// Check skill
if (existsSync(skillPath)) {
  console.log('✅ Skill file found at correct location');
  const skillContent = readFileSync(skillPath, 'utf8');
  const frontmatterMatch = skillContent.match(/^---\n([\s\S]*?)\n---/);
  if (frontmatterMatch) {
    console.log('✅ Skill has valid frontmatter\n');
  }
} else {
  console.log('❌ Skill file NOT found at:', skillPath);
  process.exit(1);
}

console.log('Plugin structure is valid! ✅');
