<template>
  <div class="page-container">
    <TableSearch
      v-model:query="query"
      :options="searchOpt"
      :search="handleSearch"
      :reset="resetQuery"
      :layout="4"
      :fixed-buttons="true"
      class="table-search company-search"
      ref="tableSearchRef"
      :key="searchFormKey"
    />
    <div class="container">
      <TableCustom
        :columns="columns"
        :tableData="tableData"
        :total="page.total"
        :changePage="changePage"
        :currentPage="page.index"
        :pageSize="page.size"
        :pageSizes="[10, 15, 20]"
        :sizeChange="handleSizeChange"
        :editFunc="handleEdit"
        :delFunc="handleDelete"
        :showView="false"
        :showEdit="true"
        :showDelete="true"
        :loading="loading"
        :max-height="650"
        title="局点列表"
        @addOperate="handleAdd"
      />
    </div>
    <el-dialog
      v-model="visible"
      width="500px"
      destroy-on-close
      :close-on-click-modal="false"
      @close="closeDialog"
    >
      <template #header>
        <DialogTitle :title="isEdit ? '编辑局点' : '新增局点'" />
      </template>
      <TableEdit
        :form-data="rowData"
        :options="options"
        :edit="isEdit"
        :update="handleUpdate"
        @cancel="closeDialog"
      />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, markRaw } from 'vue'
import { ElMessage } from 'element-plus'
import type { Company } from '@/types/company'
import type { FormOption, FormOptionList } from '@/types/form-option'
import { fetchCompanyData, addCompany, updateCompany, deleteCompany } from '@/api/company'

// 导入组件
import TableCustom from '@/components/common/table-custom.vue'
import TableSearch from '@/components/common/table-search.vue'
import TableEdit from '@/components/common/table-edit.vue'
import DialogTitle from '@/components/common/dialog-title.vue'
import TenantSelect from '@/components/tenant/TenantSelect.vue'

/**
 * API 响应数据接口
 */
interface ApiResponse<T> {
  code: string
  msg: string
  data: T
}

// 为组件定义名称
defineOptions({
  name: 'CompanyManagementView',
})

/**
 * 状态定义
 */
// 查询条件
const query = reactive({
  tenantId: '',
  companyName: '',
})

// 跟踪选择的值
const selectedTenantId = ref<number | string>(0)
const inputCompanyName = ref('')

/**
 * 处理运营商选择变化
 * @param value - 选择的运营商ID
 */
const handleTenantChange = (value: number | string): void => {
  selectedTenantId.value = value
}

/**
 * 处理局点名称输入变化
 * @param value - 输入的局点名称
 */
const handleCompanyNameInput = (value: string): void => {
  inputCompanyName.value = value
}

// 分页配置
const page = reactive({
  index: 1,
  size: 10,
  total: 0,
})

// 表格数据
const tableData = ref<Company[]>([])
const visible = ref(false)
const isEdit = ref(false)
const rowData = ref<Partial<Company>>({})
const loading = ref(false)
const tableSearchRef = ref()
const searchFormKey = ref(0) // 用于强制刷新表单

/**
 * 配置项定义
 */
// 查询表单配置
const searchOpt = ref<FormOptionList[]>([
  {
    type: 'custom',
    label: '运营商：',
    prop: 'tenantId',
    placeholder: '请选择运营商',
    component: markRaw(TenantSelect),
    props: {
      showAll: true,
      allLabel: '全部',
      allValue: 0,
      clearable: true,
      onChange: handleTenantChange,
    },
  },
  {
    type: 'input',
    label: '局点名称：',
    prop: 'companyName',
    placeholder: '请输入局点名称',
    onInput: handleCompanyNameInput,
  },
])

// 表格列配置
const columns = ref([
  { prop: 'tenantName', label: '运营商' },
  { prop: 'name', label: '局点名称' },
  { prop: 'description', label: '局点描述' },
  { prop: 'operatorName', label: '创建人' },
  { prop: 'createTime', label: '创建时间' },
  { prop: 'updateTime', label: '更新时间' },
  { prop: 'operator', label: '操作', width: 250 },
])

// 表单配置
const options = ref<FormOption>({
  labelWidth: '100px',
  span: 24,
  list: [
    {
      type: 'custom',
      label: '运营商',
      prop: 'tenantId',
      required: true,
      component: markRaw(TenantSelect),
      props: {
        clearable: false,
      },
    },
    {
      type: 'input',
      label: '局点名称',
      prop: 'name',
      placeholder: '请输入',
      required: true,
    },
    {
      type: 'textarea',
      label: '局点描述',
      prop: 'description',
      placeholder: '请输入',
      required: false,
    },
  ],
})

/**
 * 数据处理方法
 */
/**
 * 获取表格数据
 */
const getData = async (): Promise<void> => {
  try {
    // 显示加载状态
    loading.value = true

    // 构造API参数，使用直接跟踪的值
    const params = {
      tenantId: Number(selectedTenantId.value) || 0,
      companyName: inputCompanyName.value || '',
      pageNo: page.index,
      pageSize: page.size,
    }

    const res = await fetchCompanyData(params)

    if (res.code === '00000') {
      // 更新表格数据和总数
      tableData.value = res.data.records || []
      page.total = res.data.total || 0
    } else {
      ElMessage.error(res.msg || '获取数据失败')
      // 清空数据
      tableData.value = []
      page.total = 0
    }
  } catch {
    // 错误处理
    ElMessage.error('获取数据失败')
    // 清空数据
    tableData.value = []
    page.total = 0
  } finally {
    // 隐藏加载状态
    loading.value = false
  }
}

/**
 * 重置分页参数
 */
const resetPagination = (): void => {
  page.index = 1
  page.size = 10
  page.total = 0
}

/**
 * 查询相关方法
 */
/**
 * 重置查询条件 - 由TableSearch组件内部调用
 */
const resetQuery = (): void => {
  // 1. 重置跟踪变量
  selectedTenantId.value = 0
  inputCompanyName.value = ''

  // 2. 强制重置query对象
  query.tenantId = ''
  query.companyName = ''

  // 3. 强制刷新整个表单组件
  searchFormKey.value += 1

  // 4. 重置分页参数
  resetPagination()

  // 5. 重新获取数据
  getData()
}

/**
 * 执行查询
 */
const handleSearch = (): void => {
  // 重置分页参数
  resetPagination()
  // 重新加载数据
  getData()
}

/**
 * 分页相关方法
 */
/**
 * 页码变化处理
 * @param val - 新的页码
 */
const changePage = (val: number): void => {
  // 更新页码
  page.index = val
  // 重新加载数据
  getData()
}

/**
 * 每页条数变化处理
 * @param val - 新的每页条数
 */
const handleSizeChange = (val: number): void => {
  // 更新每页条数
  page.size = val
  // 重置到第一页
  page.index = 1
  // 重新加载数据
  getData()
}

/**
 * 事件处理方法
 */
/**
 * 添加局点
 */
const handleAdd = (): void => {
  // 设置默认值，确保表单验证能通过
  rowData.value = {
    tenantId: '', // 初始为空，让用户选择
    name: '',
    description: '',
  }
  isEdit.value = false
  visible.value = true
}

/**
 * 编辑局点
 * @param row - 要编辑的局点数据
 */
const handleEdit = (row: Company): void => {
  rowData.value = { ...row }
  isEdit.value = true
  visible.value = true
}

/**
 * 处理删除操作
 * @param row - 要删除的局点数据
 */
const handleDelete = async (row: Company): Promise<void> => {
  try {
    const res = await deleteCompany(row.id)
    if (res.code === '00000') {
      ElMessage.success('删除成功')
      await getData() // 刷新列表
    } else {
      ElMessage.error(res.msg || '删除失败')
    }
  } catch {
    ElMessage.error('删除失败')
  }
}

/**
 * 处理更新操作
 * @param formData - 表单数据
 */
const handleUpdate = async (formData: Partial<Company>): Promise<void> => {
  try {
    // 检查必填字段
    if (formData.tenantId === undefined || formData.tenantId === '' || !formData.name) {
      ElMessage.error('请填写必填字段')
      return
    }

    // 确保tenantId是数字类型
    const tenantId =
      typeof formData.tenantId === 'string'
        ? parseInt(formData.tenantId)
        : (formData.tenantId as number)

    if (!isEdit.value) {
      // 新增局点
      const res = (await addCompany({
        tenantId: tenantId,
        name: formData.name,
        description: formData.description || '',
      })) as ApiResponse<Company>

      if (res.code === '00000') {
        ElMessage.success('添加成功')
        closeDialog()
        getData() // 刷新列表
      } else {
        ElMessage.error(res.msg || '添加失败')
      }
    } else {
      // 编辑局点
      const res = (await updateCompany({
        id: formData.id!,
        tenantId: tenantId,
        name: formData.name,
        description: formData.description || '',
      })) as ApiResponse<Company>

      if (res.code === '00000') {
        ElMessage.success('更新成功')
        closeDialog()
        getData() // 刷新列表
      } else {
        ElMessage.error(res.msg || '更新失败')
      }
    }
  } catch {
    ElMessage.error('操作失败')
  }
}

/**
 * 关闭对话框
 */
const closeDialog = (): void => {
  visible.value = false
  isEdit.value = false
  rowData.value = {}
}

// 初始化加载数据
getData()
</script>

<style scoped>
/* 页面特有样式 */
.table-search {
  padding: 16px;
  background-color: #fff;
  border-radius: 4px;
  margin-bottom: 10px;
}

/* 局点管理特有的查询条件样式 */
.company-search :deep(.el-form-item__content) {
  max-width: 280px;
}
</style>
