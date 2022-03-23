import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

import { ProjectPaths } from '../paths/project-paths.js'
import { createTypeMap } from '../typing/generate-type-map.js'
import { createEnv } from './create-env.js'
import { createGitignore } from './create-gitignore.js'
import { createVscodeFiles } from './create-vscode-files.js'

function getPackageJson(name: string) {
  return {
    name,
    typestreamProject: true,
    type: 'module',
    private: true,
    engines: {
      node: '>=16.0.0',
    },
    dependencies: {
      '@typestream/core': 'latest',
    },
    devDependencies: {
      '@types/node': '16',
      typescript: '^4.7.0-dev.20220320',
    },
  }
}

function getTsConfig() {
  return {
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
}

async function createPackageJson(projectPaths: ProjectPaths) {
  const data = getPackageJson(projectPaths.name)

  const packagePath = join(projectPaths.path, 'package.json')
  await writeFile(packagePath, JSON.stringify(data, undefined, '  '))
}

async function createTsConfig(projectPaths: ProjectPaths) {
  const data = getTsConfig()

  const path = join(projectPaths.path, 'tsconfig.json')
  await writeFile(path, JSON.stringify(data, undefined, '  '))
}

export async function createProjectFiles(projectPaths: ProjectPaths) {
  try {
    await mkdir(projectPaths.path)

    await mkdir(projectPaths.pipesPath, { recursive: true })
  } catch {
    throw new Error(
      `Can not create project folder at path ${projectPaths.path}!`,
    )
  }
  await createPackageJson(projectPaths)
  await createTsConfig(projectPaths)
  await createTypeMap(projectPaths)
  await createVscodeFiles(projectPaths)
  await createGitignore(projectPaths)
  await createEnv(projectPaths)
}
