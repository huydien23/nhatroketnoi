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

  // Lấy ID phòng từ URL
  const urlParams = new URLSearchParams(window.location.search);
  const roomId = urlParams.get("id");

  if (!roomId) {
    // Không có ID phòng, chuyển hướng về trang danh sách phòng
    showError("Không tìm thấy thông tin phòng trọ");
    setTimeout(() => {
      window.location.href = "../phong.html";
    }, 2000);
    return;
  }

  // Tải thông tin chi tiết phòng trọ
  loadRoomDetails(roomId);

  // Khởi tạo các sự kiện
  initEvents();
});

// Tải thông tin chi tiết phòng trọ
async function loadRoomDetails(roomId) {
  try {
    // Hiển thị loading
    showLoading();

    // Lấy thông tin phòng trọ từ database
    const roomSnapshot = await firebase
      .database()
      .ref("rooms/" + roomId)
      .once("value");
    const roomData = roomSnapshot.val();

    if (!roomData) {
      hideLoading();
      showError("Không tìm thấy thông tin phòng trọ");
      setTimeout(() => {
        window.location.href = "../phong.html";
      }, 2000);
      return;
    }

    // Cập nhật lượt xem
    updateViewCount(roomId, roomData.viewCount || 0);

    // Hiển thị thông tin phòng
    displayRoomDetails(roomData);

    // Tải thông tin chủ trọ
    loadOwnerInfo(roomData.chuTroId);

    // Hiển thị phòng trọ liên quan
    loadRelatedRooms(roomData);

    // Khởi tạo bản đồ
    if (roomData.viTri && roomData.viTri.lat && roomData.viTri.lng) {
      initializeMap(roomData.viTri.lat, roomData.viTri.lng, roomData.diaChi);
    }

    // Khởi tạo slider hình ảnh
    initImageSlider(roomData.hinhAnh || []);

    // Ẩn loading
    hideLoading();
  } catch (error) {
    console.error("Lỗi khi tải thông tin phòng:", error);
    hideLoading();
    showError("Đã xảy ra lỗi khi tải thông tin phòng trọ");
  }
}

// Cập nhật lượt xem cho phòng trọ
function updateViewCount(roomId, currentCount) {
  // Kiểm tra nếu đã xem phòng này trong phiên hiện tại
  const viewedRooms = JSON.parse(sessionStorage.getItem("viewedRooms") || "[]");

  if (!viewedRooms.includes(roomId)) {
    // Cập nhật lượt xem trong database
    const newCount = currentCount + 1;
    firebase
      .database()
      .ref("rooms/" + roomId)
      .update({
        viewCount: newCount,
      });

    // Lưu vào session storage để không tăng lượt xem khi tải lại trang
    viewedRooms.push(roomId);
    sessionStorage.setItem("viewedRooms", JSON.stringify(viewedRooms));
  }
}

// Hiển thị thông tin chi tiết phòng trọ
function displayRoomDetails(roomData) {
  // Cập nhật tiêu đề trang
  document.title = roomData.tenPhong + " - Nhà Trọ Kết Nối";

  // Cập nhật thông tin cơ bản
  document.getElementById("room-title").textContent = roomData.tenPhong;
  document.getElementById("room-address").textContent = roomData.diaChi;
  document.getElementById("room-price").textContent =
    formatCurrency(roomData.gia) + " đ/tháng";
  document.getElementById("room-area").textContent = roomData.dienTich + " m²";

  // Cập nhật thời gian đăng
  const postDate = new Date(roomData.ngayDang);
  document.getElementById("post-date").textContent = formatDate(postDate);

  // Cập nhật chi tiết phòng
  const detailsContainer = document.getElementById("room-details-container");
  detailsContainer.innerHTML = "";

  // Thêm các thông tin chi tiết
  const details = [
    {
      icon: "fa-building",
      label: "Loại phòng",
      value: getRoomTypeName(roomData.loaiPhong),
    },
    {
      icon: "fa-money-bill",
      label: "Tiền cọc",
      value: formatCurrency(roomData.datCoc) + " đ",
    },
    {
      icon: "fa-bolt",
      label: "Tiền điện",
      value: formatCurrency(roomData.giaDien) + " đ/số",
    },
    {
      icon: "fa-water",
      label: "Tiền nước",
      value: formatCurrency(roomData.giaNuoc) + " đ/m³",
    },
    {
      icon: "fa-toilet",
      label: "Phòng vệ sinh",
      value: roomData.phongVeSinh === "inside" ? "Khép kín" : "Chung",
    },
    {
      icon: "fa-users",
      label: "Đối tượng",
      value: getTargetName(roomData.doiTuong),
    },
  ];

  details.forEach((detail) => {
    detailsContainer.innerHTML += `
      <div class="detail-item">
        <div class="detail-icon">
          <i class="fas ${detail.icon}"></i>
        </div>
        <div class="detail-info">
          <div class="detail-label">${detail.label}</div>
          <div class="detail-value">${detail.value}</div>
        </div>
      </div>
    `;
  });

  // Cập nhật mô tả
  document.getElementById("room-description").innerHTML = formatDescription(
    roomData.moTa
  );

  // Cập nhật tiện ích
  displayAmenities(roomData.tienIch || []);

  // Hiển thị trạng thái phòng
  displayRoomStatus(roomData.trangThai || "conTrong");
}

// Hiển thị tiện ích phòng
function displayAmenities(amenities) {
  const amenitiesContainer = document.getElementById("amenities-container");
  amenitiesContainer.innerHTML = "";

  if (amenities.length === 0) {
    amenitiesContainer.innerHTML = "<p>Không có tiện ích được liệt kê</p>";
    return;
  }

  // Danh sách icon cho từng tiện ích
  const amenityIcons = {
    wifi: "fa-wifi",
    "may-lanh": "fa-snowflake",
    "tu-lanh": "fa-box",
    "may-giat": "fa-soap",
    "gac-lung": "fa-layer-group",
    "bao-ve": "fa-shield-alt",
    "tu-quan-ao": "fa-tshirt",
    "ban-cong": "fa-door-open",
    "cho-de-xe": "fa-motorcycle",
    camera: "fa-video",
    "tu-bep": "fa-utensils",
    "thang-may": "fa-elevator",
    giuong: "fa-bed",
    "nuoc-nong": "fa-hot-tub",
    "tu-do": "fa-unlock",
    tv: "fa-tv",
  };

  // Thêm từng tiện ích vào container
  amenities.forEach((amenity) => {
    const icon = amenityIcons[amenity.toLowerCase()] || "fa-check-circle";
    const name = formatAmenityName(amenity);

    amenitiesContainer.innerHTML += `
      <div class="amenity-item">
        <div class="amenity-icon">
          <i class="fas ${icon}"></i>
        </div>
        <div class="amenity-name">${name}</div>
      </div>
    `;
  });
}

// Format tên tiện ích
function formatAmenityName(amenity) {
  const amenityNames = {
    wifi: "WiFi miễn phí",
    "may-lanh": "Máy lạnh",
    "tu-lanh": "Tủ lạnh",
    "may-giat": "Máy giặt",
    "gac-lung": "Gác lửng",
    "bao-ve": "Bảo vệ 24/7",
    "tu-quan-ao": "Tủ quần áo",
    "ban-cong": "Ban công",
    "cho-de-xe": "Chỗ để xe",
    camera: "Camera an ninh",
    "tu-bep": "Tủ bếp",
    "thang-may": "Thang máy",
    giuong: "Giường nệm",
    "nuoc-nong": "Nước nóng",
    "tu-do": "Tự do giờ giấc",
    tv: "Tivi",
  };

  return amenityNames[amenity.toLowerCase()] || amenity;
}

// Hiển thị trạng thái phòng
function displayRoomStatus(status) {
  const statusContainer = document.getElementById("room-status");

  switch (status) {
    case "conTrong":
      statusContainer.textContent = "Còn trống";
      statusContainer.className = "status-available";
      break;
    case "daThue":
      statusContainer.textContent = "Đã cho thuê";
      statusContainer.className = "status-rented";
      break;
    case "dangSua":
      statusContainer.textContent = "Đang sửa chữa";
      statusContainer.className = "status-renovating";
      break;
    default:
      statusContainer.textContent = "Không xác định";
      statusContainer.className = "status-unknown";
  }
}

// Tải thông tin chủ trọ
async function loadOwnerInfo(ownerId) {
  try {
    const ownerSnapshot = await firebase
      .database()
      .ref("users/" + ownerId)
      .once("value");
    const ownerData = ownerSnapshot.val();

    if (ownerData) {
      // Cập nhật thông tin chủ trọ
      document.getElementById("owner-name").textContent = ownerData.fullname;
      document.getElementById("owner-phone").textContent =
        ownerData.phone || "Chưa cung cấp";
      document.getElementById("owner-phone").href = `tel:${
        ownerData.phone || ""
      }`;

      // Cập nhật avatar chủ trọ
      const ownerAvatar = document.getElementById("owner-avatar");
      if (ownerData.photoURL) {
        ownerAvatar.src = ownerData.photoURL;
      } else {
        ownerAvatar.src = "/assets/image/user/user1.jpg"; // Avatar mặc định
      }

      // Cập nhật nút liên hệ
      document
        .getElementById("contact-owner-btn")
        .addEventListener("click", function () {
          showContactModal(ownerData);
        });
    }
  } catch (error) {
    console.error("Lỗi khi tải thông tin chủ trọ:", error);
  }
}

// Hiển thị modal liên hệ chủ trọ
function showContactModal(ownerData) {
  // Kiểm tra đăng nhập
  const currentUser = firebase.auth().currentUser;
  if (!currentUser) {
    Swal.fire({
      title: "Yêu cầu đăng nhập",
      text: "Vui lòng đăng nhập để liên hệ với chủ trọ.",
      icon: "info",
      showCancelButton: true,
      confirmButtonText: "Đăng nhập ngay",
      cancelButtonText: "Để sau",
      confirmButtonColor: "#3498db",
    }).then((result) => {
      if (result.isConfirmed) {
        window.location.href =
          "../../auth/dangnhap.html?redirect=" +
          encodeURIComponent(window.location.href);
      }
    });
    return;
  }

  // Hiển thị modal liên hệ
  Swal.fire({
    title: `Liên hệ với ${ownerData.fullname}`,
    html: `
      <div class="contact-modal">
        <div class="contact-info">
          <p><strong>Số điện thoại:</strong> <a href="tel:${ownerData.phone}">${
      ownerData.phone || "Chưa cung cấp"
    }</a></p>
          <p><strong>Email:</strong> ${ownerData.email || "Chưa cung cấp"}</p>
        </div>
        <div class="contact-form">
          <div class="form-group">
            <label for="message">Lời nhắn:</label>
            <textarea id="contact-message" rows="4" class="form-control" placeholder="Viết lời nhắn cho chủ trọ..."></textarea>
          </div>
        </div>
      </div>
    `,
    showCancelButton: true,
    confirmButtonText: "Gửi tin nhắn",
    cancelButtonText: "Đóng",
    confirmButtonColor: "#3498db",
    focusConfirm: false,
    preConfirm: () => {
      const message = document.getElementById("contact-message").value;
      if (!message.trim()) {
        Swal.showValidationMessage("Vui lòng nhập lời nhắn");
        return false;
      }
      return message;
    },
  }).then((result) => {
    if (result.isConfirmed) {
      sendMessage(ownerData.uid, result.value);
    }
  });
}

// Gửi tin nhắn đến chủ trọ
async function sendMessage(ownerId, message) {
  try {
    const currentUser = firebase.auth().currentUser;

    // Tạo cuộc trò chuyện mới hoặc sử dụng cuộc trò chuyện hiện có
    const chatSnapshot = await firebase
      .database()
      .ref("chats")
      .orderByChild("participants")
      .equalTo(`${currentUser.uid}_${ownerId}`)
      .once("value");

    let chatId;

    if (chatSnapshot.exists()) {
      // Sử dụng cuộc trò chuyện hiện có
      chatSnapshot.forEach((child) => {
        chatId = child.key;
      });
    } else {
      // Tạo cuộc trò chuyện mới
      const newChatRef = firebase.database().ref("chats").push();
      chatId = newChatRef.key;

      await newChatRef.set({
        participants: `${currentUser.uid}_${ownerId}`,
        users: {
          [currentUser.uid]: true,
          [ownerId]: true,
        },
        createdAt: firebase.database.ServerValue.TIMESTAMP,
        lastMessage: {
          text: message,
          senderId: currentUser.uid,
          timestamp: firebase.database.ServerValue.TIMESTAMP,
        },
      });
    }

    // Thêm tin nhắn mới
    const newMessageRef = firebase.database().ref(`messages/${chatId}`).push();
    await newMessageRef.set({
      text: message,
      senderId: currentUser.uid,
      timestamp: firebase.database.ServerValue.TIMESTAMP,
      read: false,
    });

    // Cập nhật tin nhắn cuối cùng
    await firebase.database().ref(`chats/${chatId}/lastMessage`).set({
      text: message,
      senderId: currentUser.uid,
      timestamp: firebase.database.ServerValue.TIMESTAMP,
    });

    // Hiển thị thông báo thành công
    Swal.fire({
      title: "Gửi tin nhắn thành công!",
      text: "Chủ trọ sẽ liên hệ lại với bạn trong thời gian sớm nhất.",
      icon: "success",
      confirmButtonColor: "#3498db",
    });
  } catch (error) {
    console.error("Lỗi khi gửi tin nhắn:", error);
    Swal.fire({
      title: "Gửi tin nhắn thất bại",
      text: "Đã xảy ra lỗi khi gửi tin nhắn. Vui lòng thử lại sau.",
      icon: "error",
      confirmButtonColor: "#e74c3c",
    });
  }
}

// Tải các phòng trọ liên quan
async function loadRelatedRooms(currentRoom) {
  try {
    // Tìm các phòng trọ cùng khu vực hoặc cùng loại phòng
    const relatedRoomsSnapshot = await firebase
      .database()
      .ref("rooms")
      .orderByChild("khuvuc")
      .equalTo(currentRoom.khuvuc)
      .limitToLast(4)
      .once("value");

    const relatedRooms = [];
    relatedRoomsSnapshot.forEach((snapshot) => {
      const room = snapshot.val();
      // Loại bỏ phòng hiện tại khỏi danh sách liên quan
      if (room.id !== currentRoom.id) {
        relatedRooms.push(room);
      }
    });

    // Hiển thị các phòng liên quan
    const relatedContainer = document.getElementById("related-rooms-container");
    relatedContainer.innerHTML = "";

    if (relatedRooms.length === 0) {
      relatedContainer.innerHTML =
        '<p class="no-results">Không có phòng trọ liên quan</p>';
      return;
    }

    relatedRooms.slice(0, 3).forEach((room) => {
      relatedContainer.innerHTML += `
        <div class="related-room-item">
          <a href="motaphong.html?id=${room.id}" class="related-room-link">
            <div class="related-room-image">
              <img src="${room.hinhAnh[0]}" alt="${room.tenPhong}">
            </div>
            <div class="related-room-info">
              <h4 class="related-room-title">${room.tenPhong}</h4>
              <p class="related-room-price">${formatCurrency(
                room.gia
              )} đ/tháng</p>
              <p class="related-room-address">${room.diaChi}</p>
            </div>
          </a>
        </div>
      `;
    });
  } catch (error) {
    console.error("Lỗi khi tải phòng trọ liên quan:", error);
  }
}

// Khởi tạo slider hình ảnh
function initImageSlider(images) {
  const mainSlider = document.getElementById("main-slider");
  const thumbnailSlider = document.getElementById("thumbnail-slider");

  // Xóa nội dung cũ
  mainSlider.innerHTML = "";
  thumbnailSlider.innerHTML = "";

  // Thêm ảnh vào slider
  images.forEach((imageUrl, index) => {
    // Thêm vào main slider
    const mainSlide = document.createElement("div");
    mainSlide.className = "main-slide";
    mainSlide.innerHTML = `
      <img src="${imageUrl}" alt="Hình ảnh phòng trọ ${index + 1}">
    `;
    mainSlider.appendChild(mainSlide);

    // Thêm vào thumbnail slider
    const thumbSlide = document.createElement("div");
    thumbSlide.className = "thumb-slide";
    thumbSlide.innerHTML = `
      <img src="${imageUrl}" alt="Thumbnail ${index + 1}">
    `;
    thumbSlide.addEventListener("click", function () {
      currentSlide(index + 1);
    });
    thumbnailSlider.appendChild(thumbSlide);
  });

  // Hiển thị slide đầu tiên
  if (images.length > 0) {
    showSlide(1);
  }

  // Thêm nút điều khiển
  const prevButton = document.createElement("button");
  prevButton.className = "slider-nav prev";
  prevButton.innerHTML = '<i class="fas fa-chevron-left"></i>';
  prevButton.addEventListener("click", function () {
    changeSlide(-1);
  });

  const nextButton = document.createElement("button");
  nextButton.className = "slider-nav next";
  nextButton.innerHTML = '<i class="fas fa-chevron-right"></i>';
  nextButton.addEventListener("click", function () {
    changeSlide(1);
  });

  document.querySelector(".slider-container").appendChild(prevButton);
  document.querySelector(".slider-container").appendChild(nextButton);
}

// Biến toàn cục cho slider
let slideIndex = 1;

// Thay đổi slide
function changeSlide(n) {
  showSlide((slideIndex += n));
}

// Set slide hiện tại
function currentSlide(n) {
  showSlide((slideIndex = n));
}

// Hiển thị slide
function showSlide(n) {
  const slides = document.getElementsByClassName("main-slide");
  const thumbs = document.getElementsByClassName("thumb-slide");

  if (slides.length === 0) return;

  if (n > slides.length) {
    slideIndex = 1;
  }
  if (n < 1) {
    slideIndex = slides.length;
  }

  for (let i = 0; i < slides.length; i++) {
    slides[i].style.display = "none";
    thumbs[i].classList.remove("active");
  }

  slides[slideIndex - 1].style.display = "block";
  thumbs[slideIndex - 1].classList.add("active");
}

// Khởi tạo bản đồ
function initializeMap(lat, lng, address) {
  const mapContainer = document.getElementById("map-container");

  if (!mapContainer) return;

  const position = { lat: parseFloat(lat), lng: parseFloat(lng) };

  const map = new google.maps.Map(mapContainer, {
    center: position,
    zoom: 15,
    mapTypeControl: false,
    streetViewControl: true,
    fullscreenControl: true,
  });

  // Thêm marker vị trí phòng trọ
  const marker = new google.maps.Marker({
    position: position,
    map: map,
    title: address,
    animation: google.maps.Animation.DROP,
  });

  // Thêm info window cho marker
  const infoWindow = new google.maps.InfoWindow({
    content: `<div class="map-info-window"><strong>${address}</strong></div>`,
  });

  marker.addListener("click", function () {
    infoWindow.open(map, marker);
  });

  // Mở info window mặc định
  infoWindow.open(map, marker);

  // Thêm nút chỉ đường
  const directionButton = document.getElementById("get-directions");
  if (directionButton) {
    directionButton.addEventListener("click", function () {
      window.open(
        `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,
        "_blank"
      );
    });
  }
}

// Khởi tạo các sự kiện
function initEvents() {
  // Nút báo cáo phòng trọ
  const reportButton = document.getElementById("report-room");
  if (reportButton) {
    reportButton.addEventListener("click", function () {
      showReportModal();
    });
  }

  // Nút lưu phòng trọ yêu thích
  const saveButton = document.getElementById("save-room");
  if (saveButton) {
    saveButton.addEventListener("click", function () {
      toggleSaveRoom();
    });
  }

  // Nút chia sẻ phòng trọ
  const shareButton = document.getElementById("share-room");
  if (shareButton) {
    shareButton.addEventListener("click", function () {
      showShareModal();
    });
  }
}

// Hiển thị modal báo cáo phòng trọ
function showReportModal() {
  // Kiểm tra đăng nhập
  const currentUser = firebase.auth().currentUser;
  if (!currentUser) {
    Swal.fire({
      title: "Yêu cầu đăng nhập",
      text: "Vui lòng đăng nhập để báo cáo phòng trọ.",
      icon: "info",
      showCancelButton: true,
      confirmButtonText: "Đăng nhập ngay",
      cancelButtonText: "Để sau",
      confirmButtonColor: "#3498db",
    }).then((result) => {
      if (result.isConfirmed) {
        window.location.href =
          "../../auth/dangnhap.html?redirect=" +
          encodeURIComponent(window.location.href);
      }
    });
    return;
  }

  // Hiển thị modal báo cáo
  Swal.fire({
    title: "Báo cáo phòng trọ",
    html: `
      <div class="report-form">
        <div class="form-group">
          <label for="report-reason">Lý do báo cáo:</label>
          <select id="report-reason" class="form-control">
            <option value="">-- Chọn lý do --</option>
            <option value="fake">Thông tin giả mạo</option>
            <option value="scam">Lừa đảo</option>
            <option value="unavailable">Phòng đã được thuê nhưng chưa cập nhật</option>
            <option value="wrong-price">Giá không chính xác</option>
            <option value="wrong-info">Thông tin không chính xác</option>
            <option value="other">Lý do khác</option>
          </select>
        </div>
        <div class="form-group">
          <label for="report-details">Chi tiết:</label>
          <textarea id="report-details" rows="4" class="form-control" placeholder="Mô tả chi tiết vấn đề..."></textarea>
        </div>
      </div>
    `,
    showCancelButton: true,
    confirmButtonText: "Gửi báo cáo",
    cancelButtonText: "Hủy",
    confirmButtonColor: "#3498db",
    focusConfirm: false,
    preConfirm: () => {
      const reason = document.getElementById("report-reason").value;
      const details = document.getElementById("report-details").value;

      if (!reason) {
        Swal.showValidationMessage("Vui lòng chọn lý do báo cáo");
        return false;
      }

      if (!details.trim()) {
        Swal.showValidationMessage("Vui lòng mô tả chi tiết vấn đề");
        return false;
      }

      return { reason, details };
    },
  }).then((result) => {
    if (result.isConfirmed) {
      submitReport(result.value.reason, result.value.details);
    }
  });
}

// Gửi báo cáo phòng trọ
async function submitReport(reason, details) {
  try {
    const currentUser = firebase.auth().currentUser;
    const urlParams = new URLSearchParams(window.location.search);
    const roomId = urlParams.get("id");

    const reportRef = firebase.database().ref("reports").push();

    await reportRef.set({
      id: reportRef.key,
      roomId: roomId,
      userId: currentUser.uid,
      reason: reason,
      details: details,
      status: "pending",
      createdAt: firebase.database.ServerValue.TIMESTAMP,
    });

    Swal.fire({
      title: "Đã gửi báo cáo!",
      text: "Cảm ơn bạn đã báo cáo. Chúng tôi sẽ xem xét và xử lý trong thời gian sớm nhất.",
      icon: "success",
      confirmButtonColor: "#3498db",
    });
  } catch (error) {
    console.error("Lỗi khi gửi báo cáo:", error);
    Swal.fire({
      title: "Gửi báo cáo thất bại",
      text: "Đã xảy ra lỗi khi gửi báo cáo. Vui lòng thử lại sau.",
      icon: "error",
      confirmButtonColor: "#e74c3c",
    });
  }
}

// Toggle lưu/bỏ lưu phòng trọ
async function toggleSaveRoom() {
  // Kiểm tra đăng nhập
  const currentUser = firebase.auth().currentUser;
  if (!currentUser) {
    Swal.fire({
      title: "Yêu cầu đăng nhập",
      text: "Vui lòng đăng nhập để lưu phòng trọ yêu thích.",
      icon: "info",
      showCancelButton: true,
      confirmButtonText: "Đăng nhập ngay",
      cancelButtonText: "Để sau",
      confirmButtonColor: "#3498db",
    }).then((result) => {
      if (result.isConfirmed) {
        window.location.href =
          "../../auth/dangnhap.html?redirect=" +
          encodeURIComponent(window.location.href);
      }
    });
    return;
  }

  const urlParams = new URLSearchParams(window.location.search);
  const roomId = urlParams.get("id");
  const saveButton = document.getElementById("save-room");

  try {
    // Kiểm tra đã lưu chưa
    const savedRef = firebase
      .database()
      .ref(`users/${currentUser.uid}/savedRooms/${roomId}`);
    const snapshot = await savedRef.once("value");

    if (snapshot.exists()) {
      // Đã lưu, thực hiện bỏ lưu
      await savedRef.remove();
      saveButton.innerHTML = '<i class="far fa-heart"></i> Lưu tin';
      showToast("Đã xóa khỏi danh sách yêu thích");
    } else {
      // Chưa lưu, thực hiện lưu
      await savedRef.set({
        timestamp: firebase.database.ServerValue.TIMESTAMP,
      });
      saveButton.innerHTML = '<i class="fas fa-heart"></i> Đã lưu';
      showToast("Đã thêm vào danh sách yêu thích");
    }
  } catch (error) {
    console.error("Lỗi khi toggle trạng thái lưu phòng:", error);
    showToast("Đã xảy ra lỗi. Vui lòng thử lại sau.");
  }
}

// Kiểm tra trạng thái lưu phòng
async function checkSavedStatus() {
  const currentUser = firebase.auth().currentUser;
  if (!currentUser) return;

  const urlParams = new URLSearchParams(window.location.search);
  const roomId = urlParams.get("id");
  const saveButton = document.getElementById("save-room");

  try {
    const savedRef = firebase
      .database()
      .ref(`users/${currentUser.uid}/savedRooms/${roomId}`);
    const snapshot = await savedRef.once("value");

    if (snapshot.exists()) {
      saveButton.innerHTML = '<i class="fas fa-heart"></i> Đã lưu';
    } else {
      saveButton.innerHTML = '<i class="far fa-heart"></i> Lưu tin';
    }
  } catch (error) {
    console.error("Lỗi khi kiểm tra trạng thái lưu phòng:", error);
  }
}

// Hiển thị modal chia sẻ phòng trọ
function showShareModal() {
  const currentUrl = window.location.href;
  const shareTitle = document.getElementById("room-title").textContent;

  Swal.fire({
    title: "Chia sẻ phòng trọ",
    html: `
      <div class="share-container">
        <div class="share-input">
          <input type="text" id="share-url" class="form-control" value="${currentUrl}" readonly>
          <button id="copy-url-btn" class="btn btn-primary">
            <i class="fas fa-copy"></i> Copy
          </button>
        </div>
        <div class="share-buttons">
          <a href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
            currentUrl
          )}" target="_blank" class="share-btn facebook">
            <i class="fab fa-facebook-f"></i>
          </a>
          <a href="https://twitter.com/intent/tweet?url=${encodeURIComponent(
            currentUrl
          )}&text=${encodeURIComponent(
      shareTitle
    )}" target="_blank" class="share-btn twitter">
            <i class="fab fa-twitter"></i>
          </a>
          <a href="https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(
            currentUrl
          )}" target="_blank" class="share-btn linkedin">
            <i class="fab fa-linkedin-in"></i>
          </a>
          <a href="https://api.whatsapp.com/send?text=${encodeURIComponent(
            shareTitle + " " + currentUrl
          )}" target="_blank" class="share-btn whatsapp">
            <i class="fab fa-whatsapp"></i>
          </a>
        </div>
      </div>
    `,
    showConfirmButton: false,
    showCloseButton: true,
  });

  // Xử lý copy URL
  setTimeout(() => {
    const copyButton = document.getElementById("copy-url-btn");
    if (copyButton) {
      copyButton.addEventListener("click", function () {
        const shareUrl = document.getElementById("share-url");
        shareUrl.select();
        document.execCommand("copy");
        showToast("Đã sao chép liên kết vào clipboard");
      });
    }
  }, 500);
}

// Format tiền tệ
function formatCurrency(amount) {
  return new Intl.NumberFormat("vi-VN").format(amount);
}

// Format ngày tháng
function formatDate(date) {
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}

// Format mô tả phòng
function formatDescription(description) {
  if (!description) return "";

  // Thay thế xuống dòng thành thẻ <br>
  return description.replace(/\n/g, "<br>");
}

// Lấy tên loại phòng
function getRoomTypeName(type) {
  const types = {
    phongtro: "Phòng trọ",
    canhochungcu: "Căn hộ chung cư",
    nhanguyencan: "Nhà nguyên căn",
    phongchungtoi: "Phòng cho thuê",
    nhavi: "Nhà ở với chủ",
    homecompa: "HomeStay",
  };

  return types[type] || type;
}

// Lấy tên đối tượng
function getTargetName(target) {
  const targets = {
    all: "Tất cả",
    student: "Sinh viên",
    worker: "Người đi làm",
    family: "Gia đình",
  };

  return targets[target] || target;
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

// Hiển thị lỗi
function showError(message) {
  Swal.fire({
    title: "Lỗi!",
    text: message,
    icon: "error",
    confirmButtonColor: "#e74c3c",
    confirmButtonText: "Đóng",
  });
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
