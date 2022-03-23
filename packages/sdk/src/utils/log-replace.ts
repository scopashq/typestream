import ansiEscapes from 'ansi-escapes'
import cliCursor from 'cli-cursor'

/**
 * Our own replacement for the log-update package because it
 * struggles with outputs that are taller than the current terminal.
 *
 * To deal with this, we simply clear the whole terminal (including history)
 * and then write our own output to the terminal.
 *
 * See:
 * - https://github.com/vadimdemedes/ink/issues/382
 * - https://github.com/sindresorhus/log-update/issues/51
 */
export const logReplace = {
  write(text: string) {
    cliCursor.hide()
    process.stdout.write(ansiEscapes.clearTerminal)
    process.stdout.write(text)
  },
  clear() {
    process.stdout.write(ansiEscapes.clearTerminal)
    cliCursor.show()
  },
}
