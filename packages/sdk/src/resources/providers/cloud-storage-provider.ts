import { join } from 'node:path'

import { Bucket, File, GetFilesOptions, Storage } from '@google-cloud/storage'
import {
  CloudStorageDocument,
  CloudStorageResource,
  CloudStoragePublishMetadata,
} from '@typestream/core-protocol/resources'

import { SampleCachingProvider } from '../samples/sample-provider.js'
import { ResourceProvider } from './resource-provider.js'

export class CloudStorageResourceProvider extends ResourceProvider<CloudStorageResource> {
  async *getDocuments() {
    const {
      bucket: bucketName,
      cloudStorageProject,
      pathPrefix,
    } = this.resource.options
    const storage = new Storage({ projectId: cloudStorageProject })
    const bucket = new Bucket(storage, bucketName)

    let nextQuery: GetFilesOptions = {
      prefix: pathPrefix,
      autoPaginate: false,
    }

    let files: File[]

    while (nextQuery) {
      ;[files, nextQuery] = await bucket.getFiles(nextQuery)
      for (const file of files) {
        const download = async () => {
          const [data] = await file.download()
          return data
        }

        const path = file.name.slice(pathPrefix?.length ?? 0)
        yield new CloudStorageDocument(
          this.resource,
          { ...file.metadata, slicedPath: path },
          download,
        )
      }
    }
  }

  async *getSamples() {
    const sampleProvider = new SampleCachingProvider({
      resource: this.resource,
      projectPaths: this.projectPaths,
      documentStream: this.getDocuments(),
    })

    for await (const sample of sampleProvider.load()) {
      yield new CloudStorageDocument(this.resource, sample.meta, sample.read)
    }
  }

  async cacheSamples({ count = 200, validateCounts = false }) {
    const sampleProvider = new SampleCachingProvider({
      resource: this.resource,
      projectPaths: this.projectPaths,
      documentStream: this.getDocuments(),
    })
    await sampleProvider.initSample({ sampleSize: count, validateCounts })
  }

  publishDocument(data: Buffer, metadata: CloudStoragePublishMetadata) {
    const storage = new Storage()
    const bucket = storage.bucket(this.resource.options.bucket)

    const pathPrefix = this.resource.options.pathPrefix
    const path = join(pathPrefix, metadata.name)

    return bucket
      .file(path)
      .save(data, { metadata: metadata.metadata, resumable: false })
  }
}
