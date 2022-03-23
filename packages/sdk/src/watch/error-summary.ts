import chalk from 'chalk'

import { basedOn, toSum } from '../utils/array-utils.js'
import { boldBox } from '../utils/chalk-extensions.js'

/**
 * Class used by the `watch` command to capture errors during pipe execution and
 * print a summary of the most common errors afterwards.
 */
export class ErrorSummary {
  private errorMap: Map<string, Error[]> = new Map()

  public captureError(error: Error) {
    if (!this.errorMap.has(error.message)) {
      this.errorMap.set(error.message, [])
    }
    this.errorMap.get(error.message)!.push(error)
  }

  public isEmpty() {
    return this.errorMap.size === 0
  }

  public render({ onlyShowTop }: { onlyShowTop?: number } = {}) {
    const lines = []

    const errors = [...this.errorMap.entries()]
      .map(([message, instances]) => ({ message, instances }))
      .sort(basedOn(error => error.instances.length, 'desc'))

    const topErrorTypes = errors.slice(0, onlyShowTop)

    lines.push(
      chalk.red('The following errors occurred:\n'),
      ...topErrorTypes.flatMap(error => this.renderError(error)),
    )

    const totalErrorCount = errors
      .map(errors => errors.instances.length)
      .reduce(...toSum)
    const topErrorCount = topErrorTypes
      .map(errors => errors.instances.length)
      .reduce(...toSum)

    const additionalErrors = totalErrorCount - topErrorCount
    if (additionalErrors > 0) {
      lines.push('', chalk.red.italic(`+ ${additionalErrors} other errors`))
    }

    return lines
  }

  private renderError(errorType: { message: string; instances: Error[] }) {
    const error = errorType.instances[0]
    const errorName = error.name ?? 'UnknownError'
    const count = errorType.instances.length

    const messageLines = errorType.message.split('\n')
    const firstMessageLine = messageLines.at(0)
    const remainingMessageLines = messageLines.slice(1)

    const countString = `${count}x`

    const prefix = boldBox(countString) + ` ${chalk.bold(errorName)}:`
    // We have to manually calculate the length due to ANSI escape codes
    const prefixLength = 1 + countString.length + 2 + errorName.length + 1

    const firstLine = chalk.red(
      `${prefix} ${firstMessageLine ?? chalk.italic('Unknown error!')}`,
    )
    const remainingLines = remainingMessageLines.map(line =>
      chalk.red(`${' '.repeat(prefixLength)} ${line}`),
    )

    return [firstLine, ...remainingLines]
  }
}
