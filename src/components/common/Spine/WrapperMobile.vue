<template>
  <div>
    <img
      :src="magnifyingGlass"
      id="mobileCogL2d"
      @click="showCogModal()"
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

        <n-tabs type="line" animated size="large">
          <n-tab-pane name="Character" tab="Character">
            <CharacterList />
          </n-tab-pane>

          <n-tab-pane name="options" tab="Options" class="options">
            <div class="l2d-options-tab">
              <n-switch v-model:value="showHeaderBool" class="center-switch">
                <template #checked> The header is currently visible </template>

                <template #unchecked> The header is currently hidden </template>
              </n-switch>
            </div>
          </n-tab-pane>

        </n-tabs>

        <template #footer>
          <!-- footer content -->
        </template>
      </n-card>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { CloseOutlined } from '@vicons/antd'
import magnifyingGlass from '@/assets/magnifying-glass.png'
import { ref, watch } from 'vue'
import CharacterList from './CharacterList.vue'
import { useMarket } from '@/stores/market'
import PoseSelector from '@/components/common/Spine/Tools/PoseSelector.vue'
import BackgroundColor from './Tools/BackgroundColor.vue'

const market = useMarket()

const isCogModalVisible = ref(false)
const showHeaderBool = ref(false)

const showCogModal = () => {
  isCogModalVisible.value = true
}

const hideCogModal = () => {
  isCogModalVisible.value = false
}

watch(showHeaderBool, () => {
  switch (showHeaderBool.value) {
    case true:
      market.globalParams.showMobileHeader()
      break
    case false:
      market.globalParams.hideMobileHeader()
      break
    default:
      break
  }
})
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

#mobilePoseSelector {
  position: fixed;
  top: 16px;
  right: 16px;
  z-index: 50;
  background-color: rgba(33, 37, 41, 0.65);
  border-radius: 10px;
  padding: 8px 14px;
}

#cogModal {
  width: 95%;
  height: 80vh;
}

.n-tab-pane {
  height: calc(80vh - 200px);
  overflow: auto;

  .l2d-options-tab {
    width: 100%;
    text-align: center;
  }

  .poseSelector {
    text-align: center;

    span {
      text-align: left;
    }
  }

  &.options > * {
    padding-bottom: 10px;

    &:not(:nth-child(1)) {
      border-top: 1px solid @grey-color;
      padding: 10px 0;
    }
  }
}

.n-tabs {
  height: 100%;
}
</style>
