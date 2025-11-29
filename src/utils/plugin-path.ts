import { existsSync } from 'fs';
import { resolve } from 'path';

/**
 * Locate a plugin directory, preferring the compiled dist path and falling back to source.
 * @param currentDir Directory of the caller (__dirname)
 * @param pluginName Name of the plugin and skill folder
 */
export function resolvePluginPath(currentDir: string, pluginName: string): string {
  const candidatePaths = [
    resolve(currentDir, '..', 'plugins', pluginName),
    resolve(currentDir, '..', '..', 'src', 'plugins', pluginName),
  ];

  for (const pluginPath of candidatePaths) {
    const manifestPath = resolve(pluginPath, 'skills', pluginName, 'SKILL.md');
    if (existsSync(manifestPath)) {
      console.log(`✅ Found ${pluginName} plugin at: ${pluginPath}`);
      return pluginPath;
    }
  }

  const checkedLocations = candidatePaths
    .map((pluginPath) => resolve(pluginPath, 'skills', pluginName, 'SKILL.md'))
    .join('; ');

  throw new Error(
    `${pluginName} plugin not found. Checked for SKILL.md at: ${checkedLocations}`
  );
}
