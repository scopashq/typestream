import { access } from 'node:fs/promises'
import { exit } from 'node:process'

import chalk from 'chalk'

import { createProjectFiles } from './create-project-files.js'
import { createTutorialPipe, printTutorial } from './create-tutorial-pipe.js'
import { getProjectName } from './get-project-name.js'
import { initGit } from './initialize-git.js'
import { installDependencies } from './install-dependencies.js'
import { logStage } from './log-stage.js'
import { printGettingStarted } from './print-getting-started.js'

async function main() {
  const getStartedGuide = process.argv.includes('--get-started')

  const { projectName, projectPath } = await getProjectName()

  await assertDirEmpty(projectPath)

  logStage(`1. Creating project ${projectName}`)
  console.log(`at: ${projectPath}...`)

  await createProjectFiles({ projectName, projectPath })

  let tutorialPipePath: string
  if (getStartedGuide) tutorialPipePath = await createTutorialPipe(projectPath)

  logStage('2. Installing dependencies...')
  await installDependencies(projectPath)

  logStage('3. Initializing git...')
  await initGit(projectPath)

  if (getStartedGuide) {
    printTutorial(projectName, tutorialPipePath!)
  } else {
    printGettingStarted(projectName)
  }
}

async function assertDirEmpty(path: string) {
  try {
    await access(path)
    console.log(
      chalk.bold.red(
        `\nThe dir (${path}) is not empty. Use another name for your project!\n`,
      ),
    )
    exit(1)
  } catch {
    return true
  }
}

void main()
