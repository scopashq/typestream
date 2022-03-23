/**
 * With `pick()` you pass an array of keys that are
 * contained in the passed object. It returns accordingly a new object,
 * which contains only the contents for the selected keys.
 * @param {object} obj
 * @param {Array} keys
 *
 * @example
 * ```
 * const object = { name: 'randy', age: 23 }
 * const newObject = pick(object, ['name'])
 * ```
 *
 */
export function pick<T, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  const result: any = {}
  for (const key of keys) {
    result[key] = obj[key]
  }
  return result
}
