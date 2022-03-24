import chalk from 'chalk'

const hintBlock = chalk.bold.inverse(' Hint: ')

const link = chalk.underline(
  'https://code.visualstudio.com/docs/typescript/typescript-compiling#_using-the-workspace-version-of-typescript',
)

export const typescriptHint =
  chalk.yellow(`${hintBlock} Make sure that you are using the workspace typescript version.
Do it in VSCode: ${link}`)

export function printGettingStarted(projectName: string) {
  console.log(
    `

${boldBox('Get started with your project:')}

  1. Go to your project folder: ${chalk.bold.italic(`cd ${projectName}`)}
  2. Create a new pipe: ${chalk.bold.italic(
    `npx tyst create-pipe <your-pipe-name>`,
  )}


${typescriptHint}
  `,
  )
}

function boldBox(text: string) {
  return chalk.bold.green.inverse(` ${text} `)
}
