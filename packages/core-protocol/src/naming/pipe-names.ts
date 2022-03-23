import { NAME_PATTERN, NAME_PATTERN_EXPLANATION } from './name-pattern.js'

export const PIPE_NAME_PATTERN = NAME_PATTERN

export function assertPipeName(name: string) {
  if (!NAME_PATTERN.test(name))
    throw new Error(
      `"${name}" is not a valid pipe name.` +
        ` Pipes names must ${NAME_PATTERN_EXPLANATION}.`,
    )
}
