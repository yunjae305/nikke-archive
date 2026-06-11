<template>
  <div>
    <img
      :src="magnifyingGlass"
      id="mobileCogL2d"
      @click="showCogModal()"
    />
    <n-icon
      :component="MenuRound"
      id="mobileMenuBtn"
      @click="isNavDrawerVisible = true"
      :size="44"
    />
    <div id="mobilePoseSelector">
      <PoseSelector />
    </div>
    <BackgroundColor v-show="false" />

    <n-modal v-model:show="isCogModalVisible" id="cogModal">
      <n-card title="Options" :bordered="false" size="huge" role="dialog">
        <template #header-extra>
          <n-icon
            :component="CloseOutlined"
            :size="40"
            @click="hideCogModal()"
          />
        </template>
        <CharacterList />
        <template #footer></template>
      </n-card>
    </n-modal>

    <n-drawer v-model:show="isNavDrawerVisible" placement="left" :trap-focus="false" :auto-focus="false">
      <n-drawer-content :native-scrollbar="false">
        <template #footer>
          <div><n-p>NIKKE Archive</n-p></div>
        </template>
        <div class="drawer-nav">
          <RouterLink to="/" class="redirect" @click="isNavDrawerVisible = false">홈</RouterLink>
          <RouterLink to="/tools" class="redirect" @click="isNavDrawerVisible = false">계산기</RouterLink>
          <RouterLink to="/visualiser" class="redirect" @click="isNavDrawerVisible = false">Live2D 뷰어</RouterLink>
        </div>
      </n-drawer-content>
    </n-drawer>
  </div>
</template>

<script setup lang="ts">
import { CloseOutlined } from '@vicons/antd'
import { MenuRound } from '@vicons/material'
import { RouterLink } from 'vue-router'
import magnifyingGlass from '@/assets/magnifying-glass.png'
import { ref } from 'vue'
import CharacterList from './CharacterList.vue'
import { useMarket } from '@/stores/market'
import PoseSelector from '@/components/common/Spine/Tools/PoseSelector.vue'
import BackgroundColor from './Tools/BackgroundColor.vue'

const market = useMarket()

const isCogModalVisible = ref(false)
const isNavDrawerVisible = ref(false)

const showCogModal = () => {
  isCogModalVisible.value = true
}

const hideCogModal = () => {
  isCogModalVisible.value = false
}
</script>

<style lang="less" scoped>
@import '@/utils/style/global_variables.less';

#mobileCogL2d {
  position: fixed;
  top: 16px;
  left: 16px;
  z-index: 50;
  width: 44px;
  height: 44px;
  filter: invert(1);
  cursor: pointer;
}

#mobileMenuBtn {
  position: fixed;
  top: 16px;
  right: 16px;
  z-index: 50;
  cursor: pointer;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
}

#mobilePoseSelector {
  position: fixed;
  bottom: 16px;
  left: 16px;
  z-index: 50;
  background-color: rgba(33, 37, 41, 0.65);
  border-radius: 10px;
  padding: 8px 14px;
}

#cogModal {
  width: 95%;
  height: 80vh;
}

.drawer-nav {
  display: flex;
  flex-direction: column;
  gap: 28px;
  padding: 8px 0;
}
</style>
