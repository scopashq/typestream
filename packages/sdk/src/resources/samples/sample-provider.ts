import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

import { PromisePool } from '@supercharge/promise-pool'
import {
  DocumentOfResource,
  AnyResource,
} from '@typestream/core-protocol/resources'
import ct from 'chalk-template'
import ora from 'ora'

import { ProjectPaths } from '../../paths/project-paths.js'
import { askYesNo } from '../../utils/ask.js'
import { asyncGeneratorToArray } from '../../utils/async-gen-to-array.js'
import {
  decodeDocumentSampleId,
  getResourceSampleDocumentPaths,
  getResourceSamplePaths,
  ResourceSampleDocumentPaths,
  ResourceSamplePath,
} from '../resource-paths.js'

type SampleProviderOptions<Res extends AnyResource> = {
  resource: Res
  projectPaths: ProjectPaths
  documentStream: AsyncGenerator<DocumentOfResource<Res>>
}

export class SampleCachingProvider<Res extends AnyResource> {
  private readonly path: ResourceSamplePath
  public readonly resource: Res
  private readonly documentStream: AsyncGenerator<DocumentOfResource<Res>>

  constructor({
    documentStream,
    projectPaths,
    resource,
  }: SampleProviderOptions<Res>) {
    this.resource = resource
    this.documentStream = documentStream
    this.path = getResourceSamplePaths(resource.name, projectPaths)
  }

  private async save(doc: DocumentOfResource<Res>) {
    const paths = getResourceSampleDocumentPaths(doc.id, this.path)

    await mkdir(join(paths.dataFile, '..'), { recursive: true })
    await mkdir(join(paths.metaFile, '..'), { recursive: true })

    await writeFile(paths.dataFile, await doc.read())
    await writeFile(paths.metaFile, JSON.stringify(doc.metadata))

    return {
      id: doc.id,
      meta: doc.metadata,
      read: () => readFile(paths.dataFile),
    }
  }

  async *load(): AsyncGenerator<{
    id: string
    meta: any
    read: () => Promise<Buffer>
  }> {
    const allCachedSamples = await this.getAllCachedSamples()

    for (const sample of allCachedSamples) {
      yield await this.loadSample(sample)
    }

    if (allCachedSamples.length === 0) {
      console.log(
        `No samples are cached for resource "${this.resource.name}" [${this.resource.type}].`,
      )
    }
  }

  private async loadSample(path: ResourceSampleDocumentPaths) {
    const read = async () => await readFile(path.dataFile)
    const meta = JSON.parse(
      await readFile(path.metaFile, { encoding: 'utf-8' }),
    )

    return { id: path.id, meta, read }
  }

  protected async getAllCachedSamples() {
    try {
      const files = await readdir(this.path.dataPath)
      const ids = files.filter(x => x !== '.DS_store')

      const res: ResourceSampleDocumentPaths[] = ids.map(x =>
        getResourceSampleDocumentPaths(decodeDocumentSampleId(x), this.path),
      )

      return res
    } catch {
      return []
    }
  }

  public async initSample({
    sampleSize = 100,
    validateCounts = false,
  }): Promise<void> {
    const newConfigStr = JSON.stringify(this.resource.options, undefined, '  ')

    // Tries to load the old config. If none exists, it will fail and the new one will be initialized.

    const oldConfigStr = await tryReadConfig(this.path.configPath)
    if (oldConfigStr && oldConfigStr === newConfigStr) {
      // If validate counts is true (on the first run of a pipe in watch) and the config stayed the same, we want to cache/delete old samples
      if (validateCounts) await this.cacheSamples({ sampleSize })
      return
    }

    if (oldConfigStr) {
      const yes = await askYesNo(
        ct`The config of resource "${this.resource.name}" [${this.resource.type}] changed. Do you want to clear the cache?`,
      )
      if (!yes) {
        console.log(
          'Skipping deletion of old cached files. This could lead to inconsistencies.',
        )
        return
      }

      await setupCleanCache(this.path, newConfigStr)
    }

    await this.cacheSamples({ sampleSize })
  }

  protected async cacheSamples({ sampleSize }: { sampleSize: number }) {
    const allCachedSamples = await this.getAllCachedSamples()
    // If we already have the desired size, there is nothing to do
    if (allCachedSamples.length === sampleSize) return

    const spinner = ora(
      `Preparing samples of resource "${this.resource.name}"...`,
    ).start()
    if (allCachedSamples.length < sampleSize) {
      // If the number of samples is lower than the desired size, new samples are loaded
      const knownIds = new Set<string>(allCachedSamples.map(x => x.id))
      const samples = await asyncGeneratorToArray(this.documentStream, {
        maxCount: sampleSize,
      })
      await PromisePool.for(samples)
        .withConcurrency(10)
        .process(async (doc: DocumentOfResource<Res>) => {
          if (!knownIds.has(doc.id)) {
            const percentage = ((knownIds.size / sampleSize) * 100).toFixed(2)
            knownIds.add(doc.id)
            spinner.text = `Loading samples [${percentage}%] "${doc.id}" of resource "${this.resource.name}"`
            await this.save(doc)
          }
        })
    } else {
      // Otherwise, we have too many samples and need to delete some.
      const excessSamples = allCachedSamples.slice(sampleSize)
      for (const samplePath of excessSamples) {
        spinner.text = `Deleting sample "${samplePath.id}" of resource "${this.resource.name}"`
        await rm(samplePath.dataFile)
        await rm(samplePath.metaFile)
      }
    }

    spinner.succeed('Finished preparing samples.')
  }
}

async function setupCleanCache(
  paths: ResourceSamplePath,
  newConfigStr: string,
) {
  try {
    await rm(paths.resourcePath, { force: true, recursive: true })
  } finally {
    await mkdir(paths.resourcePath, { recursive: true })
    await writeFile(paths.configPath, newConfigStr)
  }
}

async function tryReadConfig(path: string) {
  try {
    const config = await readFile(path, { encoding: 'utf8' })
    return config
  } catch {
    return
  }
}
