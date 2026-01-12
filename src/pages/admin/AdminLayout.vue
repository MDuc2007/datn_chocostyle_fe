<template>
  <div class="admin-layout">
    <aside class="sidebar">
      <h3>ChocoStyle Admin</h3>
      <nav>
        <router-link to="/admin/product">📦 Quản lý Sản phẩm</router-link>
        <router-link to="/admin/invoice">📄 Quản lý Hóa đơn</router-link>
        <router-link to="/admin/voucher">🎫 Phiếu giảm giá</router-link>
        <router-link to="/admin/promotion">🔥 Đợt giảm giá</router-link>
        <router-link to="/admin/employee">👥 Nhân viên</router-link>
        <router-link to="/admin/customer">👤 Khách hàng</router-link>
      </nav>
    </aside>

    <main class="main-content">
      <router-view /> </main>
  </div>
</template>

