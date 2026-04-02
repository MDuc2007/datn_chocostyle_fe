<template>
  <footer class="footer">
    <div class="footer-container">
      
      <div class="footer-col brand-col">
        <div class="logo-text-wrapper">
          <div class="logo-wrap">
            <img
              src="/src/assets/logo/choco-removebg-preview.png"
              alt="ChocoStyle Logo"
              class="footer-logo"
            />
          </div>
          <div class="brand-info">
            <h3 class="brand-name">ChocoStyle</h3>
            <p class="brand-tagline">Nâng tầm phong cách phái mạnh.</p>
          </div>
        </div>
        
        <p class="brand-desc">
          Chúng tôi luôn trân trọng và tiếp thu mọi ý kiến đóng góp từ khách hàng để không ngừng cải thiện chất lượng sản phẩm và dịch vụ.
        </p>
        
        <div class="social-links">
          <a href="#" class="social-icon" title="Facebook">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
          </a>
          <a href="#" class="social-icon" title="Instagram">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
          </a>
          <a href="#" class="social-icon" title="TikTok">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"></path></svg>
          </a>
        </div>
      </div>

      <div class="footer-col contact-col">
        <h4 class="footer-heading">Thông tin liên hệ</h4>
        <ul class="contact-list">
          <li>
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
            <span>36 Phố Huế, Hai Bà Trưng, Hà Nội</span>
          </li>
          <li>
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
            <span>0363 636 366</span>
          </li>
          <li>
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
            <span>chocostyle@gmail.com</span>
          </li>
        </ul>
      </div>

      <div class="footer-col feedback-col">
        <h4 class="footer-heading">Gửi góp ý cho chúng tôi</h4>
        <p class="feedback-desc">Ý kiến của bạn giúp chúng tôi phục vụ tốt hơn.</p>
        
        <form class="feedback-form" @submit.prevent="handleSubmit">
          <input 
            type="email" 
            v-model="userEmail"
            class="form-input" 
            placeholder="Email của bạn..." 
            required 
            :disabled="isSubmitting"
          />
          <textarea 
            v-model="userMessage"
            class="form-input form-textarea" 
            placeholder="Nhập nội dung góp ý..." 
            rows="2" 
            required
            :disabled="isSubmitting"
          ></textarea>
          <button type="submit" class="btn-submit" :disabled="isSubmitting">
            <span v-if="isSubmitting">Đang gửi...</span>
            <template v-else>
              Gửi góp ý <span class="arrow">→</span>
            </template>
          </button>
        </form>
      </div>

    </div>

    <div class="footer-bottom">
      <p>© 2026 CHOCOSTYLE. All rights reserved.</p>
    </div>

    <transition name="toast-slide">
      <div v-if="toast.show" :class="['choco-toast', toast.type]">
        <div class="toast-content">{{ toast.message }}</div>
      </div>
    </transition>
  </footer>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const userEmail = ref('');
const userMessage = ref('');
const isSubmitting = ref(false);

const toast = ref({ show: false, message: '', type: 'success' });

const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
  toast.value = { show: true, message: msg, type: type };
  setTimeout(() => {
    toast.value.show = false;
  }, 3500); 
};

const handleSubmit = async () => {
  isSubmitting.value = true;
  try {
    await fetch("https://formsubmit.co/ajax/hungbe0of@gmail.com", {
      method: "POST",
      headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
      },
      body: JSON.stringify({
          _subject: "Góp ý mới từ website ChocoStyle",
          email: userEmail.value,
          message: userMessage.value
      })
    });
    
    showToast('Cảm ơn bạn! Chúng tôi đã ghi nhận góp ý.', 'success');
    
    userEmail.value = '';
    userMessage.value = '';
  } catch (error) {
    showToast('Có lỗi xảy ra. Vui lòng thử lại sau.', 'error');
    console.error(error);
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped>
/* Biến màu sắc và Typography cho sang trọng */
:root {
  --footer-bg: #5a3825; 
  --footer-bottom: #42281a;
  --text-white: #ffffff; 
  --text-muted: rgba(255, 255, 255, 0.7); 
  --accent-color: #e28743; 
  --input-bg: rgba(255, 255, 255, 0.08);
  --font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.footer {
  background: linear-gradient(135deg, #4b2c1f, #2e1810);
  color: var(--text-white, #fff);
  font-family: var(--font-family);
  border-top: 1px solid rgba(255, 255, 255, 0.08); 
}

.footer-container {
  max-width: 1200px; 
  margin: 0 auto;
  padding: 40px 20px; 
  display: grid;
  grid-template-columns: 1.2fr 1fr 1fr; 
  gap: 30px; 
}

/* ===== TIÊU ĐỀ CHUNG ===== */
.footer-heading {
  font-size: 16px; 
  font-weight: 600;
  margin-bottom: 16px; 
  text-transform: uppercase;
  letter-spacing: 0.5px;
  position: relative;
  padding-bottom: 8px;
  color: var(--text-white); 
}

.footer-heading::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: 0;
  width: 40px;
  height: 2px;
  background-color: var(--accent-color, #e59866);
  border-radius: 2px;
}

/* ===== CỘT 1: THƯƠNG HIỆU & GIỚI THIỆU ===== */
.logo-text-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 15px;
}

.logo-wrap {
  width: 65px; 
  height: 65px;
  background: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  flex-shrink: 0; 
}

.footer-logo {
  width: 85%;
  height: auto;
  object-fit: contain;
}

.brand-name {
  font-size: 18px; 
  font-weight: 700;
  color: var(--text-white);
  margin: 0 0 2px 0;
}

.brand-tagline {
  font-size: 12px;
  color: var(--accent-color);
  margin: 0;
  font-weight: 500;
}

.brand-desc {
  font-size: 13px; 
  color: var(--text-white); 
  line-height: 1.5;
  margin-bottom: 15px;
  max-width: 95%;
}

.social-links {
  display: flex;
  gap: 10px;
}

.social-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px; 
  height: 34px;
  border-radius: 50%;
  background: var(--input-bg);
  color: var(--text-white); 
  text-decoration: none;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.15);
}

.social-icon svg {
  width: 16px;
  height: 16px;
}

.social-icon:hover {
  background: var(--accent-color, #e59866);
  transform: translateY(-2px);
  border-color: var(--accent-color);
  color: #fff;
}

/* ===== CỘT 2: LIÊN HỆ ===== */
.contact-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.contact-list li {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-bottom: 12px; 
  font-size: 13px; 
  color: var(--text-white); 
  line-height: 1.5;
}

.contact-list .icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  margin-top: 1px;
  color: var(--accent-color, #e28743); 
}

/* ===== CỘT 3: GÓP Ý ===== */
.feedback-desc {
  font-size: 13px;
  color: var(--text-white); 
  margin-bottom: 12px;
}

.feedback-form {
  display: flex;
  flex-direction: column;
  gap: 10px; 
}

.form-input {
  width: 100%;
  padding: 10px 14px;
  border-radius: 6px;
  border: 1px solid #ffffff; 
  background: transparent; 
  color: #fff; 
  font-size: 13px;
  outline: none;
  transition: all 0.3s ease;
  font-family: inherit;
  box-sizing: border-box; /* Đảm bảo input và button bằng nhau */
}

.form-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.form-input::placeholder {
  color: rgba(255, 255, 255, 0.8);
}

.form-input:focus {
  background: rgba(255, 255, 255, 0.1);
  box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.2);
}
.form-textarea {
  resize: none;
}

/* 👉 ĐÃ SỬA: Nút "Gửi góp ý" rộng 100% bằng form input */
.btn-submit {
  width: 100%; 
  background: var(--accent-color, #e59866);
  color: #fff;
  border: none;
  padding: 12px 20px; 
  border-radius: 6px;
  font-weight: 600;
  font-size: 14px; 
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.3s ease;
  margin-top: 2px;
  box-sizing: border-box; 
}

.btn-submit:disabled {
  background: #a87250;
  cursor: not-allowed;
}

.btn-submit:hover:not(:disabled) {
  background: #d37e4c;
  transform: translateY(-1px);
}

.btn-submit .arrow {
  transition: transform 0.3s ease;
}

.btn-submit:hover:not(:disabled) .arrow {
  transform: translateX(4px);
}

/* ===== BOTTOM BAR ===== */
.footer-bottom {
  background: #2e1810; 
  text-align: center;
  padding: 15px 20px;
  font-size: 12px;
  color: var(--text-muted); 
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.footer-bottom p {
  margin: 0;
}

/* 👉 ĐÃ SỬA: TOAST MỚI (giống y hệt ảnh) */
.choco-toast {
  position: fixed;
  top: 30px;
  right: 30px;
  z-index: 10001;
  padding: 14px 20px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  font-family: var(--font-family);
  font-weight: 500;
  font-size: 15px;
  min-width: 250px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

/* Màu xanh y chang hình "Đã thêm vào giỏ hàng thành công!" */
.choco-toast.success {
  background-color: #E2F5E9; /* Xanh nền nhạt */
  color: #1A7A32; /* Chữ xanh đậm */
  border-left: 6px solid #22A042; /* Viền trái xanh đậm, dày */
}

/* Trong trường hợp lỗi */
.choco-toast.error {
  background-color: #fee2e2; 
  color: #b91c1c; 
  border-left: 6px solid #dc2626;
}

.toast-content {
  letter-spacing: 0.2px;
}

/* Hiệu ứng Toast trượt ra/vào */
.toast-slide-enter-active,
.toast-slide-leave-active {
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.toast-slide-enter-from,
.toast-slide-leave-to {
  transform: translateX(120%);
  opacity: 0;
}

/* ===== RESPONSIVE ===== */
@media (max-width: 1024px) {
  .footer-container {
    grid-template-columns: 1fr 1fr; 
    gap: 30px;
  }
  .brand-col {
    grid-column: span 2; 
    margin-bottom: 10px;
  }
}

@media (max-width: 768px) {
  .footer-container {
    grid-template-columns: 1fr; 
    padding: 30px 20px;
    gap: 25px;
  }
  
  .brand-col {
    grid-column: span 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .logo-text-wrapper {
    flex-direction: column; 
    text-align: center;
  }

  .footer-heading::after {
    left: 50%;
    transform: translateX(-50%);
  }

  .contact-list li {
    justify-content: center;
  }
  
  .brand-desc {
    max-width: 100%;
  }
}
</style>