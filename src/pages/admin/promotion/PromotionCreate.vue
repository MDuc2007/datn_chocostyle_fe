<template>
  <div class="promotion-layout">
    <!-- LEFT -->
    <div class="left-panel">
      <div class="panel">
        <h5 class="panel-title">Thêm đợt giảm giá</h5>

        <div class="form-group">
          <label>Tên đợt giảm giá</label>
          <input v-model="form.tenDotGiamGia" />
          <small v-if="errors.tenDotGiamGia">{{ errors.tenDotGiamGia }}</small>
        </div>

        <div class="form-group">
          <label>Giá trị giảm (%)</label>
          <div class="input-percent">
            <input
              type="number"
              v-model.number="form.giaTriGiam"
              min="1"
              max="100"
            />
            <span>%</span>
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
        <small v-if="errors.chiTiet" class="error">{{ errors.chiTiet }}</small>

        <div class="table-wrapper">
          <table class="table">
            <thead class="table-light">
              <tr>
                <th>
                  <button class="btn-icon" @click="toggleAllSanPham">
                    {{ isAllSanPhamSelected ? "✓" : "+" }}
                  </button>
                </th>
                <th>STT</th>
                <th>Mã SP</th>
                <th>Tên sản phẩm</th>
                <th>Ảnh</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(sp, i) in sanPhamList" :key="sp.id">
                <td>
                  <button
                    class="btn-icon"
                    :class="{ active: selectedSanPhamIds.includes(sp.id) }"
                    @click="toggleSanPham(sp)"
                  >
                    {{ selectedSanPhamIds.includes(sp.id) ? "✓" : "+" }}
                  </button>
                </td>
                <td>{{ i + 1 }}</td>
                <td>{{ sp.maSp }}</td>
                <td>{{ sp.tenSp }}</td>
                <td><img :src="sp.hinhAnh" /></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>

  <!-- BIẾN THỂ -->
  <div v-for="spId in selectedSanPhamIds" :key="spId" class="col-12">
    <div class="panel card">
      <div class="card-body">
        <h5 class="panel-title">
          Biến thể của sản phẩm:
          {{ sanPhamList.find((sp) => sp.id === spId)?.tenSp }}
        </h5>

        <div class="table-responsive">
          <table class="table table-bordered align-middle">
            <thead class="table-light">
              <tr>
                <th>
                  <button
                    class="btn btn-sm"
                    :class="
                      isAllChiTietSelected(spId)
                        ? 'btn-success'
                        : 'btn-outline-secondary'
                    "
                    @click="toggleAllChiTiet(spId)"
                  >
                    {{ isAllChiTietSelected(spId) ? "✓" : "+" }}
                  </button>
                </th>
                <th>Mã CTSP</th>
                <th>Màu sắc</th>
                <th>Kích cỡ</th>
                <th>Loại áo</th>
                <th>Kiểu dáng</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="ct in chiTietMap[spId]" :key="ct.id">
                <td>
                  <button
                    class="btn btn-sm"
                    :class="
                      selectedChiTietIds.includes(ct.id)
                        ? 'btn-success'
                        : 'btn-outline-secondary'
                    "
                    @click="toggleChiTiet(ct.id)"
                  >
                    {{ selectedChiTietIds.includes(ct.id) ? "✓" : "+" }}
                  </button>
                </td>
                <td>{{ ct.maChiTietSanPham }}</td>
                <td>
                  <span
                    v-for="(m, i) in ct.mauSacList"
                    :key="i"
                    class="badge me-1"
                    :style="{ backgroundColor: m.rgb }"
                  >
                    {{ m.tenMauSac }}
                  </span>
                </td>
                <td>
                  <span
                    v-for="(k, i) in ct.kichCoList"
                    :key="i"
                    class="badge bg-secondary me-1"
                  >
                    {{ k }}
                  </span>
                </td>
                <td>
                  {{ sanPhamList.find((sp) => sp.id === spId)?.tenLoaiAo }}
                </td>
                <td>
                  {{ sanPhamList.find((sp) => sp.id === spId)?.tenKieuDang }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>

  <!-- MODAL -->
  <div v-if="showConfirm" class="modal">
    <div class="modal-content">
      <h4>Xác nhận</h4>
      <p>Bạn có chắc chắn muốn thêm đợt giảm giá?</p>
      <div class="modal-footer">
        <button class="btn-secondary" @click="showConfirm = false">Hủy</button>
        <button class="btn-primary" @click="submit()">Xác nhận</button>
      </div>
    </div>
  </div>

  <div v-if="showSuccess" class="modal">
    <div class="modal-content">
      <h4 class="success">🎉 Thêm thành công</h4>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";
import { computed } from "vue";
// import "bootstrap/dist/css/bootstrap.css";
// import "bootstrap-vue/dist/bootstrap-vue.css";
const router = useRouter();

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
const showSuccess = ref(false);

const showSuccessModal = () => {
  showSuccess.value = true;
  setTimeout(() => {
    showSuccess.value = false;
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
    sanPhamList.length > 0 &&
    selectedSanPhamIds.value.length === sanPhamList.length
  );
});
const toggleAllSanPham = async () => {
  if (isAllSanPhamSelected.value) {
    selectedSanPhamIds.value = [];
    selectedChiTietIds.value = [];
    Object.keys(chiTietMap).forEach((k) => delete chiTietMap[+k]);
    return;
  }

  selectedSanPhamIds.value = sanPhamList.map((sp) => sp.id);
  selectedChiTietIds.value = [];
  Object.keys(chiTietMap).forEach((k) => delete chiTietMap[+k]);

  for (const sp of sanPhamList) {
    try {
      const res = await axios.get(
        `http://localhost:8080/api/san-pham/${sp.id}`,
      );

      const list = res.data.bienTheList || [];

      chiTietMap[sp.id] = list;

      list.forEach((ct: any) => {
        if (!selectedChiTietIds.value.includes(ct.id)) {
          selectedChiTietIds.value.push(ct.id);
        }
      });
    } catch (e) {
      console.error("Lỗi load CTSP", e);
    }
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

onMounted(fetchSanPham);

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
    alert(JSON.stringify(e.response?.data));
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

const back = () => router.push("/admin/promotion");
</script>

<style scoped>
.promotion-layout {
  display: flex;
  gap: 20px;
}
.left-panel {
  width: 35%;
}
.right-panel {
  width: 65%;
}

.panel {
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 20px;
}
.panel-title {
  font-weight: 700;
  margin-bottom: 15px;
}

.form-group {
  margin-bottom: 12px;
}
.form-group input {
  width: 95%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
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

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.btn-primary {
  background: #6f4e37;
  color: #fff;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
}
.btn-secondary {
  background: #888;
  color: #fff;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
}

.table {
  width: 100%;
  border-collapse: collapse;
  text-align: center;
}
.table th,
.table td {
  padding: 10px;
  border-bottom: 1px solid #ddd;
}
.table-light {
  background: #f5f5f5;
}
.table-bordered th,
.table-bordered td {
  border: 1px solid #ddd;
}

img {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
}

.btn-icon {
  width: 28px;
  height: 28px;
  border: 1px solid #aaa;
  background: #fff;
  border-radius: 4px;
}
.btn-icon.active {
  background: #28a745;
  color: #fff;
}

.badge {
  padding: 4px 8px;
  border-radius: 12px;
  color: #fff;
  font-size: 12px;
}
.bg-secondary {
  background: #6c757d;
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

.modal {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
}
.modal-content {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  width: 350px;
}
.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
.success {
  color: #28a745;
}
</style>
