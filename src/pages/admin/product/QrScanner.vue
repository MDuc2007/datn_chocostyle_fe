<template>
  <div class="scan-modal-content">
    <div class="scan-header">
      <div class="header-title">
        <span class="icon-qr">📷</span>
        <h3>Quét CCCD Gắn Chip</h3>
      </div>
      <button class="close-btn" @click="closeScanModal" title="Đóng">×</button>
    </div>

    <div class="scan-body">
      <div class="camera-section">
        <qrcode-stream
          v-if="cameraActive"
          @detect="onDetect"
          @error="onError"
          :formats="['qr_code']"
          :track="paintBoundingBox"
        >
          <div class="scan-frame">
            <div class="corner topleft"></div>
            <div class="corner topright"></div>
            <div class="corner bottomleft"></div>
            <div class="corner bottomright"></div>
            <p class="scan-text">Di chuyển CCCD vào khung hình</p>
            <div v-if="loadingCamera" class="loading-text">
              Đang khởi động camera...
            </div>
          </div>
        </qrcode-stream>

        <div v-else class="camera-placeholder">
          <div class="placeholder-icon">📷</div>
          <p v-if="!scanError">Bấm nút bên dưới để bắt đầu quét</p>
          <p v-else style="color: #e74c3c">{{ scanError }}</p>
          <button class="btn-primary-brown" @click="startCamera">
            Bật Camera Ngay
          </button>
        </div>
      </div>

      <div class="divider">
        <span>HOẶC TẢI ẢNH</span>
      </div>

      <div class="upload-section">
        <label class="upload-box">
          <qrcode-capture
            @detect="onDetect"
            :formats="['qr_code']"
            class="hidden-capture-input"
          />

          <span class="upload-icon">📂</span>
          <span class="upload-text">Chọn ảnh QR từ máy tính</span>
          <span class="upload-subtext">(Hỗ trợ tốt mọi định dạng ảnh)</span>
        </label>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted } from "vue";
import { Html5Qrcode } from "html5-qrcode";

const emit = defineEmits(["result", "close"]);
let qrCode;

onMounted(() => {
  qrCode = new Html5Qrcode("qr-reader");
  qrCode.start(
    { facingMode: "environment" },
    { fps: 10, qrbox: 250 },
    (decodedText) => {
      emit("result", decodedText);
      qrCode.stop();
    },
  );
});

onUnmounted(() => {
  qrCode?.stop().catch(() => {});
});

const close = () => {
  qrCode?.stop().catch(() => {});
  emit("close");
};
</script>

<style scoped>
.qr-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.qr-modal {
  background: #fff;
  width: 360px;
  border-radius: 12px;
  padding: 20px;
  text-align: center;
}

.title {
  margin-bottom: 12px;
}

.scanner-wrapper {
  position: relative;
  width: 260px;
  height: 260px;
  margin: 0 auto;
  border: 2px solid #5a3e2b;
  border-radius: 12px;
  overflow: hidden;
}

#qr-reader {
  width: 100%;
  height: 100%;
}

.scan-line {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: #5a3e2b;
  animation: scan 2s infinite linear;
}

@keyframes scan {
  from {
    top: 0;
  }
  to {
    top: 100%;
  }
}

.hint {
  margin-top: 10px;
  color: #666;
  font-size: 14px;
}

.btn-close {
  margin-top: 12px;
  padding: 6px 16px;
  border: none;
  background: #ddd;
  border-radius: 6px;
  cursor: pointer;
}
</style>
