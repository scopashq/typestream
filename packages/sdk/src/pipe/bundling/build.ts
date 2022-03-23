import esbuild from 'esbuild'

import { PipePath } from '../../paths/pipe-paths.js'
import { COMMONJS_POLYFILLS_BANNER } from './commonjs-polyfills.js'

export async function buildPipe(pipePath: PipePath) {
  await esbuild.build({
    entryPoints: [pipePath.sourceFileName],
    bundle: true,
    outdir: pipePath.bundleDirName,
    entryNames: 'bundle',
    platform: 'node',
    format: 'esm',
    banner: {
      js: COMMONJS_POLYFILLS_BANNER,
    },
    minify: false,
    sourcemap: true,
    treeShaking: true,

    // Without this ESBuild would print build errors directly to the terminal
    logLevel: 'silent',
  })
}
