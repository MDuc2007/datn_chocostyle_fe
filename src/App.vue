<script setup lang="ts">
import AdminLayout from './pages/admin/AdminLayout.vue'
</script>

<template>
  <AdminLayout v-if="$route.path.startsWith('/admin')" />
  <router-view v-else />
</template>
<!-- <template>
  <form @submit.prevent="submit">
    <input v-model="form.maSp" placeholder="Mã SP" />
    <input v-model="form.tenSp" placeholder="Tên SP" />
    <textarea v-model="form.moTa"></textarea>

    <UploadImage ref="uploadRef" />

    <button>Thêm sản phẩm</button>
  </form>
</template>

<script setup>
import { ref } from "vue";
import UploadImage from "./UploadImage.vue";

const uploadRef = ref();

const form = ref({
  maSp: "",
  tenSp: "",
  moTa: "",
  idChatLieu: 1,
  idXuatXu: 1,
  trangThai: 1,
  hinhAnhUrls: [],
});

const submit = async () => {
  form.value.hinhAnhUrls = uploadRef.value.imageUrls;

  await fetch("http://localhost:8080/api/san-pham", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(form.value),
  });

  alert("Thêm thành công");
};
</script> -->