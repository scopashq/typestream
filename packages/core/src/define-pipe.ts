import { BundleSchema, PublishArgs } from '@typestream/core-protocol'
import {
  AnyResource,
  AnyDocument,
  DocumentOfResource,
} from '@typestream/core-protocol/resources'

// Important to note:
// publish() can receive any given resource as an argument and is in no
// way related to the resource of the doc
type PipeContext<Doc extends AnyDocument> = {
  doc: Doc
  /**
   * With publish you write your transformed data to your output resource.
   * The target can be either a local directory or a cloud storage.
   * If you are done developing this pipe, type `tyst process` to actually
   * publish all your inputs
   * @param {FileResource} resource The resource to which you publish the data
   * @param data The data you publish (in form of a buffer)
   * @param {object} metadata The metadata you want to add to the data
   * @param {string} name The name for the document - unique for each documents
   */
  publish: <TargetRes extends AnyResource>(args: PublishArgs<TargetRes>) => void
}

export function definePipe<SourceRes extends AnyResource>(
  resource: SourceRes,
  fun: (ctx: PipeContext<DocumentOfResource<SourceRes>>) => Promise<void>,
): BundleSchema.Bundle {
  const wrappedFunction = async (
    doc: DocumentOfResource<SourceRes>,
    callbacks: { publish: (args: PublishArgs<AnyResource>) => void },
  ) => {
    // PREPARE EXECUTION
    const ctx: PipeContext<DocumentOfResource<SourceRes>> = {
      doc,
      publish: <TargetRes extends AnyResource>(
        args: PublishArgs<TargetRes>,
      ) => {
        callbacks.publish(args)
      },
    }

    // EXECUTION
    await fun(ctx)

    // AFTER EXECUTION
    const executionResult: BundleSchema.ExecutionResult = {}
    return executionResult
  }
  return {
    call: wrappedFunction as BundleSchema.BundleFunction,
    protocolVersion: 1,
    resource,
  }
}
