/** number or range string like "7~10" */
export type SkillLevelValue = number | string

/** [skill1, skill2, burst] */
export type SkillLevelArray = [SkillLevelValue, SkillLevelValue, SkillLevelValue]

export interface SkillLevels {
  minimum: SkillLevelArray
  recommended: SkillLevelArray
  maximum: SkillLevelArray | null
}

export interface OverloadInfo {
  priority: string[]
  subOptions?: string[]
}

export interface CubeRef {
  id: string
  priority: number
  mode?: string
}

export interface CollectibleRef {
  id: string
  level: number
}

export interface CharacterRecord {
  name: string
  image?: string
  skillPriority?: string[]
  skillLevels: SkillLevels
  overload?: OverloadInfo
  cubes: CubeRef[]
  collectibles?: CollectibleRef[]
  note?: string
}

export interface CubeMasterRecord {
  name: string
  image: string
}

export interface CollectibleMasterRecord {
  name: string
  image: string
}

export interface CharacterGrowthData {
  characters: Record<string, CharacterRecord>
  cubeMaster: Record<string, CubeMasterRecord>
  collectibleMaster: Record<string, CollectibleMasterRecord>
}
