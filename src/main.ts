/**
 * 应用程序入口文件
 */

// Vue 核心
import { createApp } from 'vue'
import App from './App.vue'

// 状态管理和路由
import { createPinia } from 'pinia'
import router from './router'

// Element Plus
import ElementPlus from 'element-plus'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import 'element-plus/dist/index.css'

// 自定义样式和状态
import './assets/css/icon.css'
import './assets/css/common.css' // 引入公共样式
import { usePermissStore } from './store/permiss'

/**
 * 创建 Vue 应用实例
 */
const app = createApp(App)

/**
 * 注册全局插件
 */
// 状态管理
app.use(createPinia())
// 路由
app.use(router)
// Element Plus 及其中文语言包
app.use(ElementPlus, {
  locale: zhCn,
})

/**
 * 注册 Element Plus 图标组件
 */
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

/**
 * 注册自定义权限指令
 * v-permiss 指令用于控制元素的显示权限
 */
const permiss = usePermissStore()
app.directive('permiss', {
  mounted(el, binding) {
    if (!binding.value) return
    if (!permiss.key.includes(String(binding.value))) {
      el.style.display = 'none'
    }
  },
})

/**
 * 挂载应用
 */
app.mount('#app')
