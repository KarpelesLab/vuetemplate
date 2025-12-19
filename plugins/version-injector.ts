import { execSync } from 'child_process';
import type { Plugin } from 'vite';

/**
 * Vite plugin to inject app version from Git commit hash
 */
export function versionInjector(options: { placeholder?: string } = {}): Plugin {
  const placeholder = options.placeholder || '%GIT_VERSION%';

  function getGitCommitHash(): string {
    try {
      return execSync('git rev-parse --short=7 HEAD')
        .toString()
        .trim();
    } catch {
      console.warn('Unable to get git commit hash');
      return 'unknown';
    }
  }

  return {
    name: 'version-injector',
    transformIndexHtml(html) {
      const version = getGitCommitHash();
      return html.replace(new RegExp(placeholder, 'g'), version);
    }
  };
}
