<template>
  <div class="row g-3">
    <div class="col-md-5">
      <div class="card panel h-100">
        <div class="card-body">
          <h5 class="fw-bold text-uppercase mb-4">Chỉnh sửa đợt giảm giá</h5>

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
                  <th style="width: 60px">Chọn</th>
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
                  <td colspan="5" class="text-center text-muted">
                    Không có sản phẩm
                  </td>
                </tr>
              </tbody>
            </table>
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
                  <th style="width: 60px">Chọn</th>
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
                  <td>{{ ct.idMauSac?.tenMauSac }}</td>
                  <td>{{ ct.idKichCo?.tenKichCo }}</td>
                  <td>{{ ct.idLoaiAo?.tenLoai }}</td>
                  <td>{{ ct.idKieuDang?.tenKieuDang }}</td>
                </tr>
              </tbody>
            </table>
          </div>
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
        <p>Bạn có chắc chắn muốn cập nhật đợt giảm giá này không?</p>
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
        <h5 class="text-success mb-2">🎉 Cập nhật thành công</h5>
        <p>Đợt giảm giá đã được cập nhật</p>
      </div>
    </div>
  </div>
</div>

<div class="modal-backdrop fade show" v-if="showConfirm || showSuccess"></div>

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
  try {
    const res = await axios.get(
      `http://localhost:8080/api/chi-tiet-san-pham/san-pham/${spId}`,
    );
    chiTietMap[spId] = res.data;
  } catch (e) {
    console.error("Lỗi tải chi tiết sản phẩm", e);
  }
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
    const spIds = new Set<number>();

    for (const ctId of selectedChiTietIds.value) {
      const resCt = await axios.get(
        `http://localhost:8080/api/chi-tiet-san-pham/${ctId}`,
      );
      const spId = resCt.data.idSanPham.id;

      spIds.add(spId);

      await fetchChiTietBySpId(spId);
    }

    selectedSanPhamIds.value = Array.from(spIds);
  } catch (e) {
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

    await axios.put(
      `http://localhost:8080/api/promotions/${id}`,
      payload
    );

    showSuccessModal();
  } catch (e) {
    alert("Lỗi cập nhật đợt giảm giá");
  }
};

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
</style>
