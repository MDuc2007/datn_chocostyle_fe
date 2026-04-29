<template>
  <div class="page-container">
    <div
      class="card-section filter-card form-page-animation"
      style="animation-delay: 0.1s"
    >
      <h2 class="title">QUẢN LÝ KHÁCH HÀNG</h2>

      <div class="filter-controls">
        <div class="left-controls">
          <div class="status-box input-wrapper">
            <span class="label-inside">Tìm kiếm</span>

            <div class="search-box input-wrapper">
              <i class="search-icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#9CA3AF"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </i>
              <input
                v-model="keyword"
                @input="debouncedSearch"
                type="text"
                class="form-input ps-icon"
                placeholder="Tìm theo mã hoặc tên"
              />
            </div>
          </div>

          <div class="status-box input-wrapper">
            <span class="label-inside">Trạng thái</span>
            <select
              class="form-select"
              v-model="selectedStatus"
              @change="fetchCustomers"
            >
              <option :value="null">Tất cả</option>
              <option :value="1">Hoạt động</option>
              <option :value="0">Ngừng hoạt động</option>
            </select>
          </div>
        </div>

        <div class="right-controls">
          <button class="btn btn-outline hover-effect" @click="resetFilters">
            Đặt lại
          </button>
          <button class="btn btn-outline hover-effect" @click="exportExcel">
            Xuất Excel
          </button>
          <button class="btn btn-primary hover-effect" @click="goToAdd">
            + Thêm mới
          </button>
        </div>
      </div>
    </div>

    <div
      class="card-section table-card form-page-animation"
      style="animation-delay: 0.2s"
    >
      <div class="table-responsive">
        <table class="custom-table">
          <thead>
            <tr>
              <th width="60" class="text-center">STT</th>
              <th width="120">Mã KH</th>
              <th style="min-width: 180px">Tên khách hàng</th>
              <th style="min-width: 200px">Email</th>
              <th width="140">SĐT</th>
              <th style="min-width: 250px">Địa chỉ</th>
              <th width="150" class="text-center">Trạng thái</th>
              <th width="160" class="text-center">Hành động</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="8" class="text-center py-5 text-muted">
                <div class="loading-spinner"></div>
                Đang tải dữ liệu...
              </td>
            </tr>

            <template v-else>
              <tr
                v-for="(c, i) in customers"
                :key="c.id"
                class="table-row-hover"
              >
                <td class="text-center text-muted">
                  <b>{{ i + 1 + (currentPage - 1) * pageSize }}</b>
                </td>
                <td>
                  <span class="text-dark-bold">{{ c.maKhachHang }}</span>
                </td>
                <td>
                  <span class="text-dark-bold">{{ c.tenKhachHang }}</span>
                </td>
                <td>
                  <span class="text-muted truncate-text" :title="c.email">{{
                    c.email
                  }}</span>
                </td>
                <td>{{ c.soDienThoai }}</td>
                <td class="address-cell">
                  <div
                    v-if="c.diaChiChinh"
                    class="address-text"
                    :title="c.diaChiChinh"
                  >
                    {{ c.diaChiChinh }}
                  </div>
                  <div v-else class="text-muted italic">--</div>
                </td>
                <td class="text-center">
                  <span
                    :class="[
                      'status-badge',
                      isActive(c) ? 'status-active' : 'status-inactive',
                    ]"
                  >
                    {{ isActive(c) ? "Đang hoạt động" : "Ngừng hoạt động" }}
                  </span>
                </td>
                <td class="text-center">
                  <div class="actions-group">
                    <label
                      class="switch tooltip-container"
                      :data-tooltip="
                        c.trangThai === 0 ? 'Mở hoạt động' : 'Ngưng hoạt động'
                      "
                    >
                      <input
                        type="checkbox"
                        :checked="isActive(c)"
                        @click="handleToggleClick($event, c)"
                      />
                      <span class="slider round"></span>
                    </label>

                    <div class="tooltip-container" data-tooltip="Sổ địa chỉ">
                      <button
                        class="btn-icon-action map-btn"
                        @click="openAddressModal(c)"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="2"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        >
                          <path
                            d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"
                          ></path>
                          <circle cx="12" cy="10" r="3"></circle>
                        </svg>
                      </button>
                    </div>

                    <div class="tooltip-container" data-tooltip="Chỉnh sửa">
                      <button
                        class="btn-icon-action edit-btn"
                        @click="goToEdit(c.id)"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="2"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        >
                          <path
                            d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
                          ></path>
                          <path
                            d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"
                          ></path>
                        </svg>
                      </button>
                    </div>
                  </div>
                </td>
              </tr>
            </template>
            <tr v-if="!loading && customers.length === 0">
              <td colspan="8" class="text-center py-5 text-muted">
                Không tìm thấy dữ liệu
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="pagination-footer">
        <button
          class="p-btn hover-effect"
          :disabled="currentPage === 1"
          @click="changePage(currentPage - 1)"
        >
          &lt;
        </button>
        <template v-for="page in visiblePages" :key="page">
          <button
            v-if="page !== '...'"
            class="p-btn number hover-effect"
            :class="{ active: page === currentPage }"
            @click="changePage(page)"
          >
            {{ page }}
          </button>
          <span v-else class="dots">...</span>
        </template>
        <button
          class="p-btn hover-effect"
          :disabled="currentPage >= totalPages"
          @click="changePage(currentPage + 1)"
        >
          &gt;
        </button>
      </div>
    </div>

    <transition name="fade-modal">
      <div v-if="modal.show" class="modal-overlay" @click.self="closeModal">
        <div class="confirm-box">
          <div class="confirm-icon-wrapper">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="40"
              height="40"
              fill="#f59e0b"
            >
              <path
                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"
              />
            </svg>
          </div>
          <h3 class="confirm-title">{{ modal.title }}</h3>
          <p class="confirm-desc">{{ modal.message }}</p>
          <div class="confirm-actions">
            <button class="btn-cancel hover-effect" @click="closeModal">
              Hủy
            </button>
            <button
              class="btn-confirm hover-effect"
              @click="handleModalConfirm"
            >
              Đồng ý
            </button>
          </div>
        </div>
      </div>
    </transition>

    <transition name="fade-modal">
      <div
        v-if="addressModal.show"
        class="modal-overlay address-modal-overlay"
        @click.self="closeAddressModal"
      >
        <div class="address-box form-page-animation">
          <div class="address-header">
            <div class="header-left">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#63391F"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
              <div>
                <h3 class="address-title">Sổ địa chỉ khách hàng</h3>
                <p class="address-subtitle">
                  {{ addressModal.customer?.tenKhachHang }} •
                  {{ addressModal.customer?.maKhachHang }}
                </p>
              </div>
            </div>
            <div class="header-right">
              <button
                class="icon-btn close-btn"
                @click="closeAddressModal"
                title="Đóng"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
          </div>

          <div class="address-body">
            <div class="address-list-col">
              <div class="col-title-clean">Danh sách địa chỉ</div>

              <table class="address-table-clean">
                <thead>
                  <tr>
                    <th width="50">STT</th>
                    <th>Địa chỉ</th>
                    <th width="110" class="text-right">Mặc định</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(addr, idx) in addressModal.addresses" :key="idx">
                    <td>{{ idx + 1 }}</td>
                    <td>
                      <div class="addr-detail-clean">
                        {{ addr.diaChiCuThe }}, {{ addr.phuong }},
                        {{ addr.quan }}, {{ addr.thanhPho }}
                      </div>
                      <div class="addr-sub-clean">
                        Người nhận: {{ addr.nguoiNhan }} • SĐT: {{ addr.sdt }}
                      </div>
                    </td>
                    <td class="text-right">
                      <span v-if="addr.isDefault" class="default-badge"
                        >Mặc định</span
                      >
                      <button
                        v-else
                        class="btn-set-default"
                        @click="setDefaultAddress(addr)"
                      >
                        Đặt mặc định
                      </button>
                    </td>
                  </tr>
                  <tr v-if="addressModal.addresses.length === 0">
                    <td colspan="3" class="text-center text-muted py-5">
                      Chưa có địa chỉ nào
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="address-form-col">
              <div class="col-title-clean form-title">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                Thêm nhanh địa chỉ
              </div>

              <div class="form-grid-clean">
                <div class="input-wrapper-clean">
                  <label class="label-clean">Họ tên người nhận</label>
                  <input
                    v-model="addressForm.hoTen"
                    type="text"
                    class="input-clean input-disabled"
                    disabled
                  />
                </div>

                <div class="input-wrapper-clean">
                  <label class="label-clean">Số điện thoại</label>
                  <input
                    v-model="addressForm.soDienThoai"
                    type="text"
                    class="input-clean input-disabled"
                    disabled
                  />
                </div>

                <div
                  class="input-wrapper-clean"
                  :class="{ 'has-error': addressErrors.tinhThanh }"
                >
                  <label class="label-clean">Thành phố/Tỉnh</label>
                  <select class="select2-tinhthanh" style="width: 100%">
                    <option value="">Chọn hoặc tìm tỉnh/thành</option>
                    <option
                      v-for="p in provinces"
                      :key="p.code"
                      :value="p.code"
                    >
                      {{ p.name }}
                    </option>
                  </select>
                  <span v-if="addressErrors.tinhThanh" class="error-text">{{
                    addressErrors.tinhThanh
                  }}</span>
                </div>

                <div
                  class="input-wrapper-clean"
                  :class="{ 'has-error': addressErrors.quanHuyen }"
                >
                  <label class="label-clean">Quận/Huyện</label>
                  <select
                    class="select2-quanhuyen"
                    style="width: 100%"
                    :disabled="!selectedProvinceCode"
                  >
                    <option value="">Chọn hoặc tìm quận/huyện</option>
                    <option
                      v-for="d in districts"
                      :key="d.code"
                      :value="d.code"
                    >
                      {{ d.name }}
                    </option>
                  </select>
                  <span v-if="addressErrors.quanHuyen" class="error-text">{{
                    addressErrors.quanHuyen
                  }}</span>
                </div>

                <div
                  class="input-wrapper-clean"
                  :class="{ 'has-error': addressErrors.phuongXa }"
                >
                  <label class="label-clean">Phường/Xã</label>
                  <select
                    class="select2-phuongxa"
                    style="width: 100%"
                    :disabled="!selectedDistrictCode"
                  >
                    <option value="">Chọn hoặc tìm phường/xã</option>
                    <option v-for="w in wards" :key="w.code" :value="w.code">
                      {{ w.name }}
                    </option>
                  </select>
                  <span v-if="addressErrors.phuongXa" class="error-text">{{
                    addressErrors.phuongXa
                  }}</span>
                </div>

                <div class="input-wrapper-clean">
                  <label class="label-clean">Địa chỉ cụ thể</label>
                  <input
                    v-model="addressForm.diaChiCuThe"
                    type="text"
                    class="input-clean"
                    :class="{ 'input-error': addressErrors.diaChiCuThe }"
                    placeholder="Số nhà, đường..."
                  />
                  <span v-if="addressErrors.diaChiCuThe" class="error-text">{{
                    addressErrors.diaChiCuThe
                  }}</span>
                </div>
              </div>

              <div class="form-footer-clean">
                <label class="checkbox-wrapper-clean">
                  <input v-model="addressForm.isDefault" type="checkbox" />
                  <span>Đặt làm địa chỉ mặc định</span>
                </label>
                <button
                  class="btn-submit-brown hover-effect"
                  @click="submitAddressForm"
                >
                  Thêm nhanh
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <transition name="toast-slide">
      <div v-if="toast.show" :class="['toast', toast.type]">
        <div class="toast-content">{{ toast.message }}</div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, nextTick } from "vue";
import axios from "axios";
import { customerService } from "../../../services/customerService";

import { useRouter, useRoute } from "vue-router";
const router = useRouter();
const route = useRoute();

const keyword = ref("");
const customers = ref([]);
const currentPage = ref(1);
const totalPages = ref(1);
const selectedStatus = ref(null);
const pageSize = ref(8);
const loading = ref(false);
const toast = ref({ show: false, message: "", type: "success" });
const searchTimeout = ref(null);

const modal = ref({
  show: false,
  title: "",
  message: "",
  action: null,
  id: null,
});
const API_URL = "http://localhost:8080/api/khach-hang";

const isActive = (c) => Number(c.trangThai) === 1;

// 👉 HÀM 1: CHUYỂN SANG TRANG THÊM MỚI (Tự động nhận diện Admin hay Staff)
const goToAdd = () => {
  const basePath = route.path.includes("/staff") ? "/staff" : "/admin";
  router.push(`${basePath}/customer/add`);
};

// 👉 HÀM 2: CHUYỂN SANG TRANG CHỈNH SỬA
const goToEdit = (id) => {
  const basePath = route.path.includes("/staff") ? "/staff" : "/admin";
  router.push(`${basePath}/customer/edit/${id}`);
};

// =========================================
// HÀM KHỞI TẠO SELECT2 ĐÃ ĐƯỢC FIX LỖI MODAL
// =========================================
const initSelect2 = (selector, placeholder, modelRef, onChangeCallback) => {
  const $el = window.$(selector);

  if (!$el.length) return;

  if ($el.hasClass("select2-hidden-accessible")) {
    $el.select2("destroy");
  }

  $el.select2({
    width: "100%",
    placeholder,
    allowClear: true,
    dropdownParent: window.$(".address-modal-overlay"),
  });

  if (modelRef.value) {
    $el.val(modelRef.value).trigger("change.select2");
  }

  $el.on("change", function () {
    const val = window.$(this).val();
    if (modelRef.value !== val) {
      modelRef.value = val;
      if (onChangeCallback) {
        onChangeCallback();
      }
    }
  });
};

const fetchCustomers = async () => {
  loading.value = true;
  try {
    const res = await axios.get(API_URL, {
      params: {
        page: currentPage.value - 1,
        size: pageSize.value,
        keyword: keyword.value,
        status: selectedStatus.value,
      },
    });
    customers.value = res.data.content || [];
    totalPages.value = res.data.totalPages || 1;
  } catch (e) {
    showToast("Không thể tải danh sách khách hàng", "error");
    console.error(e);
  } finally {
    loading.value = false;
  }
};

const exportExcel = async () => {
  try {
    const res = await axios.get(`${API_URL}/export-excel`, {
      params: {
        keyword: keyword.value,
        status: selectedStatus.value,
      },
      responseType: "blob",
    });

    const blob = new Blob([res.data], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "khach_hang.xlsx";
    link.click();
    window.URL.revokeObjectURL(url);

    showToast("Xuất Excel thành công");
  } catch (e) {
    showToast("Xuất Excel thất bại", "error");
    console.error(e);
  }
};

const handleToggleClick = (event, customer) => {
  event.preventDefault();
  modal.value = {
    show: true,
    title: "Xác nhận thay đổi trạng thái",
    message: `Bạn có chắc chắn muốn thay đổi trạng thái khách hàng?`,
    action: "TOGGLE",
    id: customer.id,
  };
};

const handleModalConfirm = async () => {
  try {
    if (modal.value.action === "TOGGLE") {
      await axios.put(`${API_URL}/${modal.value.id}/toggle-status`);
      showToast("Cập nhật trạng thái thành công");
      await fetchCustomers();
    }
  } catch (e) {
    const errorMsg = e.response?.data?.message || "Cập nhật thất bại";
    showToast(errorMsg, "error");
  }
  closeModal();
};

const closeModal = () => (modal.value.show = false);

const debouncedSearch = () => {
  clearTimeout(searchTimeout.value);
  searchTimeout.value = setTimeout(() => {
    currentPage.value = 1;
    fetchCustomers();
  }, 500);
};

const resetFilters = () => {
  keyword.value = "";
  selectedStatus.value = null;
  currentPage.value = 1;
  fetchCustomers();
};

const changePage = (p) => {
  if (p >= 1 && p <= totalPages.value) {
    currentPage.value = p;
    fetchCustomers();
  }
};

const visiblePages = computed(() => {
  const pages = [];
  const total = totalPages.value;
  const current = currentPage.value;
  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i);
  } else {
    if (current <= 4) pages.push(1, 2, 3, 4, 5, "...", total);
    else if (current >= total - 3)
      pages.push(1, "...", total - 4, total - 3, total - 2, total - 1, total);
    else pages.push(1, "...", current - 1, current, current + 1, "...", total);
  }
  return pages;
});

const showToast = (msg, type = "success") => {
  toast.value = { show: true, message: msg, type };
  setTimeout(() => (toast.value.show = false), 3000);
};

const provinces = ref([]);
const districts = ref([]);
const wards = ref([]);

const selectedProvinceCode = ref("");
const selectedDistrictCode = ref("");
const selectedWardCode = ref("");

const loadProvinces = async () => {
  try {
    const res = await axios.get("https://provinces.open-api.vn/api/p/");
    provinces.value = res.data;
  } catch (error) {
    console.error("Lỗi khi lấy dữ liệu tỉnh thành:", error);
  }
};

const fetchDistricts = async () => {
  selectedDistrictCode.value = "";
  selectedWardCode.value = "";
  districts.value = [];
  wards.value = [];

  window.$(".select2-quanhuyen").val(null).trigger("change.select2");
  window.$(".select2-phuongxa").val(null).trigger("change.select2");

  const p = provinces.value.find((x) => x.code == selectedProvinceCode.value);
  addressForm.value.tinhThanh = p ? p.name : "";

  if (!selectedProvinceCode.value) return;

  try {
    const res = await axios.get(
      `https://provinces.open-api.vn/api/p/${selectedProvinceCode.value}?depth=2`,
    );
    districts.value = res.data.districts;

    await nextTick();
    initSelect2(
      ".select2-quanhuyen",
      "Chọn hoặc tìm quận/huyện",
      selectedDistrictCode,
      fetchWards,
    );
  } catch (error) {
    console.error("Lỗi khi lấy dữ liệu quận huyện:", error);
  }
};

const fetchWards = async () => {
  selectedWardCode.value = "";
  wards.value = [];

  window.$(".select2-phuongxa").val(null).trigger("change.select2");

  const d = districts.value.find((x) => x.code == selectedDistrictCode.value);
  addressForm.value.quanHuyen = d ? d.name : "";

  if (!selectedDistrictCode.value) return;

  try {
    const res = await axios.get(
      `https://provinces.open-api.vn/api/d/${selectedDistrictCode.value}?depth=2`,
    );
    wards.value = res.data.wards;

    await nextTick();
    initSelect2(
      ".select2-phuongxa",
      "Chọn hoặc tìm phường/xã",
      selectedWardCode,
      onWardChange,
    );
  } catch (error) {
    console.error("Lỗi khi lấy dữ liệu phường xã:", error);
  }
};

const onWardChange = () => {
  const w = wards.value.find((x) => x.code == selectedWardCode.value);
  addressForm.value.phuongXa = w ? w.name : "";
};

const addressModal = ref({
  show: false,
  customer: null,
  addresses: [],
});

const addressForm = ref({
  hoTen: "",
  soDienThoai: "",
  tinhThanh: "",
  quanHuyen: "",
  phuongXa: "",
  diaChiCuThe: "",
  isDefault: false,
});

const addressErrors = ref({
  hoTen: "",
  soDienThoai: "",
  tinhThanh: "",
  quanHuyen: "",
  phuongXa: "",
  diaChiCuThe: "",
});

const resetAddressForm = () => {
  addressForm.value = {
    hoTen: addressModal.value.customer?.tenKhachHang || "",
    soDienThoai: addressModal.value.customer?.soDienThoai || "",
    tinhThanh: "",
    quanHuyen: "",
    phuongXa: "",
    diaChiCuThe: "",
    isDefault: false,
  };

  selectedProvinceCode.value = "";
  selectedDistrictCode.value = "";
  selectedWardCode.value = "";
  districts.value = [];
  wards.value = [];

  window.$(".select2-tinhthanh").val(null).trigger("change.select2");
  window.$(".select2-quanhuyen").val(null).trigger("change.select2");
  window.$(".select2-phuongxa").val(null).trigger("change.select2");

  Object.keys(addressErrors.value).forEach(
    (key) => (addressErrors.value[key] = ""),
  );
};

const loadCustomerAddresses = async (customerId) => {
  try {
    const res = await customerService.getAddressesByCustomer(customerId);
    const addressesData = res.data.content || res.data || [];
    addressModal.value.addresses = addressesData.map((addr) => ({
      id: addr.id,
      diaChiCuThe: addr.diaChiCuThe,
      phuong: addr.phuong,
      quan: addr.quan,
      thanhPho: addr.thanhPho,
      nguoiNhan: addr.tenDiaChi || addressModal.value.customer?.tenKhachHang,
      sdt: addressModal.value.customer?.soDienThoai,
      isDefault: addr.macDinh === true || addr.macDinh === 1,
    }));
  } catch (error) {
    console.error("Lỗi tải danh sách địa chỉ:", error);
    showToast("Không thể tải danh sách địa chỉ", "error");
  }
};

const openAddressModal = async (customer) => {
  addressModal.value.customer = customer;
  addressModal.value.show = true;
  addressForm.value.hoTen = customer.tenKhachHang || "";
  addressForm.value.soDienThoai = customer.soDienThoai || "";

  await loadCustomerAddresses(customer.id);

  await nextTick();
  initSelect2(
    ".select2-tinhthanh",
    "Chọn hoặc tìm tỉnh/thành",
    selectedProvinceCode,
    fetchDistricts,
  );
  initSelect2(
    ".select2-quanhuyen",
    "Chọn hoặc tìm quận/huyện",
    selectedDistrictCode,
    fetchWards,
  );
  initSelect2(
    ".select2-phuongxa",
    "Chọn hoặc tìm phường/xã",
    selectedWardCode,
    onWardChange,
  );
};

const closeAddressModal = () => {
  addressModal.value.show = false;
  addressModal.value.customer = null;
  resetAddressForm();
};

const setDefaultAddress = async (addr) => {
  try {
    addressModal.value.addresses = addressModal.value.addresses.map((item) => ({
      ...item,
      isDefault: item.id === addr.id,
    }));
    await customerService.setDefaultAddress(
      addr.id,
      addressModal.value.customer.id,
    );
    showToast("Đã thay đổi địa chỉ mặc định");
    fetchCustomers();
  } catch (error) {
    showToast("Không thể đặt mặc định trên hệ thống", "error");
    console.error("Lỗi Set Default:", error);
    await loadCustomerAddresses(addressModal.value.customer.id);
  }
};

const validateAddressForm = () => {
  let isValid = true;
  Object.keys(addressErrors.value).forEach(
    (key) => (addressErrors.value[key] = ""),
  );

  if (!selectedProvinceCode.value) {
    addressErrors.value.tinhThanh = "Vui lòng chọn Tỉnh/Thành phố.";
    isValid = false;
  }
  if (!selectedDistrictCode.value) {
    addressErrors.value.quanHuyen = "Vui lòng chọn Quận/Huyện.";
    isValid = false;
  }
  if (!selectedWardCode.value) {
    addressErrors.value.phuongXa = "Vui lòng chọn Phường/Xã.";
    isValid = false;
  }
  if (!addressForm.value.diaChiCuThe.trim()) {
    addressErrors.value.diaChiCuThe = "Vui lòng nhập địa chỉ cụ thể.";
    isValid = false;
  }

  if (isValid) {
    const isDuplicate = addressModal.value.addresses.some(
      (addr) =>
        addr.thanhPho === addressForm.value.tinhThanh &&
        addr.quan === addressForm.value.quanHuyen &&
        addr.phuong === addressForm.value.phuongXa &&
        addr.diaChiCuThe.trim().toLowerCase() ===
          addressForm.value.diaChiCuThe.trim().toLowerCase(),
    );

    if (isDuplicate) {
      addressErrors.value.diaChiCuThe =
        "Địa chỉ này đã tồn tại trong danh sách.";
      isValid = false;
    }
  }

  return isValid;
};

const submitAddressForm = async () => {
  if (!validateAddressForm()) {
    return;
  }
  try {
    const payload = {
      khachHangId: addressModal.value.customer.id,
      tenDiaChi: addressForm.value.hoTen,
      thanhPho: addressForm.value.tinhThanh,
      quan: addressForm.value.quanHuyen,
      phuong: addressForm.value.phuongXa,
      diaChiCuThe: addressForm.value.diaChiCuThe,
      macDinh: addressForm.value.isDefault ? true : false,
    };

    await customerService.addAddress(payload);
    showToast("Thêm địa chỉ thành công!");
    await loadCustomerAddresses(addressModal.value.customer.id);
    fetchCustomers();
    resetAddressForm();
  } catch (error) {
    console.error("Lỗi khi thêm địa chỉ:", error);
    const errorMsg = error.response?.data?.message || "Thêm địa chỉ thất bại";
    showToast(errorMsg, "error");
  }
};

onMounted(() => {
  fetchCustomers();
  loadProvinces();
});
</script>

<style scoped>
.page-container {
  --primary-brown: #63391f;
  --bg-main: #f7f7f7;
  --white: #ffffff;
  --text-main: #484848;
  --border-color: #e0e0e0;
  --success-green: #27ae60;
  --danger-red: #e74c3c;
  --shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 5px 15px rgba(0, 0, 0, 0.08);
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  background-color: var(--bg-main);
  min-height: 100vh;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
@keyframes zoomIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
.form-page-animation {
  opacity: 0;
  animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.card-section {
  background: var(--white);
  border-radius: 16px;
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-sm);
  margin-bottom: 24px;
  overflow: hidden;
  transition: box-shadow 0.3s ease;
}
.card-section:hover {
  box-shadow: var(--shadow-md);
}
.filter-card {
  padding: 4px;
}
.table-card {
  padding: 10px;
}
.title {
  margin: 15px;
  color: var(--primary-brown);
  font-weight: 700;
}

.filter-controls {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  padding: 0 15px 12px;
  gap: 16px;
  margin-top: 30px;
}
.left-controls {
  display: flex;
  gap: 15px;
  flex: 1;
  align-items: flex-end;
}
.right-controls {
  display: flex;
  gap: 10px;
  align-self: flex-end;
}
.input-wrapper {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.label-inside {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-main);
}
.search-box {
  position: relative;
  width: 300px;
}
.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  pointer-events: none;
}
.form-input,
.form-select {
  height: 42px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  padding: 0 12px;
  font-size: 14px;
  outline: none;
  background-color: var(--white);
  transition: 0.3s;
}
.form-input.ps-icon {
  padding-left: 40px;
}
.form-input:focus,
.form-select:focus {
  border-color: var(--primary-brown);
}
.btn {
  height: 42px;
  padding: 0 20px;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: 0.2s;
}
.hover-effect:active {
  transform: scale(0.96);
}
.btn-primary {
  background-color: var(--white);
  color: var(--text-main);
  border: 1px solid #d1d5db;
}
.btn-primary:hover {
  border-color: var(--primary-brown);
  color: var(--primary-brown);
}
.btn-outline {
  background-color: var(--white);
  color: var(--text-main);
  border: 1px solid #d1d5db;
}
.btn-outline:hover {
  border-color: var(--primary-brown);
  color: var(--primary-brown);
}

.table-responsive {
  width: 100%;
  overflow-x: auto;
}
.custom-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  min-width: 1000px;
  table-layout: fixed;
}
.custom-table th {
  font-weight: 700;
  padding: 16px 12px;
  text-align: left;
  font-size: 14px;
  text-transform: uppercase;
  border-bottom: 2px solid #edf2f7;
  color: #6b7280;
}
.custom-table td {
  padding: 16px 12px;
  font-size: 15px;
  color: var(--text-main);
  vertical-align: middle;
  border-bottom: 1px solid #f1f5f9;
  transition: 0.2s;
}
.table-row-hover:hover td {
  background-color: #fdf8f6;
}
.text-dark-bold {
  color: #1f2937;
  font-weight: 600;
}
.text-center {
  text-align: center !important;
}
.truncate-text,
.address-text {
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.status-badge {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
  display: inline-block;
  min-width: 130px;
  text-align: center;
}
.status-active {
  color: var(--success-green);
  background: #f0fdf4;
}
.status-inactive {
  color: var(--danger-red);
  background: #fef2f2;
}

.actions-group {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
}
.btn-icon-action {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid transparent;
  border-radius: 8px;
  background: #f3f4f6;
  color: #6b7280;
  cursor: pointer;
  transition: 0.2s;
}
.edit-btn:hover {
  background: var(--primary-brown);
  color: var(--white);
  transform: translateY(-2px);
}
.map-btn:hover {
  background: #3b82f6;
  color: var(--white);
  transform: translateY(-2px);
}
.switch {
  position: relative;
  width: 46px;
  height: 24px;
}
.switch input {
  display: none;
}
.slider {
  position: absolute;
  cursor: pointer;
  inset: 0;
  background-color: #d1d5db;
  transition: 0.4s;
  border-radius: 24px;
}
.slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.4s;
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}
input:checked + .slider {
  background-color: var(--primary-brown);
}
input:checked + .slider:before {
  transform: translateX(22px);
}

.pagination-footer {
  display: flex;
  justify-content: center;
  gap: 8px;
  padding: 20px 0;
}
.p-btn {
  min-width: 38px;
  height: 38px;
  background: var(--white);
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}
.p-btn:hover:not(:disabled) {
  border-color: var(--primary-brown);
  color: var(--primary-brown);
}
.p-btn.active {
  background: var(--primary-brown);
  color: var(--white);
  border-color: var(--primary-brown);
}
.p-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(3px);
}
.confirm-box {
  background: var(--white);
  padding: 30px;
  border-radius: 20px;
  width: 400px;
  text-align: center;
  animation: zoomIn 0.3s ease-out;
}
.confirm-icon-wrapper {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background-color: #fef3c7;
  margin: 0 auto 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.confirm-title {
  color: var(--primary-brown);
  margin-bottom: 10px;
  font-size: 20px;
  font-weight: 700;
}
.confirm-desc {
  color: #666;
  margin-bottom: 25px;
  line-height: 1.5;
}
.confirm-actions {
  display: flex;
  gap: 15px;
}
.confirm-actions button {
  flex: 1;
  height: 42px;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  border: none;
}
.btn-confirm {
  background-color: #a88164;
  color: var(--white);
  transition: 0.2s;
}
.btn-confirm:hover {
  background: var(--primary-brown);
}
.btn-cancel {
  background: #f1f5f9;
  color: #475569;
  transition: 0.2s;
}

.address-box {
  background: #ffffff;
  border-radius: 16px;
  width: 1050px;
  max-width: 95%;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 50px rgba(99, 57, 31, 0.15);
  border: 1px solid rgba(99, 57, 31, 0.08);
}
.address-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-bottom: 1px solid #f3f4f6;
}
.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}
.address-title {
  font-size: 18px;
  font-weight: 700;
  color: #63391f;
}
.address-subtitle {
  font-size: 12px;
  color: #9ca3af;
  margin: 4px 0 0 0;
}
.icon-btn {
  background: none;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  transition: 0.2s;
  padding: 4px;
}
.close-btn:hover {
  color: var(--danger-red);
}

/* 👉 BỎ OVERFLOW HIDDEN TẠI ĐÂY LÀ QUAN TRỌNG NHẤT */
.address-body {
  display: flex;
  flex: 1;
  overflow: visible;
}

.address-list-col {
  flex: 1.2;
  padding: 24px;
  overflow-y: auto;
  background: #ffffff;
}
.col-title-clean {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.address-table-clean tr:hover td {
  background: rgba(99, 57, 31, 0.02);
  transition: 0.2s;
}
.address-table-clean {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}
.address-table-clean th {
  text-align: left;
  padding: 10px 0;
  border-bottom: 1px dashed #e5e7eb;
  color: #9ca3af;
  font-weight: 500;
}
.address-table-clean th.text-right {
  text-align: right;
}
.address-table-clean td {
  padding: 16px 0;
  border-bottom: 1px dashed #e5e7eb;
  vertical-align: middle;
}
.addr-detail-clean {
  font-weight: 500;
  color: #1f2937;
  margin-bottom: 6px;
  line-height: 1.5;
  padding-right: 15px;
}
.addr-sub-clean {
  color: #9ca3af;
  font-size: 12px;
}

.default-badge {
  color: #b45309;
  background: #fef3c7;
  padding: 6px 12px;
  border-radius: 4px;
  font-weight: 600;
  font-size: 12px;
  display: inline-block;
}
.btn-set-default {
  background: transparent;
  border: 1px solid #d1d5db;
  color: #6b7280;
  padding: 6px 10px;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  transition: 0.2s;
}
.btn-set-default:hover {
  border-color: #63391f;
  color: #63391f;
  background: rgba(99, 57, 31, 0.05);
}

/* 👉 OVERFLOW ĐỂ VISIBLE CHO CỘT BÊN PHẢI */
.address-form-col {
  flex: 1;
  padding: 24px;
  overflow: visible;
  border-left: 1px solid #e5e7eb;
  background: #ffffff;
}

.form-grid-clean {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px 12px;
}

.input-wrapper-clean {
  display: flex;
  flex-direction: column;
  gap: 6px;
  position: relative;
}
.label-clean {
  font-size: 12px;
  color: #6b7280;
}

.input-clean {
  height: 40px;
  border: none;
  border-bottom: 1px solid #d1d5db;
  padding: 0 5px;
  font-size: 14px;
  outline: none;
  background: transparent;
  color: #1f2937;
  transition: 0.3s;
}
.input-clean:focus {
  border-bottom-color: #63391f;
  border-bottom-width: 2px;
  background: rgba(99, 57, 31, 0.02);
}
.input-disabled {
  background: #f9fafb;
  color: #6b7280;
  cursor: not-allowed;
  border-bottom-style: dashed;
}

/* =========================================
   GHI ĐÈ CSS CHO JQUERY SELECT2 (FIX LỖI CẮT & LỆCH)
   ========================================= */
:deep(.select2-container) {
  width: 100% !important;
  z-index: 10000 !important; /* Luôn nổi trên Form */
}

:deep(.select2-container .select2-selection--single) {
  height: 40px;
  border: none;
  border-bottom: 1px solid #d1d5db;
  border-radius: 0;
  background: transparent;
  display: flex;
  align-items: center;
  padding: 0 5px;
  transition: 0.3s;
}

:deep(
  .select2-container--default.select2-container--focus
    .select2-selection--single
),
:deep(
  .select2-container--default.select2-container--open .select2-selection--single
) {
  border-bottom: 2px solid #63391f;
  background: rgba(99, 57, 31, 0.02);
  box-shadow: none;
}

:deep(.has-error .select2-container .select2-selection--single) {
  border-bottom-color: #ef4444 !important;
}

:deep(.select2-selection__rendered) {
  font-size: 14px;
  color: #1f2937 !important;
  padding-left: 0 !important;
}

:deep(.select2-selection__placeholder) {
  color: #6b7280 !important;
}

:deep(.select2-selection__arrow) {
  height: 100%;
  right: 5px;
}

/* KHUNG DROPDOWN BỊ LỆCH TẠI ĐÂY: Fix margin & z-index */
:deep(.select2-dropdown) {
  border: 1px solid #d1d5db;
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  margin-top: 5px;
  background: #fff;
  z-index: 10005 !important; /* Lớn hơn z-index của modal (9999) */
}

:deep(.select2-search__field) {
  border: 1px solid #d1d5db !important;
  border-radius: 4px !important;
  padding: 6px 10px !important;
  outline: none !important;
}

:deep(.select2-search__field:focus) {
  border-color: #63391f !important;
}

:deep(.select2-results__option--highlighted) {
  background-color: #63391f !important;
  color: white !important;
}

.error-text {
  color: #ef4444;
  font-size: 11px;
  margin-top: 2px;
}

.form-footer-clean {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  margin-top: 30px;
  gap: 15px;
}
.checkbox-wrapper-clean {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #6b7280;
  cursor: pointer;
}
.checkbox-wrapper-clean input {
  width: 15px;
  height: 15px;
  accent-color: var(--primary-brown);
}

.btn-submit-brown {
  background: #63391f;
  color: #ffffff;
  border-radius: 10px;
  padding: 11px 26px;
  font-weight: 600;
  border: none;
  cursor: pointer;
}

.btn-submit-brown:hover {
  background: #4a2a17;
}

.input-error {
  border-bottom-color: #ef4444 !important;
}

/* =========================================
   TOAST NOTIFICATION (NEW CSS)
   ========================================= */
.toast {
  position: fixed;
  top: 30px;
  right: 30px;
  z-index: 10001;
  min-width: 280px;
  padding: 16px 20px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  font-weight: 500;
  font-size: 15px;
}

.toast.warning {
  background: #ffc107;
  color: #333;
  border-left: 4px solid #ff9800;
}

.toast.error {
  background: #f8d7da;
  color: #721c24;
  border-left: 4px solid #dc3545;
}

.toast.success {
  background: #d4edda;
  color: #155724;
  border-left: 4px solid #28a745;
}

.toast-content {
  margin-left: 10px;
}
.fade-modal-enter-active,
.fade-modal-leave-active {
  transition: opacity 0.3s;
}
.fade-modal-enter-from,
.fade-modal-leave-to {
  opacity: 0;
}
.toast-slide-enter-active,
.toast-slide-leave-active {
  transition: all 0.4s;
}
.toast-slide-enter-from,
.toast-slide-leave-to {
  transform: translateX(120%);
  opacity: 0;
}
.loading-spinner {
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid var(--primary-brown);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-right: 10px;
  vertical-align: middle;
}

/* Tooltip */
.tooltip-container {
  position: relative;
}
.tooltip-container:hover::after,
.tooltip-container:hover::before {
  opacity: 1;
  transform: translate(-50%, -5px);
}
.tooltip-container::after {
  content: attr(data-tooltip);
  position: absolute;
  bottom: 125%;
  left: 50%;
  transform: translate(-50%, 5px);
  background: #1f2937;
  color: var(--white);
  font-size: 12px;
  padding: 6px 12px;
  border-radius: 6px;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: 0.2s;
  z-index: 10;
}
.tooltip-container::before {
  content: "";
  position: absolute;
  bottom: 115%;
  left: 50%;
  transform: translate(-50%, 5px);
  border: 6px solid transparent;
  border-top-color: #1f2937;
  opacity: 0;
  transition: 0.2s;
}
</style>
