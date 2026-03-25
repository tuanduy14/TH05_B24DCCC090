import { useEffect } from 'react';
import { history } from 'umi';

/**
 * index.tsx — Entry point cho module Quản lý CLB
 * Tự động redirect về trang danh sách câu lạc bộ
 */
const QuanLyCLBIndex: React.FC = () => {
	useEffect(() => {
		history.replace('/quan-ly-clb/cau-lac-bo');
	}, []);

	return null;
};

export default QuanLyCLBIndex;
