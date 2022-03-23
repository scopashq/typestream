import { execa } from 'execa'

import { asyncPipeOut } from './async-pipe-out.js'

export async function installDependencies(cwd?: string) {
  const yarnInstalled = await hasYarn()

  await (yarnInstalled
    ? asyncPipeOut(execa('yarn', [], { cwd: cwd ?? process.cwd() }))
    : asyncPipeOut(execa('npm', ['install'], { cwd: cwd ?? process.cwd() })))
}

async function hasYarn(cwd?: string) {
  try {
    await execa('yarn', ['--version'], { cwd: cwd ?? process.cwd() })
    return true
  } catch {
    return false
  }
}
