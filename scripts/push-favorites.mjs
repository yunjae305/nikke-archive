/**
 * push-favorites.mjs
 * Uses git plumbing to create a commit for favorite spine data without git add.
 * Run from nikke-archive directory.
 */

import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const L2D_REPO = path.join(__dirname, '..', '..', 'nikke_l2d-')

const git = (cmd) => execSync(cmd, { cwd: L2D_REPO, encoding: 'utf-8' }).trim()

// Get all favorite IDs and their files
const favoriteIds = fs.readdirSync(L2D_REPO)
  .filter(d => d.startsWith('favorite_c') && fs.statSync(path.join(L2D_REPO, d)).isDirectory())
  .sort()

console.log(`Found ${favoriteIds.length} favorite directories`)

// Create sub-trees for each favorite directory
const subTrees = []
for (const id of favoriteIds) {
  const dir = path.join(L2D_REPO, id)
  const files = fs.readdirSync(dir).sort()

  // Build mktree input: mode SP type SP hash TAB filename
  const treeInput = files.map(fname => {
    const fpath = path.join(dir, fname)
    const hash = execSync(`git hash-object -w "${fpath}"`, { cwd: L2D_REPO, encoding: 'utf-8' }).trim()
    const mode = fname.endsWith('.skel') || fname.endsWith('.png') ? '100644' : '100644'
    return `${mode} blob ${hash}\t${fname}`
  }).join('\n')

  const treeHash = execSync('git mktree', { cwd: L2D_REPO, input: treeInput, encoding: 'utf-8' }).trim()
  console.log(`  ${id} tree: ${treeHash}`)
  subTrees.push({ id, treeHash })
}

// Get current HEAD tree entries
const headTree = git('git cat-file -p "HEAD^{tree}"')
const existingEntries = headTree.split('\n').filter(Boolean)

// Add new favorite sub-trees (040000 = tree mode), removing any existing favorite_ entries
const newEntries = subTrees.map(({ id, treeHash }) => `040000 tree ${treeHash}\t${id}`)
const filteredExisting = existingEntries.filter(e => !e.match(/\tfavorite_/))
const allEntries = [...filteredExisting, ...newEntries].join('\n')

// Create new root tree
const newTreeHash = execSync('git mktree', { cwd: L2D_REPO, input: allEntries, encoding: 'utf-8' }).trim()
console.log(`New root tree: ${newTreeHash}`)

// Create commit
const headHash = git('git rev-parse HEAD')
const commitHash = git(`git commit-tree ${newTreeHash} -p ${headHash} -m "add favorite item spine data (13 characters)"`)
console.log(`New commit: ${commitHash}`)

// Update main branch
git(`git update-ref refs/heads/main ${commitHash}`)
console.log('Updated refs/heads/main')

// Push
console.log('Pushing...')
execSync('git push origin main', { cwd: L2D_REPO, stdio: 'inherit' })
console.log('Done!')
