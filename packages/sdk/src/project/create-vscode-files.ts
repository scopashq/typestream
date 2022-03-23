import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

import { ProjectPaths } from '../paths/project-paths.js'

export async function createVscodeFiles(project: ProjectPaths) {
  const vscodeFolder = join(project.path, '.vscode')
  await mkdir(vscodeFolder, { recursive: true })

  await createVscodeSettings(vscodeFolder)
}

async function createVscodeSettings(vscodeFodler: string) {
  const settings = {
    'typescript.tsdk': 'node_modules/typescript/lib',
    'typescript.enablePromptUseWorkspaceTsdk': true,
    'debug.javascript.autoAttachFilter': 'onlyWithFlag',
    'debug.javascript.terminalOptions': {
      // This makes the debugger step skip library code, so that things like Zod
      // validation errors are shown in a context that makes sense to users
      skipFiles: ['<node_internals>/**', '**/node_modules/**'],
    },
  }

  const settingsPath = join(vscodeFodler, 'settings.json')

  await writeFile(settingsPath, JSON.stringify(settings, null, '  '))
}
