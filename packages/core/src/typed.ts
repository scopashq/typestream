/**
 * `typed()` is a no-op function which creates types based on the input.
 * @param name the name of the generated types
 * @param value the input from which the types are inferred
 * @returns the types for the input
 */
export function typed<N extends string>(
  name: N,
  value: any,
): N extends keyof TypeStream.Types ? TypeStream.Types[N] : unknown {
  globalThis.typestreamCaptureTypeSample?.(name, value)

  return value
}

declare global {
  namespace TypeStream {
    // Will be extended by the auto generated type map
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    export interface Types {}
  }
}
