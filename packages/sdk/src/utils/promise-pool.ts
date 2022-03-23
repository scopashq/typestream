export async function promisePool<T>({
  concurrency,
  generator,
  fn,
}: {
  generator: AsyncGenerator<T> | Generator<T>
  fn: (arg0: T) => Promise<void>
  concurrency: number
}) {
  let stop = false

  const workerFn = async () => {
    while (!stop) {
      const { value, done } = await generator.next()
      if (done) {
        stop = true
        break
      }
      await fn(value)
    }
  }

  /**
   * PromisePool creates concurrency-many workers and fills them with promises for workers that process.
   */
  const workers: Promise<void>[] = []
  for (let i = 0; i < concurrency; i++) {
    workers.push(workerFn())
  }

  await Promise.all(workers)
}
