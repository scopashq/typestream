export async function asyncGeneratorToArray<T>(
  generator: AsyncGenerator<T>,
  { maxCount = Number.POSITIVE_INFINITY }: { maxCount?: number } = {},
) {
  const results: T[] = []

  for await (const element of generator) {
    results.push(element)
    if (results.length === maxCount) break
  }

  return results
}
