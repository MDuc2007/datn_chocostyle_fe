import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
const routes: Array<RouteRecordRaw> = [
  // 1. Quản lý sản phẩm
  {
    path: "/admin/product",
    component: () => import("../pages/admin/product/ProductManager.vue"),
  },
  {
    path: "/admin/product/create",
    component: () => import("../pages/admin/product/AddProduct.vue"),
  },
  {
    path: "/admin/product/update/:id",
    component: () => import("../pages/admin/product/AddProduct.vue"),
    props: true,
  },
  // {
  //   path: "/admin/product/:id/details",
  //   name: "ProductDetails",
  //   component: () => import("../pages/admin/product/DetailProduct.vue"),
  // },
  // {
  //   path: "/admin/chi-tiet-san-pham/edit/:id",
  //   name: "EditDetailsProduct",
  //   component: () => import("../pages/admin/product/EditDetailsProduct.vue"),
  // },

  // 1.1. Quản lý màu sắc
  {
    path: "/admin/color",
    component: () => import("../pages/admin/product/ColorManager.vue"),
  },
  // 1.2. Quản lý kích cỡ
  {
    path: "/admin/size",
    component: () => import("../pages/admin/product/SizeManager.vue"),
  },
  // 1.3. Quản lý chất liệu
  {
    path: "/admin/material",
    component: () => import("../pages/admin/product/MaterialManager.vue"),
  },
  // 1.4. Quản lý xuất xứ
  {
    path: "/admin/origin",
    component: () => import("../pages/admin/product/OriginManager.vue"),
  },
  //1.5 Quản lý phong cách mặc
  {
    path: "/admin/style",
    component: () => import("../pages/admin/product/StyleManager.vue"),
  },
  //1.6 Quản lý loại áo
  {
    path: "/admin/type",
    component: () => import("../pages/admin/product/TypeManager.vue"),
  },
  //1.7 Quản lý kiểu dáng
  {
    path: "/admin/shapetype",
    component: () => import("../pages/admin/product/ShapeTypeManager.vue"),
  },
  // 2. Quản lý hoá đơn
  {
    path: "/admin/invoice",
    component: () => import("../pages/admin/invoice/InvoiceList.vue"),
  },
  // 3. Quản lý phiếu giảm giá
  {
    path: "/admin/voucher",
    component: () => import("../pages/admin/voucher/VoucherManager.vue"),
  },
{
  path: "/admin/voucher/create",
  component: () => import("../pages/admin/voucher/VoucherCreate.vue")
},
{
  path: "/admin/voucher/update/:id",
  component: () => import("../pages/admin/voucher/VoucherUpdate.vue")
},

  // 4. Quản lý đợt giảm giá
  {
    path: "/admin/promotion",
    component: () => import("../pages/admin/promotion/PromotionManager.vue"),
  },
  {
  path: '/admin/promotion/create',
  component: () => import('../pages/admin/promotion/PromotionCreate.vue')
},
{
  path: '/admin/promotion/:id/edit',
  component: () => import('../pages/admin/promotion/PromotionEdit.vue')
},

  // 5. Quản lý nhân viên
  {
    path: "/admin/employee",
    component: () => import("../pages/admin/employee/EmployeeManager.vue"),
  },
  {
    path: "/admin/employee/add",
    name: "add-employee",
    component: () => import("../pages/admin/employee/AddEmployee.vue"),
  },
  // 6. Quản lý khách hàng
  {
    path: "/admin/customer",
    component: () => import("../pages/admin/customer/CustomerManager.vue"),
  },
];
const router = createRouter({
  history: createWebHistory(),
  routes,
});
export default router;
