document.addEventListener("DOMContentLoaded", function () {
  // Lưu phòng
  const saveButton = document.querySelector(".save-room");
  if (saveButton) {
    saveButton.addEventListener("click", function () {
      const icon = this.querySelector("i");
      if (icon.classList.contains("far")) {
        icon.classList.remove("far");
        icon.classList.add("fas");
        this.classList.add("saved");
      } else {
        icon.classList.remove("fas");
        icon.classList.add("far");
        this.classList.remove("saved");
      }
    });
  }

  // Initialize gallery
  initGallery();

  // Add event listeners for navigation buttons
  const prevButton = document.querySelector(".nav-btn.prev");
  const nextButton = document.querySelector(".nav-btn.next");

  if (prevButton) prevButton.addEventListener("click", prevImage);
  if (nextButton) nextButton.addEventListener("click", nextImage);
});

// Kiểm tra trạng thái đăng nhập
function checkLoginStatus() {
  const userData = JSON.parse(localStorage.getItem("userData"));
  const loginBtn = document.getElementById("loginBtn");
  const btnDangTin = document.getElementById("btnDangTin");
  const userProfile = document.querySelector(".user-profile");

  if (userData) {
    if (loginBtn) loginBtn.style.display = "none";
    if (btnDangTin) btnDangTin.style.display = "block";
    if (userProfile) userProfile.style.display = "flex";
    updateUserInfo(userData);
  } else {
    if (loginBtn) loginBtn.style.display = "block";
    if (btnDangTin) btnDangTin.style.display = "none";
    if (userProfile) userProfile.style.display = "none";
  }
}

function updateUserInfo(userData) {
  const userAvatar = document.getElementById("userAvatar");
  const userShortName = document.getElementById("userShortName");
  const userFullname = document.getElementById("userFullname");
  const userEmail = document.getElementById("userEmail");

  if (userAvatar && userData.avatar) userAvatar.src = userData.avatar;
  if (userShortName)
    userShortName.textContent = userData.fullname
      ? userData.fullname.charAt(0).toUpperCase()
      : "U";
  if (userFullname)
    userFullname.textContent = userData.fullname || "Người dùng";
  if (userEmail) userEmail.textContent = userData.email || "";
}

function logout() {
  localStorage.removeItem("userData");
  localStorage.removeItem("token");
  checkLoginStatus();
  alert("Đăng xuất thành công!");
}

// Xử lý dropdown menu
document.addEventListener("click", function (event) {
  const userAvatar = document.querySelector(".user-avatar");
  const dropdownMenu = document.querySelector(".dropdown-menu");

  if (userAvatar && dropdownMenu) {
    if (userAvatar.contains(event.target)) {
      dropdownMenu.classList.toggle("show");
    } else if (!dropdownMenu.contains(event.target)) {
      dropdownMenu.classList.remove("show");
    }
  }
});

// Xử lý form đặt lịch xem phòng
function sendBookingEmail(event) {
  event.preventDefault();

  const form = document.getElementById("bookingForm");
  const formData = new FormData(form);
  const roomTitle = document.querySelector(".room-title h1").textContent;

  // Xây dựng email body
  let emailBody = `
        <h2>Yêu cầu đặt lịch xem phòng mới</h2>
        <p><strong>Phòng:</strong> ${roomTitle}</p>
        <p><strong>Người đặt:</strong> ${formData.get("name")}</p>
        <p><strong>Email:</strong> ${formData.get("email")}</p>
        <p><strong>Số điện thoại:</strong> ${formData.get("phone")}</p>
        <p><strong>Ngày xem:</strong> ${formData.get("date")}</p>
        <p><strong>Thời gian:</strong> ${formData.get("time")}</p>
        <p><strong>Ghi chú:</strong> ${
          formData.get("message") || "Không có"
        }</p>
    `;

    // Hàm xử lý gửi email đặt lịch xem phòng
  function sendBookingEmail(event) {
    event.preventDefault();
    
    // Lấy thông tin từ form
    const name = document.getElementById('name').value;
    const phone = document.getElementById('phone').value;
    const email = document.getElementById('email').value;
    const date = document.getElementById('date').value;
    const time = document.getElementById('time').value;
    const message = document.getElementById('message').value || "Không có ghi chú";
    
    // Hiển thị trạng thái đang gửi
    const submitBtn = document.querySelector('.submit-btn');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = "Đang gửi...";
    submitBtn.disabled = true;
    
    // Lấy thông tin phòng từ trang hiện tại
    const roomTitle = document.querySelector('.room-title h1').textContent;
    const roomLocation = document.querySelector('.location').textContent;
    const roomPrice = document.querySelector('.price-tag').textContent;
  
    // Tạo đối tượng chứa thông tin cần gửi
    const templateParams = {
      name: name,
      phone: phone,
      email: email,
      date: formatDate(date),
      time: time,
      message: message,
      room_title: roomTitle,
      room_location: roomLocation,
      room_price: roomPrice
    };
    
    // Thay thế các giá trị này bằng ID thực từ EmailJS
    const serviceID = "service_n8idwof"; // service_xxxxxxx
    const templateID = "template_a9zcxvj"; // template_xxxxxxx
    
    // Gửi email
    emailjs.send(serviceID, templateID, templateParams)
      .then(function(response) {
        console.log('SUCCESS!', response.status, response.text);
        alert('Đặt lịch xem phòng thành công! Chúng tôi sẽ liên hệ với bạn sớm.');
        document.getElementById('bookingForm').reset();
        
        // Lưu thông tin đặt lịch vào Firebase nếu đã đăng nhập
        saveBookingToFirebase(templateParams);
      })
      .catch(function(error) {
        console.log('FAILED...', error);
        alert('Có lỗi xảy ra khi đặt lịch. Vui lòng thử lại sau!');
      })
      .finally(function() {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
      });
  }
  
  // Hàm định dạng ngày tháng
  function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric'
    });
  }
  
  // Hàm lưu thông tin đặt lịch vào Firebase
  function saveBookingToFirebase(bookingData) {
    try {
      // Kiểm tra xem firebase đã được khởi tạo chưa
      if (window.firebase && firebase.database) {
        // Tạo tham chiếu đến node "bookings" trong database
        const bookingRef = firebase.database().ref('bookings').push();
        
        // Thêm thời gian tạo và trạng thái
        bookingData.createdAt = new Date().toISOString();
        bookingData.status = 'pending'; // trạng thái: đang chờ
        
        // Lưu dữ liệu
        bookingRef.set(bookingData)
          .then(() => console.log('Đã lưu thông tin đặt lịch vào Firebase'))
          .catch(error => console.error('Lỗi khi lưu vào Firebase:', error));
      }
    } catch (error) {
      console.error('Lỗi khi lưu thông tin đặt lịch:', error);
    }
  }
  
  // Gắn sự kiện submit cho form khi trang đã tải xong
  document.addEventListener('DOMContentLoaded', function() {
    const bookingForm = document.getElementById('bookingForm');
    if (bookingForm) {
      bookingForm.addEventListener('submit', sendBookingEmail);
    }
  });
}

// Kiểm tra trạng thái đăng nhập
checkLoginStatus();

// Gallery functionality
let currentImageIndex = 0;
const thumbnails = document.querySelectorAll(".thumbnail");
const mainImage = document.getElementById("mainImage");

// Initialize gallery
function initGallery() {
  thumbnails.forEach((thumbnail, index) => {
    thumbnail.addEventListener("click", () => changeImage(index));
    if (index === 0) thumbnail.classList.add("active");
  });
}

// Change main image
function changeImage(index) {
  const newSrc = thumbnails[index].querySelector("img").src;
  mainImage.src = newSrc;
  currentImageIndex = index;
  updateActiveThumbnail();
}

// Update active thumbnail
function updateActiveThumbnail() {
  thumbnails.forEach((thumb) => thumb.classList.remove("active"));
  thumbnails[currentImageIndex].classList.add("active");
}

// Navigation functions
function nextImage() {
  currentImageIndex = (currentImageIndex + 1) % thumbnails.length;
  changeImage(currentImageIndex);
}

function prevImage() {
  currentImageIndex =
    (currentImageIndex - 1 + thumbnails.length) % thumbnails.length;
  changeImage(currentImageIndex);
}
