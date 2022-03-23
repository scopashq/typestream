import { compile as compileTsFromSchema } from 'json-schema-to-typescript'

import { FullSchema } from './schema-sample-capturer.js'

export async function typescriptFromSchema(fullSchema: FullSchema) {
  //The "json-schema-to-typescript" library alters the schema in some very rare cases.
  const copiedSchema = JSON.parse(JSON.stringify(fullSchema.schema))

  const schema = await compileTsFromSchema(copiedSchema, fullSchema.name, {
    bannerComment: `/* eslint-disable unicorn/filename-case */

/**
 * Auto generated types by TypeStream.
 * Do not modify
 */`,
  })

  // We need to cut out lines that contain `[k: string]: unknown` because we don't allow unknown properties
  const result = schema
    .split('\n')
    .filter(x => !x.includes('[k: string]: unknown'))
    .join('\n')

  return result
}
