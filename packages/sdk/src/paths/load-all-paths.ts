import { assertPipeName } from '@typestream/core-protocol/utils'

import { getPipePaths } from './pipe-paths.js'
import { getProjectPaths } from './project-paths.js'

export async function loadAllPaths(pipeName: string) {
  if (/\/|\./.test(pipeName))
    throw new Error(
      'You must only specify the name of the pipe, not the path, no file extension. The pipe must be in "src/pipes/<name>.ts"!',
    )
  if (!pipeName) throw new Error('Could not parse pipe name!')
  assertPipeName(pipeName)

  const project = await getProjectPaths()
  const pipe = getPipePaths(project, pipeName)

  return {
    project,
    pipe,
  }
}
