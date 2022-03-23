import { z } from 'zod'

import { PIPE_NAME_PATTERN } from '../naming/pipe-names.js'
import { BundleSchema } from './bundle-schema.js'

export namespace Pipe {
  export const pipeRefSchema = z.object({
    name: z.string().regex(PIPE_NAME_PATTERN),
    projectName: z.string(),
  })

  export type PipeRef = z.infer<typeof pipeRefSchema>

  export const fullPipeSchema = z.object({
    id: z.string(),
    ref: pipeRefSchema,
    bundle: BundleSchema.bundleSchema,
  })
  export type FullPipe = z.infer<typeof fullPipeSchema>

  export function pipeIdFromRef(ref: PipeRef) {
    pipeRefSchema.parse(ref)
    return `${ref.projectName}/${ref.name}`
  }

  export function pipeRefFromId(pipeId: string) {
    const match = pipeId.match(/^(.+)\/(.+)$/) ?? []

    const projectName = match[1]
    const pipeName = match[2]

    const pipeRef = pipeRefSchema.parse({ projectName, pipeName })

    return pipeRef
  }
}
