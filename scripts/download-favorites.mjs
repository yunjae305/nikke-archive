/**
 * download-favorites.mjs
 * Downloads spine data for all favorite_ entries from nikke-db-legacy into nikke_l2d- repo
 */

import fs from 'fs'
import path from 'path'
import https from 'https'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const BASE_URL = 'https://nikke-db-legacy.pages.dev/l2d/'
const OUTPUT_DIR = path.join(__dirname, '..', '..', 'nikke_l2d-')

const l2d = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'src', 'utils', 'json', 'l2d.json'), 'utf-8'))
const favoriteIds = l2d.filter(e => e.id.startsWith('favorite_')).map(e => e.id)

const fetchBuffer = (url) => new Promise((resolve, reject) => {
  https.get(url, res => {
    if (res.statusCode === 301 || res.statusCode === 302) {
      return fetchBuffer(res.headers.location).then(resolve).catch(reject)
    }
    const chunks = []
    res.on('data', c => chunks.push(c))
    res.on('end', () => {
      const buf = Buffer.concat(chunks)
      if (res.headers['content-type']?.includes('text/html')) {
        reject(new Error(`HTML (not found): ${url}`))
      } else {
        resolve(buf)
      }
    })
  }).on('error', reject)
})

const downloadForId = async (id) => {
  const base = `${BASE_URL}${id}/${id}`
  const outDir = path.join(OUTPUT_DIR, id)

  // Download atlas first
  const atlasUrl = `${base}_00.atlas`
  const atlasData = await fetchBuffer(atlasUrl)
  const atlasText = atlasData.toString('utf-8')

  fs.mkdirSync(outDir, { recursive: true })
  fs.writeFileSync(path.join(outDir, `${id}_00.atlas`), atlasData)
  console.log(`  ✓ ${id}_00.atlas`)

  // Extract PNG filenames from atlas
  const pngFiles = atlasText.match(/^[^\n\r]+\.png/mg) || []
  for (const png of pngFiles) {
    const data = await fetchBuffer(`${BASE_URL}${id}/${png}`)
    fs.writeFileSync(path.join(outDir, png), data)
    console.log(`  ✓ ${png}`)
  }

  // Download skel
  const skelData = await fetchBuffer(`${base}_00.skel`)
  fs.writeFileSync(path.join(outDir, `${id}_00.skel`), skelData)
  console.log(`  ✓ ${id}_00.skel`)
}

for (const id of favoriteIds) {
  console.log(`\n[${id}]`)
  try {
    await downloadForId(id)
  } catch (e) {
    console.log(`  ✗ FAILED: ${e.message}`)
  }
}
console.log('\nDone.')
