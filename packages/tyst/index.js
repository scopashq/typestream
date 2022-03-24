#!/usr/bin/env node

import chalk from 'chalk'

const isNpx = process.env.npm_execpath?.includes('npx') ?? false
const tystCommand = isNpx ? 'npx tyst' : 'tyst'

// prettier-ignore
console.log(`
  ${chalk.yellowBright.bold(`It seems like you're trying to use "${tystCommand}" outside of a TypeStream project!`)}

  You probably want to either:

  - ${chalk.bold('switch to directory')} containing one using ${chalk.greenBright.bold('cd <directory>')}
  - ${chalk.bold('create a new project')} using ${chalk.greenBright.bold('npm init typestream')}

  If you're still stuck, check out ${chalk.blueBright.underline('https://typestream.dev')} for help.
`)

process.exit(1)
