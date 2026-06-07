import { describe, expect, test } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import LevelingJson from '../src/utils/json/CharacterLevelTable.json'
import type { levelingRecordInterface } from '../src/utils/interfaces/levelingRecord'

const records = LevelingJson.records as levelingRecordInterface[]
const synchroCostPath = resolve('src/components/common/Tools/SynchroCost.vue')
const synchroCostSource = readFileSync(synchroCostPath, 'utf8')

const getRecord = (level: number) => {
  return records.find((record) => record.level === level)
}

describe('SynchroCost', () => {
  test('allows current level 999 and target level 1000', () => {
    expect(synchroCostSource).toContain('max: 999')
    expect(synchroCostSource).toContain('max: 1000')
  })

  test('has resource records for levels 601 through 999', () => {
    expect(getRecord(601)).toEqual({ level: 601, gold: 9454000, character_exp: 83832000, character_exp_2: 16000 })
    expect(getRecord(651)).toEqual({ level: 651, gold: 9927000, character_exp: 89701000, character_exp_2: 17000 })
    expect(getRecord(701)).toEqual({ level: 701, gold: 10423000, character_exp: 95083000, character_exp_2: 18000 })
    expect(getRecord(751)).toEqual({ level: 751, gold: 10944000, character_exp: 100788000, character_exp_2: 19000 })
    expect(getRecord(801)).toEqual({ level: 801, gold: 11491000, character_exp: 105827000, character_exp_2: 20000 })
    expect(getRecord(999)).toEqual({ level: 999, gold: 11491000, character_exp: 105827000, character_exp_2: 20000 })
  })
})
