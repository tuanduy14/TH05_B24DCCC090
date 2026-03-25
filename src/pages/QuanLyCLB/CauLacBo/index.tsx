import React, { useState } from 'react';
import {
	Button,
	Modal,
	Form,
	Input,
	DatePicker,
	Switch,
	Tag,
	Tooltip,
	Popconfirm,
	Upload,
	message as antMessage,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, TeamOutlined, UploadOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd';
import { useModel, history } from 'umi';
import moment from 'moment';
import TinyEditor from '@/components/TinyEditor';
import type { CauLacBo } from '../types';
import { HOAT_DONG_CONFIG } from '../types';

const CauLacBoPage: React.FC = () => {
	const { cauLacBo, themCLB, suaCLB, xoaCLB } = useModel('clb.caulacbo');
	const [modalVisible, setModalVisible] = useState(false);
	const [editingRecord, setEditingRecord] = useState<CauLacBo | null>(null);
	const [form] = Form.useForm();
	const [fileList, setFileList] = useState<UploadFile[]>([]);

	const handleOpenModal = (record?: CauLacBo) => {
		if (record) {
			setEditingRecord(record);
			form.setFieldsValue({
				...record,
				ngayThanhLap: moment(record.ngayThanhLap),
			});
			// Set ảnh nếu có
			if (record.anhDaiDien) {
				setFileList([
					{
						uid: '-1',
						name: 'image.png',
						status: 'done',
						url: record.anhDaiDien,
					},
				]);
			}
		} else {
			setEditingRecord(null);
			form.resetFields();
			setFileList([]);
		}
		setModalVisible(true);
	};

	const handleSubmit = async () => {
		try {
			const values = await form.validateFields();
			const data = {
				...values,
				ngayThanhLap: values.ngayThanhLap.format('YYYY-MM-DD'),
				anhDaiDien: fileList.length > 0 ? fileList[0].url || fileList[0].thumbUrl : undefined,
			};

			if (editingRecord) {
				suaCLB(editingRecord._id, data);
			} else {
				themCLB(data);
			}

			setModalVisible(false);
			form.resetFields();
			setFileList([]);
		} catch (error) {
			console.error('Validation failed:', error);
		}
	};

	// Upload ảnh
	const handleUploadChange = ({ fileList: newFileList }: any) => {
		setFileList(newFileList);
	};

	const beforeUpload = (file: File) => {
		const isImage = file.type.startsWith('image/');
		if (!isImage) {
			antMessage.error('Chỉ được upload file ảnh!');
			return false;
		}
		const isLt2M = file.size / 1024 / 1024 < 2;
		if (!isLt2M) {
			antMessage.error('Ảnh phải nhỏ hơn 2MB!');
			return false;
		}

		// Convert to base64
		const reader = new FileReader();
		reader.readAsDataURL(file);
		reader.onload = () => {
			setFileList([
				{
					uid: file.uid,
					name: file.name,
					status: 'done',
					url: reader.result as string,
				},
			]);
		};

		return false; // Không upload lên server
	};

	const handleXemThanhVien = (clbId: string) => {
		history.push(`/quan-ly-clb/thanh-vien?clbId=${clbId}`);
	};

	return (
		<div style={{ padding: '24px' }}>
			<div style={{ marginBottom: 16 }}>
				<Button type='primary' icon={<PlusOutlined />} onClick={() => handleOpenModal()}>
					Thêm câu lạc bộ
				</Button>
			</div>

			<table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #f0f0f0' }}>
				<thead>
					<tr style={{ background: '#fafafa', borderBottom: '1px solid #f0f0f0' }}>
						<th style={{ padding: '12px', textAlign: 'center', width: '80px' }}>Ảnh</th>
						<th style={{ padding: '12px', textAlign: 'left', width: '200px' }}>Tên CLB</th>
						<th style={{ padding: '12px', textAlign: 'left', width: '120px' }}>Ngày thành lập</th>
						<th style={{ padding: '12px', textAlign: 'left', width: '150px' }}>Chủ nhiệm</th>
						<th style={{ padding: '12px', textAlign: 'center', width: '100px' }}>Hoạt động</th>
						<th style={{ padding: '12px', textAlign: 'left' }}>Mô tả</th>
						<th style={{ padding: '12px', textAlign: 'center', width: '180px' }}>Thao tác</th>
					</tr>
				</thead>
				<tbody>
					{cauLacBo.length === 0 ? (
						<tr>
							<td colSpan={7} style={{ padding: '24px', textAlign: 'center', color: '#999' }}>
								Chưa có câu lạc bộ nào
							</td>
						</tr>
					) : (
						cauLacBo.map((clb) => (
							<tr key={clb._id} style={{ borderBottom: '1px solid #f0f0f0' }}>
								<td style={{ padding: '12px', textAlign: 'center' }}>
									{clb.anhDaiDien ? (
										<img
											src={clb.anhDaiDien}
											alt={clb.tenCLB}
											style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: '8px' }}
										/>
									) : (
										<div
											style={{
												width: 60,
												height: 60,
												background: '#f0f0f0',
												borderRadius: '8px',
												display: 'flex',
												alignItems: 'center',
												justifyContent: 'center',
											}}
										>
											<TeamOutlined style={{ fontSize: 24, color: '#999' }} />
										</div>
									)}
								</td>
								<td style={{ padding: '12px', fontWeight: 500 }}>{clb.tenCLB}</td>
								<td style={{ padding: '12px' }}>{moment(clb.ngayThanhLap).format('DD/MM/YYYY')}</td>
								<td style={{ padding: '12px' }}>{clb.chuNhiem}</td>
								<td style={{ padding: '12px', textAlign: 'center' }}>
									<Tag color={HOAT_DONG_CONFIG[String(clb.hoatDong) as 'true' | 'false'].color}>
										{HOAT_DONG_CONFIG[String(clb.hoatDong) as 'true' | 'false'].label}
									</Tag>
								</td>
								<td style={{ padding: '12px' }}>
									<div
										dangerouslySetInnerHTML={{ __html: clb.moTa || '-' }}
										style={{ maxHeight: '60px', overflow: 'hidden' }}
									/>
								</td>
								<td style={{ padding: '12px', textAlign: 'center' }}>
									<Tooltip title='Xem thành viên'>
										<Button type='link' icon={<TeamOutlined />} onClick={() => handleXemThanhVien(clb._id)}>
											Thành viên
										</Button>
									</Tooltip>
									<Tooltip title='Chỉnh sửa'>
										<Button type='link' icon={<EditOutlined />} onClick={() => handleOpenModal(clb)} />
									</Tooltip>
									<Tooltip title='Xóa'>
										<Popconfirm
											title='Bạn có chắc muốn xóa CLB này?'
											onConfirm={() => xoaCLB(clb._id)}
											okText='Xóa'
											cancelText='Hủy'
										>
											<Button type='link' danger icon={<DeleteOutlined />} />
										</Popconfirm>
									</Tooltip>
								</td>
							</tr>
						))
					)}
				</tbody>
			</table>

			{/* Modal thêm/sửa */}
			<Modal
				title={editingRecord ? 'Chỉnh sửa câu lạc bộ' : 'Thêm câu lạc bộ mới'}
				open={modalVisible}
				onOk={handleSubmit}
				onCancel={() => {
					setModalVisible(false);
					form.resetFields();
					setFileList([]);
				}}
				okText={editingRecord ? 'Cập nhật' : 'Thêm'}
				cancelText='Hủy'
				width={800}
			>
				<Form form={form} layout='vertical'>
					<Form.Item label='Ảnh đại diện'>
						<Upload
							listType='picture-card'
							fileList={fileList}
							onChange={handleUploadChange}
							beforeUpload={beforeUpload}
							maxCount={1}
						>
							{fileList.length === 0 && (
								<div>
									<UploadOutlined />
									<div style={{ marginTop: 8 }}>Upload</div>
								</div>
							)}
						</Upload>
					</Form.Item>

					<Form.Item
						label='Tên câu lạc bộ'
						name='tenCLB'
						rules={[{ required: true, message: 'Vui lòng nhập tên CLB!' }]}
					>
						<Input placeholder='VD: CLB Tin học' />
					</Form.Item>

					<Form.Item
						label='Ngày thành lập'
						name='ngayThanhLap'
						rules={[{ required: true, message: 'Vui lòng chọn ngày thành lập!' }]}
					>
						<DatePicker format='DD/MM/YYYY' style={{ width: '100%' }} />
					</Form.Item>

					<Form.Item
						label='Chủ nhiệm CLB'
						name='chuNhiem'
						rules={[{ required: true, message: 'Vui lòng nhập tên chủ nhiệm!' }]}
					>
						<Input placeholder='VD: Nguyễn Văn A' />
					</Form.Item>

					<Form.Item label='Hoạt động' name='hoatDong' valuePropName='checked' initialValue={true}>
						<Switch checkedChildren='Có' unCheckedChildren='Không' />
					</Form.Item>

					<Form.Item label='Mô tả' name='moTa'>
						<TinyEditor
							value={form.getFieldValue('moTa')}
							onChange={(content: string) => form.setFieldsValue({ moTa: content })}
						/>
					</Form.Item>
				</Form>
			</Modal>
		</div>
	);
};

export default CauLacBoPage;
