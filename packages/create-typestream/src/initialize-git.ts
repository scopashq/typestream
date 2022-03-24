import { execa } from 'execa'

import { asyncPipeOut } from './async-pipe-out.js'

export async function initGit(path: string) {
  try {
    await asyncPipeOut(execa('git', ['init'], { cwd: path }))

    await asyncPipeOut(execa('git', ['add', '.'], { cwd: path }))
    await asyncPipeOut(
      execa('git', ['commit', '-m', 'Initial commit'], {
        cwd: path,
      }),
    )
  } catch {
    console.log('Setting up git repository failed. Skipping this step.')
  }
}
