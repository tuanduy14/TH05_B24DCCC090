import React, { useState, useMemo } from 'react';
import { Table, Tag, Typography, Select, Input, Space, DatePicker, Timeline, Tabs, Row, Col, Card } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
	CheckCircleOutlined,
	CloseCircleOutlined,
	SwapOutlined,
	SearchOutlined,
	HistoryOutlined,
} from '@ant-design/icons';
import { useModel } from 'umi';
import moment from 'moment';
import type { LichSuThaoTac, DonDangKy } from '../types';

const { Text, Title } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const HANH_DONG_CONFIG = {
	Approved: { label: 'Duyệt đơn', color: 'green', icon: <CheckCircleOutlined /> },
	Rejected: { label: 'Từ chối', color: 'red', icon: <CloseCircleOutlined /> },
	ChangeCLB: { label: 'Chuyển CLB', color: 'blue', icon: <SwapOutlined /> },
} as const;

const PageLichSu: React.FC = () => {
	const { lichSu } = useModel('clb.lichsu');
	const { donDangKy } = useModel('clb.dondangky');
	const { cauLacBo } = useModel('clb.caulacbo');

	// ── State ─────────────────────────────────────────────────────────
	const [searchText, setSearchText] = useState('');
	const [filterHanhDong, setFilterHanhDong] = useState('');
	const [dateRange, setDateRange] = useState<[moment.Moment | null, moment.Moment | null] | null>(null);
	const [activeTab, setActiveTab] = useState('table');

	// ── Computed ──────────────────────────────────────────────────────
	const filteredData = useMemo(() => {
		return [...lichSu]
			.sort((a: LichSuThaoTac, b: LichSuThaoTac) => moment(b.thoiGian).unix() - moment(a.thoiGian).unix())
			.filter((ls: LichSuThaoTac) => {
				const don = donDangKy.find((d: DonDangKy) => d._id === ls.donDangKyId);
				const q = searchText.toLowerCase();
				const matchSearch =
					!q ||
					don?.hoTen.toLowerCase().includes(q) ||
					ls.nguoiThucHien.toLowerCase().includes(q) ||
					ls.lyDo?.toLowerCase().includes(q);
				const matchAction = !filterHanhDong || ls.hanhDong === filterHanhDong;
				const matchDate =
					!dateRange ||
					(!dateRange[0] && !dateRange[1]) ||
					(moment(ls.thoiGian).isSameOrAfter(dateRange[0], 'day') &&
						moment(ls.thoiGian).isSameOrBefore(dateRange[1], 'day'));
				return matchSearch && matchAction && matchDate;
			});
	}, [lichSu, donDangKy, searchText, filterHanhDong, dateRange]);

	// Thống kê
	const stats = useMemo(
		() => ({
			total: lichSu.length,
			approved: lichSu.filter((l: LichSuThaoTac) => l.hanhDong === 'Approved').length,
			rejected: lichSu.filter((l: LichSuThaoTac) => l.hanhDong === 'Rejected').length,
			changeCLB: lichSu.filter((l: LichSuThaoTac) => l.hanhDong === 'ChangeCLB').length,
		}),
		[lichSu],
	);

	const getDonInfo = (donId: string) => donDangKy.find((d: DonDangKy) => d._id === donId);

	const getCLBName = (clbId?: string) => (clbId ? cauLacBo.find((c: any) => c._id === clbId)?.tenCLB || clbId : '—');

	// ── Columns ──────────────────────────────────────────────────────
	const columns: ColumnsType<LichSuThaoTac> = [
		{
			title: 'Thời gian',
			dataIndex: 'thoiGian',
			key: 'thoiGian',
			width: 160,
			sorter: (a, b) => moment(a.thoiGian).unix() - moment(b.thoiGian).unix(),
			defaultSortOrder: 'descend',
			render: (date: string) => (
				<Space direction='vertical' size={0}>
					<Text strong style={{ fontSize: 13 }}>
						{moment(date).format('HH:mm')}
					</Text>
					<Text type='secondary' style={{ fontSize: 11 }}>
						{moment(date).format('DD/MM/YYYY')}
					</Text>
				</Space>
			),
		},
		{
			title: 'Người thực hiện',
			dataIndex: 'nguoiThucHien',
			key: 'nguoiThucHien',
			width: 140,
			sorter: (a, b) => a.nguoiThucHien.localeCompare(b.nguoiThucHien),
			render: (v) => (
				<Text strong style={{ fontSize: 13 }}>
					{v}
				</Text>
			),
		},
		{
			title: 'Hành động',
			dataIndex: 'hanhDong',
			key: 'hanhDong',
			width: 130,
			sorter: (a, b) => a.hanhDong.localeCompare(b.hanhDong),
			filters: Object.entries(HANH_DONG_CONFIG).map(([k, v]) => ({ text: v.label, value: k })),
			onFilter: (value, record) => record.hanhDong === value,
			render: (hd: keyof typeof HANH_DONG_CONFIG) => {
				const cfg = HANH_DONG_CONFIG[hd];
				return (
					<Tag color={cfg.color} icon={cfg.icon}>
						{cfg.label}
					</Tag>
				);
			},
		},
		{
			title: 'Đơn đăng ký',
			dataIndex: 'donDangKyId',
			key: 'donDangKyId',
			width: 180,
			render: (id: string) => {
				const don = getDonInfo(id);
				return don ? (
					<Space direction='vertical' size={0}>
						<Text strong style={{ fontSize: 13 }}>
							{don.hoTen}
						</Text>
						<Text type='secondary' style={{ fontSize: 11 }}>
							{don.email}
						</Text>
					</Space>
				) : (
					<Text type='secondary'>{id}</Text>
				);
			},
		},
		{
			title: 'Lý do / Chi tiết',
			key: 'chiTiet',
			render: (_, record) => {
				if (record.hanhDong === 'Rejected' && record.lyDo) {
					return (
						<div
							style={{
								background: '#fff2f0',
								borderRadius: 6,
								padding: '4px 10px',
								fontSize: 12,
								color: '#cf1322',
								maxWidth: 280,
							}}
						>
							{record.lyDo}
						</div>
					);
				}
				if (record.hanhDong === 'ChangeCLB') {
					return (
						<Space>
							<Tag>{getCLBName(record.tuCLB)}</Tag>
							<Text type='secondary'>→</Text>
							<Tag color='blue'>{getCLBName(record.denCLB)}</Tag>
						</Space>
					);
				}
				return <Text type='secondary'>—</Text>;
			},
		},
	];

	// ── Render ───────────────────────────────────────────────────────
	return (
		<div style={{ padding: 24 }}>
			{/* Stat cards */}
			<Row gutter={12} style={{ marginBottom: 20 }}>
				{[
					{ label: 'Tổng thao tác', value: stats.total, color: '#1677ff' },
					{ label: 'Duyệt đơn', value: stats.approved, color: '#52c41a' },
					{ label: 'Từ chối', value: stats.rejected, color: '#ff4d4f' },
					{ label: 'Chuyển CLB', value: stats.changeCLB, color: '#1890ff' },
				].map(({ label, value, color }) => (
					<Col key={label} xs={12} sm={6}>
						<div
							style={{
								background: '#fff',
								border: '1px solid #f0f0f0',
								borderRadius: 10,
								padding: '16px 18px',
							}}
						>
							<div style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 4 }}>{label}</div>
							<div style={{ fontSize: 28, fontWeight: 700, color }}>{value}</div>
						</div>
					</Col>
				))}
			</Row>

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
						placeholder='Tìm tên, người thực hiện, lý do...'
						value={searchText}
						onChange={(e) => setSearchText(e.target.value)}
						style={{ width: 260 }}
						allowClear
					/>
					<Select
						placeholder='Hành động'
						value={filterHanhDong || undefined}
						onChange={(v) => setFilterHanhDong(v ?? '')}
						allowClear
						style={{ width: 150 }}
					>
						{Object.entries(HANH_DONG_CONFIG).map(([k, v]) => (
							<Option key={k} value={k}>
								{v.label}
							</Option>
						))}
					</Select>
					<RangePicker
						format='DD/MM/YYYY'
						onChange={(dates) => setDateRange(dates ? [dates[0], dates[1]] : null)}
						style={{ width: 240 }}
					/>
					<Tabs
						activeKey={activeTab}
						onChange={setActiveTab}
						style={{ marginLeft: 'auto', marginBottom: 0 }}
						size='small'
						items={[
							{ key: 'table', label: 'Bảng' },
							{ key: 'timeline', label: 'Timeline' },
						]}
					/>
				</div>

				{/* Nội dung */}
				{activeTab === 'table' ? (
					<Table<LichSuThaoTac>
						rowKey='_id'
						columns={columns}
						dataSource={filteredData}
						scroll={{ x: 900 }}
						pagination={{
							showSizeChanger: true,
							showTotal: (total) => `Tổng ${total} thao tác`,
							pageSize: 20,
						}}
					/>
				) : (
					<div style={{ padding: '20px 24px', maxHeight: 600, overflowY: 'auto' }}>
						{filteredData.length === 0 ? (
							<Text type='secondary'>Không có lịch sử phù hợp.</Text>
						) : (
							<Timeline
								items={filteredData.map((ls: LichSuThaoTac) => {
									const don = getDonInfo(ls.donDangKyId);
									const cfg = HANH_DONG_CONFIG[ls.hanhDong as keyof typeof HANH_DONG_CONFIG];
									return {
										color: cfg?.color || 'gray',
										dot: cfg?.icon,
										children: (
											<div style={{ paddingBottom: 12 }}>
												<div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
													<Text strong style={{ fontSize: 13 }}>
														{ls.nguoiThucHien}
													</Text>
													<Tag color={cfg?.color} style={{ fontSize: 11 }}>
														{cfg?.label}
													</Tag>
													{don && (
														<Text style={{ fontSize: 13 }}>
															đơn của <Text strong>{don.hoTen}</Text>
														</Text>
													)}
												</div>
												<div style={{ fontSize: 11, color: '#999', marginTop: 3 }}>
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
												{ls.hanhDong === 'ChangeCLB' && (
													<Space style={{ marginTop: 6 }}>
														<Tag style={{ fontSize: 11 }}>{getCLBName(ls.tuCLB)}</Tag>
														<Text type='secondary' style={{ fontSize: 11 }}>
															→
														</Text>
														<Tag color='blue' style={{ fontSize: 11 }}>
															{getCLBName(ls.denCLB)}
														</Tag>
													</Space>
												)}
											</div>
										),
									};
								})}
							/>
						)}
					</div>
				)}
			</div>
		</div>
	);
};

export default PageLichSu;
