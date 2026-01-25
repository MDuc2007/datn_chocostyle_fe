<template>
  <div class="layout">
    <!-- LEFT -->
    <div class="left">
      <div class="card">
        <h5 class="title">Chỉnh sửa đợt giảm giá</h5>

        <div class="form">
          <div class="field">
            <label>Tên đợt giảm giá</label>
            <input v-model="form.tenDotGiamGia" />
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
            <input v-model="form.ngayBatDau" type="date" />
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

    <!-- RIGHT -->
    <div class="right">
      <div class="card">
        <h5 class="title">Danh sách sản phẩm</h5>

        <small v-if="errors.chiTiet" class="error block">
          {{ errors.chiTiet }}
        </small>

        <div class="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Chọn</th>
                <th>STT</th>
                <th>Mã SP</th>
                <th>Tên sản phẩm</th>
                <th>Ảnh</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(sp, index) in sanPhamList" :key="sp.id">
                <td>
                  <button
                    class="btn-icon"
                    :class="{ active: selectedSanPhamIds.includes(sp.id) }"
                    @click="toggleSanPham(sp)"
                  >
                    {{ selectedSanPhamIds.includes(sp.id) ? "✓" : "+" }}
                  </button>
                </td>
                <td>{{ index + 1 }}</td>
                <td>{{ sp.maSp }}</td>
                <td>{{ sp.tenSp }}</td>
                <td>
                  <img :src="sp.hinhAnh" />
                </td>
              </tr>

              <tr v-if="sanPhamList.length === 0">
                <td colspan="5" class="empty">Không có sản phẩm</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- VARIANTS -->
    <div v-for="spId in selectedSanPhamIds" :key="spId" class="full">
      <div class="card">
        <h5 class="subtitle">
          Biến thể:
          {{ sanPhamList.find((sp) => sp.id === spId)?.tenSp }}
        </h5>

        <table>
          <thead>
            <tr>
              <th>Chọn</th>
              <th>Mã CTSP</th>
              <th>Màu sắc</th>
              <th>Kích cỡ</th>
              <th>Loại áo</th>
              <th>Kiểu dáng</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="ct in chiTietMap[spId] || []" :key="ct.id">
              <td>
                <button
                  class="btn-icon"
                  :class="{ active: selectedChiTietIds.includes(ct.id) }"
                  @click="toggleChiTiet(ct.id)"
                >
                  {{ selectedChiTietIds.includes(ct.id) ? "✓" : "+" }}
                </button>
              </td>

              <td>{{ ct.maChiTietSanPham }}</td>

              <td>
                {{
                  ct.mauSacList
                    ?.map((ms: { tenMauSac: string }) => ms.tenMauSac)
                    .join(", ")
                }}
              </td>

              <td>
                {{ ct.kichCoList?.join(", ") }}
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

    <!-- MODALS -->
    <div v-if="showConfirm" class="modal">
      <div class="modal-box">
        <h4>Xác nhận</h4>
        <p>Bạn có chắc chắn muốn cập nhật?</p>
        <div class="actions">
          <button class="btn cancel" @click="showConfirm = false">Hủy</button>
          <button class="btn primary" @click="submit">Xác nhận</button>
        </div>
      </div>
    </div>

    <div v-if="showSuccess" class="modal">
      <div class="modal-box center">
        <h4 class="success">🎉 Cập nhật thành công</h4>
        <p>Đợt giảm giá đã được cập nhật</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import axios from "axios";

const router = useRouter();
const route = useRoute();
const id = route.params.id;

const sanPhamList = ref<any[]>([]);
const selectedSanPhamIds = ref<number[]>([]);
const selectedChiTietIds = ref<number[]>([]);
const chiTietMap = reactive<Record<number, any[]>>({});

const form = reactive({
  tenDotGiamGia: "",
  giaTriGiam: 1,
  ngayBatDau: "",
  ngayKetThuc: "",
  chiTietSanPhamIds: [] as number[],
});

const showConfirm = ref(false);
const showSuccess = ref(false);

const onClickSave = () => {
  if (!validate()) return;
  showConfirm.value = true;
};

const showSuccessModal = () => {
  showSuccess.value = true;
  setTimeout(() => {
    showSuccess.value = false;
    back();
  }, 1500);
};

const errors = reactive({
  tenDotGiamGia: "",
  giaTriGiam: "",
  ngayBatDau: "",
  ngayKetThuc: "",
  chiTiet: "",
});

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

  const res = await axios.get(`http://localhost:8080/api/san-pham/${spId}`);

  chiTietMap[spId] = (res.data.bienTheList || []).map((ct: any) => ({
    ...ct,
    id: Number(ct.id), // 🔥 ÉP ID VỀ NUMBER
  }));
};

onMounted(async () => {
  await fetchSanPham();

  try {
    const res = await axios.get(`http://localhost:8080/api/promotions/${id}`);
    const data = res.data;

    form.tenDotGiamGia = data.tenDotGiamGia;
    form.giaTriGiam = data.giaTriGiam;
    form.ngayBatDau = data.ngayBatDau;
    form.ngayKetThuc = data.ngayKetThuc;
    selectedChiTietIds.value = data.chiTietSanPhamIds || [];
    selectedSanPhamIds.value =
      data.sanPhamApDung?.map((sp: any) => sp.idSp) || [];
    selectedSanPhamIds.value =
      data.sanPhamApDung?.map((sp: any) => sp.idSp) || [];

    selectedChiTietIds.value = data.chiTietSanPhamIds || [];

    // load biến thể theo SP
    for (const spId of selectedSanPhamIds.value) {
      await fetchChiTietBySpId(spId);
    }
  } catch (e) {
    console.error(e);
    alert("Không tìm thấy thông tin đợt giảm giá");
  }
});

const toggleSanPham = async (sp: any) => {
  const index = selectedSanPhamIds.value.indexOf(sp.id);
  if (index === -1) {
    selectedSanPhamIds.value.push(sp.id);
    await fetchChiTietBySpId(sp.id);
  } else {
    selectedSanPhamIds.value.splice(index, 1);
    const cts = chiTietMap[sp.id] || [];
    const ctIds = cts.map((c) => c.id);
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

const back = () => router.push("/admin/promotion");

const submit = async () => {
  if (!validate()) return;

  try {
    const payload = {
      ...form,
      chiTietSanPhamIds: selectedChiTietIds.value,
    };

    await axios.put(`http://localhost:8080/api/promotions/${id}`, payload);

    showSuccessModal();
  } catch (e) {
    alert("Lỗi cập nhật đợt giảm giá");
  }
};
</script>

<style scoped>
/* === LAYOUT === */
.layout {
  display: grid;
  grid-template-columns: 5fr 7fr;
  gap: 16px;
}

/* full row (variant) */
.full {
  grid-column: 1 / -1;
  margin-top: 16px;
}

/* === CARD === */
.card {
  background: #fff;
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  padding: 16px;
}

/* === TITLE === */
.title {
  font-weight: 600;
  margin-bottom: 16px;
  text-transform: uppercase;
}

.subtitle {
  font-weight: 600;
  margin-bottom: 12px;
}

/* === FORM === */
.form {
  display: grid;
  gap: 14px;
}

.field label {
  display: block;
  margin-bottom: 4px;
  font-weight: 500;
}

.field input {
  width: 95%;
  padding: 6px 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

/* === INPUT GROUP === */
.input-group {
  display: flex;
}

.input-group input {
  border-right: none;
  border-radius: 4px 0 0 4px;
}

.input-group span {
  padding: 6px 10px;
  background: #eee;
  border: 1px solid #ccc;
  border-left: none;
  border-radius: 0 4px 4px 0;
}

/* === ACTIONS === */
.actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

/* === BUTTON === */
.btn {
  padding: 6px 14px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
}

.btn.primary {
  background: #6f4e37;
  color: #fff;
}

.btn.cancel {
  background: #ccc;
}

/* === ICON BUTTON === */
.btn-icon {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 1px solid #999;
  background: #fff;
  cursor: pointer;
}

.btn-icon.active {
  background: #63391f;
  color: #fff;
  border-color: #63391f;
}

/* === TABLE === */
.table-wrapper {
  max-height: 520px;
  overflow-y: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th {
  background: #63391f;
  color: #fff;
}

th,
td {
  padding: 8px;
  text-align: center;
  border-bottom: 1px solid #ddd;
}

/* === IMAGE === */
img {
  width: 60px;
  height: 60px;
  object-fit: cover;
}

/* === ERROR === */
.error {
  color: #e74c3c;
  font-size: 13px;
}

.block {
  display: block;
}

.empty {
  color: #888;
}

.modal {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-box {
  background: #fff;
  padding: 20px;
  border-radius: 6px;
  width: 320px;
}

.modal-box.center {
  text-align: center;
}

.success {
  color: #198754;
}
</style>
