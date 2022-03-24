import {
  AnyDocument,
  AnyResource,
  resourceFromRef,
} from '@typestream/core-protocol/resources'
import chalk from 'chalk'

import { PipePath } from '../paths/pipe-paths.js'
import { ProjectPaths } from '../paths/project-paths.js'
import { buildPipe } from '../pipe/bundling/build.js'
import { getResourceProvider } from '../resources/providers/index.js'
import { ResourceProvider } from '../resources/providers/resource-provider.js'
import { PipeController } from '../runner/pipe-controller.js'
import { DataDumper } from '../utils/data-dumper.js'
import { ErrorLogger } from '../utils/error-logger.js'
import observeAsync from '../utils/observe-async.js'
import { promisePool } from '../utils/promise-pool.js'
import { ErrorSummary } from '../watch/error-summary.js'
import { WatchProgress } from '../watch/watch-progress.js'
import { publishDocuments } from './publish-documents.js'

interface PipeRunOptions {
  debuggingEnabled: boolean
  concurrency: number
  paths: {
    project: ProjectPaths
    pipe: PipePath
  }
}

export function runPipeProgress({
  debuggingEnabled,
  paths,
  concurrency,
}: PipeRunOptions) {
  if (debuggingEnabled && concurrency !== 1) {
    console.log(
      chalk.yellow(
        `For debugging, the processing concurrency can't be ${concurrency} and will be set to 1.`,
      ),
    )
    concurrency = 1
  }

  return observeAsync<WatchProgress>(async next => {
    const progress: WatchProgress = {
      stage: 'BUILD',
      documentNumbers: {
        failed: 0,
        succeeded: 0,
        published: 0,
        currentDocumentNumber: 0,
      },
      errorSummary: new ErrorSummary(),
    }
    next(progress)

    const pipeController = new PipeController(debuggingEnabled)
    const dataDumper = new DataDumper(paths.project)

    await buildPipe(paths.pipe)

    const resourceRef = await pipeController.loadPipe(paths.pipe.name, {
      enableSchemaCapturing: false,
      dumpFunction: options => dataDumper.dump(options),
      enableWriting: true,
    })
    const resource = resourceFromRef(resourceRef)

    const provider = getResourceProvider(resource, paths.project)

    const errorLogger = new ErrorLogger(paths.project, paths.pipe.name)

    progress.stage = 'PROCESS'

    await promisePool({
      concurrency,
      generator: (provider as ResourceProvider<AnyResource>).getDocuments(),
      fn: async (doc: AnyDocument) => {
        next(progress)

        try {
          progress.documentNumbers.currentDocumentNumber++
          next(progress)

          const res = await pipeController.processDocument(doc)

          progress.documentNumbers.succeeded++

          await publishDocuments(res.documentsToPublish, paths.project)

          progress.documentNumbers.published += res.documentsToPublish.length
        } catch (error: any) {
          progress.documentNumbers.failed++
          progress.errorSummary.captureError(error)

          errorLogger.write({
            error,
            inputDocumentRef: doc.toDocumentRef(),
          })
        }

        next(progress)
      },
    })

    progress.stage = 'DONE'
    next(progress)

    errorLogger.close()

    await pipeController.stop()
  })
}
