import { Hook } from '@oclif/core'
import compareVersions from 'compare-versions'

const MINIMUM_SUPPORTED_VERSION = '16.0.0'

const hook: Hook<'init'> = async function () {
  // compareVersions will return the following possible values
  //    if v1 is greater than v2 -> 1
  //    if v1 is equal to v2     -> 0
  //    if v1 is less than v2    -> -1
  // Thus, if we want process.version to be equal to or higher than the minimum
  // supported one, we'll assert that the comparison is 1 or 0

  const nodeVersion = process.version

  const comparison = compareVersions(nodeVersion, MINIMUM_SUPPORTED_VERSION)
  const isSupported = comparison === 0 || comparison === 1

  if (!isSupported) {
    // Because of the way oclif works, we can't simply throw an error but have
    // to exit the process manually.
    process.stdout.write(
      `OUTDATED NODE VERSION DETECTED:\nnode version ${nodeVersion} is older than mimimum supported version ${MINIMUM_SUPPORTED_VERSION}.\nPlease upgrade node before continuing!\n`,
    )
    process.exit()
  }
}

export default hook
