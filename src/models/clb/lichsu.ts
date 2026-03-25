import { useState, useEffect } from 'react';
import type { LichSuThaoTac } from '../../pages/QuanLyCLB/types';

const STORAGE_KEY = 'lichSuThaoTac';

export default () => {
	const [lichSu, setLichSu] = useState<LichSuThaoTac[]>([]);

	// Load dữ liệu 1 lần khi khởi tạo
	useEffect(() => {
		const saved = localStorage.getItem(STORAGE_KEY);
		if (saved) {
			try {
				setLichSu(JSON.parse(saved));
			} catch (error) {
				console.error('Lỗi load lịch sử:', error);
			}
		}
	}, []);

	// Lưu dữ liệu
	const saveData = (data: LichSuThaoTac[]) => {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
		setLichSu(data);
	};

	// Ghi nhận thao tác
	const ghiNhanThaoTac = (
		donDangKyId: string,
		hanhDong: 'Approved' | 'Rejected' | 'ChangeCLB',
		lyDo?: string,
		tuCLB?: string,
		denCLB?: string,
	) => {
		const thaoTac: LichSuThaoTac = {
			_id: Date.now().toString(),
			donDangKyId,
			nguoiThucHien: 'Admin', // Có thể lấy từ auth context
			hanhDong,
			lyDo,
			tuCLB,
			denCLB,
			thoiGian: new Date().toISOString(),
		};

		saveData([...lichSu, thaoTac]);
	};

	// Lấy lịch sử theo đơn đăng ký
	const getLichSuTheoDon = (donDangKyId: string) => {
		return lichSu.filter((ls) => ls.donDangKyId === donDangKyId);
	};

	return {
		lichSu,
		ghiNhanThaoTac,
		getLichSuTheoDon,
	};
};
