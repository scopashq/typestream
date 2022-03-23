import { exit } from 'node:process'

import prompt from 'prompts'

import { logReplace } from './log-replace.js'

export async function askYesNo(question: string) {
  logReplace.clear()

  const answer = await prompt(
    {
      type: 'toggle',
      name: 'value',
      message: question,
      initial: true,
      active: 'yes',
      inactive: 'no',
    },
    { onCancel: () => exit() },
  )

  return answer.value as boolean
}

export async function askOptions<T extends string>(
  question: string,
  answers: Record<T, string>,
) {
  logReplace.clear()

  const choices = Object.entries(answers).map(([id, label]) => ({
    value: id,
    title: label as string,
  }))

  const answer = await prompt(
    {
      type: 'select',
      name: 'value',
      message: question,
      choices,
      initial: 0,
    },
    { onCancel: () => exit() },
  )

  return answer.value as T
}
