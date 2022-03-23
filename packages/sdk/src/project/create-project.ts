import { readdir } from 'node:fs/promises'

import { assertProjectName } from '@typestream/core-protocol/utils'

import { ProjectPaths } from '../paths/project-paths.js'
import { createProjectFiles } from './create-project-files.js'

export async function createProject(paths: ProjectPaths) {
  assertProjectName(paths.name)
  await assertNewProjectDir(paths)

  await createProjectFiles(paths)
}

async function assertNewProjectDir(paths: ProjectPaths) {
  const dir = await tryReadDir(paths.path)
  if (dir)
    throw new Error(
      `Directory "${paths.path}" already exists. You can't create project "${paths.name}" here!`,
    )
}

async function tryReadDir(path: string) {
  try {
    return await readdir(path)
  } catch {
    return
  }
}
