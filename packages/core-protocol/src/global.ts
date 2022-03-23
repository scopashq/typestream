// Only way to define globals
/* eslint-disable no-var */

type GlobalDumpFunction = (options: {
  data: any
  name: string
  skipDuplicates: boolean
}) => void
declare global {
  /**
   * This function is used to capture type samples in watch mode.
   * It is set by the pipe-executor.
   */
  var typestreamCaptureTypeSample:
    | ((name: string, data: any) => void)
    | undefined

  /**
   * This function cab be globally registered to allow dumping data in any pipe
   * at any time. It is set by the pipe-executor.
   */
  var typestreamWriteDump: GlobalDumpFunction | undefined

  /**
   * This variable is used for toggling writes from pipes. E.g. when we use bigquery
   * we can disable writes during watch mode.
   */
  var typestreamWritingActive: boolean
}

globalThis.typestreamWritingActive = false

export {}
