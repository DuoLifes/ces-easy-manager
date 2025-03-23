<template>
  <el-config-provider :locale="zhCn">
    <router-view />
  </el-config-provider>
</template>

<script setup lang="ts">
/**
 * 应用程序根组件
 * 负责全局配置和主题初始化
 */

// Element Plus 配置
import { ElConfigProvider } from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'

// 主题状态管理
import { useThemeStore } from './store/theme'

// 初始化主题
const theme = useThemeStore()
theme.initTheme()
</script>

<style>
/* 全局样式 */
@import './assets/css/main.css';
</style>
