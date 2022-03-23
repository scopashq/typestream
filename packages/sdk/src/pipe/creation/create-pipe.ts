import { mkdir, stat, writeFile } from 'node:fs/promises'

import { PipePath } from '../../paths/pipe-paths.js'
import { ProjectPaths } from '../../paths/project-paths.js'
import { createTypeMap } from '../../typing/generate-type-map.js'
import { checkPipeExists } from './check-pipe-exists.js'
import { getPipeCode } from './get-pipe-code.js'

export async function createPipe(paths: {
  project: ProjectPaths
  pipe: PipePath
}) {
  if (await checkPipeExists(paths.pipe.sourceFileName))
    throw new Error(`Pipe with name "${paths.pipe.name}" already exists!`)

  await mkdir(paths.project.sourcePath, { recursive: true })
  await writeFile(paths.pipe.sourceFileName, getPipeCode(), 'utf-8')
  console.log(`Created pipe source file at: ${paths.pipe.sourceFileName}`)

  await mkdir(paths.project.typesPath, { recursive: true })

  // Only if the type map does not exists, an empty one is inserted.
  try {
    await stat(paths.project.typeMapPath)
  } catch {
    await createTypeMap(paths.project)
  }
}
