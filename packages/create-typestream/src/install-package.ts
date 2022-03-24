import { execa } from 'execa'

import { asyncPipeOut } from './async-pipe-out.js'

export async function installPackage({
  devDependency,
  packageName,
  path,
  useYarn,
}: {
  path: string
  packageName: string
  useYarn: boolean
  devDependency: boolean
}) {
  await (useYarn
    ? asyncPipeOut(
        execa('yarn', ['add', ...(devDependency ? ['-D'] : []), packageName], {
          cwd: path,
        }),
      )
    : asyncPipeOut(
        execa(
          'npm',
          ['install', ...(devDependency ? ['--save-dev'] : []), packageName],
          { cwd: path },
        ),
      ))
}
