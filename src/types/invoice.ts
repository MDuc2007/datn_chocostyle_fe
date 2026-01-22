// src/types/invoice.ts

// 1. Interface cho danh sách hóa đơn (Màn hình List)
export interface InvoiceResponse {
    id: number;
    maHoaDon: string;
    tenKhachHang: string;
    tenNhanVien: string;
    tongTien: number;
    loaiDon: number; // 0: Online, 1: Tại quầy
    trangThai: number;
    ngayTao: string; // Dạng chuỗi 'yyyy-MM-dd' hoặc ISO
}

// 2. Interface cho Param tìm kiếm
export interface InvoiceFilterParams {
    page: number;
    size: number;
    keyword?: string;
    trangThai?: number | null;
    loaiDon?: number | null;
    startDate?: string | null;
    endDate?: string | null;
}

// 3. Interface cho chi tiết sản phẩm trong hóa đơn
export interface ProductDetail {
    tenSanPham: string;
    mauSac: string;
    kichCo: string;
    soLuong: number;
    donGia: number;
    thanhTien: number;
}

// 4. Interface cho lịch sử thao tác
export interface HistoryDetail {
    trangThai: number;
    hanhDong: string;
    ghiChu: string;
    thoiGian: string;
    nguoiThucHien: string;
}

// 5. Interface cho Chi tiết hóa đơn đầy đủ (Màn hình Detail)
export interface InvoiceDetail {
    id: number;
    maHoaDon: string;
    tenKhachHang: string;
    soDienThoai: string;
    diaChi: string;
    tenNhanVien: string;
    trangThai: number;
    loaiDon: number;
    ngayTao: string;
    ghiChu: string;
    
    // Các trường tiền
    tongTienHang: number;
    phiShip: number;
    giamGia: number;
    tongThanhToan: number;

    // Các danh sách con
    sanPhamList: ProductDetail[];
    lichSuList: HistoryDetail[];
    // thanhToanList: ... (nếu cần hiển thị lịch sử thanh toán)
}