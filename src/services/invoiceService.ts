// src/service/invoiceService.ts
import request from '../utils/request'; // Đảm bảo đường dẫn đúng tới file axios config
import type { InvoiceResponse, InvoiceDetail, InvoiceFilterParams } from '../types/invoice';

class InvoiceService {
    // API 1: Lấy danh sách (Có phân trang & lọc)
    getAll(params: InvoiceFilterParams) {
        return request.get('/hoa-don', { params });
    }

    // API 2: Lấy chi tiết hóa đơn
    getDetail(id: number) {
        return request.get<InvoiceDetail>(`/hoa-don/${id}`);
    }

    // API 3: Cập nhật trạng thái
    updateStatus(id: number, trangThaiMoi: number, ghiChu: string) {
        return request.put(`/hoa-don/${id}/trang-thai`, {
            trangThaiMoi,
            ghiChu
        });
    }

    // API 4: Tạo hóa đơn (Nếu cần cho màn bán hàng)
    createInvoice(data: any) {
        return request.post('/hoa-don', data);
    }
}

export default new InvoiceService();