import { ChildProcess } from 'node:child_process'
import { randomUUID } from 'node:crypto'

import pDefer, { DeferredPromise } from 'p-defer'

type RemoteRequestObject<T> = {
  type: 'ipc-request'
  name: string
  data: { messageId: string; data: T }
}

type RemoteResponseError = {
  name: string
  message: string
  stack?: string
}

type RemoteResponseObject<T> = {
  type: 'ipc-response'
  name: string
  messageId: string
} & (
  | { succeeded: true; data: T }
  | { succeeded: false; error: RemoteResponseError }
)

const registerdHandlers = new Map<
  string,
  IpcFunctionCaller<any, any> | IpcFunctionImplementation<any, any>
>()

function ensureJustOneInProcess(
  name: string,
  handler: IpcFunctionCaller<any, any> | IpcFunctionImplementation<any, any>,
) {
  const alreadyRegistred = registerdHandlers.get(name)
  if (alreadyRegistred)
    throw new Error(
      `A handler (${alreadyRegistred.constructor.name}) for ${alreadyRegistred.name} is already registred in this process. Can not register another ${handler.constructor.name}!`,
    )
}

export class IpcFunctionRef<FunctionArgs, FunctionResponse> {
  constructor(public readonly name: string) {}

  public implement(
    peerProcess: NodeJS.Process,
    fn: (arg: FunctionArgs) => Promise<FunctionResponse>,
  ) {
    return new IpcFunctionImplementation<FunctionArgs, FunctionResponse>(
      this.name,
      peerProcess,
      fn,
    )
  }
  public createCallable(peerProcess: ChildProcess) {
    return new IpcFunctionCaller<FunctionArgs, FunctionResponse>(
      this.name,
      peerProcess,
    )
  }
}

export class IpcDisconnectError extends Error {
  constructor() {
    super('The process exited before a response was received!')
    this.name = IpcDisconnectError.name
  }
}

class IpcFunctionCaller<FunctionArgs, FunctionResponse> {
  private pendingRequests = new Map<string, DeferredPromise<FunctionResponse>>()

  constructor(public readonly name: string, private peerProcess: ChildProcess) {
    ensureJustOneInProcess(name, this)
    if (!this.peerProcess.send)
      throw new Error(
        'process.send() is not available. The passed in process must be a child process.',
      )

    peerProcess.on('exit', () => {
      for (const promise of this.pendingRequests.values()) {
        promise.reject(new IpcDisconnectError())
      }
    })

    this.peerProcess.on(
      'message',
      (message: RemoteResponseObject<FunctionResponse>) => {
        if (message.name === this.name && message.type === 'ipc-response') {
          void this.receiveResponse(message)
        }
      },
    )
  }

  private sendMessage(message: RemoteRequestObject<FunctionArgs>) {
    this.peerProcess.send(message)
  }

  private receiveResponse(message: RemoteResponseObject<FunctionResponse>) {
    const promise = this.pendingRequests.get(message.messageId)
    if (!promise) throw new Error('Unknown message received!')
    if (message.succeeded) {
      promise.resolve(message.data)
    } else {
      const error = deserializeError(message.error)
      promise.reject(error)
    }
  }

  async call(data: FunctionArgs): Promise<FunctionResponse> {
    const requestId = randomUUID()
    const p = pDefer<FunctionResponse>()
    this.pendingRequests.set(requestId, p)

    this.sendMessage({
      name: this.name,
      type: 'ipc-request',
      data: { data, messageId: requestId },
    })

    return await p.promise
  }
}

class IpcFunctionImplementation<Request, Response> {
  constructor(
    public readonly name: string,
    private process: NodeJS.Process,
    private fn: (arg0: Request) => Promise<Response>,
  ) {
    ensureJustOneInProcess(name, this)
    if (!this.process.send)
      throw new Error(
        'process.send() is not available. The passed in process must be a child process.',
      )
    this.process.on('message', (message: RemoteRequestObject<Request>) => {
      if (message.name === this.name && message.type === 'ipc-request') {
        void this.receiveRequest(message)
      }
    })
  }

  async receiveRequest(message: RemoteRequestObject<Request>) {
    try {
      const resp = await this.fn(message.data.data)
      this.sendMessage({
        name: this.name,
        type: 'ipc-response',
        messageId: message.data.messageId,
        succeeded: true,
        data: resp,
      })
    } catch (rawError) {
      const error = serializeError(rawError as Error)

      this.sendMessage({
        name: this.name,
        type: 'ipc-response',
        messageId: message.data.messageId,
        succeeded: false,
        error,
      })
    }
  }

  private sendMessage(message: RemoteResponseObject<Response>) {
    this.process.send!(message)
  }
}

function serializeError(error: Error): RemoteResponseError {
  return {
    name: error.name,
    message: error.message,
    stack: error.stack,
  }
}

function deserializeError(error: RemoteResponseError): Error {
  // eslint-disable-next-line unicorn/error-message
  const deserializedError = new Error()

  deserializedError.name = error.name
  deserializedError.message = error.message
  deserializedError.stack = error.stack

  return deserializedError
}
