#!/usr/bin/env node

import { build } from 'esbuild'
import nodemon from 'nodemon'

const serverFileName = 'server.js'

try {
  await build({
    entryPoints: ['src/server.ts'],
    bundle: true,
    platform: 'node',
    target: ['node16'],
    outfile: serverFileName,
    format: 'esm',
    sourcemap: 'inline',
    watch: true,
  })

  console.log('esbuild watching...')

  nodemon({
    script: serverFileName,
  })
} catch (err) {
  console.error(err)
}
