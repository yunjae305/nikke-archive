<template>
  <div class="flexbox main-bg main-box-shadow">
    <span>
      <RouterLink to="/">
        <img :src="logo" class="logo" />
      </RouterLink>
    </span>
    <span class="routes">
      <RouterLink
        v-for="route in props.routes"
        :to="{name: route.path}"
        class="redirect"
        :key="'route' + route.path"
      >
        {{ route.text }}
      </RouterLink>
    </span>
  </div>
</template>

<script setup lang="ts">
import logo from '@/assets/NIKKE_ARCHIVE_LOGO.png'

import { type route2DisplayInterface } from '@/components/common/Header/routes2Display'

const props = defineProps<{
  routes: route2DisplayInterface[]
}>()
</script>

<style lang="less" scoped>
.flexbox {
  height: 100px;
  display: flex;
  flex-direction: row;
  width: 100%;
  position: relative;
  z-index: 10;

  span {
    width: 100%;
    flex: 1;

    &.routes {
      flex: 50 0 0;

      align-items: center;
      margin-top: 30px;

      text-align: right;
      .redirect {
        width: 100vw;
        margin-right: 25px;
      }
    }
  }

  .logo {
    margin: 0 50px 0 50px;
    height: 100px;
    user-select: none;
  }
}
</style>
