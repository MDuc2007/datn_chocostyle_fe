<template>
  <div class="container">
    <h2 class="title">THÊM SẢN PHẨM</h2>

    <div class="form-wrapper">
      <div class="left">
        <h4>Thông tin cơ bản:</h4>

        <div class="row">
          <div class="col">
            <label>Tên sản phẩm:</label>
            <input
              v-model="tenSanPham"
              type="text"
              placeholder="Nhập tên sản phẩm"
            />
          </div>

          <!-- Xuất xứ -->
          <div class="col">
            <label>Xuất xứ:</label>
            <div class="select-box">
              <select v-model="selectedXuatXu">
                <option value="">Chọn xuất xứ</option>
                <option
                  v-for="item in xuatXuList"
                  :key="item.id"
                  :value="item.id"
                >
                  {{ item.tenXuatXu }}
                </option>
              </select>
              <button
                type="button"
                class="add-btn"
                @click="openModal('xuat-xu')"
              >
                <img src="/src/assets/icon/plus.svg" />
              </button>
            </div>
          </div>

          <!-- Loại áo -->
          <div class="col">
            <label>Loại áo:</label>
            <div class="select-box">
              <select v-model="selectedLoaiAo">
                <option value="">Chọn loại áo</option>
                <option
                  v-for="item in loaiAoList"
                  :key="item.id"
                  :value="item.id"
                >
                  {{ item.tenLoai }}
                </option>
              </select>
              <button
                type="button"
                class="add-btn"
                @click="openModal('loai-ao')"
              >
                <img src="/src/assets/icon/plus.svg" />
              </button>
            </div>
          </div>

          <!-- Kiểu dáng -->
          <div class="col">
            <label>Kiểu dáng:</label>
            <div class="select-box">
              <select v-model="selectedKieuDang">
                <option value="">Chọn kiểu dáng</option>
                <option
                  v-for="item in kieuDangList"
                  :key="item.id"
                  :value="item.id"
                >
                  {{ item.tenKieuDang }}
                </option>
              </select>
              <button
                type="button"
                class="add-btn"
                @click="openModal('kieu-dang')"
              >
                <img src="/src/assets/icon/plus.svg" />
              </button>
            </div>
          </div>

          <!-- Phong cách -->
          <div class="col">
            <label>Phong cách mặc:</label>
            <div class="select-box">
              <select v-model="selectedPhongCach">
                <option value="">Chọn phong cách</option>
                <option
                  v-for="item in phongCachList"
                  :key="item.id"
                  :value="item.id"
                >
                  {{ item.tenPhongCach }}
                </option>
              </select>
              <button
                type="button"
                class="add-btn"
                @click="openModal('phong-cach-mac')"
              >
                <img src="/src/assets/icon/plus.svg" />
              </button>
            </div>
          </div>

          <!-- Chất liệu -->
          <div class="col">
            <label>Chất liệu:</label>
            <div class="select-box">
              <select v-model="selectedChatLieu">
                <option value="">Chọn chất liệu</option>
                <option
                  v-for="item in chatLieuList"
                  :key="item.id"
                  :value="item.id"
                >
                  {{ item.tenChatLieu }}
                </option>
              </select>
              <button
                type="button"
                class="add-btn"
                @click="openModal('chat-lieu')"
              >
                <img src="/src/assets/icon/plus.svg" />
              </button>
            </div>
          </div>

          <!-- Màu sắc -->
          <div class="col">
            <label>Màu sắc:</label>
            <div class="select-box">
              <select v-model="selectedMauSac">
                <option value="">Chọn màu sắc</option>
                <option
                  v-for="item in mauSacList"
                  :key="item.id"
                  :value="item.id"
                >
                  {{ item.tenMauSac }}
                </option>
              </select>
              <button
                type="button"
                class="add-btn"
                @click="openModal('mau-sac')"
              >
                <img src="/src/assets/icon/plus.svg" />
              </button>
            </div>
          </div>

          <!-- Kích cỡ -->
          <div class="col">
            <label>Kích cỡ:</label>
            <div class="select-box">
              <select v-model="selectedKichCo">
                <option value="">Chọn kích cỡ</option>
                <option
                  v-for="item in kichCoList"
                  :key="item.id"
                  :value="item.id"
                >
                  {{ item.tenKichCo }}
                </option>
              </select>
              <button
                type="button"
                class="add-btn"
                @click="openModal('kich-co')"
              >
                <img src="/src/assets/icon/plus.svg" />
              </button>
            </div>
          </div>
        </div>

        <div class="col full">
          <label>Mô tả sản phẩm:</label>
          <textarea
            v-model="moTa"
            placeholder="Nhập thông tin mô tả"
          ></textarea>
        </div>
      </div>

      <div class="right">
        <div class="image-box" @click="triggerUpload">
          <img v-if="imageUrl" :src="imageUrl" />
          <div v-else class="plus">+</div>
          <input
            ref="fileInput"
            type="file"
            hidden
            accept="image/*"
            @change="onFileChange"
          />
        </div>
      </div>
    </div>
    <button
      style="margin-top: 10px"
      class="save-btn"
      @click="handleCreateVariant"
    >
      Tạo biến thể
    </button>
    <div v-if="showBienThe" class="variants-section">
      <div class="variants-header">
        <h3>Danh sách biến thể</h3>
      </div>

      <div
        v-for="(bt, mIndex) in bienTheList"
        :key="mIndex"
        class="variant-group"
      >
        <table class="variant-table">
          <thead>
            <tr>
              <th>Kích cỡ</th>
              <th>Giá bán (VND)</th>
              <th>Giá nhập (VND)</th>
              <th>Số lượng</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(s, sIndex) in bt.sizeList" :key="sIndex">
              <td>
                <select v-model="s.idKichCo" class="input-field">
                  <option value="">Chọn size</option>
                  <option v-for="k in kichCoList" :key="k.id" :value="k.id">
                    {{ k.tenKichCo }}
                  </option>
                </select>
              </td>
              <td>
                <input
                  type="number"
                  v-model="s.giaBan"
                  placeholder="0"
                  class="input-field"
                />
              </td>
              <td>
                <input
                  type="number"
                  v-model="s.giaNhap"
                  placeholder="0"
                  class="input-field"
                />
              </td>
              <td>
                <input
                  type="number"
                  v-model="s.soLuongTon"
                  placeholder="0"
                  class="input-field"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <button style="margin-top: 10px" class="save-btn" @click="submit">
        Lưu sản phẩm
      </button>
    </div>
  </div>

  <!-- MODAL -->
  <div v-if="showModal" class="modal-overlay">
    <div class="modal">
      <h3>{{ modalTitle }}</h3>

      <input v-model="modalInput" placeholder="Nhập tên" />

      <div class="modal-actions">
        <button @click="closeModal">Huỷ</button>
        <button class="save-btn" @click="saveModal">Lưu</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";

const API_BASE = "http://localhost:8080/api";

const tenSanPham = ref("");
const moTa = ref("");
const showBienThe = ref(false);
const bienTheList = ref([]);

const showModal = ref(false);
const modalType = ref("");
const modalInput = ref("");

const modalTitle = computed(() => {
  const map = {
    "xuat-xu": "Thêm xuất xứ",
    "loai-ao": "Thêm loại áo",
    "kieu-dang": "Thêm kiểu dáng",
    "phong-cach-mac": "Thêm phong cách",
    "chat-lieu": "Thêm chất liệu",
    "mau-sac": "Thêm màu sắc",
    "kich-co": "Thêm kích cỡ",
  };
  return map[modalType.value] || "Thêm mới";
});

const openModal = (type) => {
  modalType.value = type;
  modalInput.value = "";
  showModal.value = true;
};

const closeModal = () => (showModal.value = false);

const saveModal = async () => {
  if (!modalInput.value.trim()) return;

  const fieldMap = {
    "xuat-xu": "tenXuatXu",
    "loai-ao": "tenLoai",
    "kieu-dang": "tenKieuDang",
    "phong-cach-mac": "tenPhongCach",
    "chat-lieu": "tenChatLieu",
    "mau-sac": "tenMauSac",
    "kich-co": "tenKichCo",
  };

  const fieldName = fieldMap[modalType.value];
  const payload = { [fieldName]: modalInput.value };

  await fetch(`${API_BASE}/${modalType.value}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  closeModal();
  fetchDropdownData();
};

/* ===== dropdown data ===== */
const xuatXuList = ref([]);
const loaiAoList = ref([]);
const kieuDangList = ref([]);
const phongCachList = ref([]);
const chatLieuList = ref([]);
const mauSacList = ref([]);
const kichCoList = ref([]);

const selectedXuatXu = ref("");
const selectedLoaiAo = ref("");
const selectedKieuDang = ref("");
const selectedPhongCach = ref("");
const selectedChatLieu = ref("");
const selectedMauSac = ref("");
const selectedKichCo = ref("");

const fetchDropdownData = async () => {
  const apis = [
    "xuat-xu",
    "loai-ao",
    "kieu-dang",
    "phong-cach-mac",
    "chat-lieu",
    "mau-sac",
    "kich-co",
  ];

  const res = await Promise.all(
    apis.map((a) => fetch(`${API_BASE}/${a}`).then((r) => r.json()))
  );

  [
    xuatXuList,
    loaiAoList,
    kieuDangList,
    phongCachList,
    chatLieuList,
    mauSacList,
    kichCoList,
  ].forEach((refList, i) => (refList.value = res[i].data || res[i]));
};

onMounted(fetchDropdownData);

/* ===== image ===== */
const fileInput = ref(null);
const imageUrl = ref(null);
const triggerUpload = () => fileInput.value.click();
const onFileChange = (e) => {
  const file = e.target.files[0];
  if (file) imageUrl.value = URL.createObjectURL(file);
};
const addMau = () => {
  if (!selectedMauSac.value) {
    alert("Vui lòng chọn màu sắc");
    return;
  }

  if (!selectedKichCo.value) {
    alert("Vui lòng chọn kích cỡ");
    return;
  }

  bienTheList.value.push({
    mauSacId: selectedMauSac.value,
    sizeList: [
      {
        idKichCo: selectedKichCo.value,
        soLuongTon: 0,
        giaNhap: 0,
        giaBan: 0,
      },
    ],
  });
};


const removeMau = (index) => {
  bienTheList.value.splice(index, 1);
};

const addSize = (mIndex) => {
  bienTheList.value[mIndex].sizeList.push({
    idKichCo: "",
    soLuongTon: 0,
    giaNhap: 0,
    giaBan: 0,
  });
};

const handleCreateVariant = () => {
  showBienThe.value = true;

  if (bienTheList.value.length === 0) {
    addMau();
  }
};


const submit = async () => {
  const payload = {
    maSp: null,
    tenSp: tenSanPham.value,
    moTa: moTa.value,
    idChatLieu: selectedChatLieu.value,
    idXuatXu: selectedXuatXu.value,
    idLoaiAo: selectedLoaiAo.value,
    idKieuDang: selectedKieuDang.value,
    idPhongCachMac: selectedPhongCach.value,
    bienTheList: bienTheList.value,
    hinhAnhUrls: imageUrl.value ? [imageUrl.value] : [],
    nguoiTao: "admin",
  };

  await fetch(`${API_BASE}/san-pham`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  alert("Thêm sản phẩm thành công");
};
</script>

<style scoped>
.container {
  padding: 20px;
  font-family: Arial, sans-serif;
  background: white;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.title {
  text-align: center;
  margin-bottom: 20px;
}

.form-wrapper {
  display: flex;
  gap: 20px;
}

.left {
  flex: 3;
}

.right {
  flex: 1;
  text-align: center;
  margin-top: 60px;
}

.row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  margin-bottom: 15px;
}

.col {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.col.full {
  flex: 100%;
  width: 100%;
}

label {
  font-weight: bold;
  margin-bottom: 5px;
}

input,
select,
textarea {
  padding: 8px;
  border: 1px solid #c7b2a3;
  border-radius: 4px;
}

textarea {
  height: 80px;
  resize: none;
}

.price {
  display: flex;
  align-items: center;
}

.price span {
  margin-left: 8px;
}

.select-box {
  display: flex;
  gap: 6px;
  align-items: flex-end;
}

.select-box select {
  flex: 1;
}

.add-btn {
  width: 36px;
  height: 36px;
  border-radius: 7px;
  border: 1px solid #c7b2a3;
  background: white;
  cursor: pointer;
  flex-shrink: 0;
  font-size: 16px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.sizes label {
  margin-right: 15px;
}

.tags {
  display: flex;
  align-items: center;
  gap: 8px;
}

.tag {
  padding: 5px 10px;
  border: 1px solid #c7b2a3;
  border-radius: 4px;
  font-size: 13px;
}

.tag.blue {
  color: #0b3d91;
}

.tag.black {
  color: black;
}

.image-box {
  width: 100%;
  aspect-ratio: 1;
  background: #e8e0d8;
  border: 2px dashed #c7b2a3;
  border-radius: 6px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
}

.image-box img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 6px;
}

.plus {
  font-size: 40px;
  border: 2px solid #999;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.save-btn {
  background: #6b3f23;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

.modal {
  background: white;
  padding: 30px;
  width: 100%;
  max-width: 400px;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.modal h3 {
  margin: 0 0 20px 0;
  font-size: 18px;
  color: #333;
  text-align: center;
  font-weight: 600;
}

.modal input {
  width: 100%;
  padding: 12px;
  margin: 15px 0;
  border: 1px solid #c7b2a3;
  border-radius: 4px;
  font-size: 14px;
  box-sizing: border-box;
}

.modal input:focus {
  outline: none;
  border-color: #6b3f23;
  background-color: #fafafa;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 25px;
}

.modal-actions button {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s;
}

.modal-actions button:first-child {
  background: #f0f0f0;
  color: #333;
  border: 1px solid #ddd;
}

.modal-actions button:first-child:hover {
  background: #e5e5e5;
  border-color: #ccc;
}

.modal-actions .save-btn {
  background: #6b3f23;
  color: white;
  min-width: 80px;
}

.modal-actions .save-btn:hover {
  background: #6b3f23;
}

/* ===== VARIANTS SECTION ===== */
.variants-section {
  margin-top: 30px;
}

.variants-header {
  background: #6b3f23;
  color: white;
  padding: 15px 20px;
  border-radius: 6px 6px 0 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.variants-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.btn-primary {
  background: #6b3f23;
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.3s;
}

.btn-primary:hover {
  background: #5a3318;
}

.btn-danger {
  background: #dc3545;
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.3s;
}

.btn-danger:hover {
  background: #c82333;
}

.variant-group {
  background: white;
  border: 1px solid #e0e0e0;
  border-top: none;
  margin-bottom: 20px;
}

.variant-color-header {
  background: #f9f9f9;
  padding: 15px;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.color-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.color-name {
  font-weight: 600;
  color: #333;
  font-size: 15px;
}

.color-count {
  color: #666;
  font-size: 13px;
}

.color-select {
  padding: 6px 10px;
  border: 1px solid #c7b2a3;
  border-radius: 4px;
  font-size: 13px;
  min-width: 150px;
}

.variant-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.variant-table thead {
  background: #f5f5f5;
}

.variant-table th {
  padding: 12px;
  text-align: left;
  font-weight: 600;
  color: #333;
  border-bottom: 1px solid #d0d0d0;
}

.variant-table td {
  padding: 10px 12px;
  border-bottom: 1px solid #e8e8e8;
}

.input-field {
  width: 100%;
  padding: 6px 8px;
  border: 1px solid #c7b2a3;
  border-radius: 4px;
  font-size: 13px;
  box-sizing: border-box;
}

.input-field:focus {
  outline: none;
  border-color: #6b3f23;
  background-color: #fffbf8;
}

.action-cell {
  text-align: center;
}

.btn-delete {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
  padding: 0;
  transition: transform 0.2s;
}

.btn-delete:hover {
  transform: scale(1.2);
}

.variant-actions {
  display: flex;
  gap: 10px;
  padding: 12px 15px;
  border-top: 1px solid #e0e0e0;
  background: #fafafa;
}

.btn-add-size {
  background: #6b3f23;
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.3s;
}

.btn-add-size:hover {
  background: #5a3318;
}

.btn-remove-color {
  background: white;
  color: #d9534f;
  border: 1px solid #d9534f;
  padding: 8px 15px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.3s;
}

.btn-remove-color:hover {
  background: #f5f5f5;
  border-color: #c82333;
  color: #c82333;
}

.btn-add-color {
  background: white;
  color: #6b3f23;
  border: 2px solid #6b3f23;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.3s;
  margin-top: 15px;
}

.btn-add-color:hover {
  background: #6b3f23;
  color: white;
}
</style>
