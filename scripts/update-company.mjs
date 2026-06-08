/**
 * update-company.mjs
 * Usage: node scripts/update-company.mjs <company> <id1> <id2> ...
 * Marks all entries whose id starts with any of the given base IDs as the specified company.
 * Variants (base_01, base_02 ...) are included automatically.
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const L2D_JSON = path.join(__dirname, '..', 'src', 'utils', 'json', 'l2d.json')

const [,, company, ...baseIds] = process.argv

if (!company || baseIds.length === 0) {
  console.error('Usage: node update-company.mjs <company> <id1> <id2> ...')
  process.exit(1)
}

const l2d = JSON.parse(fs.readFileSync(L2D_JSON, 'utf-8'))

const isMatch = (id) =>
  baseIds.some(base => id === base || id.startsWith(base + '_'))

let count = 0
const updated = l2d.map(entry => {
  if (isMatch(entry.id)) {
    count++
    return { ...entry, company }
  }
  return entry
})

fs.writeFileSync(L2D_JSON, JSON.stringify(updated, null, 2) + '\n')
console.log(`Set company="${company}" on ${count} entries`)
updated.filter(e => e.company === company).forEach(e => console.log(`  ${e.id}: ${e.name}`))
