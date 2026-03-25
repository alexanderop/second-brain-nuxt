const { execSync } = require('node:child_process');

function findChrome() {
  try {
    const result = execSync('npx playwright chromium --path 2>/dev/null', {
      encoding: 'utf8',
      timeout: 10000,
    }).trim();
    if (result) return result;
  } catch {
    // Fall back to system Chrome
  }
  return undefined;
}

const colorScheme = process.env.COLOR_SCHEME || 'light';
const chromeFlags = ['--no-sandbox'];
if (colorScheme === 'dark') {
  chromeFlags.push('--force-dark-mode');
}

module.exports = {
  ci: {
    collect: {
      url: [
        'http://localhost:3000/',
        'http://localhost:3000/books',
        'http://localhost:3000/graph',
        'http://localhost:3000/table',
        'http://localhost:3000/tags',
        'http://localhost:3000/stats',
      ],
      startServerCommand: 'node .output/server/index.mjs',
      startServerReadyPattern: 'Listening on',
      numberOfRuns: 1,
      settings: {
        onlyCategories: ['accessibility', 'performance'],
        preset: 'desktop',
        chromeFlags,
        chromePath: findChrome(),
      },
    },
    assert: {
      assertions: {
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:performance': ['warn', { minScore: 0.7 }],
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
