<template>
  <n-radio-group
    name="radioGroupPoses"
    v-model:value="market.live2d.current_pose"
  >
    <span v-for="pose in poses" :key="pose.value">
      <n-radio :key="pose.value" :value="pose.value">
        <n-icon
          :component="pose.component"
          :size="18"
          :style="{ position: 'relative', top: pose.top }"
        />
        {{ pose.label }}
      </n-radio>
      <br />
    </span>
  </n-radio-group>
</template>

<script setup lang="ts">
import { useMarket } from '@/stores/market'
import { AimOutlined } from '@vicons/antd'
import { AccessibilityTwotone } from '@vicons/material'
import ManageProtection from '@vicons/carbon/ManageProtection'

const market = useMarket()

const poses = [
  {
    value: 'aim',
    label: '사격',
    component: AimOutlined,
    top: '3px'
  },
  {
    value: 'cover',
    label: '엄폐',
    component: ManageProtection,
    top: '5px'
  },
  {
    value: 'fb',
    label: '스탠딩',
    component: AccessibilityTwotone,
    top: '3px'
  }
]
</script>

<style scoped lang="less">
div {
  border-bottom: none !important;
}
</style>
