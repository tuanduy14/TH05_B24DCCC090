import React, { useState, useMemo } from 'react';
import {
	Table,
	Button,
	Space,
	Tag,
	Modal,
	Form,
	Input,
	Select,
	Tooltip,
	Popconfirm,
	Typography,
	Drawer,
	Timeline,
	Row,
	Col,
	DatePicker,
	Avatar,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { TableRowSelection } from 'antd/es/table/interface';
import {
	PlusOutlined,
	CheckCircleOutlined,
	CloseCircleOutlined,
	EyeOutlined,
	EditOutlined,
	DeleteOutlined,
	HistoryOutlined,
	SearchOutlined,
	UserOutlined,
} from '@ant-design/icons';
import { useModel } from 'umi';
import moment from 'moment';
import type { DonDangKy, TrangThaiDonDangKy, GioiTinh } from '../types';
import { TRANG_THAI_CONFIG, GIOI_TINH_CONFIG } from '../types';

const { Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const PageDonDangKy: React.FC = () => {
	const { cauLacBo } = useModel('clb.caulacbo');
	const { donDangKy, loading, themDonDangKy, suaDonDangKy, xoaDonDangKy, duyetNhieuDon, tuChoiNhieuDon } =
		useModel('clb.dondangky');
	const { lichSu, ghiNhanThaoTac, getLichSuTheoDon } = useModel('clb.lichsu');

	// ── State ─────────────────────────────────────────────────────────
	const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
	const [searchText, setSearchText] = useState('');
	const [filterTrangThai, setFilterTrangThai] = useState<TrangThaiDonDangKy | ''>('');
	const [filterCLB, setFilterCLB] = useState('');

	const [modalFormVisible, setModalFormVisible] = useState(false);
	const [editingRecord, setEditingRecord] = useState<DonDangKy | null>(null);
	const [form] = Form.useForm();

	const [drawerDetail, setDrawerDetail] = useState<{ open: boolean; record: DonDangKy | null }>({
		open: false,
		record: null,
	});

	const [rejectModal, setRejectModal] = useState<{ open: boolean; ids: string[] }>({
		open: false,
		ids: [],
	});
	const [rejectForm] = Form.useForm();

	const [historyDrawer, setHistoryDrawer] = useState(false);

	// ── Computed ──────────────────────────────────────────────────────
	const filteredData = useMemo(() => {
		return donDangKy.filter((item: DonDangKy) => {
			const q = searchText.toLowerCase();
			const matchSearch =
				!q ||
				item.hoTen.toLowerCase().includes(q) ||
				item.email.toLowerCase().includes(q) ||
				item.soDienThoai.includes(q);
			const matchStatus = !filterTrangThai || item.trangThai === filterTrangThai;
			const matchCLB = !filterCLB || item.cauLacBoId === filterCLB;
			return matchSearch && matchStatus && matchCLB;
		});
	}, [donDangKy, searchText, filterTrangThai, filterCLB]);

	const selectedRows: DonDangKy[] = donDangKy.filter((r: DonDangKy) => selectedRowKeys.includes(r._id));
	const pendingSelected = selectedRows.filter((r) => r.trangThai === 'Pending');

	// ── Handlers ─────────────────────────────────────────────────────
	const handleOpenModal = (record?: DonDangKy) => {
		if (record) {
			setEditingRecord(record);
			form.setFieldsValue({
				...record,
				ngayDangKy: moment(record.ngayDangKy),
			});
		} else {
			setEditingRecord(null);
			form.resetFields();
		}
		setModalFormVisible(true);
	};

	const handleSubmitForm = async () => {
		try {
			const values = await form.validateFields();
			const data = {
				...values,
				ngayDangKy: values.ngayDangKy ? values.ngayDangKy.toISOString() : new Date().toISOString(),
			};
			if (editingRecord) {
				suaDonDangKy(editingRecord._id, data);
			} else {
				themDonDangKy(data);
			}
			setModalFormVisible(false);
			form.resetFields();
		} catch {}
	};

	const handleDuyet = (ids: string[]) => {
		duyetNhieuDon(ids);
		ids.forEach((id) => ghiNhanThaoTac(id, 'Approved'));
		setSelectedRowKeys([]);
	};

	const handleOpenReject = (ids: string[]) => {
		rejectForm.resetFields();
		setRejectModal({ open: true, ids });
	};

	const handleConfirmReject = async () => {
		try {
			const values = await rejectForm.validateFields();
			tuChoiNhieuDon(rejectModal.ids, values.lyDo);
			rejectModal.ids.forEach((id) => ghiNhanThaoTac(id, 'Rejected', values.lyDo));
			setRejectModal({ open: false, ids: [] });
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
			width: 180,
			render: (text, record) => (
				<Space>
					<Avatar size={32} icon={<UserOutlined />} />
					<Space direction='vertical' size={0}>
						<Text strong style={{ fontSize: 13 }}>
							{text}
						</Text>
						<Text type='secondary' style={{ fontSize: 11 }}>
							{record.gioiTinh}
						</Text>
					</Space>
				</Space>
			),
		},
		{
			title: 'Email',
			dataIndex: 'email',
			key: 'email',
			sorter: (a, b) => a.email.localeCompare(b.email),
			width: 190,
		},
		{
			title: 'SĐT',
			dataIndex: 'soDienThoai',
			key: 'soDienThoai',
			width: 120,
		},
		{
			title: 'Giới tính',
			dataIndex: 'gioiTinh',
			key: 'gioiTinh',
			width: 90,
			sorter: (a, b) => a.gioiTinh.localeCompare(b.gioiTinh),
			filters: Object.entries(GIOI_TINH_CONFIG).map(([k, v]) => ({ text: v.label, value: k })),
			onFilter: (value, record) => record.gioiTinh === value,
			render: (gt: GioiTinh) => <Tag color={GIOI_TINH_CONFIG[gt]?.color}>{gt}</Tag>,
		},
		{
			title: 'Câu lạc bộ',
			dataIndex: 'cauLacBoId',
			key: 'cauLacBoId',
			width: 150,
			sorter: (a, b) => a.cauLacBoId.localeCompare(b.cauLacBoId),
			filters: cauLacBo.map((c: any) => ({ text: c.tenCLB, value: c._id })),
			onFilter: (value, record) => record.cauLacBoId === value,
			render: (id: string) => {
				const clb = cauLacBo.find((c: any) => c._id === id);
				return clb ? <Tag color='blue'>{clb.tenCLB}</Tag> : <Text type='secondary'>—</Text>;
			},
		},
		{
			title: 'Trạng thái',
			dataIndex: 'trangThai',
			key: 'trangThai',
			width: 120,
			sorter: (a, b) => a.trangThai.localeCompare(b.trangThai),
			filters: Object.entries(TRANG_THAI_CONFIG).map(([k, v]) => ({ text: v.label, value: k })),
			onFilter: (value, record) => record.trangThai === value,
			render: (tt: TrangThaiDonDangKy) => (
				<Tag color={TRANG_THAI_CONFIG[tt]?.color}>{TRANG_THAI_CONFIG[tt]?.label}</Tag>
			),
		},
		{
			title: 'Ngày đăng ký',
			dataIndex: 'ngayDangKy',
			key: 'ngayDangKy',
			width: 130,
			sorter: (a, b) => moment(a.ngayDangKy).unix() - moment(b.ngayDangKy).unix(),
			render: (date: string) => moment(date).format('DD/MM/YYYY'),
		},
		{
			title: 'Thao tác',
			key: 'action',
			fixed: 'right' as const,
			width: 210,
			render: (_, record) => (
				<Space size={4} wrap>
					<Tooltip title='Xem chi tiết'>
						<Button size='small' icon={<EyeOutlined />} onClick={() => setDrawerDetail({ open: true, record })} />
					</Tooltip>
					<Tooltip title='Chỉnh sửa'>
						<Button size='small' icon={<EditOutlined />} onClick={() => handleOpenModal(record)} />
					</Tooltip>
					{record.trangThai === 'Pending' && (
						<>
							<Tooltip title='Duyệt'>
								<Button
									size='small'
									type='primary'
									icon={<CheckCircleOutlined />}
									onClick={() => handleDuyet([record._id])}
								/>
							</Tooltip>
							<Tooltip title='Từ chối'>
								<Button
									size='small'
									danger
									icon={<CloseCircleOutlined />}
									onClick={() => handleOpenReject([record._id])}
								/>
							</Tooltip>
						</>
					)}
					<Popconfirm
						title='Xác nhận xóa đơn đăng ký này?'
						onConfirm={() => xoaDonDangKy(record._id)}
						okText='Xóa'
						cancelText='Hủy'
						okButtonProps={{ danger: true }}
					>
						<Tooltip title='Xóa'>
							<Button size='small' danger icon={<DeleteOutlined />} />
						</Tooltip>
					</Popconfirm>
				</Space>
			),
		},
	];

	// ── Render ───────────────────────────────────────────────────────
	return (
		<div style={{ padding: 24 }}>
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
					<Text strong>Đã chọn {selectedRowKeys.length} đơn</Text>
					{pendingSelected.length > 0 && (
						<>
							<Button
								type='primary'
								size='small'
								icon={<CheckCircleOutlined />}
								onClick={() => handleDuyet(pendingSelected.map((r) => r._id))}
							>
								Duyệt {pendingSelected.length} đơn đã chọn
							</Button>
							<Button
								danger
								size='small'
								icon={<CloseCircleOutlined />}
								onClick={() => handleOpenReject(pendingSelected.map((r) => r._id))}
							>
								Không duyệt {pendingSelected.length} đơn đã chọn
							</Button>
						</>
					)}
					<Button size='small' onClick={() => setSelectedRowKeys([])}>
						Bỏ chọn tất cả
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
				{/* Toolbar */}
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
						placeholder='Trạng thái'
						value={filterTrangThai || undefined}
						onChange={(v) => setFilterTrangThai(v ?? '')}
						allowClear
						style={{ width: 140 }}
					>
						{Object.entries(TRANG_THAI_CONFIG).map(([k, v]) => (
							<Option key={k} value={k}>
								{v.label}
							</Option>
						))}
					</Select>
					<Select
						placeholder='Câu lạc bộ'
						value={filterCLB || undefined}
						onChange={(v) => setFilterCLB(v ?? '')}
						allowClear
						style={{ width: 180 }}
					>
						{cauLacBo.map((c: any) => (
							<Option key={c._id} value={c._id}>
								{c.tenCLB}
							</Option>
						))}
					</Select>
					<div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
						<Button icon={<HistoryOutlined />} onClick={() => setHistoryDrawer(true)}>
							Lịch sử thao tác
						</Button>
						<Button type='primary' icon={<PlusOutlined />} onClick={() => handleOpenModal()}>
							Thêm đơn
						</Button>
					</div>
				</div>

				<Table<DonDangKy>
					rowKey='_id'
					rowSelection={rowSelection}
					columns={columns}
					dataSource={filteredData}
					loading={loading}
					scroll={{ x: 1100 }}
					pagination={{
						showSizeChanger: true,
						showTotal: (total) => `Tổng ${total} đơn đăng ký`,
						pageSize: 15,
					}}
				/>
			</div>

			{/* ── Modal Thêm / Sửa ─────────────────────────────────────── */}
			<Modal
				title={editingRecord ? 'Chỉnh sửa đơn đăng ký' : 'Thêm đơn đăng ký mới'}
				open={modalFormVisible}
				onOk={handleSubmitForm}
				onCancel={() => {
					setModalFormVisible(false);
					form.resetFields();
				}}
				okText={editingRecord ? 'Cập nhật' : 'Thêm'}
				cancelText='Hủy'
				width={700}
				destroyOnClose
			>
				<Form form={form} layout='vertical' style={{ marginTop: 16 }}>
					<Row gutter={16}>
						<Col span={12}>
							<Form.Item label='Họ tên' name='hoTen' rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}>
								<Input placeholder='Nguyễn Văn A' />
							</Form.Item>
						</Col>
						<Col span={12}>
							<Form.Item
								label='Email'
								name='email'
								rules={[
									{ required: true, message: 'Vui lòng nhập email!' },
									{ type: 'email', message: 'Email không hợp lệ!' },
								]}
							>
								<Input placeholder='email@example.com' />
							</Form.Item>
						</Col>
						<Col span={12}>
							<Form.Item
								label='Số điện thoại'
								name='soDienThoai'
								rules={[{ required: true, message: 'Vui lòng nhập SĐT!' }]}
							>
								<Input placeholder='0901234567' />
							</Form.Item>
						</Col>
						<Col span={12}>
							<Form.Item
								label='Giới tính'
								name='gioiTinh'
								rules={[{ required: true, message: 'Vui lòng chọn giới tính!' }]}
							>
								<Select placeholder='Chọn giới tính'>
									{Object.entries(GIOI_TINH_CONFIG).map(([k, v]) => (
										<Option key={k} value={k}>
											{v.label}
										</Option>
									))}
								</Select>
							</Form.Item>
						</Col>
						<Col span={24}>
							<Form.Item label='Địa chỉ' name='diaChi'>
								<Input placeholder='Địa chỉ thường trú' />
							</Form.Item>
						</Col>
						<Col span={12}>
							<Form.Item
								label='Câu lạc bộ'
								name='cauLacBoId'
								rules={[{ required: true, message: 'Vui lòng chọn CLB!' }]}
							>
								<Select placeholder='Chọn câu lạc bộ'>
									{cauLacBo
										.filter((c: any) => c.hoatDong)
										.map((c: any) => (
											<Option key={c._id} value={c._id}>
												{c.tenCLB}
											</Option>
										))}
								</Select>
							</Form.Item>
						</Col>
						<Col span={12}>
							<Form.Item label='Trạng thái' name='trangThai' initialValue='Pending'>
								<Select>
									{Object.entries(TRANG_THAI_CONFIG).map(([k, v]) => (
										<Option key={k} value={k}>
											{v.label}
										</Option>
									))}
								</Select>
							</Form.Item>
						</Col>
						<Col span={24}>
							<Form.Item label='Sở trường' name='soTruong'>
								<Input placeholder='VD: Lập trình, Tiếng Anh, Âm nhạc...' />
							</Form.Item>
						</Col>
						<Col span={24}>
							<Form.Item label='Lý do tham gia' name='lyDoThamGia'>
								<TextArea rows={3} placeholder='Mô tả lý do muốn tham gia câu lạc bộ...' />
							</Form.Item>
						</Col>
						<Col span={24}>
							<Form.Item label='Ghi chú (lý do từ chối)' name='ghiChu'>
								<TextArea rows={2} placeholder='Điền nếu đơn bị từ chối...' />
							</Form.Item>
						</Col>
					</Row>
				</Form>
			</Modal>

			{/* ── Modal Từ chối (bắt buộc nhập lý do) ──────────────────── */}
			<Modal
				title='Xác nhận từ chối đơn đăng ký'
				open={rejectModal.open}
				onOk={handleConfirmReject}
				onCancel={() => setRejectModal({ open: false, ids: [] })}
				okText='Xác nhận từ chối'
				cancelText='Hủy'
				okButtonProps={{ danger: true }}
				destroyOnClose
			>
				<div style={{ marginBottom: 12 }}>
					<Text>
						Bạn đang từ chối <Text strong>{rejectModal.ids.length}</Text> đơn đăng ký.
					</Text>
				</div>
				<Form form={rejectForm} layout='vertical'>
					<Form.Item
						label='Lý do từ chối'
						name='lyDo'
						rules={[{ required: true, message: 'Bắt buộc nhập lý do từ chối!' }]}
					>
						<TextArea rows={4} placeholder='Nhập lý do từ chối đơn đăng ký...' showCount maxLength={500} />
					</Form.Item>
				</Form>
			</Modal>

			{/* ── Drawer Xem chi tiết ──────────────────────────────────── */}
			<Drawer
				title='Chi tiết đơn đăng ký'
				open={drawerDetail.open}
				onClose={() => setDrawerDetail({ open: false, record: null })}
				width={500}
			>
				{drawerDetail.record && (
					<>
						<Row gutter={[0, 12]}>
							{[
								['Họ tên', drawerDetail.record.hoTen],
								['Email', drawerDetail.record.email],
								['Số điện thoại', drawerDetail.record.soDienThoai],
								['Giới tính', drawerDetail.record.gioiTinh],
								['Địa chỉ', drawerDetail.record.diaChi || '—'],
								['Sở trường', drawerDetail.record.soTruong || '—'],
								['Lý do tham gia', drawerDetail.record.lyDoThamGia || '—'],
								['Câu lạc bộ', cauLacBo.find((c: any) => c._id === drawerDetail.record!.cauLacBoId)?.tenCLB || '—'],
								['Ngày đăng ký', moment(drawerDetail.record.ngayDangKy).format('DD/MM/YYYY HH:mm')],
							].map(([label, value]) => (
								<Col span={24} key={label as string}>
									<div style={{ display: 'flex', gap: 8 }}>
										<Text type='secondary' style={{ width: 130, flexShrink: 0, fontSize: 13 }}>
											{label}:
										</Text>
										<Text style={{ fontSize: 13 }}>{value as string}</Text>
									</div>
								</Col>
							))}
							<Col span={24}>
								<div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
									<Text type='secondary' style={{ width: 130, flexShrink: 0, fontSize: 13 }}>
										Trạng thái:
									</Text>
									<Tag color={TRANG_THAI_CONFIG[drawerDetail.record.trangThai]?.color}>
										{TRANG_THAI_CONFIG[drawerDetail.record.trangThai]?.label}
									</Tag>
								</div>
							</Col>
							{drawerDetail.record.ghiChu && (
								<Col span={24}>
									<div
										style={{
											background: '#fff2f0',
											border: '1px solid #ffccc7',
											borderRadius: 8,
											padding: '10px 14px',
										}}
									>
										<Text type='danger' strong style={{ fontSize: 12 }}>
											Lý do từ chối:
										</Text>
										<div style={{ marginTop: 4, fontSize: 13 }}>{drawerDetail.record.ghiChu}</div>
									</div>
								</Col>
							)}
						</Row>

						{/* Lịch sử xử lý của đơn này */}
						<div style={{ marginTop: 24 }}>
							<Text strong style={{ fontSize: 14 }}>
								Lịch sử xử lý
							</Text>
							<div style={{ marginTop: 12 }}>
								{getLichSuTheoDon(drawerDetail.record._id).length === 0 ? (
									<Text type='secondary' style={{ fontSize: 13 }}>
										Chưa có lịch sử xử lý
									</Text>
								) : (
									<Timeline
										items={getLichSuTheoDon(drawerDetail.record._id)
											.slice()
											.reverse()
											.map((ls: any) => ({
												color: ls.hanhDong === 'Approved' ? 'green' : 'red',
												children: (
													<div>
														<Text strong style={{ fontSize: 13 }}>
															{ls.nguoiThucHien}
														</Text>{' '}
														đã{' '}
														<Tag color={ls.hanhDong === 'Approved' ? 'green' : 'red'} style={{ fontSize: 11 }}>
															{ls.hanhDong === 'Approved' ? 'Duyệt' : 'Từ chối'}
														</Tag>
														<div style={{ fontSize: 11, color: '#999', marginTop: 2 }}>
															{moment(ls.thoiGian).format('HH:mm DD/MM/YYYY')}
														</div>
														{ls.lyDo && (
															<div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>Lý do: {ls.lyDo}</div>
														)}
													</div>
												),
											}))}
									/>
								)}
							</div>
						</div>
					</>
				)}
			</Drawer>

			{/* ── Drawer Tất cả lịch sử thao tác ─────────────────────── */}
			<Drawer title='Lịch sử thao tác' open={historyDrawer} onClose={() => setHistoryDrawer(false)} width={520}>
				{lichSu.length === 0 ? (
					<Text type='secondary'>Chưa có lịch sử thao tác nào.</Text>
				) : (
					<Timeline
						items={[...lichSu]
							.sort((a: any, b: any) => moment(b.thoiGian).unix() - moment(a.thoiGian).unix())
							.map((ls: any) => {
								const don = donDangKy.find((d: DonDangKy) => d._id === ls.donDangKyId);
								return {
									color: ls.hanhDong === 'Approved' ? 'green' : ls.hanhDong === 'Rejected' ? 'red' : 'blue',
									children: (
										<div style={{ paddingBottom: 8 }}>
											<div>
												<Text strong style={{ fontSize: 13 }}>
													{ls.nguoiThucHien}
												</Text>{' '}
												đã{' '}
												<Tag
													color={ls.hanhDong === 'Approved' ? 'green' : ls.hanhDong === 'Rejected' ? 'red' : 'blue'}
													style={{ fontSize: 11 }}
												>
													{ls.hanhDong === 'Approved' ? 'Duyệt' : ls.hanhDong === 'Rejected' ? 'Từ chối' : 'Chuyển CLB'}
												</Tag>
												{don && (
													<Text style={{ fontSize: 13 }}>
														đơn của <Text strong>{don.hoTen}</Text>
													</Text>
												)}
											</div>
											<div style={{ fontSize: 11, color: '#999', marginTop: 2 }}>
												{moment(ls.thoiGian).format('HH:mm — DD/MM/YYYY')}
											</div>
											{ls.lyDo && (
												<div
													style={{
														background: '#fff2f0',
														borderRadius: 6,
														padding: '6px 10px',
														marginTop: 6,
														fontSize: 12,
														color: '#cf1322',
													}}
												>
													Lý do: {ls.lyDo}
												</div>
											)}
										</div>
									),
								};
							})}
					/>
				)}
			</Drawer>
		</div>
	);
};

export default PageDonDangKy;
