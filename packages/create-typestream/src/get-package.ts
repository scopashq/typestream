export function getPackageJson(projectName: string) {
  return {
    name: projectName,
    dependencies: {},
    devDependencies: {
      '@types/node': '16',
      typescript: '^4.7.0-dev.20220320',
    },
    type: 'module',
    engines: {
      node: '>=16.0.0',
    },
    typestreamProject: true,
    private: true,
  }
}
