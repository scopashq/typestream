import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

import { assertProjectName } from '@typestream/core-protocol/utils'

export async function getProjectName(path: string) {
  const packageJsonPath = join(path, 'package.json')
  const packageJson = await loadPackageJson(packageJsonPath)

  if (packageJson.name && packageJson.typestreamProject) {
    assertProjectName(packageJson.name)
    return packageJson.name
  }

  throw new Error(`${path} is not a valid typestream-project!`)
}

async function loadPackageJson(path: string) {
  try {
    const packageJson = JSON.parse(await readFile(path, { encoding: 'utf-8' }))
    return packageJson as {
      name?: string
      typestreamProject?: boolean
    }
  } catch {
    throw new Error(`Could not load package.json at ${path}!`)
  }
}
