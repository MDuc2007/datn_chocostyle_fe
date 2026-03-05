<script setup lang="ts">
import AdminLayout from "./pages/admin/AdminLayout.vue";
import Home from "./pages/views/Home.vue";
</script>

<template>
  <router-view />
</template>

<style>
/* =========================================
   CSS GLOBAL: ÁP DỤNG CHO TOÀN BỘ WEBSITE
   ========================================= */


/* 2. Ẩn triệt để thanh cuộn ngang (horizontal scrollbar) */
html, body {
  width: 100%;
  max-width: 100vw;
  overflow-x: hidden;
  margin: 0;
  padding: 0;
}
</style>