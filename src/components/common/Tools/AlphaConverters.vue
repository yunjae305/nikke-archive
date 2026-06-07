<template>
  <n-card :bordered="false" size="huge">

    스트레이트 알파에서 프리멀티플라이드 알파로 변환

    <n-upload
        directory-dnd
        v-model:file-list="fileArray"
        @update:file-list="converter('sta2pma')"
        accept=".png"
    >
      <n-upload-dragger>
        PMA로 변환할 PNG를 끌어오세요
      </n-upload-dragger>
    </n-upload>

    <n-divider />

    프리멀티플라이드 알파에서 스트레이트 알파로 변환

    <n-upload
        directory-dnd
        v-model:file-list="fileArray"
        @update:file-list="converter('pma2sta')"
        accept=".png"
    >
      <n-upload-dragger>
        STA로 변환할 PNG를 끌어오세요
      </n-upload-dragger>
    </n-upload>

    <n-divider />

    <n-a href="https://learn.microsoft.com/en-us/windows/apps/develop/win2d/premultiplied-alpha#converting-between-alpha-formats">
      변환 알고리즘 자세히 보기
    </n-a>
    <n-p>숫자 반올림 때문에 이미지 변환 시 품질 손실이 발생할 수 있습니다.</n-p>
  </n-card>
</template>

<script setup lang="ts">

import { getPixels, savePixels } from 'ndarray-pixels'
import { ref, type Ref } from 'vue'
import { type UploadFileInfo } from 'naive-ui'
import { useMarket } from '@/stores/market'

const fileArray: Ref<UploadFileInfo[]> = ref([])
const market = useMarket()

const converter = (conversionType: 'pma2sta' | 'sta2pma') => {
  const fr = new FileReader()
  fr.readAsArrayBuffer(fileArray.value[0].file!)
  fr.onload = async () => {
    const result = fr.result as ArrayBuffer
    const pixels = await getPixels(new Uint8Array(result), 'image/png')

    market.message.getMessage().info('PNG 파일의 ' + pixels.data.length / 4 + '개 픽셀을 처리하는 중')
    const dateParsingStart = new Date()

    if (conversionType === 'sta2pma') {
      for (let i = 0; i <= pixels.data.length - 5; i = i + 4) {
        let r = pixels.data[i]
        let g = pixels.data[i + 1]
        let b = pixels.data[i + 2]
        const a = pixels.data[i + 3]

        if (r !== 0 || g !== 0 || b !== 0) {
          r = ( r * a ) / 255
          g = ( g * a ) / 255
          b = ( b * a ) / 255
          pixels.data[i] = r
          pixels.data[i + 1] = g
          pixels.data[i + 2] = b
        }
      }
    } else if (conversionType === 'pma2sta') {
      for (let i = 0; i <= pixels.data.length - 5; i = i + 4) {
        let r = pixels.data[i]
        let g = pixels.data[i + 1]
        let b = pixels.data[i + 2]
        const a = pixels.data[i + 3]

        if (r !== 0 || g !== 0 || b !== 0) {
          r = ( r * 255 ) / a
          g = ( g * 255 ) / a
          b = ( b * 255 ) / a
          pixels.data[i] = r
          pixels.data[i + 1] = g
          pixels.data[i + 2] = b
        }
      }
    }

    const dateParsingEnd = new Date()
    market.message.getMessage().success('처리 완료, 소요 시간: ' + (dateParsingEnd.getTime() - dateParsingStart.getTime()) + 'ms')
    const savedPixels = await savePixels(pixels, 'image/png')
    const tempblob = new Blob([savedPixels], { type: 'image/png' })
    const url = URL.createObjectURL(tempblob)
    const a = document.createElement('a')
    a.href = url
    a.download = fileArray.value[0].name
    a.click()
    window.URL.revokeObjectURL(url)

    fileArray.value = []
  }
}

</script>
