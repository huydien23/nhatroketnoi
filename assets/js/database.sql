-- Tạo cơ sở dữ liệu
CREATE DATABASE NhaTroKetNoi;
GO

USE NhaTroKetNoi;
GO

-- Bảng NguoiDung
CREATE TABLE NguoiDung (
    MaNguoiDung INT IDENTITY(1,1) PRIMARY KEY,
    TenDangNhap NVARCHAR(50) NOT NULL UNIQUE,
    MatKhau NVARCHAR(100) NOT NULL,
    HoTen NVARCHAR(100) NOT NULL,
    Email NVARCHAR(100) NOT NULL UNIQUE,
    SoDienThoai NVARCHAR(15),
    AnhDaiDien NVARCHAR(255) DEFAULT 'default-avatar.jpg',
    LoaiNguoiDung NVARCHAR(20) DEFAULT N'Người thuê', -- 'Người thuê', 'Chủ trọ', 'Quản trị viên'
    NgayTao DATETIME DEFAULT GETDATE(),
    NgayCapNhat DATETIME DEFAULT GETDATE()
);
GO

-- Bảng QuanHuyen
CREATE TABLE QuanHuyen (
    MaQuanHuyen INT IDENTITY(1,1) PRIMARY KEY,
    TenQuanHuyen NVARCHAR(100) NOT NULL,
    TenThanhPho NVARCHAR(100) NOT NULL,
    MoTa NVARCHAR(500)
);
GO

-- Bảng PhuongXa
CREATE TABLE PhuongXa (
    MaPhuongXa INT IDENTITY(1,1) PRIMARY KEY,
    TenPhuongXa NVARCHAR(100) NOT NULL,
    MaQuanHuyen INT NOT NULL,
    FOREIGN KEY (MaQuanHuyen) REFERENCES QuanHuyen(MaQuanHuyen)
);
GO

-- Bảng LoaiPhong
CREATE TABLE LoaiPhong (
    MaLoaiPhong INT IDENTITY(1,1) PRIMARY KEY,
    TenLoaiPhong NVARCHAR(100) NOT NULL, -- 'Phòng trọ', 'Chung cư mini', 'Nhà nguyên căn', 'Homestay'
    MoTa NVARCHAR(500)
);
GO

-- Bảng TienNghi
CREATE TABLE TienNghi (
    MaTienNghi INT IDENTITY(1,1) PRIMARY KEY,
    TenTienNghi NVARCHAR(100) NOT NULL, -- 'Wi-Fi', 'Máy lạnh', 'Tủ lạnh', 'Nước nóng', 'Chỗ để xe'
    BieuTuong NVARCHAR(100) -- Font awesome icon
);
GO

-- Bảng PhongTro
CREATE TABLE PhongTro (
    MaPhong INT IDENTITY(1,1) PRIMARY KEY,
    MaChuTro INT NOT NULL,
    TieuDe NVARCHAR(255) NOT NULL,
    MoTa NVARCHAR(MAX),
    MaLoaiPhong INT NOT NULL,
    DienTich FLOAT NOT NULL, -- m²
    GiaThue DECIMAL(12, 2) NOT NULL, -- VNĐ/tháng
    TienCoc DECIMAL(12, 2), -- Tiền cọc
    DiaChi NVARCHAR(255) NOT NULL,
    MaPhuongXa INT NOT NULL,
    ViDo DECIMAL(10, 8), -- Vị trí trên bản đồ
    KinhDo DECIMAL(11, 8),
    LoaiGiuong NVARCHAR(50), -- 'Đơn', 'Đôi', 'Không có giường'
    NhaVeSinh NVARCHAR(50), -- 'Khép kín', 'Chung'
    NhaBep NVARCHAR(50), -- 'Riêng', 'Chung', 'Không có'
    MayLanh BIT DEFAULT 0, -- Có máy lạnh không
    BanCong BIT DEFAULT 0, -- Có ban công không
    GiaDien DECIMAL(10, 2), -- Giá điện
    GiaNuoc DECIMAL(10, 2), -- Giá nước
    TrangThai NVARCHAR(50) DEFAULT N'Còn trống', -- 'Còn trống', 'Đã thuê', 'Đang bảo trì'
    NoiBat BIT DEFAULT 0, -- Phòng nổi bật
    TrangThaiDuyet NVARCHAR(50) DEFAULT N'Chờ duyệt', -- 'Chờ duyệt', 'Đã duyệt', 'Từ chối'
    LuotXem INT DEFAULT 0,
    NgayTao DATETIME DEFAULT GETDATE(),
    NgayCapNhat DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (MaChuTro) REFERENCES NguoiDung(MaNguoiDung),
    FOREIGN KEY (MaLoaiPhong) REFERENCES LoaiPhong(MaLoaiPhong),
    FOREIGN KEY (MaPhuongXa) REFERENCES PhuongXa(MaPhuongXa)
);
GO

-- Bảng HinhAnhPhong
CREATE TABLE HinhAnhPhong (
    MaHinhAnh INT IDENTITY(1,1) PRIMARY KEY,
    MaPhong INT NOT NULL,
    DuongDanAnh NVARCHAR(255) NOT NULL,
    AnhBia BIT DEFAULT 0, -- Ảnh đại diện
    FOREIGN KEY (MaPhong) REFERENCES PhongTro(MaPhong) ON DELETE CASCADE
);
GO

-- Bảng TienNghiPhong (Tiện nghi của từng phòng)
CREATE TABLE TienNghiPhong (
    MaPhong INT NOT NULL,
    MaTienNghi INT NOT NULL,
    PRIMARY KEY (MaPhong, MaTienNghi),
    FOREIGN KEY (MaPhong) REFERENCES PhongTro(MaPhong) ON DELETE CASCADE,
    FOREIGN KEY (MaTienNghi) REFERENCES TienNghi(MaTienNghi)
);
GO

-- Bảng DanhGia
CREATE TABLE DanhGia (
    MaDanhGia INT IDENTITY(1,1) PRIMARY KEY,
    MaPhong INT NOT NULL,
    MaNguoiDung INT NOT NULL,
    SoSao INT NOT NULL CHECK (SoSao BETWEEN 1 AND 5),
    NoiDung NVARCHAR(500),
    NgayTao DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (MaPhong) REFERENCES PhongTro(MaPhong),
    FOREIGN KEY (MaNguoiDung) REFERENCES NguoiDung(MaNguoiDung)
);
GO

-- Bảng PhongDaLuu
CREATE TABLE PhongDaLuu (
    MaNguoiDung INT NOT NULL,
    MaPhong INT NOT NULL,
    NgayLuu DATETIME DEFAULT GETDATE(),
    PRIMARY KEY (MaNguoiDung, MaPhong),
    FOREIGN KEY (MaNguoiDung) REFERENCES NguoiDung(MaNguoiDung),
    FOREIGN KEY (MaPhong) REFERENCES PhongTro(MaPhong) ON DELETE CASCADE
);
GO

-- Bảng TinNhan
CREATE TABLE TinNhan (
    MaTinNhan INT IDENTITY(1,1) PRIMARY KEY,
    MaNguoiGui INT NOT NULL,
    MaNguoiNhan INT NOT NULL,
    MaPhong INT,
    NoiDung NVARCHAR(MAX) NOT NULL,
    DaDoc BIT DEFAULT 0,
    NgayGui DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (MaNguoiGui) REFERENCES NguoiDung(MaNguoiDung),
    FOREIGN KEY (MaNguoiNhan) REFERENCES NguoiDung(MaNguoiDung),
    FOREIGN KEY (MaPhong) REFERENCES PhongTro(MaPhong)
);
GO

-- Bảng TinTuc
CREATE TABLE TinTuc (
    MaTinTuc INT IDENTITY(1,1) PRIMARY KEY,
    TieuDe NVARCHAR(255) NOT NULL,
    NoiDung NVARCHAR(MAX) NOT NULL,
    DuongDanAnh NVARCHAR(255),
    MaTacGia INT NOT NULL,
    LuotXem INT DEFAULT 0,
    NgayTao DATETIME DEFAULT GETDATE(),
    NgayCapNhat DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (MaTacGia) REFERENCES NguoiDung(MaNguoiDung)
);
GO

-- Dữ liệu mẫu: Quận/Huyện
INSERT INTO QuanHuyen (TenQuanHuyen, TenThanhPho, MoTa) VALUES
(N'Ninh Kiều', N'Cần Thơ', N'Quận trung tâm của thành phố Cần Thơ'),
(N'Cái Răng', N'Cần Thơ', N'Quận nổi tiếng với chợ nổi Cái Răng'),
(N'Bình Thủy', N'Cần Thơ', N'Quận có nhiều khu công nghiệp'),
(N'Ô Môn', N'Cần Thơ', N'Quận công nghiệp'),
(N'Thốt Nốt', N'Cần Thơ', N'Quận ven sông');
GO

-- Dữ liệu mẫu: Phường/Xã
INSERT INTO PhuongXa (TenPhuongXa, MaQuanHuyen) VALUES
-- Ninh Kiều
(N'An Cư', 1),
(N'An Hòa', 1),
(N'An Khánh', 1),
(N'An Nghiệp', 1),
(N'An Phú', 1),
(N'Tân An', 1),
(N'Thới Bình', 1),
(N'Xuân Khánh', 1),
-- Cái Răng
(N'Ba Láng', 2),
(N'Hưng Phú', 2),
(N'Hưng Thạnh', 2),
(N'Lê Bình', 2),
(N'Phú Thứ', 2),
(N'Tân Phú', 2),
-- Bình Thủy
(N'An Thới', 3),
(N'Bình Thủy', 3),
(N'Bùi Hữu Nghĩa', 3),
(N'Long Hòa', 3),
(N'Long Tuyền', 3),
(N'Thới An Đông', 3);
GO

-- Dữ liệu mẫu: Loại phòng
INSERT INTO LoaiPhong (TenLoaiPhong, MoTa) VALUES
(N'Phòng trọ', N'Phòng đơn giản, giá cả phải chăng'),
(N'Chung cư mini', N'Căn hộ nhỏ với đầy đủ tiện nghi'),
(N'Nhà nguyên căn', N'Nhà cho thuê nguyên căn'),
(N'Homestay', N'Phòng thuê theo phong cách homestay'),
(N'Ký túc xá', N'Phòng ở dành cho sinh viên');
GO

-- Dữ liệu mẫu: Tiện nghi
INSERT INTO TienNghi (TenTienNghi, BieuTuong) VALUES
(N'Wi-Fi', 'fa-wifi'),
(N'Máy lạnh', 'fa-snowflake'),
(N'Tủ lạnh', 'fa-refrigerator'),
(N'Nước nóng', 'fa-hot-tub'),
(N'Máy giặt', 'fa-washing-machine'),
(N'Nhà bếp', 'fa-kitchen-set'),
(N'Chỗ để xe', 'fa-motorcycle'),
(N'Camera an ninh', 'fa-video'),
(N'Thang máy', 'fa-elevator'),
(N'TV', 'fa-tv');
GO

-- Dữ liệu mẫu: Người dùng
INSERT INTO NguoiDung (TenDangNhap, MatKhau, HoTen, Email, SoDienThoai, LoaiNguoiDung) VALUES
(N'admin', N'$2a$10$dYJ9JcdxtCIXHWQAJVbN3OaBYMfK5xLg1Z0T3Sy2MxHKHKXsLW7vu', N'Quản trị viên', N'admin@nhatroketnoi.com', N'0909123456', N'Quản trị viên'),
(N'chutro1', N'$2a$10$dYJ9JcdxtCIXHWQAJVbN3OaBYMfK5xLg1Z0T3Sy2MxHKHKXsLW7vu', N'Nguyễn Văn An', N'chutro1@gmail.com', N'0901234567', N'Chủ trọ'),
(N'chutro2', N'$2a$10$dYJ9JcdxtCIXHWQAJVbN3OaBYMfK5xLg1Z0T3Sy2MxHKHKXsLW7vu', N'Trần Thị Bình', N'chutro2@gmail.com', N'0912345678', N'Chủ trọ'),
(N'nguyenvanc', N'$2a$10$dYJ9JcdxtCIXHWQAJVbN3OaBYMfK5xLg1Z0T3Sy2MxHKHKXsLW7vu', N'Nguyễn Văn C', N'nguyenvanc@gmail.com', N'0923456789', N'Người thuê'),
(N'tranthid', N'$2a$10$dYJ9JcdxtCIXHWQAJVbN3OaBYMfK5xLg1Z0T3Sy2MxHKHKXsLW7vu', N'Trần Thị D', N'tranthid@gmail.com', N'0934567890', N'Người thuê');
GO

-- Dữ liệu mẫu: Phòng trọ
INSERT INTO PhongTro (MaChuTro, TieuDe, MoTa, MaLoaiPhong, DienTich, GiaThue, TienCoc, DiaChi, MaPhuongXa, LoaiGiuong, NhaVeSinh, NhaBep, MayLanh, BanCong, GiaDien, GiaNuoc, TrangThai, NoiBat, TrangThaiDuyet)
VALUES
-- Phòng trọ Ninh Kiều
(2, N'Phòng trọ mới xây gần ĐH Cần Thơ', N'Phòng trọ mới xây, sạch sẽ, thoáng mát, có ban công, gần Đại học Cần Thơ và chợ Xuân Khánh. Phù hợp cho sinh viên hoặc người đi làm.', 1, 20, 1500000, 1000000, N'123 Đường 3/2', 8, N'Đơn', N'Khép kín', N'Chung', 1, 1, 3500, 15000, N'Còn trống', 1, N'Đã duyệt'),
(2, N'Phòng trọ đầy đủ nội thất Tân An', N'Phòng trọ đầy đủ nội thất, có gác lửng, toilet riêng, máy lạnh, tủ lạnh, kệ bếp. Khu vực an ninh, yên tĩnh.', 1, 25, 2000000, 1500000, N'45 Nguyễn Trãi', 6, N'Đôi', N'Khép kín', N'Riêng', 1, 0, 4000, 20000, N'Còn trống', 1, N'Đã duyệt'),
(2, N'Chung cư mini full nội thất An Khánh', N'Chung cư mini mới xây, thiết kế hiện đại, đầy đủ nội thất cao cấp, có thang máy, bảo vệ 24/7.', 2, 35, 3500000, 3500000, N'78 Mậu Thân', 3, N'Đôi', N'Khép kín', N'Riêng', 1, 1, 4000, 20000, N'Còn trống', 1, N'Đã duyệt'),
(3, N'Nhà nguyên căn khu An Cư', N'Nhà nguyên căn 1 trệt 1 lầu, 2 phòng ngủ, 2 toilet, phòng khách, bếp. Khu dân cư an ninh, gần trung tâm.', 3, 65, 6000000, 6000000, N'25 Trần Hưng Đạo', 1, N'Đôi', N'Khép kín', N'Riêng', 1, 1, 3500, 15000, N'Còn trống', 0, N'Đã duyệt'),
(3, N'Homestay giá rẻ trung tâm Ninh Kiều', N'Homestay phong cách trẻ trung, trang trí xinh xắn, view đẹp nhìn ra sông. Gần chợ đêm Ninh Kiều, thuận tiện đi lại.', 4, 30, 2500000, 2000000, N'56 Hai Bà Trưng', 2, N'Đôi', N'Khép kín', N'Riêng', 1, 1, 4000, 20000, N'Còn trống', 1, N'Đã duyệt'),

-- Phòng trọ Cái Răng
(2, N'Phòng trọ sinh viên gần chợ Cái Răng', N'Phòng trọ giá rẻ dành cho sinh viên, gần chợ Cái Răng và các trường đại học. Có nhà xe rộng rãi, wifi miễn phí.', 1, 18, 1200000, 1000000, N'234 Đường Cái Răng', 9, N'Đơn', N'Chung', N'Chung', 0, 0, 3500, 15000, N'Còn trống', 0, N'Đã duyệt'),
(3, N'Chung cư mini Hưng Phú', N'Chung cư mini cao cấp, nội thất đầy đủ, có bảo vệ 24/7, thang máy, camera an ninh. Gần khu công nghiệp Hưng Phú.', 2, 40, 4000000, 4000000, N'56 Hưng Phú', 10, N'Đôi', N'Khép kín', N'Riêng', 1, 1, 4000, 20000, N'Còn trống', 1, N'Đã duyệt'),
(3, N'Nhà nguyên căn khu Lê Bình', N'Nhà nguyên căn 2 tầng, 3 phòng ngủ, sân trước, sân sau, khu dân cư an ninh, yên tĩnh, gần chợ.', 3, 85, 7500000, 7500000, N'78 Lê Bình', 12, N'Đôi', N'Khép kín', N'Riêng', 1, 1, 3500, 15000, N'Còn trống', 0, N'Đã duyệt'),

-- Phòng trọ Bình Thủy
(2, N'Phòng trọ mới Bình Thủy', N'Phòng trọ mới xây, rộng rãi, sạch sẽ, thoáng mát, có máy lạnh, nước nóng, wifi miễn phí.', 1, 22, 1800000, 1500000, N'123 Bình Thủy', 17, N'Đơn', N'Khép kín', N'Chung', 1, 0, 3500, 15000, N'Còn trống', 0, N'Đã duyệt'),
(2, N'Chung cư mini An Thới', N'Chung cư mini cao cấp, nội thất đầy đủ, có bảo vệ 24/7, camera an ninh. Gần Đại học Nam Cần Thơ.', 2, 38, 3800000, 3800000, N'56 An Thới', 15, N'Đôi', N'Khép kín', N'Riêng', 1, 1, 4000, 20000, N'Còn trống', 0, N'Đã duyệt');
GO

-- Dữ liệu mẫu: Hình ảnh phòng
INSERT INTO HinhAnhPhong (MaPhong, DuongDanAnh, AnhBia) VALUES
(1, 'phong1_1.jpg', 1),
(1, 'phong1_2.jpg', 0),
(1, 'phong1_3.jpg', 0),
(2, 'phong2_1.jpg', 1),
(2, 'phong2_2.jpg', 0),
(3, 'phong3_1.jpg', 1),
(3, 'phong3_2.jpg', 0),
(3, 'phong3_3.jpg', 0),
(4, 'phong4_1.jpg', 1),
(4, 'phong4_2.jpg', 0),
(5, 'phong5_1.jpg', 1),
(5, 'phong5_2.jpg', 0),
(6, 'phong6_1.jpg', 1),
(7, 'phong7_1.jpg', 1),
(8, 'phong8_1.jpg', 1),
(9, 'phong9_1.jpg', 1),
(10, 'phong10_1.jpg', 1);
GO

-- Dữ liệu mẫu: Tiện nghi của từng phòng
INSERT INTO TienNghiPhong (MaPhong, MaTienNghi) VALUES
-- Phòng 1 có Wi-Fi, Máy lạnh, Nước nóng, Chỗ để xe
(1, 1), (1, 2), (1, 4), (1, 7),
-- Phòng 2 có Wi-Fi, Máy lạnh, Tủ lạnh, Nước nóng, Chỗ để xe
(2, 1), (2, 2), (2, 3), (2, 4), (2, 7),
-- Phòng 3 có Wi-Fi, Máy lạnh, Tủ lạnh, Nước nóng, Máy giặt, Nhà bếp, Chỗ để xe, Thang máy, Camera an ninh
(3, 1), (3, 2), (3, 3), (3, 4), (3, 5), (3, 6), (3, 7), (3, 8), (3, 9),
-- Các phòng khác tương tự
(4, 1), (4, 2), (4, 3), (4, 4), (4, 5), (4, 6), (4, 7), (4, 8),
(5, 1), (5, 2), (5, 3), (5, 4), (5, 6), (5, 7), (5, 10),
(6, 1), (6, 4), (6, 7),
(7, 1), (7, 2), (7, 3), (7, 4), (7, 5), (7, 6), (7, 7), (7, 8), (7, 9), (7, 10),
(8, 1), (8, 2), (8, 3), (8, 4), (8, 5), (8, 6), (8, 7),
(9, 1), (9, 2), (9, 4), (9, 7),
(10, 1), (10, 2), (10, 3), (10, 4), (10, 5), (10, 6), (10, 7), (10, 8);
GO

-- Dữ liệu mẫu: Đánh giá
INSERT INTO DanhGia (MaPhong, MaNguoiDung, SoSao, NoiDung) VALUES
(1, 4, 5, N'Phòng rất tốt, sạch sẽ, chủ nhà thân thiện'),
(1, 5, 4, N'Phòng thoáng mát, vị trí thuận tiện'),
(2, 4, 5, N'Phòng đẹp, nội thất đầy đủ, giá cả hợp lý'),
(3, 5, 5, N'Căn hộ rất đẹp, hiện đại, an ninh tốt'),
(4, 4, 4, N'Nhà rộng rãi, vị trí trung tâm, thuận tiện đi lại');
GO

-- Dữ liệu mẫu: Tin tức
INSERT INTO TinTuc (TieuDe, NoiDung, DuongDanAnh, MaTacGia) VALUES
(N'Mẹo tìm phòng trọ giá rẻ cho sinh viên', N'Nội dung bài viết về mẹo tìm phòng trọ giá rẻ dành cho sinh viên...', 'tintuc1.jpg', 1),
(N'Cách nhận biết phòng trọ an toàn', N'Nội dung bài viết về cách nhận biết phòng trọ an toàn...', 'tintuc2.jpg', 1),
(N'Thị trường nhà trọ Cần Thơ năm 2023', N'Nội dung bài viết về thị trường nhà trọ Cần Thơ năm 2023...', 'tintuc3.jpg', 1);
GO