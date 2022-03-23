import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { join, join as joinPath, parse } from 'node:path'

import { FILE_NAME_PATTERN } from '@typestream/core-protocol'
import {
  FileDocument,
  FileResource,
  FilePublishMetadata,
} from '@typestream/core-protocol/resources'

import { getFilesIn } from '../../utils/read-dir.js'
import { ResourceProvider } from './resource-provider.js'

export class FileResourceProvider extends ResourceProvider<FileResource> {
  private sampleCount: number | undefined = undefined

  async *getDocuments() {
    const options = this.resource.options

    for await (const path of getFilesIn(options.basePath, {
      recursive: options.recursive,
    })) {
      const read = async () => {
        return readFile(joinPath(options.basePath, path))
      }
      yield new FileDocument(this.resource, { path }, read)
    }
  }

  async *getSamples(): AsyncGenerator<FileDocument, any, unknown> {
    if (!this.sampleCount)
      throw new Error(
        'Cache samples not initialized. Implement "provider.cacheSamples({count:...})" before "getSamples()".',
      )
    let fetched = 0
    for await (const doc of this.getDocuments()) {
      yield doc
      fetched++
      if (fetched === this.sampleCount) return
    }
  }

  async cacheSamples({ count = 100 }): Promise<void> {
    this.sampleCount = count
  }

  async publishDocument(
    data: Buffer,
    metadata: FilePublishMetadata,
  ): Promise<void> {
    const name = metadata.name
    if (!FILE_NAME_PATTERN.test(name))
      throw new Error(`File name does not match: ${FILE_NAME_PATTERN.source}`)

    const { dir, base } = parse(name)
    const basePath = join(this.resource.options.basePath, dir)

    // create the target directory if it doesn't exist yet
    await mkdir(basePath, { recursive: true })
    return writeFile(join(basePath, base), data)
  }
}
