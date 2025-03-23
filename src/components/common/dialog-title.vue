<template>
  <div class="dialog-title-with-bar">
    <span class="dialog-title-bar"></span>
    <span>{{ title }}</span>
  </div>
</template>

<script setup lang="ts">
defineProps({
  title: {
    type: String,
    required: true,
  },
})
</script>

<style scoped>
/* 样式已在全局CSS中定义 */
</style>
