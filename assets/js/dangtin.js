document.addEventListener("DOMContentLoaded", function () {
  // Khởi tạo Firebase nếu chưa được khởi tạo
  if (!firebase.apps.length) {
    firebase.initializeApp({
      apiKey: "AIzaSyCe63NDqYR2A-hUOu22S5Kr1g6vclkIcGw",
      authDomain: "nhatroketnoi-9390a.firebaseapp.com",
      databaseURL: "https://nhatroketnoi-9390a-default-rtdb.firebaseio.com",
      projectId: "nhatroketnoi-9390a",
      storageBucket: "nhatroketnoi-9390a",
      messagingSenderId: "249753111607",
      appId: "1:249753111607:web:3f6d0ddaa27e34fc6683b2",
      measurementId: "G-219LR643DB",
    });
  }

  // Kiểm tra đăng nhập
  checkAuthStatus();

  // Khởi tạo bản đồ nếu có thẻ map-container
  if (document.getElementById("map-container")) {
    initializeMap();
  }

  // Khởi tạo upload hình ảnh
  initializeImageUpload();

  // Xử lý form đăng tin
  const postForm = document.getElementById("post-room-form");
  if (postForm) {
    postForm.addEventListener("submit", function (e) {
      e.preventDefault();
      submitRoomPost();
    });
  }

  // Khởi tạo các input helper
  initializeInputHelpers();
});

// Kiểm tra đăng nhập
function checkAuthStatus() {
  firebase.auth().onAuthStateChanged(function (user) {
    if (!user) {
      // Người dùng chưa đăng nhập, chuyển hướng đến trang đăng nhập
      Swal.fire({
        title: "Yêu cầu đăng nhập",
        text: "Bạn cần đăng nhập để sử dụng chức năng đăng tin.",
        icon: "warning",
        confirmButtonColor: "#3498db",
        confirmButtonText: "Đăng nhập ngay",
      }).then((result) => {
        if (result.isConfirmed) {
          window.location.href =
            "../pages/auth/dangnhap.html?redirect=" +
            encodeURIComponent(window.location.href);
        } else {
          window.location.href = "../index.html";
        }
      });
    } else {
      // Kiểm tra vai trò người dùng
      firebase
        .database()
        .ref("users/" + user.uid)
        .once("value")
        .then((snapshot) => {
          const userData = snapshot.val();
          if (userData && userData.role === "renter") {
            // Người thuê không được đăng tin
            Swal.fire({
              title: "Không có quyền",
              text: "Tính năng đăng tin chỉ dành cho chủ trọ. Vui lòng liên hệ hỗ trợ để nâng cấp tài khoản.",
              icon: "error",
              confirmButtonColor: "#e74c3c",
              confirmButtonText: "Quay lại trang chủ",
            }).then(() => {
              window.location.href = "../index.html";
            });
          } else {
            // Đã đăng nhập và có quyền đăng tin, hiển thị form
            document.getElementById("post-room-form-container").style.display =
              "block";
            document.getElementById("loading-container").style.display = "none";
          }
        });
    }
  });
}

// Khởi tạo Google Maps
function initializeMap() {
  // Trung tâm Cần Thơ mặc định
  const canThoCenter = { lat: 10.0452, lng: 105.7469 };

  const mapOptions = {
    center: canThoCenter,
    zoom: 15,
    mapTypeControl: true,
    streetViewControl: true,
    fullscreenControl: true,
  };

  const map = new google.maps.Map(
    document.getElementById("map-container"),
    mapOptions
  );

  // Tạo marker có thể kéo để chọn vị trí
  const marker = new google.maps.Marker({
    position: canThoCenter,
    map: map,
    draggable: true,
    animation: google.maps.Animation.DROP,
    title: "Kéo để chọn vị trí phòng trọ",
  });

  // Cập nhật tọa độ khi marker được kéo
  google.maps.event.addListener(marker, "dragend", function () {
    const position = marker.getPosition();
    document.getElementById("latitude").value = position.lat();
    document.getElementById("longitude").value = position.lng();

    // Lấy địa chỉ từ tọa độ
    getAddressFromCoordinates(position.lat(), position.lng());
  });

  // Thêm thanh tìm kiếm địa chỉ
  const searchInput = document.getElementById("address-search");
  const searchBox = new google.maps.places.SearchBox(searchInput);

  // Cập nhật bản đồ khi chọn kết quả tìm kiếm
  searchBox.addListener("places_changed", function () {
    const places = searchBox.getPlaces();

    if (places.length === 0) return;

    const place = places[0];

    if (!place.geometry || !place.geometry.location) return;

    // Cập nhật vị trí trên bản đồ
    map.setCenter(place.geometry.location);
    marker.setPosition(place.geometry.location);

    // Cập nhật tọa độ vào input hidden
    document.getElementById("latitude").value = place.geometry.location.lat();
    document.getElementById("longitude").value = place.geometry.location.lng();

    // Cập nhật địa chỉ
    document.getElementById("dia-chi").value = place.formatted_address;
  });

  // Thêm nút định vị
  const locationButton = document.createElement("button");
  locationButton.innerHTML = '<i class="fas fa-location-arrow"></i>';
  locationButton.className = "custom-map-control";
  locationButton.title = "Vị trí hiện tại của bạn";

  map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(locationButton);

  // Xử lý sự kiện click nút định vị
  locationButton.addEventListener("click", function () {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        function (position) {
          const userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };

          map.setCenter(userLocation);
          marker.setPosition(userLocation);

          // Cập nhật tọa độ
          document.getElementById("latitude").value = userLocation.lat;
          document.getElementById("longitude").value = userLocation.lng;

          // Lấy địa chỉ từ tọa độ
          getAddressFromCoordinates(userLocation.lat, userLocation.lng);
        },
        function (error) {
          console.error("Lỗi khi lấy vị trí:", error);
          showToast("Không thể lấy vị trí hiện tại của bạn.");
        }
      );
    } else {
      showToast("Trình duyệt của bạn không hỗ trợ định vị.");
    }
  });
}

// Lấy địa chỉ từ tọa độ
function getAddressFromCoordinates(lat, lng) {
  const geocoder = new google.maps.Geocoder();
  const latLng = { lat: lat, lng: lng };

  geocoder.geocode({ location: latLng }, function (results, status) {
    if (status === "OK") {
      if (results[0]) {
        document.getElementById("dia-chi").value = results[0].formatted_address;
      } else {
        document.getElementById("dia-chi").value = "Không tìm thấy địa chỉ";
      }
    } else {
      console.error("Geocoder failed due to: " + status);
    }
  });
}

// Khởi tạo upload hình ảnh
function initializeImageUpload() {
  const uploadButton = document.getElementById("upload-images-btn");
  const fileInput = document.getElementById("image-upload");
  const previewContainer = document.getElementById("image-preview-container");

  if (uploadButton && fileInput) {
    uploadButton.addEventListener("click", function () {
      fileInput.click();
    });

    fileInput.addEventListener("change", function () {
      if (this.files && this.files.length > 0) {
        previewImages(this.files);
      }
    });

    // Hỗ trợ drag & drop
    const dropZone = document.getElementById("drop-zone");
    if (dropZone) {
      ["dragenter", "dragover", "dragleave", "drop"].forEach((eventName) => {
        dropZone.addEventListener(eventName, preventDefaults, false);
      });

      function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
      }

      ["dragenter", "dragover"].forEach((eventName) => {
        dropZone.addEventListener(
          eventName,
          function () {
            dropZone.classList.add("highlight");
          },
          false
        );
      });

      ["dragleave", "drop"].forEach((eventName) => {
        dropZone.addEventListener(
          eventName,
          function () {
            dropZone.classList.remove("highlight");
          },
          false
        );
      });

      dropZone.addEventListener(
        "drop",
        function (e) {
          const files = e.dataTransfer.files;
          fileInput.files = files;
          previewImages(files);
        },
        false
      );
    }
  }
}

// Hiển thị xem trước hình ảnh
function previewImages(files) {
  const previewContainer = document.getElementById("image-preview-container");
  const maxFiles = 5; // Số lượng tối đa hình ảnh

  // Kiểm tra số lượng tệp đã chọn
  const currentImages = previewContainer.querySelectorAll(
    ".image-preview-item"
  );
  if (currentImages.length + files.length > maxFiles) {
    showToast(`Chỉ được tải lên tối đa ${maxFiles} hình ảnh.`);
    return;
  }

  // Hiển thị container xem trước nếu có hình ảnh
  previewContainer.style.display = "grid";
  document.getElementById("drop-zone").style.display = "none";

  // Hiển thị xem trước cho từng hình ảnh
  for (let i = 0; i < files.length; i++) {
    const file = files[i];

    // Kiểm tra loại tệp
    if (!file.type.match("image.*")) {
      showToast("Chỉ chấp nhận file hình ảnh.");
      continue;
    }

    // Kiểm tra kích thước file (tối đa 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showToast(`File ${file.name} quá lớn. Kích thước tối đa là 5MB.`);
      continue;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
      const previewItem = document.createElement("div");
      previewItem.className = "image-preview-item";

      const previewImage = document.createElement("img");
      previewImage.src = e.target.result;
      previewImage.alt = "Hình ảnh xem trước";
      previewImage.dataset.file = file.name;

      const removeButton = document.createElement("button");
      removeButton.className = "remove-image-btn";
      removeButton.innerHTML = '<i class="fas fa-times"></i>';
      removeButton.addEventListener("click", function () {
        previewContainer.removeChild(previewItem);

        // Hiển thị lại drop zone nếu không còn hình ảnh nào
        if (previewContainer.children.length === 0) {
          previewContainer.style.display = "none";
          document.getElementById("drop-zone").style.display = "flex";
        }
      });

      previewItem.appendChild(previewImage);
      previewItem.appendChild(removeButton);
      previewContainer.appendChild(previewItem);
    };

    reader.readAsDataURL(file);
  }
}

// Tải hình ảnh lên Firebase Storage
async function uploadImagesToStorage(files) {
  const storage = firebase.storage();
  const uploadPromises = [];
  const imageUrls = [];

  // Hiển thị progress bar
  const progressContainer = document.getElementById(
    "upload-progress-container"
  );
  const progressBar = document.getElementById("upload-progress-bar");
  progressContainer.style.display = "block";
  progressBar.style.width = "0%";

  // Tải từng hình ảnh lên Storage
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const fileExtension = file.name.split(".").pop();
    const fileName = `${Date.now()}_${i}.${fileExtension}`;
    const storageRef = storage.ref(`rooms/${fileName}`);

    const uploadTask = storageRef.put(file);

    const uploadPromise = new Promise((resolve, reject) => {
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          // Cập nhật tiến trình
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          progressBar.style.width = `${progress}%`;
        },
        (error) => {
          console.error("Upload error:", error);
          reject(error);
        },
        async () => {
          // Hoàn thành tải lên
          const downloadUrl = await storageRef.getDownloadURL();
          imageUrls.push(downloadUrl);
          resolve();
        }
      );
    });

    uploadPromises.push(uploadPromise);
  }

  // Đợi tất cả các hình ảnh được tải lên
  await Promise.all(uploadPromises);
  progressContainer.style.display = "none";

  return imageUrls;
}

// Khởi tạo các input helper
function initializeInputHelpers() {
  // Format số tiền
  const priceInputs = document.querySelectorAll(".price-input");
  priceInputs.forEach((input) => {
    input.addEventListener("input", function () {
      // Loại bỏ tất cả ký tự không phải số
      let value = this.value.replace(/\D/g, "");

      // Format số với dấu phân cách hàng nghìn
      if (value) {
        value = parseInt(value).toLocaleString("vi-VN");
      }

      this.value = value;
    });
  });

  // Chỉ cho phép nhập số
  const numberInputs = document.querySelectorAll(".number-input");
  numberInputs.forEach((input) => {
    input.addEventListener("input", function () {
      this.value = this.value.replace(/[^\d]/g, "");
    });
  });

  // Chỉ cho phép nhập số thập phân
  const decimalInputs = document.querySelectorAll(".decimal-input");
  decimalInputs.forEach((input) => {
    input.addEventListener("input", function () {
      this.value = this.value.replace(/[^\d.]/g, "");

      // Đảm bảo chỉ có một dấu thập phân
      const decimalPoints = this.value.match(/\./g);
      if (decimalPoints && decimalPoints.length > 1) {
        this.value = this.value.replace(/\.(?=.*\.)/g, "");
      }
    });
  });

  // Thiết lập các select
  const selects = document.querySelectorAll("select");
  selects.forEach((select) => {
    if (select.classList.contains("select2")) {
      $(select).select2({
        placeholder: select.dataset.placeholder || "Chọn...",
        allowClear: true,
      });
    }
  });

  // Khởi tạo input tag cho tiện ích
  const amenitiesInput = document.getElementById("tien-ich");
  if (amenitiesInput) {
    $(amenitiesInput).select2({
      placeholder: "Chọn tiện ích có trong phòng",
      allowClear: true,
      multiple: true,
      tags: true,
    });
  }
}

// Gửi đăng tin phòng trọ
async function submitRoomPost() {
  try {
    // Kiểm tra người dùng đã đăng nhập chưa
    const user = firebase.auth().currentUser;
    if (!user) {
      showToast("Vui lòng đăng nhập để đăng tin.");
      return;
    }

    // Hiển thị loading
    showLoading();

    // Lấy dữ liệu từ form
    const formData = getFormData();

    // Validate dữ liệu
    if (!validateFormData(formData)) {
      hideLoading();
      return;
    }

    // Lấy hình ảnh từ input file
    const fileInput = document.getElementById("image-upload");
    const previewContainer = document.getElementById("image-preview-container");
    const previewItems = previewContainer.querySelectorAll(
      ".image-preview-item"
    );

    if (previewItems.length === 0) {
      hideLoading();
      showToast("Vui lòng tải lên ít nhất một hình ảnh phòng trọ.");
      return;
    }

    // Tạo mảng các file đã chọn
    const selectedFiles = [];
    for (let i = 0; i < previewItems.length; i++) {
      const previewImg = previewItems[i].querySelector("img");
      const dataUrl = previewImg.src;

      // Chuyển đổi dataURL thành Blob
      const blob = await dataURLtoBlob(dataUrl);
      const file = new File([blob], `image_${i}.jpg`, { type: "image/jpeg" });
      selectedFiles.push(file);
    }

    // Upload hình ảnh lên storage
    const imageUrls = await uploadImagesToStorage(selectedFiles);

    // Thêm URLs của hình ảnh vào dữ liệu
    formData.hinhAnh = imageUrls;

    // Thêm thông tin người đăng và thời gian
    formData.chuTroId = user.uid;
    formData.ngayDang = Date.now();
    formData.trangThai = "conTrong"; // Mặc định là còn trống

    // Lưu dữ liệu vào Realtime Database
    const newRoomRef = firebase.database().ref("rooms").push();
    await newRoomRef.set({
      ...formData,
      id: newRoomRef.key,
    });

    // Ẩn loading
    hideLoading();

    // Hiển thị thông báo thành công
    Swal.fire({
      title: "Đăng tin thành công!",
      text: "Tin đăng của bạn đã được đăng thành công và đang chờ duyệt.",
      icon: "success",
      confirmButtonColor: "#3498db",
      confirmButtonText: "Xem tin đã đăng",
      showCancelButton: true,
      cancelButtonText: "Đăng tin mới",
    }).then((result) => {
      if (result.isConfirmed) {
        // Chuyển đến trang chi tiết phòng trọ
        window.location.href = `../pages/phong/danhsach/motaphong.html?id=${newRoomRef.key}`;
      } else {
        // Reset form
        document.getElementById("post-room-form").reset();
        document.getElementById("image-preview-container").innerHTML = "";
        document.getElementById("image-preview-container").style.display =
          "none";
        document.getElementById("drop-zone").style.display = "flex";
      }
    });
  } catch (error) {
    console.error("Lỗi khi đăng tin:", error);
    hideLoading();

    Swal.fire({
      title: "Đã xảy ra lỗi!",
      text: "Không thể đăng tin phòng trọ. Vui lòng thử lại sau.",
      icon: "error",
      confirmButtonColor: "#e74c3c",
      confirmButtonText: "Đóng",
    });
  }
}

// Lấy dữ liệu từ form
function getFormData() {
  // Thông tin cơ bản
  const tenPhong = document.getElementById("ten-phong").value;
  const loaiPhong = document.getElementById("loai-phong").value;
  const diaChiText = document.getElementById("dia-chi").value;
  const khuvuc = document.getElementById("khu-vuc").value;
  const latitude = document.getElementById("latitude").value;
  const longitude = document.getElementById("longitude").value;

  // Thông tin chi tiết
  const dienTich = document.getElementById("dien-tich").value;
  const giaChuaFormat = document.getElementById("gia-thue").value;
  const gia = parseInt(giaChuaFormat.replace(/\D/g, ""));
  const datCocChuaFormat = document.getElementById("dat-coc").value;
  const datCoc = parseInt(datCocChuaFormat.replace(/\D/g, ""));
  const giaDienChuaFormat = document.getElementById("gia-dien").value;
  const giaDien = parseInt(giaDienChuaFormat.replace(/\D/g, ""));
  const giaNuocChuaFormat = document.getElementById("gia-nuoc").value;
  const giaNuoc = parseInt(giaNuocChuaFormat.replace(/\D/g, ""));
  const phongVeSinh = document.getElementById("phong-ve-sinh").value;
  const doiTuong = document.getElementById("doi-tuong").value;

  // Tiện ích
  const tienIchSelect = document.getElementById("tien-ich");
  const tienIch = $(tienIchSelect).val() || [];

  // Mô tả chi tiết
  const moTa = document.getElementById("mo-ta").value;

  return {
    tenPhong,
    loaiPhong,
    diaChi: diaChiText,
    khuvuc,
    viTri: {
      lat: parseFloat(latitude),
      lng: parseFloat(longitude),
    },
    dienTich: parseFloat(dienTich),
    gia,
    datCoc,
    giaDien,
    giaNuoc,
    phongVeSinh,
    doiTuong,
    tienIch,
    moTa,
  };
}

// Validate dữ liệu form
function validateFormData(formData) {
  const requiredFields = [
    { field: formData.tenPhong, name: "Tiêu đề phòng" },
    { field: formData.diaChi, name: "Địa chỉ" },
    { field: formData.dienTich, name: "Diện tích" },
    { field: formData.gia, name: "Giá thuê" },
  ];

  for (const { field, name } of requiredFields) {
    if (!field) {
      showToast(`Vui lòng nhập ${name}.`);
      return false;
    }
  }

  if (!formData.viTri.lat || !formData.viTri.lng) {
    showToast("Vui lòng chọn vị trí phòng trọ trên bản đồ.");
    return false;
  }

  return true;
}

// Chuyển đổi Data URL thành Blob
function dataURLtoBlob(dataURL) {
  return new Promise((resolve) => {
    const parts = dataURL.split(";base64,");
    const contentType = parts[0].split(":")[1];
    const raw = window.atob(parts[1]);
    const rawLength = raw.length;
    const uInt8Array = new Uint8Array(rawLength);

    for (let i = 0; i < rawLength; ++i) {
      uInt8Array[i] = raw.charCodeAt(i);
    }

    resolve(new Blob([uInt8Array], { type: contentType }));
  });
}

// Hiển thị loading
function showLoading() {
  let loadingOverlay = document.getElementById("loading-overlay");
  if (!loadingOverlay) {
    loadingOverlay = document.createElement("div");
    loadingOverlay.id = "loading-overlay";
    loadingOverlay.className = "loading-overlay";
    loadingOverlay.innerHTML = `
      <div class="loading-spinner">
        <i class="fas fa-spinner fa-spin"></i>
      </div>
    `;
    document.body.appendChild(loadingOverlay);
  }

  loadingOverlay.style.display = "flex";
}

// Ẩn loading
function hideLoading() {
  const loadingOverlay = document.getElementById("loading-overlay");
  if (loadingOverlay) {
    loadingOverlay.style.display = "none";
  }
}

// Hiển thị toast message
function showToast(message) {
  let toast = document.getElementById("toast");

  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toast";
    document.body.appendChild(toast);
  }

  toast.textContent = message;
  toast.className = "show";

  setTimeout(() => {
    toast.className = "";
  }, 3000);
}
