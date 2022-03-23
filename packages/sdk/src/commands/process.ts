import { Command, Flags } from '@oclif/core'

import { loadAllPaths } from '../paths/load-all-paths.js'
import { PipePath } from '../paths/pipe-paths.js'
import { ProjectPaths } from '../paths/project-paths.js'
import { runPipeProgress } from '../process/run-pipe-process.js'
import { logReplace } from '../utils/log-replace.js'
import { renderWatchProgress } from '../watch/render-watch-progress.js'
import { WatchProgress } from '../watch/watch-progress.js'

export default class Process extends Command {
  static description =
    "Process all documents of a pipe's resource and publish the outputs."

  static args = [
    {
      name: 'pipeName',
      required: true,
      description: 'Pipe name that will run and process documents.',
    },
  ]

  static flags = {
    debug: Flags.boolean({
      char: 'd',
      description: 'Enable debigging for the pipe.',
      default: false,
    }),
  }

  static strict = true
  async run(): Promise<void> {
    const { args, flags } = await this.parse(Process)
    const pipeName = args.pipeName as string
    const paths = await loadAllPaths(pipeName)

    await this.process({ enableDebugging: flags.debug, paths })
  }

  private async process({
    enableDebugging,
    paths,
  }: {
    enableDebugging: boolean
    paths: {
      project: ProjectPaths
      pipe: PipePath
    }
  }) {
    let lastProgress: WatchProgress
    runPipeProgress({
      debuggingEnabled: enableDebugging,
      paths,
      concurrency: 20,
    })
      .forEach(progress => {
        lastProgress = progress
        logReplace.write(renderWatchProgress(progress))
      })
      .catch((error: Error) => {
        logReplace.write(renderWatchProgress(lastProgress, { error }))
      })
  }
}
