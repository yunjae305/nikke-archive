<template>
  <div class="body">
    <n-back-top :visibility-height="0" style="display: none" />
    <div class="page-title">
      <span class="title-main">니케 육성 가이드</span>
      <span class="title-sub">캐릭터 이름을 검색해 육성 정보를 확인하세요</span>
    </div>
    <div class="searchBox">
      <n-input
        v-model:value="nameFilter"
        placeholder="캐릭터 이름 검색"
        :clearable="true"
        :input-props="{
          onCompositionstart: onCompositionStart,
          onCompositionupdate: onCompositionUpdate,
          onCompositionend: onCompositionEnd,
          onInput: syncInput,
          onFocus: (e: FocusEvent) => (e.target as HTMLInputElement).select()
        }"
      />
      <div class="searchResults" v-show="searchText.trim() !== ''">
        <n-scrollbar class="resultScroll">
          <n-list hoverable :show-divider="false">
            <template v-for="character in searchResults" :key="character.id">
              <n-list-item
                :class="{ 'item-selected': selectedCharacter?.id === character.id }"
                @click="toggleCharacter(character)"
              >
                <template #prefix>
                  <img
                    :src="getSiIcon(character.id)"
                    class="siImg"
                    loading="lazy"
                    :onerror="`this.onerror=null; this.src='${fallbackSiIcon()}'`"
                  />
                </template>
                <n-h5>{{ character.name }}</n-h5>
              </n-list-item>
            </template>

            <n-list-item v-show="searchResults.length === 0">
              <n-h5>검색 결과 없음</n-h5>
            </n-list-item>
          </n-list>
        </n-scrollbar>
      </div>
    </div>
  </div>

  <Teleport to="body">
    <div v-if="selectedCharacter" class="modal-backdrop" @click.self="selectedCharacter = null">
      <div class="modal-panel">
        <button class="modal-close" @click="selectedCharacter = null">✕</button>
        <n-scrollbar class="modal-scroll">
          <div class="modal-body">
            <div class="modal-header">
              <img
                :src="getSiIcon(selectedCharacter!.id)"
                class="modal-char-img"
                loading="lazy"
                :onerror="`this.onerror=null; this.src='${fallbackSiIcon()}'`"
              />
              <div class="modal-char-name-row">
                <span class="modal-char-name">{{ selectedCharacter!.name }}</span>
                <img
                  v-if="selectedCharacter!.code"
                  :src="`/assets/codes/${selectedCharacter!.code}.png`"
                  class="modal-code-icon"
                  :alt="selectedCharacter!.code"
                />
              </div>
            </div>

            <template v-if="selectedGrowthData">
              <div class="growth-content">

                <div v-if="selectedGrowthData.skillPriority" class="growth-section">
                  <span class="section-label">스킬 우선순위</span>
                  <div class="skill-chain">
                    <template
                      v-for="(skill, idx) in selectedGrowthData.skillPriority"
                      :key="idx"
                    >
                      <n-tag :bordered="false" type="success" size="small">{{ skill }}</n-tag>
                      <span
                        v-if="idx < selectedGrowthData.skillPriority!.length - 1"
                        class="arrow"
                      >&gt;</span>
                    </template>
                  </div>
                </div>

                <div class="growth-section">
                  <span class="section-label">스킬 레벨 (스킬1 / 스킬2 / 버스트)</span>
                  <div class="skill-levels">
                    <div
                      v-for="tier in skillLevelRows"
                      :key="tier.label"
                      class="level-row"
                      :class="{ 'level-max': tier.label === '권장' }"
                    >
                      <span class="level-label">{{ tier.label }}</span>
                      <strong v-if="tier.values !== null" class="level-value">
                        {{ tier.values[0] }} / {{ tier.values[1] }} / {{ tier.values[2] }}
                      </strong>
                      <strong v-else class="level-value level-unknown">—</strong>
                    </div>
                  </div>
                </div>

                <div v-if="selectedGrowthData.overload" class="growth-section">
                  <span class="section-label">오버로드</span>
                  <div class="overload-block">
                    <div class="overload-row">
                      <span class="sub-label">우선순위</span>
                      <div class="tag-list">
                        <n-tag
                          v-for="(opt, i) in selectedGrowthData.overload.priority"
                          :key="i"
                          :bordered="false"
                          type="error"
                          size="small"
                        >{{ opt }}</n-tag>
                      </div>
                    </div>
                    <div class="overload-row">
                      <span class="sub-label">서브 옵션</span>
                      <div class="tag-list">
                        <n-tag
                          v-for="(opt, i) in selectedGrowthData.overload.subOptions"
                          :key="i"
                          :bordered="false"
                          type="default"
                          size="small"
                        >{{ opt }}</n-tag>
                      </div>
                    </div>
                  </div>
                </div>

                <div v-if="resolvedCubes.length" class="growth-section">
                  <span class="section-label">추천 큐브</span>
                  <div class="item-list">
                    <div
                      v-for="cube in resolvedCubes"
                      :key="cube.id"
                      class="item-entry cube-entry"
                    >
                      <img
                        v-if="cube.image"
                        :src="cube.image"
                        class="cube-img"
                        loading="lazy"
                        :onerror="`this.style.display='none'`"
                      />
                      <n-tag :bordered="false" type="warning" size="small">
                        {{ cube.name }}<template v-if="cube.mode"> ({{ cube.mode }})</template>
                      </n-tag>
                    </div>
                  </div>
                </div>

                <div v-if="selectedGrowthData.collectibles !== undefined" class="growth-section">
                  <span class="section-label">소장품</span>
                  <div class="item-list">
                    <template v-if="resolvedCollectibles.length">
                      <div
                        v-for="item in resolvedCollectibles"
                        :key="item.id"
                        class="item-entry"
                      >
                        <n-tag :bordered="false" type="info" size="small">
                          {{ item.name }} Lv.{{ item.level }}
                        </n-tag>
                      </div>
                    </template>
                    <strong v-else class="level-value level-unknown">X</strong>
                  </div>
                </div>

                <div v-if="selectedGrowthData.note" class="growth-section">
                  <span class="section-label">메모</span>
                  <div class="note-block">
                    <span
                      v-for="(line, i) in selectedGrowthData.note.split('\n')"
                      :key="i"
                      class="note-line"
                      :class="{ 'note-heading': line.startsWith('#') }"
                    >{{ line.replace(/^#+\s*/, '') }}</span>
                  </div>
                </div>

                <div class="growth-actions">
                  <n-button
                    size="small"
                    type="primary"
                    round
                    @click="openCharacter(selectedCharacter!)"
                  >
                    캐릭터 보기 →
                  </n-button>
                </div>

              </div>
            </template>

            <template v-else>
              <div class="growth-content no-data">
                <span class="no-data-text">육성 정보가 없습니다.</span>
                <n-button
                  size="small"
                  type="primary"
                  round
                  @click="openCharacter(selectedCharacter!)"
                >
                  캐릭터 보기 →
                </n-button>
              </div>
            </template>
          </div>
        </n-scrollbar>
      </div>
    </div>
  </Teleport>
</template>

<script lang="ts" setup>
import { computed, onMounted, onBeforeMount, onUnmounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useMarket } from '@/stores/market'
import bgi from '@/assets/STAR ANIS.png'
import l2d from '@/utils/json/l2d.json'
import growthJson from '@/utils/json/characterGrowthData.json'
import type { live2d_interface } from '@/utils/interfaces/live2d'
import type { CharacterGrowthData } from '@/utils/interfaces/characterGrowth'

const market = useMarket()
const router = useRouter()
const nameFilter = ref('')  // n-input v-model (compositionend 이후 업데이트)
const searchText = ref('')  // 실제 검색어
const spriteBasePath = `${import.meta.env.BASE_URL}images/sprite/`
const selectedCharacter = ref<live2d_interface | null>(null)

let composingRef = false

// compositionend / clear 버튼 등 공식 업데이트 시 즉시 동기화
watch(nameFilter, (val) => { searchText.value = val })

const growthData = growthJson as unknown as CharacterGrowthData

const characterList = computed(() => {
  const baseArray: live2d_interface[] = l2d as unknown as live2d_interface[]
  return baseArray
    .slice()
    .filter((c: live2d_interface) => !c.name.toUpperCase().startsWith('HIDDEN'))
    .sort((a: live2d_interface, b: live2d_interface) => a.name.trim().localeCompare(b.name.trim()))
})

const matchesSearch = (characterName: string, filter: string): boolean => {
  const lFilter = filter.toLowerCase().trim()
  if (!lFilter) return false
  const filterTokens = lFilter.split(/\s+/)
  const nameTokens = characterName.toLowerCase().split(/[\s:]+/).filter(Boolean)

  if (filterTokens.length === 1) {
    const fw = filterTokens[0]
    const colonIdx = characterName.indexOf(':')
    const baseSegment = colonIdx >= 0 ? characterName.slice(0, colonIdx) : characterName
    const baseTokens = baseSegment.toLowerCase().split(/\s+/).filter(Boolean)
    if (baseTokens.includes(fw)) return true
    let lastIdx = nameTokens.length - 1
    while (lastIdx > 0 && /^\(.*\)$/.test(nameTokens[lastIdx])) lastIdx--
    return nameTokens[lastIdx] === fw
  }

  if (nameTokens[0] !== filterTokens[0]) return false
  let nameIdx = 1
  for (let fi = 1; fi < filterTokens.length; fi++) {
    const fw = filterTokens[fi]
    let found = false
    while (nameIdx < nameTokens.length) {
      const nw = nameTokens[nameIdx++]
      if (nw === fw) { found = true; break }
    }
    if (!found) return false
  }
  return true
}

const getMatchPriority = (characterName: string, filter: string): number => {
  const nameTokens = characterName.toLowerCase().split(/[\s:]+/).filter(Boolean)
  const firstFilterToken = filter.toLowerCase().trim().split(/\s+/)[0]
  return nameTokens[0] === firstFilterToken ? 0 : 1
}

const searchResults = computed(() => {
  const filter = searchText.value.trim()
  if (filter === '') return []
  const seen = new Set<string>()
  return characterList.value
    .filter((c: live2d_interface) => matchesSearch(c.name, filter) && growthData.characters[c.name] !== undefined)
    .sort((a: live2d_interface, b: live2d_interface) => getMatchPriority(a.name, filter) - getMatchPriority(b.name, filter))
    .filter((c: live2d_interface) => { if (seen.has(c.name)) return false; seen.add(c.name); return true })
    .slice(0, 8)
})

const selectedGrowthData = computed(() => {
  if (!selectedCharacter.value) return null
  return growthData.characters[selectedCharacter.value.name] ?? null
})

const skillLevelRows = computed(() => {
  const levels = selectedGrowthData.value?.skillLevels
  if (!levels) return []
  return [
    { label: '최소', values: levels.minimum },
    { label: '권장', values: levels.recommended },
    { label: '최대', values: levels.maximum }
  ]
})

const resolvedCubes = computed(() => {
  if (!selectedGrowthData.value) return []
  return selectedGrowthData.value.cubes.map(cube => ({
    ...cube,
    ...(growthData.cubeMaster[cube.id] ?? { name: cube.id, image: '' })
  }))
})

const resolvedCollectibles = computed(() => {
  if (!selectedGrowthData.value) return []
  return (selectedGrowthData.value.collectibles ?? []).map(item => ({
    ...item,
    ...(growthData.collectibleMaster[item.id] ?? { name: item.id, image: '' })
  }))
})

const handleEsc = (e: KeyboardEvent) => {
  if (e.key === 'Escape') selectedCharacter.value = null
}

onBeforeMount(() => {
  market.load.beginLoad()
  document.body.classList.add('poli-bg')
})

onMounted(() => {
  setTimeout(() => {
    market.load.endLoad();
    (document.querySelector('.n-back-top') as HTMLElement).click()
  }, 10)
  document.body.style.backgroundImage =
    'linear-gradient(rgba(33, 37, 41, 0.28), rgba(33, 37, 41, 0.28)), url("' + bgi + '")'
  window.addEventListener('keydown', handleEsc)
})

onUnmounted(() => {
  document.body.classList.remove('poli-bg')
  document.body.style.backgroundImage = 'none'
  window.removeEventListener('keydown', handleEsc)
})

const getSiIcon = (id: string) => `${spriteBasePath}si_${id}_00_s.png`
const fallbackSiIcon = () => getSiIcon('c9999')

const onCompositionStart = () => { composingRef = true }

// 조합 중 매 키 입력마다 e.target.value = 커밋된 텍스트 + 현재 조합 중인 문자
// 예: "베" 커밋 후 "ㅇ" 조합 중 → value = "베ㅇ" → "베스티" 매칭 안 됨
const onCompositionUpdate = (e: CompositionEvent) => {
  searchText.value = (e.target as HTMLInputElement).value
}

const onCompositionEnd = () => { composingRef = false }

// 영어/숫자 등 비 IME 입력 처리
const syncInput = (e: InputEvent) => {
  if (!composingRef) searchText.value = (e.target as HTMLInputElement).value
}

const toggleCharacter = (character: live2d_interface) => {
  selectedCharacter.value = selectedCharacter.value?.id === character.id ? null : character
}

const openCharacter = (character: live2d_interface) => {
  market.live2d.current_pose = 'fb'
  market.live2d.change_current_spine(character)
  router.push({ name: 'visualiser' })
}


</script>

<style lang="less" scoped>
@import '@/utils/style/global_variables.less';

.body {
  padding-top: 8vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  min-height: 220px;
}

.page-title {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  text-align: center;

  .title-main {
    font-size: 22px;
    font-weight: 700;
    color: white;
    letter-spacing: 0.5px;
    text-shadow: 0 2px 12px rgba(0, 0, 0, 0.6);
  }

  .title-sub {
    font-size: 12px;
    color: @grey-color;
    letter-spacing: 0.3px;
  }
}

.searchBox {
  width: min(440px, calc(100vw - 32px));
  position: relative;
  z-index: 5;
}

.searchBox :deep(.n-input) {
  background-color: @main-dark-theme-transparent;
  border: 1px solid @naive-green;
  border-radius: 8px;
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.35);
}

.searchBox :deep(.n-input__input-el) {
  color: white;
}

.searchResults {
  margin-top: 8px;
  background-color: @main-dark-theme-transparent;
  border: 1px solid @naive-green;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.35);
}

.resultScroll {
  max-height: 560px;
}

.n-list {
  background-color: transparent;
}

.n-list-item {
  padding: 8px 12px;
  border-top: #18181c 1px solid;
  border-bottom: #18181c 1px solid;

  &:hover {
    cursor: pointer;
    border-top: @naive-green 1px solid;
    border-bottom: @naive-green 1px solid;
  }
}

.item-selected {
  border-top: @naive-green 1px solid !important;
  border-bottom: @naive-green 1px solid !important;
}

.growth-panel {
  cursor: default;
  padding: 12px 16px !important;
  background-color: @alt-dark-theme;

  &:hover {
    border-top: #18181c 1px solid !important;
    border-bottom: #18181c 1px solid !important;
    cursor: default;
  }
}

.growth-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
}

.growth-section {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.section-label {
  font-size: 10px;
  color: @grey-color;
  text-transform: uppercase;
  letter-spacing: 0.6px;
}

.skill-chain {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
}

.arrow {
  color: @grey-color;
  font-size: 11px;
}

.skill-levels {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.level-row {
  display: flex;
  align-items: center;
  gap: 10px;

  .level-label {
    font-size: 11px;
    color: @grey-color;
    width: 28px;
    flex-shrink: 0;
  }

  .level-value {
    font-size: 13px;
    color: white;
    font-family: monospace;
    letter-spacing: 0.5px;
  }

  &.level-max .level-value {
    color: @gold;
  }
}

.overload-block {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.overload-row {
  display: flex;
  align-items: flex-start;
  gap: 8px;

  .sub-label {
    font-size: 10px;
    color: @grey-color;
    padding-top: 2px;
    white-space: nowrap;
    width: 44px;
    flex-shrink: 0;
  }
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.item-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.item-entry {
  display: flex;
  align-items: center;
  gap: 4px;

  .item-img {
    width: 40px;
    height: 40px;
    object-fit: contain;
  }
}

.note-block {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.note-line {
  font-size: 12px;
  color: @grey-color;
  line-height: 1.5;
  display: block;

  &.note-heading {
    font-size: 13px;
    color: white;
    font-weight: 600;
    margin-top: 2px;
  }
}

.growth-actions {
  margin-top: 2px;
  display: flex;
  justify-content: flex-end;
}

.no-data {
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
}

.no-data-text {
  font-size: 12px;
  color: @grey-color;
}

.siImg {
  height: 52px;
  width: 52px;
  object-fit: contain;
}

.modal-backdrop {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
}

.modal-panel {
  position: relative;
  width: min(620px, calc(100vw - 32px));
  background-color: @alt-dark-theme;
  border: 1px solid @naive-green;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6);
  overflow: hidden;
}

.modal-header {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 16px;
  padding-bottom: 14px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.modal-char-img {
  width: 80px;
  height: 80px;
  object-fit: contain;
  border-radius: 8px;
  background-color: rgba(255, 255, 255, 0.05);
  flex-shrink: 0;
}

.modal-char-portrait {
  width: 90px;
  height: 90px;
  object-fit: cover;
  object-position: top center;
  border-radius: 8px;
  background-color: rgba(255, 255, 255, 0.05);
  flex-shrink: 0;
}

.modal-char-name-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.modal-char-name {
  font-size: 20px;
  font-weight: 600;
  color: white;
  word-break: keep-all;
}

.modal-code-icon {
  width: 28px;
  height: 28px;
  object-fit: contain;
  flex-shrink: 0;
}

.cube-entry {
  display: flex;
  align-items: center;
  gap: 6px;
}

.cube-img {
  width: 40px;
  height: 40px;
  object-fit: contain;
}

.modal-close {
  position: absolute;
  top: 10px;
  right: 12px;
  background: transparent;
  border: none;
  color: #888;
  font-size: 18px;
  cursor: pointer;
  z-index: 1;
  padding: 4px 6px;
  line-height: 1;

  &:hover {
    color: white;
  }
}

.modal-scroll {
  max-height: 82vh;
}

.modal-body {
  padding: 20px 16px 16px;
}
</style>
