// Types cho hệ thống Quản lý Câu lạc bộ

export type TrangThaiDonDangKy = 'Pending' | 'Approved' | 'Rejected';
export type GioiTinh = 'Nam' | 'Nữ' | 'Khác';

// 1. Câu lạc bộ
export interface CauLacBo {
	_id: string;
	anhDaiDien?: string; // URL hoặc base64
	tenCLB: string;
	ngayThanhLap: string; // Date YYYY-MM-DD
	moTa?: string; // HTML content
	chuNhiem: string;
	hoatDong: boolean; // true = Có, false = Không
	ngayTao: string;
}

// 2. Đơn đăng ký
export interface DonDangKy {
	_id: string;
	hoTen: string;
	email: string;
	soDienThoai: string;
	gioiTinh: GioiTinh;
	diaChi?: string;
	soTruong?: string;
	cauLacBoId: string; // ID của CLB muốn tham gia
	lyDoThamGia?: string;
	trangThai: TrangThaiDonDangKy;
	ghiChu?: string; // Lý do từ chối (nếu Rejected)
	ngayDangKy: string;
	ngayCapNhat?: string;
}

// 3. Lịch sử thao tác
export interface LichSuThaoTac {
	_id: string;
	donDangKyId: string;
	nguoiThucHien: string; // VD: "Admin", "Nguyễn Văn A"
	hanhDong: 'Approved' | 'Rejected' | 'ChangeCLB'; // Loại thao tác
	lyDo?: string; // Lý do (nếu Rejected)
	thoiGian: string;
	// Thông tin thêm
	tuCLB?: string; // Khi chuyển CLB
	denCLB?: string; // Khi chuyển CLB
}

// 4. Thống kê
export interface ThongKe {
	tongSoCLB: number;
	tongDonDangKy: {
		pending: number;
		approved: number;
		rejected: number;
	};
	theoTungCLB: {
		tenCLB: string;
		clbId: string;
		pending: number;
		approved: number;
		rejected: number;
	}[];
}

// Config màu sắc
export const TRANG_THAI_CONFIG = {
	Pending: { label: 'Chờ duyệt', color: 'orange' },
	Approved: { label: 'Đã duyệt', color: 'green' },
	Rejected: { label: 'Từ chối', color: 'red' },
} as const;

export const GIOI_TINH_CONFIG = {
	Nam: { label: 'Nam', color: 'blue' },
	Nữ: { label: 'Nữ', color: 'pink' },
	Khác: { label: 'Khác', color: 'default' },
} as const;

export const HOAT_DONG_CONFIG = {
	true: { label: 'Có', color: 'green' },
	false: { label: 'Không', color: 'red' },
} as const;
