<script setup lang="ts">
import AdminLayout from './pages/admin/AdminLayout.vue'
</script>
<template>
  <AdminLayout v-if="$route.path.startsWith('/admin')" />
  <router-view v-else />
</template>
