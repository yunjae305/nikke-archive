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
      res.on('end', () => resolve({ statusCode: res.statusCode, contentType, buffer: Buffer.concat(chunks) }))
      res.on('error', reject)
    })
    req.on('error', reject)
    req.setTimeout(15000, () => { req.destroy(); reject(new Error('timeout')) })
  })
}

function parseAtlasPngs(content) {
  return content.split('\n').map(l => l.trim()).filter(l => l.endsWith('.png'))
}

// Collect all missing standing PNGs
const missing = []
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      if (entry.name === 'aim' || entry.name === 'cover') continue
      walk(full)
    } else if (entry.name.endsWith('.atlas')) {
      const pngs = parseAtlasPngs(fs.readFileSync(full, 'utf-8'))
      for (const png of pngs) {
        const pngPath = path.join(dir, png)
        if (!fs.existsSync(pngPath)) {
          missing.push({ dir, png, relDir: path.relative(L2D_DIR, dir).replace(/\\/g, '/') })
        }
      }
    }
  }
}
walk(L2D_DIR)

console.log(`Found ${missing.length} missing standing PNGs\n`)

let downloaded = 0, failed = 0

for (const { dir, png, relDir } of missing) {
  const url = `${BASE_URL}/${relDir}/${png}`
  process.stdout.write(`[${relDir}/${png}] ... `)
  try {
    const meta = await fetchWithMeta(url)
    if (meta.contentType.includes('text/html')) {
      failed++
      console.log(`✗ not on nikke-db`)
      continue
    }
    fs.writeFileSync(path.join(dir, png), meta.buffer)
    downloaded++
    console.log(`✓ (${meta.buffer.length} bytes)`)
  } catch (e) {
    failed++
    console.log(`✗ ${e.message}`)
  }
}

console.log(`\n완료: 다운로드 ${downloaded}개 / 실패 ${failed}개`)
