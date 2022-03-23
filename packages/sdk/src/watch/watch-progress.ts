import { ErrorSummary } from './error-summary.js'

export interface WatchProgress {
  stage: 'BUILD' | 'PROCESS' | 'DONE'

  documentNumbers: DocumentNumbers

  /** A summary of the errors that have occurred so far. */
  errorSummary: ErrorSummary
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
