import axios from "axios";
import type {
  CreateCustomerForm,
  UpdateCustomerForm,
} from "./../types/customer";

const API_URL = "http://localhost:8080/api/khach-hang";
// Thay đổi dòng này thành địa chỉ server BE chứa thư mục uploads của bạn
const BASE_IMAGE_URL = "http://localhost:8080"; 
const PROVINCE_API = "https://provinces.open-api.vn/api";

export const customerService = {
  
  // ==========================================
  // 1. THÊM MỚI (POST)
  // ==========================================
  async create(data: CreateCustomerForm, file: File | null) {
    const formData = new FormData();
    const payload = this.preparePayload(data);

    // Gửi JSON vào biến 'data' (Khớp với Java @RequestPart("data"))
    const jsonBlob = new Blob([JSON.stringify(payload)], {
      type: "application/json",
    });
    formData.append("data", jsonBlob);
    
    // Gửi File vào biến 'avatarFile' (Khớp với Java @RequestPart("avatarFile"))
    if (file) {
      formData.append("avatarFile", file);
    }

    return axios.post(API_URL, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  // ==========================================
  // 2. CẬP NHẬT (PUT)
  // ==========================================
  async update(id: number, data: UpdateCustomerForm, file: File | null) {
    const formData = new FormData();
    const payload = this.preparePayload(data);

    // Loại bỏ các trường liên quan đến avatar cũ khỏi JSON Payload
    // Vì nếu có ảnh mới, BE sẽ tự update dựa vào file gửi lên
    if (payload.avatar) delete payload.avatar;
    if (payload.avatarFullUrl) delete payload.avatarFullUrl;

    // Gửi JSON vào biến 'data'
    const jsonBlob = new Blob([JSON.stringify(payload)], {
      type: "application/json",
    });
    formData.append("data", jsonBlob);

    // Gửi file nếu người dùng chọn ảnh mới
    if (file) {
      formData.append("avatarFile", file);
    }

    return axios.put(`${API_URL}/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  // ==========================================
  // 3. LẤY CHI TIẾT ĐỂ SỬA
  // ==========================================
  async getByIdForEdit(id: number) {
    const [res, pRes] = await Promise.all([
      axios.get(`${API_URL}/${id}`),
      axios.get(`${PROVINCE_API}/?depth=1`),
    ]);

    const customer = res.data;
    const allProvinces = pRes.data;

    // 👉 ĐÃ SỬA: Lắp ghép URL hoàn chỉnh để Vue có thể hiển thị ảnh
    if (customer.avatar) {
      // Ví dụ customer.avatar = "/uploads/avatar.png" (từ Java Service trả về)
      // Kết quả: "http://localhost:8080/uploads/avatar.png"
      customer.avatarFullUrl = `${BASE_IMAGE_URL}${customer.avatar}`;
    }

    // Mapping địa chỉ sang ID Select
    customer.listDiaChi = await Promise.all(
      customer.listDiaChi.map(async (addr: any) => {
        const item: any = {
          id: addr.id,
          provinceId: null,
          districtId: null,
          wardCode: null,
          provinceName: addr.thanhPho,
          districtName: addr.quan,
          wardName: addr.phuong,
          detail: addr.diaChiCuThe,
          macDinh: addr.macDinh,
          districtOptions: [],
          wardOptions: [],
        };

        const clean = (s: string) => s?.trim().toLowerCase() || "";
        const province = allProvinces.find(
          (p: any) => clean(p.name) === clean(addr.thanhPho),
        );

        if (province) {
          item.provinceId = province.code;
          const dRes = await axios.get(
            `${PROVINCE_API}/p/${province.code}?depth=2`,
          );
          item.districtOptions = dRes.data.districts;

          const district = item.districtOptions.find(
            (d: any) => clean(d.name) === clean(addr.quan),
          );
          if (district) {
            item.districtId = district.code;
            const wRes = await axios.get(
              `${PROVINCE_API}/d/${district.code}?depth=2`,
            );
            item.wardOptions = wRes.data.wards;

            const ward = item.wardOptions.find(
              (w: any) => clean(w.name) === clean(addr.phuong),
            );
            if (ward) item.wardCode = ward.code;
          }
        }
        return item;
      }),
    );

    return customer;
  },

  // ==========================================
  // 4. API CHECK UNIQUE
  // ==========================================
  // Bổ sung API này vì file Vue EditEmployee.vue của bạn có gọi
  async checkUnique(params: { email?: string | null; sdt?: string | null }) {
    return axios.get(`${API_URL}/check-unique`, { params });
  },

  // ==========================================
  // CÁC HÀM BỔ TRỢ KHÁC
  // ==========================================
  async toggleStatus(id: number) {
    return axios.put(`${API_URL}/${id}/toggle-status`);
  },

  async getAll(params: {
    page: number;
    size: number;
    keyword?: string;
    status?: number | null;
  }) {
    return axios.get(API_URL, { params });
  },

  async getStats() {
    return axios.get(`${API_URL}/stats`);
  },

  preparePayload(data: any) {
    return {
      ...data,
      tenTaiKhoan: data.tenTaiKhoan?.trim() || null,
      avatarFullUrl: undefined, 
      listDiaChi: data.listDiaChi.map((addr: any) => ({
        id: addr.id || null,
        thanhPho: addr.provinceName || addr.thanhPho,
        quan: addr.districtName || addr.quan,
        phuong: addr.wardName || addr.phuong,
        diaChiCuThe: addr.detail || addr.diaChiCuThe,
        macDinh: addr.macDinh || false,
      })),
    };
  },
};