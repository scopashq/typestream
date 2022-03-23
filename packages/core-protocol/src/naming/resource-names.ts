import { NAME_PATTERN, NAME_PATTERN_EXPLANATION } from './name-pattern.js'

export const RESOURCE_NAME_PATTERN = NAME_PATTERN

export function assertResourceName(name: string) {
  if (!NAME_PATTERN.test(name))
    throw new Error(
      `"${name}" is not a valid resource name!` +
        ` Resource names must ${NAME_PATTERN_EXPLANATION}.`,
    )
}
