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

  // Gửi email sử dụng SMTP.js
  Email.send({
    SecureToken: "",
    To: "huydien23@nhatroketnoi.com",
    From: "booking@nhatroketnoi.com",
    Subject: `Đặt lịch xem phòng: ${roomTitle}`,
    Body: emailBody,
  }).then(function (response) {
    if (response === "OK") {
      alert("Đặt lịch thành công! Chúng tôi sẽ liên hệ với bạn sớm nhất.");
      form.reset();
    } else {
      alert("Có lỗi xảy ra. Vui lòng thử lại sau.");
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
