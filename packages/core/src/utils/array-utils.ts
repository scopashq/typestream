type Direction = 'asc' | 'desc'

/** Made to be used with `.sort` (e.g. `.sort(basedOnKey('size', 'desc'))`). */
export function basedOnKey<T extends Record<string, any>>(
  key: keyof T,
  direction: Direction,
) {
  return basedOn<T>(_ => _[key], direction)
}

/** Made to be used with `.sort` (e.g. `.sort(basedOn(_ => _.size, 'desc'))`). */
export function basedOn<T>(argFn: (arg: T) => number, direction: Direction) {
  const sortFn =
    direction === 'asc'
      ? (x: number, y: number) => x - y
      : (x: number, y: number) => y - x

  return (a: T, b: T) => sortFn(argFn(a), argFn(b))
}

/**
 * Like `basedOn`, but with support for multiple sorting criteria:
 *
 * ```
 * items.sort(basedOnMultiple([
 *   [_ => _.size, 'desc'],
 *   [_ => _.createdAt, 'asc'],
 * ]))
 * ```
 */
export function basedOnMultiple<T>(
  criteria: [(arg: T) => number, Direction][],
) {
  const sortFns = criteria.map(([argFn, direction]) =>
    basedOn(argFn, direction),
  )

  return (a: T, b: T) => {
    for (const sortFn of sortFns) {
      const result = sortFn(a, b)
      if (result !== 0) return result
    }

    return 0
  }
}

/** Made to be used with `.reduce` (`.reduce(...toSum)`). */
export const toSum = [(sum: number, value: number) => sum + value, 0] as const

export function sumOf(numbers: number[]) {
  return numbers.reduce(...toSum)
}
