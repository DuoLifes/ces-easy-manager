<template>
  <div class="search-container">
    <el-form ref="searchRef" :model="localQuery" :inline="true">
      <div class="form-items" :style="{ '--form-items-per-row': props.layout }">
        <el-form-item
          :label="item.label"
          :prop="item.prop"
          v-for="item in options"
          :key="item.prop"
        >
          <el-input
            v-if="item.type === 'input'"
            v-model="localQuery[item.prop]"
            :name="item.prop"
            :disabled="item.disabled"
            :placeholder="item.placeholder"
            clearable
            @update:modelValue="(value) => handleInputChange(item, value)"
          ></el-input>
          <el-select
            v-else-if="item.type === 'select'"
            v-model="localQuery[item.prop]"
            :name="item.prop"
            :disabled="item.disabled"
            :placeholder="item.placeholder"
            clearable
            @update:modelValue="(value) => updateQueryField(item.prop, value)"
          >
            <el-option
              v-for="opt in item.opts"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
            ></el-option>
          </el-select>
          <el-date-picker
            v-else-if="item.type === 'date'"
            type="date"
            v-model="localQuery[item.prop]"
            :name="item.prop"
            :value-format="item.format"
            @update:modelValue="updateQueryField(item.prop, $event)"
          ></el-date-picker>
          <component
            v-else-if="item.type === 'custom' && item.component"
            :is="item.component"
            :model-value="localQuery[item.prop]"
            :name="item.prop"
            v-bind="item.props || {}"
            @update:model-value="updateQueryField(item.prop, $event)"
          ></component>
        </el-form-item>
        <div class="button-wrapper">
          <div class="button-group">
            <el-button type="primary" :icon="Search" @click="search">搜索</el-button>
            <el-button :icon="Refresh" @click="resetForm(searchRef)">重置</el-button>
          </div>
        </div>
      </div>
    </el-form>
  </div>
</template>

<script lang="ts" setup>
import type { FormInstance } from 'element-plus'
import { Search, Refresh } from '@element-plus/icons-vue'
import type { PropType } from 'vue'
import { ref, reactive, watch, markRaw } from 'vue'
import type { FormOptionList } from '@/types/form-option'

const emit = defineEmits(['update:query'])

const props = defineProps({
  query: {
    type: Object,
    required: true,
  },
  options: {
    type: Array as PropType<Array<FormOptionList>>,
    required: true,
  },
  search: {
    type: Function,
    default: () => {},
  },
  reset: {
    type: Function,
    default: () => {},
  },
  layout: {
    type: Number,
    default: 3,
  },
  fixedButtons: {
    type: Boolean,
    default: false,
  },
})

// 使用本地状态来跟踪查询条件
const localQuery = reactive<Record<string, string | number | boolean>>({ ...props.query })

// 监听props.query的变化，同步到本地状态
watch(
  () => props.query,
  (newQuery) => {
    console.log('TableSearch - props.query 变化:', newQuery)
    // 深拷贝以避免引用问题
    Object.keys(localQuery).forEach((key) => {
      delete localQuery[key]
    })
    Object.assign(localQuery, JSON.parse(JSON.stringify(newQuery)))
  },
  { deep: true, immediate: true },
)

// 监听本地状态的变化，同步到父组件
watch(
  localQuery,
  (newLocalQuery) => {
    console.log('localQuery 变化，更新父组件:', newLocalQuery)
    emit('update:query', { ...newLocalQuery })
  },
  { deep: true },
)

const searchRef = ref<FormInstance>()
const resetForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return
  console.log('TableSearch - 开始重置表单')

  // 1. 重置本地查询条件
  Object.keys(localQuery).forEach((key) => {
    localQuery[key] = ''
  })
  console.log('TableSearch - 已清空本地查询条件:', { ...localQuery })

  // 2. 手动同步到父组件，确保更新立即生效
  emit('update:query', { ...localQuery })
  console.log('TableSearch - 已同步更新到父组件')

  // 3. 重置表单DOM状态
  formEl.resetFields()
  console.log('TableSearch - 已重置表单字段')

  // 4. 调用父组件的reset方法
  props.reset()
  console.log('TableSearch - 已调用父组件reset方法')
}

const search = () => {
  console.log('TableSearch - 搜索:', { ...localQuery })
  // 已经不需要手动触发更新，watch 会处理

  // 执行搜索
  props.search()
}

// 更新查询字段的通用方法
const updateQueryField = (field: string, value: string | number | boolean | null): void => {
  console.log(`TableSearch - 字段 ${field} 更新为:`, value, typeof value)
  localQuery[field] = value
  // 已经不需要手动触发更新，watch 会处理
}

// 处理输入框变化，支持onInput回调
const handleInputChange = (item: FormOptionList, value: string): void => {
  console.log(`TableSearch - 输入框 ${item.prop} 更新为:`, value)
  // 更新本地查询字段
  updateQueryField(item.prop, value)

  // 如果有onInput回调，调用它
  if (item.onInput && typeof item.onInput === 'function') {
    item.onInput(value)
  }
}

// 确保选项中的组件不会被设置为响应式
watch(
  () => props.options,
  (newOptions) => {
    // 处理组件以确保它们不是响应式的
    newOptions.forEach((item) => {
      if (item.type === 'custom' && item.component) {
        // 确保组件使用markRaw包装
        item.component = markRaw(item.component)
      }
    })
  },
  { deep: true, immediate: true },
)
</script>

<style scoped>
.search-container {
  background-color: #fff;
  margin-bottom: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
}

:deep(.el-form) {
  display: flex;
  flex-wrap: wrap;
  padding-right: 30px;
}

.form-items {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(var(--form-items-per-row), 1fr);
  gap: 20px;
  align-items: start;
  padding-top: 15px;
}

:deep(.el-form-item) {
  margin: 0;
  width: 100%;
  display: flex;
  align-items: center;
  min-height: 32px;
}

:deep(.el-form-item__label) {
  width: 100px !important;
  text-align: right;
  flex-shrink: 0;
  line-height: 32px;
  padding-right: 12px;
}

:deep(.el-form-item__content) {
  flex: 1;
  margin-left: 0 !important;
  line-height: 32px;
}

:deep(.el-input),
:deep(.el-select),
:deep(.el-date-picker) {
  width: 100%;
}

:deep(.el-input__wrapper),
:deep(.el-select__wrapper) {
  line-height: 32px;
}

.button-wrapper {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  min-height: 32px;
  grid-column: -2 / -1;
}

.button-group {
  display: flex;
  gap: 10px;
  padding-left: 100px;
}
</style>
