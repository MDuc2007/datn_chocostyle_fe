<template>
  <div class="app-container">
    <Header></Header>

    <main class="main-content">
      <section class="sub-banner">
        <div class="banner-overlay"></div>
        <div class="banner-text">
          <h1>VỀ CHÚNG TÔI</h1>
          <p>Nâng tầm phong cách phái mạnh cùng ChocoStyle</p>
        </div>
      </section>

      <div class="breadcrumb-wrapper">
        <div class="breadcrumb">
          <span @click="$router.push('/')">Trang chủ</span>
          <span class="separator">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </span>
          <span class="current">Giới thiệu</span>
        </div>
      </div>

      <section class="section">
        <div class="info-container">
          
          <div class="story-section">
            <div class="story-content">
              <span class="badge-text">Câu chuyện thương hiệu</span>
              <h2 class="section-heading">Khởi nguồn từ đam mê,<br>Định hình phong cách.</h2>
              <div class="story-desc">
                <p>
                  Chào mừng bạn đến với <strong>ChocoStyle</strong> – Điểm đến lý tưởng cho những tín đồ yêu thích thời trang nam, đặc biệt là các dòng <strong>áo khoác</strong> chất lượng cao.
                </p>
                <p>
                  Ra đời với sứ mệnh mang lại sự ấm áp và phong cách tự tin cho phái mạnh, chúng tôi luôn cập nhật những xu hướng thời trang mới nhất để gửi đến bạn những sản phẩm hoàn thiện từ chất liệu đến từng đường kim mũi chỉ.
                </p>
                <p>
                  Dù bạn đang tìm kiếm một chiếc áo khoác phao giữ ấm cho mùa đông, một chiếc blazer thanh lịch cho công sở hay áo khoác da cá tính, <strong>ChocoStyle</strong> đều sẵn sàng đáp ứng mọi nhu cầu của bạn.
                </p>
              </div>
            </div>
            <div class="story-image-wrapper">
              <div class="image-backdrop"></div>
              <img src="/src/assets/logo/banner 1.png" alt="Câu chuyện ChocoStyle" class="story-image" />
            </div>
          </div>

          <div class="vision-mission-grid">
            <div class="core-card">
              <div class="core-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>
              </div>
              <h3 class="core-title">Tầm nhìn</h3>
              <p class="core-desc">Trở thành thương hiệu thời trang nam hàng đầu tại Việt Nam, mang đến trải nghiệm mua sắm tuyệt vời, cá nhân hóa và tiện lợi nhất cho khách hàng.</p>
            </div>
            
            <div class="core-card">
              <div class="core-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
              </div>
              <h3 class="core-title">Sứ mệnh</h3>
              <p class="core-desc">Cam kết cung cấp các sản phẩm chất lượng vượt trội, giá cả hợp lý, đi kèm với dịch vụ chăm sóc tận tâm, nâng tầm sự tự tin cho phái mạnh mỗi ngày.</p>
            </div>
          </div>

          <div class="services-section">
            <div class="text-center">
              <h2 class="section-heading">Tại sao chọn ChocoStyle?</h2>
            </div>
            
            <div class="services-grid">
              <div class="service-item">
                <div class="service-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>
                </div>
                <h4 class="service-title">Giao hàng toàn quốc</h4>
                <p class="service-desc">Giao hàng nhanh chóng tận nơi trên toàn quốc chỉ từ 2-4 ngày làm việc.</p>
              </div>
              
              <div class="service-item">
                <div class="service-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                </div>
                <h4 class="service-title">Kiểm tra trước khi nhận</h4>
                <p class="service-desc">Quyền lợi mở kiện hàng kiểm tra mẫu mã, chất liệu trước khi thanh toán.</p>
              </div>
              
              <div class="service-item">
                <div class="service-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 2v6h6"></path><path d="M21 12A9 9 0 0 0 6 5.3L3 8"></path><path d="M21 22v-6h-6"></path><path d="M3 12a9 9 0 0 0 15 6.7l3-2.7"></path></svg>
                </div>
                <h4 class="service-title">Đổi trả 7 ngày</h4>
                <p class="service-desc">Hỗ trợ đổi size hoặc trả hàng trong vòng 7 ngày nếu sản phẩm còn nguyên tem mác.</p>
              </div>
              
              <div class="service-item">
                <div class="service-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                </div>
                <h4 class="service-title">Bảo hành 30 ngày</h4>
                <p class="service-desc">Bảo hành cúc áo, khóa kéo và đường chỉ tận tâm trong vòng 30 ngày sử dụng.</p>
              </div>
            </div>
          </div>

          <div class="contact-section">
            <div class="contact-card">
              <div class="contact-info">
                <span class="badge-text">Kết nối với chúng tôi</span>
                <h2 class="section-heading" style="margin-bottom: 30px;">Thông tin liên hệ</h2>
                
                <ul class="contact-list">
                  <li>
                    <div class="icon-wrap">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                    </div>
                    <div class="text-wrap">
                      <strong>Địa chỉ văn phòng</strong>
                      <p>Số 123, Đường Thời Trang, Quận Trung Tâm, TP. Hà Nội</p>
                    </div>
                  </li>
                  <li>
                    <div class="icon-wrap">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                    </div>
                    <div class="text-wrap">
                      <strong>Hotline hỗ trợ</strong>
                      <p>0987.654.321 (Zalo OA)</p>
                    </div>
                  </li>
                  <li>
                    <div class="icon-wrap">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                    </div>
                    <div class="text-wrap">
                      <strong>Email liên hệ</strong>
                      <p>support@chocostyle.com</p>
                    </div>
                  </li>
                  <li>
                    <div class="icon-wrap">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                    </div>
                    <div class="text-wrap">
                      <strong>Giờ mở cửa</strong>
                      <p>08:00 - 22:00 (Từ Thứ 2 đến Chủ Nhật)</p>
                    </div>
                  </li>
                </ul>
              </div>
              
              <div class="contact-map">
                <div class="map-placeholder">
                  <svg class="map-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon><line x1="8" y1="2" x2="8" y2="18"></line><line x1="16" y1="6" x2="16" y2="22"></line></svg>
                  <span>ChocoStyle Store Map</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>
    </main>

    <Footer></Footer>
  </div>
</template>

<script setup>
import Header from "../../layout/header/Header.vue";
import Footer from "../../layout/footer/Footer.vue";
</script>

<style scoped>
/* ================= THIẾT LẬP CHUNG ================= */
:root {
  --brand-color: #6b3f1e;
  --brand-light: #fdf6f0;
  --text-main: #111827;
  --text-muted: #6b7280;
  --bg-color: #fafafa;
}

.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: var(--bg-color, #fafafa);
  font-family: 'Inter', sans-serif;
}

.main-content {
  flex-grow: 1;
}

/* ================= BANNER ================= */
.sub-banner {
  position: relative;
  background: url('/src/assets/logo/banner 1.png') center/cover no-repeat;
  height: 280px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: white;
}

.banner-overlay {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: linear-gradient(to right, rgba(0,0,0,0.7), rgba(0,0,0,0.4));
  z-index: 1;
}

.banner-text {
  position: relative;
  z-index: 2;
  padding: 0 20px;
}

.banner-text h1 { 
  margin: 0 0 12px 0; 
  letter-spacing: 4px; 
  font-size: 36px; 
  font-weight: 800;
  text-transform: uppercase;
}

.banner-text p { 
  margin: 0; 
  font-size: 16px; 
  opacity: 0.9; 
  font-weight: 400;
  letter-spacing: 0.5px;
}

/* ================= BREADCRUMB ================= */
.breadcrumb-wrapper {
  background: #fff;
  border-bottom: 1px solid #f3f4f6;
}

.breadcrumb {
  max-width: 1200px;
  margin: 0 auto;
  padding: 16px 20px;
  font-size: 14px;
  color: #6b7280;
  display: flex;
  align-items: center;
}

.breadcrumb span { cursor: pointer; transition: color 0.2s; }
.breadcrumb span:hover { color: #6b3f1e; }
.breadcrumb .separator { margin: 0 8px; display: flex; align-items: center; }
.breadcrumb .separator svg { width: 14px; height: 14px; }
.breadcrumb .current { font-weight: 500; color: #111827; cursor: default; }

/* ================= BỐ CỤC NỘI DUNG ================= */
.section {
  padding: 60px 20px 80px;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
}

.info-container {
  display: flex;
  flex-direction: column;
  gap: 80px; /* Tăng khoảng cách giữa các section cho thoáng */
}

/* Typograpy dùng chung */
.badge-text {
  display: inline-block;
  color: #6b3f1e;
  font-size: 13px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  margin-bottom: 16px;
}

.section-heading {
  font-size: 32px;
  font-weight: 800;
  color: #111827;
  line-height: 1.3;
  margin: 0 0 24px 0;
}

.text-center { text-align: center; }

/* ================= 1. CÂU CHUYỆN THƯƠNG HIỆU ================= */
.story-section {
  display: flex;
  align-items: center;
  gap: 60px;
}

.story-content {
  flex: 1.2;
}

.story-desc p {
  font-size: 16px;
  color: #4b5563;
  line-height: 1.8;
  margin-bottom: 16px;
}

.story-desc strong {
  color: #111827;
  font-weight: 600;
}

.story-image-wrapper {
  flex: 1;
  position: relative;
}

.image-backdrop {
  position: absolute;
  top: -20px;
  left: 20px;
  right: -20px;
  bottom: 20px;
  background-color: #fdf6f0;
  border-radius: 16px;
  z-index: 1;
}

.story-image {
  position: relative;
  z-index: 2;
  width: 100%;
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.08);
  display: block;
}

/* ================= 2. TẦM NHÌN & SỨ MỆNH ================= */
.vision-mission-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
}

.core-card {
  background: #fff;
  padding: 40px;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
  text-align: center;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.core-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 30px rgba(107, 63, 30, 0.08);
}

.core-icon {
  width: 64px;
  height: 64px;
  background: #fdf6f0;
  color: #6b3f1e;
  border-radius: 16px; /* Bo góc vuông thay vì tròn để hiện đại hơn */
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
  transform: rotate(3deg);
  transition: transform 0.3s;
}

.core-card:hover .core-icon {
  transform: rotate(0deg) scale(1.05);
}

.core-icon svg { width: 32px; height: 32px; }

.core-title {
  font-size: 22px;
  color: #111827;
  margin: 0 0 16px 0;
  font-weight: 700;
}

.core-desc {
  color: #6b7280;
  line-height: 1.6;
  font-size: 15px;
  margin: 0;
}

/* ================= 3. CHÍNH SÁCH DỊCH VỤ ================= */
.services-section {
  padding-top: 20px;
}

.services-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  margin-top: 40px;
}

.service-item {
  background: #fff;
  padding: 30px 24px;
  border-radius: 16px;
  text-align: center;
  border: 1px solid #f3f4f6;
  transition: border-color 0.3s;
}

.service-item:hover {
  border-color: #6b3f1e;
}

.service-icon {
  color: #6b3f1e;
  margin-bottom: 20px;
  display: flex;
  justify-content: center;
}

.service-icon svg { width: 36px; height: 36px; }

.service-title {
  font-size: 16px;
  color: #111827;
  font-weight: 700;
  margin: 0 0 12px 0;
}

.service-desc {
  font-size: 14px;
  color: #6b7280;
  line-height: 1.6;
  margin: 0;
}

/* ================= 4. LIÊN HỆ & BẢN ĐỒ ================= */
.contact-section {
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.03);
  overflow: hidden;
}

.contact-card {
  display: grid;
  grid-template-columns: 1fr 1fr;
}

.contact-info {
  padding: 50px;
}

.contact-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.contact-list li {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.icon-wrap {
  width: 40px;
  height: 40px;
  background: #fdf6f0;
  color: #6b3f1e;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.icon-wrap svg { width: 20px; height: 20px; }

.text-wrap strong {
  display: block;
  font-size: 15px;
  color: #111827;
  margin-bottom: 4px;
}

.text-wrap p {
  margin: 0;
  font-size: 14px;
  color: #4b5563;
  line-height: 1.5;
}

.contact-map {
  width: 100%;
  height: 100%;
  min-height: 400px;
  background: #f9fafb;
}

.map-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
  background-image: radial-gradient(#e5e7eb 1px, transparent 1px);
  background-size: 20px 20px;
}

.map-icon {
  width: 48px;
  height: 48px;
  margin-bottom: 16px;
  color: #d1d5db;
}

/* ================= RESPONSIVE ================= */
@media (max-width: 1024px) {
  .services-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 900px) {
  .story-section { 
    flex-direction: column; 
    gap: 40px;
  }
  .image-backdrop {
    top: 20px; left: -15px; right: 15px; bottom: -15px;
  }
  .contact-card { 
    grid-template-columns: 1fr; 
  }
  .contact-map { 
    min-height: 300px; 
  }
  .contact-info {
    padding: 40px 20px;
  }
}

@media (max-width: 768px) {
  .vision-mission-grid { 
    grid-template-columns: 1fr; 
  }
  .services-grid { 
    grid-template-columns: 1fr; 
  }
  .banner-text h1 { 
    font-size: 28px;
  }
  .section-heading {
    font-size: 26px;
  }
}
</style>