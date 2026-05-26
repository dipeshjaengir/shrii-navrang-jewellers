const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const gitPath = 'C:\\Users\\Dipesh\\.gemini\\antigravity\\scratch\\shrii-navrang-jewellers\\git-portable\\cmd\\git.exe';
const cwd = 'C:\\Users\\Dipesh\\.gemini\\antigravity\\scratch\\shrii-navrang-jewellers';
const outputFile = 'C:\\Users\\Dipesh\\.gemini\\antigravity\\scratch\\shrii-navrang-jewellers\\git_status_results.txt';

let output = '';

try {
  output += '=== GIT STATUS ===\n';
  const status = execSync(`"${gitPath}" status`, { cwd, encoding: 'utf8' });
  output += status + '\n';
} catch (e) {
  output += `Error running git status: ${e.message}\n`;
}

try {
  output += '=== GIT LOG ===\n';
  const log = execSync(`"${gitPath}" log -n 5 --oneline`, { cwd, encoding: 'utf8' });
  output += log + '\n';
} catch (e) {
  output += `Error running git log: ${e.message}\n`;
}

fs.writeFileSync(outputFile, output);
console.log('Git verification results written successfully to:', outputFile);
