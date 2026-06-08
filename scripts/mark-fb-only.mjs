/**
 * mark-fb-only.mjs
 *
 * Reads l2d.json, checks each entry's id against l2d-data directory.
 * Adds "fbOnly": true for characters with no aim or cover data.
 * Removes fbOnly field for characters that do have aim/cover.
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const L2D_DIR = path.join(__dirname, '..', 'public', 'l2d-data')
const L2D_JSON = path.join(__dirname, '..', 'src', 'utils', 'json', 'l2d.json')

const l2d = JSON.parse(fs.readFileSync(L2D_JSON, 'utf-8'))

let marked = 0
let unmarked = 0
let noDir = 0

const updated = l2d.map(entry => {
  const charDir = path.join(L2D_DIR, entry.id)

  if (!fs.existsSync(charDir)) {
    noDir++
    return entry
  }

  const aimDir = path.join(charDir, 'aim')
  const coverDir = path.join(charDir, 'cover')
  const hasAim = fs.existsSync(aimDir) && fs.readdirSync(aimDir).some(f => f.endsWith('.atlas'))
  const hasCover = fs.existsSync(coverDir) && fs.readdirSync(coverDir).some(f => f.endsWith('.atlas'))

  if (!hasAim && !hasCover) {
    marked++
    return { ...entry, fbOnly: true }
  } else {
    // Remove fbOnly if it was previously set but now has aim/cover
    if (entry.fbOnly) {
      unmarked++
      const { fbOnly, ...rest } = entry
      return rest
    }
    return entry
  }
})

fs.writeFileSync(L2D_JSON, JSON.stringify(updated, null, 2) + '\n')

console.log(`Updated l2d.json:`)
console.log(`  Added fbOnly: true  → ${marked} entries`)
console.log(`  Removed fbOnly      → ${unmarked} entries`)
console.log(`  No directory found  → ${noDir} entries`)

// Show a sample
const samples = updated.filter(e => e.fbOnly).slice(0, 5)
console.log(`\nSample fb-only entries:`)
samples.forEach(e => console.log(`  ${e.id}: ${e.name}`))
