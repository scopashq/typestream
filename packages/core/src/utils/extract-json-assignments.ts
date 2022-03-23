import { parse as parseJs } from 'acorn'
import { simple as walkTree } from 'acorn-walk'
import { HTMLElement } from 'node-html-parser'

/**
 * Takes in a string of JavaScript, tries to find all the instances where a
 * piece of JSON (for example SSR state) is assigned to a variable or property,
 * and returns a map of the parsed results keyed by the name of the variable.
 */
export function extractJsonAssignments(script: string) {
  const map: Record<string, any> = {}
  const tree = parseJs(script, { ecmaVersion: 'latest' })

  const processNode = (keyNode: any, valueNode: any) => {
    const key = getNodeString(script, keyNode)

    // `JSON.parse` calls
    // (e.g. `window.state = JSON.parse('{"items":[1,2,3]}')`)
    if (
      valueNode.type === 'CallExpression' &&
      getNodeString(script, valueNode.callee) === 'JSON.parse'
    ) {
      const jsonString = valueNode.arguments[0].value
      map[key] = JSON.parse(jsonString)
    }

    // Directly inserted JSON
    // (e.g. `window.state = {"items":[1,2,3]}`)
    else if (
      valueNode.type === 'ObjectExpression' ||
      valueNode.type === 'ArrayExpression'
    ) {
      const jsonString = getNodeString(script, valueNode)

      try {
        const data = JSON.parse(jsonString)

        // Ignore `{}` and `[]`
        if (Object.keys(data).length === 0) return

        map[key] = data
      } catch {
        // Values that can't be parsed are ignored
      }
    }
  }

  walkTree(tree, {
    VariableDeclarator: (node: any) => processNode(node.id, node.init),
    AssignmentExpression: (node: any) => processNode(node.left, node.right),
  })

  return map
}

export function extractJsonAssignmentsFromDocument(document: HTMLElement) {
  const scripts = document.querySelectorAll(
    'script:not([src]):not([type="application/json"])',
  )

  const map: Record<string, any> = {}
  for (const script of scripts) {
    try {
      const assignments = extractJsonAssignments(script.text)
      Object.assign(map, assignments)
    } catch {
      // Scripts that can't be parsed are skipped
    }
  }

  return map
}

export function extractJsonScriptsFromDocument(document: HTMLElement) {
  const scripts = document.querySelectorAll(
    'script:not([src])', //[type="application/json"]
  )
  const jsonScripts = scripts.filter(x =>
    x.attrs.type?.toLowerCase().includes('json'),
  )

  const res: { json: any; attributes: Record<string, string> }[] = []
  for (const script of jsonScripts) {
    const attributes = script.attrs
    try {
      const json = JSON.parse(script.text)
      res.push({
        attributes,
        json,
      })
    } catch {
      // We just want to skip unparsable entries
    }
  }

  return res
}

function getNodeString(script: string, node: acorn.Node) {
  return script.slice(node.start, node.end)
}
