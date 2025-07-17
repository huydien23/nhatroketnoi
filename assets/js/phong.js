// Xử lý trang danh sách phòng trọ
import { roomSearchService } from "./database.js";

document.addEventListener("DOMContentLoaded", async function () {
  // Khởi tạo Firebase
  if (!window.firebase) {
    console.error("Firebase chưa được tải hoặc khởi tạo!");
    return;
  }

  // Khởi tạo dịch vụ tìm kiếm phòng trọ
  window.roomSearchService = roomSearchService;

  // Lấy các tham số từ URL
  const urlParams = new URLSearchParams(window.location.search);
  const filters = getFiltersFromUrl(urlParams);

  // Thêm filters vào data-attributes của container kết quả để dễ dàng cập nhật
  const roomList = document.getElementById("roomList");
  if (roomList) {
    Object.keys(filters).forEach((key) => {
      if (filters[key] !== undefined) {
        roomList.dataset[key] = filters[key];
      }
    });
  }

  // Tải danh sách phòng trọ
  await loadRoomList(filters);

  // Cập nhật UI lọc theo các tham số đã chọn
  updateFilterUI(filters);

  // Khởi tạo sự kiện cho các bộ lọc
  initFilters();

  // Khởi tạo phân trang
  initPagination();
});

// Chuyển đổi tham số URL thành object bộ lọc
function getFiltersFromUrl(urlParams) {
  const filters = {
    keyword: urlParams.get("keyword") || "",
    khuVuc: urlParams.get("khuVuc") || "",
    giaTu: parseFloat(urlParams.get("giaTu")) || undefined,
    giaDen: parseFloat(urlParams.get("giaDen")) || undefined,
    dienTichTu: parseFloat(urlParams.get("dienTichTu")) || undefined,
    dienTichDen: parseFloat(urlParams.get("dienTichDen")) || undefined,
    tienIch: urlParams.getAll("tienIch") || [],
    doiTuong: urlParams.get("doiTuong") || "",
    giaoDich: urlParams.get("giaoDich") || "",
    sort: urlParams.get("sort") || "newest",
    page: parseInt(urlParams.get("page")) || 1,
    limit: parseInt(urlParams.get("limit")) || 12,
  };

  // Xoá các tham số undefined hoặc null
  Object.keys(filters).forEach((key) => {
    if (
      filters[key] === undefined ||
      filters[key] === null ||
      filters[key] === ""
    ) {
      delete filters[key];
    }
  });

  return filters;
}

// Cập nhật UI theo bộ lọc đã chọn
function updateFilterUI(filters) {
  // Cập nhật input tìm kiếm
  if (filters.keyword) {
    const searchInput = document.getElementById("searchKeyword");
    if (searchInput) searchInput.value = filters.keyword;
  }

  // Cập nhật lọc khu vực
  if (filters.khuVuc) {
    const khuVucSelect = document.querySelector(".filter-khuVuc select");
    if (khuVucSelect) khuVucSelect.value = filters.khuVuc;
  }

  // Cập nhật lọc giá
  if (filters.giaTu !== undefined || filters.giaDen !== undefined) {
    const giaSelect = document.querySelector(".filter-price select");
    if (giaSelect) {
      // Logic chọn khoảng giá phù hợp
      if (filters.giaTu !== undefined && filters.giaDen !== undefined) {
        if (filters.giaTu === 0 && filters.giaDen === 1)
          giaSelect.value = "0-1";
        else if (filters.giaTu === 1 && filters.giaDen === 2)
          giaSelect.value = "1-2";
        else if (filters.giaTu === 2 && filters.giaDen === 3)
          giaSelect.value = "2-3";
      } else if (filters.giaTu !== undefined && filters.giaTu === 3) {
        giaSelect.value = "3+";
      } else if (filters.giaDen !== undefined && filters.giaDen === 1) {
        giaSelect.value = "0-1";
      }
    }
  }

  // Cập nhật lọc diện tích
  if (filters.dienTichTu !== undefined || filters.dienTichDen !== undefined) {
    const dienTichSelect = document.querySelector(".filter-area select");
    if (dienTichSelect) {
      if (
        filters.dienTichTu !== undefined &&
        filters.dienTichDen !== undefined
      ) {
        if (filters.dienTichTu === 0 && filters.dienTichDen === 20)
          dienTichSelect.value = "0-20";
        else if (filters.dienTichTu === 20 && filters.dienTichDen === 30)
          dienTichSelect.value = "20-30";
        else if (filters.dienTichTu === 30 && filters.dienTichDen === 40)
          dienTichSelect.value = "30-40";
      } else if (
        filters.dienTichTu !== undefined &&
        filters.dienTichTu === 40
      ) {
        dienTichSelect.value = "40+";
      } else if (
        filters.dienTichDen !== undefined &&
        filters.dienTichDen === 20
      ) {
        dienTichSelect.value = "0-20";
      }
    }
  }

  // Cập nhật lọc tiện ích
  if (filters.tienIch && filters.tienIch.length > 0) {
    const tienIchChecks = document.querySelectorAll(
      '.filter-amenities input[type="checkbox"]'
    );
    tienIchChecks.forEach((checkbox) => {
      if (filters.tienIch.includes(checkbox.value)) {
        checkbox.checked = true;
      }
    });
  }

  // Cập nhật lọc đối tượng
  if (filters.doiTuong) {
    const doiTuongRadios = document.querySelectorAll(
      '.filter-audience input[type="radio"]'
    );
    doiTuongRadios.forEach((radio) => {
      if (radio.value === filters.doiTuong) {
        radio.checked = true;
      }
    });
  }

  // Cập nhật sắp xếp
  if (filters.sort) {
    const sortSelect = document.querySelector(".sort-options select");
    if (sortSelect) sortSelect.value = filters.sort;
  }
}

// Tải danh sách phòng trọ theo bộ lọc
async function loadRoomList(filters) {
  const roomList = document.getElementById("roomList");
  const loadingIndicator = document.querySelector(".room-loading");

  if (!roomList) return;

  try {
    // Hiển thị chỉ báo đang tải
    if (loadingIndicator) loadingIndicator.style.display = "block";
    roomList.innerHTML =
      '<p class="text-center">Đang tải danh sách phòng trọ...</p>';

    // Gọi API tìm kiếm phòng trọ
    const result = await roomSearchService.searchRooms(filters);

    if (result.success) {
      // Ẩn chỉ báo đang tải
      if (loadingIndicator) loadingIndicator.style.display = "none";

      // Kiểm tra có kết quả không
      if (result.data && result.data.length > 0) {
        // Hiển thị danh sách phòng
        displayRooms(result.data, roomList);

        // Cập nhật thông tin phân trang
        updatePagination(result.pagination);
      } else {
        // Hiển thị thông báo không có kết quả
        roomList.innerHTML = `
          <div class="no-results">
            <img src="/assets/image/no-results.svg" alt="Không có kết quả" class="no-results-img">
            <h3>Không tìm thấy phòng trọ phù hợp</h3>
            <p>Vui lòng thử lại với các tiêu chí tìm kiếm khác</p>
            <a href="/pages/phong/phong.html" class="btn-reset-filter">Xóa bộ lọc</a>
          </div>
        `;
      }
    } else {
      // Ẩn chỉ báo đang tải
      if (loadingIndicator) loadingIndicator.style.display = "none";

      // Hiển thị thông báo lỗi
      roomList.innerHTML = `
        <div class="error-message">
          <i class="fas fa-exclamation-triangle"></i>
          <h3>Đã xảy ra lỗi</h3>
          <p>Không thể tải danh sách phòng trọ. Vui lòng thử lại sau.</p>
          <button onclick="location.reload()" class="btn-try-again">Thử lại</button>
        </div>
      `;
      console.error("Lỗi khi tải danh sách phòng:", result.error);
    }
  } catch (error) {
    // Ẩn chỉ báo đang tải
    if (loadingIndicator) loadingIndicator.style.display = "none";

    // Hiển thị thông báo lỗi
    roomList.innerHTML = `
      <div class="error-message">
        <i class="fas fa-exclamation-triangle"></i>
        <h3>Đã xảy ra lỗi</h3>
        <p>Không thể tải danh sách phòng trọ. Vui lòng thử lại sau.</p>
        <button onclick="location.reload()" class="btn-try-again">Thử lại</button>
      </div>
    `;
    console.error("Lỗi khi tải danh sách phòng:", error);
  }
}

// Hiển thị danh sách phòng trọ
function displayRooms(rooms, container) {
  // Xóa nội dung cũ
  container.innerHTML = "";

  // Tạo HTML cho mỗi phòng trọ
  rooms.forEach((room) => {
    const roomCard = document.createElement("div");
    roomCard.className = "room-card";
    roomCard.innerHTML = `
      <div class="room-thumb">
        <a href="/pages/phong/danhsach/motaphong.html?id=${room.id}">
          <img src="${
            room.giaoDien ||
            "/assets/image/danhsachphong/nhatro1/nha-tro-anh-dien.jpg"
          }" 
                alt="${room.tieuDe}" loading="lazy">
        </a>
        <div class="room-status ${
          room.trangThai === "còn phòng" ? "available" : "unavailable"
        }">
          ${room.trangThai === "còn phòng" ? "Còn phòng" : "Hết phòng"}
        </div>
        <button class="btn-save-room" data-room-id="${
          room.id
        }" aria-label="Lưu phòng trọ">
          <i class="far fa-heart"></i>
        </button>
      </div>
      <div class="room-info">
        <h3 class="room-title">
          <a href="/pages/phong/danhsach/motaphong.html?id=${room.id}">${
      room.tieuDe
    }</a>
        </h3>
        <div class="room-address">
          <i class="fas fa-map-marker-alt"></i> ${room.diaChi}
        </div>
        <div class="room-meta">
          <div class="price">
            <i class="fas fa-money-bill-wave"></i> ${formatCurrency(
              room.giaThue
            )} đ/tháng
          </div>
          <div class="area">
            <i class="fas fa-expand"></i> ${room.dienTich} m²
          </div>
        </div>
        <div class="room-amenities">
          ${generateAmenitiesHTML(room.tienIch)}
        </div>
        <div class="room-contact">
          <a href="/pages/phong/danhsach/motaphong.html?id=${
            room.id
          }" class="btn-view-detail">
            Xem chi tiết
          </a>
        </div>
      </div>
    `;

    // Thêm sự kiện cho nút lưu phòng
    const saveButton = roomCard.querySelector(".btn-save-room");
    saveButton.addEventListener("click", function () {
      toggleSaveRoom(this, room.id);
    });

    // Thêm thẻ vào container
    container.appendChild(roomCard);
  });

  // Kiểm tra phòng đã lưu để cập nhật UI
  checkSavedRooms();
}

// Tạo HTML cho danh sách tiện ích
function generateAmenitiesHTML(amenities) {
  if (!amenities || !Array.isArray(amenities) || amenities.length === 0) {
    return "";
  }

  // Chỉ hiển thị tối đa 3 tiện ích
  const displayAmenities = amenities.slice(0, 3);

  // Map tên tiện ích sang tên icon
  const amenityIcons = {
    wifi: "fa-wifi",
    "dieu-hoa": "fa-snowflake",
    "may-giat": "fa-tshirt",
    "tu-lanh": "fa-temperature-low",
    "nha-ve-sinh": "fa-toilet",
    "ban-cong": "fa-chess-rook",
    "gac-lung": "fa-home",
    "bai-gui-xe": "fa-parking",
    "tu-do": "fa-door-closed",
    camera: "fa-video",
    bep: "fa-utensils",
  };

  // Tạo HTML cho các tiện ích
  let html = "";
  displayAmenities.forEach((amenity) => {
    const iconClass = amenityIcons[amenity] || "fa-check";
    html += `<span><i class="fas ${iconClass}"></i> ${formatAmenityName(
      amenity
    )}</span>`;
  });

  // Thêm thông tin nếu còn tiện ích khác
  if (amenities.length > 3) {
    html += `<span>+${amenities.length - 3} tiện ích khác</span>`;
  }

  return html;
}

// Định dạng tên tiện ích
function formatAmenityName(amenity) {
  const amenityNames = {
    wifi: "Wi-Fi",
    "dieu-hoa": "Điều hòa",
    "may-giat": "Máy giặt",
    "tu-lanh": "Tủ lạnh",
    "nha-ve-sinh": "WC riêng",
    "ban-cong": "Ban công",
    "gac-lung": "Gác lửng",
    "bai-gui-xe": "Bãi xe",
    "tu-do": "Tự do",
    camera: "Camera",
    bep: "Bếp",
  };

  return amenityNames[amenity] || amenity;
}

// Định dạng tiền tệ
function formatCurrency(amount) {
  return new Intl.NumberFormat("vi-VN").format(amount);
}

// Khởi tạo các bộ lọc
function initFilters() {
  // Form tìm kiếm
  const searchForm = document.getElementById("searchForm");
  if (searchForm) {
    searchForm.addEventListener("submit", handleSearchSubmit);
  }

  // Các bộ lọc khác
  const filterControls = document.querySelectorAll(
    '.filter-control select, .filter-control input[type="radio"]'
  );
  filterControls.forEach((control) => {
    control.addEventListener("change", handleFilterChange);
  });

  // Bộ lọc checkbox (tiện ích)
  const checkboxFilters = document.querySelectorAll(
    '.filter-control input[type="checkbox"]'
  );
  checkboxFilters.forEach((checkbox) => {
    checkbox.addEventListener("change", handleCheckboxFilterChange);
  });

  // Bộ lọc sắp xếp
  const sortSelect = document.querySelector(".sort-options select");
  if (sortSelect) {
    sortSelect.addEventListener("change", handleSortChange);
  }
}

// Xử lý sự kiện tìm kiếm
function handleSearchSubmit(event) {
  event.preventDefault();

  // Lấy giá trị từ form tìm kiếm
  const keyword = document.getElementById("searchKeyword").value.trim();

  // Lấy các bộ lọc hiện tại
  const roomList = document.getElementById("roomList");
  const currentFilters = getFiltersFromDataset(roomList);

  // Cập nhật bộ lọc với từ khóa mới
  currentFilters.keyword = keyword || undefined;
  currentFilters.page = 1; // Reset về trang đầu tiên khi tìm kiếm

  // Chuyển hướng với các tham số mới
  navigateWithFilters(currentFilters);
}

// Xử lý sự kiện thay đổi bộ lọc
function handleFilterChange(event) {
  // Lấy giá trị và tên bộ lọc
  const filter = event.target;
  const filterName = filter.dataset.filter;
  const filterValue = filter.value;

  // Lấy các bộ lọc hiện tại
  const roomList = document.getElementById("roomList");
  const currentFilters = getFiltersFromDataset(roomList);

  // Cập nhật bộ lọc
  if (filterName === "price") {
    // Xử lý bộ lọc giá
    const priceRange = filterValue.split("-");
    if (priceRange.length === 2) {
      currentFilters.giaTu = parseFloat(priceRange[0]);
      currentFilters.giaDen = parseFloat(priceRange[1]);
    } else if (filterValue === "0-1") {
      currentFilters.giaTu = 0;
      currentFilters.giaDen = 1;
    } else if (filterValue === "3+") {
      currentFilters.giaTu = 3;
      delete currentFilters.giaDen;
    } else {
      delete currentFilters.giaTu;
      delete currentFilters.giaDen;
    }
  } else if (filterName === "area") {
    // Xử lý bộ lọc diện tích
    const areaRange = filterValue.split("-");
    if (areaRange.length === 2) {
      currentFilters.dienTichTu = parseFloat(areaRange[0]);
      currentFilters.dienTichDen = parseFloat(areaRange[1]);
    } else if (filterValue === "0-20") {
      currentFilters.dienTichTu = 0;
      currentFilters.dienTichDen = 20;
    } else if (filterValue === "40+") {
      currentFilters.dienTichTu = 40;
      delete currentFilters.dienTichDen;
    } else {
      delete currentFilters.dienTichTu;
      delete currentFilters.dienTichDen;
    }
  } else {
    // Xử lý các bộ lọc khác
    currentFilters[filterName] = filterValue || undefined;
  }

  // Reset về trang đầu tiên khi thay đổi bộ lọc
  currentFilters.page = 1;

  // Chuyển hướng với các tham số mới
  navigateWithFilters(currentFilters);
}

// Xử lý sự kiện thay đổi bộ lọc checkbox
function handleCheckboxFilterChange() {
  // Lấy tất cả checkbox tiện ích được chọn
  const checkedAmenities = Array.from(
    document.querySelectorAll(
      '.filter-amenities input[type="checkbox"]:checked'
    )
  ).map((checkbox) => checkbox.value);

  // Lấy các bộ lọc hiện tại
  const roomList = document.getElementById("roomList");
  const currentFilters = getFiltersFromDataset(roomList);

  // Cập nhật bộ lọc tiện ích
  currentFilters.tienIch =
    checkedAmenities.length > 0 ? checkedAmenities : undefined;

  // Reset về trang đầu tiên khi thay đổi bộ lọc
  currentFilters.page = 1;

  // Chuyển hướng với các tham số mới
  navigateWithFilters(currentFilters);
}

// Xử lý sự kiện thay đổi sắp xếp
function handleSortChange(event) {
  // Lấy giá trị sắp xếp
  const sortValue = event.target.value;

  // Lấy các bộ lọc hiện tại
  const roomList = document.getElementById("roomList");
  const currentFilters = getFiltersFromDataset(roomList);

  // Cập nhật bộ lọc sắp xếp
  currentFilters.sort = sortValue || undefined;

  // Chuyển hướng với các tham số mới
  navigateWithFilters(currentFilters);
}

// Lấy các bộ lọc từ data-attributes
function getFiltersFromDataset(element) {
  if (!element || !element.dataset) return {};

  return {
    keyword: element.dataset.keyword,
    khuVuc: element.dataset.khuVuc,
    giaTu: parseFloat(element.dataset.giaTu) || undefined,
    giaDen: parseFloat(element.dataset.giaDen) || undefined,
    dienTichTu: parseFloat(element.dataset.dienTichTu) || undefined,
    dienTichDen: parseFloat(element.dataset.dienTichDen) || undefined,
    tienIch: element.dataset.tienIch
      ? element.dataset.tienIch.split(",")
      : undefined,
    doiTuong: element.dataset.doiTuong,
    giaoDich: element.dataset.giaoDich,
    sort: element.dataset.sort || "newest",
    page: parseInt(element.dataset.page) || 1,
    limit: parseInt(element.dataset.limit) || 12,
  };
}

// Chuyển hướng với bộ lọc mới
function navigateWithFilters(filters) {
  // Xóa các giá trị undefined hoặc null
  Object.keys(filters).forEach((key) => {
    if (
      filters[key] === undefined ||
      filters[key] === null ||
      filters[key] === ""
    ) {
      delete filters[key];
    }
  });

  // Tạo URL params
  const params = new URLSearchParams();
  Object.keys(filters).forEach((key) => {
    if (key === "tienIch" && Array.isArray(filters[key])) {
      filters[key].forEach((value) => {
        params.append(key, value);
      });
    } else {
      params.append(key, filters[key]);
    }
  });

  // Chuyển hướng đến URL mới
  window.location.href = `/pages/phong/phong.html?${params.toString()}`;
}

// Khởi tạo phân trang
function initPagination() {
  // Lấy các nút phân trang
  const prevPageBtn = document.querySelector(".pagination-prev");
  const nextPageBtn = document.querySelector(".pagination-next");
  const pageNumbers = document.querySelector(".pagination-numbers");

  // Thêm sự kiện cho nút Trang trước
  if (prevPageBtn) {
    prevPageBtn.addEventListener("click", function () {
      const roomList = document.getElementById("roomList");
      const currentFilters = getFiltersFromDataset(roomList);
      const currentPage = parseInt(currentFilters.page) || 1;

      if (currentPage > 1) {
        currentFilters.page = currentPage - 1;
        navigateWithFilters(currentFilters);
      }
    });
  }

  // Thêm sự kiện cho nút Trang sau
  if (nextPageBtn) {
    nextPageBtn.addEventListener("click", function () {
      const roomList = document.getElementById("roomList");
      const currentFilters = getFiltersFromDataset(roomList);
      const currentPage = parseInt(currentFilters.page) || 1;
      const totalPages = parseInt(roomList.dataset.totalPages) || 1;

      if (currentPage < totalPages) {
        currentFilters.page = currentPage + 1;
        navigateWithFilters(currentFilters);
      }
    });
  }
}

// Cập nhật phân trang
function updatePagination(pagination) {
  if (!pagination) return;

  const { total, page, limit, totalPages } = pagination;
  const roomList = document.getElementById("roomList");

  // Cập nhật thông tin phân trang vào dataset
  if (roomList) {
    roomList.dataset.page = page;
    roomList.dataset.totalPages = totalPages;
    roomList.dataset.total = total;
  }

  // Cập nhật hiển thị phân trang
  const paginationNumbers = document.querySelector(".pagination-numbers");
  if (paginationNumbers) {
    paginationNumbers.innerHTML = `Trang ${page}/${totalPages}`;
  }

  // Cập nhật trạng thái nút Trang trước/Trang sau
  const prevPageBtn = document.querySelector(".pagination-prev");
  const nextPageBtn = document.querySelector(".pagination-next");

  if (prevPageBtn) {
    prevPageBtn.classList.toggle("disabled", page <= 1);
  }

  if (nextPageBtn) {
    nextPageBtn.classList.toggle("disabled", page >= totalPages);
  }

  // Cập nhật thông tin số kết quả
  const resultCount = document.querySelector(".result-count");
  if (resultCount) {
    const firstItem = (page - 1) * limit + 1;
    const lastItem = Math.min(page * limit, total);
    resultCount.textContent = `Hiển thị ${firstItem}-${lastItem} của ${total} kết quả`;
  }
}

// Kiểm tra phòng đã được lưu
async function checkSavedRooms() {
  // Kiểm tra người dùng đã đăng nhập chưa
  const user = firebase.auth().currentUser;
  if (!user) return;

  // Lấy danh sách phòng đã lưu của người dùng
  try {
    const savedRoomsResult = await roomSearchService.getSavedRooms(user.uid);
    if (!savedRoomsResult.success || !savedRoomsResult.data) return;

    // Tạo set các ID phòng đã lưu để dễ tìm kiếm
    const savedRoomIds = new Set(savedRoomsResult.data.map((room) => room.id));

    // Duyệt qua tất cả các nút lưu phòng
    const saveButtons = document.querySelectorAll(".btn-save-room");
    saveButtons.forEach((button) => {
      const roomId = button.getAttribute("data-room-id");
      if (savedRoomIds.has(roomId)) {
        // Đánh dấu nút đã được lưu
        button.classList.add("saved");
        button.querySelector("i").classList.remove("far");
        button.querySelector("i").classList.add("fas");
      }
    });
  } catch (error) {
    console.error("Lỗi khi kiểm tra phòng đã lưu:", error);
  }
}

// Xử lý lưu/bỏ lưu phòng
async function toggleSaveRoom(button, roomId) {
  // Kiểm tra người dùng đã đăng nhập chưa
  const user = firebase.auth().currentUser;
  if (!user) {
    // Chưa đăng nhập, chuyển hướng đến trang đăng nhập
    window.location.href = `/pages/auth/dangnhap.html?redirect=${encodeURIComponent(
      window.location.href
    )}`;
    return;
  }

  try {
    // Kiểm tra phòng đã được lưu chưa
    const isSaved = button.classList.contains("saved");
    let result;

    if (isSaved) {
      // Bỏ lưu phòng
      result = await roomSearchService.unsaveRoom(user.uid, roomId);
      if (result.success) {
        button.classList.remove("saved");
        button.querySelector("i").classList.remove("fas");
        button.querySelector("i").classList.add("far");
      }
    } else {
      // Lưu phòng
      result = await roomSearchService.saveRoom(user.uid, roomId);
      if (result.success) {
        button.classList.add("saved");
        button.querySelector("i").classList.remove("far");
        button.querySelector("i").classList.add("fas");
      }
    }
  } catch (error) {
    console.error("Lỗi khi lưu/bỏ lưu phòng:", error);
  }
}

// Export các hàm cần thiết
export { loadRoomList, navigateWithFilters, getFiltersFromUrl };
