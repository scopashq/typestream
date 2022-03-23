import {
  AnyResource,
  DataOfDocument,
  DocumentOfResource,
  PublishMetadataOfResource,
} from '../resources/base-resource.js'

export type PublishArgs<TargetRes extends AnyResource> = {
  resource: TargetRes
  data: DataOfDocument<DocumentOfResource<TargetRes>>
  metadata: PublishMetadataOfResource<TargetRes>
}
