import { readdir } from 'node:fs/promises'
import { join } from 'node:path'

export async function* getFilesIn(
  directoryPath: string,
  { recursive = false } = {},
): AsyncGenerator<string> {
  // Filters the raw generator to remove `.DS_Store` files.
  for await (const name of getFilesInRaw({
    baseDir: directoryPath,
    recursive,
  })) {
    if (!name.includes('.DS_Store')) yield name
  }
}

async function* getFilesInRaw({
  baseDir,
  recursive = false,
  nestingPath = '',
}: {
  baseDir: string
  recursive?: boolean
  nestingPath?: string
}): AsyncGenerator<string> {
  const currentPath = join(baseDir, nestingPath)
  const entries = await readdir(currentPath, { withFileTypes: true })

  for (const entry of entries) {
    if (entry.isFile()) {
      const res = join(nestingPath, entry.name)
      yield res
    }

    if (recursive && entry.isDirectory()) {
      const newNesting = join(nestingPath, entry.name)
      yield* getFilesInRaw({
        baseDir,
        nestingPath: newNesting,
        recursive: true,
      })
    }
  }
}
