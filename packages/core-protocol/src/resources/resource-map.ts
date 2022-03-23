import { Resource, ResourceRef } from './base-resource.js'
import { CloudStorageResource } from './cloud-storage-resource.js'
import { FileResource } from './file-resource.js'
import { S3Resource } from './s3-resource.js'

export type ResourceType = 'gcs' | 'file' | 's3'

type ClassOf<T> = new (...args: any[]) => T

const registeredResources: Record<
  ResourceType,
  ClassOf<Resource<any, any, any>>
> = {
  file: FileResource,
  gcs: CloudStorageResource,
  s3: S3Resource,
}

export function resourceFromRef(resourceRef: ResourceRef) {
  const resourceClass = registeredResources[resourceRef.type]
  if (!resourceClass)
    throw new Error(`Unknown resource type (${resourceRef.type})!`)

  return new resourceClass(resourceRef.name, resourceRef.options)
}
