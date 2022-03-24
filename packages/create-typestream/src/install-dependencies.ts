import { execa } from 'execa'

import { asyncPipeOut } from './async-pipe-out.js'
import { installPackage } from './install-package.js'

export async function installDependencies(path: string) {
  const useYarn = await hasYarn()

  await (useYarn
    ? asyncPipeOut(execa('yarn', [], { cwd: path }))
    : asyncPipeOut(execa('npm', ['install'], { cwd: path })))

  await installPackage({
    devDependency: true,
    packageName: '@typestream/sdk',
    path,
    useYarn,
  })

  await installPackage({
    devDependency: false,
    packageName: '@typestream/core',
    path,
    useYarn,
  })
}

async function hasYarn(cwd?: string) {
  try {
    await execa('yarn', ['--version'], { cwd: cwd ?? process.cwd() })
    return true
  } catch {
    return false
  }
}
