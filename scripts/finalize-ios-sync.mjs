import { promises as fs } from 'node:fs';
import path from 'node:path';
import { root } from './prepare-ios-web.mjs';

// Capacitor's Windows sync writes Windows separators into Swift path literals.
// Make only the generated dependency paths portable for the Xcode handoff.
const file = path.join(root, 'ios-wrapper/ios/App/CapApp-SPM/Package.swift');
const text = await fs.readFile(file, 'utf8');
await fs.writeFile(file, text.replace(/path: "([^"]+)"/g, (_, value) => `path: "${value.replaceAll('\\', '/')}"`));
