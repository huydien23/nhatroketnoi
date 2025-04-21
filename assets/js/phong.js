// Module xử lý dữ liệu phòng trọ với Firebase Realtime Database
document.addEventListener("DOMContentLoaded", function () {
  // Kiểm tra xem window.firebaseDB đã được khởi tạo chưa
  if (!window.firebaseDB) {
    console.error("Firebase Realtime Database chưa được khởi tạo!");
    return;
  }

  // Hàm lấy danh sách phòng trọ
  async function loadRooms(filters = {}) {
    try {
      // Bắt đầu hiển thị loading
      showLoading("roomListContainer");

      // Xây dựng đường dẫn truy vấn
      let path = "rooms";

      // Lấy dữ liệu từ Firebase Realtime Database
      const data = await window.firebaseDB.getData(path);

      // Ẩn loading khi đã có dữ liệu
      hideLoading("roomListContainer");

      if (!data) {
        showEmptyRoomList();
        return;
      }

      // Chuyển đổi object thành array và lọc theo bộ lọc (nếu có)
      const rooms = Object.entries(data)
        .map(([id, room]) => ({
          id,
          ...room,
        }))
        .filter((room) => {
          // Lọc theo khu vực (nếu có)
          if (filters.district && room.district !== filters.district) {
            return false;
          }

          // Lọc theo giá (nếu có)
          if (filters.minPrice && room.price < filters.minPrice) {
            return false;
          }
          if (filters.maxPrice && room.price > filters.maxPrice) {
            return false;
          }

          // Lọc theo diện tích (nếu có)
          if (filters.minArea && room.area < filters.minArea) {
            return false;
          }
          if (filters.maxArea && room.area > filters.maxArea) {
            return false;
          }

          return true;
        });

      // Hiển thị danh sách phòng
      displayRooms(rooms);
    } catch (error) {
      console.error("Lỗi khi tải danh sách phòng trọ:", error);
      hideLoading("roomListContainer");
      showError("Không thể tải danh sách phòng trọ. Vui lòng thử lại sau.");
    }
  }

  // Hiển thị danh sách phòng lên giao diện
  function displayRooms(rooms) {
    const roomListContainer = document.getElementById("roomListContainer");
    if (!roomListContainer) return;

    // Xóa nội dung cũ
    roomListContainer.innerHTML = "";

    if (rooms.length === 0) {
      showEmptyRoomList();
      return;
    }

    // Tạo HTML cho từng phòng
    rooms.forEach((room) => {
      const roomCard = document.createElement("div");
      roomCard.className = "room-card";
      roomCard.innerHTML = `
                <div class="room-image">
                    <img src="${
                      room.images && room.images[0]
                        ? room.images[0]
                        : "../assets/image/nhatro1.jpg"
                    }" alt="${room.title}">
                    ${
                      room.isFeatured
                        ? '<span class="featured-badge">Nổi bật</span>'
                        : ""
                    }
                </div>
                <div class="room-details">
                    <h3>${room.title}</h3>
                    <p class="room-address"><i class="fas fa-map-marker-alt"></i> ${
                      room.address
                    }, ${room.district}, ${room.city}</p>
                    <div class="room-specs">
                        <span><i class="fas fa-ruler-combined"></i> ${
                          room.area
                        } m²</span>
                        <span><i class="fas fa-toilet"></i> ${
                          room.hasPrivateBathroom ? "WC riêng" : "WC chung"
                        }</span>
                    </div>
                    <div class="room-price">${formatCurrency(
                      room.price
                    )} <span>/tháng</span></div>
                    <a href="../pages/phong/danhsach/motaphong.html?id=${
                      room.id
                    }" class="view-details">Xem chi tiết</a>
                </div>
            `;

      roomListContainer.appendChild(roomCard);

      // Thêm hiệu ứng hover
      roomCard.addEventListener("mouseenter", () => {
        roomCard.style.transform = "translateY(-5px)";
        roomCard.style.boxShadow = "0 10px 20px rgba(0,0,0,0.1)";
      });

      roomCard.addEventListener("mouseleave", () => {
        roomCard.style.transform = "translateY(0)";
        roomCard.style.boxShadow = "0 5px 10px rgba(0,0,0,0.05)";
      });
    });
  }

  // Hiển thị thông báo khi không có phòng trọ
  function showEmptyRoomList() {
    const roomListContainer = document.getElementById("roomListContainer");
    if (!roomListContainer) return;

    roomListContainer.innerHTML = `
            <div class="empty-results">
                <i class="fas fa-home"></i>
                <p>Không tìm thấy phòng trọ nào phù hợp với tiêu chí tìm kiếm.</p>
                <button id="clearFiltersBtn" class="btn btn-primary">Xóa bộ lọc</button>
            </div>
        `;

    // Thêm sự kiện xóa bộ lọc
    document.getElementById("clearFiltersBtn").addEventListener("click", () => {
      // Reset form lọc
      const filterForm = document.getElementById("filterForm");
      if (filterForm) filterForm.reset();

      // Tải lại danh sách phòng
      loadRooms();
    });
  }

  // Hiển thị loading
  function showLoading(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Tạo và thêm hiệu ứng loading
    const loadingElement = document.createElement("div");
    loadingElement.className = "loading-spinner";
    loadingElement.innerHTML =
      '<i class="fas fa-spinner fa-spin"></i><p>Đang tải dữ liệu...</p>';

    container.innerHTML = "";
    container.appendChild(loadingElement);
  }

  // Ẩn loading
  function hideLoading(containerId) {
    const container = document.getElementById(containerId);
    const loadingElement = container?.querySelector(".loading-spinner");
    if (loadingElement) {
      loadingElement.remove();
    }
  }

  // Hiển thị thông báo lỗi
  function showError(message) {
    const errorElement = document.createElement("div");
    errorElement.className = "error-message";
    errorElement.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;

    const container = document.getElementById("roomListContainer");
    if (container) {
      container.innerHTML = "";
      container.appendChild(errorElement);
    } else {
      alert(message);
    }
  }

  // Định dạng tiền tệ
  function formatCurrency(amount) {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
    }).format(amount);
  }

  // Khởi tạo các sự kiện cho form lọc
  function initializeFilterForm() {
    const filterForm = document.getElementById("filterForm");
    if (!filterForm) return;

    filterForm.addEventListener("submit", function (event) {
      event.preventDefault();

      // Lấy giá trị các trường lọc
      const district = document.getElementById("district")?.value;
      const minPrice = document.getElementById("minPrice")?.value;
      const maxPrice = document.getElementById("maxPrice")?.value;
      const minArea = document.getElementById("minArea")?.value;
      const maxArea = document.getElementById("maxArea")?.value;

      // Tạo đối tượng filter
      const filters = {
        district: district || null,
        minPrice: minPrice ? parseInt(minPrice) : null,
        maxPrice: maxPrice ? parseInt(maxPrice) : null,
        minArea: minArea ? parseInt(minArea) : null,
        maxArea: maxArea ? parseInt(maxArea) : null,
      };

      // Tải danh sách phòng với bộ lọc
      loadRooms(filters);
    });

    // Sự kiện reset form
    const resetButton = filterForm.querySelector("button[type='reset']");
    if (resetButton) {
      resetButton.addEventListener("click", function () {
        // Đợi một chút để form được reset
        setTimeout(() => {
          loadRooms();
        }, 100);
      });
    }
  }

  // Lấy thông tin chi tiết phòng
  async function loadRoomDetail(roomId) {
    try {
      // Hiển thị loading
      showLoading("roomDetailContainer");

      // Lấy dữ liệu từ Firebase
      const room = await window.firebaseDB.getData(`rooms/${roomId}`);

      // Ẩn loading
      hideLoading("roomDetailContainer");

      if (!room) {
        showError("Không tìm thấy thông tin phòng trọ.");
        return;
      }

      // Hiển thị thông tin chi tiết
      displayRoomDetail(room, roomId);

      // Tải đánh giá của phòng
      loadRoomReviews(roomId);

      // Tăng lượt xem
      increaseViewCount(roomId, room.views || 0);
    } catch (error) {
      console.error("Lỗi khi tải thông tin chi tiết phòng:", error);
      hideLoading("roomDetailContainer");
      showError(
        "Không thể tải thông tin chi tiết phòng. Vui lòng thử lại sau."
      );
    }
  }

  // Hiển thị thông tin chi tiết phòng
  function displayRoomDetail(room, roomId) {
    const roomDetailContainer = document.getElementById("roomDetailContainer");
    if (!roomDetailContainer) return;

    // Tạo HTML hiển thị thông tin phòng
    roomDetailContainer.innerHTML = `
            <div class="room-detail">
                <div class="room-gallery">
                    <div class="main-image">
                        <img id="mainImage" src="${
                          room.images && room.images[0]
                            ? room.images[0]
                            : "../assets/image/nhatro1.jpg"
                        }" alt="${room.title}">
                    </div>
                    <div class="thumbnail-list">
                        ${
                          room.images
                            ? room.images
                                .map(
                                  (image, index) =>
                                    `<div class="thumbnail ${
                                      index === 0 ? "active" : ""
                                    }">
                                <img src="${image}" alt="Hình ảnh ${
                                      index + 1
                                    }" onclick="changeMainImage(this.src)">
                            </div>`
                                )
                                .join("")
                            : ""
                        }
                    </div>
                </div>
                
                <div class="room-info">
                    <h2>${room.title}</h2>
                    <p class="address"><i class="fas fa-map-marker-alt"></i> ${
                      room.address
                    }, ${room.district}, ${room.city}</p>
                    <div class="price-views">
                        <div class="price">${formatCurrency(
                          room.price
                        )} <span>/tháng</span></div>
                        <div class="views"><i class="fas fa-eye"></i> ${
                          room.views || 0
                        } lượt xem</div>
                    </div>
                    
                    <div class="contact-info">
                        <h3>Thông tin liên hệ</h3>
                        <p><i class="fas fa-user"></i> ${
                          room.ownerName || "Chủ trọ"
                        }</p>
                        <p><i class="fas fa-phone"></i> ${
                          room.ownerPhone || "Chưa cung cấp"
                        }</p>
                        <button id="showPhoneBtn" class="btn btn-primary"><i class="fas fa-phone"></i> Gọi điện</button>
                        <button id="saveRoomBtn" class="btn btn-outline"><i class="far fa-heart"></i> Lưu tin</button>
                    </div>
                </div>
                
                <div class="room-details-section">
                    <h3>Thông tin chi tiết</h3>
                    <div class="detail-grid">
                        <div class="detail-item">
                            <span class="label">Diện tích:</span>
                            <span class="value">${room.area} m²</span>
                        </div>
                        <div class="detail-item">
                            <span class="label">Phòng tắm:</span>
                            <span class="value">${
                              room.hasPrivateBathroom ? "Riêng" : "Chung"
                            }</span>
                        </div>
                        <div class="detail-item">
                            <span class="label">Giá điện:</span>
                            <span class="value">${formatCurrency(
                              room.electricityPrice || 3500
                            )}/kWh</span>
                        </div>
                        <div class="detail-item">
                            <span class="label">Giá nước:</span>
                            <span class="value">${formatCurrency(
                              room.waterPrice || 100000
                            )}/người</span>
                        </div>
                        <div class="detail-item">
                            <span class="label">Đặt cọc:</span>
                            <span class="value">${
                              room.deposit
                                ? formatCurrency(room.deposit)
                                : "Thương lượng"
                            }</span>
                        </div>
                        <div class="detail-item">
                            <span class="label">Thời hạn hợp đồng:</span>
                            <span class="value">${
                              room.minimumStay || 6
                            } tháng</span>
                        </div>
                    </div>
                </div>
                
                <div class="room-description">
                    <h3>Mô tả</h3>
                    <div class="description-content">
                        ${room.description || "Chưa có mô tả chi tiết."}
                    </div>
                </div>
                
                <div class="room-amenities">
                    <h3>Tiện ích</h3>
                    <div class="amenities-list">
                        ${getAmenitiesList(room.amenities)}
                    </div>
                </div>
                
                <div class="room-location">
                    <h3>Vị trí</h3>
                    <div class="map-container" id="mapContainer">
                        <iframe 
                            width="100%" 
                            height="400" 
                            frameborder="0" 
                            scrolling="no" 
                            marginheight="0" 
                            marginwidth="0" 
                            src="https://maps.google.com/maps?q=${
                              room.latitude || 10.031452
                            },${
      room.longitude || 105.768986
    }&hl=vi&z=15&output=embed">
                        </iframe>
                    </div>
                </div>
            </div>
        `;

    // Khởi tạo sự kiện cho nút gọi điện
    const showPhoneBtn = document.getElementById("showPhoneBtn");
    if (showPhoneBtn && room.ownerPhone) {
      showPhoneBtn.addEventListener("click", () => {
        alert(`Gọi ngay: ${room.ownerPhone}`);
      });
    }

    // Khởi tạo sự kiện cho nút lưu tin
    const saveRoomBtn = document.getElementById("saveRoomBtn");
    if (saveRoomBtn) {
      saveRoomBtn.addEventListener("click", () => {
        saveRoom(roomId);
      });
    }

    // Thêm hàm đổi hình ảnh chính
    window.changeMainImage = function (src) {
      document.getElementById("mainImage").src = src;

      // Cập nhật thumbnail active
      document.querySelectorAll(".thumbnail").forEach((thumb) => {
        if (thumb.querySelector("img").src === src) {
          thumb.classList.add("active");
        } else {
          thumb.classList.remove("active");
        }
      });
    };
  }

  // Lấy danh sách tiện ích
  function getAmenitiesList(amenities) {
    if (!amenities || Object.keys(amenities).length === 0) {
      return "<p>Chưa cung cấp thông tin.</p>";
    }

    const amenitiesList = [
      { key: "wifi", icon: "fas fa-wifi", label: "WiFi" },
      { key: "airConditioner", icon: "fas fa-snowflake", label: "Máy lạnh" },
      { key: "parking", icon: "fas fa-motorcycle", label: "Chỗ để xe" },
      { key: "security", icon: "fas fa-shield-alt", label: "An ninh" },
      { key: "fridge", icon: "fas fa-temperature-low", label: "Tủ lạnh" },
      { key: "tv", icon: "fas fa-tv", label: "TV" },
      { key: "washing", icon: "fas fa-tshirt", label: "Máy giặt" },
      { key: "kitchen", icon: "fas fa-utensils", label: "Nhà bếp" },
      { key: "pet", icon: "fas fa-paw", label: "Thú cưng" },
      { key: "window", icon: "fas fa-window-maximize", label: "Cửa sổ" },
    ];

    let html = '<div class="amenities-grid">';

    amenitiesList.forEach((item) => {
      const isAvailable = amenities[item.key];
      html += `
                <div class="amenity-item ${
                  isAvailable ? "available" : "unavailable"
                }">
                    <i class="${item.icon}"></i>
                    <span>${item.label}</span>
                </div>
            `;
    });

    html += "</div>";
    return html;
  }

  // Tăng lượt xem phòng
  async function increaseViewCount(roomId, currentViews) {
    try {
      await window.firebaseDB.updateData(`rooms/${roomId}`, {
        views: currentViews + 1,
      });
    } catch (error) {
      console.error("Lỗi khi cập nhật lượt xem:", error);
    }
  }

  // Lưu phòng vào danh sách yêu thích
  async function saveRoom(roomId) {
    // Kiểm tra người dùng đã đăng nhập chưa
    if (!window.auth || !window.auth.currentUser) {
      alert("Vui lòng đăng nhập để lưu phòng trọ!");
      window.location.href = "../pages/auth/dangnhap.html";
      return;
    }

    try {
      const userId = window.auth.currentUser.uid;

      // Lưu vào Firebase
      await window.firebaseDB.setData(`users/${userId}/savedRooms/${roomId}`, {
        savedAt: Date.now(),
      });

      alert("Đã lưu phòng trọ vào danh sách yêu thích!");

      // Cập nhật nút
      const saveRoomBtn = document.getElementById("saveRoomBtn");
      if (saveRoomBtn) {
        saveRoomBtn.innerHTML = '<i class="fas fa-heart"></i> Đã lưu';
        saveRoomBtn.classList.add("saved");
      }
    } catch (error) {
      console.error("Lỗi khi lưu phòng trọ:", error);
      alert("Không thể lưu phòng trọ. Vui lòng thử lại sau!");
    }
  }

  // Tải đánh giá của phòng
  async function loadRoomReviews(roomId) {
    try {
      const reviewsContainer = document.getElementById("reviewsContainer");
      if (!reviewsContainer) return;

      // Hiển thị loading
      reviewsContainer.innerHTML =
        '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i><p>Đang tải đánh giá...</p></div>';

      // Lấy dữ liệu từ Firebase
      const reviewsData = await window.firebaseDB.getData(
        `rooms/${roomId}/reviews`
      );

      if (!reviewsData) {
        reviewsContainer.innerHTML =
          '<p class="no-reviews">Chưa có đánh giá nào cho phòng trọ này.</p>';
        return;
      }

      // Chuyển đổi object thành array và sắp xếp theo thời gian
      const reviews = Object.values(reviewsData).sort(
        (a, b) => b.createdAt - a.createdAt
      );

      // Tính điểm đánh giá trung bình
      const totalRating = reviews.reduce(
        (sum, review) => sum + (review.rating || 0),
        0
      );
      const averageRating =
        reviews.length > 0 ? (totalRating / reviews.length).toFixed(1) : 0;

      // Hiển thị điểm đánh giá trung bình
      let html = `
                <div class="rating-summary">
                    <div class="average-rating">
                        <span class="rating-score">${averageRating}</span>
                        <div class="stars">
                            ${getStarRating(averageRating)}
                        </div>
                        <span class="total-reviews">${
                          reviews.length
                        } đánh giá</span>
                    </div>
                </div>
                <div class="reviews-list">
            `;

      // Hiển thị danh sách đánh giá
      reviews.forEach((review) => {
        html += `
                    <div class="review-item">
                        <div class="reviewer-info">
                            <div class="avatar">
                                <img src="${
                                  review.userAvatar ||
                                  "../assets/image/user/user1.jpg"
                                }" alt="${review.userName || "Người dùng"}">
                            </div>
                            <div class="reviewer-name-date">
                                <h4>${review.userName || "Người dùng"}</h4>
                                <span class="review-date">${formatDate(
                                  review.createdAt
                                )}</span>
                            </div>
                        </div>
                        <div class="review-content">
                            <div class="rating">
                                ${getStarRating(review.rating || 0)}
                            </div>
                            <p>${review.comment || "Không có bình luận."}</p>
                        </div>
                    </div>
                `;
      });

      html += "</div>";

      // Thêm form đánh giá nếu người dùng đã đăng nhập
      if (window.auth && window.auth.currentUser) {
        html += `
                    <div class="add-review">
                        <h3>Viết đánh giá</h3>
                        <form id="reviewForm">
                            <div class="rating-input">
                                <span>Đánh giá của bạn:</span>
                                <div class="star-rating">
                                    <i class="far fa-star" data-rating="1"></i>
                                    <i class="far fa-star" data-rating="2"></i>
                                    <i class="far fa-star" data-rating="3"></i>
                                    <i class="far fa-star" data-rating="4"></i>
                                    <i class="far fa-star" data-rating="5"></i>
                                </div>
                                <input type="hidden" name="rating" id="ratingInput" value="0">
                            </div>
                            <div class="form-group">
                                <label for="reviewComment">Bình luận:</label>
                                <textarea id="reviewComment" name="comment" rows="4" placeholder="Chia sẻ trải nghiệm của bạn về phòng trọ này..."></textarea>
                            </div>
                            <button type="submit" class="btn btn-primary">Gửi đánh giá</button>
                        </form>
                    </div>
                `;
      } else {
        html += `
                    <div class="login-to-review">
                        <p>Vui lòng <a href="../pages/auth/dangnhap.html">đăng nhập</a> để viết đánh giá.</p>
                    </div>
                `;
      }

      // Cập nhật nội dung
      reviewsContainer.innerHTML = html;

      // Khởi tạo sự kiện cho form đánh giá
      initializeReviewForm(roomId);
    } catch (error) {
      console.error("Lỗi khi tải đánh giá:", error);
      const reviewsContainer = document.getElementById("reviewsContainer");
      if (reviewsContainer) {
        reviewsContainer.innerHTML =
          '<p class="error-message">Không thể tải đánh giá. Vui lòng thử lại sau!</p>';
      }
    }
  }

  // Khởi tạo form đánh giá
  function initializeReviewForm(roomId) {
    const reviewForm = document.getElementById("reviewForm");
    if (!reviewForm) return;

    // Xử lý sự kiện khi click vào sao
    const starElements = document.querySelectorAll(".star-rating i");
    starElements.forEach((star) => {
      star.addEventListener("click", function () {
        const rating = parseInt(this.getAttribute("data-rating"));
        document.getElementById("ratingInput").value = rating;

        // Cập nhật hiển thị sao
        starElements.forEach((s) => {
          const starRating = parseInt(s.getAttribute("data-rating"));
          if (starRating <= rating) {
            s.className = "fas fa-star";
          } else {
            s.className = "far fa-star";
          }
        });
      });
    });

    // Xử lý sự kiện khi submit form
    reviewForm.addEventListener("submit", async function (event) {
      event.preventDefault();

      // Lấy dữ liệu từ form
      const rating = parseInt(document.getElementById("ratingInput").value);
      const comment = document.getElementById("reviewComment").value.trim();

      if (rating === 0) {
        alert("Vui lòng đánh giá phòng trọ!");
        return;
      }

      if (!comment) {
        alert("Vui lòng nhập bình luận!");
        return;
      }

      try {
        // Lấy thông tin người dùng
        const user = window.auth.currentUser;
        if (!user) {
          alert("Vui lòng đăng nhập để gửi đánh giá!");
          return;
        }

        // Tạo đối tượng đánh giá
        const review = {
          userId: user.uid,
          userName: user.displayName || "Người dùng",
          userAvatar: user.photoURL || null,
          rating: rating,
          comment: comment,
          createdAt: Date.now(),
        };

        // Lưu đánh giá vào Firebase
        await window.firebaseDB.addData(`rooms/${roomId}/reviews`, review);

        // Hiển thị thông báo thành công
        alert("Cảm ơn bạn đã đánh giá!");

        // Reset form và tải lại đánh giá
        reviewForm.reset();
        document.getElementById("ratingInput").value = 0;
        starElements.forEach((s) => {
          s.className = "far fa-star";
        });

        // Tải lại đánh giá
        loadRoomReviews(roomId);
      } catch (error) {
        console.error("Lỗi khi gửi đánh giá:", error);
        alert("Không thể gửi đánh giá. Vui lòng thử lại sau!");
      }
    });
  }

  // Lấy HTML cho hiển thị sao đánh giá
  function getStarRating(rating) {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

    let html = "";

    // Thêm sao đầy
    for (let i = 0; i < fullStars; i++) {
      html += '<i class="fas fa-star"></i>';
    }

    // Thêm nửa sao nếu có
    if (halfStar) {
      html += '<i class="fas fa-star-half-alt"></i>';
    }

    // Thêm sao rỗng
    for (let i = 0; i < emptyStars; i++) {
      html += '<i class="far fa-star"></i>';
    }

    return html;
  }

  // Định dạng ngày tháng
  function formatDate(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  // Lấy ID phòng từ URL
  function getRoomIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get("id");
  }

  // Khởi tạo trang theo loại
  function initializePage() {
    // Xác định loại trang đang mở
    const path = window.location.pathname;

    if (path.includes("motaphong.html")) {
      // Đây là trang chi tiết phòng
      const roomId = getRoomIdFromUrl();
      if (roomId) {
        loadRoomDetail(roomId);
      } else {
        showError("Không tìm thấy thông tin phòng trọ.");
      }
    } else if (path.includes("phong.html") || path.includes("danhsach")) {
      // Đây là trang danh sách phòng
      loadRooms();
      initializeFilterForm();
    }
  }

  // Khởi tạo trang khi tài liệu đã tải xong
  initializePage();
});
