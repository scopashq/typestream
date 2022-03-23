import { run as jsonSchemaToBqSchema } from 'jsonschema-bigquery'
import { ZodSchema } from 'zod'
import { zodToJsonSchema } from 'zod-to-json-schema'

export function zodToBigQuerySchema(schema: ZodSchema<any>) {
  const jsonSchema = zodToJsonSchema(schema)
  const bqSchema = jsonSchemaToBqSchema(jsonSchema).schema
  return bqSchema
}
