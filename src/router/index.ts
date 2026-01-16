import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
const routes: Array<RouteRecordRaw> = [
  // 1. Quản lý sản phẩm
  {
    path: '/admin/product',
    component: () => import('../pages/admin/product/ProductManager.vue')
  },
  {
    path: '/admin/product/create',
    component: () => import('../pages/admin/product/AddProduct.vue')
  },
  // 2. Quản lý hoá đơn
  {
    path: '/admin/invoice',
    component: () => import('../pages/admin/invoice/InvoiceList.vue')
  },
  // 3. Quản lý phiếu giảm giá
  {
    path: '/admin/voucher',
    component: () => import('../pages/admin/voucher/VoucherManager.vue')
  },
  // 4. Quản lý đợt giảm giá
  {
    path: '/admin/promotion',
    component: () => import('../pages/admin/promotion/PromotionManager.vue')
  },
  // 5. Quản lý nhân viên
  {
    path: '/admin/employee',
    component: () => import('../pages/admin/employee/EmployeeManager.vue')
  },
  {
    path: '/admin/employee/add',
    name: 'add-employee',
    component: () => import('../pages/admin/employee/AddEmployee.vue')
  },
  // 6. Quản lý khách hàng
  {
    path: '/admin/customer',
    component: () => import('../pages/admin/customer/CustomerManager.vue')
  }
];
const router = createRouter({
  history: createWebHistory(),
  routes
});
export default router;