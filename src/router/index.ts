import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import AdminLayout from "../pages/admin/AdminLayout.vue";

const routes: Array<RouteRecordRaw> = [
  // ================================================================
  // 1. PUBLIC ROUTES
  // ================================================================
  { path: "/", name: "Home", component: () => import("../pages/views/Home.vue") },
  { path: "/home/product/:id", name: "ProductDetailHome", component: () => import("../pages/views/DetailProductHome.vue") },
  { path: "/moi-ve", name: "NewArrivals", component: () => import("../pages/views/NewArrivalsPage.vue") },
  { path: "/uu-dai", name: "Promotions", component: () => import("../pages/views/PromotionsPage.vue") },
  { path: "/payment", name: "PaymentPage", component: () => import("../pages/views/PaymentPage.vue") },
  { path: "/payment-result", name: "PaymentResult", component: () => import("../pages/views/PaymentResult.vue") },
  { path: "/cart", name: "Cart", component: () => import("../pages/views/Cart.vue") },
  { path: "/ao-khoac", name: "JacketPage", component: () => import("../pages/views/JacketPage.vue") },
  { path: "/thong-tin", name: "Information", component: () => import("../pages/views/InformationPage.vue") },
  { path: "/tra-cuu", name: "OrderTracking", component: () => import("../pages/views/OrderTrackingPage.vue") },

  { path: "/profile", name: "UserProfile", component: () => import("../pages/views/UserProfile.vue") },
  { path: "/address", name: "UserAddress", component: () => import("../pages/views/UserAddress.vue") },
  { path: "/my-vouchers", name: "UserVoucher", component: () => import("../pages/views/UserVoucher.vue") },
  { path: "/my-orders", name: "MyOrders", component: () => import("../pages/views/InvoiceList.vue") },
  { path: "/order-detail/:id", name: "ClientOrderDetail", component: () => import("../pages/views/InvoiceDetail.vue") },
  { path: "/don-hang", name: "CustomerOrders", component: () => import("../pages/views/CustomerOrders.vue") },

  { path: "/login", name: "LoginCustomer", component: () => import("../views/LoginView.vue") },
  { path: "/admin/login", name: "LoginStaff", component: () => import("../views/AdminLogin.vue") },
  { path: "/register", name: "Register", component: () => import("../views/RegisterView.vue") },
  { path: "/forgot-password", name: "ForgotPassword", component: () => import("../views/ForgotPasswordView.vue") },
  { path: "/reset-password", name: "ResetPassword", component: () => import("../views/ResetPasswordView.vue") },
  { path: "/oauth2/redirect", component: () => import("../views/OAuth2Redirect.vue") },

  // ================================================================
  // 2. ADMIN ROUTES
  // ================================================================
  {
    path: "/admin",
    component: AdminLayout,
    meta: { authorize: ["ROLE_ADMIN"] },
    children: [
      { path: "profile", name: "AdminProfile", component: () => import("../pages/admin/Profile.vue") },
      { path: "dashboard", name: "Dashboard", component: () => import("../pages/admin/dashboard/Dashboard.vue") },
      { path: "statistic", name: "Statistic", component: () => import("../pages/admin/dashboard/Dashboard.vue") },

      { path: "product", component: () => import("../pages/admin/product/ProductManager.vue") },
      { path: "product/create", component: () => import("../pages/admin/product/AddProduct.vue") },
      { path: "product/update/:id", component: () => import("../pages/admin/product/AddProduct.vue"), props: true },
      { path: "product/:id/details", name: "ProductDetails", component: () => import("../pages/admin/product/DetailProduct.vue") },
      { path: "product/details", name: "ProductDetailsAll", component: () => import("../pages/admin/product/DetailProductList.vue") },

      { path: "color", component: () => import("../pages/admin/product/ColorManager.vue") },
      { path: "size", component: () => import("../pages/admin/product/SizeManager.vue") },
      { path: "material", component: () => import("../pages/admin/product/MaterialManager.vue") },
      { path: "origin", component: () => import("../pages/admin/product/OriginManager.vue") },
      { path: "style", component: () => import("../pages/admin/product/StyleManager.vue") },
      { path: "type", component: () => import("../pages/admin/product/TypeManager.vue") },
      { path: "shapetype", component: () => import("../pages/admin/product/ShapeTypeManager.vue") },

      { path: "invoice", name: "InvoiceList", component: () => import("../pages/admin/invoice/InvoiceList.vue") },
      { path: "invoice/:id", name: "InvoiceDetail", component: () => import("../pages/admin/invoice/InvoiceDetail.vue"), props: true },

      { path: "sales", name: "CounterSales", component: () => import("../pages/admin/sales/CounterSales.vue") },

      { path: "voucher", component: () => import("../pages/admin/voucher/VoucherManager.vue") },
      { path: "promotion", component: () => import("../pages/admin/promotion/PromotionManager.vue") },

      { path: "employee", component: () => import("../pages/admin/employee/EmployeeManager.vue") },
      { path: "shift", name: "ShiftManager", component: () => import("../pages/admin/Calendar/ShiftManager.vue") },
      { path: "schedule", name: "ScheduleManager", component: () => import("../pages/admin/Calendar/ScheduleManager.vue") },

      { path: "customer", name: "CustomerList", component: () => import("../pages/admin/customer/CustomerManager.vue") },
      { path: "giao-ca", name: "GiaoCa", component: () => import("../pages/admin/Calendar/ShiftHandover.vue") },
    ],
  },

  // ================================================================
  // 3. STAFF ROUTES
  // ================================================================
  {
    path: "/staff",
    component: () => import("../pages/staff/StaffLayout.vue"),
    meta: { authorize: ["ROLE_STAFF"] },
    children: [
      { path: "dashboard", name: "StaffDashboard", component: () => import("../pages/staff/dashboard/Dashboard.vue") },
      { path: "profile", name: "StaffProfile", component: () => import("../pages/staff/Profile.vue") },
      { path: "sales", name: "StaffSales", component: () => import("../pages/admin/sales/CounterSales.vue") },
      { path: "invoice", name: "StaffInvoiceList", component: () => import("../pages/admin/invoice/InvoiceList.vue") },
      { path: "invoice/:id", name: "StaffInvoiceDetail", component: () => import("../pages/admin/invoice/InvoiceDetail.vue"), props: true },
      { path: "customer", name: "StaffCustomerList", component: () => import("../pages/admin/customer/CustomerManager.vue") },
      { path: "my-schedule", name: "StaffMySchedule", component: () => import("../pages/staff/calendar/EmployeeScheduleView.vue") },
      { path: "shift-report", name: "ShiftReport", component: () => import("../pages/staff/calendar/ShiftReport.vue") },
    ],
  },

  { path: "/:pathMatch(.*)*", redirect: "/" },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// ================================================================
// NAVIGATION GUARD
// ================================================================
router.beforeEach((to, from, next) => {
  const publicPages = [
    "/", "/cart", "/login", "/register", "/forgot-password",
    "/reset-password", "/oauth2/redirect", "/admin/login",
    "/thong-tin", "/moi-ve", "/uu-dai"
  ];

  const isPublic =
    publicPages.includes(to.path) || to.path.startsWith("/home/product/");

  const authRequired = !isPublic;

  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;

  if (authRequired && !user) {
    if (to.path.startsWith("/admin") || to.path.startsWith("/staff")) {
      return next("/admin/login");
    }
    return next("/login");
  }

  const authorizedRoles = to.matched
    .filter(record => record.meta.authorize)
    .flatMap(record => record.meta.authorize as string[]);

  if (authorizedRoles.length > 0) {
    const userRole = user?.role;
    if (!authorizedRoles.includes(userRole)) {
      return next("/");
    }
  }

  if (user && ["/login", "/register", "/admin/login"].includes(to.path)) {
    switch (user.role) {
      case "ROLE_ADMIN":
        return next("/admin/dashboard");
      case "ROLE_STAFF":
        return next("/staff/dashboard");
      default:
        return next("/");
    }
  }

  next();
});

export default router;