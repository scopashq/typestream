import { copyFile } from 'node:fs/promises'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

import chalk from 'chalk'

import { typescriptHint } from './print-getting-started.js'

export async function createTutorialPipe(projectPath: string) {
  const getStartedPipeFile = join(
    fileURLToPath(import.meta.url),
    '../../samples/get-started.ts',
  )

  const destinationPath = join(
    projectPath,
    'src',
    'pipes',
    'transform-product.ts',
  )
  await copyFile(getStartedPipeFile, destinationPath)

  return destinationPath
}

export function printTutorial(projectName: string, destinationPath: string) {
  console.log(`
${boldGreenBox('4. Your getting started guide is ready to use 🎉 Have fun!')}


${boldGreenBox('Next Steps:')}

  1. Go into your project directory: cd ${projectName}
  2. Open the tutorial pipe: ${chalk.underline(destinationPath)}
  3. Follow the instructions.


${typescriptHint}`)
}

function boldGreenBox(text: string) {
  return chalk.bold.green.inverse(` ${text} `)
}
