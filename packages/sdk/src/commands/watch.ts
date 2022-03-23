import { Command, Flags } from '@oclif/core'
import { throttleTime } from 'rxjs'

import { loadAllPaths } from '../paths/load-all-paths.js'
import { logReplace } from '../utils/log-replace.js'
import { observeDirectory } from '../utils/observe-directory.js'
import { renderWatchProgress } from '../watch/render-watch-progress.js'
import { runPipe } from '../watch/run-pipe.js'
import { WatchProgress } from '../watch/watch-progress.js'

export default class Watch extends Command {
  static description =
    'Watch a pipe and continuously get feedback without publishing.'

  static args = [
    {
      name: 'pipeName',
      required: true,
      description:
        'Pipe that will be watched and executed on every file change.',
    },
  ]

  static flags = {
    count: Flags.integer({
      char: 'c',
      description: 'Sample count',
      default: 100,
    }),
    'no-debug': Flags.boolean({
      char: 'D',
      description: 'Disable debugging',
      default: false,
    }),
    'no-typing': Flags.boolean({
      char: 'T',
      description: 'Disable automatic type inferance.',
      default: false,
    }),
  }

  static strict = true

  async run() {
    const { args, flags } = await this.parse(Watch)
    const pipeName = args.pipeName as string
    const paths = await loadAllPaths(pipeName)

    let lastRun = Promise.resolve()
    let abortController = new AbortController()
    let alreadyWaiting = false
    let isFirstRun = true

    const build = async () => {
      if (alreadyWaiting) return

      alreadyWaiting = true

      abortController.abort()
      await lastRun

      abortController = new AbortController()
      let lastProgress: WatchProgress
      lastRun = runPipe({
        pipeName,
        debuggingEnabled: !flags['no-debug'],
        paths,
        abortSignal: abortController.signal,
        sampleCount: flags.count,
        checkSampleCounts: isFirstRun,
        captureSchemas: !flags['no-typing'],
      })
        .forEach(progress => {
          lastProgress = progress
          logReplace.write(renderWatchProgress(progress))
        })
        .catch((error: Error) => {
          logReplace.write(renderWatchProgress(lastProgress, { error }))
        })

      isFirstRun = false
      alreadyWaiting = false
    }

    observeDirectory(paths.project.sourcePath)
      // Throttle events to avoid jank and race conditions
      .pipe(throttleTime(500))
      .subscribe(() => void build())

    // Trigger initial build
    void build()
  }
}
