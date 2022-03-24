import { ChildProcess, fork } from 'node:child_process'
import { fileURLToPath } from 'node:url'

import { AnyDocument, ResourceRef } from '@typestream/core-protocol/resources'
import pDefer from 'p-defer'

import { DumpFunction } from '../utils/data-dumper.js'
import {
  CustomMessage,
  getCapturedSchemasRef,
  loadPipeRef,
  processDocumentRef,
} from './runner-functions.js'

const WORKER_PATH = fileURLToPath(new URL('pipe-executer.js', import.meta.url))

export class PipeController {
  private childProcess: ChildProcess

  private untilChildProcessReady = pDefer<void>()
  private untilChildProcessExit = pDefer<void>()

  public resourceRef: ResourceRef | undefined

  // Rpc Functions
  private initializeRunner: ReturnType<typeof loadPipeRef.createCallable>
  private processDocumentCaller: ReturnType<
    typeof processDocumentRef.createCallable
  >
  private getCapturedSchemasCaller: ReturnType<
    typeof getCapturedSchemasRef.createCallable
  >

  private dumpFunction: DumpFunction | undefined = undefined

  constructor(public readonly deuggingEnabled = false) {
    this.childProcess = fork(WORKER_PATH, {
      // Ignore stdin, stdout, and stderr, but set up channel for IPC
      stdio: ['ignore', 'ignore', 'ignore', 'ipc'],
      execArgv: this.deuggingEnabled ? ['--inspect'] : [],
      serialization: 'advanced',
    })
    this.attachMessageHandlers()

    this.initializeRunner = loadPipeRef.createCallable(this.childProcess)
    this.processDocumentCaller = processDocumentRef.createCallable(
      this.childProcess,
    )
    this.getCapturedSchemasCaller = getCapturedSchemasRef.createCallable(
      this.childProcess,
    )
  }

  async processDocument(doc: AnyDocument) {
    const data = await doc.read()
    const documentRef = doc.toDocumentRef()
    const processingRes = await this.processDocumentCaller.call({
      documentRef,
      data,
      exposeErrors: !this.deuggingEnabled,
    })

    return processingRes
  }

  private attachMessageHandlers() {
    this.childProcess.on('message', message =>
      this.handleCustomMessage(message as any),
    )

    this.childProcess.on('error', error =>
      this.untilChildProcessExit.reject(error),
    )
    this.childProcess.on('exit', () => this.untilChildProcessExit.resolve())
  }

  private handleCustomMessage(message: CustomMessage) {
    if (message.type === 'ready') {
      this.untilChildProcessReady.resolve()
      return
    }
    if (message.type === 'dump') {
      void this.dumpFunction?.({
        data: message.data,
        name: message.name,
        skipDuplicates: message.skipDuplicates,
      })
    }
  }

  public async loadPipe(
    pipeName: string,
    options: {
      enableSchemaCapturing: boolean
      dumpFunction?: DumpFunction
      enableWriting: boolean
    },
  ) {
    if (this.resourceRef)
      throw new Error('A pipe is already loaded into this process!')
    await Promise.race([
      this.untilChildProcessReady.promise,
      delay(3000).then(() => {
        throw new Error(
          'The process is not responding. Try to restart tyst watch.',
        )
      }),
    ])

    const { resourceRef } = await this.initializeRunner.call({
      pipeName,
      captureSchemaSamples: options.enableSchemaCapturing,
      enableDumpFunctionality: options.dumpFunction !== undefined,
      enableWriting: options.enableWriting,
    })
    this.resourceRef = resourceRef
    this.dumpFunction = options.dumpFunction

    return resourceRef
  }

  public async getCapturedSchemas() {
    const schemas = await this.getCapturedSchemasCaller.call({})
    return schemas
  }

  public async stop() {
    this.childProcess.kill()
    await this.untilChildProcessExit.promise
  }
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(() => resolve(), ms))
}
