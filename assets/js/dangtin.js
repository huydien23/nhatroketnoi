// document.addEventListener('DOMContentLoaded', function () {
//     const postForm = document.getElementById('postForm');

//     // Kiểm tra người dùng đã đăng nhập
//     const user = JSON.parse(localStorage.getItem('user'));
//     if (!user) {
//         alert('Bạn cần đăng nhập để đăng tin!');
//         window.location.href = '../auth/dangnhap.html';
//         return;
//     }

//     // Xử lý sự kiện submit form
//     postForm.addEventListener('submit', function (event) {
//         event.preventDefault();

//         // Lấy dữ liệu từ form
//         const formData = new FormData(postForm);
//         const post = {
//             title: formData.get('title'),
//             description: formData.get('description'),
//             price: formData.get('price'),
//             location: formData.get('location'),
//             image: formData.get('image').name, // Lấy tên file ảnh
//             userId: user.id, // Gắn ID người dùng
//         };

//         // Lưu tin vào localStorage (hoặc gửi lên server)
//         let posts = JSON.parse(localStorage.getItem('posts')) || [];
//         posts.push(post);
//         localStorage.setItem('posts', JSON.stringify(posts));

//         alert('Đăng tin thành công!');
//         postForm.reset();
//     });
// });