import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { join as joinPath } from 'node:path'

import ct from 'chalk-template'
import { Schema, mergeSchemas, isSubset } from 'genson-js'

import { ProjectPaths } from '../paths/project-paths.js'
import { askOptions } from '../utils/ask.js'
import { createTypeMap } from './generate-type-map.js'
import { FullSchema } from './schema-sample-capturer.js'
import { typescriptFromSchema } from './types-from-json-schema.js'

export async function processSchemas(
  schemas: FullSchema[],
  projectPaths: ProjectPaths,
) {
  await mkdir(projectPaths.typesPath, { recursive: true })
  await mkdir(projectPaths.inferredTypesDir, { recursive: true })

  for (const fullSchema of schemas) {
    await writeTypeToFile(projectPaths, fullSchema)
  }

  await createTypeMap(projectPaths)
}

async function writeTypeToFile(paths: ProjectPaths, fullSchema: FullSchema) {
  const typeFilesDir = paths.inferredTypesDir

  const typeFilePath = joinPath(typeFilesDir, `${fullSchema.name}.ts`)
  const schemaFilePath = joinPath(
    typeFilesDir,
    `${fullSchema.name}.schema.json`,
  )

  const oldSchema = await tryLoadSchema(schemaFilePath)

  const newFullSchema = await mergeOrExtendSchemas(oldSchema, fullSchema)
  if (!newFullSchema) return

  const typesFile = await typescriptFromSchema(newFullSchema)

  const schemaFile = JSON.stringify(newFullSchema.schema, undefined, '  ')

  await writeFile(schemaFilePath, schemaFile)
  await writeFile(typeFilePath, typesFile)

  console.log(
    ct`{dim   If the new types don't show up, restart your TS Server or editor.}`,
  )
}

/**
 * Returns null when the schema is the same or returns the new merged FullSchema
 */
async function mergeOrExtendSchemas(
  oldSchema: Schema | undefined,
  newSchema: FullSchema,
) {
  if (oldSchema) {
    const schemasEqual = isSubset(oldSchema, newSchema.schema)
    if (schemasEqual) return null

    const answer = await askOptions(
      ct`The schema of "{cyan ${newSchema.name}}" got new fields.
  Do you want to {yellow overwrite (reccomended)} or {yellow extend} the types?`,
      {
        overwrite: 'overwrite (reccomended)',
        extend: 'extend (use with small sample size)',
      },
    )
    if (answer === 'overwrite') {
      console.log(`  Finished replacing types for ${newSchema.name}!`)
      return newSchema
    } else if (answer === 'extend') {
      const results = {
        ...newSchema,
        schema: mergeSchemas([oldSchema, newSchema.schema]),
      }
      console.log(`  Finished extending types for ${newSchema.name}!`)
      return results
    }
  } else {
    console.log(`  Finished creating new types for ${newSchema.name}!`)
    return newSchema
  }
}

async function tryLoadSchema(path: string) {
  try {
    const data = await readFile(path)
    return JSON.parse(data.toString('utf8')) as Schema
  } catch {
    return
  }
}
