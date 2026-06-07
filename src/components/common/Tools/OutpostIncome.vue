<template>
  <ToolsTemplate title="전초기지 소득 계산기" :resultShow="resultShow">
    <template #form>
      <n-form
        :model="formDataOutpostIncome"
        :rules="rulesOutpostIncome"
        ref="formRefOutpostIncome">

        <n-form-item label="전초기지 레벨:" path="level" size="large">
          <n-input-number
            v-model:value="formDataOutpostIncome.level"
            :min="1"
            :max="400"
          />
        </n-form-item>

        <n-form-item label="사용자 지정 시간:" path="custom" size="large">
          <n-input-number
            v-model:value="formDataOutpostIncome.custom"
            :options="boostBdAndCore"
          >
          <template #suffix>
            시간
          </template>
          </n-input-number>
        </n-form-item>

        <n-form-item label="아카데미:" path="academy" size="large">
          <n-switch
            v-model:value="formDataOutpostIncome.academy"
            style="margin:0 auto"
          >
            <template #checked>
              아카데미 최대 레벨
            </template>
            <template #unchecked>
              아카데미 직접 설정
            </template>
          </n-switch>
        </n-form-item>

        <n-form-item label="크레딧 보너스 (%)" path="acaCd" size="large" v-if="!formDataOutpostIncome.academy">
          <n-select
            v-model:value="formDataOutpostIncome.acaCd"
            :options="creditBoost"
          />
        </n-form-item>

        <n-form-item label="배틀 데이터 보너스 (%)" path="acaBd" size="large" v-if="!formDataOutpostIncome.academy">
          <n-select
            v-model:value="formDataOutpostIncome.acaBd"
            :options="boostBdAndCore"
          />
        </n-form-item>

        <n-form-item label="코어 더스트 보너스 (%)" path="acaCore" size="large" v-if="!formDataOutpostIncome.academy">
          <n-select
            v-model:value="formDataOutpostIncome.acaCore"
            :options="boostBdAndCore"
          />
        </n-form-item>

        <div class="validate">
          <n-button
            :disabled="disabledValidate()"
            round
            type="primary"
            @click="(e: MouseEvent) => triggerResult(e)"
            >
            계산하기
          </n-button>
        </div>

      </n-form>
    </template>

    <template #result>

      <n-data-table
        :columns="resultColumns"
        :striped="true"
        :data="dataTableData"
      />

    </template>
  </ToolsTemplate>
</template>

<script setup lang="ts">
import type { DataTableColumn, FormInst, FormItemRule, FormRules, FormValidationError, SelectOption } from 'naive-ui'
import ToolsTemplate from './Template.vue'
import { ref } from 'vue'
import { useMarket } from '@/stores/market'
import { messagesEnum } from '@/utils/enum/globalParams'
import type { outpostBattleRecordInterface } from '@/utils/interfaces/outpostBattleRecords'
import * as outpostBattleTable from '@/utils/json/OutpostBattleTable.json'

const formRefOutpostIncome = ref<FormInst | null>(null)
const market = useMarket()

const resultShow = ref(false)

const formDataOutpostIncome = ref({
  level: null,
  acaCd: null as number | null,
  acaBd: null as number | null,
  acaCore: null as number | null,
  academy: true,
  custom: 24
})

const requiredRule = [{ required: true, message: '필수 입력 항목입니다.' }]

const rulesOutpostIncome: FormRules = {
  level: [
    {
      required: true,
      min: 1,
      max: 400,
      message: '전초기지 레벨을 입력해 주세요.',
      validator: (rule: FormItemRule, value: number | null) => {
        if (value === null) {
          return new Error('전초기지 레벨을 입력해 주세요.')
        }
        if (value < rule.min!) {
          return new Error('전초기지 레벨은 1 이상이어야 합니다.')
        }
        if (value > rule.max!) {
          return new Error('전초기지 레벨이 최대값을 초과했습니다.')
        }
        return true
      },
      trigger: ['input', 'blur']
    }
  ],
  acaCd: requiredRule,
  acaBd: requiredRule,
  acaCore: requiredRule,
  custom: requiredRule
}

const boostBdAndCore: SelectOption[] = [
  {
    label: '10',
    value: 10
  },
  {
    label: '25',
    value: 25
  },
  {
    label: '45',
    value: 45
  }
]

const creditBoost: SelectOption[] = []
for (let i = 1; i <= 6 ; i++) {
  creditBoost.push({
    label: '' + i * 10,
    value: i * 10
  })
}

const disabledValidate = () => {
  if (formDataOutpostIncome.value.level === null) {
    return true
  }
  if (formDataOutpostIncome.value.custom === null) {
    return true
  }
  if (formDataOutpostIncome.value.academy === false) {
    if (formDataOutpostIncome.value.acaBd === null ||
        formDataOutpostIncome.value.acaCd === null ||
        formDataOutpostIncome.value.acaCore === null) {
      return true
    }
  }
}

const resultColumns: DataTableColumn[] = [
  {
    title: '재화',
    key: 'currency'
  },
  {
    title: '분당',
    key: 'minute',
    render: (row: any) => {
      return Math.floor(row.minute).toLocaleString()
    }
  },
  {
    title: '시간당',
    key: 'hour',
    render: (row: any) => {
      return Math.floor(row.hour).toLocaleString()
    }
  },
  {
    title: '지정 시간',
    key: 'custom',
    render: (row: any) => {
      return Math.floor(row.custom).toLocaleString()
    }
  }
]

enum dataTableEnum {
  CREDIT='크레딧',
  BATTLE='배틀 데이터',
  CORE='코어 더스트'
}

const dataTableData = ref([
  {
    currency: dataTableEnum.CREDIT,
    minute: 0,
    hour: 0,
    custom: 0,
    ratio: 3
  },
  {
    currency: dataTableEnum.BATTLE,
    minute: 0,
    hour: 0,
    custom: 0,
    ratio: 3
  },
  {
    currency: dataTableEnum.CORE,
    minute: 0,
    hour: 0,
    custom: 0,
    ratio: 1
  },
])

const triggerResult = (e: MouseEvent) => {
  e.preventDefault()
  formRefOutpostIncome.value?.validate((errors: FormValidationError[] | undefined) => {
    if (errors) {
      market.message.getMessage().error(messagesEnum.MESSAGE_WRONG_FORM_DATA)
    } else {
      market.message.getMessage().success(messagesEnum.MESSAGE_PROCESSING, market.message.short_message)
      resultShow.value = true
      if (formDataOutpostIncome.value.academy === true) {
        formDataOutpostIncome.value.acaCd = 60
        formDataOutpostIncome.value.acaBd = 45
        formDataOutpostIncome.value.acaCore = 45
      }
      calculateRessources()
    }
  })
}

const calculateRessources = () => {
  const OutpostTable = outpostBattleTable.records as outpostBattleRecordInterface[]
  const record = OutpostTable.find((record) => record.id === formDataOutpostIncome.value.level)!

  dataTableData.value.forEach((data) => {
    let value: number
    let boost: number
    switch (data.currency) {
      case dataTableEnum.CREDIT:
        value = record.credit
        boost = formDataOutpostIncome.value.acaCd!
        break
      case dataTableEnum.BATTLE:
        value = record.character_exp1
        boost = formDataOutpostIncome.value.acaBd!
        break
      case dataTableEnum.CORE:
        value = record.character_exp2
        boost = formDataOutpostIncome.value.acaCore!
        break
      default:
        value = 999999
        boost = 999999
    }

    const BASE = value * data.ratio / 10000
    data.minute = BASE + BASE * boost / 100
    data.hour = 60 * data.minute
    data.custom = formDataOutpostIncome.value.custom * data.hour
  })
}
</script>

<style scoped lang="less">

</style>
