<template>
  <div class="flexbox main-bg main-box-shadow">
    <span>
      <RouterLink to="/"><img :src="logo" class="logo" /></RouterLink>
    </span>


    <div class="drawer-counter">
      <n-icon
        :component="MenuRound"
        @click="openDrawer()"
        class="iconDiv"
        :size="48"
      />
    </div>

    <n-drawer
      v-model:show="showDrawer"
      placement="left"
      :trap-focus="false"
      :auto-focus="false"
    >
      <n-drawer-content>
        <template #header>
          <RouterLink to="/" class="drawer-home" @click="closeDrawer()">홈</RouterLink>
        </template>

        <template #footer>
          <div>
            <n-p>NIKKE Archive</n-p>
          </div>
        </template>

        <RouterLink
          v-for="route in props.routes.filter((rout) => rout.mobile === true)"
          :to="route.path"
          class="redirect"
          :key="'route' + route.path"
          @click="closeDrawer()"
        >
          {{ route.text }}<br />
        </RouterLink>
      </n-drawer-content>
    </n-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

import logo from '@/assets/NIKKE_ARCHIVE_LOGO.png'

import type { route2DisplayInterface } from '@/components/common/Header/routes2Display'

import { MenuRound } from '@vicons/material'

const showDrawer = ref(false)

const props = defineProps<{
  routes: route2DisplayInterface[]
}>()

const openDrawer = () => {
  showDrawer.value = true
}

const closeDrawer = () => {
  showDrawer.value = false
}
</script>

<style lang="less" scoped>
.flexbox {
  height: 100px;
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 100%;
  box-sizing: border-box;
  padding: 0 16px;
  z-index: 100;

  .logo {
    height: 60px;
    user-select: none;
  }

  .drawer-counter {
    margin-left: auto;

    .iconDiv {
      display: flex;
      justify-content: flex-end;
    }
  }
}

.drawer-home {
  color: white;
  text-decoration: none;
  font-size: 16px;
}
</style>
