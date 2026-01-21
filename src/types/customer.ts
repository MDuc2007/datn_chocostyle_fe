// 1. Định nghĩa cấu trúc Địa chỉ dùng cho Form (Lưu ID để làm việc với Select)
export interface AddressForm {
  id?: number;          // Dùng khi Edit
  provinceId: number | null;
  districtId: number | null;
  wardCode: string | null;
  provinceName?: string; // Tên hiển thị
  districtName?: string;
  wardName?: string;
  detail: string;       // Tương ứng với diaChiCuThe
  macDinh: boolean;
}

// 2. Định nghĩa cấu trúc Khách hàng dùng cho Form (Create/Update)
export interface CreateCustomerForm {
  tenKhachHang: string;
  tenTaiKhoan: string;
  soDienThoai: string;
  email: string;
  gioiTinh: boolean;
  ngaySinh: string;
  matKhau: string;
  confirmPassword?: string;
  trangThai: number;
  listDiaChi: AddressForm[];
}

// 3. Định nghĩa dữ liệu trả về từ API Backend (Mapping từ KhachHangDetailResponse)
export interface CustomerResponse {
  id: number;
  avatar: string | null;
  maKhachHang: string;
  tenKhachHang: string;
  tenTaiKhoan: string;
  soDienThoai: string;
  email: string;
  gioiTinh: boolean;
  ngaySinh: string;
  matKhau: string;
  trangThai: number;
  ngayTao: string | null;     //
  ngayCapNhat: string | null; //
  soLuongDonHang: number; 
  tongChiTieu: number;
  listDiaChi: AddressResponse[];
}

export interface AddressResponse {
  id: number;
  thanhPho: string;
  quan: string;
  phuong: string;
  diaChiCuThe: string;
  macDinh: boolean;
}

// 4. Dữ liệu từ Open API Tỉnh thành
export interface Province { code: number; name: string; }
export interface District { code: number; name: string; }
export interface Ward { code: string; name: string; }

// 5. Kiểu dữ liệu cho Update (Omit password nếu không muốn sửa mật khẩu thường xuyên)
export type UpdateCustomerForm = Partial<CreateCustomerForm> & { id: number };