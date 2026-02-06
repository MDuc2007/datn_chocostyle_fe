import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";

// Import Layout Admin
import AdminLayout from "../pages/admin/AdminLayout.vue";

const routes: Array<RouteRecordRaw> = [
  // =================================================================
  // 1. PUBLIC ROUTES (Dành cho khách hàng)
  // =================================================================
  {
    path: "/",
    name: "Home",
    component: () => import("../pages/views/Home.vue"),
  },
  {
    path: "/home/product/:id",
    name: "ProductDetailHome",
    component: () => import("../pages/views/DetailProductHome.vue"),
  },
  {
    path: "/payment",
    name: "PaymentPage",
    component: () => import("../pages/views/PaymentPage.vue"),
  },
  {
    path: "/login",
    name: "Login",
    component: () => import("../views/LoginView.vue"),
  },
  {
    path: "/register",
    name: "Register",
    component: () => import("../views/RegisterView.vue"),
  },
  {
    path: "/forgot-password",
    name: "ForgotPassword",
    component: () => import("../views/ForgotPasswordView.vue"),
  },
  {
    path: "/reset-password",
    name: "ResetPassword",
    component: () => import("../views/ResetPasswordView.vue"),
  },
  {
    path: "/oauth2/redirect",
    component: () => import("../views/OAuth2Redirect.vue"),
  },

  // =================================================================
  // 2. ADMIN ROUTES (Sử dụng Layout chung & Phân quyền)
  // =================================================================
  {
    path: "/admin",
    component: AdminLayout,
    meta: { authorize: ["ROLE_ADMIN", "ROLE_STAFF"] },
    children: [
      // 2.0. Thống kê & Dashboard
      {
        path: "dashboard",
        name: "Dashboard",
        component: () => import("../pages/admin/dashboard/Dashboard.vue"),
      },
      {
        path: "statistic",
        name: "Statistic",
        component: () => import("../pages/admin/dashboard/Dashboard.vue"),
      },

      // 2.1. Quản lý sản phẩm & Thuộc tính
      {
        path: "product",
        component: () => import("../pages/admin/product/ProductManager.vue"),
      },
      {
        path: "product/create",
        component: () => import("../pages/admin/product/AddProduct.vue"),
      },
      {
        path: "product/update/:id",
        component: () => import("../pages/admin/product/AddProduct.vue"),
        props: true,
      },
      {
        path: "product/:id/details",
        name: "ProductDetails",
        component: () => import("../pages/admin/product/DetailProduct.vue"),
      },
      {
        path: "product/details",
        name: "ProductDetailsAll",
        component: () => import("../pages/admin/product/DetailProductList.vue"),
      },
      {
        path: "chi-tiet-san-pham/:productId/edit/:id",
        name: "EditDetailsProduct",
        component: () =>
          import("../pages/admin/product/EditDetailsProduct.vue"),
      }, // Thuộc tính sản phẩm
      {
        path: "color",
        component: () => import("../pages/admin/product/ColorManager.vue"),
      },
      {
        path: "size",
        component: () => import("../pages/admin/product/SizeManager.vue"),
      },
      {
        path: "material",
        component: () => import("../pages/admin/product/MaterialManager.vue"),
      },
      {
        path: "origin",
        component: () => import("../pages/admin/product/OriginManager.vue"),
      },
      {
        path: "style",
        component: () => import("../pages/admin/product/StyleManager.vue"),
      },
      {
        path: "type",
        component: () => import("../pages/admin/product/TypeManager.vue"),
      },
      {
        path: "shapetype",
        component: () => import("../pages/admin/product/ShapeTypeManager.vue"),
      },

      // 2.2. Quản lý hoá đơn
      {
        path: "invoice",
        name: "InvoiceList",
        component: () => import("../pages/admin/invoice/InvoiceList.vue"),
      },
      {
        path: "invoice/:id",
        name: "InvoiceDetail",
        component: () => import("../pages/admin/invoice/InvoiceDetail.vue"),
        props: true,
      },

      // 2.3. Bán hàng tại quầy
      {
        path: "sales",
        name: "CounterSales",
        component: () => import("../pages/admin/sales/CounterSales.vue"),
      },

      // 2.4. Quản lý Phiếu giảm giá & Đợt giảm giá
      {
        path: "voucher",
        component: () => import("../pages/admin/voucher/VoucherManager.vue"),
      },
      {
        path: "voucher/create",
        component: () => import("../pages/admin/voucher/VoucherCreate.vue"),
      },
      {
        path: "voucher/update/:id",
        component: () => import("../pages/admin/voucher/VoucherUpdate.vue"),
      },
      {
        path: "promotion",
        component: () =>
          import("../pages/admin/promotion/PromotionManager.vue"),
      },
      {
        path: "promotion/create",
        component: () => import("../pages/admin/promotion/PromotionCreate.vue"),
      },
      {
        path: "promotion/:id/edit",
        component: () => import("../pages/admin/promotion/PromotionEdit.vue"),
      },

      // 2.5. Quản lý Nhân sự & Lịch làm việc
      {
        path: "employee",
        component: () => import("../pages/admin/employee/EmployeeManager.vue"),
      },
      {
        path: "employee/add",
        name: "add-employee",
        component: () => import("../pages/admin/employee/AddEmployee.vue"),
      },
      {
        path: "employee/edit/:id",
        name: "EditEmployee",
        component: () => import("../pages/admin/employee/EditEmployee.vue"),
      },
      {
        path: "shift",
        name: "ShiftManager",
        component: () => import("../pages/admin/Calendar/ShiftManager.vue"),
      },
      {
        path: "schedule",
        name: "ScheduleManager",
        component: () => import("../pages/admin/Calendar/ScheduleManager.vue"),
      },
      {
        path: "employee-schedule",
        name: "MySchedule",
        component: () =>
          import("../pages/admin/Calendar/EmployeeScheduleView.vue"),
      },

      // 2.6. Quản lý khách hàng
      {
        path: "customer",
        name: "CustomerList",
        component: () => import("../pages/admin/customer/CustomerManager.vue"),
      },
      {
        path: "customer/add",
        name: "CustomerCreate",
        component: () => import("../pages/admin/customer/CustomerCreate.vue"),
      },
      {
        path: "customer/edit/:id",
        name: "CustomerEdit",
        component: () => import("../pages/admin/customer/CustomerEdit.vue"),
      },
    ],
  },

  // 3. STAFF ROUTES (Nếu có giao diện POS riêng ngoài Admin Layout)
  {
    path: "/staff/pos",
    component: () => import("../pages/staff/PosCounter.vue"),
    meta: { authorize: ["ROLE_ADMIN", "ROLE_STAFF"] },
  },

  // Redirect lỗi 404
  { path: "/:pathMatch(.*)*", redirect: "/" },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// =================================================================
// 4. NAVIGATION GUARD (BẢO VỆ HỆ THỐNG)
// =================================================================
router.beforeEach((to, from, next) => {
  const publicPages = [
    "/",
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
    "/oauth2/redirect",
  ];

  // Kiểm tra nếu route hiện tại (to.path) có nằm trong danh sách public không
  // Lưu ý: Dùng .some để kiểm tra chính xác hơn với các route động như /home/product/:id
  const isPublic =
    publicPages.includes(to.path) || to.path.startsWith("/home/product/");
  const authRequired = !isPublic;

  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;

  // 1. Chưa đăng nhập mà vào trang bảo mật
  if (authRequired && !user) {
    return next("/login");
  }

  // 2. Kiểm tra quyền Role
  if (to.meta.authorize) {
    const allowedRoles = to.meta.authorize as string[];
    if (user && !allowedRoles.includes(user.role)) {
      return next("/"); // Không đủ quyền thì về trang chủ
    }
  }

  // 3. Đã đăng nhập mà cố vào trang Login/Register
  if (user && (to.path === "/login" || to.path === "/register")) {
    if (user.role === "ROLE_ADMIN" || user.role === "ROLE_STAFF") {
      return next("/admin/dashboard");
    }
    return next("/");
  }

  next();
});

export default router;
