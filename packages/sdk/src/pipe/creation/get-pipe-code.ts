export function getPipeCode() {
  return `
import { definePipe, typed, dump } from '@typestream/core'

/**
 * Get automatically typed data:
 * "const typedData = typed('TypeName', unknownObject)"
 *
 * See values while development:
 * "dump(typedData.fieldImInterestedIn)"
 */
export default definePipe(undefined, async ctx => {
  // Write your code here
})
`.trim()
}
