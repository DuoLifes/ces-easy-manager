<!-- 网格管理页面 -->
<template>
  <div class="page-container">
    <!-- 搜索表单 -->
    <TableSearch
      :query="query"
      :options="searchOpt"
      :search="handleSearch"
      :reset="resetQuery"
      :layout="4"
      :fixed-buttons="true"
      class="table-search"
      @update:query="handleQueryUpdate"
      @update:tenantId="handleTenantUpdate"
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
        :editFunc="handleEdit"
        :delFunc="handleDelete"
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
      @open="handleDialogOpen"
      @closed="handleDialogClosed"
    >
      <template #header>
        <DialogTitle :title="isEdit ? '编辑网格' : '新增网格'" />
      </template>
      <TableEdit
        ref="editFormRef"
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
import { ref, reactive, watch, markRaw, provide } from 'vue'
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
 * 接口定义
 */
// 表格行数据通用类型
type TableRowData = Record<string, unknown>

/**
 * 状态变量
 */
// 查询条件
const query = reactive({
  tenantId: '',
  companyId: '',
  gridName: '',
})

// 标记是否是由局点反向填充触发的运营商变更
const isFromCompanyReverseFill = ref(false)

// 记录最后一次局点反向填充触发的时间戳
const lastCompanyReverseFillTime = ref(0)

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
const editFormRef = ref()

// 标记是否是由局点反向填充触发的表单中运营商变更
const isFormReverseFilling = ref(false)

// 记录最后一次表单中局点反向填充触发的时间戳
const lastFormReverseFillTime = ref(0)

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
      onChange: () => {
        // 标记这是用户手动选择的运营商变化，不是由局点反向填充触发的
        isFromCompanyReverseFill.value = false
        // 重置上次反向填充的时间戳，确保它不干扰当前操作
        lastCompanyReverseFillTime.value = 0
      },
    },
  },
  {
    type: 'custom',
    label: '局点名称：',
    prop: 'companyId',
    placeholder: '请选择局点',
    component: markRaw(CompanySelect),
    props: {
      tenantId: query.tenantId || '',
      showAll: true,
      allLabel: '全部',
      allValue: 0,
      enableReverseSelect: true,
      clearable: true,
      'onUpdate:tenantId': (value: string | number) => {
        // 设置反向填充标记和时间戳
        isFromCompanyReverseFill.value = true
        lastCompanyReverseFillTime.value = Date.now()
        // 如果运营商值发生变化，则更新
        if (query.tenantId !== String(value)) {
          query.tenantId = value ? String(value) : ''
          // 更新局点选择器的租户ID（确保立即更新）
          if (searchOpt.value && searchOpt.value.length > 1) {
            const companyOption = searchOpt.value[1]
            if (companyOption.props) {
              companyOption.props.tenantId = value ? String(value) : ''
            }
          }
        }
      },
    },
  },
  {
    type: 'input',
    label: '网格名称：',
    prop: 'gridName',
    placeholder: '请输入网格名称',
  },
])

// 表格列配置
const columns = ref([
  { prop: 'tenantName', label: '运营商' },
  { prop: 'companyName', label: '局点名称' },
  { prop: 'gridName', label: '网格名称' },
  { prop: 'creator', label: '创建人' },
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
        onChange: () => {
          // 标记这是用户手动选择的运营商变化，不是由局点反向填充触发的
          isFormReverseFilling.value = false
          // 重置上次反向填充的时间戳，确保它不干扰当前操作
          lastFormReverseFillTime.value = 0
        },
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
        tenantId: rowData.value.tenantId || '',
        showAll: false,
        clearable: false,
        enableReverseSelect: true,
        'onUpdate:tenantId': (value: string | number) => {
          // 设置标记，表示当前是由局点反向填充触发的运营商变更
          isFormReverseFilling.value = true
          // 记录表单中反向填充的时间戳
          lastFormReverseFillTime.value = Date.now()
          // 检查值是否变化，如果变化则更新
          if (rowData.value.tenantId !== String(value)) {
            rowData.value.tenantId = value ? String(value) : ''
          }
        },
      },
    },
    {
      type: 'input',
      label: '网格名称',
      prop: 'gridName',
      placeholder: '请输入',
      required: true,
    },
  ],
})

/**
 * 数据处理方法
 */
// 获取表格数据
const getData = async (): Promise<void> => {
  try {
    // 显示加载状态
    loading.value = true
    const res = await fetchGridData({
      tenantId: query.tenantId === '0' ? undefined : query.tenantId,
      companyId: query.companyId === '0' ? undefined : query.companyId,
      gridName: query.gridName || undefined,
      pageNo: page.index,
      pageSize: page.size,
    })
    if (res.code === 200) {
      // 更新表格数据和总数
      tableData.value = res.data.list || []
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
// 处理查询对象更新
const handleQueryUpdate = (newQuery: typeof query): void => {
  const oldTenantId = query.tenantId
  const newTenantId = newQuery.tenantId

  // 更新查询条件
  Object.assign(query, newQuery)
  // 检查是否是运营商发生了变化
  if (oldTenantId !== newTenantId) {
    // 这里直接设置，而不是依赖 watch
    // 找到局点组件配置，动态更新其tenantId属性
    if (searchOpt.value && searchOpt.value.length > 1) {
      const companyOption = searchOpt.value[1]
      if (companyOption.props) {
        companyOption.props.tenantId = newTenantId || ''
      }
    }
    // 如果是手动选择了运营商，则清空局点选择
    if (query.companyId && !isFromCompanyReverseFill.value) {
      query.companyId = ''
    } else {
    }
  }
}

// 重置查询条件
const resetQuery = (): void => {
  // 重置查询条件
  query.tenantId = ''
  query.companyId = ''
  query.gridName = ''
  // 重置分页参数
  resetPagination()
  // 重新加载数据
  getData()
}

// 处理租户ID直接更新
const handleTenantUpdate = (tenantId: string | number): void => {
  // 设置标记，表示当前是由局点反向填充触发的运营商变更
  isFromCompanyReverseFill.value = true
  // 记录当前时间戳
  lastCompanyReverseFillTime.value = Date.now()
  // 更新查询条件中的tenantId
  const newTenantId = tenantId ? String(tenantId) : ''
  if (query.tenantId !== newTenantId) {
    // 保存旧值，用于比较
    // 更新tenantId
    query.tenantId = newTenantId
    // 更新局点选择器的租户ID
    if (searchOpt.value && searchOpt.value.length > 1) {
      const companyOption = searchOpt.value[1]
      if (companyOption.props) {
        companyOption.props.tenantId = newTenantId
      }
    }
    // 这里不需要清空局点选择，因为这是由局点反向填充触发的
  }
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
  rowData.value = {}
  isEdit.value = false
  visible.value = true
}

// 编辑网格
const handleEdit = (row: TableRowData): void => {
  visible.value = true
  isEdit.value = true

  // 将旧的tenant和companyName属性转换为新的tenantId和companyId属性
  const gridData = { ...row } as Record<string, unknown>
  rowData.value = {
    id: Number(gridData.id),
    tenantId: String(gridData.tenantId || ''),
    companyId: String(gridData.companyId || ''),
    gridName: String(gridData.gridName || ''),
    creator: String(gridData.creator || ''),
    createTime: String(gridData.createTime || ''),
    updateTime: String(gridData.updateTime || ''),
  }
}

// 关闭弹窗
const closeDialog = (): void => {
  visible.value = false
  // 延迟重置数据，等待动画完成
  setTimeout(() => {
    isEdit.value = false
    rowData.value = {}
  }, 100)
}

/**
 * CRUD操作方法
 */
// 删除网格
const handleDelete = async (row: TableRowData): Promise<void> => {
  try {
    const grid = row as unknown as Grid
    const res = await deleteGrid(grid.id)
    if (res.code === 200) {
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

    if (!isEdit.value) {
      // 新增网格
      const res = await addGrid({
        tenantId: formData.tenantId,
        companyId: formData.companyId,
        gridName: formData.gridName,
        creator: 'admin', // 默认使用admin作为创建者，实际项目中应该使用当前登录用户
      })

      if (res.code === 200) {
        ElMessage.success('添加成功')
        closeDialog()
        getData()
      } else {
        ElMessage.error(res.msg || '添加失败')
      }
    } else {
      // 编辑网格
      const res = await updateGrid({
        id: formData.id!,
        tenantId: formData.tenantId,
        companyId: formData.companyId,
        gridName: formData.gridName,
      })

      if (res.code === 200) {
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

// 对话框事件处理
const handleDialogOpen = (): void => {
  // 对话框打开后，等一小段时间再重置表单，确保组件已挂载
  setTimeout(() => {
    if (editFormRef.value) {
      editFormRef.value.resetFields()
    }

    // 更新CompanySelect组件的tenantId属性
    if (options.value.list && options.value.list.length > 1) {
      const companyOption = options.value.list[1]
      if (companyOption.props) {
        companyOption.props.tenantId = rowData.value.tenantId || ''
      }
    }
  }, 100)
}
const handleDialogClosed = (): void => {
  // 不需要在这里调用closeDialog，因为closed事件在关闭后触发
}

// 监听运营商变化，更新局点选择器的props
watch(
  () => query.tenantId,
  (newTenantId, oldTenantId) => {
    // 获取当前时间与上次反向填充时间的差值
    const timeSinceLastReverseFill = Date.now() - lastCompanyReverseFillTime.value
    // 判断是否是由反向填充触发的变更 - 如果在1000ms内，认为是由反向填充触发的
    const isFromReverseFill = timeSinceLastReverseFill < 1000
    // 更新searchOpt中CompanySelect的tenantId属性
    if (searchOpt.value && searchOpt.value.length > 1) {
      const companyOption = searchOpt.value[1]
      if (companyOption.props) {
        companyOption.props.tenantId = newTenantId || ''
      }
    }
    // 只有在不是由局点反向填充触发的情况下，才根据运营商变化清空局点选择
    if (!isFromReverseFill && oldTenantId !== newTenantId) {
      if (query.companyId) {
        query.companyId = ''
      }
    } else if (isFromReverseFill) {
    }

    // 对事件处理完毕后，重置标记
    isFromCompanyReverseFill.value = false
  },
  { flush: 'post' }, // 添加 flush: 'post' 选项以确保在所有DOM更新后执行
)

// 监听弹窗中运营商变化，更新局点选择器的tenantId属性
watch(
  () => rowData.value.tenantId,
  (newTenantId, oldTenantId) => {
    // 获取当前时间与上次反向填充时间的差值
    const timeSinceLastReverseFill = Date.now() - lastFormReverseFillTime.value
    // 判断是否是由反向填充触发的变更 - 如果在1000ms内，认为是由反向填充触发的
    const isFromReverseFill = timeSinceLastReverseFill < 1000
    // 更新options中CompanySelect的tenantId属性
    if (options.value.list && options.value.list.length > 1) {
      const companyOption = options.value.list[1]
      if (companyOption.props) {
        companyOption.props.tenantId = newTenantId || ''
      }
    }

    // 只有在不是由局点反向填充触发的情况下，才清空局点选择
    if (!isFromReverseFill && oldTenantId !== newTenantId) {
      if (rowData.value.companyId) {
        rowData.value.companyId = ''
      }
    } else if (isFromReverseFill) {
    }
    // 对事件处理完毕后，重置标记
    isFormReverseFilling.value = false
  },
  { flush: 'post' }, // 添加 flush: 'post' 选项以确保在所有DOM更新后执行
)

// 提供全局函数用于更新局点组件的 tenantId
provide('updateGridTenantId', (tenantId: string | number) => {
  // 设置标记，表示当前是由局点反向填充触发的运营商变更
  isFromCompanyReverseFill.value = true
  // 记录当前时间戳
  lastCompanyReverseFillTime.value = Date.now()
  if (visible.value) {
    isFormReverseFilling.value = true
    // 记录表单中反向填充的时间戳
    lastFormReverseFillTime.value = Date.now()
  }
  // 更新查询条件中的tenantId
  query.tenantId = tenantId ? String(tenantId) : ''
  // 找到局点组件配置，动态更新其tenantId属性
  if (searchOpt.value && searchOpt.value.length > 1) {
    const companyOption = searchOpt.value[1]
    if (companyOption.props) {
      companyOption.props.tenantId = tenantId ? String(tenantId) : ''
    }
  }
  // 更新编辑表单中的tenantId（如果弹窗打开）
  if (visible.value && options.value.list && options.value.list.length > 1) {
    rowData.value.tenantId = tenantId ? String(tenantId) : ''
    // 更新CompanySelect组件的tenantId
    const companyOption = options.value.list[1]
    if (companyOption.props) {
      companyOption.props.tenantId = tenantId ? String(tenantId) : ''
    }
  }

  // 不再使用定时器重置标记
})

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
</style>
