<template>
  <footer class="footer">
    <div class="footer-container">
      <div>
        <img
          src="/src/assets/logo/choco-removebg-preview.png"
          class="footer-logo"
        />
        <p>
          Chúng tôi luôn quy trọng và tiếp thu mọi ý kiến đóng góp từ khách
          hàng, nâng cao trải nghiệm dịch vụ cũng như chất lượng sản phẩm.
        </p>
      </div>

      <div>
        <h4>Hotline</h4>
        <p>📞 0363 636 36</p>
        <p>✉️ ChocoStyle@gmail.com</p>
      </div>

      <div>
        <h4>Địa chỉ</h4>
        <p>36 Phố Huế, Quận Hai Bà Trưng, Hà Nội</p>
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
  grid-template-columns: 2fr 1fr 1fr;
  gap: 50px;
}

.footer-logo {
  width: 120px; /* Increased logo size */
  margin-bottom: 15px;
}

.footer h4 {
  margin-bottom: 10px;
}

.footer-bottom {
  text-align: center;
  background: #553018;
  padding: 16px;
  font-size: 13px;
}

@media (max-width: 768px) {
  .footer-container {
    grid-template-columns: 1fr;
  }
}
</style>
