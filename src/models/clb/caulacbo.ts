import { useState, useEffect } from 'react';
import { message } from 'antd';
import type { CauLacBo } from '../../pages/QuanLyCLB/types';

const STORAGE_KEY = 'cauLacBo';

export default () => {
	const [cauLacBo, setCauLacBo] = useState<CauLacBo[]>([]);
	const [loading, setLoading] = useState(false);

	// Load dữ liệu 1 lần khi khởi tạo
	useEffect(() => {
		const saved = localStorage.getItem(STORAGE_KEY);
		if (saved) {
			try {
				setCauLacBo(JSON.parse(saved));
			} catch (error) {
				console.error('Lỗi load câu lạc bộ:', error);
			}
		}
	}, []);

	// Lưu dữ liệu
	const saveData = (data: CauLacBo[]) => {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
		setCauLacBo(data);
	};

	// Thêm CLB
	const themCLB = (data: Omit<CauLacBo, '_id' | 'ngayTao'>) => {
		const clbMoi: CauLacBo = {
			...data,
			_id: Date.now().toString(),
			ngayTao: new Date().toISOString(),
		};

		saveData([...cauLacBo, clbMoi]);
		message.success('Đã thêm câu lạc bộ mới!');
		return clbMoi;
	};

	// Sửa CLB
	const suaCLB = (id: string, data: Partial<CauLacBo>) => {
		const clbMoi = cauLacBo.map((clb) => (clb._id === id ? { ...clb, ...data } : clb));
		saveData(clbMoi);
		message.success('Đã cập nhật câu lạc bộ!');
	};

	// Xóa CLB
	const xoaCLB = (id: string) => {
		const clbMoi = cauLacBo.filter((clb) => clb._id !== id);
		saveData(clbMoi);
		message.success('Đã xóa câu lạc bộ!');
	};

	// Lấy CLB theo ID
	const getCLBById = (id: string) => {
		return cauLacBo.find((clb) => clb._id === id);
	};

	// Lấy danh sách CLB đang hoạt động
	const getCLBHoatDong = () => {
		return cauLacBo.filter((clb) => clb.hoatDong);
	};

	return {
		cauLacBo,
		loading,
		themCLB,
		suaCLB,
		xoaCLB,
		getCLBById,
		getCLBHoatDong,
	};
};
