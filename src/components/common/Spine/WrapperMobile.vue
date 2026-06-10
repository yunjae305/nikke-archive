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

        <CharacterList />

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
import { ref } from 'vue'
import CharacterList from './CharacterList.vue'
import { useMarket } from '@/stores/market'
import PoseSelector from '@/components/common/Spine/Tools/PoseSelector.vue'
import BackgroundColor from './Tools/BackgroundColor.vue'

const market = useMarket()

const isCogModalVisible = ref(false)

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

</style>
