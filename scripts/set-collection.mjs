import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const L2D_JSON = path.join(__dirname, '..', 'src', 'utils', 'json', 'l2d.json')
const l2d = JSON.parse(fs.readFileSync(L2D_JSON, 'utf-8'))
let count = 0
const updated = l2d.map(e => {
  if (e.id.startsWith('favorite_')) { count++; return { ...e, collection: true } }
  return e
})
fs.writeFileSync(L2D_JSON, JSON.stringify(updated, null, 2) + '\n')
console.log(`Set collection=true on ${count} entries`)
