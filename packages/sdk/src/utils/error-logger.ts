import { createWriteStream, mkdirSync, WriteStream } from 'node:fs'
import { join as joinPath } from 'node:path'

import { DocumentRef } from '@typestream/core-protocol/resources'
import { differenceInSeconds } from 'date-fns'

import { ProjectPaths } from '../paths/project-paths.js'

export class ErrorLogger {
  private writeStream: WriteStream
  private startTime: Date

  constructor(projectPaths: ProjectPaths, private pipeName: string) {
    this.startTime = new Date()

    const logsPath = joinPath(projectPaths.path, 'logs')
    mkdirSync(logsPath, { recursive: true })
    const timeStr = this.startTime.toISOString().replaceAll(':', '-')
    const path = joinPath(logsPath, `${pipeName}_${timeStr}.log`)

    this.writeStream = createWriteStream(path, { autoClose: true })

    this.writeStream.write(
      `[${new Date().toISOString()}] Started processing\n\n`,
    )
  }

  write({
    error,
    inputDocumentRef,
  }: {
    error: Error
    inputDocumentRef: DocumentRef
  }) {
    const now = new Date().toISOString()
    const stack = error.stack
      ? '\n' +
        error.stack
          .split('\n')
          .map(x => `        ${x}`)
          .join('\n')
      : ''

    this.writeStream.write(
      `[${now}] Error at: ${this.pipeName}\n    Input file :${JSON.stringify(
        inputDocumentRef,
      )}\n    Message: ${error.message}${stack}\n\n`,
    )
  }

  close() {
    const finishTime = new Date()

    const seconds = differenceInSeconds(finishTime, this.startTime)

    this.writeStream.write(
      `[${finishTime.toISOString()}] Finished processing in ${readableTime(
        seconds,
      )}`,
    )
    this.writeStream.close()
  }
}

function readableTime(seconds: number) {
  if (seconds <= 60) {
    return `${Math.round(seconds)} sec`
  }

  const mins = Math.floor(seconds / 60)
  const truncatedSeconds = Math.round(seconds - mins * 60)

  if (mins <= 60) {
    return `${mins} min ${truncatedSeconds} sec`
  }

  const hours = Math.floor(mins / 60)
  const truncatedMins = Math.round(mins - hours * 60)

  return `${hours} h ${truncatedMins} min ${truncatedSeconds} sec`
}
