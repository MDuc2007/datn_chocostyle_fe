<template>
  <Teleport to="body">
    <div v-if="show && isReady" class="modal-overlay">
      <div class="modal-content">
        <div class="modal-header">
          <h3>
            {{ 
              isShiftClosed ? 'THÔNG TIN KẾT TOÁN' : 
              (chamCong ? 'ĐANG TRONG CA' : 'MỞ CA LÀM VIỆC') 
            }}
          </h3>
          <p>Hệ thống quản lý bán hàng ChocoStyle Shop</p>
        </div>

        <div class="modal-body">
          <div class="staff-info">
            <p class="staff-code">
              Nhân viên : {{ staffName }} • {{ currentTime }}
            </p>
          </div>

          <div v-if="!ca || !ca.caLamViec" class="alert-box error">
            <span class="alert-icon">⚠️</span>
            <p>
              Hôm nay bạn không có lịch phân công ca làm việc. Bạn chỉ có thể
              xem hệ thống.
            </p>

            <div class="custom-swal-actions" style="margin-top: 20px">
              <button
                @click="handleLogout"
                class="custom-swal-confirm-btn"
                style="background-color: #c53030 !important"
              >
                Đăng xuất
              </button>
              <button
                @click="closeModal"
                class="custom-swal-confirm-btn"
                style="background-color: #718096 !important"
              >
                Chỉ xem
              </button>
            </div>
          </div>

          <div v-else>
            <div class="form-group">
              <label>Ca làm việc được phân công</label>
              <input
                type="text"
                class="form-control disabled-input"
                disabled
                :value="`${ca.caLamViec.tenCa} (${ca.caLamViec.gioBatDau?.substring(0, 5)} - ${ca.caLamViec.gioKetThuc?.substring(0, 5)})`"
              />
            </div>

            <div v-if="isShiftClosed" class="alert-box disabled-box" style="text-align: left">
              <div
                style="
                  display: flex;
                  align-items: center;
                  gap: 10px;
                  margin-bottom: 15px;
                  justify-content: center;
                "
              >
                <span class="alert-icon" style="font-size: 24px">🔒</span>
                <h4 style="margin: 0; color: #2f855a">
                  Ca làm việc đã kết thúc
                </h4>
              </div>

              <p v-if="ca.trangThai === 1 && (!chamCong || !chamCong.gioCheckOut)" style="text-align: center; color: #c53030; font-weight: bold; margin-bottom: 15px;">
                ⚠️ Ca này đã được chốt và đóng sớm bởi nhân viên khác!
              </p>

              <div
                v-if="chamCong"
                style="
                  background: #fff;
                  padding: 15px;
                  border-radius: 8px;
                  border: 1px solid #e2e8f0;
                  font-size: 14px;
                  text-align: left;
                "
              >
                <div
                  style="
                    border-bottom: 1px dashed #cbd5e1;
                    padding-bottom: 10px;
                    margin-bottom: 10px;
                  "
                >
                  <p style="margin: 5px 0; font-size: 16px">
                    <strong>Tổng doanh thu: </strong>
                    <span style="color: #2b6cb0"
                      >{{
                        chamCong.tongDoanhThu?.toLocaleString() || 0
                      }}
                      VNĐ</span
                    >
                  </p>
                  <p style="margin: 5px 0">
                    <strong>Tổng chênh lệch: </strong>
                    <span
                      :style="{
                        color:
                          chamCong.tienChenhLech < 0
                            ? '#c53030'
                            : chamCong.tienChenhLech > 0
                              ? '#d69e2e'
                              : '#2F855A',
                        fontWeight: 'bold',
                      }"
                    >
                      {{ chamCong.tienChenhLech > 0 ? "+" : ""
                      }}{{ chamCong.tienChenhLech?.toLocaleString() || 0 }} VNĐ
                    </span>
                  </p>
                </div>

                <div style="display: flex; gap: 15px">
                  <div
                    style="
                      flex: 1;
                      background: #f8fafc;
                      padding: 10px;
                      border-radius: 6px;
                    "
                  >
                    <p
                      style="
                        margin: 0 0 5px 0;
                        font-weight: bold;
                        color: #475569;
                      "
                    >
                      💵 Tiền Mặt
                    </p>
                    <p style="margin: 3px 0; font-size: 13px">
                      Bán được:
                      {{ chamCong.doanhThuTienMat?.toLocaleString() || 0 }} đ
                    </p>
                    <p style="margin: 3px 0; font-size: 13px">
                      Chênh lệch:
                      <span
                        :style="{
                          color:
                            chamCong.chenhLechTienMat < 0
                              ? '#c53030'
                              : chamCong.chenhLechTienMat > 0
                                ? '#d69e2e'
                                : '#2F855A',
                          fontWeight: 'bold',
                        }"
                      >
                        {{ chamCong.chenhLechTienMat > 0 ? "+" : ""
                        }}{{
                          chamCong.chenhLechTienMat?.toLocaleString() || 0
                        }}
                        đ
                      </span>
                    </p>
                  </div>

                  <div
                    style="
                      flex: 1;
                      background: #f8fafc;
                      padding: 10px;
                      border-radius: 6px;
                    "
                  >
                    <p
                      style="
                        margin: 0 0 5px 0;
                        font-weight: bold;
                        color: #475569;
                      "
                    >
                      💳 Chuyển Khoản
                    </p>
                    <p style="margin: 3px 0; font-size: 13px">
                      Bán được:
                      {{ chamCong.doanhThuCk?.toLocaleString() || 0 }} đ
                    </p>
                    <p style="margin: 3px 0; font-size: 13px">
                      Chênh lệch:
                      <span
                        :style="{
                          color:
                            chamCong.chenhLechCk < 0
                              ? '#c53030'
                              : chamCong.chenhLechCk > 0
                                ? '#d69e2e'
                                : '#2F855A',
                          fontWeight: 'bold',
                        }"
                      >
                        {{ chamCong.chenhLechCk > 0 ? "+" : ""
                        }}{{ chamCong.chenhLechCk?.toLocaleString() || 0 }} đ
                      </span>
                    </p>
                  </div>
                </div>

                <p
                  style="
                    margin: 10px 0 0 0;
                    font-style: italic;
                    color: #718096;
                    font-size: 13px;
                    text-align: center;
                  "
                >
                  (Ghi chú: {{ chamCong.ghiChu || "Không có" }})
                </p>
              </div>

              <p style="text-align: center; margin-top: 15px; font-size: 13px">
                Bạn hiện đang ở chế độ chỉ xem.
              </p>

              <div class="custom-swal-actions" style="margin-top: 20px">
                <button
                  @click="handleLogout"
                  class="custom-swal-confirm-btn"
                  style="background-color: #c53030 !important"
                >
                  Đăng xuất
                </button>
                <button
                  @click="closeModal"
                  class="custom-swal-confirm-btn"
                  style="background-color: #718096 !important"
                >
                  Chỉ xem
                </button>
              </div>
            </div>

            <div v-else-if="shiftTimeError" class="alert-box error" style="margin-top: 15px;">
              <span class="alert-icon">⏰</span>
              <p>{{ shiftTimeError }}</p>
              <div class="custom-swal-actions" style="margin-top: 20px">
                <button
                  @click="handleLogout"
                  class="custom-swal-confirm-btn"
                  style="background-color: #c53030 !important"
                >
                  Đăng xuất
                </button>
                <button
                  @click="closeModal"
                  class="custom-swal-confirm-btn"
                  style="background-color: #718096 !important"
                >
                  Chỉ xem
                </button>
              </div>
            </div>

            <div v-else-if="!chamCong">
              <div style="background-color: #e6fffa; border-left: 4px solid #319795; padding: 12px; margin-bottom: 20px; border-radius: 6px; text-align: left;">
                 <p style="margin: 0 0 6px 0; font-size: 14px; color: #234e52; font-weight: bold;">🔄 Bàn giao từ ca trước:</p>
                 <p style="margin: 3px 0; font-size: 13px; color: #285e61; display: flex; justify-content: space-between;">
                   <span>💵 Tiền mặt tại két:</span> 
                   <strong>{{ soDuCaTruoc.tienMat?.toLocaleString() || 0 }} VNĐ</strong>
                 </p>
                 <p style="margin: 3px 0; font-size: 13px; color: #285e61; display: flex; justify-content: space-between;">
                   <span>💳 Số dư chuyển khoản:</span> 
                   <strong>{{ soDuCaTruoc.tienCk?.toLocaleString() || 0 }} VNĐ</strong>
                 </p>
              </div>

              <div class="form-group">
                <label>Xác nhận Tiền mặt đầu ca</label>
                <div class="input-wrapper">
                  <input
                    type="text"
                    :value="formatDisplayValue(form.tienMat)"
                    @input="handleMoneyInput($event, 'tienMat')"
                    class="form-control"
                    placeholder="0"
                    inputmode="numeric"
                  />
                  <span class="currency-unit">VND</span>
                </div>
              </div>

              <div class="form-group">
                <label>Xác nhận Tiền tài khoản đầu ca</label>
                <div class="form-group">
                <label>Tiền tài khoản đầu ca (Tự động chuyển từ ca trước)</label>
                <div class="input-wrapper">
                  <input
                    type="text"
                    :value="formatDisplayValue(soDuCaTruoc.tienCk)"
                    class="form-control disabled-input"
                    disabled
                  />
                  <span class="currency-unit">VND</span>
                </div>
              </div>
              </div>
            </div>

            <div v-else>
              <div class="alert-box success" style="margin-bottom: 15px; display: block; text-align: left;">
                <div class="status-header" style="justify-content: flex-start; margin-bottom: 10px;">
                  <span class="alert-icon">✅</span>
                  <p class="status-title" style="margin: 0;">Đang trong ca làm việc</p>
                </div>
                <p class="status-time" style="margin: 5px 0;">
                  Ca được mở bởi: <strong>{{ chamCong.tenNguoiMoCa }}</strong>
                </p>
                <p class="status-time" style="margin: 5px 0;">
                  Check-in lúc: <strong>{{ chamCong.gioCheckIn?.substring(0, 5) }}</strong>
                </p>
              </div>

              <div v-if="!isClosingShift" style="padding: 20px; text-align: center; background: #f8fafc; border-radius: 8px; border: 1px dashed #cbd5e1;">
                <span style="font-size: 32px;">🏪</span>
                <p style="margin: 12px 0 0 0; color: #334155; font-size: 14px; font-weight: 500; line-height: 1.5;">
                  Cửa hàng đang hoạt động bình thường.<br/>
                  Tiền đầu ca đã được xác nhận. Bạn có thể vào thẳng màn hình bán hàng!
                </p>
              </div>

              <div v-else>
                <div style="background-color: #fffaf0; border-left: 4px solid #dd6b20; padding: 12px; margin-bottom: 15px; border-radius: 6px; text-align: left;">
                  <p style="margin: 0; font-size: 14px; color: #9c4221; font-weight: bold;">📝 Nhập số tiền kiểm đếm cuối ca:</p>
                </div>

                <div class="form-group" style="margin-bottom: 15px;">
                  <label>Két tiền mặt thực tế (Cuối ca)</label>
                  <div class="input-wrapper">
                    <input
                      type="text"
                      :value="formatDisplayValue(form.tienMatCuoiCa)"
                      @input="handleMoneyInput($event, 'tienMatCuoiCa')"
                      class="form-control"
                      placeholder="0"
                      inputmode="numeric"
                    />
                    <span class="currency-unit">VND</span>
                  </div>
                </div>

                <div class="form-group" style="margin-bottom: 15px;">
                  <label>Số dư chuyển khoản thực tế</label>
                  <div class="input-wrapper">
                    <input
                      type="text"
                      :value="formatDisplayValue(form.tienCkCuoiCa)"
                      @input="handleMoneyInput($event, 'tienCkCuoiCa')"
                      class="form-control"
                      placeholder="0"
                      inputmode="numeric"
                    />
                    <span class="currency-unit">VND</span>
                  </div>
                </div>

                <div class="form-group" style="margin-bottom: 10px;">
                  <label>Ghi chú (Tùy chọn)</label>
                  <textarea 
                    v-model="form.ghiChu" 
                    class="form-control" 
                    placeholder="Nhập ghi chú chênh lệch nếu có..."
                    style="height: 60px; resize: none;"
                  ></textarea>
                </div>
              </div>

            </div>
          </div>
        </div>

        <div 
  class="modal-footer" 
  v-if="ca && ca.caLamViec && !isShiftClosed && !shiftTimeError && (!chamCong || isClosingShift)"
>
          <template v-if="isShiftClosed || !ca || !ca.caLamViec">
          </template>

          <template v-else-if="!chamCong">
            <button class="btn btn-outline" @click="close">Hủy bỏ</button>
            <button
              class="btn btn-primary"
              @click="checkIn"
              :disabled="isLoading"
            >
              {{ isLoading ? "Đang xử lý..." : "Xác nhận mở ca" }}
            </button>
          </template>

          <template v-else>
            <template v-if="!isClosingShift">
              <button class="btn btn-outline" style="border-color: #dc2626; color: #dc2626;" @click="isClosingShift = true">Tiến hành chốt ca</button>
              <button class="btn btn-primary" @click="close">Vào bán hàng</button>
            </template>
            <template v-else>
              <button class="btn btn-outline" @click="isClosingShift = false">Quay lại</button>
              <button
                class="btn btn-primary btn-danger-custom"
                @click="checkOut"
                :disabled="isLoading"
              >
                {{ isLoading ? "Đang xử lý..." : "Xác nhận chốt ca" }}
              </button>
            </template>
          </template>
        </div>

      </div>
    </div>
  </Teleport>
</template>

<script setup >
import axios from "axios";
import { ref, onMounted, onUnmounted, computed } from "vue";
import Swal from "sweetalert2";
// --- 1. HÀM CHUYỂN ĐỔI GIỜ (Bất chấp định dạng từ Backend) ---
const timeToMinutes = (timeData) => { // Xóa bỏ : any
  if (!timeData) return 0;
  
  if (Array.isArray(timeData)) {
    const h = timeData[0] || 0;
    const m = timeData[1] || 0;
    return h * 60 + m;
  }
  
  if (typeof timeData === 'string') {
    const parts = timeData.split(':').map(Number);
    const h = parts[0] || 0;
    const m = parts[1] || 0;
    return h * 60 + m;
  }
  
  return 0;
};
// --- 2. HÀM FORMAT GIỜ ĐỂ HIỂN THỊ ĐẸP ---
const formatTimeDisplay = (timeData) => { // Xóa bỏ : any
  if (!timeData) return '';
  if (Array.isArray(timeData)) {
    return `${String(timeData[0]).padStart(2, '0')}:${String(timeData[1]).padStart(2, '0')}`;
  }
  return typeof timeData === 'string' ? timeData.substring(0, 5) : '';
};

// --- 3. BIẾN KIỂM TRA LỖI GIỜ GIẤC (Có try-catch bắt lỗi) ---
// --- 3. BIẾN KIỂM TRA LỖI GIỜ GIẤC ---
const shiftTimeError = computed(() => {
  try {
    // ĐỔI THÀNH props.chamCong VÀ props.ca
    if (!props.chamCong && props.ca && props.ca.caLamViec) {
      const now = new Date();
      const currentMins = now.getHours() * 60 + now.getMinutes();
      
      const startMins = timeToMinutes(props.ca.caLamViec.gioBatDau);
      const endMins = timeToMinutes(props.ca.caLamViec.gioKetThuc);

      const startStr = formatTimeDisplay(props.ca.caLamViec.gioBatDau);
      const endStr = formatTimeDisplay(props.ca.caLamViec.gioKetThuc);

      // 3.1 - Đã quá giờ kết thúc ca
      if (currentMins > endMins) {
        return `Ca làm việc đã kết thúc vào lúc ${endStr}. Bạn không thể mở ca lúc này.`;
      }

      // 3.2 - Chưa đến giờ (Cho phép mở trước tối đa 30 phút)
      if (currentMins < startMins - 30) {
        return `Chưa đến giờ làm. Chỉ được mở ca trước giờ bắt đầu (${startStr}) tối đa 30 phút.`;
      }
    }
    return null; // Không có lỗi, thời gian hợp lệ
  } catch (error) {
    console.error("Lỗi khi tính toán thời gian ca:", error);
    return "Hệ thống gặp lỗi khi kiểm tra thời gian ca làm việc. Vui lòng báo quản lý!";
  }
});
// ==========================================
// HÀM HELPER FORMAT TIỀN TỆ VND
// ==========================================
const formatVND = (value) => {
  if (!value && value !== 0) return '';
  const numStr = typeof value === 'string' ? value.replace(/[^0-9]/g, '') : String(value);
  const num = parseInt(numStr || '0');
  return num.toLocaleString('vi-VN');
};

const filterNumbers = (value) => {
  return value.replace(/[^0-9]/g, '');
};

const handleMoneyInput = (event, fieldName) => {
  let value = event.target.value;
  value = filterNumbers(value);
  form.value[fieldName] = value ? parseInt(value) : 0;
  event.target.value = formatVND(value);
};

const formatDisplayValue = (value) => {
  if (!value && value !== 0) return '';
  return formatVND(value);
};

const props = defineProps(["ca", "idNv", "tenNv", "token"]);
const emit = defineEmits(["close", "update:show"]);

const show = ref(true);
const isReady = ref(false);
const isLoading = ref(false);
const soDuCaTruoc = ref({ tienMat: 0, tienCk: 0 });
const staffName = ref("");

// 👉 BIẾN ĐIỀU KHIỂN HIỂN THỊ FORM CHỐT CA
const isClosingShift = ref(false);

// 👉 TÍNH TOÁN TRẠNG THÁI KHÓA CA
const isShiftClosed = computed(() => {
  // Nếu toàn bộ Lịch làm việc đã bị người khác chốt đóng (trạng thái = 1)
  if (props.ca && props.ca.trangThai === 1) return true;
  // Hoặc nếu cá nhân nhân viên này đã tự Check-out
  if (chamCong.value && chamCong.value.gioCheckOut) return true;
  return false;
});

const fetchSoDuCaTruoc = async () => {
  try {
    const res = await axios.get('http://localhost:8080/api/cham-cong/so-du-ca-truoc', { headers });
    soDuCaTruoc.value = res.data;
  } catch (e) {
    console.log("Lỗi lấy số dư:", e);
  }
};

const form = ref({
  tienMat: 0,
  tienTaiKhoan: 0,
  tienMatCuoiCa: 0,
  tienCkCuoiCa: 0,
  ghiChu: ''
});

const handleLogout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("idNv");
  window.location.href = "/login";
};

const closeModal = () => {
  // 👉 PHÁT TÍN HIỆU KHÓA TOÀN BỘ GIAO DIỆN
  window.dispatchEvent(new CustomEvent('set-view-only', { detail: true }));
  show.value = false;
  emit("update:show", false);
};

const chamCong = ref(null);
const currentDateObj = ref(new Date());
const currentTime = ref("");
let timer;

const updateTime = () => {
  currentDateObj.value = new Date();
  currentTime.value =
    currentDateObj.value.toLocaleTimeString("vi-VN") +
    " " +
    currentDateObj.value.toLocaleDateString("vi-VN");
};

const headers = {
  Authorization: `Bearer ${props.token}`,
};

const customSwalConfig = {
  customClass: {
    popup: "custom-swal-popup",
    title: "custom-swal-title",
    htmlContainer: "custom-swal-text",
    confirmButton: "custom-swal-confirm-btn",
    cancelButton: "custom-swal-cancel-btn",
    actions: "custom-swal-actions",
  },
  buttonsStyling: false,
};

const checkIn = async () => {
  isLoading.value = true;
  try {
    await axios.post(
      `http://localhost:8080/api/cham-cong/check-in/${props.idNv}`,
      {
        tienMatDauCa: form.value.tienMat,
        tienTaiKhoanDauCa: soDuCaTruoc.value.tienCk || 0,
      },
      { headers },
    );

    await Swal.fire({
      ...customSwalConfig,
      title: "Thành công!",
      text: "Mở ca làm việc thành công!",
      icon: "success",
      confirmButtonText: "Đồng ý",
    });

    location.reload();
  } catch (error) {
    console.error("Lỗi check-in:", error);
    Swal.fire({
      ...customSwalConfig,
      title: "Thất bại!",
      text: error.response?.data || "Có lỗi xảy ra khi mở ca.",
      icon: "error",
      confirmButtonText: "Đóng",
    });
  } finally {
    isLoading.value = false;
  }
};

const checkOut = async () => {
  const confirmResult = await Swal.fire({
    ...customSwalConfig,
    title: "Xác nhận kết thúc ca",
    text: "Hệ thống sẽ cộng gộp toàn bộ doanh thu của các nhân viên. Bạn có chắc chắn muốn kết thúc ca làm việc này không?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Đồng ý",
    cancelButtonText: "Hủy",
  });

  if (!confirmResult.isConfirmed) return;

  isLoading.value = true;
  try {
    await axios.post(
      `http://localhost:8080/api/cham-cong/check-out/${props.idNv}`,
      {
         tienMatCuoiCa: form.value.tienMatCuoiCa,
         tienChuyenKhoanCuoiCa: form.value.tienCkCuoiCa,
         ghiChu: form.value.ghiChu
      },
      { headers },
    );
    window.dispatchEvent(new CustomEvent("set-view-only", { detail: true }));
    await Swal.fire({
      ...customSwalConfig,
      title: "Thành công!",
      text: "Đã kết thúc ca làm việc!",
      icon: "success",
      confirmButtonText: "Đồng ý",
    });

    location.reload();
  } catch (error) {
    console.error("Lỗi check-out:", error);
    Swal.fire({
      ...customSwalConfig,
      title: "Thất bại!",
      text: error.response?.data || "Có lỗi xảy ra khi kết thúc ca.",
      icon: "error",
      confirmButtonText: "Đóng",
    });
  } finally {
    isLoading.value = false;
  }
};

onMounted(async () => {
  updateTime();
  fetchSoDuCaTruoc();
  // Lấy tên nhân viên an toàn, chống lỗi undefined
  let nameRaw = props.tenNv || localStorage.getItem("tenNv");
  if (!nameRaw || nameRaw === "undefined" || nameRaw === "null") {
    try {
      // Nếu không có tenNv, chui vào object user để lấy hoTen
      const userObj = JSON.parse(localStorage.getItem("user") || "{}");
      nameRaw = userObj.hoTen || userObj.fullName || userObj.tenNv || "Không xác định";
    } catch(e) {
      nameRaw = "Không xác định";
    }
  }
  staffName.value = nameRaw;
  timer = setInterval(updateTime, 1000);

  if (props.ca && props.ca.caLamViec) {
    try {
      const res = await axios.get(
        `http://localhost:8080/api/cham-cong/hom-nay/${props.idNv}`,
        { headers },
      );
      chamCong.value = res.data;
    } catch (err) {
      chamCong.value = null;
    }
  }

  isReady.value = true;
});

onUnmounted(() => {
  clearInterval(timer);
});

const close = () => {
  // 👉 PHÁT TÍN HIỆU MỞ KHÓA ĐỂ LÀM VIỆC
  window.dispatchEvent(new CustomEvent('set-view-only', { detail: false }));
  show.value = false;
  emit("close");
};
</script>

<style scoped>
/* Lớp phủ màn hình tối */
.modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(3px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

/* Khung nội dung Modal */
.modal-content {
  background-color: #ffffff;
  width: 480px;
  max-height: 90vh;
  overflow-y: auto;
  border-radius: 12px;
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.15);
  animation: slideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
}

@keyframes slideDown {
  from {
    transform: translateY(-30px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* Header */
.modal-header {
  background: linear-gradient(135deg, #6b3f23, #c89b6d);
  color: #ffffff;
  text-align: center;
  padding: 24px 20px;
  border-bottom: 4px solid #452614;
}

.modal-header h3 {
  margin: 0 0 8px 0;
  font-size: 20px;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.modal-header p {
  margin: 0;
  font-size: 13px;
  opacity: 0.9;
}

/* Body */
.modal-body {
  padding: 25px;
  background-color: #f7f7f7;
}

/* Thông tin NV */
.staff-info {
  text-align: center;
  margin-bottom: 25px;
  padding-bottom: 15px;
  border-bottom: 1px dashed #d1d5db;
}

.staff-code {
  margin: 0;
  font-size: 14px;
  color: #666666;
  font-family: monospace;
  background: #e5e7eb;
  display: inline-block;
  padding: 6px 14px;
  border-radius: 20px;
}

/* Các ô Input */
.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-size: 14px;
  color: #333333;
  margin-bottom: 8px;
  font-weight: 600;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.form-control {
  width: 100%;
  padding: 12px 45px 12px 15px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 15px;
  color: #333333;
  background-color: #ffffff;
  box-sizing: border-box;
  outline: none;
  transition: all 0.2s ease;
}

.form-control:focus:not(:disabled) {
  border-color: #63391f;
  box-shadow: 0 0 0 3px rgba(99, 57, 31, 0.1);
}

.disabled-input {
  background-color: #e5e7eb;
  color: #6b7280;
  font-weight: 500;
  cursor: not-allowed;
}

.currency-unit {
  position: absolute;
  right: 15px;
  color: #9ca3af;
  font-size: 14px;
  font-weight: 500;
  pointer-events: none;
}

/* Thông báo trạng thái (Alert Boxes) */
.alert-box {
  padding: 16px;
  border-radius: 8px;
  font-size: 14px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.alert-box p {
  margin: 0;
  line-height: 1.5;
}
.alert-icon {
  font-size: 24px;
}

.alert-box.error {
  background: #fef2f2;
  border: 1px solid #fca5a5;
  color: #991b1b;
}

.alert-box.success {
  background: #ecfdf5;
  border: 1px solid #a7f3d0;
  color: #065f46;
}

.status-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.alert-box.success .status-title {
  font-weight: 700;
  font-size: 16px;
}

.alert-box.success .status-time {
  font-size: 14px;
}
.alert-box.success .status-note {
  font-size: 13px;
  color: #047857;
  font-style: italic;
  margin-top: 4px;
}

.alert-box.disabled-box {
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
  color: #4b5563;
}

/* Nút bấm (Footer) */
.modal-footer {
  padding: 20px 25px;
  background-color: #ffffff;
  display: flex;
  justify-content: space-between;
  gap: 16px;
  border-top: 1px solid #e2e8f0;
}

.btn {
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  font-size: 14px;
  flex: 1;
  transition: all 0.2s ease;
  display: flex;
  justify-content: center;
  align-items: center;
}

.btn-outline {
  background-color: #ffffff;
  border: 1px solid #d1d5db;
  color: #666666;
}

.btn-outline:hover {
  background-color: #f9fafb;
  color: #333333;
}

.btn-primary {
  background-color: #63391f;
  color: #ffffff;
  box-shadow: 0 4px 6px rgba(99, 57, 31, 0.2);
}

.btn-primary:hover:not(:disabled) {
  background-color: #452614;
  transform: translateY(-1px);
}

/* Tùy chỉnh nút Kết thúc ca */
.btn-danger-custom {
  background-color: #dc2626 !important;
  box-shadow: 0 4px 6px rgba(220, 38, 38, 0.2);
}

.btn-danger-custom:hover:not(:disabled) {
  background-color: #b91c1c !important;
}

.btn:disabled {
  background-color: #d1d5db !important;
  color: #9ca3af !important;
  box-shadow: none !important;
  cursor: not-allowed;
  transform: none !important;
}
</style>

<style>
div.swal2-container {
  z-index: 10000 !important;
}

.custom-swal-popup {
  border-radius: 16px !important;
  padding: 2em !important;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15) !important;
}

.custom-swal-title {
  color: #63391f !important;
  font-size: 1.25em !important;
  font-weight: 700 !important;
  margin-bottom: 10px !important;
}

.custom-swal-text {
  color: #666666 !important;
  font-size: 1em !important;
}

.custom-swal-actions {
  display: flex !important;
  gap: 15px !important;
  margin-top: 25px !important;
  width: 100% !important;
}

.custom-swal-confirm-btn {
  flex: 1;
  background-color: #9b7054 !important;
  color: white !important;
  border: none !important;
  border-radius: 8px !important;
  padding: 12px 24px !important;
  font-weight: 600 !important;
  font-size: 1em !important;
  cursor: pointer !important;
  transition: background-color 0.2s ease !important;
}

.custom-swal-confirm-btn:hover {
  background-color: #63391f !important;
}

.custom-swal-cancel-btn {
  flex: 1;
  background-color: #f3f4f6 !important;
  color: #4b5563 !important;
  border: none !important;
  border-radius: 8px !important;
  padding: 12px 24px !important;
  font-weight: 600 !important;
  font-size: 1em !important;
  cursor: pointer !important;
  transition: background-color 0.2s ease !important;
}

.custom-swal-cancel-btn:hover {
  background-color: #e5e7eb !important;
}
</style>