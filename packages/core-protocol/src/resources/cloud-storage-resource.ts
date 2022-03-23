import { z } from 'zod'

import { kDocClass, Resource } from './base-resource.js'
import { BufferDocuments } from './buffer-document.js'
import { ResourceType } from './resource-map.js'

export type CloudStorageResourceMetadata = {
  kind: string
  id: string
  selfLink: string
  mediaLink: string
  name: string
  bucket: string
  generation: string
  metageneration: string
  contentType: string
  storageClass: string
  size: string
  md5Hash: string
  crc32c: string
  etag: string
  timeCreated: string
  updated: string
  timeStorageClassUpdated: string
  metadata: Record<string, string>

  /** The full path without the prefix. Added by us while downloading from cloud storage */
  slicedPath: string
}

export type CloudStoragePublishMetadata = {
  name: string
  metadata?: Record<string, string>
}

const cloudStorageResourceOptionsSchema = z.object({
  bucket: z.string(),
  cloudStorageProject: z.string(),
  pathPrefix: z.string(),
})

type CloudStorageResourceOptions = z.infer<
  typeof cloudStorageResourceOptionsSchema
>

/**
 * @param {object} options
 * Resources are the core concept when thinking about where your data is stored.
 * With `CloudStorageResource` you can define a cloud storage data source to
 * which you write your transformed data or from which you read the data.
 * @param {string} name The name of the resource (has to be unique within a project).
 * @param {object} options The options needed for the Cloud Storage Reference
 * @param {string} cloudStorageProject The name of the Cloud Storage project
 * @param {string} bucket The reference name to a Cloud Storage bucket
 * @param {string} pathPrefix Can be thought of a directory name in a local storage system.
 * When reading your bucket, only objects under that path will be considered.
 *
 * @example
 * new CloudStorageResource('getting-started-dataset', {
    cloudStorageProject: 'scopas',
    bucket: 'typestream-datasets',
    pathPrefix: 'bestsellers-ecommerce',
  })
 */
export class CloudStorageDocument extends BufferDocuments<
  CloudStorageResourceMetadata,
  CloudStorageResource
> {
  public get id(): string {
    if (!this.metadata.slicedPath)
      throw new Error(
        'Id property not available on the metadata of this cloud storage document. Make sure `metadata.slicedPath` exists!',
      )
    return this.metadata.slicedPath
  }
}

export class CloudStorageResource extends Resource<
  CloudStorageResourceOptions,
  CloudStorageDocument,
  CloudStoragePublishMetadata
> {
  readonly type: ResourceType = 'gcs'

  validateOptions(options: {
    bucket: string
    cloudStorageProject: string
    pathPrefix: string
  }): void {
    cloudStorageResourceOptionsSchema.parse(options)
  }

  [kDocClass] = CloudStorageDocument
}
