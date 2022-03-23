import { writeFile } from 'node:fs/promises'
import { join } from 'node:path'

import { ProjectPaths } from '../paths/project-paths.js'

export async function createEnv(project: ProjectPaths) {
  const envText = `
# Environment variables that will be used to authenticate different services.

# Google Cloud Platform
# If you want to store them inside of your project you can create a
# \`credentials\` folder which is already included in the .gitignore
GOOGLE_APPLICATION_CREDENTIALS=/path/to/your/service-account-key.json

# AWS
# AWS_ACCESS_KEY_ID=
# AWS_SECRET_ACCESS_KEY=
`

  const envPath = join(project.path, '.env')

  await writeFile(envPath, envText)
}
