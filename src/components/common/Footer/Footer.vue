<template>
  <n-card :bordered="false">
    <div class="footer-inner">
      <span>Nikke-Archive | 2022 - {{ new Date().getFullYear() }} | By Boora (kyj31590039@gmail.com)</span>
      <div class="footer-notice">
        <span>절대적인 수치는 아니며 보유한 캐릭터풀, 재화 등에 따라 적당히 타협하시길 권장 드립니다.</span>
        <span>표기가 잘못 되어 있거나 최신화가 안되어 있을 경우 요청해 주시면 반영 하도록 하겠습니다.</span>
      </div>
    </div>
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
  z-index: 20;
}

.footer-inner {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.footer-notice {
  position: absolute;
  right: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;

  span {
    font-size: 10px;
    opacity: 0.45;
    line-height: 1.4;
  }
}

@media (max-width: 900px) {
  .n-card {
    position: static;
    margin-top: 16px;
  }

  .footer-inner {
    flex-direction: column;
    gap: 6px;
    text-align: center;
    font-size: 12px;
  }

  .footer-notice {
    position: static;
    align-items: center;

    span {
      font-size: 11px;
      text-align: center;
    }
  }
}
</style>
