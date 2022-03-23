import chalk from 'chalk'

import { boldBox } from '../utils/chalk-extensions.js'
import { WatchProgress } from './watch-progress.js'

export function renderWatchProgress(
  progress: WatchProgress,
  { error }: { error?: Error } = {},
) {
  const documentCounts = renderDocumentCounts(progress)

  const lines: string[] = [
    '▶ ' + chalk.bold(renderProgressingLine(progress)),
    ...(documentCounts ? ['', documentCounts] : []),
    ...(error ? ['', ...chalk.red(error.message).split('\n')] : []),
  ]

  if (!progress.errorSummary.isEmpty())
    lines.push('', ...progress.errorSummary.render({ onlyShowTop: 3 }))

  return ['', ...lines, ''].map(line => `  ${line}`).join('\n')
}

function renderProgressingLine(progress: WatchProgress) {
  if (progress.stage === 'BUILD') return 'Building pipe code…'
  if (progress.stage === 'DONE')
    return `Finished processing all ${progress.documentNumbers.currentDocumentNumber} documents!`

  const documentNumber = progress.documentNumbers.currentDocumentNumber

  return (
    `Processing document ${documentNumber}` +
    (progress.documentNumbers.total
      ? ` out of ${progress.documentNumbers.total}…`
      : '…')
  )
}

function renderDocumentCounts(progress: WatchProgress) {
  const rawCounts = progress.documentNumbers
  if (progress.stage === 'BUILD') return ''
  if (rawCounts.failed + rawCounts.succeeded === 0)
    return chalk.gray(`${boldBox('0')} documents processed so far`)

  const counts = [
    {
      value: rawCounts.succeeded,
      label: 'succeeded',
      color: chalk.green,
    },
    { value: rawCounts.failed, label: 'failed', color: chalk.red },
    { value: rawCounts.published, label: 'published', color: chalk.blue },
  ]

  return counts
    .flatMap(count => {
      if (count.value === 0) return []
      return count.color(`${boldBox(count.value.toString())} ${count.label}`)
    })
    .join(chalk.dim(' | '))
}
