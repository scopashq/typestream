import { join } from 'node:path'

import { assertProjectName } from '@typestream/core-protocol/utils'

import { getProjectName } from '../project/get-project-name.js'

export type ProjectPaths = {
  name: string
  path: string
  sourcePath: string
  pipesPath: string
  resourcesDir: string
  typesPath: string
  typeMapPath: string
  inferredTypesDir: string
  dumpDir: string
}

/**
 * Gets all relevant folders and files of a project and asserts their names and that the cwd is actually a project.
 */
export async function getProjectPaths(options?: {
  basePath?: string
  projectName?: string
}): Promise<ProjectPaths> {
  const projectRoot = options?.basePath ?? process.cwd()
  const typesFolder = join(projectRoot, 'src/pipes/generated-types')

  const projectName =
    options?.projectName ?? (await getProjectName(projectRoot))

  assertProjectName(projectName)

  return {
    name: projectName,
    path: projectRoot,
    sourcePath: join(projectRoot, 'src'),
    pipesPath: join(projectRoot, 'src/pipes'),
    typesPath: typesFolder,
    resourcesDir: join(projectRoot, 'sample-data'),
    typeMapPath: join(typesFolder, 'type-map.d.ts'),
    inferredTypesDir: join(typesFolder, 'keys'),
    dumpDir: join(projectRoot, 'dump-files'),
  }
}
