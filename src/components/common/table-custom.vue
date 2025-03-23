<template>
  <div>
    <div class="table-toolbar" v-if="hasToolbar">
      <div class="table-toolbar-left">
        <div class="table-title">
          <div class="title-bar"></div>
          <span>{{ title || '数据列表' }}</span>
        </div>
        <slot name="toolbarBtn"></slot>
      </div>
      <div class="table-toolbar-right flex-center">
        <el-button type="primary" :icon="CirclePlusFilled" @click="addOperate">{{
          addButtonText || '新增'
        }}</el-button>

        <!-- <template v-if="multipleSelection.length > 0">
                    <el-tooltip effect="dark" content="删除选中" placement="top">
                        <el-icon class="columns-setting-icon" @click="delSelection(multipleSelection)">
                            <Delete />
                        </el-icon>
                    </el-tooltip>
                    <el-divider direction="vertical" />
                </template>
                <el-tooltip effect="dark" content="刷新" placement="top">
                    <el-icon class="columns-setting-icon" @click="refresh">
                        <Refresh />
                    </el-icon>
                </el-tooltip>
                <el-divider direction="vertical" />
                <el-tooltip effect="dark" content="列设置" placement="top">
                    <el-dropdown :hide-on-click="false" size="small" trigger="click">
                        <el-icon class="columns-setting-icon">
                            <Setting />
                        </el-icon>
                        <template #dropdown>
                            <el-dropdown-menu>
                                <el-dropdown-item v-for="c in columns">
                                    <el-checkbox v-model="c.visible" :label="c.label" />
                                </el-dropdown-item>
                            </el-dropdown-menu>
                        </template>
                    </el-dropdown>
                </el-tooltip> -->
      </div>
    </div>
    <el-table
      class="mgb20"
      :style="{ width: '100%' }"
      border
      :data="tableData"
      :row-key="rowKey"
      :max-height="maxHeight"
      @selection-change="handleSelectionChange"
      table-layout="auto"
      v-loading="loading"
      element-loading-text="加载中..."
    >
      <template v-for="item in columns" :key="item.prop">
        <el-table-column
          v-if="item.visible"
          :prop="item.prop"
          :label="item.label"
          :width="item.width"
          :type="item.type"
          :align="item.align || 'center'"
          show-overflow-tooltip
        >
          <template #default="scope">
            <template v-if="item.type === 'index'">
              {{ getIndex(scope.$index) }}
            </template>
            <template v-else>
              <slot :name="item.prop" :rows="scope.row" :index="scope.$index">
                <template v-if="item.prop === 'operator'">
                  <el-button
                    v-if="showView"
                    class="light-yellow-btn"
                    size="small"
                    :icon="View"
                    @click="viewFunc(scope.row)"
                  >
                    查看
                  </el-button>
                  <el-button
                    v-if="showEdit"
                    class="light-blue-btn"
                    size="small"
                    :icon="Edit"
                    @click="editFunc(scope.row)"
                  >
                    编辑
                  </el-button>
                  <el-popconfirm
                    v-if="showDelete"
                    :title="`确认要删除此条数据吗？`"
                    confirm-button-text="确定"
                    cancel-button-text="取消"
                    @confirm="delFunc(scope.row)"
                    class="delete-confirm"
                  >
                    <template #reference>
                      <el-button class="light-red-btn" size="small" :icon="Delete">删除</el-button>
                    </template>
                  </el-popconfirm>
                </template>
                <span v-else-if="item.formatter">
                  <template v-if="item.prop === 'isExpired'">
                    <el-button
                      :class="scope.row[item.prop] ? 'light-red-btn' : 'light-green-btn'"
                      size="small"
                      plain
                    >
                      {{ item.formatter(scope.row) }}
                    </el-button>
                  </template>
                  <template v-else>
                    {{ item.formatter(scope.row) }}
                  </template>
                </span>
                <span v-else>
                  <template v-if="item.prop === 'isEnabled'">
                    <el-switch v-model="scope.row[item.prop]" disabled />
                  </template>
                  <span v-else>
                    {{ scope.row[item.prop] }}
                  </span>
                </span>
              </slot>
            </template>
          </template>
        </el-table-column>
      </template>
    </el-table>
    <el-pagination
      v-if="hasPagination"
      :current-page="currentPage"
      :page-size="pageSize"
      :page-sizes="pageSizes"
      :background="true"
      :layout="'total, sizes, prev, pager, next'"
      :total="total"
      @current-change="handleCurrentChange"
      @size-change="handleSizeChange"
    />
  </div>
</template>

<script setup lang="ts">
import { toRefs, ref, watch } from 'vue'
import type { PropType } from 'vue'
import { CirclePlusFilled } from '@element-plus/icons-vue'
import { Delete, Edit, View } from '@element-plus/icons-vue'
import { ElButton, ElTable, ElTableColumn, ElPagination } from 'element-plus'

/**
 * 表格列配置接口
 */
export interface TableColumn<T = unknown> {
  /** 列属性名 */
  prop: string
  /** 列标签名 */
  label: string
  /** 列宽度 */
  width?: number | string
  /** 列类型 */
  type?: string
  /** 对齐方式 */
  align?: string
  /** 是否可见 */
  visible?: boolean
  /** 格式化函数 */
  formatter?: (row: T) => string
}

/**
 * 表格行数据类型
 */
type TableRowData = Record<string, unknown>

// 定义组件事件
const emit = defineEmits(['addOperate', 'selectionChange'])

// 定义组件属性
const props = defineProps({
  // 新增按钮文本
  addButtonText: {
    type: String,
    default: '新增',
  },
  // 表格相关
  tableData: {
    type: Array as PropType<TableRowData[]>,
    default: () => [],
  },
  columns: {
    type: Array as PropType<TableColumn[]>,
    default: () => [],
  },
  rowKey: {
    type: String,
    default: 'id',
  },
  hasToolbar: {
    type: Boolean,
    default: true,
  },
  maxHeight: {
    type: [String, Number],
    default: undefined,
  },
  // 操作按钮控制
  showView: {
    type: Boolean,
    default: false,
  },
  showEdit: {
    type: Boolean,
    default: true,
  },
  showDelete: {
    type: Boolean,
    default: true,
  },
  // 分页相关
  hasPagination: {
    type: Boolean,
    default: true,
  },
  total: {
    type: Number,
    default: 0,
  },
  currentPage: {
    type: Number,
    default: 1,
  },
  pageSize: {
    type: Number,
    default: 10,
  },
  pageSizes: {
    type: Array as PropType<number[]>,
    default: () => [10, 15, 20],
  },
  // 回调函数
  delFunc: {
    type: Function as PropType<(row: TableRowData) => void>,
    default: () => {},
  },
  viewFunc: {
    type: Function as PropType<(row: TableRowData) => void>,
    default: () => {},
  },
  editFunc: {
    type: Function as PropType<(row: TableRowData) => void>,
    default: () => {},
  },
  changePage: {
    type: Function as PropType<(page: number) => void>,
    default: () => {},
  },
  sizeChange: {
    type: Function as PropType<(size: number) => void>,
    default: () => {},
  },
  title: {
    type: String,
    default: '数据列表',
  },
})

// 解构属性
const {
  tableData,
  columns,
  rowKey,
  hasToolbar,
  showView,
  showEdit,
  showDelete,
  hasPagination,
  total,
  currentPage,
  pageSize,
  pageSizes,
  maxHeight,
  title,
} = toRefs(props)

// 加载状态
const loading = ref(false)

// 初始化列可见性
columns.value.forEach((item) => {
  if (item.visible === undefined) {
    item.visible = true
  }
})

/**
 * 获取行序号
 * @param index 当前页中的索引
 * @returns 实际序号
 */
const getIndex = (index: number): number => {
  return index + 1 + (currentPage.value - 1) * pageSize.value
}

/**
 * 处理新增操作
 */
const addOperate = () => {
  emit('addOperate')
}

/**
 * 处理当前页码变化
 * @param val 新的页码
 */
const handleCurrentChange = (val: number) => {
  props.changePage(val)
}

/**
 * 处理每页条数变化
 * @param val 新的每页条数
 */
const handleSizeChange = (val: number) => {
  props.sizeChange(val)
}

/**
 * 处理表格选择变化
 * @param selection 选中的行数据
 */
const handleSelectionChange = (selection: TableRowData[]) => {
  emit('selectionChange', selection)
}

/**
 * 监听表格数据变化
 */
watch(
  () => props.tableData,
  () => {
    loading.value = true
    setTimeout(() => {
      loading.value = false
    }, 300)
  },
  { deep: true },
)
</script>

<style scoped>
.table-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 10px;
}

.table-toolbar-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.table-title {
  font-size: 16px;
  font-weight: bold;
  color: #1f2f3d;
  display: flex;
  align-items: center;
}

.title-bar {
  width: 4px;
  height: 16px;
  background-color: var(--el-color-primary);
  margin-right: 5px;
}

.columns-setting-icon {
  display: block;
  font-size: 18px;
  cursor: pointer;
  color: #676767;
}

.edit-btn {
  --el-button-bg-color: var(--el-color-primary-light-9) !important;
  --el-button-border-color: var(--el-color-primary-light-5) !important;
  --el-button-hover-bg-color: var(--el-color-primary-light-8) !important;
  --el-button-hover-border-color: var(--el-color-primary-light-4) !important;
  --el-button-active-bg-color: var(--el-color-primary-light-7) !important;
  --el-button-active-border-color: var(--el-color-primary-light-3) !important;
}

.light-blue-btn {
  --el-button-text-color: #409eff;
  --el-button-bg-color: #ecf5ff;
  --el-button-border-color: #d9ecff;
  --el-button-hover-text-color: #409eff;
  --el-button-hover-bg-color: #d9ecff;
  --el-button-hover-border-color: #c6e2ff;
  --el-button-active-text-color: #409eff;
  --el-button-active-bg-color: #c6e2ff;
  --el-button-active-border-color: #a0cfff;
}

.light-red-btn {
  --el-button-text-color: #f56c6c;
  --el-button-bg-color: #fef0f0;
  --el-button-border-color: #fde2e2;
  --el-button-hover-text-color: #f56c6c;
  --el-button-hover-bg-color: #fde2e2;
  --el-button-hover-border-color: #fcd3d3;
  --el-button-active-text-color: #f56c6c;
  --el-button-active-bg-color: #fcd3d3;
  --el-button-active-border-color: #fbc4c4;
}

.light-yellow-btn {
  --el-button-text-color: #e6a23c;
  --el-button-bg-color: #fdf6ec;
  --el-button-border-color: #faecd8;
  --el-button-hover-text-color: #e6a23c;
  --el-button-hover-bg-color: #faecd8;
  --el-button-hover-border-color: #f8e3c5;
  --el-button-active-text-color: #e6a23c;
  --el-button-active-bg-color: #f8e3c5;
  --el-button-active-border-color: #f5dab1;
}

.light-green-btn {
  --el-button-text-color: #67c23a;
  --el-button-bg-color: #f0f9eb;
  --el-button-border-color: #e1f3d8;
  --el-button-hover-text-color: #67c23a;
  --el-button-hover-bg-color: #e1f3d8;
  --el-button-hover-border-color: #d4edc7;
  --el-button-active-text-color: #67c23a;
  --el-button-active-bg-color: #d4edc7;
  --el-button-active-border-color: #c2e7b0;
}

:deep(.el-table) {
  overflow: hidden;
}

:deep(.el-table__body-wrapper) {
  overflow-y: auto;
}

:deep(.el-table .cell) {
  white-space: nowrap;
}
</style>
<style>
.table-header .cell {
  color: #333;
}

.el-popconfirm__main {
  min-width: 320px !important;
  padding: 12px !important;
}

.el-popover.el-popper {
  min-width: 320px !important;
}
</style>
