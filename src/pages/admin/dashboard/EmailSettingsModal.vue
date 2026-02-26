<template>
  <div class="modal-overlay" @click.self="closeModal">
    <div class="modal-content modal-md">
      <div class="modal-header">
        <h3>⚙️ Cài đặt Báo cáo Tự động</h3>
        <button class="close-btn" @click="closeModal">&times;</button>
      </div>
      <div class="modal-body">
        <div class="form-group email-input-group">
          <label>📧 Địa chỉ Email nhận báo cáo:</label>
          <input 
            type="email" 
            v-model="emailConfig.emailNhan" 
            class="form-control" 
            placeholder="Ví dụ: giamdoc@gmail.com" 
          />
          <small class="helper-text">Hệ thống sẽ gửi các báo cáo thống kê định kỳ vào email này.</small>
        </div>

        <label class="setting-group-title">Chu kỳ gửi tự động (20:00 tối)</label>
        <div class="settings-grid">
          <div class="setting-item">
            <div class="setting-info">
              <span class="setting-name">Báo cáo Ngày</span>
              <span class="setting-desc">Gửi hàng ngày</span>
            </div>
            <label class="switch">
              <input type="checkbox" v-model="emailConfig.guiNgay">
              <span class="slider round"></span>
            </label>
          </div>

          <div class="setting-item">
            <div class="setting-info">
              <span class="setting-name">Báo cáo Tuần</span>
              <span class="setting-desc">Chủ nhật hàng tuần</span>
            </div>
            <label class="switch">
              <input type="checkbox" v-model="emailConfig.guiTuan">
              <span class="slider round"></span>
            </label>
          </div>

          <div class="setting-item">
            <div class="setting-info">
              <span class="setting-name">Báo cáo Tháng</span>
              <span class="setting-desc">Ngày cuối tháng</span>
            </div>
            <label class="switch">
              <input type="checkbox" v-model="emailConfig.guiThang">
              <span class="slider round"></span>
            </label>
          </div>

          <div class="setting-item">
            <div class="setting-info">
              <span class="setting-name">Báo cáo Năm</span>
              <span class="setting-desc">Ngày 31/12 cuối năm</span>
            </div>
            <label class="switch">
              <input type="checkbox" v-model="emailConfig.guiNam">
              <span class="slider round"></span>
            </label>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" @click="closeModal">Hủy</button>
        <button class="btn btn-primary" @click="saveEmailSettings" :disabled="isSavingSettings">
          {{ isSavingSettings ? "Đang lưu..." : "Lưu cài đặt" }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import axios from 'axios';

// Định nghĩa event để đóng modal gửi về component cha
const emit = defineEmits(['close']);

const API_URL = "http://localhost:8080/api/thong-ke";
const isSavingSettings = ref(false);

const emailConfig = ref({
  emailNhan: "",
  guiNgay: false,
  guiTuan: false,
  guiThang: false,
  guiNam: false
});

// Lấy cấu hình email từ Backend khi component được gọi (mount)
const loadSettings = async () => {
  try {
    const res = await axios.get(`${API_URL}/cau-hinh-email`);
    if(res.data) {
      emailConfig.value = {
        emailNhan: res.data.emailNhan || "",
        guiNgay: res.data.guiNgay || false,
        guiTuan: res.data.guiTuan || false,
        guiThang: res.data.guiThang || false,
        guiNam: res.data.guiNam || false
      };
    }
  } catch (error) {
    console.error("Lỗi lấy cấu hình email:", error);
  }
};

// Lưu cấu hình email xuống Backend
const saveEmailSettings = async () => {
  const hasActiveToggle = emailConfig.value.guiNgay || emailConfig.value.guiTuan || emailConfig.value.guiThang || emailConfig.value.guiNam;
  
  if (hasActiveToggle && !emailConfig.value.emailNhan.trim()) {
    alert("Vui lòng nhập địa chỉ Email để nhận báo cáo tự động!");
    return;
  }

  isSavingSettings.value = true;
  try {
    await axios.post(`${API_URL}/cau-hinh-email`, emailConfig.value);
    alert("✅ Lưu cài đặt email tự động thành công!");
    closeModal(); // Đóng modal sau khi lưu thành công
  } catch (error) {
    alert("❌ Lỗi khi lưu cấu hình!");
  } finally {
    isSavingSettings.value = false;
  }
};

// Hàm đóng modal
const closeModal = () => {
  emit('close');
};

// Tự động tải dữ liệu khi mở popup
onMounted(() => {
  loadSettings();
});
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  justify-content: center;
  align-items: center;
  font-family: 'Inter', sans-serif;
}
.modal-content {
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  animation: slideDown 0.3s ease-out;
}
.modal-md {
  width: 500px !important;
}
@keyframes slideDown {
  from { transform: translateY(-20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.modal-header h3 {
  margin: 0;
  font-size: 18px;
  color: #1f2937;
}
.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #9ca3af;
}
.close-btn:hover { color: #4b5563; }
.form-group label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 6px;
}
.form-control {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  outline: none;
  box-sizing: border-box;
}
.form-control:focus { border-color: #ea580c; }
.email-input-group {
  background: #fdf8f5;
  padding: 15px;
  border-radius: 8px;
  border: 1px solid #feedde;
  margin-bottom: 20px;
}
.helper-text {
  color: #6b7280;
  font-size: 12px;
  margin-top: 6px;
  display: block;
}
.setting-group-title {
  font-weight: bold;
  color: #374151;
  font-size: 15px;
  margin-bottom: 10px;
  display: block;
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 8px;
}
.settings-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  margin-bottom: 25px;
}
.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  padding: 12px 15px;
  border-radius: 8px;
}
.setting-info {
  display: flex;
  flex-direction: column;
}
.setting-name {
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
}
.setting-desc {
  font-size: 11px;
  color: #9ca3af;
  margin-top: 2px;
}
.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
.btn {
  padding: 8px 16px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
}
.btn-secondary { background-color: #e5e7eb; color: #374151; }
.btn-secondary:hover { background-color: #d1d5db; }
.btn-primary { background: linear-gradient(90deg, #c79a63, #8b5e34); color: white; }
.btn-primary:hover { background: linear-gradient(90deg, #b88d57, #7a502c); }

/* Switch Bật Tắt */
.switch { position: relative; display: inline-block; width: 40px; height: 22px; }
.switch input { opacity: 0; width: 0; height: 0; }
.slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #cbd5e1; transition: .4s; }
.slider:before { position: absolute; content: ""; height: 16px; width: 16px; left: 3px; bottom: 3px; background-color: white; transition: .4s; }
input:checked + .slider { background-color: #ea580c; }
input:checked + .slider:before { transform: translateX(18px); }
.slider.round { border-radius: 22px; }
.slider.round:before { border-radius: 50%; }
</style>