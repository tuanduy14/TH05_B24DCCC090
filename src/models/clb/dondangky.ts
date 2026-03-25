import { useState, useEffect } from 'react';
import { message } from 'antd';
import type { DonDangKy, TrangThaiDonDangKy } from '../../pages/QuanLyCLB/types';

const STORAGE_KEY = 'donDangKy';

export default () => {
	const [donDangKy, setDonDangKy] = useState<DonDangKy[]>([]);
	const [loading, setLoading] = useState(false);

	// Load dữ liệu 1 lần khi khởi tạo
	useEffect(() => {
		const saved = localStorage.getItem(STORAGE_KEY);
		if (saved) {
			try {
				setDonDangKy(JSON.parse(saved));
			} catch (error) {
				console.error('Lỗi load đơn đăng ký:', error);
			}
		}
	}, []);

	// Lưu dữ liệu
	const saveData = (data: DonDangKy[]) => {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
		setDonDangKy(data);
	};

	// Thêm đơn đăng ký
	const themDonDangKy = (data: Omit<DonDangKy, '_id' | 'ngayDangKy' | 'trangThai'>) => {
		const donMoi: DonDangKy = {
			...data,
			_id: Date.now().toString(),
			trangThai: 'Pending',
			ngayDangKy: new Date().toISOString(),
		};

		saveData([...donDangKy, donMoi]);
		message.success('Đã thêm đơn đăng ký!');
		return donMoi;
	};

	// Sửa đơn đăng ký
	const suaDonDangKy = (id: string, data: Partial<DonDangKy>) => {
		const donMoi = donDangKy.map((don) =>
			don._id === id ? { ...don, ...data, ngayCapNhat: new Date().toISOString() } : don,
		);
		saveData(donMoi);
		message.success('Đã cập nhật đơn đăng ký!');
	};

	// Xóa đơn đăng ký
	const xoaDonDangKy = (id: string) => {
		const donMoi = donDangKy.filter((don) => don._id !== id);
		saveData(donMoi);
		message.success('Đã xóa đơn đăng ký!');
	};

	// Duyệt đơn
	const duyetDon = (id: string) => {
		const donMoi = donDangKy.map((don) =>
			don._id === id
				? { ...don, trangThai: 'Approved' as TrangThaiDonDangKy, ngayCapNhat: new Date().toISOString() }
				: don,
		);
		saveData(donMoi);
		message.success('Đã duyệt đơn đăng ký!');
	};

	// Duyệt nhiều đơn
	const duyetNhieuDon = (ids: string[]) => {
		const donMoi = donDangKy.map((don) =>
			ids.includes(don._id)
				? { ...don, trangThai: 'Approved' as TrangThaiDonDangKy, ngayCapNhat: new Date().toISOString() }
				: don,
		);
		saveData(donMoi);
		message.success(`Đã duyệt ${ids.length} đơn đăng ký!`);
	};

	// Từ chối đơn
	const tuChoiDon = (id: string, lyDo: string) => {
		const donMoi = donDangKy.map((don) =>
			don._id === id
				? {
						...don,
						trangThai: 'Rejected' as TrangThaiDonDangKy,
						ghiChu: lyDo,
						ngayCapNhat: new Date().toISOString(),
				  }
				: don,
		);
		saveData(donMoi);
		message.success('Đã từ chối đơn đăng ký!');
	};

	// Từ chối nhiều đơn
	const tuChoiNhieuDon = (ids: string[], lyDo: string) => {
		const donMoi = donDangKy.map((don) =>
			ids.includes(don._id)
				? {
						...don,
						trangThai: 'Rejected' as TrangThaiDonDangKy,
						ghiChu: lyDo,
						ngayCapNhat: new Date().toISOString(),
				  }
				: don,
		);
		saveData(donMoi);
		message.success(`Đã từ chối ${ids.length} đơn đăng ký!`);
	};

	// Chuyển CLB cho thành viên
	const chuyenCLB = (ids: string[], clbMoiId: string) => {
		const donMoi = donDangKy.map((don) =>
			ids.includes(don._id) ? { ...don, cauLacBoId: clbMoiId, ngayCapNhat: new Date().toISOString() } : don,
		);
		saveData(donMoi);
		message.success(`Đã chuyển ${ids.length} thành viên sang CLB mới!`);
	};

	// Lấy đơn theo CLB
	const getDonTheoCLB = (clbId: string) => {
		return donDangKy.filter((don) => don.cauLacBoId === clbId);
	};

	// Lấy thành viên (đã duyệt)
	const getThanhVien = () => {
		return donDangKy.filter((don) => don.trangThai === 'Approved');
	};

	// Lấy thành viên theo CLB
	const getThanhVienTheoCLB = (clbId: string) => {
		return donDangKy.filter((don) => don.cauLacBoId === clbId && don.trangThai === 'Approved');
	};

	// Thống kê theo trạng thái
	const thongKeTheoTrangThai = () => {
		return {
			pending: donDangKy.filter((d) => d.trangThai === 'Pending').length,
			approved: donDangKy.filter((d) => d.trangThai === 'Approved').length,
			rejected: donDangKy.filter((d) => d.trangThai === 'Rejected').length,
		};
	};

	return {
		donDangKy,
		loading,
		themDonDangKy,
		suaDonDangKy,
		xoaDonDangKy,
		duyetDon,
		duyetNhieuDon,
		tuChoiDon,
		tuChoiNhieuDon,
		chuyenCLB,
		getDonTheoCLB,
		getThanhVien,
		getThanhVienTheoCLB,
		thongKeTheoTrangThai,
	};
};
