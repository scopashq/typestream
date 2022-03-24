import { join } from 'node:path'

import { Command } from '@oclif/core'
import chalk from 'chalk'
import ct from 'chalk-template'
import { execa } from 'execa'

import { getProjectPaths } from '../paths/project-paths.js'
import { createProject } from '../project/create-project.js'
import { asyncPipeOut } from '../utils/async-pipe-out.js'
import { installDependencies } from '../utils/install-dependencies.js'

export const SELECT_TYPESCRIPT_HINT = ct`{yellow {bold.inverse  Hint: } Make sure that you are using the workspace typescript version.
Do it in VSCode: {underline https://code.visualstudio.com/docs/typescript/typescript-compiling#_using-the-workspace-version-of-typescript}}`
export default class CreateProject extends Command {
  static description = 'Scaffold a new TypeStream project.'

  static args = [
    {
      name: 'projectName',
      required: true,
      description: 'Project name that will be created!',
    },
  ]

  static strict = true
  async run(): Promise<void> {
    const { args } = await this.parse(CreateProject)

    const path = join(process.cwd(), args.projectName)

    const projectPaths = await getProjectPaths({
      basePath: path,
      projectName: args.projectName,
    })
    console.log(
      chalk.bold.green.inverse(`\n 1. Creating project ${projectPaths.name} `) +
        ` at: ${projectPaths.path}... `,
    )
    await createProject(projectPaths)

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
      chalk.green.inverse.bold('\n 5. Your project is all set up 🎉 '),
    )
    console.log(
      ct`

{green.bold.inverse  Getting started: }

  1. Go to your project folder: {bold.italic cd ${projectPaths.name}}
  2. Create a new pipe: {bold.italic tst create-pipe <your-pipe-name>}


${SELECT_TYPESCRIPT_HINT}
  `,
    )
  }
}
