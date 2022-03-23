const noValue = Symbol('noValue')

interface DumpOptions {
  /** Only if the condition is truthy, data will be dumped */
  condition?: any

  /** Name is optional. This is the file into which data will be dumped (file in dump folder).
   *  Defaults to `dump` and you will find the data in the `dump.json` file.
   */
  name?: string

  skipDuplicates?: boolean
}

/**
 * `dump()` is a developer tool that allows you to write data to a file while
 * building your pipe. The JSON documents will be appended in a file to allow you
 * to easily see the data you are working with.
 *
 * **Dump will do nothing in production.**
 */
export function dump(
  value: any,
  {
    condition = noValue,
    name = 'default',
    skipDuplicates = false,
  }: DumpOptions = {},
) {
  if (condition === noValue || condition)
    globalThis.typestreamWriteDump?.({ data: value, name, skipDuplicates })
}
