import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { root } from './prepare-ios-web.mjs';

const sha = bytes => createHash('sha256').update(bytes).digest('hex');
export async function verifyIOS(repository = root) {
  const wrapper = path.join(repository, 'ios-wrapper');
  const read = name => fs.readFile(path.join(wrapper, name), 'utf8');
  const config = JSON.parse(await read('capacitor.config.json'));
  assert.equal(config.appId, 'com.world.revolution');
  assert.equal(config.webDir, 'www');
  assert.equal(config.server?.url, undefined, 'A shipped app must load bundled assets');
  assert.equal(config.server?.cleartext, undefined);
  const pkg = JSON.parse(await read('package.json'));
  const lock = JSON.parse(await read('package-lock.json'));
  for (const name of ['core', 'ios', 'cli']) {
    assert.equal((pkg.dependencies ?? {})[`@capacitor/${name}`] ?? pkg.devDependencies[`@capacitor/${name}`], '8.4.0');
    assert.equal(lock.packages[`node_modules/@capacitor/${name}`].version, '8.4.0');
  }
  const project = await read('ios/App/App.xcodeproj/project.pbxproj');
  assert.match(project, /MARKETING_VERSION = 2\.1\.2;/);
  assert.equal((project.match(/IPHONEOS_DEPLOYMENT_TARGET = 17\.0;/g) ?? []).length, 4);
  for (const name of ['WRNViewController.swift', 'WRNDevicePlugin.swift']) {
    assert.match(project, new RegExp(`${name.replace('.', '\\.')} in Sources`));
  }
  assert.match(project, /PrivacyInfo\.xcprivacy in Resources/);
  assert.match(await read('ios/App/App/Base.lproj/Main.storyboard'), /customClass="WRNViewController" customModule="App"/);
  const swift = await read('ios/App/CapApp-SPM/Package.swift');
  assert.match(swift, /exact: "8\.4\.0"/);
  assert.match(swift, /\.iOS\(\.v17\)/);
  assert.ok(!/path: "[^"\n]*\\/.test(swift), 'SPM paths must be portable');
  for (const plugin of ['CapacitorShare', 'CapacitorLocalNotifications']) assert.ok(swift.includes(plugin));
  const info = await read('ios/App/App/Info.plist');
  assert.ok(!info.includes('NSAllowsArbitraryLoads'), 'ATS must remain enabled');
  assert.ok(!info.includes('NSCalendarsFullAccessUsageDescription'), 'Calendar editor does not need read access');
  assert.ok(!info.includes('NSMicrophoneUsageDescription'));
  assert.match(info, /<key>UIBackgroundModes<\/key>\s*<array><string>audio<\/string><\/array>/);
  const native = JSON.parse(await read('ios/App/App/capacitor.config.json'));
  for (const plugin of ['SharePlugin', 'LocalNotificationsPlugin']) assert.ok(native.packageClassList.includes(plugin));
  const manifest = JSON.parse(await read('.tmp/web-manifest.json'));
  const publicDir = path.join(wrapper, 'ios/App/App/public');
  for (const [name, entry] of Object.entries(manifest.files)) {
    assert.equal(sha(await fs.readFile(path.join(wrapper, 'www', name))), entry.packagedSha256, `www changed: ${name}`);
    assert.equal(sha(await fs.readFile(path.join(publicDir, name))), entry.packagedSha256, `Native bundle changed: ${name}`);
    const input = entry.platformAdapter ? path.join(wrapper, 'web', name) : path.join(repository, name);
    assert.equal(sha(await fs.readFile(input)), entry.sourceSha256, `Source changed since sync: ${name}`);
  }
  async function inventory(dir, prefix = '') {
    const names = [];
    for (const item of await fs.readdir(dir, { withFileTypes: true })) {
      assert.ok(!item.isSymbolicLink(), 'No symlinks in native web bundle');
      const name = prefix + item.name;
      if (item.isDirectory()) names.push(...await inventory(path.join(dir, item.name), name + '/'));
      else names.push(name);
    }
    return names;
  }
  const actual = (await inventory(publicDir)).filter(name => !['cordova.js', 'cordova_plugins.js'].includes(name)).sort();
  assert.deepEqual(actual, Object.keys(manifest.files).sort(), 'Missing or unexpected native web assets');
  const icon = await fs.readFile(path.join(wrapper, 'ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png'));
  assert.equal(icon.readUInt32BE(16), 1024);
  assert.equal(icon.readUInt32BE(20), 1024);
  assert.equal(icon[25], 2, 'App Store icon must be RGB without alpha');
  return { verifiedWebFiles: actual.length, capacitor: '8.4.0', minimumIOS: '17.0', nativeCompilation: 'pending-macOS-Xcode', signedIPA: 'not-produced' };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) console.log(JSON.stringify(await verifyIOS(), null, 2));
