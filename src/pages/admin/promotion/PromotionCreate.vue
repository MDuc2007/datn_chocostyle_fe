<template>
  <div class="promotion-layout">
    <!-- LEFT -->
    <div class="left-panel">
      <div class="panel">
        <h5 class="panel-title">Thêm đợt giảm giá</h5>

        <div class="form-group">
          <label>Tên đợt giảm giá</label>
          <input
            v-model="form.tenDotGiamGia"
            placeholder="Nhập tên đợt giảm giá"
          />
          <small v-if="errors.tenDotGiamGia">{{ errors.tenDotGiamGia }}</small>
        </div>
        <div class="form-group">
          <label>Giá trị giảm (%)</label>

          <div class="percent-wrapper">
            <input
              type="number"
              v-model.number="form.giaTriGiam"
              min="1"
              max="100"
              class="percent-input"
            />
            <span class="percent-symbol">%</span>
          </div>

          <small v-if="errors.giaTriGiam">{{ errors.giaTriGiam }}</small>
        </div>

        <div class="form-group">
          <label>Ngày bắt đầu</label>
          <input type="date" v-model="form.ngayBatDau" />
          <small v-if="errors.ngayBatDau">{{ errors.ngayBatDau }}</small>
        </div>

        <div class="form-group">
          <label>Ngày kết thúc</label>
          <input
            type="date"
            v-model="form.ngayKetThuc"
            :min="form.ngayBatDau"
          />
          <small v-if="errors.ngayKetThuc">{{ errors.ngayKetThuc }}</small>
        </div>

        <div class="actions">
          <button class="btn-secondary" @click="back">Hủy</button>
          <button class="btn-primary" @click="onClickSave">Lưu</button>
        </div>
      </div>
    </div>

    <!-- RIGHT -->
    <div class="right-panel">
      <div class="panel">
        <h5 class="panel-title">Danh sách sản phẩm</h5>

        <input
          v-model="searchKeyword"
          class="search-input"
          placeholder="Tìm theo mã hoặc tên sản phẩm..."
        />

        <small v-if="errors.chiTiet" class="error">{{ errors.chiTiet }}</small>

        <div class="table-wrapper">
          <table class="table">
            <thead class="table-light">
              <tr>
                <th>
                  <button
                    class="btn-icon header-tick"
                    :class="{ active: isAllSanPhamSelected }"
                    @click="toggleAllSanPham"
                  >
                    {{ isAllSanPhamSelected ? "✓" : "+" }}
                  </button>
                </th>
                <th>Ảnh</th>
                <th>Mã sản phẩm</th>
                <th>Tên sản phẩm</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(sp, i) in filteredSanPhamList" :key="sp.id">
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
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>

  <!-- ===== BẢNG BIẾN THỂ GỘP ===== -->
  <div v-if="allChiTietList.length" class="col-12">
    <div class="panel-card">
      <div class="card-body">
        <h5 class="panel-title">Danh sách biến thể</h5>
        <!-- SEARCH + FILTER BAR -->
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

        <table class="variant">
          <thead>
            <tr>
              <th>
                <button
                  class="btn-icon header-tick"
                  :class="{ active: isAllChiTietSelectedAll }"
                  @click="toggleAllChiTietAll"
                >
                  {{ isAllChiTietSelectedAll ? "✓" : "+" }}
                </button>
              </th>
              <th>Ảnh</th>
              <th>Tên sản phẩm</th>
              <th>Mã chi tiết</th>
              <th>Màu sắc</th>
              <th>Kích cỡ</th>
              <th>Loại áo</th>
              <th>Kiểu dáng</th>
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
                  <span v-if="promotionMap[ct.id]" class="discount-badge">
                    -{{ promotionMap[ct.id] }}%
                  </span>
                </div>
              </td>

              <td>{{ ct.tenSp }}</td>
              <td>{{ ct.maChiTietSanPham }}</td>

              <td>
                <span v-for="m in ct.mauSacList" :key="m.tenMauSac">
                  {{ m.tenMauSac }}
                </span>
              </td>

              <td>
                <span
                  v-for="k in ct.kichCoList"
                  :key="k"
                  class="badge bg-secondary me-1"
                >
                  {{ k }}
                </span>
              </td>

              <td>{{ ct.tenLoaiAo }}</td>
              <td>{{ ct.tenKieuDang }}</td>
              <td>{{ ct.soLuong }}</td>
              <td class="price-cell">
                <div class="price-box">
                  <span v-if="promotionMap[ct.id]" class="old-price">
                    {{ formatPrice(ct.giaBan) }}
                  </span>

                  <span :class="{ 'new-price': promotionMap[ct.id] }">
                    {{
                      formatPrice(
                        promotionMap[ct.id]
                          ? ct.giaBan * (1 - promotionMap[ct.id] / 100)
                          : ct.giaBan,
                      )
                    }}
                  </span>
                </div>

                <!-- ⭐ sup tách riêng -->
                <sup v-if="promotionCountMap[ct.id] > 1" class="row-sup">
                  {{ promotionCountMap[ct.id] }}
                </sup>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>

  <!-- MODAL -->
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

        <h3 class="confirm-title">Xác nhận</h3>
        <p class="confirm-desc">Bạn có chắc chắn muốn thêm đợt giảm giá?</p>

        <div class="confirm-actions">
          <button class="btn-cancel" @click="showConfirm = false">Hủy</button>
          <button class="btn-confirm" @click="submit()">Đồng ý</button>
        </div>
      </div>
    </div>
  </transition>

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
</template>

<script setup lang="ts">
import { reactive, ref, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";
import { computed } from "vue";
const allChiTietList = computed(() => {
  return selectedSanPhamIds.value.flatMap((spId) => {
    const sp = sanPhamList.find((s) => s.id === spId);

    return (chiTietMap[spId] || []).map((ct) => {
      return {
        ...ct,
        soLuong: ct.soLuongTon,
        anhHienThi:
          ct.hinhAnhUrls?.length > 0 ? ct.hinhAnhUrls[0] : sp?.hinhAnh,
        tenSp: sp?.tenSp,
        tenLoaiAo: sp?.tenLoaiAo,
        tenKieuDang: sp?.tenKieuDang,
      };
    });
  });
});

const router = useRouter();
const clearFilters = () => {
  variantKeyword.value = "";
  filterMau.value = "";
  filterSize.value = "";
  filterLoai.value = "";
  filterKieu.value = "";
  selectedMaxPrice.value = maxPrice.value;
};

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

const showConfirm = ref(false);
// ===== SEARCH + FILTER =====
const variantKeyword = ref("");

const filterMau = ref("");
const filterSize = ref("");
const filterLoai = ref("");
const filterKieu = ref("");
const mauOptions = computed(() => {
  return [
    ...new Set(
      allChiTietList.value.flatMap(
        (ct) => ct.mauSacList?.map((m: any) => m.tenMauSac) || [],
      ),
    ),
  ];
});

const sizeOptions = computed(() => {
  return [
    ...new Set(allChiTietList.value.flatMap((ct) => ct.kichCoList || [])),
  ];
});

const loaiOptions = computed(() => {
  return [...new Set(allChiTietList.value.map((ct) => ct.tenLoaiAo))];
});

const kieuOptions = computed(() => {
  return [...new Set(allChiTietList.value.map((ct) => ct.tenKieuDang))];
});
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

// 1. Khai báo mảng chứa thông báo
const notifications = ref<{ id: number; message: string; type: string }[]>([]);

// 2. Hàm để đẩy thông báo vào mảng và tự xóa sau 3 giây
const showNotification = (message: string, type = "success") => {
  const id = Date.now();

  notifications.value.push({ id, message, type });

  setTimeout(() => {
    notifications.value = notifications.value.filter((n) => n.id !== id);
  }, 3000);
};

// 3. Sửa lại hàm này để gọi thông báo thay vì hiện modal
const showSuccessModal = () => {
  showNotification("Thêm đợt giảm giá thành công"); // Hoặc "🎉 Thêm thành công"

  // Vẫn giữ logic chuyển trang sau 1.5s nếu cần
  setTimeout(() => {
    router.push("/admin/promotion");
  }, 1500);
};

const onClickSave = () => {
  if (!validate()) return;
  showConfirm.value = true;
};

const validate = () => {
  let valid = true;

  Object.keys(errors).forEach((k) => (errors[k as keyof typeof errors] = ""));

  if (!form.tenDotGiamGia.trim()) {
    errors.tenDotGiamGia = "Tên đợt giảm giá không được để trống";
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
const searchKeyword = ref("");

const filteredSanPhamList = computed(() => {
  if (!searchKeyword.value.trim()) return sanPhamList;

  const kw = searchKeyword.value.toLowerCase();

  return sanPhamList.filter(
    (sp) =>
      sp.maSp?.toLowerCase().includes(kw) ||
      sp.tenSp?.toLowerCase().includes(kw),
  );
});

const sanPhamList = reactive<any[]>([]);

const fetchSanPham = async () => {
  try {
    const res = await axios.get("http://localhost:8080/api/san-pham", {
      params: { page: 0, size: 100 },
    });
    sanPhamList.splice(0, sanPhamList.length, ...res.data.content);
  } catch (e) {
    console.error("Lỗi load sản phẩm", e);
  }
};

const selectedSanPhamIds = ref<number[]>([]);
const chiTietMap = reactive<Record<number, any[]>>({});

const toggleSanPham = async (sp: any) => {
  const index = selectedSanPhamIds.value.indexOf(sp.id);

  if (index !== -1) {
    selectedSanPhamIds.value.splice(index, 1);

    const ctIds = chiTietMap[sp.id]?.map((ct) => ct.id) || [];
    selectedChiTietIds.value = selectedChiTietIds.value.filter(
      (id) => !ctIds.includes(id),
    );

    delete chiTietMap[sp.id];
    return;
  }
  selectedSanPhamIds.value.push(sp.id);

  try {
    const res = await axios.get(`http://localhost:8080/api/san-pham/${sp.id}`);

    const list = res.data.bienTheList || [];

    chiTietMap[sp.id] = list;
  } catch (e) {
    console.error("Lỗi load biến thể", e);
  }
};
const isAllSanPhamSelected = computed(() => {
  return (
    filteredSanPhamList.value.length > 0 &&
    filteredSanPhamList.value.every((sp) =>
      selectedSanPhamIds.value.includes(sp.id),
    )
  );
});
const toggleAllSanPham = async () => {
  if (isAllSanPhamSelected.value) {
    filteredSanPhamList.value.forEach((sp) => {
      const index = selectedSanPhamIds.value.indexOf(sp.id);
      if (index !== -1) selectedSanPhamIds.value.splice(index, 1);

      delete chiTietMap[sp.id];
    });

    selectedChiTietIds.value = selectedChiTietIds.value.filter(
      (id) =>
        !Object.values(chiTietMap)
          .flat()
          .some((ct) => ct.id === id),
    );

    return;
  }

  for (const sp of filteredSanPhamList.value) {
    if (!selectedSanPhamIds.value.includes(sp.id)) {
      selectedSanPhamIds.value.push(sp.id);
    }

    if (!chiTietMap[sp.id]) {
      const res = await axios.get(
        `http://localhost:8080/api/san-pham/${sp.id}`,
      );

      chiTietMap[sp.id] = res.data.bienTheList || [];
    }

    chiTietMap[sp.id].forEach((ct: any) => {
      if (!selectedChiTietIds.value.includes(ct.id)) {
        selectedChiTietIds.value.push(ct.id);
      }
    });
  }
};

const isAllChiTietSelected = (spId: number) => {
  const list = chiTietMap[spId];

  if (!Array.isArray(list) || list.length === 0) return false;

  return list.every((ct) => selectedChiTietIds.value.includes(ct.id));
};

const toggleAllChiTiet = (spId: number) => {
  const list = chiTietMap[spId] || [];

  if (isAllChiTietSelected(spId)) {
    selectedChiTietIds.value = selectedChiTietIds.value.filter(
      (id) => !list.some((ct) => ct.id === id),
    );
    return;
  }

  list.forEach((ct) => {
    if (!selectedChiTietIds.value.includes(ct.id)) {
      selectedChiTietIds.value.push(ct.id);
    }
  });
};

onMounted(() => {
  fetchSanPham();
  fetchPromotions();
});

const submit = async () => {
  if (!validate()) return;

  const payload = {
    ...form,
    chiTietSanPhamIds: selectedChiTietIds.value,
  };

  try {
    await axios.post("http://localhost:8080/api/promotions", payload);
    showSuccessModal();
  } catch (e: any) {
    const msg = e.response?.data?.message || "Tên đợt giảm giá đã tồn tại";

    showNotification(msg, "error");
  }
};

const selectedChiTietIds = ref<number[]>([]);

const toggleChiTiet = (ctId: number) => {
  const index = selectedChiTietIds.value.indexOf(ctId);

  if (index !== -1) {
    selectedChiTietIds.value.splice(index, 1);
  } else {
    selectedChiTietIds.value.push(ctId);
  }
};
const formatPrice = (price: number) => {
  if (!price) return "0";
  return price.toLocaleString("vi-VN") + " ₫";
};

const getDiscountPrice = (price: number) => {
  if (!price) return 0;

  const percent = form.giaTriGiam || 0;
  return Math.round(price * (1 - percent / 100));
};

const isAllChiTietSelectedAll = computed(() => {
  return (
    allChiTietList.value.length > 0 &&
    allChiTietList.value.every((ct) => selectedChiTietIds.value.includes(ct.id))
  );
});

const toggleAllChiTietAll = () => {
  if (isAllChiTietSelectedAll.value) {
    selectedChiTietIds.value = [];
  } else {
    selectedChiTietIds.value = allChiTietList.value.map((ct) => ct.id);
  }
};
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

const back = () => router.push("/admin/promotion");
</script>

<style scoped>
.promotion-layout {
  display: flex;
  gap: 20px;
}
.left-panel {
  width: 40%;
}
.right-panel {
  width: 60%;
}

.panel {
  height: 480px;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 20px;
  padding: 20px;
  display: flex;
  flex-direction: column; /* 🔥 rất quan trọng */
  margin-bottom: 20px;
}
.panel-card {
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 20px;
  padding: 20px;

  display: flex;
  flex-direction: column; /* 🔥 rất quan trọng */
}
.panel-title {
  font-weight: 700;
  font-size: 25px;
  margin-bottom: 15px;
  margin-top: 1px;
}

.form-group {
  margin-bottom: 12px;
}
.form-group input {
  width: 95%;
  height: 30px;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 10px;
  margin-top: 15px;
}
.form-group small {
  color: red;
}

.input-percent {
  display: flex;
}
.input-percent span {
  padding: 8px 12px;
  background: #eee;
  border: 1px solid #ccc;
  border-left: none;
}
.percent-wrapper {
  position: relative;
  width: 100%;
  margin-top: 1px;
}

.percent-input {
  width: 100%;
  height: 30px;
  padding-right: 30px;
  padding-left: 8px;
  border: 1px solid #ccc;
  border-radius: 10px;
}

.percent-symbol {
  position: absolute;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  color: #666;
  font-weight: 600;
  pointer-events: none;
  margin-top: 8px;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.btn-primary {
  width: 100px;
  height: 40px;
  background: #63391f;
  color: #fff;
  border: none;
  padding: 8px 16px;
  border-radius: 10px;
  margin-top: 1px;
}
.btn-secondary {
  width: 100px;
  height: 40px;
  background: #888;
  color: #fff;
  border: none;
  padding: 8px 16px;
  border-radius: 10px;
  margin-top: 1px;
}
.table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
}

.table thead {
  display: table;
  width: 100%;
  table-layout: auto;
}

.table tbody {
  display: block;
  max-height: 300px;
  overflow-y: auto;
}

.table tbody tr {
  display: table;
  width: 100%;
  table-layout: auto;
}
.table thead th {
  position: sticky;
  top: 0;
  background: #fff;
  z-index: 5;
}
.table td:nth-child(4) {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
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

.table-wrapper::before {
  content: "";
  position: sticky;
  top: 0;
  display: block;
  height: 0;
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.45);
  z-index: 20;
}

.table th:first-child,
.table td:first-child {
  width: 70px;
  text-align: center;
  vertical-align: middle;
}
.table thead th:first-child {
  border-top-left-radius: 16px;
}

.table thead th:last-child {
  border-top-right-radius: 16px;
}

.table th:nth-child(2),
.table td:nth-child(2) {
  width: 60px;
} /* STT */
.table th:last-child,
.table td:last-child {
  width: 100px;
} /* Ảnh */

th,
td {
  padding: 12px 8px;
  text-align: center;
  vertical-align: middle;
  border-bottom: 1px solid #eee;
}
.table thead th {
  white-space: nowrap;
}
.btn-icon {
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50% !important;
  border: 1px solid #ccc;
}

.btn-icon.active {
  background: #63391f !important;
  border-color: #63391f !important;
  color: #fff !important;
}

.btn-icon:hover {
  border-color: #63391f;
  box-shadow: 0 0 5px rgba(99, 57, 31, 0.3);
}
.search-input {
  width: 98%;
  height: 30px;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 10px;
  margin-top: 5px;
  margin-bottom: 10px;
  outline: none;
  font-size: 14px;
}

.search-input:focus {
  border-color: #63391f;
  box-shadow: 0 0 0 2px rgba(99, 57, 31, 0.15);
}
.price-box {
  display: flex;
  flex-direction: column;
  line-height: 1.2;
}

.old-price {
  text-decoration: line-through;
  color: #999;
  font-size: 12px;
}

.new-price {
  color: #e53935;
  font-weight: 600;
}

img {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
}

th {
  color: #000000;
  text-align: center;
  vertical-align: middle;
}
.badge {
  padding: 4px 8px;
  border-radius: 12px;
  color: #000000;
  font-size: 12px;
}

.me-1 {
  margin-right: 4px;
}

.btn {
  padding: 6px 10px;
  border-radius: 4px;
  border: 1px solid #aaa;
}
.btn-success {
  background: #28a745;
  color: #fff;
  border-color: #28a745;
}
.btn-outline-secondary {
  background: #fff;
  color: #333;
}

/* ===== MODAL CONFIRM NEW ===== */
.modal-confirm {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);

  display: flex;
  justify-content: center;
  align-items: center;

  z-index: 9999;
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

  animation: zoomIn 0.25s ease-out;
}

.confirm-icon-wrapper {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background-color: #e8f5e9;
  color: #22c55e;

  margin: 0 auto 15px;

  display: flex;
  align-items: center;
  justify-content: center;
}

.confirm-title {
  color: #63391f;
  font-size: 20px;
  margin-bottom: 10px;
}

.confirm-desc {
  color: #666;
  margin-bottom: 25px;
}

.confirm-actions {
  display: flex;
  gap: 20px;
}

.btn-confirm {
  flex: 1;
  height: 42px;
  border-radius: 10px;
  border: none;

  background: #63391f;
  color: white;
  font-weight: 600;
  cursor: pointer;
}

.btn-confirm:hover {
  background: #4e2c17;
}

.btn-cancel {
  flex: 1;
  height: 42px;
  border-radius: 10px;
  border: none;

  background: #f3f4f6;
  font-weight: 600;
  cursor: pointer;
}

.btn-cancel:hover {
  background: #e5e7eb;
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

.fade-modal-enter-active,
.fade-modal-leave-active {
  transition: opacity 0.2s;
}

.fade-modal-enter-from,
.fade-modal-leave-to {
  opacity: 0;
}

.success {
  color: #28a745;
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
.toast {
  min-width: 300px;
  padding: 16px 24px;
  border-radius: 8px;
  background-color: #dcfce7;
  color: #166534;
  font-size: 16px;
  font-weight: 500;
  border-left: 6px solid #22c55e;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  animation: slideIn 0.3s ease-out;
}
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
.toast.error {
  background-color: #fee2e2;
  color: #991b1b;
  border-left: 6px solid #ef4444;
}

.table thead th {
  color: #000000 !important;
}
/* ===== TABLE BIẾN THỂ ===== */
.variant {
  width: 100%;
  border-collapse: separate; /* 🔥 để bo góc được */
  border-spacing: 0;
  table-layout: auto;

  border-radius: 16px; /* ✅ bo góc */
  overflow: hidden; /* ✅ cắt góc thead */
  background: #fff;
}

.variant th,
.variant td {
  padding: 10px 8px;
  text-align: center;
  vertical-align: middle;
  white-space: nowrap;

  border-bottom: 1px solid #eee; /* line giữa các row */
}

/* bỏ line dưới cùng */
.variant tbody tr:last-child td {
  border-bottom: none;
}

/* cột mã cho phép wrap */
.variant td:nth-child(2) {
  white-space: normal;
}

/* thead */

.variant thead th {
  color: #000000;
  font-weight: 600;
}

/* bo góc trên cho thead */
.variant thead th:first-child {
  border-top-left-radius: 16px;
}

.variant thead th:last-child {
  border-top-right-radius: 16px;
}
/* ===== ONLY FILTER STYLE (keep search as is) ===== */

.variant-toolbar {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 20px;
}

/* select đẹp hơn */
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

.variant-toolbar select:hover {
  border-color: #63391f;
}

.variant-toolbar select:focus {
  border-color: #63391f;
  box-shadow: 0 0 0 2px rgba(99, 57, 31, 0.12);
}

/* nút clear nhìn như action button */
.img-wrapper {
  position: relative;
  width: fit-content;
}

.variant-img {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 6px;
}

/* badge giảm giá */
.discount-badge {
  position: absolute;
  top: -6px;
  left: -6px;

  background: #e53935;
  color: white;

  font-size: 11px;
  font-weight: 600;

  padding: 3px 6px;
  border-radius: 6px;

  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.25);
}
.price-cell {
  position: relative;
}

.row-sup {
  position: absolute;
  top: 6px;
  right: 6px;

  font-size: 10px;
  color: #999;
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
</style>
