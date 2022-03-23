import { writeFile } from 'node:fs/promises'
import { join } from 'node:path'

import { ProjectPaths } from '../paths/project-paths.js'

export async function createGitignore(project: ProjectPaths) {
  const text = `/node_modules
/sample-data
/builds
/dump-files
/logs

.DS_Store
`

  const settingsPath = join(project.path, '.gitignore')

  await writeFile(settingsPath, text)
}
