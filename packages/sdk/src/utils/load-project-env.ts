import { existsSync } from 'node:fs'

import { config } from 'dotenv-safe'

export function loadProjectEnv() {
  // As the cli can also be used without an existing project,
  // first check if the there is an .env.example file existing
  // If there isn't, skip
  if (!existsSync('.env.example')) return

  config()
}
