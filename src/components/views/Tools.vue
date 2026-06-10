<template>
  <div id="divTools">
    <SynchroCost />
    <OutpostIncome />
  </div>

  <template v-if="market.globalParams.isMobile">
    <n-icon :component="MenuRound" id="toolsMenuBtn" @click="isNavDrawerVisible = true" :size="44" />
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
  </template>
</template>

<script setup lang="ts">
import SynchroCost from '@/components/common/Tools/SynchroCost.vue'
import OutpostIncome from '@/components/common/Tools/OutpostIncome.vue'
import { onBeforeMount, onMounted, ref } from 'vue'
import { useMarket } from '@/stores/market'
import { RouterLink } from 'vue-router'
import { MenuRound } from '@vicons/material'

const market = useMarket()
const isNavDrawerVisible = ref(false)

onBeforeMount(() => {
  market.load.beginLoad()
})

onMounted(() => {
  setTimeout(() => {
    market.load.endLoad()
  }, 10)
})

</script>

<style scoped lang="less">
#divTools {
  margin-top: 50px;

  > * {
    margin-bottom: 50px;
  }
}

#toolsMenuBtn {
  position: fixed;
  bottom: 16px;
  right: 16px;
  z-index: 50;
  cursor: pointer;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(33, 37, 41, 0.75);
  border-radius: 50%;
  padding: 8px;
  box-sizing: content-box;
}

.drawer-nav {
  display: flex;
  flex-direction: column;
  gap: 28px;
  padding: 8px 0;
}
</style>
