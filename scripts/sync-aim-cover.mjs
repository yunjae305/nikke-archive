/**
 * sync-aim-cover.mjs
 *
 * For every c### character that only has fb data locally:
 * 1. Check nikke-db-legacy for aim/cover atlas
 * 2. If found (Content-Type != text/html), download all referenced files
 * 3. Output confirmed fb-only list for l2d.json update
 */

import fs from 'fs'
import path from 'path'
import https from 'https'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const L2D_DIR = path.join(__dirname, '..', 'public', 'l2d-data')
const BASE_URL = 'https://nikke-db-legacy.pages.dev/l2d'

function fetchWithMeta(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, res => {
      const contentType = res.headers['content-type'] || ''
      const chunks = []
      res.on('data', c => chunks.push(c))
      res.on('end', () => resolve({
        statusCode: res.statusCode,
        contentType,
        buffer: Buffer.concat(chunks)
      }))
      res.on('error', reject)
    })
    req.on('error', reject)
    req.setTimeout(15000, () => { req.destroy(); reject(new Error('timeout')) })
  })
}

function parseAtlasPngs(atlasContent) {
  const pngs = []
  for (const line of atlasContent.split('\n')) {
    const t = line.trim()
    if (t.endsWith('.png')) pngs.push(t)
  }
  return pngs
}

// Find all c### directories that have neither aim nor cover
const fbOnlyC = []
for (const entry of fs.readdirSync(L2D_DIR, { withFileTypes: true })) {
  if (!entry.isDirectory()) continue
  if (!/^c\d/.test(entry.name)) continue
  const full = path.join(L2D_DIR, entry.name)
  const hasAim = fs.existsSync(path.join(full, 'aim'))
  const hasCover = fs.existsSync(path.join(full, 'cover'))
  if (!hasAim && !hasCover) fbOnlyC.push(entry.name)
}

console.log(`Checking ${fbOnlyC.length} c### fb-only characters against nikke-db...\n`)

const downloaded = []
const notOnDb = []

for (const id of fbOnlyC) {
  const localDir = path.join(L2D_DIR, id)
  let foundAny = false

  for (const pose of ['aim', 'cover']) {
    const atlasName = `${id}_${pose}_00.atlas`
    const atlasUrl = `${BASE_URL}/${id}/${pose}/${atlasName}`

    process.stdout.write(`[${id}/${pose}] checking... `)

    let meta
    try {
      meta = await fetchWithMeta(atlasUrl)
    } catch (e) {
      console.log(`✗ network error: ${e.message}`)
      continue
    }

    if (meta.contentType.includes('text/html')) {
      console.log(`✗ not found`)
      continue
    }

    // Atlas exists — parse it for PNG references
    const atlasText = meta.buffer.toString('utf-8')
    const pngs = parseAtlasPngs(atlasText)
    console.log(`✓ found (${pngs.length} png refs)`)
    foundAny = true

    // Save the atlas
    const poseDir = path.join(localDir, pose)
    fs.mkdirSync(poseDir, { recursive: true })
    fs.writeFileSync(path.join(poseDir, atlasName), meta.buffer)

    // Download skel
    const skelName = `${id}_${pose}_00.skel`
    const skelUrl = `${BASE_URL}/${id}/${pose}/${skelName}`
    process.stdout.write(`  downloading skel... `)
    try {
      const skelMeta = await fetchWithMeta(skelUrl)
      if (!skelMeta.contentType.includes('text/html')) {
        fs.writeFileSync(path.join(poseDir, skelName), skelMeta.buffer)
        console.log(`✓ (${skelMeta.buffer.length} bytes)`)
      } else {
        console.log(`✗ not found`)
      }
    } catch (e) {
      console.log(`✗ ${e.message}`)
    }

    // Download all referenced PNGs
    for (const png of pngs) {
      const pngUrl = `${BASE_URL}/${id}/${pose}/${png}`
      const pngPath = path.join(poseDir, png)
      if (fs.existsSync(pngPath)) continue
      process.stdout.write(`  downloading ${png}... `)
      try {
        const pngMeta = await fetchWithMeta(pngUrl)
        if (!pngMeta.contentType.includes('text/html')) {
          fs.writeFileSync(pngPath, pngMeta.buffer)
          console.log(`✓ (${pngMeta.buffer.length} bytes)`)
        } else {
          console.log(`✗ not found`)
        }
      } catch (e) {
        console.log(`✗ ${e.message}`)
      }
    }

    downloaded.push(`${id}/${pose}`)
  }

  if (!foundAny) {
    notOnDb.push(id)
  }
}

console.log('\n========================================')
console.log(`Downloaded: ${downloaded.length} pose sets`)
console.log(`  ${downloaded.join(', ')}`)
console.log(`\nConfirmed fb-only (not on nikke-db): ${notOnDb.length}`)
console.log(notOnDb.join(', '))

// Write the fb-only list to a temp file for the next step
fs.writeFileSync(
  path.join(__dirname, 'fb-only-confirmed.json'),
  JSON.stringify(notOnDb, null, 2)
)
console.log('\nSaved fb-only list to scripts/fb-only-confirmed.json')
