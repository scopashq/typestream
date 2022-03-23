let alreadyWaitingForRejection = false

/**
 * Arguably fairly hacky function that can be used to catch an error thrown by
 * an async function without the debugger (e.g. VS Code) considering the error
 * to be handled.
 *
 * The alternative would be to manually enable "Caught exception"
 * handling in the debugger settings which has the very bad side effect of
 * including a _lot_ of very uninteresting exceptions from libraries.
 *
 * _**Note:** Make sure to always wait for the last invocation of this function
 * to finish before calling it again. Calling it while it's waiting for another
 * invocation to finish will result in an exception!_
 */
export function catchButNotReally<T>(fn: () => Promise<T>) {
  return new Promise((resolve, reject) => {
    if (alreadyWaitingForRejection)
      throw new Error('Already waiting for unhandled rejection!')
    alreadyWaitingForRejection = true

    const handleRejection = (error: any) => {
      alreadyWaitingForRejection = false
      reject(error)
    }
    process.once('unhandledRejection', handleRejection)

    void fn().then(value => {
      // Remove reject listener if promise resolves successfully
      process.off('uncaughtException', handleRejection)

      alreadyWaitingForRejection = false
      resolve(value)
    })
  })
}
