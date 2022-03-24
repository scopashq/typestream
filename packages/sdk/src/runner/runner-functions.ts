import { PublishArgs } from '@typestream/core-protocol'
import {
  AnyResource,
  DocumentRef,
  ResourceRef,
} from '@typestream/core-protocol/resources'

import { FullSchema } from '../typing/schema-sample-capturer.js'
import { IpcFunctionRef } from './rpc.js'

export const loadPipeRef = new IpcFunctionRef<
  {
    pipeName: string
    captureSchemaSamples: boolean
    enableDumpFunctionality: boolean
    enableWriting: boolean
  },
  { resourceRef: ResourceRef }
>('loadPipe')

type DocumentProcessResult = {
  documentsToPublish: PublishArgs<AnyResource>[]
}

export const processDocumentRef = new IpcFunctionRef<
  { documentRef: DocumentRef; data: any; exposeErrors: boolean },
  DocumentProcessResult
>('processDocument')

export const getCapturedSchemasRef = new IpcFunctionRef<{}, FullSchema[]>(
  'getCapturedSchemas',
)

export type CustomMessage = {
  type: string
} & (
  | { type: 'ready' }
  | { type: 'dump'; data: any; name: string; skipDuplicates: boolean }
)
