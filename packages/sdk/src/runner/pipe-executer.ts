import { BundleSchema, PublishArgs } from '@typestream/core-protocol'
import { AnyResource } from '@typestream/core-protocol/resources'

import { loadAllPaths } from '../paths/load-all-paths.js'
import { loadPipeBundle } from '../pipe/bundling/load-pipe-bundle.js'
import { SchemaCapturer } from '../typing/schema-sample-capturer.js'
import { catchButNotReally } from '../utils/catch-but-not-really.js'
import {
  CustomMessage,
  getCapturedSchemasRef,
  loadPipeRef,
  processDocumentRef,
} from './runner-functions.js'

let enableSchemaCapturing = false
let enableDump = false

function main() {
  implementPipeLoading()

  sendMessage({ type: 'ready' })
}

implementSchemaCapturing()
implementDump()

function implementPipeLoading() {
  loadPipeRef.implement(
    process,
    async ({
      pipeName,
      captureSchemaSamples,
      enableDumpFunctionality,
      enableWriting,
    }) => {
      globalThis.typestreamWritingActive = enableWriting

      enableSchemaCapturing = captureSchemaSamples
      enableDump = enableDumpFunctionality

      const paths = await loadAllPaths(pipeName)
      const bundle = await loadPipeBundle(paths.pipe.bundleFileName)

      implementDocumentProcessing(bundle)

      return { resourceRef: bundle.resource.toResourceRef() }
    },
  )
}

function implementSchemaCapturing() {
  const schemaCapturer = new SchemaCapturer()

  globalThis.typestreamCaptureTypeSample = (name, data) => {
    if (enableSchemaCapturing) schemaCapturer.captureTypeSample({ name, data })
  }

  getCapturedSchemasRef.implement(process, async () => {
    return [...schemaCapturer.schemaMap.values()]
  })
}

function implementDump() {
  globalThis.typestreamWriteDump = ({ data, name, skipDuplicates }) => {
    if (enableDump) sendMessage({ type: 'dump', data, name, skipDuplicates })
  }
}

function implementDocumentProcessing(bundle: BundleSchema.Bundle) {
  processDocumentRef.implement(
    process,
    async ({ data, documentRef, exposeErrors }) => {
      const documentsToPublish: PublishArgs<AnyResource>[] = []
      const doc = bundle.resource.buildDocument(documentRef, async () => data)

      const callBundle = () =>
        bundle.call(doc, {
          publish: x => {
            documentsToPublish.push(x)
            x.resource
          },
        })

      // `catchButNotReally` is used to allow the debugger to jump to errors from
      // the pipe while still allowing us to catch and react to errors here
      await (exposeErrors ? catchButNotReally(callBundle) : callBundle())

      return { documentsToPublish }
    },
  )
}

function sendMessage(message: CustomMessage) {
  process.send!(message)
}

void main()
