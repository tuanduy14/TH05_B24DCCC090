import React, { useRef, useEffect, useMemo } from 'react';
import { Row, Col, Table, Button, Tag, Typography, Space, message as antMessage } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
	DownloadOutlined,
	TeamOutlined,
	FileTextOutlined,
	CheckCircleOutlined,
	CloseCircleOutlined,
	ClockCircleOutlined,
} from '@ant-design/icons';
import { useModel } from 'umi';
import moment from 'moment';
import * as XLSX from 'xlsx';
import type { DonDangKy } from '../types';
import { GIOI_TINH_CONFIG } from '../types';

const { Text, Title } = Typography;

// ── Kiểu cho dữ liệu chart mỗi CLB ──────────────────────────────
interface ThongKeCLB {
	clbId: string;
	tenCLB: string;
	pending: number;
	approved: number;
	rejected: number;
	total: number;
}

// ── Stat Card ─────────────────────────────────────────────────────
const StatCard: React.FC<{
	icon: React.ReactNode;
	label: string;
	value: number;
	color: string;
	bg: string;
}> = ({ icon, label, value, color, bg }) => (
	<div
		style={{
			background: '#fff',
			border: '1px solid #f0f0f0',
			borderRadius: 12,
			padding: '20px 22px',
			display: 'flex',
			alignItems: 'center',
			gap: 16,
		}}
	>
		<div
			style={{
				width: 48,
				height: 48,
				borderRadius: 12,
				background: bg,
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				fontSize: 22,
				color,
				flexShrink: 0,
			}}
		>
			{icon}
		</div>
		<div>
			<div style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 4 }}>{label}</div>
			<div style={{ fontSize: 30, fontWeight: 700, color, lineHeight: 1 }}>{value}</div>
		</div>
	</div>
);

// ── ColumnChart component (dùng canvas + native JS, không cần thư viện chart) ──
const ColumnChart: React.FC<{ data: ThongKeCLB[] }> = ({ data }) => {
	const canvasRef = useRef<HTMLCanvasElement>(null);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas || data.length === 0) return;

		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		const W = canvas.width;
		const H = canvas.height;
		const paddingLeft = 50;
		const paddingRight = 20;
		const paddingTop = 30;
		const paddingBottom = 80;

		const maxVal = Math.max(...data.flatMap((d) => [d.pending, d.approved, d.rejected]), 1);
		const chartW = W - paddingLeft - paddingRight;
		const chartH = H - paddingTop - paddingBottom;

		ctx.clearRect(0, 0, W, H);

		// Grid lines
		const gridCount = 5;
		ctx.strokeStyle = '#f0f0f0';
		ctx.lineWidth = 1;
		ctx.fillStyle = '#8c8c8c';
		ctx.font = '11px system-ui';
		ctx.textAlign = 'right';

		for (let i = 0; i <= gridCount; i++) {
			const y = paddingTop + chartH - (i / gridCount) * chartH;
			const val = Math.round((i / gridCount) * maxVal);
			ctx.beginPath();
			ctx.moveTo(paddingLeft, y);
			ctx.lineTo(W - paddingRight, y);
			ctx.stroke();
			ctx.fillText(String(val), paddingLeft - 6, y + 4);
		}

		// Columns
		const groupW = chartW / data.length;
		const barCount = 3;
		const barGap = 3;
		const groupPad = groupW * 0.2;
		const barW = (groupW - groupPad * 2 - barGap * (barCount - 1)) / barCount;

		const COLORS = {
			pending: '#faad14',
			approved: '#52c41a',
			rejected: '#ff4d4f',
		};

		data.forEach((d, i) => {
			const gx = paddingLeft + i * groupW + groupPad;

			(['pending', 'approved', 'rejected'] as const).forEach((key, j) => {
				const val = d[key];
				const barH = (val / maxVal) * chartH;
				const x = gx + j * (barW + barGap);
				const y = paddingTop + chartH - barH;

				ctx.fillStyle = COLORS[key];
				ctx.beginPath();
				// Rounded top
				const r = Math.min(4, barH / 2);
				ctx.moveTo(x + r, y);
				ctx.lineTo(x + barW - r, y);
				ctx.arcTo(x + barW, y, x + barW, y + r, r);
				ctx.lineTo(x + barW, y + barH);
				ctx.lineTo(x, y + barH);
				ctx.lineTo(x, y + r);
				ctx.arcTo(x, y, x + r, y, r);
				ctx.closePath();
				ctx.fill();

				// Value label
				if (val > 0) {
					ctx.fillStyle = '#333';
					ctx.font = 'bold 10px system-ui';
					ctx.textAlign = 'center';
					ctx.fillText(String(val), x + barW / 2, y - 4);
				}
			});

			// X axis label
			ctx.fillStyle = '#333';
			ctx.font = '11px system-ui';
			ctx.textAlign = 'center';
			const labelY = paddingTop + chartH + 18;
			const maxLabelW = groupW - 4;
			const label = d.tenCLB;
			// Truncate if needed
			ctx.save();
			ctx.beginPath();
			ctx.rect(paddingLeft + i * groupW, labelY - 14, groupW, 30);
			ctx.clip();
			ctx.fillText(label, paddingLeft + i * groupW + groupW / 2, labelY);
			ctx.restore();
		});

		// Legend
		const legendItems = [
			{ label: 'Pending', color: COLORS.pending },
			{ label: 'Approved', color: COLORS.approved },
			{ label: 'Rejected', color: COLORS.rejected },
		];
		let lx = W / 2 - 160;
		legendItems.forEach(({ label, color }) => {
			ctx.fillStyle = color;
			ctx.fillRect(lx, H - 18, 12, 12);
			ctx.fillStyle = '#555';
			ctx.font = '12px system-ui';
			ctx.textAlign = 'left';
			ctx.fillText(label, lx + 16, H - 8);
			lx += 90;
		});
	}, [data]);

	if (data.length === 0) {
		return <div style={{ textAlign: 'center', padding: 40, color: '#bbb' }}>Chưa có dữ liệu</div>;
	}

	return (
		<canvas ref={canvasRef} width={820} height={340} style={{ width: '100%', height: 'auto', display: 'block' }} />
	);
};

// ── Page chính ───────────────────────────────────────────────────
const PageBaoCao: React.FC = () => {
	const { cauLacBo } = useModel('clb.caulacbo');
	const { donDangKy } = useModel('clb.dondangky');

	// ── Thống kê ─────────────────────────────────────────────────────
	const tongQuan = useMemo(
		() => ({
			tongCLB: cauLacBo.length,
			pending: donDangKy.filter((d: DonDangKy) => d.trangThai === 'Pending').length,
			approved: donDangKy.filter((d: DonDangKy) => d.trangThai === 'Approved').length,
			rejected: donDangKy.filter((d: DonDangKy) => d.trangThai === 'Rejected').length,
		}),
		[cauLacBo, donDangKy],
	);

	const thongKeCLB: ThongKeCLB[] = useMemo(
		() =>
			cauLacBo.map((clb: any) => {
				const donOfCLB = donDangKy.filter((d: DonDangKy) => d.cauLacBoId === clb._id);
				return {
					clbId: clb._id,
					tenCLB: clb.tenCLB,
					pending: donOfCLB.filter((d: DonDangKy) => d.trangThai === 'Pending').length,
					approved: donOfCLB.filter((d: DonDangKy) => d.trangThai === 'Approved').length,
					rejected: donOfCLB.filter((d: DonDangKy) => d.trangThai === 'Rejected').length,
					total: donOfCLB.length,
				};
			}),
		[cauLacBo, donDangKy],
	);

	// ── Export Excel ─────────────────────────────────────────────────
	const handleExportExcel = (clbId: string, tenCLB: string) => {
		const members = donDangKy.filter((d: DonDangKy) => d.cauLacBoId === clbId && d.trangThai === 'Approved');

		if (members.length === 0) {
			antMessage.warning(`CLB "${tenCLB}" chưa có thành viên được duyệt!`);
			return;
		}

		const rows = members.map((m: DonDangKy) => ({
			'Họ tên': m.hoTen,
			Email: m.email,
			'Số điện thoại': m.soDienThoai,
			'Giới tính': m.gioiTinh,
			'Địa chỉ': m.diaChi || '',
			'Sở trường': m.soTruong || '',
			'Lý do tham gia': m.lyDoThamGia || '',
			'Ngày đăng ký': moment(m.ngayDangKy).format('DD/MM/YYYY'),
			'Ngày duyệt': m.ngayCapNhat ? moment(m.ngayCapNhat).format('DD/MM/YYYY HH:mm') : '',
		}));

		const ws = XLSX.utils.json_to_sheet(rows);

		// Style header (độ rộng cột)
		ws['!cols'] = [
			{ wch: 22 },
			{ wch: 28 },
			{ wch: 15 },
			{ wch: 10 },
			{ wch: 28 },
			{ wch: 24 },
			{ wch: 32 },
			{ wch: 14 },
			{ wch: 18 },
		];

		const wb = XLSX.utils.book_new();
		XLSX.utils.book_append_sheet(wb, ws, 'Thành viên');

		const fileName = `ThanhVien_${tenCLB.replace(/\s+/g, '_')}_${moment().format('DDMMYYYY')}.xlsx`;
		XLSX.writeFile(wb, fileName);
		antMessage.success(`Đã xuất file ${fileName}`);
	};

	const handleExportAll = () => {
		const wb = XLSX.utils.book_new();
		let hasData = false;

		cauLacBo.forEach((clb: any) => {
			const members = donDangKy.filter((d: DonDangKy) => d.cauLacBoId === clb._id && d.trangThai === 'Approved');
			if (members.length === 0) return;
			hasData = true;

			const rows = members.map((m: DonDangKy) => ({
				'Họ tên': m.hoTen,
				Email: m.email,
				'Số điện thoại': m.soDienThoai,
				'Giới tính': m.gioiTinh,
				'Địa chỉ': m.diaChi || '',
				'Sở trường': m.soTruong || '',
				'Ngày đăng ký': moment(m.ngayDangKy).format('DD/MM/YYYY'),
			}));

			const ws = XLSX.utils.json_to_sheet(rows);
			ws['!cols'] = [{ wch: 22 }, { wch: 28 }, { wch: 15 }, { wch: 10 }, { wch: 28 }, { wch: 24 }, { wch: 14 }];
			// Tên sheet tối đa 31 ký tự
			const sheetName = clb.tenCLB.slice(0, 31);
			XLSX.utils.book_append_sheet(wb, ws, sheetName);
		});

		if (!hasData) {
			antMessage.warning('Chưa có thành viên nào được duyệt!');
			return;
		}

		const fileName = `DanhSachThanhVien_TatCaCLB_${moment().format('DDMMYYYY')}.xlsx`;
		XLSX.writeFile(wb, fileName);
		antMessage.success(`Đã xuất file ${fileName}`);
	};

	// ── Columns bảng thống kê ────────────────────────────────────────
	const columns: ColumnsType<ThongKeCLB> = [
		{
			title: 'Câu lạc bộ',
			dataIndex: 'tenCLB',
			key: 'tenCLB',
			sorter: (a, b) => a.tenCLB.localeCompare(b.tenCLB),
			render: (text) => (
				<Text strong style={{ fontSize: 13 }}>
					{text}
				</Text>
			),
		},
		{
			title: 'Pending',
			dataIndex: 'pending',
			key: 'pending',
			width: 100,
			sorter: (a, b) => a.pending - b.pending,
			render: (v) => (
				<Tag color='orange' icon={<ClockCircleOutlined />}>
					{v}
				</Tag>
			),
		},
		{
			title: 'Approved',
			dataIndex: 'approved',
			key: 'approved',
			width: 110,
			sorter: (a, b) => a.approved - b.approved,
			render: (v) => (
				<Tag color='green' icon={<CheckCircleOutlined />}>
					{v}
				</Tag>
			),
		},
		{
			title: 'Rejected',
			dataIndex: 'rejected',
			key: 'rejected',
			width: 110,
			sorter: (a, b) => a.rejected - b.rejected,
			render: (v) => (
				<Tag color='red' icon={<CloseCircleOutlined />}>
					{v}
				</Tag>
			),
		},
		{
			title: 'Tổng',
			dataIndex: 'total',
			key: 'total',
			width: 80,
			sorter: (a, b) => a.total - b.total,
			render: (v) => <Text strong>{v}</Text>,
		},
		{
			title: 'Xuất XLSX',
			key: 'export',
			width: 140,
			render: (_, record) => (
				<Button
					size='small'
					icon={<DownloadOutlined />}
					onClick={() => handleExportExcel(record.clbId, record.tenCLB)}
					disabled={record.approved === 0}
				>
					Xuất Excel
				</Button>
			),
		},
	];

	// ── Render ───────────────────────────────────────────────────────
	return (
		<div style={{ padding: 24 }}>
			{/* Stat Cards */}
			<Row gutter={14} style={{ marginBottom: 22 }}>
				<Col xs={24} sm={12} md={6}>
					<StatCard
						icon={<TeamOutlined />}
						label='Tổng câu lạc bộ'
						value={tongQuan.tongCLB}
						color='#1677ff'
						bg='#e6f4ff'
					/>
				</Col>
				<Col xs={24} sm={12} md={6}>
					<StatCard
						icon={<ClockCircleOutlined />}
						label='Đơn Pending'
						value={tongQuan.pending}
						color='#d46b08'
						bg='#fff7e6'
					/>
				</Col>
				<Col xs={24} sm={12} md={6}>
					<StatCard
						icon={<CheckCircleOutlined />}
						label='Đơn Approved'
						value={tongQuan.approved}
						color='#389e0d'
						bg='#f6ffed'
					/>
				</Col>
				<Col xs={24} sm={12} md={6}>
					<StatCard
						icon={<CloseCircleOutlined />}
						label='Đơn Rejected'
						value={tongQuan.rejected}
						color='#cf1322'
						bg='#fff2f0'
					/>
				</Col>
			</Row>

			{/* Column Chart */}
			<div
				style={{
					background: '#fff',
					borderRadius: 12,
					border: '1px solid #f0f0f0',
					padding: '20px 24px',
					marginBottom: 20,
				}}
			>
				<div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
					<Title level={5} style={{ margin: 0 }}>
						Biểu đồ đơn đăng ký theo câu lạc bộ
					</Title>
				</div>
				<ColumnChart data={thongKeCLB} />
			</div>

			{/* Bảng thống kê + xuất Excel */}
			<div
				style={{
					background: '#fff',
					borderRadius: 12,
					border: '1px solid #f0f0f0',
					overflow: 'hidden',
				}}
			>
				<div
					style={{
						padding: '14px 20px',
						borderBottom: '1px solid #f0f0f0',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'space-between',
					}}
				>
					<Title level={5} style={{ margin: 0 }}>
						Danh sách thành viên theo CLB
					</Title>
					<Button type='primary' icon={<DownloadOutlined />} onClick={handleExportAll}>
						Xuất tất cả CLB
					</Button>
				</div>
				<Table<ThongKeCLB>
					rowKey='clbId'
					columns={columns}
					dataSource={thongKeCLB}
					pagination={false}
					summary={(rows) => {
						const total = {
							pending: rows.reduce((s, r) => s + r.pending, 0),
							approved: rows.reduce((s, r) => s + r.approved, 0),
							rejected: rows.reduce((s, r) => s + r.rejected, 0),
							total: rows.reduce((s, r) => s + r.total, 0),
						};
						return (
							<Table.Summary.Row style={{ background: '#fafafa', fontWeight: 600 }}>
								<Table.Summary.Cell index={0}>
									<Text strong>Tổng cộng</Text>
								</Table.Summary.Cell>
								<Table.Summary.Cell index={1}>
									<Tag color='orange'>{total.pending}</Tag>
								</Table.Summary.Cell>
								<Table.Summary.Cell index={2}>
									<Tag color='green'>{total.approved}</Tag>
								</Table.Summary.Cell>
								<Table.Summary.Cell index={3}>
									<Tag color='red'>{total.rejected}</Tag>
								</Table.Summary.Cell>
								<Table.Summary.Cell index={4}>
									<Text strong>{total.total}</Text>
								</Table.Summary.Cell>
								<Table.Summary.Cell index={5} />
							</Table.Summary.Row>
						);
					}}
				/>
			</div>
		</div>
	);
};

export default PageBaoCao;
