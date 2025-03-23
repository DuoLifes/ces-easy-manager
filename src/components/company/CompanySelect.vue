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
import { ref, onMounted, watch } from 'vue'
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
 * 获取局点列表数据
 */
async function getCompanyList(): Promise<void> {
  if (loading.value) return

  try {
    loading.value = true

    // 调用接口，使用较大的pageSize确保能获取所有数据
    const res = await fetchCompanyData({
      tenantId: props.tenantId ? Number(props.tenantId) : undefined,
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

      // 过滤局点列表
      filterCompaniesByTenant()
    } else {
      ElMessage.error(res.msg || '获取局点列表失败')
    }
  } catch (error) {
    console.error('获取局点列表失败:', error)
    ElMessage.error('获取局点列表失败')
  } finally {
    loading.value = false
  }
}

/**
 * 根据租户ID过滤局点列表
 */
function filterCompaniesByTenant(): void {
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
function handleChange(value: number | string): void {
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
}

/**
 * 监听租户ID变化，更新局点列表
 */
watch(
  () => props.tenantId,
  () => {
    // 当tenantId变化时，重新获取或过滤局点列表
    getCompanyList()
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
