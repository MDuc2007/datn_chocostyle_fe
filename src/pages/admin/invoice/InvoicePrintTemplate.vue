<template>
  <div id="print-template" v-if="invoice">
    <div class="a4-page">
     
      <div class="header-section">
        <div class="logo-box">
           <h1 class="shop-name">CHOCOSTYLE</h1>
           <p class="slogan">Thời trang nam cao cấp & Phụ kiện</p>
        </div>
        <div class="contact-box">
           <p><strong>Hotline:</strong> 0987.654.321</p>
           <p><strong>Email:</strong> cskh@chocostyle.com</p>
           <p><strong>Địa chỉ:</strong> Số 1, Trịnh Văn Bô, Nam Từ Liêm, HN</p>
           <p><strong>Website:</strong> www.chocostyle.com</p>
        </div>
      </div>


      <div class="header-line"></div>


      <div class="title-container">
        <div class="title-left">
           <h2 class="invoice-title">HÓA ĐƠN BÁN HÀNG</h2>
           <p class="invoice-serial">Mã số: <strong>{{ invoice.maHoaDon }}</strong></p>
           <p class="invoice-date">Ngày: {{ formatDate(invoice.ngayTao) }}</p>
        </div>
        <div class="qr-right">
           <img :src="`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${invoice.maHoaDon}`" alt="QR" />
        </div>
      </div>


      <div class="customer-section">
         <div class="row-info">
            <span class="label">Khách hàng:</span>
            <span class="value uppercase"><strong>{{ invoice.tenKhachHang }}</strong></span>
         </div>
         <div class="row-info">
            <span class="label">Điện thoại:</span>
            <span class="value">{{ invoice.soDienThoai }}</span>
         </div>
         <div class="row-info">
            <span class="label">Địa chỉ:</span>
            <span class="value">{{ invoice.diaChi || 'Khách mua tại quầy' }}</span>
         </div>
         <div class="row-info">
            <span class="label">Thu ngân:</span>
            <span class="value">{{ invoice.tenNhanVien || 'Admin' }}</span>
         </div>
      </div>


      <div class="table-container">
        <table class="invoice-table">
          <thead>
            <tr>
              <th style="width: 40px" class="text-center">STT</th>
              <th class="text-left">Tên sản phẩm</th>
              <th style="width: 60px" class="text-center">ĐVT</th>
              <th style="width: 60px" class="text-center">SL</th>
              <th class="text-right">Đơn giá</th>
              <th class="text-right">Thành tiền</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in invoice.sanPhamList" :key="index">
              <td class="text-center">{{ index + 1 }}</td>
              <td>
                <div class="prod-name">{{ item.tenSanPham }}</div>
                <div class="prod-meta">{{ item.mauSac }} / {{ item.kichCo }}</div>
              </td>
              <td class="text-center">Cái</td>
              <td class="text-center font-bold">{{ item.soLuong }}</td>
              <td class="text-right">{{ formatCurrency(item.donGia) }}</td>
              <td class="text-right font-bold">{{ formatCurrency(item.thanhTien) }}</td>
            </tr>
          </tbody>
        </table>
      </div>


      <div class="footer-wrapper">
         
         <div class="summary-section">
            <div class="sum-row">
               <span class="sum-label">Tổng tiền hàng:</span>
               <span class="sum-value">{{ formatCurrency(invoice.tongTienHang) }}</span>
            </div>
            <div class="sum-row">
               <span class="sum-label">Phí vận chuyển:</span>
               <span class="sum-value">{{ formatCurrency(invoice.phiShip) }}</span>
            </div>
            <div class="sum-row">
               <span class="sum-label">Giảm giá:</span>
               <span class="sum-value">- {{ formatCurrency(invoice.giamGia) }}</span>
            </div>
           
            <div class="total-block">
               <span class="total-label">TỔNG THANH TOÁN</span>
               <span class="total-value">{{ formatCurrency(invoice.tongThanhToan) }}</span>
            </div>
            <div class="text-money">
               (Bằng chữ: <i>{{ convertMoneyToText(invoice.tongThanhToan) }}</i>)
            </div>
         </div>


         <div class="signatures">
            <div class="sig-block">
               <strong>Người mua hàng</strong>
               <p>(Ký, ghi rõ họ tên)</p>
            </div>
            <div class="sig-block">
               <strong>Người bán hàng</strong>
               <p>(Ký, ghi rõ họ tên)</p>
            </div>
         </div>


         <div class="thank-you">
            <p>Cảm ơn quý khách đã mua sắm tại ChocoStyle!</p>
            <p style="font-size: 11px; color: #555;">(Hóa đơn là chứng từ bảo hành, vui lòng giữ lại trong vòng 3 ngày đổi trả)</p>
         </div>
      </div>


    </div>
  </div>
</template>


<script setup lang="ts">
// --- GIỮ NGUYÊN LOGIC SCRIPT CŨ ---
interface InvoiceProduct {
  tenSanPham: string;
  mauSac: string;
  kichCo: string;
  soLuong: number;
  donGia: number;
  thanhTien: number;
}
interface InvoiceDetail {
  maHoaDon: string;
  ngayTao: string;
  tenKhachHang: string;
  soDienThoai: string;
  diaChi: string;
  tenNhanVien: string;
  tongTienHang: number;
  phiShip: number;
  giamGia: number;
  tongThanhToan: number;
  sanPhamList: InvoiceProduct[];
}
defineProps<{ invoice: InvoiceDetail }>();


const formatCurrency = (val: number) => new Intl.NumberFormat('vi-VN').format(val || 0) + ' đ';
const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  try { return new Date(dateStr).toLocaleString('vi-VN', { hour12: false }); } catch (e) { return dateStr; }
};
const convertMoneyToText = (amount: number) => "...........................................................................";
</script>


<style scoped>
#print-template { display: none; }


@media print {
  /* RESET & LAYOUT */
  body > *:not(#print-template) { display: none !important; }
  body { margin: 0; padding: 0; background: white; }
  @page { size: A4; margin: 0; }


  #print-template {
    display: flex !important;
    justify-content: center;
    position: absolute;
    top: 0; left: 0; width: 100%; min-height: 100vh;
    background: white;
    font-family: 'Times New Roman', serif;
    color: #000;
    font-size: 14px; /* Tăng size chữ lên cho dễ đọc */
    line-height: 1.4;
    z-index: 999999;
  }


  .a4-page {
    width: 210mm;
    padding: 15mm 20mm; /* Căn lề chuẩn A4 */
    background: white;
  }


  /* --- HEADER --- */
  .header-section {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
  }
  .shop-name {
    font-size: 28px; font-weight: 900;
    text-transform: uppercase; margin: 0; letter-spacing: 1px;
  }
  .slogan { font-style: italic; font-size: 13px; margin-top: 5px; }
  .contact-box { text-align: right; font-size: 13px; line-height: 1.5; }
  .contact-box p { margin: 0; }
 
  .header-line {
    border-bottom: 2px solid #000; /* Kẻ đậm */
    margin-bottom: 20px;
  }


  /* --- TITLE & QR --- */
  .title-container {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin-bottom: 25px;
  }
  .invoice-title { font-size: 26px; font-weight: bold; margin: 0 0 5px 0; color: #000; }
  .invoice-serial, .invoice-date { margin: 3px 0; font-size: 14px; }
  .qr-right img { width: 85px; height: 85px; border: 1px solid #333; padding: 2px; }


  /* --- CUSTOMER INFO --- */
  .customer-section {
    margin-bottom: 20px;
    padding: 10px 0;
    border-top: 1px dashed #ccc;
    border-bottom: 1px dashed #ccc;
  }
  .row-info { display: flex; margin-bottom: 5px; }
  .label { width: 110px; font-weight: bold; color: #333; }
  .value { flex: 1; }
  .uppercase { text-transform: uppercase; }


  /* --- TABLE --- */
  .table-container { margin-bottom: 25px; }
  .invoice-table { width: 100%; border-collapse: collapse; }
  .invoice-table th {
    background-color: #f0f0f0 !important;
    border: 1px solid #000;
    padding: 10px 5px;
    font-weight: bold;
    text-transform: uppercase;
    font-size: 12px;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .invoice-table td {
    border: 1px solid #000;
    padding: 10px 8px; /* Tăng padding cho thoáng */
    vertical-align: middle;
  }
  .text-center { text-align: center; }
  .text-right { text-align: right; }
  .text-left { text-align: left; }
  .font-bold { font-weight: bold; }
  .prod-name { font-weight: 600; font-size: 14px; }
  .prod-meta { font-size: 12px; font-style: italic; color: #444; margin-top: 2px; }


  /* --- FOOTER & TOTALS --- */
  .footer-wrapper { margin-top: 10px; }
 
  .summary-section {
    width: 60%; /* Chiếm 60% chiều rộng bên phải */
    margin-left: auto; /* Đẩy sang phải */
    margin-bottom: 30px;
  }
  .sum-row { display: flex; justify-content: space-between; margin-bottom: 5px; font-size: 14px; }
  .sum-label { font-weight: normal; }
 
  /* Khung tổng tiền to đẹp */
  .total-block {
    display: flex; justify-content: space-between; align-items: center;
    margin-top: 10px;
    padding-top: 10px;
    border-top: 2px solid #000;
    font-weight: bold;
    font-size: 16px;
  }
  .total-value { font-size: 20px; } /* Số tiền to lên */
  .text-money { text-align: right; font-style: italic; font-size: 13px; margin-top: 5px; }


  /* Signatures */
  .signatures {
    display: flex;
    justify-content: space-between;
    padding: 0 40px;
    text-align: center;
    margin-bottom: 50px;
  }
  .sig-block { display: flex; flex-direction: column; gap: 60px; } /* Gap tạo khoảng trống ký */


  .thank-you {
    text-align: center;
    font-style: italic;
    font-weight: bold;
    border-top: 1px solid #ddd;
    padding-top: 15px;
  }
}
</style>    

