import { watch } from 'chokidar'
import { Observable } from 'rxjs'

interface FileWatchEvent {
  type: 'add' | 'addDir' | 'change' | 'unlink' | 'unlinkDir'
  path: string
}

export function observeDirectory(path: string) {
  return new Observable<FileWatchEvent>(subscriber => {
    const watcher = watch(path, {
      ignoreInitial: true,
      ignored: ['**/generated-types/**'],
    })

    watcher.on('all', (type, path) => {
      subscriber.next({ type, path })
    })

    watcher.on('error', error => subscriber.error(error))

    return async () => {
      await watcher.close()
    }
  })
}
