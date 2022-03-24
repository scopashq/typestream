import { join } from 'node:path'
import { exit } from 'node:process'

import chalk from 'chalk'
import prompt from 'prompts'

export async function getProjectName() {
  const { projectName } = await prompt(
    {
      type: 'text',
      name: 'projectName',
      message: 'How do you want to name your TypeStream project?',
      initial: 'typestream-project',
    },
    { onCancel: () => exit(1) },
  )

  const projectPath = join(process.cwd(), projectName)

  if (!/^[\da-z]+(-[\da-z]+)*$/.test(projectName)) {
    console.log(
      chalk.bold.red(
        '\nInvalid project name! TypeStream project names can only consist of lowercase letters, numbers, and dashes.\n',
      ),
    )
    exit(1)
  }

  return { projectName, projectPath }
}
