// document.addEventListener('DOMContentLoaded', function() {
//     // Toggle sidebar
//     const toggleSidebar = document.getElementById('toggleSidebar');
//     const closeSidebar = document.getElementById('closeSidebar');
//     const sidebar = document.querySelector('.sidebar');
    
//     if (toggleSidebar && sidebar) {
//         toggleSidebar.addEventListener('click', function() {
//             sidebar.classList.toggle('active');
//         });
//     }
    
//     if (closeSidebar && sidebar) {
//         closeSidebar.addEventListener('click', function() {
//             sidebar.classList.remove('active');
//         });
//     }
    
//     // Kiểm tra đăng nhập
//     checkLoginStatus();
    
//     // Menu active khi click
//     const navLinks = document.querySelectorAll('.sidebar-nav a');
//     navLinks.forEach(link => {
//         link.addEventListener('click', function() {
//             // Bỏ active tất cả
//             navLinks.forEach(item => {
//                 item.parentElement.classList.remove('active');
//             });
            
//             // Thêm active cho mục hiện tại
//             this.parentElement.classList.add('active');
//         });
//     });
// });

// // Kiểm tra trạng thái đăng nhập
// function checkLoginStatus() {
//     const userData = JSON.parse(localStorage.getItem('userData'));
//     const token = localStorage.getItem('token');
    
//     // Nếu không có dữ liệu người dùng hoặc token, chuyển về trang đăng nhập
//     if (!userData || !token) {
//         // Lưu URL hiện tại để chuyển hướng trở lại sau khi đăng nhập
//         localStorage.setItem('redirectUrl', window.location.href);
//         window.location.href = '/pages/auth/dangnhap.html';
//         return;
//     }
    
//     // Cập nhật thông tin người dùng trên UI
//     updateUserInfo(userData);
// }

// // Cập nhật thông tin người dùng
// function updateUserInfo(userData) {
//     // Cập nhật tên người dùng
//     const userName = document.querySelector('.user-name');
//     if (userName) {
//         userName.textContent = userData.fullname || 'Người dùng';
//     }
    
//     // Cập nhật số điện thoại
//     const userPhone = document.querySelector('.user-phone');
//     if (userPhone) {
//         userPhone.textContent = userData.phone || '';
//     }
    
//     // Cập nhật avatar nếu có
//     const userAvatar = document.querySelector('.user-avatar img');
//     if (userAvatar && userData.avatar) {
//         userAvatar.src = userData.avatar;
//     }
    
//     // Cập nhật mã tài khoản
//     const accountId = document.querySelector('.account-id');
//     if (accountId) {
//         accountId.textContent = `ID: #${userData.id || '00000'}`;
//     }
    
//     // Cập nhật số dư (giả định)
//     const balanceAmount = document.querySelector('.balance-amount');
//     if (balanceAmount) {
//         balanceAmount.textContent = `${userData.balance || '0'} VNĐ`;
//     }
// }

// // Xử lý đăng xuất
// function logout() {
//     // Xóa dữ liệu người dùng
//     localStorage.removeItem('userData');
//     localStorage.removeItem('token');
    
//     // Chuyển về trang đăng nhập
//     window.location.href = '/pages/auth/dangnhap.html';
// }