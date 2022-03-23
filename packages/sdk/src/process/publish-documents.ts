import { PublishArgs } from '@typestream/core-protocol'
import { AnyResource } from '@typestream/core-protocol/resources'

import { ProjectPaths } from '../paths/project-paths.js'
import { getResourceProvider } from '../resources/providers/index.js'
import { ResourceProvider } from '../resources/providers/resource-provider.js'

export async function publishDocuments(
  publishResults: PublishArgs<AnyResource>[],
  projectPath: ProjectPaths,
) {
  const providerMap: Record<string, ResourceProvider<any>> = {}

  await Promise.all(
    publishResults.map(publishResult => {
      const provider = (providerMap[publishResult.resource.name] ??=
        getResourceProvider(publishResult.resource, projectPath))

      return provider.publishDocument(
        publishResult.data,
        publishResult.metadata,
      )
    }),
  )
}
