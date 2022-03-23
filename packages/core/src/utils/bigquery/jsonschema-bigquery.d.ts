declare module 'jsonschema-bigquery' {
  export function run(
    input_schema: any,
    options?: {
      preventAdditionalObjectProperties: boolean
      continueOnError: boolean
    },
  ): any
}
