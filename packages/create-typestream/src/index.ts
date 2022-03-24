import chalk from 'chalk'

import { createProjectFiles } from './create-project-files.js'
import { createTutorialPipe } from './create-tutorial-pipe.js'
import { getProjectName } from './get-project-name.js'
import { initGit } from './initialize-git.js'
import { installDependencies } from './install-dependencies.js'
import { printGettingStarted } from './print-getting-started.js'

async function main() {
  const getStartedGuide = process.argv.includes('--get-started')

  const { projectName, projectPath } = await getProjectName()

  logStage(`1. Creating project ${projectName}`)
  console.log(`at: ${projectPath}...`)

  await createProjectFiles({ projectName, projectPath })

  logStage('2. Initializing git...')
  await initGit(projectPath)

  logStage('3. Installing dependencies...')
  await installDependencies(projectPath)

  if (getStartedGuide) {
    await createTutorialPipe(projectName, projectPath)
  } else {
    logStage('4. Your project is all set up! 🎉')

    printGettingStarted(projectName)
  }
}

function logStage(text: string) {
  console.log('\n' + chalk.green.inverse.bold(` ${text} `))
}

void main()
