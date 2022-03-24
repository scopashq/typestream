import * as fs from 'node:fs/promises'
import { join, resolve } from 'node:path'

import { Command } from '@oclif/core'
import chalk from 'chalk'
import ct from 'chalk-template'
import { execa } from 'execa'

import { getProjectPaths } from '../paths/project-paths.js'
import { asyncPipeOut } from '../utils/async-pipe-out.js'
import { installDependencies } from '../utils/install-dependencies.js'
import { SELECT_TYPESCRIPT_HINT } from './create-project.js'

export default class CreateProject extends Command {
  static description = 'Get started with a guided tour.'

  async run(): Promise<void> {
    console.log(
      chalk.bold.green.inverse(`\n Creating getting started guide... `),
    )

    const projectName = 'typestream-getting-started'
    const projectPaths = await getProjectPaths({
      basePath: resolve(projectName),
      projectName,
    })

    console.log(
      chalk.bold.green.inverse(`\n 1. Creating project "${projectName}" `),
    )

    await execa('git', [
      'clone',
      'https://github.com/scopashq/typestream-getting-started.git',
      projectName,
    ])

    const gitDirectoryPath = join(projectName, '.git')
    await fs.rm(gitDirectoryPath, { recursive: true })

    console.log(chalk.bold.green.inverse(`\n 2. Initializing git... `))
    await asyncPipeOut(execa('git', ['init'], { cwd: projectPaths.path }))

    console.log(chalk.bold.green.inverse(`\n 3. Creating initial commit... `))
    await execa('git', ['add', '.'], { cwd: projectPaths.path })
    await asyncPipeOut(
      execa('git', ['commit', '-m', 'Initial commit'], {
        cwd: projectPaths.path,
      }),
    )

    console.log(chalk.bold.green.inverse(`\n 4. Installing dependencies... `))
    await installDependencies(projectPaths.path)

    const samplePipePath = join(projectPaths.pipesPath, 'transform-product.ts')
    console.log(
      ct`
{bold.green.inverse  5. Your getting started guide is ready to use 🎉 Have fun! }


{green.bold.inverse  Next Steps: }

  1. Go into the directory: cd ${projectName}
  2. Open the sample code: {underline ${samplePipePath}}
  3. Follow the instructions.


${SELECT_TYPESCRIPT_HINT}`,
    )
  }
}
