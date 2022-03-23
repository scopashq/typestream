import chalk from 'chalk'

/**
 * Chalk extensions that makes it easy to create those bold colored status
 * indicator boxes like `[Done!]` or `[Failed!]`.
 *
 * @example
 * console.log(`${chalk.red(boldBox('Done!'))} Finished successfully!`)
 */
export function boldBox(contents: string) {
  return chalk.inverse.bold(
    `${chalk.hidden('[')}${contents}${chalk.hidden(']')}`,
  )
}
