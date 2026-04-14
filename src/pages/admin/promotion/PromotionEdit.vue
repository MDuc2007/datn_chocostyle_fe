<template>
  <div class="layout">
    <div class="left">
      <div class="card">
        <h5 class="title">Chỉnh sửa đợt giảm giá</h5>

        <div class="form">
          <div class="field">
            <label>Tên đợt giảm giá</label>
            <input
              v-model="form.tenDotGiamGia"
              placeholder="Nhập tên đợt giảm giá..."
            />
            <small v-if="errors.tenDotGiamGia" class="error">
              {{ errors.tenDotGiamGia }}
            </small>
          </div>

          <div class="field">
            <label>Giá trị giảm (%)</label>
            <div class="input-group">
              <input
                v-model.number="form.giaTriGiam"
                type="number"
                min="1"
                max="100"
              />
              <span>%</span>
            </div>
            <small v-if="errors.giaTriGiam" class="error">
              {{ errors.giaTriGiam }}
            </small>
          </div>

          <div class="field">
            <label>Ngày bắt đầu</label>
            <input v-model="form.ngayBatDau" type="date" :min="today" />
            <small v-if="errors.ngayBatDau" class="error">
              {{ errors.ngayBatDau }}
            </small>
          </div>

          <div class="field">
            <label>Ngày kết thúc</label>
            <input
              v-model="form.ngayKetThuc"
              type="date"
              :min="form.ngayBatDau"
            />
            <small v-if="errors.ngayKetThuc" class="error">
              {{ errors.ngayKetThuc }}
            </small>
          </div>
        </div>

        <div class="actions">
          <button class="btn cancel" @click="back">Hủy</button>
          <button class="btn primary" @click="onClickSave">Lưu</button>
        </div>
      </div>
    </div>

    <div class="right">
      <div class="card">
        <h5 class="title">Danh sách sản phẩm</h5>

        <input
          v-model="keyword"
          class="search-input"
          placeholder="Tìm theo mã hoặc tên sản phẩm..."
        />

        <small
          v-if="errors.chiTiet"
          class="error block"
          style="margin-bottom: 10px"
        >
          {{ errors.chiTiet }}
        </small>

        <div class="table-wrapper">
          <table class="table">
            <thead>
              <tr>
                <th>
                  <button
                    class="btn-icon header-tick"
                    :class="{ active: isAllSpSelected }"
                    @click="toggleAllSanPham"
                  >
                    {{ isAllSpSelected ? "✓" : "+" }}
                  </button>
                </th>
                <th>Ảnh</th>
                <th>Mã SP</th>
                <th>Tên sản phẩm</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(sp, index) in filteredSanPhamList" :key="sp.id">
                <td>
                  <button
                    class="btn-icon"
                    :class="{ active: selectedSanPhamIds.includes(sp.id) }"
                    @click="toggleSanPham(sp)"
                  >
                    {{ selectedSanPhamIds.includes(sp.id) ? "✓" : "+" }}
                  </button>
                </td>
                <td><img :src="sp.hinhAnh" /></td>

                <td>{{ sp.maSp }}</td>
                <td>{{ sp.tenSp }}</td>
              </tr>
              <tr v-if="sanPhamList.length === 0">
                <td colspan="5" class="empty">
                  Đang tải danh sách sản phẩm...
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div v-if="allChiTietList.length" class="full">
      <div class="panel-card">
        <h5 class="subtitle">Danh sách biến thể đã chọn</h5>

        <!-- ===== SEARCH + FILTER ===== -->
        <div class="variant-toolbar">
          <input
            v-model="variantKeyword"
            placeholder="Tìm mã chi tiết / tên sản phẩm..."
            class="search-input"
          />

          <select v-model="filterMau">
            <option value="">Màu sắc</option>
            <option v-for="m in mauOptions" :key="m" :value="m">
              {{ m }}
            </option>
          </select>

          <select v-model="filterSize">
            <option value="">Size</option>
            <option v-for="s in sizeOptions" :key="s" :value="s">
              {{ s }}
            </option>
          </select>

          <select v-model="filterLoai">
            <option value="">Loại áo</option>
            <option v-for="l in loaiOptions" :key="l" :value="l">
              {{ l }}
            </option>
          </select>

          <select v-model="filterKieu">
            <option value="">Kiểu dáng</option>
            <option v-for="k in kieuOptions" :key="k" :value="k">
              {{ k }}
            </option>
          </select>
          <button
            v-if="
              variantKeyword ||
              filterMau ||
              filterSize ||
              filterLoai ||
              filterKieu ||
              selectedMaxPrice !== maxPrice
            "
            class="btn-clear"
            @click="clearFilters"
          >
            Xóa lọc
          </button>
        </div>

        <!-- 🔥 PRICE FILTER FULL WIDTH -->
        <div class="price-filter-full">
          <div class="price-label">
            <span>Khoảng giá:</span>
            <span class="price-value">
              0 ₫ - {{ formatPrice(selectedMaxPrice) }}
            </span>
          </div>

          <input
            type="range"
            min="0"
            :max="maxPrice"
            step="1"
            v-model.number="selectedMaxPrice"
            class="price-slider"
            :style="{
              background: `linear-gradient(
        to right,
        #63391f 0%,
        #63391f ${maxPrice ? (selectedMaxPrice / maxPrice) * 100 : 0}%,
        #e0e0e0 ${maxPrice ? (selectedMaxPrice / maxPrice) * 100 : 0}%,
        #e0e0e0 99%
      )`,
            }"
          />
        </div>

        <!-- ===== TABLE ===== -->
        <table class="variant-table">
          <thead>
            <tr>
              <th>
                <button
                  class="btn-icon header-tick"
                  :class="{ active: isAllVariantSelected }"
                  @click="toggleAllVariants"
                >
                  {{ isAllVariantSelected ? "✓" : "+" }}
                </button>
              </th>
              <th>Ảnh</th>
              <th>Tên SP</th>
              <th>Mã CTSP</th>
              <th>Màu</th>
              <th>Size</th>
              <th>Loại</th>
              <th>Kiểu</th>
              <th>Số lượng</th>
              <th>Giá bán</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="ct in filteredChiTietList" :key="ct.id">
              <td>
                <button
                  class="btn-icon"
                  :class="{ active: selectedChiTietIds.includes(ct.id) }"
                  @click="toggleChiTiet(ct.id)"
                >
                  {{ selectedChiTietIds.includes(ct.id) ? "✓" : "+" }}
                </button>
              </td>
              <td>
                <div class="img-wrapper">
                  <img :src="ct.anhHienThi" class="variant-img" />

                  <div
                    v-if="
                      form.giaTriGiam > 0 && selectedChiTietIds.includes(ct.id)
                    "
                    class="discount-badge"
                  >
                    -{{ form.giaTriGiam }}%
                  </div>
                </div>
              </td>

              <td>{{ ct.tenSp }}</td>
              <td>{{ ct.maChiTietSanPham }}</td>
              <td>
                {{ ct.mauSacList?.map((m: any) => m.tenMauSac).join(", ") }}
              </td>
              <td>{{ ct.kichCoList?.join(", ") }}</td>
              <td>{{ ct.tenLoaiAo }}</td>
              <td>{{ ct.tenKieuDang }}</td>
              <td>{{ ct.soLuong }}</td>

              <td
                class="price-cell"
                :class="{ discounted: getDiscountPrice(ct) < ct.giaBan }"
              >
                <template v-if="getDiscountPrice(ct) < ct.giaBan">
                  <div class="old-price">
                    {{ formatPrice(ct.giaBan) }}
                  </div>
                  <div class="new-price">
                    {{ formatPrice(getDiscountPrice(ct)) }}
                  </div>
                </template>

                <template v-else>
                  <div>
                    {{ formatPrice(ct.giaBan) }}
                  </div>
                </template>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="toast-container">
      <div
        v-for="notif in notifications"
        :key="notif.id"
        class="toast"
        :class="notif.type"
      >
        {{ notif.message }}
      </div>
    </div>

    <transition name="fade-modal">
      <div
        v-if="showConfirm"
        class="modal-confirm"
        @click.self="showConfirm = false"
      >
        <div class="confirm-box">
          <div class="confirm-icon-wrapper">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="36"
              height="36"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M8 12l3 3 5-5"></path>
            </svg>
          </div>
          <h3 class="confirm-title">Xác nhận hệ thống</h3>

          <p class="confirm-desc">
            Bạn có chắc chắn muốn lưu các thay đổi cho đợt giảm giá này không?
          </p>

          <div class="confirm-actions">
            <button class="btn-cancel" @click="showConfirm = false">Hủy</button>

            <button class="btn-confirm" @click="submit">Đồng ý</button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted, computed, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import axios from "axios";

// 1. Khai báo các tiện ích
const router = useRouter();
const route = useRoute();
const id = route.params.id;
const keyword = ref("");
const variantKeyword = ref("");

const filterMau = ref("");
const filterSize = ref("");
const filterLoai = ref("");
const filterKieu = ref("");
const today = new Date().toISOString().split("T")[0];
const clearFilters = () => {
  variantKeyword.value = "";
  filterMau.value = "";
  filterSize.value = "";
  filterLoai.value = "";
  filterKieu.value = "";
  selectedMaxPrice.value = maxPrice.value;
};
const mauOptions = computed(() => [
  ...new Set(
    allChiTietList.value.flatMap(
      (ct) => ct.mauSacList?.map((m: any) => m.tenMauSac) || [],
    ),
  ),
]);

const sizeOptions = computed(() => [
  ...new Set(allChiTietList.value.flatMap((ct) => ct.kichCoList || [])),
]);

const loaiOptions = computed(() => [
  ...new Set(allChiTietList.value.map((ct) => ct.tenLoaiAo)),
]);

const kieuOptions = computed(() => [
  ...new Set(allChiTietList.value.map((ct) => ct.tenKieuDang)),
]);
const filteredChiTietList = computed(() => {
  const kw = variantKeyword.value.toLowerCase();

  return allChiTietList.value.filter((ct) => {
    const matchKeyword =
      !kw ||
      ct.maChiTietSanPham?.toLowerCase().includes(kw) ||
      ct.tenSp?.toLowerCase().includes(kw);

    const matchMau =
      !filterMau.value ||
      ct.mauSacList?.some((m: any) => m.tenMauSac === filterMau.value);

    const matchSize =
      !filterSize.value || ct.kichCoList?.includes(filterSize.value);

    const matchLoai = !filterLoai.value || ct.tenLoaiAo === filterLoai.value;

    const matchKieu = !filterKieu.value || ct.tenKieuDang === filterKieu.value;

    // 🔥 LỌC THEO SLIDER
    const percent = promotionMap.value[ct.id] || 0;

    const finalPrice = percent ? ct.giaBan * (1 - percent / 100) : ct.giaBan;

    const matchPrice =
      !selectedMaxPrice.value || finalPrice <= selectedMaxPrice.value;

    return (
      matchKeyword &&
      matchMau &&
      matchSize &&
      matchLoai &&
      matchKieu &&
      matchPrice
    );
  });
});

// 2. Khai báo State dữ liệu
const sanPhamList = ref<any[]>([]);
const selectedSanPhamIds = ref<number[]>([]);
const selectedChiTietIds = ref<number[]>([]);
const chiTietMap = reactive<Record<number, any[]>>({});

const form = reactive({
  tenDotGiamGia: "",
  giaTriGiam: 1,
  ngayBatDau: "",
  ngayKetThuc: "",
});

const errors = reactive({
  tenDotGiamGia: "",
  giaTriGiam: "",
  ngayBatDau: "",
  ngayKetThuc: "",
  chiTiet: "",
});
const filteredSanPhamList = computed(() => {
  if (!keyword.value.trim()) return sanPhamList.value;

  const key = keyword.value.toLowerCase();
  return sanPhamList.value.filter(
    (sp) =>
      sp.maSp?.toLowerCase().includes(key) ||
      sp.tenSp?.toLowerCase().includes(key),
  );
});

// 3. Khai báo UI State (Modal & Toast)
const showConfirm = ref(false);
const notifications = ref<{ id: number; message: string; type?: string }[]>([]);

// 4. Các hàm xử lý giao diện
const showNotification = (message: string, type = "success") => {
  const id = Date.now();
  notifications.value.push({ id, message, type });

  setTimeout(() => {
    notifications.value = notifications.value.filter((n) => n.id !== id);
  }, 3000);
};

const showSuccessModal = () => {
  showConfirm.value = false;
  showNotification("Cập nhật đợt giảm giá thành công");
  setTimeout(() => {
    back();
  }, 1500);
};

const onClickSave = () => {
  if (!validate()) return;
  showConfirm.value = true;
};

// ... (các code cũ giữ nguyên)

// --- LOGIC CHỌN TẤT CẢ SẢN PHẨM ---
const isAllSpSelected = computed(() => {
  const visibleIds = filteredSanPhamList.value.map((sp) => sp.id);
  if (visibleIds.length === 0) return false;

  return visibleIds.every((id) => selectedSanPhamIds.value.includes(id));
});

const toggleAllSanPham = async () => {
  const visibleProducts = filteredSanPhamList.value;
  const visibleIds = visibleProducts.map((sp) => sp.id);

  if (isAllSpSelected.value) {
    // Bỏ chọn các SP đang hiển thị
    selectedSanPhamIds.value = selectedSanPhamIds.value.filter(
      (id) => !visibleIds.includes(id),
    );

    // Bỏ luôn các biến thể tương ứng
    visibleIds.forEach((spId) => {
      const ctIds = (chiTietMap[spId] || []).map((ct) => ct.id);
      selectedChiTietIds.value = selectedChiTietIds.value.filter(
        (id) => !ctIds.includes(id),
      );
    });
  } else {
    // Chọn tất cả SP đang hiển thị
    for (const sp of visibleProducts) {
      if (!selectedSanPhamIds.value.includes(sp.id)) {
        selectedSanPhamIds.value.push(sp.id);
        await fetchChiTietBySpId(sp.id);
      }
    }
  }
};

// --- LOGIC CHỌN TẤT CẢ BIẾN THỂ ---
const isAllChiTietSelected = (spId: number) => {
  const allIds = chiTietMap[spId]?.map((ct) => ct.id) || [];
  if (allIds.length === 0) return false;
  return allIds.every((id) => selectedChiTietIds.value.includes(id));
};

const toggleAllChiTiet = (spId: number) => {
  const allIds = chiTietMap[spId]?.map((ct) => ct.id) || [];
  if (isAllChiTietSelected(spId)) {
    // Bỏ chọn tất cả biến thể của SP này
    selectedChiTietIds.value = selectedChiTietIds.value.filter(
      (id) => !allIds.includes(id),
    );
  } else {
    // Thêm các ID chưa có vào mảng chọn
    allIds.forEach((id) => {
      if (!selectedChiTietIds.value.includes(id)) {
        selectedChiTietIds.value.push(id);
      }
    });
  }
};
/* ===== TICK ALL BIẾN THỂ ===== */
const isAllVariantSelected = computed(() => {
  const visibleIds = filteredChiTietList.value.map((ct) => ct.id);
  if (visibleIds.length === 0) return false;

  return visibleIds.every((id) => selectedChiTietIds.value.includes(id));
});

const toggleAllVariants = () => {
  const visibleIds = filteredChiTietList.value.map((ct) => ct.id);

  if (isAllVariantSelected.value) {
    // bỏ chọn
    selectedChiTietIds.value = selectedChiTietIds.value.filter(
      (id) => !visibleIds.includes(id),
    );
  } else {
    // chọn tất cả
    visibleIds.forEach((id) => {
      if (!selectedChiTietIds.value.includes(id)) {
        selectedChiTietIds.value.push(id);
      }
    });
  }
};

// ===== GỘP ALL BIẾN THỂ =====
const allChiTietList = computed(() => {
  return selectedSanPhamIds.value.flatMap((spId) => {
    const sp = sanPhamList.value.find((s) => s.id === spId);

    return (chiTietMap[spId] || []).map((ct) => ({
      ...ct,
      tenSp: sp?.tenSp,
      tenLoaiAo: sp?.tenLoaiAo,
      tenKieuDang: sp?.tenKieuDang,

      // ⭐ THÊM 3 CÁI NÀY
      anhHienThi: ct.hinhAnhUrls?.length > 0 ? ct.hinhAnhUrls[0] : sp?.hinhAnh,
      giaBan: ct.giaBan,
      soLuong: ct.soLuongTon,
    }));
  });
});

const back = () => router.push("/admin/promotion");

// 5. Logic Nghiệp vụ & Validation
const validate = () => {
  let valid = true;
  Object.keys(errors).forEach((k) => (errors[k as keyof typeof errors] = ""));
  const name = form.tenDotGiamGia.trim();

  const regex = /^[a-zA-Z0-9À-ỹ\s]+$/;

  if (!name) {
    errors.tenDotGiamGia = "Tên đợt giảm giá không được để trống";
    valid = false;
  } else if (name.length < 3) {
    errors.tenDotGiamGia = "Tên đợt giảm giá phải có ít nhất 3 ký tự";
    valid = false;
  } else if (name.length > 100) {
    errors.tenDotGiamGia = "Tên đợt giảm giá tối đa 100 ký tự";
    valid = false;
  } else if (!regex.test(form.tenDotGiamGia.trim())) {
    errors.tenDotGiamGia = "Tên không được chứa ký tự đặc biệt";
    valid = false;
  }

  if (!form.giaTriGiam || form.giaTriGiam < 1 || form.giaTriGiam > 100) {
    errors.giaTriGiam = "Giá trị giảm phải từ 1 – 100%";
    valid = false;
  }
  if (!form.ngayBatDau) {
    errors.ngayBatDau = "Ngày bắt đầu không được để trống";
    valid = false;
  }
  if (!form.ngayKetThuc) {
    errors.ngayKetThuc = "Ngày kết thúc không được để trống";
    valid = false;
  } else if (form.ngayKetThuc < form.ngayBatDau) {
    errors.ngayKetThuc = "Ngày kết thúc phải ≥ ngày bắt đầu";
    valid = false;
  }
  if (selectedChiTietIds.value.length === 0) {
    errors.chiTiet = "Vui lòng chọn ít nhất 1 biến thể sản phẩm";
    valid = false;
  }
  return valid;
};

// 6. Gọi API
const fetchSanPham = async () => {
  try {
    const res = await axios.get("http://localhost:8080/api/san-pham");
    sanPhamList.value = res.data.content ?? res.data;
  } catch (e) {
    console.error("Lỗi tải danh sách sản phẩm", e);
  }
};

const fetchChiTietBySpId = async (spId: number) => {
  if (chiTietMap[spId]) return;
  try {
    const res = await axios.get(`http://localhost:8080/api/san-pham/${spId}`);
    chiTietMap[spId] = (res.data.bienTheList || []).map((ct: any) => ({
      ...ct,
      id: Number(ct.id),
    }));
  } catch (e) {
    console.error("Lỗi tải biến thể", e);
  }
};

const submit = async () => {
  try {
    const payload = {
      ...form,
      chiTietSanPhamIds: selectedChiTietIds.value,
    };
    await axios.put(`http://localhost:8080/api/promotions/${id}`, payload);
    showSuccessModal();
  } catch (e) {
    console.error(e);
    showNotification("Không thể cập nhật đợt giảm giá", "error");
  }
};

// 7. Xử lý sự kiện chọn sản phẩm/biến thể
const toggleSanPham = async (sp: any) => {
  const index = selectedSanPhamIds.value.indexOf(sp.id);
  if (index === -1) {
    selectedSanPhamIds.value.push(sp.id);
    await fetchChiTietBySpId(sp.id);
  } else {
    selectedSanPhamIds.value.splice(index, 1);
    const ctIds = (chiTietMap[sp.id] || []).map((c) => c.id);
    selectedChiTietIds.value = selectedChiTietIds.value.filter(
      (id) => !ctIds.includes(id),
    );
  }
};

const toggleChiTiet = (ctId: number) => {
  const index = selectedChiTietIds.value.indexOf(ctId);
  if (index === -1) {
    selectedChiTietIds.value.push(ctId);
  } else {
    selectedChiTietIds.value.splice(index, 1);
  }
};

// 8. Khởi tạo dữ liệu khi Load trang
onMounted(async () => {
  await fetchSanPham();
  try {
    const res = await axios.get(`http://localhost:8080/api/promotions/${id}`);
    const data = res.data;

    form.tenDotGiamGia = data.tenDotGiamGia;
    form.giaTriGiam = data.giaTriGiam;
    form.ngayBatDau = data.ngayBatDau;
    form.ngayKetThuc = data.ngayKetThuc;

    selectedSanPhamIds.value =
      data.sanPhamApDung?.map((sp: any) => sp.idSp) || [];
    selectedChiTietIds.value = data.chiTietSanPhamIds || [];

    // Tải trước biến thể của các sản phẩm đã được áp dụng
    for (const spId of selectedSanPhamIds.value) {
      await fetchChiTietBySpId(spId);
    }
  } catch (e) {
    console.error(e);
    alert("Không tìm thấy thông tin đợt giảm giá này");
  }
});

const promotionMap = ref<Record<number, number>>({});
const promotionCountMap = ref<Record<number, number>>({}); // ⭐ thêm

const fetchPromotions = async () => {
  const res = await axios.get("http://localhost:8080/api/promotions");

  const percentMap: Record<number, number> = {};
  const countMap: Record<number, number> = {};
  const today = new Date();

  res.data
    .filter((dgg: any) => {
      // 1️⃣ phải đang active
      if (dgg.trangThai !== 1) return false;

      // 2️⃣ phải trong thời gian hiệu lực
      const start = new Date(dgg.ngayBatDau);
      const end = new Date(dgg.ngayKetThuc);

      return today >= start && today <= end;
    })
    .forEach((dgg: any) => {
      dgg.chiTietSanPhamIds.forEach((id: number) => {
        countMap[id] = (countMap[id] || 0) + 1;
        percentMap[id] = Math.max(percentMap[id] || 0, dgg.giaTriGiam);
      });
    });

  promotionMap.value = percentMap;
  promotionCountMap.value = countMap;
};

const selectedMaxPrice = ref(0);

const maxPrice = computed(() => {
  if (!allChiTietList.value.length) return 0;

  const prices = allChiTietList.value.map((ct) => {
    const percent = promotionMap.value[ct.id] || 0;

    const finalPrice = percent ? ct.giaBan * (1 - percent / 100) : ct.giaBan;

    return Math.round(finalPrice); // 🔥 QUAN TRỌNG
  });

  return Math.max(...prices);
});

watch(maxPrice, (val) => {
  selectedMaxPrice.value = val;
});
const formatPrice = (price: number) => {
  return (price || 0).toLocaleString("vi-VN") + " ₫";
};
const getDiscountPrice = (ct: any) => {
  if (!ct?.giaBan) return 0;

  // nếu biến thể này được chọn trong form hiện tại
  if (selectedChiTietIds.value.includes(ct.id)) {
    return Math.round(ct.giaBan - (ct.giaBan * form.giaTriGiam) / 100);
  }

  // nếu có khuyến mãi khác đang active
  const percent = promotionMap.value[ct.id] || 0;

  if (percent > 0) {
    return Math.round(ct.giaBan * (1 - percent / 100));
  }

  // không giảm giá
  return ct.giaBan;
};
</script>

<style scoped>
/* === LAYOUT === */
.layout {
  display: grid;
  grid-template-columns: 39% 60%;
  gap: 20px;
  background-color: #f4f4f9;
  min-height: 100vh;
  margin-top: 1px;
}

.full {
  grid-column: 1 / -1;
}

/* === CARD === */
.card {
  min-height: 510px;
  background: #fff;
  border-radius: 20px;
  border: 1px solid #ddd;
  padding: 20px;
}

.title {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 20px;
  margin-top: 1px;
  color: #333;
}

.subtitle {
  font-weight: 600;
  margin-bottom: 12px;
  color: #63391f;
}

/* === FORM === */
.form {
  display: grid;
  gap: 16px;
}

.field label {
  display: block;
  margin-bottom: 6px;
  font-weight: 600;
  color: #555;
}

.field input {
  height: 50px;
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 10px;
  box-sizing: border-box;
}
.input-group {
  display: flex;
  align-items: center; /* căn giữa theo chiều dọc */
}

.input-group input {
  height: 52px;
  border-right: none;
  border-radius: 10px 0 0 10px;
}

.input-group span {
  height: 50px;
  display: flex;
  align-items: center; /* căn giữa chữ % */
  justify-content: center;
  padding: 0 16px; /* chỉ để padding ngang */
  border: 1px solid #ddd;
  border-left: none;
  border-radius: 0 10px 10px 0;
  color: #666;
  font-weight: 600;
}

/* === BUTTONS === */
.actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

.btn.primary {
  width: 100px;
  height: 40px;
  background: #63391f;
  color: #fff;
  border: none;
  padding: 8px 16px;
  border-radius: 10px;
  margin-top: 1px;
}

.btn.cancel {
  width: 100px;
  height: 40px;
  background: #888;
  color: #fff;
  border: none;
  padding: 8px 16px;
  border-radius: 10px;
  margin-top: 1px;
}

.btn:hover {
  opacity: 0.9;
}

.btn-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 1px solid #ccc;
  background: #fff;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-icon.active {
  background: #63391f;
  color: #fff;
  border-color: #63391f;
}
.header-tick:hover {
  transform: scale(1.1);
}
/* === TABLE === */
/* ===== TABLE DSSP (GIỐNG CREATE) ===== */
.table-wrapper {
  height: 390px;
  border-radius: 16px;
  border: 1px solid #ddd;
  background: #fff;
  overflow-y: auto;
}

.table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}

.table thead th {
  position: sticky;
  top: 0;
  background: #fff;
  z-index: 2;
}

.table th,
.table td {
  padding: 14px 8px;
  text-align: center;
  border-bottom: 1px solid #eee;
}
img {
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 4px;
}

/* === ERROR === */
.error {
  color: #d32f2f;
  font-size: 12px;
  margin-top: 4px;
}

.block {
  display: block;
}

.toast-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* Style cho từng cái Toast giống ảnh mẫu */
.toast {
  min-width: 300px;
  padding: 16px 24px;
  border-radius: 8px;
  background-color: #dcfce7; /* Xanh nhạt */
  color: #166534; /* Chữ xanh đậm */
  font-size: 16px;
  font-weight: 500;
  border-left: 6px solid #22c55e; /* Thanh màu xanh lá đậm bên trái */
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  animation: slideIn 0.3s ease-out;
}

/* Hiệu ứng trượt từ phải vào */
@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
.search-input {
  height: 50px;
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 10px;
  box-sizing: border-box;
  margin-bottom: 20px;
}
/* === MODAL === */
/* ===== CONFIRM MODAL (NEW STYLE) ===== */
.modal-confirm {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);

  display: flex;
  justify-content: center;
  align-items: center;

  z-index: 3000;
}

.confirm-box {
  background: #fff;
  padding: 30px;
  border-radius: 20px;
  width: 400px;
  text-align: center;

  box-shadow:
    0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);

  animation: zoomIn 0.25s ease;
}

.confirm-icon-wrapper {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background-color: #e8f5e9;
  color: #22c55e;

  display: flex;
  align-items: center;
  justify-content: center;

  margin: 0 auto 15px;
  font-size: 34px;
}

.confirm-title {
  font-size: 20px;
  font-weight: 700;
  color: #63391f;
  margin-bottom: 10px;
}

.confirm-desc {
  color: #666;
  margin-bottom: 24px;
}

.confirm-actions {
  display: flex;
  gap: 16px;
}

.btn-confirm,
.btn-cancel {
  flex: 1;
  height: 42px;
  border-radius: 10px;
  border: none;
  font-weight: 600;
  cursor: pointer;
}

.btn-confirm {
  background: #63391f;
  color: white;
}

.btn-confirm:hover {
  background: #4e2c17;
}

.btn-cancel {
  background: #f3f4f6;
}

.fade-modal-enter-active,
.fade-modal-leave-active {
  transition: opacity 0.25s;
}

.fade-modal-enter-from,
.fade-modal-leave-to {
  opacity: 0;
}

@keyframes zoomIn {
  from {
    transform: scale(0.9);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

/* ===== PANEL BIẾN THỂ ===== */
.panel-card {
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 20px;
  padding: 20px;
}

/* tiêu đề */
.subtitle {
  font-weight: 700;
  font-size: 25px;
  margin-top: 1px;
  margin-bottom: 12px;
  color: #000000;
}

/* wrapper chỉ để bo góc */
.variant-wrapper {
  border: 1px solid #ddd;
  border-radius: 16px;
  overflow: hidden; /* 🔥 để bo góc table */
}

/* bảng hiển thị BÌNH THƯỜNG */
.variant-table {
  width: 100%;
  border-collapse: collapse;
}

/* header */
.variant-table thead th {
  color: #000000;
  padding: 14px 8px;
  text-align: center;
}

/* cell */
.variant-table td {
  padding: 14px 8px;
  text-align: center;
  border-top: 1px solid #eee;
}
/* ===== FILTER BAR ONLY (không đụng search) ===== */
.variant-toolbar {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 16px;
}

/* select filter */
.variant-toolbar select {
  height: 40px;
  min-width: 120px;
  padding: 0 12px;

  border-radius: 10px;
  border: 1px solid #ddd;
  background: #fff;

  font-size: 14px;
  cursor: pointer;
  transition: 0.2s;
}

/* hover */
.variant-toolbar select:hover {
  border-color: #63391f;
}

/* focus */
.variant-toolbar select:focus {
  outline: none;
  border-color: #63391f;
  box-shadow: 0 0 0 3px rgba(99, 57, 31, 0.15);
}

/* nút clear */
.btn-clear {
  height: 40px;
  min-width: 120px;
  padding: 0 12px;
  border-radius: 10px;
  border: 1px solid #ddd;
  background: #fff;
  font-size: 14px;
  cursor: pointer;
  transition: 0.2s;
}

.btn-clear:hover {
  background: #fff;
  color: black;
  border: 1px solid #ddd;
}
.toast.error {
  background-color: #fee2e2;
  color: #991b1b;
  border-left: 6px solid #ef4444;
}
.variant-img {
  width: 55px;
  height: 55px;
  object-fit: cover;
  border-radius: 6px;
}

.price-filter {
  width: 470px; /* 👈 tăng chiều dài */
  margin-bottom: 20px;
}
.price-slider {
  -webkit-appearance: none;
  width: 100%;
  height: 6px;
  border-radius: 5px;
  outline: none;
}

/* Chrome, Edge */
.price-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: linear-gradient(135deg, #6b3f23, #c89b6d);
  cursor: pointer;
  border: none;
}

/* Firefox */
.price-slider::-moz-range-thumb {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: linear-gradient(135deg, #6b3f23, #c89b6d);
  cursor: pointer;
  border: none;
}
.old-price {
  text-decoration: line-through;
  color: #999;
  font-size: 12px;
}

.new-price {
  font-weight: 600;
  color: #e53935;
  font-size: 16px;
}
.img-wrapper {
  position: relative;
  width: 55px;
  height: 55px;
}

.variant-img {
  width: 55px;
  height: 55px;
  object-fit: cover;
  border-radius: 6px;
}

.discount-badge {
  position: absolute;
  top: -6px;
  left: -6px;

  background: linear-gradient(135deg, #ff4d4f, #d32f2f);
  color: #fff;

  font-size: 11px;
  font-weight: 700;

  padding: 4px 6px;
  border-radius: 8px;

  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.25);
}
</style>
