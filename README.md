# Nhà Trọ Kết Nối

Website tìm kiếm phòng trọ sinh viên dành cho thị trường Cần Thơ. Kết nối nhanh chóng giữa người thuê trọ và chủ nhà trọ, cung cấp thông tin chi tiết về các phòng trọ gần các trường đại học lớn tại Cần Thơ.

![Logo Nhà Trọ Kết Nối](./assets/image/logo.svg)

## 📋 Tính năng chính

- **Tìm kiếm phòng trọ**: Tìm kiếm theo khu vực, giá cả, diện tích và các tiện ích
- **Đăng tin cho thuê**: Chủ trọ có thể đăng tin phòng trọ với đầy đủ thông tin và hình ảnh
- **Hệ thống đánh giá**: Người dùng có thể đánh giá và xem đánh giá về phòng trọ
- **Bản đồ tương tác**: Xem vị trí phòng trọ trên bản đồ và tính khoảng cách đến trường học
- **Chatbot hỗ trợ**: Trả lời tự động các câu hỏi thường gặp của người dùng
- **Bài viết tin tức**: Chia sẻ kinh nghiệm thuê trọ, thông tin thị trường và cộng đồng

## 🛠️ Công nghệ sử dụng

- **Frontend**: HTML5, CSS3, JavaScript (ES6+), jQuery
- **Backend**: Firebase (Authentication, Realtime Database, Storage)
- **Responsive Design**: Mobile-first approach
- **APIs**: Firebase API

## 🚀 Cài đặt và chạy dự án

### Yêu cầu hệ thống
- Node.js (v14.0.0 trở lên)
- NPM (v6.0.0 trở lên)
- Firebase CLI (tùy chọn, nếu muốn triển khai)

### Các bước cài đặt

1. **Clone dự án từ GitHub**
   ```bash
   git clone https://github.com/yourusername/nhatroketnoi.git
   cd nhatroketnoi
   ```

2. **Cài đặt các dependencies (nếu cần)**
   ```bash
   cd backend
   npm install
   ```

3. **Cấu hình Firebase**
   - Tạo project Firebase tại [console.firebase.google.com](https://console.firebase.google.com)
   - Kích hoạt Authentication, Realtime Database và Storage
   - Cập nhật cấu hình Firebase trong file `assets/js/main.js`

4. **Khởi chạy dự án**
   - Để chạy dự án ở môi trường phát triển, bạn có thể sử dụng Live Server của VS Code hoặc bất kỳ server tĩnh nào khác
   - Truy cập http://localhost:5500 (hoặc địa chỉ được cấu hình) trong trình duyệt

## 📱 Tương thích

- Google Chrome (phiên bản mới nhất)
- Mozilla Firefox (phiên bản mới nhất)
- Microsoft Edge (phiên bản mới nhất)
- Safari (phiên bản mới nhất)
- Responsive trên tất cả các thiết bị di động

## 🔒 Bảo mật

- Xác thực người dùng qua Firebase Authentication
- Mã hóa dữ liệu người dùng
- An toàn thông tin cá nhân và tính riêng tư



## 🤝 Đóng góp

Mọi đóng góp đều được hoan nghênh! Nếu bạn muốn đóng góp vào dự án, vui lòng:

1. Fork dự án
2. Tạo branch tính năng (`git checkout -b feature/amazing-feature`)
3. Commit thay đổi của bạn (`git commit -m 'Add some amazing feature'`)
4. Push lên branch (`git push origin feature/amazing-feature`)
5. Tạo một Pull Request

## 📄 Giấy phép

Dự án này được phân phối dưới Giấy phép MIT. Xem file `LICENSE` để biết thêm thông tin.

## 📞 Liên hệ

Huỳnh Điền - huydien23@nhatroketnoi.id.vn

Website: [https://nhatroketnoi.id.vn](https://nhatroketnoi.id.vn)
