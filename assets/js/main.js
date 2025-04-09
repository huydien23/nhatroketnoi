// Điều hướng trang
const burger = document.querySelector('.burger');
const nav = document.querySelector('.nav-links');
const navLinks = document.querySelectorAll('.nav-links li');

burger.addEventListener('click', () => {
    // Chuyển đổi điều hướng
    nav.classList.toggle('nav-active');

    // Hiệu ứng chuyển động
    navLinks.forEach((link, index) => {
        if (link.style.animation) {
            link.style.animation = '';
        } else {
            link.style.animation = `navLinkFade 0.5s ease forwards ${index / 7 + 0.3}s`;
        }
    });

    // Hiệu ứng chuyển động
    burger.classList.toggle('toggle');
});

// Hiệu ứng chuyển động
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Hiệu ứng chuyển động cho các phòng trọ
const roomCards = document.querySelectorAll('.room-card');
roomCards.forEach(card => {
    card.addEventListener('mouseenter', () => {
        card.style.transform = 'translateY(-10px)';
    });
    card.addEventListener('mouseleave', () => {
        card.style.transform = 'translateY(0)';
    });
});

// Nút cuộn lên trên
const scrollBtn = document.createElement('button');
scrollBtn.innerHTML = '↑';
scrollBtn.className = 'scroll-top';
document.body.appendChild(scrollBtn);

window.addEventListener('scroll', () => {
    if (window.pageYOffset > 300) {
        scrollBtn.style.display = 'block';
    } else {
        scrollBtn.style.display = 'none';
    }
});

scrollBtn.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// Thêm CSS cho nút cuộn lên trên
const style = document.createElement('style');
style.textContent = `
    .scroll-top {
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: #3498db;
        color: white;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        border: none;
        cursor: pointer;
        display: none;
        font-size: 20px;
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        transition: background-color 0.3s ease;
    }
    .scroll-top:hover {
        background: #2980b9;
    }
`;
document.head.appendChild(style);
// Kiểm tra và hiển thị thông tin người dùng đã đăng nhập
document.addEventListener('DOMContentLoaded', function() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const userProfileContainer = document.querySelector('.user-profile');
    const loginBtn = document.getElementById('loginBtn');
    
    if (currentUser && userProfileContainer) {
        // Ẩn nút đăng nhập
        if (loginBtn) {
            loginBtn.style.display = 'none';
        }
        
        // Hiển thị thông tin người dùng
        userProfileContainer.style.display = 'flex';
        
        // Hiển thị tên người dùng rút gọn
        const fullName = currentUser.fullname;
        const shortName = getShortName(fullName);
        document.getElementById('userShortName').textContent = shortName;
        
        // Hiển thị thông tin đầy đủ trong dropdown
        document.getElementById('userFullname').textContent = fullName;
        document.getElementById('userEmail').textContent = currentUser.email || '';
        
        // Thêm xử lý cho dropdown khi click
        const userAvatar = document.querySelector('.user-avatar');
        if (userAvatar) {
            userAvatar.addEventListener('click', function(event) {
                event.stopPropagation(); // Ngăn sự kiện click lan ra document
                userProfileContainer.classList.toggle('active');
            });
            
            // Đóng dropdown khi click bên ngoài
            document.addEventListener('click', function(event) {
                if (!userProfileContainer.contains(event.target)) {
                    userProfileContainer.classList.remove('active');
                }
            });
            
            // Ngăn sự kiện click bên trong dropdown lan ra
            const dropdownMenu = document.querySelector('.dropdown-menu');
            if (dropdownMenu) {
                dropdownMenu.addEventListener('click', function(event) {
                    // Không đóng dropdown khi click vào các menu item
                    // trừ khi đó là nút đăng xuất
                    if (!event.target.closest('.dropdown-item[onclick="logout()"]')) {
                        event.stopPropagation();
                    }
                });
            }
        }
    } else {
        // Hiển thị nút đăng nhập
        if (loginBtn) {
            loginBtn.style.display = 'block';
        }
        // Ẩn thông tin người dùng
        if (userProfileContainer) {
            userProfileContainer.style.display = 'none';
        }
    }
});

// Hàm lấy tên ngắn gọn từ họ tên đầy đủ
function getShortName(fullName) {
    if (!fullName) return '';
    
    // Tách tên thành các phần
    const nameParts = fullName.trim().split(' ');
    
    // Nếu chỉ có một từ, trả về từ đó
    if (nameParts.length === 1) {
        return nameParts[0];
    }
    
    // Lấy tên (phần cuối cùng)
    return nameParts[nameParts.length - 1];
}

// Hàm đăng xuất
function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = '../pages/auth/dangnhap.html';
    alert("Đăng xuất thành công!");
}

