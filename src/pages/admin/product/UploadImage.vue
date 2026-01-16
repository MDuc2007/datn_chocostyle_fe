<template>
  <div>
    <input type="file" multiple accept="image/*" @change="handleUpload" />

    <div style="display:flex; gap:10px; margin-top:10px">
      <img
        v-for="url in imageUrls"
        :key="url"
        :src="url"
        width="100"
      />
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

const imageUrls = ref([]);

const handleUpload = async (e) => {
  const files = e.target.files;

  for (const file of files) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "chocostyle_unsigned");

    const res = await fetch(
      "https://api.cloudinary.com/v1_1/dvsqk1vel/image/upload",
      {
        method: "POST",
        body: formData
      }
    );

    const data = await res.json();
    imageUrls.value.push(data.secure_url);
  }
};
</script>
