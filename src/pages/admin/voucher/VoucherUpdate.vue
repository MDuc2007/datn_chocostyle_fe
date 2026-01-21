<template>
  <div class="page-wrapper">
    <!-- ===== FRAME TRÊN: FORM THÊM ===== -->
    <div class="form-container">
      <h3 class="form-title">CẬP NHẬT PHIẾU GIẢM GIÁ</h3>

      <div class="form-grid">
        <div class="form-group">
          <label>Mã phiếu giảm giá</label>
          <input disabled :value="form.maPgg" />
        </div>

        <div class="form-group">
          <label> Tên phiếu giảm giá <span class="required">*</span> </label>
          <input v-model="form.tenPgg" :class="{ error: errors.tenPgg }" />
          <small v-if="errors.tenPgg" class="error-text">
            {{ errors.tenPgg }}
          </small>
        </div>

        <div class="form-group">
          <label> Kiểu áp dụng <span class="required">*</span> </label>
          <select v-model="form.kieuApDung">
            <option value="ALL">Công khai</option>
            <option value="PERSONAL">Cá nhân</option>
          </select>
        </div>

        <div class="form-group">
          <label> Loại giảm <span class="required">*</span> </label>
          <select v-model="form.loaiGiam">
            <option value="PERCENT">Giảm %</option>
            <option value="MONEY">Giảm tiền</option>
          </select>
        </div>

        <div class="form-group">
          <label> Giá trị giảm <span class="required">*</span> </label>
          <div class="input-suffix">
            <input
              type="number"
              v-model.number="form.giaTri"
              :class="{ error: errors.giaTri }"
            />
            <span class="suffix">
              {{ form.loaiGiam === "PERCENT" ? "%" : "đ" }}
            </span>
          </div>
          <small v-if="errors.giaTri" class="error-text">
            {{ errors.giaTri }}
          </small>
        </div>

        <div class="form-group">
          <label>
            Giá trị tối đa
            <span v-if="form.loaiGiam === 'PERCENT'" class="required">*</span>
          </label>
          <input
            type="number"
            v-model.number="form.giaTriToiDa"
            :disabled="form.loaiGiam === 'MONEY'"
            :class="{ error: errors.giaTriToiDa }"
          />
          <small v-if="errors.giaTriToiDa" class="error-text">
            {{ errors.giaTriToiDa }}
          </small>
        </div>

        <div class="form-group">
          <label> Điều kiện đơn hàng <span class="required">*</span> </label>
          <input
            type="number"
            v-model.number="form.dieuKienDonHang"
            :class="{ error: errors.dieuKienDonHang }"
          />
          <small v-if="errors.dieuKienDonHang" class="error-text">
            {{ errors.dieuKienDonHang }}
          </small>
        </div>

        <div class="form-group">
          <label> Ngày bắt đầu <span class="required">*</span> </label>
          <input
            type="date"
            v-model="form.ngayBatDau"
            :class="{ error: errors.ngayBatDau }"
          />
          <small v-if="errors.ngayBatDau" class="error-text">
            {{ errors.ngayBatDau }}
          </small>
        </div>

        <div class="form-group">
          <label> Ngày kết thúc <span class="required">*</span> </label>
          <input
            type="date"
            v-model="form.ngayKetThuc"
            :class="{ error: errors.ngayKetThuc }"
          />
          <small v-if="errors.ngayKetThuc" class="error-text">
            {{ errors.ngayKetThuc }}
          </small>
        </div>

        <div class="form-group">
          <label> Số lượng <span class="required">*</span> </label>
          <input
            type="number"
            v-model.number="form.soLuong"
            :class="{ error: errors.soLuong }"
          />
          <small v-if="errors.soLuong" class="error-text">
            {{ errors.soLuong }}
          </small>
        </div>
      </div>

      <div class="form-actions">
        <button class="btn-cancel" @click="back">Hủy</button>
        <button class="btn-save" @click="openConfirm" :disabled="loading">
          <span v-if="!loading">Lưu</span>
          <span v-else>Đang lưu...</span>
        </button>
      </div>
    </div>

    <!-- ===== FRAME DƯỚI: KHÁCH HÀNG ===== -->
    <div class="customer-container" v-if="form.kieuApDung === 'PERSONAL'">
      <h4 class="table-title">Danh sách khách hàng</h4>

      <input
        class="search-input"
        placeholder="Tìm theo tên hoặc email"
        v-model="customerKeyword"
      />

      <table class="customer-table">
        <thead>
          <tr>
            <th></th>
            <th>STT</th>
            <th>Tên</th>
            <th>Email</th>
            <th>Ngày sinh</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="(c, i) in filteredCustomers" :key="c.id">
            <td>
              <input
                type="checkbox"
                :value="c.id"
                v-model="selectedCustomerIds"
              />
            </td>
            <td>{{ i + 1 }}</td>
            <td>{{ c.tenKhachHang }}</td>
            <td>{{ c.email }}</td>
            <td>{{ formatDateVN(c.ngaySinh) }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- ===== MODAL ===== -->
    <div v-if="showModal" class="modal-overlay">
      <div class="modal-box">
        <h4>Xác nhận</h4>
        <p>Bạn có chắc muốn cập nhật phiếu giảm giá này?</p>

        <div class="modal-actions">
          <button class="btn-cancel" @click="showModal = false">Hủy</button>
          <button class="btn-save" @click="submit">Xác nhận</button>
        </div>
      </div>
    </div>

    <div v-if="toast.show" :class="['toast', toast.type]">
      {{ toast.message }}
    </div>
  </div>
  <div v-if="loading" class="loading-overlay">
    <div class="spinner"></div>
  </div>
</template>

<script setup>
import { reactive, ref, computed, onMounted, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import axios from "axios";

const router = useRouter();
const route = useRoute();
const id = route.params.id;

const selectedCustomerIds = ref([]);

const form = reactive({
  maPgg: "",
  tenPgg: "",
  kieuApDung: "ALL",
  loaiGiam: "PERCENT",
  giaTri: null,
  giaTriToiDa: null,
  dieuKienDonHang: null,
  ngayBatDau: "",
  ngayKetThuc: "",
  soLuong: null,
});

const errors = reactive({
  tenPgg: "",
  giaTri: "",
  giaTriToiDa: "",
  dieuKienDonHang: "",
  ngayBatDau: "",
  ngayKetThuc: "",
  soLuong: "",
});

const customers = ref([]);
const customerKeyword = ref("");
const showModal = ref(false);
const loading = ref(false);

const toast = reactive({
  show: false,
  message: "",
  type: "success",
});

const showToast = (message, type = "success") => {
  toast.message = message;
  toast.type = type;
  toast.show = true;

  setTimeout(() => {
    toast.show = false;
  }, 3000);
};

watch(
  () => form.loaiGiam,
  (v) => {
    if (v === "MONEY") {
      form.giaTriToiDa = null;
      errors.giaTriToiDa = "";
    }
  },
);

watch(
  () => form.kieuApDung,
  (v) => {
    if (v === "ALL") {
      selectedCustomerIds.value = [];
    }
  }
);

const validateForm = () => {
  let valid = true;
  Object.keys(errors).forEach((k) => (errors[k] = ""));

  if (!form.tenPgg || !form.tenPgg.trim()) {
    errors.tenPgg = "Tên phiếu giảm giá không được để trống";
    valid = false;
  } else if (form.tenPgg.trim().length < 3) {
    errors.tenPgg = "Tên phải ít nhất 3 ký tự";
    valid = false;
  } else if (form.tenPgg.trim().length > 100) {
    errors.tenPgg = "Tên tối đa 100 ký tự";
    valid = false;
  }

  if (!form.kieuApDung) {
    valid = false;
  }

  if (!form.loaiGiam) {
    valid = false;
  }

  if (form.giaTri === null || form.giaTri === "" || form.giaTri <= 0) {
    errors.giaTri = "Giá trị giảm phải lớn hơn 0";
    valid = false;
  }

  if (form.loaiGiam === "PERCENT") {
    if (form.giaTri > 100) {
      errors.giaTri = "Giảm % tối đa là 100";
      valid = false;
    }
  }

  if (form.loaiGiam === "MONEY") {
    if (form.giaTri < 1000) {
      errors.giaTri = "Giảm tiền tối thiểu 1.000đ";
      valid = false;
    }
  }

  if (form.loaiGiam === "PERCENT") {
    if (
      form.giaTriToiDa === null ||
      form.giaTriToiDa === "" ||
      form.giaTriToiDa <= 0
    ) {
      errors.giaTriToiDa = "Giá trị tối đa phải lớn hơn 0";
      valid = false;
    } else if (form.giaTriToiDa < form.giaTri) {
      errors.giaTriToiDa = "Giá trị tối đa phải ≥ giá trị giảm";
      valid = false;
    }
  }

  if (
    form.dieuKienDonHang === null ||
    form.dieuKienDonHang === "" ||
    form.dieuKienDonHang <= 0
  ) {
    errors.dieuKienDonHang = "Điều kiện đơn hàng phải lớn hơn 0";
    valid = false;
  } else if (form.dieuKienDonHang < form.giaTri) {
    errors.dieuKienDonHang =
      "Điều kiện đơn hàng phải ≥ giá trị giảm";
    valid = false;
  }

  const today = new Date().toISOString().split("T")[0];

  if (!form.ngayBatDau) {
    errors.ngayBatDau = "Vui lòng chọn ngày bắt đầu";
    valid = false;
  } else if (form.ngayBatDau < today) {
    errors.ngayBatDau = "Ngày bắt đầu không được nhỏ hơn hôm nay";
    valid = false;
  }

  if (!form.ngayKetThuc) {
    errors.ngayKetThuc = "Vui lòng chọn ngày kết thúc";
    valid = false;
  } else if (form.ngayKetThuc <= form.ngayBatDau) {
    errors.ngayKetThuc = "Ngày kết thúc phải sau ngày bắt đầu";
    valid = false;
  }

  if (form.soLuong === null || form.soLuong === "" || form.soLuong <= 0) {
    errors.soLuong = "Số lượng phải lớn hơn 0";
    valid = false;
  } else if (!Number.isInteger(form.soLuong)) {
    errors.soLuong = "Số lượng phải là số nguyên";
    valid = false;
  }

  if (
    form.kieuApDung === "PERSONAL" &&
    selectedCustomerIds.value.length === 0
  ) {
    alert("Vui lòng chọn ít nhất một khách hàng");
    valid = false;
  }

  return valid;
};

const openConfirm = () => {
  if (!validateForm()) return;
  showModal.value = true;
};

const submit = async () => {
  showModal.value = false;
  loading.value = true;

  const payload = {
    ...form,
    khachHangIds:
      form.kieuApDung === "PERSONAL" ? selectedCustomerIds.value : [],
  };

  try {
    await axios.put(
      `http://localhost:8080/admin/voucher/${id}`,
      payload
    );

    showToast("Cập nhật phiếu giảm giá thành công", "success");
    setTimeout(() => router.push("/admin/voucher"), 1200);
  } catch (e) {
    showToast("Cập nhật phiếu giảm giá thất bại", "error");
  } finally {
    loading.value = false;
  }
};

const filteredCustomers = computed(() => {
  if (!customerKeyword.value) return customers.value;
  const kw = customerKeyword.value.toLowerCase();
  return customers.value.filter(
    (c) =>
      c.tenKhachHang.toLowerCase().includes(kw) ||
      (c.email && c.email.toLowerCase().includes(kw)),
  );
});

const formatDateVN = (d) => (d ? new Date(d).toLocaleDateString("vi-VN") : "");

onMounted(async () => {
  const res = await axios.get(`http://localhost:8080/admin/voucher/${id}`);

  Object.assign(form, res.data);

  if (res.data.khachHangIds) {
    selectedCustomerIds.value = [...res.data.khachHangIds];
  }

  const cusRes = await axios.get("http://localhost:8080/api/khach-hang", {
    params: { page: 0, size: 100 },
  });

  customers.value = cusRes.data.content;
});

const back = () => router.push("/admin/voucher");
</script>

<style scoped>
.page-wrapper {
  padding: 25px;
  background: #f5f6f8;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-container,
.customer-container {
  background: #fff;
  border-radius: 6px;
  padding: 24px;
  border: 1px solid #e0e0e0;
}

.form-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 24px;
}

.table-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 16px;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px 25px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 6px;
}

.form-group input,
.form-group select {
  height: 40px;
  padding: 8px 12px;
  font-size: 14px;
  border-radius: 4px;
  border: 1px solid #ccc;
}

.input-suffix {
  position: relative;
  width: 100%;
}

.input-suffix input {
  width: 100%;
  height: 40px;
  padding: 8px 44px 8px 12px;
  font-size: 14px;
  border-radius: 4px;
  border: 1px solid #ccc;
  box-sizing: border-box;
}

.suffix {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 14px;
  color: #555;
  pointer-events: none;
}

.error {
  border-color: #e53935;
}

.error-text {
  color: #e53935;
  font-size: 13px;
  margin-top: 4px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 30px;
}

.btn-save {
  background: #5a2d0c;
  color: #fff;
  border: none;
  padding: 8px 18px;
  border-radius: 4px;
  cursor: pointer;
}

.btn-save:hover {
  background: #4a2409;
}

.btn-cancel {
  background: #e0e0e0;
  border: none;
  padding: 8px 18px;
  border-radius: 4px;
  cursor: pointer;
}

.search-input {
  width: 100%;
  height: 42px;
  padding: 10px 14px;
  font-size: 14px;
  border-radius: 6px;
  border: 1px solid #ccc;
  margin-bottom: 16px;
}

.customer-table {
  width: 100%;
  border-collapse: collapse;
}

.customer-table th {
  height: 44px;
  padding: 10px 12px;
  font-size: 14px;
  font-weight: 600;
  background: #f3f3f3;
  border-bottom: 1px solid #ddd;
  text-align: left;
}

.customer-table td {
  height: 44px;
  padding: 10px 12px;
  font-size: 14px;
  border-bottom: 1px solid #eee;
}

.customer-table tbody tr:hover {
  background: #fafafa;
}

.customer-table input[type="checkbox"] {
  width: 16px;
  height: 16px;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

.modal-box {
  background: #fff;
  width: 360px;
  border-radius: 6px;
  padding: 20px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.toast {
  position: fixed;
  top: 20px;
  right: 20px;
  min-width: 260px;
  padding: 12px 18px;
  border-radius: 6px;
  font-size: 14px;
  color: #fff;
  z-index: 2000;
  animation: slideIn 0.3s ease;
}

.toast.success {
  background: #43a047;
}

.toast.error {
  background: #e53935;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.loading-overlay {
  position: fixed;
  inset: 0;
  background: rgba(255, 255, 255, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1500;
}

.spinner {
  width: 42px;
  height: 42px;
  border: 4px solid #ccc;
  border-top: 4px solid #5a2d0c;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.required {
  color: #e53935;
  margin-left: 2px;
  font-weight: 600;
}
</style>