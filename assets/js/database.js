/**
 * Database Functions for Nhà Trọ Kết Nối
 * Các chức năng kết nối với Firebase Database
 */
import { dbService } from "../../backend/src/firebase/utils.js";

// Khởi tạo Firebase khi trang web được tải
document.addEventListener("DOMContentLoaded", initializeApp);

/**
 * Khởi tạo ứng dụng
 */
function initializeApp() {
  // Kiểm tra và hiển thị thông tin người dùng nếu đã đăng nhập
  checkUserAuth();

  // Khởi tạo các sự kiện cho form tìm kiếm
  initSearchForm();

  // Khởi tạo các sự kiện cho form lọc
  initFilterForm();

  // Tải các khu vực và điểm nổi bật
  loadAreas();
  loadFeaturedPlaces();
}

/**
 * Kiểm tra trạng thái đăng nhập của người dùng
 */
function checkUserAuth() {
  dbService.onAuthStateChanged((user) => {
    if (user) {
      console.log("Người dùng đã đăng nhập:", user.displayName);
      // Cập nhật UI hiển thị thông tin người dùng
      updateUserUI(user);
    } else {
      console.log("Chưa đăng nhập");
      // Hiển thị UI cho người dùng chưa đăng nhập
      updateGuestUI();
    }
  });
}

/**
 * Cập nhật giao diện khi người dùng đã đăng nhập
 * @param {Object} user - Thông tin người dùng từ Firebase Auth
 */
function updateUserUI(user) {
  const userMenus = document.querySelectorAll(".user-menu");
  const loginButtons = document.querySelectorAll(".login-button");

  if (userMenus.length) {
    userMenus.forEach((menu) => {
      // Cập nhật avatar và tên người dùng
      const userAvatar = menu.querySelector(".user-avatar");
      const userName = menu.querySelector(".user-name");

      if (userAvatar) {
        userAvatar.src = user.photoURL || "/assets/image/avatars/user2.jpg";
        userAvatar.alt = user.displayName || "User";
      }

      if (userName) {
        userName.textContent = user.displayName || "User";
      }

      menu.classList.remove("d-none");
    });
  }

  if (loginButtons.length) {
    loginButtons.forEach((button) => {
      button.classList.add("d-none");
    });
  }
}

/**
 * Cập nhật giao diện cho khách
 */
function updateGuestUI() {
  const userMenus = document.querySelectorAll(".user-menu");
  const loginButtons = document.querySelectorAll(".login-button");

  if (userMenus.length) {
    userMenus.forEach((menu) => {
      menu.classList.add("d-none");
    });
  }

  if (loginButtons.length) {
    loginButtons.forEach((button) => {
      button.classList.remove("d-none");
    });
  }
}

/**
 * Khởi tạo form tìm kiếm
 */
function initSearchForm() {
  const searchForm = document.getElementById("search-form");
  if (!searchForm) return;

  searchForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Lấy giá trị từ form
    const keyword = document.getElementById("search-keyword")?.value || "";
    const khuVuc = document.getElementById("search-area")?.value || "";
    const giaThue = document.getElementById("search-price")?.value || "";
    const dienTich = document.getElementById("search-area-size")?.value || "";

    // Chuyển đổi giá trị
    let giaTu, giaDen;
    if (giaThue) {
      const giaParts = giaThue.split("-");
      giaTu = parseFloat(giaParts[0]) || 0;
      giaDen = giaParts.length > 1 ? parseFloat(giaParts[1]) : undefined;
    }

    let dienTichTu, dienTichDen;
    if (dienTich) {
      const dienTichParts = dienTich.split("-");
      dienTichTu = parseFloat(dienTichParts[0]) || 0;
      dienTichDen =
        dienTichParts.length > 1 ? parseFloat(dienTichParts[1]) : undefined;
    }

    // Tạo đối tượng filters
    const filters = {
      keyword,
      khuVuc: khuVuc !== "all" ? khuVuc : undefined,
      giaTu,
      giaDen,
      dienTichTu,
      dienTichDen,
      page: 1,
      limit: 12,
    };

    // Lưu filters vào localStorage để sử dụng ở trang kết quả
    localStorage.setItem("roomSearchFilters", JSON.stringify(filters));

    // Chuyển hướng đến trang kết quả
    window.location.href = "/pages/phong/phong.html";
  });
}

/**
 * Khởi tạo form lọc kết quả
 */
function initFilterForm() {
  const filterForm = document.getElementById("filter-form");
  if (!filterForm) return;

  // Tải bộ lọc từ localStorage nếu có
  const savedFilters = localStorage.getItem("roomSearchFilters");
  if (savedFilters) {
    const filters = JSON.parse(savedFilters);
    populateFilterForm(filters);
  }

  // Áp dụng bộ lọc khi form được gửi đi
  filterForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Lấy giá trị từ form
    const keyword = document.getElementById("filter-keyword")?.value || "";
    const khuVuc = document.getElementById("filter-area")?.value || "";
    const giaTu =
      parseFloat(document.getElementById("filter-price-from")?.value) ||
      undefined;
    const giaDen =
      parseFloat(document.getElementById("filter-price-to")?.value) ||
      undefined;
    const dienTichTu =
      parseFloat(document.getElementById("filter-area-from")?.value) ||
      undefined;
    const dienTichDen =
      parseFloat(document.getElementById("filter-area-to")?.value) || undefined;

    // Lấy các tiện ích được chọn
    const tienIchElements = document.querySelectorAll(
      ".filter-amenity:checked"
    );
    const tienIch = Array.from(tienIchElements).map((el) => el.value);

    // Lấy đối tượng được chọn
    const doiTuong = document.querySelector(
      'input[name="filter-tenant"]:checked'
    )?.value;

    // Lấy loại giao dịch
    const giaoDich = document.querySelector(
      'input[name="filter-transaction"]:checked'
    )?.value;

    // Sắp xếp
    const sort = document.getElementById("filter-sort")?.value || "newest";

    // Tạo đối tượng filters
    const filters = {
      keyword,
      khuVuc: khuVuc !== "all" ? khuVuc : undefined,
      giaTu,
      giaDen,
      dienTichTu,
      dienTichDen,
      tienIch: tienIch.length > 0 ? tienIch : undefined,
      doiTuong,
      giaoDich,
      sort,
      page: 1,
      limit: 12,
    };

    // Lưu filters vào localStorage
    localStorage.setItem("roomSearchFilters", JSON.stringify(filters));

    // Tìm kiếm và hiển thị kết quả
    searchAndDisplayRooms(filters);
  });

  // Khởi tạo sự kiện sắp xếp
  initSortingEvents();

  // Khởi tạo sự kiện phân trang
  initPaginationEvents();

  // Tìm kiếm ban đầu dựa trên các bộ lọc
  const savedFiltersObj = savedFilters ? JSON.parse(savedFilters) : {};
  searchAndDisplayRooms(savedFiltersObj);
}

/**
 * Điền thông tin vào form lọc từ bộ lọc đã lưu
 * @param {Object} filters - Các bộ lọc đã lưu
 */
function populateFilterForm(filters) {
  // Điền từ khóa
  if (filters.keyword && document.getElementById("filter-keyword")) {
    document.getElementById("filter-keyword").value = filters.keyword;
  }

  // Điền khu vực
  if (filters.khuVuc && document.getElementById("filter-area")) {
    document.getElementById("filter-area").value = filters.khuVuc;
  }

  // Điền giá thuê
  if (
    filters.giaTu !== undefined &&
    document.getElementById("filter-price-from")
  ) {
    document.getElementById("filter-price-from").value = filters.giaTu;
  }

  if (
    filters.giaDen !== undefined &&
    document.getElementById("filter-price-to")
  ) {
    document.getElementById("filter-price-to").value = filters.giaDen;
  }

  // Điền diện tích
  if (
    filters.dienTichTu !== undefined &&
    document.getElementById("filter-area-from")
  ) {
    document.getElementById("filter-area-from").value = filters.dienTichTu;
  }

  if (
    filters.dienTichDen !== undefined &&
    document.getElementById("filter-area-to")
  ) {
    document.getElementById("filter-area-to").value = filters.dienTichDen;
  }

  // Chọn các tiện ích
  if (filters.tienIch && filters.tienIch.length > 0) {
    filters.tienIch.forEach((tienIch) => {
      const tienIchElement = document.querySelector(
        `.filter-amenity[value="${tienIch}"]`
      );
      if (tienIchElement) {
        tienIchElement.checked = true;
      }
    });
  }

  // Chọn đối tượng
  if (filters.doiTuong) {
    const doiTuongElement = document.querySelector(
      `input[name="filter-tenant"][value="${filters.doiTuong}"]`
    );
    if (doiTuongElement) {
      doiTuongElement.checked = true;
    }
  }

  // Chọn loại giao dịch
  if (filters.giaoDich) {
    const giaoDichElement = document.querySelector(
      `input[name="filter-transaction"][value="${filters.giaoDich}"]`
    );
    if (giaoDichElement) {
      giaoDichElement.checked = true;
    }
  }

  // Điền sắp xếp
  if (filters.sort && document.getElementById("filter-sort")) {
    document.getElementById("filter-sort").value = filters.sort;
  }
}

/**
 * Khởi tạo sự kiện sắp xếp
 */
function initSortingEvents() {
  const sortSelect = document.getElementById("filter-sort");
  if (!sortSelect) return;

  sortSelect.addEventListener("change", async () => {
    // Lấy bộ lọc hiện tại
    const savedFilters = localStorage.getItem("roomSearchFilters");
    if (!savedFilters) return;

    const filters = JSON.parse(savedFilters);
    filters.sort = sortSelect.value;
    filters.page = 1; // Trở về trang đầu tiên khi thay đổi sắp xếp

    // Lưu bộ lọc mới
    localStorage.setItem("roomSearchFilters", JSON.stringify(filters));

    // Tìm kiếm và hiển thị kết quả
    searchAndDisplayRooms(filters);
  });
}

/**
 * Khởi tạo sự kiện phân trang
 */
function initPaginationEvents() {
  document.addEventListener("click", async (e) => {
    if (e.target.classList.contains("page-link")) {
      e.preventDefault();

      const page = e.target.dataset.page;
      if (!page) return;

      // Lấy bộ lọc hiện tại
      const savedFilters = localStorage.getItem("roomSearchFilters");
      if (!savedFilters) return;

      const filters = JSON.parse(savedFilters);
      filters.page = parseInt(page);

      // Lưu bộ lọc mới
      localStorage.setItem("roomSearchFilters", JSON.stringify(filters));

      // Tìm kiếm và hiển thị kết quả
      searchAndDisplayRooms(filters);

      // Cuộn lên đầu trang
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  });
}

/**
 * Tìm kiếm và hiển thị kết quả phòng trọ
 * @param {Object} filters - Các bộ lọc tìm kiếm
 */
async function searchAndDisplayRooms(filters = {}) {
  try {
    // Hiển thị trạng thái đang tải
    const roomResults = document.getElementById("room-results");
    if (roomResults) {
      roomResults.innerHTML =
        '<div class="text-center py-5"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Đang tải...</span></div><p class="mt-3">Đang tìm kiếm phòng trọ...</p></div>';
    }

    // Gọi API tìm kiếm
    const result = await dbService.searchRooms(filters);

    if (!result.success) {
      throw new Error("Không thể tìm kiếm phòng trọ");
    }

    // Hiển thị kết quả
    displaySearchResults(result.data, result.pagination);
  } catch (error) {
    console.error("Lỗi tìm kiếm phòng trọ:", error);
    // Hiển thị thông báo lỗi
    const roomResults = document.getElementById("room-results");
    if (roomResults) {
      roomResults.innerHTML = `
        <div class="alert alert-danger my-5" role="alert">
          <h4 class="alert-heading">Đã xảy ra lỗi!</h4>
          <p>Không thể tìm kiếm phòng trọ. Vui lòng thử lại sau.</p>
          <hr>
          <p class="mb-0">Chi tiết lỗi: ${error.message}</p>
        </div>
      `;
    }
  }
}

/**
 * Hiển thị kết quả tìm kiếm
 * @param {Array} rooms - Danh sách phòng trọ
 * @param {Object} pagination - Thông tin phân trang
 */
function displaySearchResults(rooms, pagination) {
  const roomResults = document.getElementById("room-results");
  const resultsCount = document.getElementById("results-count");

  if (!roomResults) return;

  if (rooms.length === 0) {
    // Hiển thị thông báo không có kết quả
    roomResults.innerHTML = `
      <div class="alert alert-info my-5" role="alert">
        <h4 class="alert-heading">Không tìm thấy phòng trọ!</h4>
        <p>Không có phòng trọ nào phù hợp với tiêu chí tìm kiếm của bạn.</p>
        <hr>
        <p class="mb-0">Vui lòng thử lại với các tiêu chí khác.</p>
      </div>
    `;

    if (resultsCount) {
      resultsCount.textContent = "0";
    }

    return;
  }

  // Cập nhật số lượng kết quả
  if (resultsCount) {
    resultsCount.textContent = pagination.total.toString();
  }

  // Tạo HTML cho danh sách phòng
  let roomsHTML = "";

  rooms.forEach((room) => {
    const giaTienFormatted = formatCurrency(room.giaThue);

    roomsHTML += `
      <div class="col-md-6 col-lg-4 mb-4">
        <div class="card room-card h-100">
          <div class="room-image">
            <a href="/pages/phong/danhsach/motaphong.html?id=${room.id}">
              <img src="${room.giaoDien}" class="card-img-top" alt="${
      room.tieuDe
    }">
            </a>
            <span class="badge ${
              room.trangThai === "còn phòng" ? "bg-success" : "bg-danger"
            }">${room.trangThai}</span>
          </div>
          <div class="card-body">
            <div class="d-flex justify-content-between">
              <span class="badge rounded-pill bg-primary mb-2">${
                room.giaoDich
              }</span>
              <span class="text-muted small"><i class="bi bi-calendar"></i> ${formatDate(
                room.createdAt
              )}</span>
            </div>
            <h5 class="card-title">
              <a href="/pages/phong/danhsach/motaphong.html?id=${
                room.id
              }" class="text-decoration-none">${room.tieuDe}</a>
            </h5>
            <p class="card-text address"><i class="bi bi-geo-alt"></i> ${
              room.diaChi
            }</p>
            <div class="room-features">
              <span><i class="bi bi-rulers"></i> ${room.dienTich} m²</span>
              <span class="price">${giaTienFormatted}/tháng</span>
            </div>
            <hr>
            <div class="room-amenities">
              ${generateAmenityIcons(room.tienIch)}
            </div>
          </div>
          <div class="card-footer bg-white d-flex justify-content-between align-items-center">
            <button class="btn btn-sm btn-outline-primary save-room" data-room-id="${
              room.id
            }">
              <i class="bi bi-bookmark"></i> Lưu
            </button>
            <a href="/pages/phong/danhsach/motaphong.html?id=${
              room.id
            }" class="btn btn-sm btn-primary">
              Chi tiết <i class="bi bi-arrow-right"></i>
            </a>
          </div>
        </div>
      </div>
    `;
  });

  // Hiển thị danh sách phòng
  roomResults.innerHTML = `
    <div class="row">
      ${roomsHTML}
    </div>
  `;

  // Hiển thị phân trang
  displayPagination(pagination);

  // Khởi tạo sự kiện lưu phòng
  initSaveRoomEvents();
}

/**
 * Tạo các biểu tượng tiện ích
 * @param {Array} amenities - Danh sách tiện ích
 * @returns {string} - HTML của các biểu tượng tiện ích
 */
function generateAmenityIcons(amenities) {
  if (!amenities || !Array.isArray(amenities) || amenities.length === 0) {
    return "";
  }

  const amenityIcons = {
    wifi: "wifi",
    "dieu-hoa": "thermometer-half",
    "may-giat": "droplet",
    "tu-lanh": "thermometer-snow",
    "nha-ve-sinh": "door-closed",
    "gac-lung": "layers",
    camera: "camera",
    "ban-cong": "door-open",
    bep: "cup-hot",
    "bai-gui-xe": "bicycle",
  };

  const amenityTitles = {
    wifi: "Wifi miễn phí",
    "dieu-hoa": "Điều hòa",
    "may-giat": "Máy giặt",
    "tu-lanh": "Tủ lạnh",
    "nha-ve-sinh": "Nhà vệ sinh riêng",
    "gac-lung": "Gác lửng",
    camera: "Camera an ninh",
    "ban-cong": "Ban công",
    bep: "Bếp",
    "bai-gui-xe": "Bãi giữ xe",
  };

  // Giới hạn số lượng tiện ích hiển thị
  const maxAmenities = 4;
  const displayedAmenities = amenities.slice(0, maxAmenities);
  const remainingCount = amenities.length - maxAmenities;

  let html = "";

  displayedAmenities.forEach((amenity) => {
    const icon = amenityIcons[amenity] || "check-circle";
    const title = amenityTitles[amenity] || amenity;

    html += `<span title="${title}"><i class="bi bi-${icon}"></i></span>`;
  });

  if (remainingCount > 0) {
    html += `<span class="more-amenities" title="${remainingCount} tiện ích khác">+${remainingCount}</span>`;
  }

  return html;
}

/**
 * Hiển thị phân trang
 * @param {Object} pagination - Thông tin phân trang
 */
function displayPagination(pagination) {
  const paginationElement = document.getElementById("pagination");
  if (!paginationElement) return;

  const { total, totalPages, page, limit } = pagination;

  if (totalPages <= 1) {
    paginationElement.innerHTML = "";
    return;
  }

  let paginationHTML = '<nav><ul class="pagination justify-content-center">';

  // Nút Previous
  paginationHTML += `
    <li class="page-item ${page === 1 ? "disabled" : ""}">
      <a class="page-link" href="#" data-page="${
        page - 1
      }" aria-label="Previous">
        <span aria-hidden="true">&laquo;</span>
      </a>
    </li>
  `;

  // Các nút trang
  const maxVisiblePages = 5;
  let startPage = Math.max(1, page - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

  // Điều chỉnh startPage nếu cần
  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  // Hiển thị trang đầu tiên
  if (startPage > 1) {
    paginationHTML += `
      <li class="page-item">
        <a class="page-link" href="#" data-page="1">1</a>
      </li>
    `;

    if (startPage > 2) {
      paginationHTML += `
        <li class="page-item disabled">
          <a class="page-link" href="#">...</a>
        </li>
      `;
    }
  }

  // Các trang giữa
  for (let i = startPage; i <= endPage; i++) {
    paginationHTML += `
      <li class="page-item ${i === page ? "active" : ""}">
        <a class="page-link" href="#" data-page="${i}">${i}</a>
      </li>
    `;
  }

  // Hiển thị trang cuối cùng
  if (endPage < totalPages) {
    if (endPage < totalPages - 1) {
      paginationHTML += `
        <li class="page-item disabled">
          <a class="page-link" href="#">...</a>
        </li>
      `;
    }

    paginationHTML += `
      <li class="page-item">
        <a class="page-link" href="#" data-page="${totalPages}">${totalPages}</a>
      </li>
    `;
  }

  // Nút Next
  paginationHTML += `
    <li class="page-item ${page === totalPages ? "disabled" : ""}">
      <a class="page-link" href="#" data-page="${page + 1}" aria-label="Next">
        <span aria-hidden="true">&raquo;</span>
      </a>
    </li>
  `;

  paginationHTML += "</ul></nav>";

  paginationElement.innerHTML = paginationHTML;
}

/**
 * Khởi tạo sự kiện lưu phòng
 */
function initSaveRoomEvents() {
  const saveButtons = document.querySelectorAll(".save-room");

  saveButtons.forEach((button) => {
    button.addEventListener("click", async () => {
      const roomId = button.dataset.roomId;
      const user = dbService.getCurrentUser();

      if (!user) {
        // Hiển thị thông báo yêu cầu đăng nhập
        alert("Vui lòng đăng nhập để lưu phòng trọ.");
        // Chuyển hướng đến trang đăng nhập
        window.location.href = "/pages/auth/dangnhap.html";
        return;
      }

      try {
        // Lưu phòng vào danh sách yêu thích của người dùng
        await dbService.updateData(
          `users/${user.uid}/savedRooms/${roomId}`,
          true
        );

        // Cập nhật UI
        button.innerHTML = '<i class="bi bi-bookmark-check-fill"></i> Đã lưu';
        button.classList.remove("btn-outline-primary");
        button.classList.add("btn-success");

        // Hiển thị thông báo
        alert("Đã lưu phòng trọ vào danh sách yêu thích của bạn!");
      } catch (error) {
        console.error("Lỗi khi lưu phòng trọ:", error);
        alert("Không thể lưu phòng trọ. Vui lòng thử lại sau.");
      }
    });
  });
}

/**
 * Tải danh sách khu vực
 */
async function loadAreas() {
  try {
    // Lấy các phần tử select khu vực
    const areaSelects = document.querySelectorAll(".area-select");
    if (areaSelects.length === 0) return;

    // Lấy danh sách khu vực từ Firebase
    const result = await dbService.getData("khuVuc");

    if (!result.success || !result.data) {
      throw new Error("Không thể tải danh sách khu vực");
    }

    // Tạo các tùy chọn cho select
    const areas = result.data;
    let optionsHTML = '<option value="all">Tất cả khu vực</option>';

    for (const key in areas) {
      if (Object.hasOwnProperty.call(areas, key)) {
        const area = areas[key];
        optionsHTML += `<option value="${area.id}">${area.ten}</option>`;
      }
    }

    // Cập nhật các select
    areaSelects.forEach((select) => {
      select.innerHTML = optionsHTML;
    });
  } catch (error) {
    console.error("Lỗi tải danh sách khu vực:", error);
  }
}

/**
 * Tải danh sách điểm nổi bật
 */
async function loadFeaturedPlaces() {
  try {
    const featuredPlacesContainer = document.getElementById("featured-places");
    if (!featuredPlacesContainer) return;

    // Lấy danh sách điểm nổi bật từ Firebase
    const result = await dbService.getData("diemNoiBat");

    if (!result.success || !result.data) {
      throw new Error("Không thể tải danh sách điểm nổi bật");
    }

    // Tạo HTML cho các điểm nổi bật
    const places = result.data;
    let placesHTML = "";

    for (const key in places) {
      if (Object.hasOwnProperty.call(places, key)) {
        const place = places[key];

        placesHTML += `
          <div class="col-md-4 mb-4">
            <div class="featured-place card h-100">
              <img src="${place.hinhAnh}" class="card-img-top" alt="${place.ten}">
              <div class="card-body">
                <h5 class="card-title">${place.ten}</h5>
                <p class="card-text">${place.diaChi}</p>
                <a href="/pages/phong/phong.html?place=${place.id}" class="btn btn-outline-primary">Xem phòng trọ gần đây</a>
              </div>
            </div>
          </div>
        `;
      }
    }

    // Cập nhật container
    featuredPlacesContainer.innerHTML = placesHTML;
  } catch (error) {
    console.error("Lỗi tải danh sách điểm nổi bật:", error);
  }
}

/**
 * Định dạng số tiền thành chuỗi tiền tệ VND
 * @param {number} amount - Số tiền
 * @returns {string} - Chuỗi tiền tệ đã định dạng
 */
function formatCurrency(amount) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Định dạng timestamp thành chuỗi ngày tháng
 * @param {number} timestamp - Timestamp
 * @returns {string} - Chuỗi ngày tháng đã định dạng
 */
function formatDate(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleDateString("vi-VN");
}

// Export các chức năng chính
export default {
  searchAndDisplayRooms,
  dbService,
};
