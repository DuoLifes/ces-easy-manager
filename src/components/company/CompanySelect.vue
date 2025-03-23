<template>
  <el-select
    :model-value="modelValue"
    :placeholder="placeholder"
    :clearable="clearable"
    :disabled="disabled"
    @update:model-value="handleChange"
  >
    <el-option v-for="item in companyList" :key="item.id" :label="item.name" :value="item.id" />
  </el-select>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, inject } from 'vue'
import { ElMessage } from 'element-plus'
import { fetchCompanyData } from '@/api/company'
import type { Company } from '@/types/company'
import type { PropType } from 'vue'

/**
 * 简化的局点数据项接口
 */
interface CompanyItem {
  /** 局点ID */
  id: number
  /** 局点名称 */
  name: string
  /** 运营商ID */
  tenantId: number
  /** 运营商名称 */
  tenantName: string
}

/**
 * 定义组件名称
 */
defineOptions({
  name: 'CompanySelect',
})

/**
 * 定义组件属性
 */
const props = defineProps({
  /**
   * v-model绑定值
   */
  modelValue: {
    type: [Number, String],
    default: '', // 默认值为空字符串
  },
  /**
   * 占位文本
   */
  placeholder: {
    type: String,
    default: '请选择局点',
  },
  /**
   * 是否可清空
   */
  clearable: {
    type: Boolean,
    default: true,
  },
  /**
   * 是否禁用
   */
  disabled: {
    type: Boolean,
    default: false,
  },
  /**
   * 是否添加全部选项
   */
  showAll: {
    type: Boolean,
    default: false,
  },
  /**
   * 全部选项的值
   */
  allValue: {
    type: Number,
    default: 0,
  },
  /**
   * 全部选项的标签
   */
  allLabel: {
    type: String,
    default: '全部',
  },
  /**
   * 运营商ID，用于过滤局点列表
   */
  tenantId: {
    type: [Number, String],
    default: '',
  },
  /**
   * 值变化时的回调函数
   */
  onChange: {
    type: Function as PropType<(value: number | string) => void>,
    default: null,
  },
  /**
   * 是否启用反向选择（当选择局点时，自动更新运营商选择）
   */
  enableReverseSelect: {
    type: Boolean,
    default: false,
  },
})

/**
 * 定义组件事件
 */
const emit = defineEmits<{
  /**
   * 更新v-model值的事件
   */
  'update:modelValue': [value: number | string]
  /**
   * 反向更新tenantId的事件
   */
  'update:tenantId': [value: number | string]
  /**
   * 值变化的事件
   */
  change: [value: number | string]
}>()

/**
 * 局点列表数据
 */
const companyList = ref<CompanyItem[]>([])

/**
 * 所有局点列表（未经过滤）
 */
const allCompanies = ref<CompanyItem[]>([])

/**
 * 加载状态
 */
const loading = ref(false)

/**
 * 标记是否是通过局点反向填充触发的租户变更
 * 用于防止循环触发：选择局点→更新租户→清空局点
 */
const isReverseFilling = ref(false)

// 尝试注入父组件提供的更新函数
const updateGridTenantId = inject<(tenantId: string | number) => void>('updateGridTenantId')

// 用于存储上次反向填充的时间戳
const lastReverseFillTime = ref(0)

// 局点自身的值改变是否应该触发反向填充
const shouldTriggerReverseFill = ref(true)

/**
 * 获取局点列表数据
 */
const getCompanyList = async (): Promise<void> => {
  if (loading.value) return

  try {
    loading.value = true

    // 调用接口，但不传分页参数，设置一个较大的pageSize确保能获取所有数据
    const res = await fetchCompanyData({
      tenantId: undefined, // 不按运营商筛选，获取所有局点
      pageNo: 1,
      pageSize: 1000, // 设置足够大的数值，确保获取所有局点
    })

    if (res.code === '00000') {
      // 提取需要的字段保存到内部数据中
      allCompanies.value = (res.data.records || []).map((item: Company) => ({
        id: item.id,
        name: item.name,
        tenantId: item.tenantId,
        tenantName: item.tenantName,
      }))

      // 根据当前tenantId过滤局点列表
      filterCompaniesByTenant()
    } else {
      ElMessage.error(res.msg || '获取局点列表失败')
    }
  } catch {
    ElMessage.error('获取局点列表失败')
  } finally {
    loading.value = false
  }
}

/**
 * 根据租户ID过滤局点列表
 */
const filterCompaniesByTenant = (): void => {
  if (!props.tenantId || props.tenantId === '' || props.tenantId === 0) {
    // 如果没有指定租户ID，则显示所有局点
    companyList.value = [...allCompanies.value]
  } else {
    // 过滤出当前租户的局点
    const tenantId = typeof props.tenantId === 'string' ? parseInt(props.tenantId) : props.tenantId
    companyList.value = allCompanies.value.filter((item) => item.tenantId === tenantId)
  }

  // 如果需要添加全部选项
  if (props.showAll) {
    companyList.value.unshift({
      id: props.allValue as number,
      name: props.allLabel,
      tenantId: 0,
      tenantName: '',
    })
  }
}

/**
 * 选择改变事件处理
 * @param value - 选择的值
 */
const handleChange = (value: number | string): void => {
  // 处理空值情况
  if (value === '' || value === undefined || value === null) {
    emit('update:modelValue', '')

    // 如果提供了onChange回调，则调用它
    if (props.onChange) {
      props.onChange('')
    }
    return
  }

  // 确保value是数字类型
  const numValue = typeof value === 'string' ? parseInt(value) : value

  // 更新绑定值
  emit('update:modelValue', numValue)

  // 如果提供了onChange回调，则调用它
  if (props.onChange) {
    props.onChange(numValue)
  }

  // 如果启用了反向选择，则自动更新tenantId
  if (props.enableReverseSelect && numValue !== props.allValue && shouldTriggerReverseFill.value) {
    const selectedCompany = allCompanies.value.find((item) => item.id === numValue)
    if (selectedCompany) {
      // 设置标记，表示当前是由局点反向填充触发的租户变更
      isReverseFilling.value = true
      // 记录当前时间戳
      lastReverseFillTime.value = Date.now()
      // 执行更新tenantId的操作：
      // 重要：我们触发三种不同的更新机制，以确保至少有一种能够成功

      // 1. 通过v-model:tenantId方式 (props.onUpdate:tenantId)
      // @ts-expect-error - 属性未在类型定义中声明但可能在实际运行时传入
      if (props['onUpdate:tenantId'] && typeof props['onUpdate:tenantId'] === 'function') {
        // @ts-expect-error - 忽略类型检查，因为我们知道这个属性可能存在
        props['onUpdate:tenantId'](selectedCompany.tenantId)
      }

      // 2. 发送update:tenantId事件，让父组件捕获
      emit('update:tenantId', selectedCompany.tenantId)

      // 3. 通过注入的函数更新（最可靠的方式）
      if (updateGridTenantId) {
        updateGridTenantId(selectedCompany.tenantId)
      }
    }
  }
}

/**
 * 监听租户ID变化，更新局点列表
 */
watch(
  () => props.tenantId,
  (newTenantId, oldTenantId) => {
    // 获取当前时间与上次反向填充时间的差值
    const timeSinceLastReverseFill = Date.now() - lastReverseFillTime.value
    // 判断是否是由反向填充触发的变更 - 如果在1000ms内，认为是由反向填充触发的
    const isFromReverseFill = timeSinceLastReverseFill < 1000
    // 暂时禁止反向填充，以避免循环
    shouldTriggerReverseFill.value = false
    // 检查所选择的局点是否属于新租户
    if (props.modelValue && props.modelValue !== props.allValue) {
      const selectedCompanyId =
        typeof props.modelValue === 'string' ? parseInt(props.modelValue) : props.modelValue

      // 找到当前选中的局点
      const selectedCompany = allCompanies.value.find((item) => item.id === selectedCompanyId)

      // 检查该局点是否属于新选择的租户
      if (selectedCompany) {
        const selectedTenantId =
          typeof newTenantId === 'string' ? parseInt(newTenantId || '0') : newTenantId || 0

        // 如果所选局点不属于当前租户，且不是由反向填充触发的，则需要清空
        if (
          !isFromReverseFill &&
          selectedCompany.tenantId !== selectedTenantId &&
          oldTenantId &&
          newTenantId !== oldTenantId
        ) {
          emit('update:modelValue', '')
          // 如果提供了onChange回调，则调用它
          if (props.onChange) {
            props.onChange('')
          }
        } else {
        }
      }
    }

    // 当租户ID变化时，重新过滤局点列表
    filterCompaniesByTenant()

    // 延迟一小段时间后恢复允许反向填充
    setTimeout(() => {
      shouldTriggerReverseFill.value = true
    }, 500)
  },
)

/**
 * 组件挂载时获取局点列表
 */
onMounted(() => {
  getCompanyList()
})
</script>

<style scoped>
.el-select {
  width: 90%; /* 与其他表单控件保持一致的宽度 */
}
</style>
