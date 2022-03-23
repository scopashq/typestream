export function round(number: number, digits: number) {
  const factor = 10 ** digits

  const d = Math.round(number * factor) / factor
  return d
}
