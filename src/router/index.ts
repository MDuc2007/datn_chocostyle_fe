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
    path: "/change-password",
    name: "ChangePassword",
    component: () => import("../pages/views/ChangePassword.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/moi-ve",
    name: "NewArrivals",
    component: () => import("../pages/views/NewArrivalsPage.vue"),
  },
  {
    path: "/uu-dai",
    name: "Promotions",
    component: () => import("../pages/views/PromotionsPage.vue"),
  },
  {
    path: "/payment",
    name: "PaymentPage",
    component: () => import("../pages/views/PaymentPage.vue"),
  },
  {
    path: "/cart",
    name: "Cart",
    component: () => import("../pages/views/Cart.vue"),
  },
  {
    path: "/ao-khoac",
    name: "JacketPage",
    component: () => import("../pages/views/JacketPage.vue"),
  },
  {
    path: "/thong-tin",
    name: "Information",
    component: () => import("../pages/views/InformationPage.vue"),
  },
  {
    path: "/tra-cuu",
    name: "OrderTracking",
    component: () => import("../pages/views/OrderTrackingPage.vue"),
  },
  {
    path: "/payment-result",
    name: "PaymentResult",
    component: () => import("../pages/views/PaymentResult.vue"),
  },

  // 2. Route lịch sử mua hàng (Cần đăng nhập)
  {
    path: "/my-orders",
    name: "MyOrders",
    component: () => import("../pages/views/InvoiceList.vue"),
  },
  {
    path: "/order-detail/:id",
    name: "ClientOrderDetail",
    component: () => import("../pages/views/InvoiceDetail.vue"),
  },
  {
    path: "/order-detail/:id",
    name: "ClientOrderDetail",
    component: () => import("../pages/views/InvoiceDetail.vue"),
  },

  {
    path: "/profile",
    name: "UserProfile",
    component: () => import("../pages/views/UserProfile.vue"),
  },
  {
    path: "/address",
    name: "UserAddress",
    component: () => import("../pages/views/UserAddress.vue"),
  },
  {
    path: "/my-vouchers",
    name: "UserVoucher",
    component: () => import("../pages/views/UserVoucher.vue"),
  },

  // LOGIN KHÁCH HÀNG
  {
    path: "/login",
    name: "LoginCustomer",
    component: () => import("../views/LoginView.vue"),
  },

// =================================================================
  // AUTHENTICATION ROUTES (Đăng nhập / Đăng ký / Quên Mật Khẩu)
  // =================================================================
  
  // 👉 LUỒNG KHÁCH HÀNG
  {
    path: "/login",
    name: "LoginCustomer",
    component: () => import("../views/LoginView.vue"),
  },
  {
    path: "/register",
    name: "Register",
    component: () => import("../views/RegisterView.vue"),
  },
  {
    path: "/forgot-password",
    name: "ForgotPasswordCustomer",
    // Trỏ đến file mới dành riêng cho Khách Hàng
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

  // 👉 LUỒNG NHÂN VIÊN / ADMIN
  {
    path: "/admin/login",
    alias: "/login-admin", // Bí danh (alias) hỗ trợ nếu người dùng nhập url /login-admin
    name: "LoginStaff",
    component: () => import("../views/AdminLogin.vue"),
  },
  {
    path: "/admin/forgot-password",
    name: "ForgotPasswordStaff",
    // Trỏ đến file mới dành riêng cho Nhân viên
    component: () => import("../views/ForgotPasswordStaff.vue"),
  },
  // =================================================================
  // 2. ADMIN ROUTES (Sử dụng Layout chung & Phân quyền)
  // =================================================================
  {
    path: "/admin",
    component: AdminLayout,
    meta: { authorize: ["ROLE_ADMIN"] },
    children: [
      // 2.0. Thống kê & Dashboard
// 2.0. Thống kê & Dashboard
      {
        path: "dashboard",
        name: "Dashboard",
        component: () => import("../pages/admin/dashboard/Dashboard.vue"),
      },
      {
        path: "profile",
        name: "AdminProfile",
        component: () => import("../pages/admin/Profile.vue"),
      },
      {
        path: "statistic",
        name: "Statistic",
        component: () => import("../pages/admin/dashboard/statistical.vue"), // ✅ ĐÃ SỬA: Trỏ đúng vào file statistical.vue
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
      },
      // Thuộc tính sản phẩm
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
        path: "invoice/detail/:id",
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
          import("../pages/staff/calendar/EmployeeScheduleView.vue"),
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
      {
        path: "shift-handover",
        name: "GiaoCa",
        component: () => import("../pages/admin/Calendar/ShiftHandover.vue"),
      },
    ],
  },

  // =================================================================
  // 3. STAFF ROUTES
  // =================================================================
  {
    path: "/staff",
    component: () => import("../pages/staff/StaffLayout.vue"),
    meta: { authorize: ["ROLE_STAFF"] },
    children: [
      // 1. Trang chủ
      {
        path: "dashboard",
        name: "StaffDashboard",
        component: () => import("../pages/staff/dashboard/Dashboard.vue"),
      },
      {
        path: "profile",
        name: "StaffProfile",
        component: () => import("../pages/staff/Profile.vue"),
      },
      // 2. Bán hàng tại quầy
      {
        path: "sales",
        name: "StaffSales",
        component: () => import("../pages/admin/sales/CounterSales.vue"),
      },

      // 3. Hóa đơn
      {
        path: "invoice",
        name: "StaffInvoiceList",
        component: () => import("../pages/admin/invoice/InvoiceList.vue"),
      },
      {
        // 👉 ĐÃ SỬA: Đổi từ "invoice/:id" thành "invoice/detail/:id" cho khớp với code Vue
        path: "invoice/detail/:id",
        name: "StaffInvoiceDetail",
        component: () => import("../pages/admin/invoice/InvoiceDetail.vue"),
        props: true,
      },

      // 4. Khách hàng
      {
        path: "customer",
        name: "StaffCustomerList",
        component: () => import("../pages/admin/customer/CustomerManager.vue"),
      },
      // 👉 MỚI THÊM: Bổ sung trang sửa khách hàng cho nhân viên
      {
        path: "customer/edit/:id",
        name: "StaffCustomerEdit",
        component: () => import("../pages/admin/customer/CustomerEdit.vue"),
        props: true,
      },
      // Trong mảng children của /staff
      {
        path: "customer/add",
        name: "StaffCustomerAdd",
        component: () => import("../pages/admin/customer/CustomerCreate.vue"),
      },
      // 5. Lịch làm việc
      {
        path: "my-schedule",
        name: "StaffMySchedule",
        component: () =>
          import("../pages/staff/calendar/EmployeeScheduleView.vue"),
      },
      {
        path: "shift-report",
        name: "ShiftReport",
        component: () => import("../pages/staff/calendar/ShiftReport.vue"),
      },
      {
        path: "chat",
        name: "StaffChat",
        component: () => import("../pages/staff/StaffChat.vue"),
      },
    ],
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
  // 1. In log ra ngoài mảng (Để theo dõi luồng đi của Vue Router)
  console.log(`🚦 Đang chuyển từ ${from.path} sang ${to.path}`);

  const publicPages = [
    "/",
    "/cart",
    "/login",
    "/register",
    "/thong-tin",
    "/moi-ve",
    "/forgot-password",
    "/admin/forgot-password", 
    "/reset-password",
    "/oauth2/redirect",
    "/admin/login",
    "/login-admin", 
    "/uu-dai",
    "/payment",
    "/ao-khoac", 
    "/tra-cuu", 
    "/payment-result", 
    "/my-orders"
  ];

  const isPublic =
    publicPages.includes(to.path) ||
    to.path.startsWith("/home/product/") ||
    to.path.startsWith("/order-detail/");

  const authRequired = !isPublic;

  // 2. Lấy TOÀN BỘ thông tin đăng nhập từ LocalStorage
  const token = localStorage.getItem("token");
  const userStr = localStorage.getItem("user");
  let user = null;

  // Bọc Try-Catch để chống lỗi sập web nếu localStorage bị rác
  try {
    if (userStr) {
      user = JSON.parse(userStr);
    }
  } catch (error) {
    console.error("Dữ liệu User bị hỏng, tiến hành dọn dẹp...");
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  }

  // 3. CHẶN VÀO TRANG BẢO MẬT KHI CHƯA ĐĂNG NHẬP 
  // (Bắt buộc phải có CẢ user VÀ token mới được coi là hợp lệ)
  if (authRequired && (!user || !token)) {
    console.warn("🚨 Ngăn chặn truy cập: Bắt buộc đăng nhập!");
    if (to.path.startsWith("/admin") || to.path.startsWith("/staff")) {
      return next("/admin/login");
    }
    return next("/login");
  }

  // 4. KIỂM TRA PHÂN QUYỀN (Role)
  const authorizedRoles = to.matched
    .filter((record) => record.meta.authorize)
    .flatMap((record) => record.meta.authorize);

  if (authorizedRoles.length > 0) {
    const userRole = user?.role;

    if (!authorizedRoles.includes(userRole)) {
      console.warn(`🚨 Ngăn chặn truy cập: Quyền ${userRole} không được phép vào trang này!`);
      return next("/"); // Không đủ quyền thì đá về trang chủ
    }
  }

  // 5. ĐÃ ĐĂNG NHẬP MÀ CỐ TÌNH QUAY LẠI TRANG LOGIN -> ĐẨY VỀ DASHBOARD
  if (user && token && ["/login", "/register", "/admin/login", "/login-admin"].includes(to.path)) {
    switch (user.role) {
      case "ROLE_ADMIN":
        return next("/admin/dashboard");
      case "ROLE_STAFF":
        return next("/staff/dashboard");
      default:
        return next("/");
    }
  }

  // 6. MỌI ĐIỀU KIỆN ĐỀU HỢP LỆ -> CHO PHÉP CHUYỂN TRANG
  next();
});

export default router;
