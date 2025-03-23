<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="sidebar">
    <el-menu
      class="sidebar-el-menu"
      :default-active="onRoutes"
      :collapse="sidebar.collapse"
      :background-color="sidebar.bgColor"
      :text-color="sidebar.textColor"
      router
    >
      <template v-for="item in filteredMenus">
        <template v-if="item.children">
          <el-sub-menu :index="item.index" :key="item.index">
            <template #title>
              <el-icon>
                <component :is="item.icon"></component>
              </el-icon>
              <span>{{ item.title }}</span>
            </template>
            <template v-for="subItem in item.children">
              <el-sub-menu v-if="subItem.children" :index="subItem.index" :key="subItem.index">
                <template #title>{{ subItem.title }}</template>
                <el-menu-item
                  v-for="(threeItem, i) in subItem.children"
                  :key="i"
                  :index="threeItem.index"
                >
                  {{ threeItem.title }}
                </el-menu-item>
              </el-sub-menu>
              <!-- eslint-disable vue/valid-v-for -->
              <el-menu-item v-else :index="subItem.index">
                {{ subItem.title }}
              </el-menu-item>
            </template>
          </el-sub-menu>
        </template>
        <template v-else>
          <el-menu-item :index="item.index" :key="item.index">
            <el-icon>
              <component :is="item.icon"></component>
            </el-icon>
            <template #title>{{ item.title }}</template>
          </el-menu-item>
        </template>
      </template>
    </el-menu>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { usePermissStore } from '@/store/permiss'
import { menuData } from './menu'
import { useSidebarStore } from '@/store/sidebar'
import type { Menus } from '@/types/menu'

const route = useRoute()
const onRoutes = computed(() => {
  // 如果当前路由有parentPath元数据，则使用parentPath
  return (route.meta?.parentPath as string) || route.path
})

const sidebar = useSidebarStore()
const permiss = usePermissStore()

// 根据权限过滤菜单
const filterMenus = (menus: Menus[]): Menus[] => {
  return menus.filter((menu) => {
    // 检查当前菜单是否有权限
    if (menu.id && !permiss.key.includes(menu.id)) {
      return false
    }

    // 如果有子菜单，递归过滤
    if (menu.children && menu.children.length > 0) {
      const filteredChildren = filterMenus(menu.children)
      menu.children = filteredChildren
      // 如果过滤后没有子菜单，且当前菜单没有独立权限，则不显示
      if (filteredChildren.length === 0 && !menu.id) {
        return false
      }
    }

    return true
  })
}

// 过滤后的菜单
const filteredMenus = computed(() => {
  return filterMenus(JSON.parse(JSON.stringify(menuData)))
})
</script>

<style scoped>
.sidebar {
  display: block;
  position: absolute;
  left: 0;
  top: 70px;
  bottom: 0;
  overflow-y: scroll;
  background-color: var(--sidebar-bg);
  border-right: 1px solid #e6e6e6;
}

.sidebar::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.sidebar::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 3px;
}

.sidebar-el-menu:not(.el-menu--collapse) {
  width: 200px;
}

.sidebar-el-menu {
  min-height: 100%;
  border-right: none;
}

:deep(.el-menu-item) {
  height: 50px;
  line-height: 50px;
}

:deep(.el-menu-item.is-active) {
  background-color: var(--sidebar-active-bg) !important;
  color: var(--primary-color) !important;
  border-right: 3px solid var(--primary-color);
  font-weight: 600;
}

:deep(.el-sub-menu__title) {
  height: 50px;
  line-height: 50px;
  font-weight: 600;
}

:deep(.el-sub-menu.is-opened .el-sub-menu__title .el-sub-menu__icon-arrow) {
  transform: rotateZ(-90deg);
}

:deep(.el-sub-menu__title .el-sub-menu__icon-arrow) {
  transform: rotateZ(90deg);
  transition: transform 0.3s;
}

:deep(.el-sub-menu .el-menu-item) {
  font-weight: normal;
}

:deep(.el-menu-item .el-icon),
:deep(.el-sub-menu__title .el-icon) {
  margin-right: 10px;
  width: 16px;
  height: 16px;
}
</style>
