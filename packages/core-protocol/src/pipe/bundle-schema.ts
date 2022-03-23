import { z, ZodType } from 'zod'

import { AnyDocument, AnyResource } from '../resources/base-resource.js'
import { executionResultSchema as _executionResultSchema } from './execution-result.js'
import { PublishArgs } from './publish-args.js'

/**
 * Definition of the bundle schema. This serves as the API between core package
 * and the rest because the core knows this way what sould be exported and TypeStream
 * knows what can be expected from the import.
 *
 * *Do not apply breaking changes here because it will invalidate old pipes!*
 */
export namespace BundleSchema {
  export const executionResultSchema = _executionResultSchema

  /** The type of `Bundle.call`. Takes a `Document` as input and returns an `executionResult` */
  export type BundleFunction = (
    doc: AnyDocument,
    callbacks: { publish: (args: PublishArgs<AnyResource>) => void },
  ) => Promise<ExecutionResult>

  /** Just `z.function()` so that zod doesn't wrap the actual function and destroys the default debugging experience */
  export const bundleFunctionSchema = z.function() as ZodType<BundleFunction>
  const publishCallbackSchema = z.function(
    z.tuple([z.any() as ZodType<PublishArgs<any>, any, any>], z.void()),
  )

  export const processorArgsSchema = z.tuple([
    z.any() as ZodType<AnyDocument>,
    publishCallbackSchema,
  ])

  /** The schema of the pipe-bundle */
  export const bundleSchema = z.object({
    resource: z.any() as ZodType<AnyResource>,
    protocolVersion: z.literal(1),
    call: bundleFunctionSchema,
  })

  /** Type of a pipe bundle. `definePipe()` returns this and every pipe should export this as default. */
  export type Bundle = z.infer<typeof bundleSchema>

  /** A Promise<ExecutionResult> will be returned from the BundleFunction. It contains all the data that was created by the pipe. */
  export type ExecutionResult = z.infer<typeof executionResultSchema>
}
