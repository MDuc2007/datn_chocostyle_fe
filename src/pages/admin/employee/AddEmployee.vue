<template>
  <div class="add-employee-page">
    <div class="header-bar">
      <h2 class="title">Quản Lý Nhân viên / Thêm nhân viên</h2>
      <button class="btn-back" @click="goBack">Quay lại</button>
    </div>

    <div class="main-card">
      <div class="form-layout">
        
        <div class="left-col">
          <h3 class="section-header">Thông tin nhân viên</h3>
          
          <div class="avatar-wrapper">
            <div class="avatar-circle">
              <span v-if="!form.avatar" class="placeholder-text">Chọn ảnh</span>
              <img v-else :src="form.avatar" />
              <input type="file" @change="handleFileUpload" class="file-input" />
            </div>
          </div>

          <div class="form-group">
            <label>Mã nhân viên (Tự động)</label>
            <input value="Tự sinh sau khi lưu" disabled class="input-disabled" />
          </div>

          <div class="form-group">
            <label>Họ Và Tên <span class="req">*</span></label>
            <input v-model="form.hoTen" placeholder="Nhập họ tên nhân viên" />
          </div>
        </div>

        <div class="right-col">
          <h3 class="section-header">Thông tin chi tiết</h3>

          <div class="grid-row">
            <div class="form-group">
              <label>Số CCCD <span class="req">*</span></label>
              <input v-model="form.cccd" placeholder="Nhập số căn cước" />
            </div>
            <div class="form-group">
              <label>Giới tính <span class="req">*</span></label>
              <div class="radio-group">
                <label class="radio-item">
                  <input type="radio" :value="true" v-model="form.gioiTinh"> Nam
                </label>
                <label class="radio-item">
                  <input type="radio" :value="false" v-model="form.gioiTinh"> Nữ
                </label>
              </div>
            </div>
          </div>

          <div class="grid-row">
            <div class="form-group">
              <label>Ngày sinh <span class="req">*</span></label>
              <input type="date" v-model="form.ngaySinh" />
            </div>
            <div class="form-group">
              <label>Email <span class="req">*</span></label>
              <input v-model="form.email" placeholder="example@mail.com" />
            </div>
          </div>

          <div class="grid-row-3">
            <div class="form-group">
              <label>Tỉnh/Thành phố</label>
              <select v-model="selectedCity" @change="onCityChange">
                <option value="">Chọn Tỉnh/TP</option>
                <option v-for="c in cities" :key="c.code" :value="c">{{ c.name }}</option>
              </select>
            </div>
            <div class="form-group">
              <label>Quận/Huyện</label>
              <select v-model="selectedDistrict" @change="onDistrictChange">
                <option value="">Chọn Quận/Huyện</option>
                <option v-for="d in districts" :key="d.code" :value="d">{{ d.name }}</option>
              </select>
            </div>
            <div class="form-group">
              <label>Xã/Phường</label>
              <select v-model="selectedWard">
                <option value="">Chọn Xã/Phường</option>
                <option v-for="w in wards" :key="w.code" :value="w">{{ w.name }}</option>
              </select>
            </div>
          </div>

          <div class="grid-row">
            <div class="form-group">
              <label>Số Điện Thoại <span class="req">*</span></label>
              <input v-model="form.sdt" placeholder="09xxxxxxxx" />
            </div>
            <div class="form-group">
              <label>Địa chỉ cụ thể (Số nhà, đường)</label>
              <input v-model="detailsAddress" placeholder="VD: Số 10, Ngõ 5..." />
            </div>
          </div>
          
          <div class="grid-row">
             <div class="form-group">
                <label>Chức vụ / Vai trò</label>
                <select v-model="form.vaiTro">
                    <option value="Staff">Nhân viên</option>
                    <option value="Sales">Nhân viên bán hàng</option>
                    <option value="Admin">Quản lý</option>
                    <option value="StoreKeeper">Thủ kho</option>
                </select>
             </div>
             <div class="form-group">
                <label>Ngày vào làm</label>
                <input type="date" v-model="form.ngayVaoLam" />
             </div>
          </div>

          <div class="footer-actions">
             <button class="btn btn-orange" @click="submitForm">Thêm Nhân Viên</button>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()

// Dữ liệu Form
const form = ref({
  hoTen: '', cccd: '', gioiTinh: true, ngaySinh: '', email: '',
  sdt: '', diaChi: '', vaiTro: 'Staff', ngayVaoLam: '', avatar: null
})

// Dữ liệu Địa chỉ giả lập (Bạn có thể thay bằng API GHN/GHTK)
const cities = ref([
    { code: 1, name: 'Hà Nội', districts: [ {code: 101, name: 'Ba Đình', wards: [{code: 1001, name: 'Phúc Xá'}, {code: 1002, name: 'Điện Biên'}]} ] },
    { code: 2, name: 'TP.HCM', districts: [ {code: 201, name: 'Quận 1', wards: [{code: 2001, name: 'Bến Nghé'}]} ] }
])
const selectedCity = ref('')
const selectedDistrict = ref('')
const selectedWard = ref('')
const detailsAddress = ref('')

const districts = computed(() => selectedCity.value ? selectedCity.value.districts : [])
const wards = computed(() => selectedDistrict.value ? selectedDistrict.value.wards : [])

// LOGIC GHÉP ĐỊA CHỈ
watch([selectedCity, selectedDistrict, selectedWard, detailsAddress], () => {
    const parts = []
    if (detailsAddress.value) parts.push(detailsAddress.value)
    if (selectedWard.value) parts.push(selectedWard.value.name)
    if (selectedDistrict.value) parts.push(selectedDistrict.value.name)
    if (selectedCity.value) parts.push(selectedCity.value.name)
    
    // Gán vào form để gửi đi
    form.value.diaChi = parts.join(', ')
})

function onCityChange() { selectedDistrict.value = ''; selectedWard.value = ''; }
function onDistrictChange() { selectedWard.value = ''; }

function goBack() {
  router.push('/admin/employee') // Quay lại trang danh sách
}

function handleFileUpload(event) {
    // Logic upload ảnh (tạm thời chưa xử lý)
    const file = event.target.files[0];
    if(file) {
        form.value.avatar = URL.createObjectURL(file);
    }
}

async function submitForm() {
  try {
    // Gọi API thêm mới
    await axios.post('http://localhost:8080/api/nhan-vien', form.value)
    alert("Thêm nhân viên thành công!")
    router.push('/') // Chuyển hướng về trang danh sách ngay lập tức
  } catch (error) {
    console.error(error)
    alert("Lỗi khi thêm nhân viên!")
  }
}
</script>

<style scoped>
.add-employee-page {
  padding: 0;
  background-color: transparent;
  font-family: 'Segoe UI', sans-serif;
}

.header-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.title { font-size: 20px; color: #555; font-weight: 600; }
.btn-back { border: none; background: none; color: #666; cursor: pointer; text-decoration: underline; }

.main-card {
  background: #fff;
  border-radius: 4px;
  padding: 30px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.05);
}

.form-layout { display: flex; gap: 40px; }

/* Cột Trái */
.left-col { width: 300px; border-right: 1px solid #eee; padding-right: 30px; flex-shrink: 0; }
.right-col { flex-grow: 1; }

.section-header { margin-bottom: 20px; font-size: 16px; font-weight: 700; color: #333; }

/* Avatar */
.avatar-wrapper { display: flex; justify-content: center; margin-bottom: 25px; }
.avatar-circle {
  width: 140px; height: 140px;
  border: 2px dashed #ddd; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  position: relative; overflow: hidden; cursor: pointer;
  background: #fafafa;
}
.avatar-circle:hover { border-color: #e67e22; }
.avatar-circle img { width: 100%; height: 100%; object-fit: cover; }
.placeholder-text { color: #999; font-size: 13px; }
.file-input { position: absolute; width: 100%; height: 100%; opacity: 0; cursor: pointer; }

/* Form Styles */
.form-group { margin-bottom: 15px; display: flex; flex-direction: column; }
.form-group label { margin-bottom: 6px; font-weight: 600; font-size: 13px; color: #444; }
.req { color: red; margin-left: 3px; }

input, select {
  padding: 10px 12px;
  border: 1px solid #e0e0e0; border-radius: 6px;
  font-size: 14px; outline: none; transition: 0.2s;
}
input:focus, select:focus { border-color: #e67e22; box-shadow: 0 0 0 2px rgba(230, 126, 34, 0.1); }
.input-disabled { background-color: #f0f0f0; color: #888; cursor: not-allowed; }

/* Grid Layout */
.grid-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.grid-row-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; }

/* Radio */
.radio-group { display: flex; gap: 20px; margin-top: 8px; }
.radio-item { display: flex; align-items: center; gap: 6px; font-size: 14px; cursor: pointer; }

/* Footer */
.footer-actions { display: flex; justify-content: flex-end; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px; }
.btn-orange {
  background-color: #e67e22; color: white; border: none;
  padding: 12px 30px; border-radius: 6px; font-weight: 600; cursor: pointer;
  box-shadow: 0 2px 6px rgba(230, 126, 34, 0.3);
}
.btn-orange:hover { background-color: #d35400; }
</style>