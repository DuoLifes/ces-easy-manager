<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="tabs">
    <div class="breadcrumb-title">
      <el-breadcrumb separator="/">
        <template v-if="route.meta?.parentPath">
          <!-- 三级菜单结构 -->
          <el-breadcrumb-item>{{ rootMenu.title }}</el-breadcrumb-item>
          <el-breadcrumb-item :to="parentMenu?.index">{{ parentMenu?.title }}</el-breadcrumb-item>
          <el-breadcrumb-item>{{ route.meta.title }}</el-breadcrumb-item>
        </template>
        <template v-else>
          <!-- 二级菜单结构 -->
          <el-breadcrumb-item>{{ rootMenu.title }}</el-breadcrumb-item>
          <el-breadcrumb-item>{{ route.meta.title }}</el-breadcrumb-item>
        </template>
      </el-breadcrumb>
      <div class="page-title-wrapper">
        <div class="page-title">{{ route.meta.title }}</div>
        <el-button v-if="route.meta?.parentPath" @click="handleBack">返回</el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { computed } from 'vue'
import { menuData } from '@/components/common/menu'

const route = useRoute()
const router = useRouter()

// 查找根菜单和父级菜单
const { rootMenu, parentMenu } = computed(() => {
  const currentPath = route.path
  // 如果当前路由有指定的parentPath，使用它来查找父菜单
  const parentPath = route.meta?.parentPath as string

  // 查找根菜单（一级菜单）
  const root = menuData[0] // 系统管理

  // 查找父级菜单（二级菜单）
  let parent = null
  if (parentPath) {
    // 如果有parentPath，从其子菜单中查找匹配的菜单项
    parent = root.children?.find((item) => item.index === parentPath)
  } else {
    // 否则直接查找当前路径对应的父级菜单
    parent = root.children?.find((item) => item.index === currentPath)
  }

  return {
    rootMenu: root,
    parentMenu: parent,
  }
}).value

// 返回上一级
const handleBack = () => {
  if (route.meta?.parentPath) {
    router.push(route.meta.parentPath as string)
  }
}

// 父级菜单标题

// const parentTitle = computed(() => parentMenu.value.title)

// // 父级菜单路径
// const parentPath = computed(() => {
//   if (parentMenu.value.children && parentMenu.value.children.length > 0) {
//     return parentMenu.value.children[0].index
//   }
//   return parentMenu.value.index
// })
</script>

<style scoped>
.tabs {
  height: 80px;
  background: #fff;
  display: flex;
  align-items: center;
  margin: 0px 11px 0px 11px;
  padding: 0 20px;
}

.breadcrumb-title {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 8px;
  width: 100%;
}

.page-title-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.page-title {
  font-size: 20px;
  font-weight: 600;
  color: #1f2f3d;
}

:deep(.el-breadcrumb) {
  font-size: 13px;
}

/* 所有面包屑项默认样式 */
:deep(.el-breadcrumb__item .el-breadcrumb__inner) {
  font-weight: 400 !important;
  color: #909399 !important;
}

/* 最后一个面包屑项样式 */
:deep(.el-breadcrumb__item:last-child .el-breadcrumb__inner) {
  font-weight: 600 !important;
  color: #606266 !important;
}
</style>
