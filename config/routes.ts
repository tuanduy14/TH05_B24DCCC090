export default [
	{
		path: '/user',
		layout: false,
		routes: [
			{
				path: '/user/login',
				layout: false,
				name: 'login',
				component: './user/Login',
			},
			{
				path: '/user',
				redirect: '/user/login',
			},
		],
	},

	///////////////////////////////////
	// DEFAULT MENU
	{
		path: '/dashboard',
		name: 'Dashboard',
		component: './TrangChu',
		icon: 'HomeOutlined',
	},
	{
		path: '/gioi-thieu',
		name: 'About',
		component: './TienIch/GioiThieu',
		hideInMenu: true,
	},
	{
		path: '/random-user',
		name: 'RandomUser',
		component: './RandomUser',
		icon: 'ArrowsAltOutlined',
	},
	{
		path: '/quan-ly-clb',
		name: 'Quản lý CLB',
		icon: 'TeamOutlined',
		locale: false,
		routes: [
			{
				path: '/quan-ly-clb',
				redirect: '/quan-ly-clb/cau-lac-bo',
			},
			{
				path: '/quan-ly-clb/cau-lac-bo',
				name: 'Câu lạc bộ',
				locale: false,
				component: './QuanLyCLB/CauLacBo',
			},
			{
				path: '/quan-ly-clb/don-dang-ky',
				name: 'Đơn đăng ký',
				locale: false,
				component: './QuanLyCLB/DonDangKy',
			},
			{
				path: '/quan-ly-clb/thanh-vien',
				name: 'Thành viên',
				locale: false,
				component: './QuanLyCLB/ThanhVien',
			},
			{
				path: '/quan-ly-clb/lich-su',
				name: 'Lịch sử thao tác',
				locale: false,
				component: './QuanLyCLB/LichSu',
			},
			{
				path: '/quan-ly-clb/bao-cao',
				name: 'Báo cáo thống kê',
				locale: false,
				component: './QuanLyCLB/BaoCao',
			},
		],
	},

	// DANH MUC HE THONG
	// {
	// 	name: 'DanhMuc',
	// 	path: '/danh-muc',
	// 	icon: 'copy',
	// 	routes: [
	// 		{
	// 			name: 'ChucVu',
	// 			path: 'chuc-vu',
	// 			component: './DanhMuc/ChucVu',
	// 		},
	// 	],
	// },

	{
		path: '/notification',
		routes: [
			{
				path: './subscribe',
				exact: true,
				component: './ThongBao/Subscribe',
			},
			{
				path: './check',
				exact: true,
				component: './ThongBao/Check',
			},
			{
				path: './',
				exact: true,
				component: './ThongBao/NotifOneSignal',
			},
		],
		layout: false,
		hideInMenu: true,
	},
	{
		path: '/',
	},
	{
		path: '/403',
		component: './exception/403/403Page',
		layout: false,
	},
	{
		path: '/hold-on',
		component: './exception/DangCapNhat',
		layout: false,
	},
	{
		component: './exception/404',
	},
];
