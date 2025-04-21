// Import các module từ database.js
import { RoomManager, UserManager, storage } from "./database.js";

// Khai báo các biến toàn cục
let currentUser = null;
let uploadedImages = [];

// Hàm khởi tạo
async function initialize() {
  try {
    // Kiểm tra người dùng đã đăng nhập chưa
    currentUser = await UserManager.getCurrentUser();
    if (!currentUser) {
      alert("Vui lòng đăng nhập để đăng tin!");
      window.location.href = "./pages/auth/dangnhap.html";
      return;
    }

    // Khởi tạo form đăng tin
    initForm();
    setupEventListeners();
  } catch (error) {
    console.error("Lỗi khởi tạo trang đăng tin:", error);
    alert("Có lỗi xảy ra khi tải trang. Vui lòng thử lại sau!");
  }
}

// Khởi tạo form
function initForm() {
  // Khởi tạo trường chọn thành phố và quận/huyện
  populateCities();

  // Khởi tạo trình tải ảnh
  initImageUploader();
}

// Khởi tạo danh sách thành phố
function populateCities() {
  const cities = [
    "Cần Thơ",
    "Hồ Chí Minh",
    "Hà Nội",
    "Đà Nẵng",
    "Hải Phòng",
    "An Giang",
    "Bà Rịa - Vũng Tàu",
    "Bạc Liêu",
    "Bắc Giang",
    "Bắc Kạn",
    "Bắc Ninh",
    "Bến Tre",
    "Bình Định",
    "Bình Dương",
    "Bình Phước",
    "Bình Thuận",
    "Cà Mau",
    "Cao Bằng",
    "Đắk Lắk",
    "Đắk Nông",
    "Điện Biên",
    "Đồng Nai",
    "Đồng Tháp",
    "Gia Lai",
    "Hà Giang",
    "Hà Nam",
    "Hà Tĩnh",
    "Hải Dương",
    "Hậu Giang",
    "Hòa Bình",
    "Hưng Yên",
    "Khánh Hòa",
    "Kiên Giang",
    "Kon Tum",
    "Lai Châu",
    "Lâm Đồng",
    "Lạng Sơn",
    "Lào Cai",
    "Long An",
    "Nam Định",
    "Nghệ An",
    "Ninh Bình",
    "Ninh Thuận",
    "Phú Thọ",
    "Quảng Bình",
    "Quảng Nam",
    "Quảng Ngãi",
    "Quảng Ninh",
    "Quảng Trị",
    "Sóc Trăng",
    "Sơn La",
    "Tây Ninh",
    "Thái Bình",
    "Thái Nguyên",
    "Thanh Hóa",
    "Thừa Thiên Huế",
    "Tiền Giang",
    "Trà Vinh",
    "Tuyên Quang",
    "Vĩnh Long",
    "Vĩnh Phúc",
    "Yên Bái",
    "Phú Yên",
  ];

  const citySelect = document.getElementById("city");
  if (citySelect) {
    cities.forEach((city) => {
      const option = document.createElement("option");
      option.value = city;
      option.textContent = city;
      citySelect.appendChild(option);
    });

    // Thêm sự kiện change để cập nhật quận/huyện
    citySelect.addEventListener("change", function () {
      populateDistricts(this.value);
    });
  }
}

// Khởi tạo danh sách quận/huyện theo thành phố
function populateDistricts(city) {
  // Danh sách quận/huyện theo thành phố (chỉ có một số thành phố mẫu)
  const districtsByCity = {
    "Cần Thơ": [
      "Ninh Kiều",
      "Bình Thủy",
      "Cái Răng",
      "Ô Môn",
      "Thốt Nốt",
      "Phong Điền",
      "Cờ Đỏ",
      "Thới Lai",
      "Vĩnh Thạnh",
    ],
    "Hồ Chí Minh": [
      "Quận 1",
      "Quận 3",
      "Quận 4",
      "Quận 5",
      "Quận 6",
      "Quận 7",
      "Quận 8",
      "Quận 10",
      "Quận 11",
      "Quận 12",
      "Thủ Đức",
      "Gò Vấp",
      "Bình Thạnh",
      "Tân Bình",
      "Tân Phú",
      "Phú Nhuận",
      "Bình Tân",
      "Nhà Bè",
      "Hóc Môn",
      "Củ Chi",
      "Bình Chánh",
    ],
    "Hà Nội": [
      "Ba Đình",
      "Hoàn Kiếm",
      "Hai Bà Trưng",
      "Đống Đa",
      "Tây Hồ",
      "Cầu Giấy",
      "Thanh Xuân",
      "Hoàng Mai",
      "Long Biên",
      "Nam Từ Liêm",
      "Bắc Từ Liêm",
      "Hà Đông",
      "Sơn Tây",
      "Ba Vì",
      "Chương Mỹ",
      "Đan Phượng",
      "Đông Anh",
      "Gia Lâm",
      "Hoài Đức",
      "Mê Linh",
      "Mỹ Đức",
      "Phú Xuyên",
      "Phúc Thọ",
      "Quốc Oai",
      "Sóc Sơn",
      "Thạch Thất",
      "Thanh Oai",
      "Thanh Trì",
      "Thường Tín",
      "Ứng Hòa",
    ],
  };

  const districtSelect = document.getElementById("district");
  if (districtSelect) {
    // Xóa các option cũ
    districtSelect.innerHTML = '<option value="">Chọn quận/huyện</option>';

    // Thêm các option mới nếu có
    if (districtsByCity[city]) {
      districtsByCity[city].forEach((district) => {
        const option = document.createElement("option");
        option.value = district;
        option.textContent = district;
        districtSelect.appendChild(option);
      });
      districtSelect.disabled = false;
    } else {
      districtSelect.disabled = true;
    }
  }
}

// Khởi tạo trình tải ảnh
function initImageUploader() {
  const imageInput = document.getElementById("room-images");
  const previewContainer = document.getElementById("image-preview");

  if (imageInput && previewContainer) {
    imageInput.addEventListener("change", function (e) {
      // Xóa các preview cũ
      previewContainer.innerHTML = "";

      // Hiển thị preview cho các file được chọn
      const files = e.target.files;
      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // Kiểm tra xem có phải là file ảnh không
        if (!file.type.startsWith("image/")) continue;

        const reader = new FileReader();
        reader.onload = function (e) {
          const imgContainer = document.createElement("div");
          imgContainer.className = "preview-item";

          const img = document.createElement("img");
          img.src = e.target.result;
          img.className = "preview-image";

          const removeBtn = document.createElement("button");
          removeBtn.type = "button";
          removeBtn.className = "remove-image";
          removeBtn.innerHTML = "&times;";
          removeBtn.dataset.index = i;
          removeBtn.addEventListener("click", function () {
            imgContainer.remove();
            // Xử lý xóa file khỏi input (khó thực hiện trực tiếp)
            // Thay vào đó, ta sẽ đánh dấu file này cần bỏ qua khi upload
          });

          imgContainer.appendChild(img);
          imgContainer.appendChild(removeBtn);
          previewContainer.appendChild(imgContainer);
        };
        reader.readAsDataURL(file);
      }
    });
  }
}

// Thiết lập các sự kiện
function setupEventListeners() {
  const submitButton = document.getElementById("submit-button");
  const roomForm = document.getElementById("room-form");

  if (submitButton && roomForm) {
    roomForm.addEventListener("submit", async function (e) {
      e.preventDefault();
      submitButton.disabled = true;
      submitButton.textContent = "Đang xử lý...";

      try {
        await handleFormSubmit();
        alert("Đăng tin thành công!");
        resetForm();
      } catch (error) {
        console.error("Lỗi khi đăng tin:", error);
        alert("Có lỗi xảy ra khi đăng tin. Vui lòng thử lại!");
      } finally {
        submitButton.disabled = false;
        submitButton.textContent = "Đăng tin";
      }
    });
  }
}

// Xử lý khi người dùng gửi form
async function handleFormSubmit() {
  // Lấy dữ liệu từ form
  const title = document.getElementById("room-title").value;
  const price = parseFloat(document.getElementById("room-price").value);
  const area = parseFloat(document.getElementById("room-area").value);
  const description = document.getElementById("room-description").value;
  const address = document.getElementById("address").value;
  const city = document.getElementById("city").value;
  const district = document.getElementById("district").value;

  // Lấy các tiện nghi được chọn
  const facilities = [];
  const facilityCheckboxes = document.querySelectorAll(
    'input[name="facilities"]:checked'
  );
  facilityCheckboxes.forEach((checkbox) => {
    facilities.push(checkbox.value);
  });

  // Tải các hình ảnh lên Firebase Storage
  const imageUrls = await uploadImages();

  // Tạo đối tượng dữ liệu phòng
  const roomData = {
    title,
    price,
    area,
    description,
    address,
    city,
    district,
    facilities,
    images: imageUrls,
    landlordId: currentUser.uid,
    status: "available",
  };

  // Lưu vào Firebase Firestore
  await RoomManager.addRoom(roomData);
}

// Tải các hình ảnh lên Firebase Storage
async function uploadImages() {
  const imageInput = document.getElementById("room-images");
  const files = imageInput.files;

  if (!files || files.length === 0) return [];

  // Tạo ID tạm thời cho phòng (sẽ được thay thế bằng ID thật sau khi thêm vào Firestore)
  const tempRoomId = "temp_" + Date.now();

  const uploadPromises = [];
  const imageUrls = [];

  // Tải từng ảnh lên Firebase Storage
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    if (!file.type.startsWith("image/")) continue;

    const uploadPromise = RoomManager.uploadRoomImage(file, tempRoomId).then(
      (url) => {
        imageUrls.push(url);
        return url;
      }
    );

    uploadPromises.push(uploadPromise);
  }

  // Đợi tất cả ảnh được tải lên
  await Promise.all(uploadPromises);

  return imageUrls;
}

// Reset form sau khi đăng tin thành công
function resetForm() {
  document.getElementById("room-form").reset();
  document.getElementById("image-preview").innerHTML = "";
  uploadedImages = [];
}

// Gọi hàm khởi tạo khi trang đã tải xong
document.addEventListener("DOMContentLoaded", initialize);
