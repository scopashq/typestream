import { NAME_PATTERN, NAME_PATTERN_EXPLANATION } from './name-pattern.js'

export const PROJECT_NAME_PATTERN = NAME_PATTERN

export function assertProjectName(name: string) {
  if (!NAME_PATTERN.test(name))
    throw new Error(
      `"${name}" is not a valid project name.` +
        ` Project names must ${NAME_PATTERN_EXPLANATION}.`,
    )
}
