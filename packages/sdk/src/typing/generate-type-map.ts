import { mkdir, readdir, writeFile } from 'node:fs/promises'
import { parse } from 'node:path'

import { ProjectPaths } from '../paths/project-paths.js'

export async function createTypeMap(projectPaths: ProjectPaths) {
  await mkdir(projectPaths.inferredTypesDir, { recursive: true })
  const typeFiles = await readdir(projectPaths.inferredTypesDir)

  const filteredTypeFiles = typeFiles.filter(x => /\.ts$/.test(x))

  const keys = filteredTypeFiles.map(x => parse(x).name)

  const importLines = keys.map(
    key => `import { ${key} } from './keys/${key}.js'`,
  )

  const interfaceProperties = keys.map(key => `${key}: ${key}`)

  const body = `
  declare global {
    namespace TypeStream {
      export interface Types {
${interfaceProperties.map(x => `        ${x}`).join('\n')}
      }
    }
  }`

  const file = [...importLines, body].join('\n')

  await mkdir(projectPaths.typesPath, { recursive: true })
  await writeFile(projectPaths.typeMapPath, file)
}
