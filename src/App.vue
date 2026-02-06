<script setup lang="ts">
import AdminLayout from "./pages/admin/AdminLayout.vue";
import Home from "./views/Home.vue";
</script>

<template>
  <!-- <AdminLayout v-if="$route.path.startsWith('/admin')" />
  <Home v-else-if="$route.path === '/home'" />
  <router-view v-else /> -->
  <router-view />
</template>
