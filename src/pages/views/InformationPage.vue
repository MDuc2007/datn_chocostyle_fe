<template>
  <div class="app-container">
    <Header></Header>

    <main class="main-content">
      <section class="sub-banner info-banner">
        <div class="banner-text">
          <h1>VỀ CHÚNG TÔI</h1>
          <p>Choco Style - Khởi nguồn từ đam mê, mang đến phong cách.</p>
        </div>
      </section>

      <div class="breadcrumb">
        <span @click="$router.push('/')">Trang chủ</span>
        <span class="separator">/</span>
        <span class="current">Thông tin</span>
      </div>

      <section class="section">
        <div class="info-container">
          
          <div class="info-card flex-card">
            <div class="card-text">
              <h3><i class="fa fa-book-open"></i> Câu chuyện thương hiệu</h3>
              <p>
                Chào mừng bạn đến với <strong class="highlight">Choco Style</strong> – Điểm đến lý tưởng cho những tín đồ yêu thích thời trang, đặc biệt là các dòng <strong>áo khoác</strong> chất lượng cao. 
              </p>
              <p>
                Ra đời với sứ mệnh mang lại sự ấm áp và phong cách tự tin cho khách hàng, chúng tôi luôn cập nhật những xu hướng thời trang mới nhất để gửi đến bạn những sản phẩm hoàn thiện từ chất liệu đến từng đường kim mũi chỉ.
              </p>
              <p>
                Dù bạn đang tìm kiếm một chiếc áo khoác phao giữ ấm cho mùa đông, một chiếc blazer thanh lịch cho công sở hay áo khoác da cá tính, <strong class="highlight">Choco Style</strong> đều sẵn sàng đáp ứng.
              </p>
            </div>
            <div class="card-image">
              <img src="/src/assets/logo/banner 1.png" alt="Cửa hàng Choco Style" />
            </div>
          </div>

          <div class="info-grid">
            <div class="info-box hover-lift">
              <div class="icon-circle">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>
              </div>
              <h4>Tầm nhìn</h4>
              <p>Trở thành thương hiệu thời trang áo khoác hàng đầu tại Việt Nam, mang đến trải nghiệm mua sắm tuyệt vời và tiện lợi nhất cho khách hàng.</p>
            </div>
            <div class="info-box hover-lift">
              <div class="icon-circle">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
              </div>
              <h4>Sứ mệnh</h4>
              <p>Cam kết cung cấp các sản phẩm chất lượng, giá cả hợp lý, đi kèm với dịch vụ chăm sóc khách hàng tận tâm và chuyên nghiệp.</p>
            </div>
          </div>

          <div class="info-card policy-card">
            <h3><i class="fa fa-shield-alt"></i> Chính sách mua hàng & Đổi trả</h3>
            <div class="policy-grid">
              <div class="policy-item">
                <div class="policy-icon">🚚</div>
                <div>
                  <strong>Giao hàng toàn quốc</strong>
                  <p>Hỗ trợ giao hàng tận nơi trên toàn quốc với thời gian nhanh nhất từ 2-4 ngày làm việc.</p>
                </div>
              </div>
              <div class="policy-item">
                <div class="policy-icon">📦</div>
                <div>
                  <strong>Kiểm tra hàng trước</strong>
                  <p>Quý khách được quyền mở kiện hàng kiểm tra mẫu mã, kích cỡ trước khi thanh toán.</p>
                </div>
              </div>
              <div class="policy-item">
                <div class="policy-icon">🔄</div>
                <div>
                  <strong>Đổi trả dễ dàng</strong>
                  <p>Hỗ trợ đổi size hoặc trả hàng trong vòng <strong>7 ngày</strong> kể từ ngày nhận hàng (sản phẩm còn nguyên tem mác).</p>
                </div>
              </div>
              <div class="policy-item">
                <div class="policy-icon">🛡️</div>
                <div>
                  <strong>Bảo hành sản phẩm</strong>
                  <p>Bảo hành cúc áo, khóa kéo và đường chỉ trong vòng 30 ngày sử dụng.</p>
                </div>
              </div>
            </div>
          </div>

          <div class="info-card contact-wrapper">
            <div class="contact-content">
              <h3><i class="fa fa-envelope"></i> Thông tin liên hệ</h3>
              <p class="contact-subtitle">Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn.</p>
              
              <ul class="contact-list">
                <li>
                  <i class="fa fa-map-marker-alt text-primary"></i> 
                  <span><strong>Địa chỉ:</strong> Số 123, Đường Thời Trang, Quận Trung Tâm, TP. Hà Nội</span>
                </li>
                <li>
                  <i class="fa fa-phone-alt text-primary"></i> 
                  <span><strong>Hotline:</strong> 0987.654.321 (Zalo/Zalo OA)</span>
                </li>
                <li>
                  <i class="fa fa-envelope text-primary"></i> 
                  <span><strong>Email:</strong> support@chocostyle.com</span>
                </li>
                <li>
                  <i class="fa fa-clock text-primary"></i> 
                  <span><strong>Giờ mở cửa:</strong> 08:00 - 22:00 (Từ Thứ 2 đến Chủ Nhật)</span>
                </li>
              </ul>
            </div>
            
            <div class="contact-map">
              <div class="map-placeholder">
                <i class="fa fa-map-marked-alt map-icon"></i>
                <p>Bản đồ Choco Style</p>
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
.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #fafafa;
}

.main-content {
  flex-grow: 1;
}

/* Banner */
.sub-banner {
  background: linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('/src/assets/logo/banner 1.png') center/cover;
  background-color: #63391f;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: white;
}
.sub-banner h1 { margin: 0 0 10px 0; letter-spacing: 3px; font-size: 32px; font-weight: 800;}
.sub-banner p { margin: 0; font-size: 16px; opacity: 0.9; }

/* Breadcrumb */
.breadcrumb {
  max-width: 1100px;
  margin: 20px auto 0;
  padding: 0 4%;
  font-size: 14px;
  color: #666;
}
.breadcrumb span { cursor: pointer; transition: 0.2s; }
.breadcrumb span:hover { color: #6b3f1e; }
.breadcrumb .separator { margin: 0 10px; cursor: default; }
.breadcrumb .current { font-weight: 600; color: #6b3f1e; cursor: default; }

.section {
  padding: 30px 4% 60px;
  max-width: 1100px; /* Thu hẹp 1 chút để đọc chữ dễ hơn */
  margin: 0 auto;
  width: 100%;
}

.highlight { color: #6b3f1e; }
.text-primary { color: #6b3f1e; width: 25px; text-align: center;}

/* Container chính */
.info-container {
  display: flex;
  flex-direction: column;
  gap: 35px;
}

.info-card {
  background: #fff;
  padding: 40px;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
  border: 1px solid #f0f0f0;
}

.info-card h3 {
  font-size: 22px;
  color: #222;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
}
.info-card h3 i { color: #6b3f1e; font-size: 20px;}

.info-card p {
  line-height: 1.8;
  color: #555;
  margin-bottom: 15px;
  font-size: 15px;
}

/* Flex Card cho giới thiệu */
.flex-card {
  display: flex;
  gap: 40px;
  align-items: center;
}
.card-text { flex: 1.2; }
.card-image { 
  flex: 1; 
  border-radius: 12px; 
  overflow: hidden; 
  box-shadow: 0 10px 20px rgba(0,0,0,0.1);
  height: 250px;
}
.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}
.card-image:hover img { transform: scale(1.05); }

/* Info Grid (Tầm nhìn sứ mệnh) */
.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
}

.info-box {
  background: #fff;
  padding: 35px 30px;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
  border: 1px solid #f0f0f0;
  text-align: center;
  transition: all 0.3s ease;
}

.hover-lift:hover {
  transform: translateY(-8px);
  border-color: #6b3f1e;
  box-shadow: 0 15px 30px rgba(107, 63, 30, 0.1);
}

.icon-circle {
  width: 70px;
  height: 70px;
  background: #fdf8f6;
  color: #6b3f1e;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
}
.icon-circle svg { width: 35px; height: 35px; }

.info-box h4 {
  font-size: 20px;
  color: #333;
  margin-bottom: 15px;
  font-weight: 700;
}

.info-box p {
  color: #666;
  line-height: 1.6;
  margin: 0;
}

/* Grid Chính sách */
.policy-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 25px;
  margin-top: 20px;
}
.policy-item {
  display: flex;
  gap: 15px;
  background: #fcfcfc;
  padding: 20px;
  border-radius: 12px;
  border: 1px solid #eee;
}
.policy-icon { font-size: 30px; }
.policy-item strong { display: block; margin-bottom: 8px; font-size: 15px; color: #222;}
.policy-item p { margin: 0; font-size: 14px; color: #666; line-height: 1.5;}

/* Liên hệ Wrapper */
.contact-wrapper {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  background-color: #fff; 
}
.contact-subtitle { color: #888 !important; margin-bottom: 25px !important;}
.contact-list {
  list-style: none;
  padding: 0;
  margin: 0;
}
.contact-list li {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-bottom: 18px;
  font-size: 15px;
  color: #444;
  line-height: 1.5;
}

.contact-map {
  width: 100%;
  height: 100%;
  min-height: 250px;
  border-radius: 12px;
  overflow: hidden;
}
.map-placeholder {
  width: 100%;
  height: 100%;
  background: #f0f0f0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #999;
  border: 2px dashed #ddd;
}
.map-icon { font-size: 40px; margin-bottom: 10px; color: #ccc;}

/* Responsive */
@media (max-width: 900px) {
  .flex-card { flex-direction: column; }
  .card-image { width: 100%; height: 300px;}
  .contact-wrapper { grid-template-columns: 1fr; }
  .contact-map { height: 300px; }
}

@media (max-width: 768px) {
  .info-grid { grid-template-columns: 1fr; }
  .policy-grid { grid-template-columns: 1fr; }
  .info-card, .info-box { padding: 25px; }
  .sub-banner h1 { font-size: 26px;}
}
</style>