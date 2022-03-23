import '@typestream/core-protocol'
import { assertGeneratedTypeName } from '@typestream/core-protocol/utils'
import { createSchema, extendSchema, Schema } from 'genson-js'

type SchemaMap = Map<string, FullSchema>

export type FullSchema = { name: string; schema: Schema; samples: number }

export class SchemaCapturer {
  public readonly schemaMap: SchemaMap = new Map()

  captureTypeSample({ name, data }: { name: string; data: any }) {
    assertGeneratedTypeName(name)

    if (!this.schemaMap.has(name))
      this.schemaMap.set(name, {
        name,
        schema: createSchema(data),
        samples: 1,
      })
    else {
      const fullSchema = this.schemaMap.get(name)!
      fullSchema.samples++
      fullSchema.schema = extendSchema(fullSchema.schema, data)
    }
  }
}
