import { Command } from '@oclif/core'
import ct from 'chalk-template'

import { loadAllPaths } from '../paths/load-all-paths.js'
import { createPipe } from '../pipe/creation/create-pipe.js'

//TODO: check documentation for every cli command
export default class CreateProject extends Command {
  static description = 'Create the necessary files for a new pipe.'

  static args = [
    {
      name: 'pipeName',
      required: true,
      description: 'Pipe name that will be created!',
    },
  ]

  static strict = true
  async run(): Promise<void> {
    const { args } = await this.parse(CreateProject)

    const paths = await loadAllPaths(args.pipeName)

    console.log(`Creating pipe ${args.pipeName}...`)

    await createPipe(paths)

    console.log(
      ct`\nPipe creation successful.

{inverse.green.bold  Getting started with development: }

  1. Define a resource and put it into your pipe.
  2. Run: {italic.bold tyst watch ${args.pipeName}} to see how your code is working.


  Your pipe file: {underline ${paths.pipe.sourceFileName}}
`,
    )
  }
}
