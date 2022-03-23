import { stat } from 'node:fs/promises'

export async function checkPipeExists(path: string) {
  try {
    const s = await stat(path)
    return s.isFile()
  } catch {
    return false
  }
}
