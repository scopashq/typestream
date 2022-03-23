import { isDeepStrictEqual } from 'node:util'

import { assertResourceName } from '../naming/resource-names.js'
import { ResourceType } from './resource-map.js'

export const kDocClass = Symbol('kDocClass')

export interface ResourceRef {
  type: ResourceType
  name: string
  options: Record<string, any>
}
export interface DocumentRef {
  resourceRef: ResourceRef
  metadata: Record<string, any>
  id: string
}

const kPublishMetadataType = Symbol('kPublishMetadataType')

type ClassOf<T> = new (...args: any[]) => T
export abstract class Resource<
  Options extends Record<string, any>,
  Doc extends AnyDocument,
  PublishMetadata extends Record<string, any>,
> {
  public abstract readonly [kDocClass]: ClassOf<Doc>
  abstract readonly type: ResourceType

  constructor(
    /** The name of the resource (has to be unique within a project). */
    public name: string,

    /** The options that are passed to the resource's provider. */
    public options: Options,
  ) {
    assertResourceName(this.name)
    this.validateOptions(this.options)
  }

  abstract validateOptions(options: Options): void

  public toResourceRef(): ResourceRef {
    return {
      name: this.name,
      options: this.options,
      type: this.type,
    }
  }

  public buildDocument(
    documentRef: DocumentRef,
    read: () => Promise<any>,
  ): Doc {
    this.assertRefEqualsThis(documentRef.resourceRef)

    const DocumentClass = this[kDocClass]
    const doc = new DocumentClass(this, documentRef.metadata, read)

    return doc
  }

  protected assertRefEqualsThis(resourceRef: ResourceRef) {
    if (
      resourceRef.name === this.name &&
      resourceRef.type === this.type &&
      isDeepStrictEqual(resourceRef.options, this.options)
    )
      return

    throw new Error('This Resource does not equal the passed ResourceRef!')
  }

  // Necessary because TypeScript otherwise "forgets" about the `Doc` type
  // parameter which makes it impossible to extract it using `DocumentOfResource`
  public readonly [kPublishMetadataType]?: PublishMetadata
}

export abstract class Document<
  Data,
  Metadata extends Record<string, any>,
  Res extends AnyResource,
> {
  constructor(
    /** The resource this document is from. */
    public readonly resource: Res,

    /** Metadata about the document made accessible through getters. */
    public readonly metadata: Metadata,

    /** Read the document's contents. */
    public readonly read: () => Promise<Data>,
  ) {}

  public toDocumentRef(): DocumentRef {
    return {
      resourceRef: this.resource.toResourceRef(),
      id: this.id,
      metadata: this.metadata,
    }
  }

  public abstract get id(): string
}

export type AnyResource = Resource<any, any, any>

export type AnyDocument = Document<any, any, any>

export type DocumentOfResource<Res extends AnyResource> = Res extends Resource<
  any,
  infer Doc,
  any
>
  ? Doc
  : never

export type ResourceOfDocument<Doc extends AnyDocument> = Doc extends Document<
  any,
  any,
  infer Res
>
  ? Res
  : never

export type PublishMetadataOfResource<Res extends AnyResource> =
  Res extends Resource<any, any, infer PublishMetadata>
    ? PublishMetadata
    : never

export type DataOfDocument<Doc extends AnyDocument> = Doc extends Document<
  infer Data,
  any,
  any
>
  ? Data
  : never
