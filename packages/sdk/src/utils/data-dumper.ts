import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

import { Subject, throttle, throttleTime } from 'rxjs'

import { ProjectPaths } from '../paths/project-paths.js'

type DumpFunctionOptions = {
  name: string
  data: any
  skipDuplicates: boolean
}

export type DumpFunction = (options: DumpFunctionOptions) => void

export class DataDumper {
  private dumpsMap = new Map<
    string,
    {
      filePath: string
      entries: string[]
      writingSubject: Subject<void>
    }
  >()
  constructor(private projectPaths: ProjectPaths) {}

  /**
   * Get all the active dump streams for logging.
   */
  get activeDumps() {
    const res: { key: string; path: string }[] = []
    this.dumpsMap.forEach((val, key) => {
      res.push({ key, path: val.filePath })
    })

    return res
  }

  dump({ data, name, skipDuplicates }: DumpFunctionOptions) {
    const filePath = join(this.projectPaths.dumpDir, `${name}.json`)

    if (!this.dumpsMap.has(name)) {
      assertDumpName(name)
      const writingSubject = new Subject<void>()
      writingSubject
        .pipe(
          throttleTime(100),
          throttle(async () => {
            return this.entryToFile(name)
          }),
        )
        .subscribe(() => {
          //
        })

      this.dumpsMap.set(name, {
        filePath,
        entries: [],
        writingSubject,
      })
    }
    const currentElem = this.dumpsMap.get(name)!
    if (data === undefined) data = null
    const stringifiedData = JSON.stringify(data, undefined, '  ')

    if (!skipDuplicates || !currentElem.entries.includes(stringifiedData)) {
      currentElem.entries.push(stringifiedData)
    }

    currentElem.writingSubject.next()
  }

  async entryToFile(name: string) {
    await mkdir(this.projectPaths.dumpDir, { recursive: true })
    const currentElem = this.dumpsMap.get(name)!

    const joinedEntries = currentElem.entries.map(x => indent(x)).join(',\n')

    const fullText = `[\n${joinedEntries}\n]`

    await writeFile(currentElem.filePath, fullText)
  }
}

function indent(str: string) {
  const lines = []
  for (const row of str.split(/\n/)) {
    lines.push(`  ${row}`)
  }
  return lines.join('\n')
}

function assertDumpName(name: string) {
  if (/[\d -_a-z]/i.test(name)) return
  throw new Error(
    `Dump name "${name}" not valid. You can only use numbers, letters, spaces, dashes and underscores!`,
  )
}
