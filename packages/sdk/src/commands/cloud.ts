import { Command } from '@oclif/core'
import chalk from 'chalk'
import ct from 'chalk-template'

const logo = String.raw`
  _____               ___ _                         ___ _             _
 |_   _|  _ _ __  ___/ __| |_ _ _ ___ __ _ _ __    / __| |___ _  _ __| |
   | || || | '_ \/ -_)__ \  _| '_/ -_) _' | '  \  | (__| / _ \ || / _' |
   |_| \_, | .__/\___|___/\__|_| \___\__,_|_|_|_|  \___|_\___/\_,_\__,_|
       |__/|_|                                                          `

export default class Login extends Command {
  static description = chalk.blue('Get started with TypeStream Cloud.')

  static strict = true
  async run(): Promise<void> {
    console.log(
      ct`{bold.blue ${logo}}


  {bold TypeStream Cloud is currently in closed beta.
  It allows you to deploy and execute your pipes in the cloud}:

  • Parallelize computation and process terabytes in minutes
  • Stream your data: subscribe a pipe to a pub/sub topic
  • Push data from your application directly to TypeStream Cloud
  • Manage all your pipes and see their errors in our dashboard

  {bold ▶ Learn more and get early access:
    {underline.blue https://typestream.cloud}}
`,
    )
  }
}
