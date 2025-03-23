<template>
  <el-select
    :model-value="modelValue"
    :placeholder="placeholder"
    :clearable="clearable"
    :disabled="disabled"
    @update:model-value="handleChange"
  >
    <el-option v-for="item in tenantList" :key="item.id" :label="item.name" :value="item.id" />
  </el-select>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { fetchTenantList, type TenantItem } from '@/api/tenant'
import type { PropType } from 'vue'

/**
 * 定义组件名称
 */
defineOptions({
  name: 'TenantSelect',
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
    default: '请选择运营商',
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
   * 值变化时的回调函数
   */
  onChange: {
    type: Function as PropType<(value: number | string) => void>,
    default: null,
  },
  /**
   * 是否在组件挂载时自动加载数据
   */
  autoLoad: {
    type: Boolean,
    default: true,
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
 * 运营商列表数据
 */
const tenantList = ref<TenantItem[]>([])

/**
 * 加载状态
 */
const loading = ref(false)

/**
 * 获取运营商列表数据
 */
async function getTenantList(): Promise<void> {
  if (loading.value) return

  try {
    loading.value = true
    const res = await fetchTenantList()

    if (res.code === '00000') {
      // 保存数据
      tenantList.value = [...res.data]

      // 如果需要添加全部选项
      if (props.showAll) {
        tenantList.value.unshift({
          id: props.allValue as number,
          name: props.allLabel,
        })
      }
    } else {
      ElMessage.error(res.msg || '获取运营商列表失败')
    }
  } catch (error) {
    console.error('获取运营商列表失败:', error)
    ElMessage.error('获取运营商列表失败')
  } finally {
    loading.value = false
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
 * 刷新租户列表
 */
function refreshTenantList(): void {
  getTenantList()
}

// 暴露给父组件的方法
defineExpose({
  refreshTenantList,
})

/**
 * 组件挂载时获取运营商列表
 */
onMounted(() => {
  if (props.autoLoad) {
    getTenantList()
  }
})
</script>

<style scoped>
.el-select {
  width: 90%; /* 与其他表单控件保持一致的宽度 */
}
</style>
