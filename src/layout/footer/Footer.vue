<template>
  <footer class="footer">
    <div class="footer-container">
      <!-- LEFT -->
      <div class="footer-left">
        <h4>Góp ý</h4>
        <input placeholder="Nhập email..." />
        <input placeholder="Nhập góp ý..." />
      </div>

      <!-- CENTER -->
      <div class="footer-center">
        <div class="logo-wrap">
          <img
            src="/src/assets/logo/choco-removebg-preview.png"
            class="footer-logo"
          />
        </div>

        <p class="desc">
          Chúng tôi luôn quý trọng và tiếp thu mọi ý kiến đóng góp từ khách
          hàng, nâng cao trải nghiệm dịch vụ cũng như chất lượng sản phẩm.
        </p>
      </div>

      <!-- RIGHT -->
      <div class="footer-right">
        <h4>Hotline</h4>
        <p>📞 0363 636 36</p>
        <p>✉️ ChocoStyle@gmail.com</p>

        <h4 style="margin-top: 16px">Địa chỉ</h4>
        <p>36 Phố Huế, Hai Bà Trưng, Hà Nội</p>
      </div>
    </div>

    <div class="footer-bottom">© 2026 CHOCOSTYLE. All rights reserved.</div>
  </footer>
</template>

<style scoped>
.footer {
  background: #6b3f1e;
  color: #fff;
}

.footer-container {
  max-width: 1400px;
  margin: auto;
  padding: 50px 30px;

  display: grid;
  grid-template-columns: 1fr 1.4fr 1fr;
  gap: 100px;
  align-items: center;
}

/* ===== LEFT ===== */
.footer-left {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.footer-left input {
  padding: 10px 12px;
  border-radius: 8px;
  border: none;
  outline: none;
}

/* ===== CENTER ===== */
.footer-center {
  text-align: center;
}

.logo-wrap {
  width: 120px;
  height: 120px;
  background: white;
  border-radius: 50%;

  display: flex;
  align-items: center;
  justify-content: center;

  margin: 0 auto 16px;
}

.footer-logo {
  width: 160%;
}

.desc {
  font-size: 14px;
  opacity: 0.9;
  line-height: 1.6;
}

/* ===== RIGHT ===== */
.footer-right h4 {
  margin-bottom: 8px;
}

.footer-right p {
  margin: 4px 0;
}

/* ===== MOBILE ===== */
@media (max-width: 768px) {
  .footer-container {
    grid-template-columns: 1fr;
    text-align: center;
  }
}
.footer-bottom {
  display: flex;
  justify-content: center;
  align-items: center;

  background: #553018;
  padding: 16px;
  font-size: 13px;
}
</style>
