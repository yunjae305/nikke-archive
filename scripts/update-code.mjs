/**
 * update-code.mjs
 * Usage: node scripts/update-code.mjs <code> <id1> <id2> ...
 * Sets code field on all entries whose id matches any base ID (including _XX variants).
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const L2D_JSON = path.join(__dirname, '..', 'src', 'utils', 'json', 'l2d.json')

const [,, code, ...baseIds] = process.argv

if (!code || baseIds.length === 0) {
  console.error('Usage: node update-code.mjs <code> <id1> <id2> ...')
  process.exit(1)
}

const l2d = JSON.parse(fs.readFileSync(L2D_JSON, 'utf-8'))

const isMatch = (id) =>
  baseIds.some(base => id === base || id.startsWith(base + '_'))

let count = 0
const updated = l2d.map(entry => {
  if (isMatch(entry.id)) {
    count++
    return { ...entry, code }
  }
  return entry
})

fs.writeFileSync(L2D_JSON, JSON.stringify(updated, null, 2) + '\n')
console.log(`Set code="${code}" on ${count} entries`)
updated.filter(e => e.code === code).forEach(e => console.log(`  ${e.id}: ${e.name}`))
