import React, { useState, useMemo } from 'react';
import { Table, Button, Space, Tag, Modal, Form, Select, Typography, Avatar, Input, Row, Col, Statistic } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { TableRowSelection } from 'antd/es/table/interface';
import { SwapOutlined, SearchOutlined, UserOutlined, TeamOutlined } from '@ant-design/icons';
import { useModel } from 'umi';
import moment from 'moment';
import type { DonDangKy } from '../types';
import { GIOI_TINH_CONFIG } from '../types';

const { Text } = Typography;
const { Option } = Select;

const PageThanhVien: React.FC = () => {
	const { cauLacBo } = useModel('clb.caulacbo');
	const { donDangKy, chuyenCLB } = useModel('clb.dondangky');
	const { ghiNhanThaoTac } = useModel('clb.lichsu');

	// ── State ─────────────────────────────────────────────────────────
	const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
	const [searchText, setSearchText] = useState('');
	const [filterCLB, setFilterCLB] = useState('');

	const [chuyenCLBModal, setChuyenCLBModal] = useState(false);
	const [chuyenForm] = Form.useForm();

	// ── Computed ──────────────────────────────────────────────────────
	// Chỉ lấy Approved
	const thanhVien: DonDangKy[] = useMemo(
		() => donDangKy.filter((d: DonDangKy) => d.trangThai === 'Approved'),
		[donDangKy],
	);

	const filteredData = useMemo(() => {
		return thanhVien.filter((item) => {
			const q = searchText.toLowerCase();
			const matchSearch =
				!q ||
				item.hoTen.toLowerCase().includes(q) ||
				item.email.toLowerCase().includes(q) ||
				item.soDienThoai.includes(q);
			const matchCLB = !filterCLB || item.cauLacBoId === filterCLB;
			return matchSearch && matchCLB;
		});
	}, [thanhVien, searchText, filterCLB]);

	const selectedRows = thanhVien.filter((r) => selectedRowKeys.includes(r._id));

	// Thống kê số thành viên mỗi CLB
	const thongKeCLB = useMemo(
		() =>
			cauLacBo.map((clb: any) => ({
				...clb,
				soThanhVien: thanhVien.filter((tv) => tv.cauLacBoId === clb._id).length,
			})),
		[cauLacBo, thanhVien],
	);

	// ── Handlers ─────────────────────────────────────────────────────
	const handleChuyenCLB = async () => {
		try {
			const values = await chuyenForm.validateFields();
			const tuCLBIds = [...new Set(selectedRows.map((r) => r.cauLacBoId))];

			chuyenCLB(
				selectedRows.map((r) => r._id),
				values.clbMoiId,
			);

			// Ghi lịch sử cho từng thành viên
			selectedRows.forEach((tv) => {
				ghiNhanThaoTac(tv._id, 'ChangeCLB', undefined, tv.cauLacBoId, values.clbMoiId);
			});

			setChuyenCLBModal(false);
			chuyenForm.resetFields();
			setSelectedRowKeys([]);
		} catch {}
	};

	// ── Row selection ────────────────────────────────────────────────
	const rowSelection: TableRowSelection<DonDangKy> = {
		selectedRowKeys,
		onChange: (keys) => setSelectedRowKeys(keys),
	};

	// ── Columns ──────────────────────────────────────────────────────
	const columns: ColumnsType<DonDangKy> = [
		{
			title: 'Họ tên',
			dataIndex: 'hoTen',
			key: 'hoTen',
			sorter: (a, b) => a.hoTen.localeCompare(b.hoTen),
			width: 200,
			render: (text, record) => (
				<Space>
					<Avatar size={34} icon={<UserOutlined />} style={{ background: '#1677ff' }} />
					<Space direction='vertical' size={0}>
						<Text strong style={{ fontSize: 13 }}>
							{text}
						</Text>
						<Text type='secondary' style={{ fontSize: 11 }}>
							{record.email}
						</Text>
					</Space>
				</Space>
			),
		},
		{
			title: 'SĐT',
			dataIndex: 'soDienThoai',
			key: 'soDienThoai',
			width: 130,
		},
		{
			title: 'Giới tính',
			dataIndex: 'gioiTinh',
			key: 'gioiTinh',
			width: 100,
			sorter: (a, b) => a.gioiTinh.localeCompare(b.gioiTinh),
			filters: Object.entries(GIOI_TINH_CONFIG).map(([k, v]) => ({ text: v.label, value: k })),
			onFilter: (value, record) => record.gioiTinh === value,
			render: (gt) => <Tag color={GIOI_TINH_CONFIG[gt as keyof typeof GIOI_TINH_CONFIG]?.color}>{gt}</Tag>,
		},
		{
			title: 'Địa chỉ',
			dataIndex: 'diaChi',
			key: 'diaChi',
			width: 180,
			render: (v) => v || <Text type='secondary'>—</Text>,
		},
		{
			title: 'Sở trường',
			dataIndex: 'soTruong',
			key: 'soTruong',
			width: 180,
			render: (v) => v || <Text type='secondary'>—</Text>,
		},
		{
			title: 'Câu lạc bộ',
			dataIndex: 'cauLacBoId',
			key: 'cauLacBoId',
			width: 160,
			sorter: (a, b) => a.cauLacBoId.localeCompare(b.cauLacBoId),
			filters: cauLacBo.map((c: any) => ({ text: c.tenCLB, value: c._id })),
			onFilter: (value, record) => record.cauLacBoId === value,
			render: (id) => {
				const clb = cauLacBo.find((c: any) => c._id === id);
				return clb ? <Tag color='blue'>{clb.tenCLB}</Tag> : <Text type='secondary'>—</Text>;
			},
		},
		{
			title: 'Ngày duyệt',
			dataIndex: 'ngayCapNhat',
			key: 'ngayCapNhat',
			width: 130,
			sorter: (a, b) => moment(a.ngayCapNhat || a.ngayDangKy).unix() - moment(b.ngayCapNhat || b.ngayDangKy).unix(),
			render: (date, record) => moment(date || record.ngayDangKy).format('DD/MM/YYYY'),
		},
	];

	// ── Render ───────────────────────────────────────────────────────
	return (
		<div style={{ padding: 24 }}>
			{/* Thống kê nhanh số thành viên theo CLB */}
			<Row gutter={12} style={{ marginBottom: 20 }}>
				{thongKeCLB.map((clb: any) => (
					<Col key={clb._id} xs={12} sm={8} md={6} lg={4}>
						<div
							style={{
								background: '#fff',
								border: '1px solid #f0f0f0',
								borderRadius: 10,
								padding: '14px 16px',
								cursor: 'pointer',
								transition: 'border-color 0.2s',
								borderColor: filterCLB === clb._id ? '#1677ff' : '#f0f0f0',
							}}
							onClick={() => setFilterCLB(filterCLB === clb._id ? '' : clb._id)}
						>
							<div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
								<TeamOutlined style={{ color: '#1677ff' }} />
								<Text strong style={{ fontSize: 12, flex: 1 }} ellipsis>
									{clb.tenCLB}
								</Text>
							</div>
							<div style={{ fontSize: 24, fontWeight: 700, color: '#1677ff' }}>{clb.soThanhVien}</div>
							<Text type='secondary' style={{ fontSize: 11 }}>
								thành viên
							</Text>
						</div>
					</Col>
				))}
			</Row>

			{/* Bulk action bar */}
			{selectedRowKeys.length > 0 && (
				<div
					style={{
						background: '#e6f4ff',
						border: '1px solid #91caff',
						borderRadius: 8,
						padding: '10px 16px',
						marginBottom: 16,
						display: 'flex',
						alignItems: 'center',
						gap: 12,
						flexWrap: 'wrap',
					}}
				>
					<Text strong>Đã chọn {selectedRowKeys.length} thành viên</Text>
					<Button type='primary' size='small' icon={<SwapOutlined />} onClick={() => setChuyenCLBModal(true)}>
						Chuyển CLB cho {selectedRowKeys.length} thành viên
					</Button>
					<Button size='small' onClick={() => setSelectedRowKeys([])}>
						Bỏ chọn
					</Button>
				</div>
			)}

			{/* Table card */}
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
						gap: 10,
						flexWrap: 'wrap',
						alignItems: 'center',
					}}
				>
					<Input
						prefix={<SearchOutlined />}
						placeholder='Tìm theo tên, email, SĐT...'
						value={searchText}
						onChange={(e) => setSearchText(e.target.value)}
						style={{ width: 240 }}
						allowClear
					/>
					<Select
						placeholder='Lọc theo CLB'
						value={filterCLB || undefined}
						onChange={(v) => setFilterCLB(v ?? '')}
						allowClear
						style={{ width: 200 }}
					>
						{cauLacBo.map((c: any) => (
							<Option key={c._id} value={c._id}>
								{c.tenCLB}
							</Option>
						))}
					</Select>
					<Text type='secondary' style={{ marginLeft: 'auto', fontSize: 13 }}>
						Hiển thị <Text strong>{filteredData.length}</Text> / {thanhVien.length} thành viên
					</Text>
				</div>

				<Table<DonDangKy>
					rowKey='_id'
					rowSelection={rowSelection}
					columns={columns}
					dataSource={filteredData}
					scroll={{ x: 1000 }}
					pagination={{
						showSizeChanger: true,
						showTotal: (total) => `Tổng ${total} thành viên`,
						pageSize: 15,
					}}
				/>
			</div>

			{/* ── Modal Chuyển CLB ──────────────────────────────────────── */}
			<Modal
				title='Chuyển câu lạc bộ'
				open={chuyenCLBModal}
				onOk={handleChuyenCLB}
				onCancel={() => {
					setChuyenCLBModal(false);
					chuyenForm.resetFields();
				}}
				okText='Xác nhận chuyển'
				cancelText='Hủy'
				destroyOnClose
			>
				<div style={{ marginBottom: 16 }}>
					<Text>
						Chuyển <Text strong>{selectedRowKeys.length}</Text> thành viên sang câu lạc bộ mới:
					</Text>
				</div>

				{/* Danh sách thành viên được chọn */}
				<div
					style={{
						background: '#f5f5f5',
						borderRadius: 8,
						padding: '10px 14px',
						marginBottom: 16,
						maxHeight: 150,
						overflowY: 'auto',
					}}
				>
					{selectedRows.map((tv) => (
						<div key={tv._id} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
							<Avatar size={24} icon={<UserOutlined />} />
							<Text style={{ fontSize: 13 }}>{tv.hoTen}</Text>
							<Tag color='blue' style={{ marginLeft: 'auto', fontSize: 11 }}>
								{cauLacBo.find((c: any) => c._id === tv.cauLacBoId)?.tenCLB || '—'}
							</Tag>
						</div>
					))}
				</div>

				<Form form={chuyenForm} layout='vertical'>
					<Form.Item
						label='Câu lạc bộ mới'
						name='clbMoiId'
						rules={[{ required: true, message: 'Vui lòng chọn câu lạc bộ!' }]}
					>
						<Select placeholder='Chọn câu lạc bộ muốn chuyển đến' size='large'>
							{cauLacBo
								.filter((c: any) => c.hoatDong)
								.map((c: any) => (
									<Option key={c._id} value={c._id}>
										{c.tenCLB}
									</Option>
								))}
						</Select>
					</Form.Item>
				</Form>
			</Modal>
		</div>
	);
};

export default PageThanhVien;
