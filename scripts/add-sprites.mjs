import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')
const SPRITE_DIR = path.join(ROOT, 'public', 'images', 'sprite')
const L2D_JSON = path.join(ROOT, 'src', 'utils', 'json', 'l2d.json')

const l2d = JSON.parse(fs.readFileSync(L2D_JSON, 'utf-8'))

// build lookup: normalized-name → id, and id → id
const normalize = s => s.toLowerCase().replace(/[\s\-_().]/g, '')

const byId = new Map(l2d.map(e => [normalize(e.id), e.id]))
const byName = new Map(l2d.map(e => [normalize(e.name), e.id]))

function resolve(filename) {
  const stem = path.basename(filename, path.extname(filename))
  const key = normalize(stem)

  // 1. exact ID match
  if (byId.has(key)) return byId.get(key)

  // 2. exact name match
  if (byName.has(key)) return byName.get(key)

  // 3. partial: find an entry whose normalized name/id contains the key, or vice versa
  for (const [k, id] of byName) {
    if (k.includes(key) || key.includes(k)) return id
  }
  for (const [k, id] of byId) {
    if (k.includes(key) || key.includes(k)) return id
  }

  return null
}

const IMAGE_EXT = new Set(['.png', '.jpg', '.jpeg', '.webp'])

const files = fs.readdirSync(ROOT).filter(f => {
  const ext = path.extname(f).toLowerCase()
  return IMAGE_EXT.has(ext) && !f.startsWith('.')
})

if (files.length === 0) {
  console.log('루트에 이미지 파일이 없습니다.')
  process.exit(0)
}

let ok = 0
let fail = 0

for (const file of files) {
  const id = resolve(file)
  if (!id) {
    console.warn(`[?] 매칭 실패: ${file}`)
    fail++
    continue
  }
  const dest = path.join(SPRITE_DIR, `si_${id}_00_s.png`)
  fs.copyFileSync(path.join(ROOT, file), dest)
  fs.unlinkSync(path.join(ROOT, file))
  console.log(`[✓] ${file}  →  si_${id}_00_s.png`)
  ok++
}

console.log(`\n완료: ${ok}개 처리, ${fail}개 매칭 실패`)
