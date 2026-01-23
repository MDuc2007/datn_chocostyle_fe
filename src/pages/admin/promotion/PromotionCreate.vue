<template>
  <div class="row g-3">
    <div class="col-md-5">
      <div class="card panel h-100">
        <div class="card-body">
          <h5 class="fw-bold text-uppercase mb-4">Thêm đợt giảm giá</h5>

          <div class="row g-3">
            <div class="col-12">
              <label class="form-label">Tên đợt giảm giá</label>
              <input v-model="form.tenDotGiamGia" class="form-control" />
              <small v-if="errors.tenDotGiamGia" class="text-danger">
                {{ errors.tenDotGiamGia }}
              </small>
            </div>

            <div class="col-12">
              <label class="form-label">Giá trị giảm (%)</label>
              <div class="input-group">
                <input
                  v-model.number="form.giaTriGiam"
                  type="number"
                  class="form-control"
                  min="1"
                  max="100"
                />
                <span class="input-group-text">%</span>
              </div>
              <small v-if="errors.giaTriGiam" class="text-danger">
                {{ errors.giaTriGiam }}
              </small>
            </div>

            <div class="col-12">
              <label class="form-label">Ngày bắt đầu</label>
              <input
                v-model="form.ngayBatDau"
                type="date"
                class="form-control"
              />
              <small v-if="errors.ngayBatDau" class="text-danger">
                {{ errors.ngayBatDau }}
              </small>
            </div>

            <div class="col-12">
              <label class="form-label">Ngày kết thúc</label>
              <input
                v-model="form.ngayKetThuc"
                type="date"
                class="form-control"
                :min="form.ngayBatDau"
              />
              <small v-if="errors.ngayKetThuc" class="text-danger">
                {{ errors.ngayKetThuc }}
              </small>
            </div>
          </div>

          <div class="mt-4 d-flex justify-content-end gap-2">
            <button class="btn btn-secondary" @click="back">Hủy</button>
            <button class="btn btn-brown" @click="onClickSave">Lưu</button>
          </div>
        </div>
      </div>
    </div>

    <div class="col-md-7">
      <div class="card panel h-100">
        <div class="card-body">
          <h5 class="fw-bold text-uppercase mb-3">Danh sách sản phẩm</h5>
          <small v-if="errors.chiTiet" class="text-danger d-block mb-2">
            {{ errors.chiTiet }}
          </small>
          <div
            class="table-responsive"
            style="max-height: 520px; overflow-y: auto"
          >
            <table class="table table-hover align-middle">
              <thead class="table-light">
                <tr>
                  <th style="width: 60px">
                    <button
                      class="btn btn-sm"
                      :class="
                        isAllSanPhamSelected
                          ? 'btn-success'
                          : 'btn-outline-secondary'
                      "
                      @click="toggleAllSanPham"
                    >
                      {{ isAllSanPhamSelected ? "✓" : "+" }}
                    </button>
                  </th>

                  <th style="width: 60px">STT</th>
                  <th>Mã SP</th>
                  <th>Tên sản phẩm</th>
                  <th style="width: 90px">Ảnh</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(sp, index) in sanPhamList" :key="sp.id">
                  <td>
                    <button
                      class="btn btn-sm"
                      :class="
                        selectedSanPhamIds.includes(sp.id)
                          ? 'btn-success'
                          : 'btn-outline-secondary'
                      "
                      @click="toggleSanPham(sp)"
                    >
                      {{ selectedSanPhamIds.includes(sp.id) ? "✓" : "+" }}
                    </button>
                  </td>
                  <td>{{ index + 1 }}</td>
                  <td>{{ sp.maSp }}</td>
                  <td>{{ sp.tenSp }}</td>
                  <td>
                    <img
                      :src="sp.hinhAnh"
                      style="width: 60px; height: 60px; object-fit: cover"
                    />
                  </td>
                </tr>

                <tr v-if="sanPhamList.length === 0">
                  <td colspan="4" class="text-center text-muted">
                    Không có sản phẩm
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div v-for="spId in selectedSanPhamIds" :key="spId" class="col-12">
    <div class="card panel">
      <div class="card-body">
        <h5 class="fw-bold mb-3">
          Biến thể của sản phẩm:
          {{ sanPhamList.find((sp) => sp.id === spId)?.tenSp }}
        </h5>

        <div class="table-responsive">
          <table class="table table-bordered align-middle">
            <thead class="table-light">
              <tr>
                <th style="width: 60px">
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
                    v-for="(mau, i) in ct.mauSacList"
                    :key="i"
                    class="badge me-1"
                    :style="{ backgroundColor: mau.rgb }"
                  >
                    {{ mau.tenMauSac }}
                  </span>
                </td>
                <td>
                  <span
                    v-for="(kc, i) in ct.kichCoList"
                    :key="i"
                    class="badge bg-secondary me-1"
                  >
                    {{ kc }}
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
  <div v-if="showConfirm" class="modal fade show d-block" tabindex="-1">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Xác nhận</h5>
          <button
            type="button"
            class="btn-close"
            @click="showConfirm = false"
          ></button>
        </div>
        <div class="modal-body">
          <p>Bạn có chắc chắn muốn thêm đợt giảm giá này không?</p>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="showConfirm = false">
            Hủy
          </button>
          <button
            class="btn btn-brown"
            @click="
              showConfirm = false;
              submit();
            "
          >
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  </div>
  <div v-if="showSuccess" class="modal fade show d-block" tabindex="-1">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content text-center">
        <div class="modal-body">
          <h5 class="text-success mb-2">🎉 Thêm thành công</h5>
          <p>Đợt giảm giá đã được tạo</p>
        </div>
      </div>
    </div>
  </div>
  <div class="modal-backdrop fade show" v-if="showSuccess"></div>

  <div class="modal-backdrop fade show" v-if="showConfirm"></div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";
import { computed } from "vue";
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
.btn-brown {
  background-color: #6f4e37;
  color: #fff;
  border: none;
}

.btn-brown:hover {
  background-color: #5c3f2c;
}
.table-header th {
  background-color: #63391f;
  color: #fff;
  border: none;
}
</style>
