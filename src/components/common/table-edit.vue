<template>
  <el-form
    ref="formRef"
    :model="form"
    :rules="rules"
    :label-width="options.labelWidth"
    :validate-on-rule-change="false"
    status-icon
  >
    <el-row>
      <el-col :span="options.span" v-for="item in options.list" :key="item.prop">
        <el-form-item :label="item.label" :prop="item.prop">
          <!-- 文本框、数字框、下拉框、日期框、开关、上传 -->
          <el-input
            v-if="item.type === 'input'"
            v-model="form[item.prop]"
            :disabled="item.disabled"
            :placeholder="item.placeholder"
            clearable
          ></el-input>
          <el-input-number
            v-else-if="item.type === 'number'"
            v-model="form[item.prop]"
            :disabled="item.disabled"
            controls-position="right"
          ></el-input-number>
          <el-select
            v-else-if="item.type === 'select' && !item.component"
            v-model="form[item.prop]"
            :disabled="item.disabled"
            :placeholder="item.placeholder"
            clearable
          >
            <el-option
              v-for="opt in item.opts"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
            ></el-option>
          </el-select>
          <el-input
            v-else-if="item.type === 'textarea'"
            v-model="form[item.prop]"
            :disabled="item.disabled"
            :placeholder="item.placeholder"
            type="textarea"
            :rows="4"
          ></el-input>
          <el-date-picker
            v-else-if="item.type === 'date'"
            type="date"
            v-model="form[item.prop]"
            :value-format="item.format"
          ></el-date-picker>
          <el-switch
            v-else-if="item.type === 'switch'"
            v-model="form[item.prop]"
            :active-value="item.activeValue"
            :inactive-value="item.inactiveValue"
            :active-text="item.activeText"
            :inactive-text="item.inactiveText"
          ></el-switch>
          <el-upload
            v-else-if="item.type === 'upload'"
            class="avatar-uploader"
            action="#"
            :show-file-list="false"
            :on-success="handleAvatarSuccess"
          >
            <img v-if="form[item.prop]" :src="form[item.prop]" class="avatar" />
            <el-icon v-else class="avatar-uploader-icon">
              <Plus />
            </el-icon>
          </el-upload>
          <component
            v-else-if="item.type === 'custom' && item.component"
            :is="item.component"
            v-model="form[item.prop]"
            v-bind="item.props || {}"
            class="custom-component"
          ></component>
          <slot :name="item.prop" v-else> </slot>
        </el-form-item>
      </el-col>
    </el-row>

    <div class="dialog-footer">
      <el-button type="primary" @click="submitForm(formRef)">确 定</el-button>
      <el-button @click="cancelEdit">取 消</el-button>
    </div>
  </el-form>
</template>
<!-- eslint-disable @typescript-eslint/no-unused-vars -->
<script lang="ts" setup>
import type { FormOption } from '@/types/form-option'
import type { FormInstance, FormRules, UploadProps, FormItemRule } from 'element-plus'
import type { PropType } from 'vue'
import { ref, watch, markRaw } from 'vue'

const { options, formData, edit, update } = defineProps({
  options: {
    type: Object as PropType<FormOption>,
    required: true,
  },
  formData: {
    type: Object,
    required: true,
  },
  edit: {
    type: Boolean,
    required: false,
  },
  update: {
    type: Function,
    required: true,
  },
})

// 触发取消事件
const emit = defineEmits(['cancel'])

// 取消编辑的方法
const cancelEdit = () => {
  emit('cancel')
}

const form = ref({ ...(edit ? formData : {}) })
const formRef = ref<FormInstance>()

// 确保选项中的组件不会被设置为响应式
watch(
  () => options,
  (newOptions) => {
    if (newOptions && newOptions.list) {
      // 处理组件以确保它们不是响应式的
      newOptions.list.forEach((item) => {
        if (item.type === 'custom' && item.component) {
          // 确保组件使用markRaw包装
          item.component = markRaw(item.component)
        }
      })
    }
  },
  { deep: true, immediate: true },
)

// 生成校验规则
const rules: FormRules = options.list.reduce((acc, item) => {
  if (item.required) {
    const baseRule: FormItemRule = {
      required: true,
      message: `请选择${item.label}`,
      trigger: item.type === 'select' || item.type === 'custom' ? 'change' : 'blur',
    }

    // 根据字段类型添加额外的校验规则
    const fieldRules: FormItemRule[] = [baseRule]

    if (item.type === 'input') {
      baseRule.whitespace = true // 不允许纯空格
      baseRule.message = `请输入${item.label}`
    } else if (item.type === 'number') {
      fieldRules.push({
        type: 'number',
        message: `${item.label}必须是数字`,
        trigger: 'change',
      })
    } else if (item.type === 'custom') {
      // 为自定义组件添加特殊验证，允许数字0作为有效值
      baseRule.validator = (rule, value, callback) => {
        if (value === 0 || value) {
          callback()
        } else {
          callback(new Error(baseRule.message as string))
        }
      }
    }

    acc[item.prop] = fieldRules
  }
  return acc
}, {} as FormRules)

// 提交表单
const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return

  try {
    await formEl.validate((valid) => {
      if (valid) {
        update(form.value)
      } else {
      }
    })
  } catch (e) {}
}

// 重置表单方法
const resetFields = () => {
  if (formRef.value) {
    formRef.value.resetFields()
  }
}

// 暴露方法给父组件
defineExpose({
  resetFields,
})

const handleAvatarSuccess: UploadProps['onSuccess'] = (response, uploadFile) => {
  form.value.thumb = URL.createObjectURL(uploadFile.raw!)
}
</script>

<style>
.avatar-uploader .el-upload {
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
}

.avatar-uploader .el-upload:hover {
  border-color: var(--el-color-primary);
}

.el-icon.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  text-align: center;
}

.dialog-footer {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.dialog-footer :deep(.el-form-item__content) {
  justify-content: center;
  margin-left: 0 !important;
}

.dialog-footer .el-button {
  padding-left: 25px;
  padding-right: 25px;
  margin: 0 10px;
}

/* 确保所有表单控件宽度一致 */
:deep(.el-select),
:deep(.el-input),
:deep(.el-textarea),
:deep(.el-date-picker),
:deep(.el-input-number) {
  width: 90%;
}

/* 自定义组件也应用相同的宽度限制 */
:deep(.custom-component) {
  width: 90% !important; /* 强制应用此宽度，覆盖组件内部样式 */
  display: inline-block;
}
</style>
