// Hàm kiểm tra định dạng form
function validateForm(formId) {
    const form = document.getElementById(formId);
    if (!form) return false;
    
    const inputs = form.querySelectorAll('input[required]');
    let isValid = true;

    inputs.forEach(input => {
        if (!input.value.trim()) {
            isValid = false;
            input.classList.add('error');
        } else {
            input.classList.remove('error');
        }
    });

    return isValid;
}

// Hàm hiển thị loading
function showLoading(buttonId) {
    const button = document.getElementById(buttonId);
    if (button) {
        button.classList.add('loading');
        button.disabled = true;
    }
}

// Hàm ẩn loading
function hideLoading(buttonId) {
    const button = document.getElementById(buttonId);
    if (button) {
        button.classList.remove('loading');
        button.disabled = false;
    }
}

// Hàm đăng nhập
function login() {
    // Kiểm tra định dạng form
    if (!validateForm('loginForm')) {
        alert('Vui lòng điền đầy đủ thông tin đăng nhập!');
        return false;
    }
    
    // Hiển thị loading
    showLoading('loginButton');
    
    // Giả lập thời gian xử lý
    setTimeout(() => {
        try {
            let users = JSON.parse(localStorage.getItem("user"));
            let userName = $("#username").val();
            let password = $("#password").val();
            let toLogin = false;
            console.log('Đang cố gắng đăng nhập với tên tài khoản:', userName);
            console.log('Lấy người dùng từ localStorage:', users);
            
            if (users && Array.isArray(users)) {
                users.forEach(element => {
                    console.log('Kiểm tra người dùng:', element);
                    if(userName === element.namelogin && password === element.password) {
                        localStorage.setItem("currentUser", JSON.stringify({
                            id: element.id,
                            namelogin: element.namelogin,
                            fullname: element.fullname,
                            email: element.email,
                            phone: element.phone
                        }));
                        toLogin = true;
                        console.log('Người dùng đã đăng nhập thành công:', element);
                    }
                });
                
                if(toLogin) {
                    alert("Đăng nhập thành công!");
                    window.location.href = "../../index.html";
                } else {
                    alert("Tên tài khoản hoặc mật khẩu không đúng!");
                    hideLoading('loginButton');
                }
            } else {
                alert("Không tìm thấy dữ liệu người dùng!");
                hideLoading('loginButton');
            }
        } catch (error) {
            console.error('Lỗi khi xử lý đăng nhập:', error);
            alert("Đã xảy ra lỗi trong quá trình đăng nhập. Vui lòng thử lại sau.");
            hideLoading('loginButton');
        }
    }, 1000); // Giả lập thời gian xử lý 1 giây
    
    return false;
}

// Hàm đăng ký
function register() {
    // Kiểm tra định dạng form
    if (!validateForm('registerForm')) {
        alert('Vui lòng điền đầy đủ thông tin đăng ký!');
        return false;
    }
    
    // Hiển thị loading
    showLoading('registerButton');
    
    // Giả lập thời gian xử lý
    setTimeout(() => {
        // Lấy thông tin từ form
        const username = $("#username").val();
        const email = $("#email").val();
        const password = $("#password").val();
        const fullname = $("#full_name").val();
        const phone = $("#phone_number").val();
        
        // Lấy danh sách người dùng hiện tại
        let users = JSON.parse(localStorage.getItem("user")) || [];
        
        // Kiểm tra tên đăng nhập đã tồn tại chưa
        const existingUser = users.find(user => user.namelogin === username);
        if (existingUser) {
            alert("Tên đăng nhập đã tồn tại! Vui lòng chọn tên khác.");
            hideLoading('registerButton');
            return false;
        }
        
        // Tạo ID mới
        const newId = (users.length + 1).toString();
        
        // Tạo đối tượng người dùng mới
        const newUser = {
            id: newId,
            namelogin: username,
            email: email,
            fullname: fullname,
            password: password,
            phone: phone
        };
        
        // Thêm người dùng mới vào mảng
        users.push(newUser);
        
        // Lưu lại vào localStorage
        localStorage.setItem("user", JSON.stringify(users));
        
        alert("Đăng ký thành công! Vui lòng đăng nhập.");
        window.location.href = "../../pages/auth/dangnhap.html";
    }, 1000); // Giả lập thời gian xử lý 1 giây
    
    return false;
}

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
    localStorage.setItem('isLoggedIn', 'false'); // Cập nhật trạng thái đăng nhập
    window.location.href = '../../index.html';
    alert("Đăng xuất thành công!");
}

// Hàm khởi tạo thông tin người dùng và nút cuộn lên đầu trang
function initializeUserProfile() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const userProfile = document.querySelector('.user-profile');
    const loginBtn = document.getElementById('loginBtn');
    const btnDangTin = document.getElementById('btnDangTin');

    if (currentUser) {
        // Ẩn nút đăng nhập và hiển thị nút Đăng Tin
        if (loginBtn) {
            loginBtn.style.display = 'none';
        }
        if (btnDangTin) {
            btnDangTin.style.display = 'block';
        }

        // Hiển thị thông tin người dùng
        if (userProfile) {
            userProfile.style.display = 'flex';
            const fullName = currentUser.fullname;
            const shortName = getShortName(fullName);
            document.getElementById('userShortName').textContent = shortName;
            document.getElementById('userFullname').textContent = fullName;
            document.getElementById('userEmail').textContent = currentUser.email || '';
            
            // Xử lý dropdown khi click
            const userAvatar = document.querySelector('.user-avatar');
            if (userAvatar) {
                userAvatar.addEventListener('click', function(event) {
                    event.stopPropagation(); // Ngăn sự kiện click lan ra document
                    userProfile.classList.toggle('active');
                });
                
                // Đóng dropdown khi click bên ngoài
                document.addEventListener('click', function(event) {
                    if (!userProfile.contains(event.target)) {
                        userProfile.classList.remove('active');
                    }
                });
            }
        }
    } else {
        // Hiển thị nút đăng nhập và ẩn nút Đăng Tin
        if (loginBtn) {
            loginBtn.style.display = 'block';
        }
        if (btnDangTin) {
            btnDangTin.style.display = 'none';
        }
        if (userProfile) {
            userProfile.style.display = 'none';
        }
    }
}

// Hàm khởi tạo nút cuộn lên đầu trang
function initializeScrollTopButton() {
    const scrollTopBtn = document.getElementById('scrollTopBtn');
    if (!scrollTopBtn) return;
    
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            scrollTopBtn.classList.add('visible');
        } else {
            scrollTopBtn.classList.remove('visible');
        }
    });
    
    scrollTopBtn.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// Khởi tạo các chức năng khi trang đã tải xong
document.addEventListener('DOMContentLoaded', function() {
    initializeUserProfile();
    initializeScrollTopButton();
});

// Hàm xử lý sự kiện khi người dùng nhấn nút "Đăng Tin"
document.addEventListener('DOMContentLoaded', function () {
    const btnDangTin = document.getElementById('btnDangTin');
    const loginBtn = document.getElementById('loginBtn');
    const userProfile = document.querySelector('.user-profile');

    // Kiểm tra trạng thái đăng nhập
    const currentUser = JSON.parse(localStorage.getItem('currentUser')); // Lấy thông tin người dùng từ localStorage

    if (currentUser) {
        // Nếu đã đăng nhập, hiển thị nút "Đăng Tin" và thông tin người dùng
        btnDangTin.style.display = 'inline-block';
        loginBtn.style.display = 'none';
        userProfile.style.display = 'flex';

        // Thêm sự kiện click cho nút "Đăng Tin"
        btnDangTin.addEventListener('click', function(event) {
            event.preventDefault();
            window.location.href = '../../pages/dangtin.html'; // Điều hướng đến trang dashboard
        });
    } else {
        // Nếu chưa đăng nhập, ẩn nút "Đăng Tin"
        btnDangTin.style.display = 'none';
        loginBtn.style.display = 'inline-block';
        userProfile.style.display = 'none';
    }
});