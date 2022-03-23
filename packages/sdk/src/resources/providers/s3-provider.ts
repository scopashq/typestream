import { join } from 'node:path'

import { S3 } from '@aws-sdk/client-s3'
import {
  S3Document,
  S3PublishMetadata,
  S3Resource,
} from '@typestream/core-protocol/resources'

import { readFullStream } from '../../utils/read-full-stream.js'
import { SampleCachingProvider } from '../samples/sample-provider.js'
import { ResourceProvider } from './resource-provider.js'

export class S3ResourceProvider extends ResourceProvider<S3Resource> {
  async *getDocuments() {
    const { region, bucket, pathPrefix } = this.resource.options
    const prefix = join(this.resource.name, pathPrefix)

    const s3 = new S3({ region })

    const options = { Bucket: bucket, Prefix: prefix }
    let { Contents, NextContinuationToken } = await s3.listObjectsV2(options)

    do {
      if (Contents == null) break

      for (const object of Contents) {
        const { Key } = object
        if (!Key) throw new Error(`Received s3 object without a key`)

        // eslint-disable-next-line unicorn/consistent-function-scoping
        const download = async () => {
          const res = await s3.getObject({ Bucket: bucket, Key })
          const data = await readFullStream(res.Body as any)
          return data
        }

        const slicedPath = Key.slice(pathPrefix?.length ?? 0)
        yield new S3Document(this.resource, { slicedPath }, download)
      }

      const res = await s3.listObjectsV2({
        ...options,
        ContinuationToken: NextContinuationToken,
      })
      ;({ Contents, NextContinuationToken } = res)
    } while (NextContinuationToken)
  }

  async *getSamples() {
    const sampleProvider = new SampleCachingProvider({
      resource: this.resource,
      projectPaths: this.projectPaths,
      documentStream: this.getDocuments(),
    })

    for await (const sample of sampleProvider.load()) {
      yield new S3Document(this.resource, sample.meta, sample.read)
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

  async publishDocument(data: Buffer, metadata: S3PublishMetadata) {
    const s3 = new S3({ region: this.resource.options.region })

    const { pathPrefix, bucket } = this.resource.options
    const keyPath = join(pathPrefix, metadata.name)

    await s3.putObject({
      Bucket: bucket,
      Key: keyPath,
      Body: data,
    })
  }
}
