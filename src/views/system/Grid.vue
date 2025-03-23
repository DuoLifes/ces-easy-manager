<!-- 网格管理页面 -->
<template>
  <div class="page-container">
    <!-- 搜索表单 -->
    <TableSearch
      v-model:query="query"
      :options="searchOpt"
      :search="handleSearch"
      :reset="resetQuery"
      :layout="4"
      :fixed-buttons="true"
      class="table-search grid-search"
      ref="tableSearchRef"
      :key="searchFormKey"
    />

    <!-- 数据表格 -->
    <div class="container">
      <TableCustom
        :columns="columns"
        :tableData="tableData"
        :total="page.total"
        :currentPage="page.index"
        :pageSize="page.size"
        :pageSizes="[10, 15, 20]"
        :changePage="changePage"
        :sizeChange="handleSizeChange"
        :editFunc="(row: any) => handleEdit(row as Grid)"
        :delFunc="(row: any) => handleDelete(row as Grid)"
        :showView="false"
        :showEdit="true"
        :showDelete="true"
        :loading="loading"
        :max-height="650"
        title="网格列表"
        @addOperate="handleAdd"
      />
    </div>

    <!-- 编辑弹窗 -->
    <el-dialog
      v-model="visible"
      width="500px"
      destroy-on-close
      :close-on-click-modal="false"
      @close="closeDialog"
    >
      <template #header>
        <DialogTitle :title="isEdit ? '编辑网格' : '新增网格'" />
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
import type { Grid } from '@/types/grid'
import type { FormOption, FormOptionList } from '@/types/form-option'
import { fetchGridData, addGrid, updateGrid, deleteGrid } from '@/api/grid'

// 导入组件
import TableCustom from '@/components/common/table-custom.vue'
import TableSearch from '@/components/common/table-search.vue'
import TableEdit from '@/components/common/table-edit.vue'
import DialogTitle from '@/components/common/dialog-title.vue'
import TenantSelect from '@/components/tenant/TenantSelect.vue'
import CompanySelect from '@/components/company/CompanySelect.vue'

// 为组件定义名称
defineOptions({
  name: 'GridManagementView',
})

/**
 * 状态变量
 */
// 查询条件
const query = reactive({
  tenantId: '',
  companyId: '',
  gridName: '',
})

// 跟踪选择的值
const selectedTenantId = ref<number | string>(0)
const selectedCompanyId = ref<number | string>(0)
const inputGridName = ref('')

/**
 * 处理运营商选择变化
 * @param value - 选择的运营商ID
 */
const handleTenantChange = (value: number | string): void => {
  selectedTenantId.value = value
}

/**
 * 处理局点选择变化
 * @param value - 选择的局点ID
 */
const handleCompanyChange = (value: number | string): void => {
  selectedCompanyId.value = value
}

/**
 * 处理网格名称输入变化
 * @param value - 输入的网格名称
 */
const handleGridNameInput = (value: string): void => {
  inputGridName.value = value
}

// 分页配置
const page = reactive({
  index: 1,
  size: 10,
  total: 0,
})

// 表格数据
const tableData = ref<Grid[]>([])

// 弹窗控制
const visible = ref(false)
const isEdit = ref(false)
const rowData = ref<Partial<Grid>>({})

// 表单引用
const tableSearchRef = ref()
const searchFormKey = ref(0) // 用于强制刷新表单

// 加载状态
const loading = ref(false)

/**
 * 配置定义
 */
// 查询表单配置
const searchOpt = ref<FormOptionList[]>([
  {
    type: 'custom',
    label: '运营商：',
    prop: 'tenantId',
    placeholder: '全部',
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
    type: 'custom',
    label: '局点名称：',
    prop: 'companyId',
    placeholder: '请选择局点',
    component: markRaw(CompanySelect),
    props: {
      tenantId: '',
      showAll: true,
      allLabel: '全部',
      allValue: 0,
      clearable: true,
      onChange: handleCompanyChange,
    },
  },
  {
    type: 'input',
    label: '网格名称：',
    prop: 'gridName',
    placeholder: '请输入网格名称',
    props: {
      onInput: handleGridNameInput,
    },
  },
])

// 表格列配置
const columns = ref([
  { prop: 'tenantName', label: '运营商' },
  { prop: 'companyName', label: '局点名称' },
  { prop: 'gridName', label: '网格名称' },
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
        showAll: false,
        clearable: false,
        placeholder: '请选择运营商',
      },
    },
    {
      type: 'custom',
      label: '局点名称',
      prop: 'companyId',
      placeholder: '请选择局点',
      required: true,
      component: markRaw(CompanySelect),
      props: {
        tenantId: '', // 会在设置rowData时动态更新
        showAll: false,
        clearable: false,
        placeholder: '请选择局点',
      },
    },
    {
      type: 'input',
      label: '网格名称',
      prop: 'gridName',
      placeholder: '请输入网格名称',
      required: true,
    },
  ],
})

/**
 * 获取表格数据
 */
const getData = async (): Promise<void> => {
  try {
    // 显示加载状态
    loading.value = true

    // 构造API参数，使用直接跟踪的值
    const params = {
      tenantId: selectedTenantId.value ? Number(selectedTenantId.value) : undefined,
      companyId: selectedCompanyId.value ? Number(selectedCompanyId.value) : undefined,
      name: inputGridName.value || undefined,
      pageNo: page.index,
      pageSize: page.size,
    }

    const res = await fetchGridData(params)

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
// 重置查询条件
const resetQuery = (): void => {
  // 1. 重置跟踪变量
  selectedTenantId.value = 0
  selectedCompanyId.value = 0
  inputGridName.value = ''

  // 2. 强制重置query对象
  query.tenantId = ''
  query.companyId = ''
  query.gridName = ''

  // 3. 强制刷新整个表单组件
  searchFormKey.value += 1

  // 4. 重置分页参数
  resetPagination()

  // 5. 重新加载数据
  getData()
}

// 执行查询
const handleSearch = (): void => {
  // 重置分页参数
  resetPagination()
  // 重新加载数据
  getData()
}

/**
 * 分页相关方法
 */
// 页码变化
const changePage = (val: number): void => {
  // 更新页码
  page.index = val
  // 重新加载数据
  getData()
}

// 每页条数变化
const handleSizeChange = (val: number): void => {
  // 更新每页条数
  page.size = val
  // 重置到第一页
  page.index = 1
  // 重新加载数据
  getData()
}

/**
 * 表单操作方法
 */
// 新增网格
const handleAdd = (): void => {
  // 初始化默认值
  rowData.value = {
    tenantId: '',
    companyId: '',
    gridName: '',
  }

  // 更新局点选择器的租户ID初始值
  updateCompanySelectTenantId('')

  isEdit.value = false
  visible.value = true
}

// 更新局点选择器的租户ID
const updateCompanySelectTenantId = (tenantId: number | string): void => {
  if (options.value.list && options.value.list.length > 1) {
    const companyOption = options.value.list[1]
    if (companyOption && companyOption.props) {
      companyOption.props.tenantId = tenantId
    }
  }
}

// 编辑网格
const handleEdit = (row: Grid): void => {
  // 准备编辑数据
  rowData.value = { ...row }

  // 确保租户ID是数字类型，并更新局点选择器的过滤条件
  if (rowData.value.tenantId) {
    updateCompanySelectTenantId(rowData.value.tenantId)
  }

  isEdit.value = true
  visible.value = true
}

// 关闭弹窗
const closeDialog = (): void => {
  visible.value = false
  isEdit.value = false
  rowData.value = {}
}

/**
 * CRUD操作方法
 */
// 删除网格
const handleDelete = async (row: Grid): Promise<void> => {
  try {
    const res = await deleteGrid(row.id)
    if (res.code === '00000') {
      ElMessage.success('删除成功')
      await getData()
    } else {
      ElMessage.error(res.msg || '删除失败')
    }
  } catch {
    ElMessage.error('删除失败')
  }
}

// 更新网格信息
const handleUpdate = async (formData: Partial<Grid>): Promise<void> => {
  try {
    if (!formData.tenantId || !formData.companyId || !formData.gridName) {
      ElMessage.error('请填写必填字段')
      return
    }

    // 转换为数字类型以确保API正确处理
    const tenantId = Number(formData.tenantId)
    const companyId = Number(formData.companyId)

    if (isNaN(tenantId) || isNaN(companyId)) {
      ElMessage.error('运营商或局点ID格式无效')
      return
    }

    if (!isEdit.value) {
      // 新增网格
      const res = await addGrid({
        tenantId: tenantId,
        companyId: companyId,
        gridName: formData.gridName,
        creator: 'admin', // 默认使用admin作为创建者，实际项目中应该使用当前登录用户
      })

      if (res.code === '00000') {
        ElMessage.success('添加成功')
        closeDialog()
        getData()
      } else {
        ElMessage.error(res.msg || '添加失败')
      }
    } else {
      // 编辑网格
      const res = await updateGrid({
        id: Number(formData.id),
        tenantId: tenantId,
        companyId: companyId,
        gridName: formData.gridName,
      })

      if (res.code === '00000') {
        ElMessage.success('更新成功')
        closeDialog()
        getData()
      } else {
        ElMessage.error(res.msg || '更新失败')
      }
    }
  } catch {
    ElMessage.error('操作失败')
  }
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

/* 网格管理特有的查询条件样式 */
.grid-search :deep(.el-form-item__content) {
  max-width: 280px;
}
</style>
