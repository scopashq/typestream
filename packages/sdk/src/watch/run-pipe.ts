import {
  AnyDocument,
  resourceFromRef,
} from '@typestream/core-protocol/resources'

import { PipePath } from '../paths/pipe-paths.js'
import { ProjectPaths } from '../paths/project-paths.js'
import { buildPipe } from '../pipe/bundling/build.js'
import { getResourceProvider } from '../resources/providers/index.js'
import { PipeController } from '../runner/pipe-controller.js'
import { IpcDisconnectError } from '../runner/rpc.js'
import { processSchemas } from '../typing/process-schemas.js'
import { asyncGeneratorToArray } from '../utils/async-gen-to-array.js'
import { DataDumper } from '../utils/data-dumper.js'
import observeAsync from '../utils/observe-async.js'
import { ErrorSummary } from './error-summary.js'
import { WatchProgress } from './watch-progress.js'

interface PipeRunOptions {
  pipeName: string
  debuggingEnabled: boolean
  paths: {
    project: ProjectPaths
    pipe: PipePath
  }
  sampleCount: number
  abortSignal: AbortSignal
  checkSampleCounts: boolean
  captureSchemas: boolean
}

export function runPipe(options: PipeRunOptions) {
  return observeAsync<WatchProgress>(async next => {
    const progress: WatchProgress = {
      stage: 'BUILD',
      documentNumbers: {
        total: 0,
        failed: 0,
        succeeded: 0,
        published: 0,
        currentDocumentNumber: 0,
      },
      errorSummary: new ErrorSummary(),
    }
    next(progress)

    const pipeController = new PipeController(options.debuggingEnabled)
    options.abortSignal.addEventListener('abort', () => {
      void pipeController.stop()
    })
    const dataDumper = new DataDumper(options.paths.project)

    await buildPipe(options.paths.pipe)

    const resourceRef = await pipeController.loadPipe(options.pipeName, {
      enableSchemaCapturing: options.captureSchemas,
      dumpFunction: options => {
        dataDumper.dump(options)
        progress.dumpFiles = dataDumper.activeDumps
      },
      enableWriting: false,
    })
    const resource = resourceFromRef(resourceRef)

    const provider = getResourceProvider(resource, options.paths.project)
    await provider.cacheSamples({
      count: options.sampleCount,
      validateCounts: options.checkSampleCounts,
    })

    const samples = await asyncGeneratorToArray(
      provider.getSamples() as AsyncGenerator<AnyDocument>,
    )

    progress.stage = 'PROCESS'
    progress.documentNumbers.total = samples.length
    for (const [index, doc] of samples.entries()) {
      progress.documentNumbers.currentDocumentNumber = index + 1

      next(progress)

      try {
        const result = await pipeController.processDocument(doc)

        progress.documentNumbers.succeeded++
        progress.documentNumbers.published += result.documentsToPublish.length
      } catch (error: any) {
        if (error instanceof IpcDisconnectError) return

        progress.documentNumbers.failed++
        progress.errorSummary.captureError(error)
      }

      next(progress)
    }

    const schemas = await pipeController.getCapturedSchemas()

    await pipeController.stop()

    progress.stage = 'DONE'
    next(progress)

    await processSchemas(schemas, options.paths.project)
  })
}
