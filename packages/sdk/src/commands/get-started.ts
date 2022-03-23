import * as fs from 'node:fs/promises'
import { join } from 'node:path'

import { Command } from '@oclif/core'
import chalk from 'chalk'
import { execa } from 'execa'

import { getProjectPaths } from '../paths/project-paths.js'
import { asyncPipeOut } from '../utils/async-pipe-out.js'
import { installDependencies } from '../utils/install-dependencies.js'

export default class CreateProject extends Command {
  static description = 'Get started with a guided tour.'

  async run(): Promise<void> {
    console.log(
      chalk.bold.green.inverse(`\n Creating getting started guide... `),
    )

    const projectName = 'getting-started-guide'

    console.log(
      chalk.bold.green.inverse(`\n 1. Creating project ${projectName} `),
    )

    await execa('git', [
      'clone',
      'https://github.com/scopashq/getting-started-guide.git',
    ])
    await fs.rm(`./${projectName}/.git`, {
      recursive: true,
    })

    const path = join(process.cwd(), projectName)
    const projectPaths = await getProjectPaths({
      basePath: path,
      projectName,
    })

    console.log(chalk.bold.green.inverse(`\n 2. Initializing git... `))
    await asyncPipeOut(execa('git', ['init'], { cwd: projectPaths.path }))

    console.log(chalk.bold.green.inverse(`\n 3. Creating initial commit... `))
    await execa('git', ['add', '*'], { cwd: projectPaths.path })
    await asyncPipeOut(
      execa('git', ['commit', '-am', 'Initial commit'], {
        cwd: projectPaths.path,
      }),
    )

    console.log(chalk.bold.green.inverse(`\n 4. Installing dependencies... `))
    await installDependencies(projectPaths.path)

    console.log(
      chalk.bold.green.inverse(
        `\n 5. Your getting started guide is ready to use 🎉 Have fun! `,
      ),
    )
  }
}
