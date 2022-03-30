import { BigQuery, Table } from '@google-cloud/bigquery'
import { ZodSchema } from 'zod'

import { zodToBigQuerySchema } from './schema.js'

type BigQueryTableOptions<T> = {
  /**
   * Schema of the table as a zod schema. When the table has no schema yet,
   * typestream will create a new BigQuery Schema for it.
   */
  schema: ZodSchema<T>

  /**
   * Name of the table in BigQuery.
   */
  tableName: string

  /**
   * The id (name) of the Dataset in BigQuery
   */
  datasetId: string

  /**
   * The id of the GoogleCloud project. Reccomended to use but this is optional
   * because the project can also be set with the default project.
   */
  projectId?: string

  /**
   * BigQuery provides an insertId to deduplicate documents. When you define this
   * function, you can specify a value that is used as insertId.
   */
  insertIdFn?: (arg: T) => string
}

//TODO: delete
export class BigQueryTable<T> {
  readonly zodSchema: ZodSchema<T>
  private table: Table

  private bigquery: BigQuery
  private insertIdFn?: (arg: T) => string
  private bqSchema: any
  private setSchemaPromise?: Promise<any>

  constructor({
    datasetId,
    insertIdFn,
    schema,
    tableName,
    projectId,
  }: BigQueryTableOptions<T>) {
    this.bigquery = new BigQuery({ projectId })
    this.table = this.bigquery.dataset(datasetId).table(tableName)
    this.zodSchema = schema
    this.insertIdFn = insertIdFn

    this.bqSchema = zodToBigQuerySchema(this.zodSchema)
  }

  /**
   * This is the BigQuery schema that was generated with the zod schema.
   */
  get bigquerySchema() {
    return this.bqSchema
  }

  /**
   * Insert documents to the BigQuery table that match the defined schema.
   */
  async insert(rows: T[]) {
    const parsedRows = rows.map(x => this.zodSchema.parse(x))
    if (parsedRows.length === 0)
      throw new Error(
        'You must provide at least one or moew row to insert to BigQuery!',
      )

    if (!globalThis.typestreamWritingActive) return
    await (this.setSchemaPromise ??= this.updateSchema())

    await (this.insertIdFn
      ? insertWithInsertId<T>(
          parsedRows,
          this.insertIdFn,
          this.table,
          this.bqSchema,
        )
      : this.table.insert(parsedRows, { schema: this.bqSchema }))
  }

  /**
   * This function is automatically called on the first insert to a table and
   * sets the table schema to the current zod schema.
   */
  async updateSchema() {
    const [tableExists] = await this.table.exists()
    if (!tableExists)
      throw new Error(
        `Table does not exist yet. Go to your bigquery (https://console.cloud.google.com/bigquery) and create the table. Typestream will create the schema for you.`,
      )

    const [metadata] = await this.table.getMetadata()

    // Update schema
    metadata.schema = this.bqSchema
    await this.table.setMetadata(metadata)
  }
}

/**
 * Provides a way to insert rows to BigQuery with the insertId. This is needed because
 * the default BigQuery node API does not provide a way to set the insert Id easily.
 */
async function insertWithInsertId<T>(
  parsedRows: any[],
  insertIdFn: (arg: T) => string,
  table: Table,
  bqSchema: any,
) {
  const encodedRows = parsedRows.map(row => ({
    json: Table.encodeValue_(row),
    insertId: insertIdFn(row),
  }))

  await table.insert(encodedRows, { raw: true, schema: bqSchema })
}
