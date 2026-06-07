<template>
  <n-card :bordered="false">
    Nikke-Archive | 2022 - {{ new Date().getFullYear() }} | By Boora
  </n-card>
</template>

<script setup lang="ts"></script>

<style scoped lang="less">
@import '@/utils/style/global_variables.less';

.n-card {
  border-top: @grey-color 1px solid;
  margin-top: 0;
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  text-align: center;
  z-index: 20;
}
</style>
