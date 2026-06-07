<template>
  <ToolsTemplate title="싱크로 레벨 비용 계산기" :resultShow="resultShow">
    <template #form>
      <n-form :model="formDataSyncroCost" :rules="rulesSyncroCost" ref="formRefSyncroCost">
        <n-form-item label="현재 싱크로 레벨:" path="base" size="large">
          <n-input-number v-model:value="formDataSyncroCost.base" placeholder="1부터 999까지" :min="1" :max="999" />
        </n-form-item>

        <n-form-item label="목표 싱크로 레벨:" path="target" size="large">
          <n-input-number v-model:value="formDataSyncroCost.target" placeholder="2부터 1000까지" :min="2" :max="1000" />
        </n-form-item>

        <div class="validate">
          <n-button :disabled="formDataSyncroCost.base === null || formDataSyncroCost.target === null || formDataSyncroCost.base! > formDataSyncroCost.target!" round type="primary" @click="(e: MouseEvent) => triggerResult(e)"> 계산하기 </n-button>
        </div>
      </n-form>
    </template>

    <template #result>
      <n-h2 style="marginbottom: 0px">{{ displayedLevels.base }}레벨에서 {{ displayedLevels.target }}레벨까지 올리려면 필요한 재화:</n-h2>
      <n-p style="margintop: 0px" :depth="3">200레벨 미만 구간은 전체 스쿼드 레벨업 비용 계산을 위해 5배로 계산됩니다.</n-p>

      <n-list :show-divider="true" bordered>
        <n-list-item v-for="item in displayArray" :key="item.label">
          <n-grid :cols="checkMobile() ? 3 : 2">
            <n-gi class="right">
              <n-image :src="item.img" width="96" />
            </n-gi>
            <n-gi class="left" :span="checkMobile() ? 2 : 1">
              <n-statistic :label="item.label" :tabular-nums="true">
                <n-number-animation :ref="item.ref" :from="item.old.value" :to="item.calculated.value" :active="true" locale="fr-FR" show-separator :duration="1500" @finish="updateOldValues()" />
              </n-statistic>
            </n-gi>
          </n-grid>
        </n-list-item>
      </n-list>
    </template>
  </ToolsTemplate>
</template>

<script setup lang="ts">
import ToolsTemplate from './Template.vue'
import { ref } from 'vue'
import type { NumberAnimationInst, FormInst, FormItemRule, FormRules, FormValidationError } from 'naive-ui'
import { useMarket } from '@/stores/market'
import { globalParams, messagesEnum } from '@/utils/enum/globalParams'
import * as LevelingJson from '@/utils/json/CharacterLevelTable.json'
import type { levelingRecordInterface } from '@/utils/interfaces/levelingRecord'

const market = useMarket()

const formRefSyncroCost = ref<FormInst | null>(null)
const resultShow = ref(false)

const formDataSyncroCost = ref({
  base: null,
  target: null
})

const displayedLevels = ref({ base: 0, target: 0 })

const rulesSyncroCost: FormRules = {
  base: [
    {
      required: true,
      min: 1,
      max: 999,
      message: '현재 싱크로 레벨을 입력해 주세요.',
      validator(rule: FormItemRule, value: number | null) {
        if (value === null) {
          return new Error('현재 싱크로 레벨을 입력해 주세요.')
        }
        if (value < rule.min!) {
          return new Error('현재 레벨은 1 이상이어야 합니다.')
        }
        if (formDataSyncroCost.value.target !== null) {
          if (value >= formDataSyncroCost.value.target) {
            return new Error('현재 레벨은 목표 레벨보다 크거나 같을 수 없습니다.')
          }
        }
        if (value > rule.max!) {
          return new Error('현재 레벨은 999 이하여야 합니다.')
        }
        return true
      },
      trigger: ['input', 'blur']
    }
  ],
  target: {
    required: true,
    min: 2,
    max: 1000,
    message: '목표 싱크로 레벨을 입력해 주세요.',
    validator(rule: FormItemRule, value: number | null) {
      if (value === null) {
        return new Error('목표 싱크로 레벨을 입력해 주세요.')
      }
      if (value < rule.min!) {
        return new Error('목표 레벨은 2 이상이어야 합니다.')
      }
      if (formDataSyncroCost.value.base !== null) {
        if (value <= formDataSyncroCost.value.base) {
          return new Error('목표 레벨은 현재 레벨보다 작거나 같을 수 없습니다.')
        }
      }
      if (value > rule.max!) {
        return new Error('목표 레벨은 1000 이하여야 합니다.')
      }
      return true
    },
    trigger: ['input', 'blur']
  }
}

const triggerResult = (e: MouseEvent) => {
  e.preventDefault()
  formRefSyncroCost.value?.validate((errors: FormValidationError[] | undefined) => {
    if (errors) {
      market.message.getMessage().error(messagesEnum.MESSAGE_WRONG_FORM_DATA)
    } else {
      market.message.getMessage().success(messagesEnum.MESSAGE_PROCESSING, market.message.short_message)
      resultShow.value = true
      credit.value = 0
      bd.value = 0
      core.value = 0
      displayedLevels.value.base = formDataSyncroCost.value.base!
      displayedLevels.value.target = formDataSyncroCost.value.target!
      calculateRessources()
      animate()
    }
  })
}

const oldCredit = ref(0)
const oldBd = ref(0)
const oldCore = ref(0)

const credit = ref(0)
const bd = ref(0)
const core = ref(0)

const displayArray = [
  {
    old: oldCredit,
    calculated: credit,
    label: '크레딧',
    ref: 'creditRef',
    img: globalParams.NIKKE_DB + '/images/' + 'credit.png'
  },
  {
    old: oldBd,
    calculated: bd,
    label: '배틀 데이터',
    ref: 'bdRef',
    img: globalParams.NIKKE_DB + '/images/' + 'battledata.png'
  },
  {
    old: oldCore,
    calculated: core,
    label: '코어 더스트',
    ref: 'coreRef',
    img: globalParams.NIKKE_DB + '/images/' + 'coredust.png'
  }
]

const calculateRessources = () => {
  const LevelingTable = LevelingJson.records as levelingRecordInterface[]
  LevelingTable.forEach((record: levelingRecordInterface) => {
    if (record.level >= formDataSyncroCost.value.base! && record.level < formDataSyncroCost.value.target!) {
      if (record.level < 200) {
        credit.value += record.gold * 5
        bd.value += record.character_exp * 5
        core.value += record.character_exp_2 * 5
      } else {
        credit.value += record.gold
        bd.value += record.character_exp
        core.value += record.character_exp_2
      }
    }
  })
}

const animate = () => {
  const creditRef = ref<NumberAnimationInst | null>(null)
  const bdRef = ref<NumberAnimationInst | null>(null)
  const coreRef = ref<NumberAnimationInst | null>(null)
  creditRef.value?.play()
  bdRef.value?.play()
  coreRef.value?.play()
}

const updateOldValues = () => {
  oldCredit.value = credit.value
  oldBd.value = bd.value
  oldCore.value = core.value
}

const checkMobile = () => {
  return market.globalParams.isMobile ? true : false
}
</script>

<style lang="less" scoped>
.n-list-item {
  .right {
    text-align: right;
    margin-right: 10px;
  }

  .left {
    margin-left: 10px;
  }
}
</style>
