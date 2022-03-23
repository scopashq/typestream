import { join } from 'node:path'

import { ProjectPaths } from './project-paths.js'

export type PipePath = {
  name: string
  sourceFileName: string
  bundleDirName: string
  bundleFileName: string
}

export function getPipePaths(
  projectPaths: ProjectPaths,
  pipeName: string,
): PipePath {
  const bundleDirName = join(projectPaths.path, 'builds', pipeName)

  return {
    name: pipeName,
    sourceFileName: join(projectPaths.pipesPath, `${pipeName}.ts`),
    bundleDirName,
    bundleFileName: join(bundleDirName, 'bundle.js'),
  }
}
