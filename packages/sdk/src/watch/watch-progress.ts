import { ErrorSummary } from './error-summary.js'

export type ActiveDumpFiles = { key: string; path: string }[]
export interface WatchProgress {
  stage: 'BUILD' | 'PROCESS' | 'DONE'

  documentNumbers: DocumentNumbers

  /** A summary of the errors that have occurred so far. */
  errorSummary: ErrorSummary

  /** A map of all the dump files that are currently being used by the project */
  dumpFiles?: ActiveDumpFiles
}

interface DocumentNumbers {
  /** The number of the document currently being processed. */
  currentDocumentNumber: number

  /** How many documents are currently being processed in total. */
  total?: number

  /** How many documents have been successfully processed so far. */
  succeeded: number

  /** How many documents have failed to process so far. */
  failed: number

  /** How many documents have been published so far. */
  published: number
}
