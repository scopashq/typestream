import { join } from 'node:path'

import { ProjectPaths } from '../paths/project-paths.js'

export type ResourceSamplePath = {
  /** Path the resource folder itself */
  resourcePath: string

  /** Path to the resource config.json */
  configPath: string

  /** Path to the document meta files */
  metaPath: string

  /** Path to the actual document data files */
  dataPath: string
}

export function getResourceSamplePaths(
  resourceName: string,
  projectPaths: ProjectPaths,
) {
  const resourcePath = join(projectPaths.resourcesDir, resourceName)

  const res: ResourceSamplePath = {
    resourcePath,
    configPath: join(resourcePath, 'config.json'),
    metaPath: join(resourcePath, 'meta'),
    dataPath: join(resourcePath, 'data'),
  }

  return res
}

export type ResourceSampleDocumentPaths = {
  metaFile: string
  dataFile: string
  id: string
}

export function getResourceSampleDocumentPaths(
  id: string,
  resourcePaths: ResourceSamplePath,
): ResourceSampleDocumentPaths {
  const sanitizedId = Buffer.from(id).toString('base64')
  return {
    id,
    dataFile: join(resourcePaths.dataPath, sanitizedId),
    metaFile: join(resourcePaths.metaPath, `${sanitizedId}.json`),
  }
}

export function decodeDocumentSampleId(encodedId: string) {
  return Buffer.from(encodedId, 'base64').toString('utf-8')
}
