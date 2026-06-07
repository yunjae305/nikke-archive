import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const L2D_DIR = path.join(__dirname, '..', 'public', 'l2d-data')
const BATCH_SIZE = 50 // folders per commit

function run(cmd, cwd = L2D_DIR) {
  console.log(`> ${cmd}`)
  return execSync(cmd, { cwd, stdio: 'inherit' })
}

// Reset to empty state: remove HEAD ref and clear the index
run('git update-ref -d HEAD')
run('git read-tree --empty') // clear staging area so only batch files go into each commit

const allDirs = fs.readdirSync(L2D_DIR).filter(f => {
  const full = path.join(L2D_DIR, f)
  return !f.startsWith('.') && (fs.statSync(full).isDirectory() || f.endsWith('.json'))
})

console.log(`Total items: ${allDirs.length}, batch size: ${BATCH_SIZE}`)

for (let i = 0; i < allDirs.length; i += BATCH_SIZE) {
  const batch = allDirs.slice(i, i + BATCH_SIZE)
  const batchNum = Math.floor(i / BATCH_SIZE) + 1
  const totalBatches = Math.ceil(allDirs.length / BATCH_SIZE)

  console.log(`\n--- Batch ${batchNum}/${totalBatches}: ${batch[0]} ~ ${batch[batch.length - 1]} ---`)

  for (const item of batch) {
    run(`git add "${item}"`)
  }

  run(`git commit -m "assets batch ${batchNum}/${totalBatches}"`)
  run('git push -u origin main')
  console.log(`Batch ${batchNum}/${totalBatches} pushed.`)
}

console.log('\nAll done!')
