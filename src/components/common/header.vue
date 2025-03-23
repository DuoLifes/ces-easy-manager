<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="header">
    <!-- 折叠按钮 -->
    <div class="header-left">
      <img class="logo" src="@/assets/img/logo.svg" alt="" />
      <div class="web-title">易随销管理后台</div>
      <div class="collapse-btn" @click="collapseChage">
        <el-icon v-if="sidebar.collapse">
          <Expand />
        </el-icon>
        <el-icon v-else>
          <Fold />
        </el-icon>
      </div>
    </div>
    <div class="header-right">
      <div class="header-user-con">
        <div class="btn-icon" @click="setFullScreen">
          <el-tooltip effect="dark" content="全屏" placement="bottom">
            <i class="el-icon-lx-full"></i>
          </el-tooltip>
        </div>
        <!-- 用户头像 -->
        <el-avatar class="user-avator" :size="30" :src="imgurl" />
        <!-- 用户名下拉菜单 -->
        <el-dropdown class="user-name" trigger="click" @command="handleCommand">
          <span class="el-dropdown-link">
            {{ username }}
            <el-icon class="el-icon--right">
              <arrow-down />
            </el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item divided command="loginout">退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { onMounted } from 'vue'
import { useSidebarStore } from '@/store/sidebar'
import { useRouter } from 'vue-router'
import { usePermissStore } from '@/store/permiss'
import { useTabsStore } from '@/store/tabs'
import { resetRouter } from '@/router'
import imgurl from '@/assets/img/img.jpg'

const username: string | null = localStorage.getItem('ms_username')
const router = useRouter()
const permiss = usePermissStore()
const tabs = useTabsStore()

const sidebar = useSidebarStore()
// 侧边栏折叠
const collapseChage = () => {
  sidebar.handleCollapse()
}

onMounted(() => {
  if (document.body.clientWidth < 1500) {
    collapseChage()
  }
})

// 用户名下拉菜单选择事件
const handleCommand = (command: string) => {
  if (command === 'loginout') {
    // 清除用户信息
    localStorage.removeItem('ms_username')
    localStorage.removeItem('token')
    localStorage.removeItem('login-param')
    localStorage.removeItem('permissions')

    // 清除权限
    permiss.handleSet([])

    // 重置路由添加状态
    permiss.setAddRoutes(false)

    // 重置路由
    resetRouter()

    // 清除标签页
    tabs.clearTabs()

    // 跳转到登录页
    router.push('/login')
  }
}

// 全屏切换
const setFullScreen = () => {
  const element = document.documentElement
  if (element.requestFullscreen) {
    element.requestFullscreen()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } else if ((element as any).webkitRequestFullScreen) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(element as any).webkitRequestFullScreen()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } else if ((element as any).mozRequestFullScreen) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(element as any).mozRequestFullScreen()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } else if ((element as any).msRequestFullscreen) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(element as any).msRequestFullscreen()
  }
}
</script>

<style scoped>
.header {
  position: relative;
  box-sizing: border-box;
  width: 100%;
  height: 60px;
  font-size: 22px;
  color: var(--header-text-color);
  background-color: var(--header-bg-color);
}

.header-left {
  display: flex;
  align-items: center;
  float: left;
  padding-left: 20px;
}

.logo {
  margin-right: 10px;
  width: 35px;
  height: 35px;
}

.web-title {
  font-size: 20px;
}

.collapse-btn {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 60px;
  width: 45px;
  cursor: pointer;
}

.header-right {
  float: right;
  padding-right: 50px;
}

.header-user-con {
  display: flex;
  height: 60px;
  align-items: center;
}

.btn-icon {
  position: relative;
  width: 30px;
  height: 30px;
  line-height: 30px;
  text-align: center;
  border-radius: 15px;
  cursor: pointer;
  margin-right: 10px;
  color: var(--header-text-color);
}

.btn-icon:hover {
  background: var(--header-hover-color);
}

.user-avator {
  margin-left: 20px;
}

.user-name {
  margin-left: 10px;
}

.el-dropdown-link {
  color: var(--header-text-color);
  cursor: pointer;
  display: flex;
  align-items: center;
}

.el-dropdown-menu__item {
  text-align: center;
}
</style>
