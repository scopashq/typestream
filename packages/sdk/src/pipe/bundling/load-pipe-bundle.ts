import { parse } from 'node:path'
import { pathToFileURL } from 'node:url'

import { BundleSchema } from '@typestream/core-protocol'

const loadedBundlePaths = new Set<string>()

export async function loadPipeBundle(path: string) {
  // We do this check to ensure that a bundle isn't accidentally loaded twice
  // into the same Node.js thread or process  as that might cause outdated code
  // to be loaded (due to caching) or a memory leak to occur (due to caching).
  if (loadedBundlePaths.has(path))
    throw new Error(
      `The bundle "${path}" has already been loaded!` +
        ` Loading a bundle twice in the same thread or process is not allowed.`,
    )
  loadedBundlePaths.add(path)

  const parsedPath = parse(path)
  if (parsedPath.ext !== '.js')
    throw new Error(
      `Invalid bundle extention "${parsedPath.ext}"! Must be ".js".`,
    )

  const fileUrl = pathToFileURL(path)

  const module = await import(fileUrl.toString())
  const bundle = module.default

  const parsedBundle = await parsePipeBundle(bundle)
  return parsedBundle
}

async function parsePipeBundle(bundle: any) {
  try {
    const validatedBundle = BundleSchema.bundleSchema.parse(bundle)
    return validatedBundle
  } catch (error: any) {
    throw new Error(`Failed to parse bundle with error: ${error}`)
  }
}
