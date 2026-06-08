import fs from 'fs'
import path from 'path'
import https from 'https'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const L2D_DIR = path.join(__dirname, '..', 'public', 'l2d-data')
const BASE_URL = 'https://nikke-db-legacy.pages.dev/l2d'

function fetchFile(url) {
  return new Promise((resolve, reject) => {
    https.get(url, res => {
      if (res.statusCode !== 200) {
        res.resume()
        return reject(new Error(`HTTP ${res.statusCode}`))
      }
      const chunks = []
      res.on('data', c => chunks.push(c))
      res.on('end', () => resolve(Buffer.concat(chunks)))
      res.on('error', reject)
    }).on('error', reject)
  })
}

// Parse atlas file → array of PNG filenames referenced
function parseAtlasPngs(atlasContent) {
  const pngs = []
  for (const line of atlasContent.split('\n')) {
    const t = line.trim()
    if (t.endsWith('.png')) pngs.push(t)
  }
  return pngs
}

// Find all atlas files under aim/ and cover/
const atlasFiles = []
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(full)
    else if (entry.name.endsWith('.atlas')) {
      const rel = path.relative(L2D_DIR, full)
      const parts = rel.split(path.sep)
      if (parts.includes('aim') || parts.includes('cover')) {
        atlasFiles.push(full)
      }
    }
  }
}
walk(L2D_DIR)

console.log(`Found ${atlasFiles.length} aim/cover atlas files\n`)

let missing = 0, downloaded = 0, failed = 0

for (const atlasPath of atlasFiles) {
  const atlasDir = path.dirname(atlasPath)
  const content = fs.readFileSync(atlasPath, 'utf-8')
  const pngs = parseAtlasPngs(content)

  for (const png of pngs) {
    const localPath = path.join(atlasDir, png)
    if (fs.existsSync(localPath)) continue

    missing++
    // Construct remote URL: l2d-data relative path → nikke-db URL
    const relDir = path.relative(L2D_DIR, atlasDir).replace(/\\/g, '/')
    const url = `${BASE_URL}/${relDir}/${png}`

    process.stdout.write(`[?] ${relDir}/${png} ... `)
    try {
      const buf = await fetchFile(url)
      fs.writeFileSync(localPath, buf)
      downloaded++
      console.log(`✓ (${buf.length} bytes)`)
    } catch (e) {
      failed++
      console.log(`✗ ${e.message}`)
    }
  }
}

console.log(`\n완료: 누락 ${missing}개 / 다운로드 성공 ${downloaded}개 / 실패 ${failed}개`)
