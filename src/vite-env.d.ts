/**
 * Vite 环境类型声明文件
 */

/// <reference types="vite/client" />

/**
 * Vue 组件类型声明
 */
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const component: DefineComponent<Record<string, unknown>, Record<string, unknown>, any>
  export default component
}

/**
 * 第三方模块类型声明
 */
declare module 'vue-schart'
declare module 'nprogress'

/**
 * Element Plus 中文语言包类型声明
 */
declare module 'element-plus/dist/locale/zh-cn.mjs' {
  import type { Language } from 'element-plus/es/locale'
  const zhCn: Language
  export default zhCn
}
