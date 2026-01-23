<template>
  <div>
    <input type="file" accept="image/*" @change="handleUpload" />

    <div v-if="previewUrl" style="margin-top: 10px">
      <img :src="previewUrl" width="120" />
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

const emit = defineEmits(["uploaded"]);

const previewUrl = ref("");

const handleUpload = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "chocostyle_unsigned");

  try {
    const res = await fetch(
      "https://api.cloudinary.com/v1_1/dvsqk1vel/image/upload",
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await res.json();

    if (!data.secure_url) {
      alert("Upload ảnh thất bại");
      return;
    }

    // preview
    previewUrl.value = data.secure_url;

    // 🔥 GỬI URL CLOUDINARY CHO COMPONENT CHA
    emit("uploaded", data.secure_url);
  } catch (err) {
    console.error(err);
    alert("Lỗi upload ảnh");
  }
};
</script>
