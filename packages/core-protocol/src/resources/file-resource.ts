import { z } from 'zod'

import { kDocClass, Resource } from './base-resource.js'
import { BufferDocuments } from './buffer-document.js'
import { ResourceType } from './resource-map.js'

type FileResourceMetadata = {
  path: string
}

const fileResourceOptionsSchema = z.object({
  basePath: z.string(),
  /**
   * If recursive is set to `true` the whole subtree below `basePath` will be
   * considered instead of only the files directly under `basePath`
   */
  recursive: z.boolean(),
})

export type FilePublishMetadata = {
  name: string
}

type FileResourceOptions = z.infer<typeof fileResourceOptionsSchema>

/**
 * Resources are the core concept when thinking about where your data is stored.
 * With `FileResource` you can define a local directory to which
 * you write your transformed data or from which you read the data.
 *
 * @param {string} name The name of the resource (has to be unique within a project).
 * @param {object} options The options describe the document location for the resource
 * @param {string} basePath The base path starting from your project folder
 * @param {boolean} recursive if `recursive` is set to `true` the whole subtree
 * below `basePath` will be considered instead of only the files directly under `basePath`
 *
 * @example
 * new FileResource('transformed-products', {
 *    basePath: 'output'
 *    recursive: false,
 * })
 */
export class FileResource extends Resource<
  FileResourceOptions,
  FileDocument,
  FilePublishMetadata
> {
  validateOptions(options: { basePath: string; recursive: boolean }): void {
    fileResourceOptionsSchema.parse(options)
  }

  readonly type: ResourceType = 'file'

  public [kDocClass] = FileDocument
}

export class FileDocument extends BufferDocuments<
  FileResourceMetadata,
  FileResource
> {
  public get id(): string {
    if (!this.metadata.path)
      throw new Error(
        'Id field on FileDocument not found! On file documents, the `metadata.path` property must be set!',
      )
    return this.metadata.path
  }
}
