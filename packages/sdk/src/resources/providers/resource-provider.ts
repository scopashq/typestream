import {
  DocumentOfResource,
  AnyResource,
  PublishMetadataOfResource,
  DataOfDocument,
} from '@typestream/core-protocol/resources'

import { ProjectPaths } from '../../paths/project-paths.js'

export abstract class ResourceProvider<Res extends AnyResource> {
  constructor(public resource: Res, protected projectPaths: ProjectPaths) {}

  abstract getDocuments(): AsyncGenerator<DocumentOfResource<Res>>

  abstract getSamples(): AsyncGenerator<DocumentOfResource<Res>>

  abstract cacheSamples(options: {
    count: number
    validateCounts: boolean
  }): Promise<void>

  abstract publishDocument(
    data: DataOfDocument<DocumentOfResource<Res>>,
    metadata: PublishMetadataOfResource<Res>,
  ): Promise<void>
}
