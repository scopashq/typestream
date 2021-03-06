import { relative } from 'node:path'

import chalk from 'chalk'
import ct from 'chalk-template'

import { boldBox } from '../utils/chalk-extensions.js'
import { WatchProgress } from './watch-progress.js'

export function renderWatchProgress(
  progress: WatchProgress,
  { error }: { error?: Error } = {},
) {
  const documentCounts = renderDocumentCounts(progress)
  const dumpFiles = renderDumpFiles(progress)

  const lines: string[] = [
    '▶ ' + chalk.bold(renderProgressingLine(progress)),
    ...(documentCounts ? ['', documentCounts] : []),
    ...(error ? ['', ...chalk.red(error.message).split('\n')] : []),
    ...(dumpFiles ? ['', dumpFiles] : []),
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

function renderDumpFiles(progress: WatchProgress) {
  if (!progress.dumpFiles || progress.dumpFiles.length === 0) return

  const dumpFiles = progress.dumpFiles.map(x => {
    const cwd = process.cwd()
    const path = relative(cwd, x.path)
    return ct`    - {bold ${x.key}}: ${path}`
  })

  return chalk.gray(`Currently dumping into:
${dumpFiles.join('\n')}`)
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
    { value: rawCounts.published, label: 'results', color: chalk.blue },
  ]

  return counts
    .flatMap(count => {
      if (count.value === 0) return []
      return count.color(`${boldBox(count.value.toString())} ${count.label}`)
    })
    .join(chalk.dim(' | '))
}
