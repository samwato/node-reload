#!/usr/bin/env node

import { build } from 'esbuild'

const serverFileName = 'server.js'

try {
  await build({
    entryPoints: ['src/server.ts'],
    bundle: true,
    platform: 'node',
    target: ['node16'],
    outfile: serverFileName,
    format: 'esm',
  })
} catch (err) {
  console.error(err)
}
