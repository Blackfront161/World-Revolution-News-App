import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { root } from './prepare-ios-web.mjs';

if (process.platform !== 'darwin') {
  console.error('Native iOS compilation requires macOS and Xcode 26+. Source/sync validation is available with npm run sync:ios in ios-wrapper.');
  process.exit(1);
}
const device = process.argv.includes('--device');
const wrapper = path.join(root, 'ios-wrapper');
function run(command, args) {
  const result = spawnSync(command, args, { cwd: wrapper, stdio: 'inherit' });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}
run('npm', ['run', 'sync:ios']);
run('npm', ['test']);
run('xcodebuild', ['-project', 'ios/App/App.xcodeproj', '-scheme', 'App', '-configuration', 'Debug', '-destination', device ? 'generic/platform=iOS' : 'generic/platform=iOS Simulator', '-derivedDataPath', path.join(root, 'outputs/ios', device ? 'device' : 'simulator'), 'CODE_SIGNING_ALLOWED=NO', 'build']);
