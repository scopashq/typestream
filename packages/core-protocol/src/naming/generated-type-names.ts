export const GENERATED_TYPE_NAME_PATTERN = /^[A-Z][\dA-Za-z]*$/

export function assertGeneratedTypeName(name: string) {
  if (!GENERATED_TYPE_NAME_PATTERN.test(name))
    throw new Error(
      `"${name}" is not a valid type name! Type names must start with a capital letter and can only include letters and numbers.`,
    )
}
