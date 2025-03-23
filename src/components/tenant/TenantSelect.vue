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

defineOptions({
  name: 'TenantSelect',
})

// 定义组件属性
const props = defineProps({
  modelValue: {
    type: [Number, String],
    default: '', // 默认值为空字符串
  },
  placeholder: {
    type: String,
    default: '请选择运营商',
  },
  clearable: {
    type: Boolean,
    default: true,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  // 是否添加全部选项
  showAll: {
    type: Boolean,
    default: false,
  },
  // 全部选项的值
  allValue: {
    type: Number,
    default: 0,
  },
  // 全部选项的标签
  allLabel: {
    type: String,
    default: '全部',
  },
  onChange: {
    type: Function,
    default: null,
  },
})

// 定义组件事件
const emit = defineEmits(['update:modelValue', 'change'])

// 运营商列表
const tenantList = ref<TenantItem[]>([])
const loading = ref(false)

// 获取运营商列表
const getTenantList = async () => {
  try {
    loading.value = true
    const res = await fetchTenantList()
    if (res.code === '00000') {
      tenantList.value = res.data

      // 如果需要添加全部选项
      if (props.showAll) {
        tenantList.value.unshift({
          id: props.allValue as unknown as number,
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

// 选择改变事件
const handleChange = (value: number | string) => {
  // 处理空值情况
  if (value === '' || value === undefined || value === null) {
    emit('update:modelValue', '')
    // 如果提供了onChange回调，则调用它
    if (props.onChange) {
      props.onChange('')
    }
    return
  }

  // 确保value一定是数字类型
  const numValue = typeof value === 'string' ? parseInt(value) : value
  emit('update:modelValue', numValue)
  // 如果提供了onChange回调，则调用它
  if (props.onChange) {
    props.onChange(numValue)
  }

  // 记录变更
  console.log('TenantSelect 发生变更，值:', numValue, '类型:', typeof numValue)
}

// 组件挂载时获取运营商列表
onMounted(() => {
  getTenantList()
})
</script>

<style scoped>
.el-select {
  width: 90%; /* 与其他表单控件保持一致的宽度 */
}
</style>
