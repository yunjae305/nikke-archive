// Removes company field from all entries with specified company value
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const L2D_JSON = path.join(__dirname, '..', 'src', 'utils', 'json', 'l2d.json')
const [,, company] = process.argv
const l2d = JSON.parse(fs.readFileSync(L2D_JSON, 'utf-8'))
let count = 0
const updated = l2d.map(e => {
  if (e.company === company) { count++; const { company: _, ...rest } = e; return rest }
  return e
})
fs.writeFileSync(L2D_JSON, JSON.stringify(updated, null, 2) + '\n')
console.log(`Cleared company="${company}" from ${count} entries`)
