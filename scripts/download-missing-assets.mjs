import fs from 'fs'
import path from 'path'
import https from 'https'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const BASE_LOCAL = path.join(__dirname, '..', 'public', 'l2d-data')
const BASE_REMOTE = 'https://nikke-db-legacy.pages.dev/l2d'
const CONCURRENT = 5

function getMissingPngs() {
  const missing = []
  const dirs = fs.readdirSync(BASE_LOCAL).filter(f => !f.endsWith('.json'))

  for (const dir of dirs) {
    const dirPath = path.join(BASE_LOCAL, dir)
    const scanDir = (localDir, remoteDir) => {
      if (!fs.existsSync(localDir)) return
      const files = fs.readdirSync(localDir).filter(f => !fs.statSync(path.join(localDir, f)).isDirectory())
      for (const atlas of files.filter(f => f.endsWith('.atlas'))) {
        const content = fs.readFileSync(path.join(localDir, atlas), 'utf8')
        const firstLine = content.split('\n')[0].trim()
        if (firstLine.endsWith('.png') && !files.includes(firstLine)) {
          missing.push({
            localPath: path.join(localDir, firstLine),
            remoteUrl: `${BASE_REMOTE}/${remoteDir}/${firstLine}`
          })
        }
      }
    }

    scanDir(dirPath, dir)
    scanDir(path.join(dirPath, 'aim'), `${dir}/aim`)
    scanDir(path.join(dirPath, 'cover'), `${dir}/cover`)
  }

  return missing
}

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest)
    https.get(url, res => {
      if (res.statusCode === 200) {
        res.pipe(file)
        file.on('finish', () => file.close(() => resolve('ok')))
      } else {
        file.close()
        fs.unlink(dest, () => {})
        resolve(`skip:${res.statusCode}`)
      }
    }).on('error', err => {
      file.close()
      fs.unlink(dest, () => {})
      reject(err)
    })
  })
}

async function runWithConcurrency(tasks, limit) {
  let idx = 0
  let done = 0
  const results = []

  async function worker() {
    while (idx < tasks.length) {
      const i = idx++
      const { localPath, remoteUrl } = tasks[i]
      try {
        const result = await downloadFile(remoteUrl, localPath)
        done++
        if (result === 'ok') {
          process.stdout.write(`\r[${done}/${tasks.length}] Downloaded: ${path.basename(localPath)}           `)
        } else {
          console.log(`\n[${done}/${tasks.length}] ${result}: ${remoteUrl}`)
        }
        results.push({ url: remoteUrl, result })
      } catch (e) {
        done++
        console.log(`\n[${done}/${tasks.length}] Error: ${e.message}`)
        results.push({ url: remoteUrl, result: 'error' })
      }
    }
  }

  await Promise.all(Array.from({ length: limit }, worker))
  return results
}

const missing = getMissingPngs()
console.log(`Missing PNGs: ${missing.length}`)

if (missing.length === 0) {
  console.log('All assets are already downloaded!')
  process.exit(0)
}

console.log(`Downloading from: ${BASE_REMOTE}`)
console.log(`Concurrency: ${CONCURRENT}\n`)

const results = await runWithConcurrency(missing, CONCURRENT)

const ok = results.filter(r => r.result === 'ok').length
const skipped = results.filter(r => r.result?.startsWith('skip')).length
const errors = results.filter(r => r.result === 'error').length

console.log(`\n\nDone! Downloaded: ${ok} | Not found on CDN: ${skipped} | Errors: ${errors}`)
