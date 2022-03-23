import { ExecaChildProcess } from 'execa'

export async function asyncPipeOut(childProcess: ExecaChildProcess) {
  childProcess.stderr?.pipe(process.stderr)
  childProcess.stdout?.pipe(process.stdout)
  await childProcess
}
