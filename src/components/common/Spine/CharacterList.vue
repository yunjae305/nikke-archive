<template>
  <div id="l2dsearchbox" :class="checkMobile()" v-show="!market.live2d.hideUI">
    <n-card size="small" :bordered="false" class="search-card">
      <div class="search-row">
        <n-input
          type="text"
          placeholder="Name"
          v-model:value="name_filter"
          :clearable="true"
        ></n-input>
        <n-button
          quaternary
          :type="showFilter ? 'primary' : 'default'"
          class="filter-btn"
          @click="showFilter = !showFilter"
        >
          <template #icon>
            <n-icon><FilterOutlined /></n-icon>
          </template>
        </n-button>
      </div>
    </n-card>

    <!-- Filter panel floats to the right of the character list -->
    <div v-show="showFilter" class="filter-panel">
      <div class="filter-section">
        <span class="filter-label">코드</span>
        <div class="filter-chips">
          <span
            v-for="c in codes"
            :key="c"
            :class="['chip', { active: selectedCodes.includes(c) }]"
            @click="toggleCode(c)"
          >{{ c }}</span>
        </div>
      </div>

      <div class="filter-section">
        <span class="filter-label">기업</span>
        <div class="filter-chips">
          <span
            v-for="co in companies"
            :key="co"
            :class="['chip', { active: selectedCompanies.includes(co) }]"
            @click="toggleCompany(co)"
          >{{ co }}</span>
        </div>
      </div>

      <div class="filter-section">
        <span class="filter-label">기타</span>
        <div class="filter-chips">
          <span
            :class="['chip', { active: filterCollection }]"
            @click="filterCollection = !filterCollection"
          >애장품</span>
        </div>
      </div>

      <n-button size="tiny" quaternary class="reset-btn" @click="resetFilters">초기화</n-button>
    </div>

    <n-scrollbar>
      <n-list hoverable :show-divider="false">
        <n-list-item
          v-for="character in market.live2d.filtered_l2d_Array"
          v-show="isVisible(character)"
          :key="character.id"
          @click="changeSpine(character)"
        >
          <template #prefix>
            <img :src="getSiIcon(character)" class="si_img" loading="lazy" :onerror="`this.onerror=null; this.src='${fallbackSiIcon()}'`"/>
          </template>

          <n-h5>{{ character.name }}</n-h5>
        </n-list-item>
      </n-list>
    </n-scrollbar>
  </div>
</template>

<script setup lang="ts">
import { useMarket } from '@/stores/market'
import { onMounted, ref } from 'vue'
import type { live2d_interface, L2dCode, L2dCompany } from '@/utils/interfaces/live2d'
import { FilterOutlined } from '@vicons/antd'

const market = useMarket()
const name_filter = ref('')
const spriteBasePath = `${import.meta.env.BASE_URL}images/sprite/`

const showFilter = ref(false)
const selectedCodes = ref<L2dCode[]>([])
const selectedCompanies = ref<L2dCompany[]>([])
const filterCollection = ref(false)

const codes: L2dCode[] = ['작열', '수냉', '풍압', '전격', '철갑']
const companies: L2dCompany[] = ['엘리시온', '미실리스', '테트라', '필그림', '어브노멀']

const toggleCode = (c: L2dCode) => {
  const i = selectedCodes.value.indexOf(c)
  if (i >= 0) selectedCodes.value.splice(i, 1)
  else selectedCodes.value.push(c)
}

const toggleCompany = (co: L2dCompany) => {
  const i = selectedCompanies.value.indexOf(co)
  if (i >= 0) selectedCompanies.value.splice(i, 1)
  else selectedCompanies.value.push(co)
}

const resetFilters = () => {
  selectedCodes.value = []
  selectedCompanies.value = []
  filterCollection.value = false
}

const isVisible = (character: live2d_interface): boolean => {
  if (character.name.toUpperCase().startsWith('HIDDEN')) return false
  if (!character.name.toLowerCase().includes(name_filter.value.toLowerCase())) return false
  if (selectedCodes.value.length > 0 && !selectedCodes.value.includes(character.code!)) return false
  if (selectedCompanies.value.length > 0 && !selectedCompanies.value.includes(character.company!)) return false
  if (filterCollection.value && !character.collection) return false
  return true
}

onMounted(() => {
  if (market.live2d.filtered_l2d_Array.length === 0) {
    market.live2d.filter()
  }
})

const favoritesBasePath = `${import.meta.env.BASE_URL}images/favorites/`
const getSiIcon = (character: live2d_interface) => {
  if (character.imageOnly) return `${favoritesBasePath}${character.id}.webp`
  return `${spriteBasePath}si_${character.id}_00_s.png`
}
const fallbackSiIcon = () => `${spriteBasePath}si_c9999_00_s.png`
const checkMobile = () => market.globalParams.isMobile ? 'mobile' : 'computer'
const changeSpine = (character: live2d_interface) => market.live2d.change_current_spine(character)
</script>

<style scoped lang="less">
@import '@/utils/style/global_variables.less';

.search-row {
  display: flex;
  gap: 6px;
  align-items: center;

  .n-input { flex: 1; }

  .filter-btn {
    flex-shrink: 0;
    padding: 0 6px;
  }
}

.filter-panel {
  position: absolute;
  left: 210px;
  top: 0;
  width: 185px;
  background: #1a1a1e;
  border: 1px solid @naive-green;
  border-radius: 10px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  z-index: 10;
}

.filter-section {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.filter-label {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.45);
}

.filter-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.chip {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 0.65);
  cursor: pointer;
  user-select: none;
  transition: all 0.15s;

  &:hover {
    border-color: @naive-green;
    color: @naive-green;
  }

  &.active {
    background: @naive-green;
    border-color: @naive-green;
    color: #000;
    font-weight: 600;
  }
}

.reset-btn {
  align-self: flex-end;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.35);
}

.computer {
  position: absolute;
  width: 200px;
  left: 20px;
  top: 130px;
  height: calc(85vh - 120px);

  .n-list {
    min-height: calc(85vh - 120px);
    user-select: none;

    .n-list-item {
      padding: 5px 10px;
      border-top: #18181c 1px solid;
      border-bottom: #18181c 1px solid;

      .si_img {
        height: 50px;
        width: 50px;
        object-fit: contain;
      }

      &:hover {
        cursor: pointer;
        border-top: @naive-green 1px solid;
        border-bottom: @naive-green 1px solid;
      }
    }
  }

  .n-card {
    border-top: 1px solid @naive-green;
    border-right: 1px solid @naive-green;
    border-radius: 10px;
    border-bottom-left-radius: 0px;
    border-bottom-right-radius: 0px;
  }

  .n-card,
  .n-list {
    border-left: 1px solid @naive-green;
  }
}

.mobile {
  .n-list-item,
  .n-card {
    border-top: @naive-green 1px solid;

    .si_img {
      height: 50px;
    }
  }
}
</style>
