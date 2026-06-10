<template>
  <n-card :bordered="false">
    <div class="footer-inner">
      <span>Nikke-Archive | 2022 - {{ new Date().getFullYear() }} | By Boora (kyj31590039@gmail.com)</span>
      <div class="footer-notice">
        <span>수치는 절대적이지 않으며 상황에 따라 타협하시길 권장 드립니다.</span>
        <span>오류·미반영 사항은 이메일로 문의해 주세요.</span>
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
  .footer-inner {
    flex-direction: column;
    gap: 4px;
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
