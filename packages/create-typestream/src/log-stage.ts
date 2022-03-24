import chalk from 'chalk'

export function logStage(text: string) {
  console.log('\n' + chalk.green.inverse.bold(` ${text} `))
}
