import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

import { createEnv } from './create-env.js'
import { getPackageJson } from './get-package.js'

const settingsJson = {
  'typescript.tsdk': 'node_modules/typescript/lib',
  'typescript.enablePromptUseWorkspaceTsdk': true,
  'debug.javascript.autoAttachFilter': 'onlyWithFlag',
  'debug.javascript.terminalOptions': {
    skipFiles: ['<node_internals>/**', '**/node_modules/**'],
  },
}

const tsConfig = {
  compilerOptions: {
    rootDir: 'src',
    outDir: 'dist',
    strict: true,
    declaration: true,
    target: 'ES2021',
    lib: ['ES2021'],
    module: 'NodeNext',
    types: ['./src/pipes/generated-types/type-map.js'],
  },
  include: ['src/**/*'],
}

const gitignoreFile = `/node_modules
/builds
/sample-data
/dump-files
/credentials

.DS_Store
`

export async function createProjectFiles({
  projectName,
  projectPath,
}: {
  projectPath: string
  projectName: string
}) {
  const vscodePath = join(projectPath, '.vscode')
  const vscodeSettings = join(vscodePath, 'settings.json')
  await mkdir(vscodePath, { recursive: true })

  const pipesPath = join(projectPath, 'src', 'pipes')
  await mkdir(pipesPath, { recursive: true })

  await writeFile(vscodeSettings, JSON.stringify(settingsJson, undefined, '  '))

  const packageJsonPath = join(projectPath, 'package.json')
  await writeFile(
    packageJsonPath,
    JSON.stringify(getPackageJson(projectName), undefined, '  '),
  )

  const tsConfigPath = join(projectPath, 'tsconfig.json')
  await writeFile(tsConfigPath, JSON.stringify(tsConfig, undefined, '  '))

  const gitignorePath = join(projectPath, '.gitignore')
  await writeFile(gitignorePath, gitignoreFile)

  await createEnv(projectPath)
}
