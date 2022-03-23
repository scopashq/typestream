import type { GetObjectCommandOutput } from '@aws-sdk/client-s3'
import { z } from 'zod'

import { kDocClass, Resource } from './base-resource.js'
import { BufferDocuments } from './buffer-document.js'
import { ResourceType } from './resource-map.js'

export type S3ResourceMetadata = Omit<
  GetObjectCommandOutput,
  '$metadata' | 'Body'
> & {
  /** The full path without the prefix. Added by us while downloading from cloud storage */
  slicedPath: string
}

export type S3PublishMetadata = {
  name: string
  metadata?: Record<string, string>
}

const S3ResourceOptionsSchema = z.object({
  region: z.string(),
  bucket: z.string(),
  pathPrefix: z.string(),
})

type S3ResourceOptions = z.infer<typeof S3ResourceOptionsSchema>

export class S3Document extends BufferDocuments<
  S3ResourceMetadata,
  S3Resource
> {
  public get id(): string {
    if (!this.metadata.slicedPath)
      throw new Error(
        'Id property not available on the metadata of this cloud storage document. Make sure `metadata.slicedPath` exists!',
      )
    return this.metadata.slicedPath
  }
}

/**
 * @param {object} options
 * Resources are the core concept when thinking about where your data is stored.
 * With `S3Resource` you can define an s3 data source to which you write your
 * transformed data or from which you read the data.
 * @param {string} name The name of the resource (has to be unique within a project).
 * @param {object} options The options needed for the S3 reference
 * @param {string} region The region of your S3 bucket.
 * @param {string} bucket The name of your S3 bucket
 * @param {string} pathPrefix Can be thought of a directory name in a local storage system.
 * When reading your bucket, only objects under that path will be considered.
 *
 * @example
 * new CloudStorageResource('getting-started-dataset', {
    region: 'eu-central-1',
    bucket: 'typestream-datasets',
    pathPrefix: 'bestsellers-ecommerce/2022',
  })
 */
export class S3Resource extends Resource<
  S3ResourceOptions,
  S3Document,
  S3PublishMetadata
> {
  validateOptions(options: {
    region: string
    bucket: string
    pathPrefix: string
  }): void {
    S3ResourceOptionsSchema.parse(options)
  }

  readonly type: ResourceType = 's3'

  public [kDocClass] = S3Document
}
