/**
 * All namings of resources, pipes and projects must follow this pattern.
 * Making it more restrictive will invalidate all live pipes.
 */
export const NAME_PATTERN = /^[\da-z]+([_-][\da-z]+)*$/
export const NAME_PATTERN_EXPLANATION =
  /* 'names must' + */ 'only consist of lowercase letters, numbers, and dashes'

/**
 * Regex for a valid unix path according to:
 * https://stackoverflow.com/a/537876
 */
export const FILE_NAME_PATTERN = /[^\0]+/
