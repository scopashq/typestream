import { AnyResource } from '@typestream/core-protocol/resources'

import { ProjectPaths } from '../../paths/project-paths.js'
import { CloudStorageResourceProvider } from './cloud-storage-provider.js'
import { FileResourceProvider } from './file-resource-provider.js'
import { S3ResourceProvider } from './s3-provider.js'

const RESOURCE_PROVIDERS = {
  file: FileResourceProvider,
  gcs: CloudStorageResourceProvider,
  s3: S3ResourceProvider,
}

function getResourceProviderClass(res: AnyResource) {
  const Provider =
    RESOURCE_PROVIDERS[res.type as keyof typeof RESOURCE_PROVIDERS]
  if (Provider == null)
    throw new Error(`Could not find provider for resource type ${res.type}`)

  return Provider
}

export function getResourceProvider(
  res: AnyResource,
  projectPaths: ProjectPaths,
) {
  const Provider = getResourceProviderClass(res)

  const provider = new Provider(res, projectPaths)

  return provider
}
