export { resourceFromRef } from './resource-map.js'

export { Document, Resource, kDocClass } from './base-resource.js'
export type {
  DocumentOfResource,
  ResourceOfDocument,
  PublishMetadataOfResource,
  DataOfDocument,
  AnyResource,
  AnyDocument,
} from './base-resource.js'
export {
  CloudStorageDocument,
  CloudStorageResource,
} from './cloud-storage-resource.js'
export type { S3ResourceMetadata, S3PublishMetadata } from './s3-resource.js'
export { S3Document, S3Resource } from './s3-resource.js'
export type {
  CloudStorageResourceMetadata,
  CloudStoragePublishMetadata,
} from './cloud-storage-resource.js'
export { FileDocument, FileResource } from './file-resource.js'
export type { FilePublishMetadata } from './file-resource.js'

export type { DocumentRef, ResourceRef } from './base-resource.js'
