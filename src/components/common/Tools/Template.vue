<template>
  <n-card :class="checkMobile()" class="n-card-template-tools">
    <n-h1 prefix="bar" type="success">{{
      props.title
    }}</n-h1>

    <div class="wrapper-template-tools slot">
      <slot name="form" />
    </div>

    <div v-if="props.resultShow" class="slot">
      <slot name="result" />
    </div>
  </n-card>
</template>

<script setup lang="ts">
import { useMarket } from '@/stores/market'

const market = useMarket()

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  resultShow: {
    type: Boolean,
    required: true
  }
})

const checkMobile = () => {
  return market.globalParams.isMobile ? 'mobile-template-tools' : ''
}
</script>

<style lang="less">
@import '@/utils/style/global_variables.less';

.n-card-template-tools {
  width: 80%;
  margin: 0 auto;

  .n-h1 {
    user-select: none;
  }

  .slot {
    border-top: 1px @grey-color solid;
    padding-bottom: 15px;
    padding-top: 15px;
  }
}


.wrapper-template-tools {
  .n-form-item {
    margin: 0 auto;
    width: 250px;
  }
  .validate {
    text-align: center;

    .n-button {
      width: 250px;
    }
  }
}
.mobile-template-tools {
  width: 95%;
}
</style>
