// Firebase initialization (Compat version)
const firebaseConfig = {
  apiKey: "AIzaSyCe63NDqYR2A-hUOu22S5Kr1g6vclkIcGw",
  authDomain: "nhatroketnoi-9390a.firebaseapp.com",
  databaseURL: "https://nhatroketnoi-9390a-default-rtdb.firebaseio.com",
  projectId: "nhatroketnoi-9390a",
  storageBucket: "nhatroketnoi-9390a",
  messagingSenderId: "249753111607",
  appId: "1:249753111607:web:3f6d0ddaa27e34fc6683b2",
  measurementId: "G-219LR643DB",
};

// Tối ưu JS để cải thiện hiệu suất tải trang
document.addEventListener("DOMContentLoaded", function () {
  // Kiểm tra hỗ trợ WebP
  checkWebpSupport();

  // Kiểm tra xem Firebase đã được khởi tạo chưa
  if (!window.firebase) {
    console.error(
      "Firebase chưa được tải! Hãy đảm bảo các script Firebase đã được thêm vào trang."
    );
    return;
  }

  // Khởi tạo Firebase nếu chưa được khởi tạo
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }

  // Khởi tạo các dịch vụ
  const auth = firebase.auth();
  const database = firebase.database();
  const storage = firebase.storage();

  // Kiểm tra trạng thái đăng nhập
  auth.onAuthStateChanged((user) => {
    if (user) {
      // Người dùng đã đăng nhập
      console.log("Người dùng đã đăng nhập:", user.displayName);
      initializeUserInterface(true, user);
    } else {
      // Người dùng chưa đăng nhập
      console.log("Chưa đăng nhập");
      initializeUserInterface(false);
    }
  });

  // Phần xử lý Menu Navigation
  const burger = document.querySelector(".burger");
  const nav = document.querySelector(".nav-links");
  const navLinks = document.querySelectorAll(".nav-links li");

  burger.addEventListener("click", () => {
    // Toggle Nav
    nav.classList.toggle("nav-active");

    // Animate Links
    navLinks.forEach((link, index) => {
      if (link.style.animation) {
        link.style.animation = "";
      } else {
        link.style.animation = `navLinkFade 0.5s ease forwards ${
          index / 7 + 0.3
        }s`;
      }
    });

    // Burger Animation
    burger.classList.toggle("toggle");
  });

  // Hiển thị nút scroll to top khi cuộn xuống
  const scrollTopBtn = document.createElement("button");
  scrollTopBtn.classList.add("scroll-top-btn");
  scrollTopBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
  document.body.appendChild(scrollTopBtn);

  window.addEventListener("scroll", function () {
    if (window.pageYOffset > 300) {
      scrollTopBtn.classList.add("visible");
    } else {
      scrollTopBtn.classList.remove("visible");
    }
  });

  scrollTopBtn.addEventListener("click", function () {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  });

  // Xử lý chatbot toggle
  const chatbotToggle = document.querySelector(".chatbot-toggle");
  const chatbotContainer = document.querySelector(".chatbot-container");
  const closeChatbot = document.querySelector(".close-chatbot");

  if (chatbotToggle && chatbotContainer && closeChatbot) {
    chatbotToggle.addEventListener("click", function () {
      chatbotContainer.classList.add("active");
    });

    closeChatbot.addEventListener("click", function () {
      chatbotContainer.classList.remove("active");
    });
  }

  // Lazy load cho hình ảnh
  if ("loading" in HTMLImageElement.prototype) {
    // Trình duyệt hỗ trợ loading="lazy" tự động
    const lazyImages = document.querySelectorAll("img[data-src]");
    lazyImages.forEach((img) => {
      img.src = img.dataset.src;
    });
  } else {
    // Thêm lazy loading thủ công cho các trình duyệt cũ
    // Sử dụng Intersection Observer API
    const lazyImageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const lazyImage = entry.target;
          lazyImage.src = lazyImage.dataset.src;
          observer.unobserve(lazyImage);
        }
      });
    });

    const lazyImages = document.querySelectorAll("img[data-src]");
    lazyImages.forEach((img) => {
      lazyImageObserver.observe(img);
    });
  }

  // Các hàm khởi tạo khác ở đây...
  initializeUIComponents();

  // Xử lý tìm kiếm
  initSearchFunction();

  // Xử lý chức năng tìm kiếm phòng trọ
  const searchForm = document.querySelector('.search-box');
  if (searchForm) {
    searchForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      // Lấy giá trị tìm kiếm
      const keywordInput = searchForm.querySelector('input[type="text"]');
      const priceSelect = searchForm.querySelector('select:nth-of-type(1)');
      const areaSelect = searchForm.querySelector('select:nth-of-type(2)');
      
      // Tạo URL tìm kiếm với các tham số
      let searchUrl = './pages/phong/phong.html?';
      
      // Thêm từ khóa tìm kiếm
      if (keywordInput && keywordInput.value.trim()) {
        searchUrl += 'keyword=' + encodeURIComponent(keywordInput.value.trim()) + '&';
        
        // Lưu tìm kiếm gần đây nếu người dùng đã đăng nhập
        const user = firebase.auth().currentUser;
        if (user && window.roomSearchService) {
          window.roomSearchService.saveRecentSearch(user.uid, keywordInput.value.trim())
            .catch(error => console.error('Lỗi khi lưu tìm kiếm gần đây:', error));
        }
      }
      
      // Thêm khoảng giá
      if (priceSelect && priceSelect.value) {
        const priceRange = priceSelect.value.split('-');
        if (priceRange.length === 2) {
          searchUrl += `giaTu=${priceRange[0]}&giaDen=${priceRange[1]}&`;
        } else if (priceRange[0] === '0') {
          searchUrl += `giaDen=1&`;
        } else if (priceRange[0] === '3+') {
          searchUrl += `giaTu=3&`;
        }
      }
      
      // Thêm khoảng diện tích
      if (areaSelect && areaSelect.value) {
        const areaRange = areaSelect.value.split('-');
        if (areaRange.length === 2) {
          searchUrl += `dienTichTu=${areaRange[0]}&dienTichDen=${areaRange[1]}&`;
        } else if (areaRange[0] === '0') {
          searchUrl += `dienTichDen=20&`;
        } else if (areaRange[0] === '40+') {
          searchUrl += `dienTichTu=40&`;
        }
      }
      
      // Xóa dấu & ở cuối URL nếu có
      if (searchUrl.endsWith('&')) {
        searchUrl = searchUrl.slice(0, -1);
      }
      
      // Chuyển hướng đến trang kết quả tìm kiếm
      window.location.href = searchUrl;
    });
    
    // Biến form thành form submit khi nhấn nút tìm kiếm
    const searchButton = searchForm.querySelector('.search-button');
    if (searchButton) {
      searchButton.addEventListener('click', function() {
        searchForm.dispatchEvent(new Event('submit'));
      });
    }
  }
});

// Kiểm tra xem trình duyệt có hỗ trợ WebP không và lưu kết quả vào localStorage
function checkWebpSupport() {
  // Kiểm tra xem đã lưu kết quả trong localStorage chưa
  if (localStorage.getItem('webpSupport') === null) {
    const webP = new Image();
    webP.onload = function() {
      const isSupported = (webP.width > 0) && (webP.height > 0);
      localStorage.setItem('webpSupport', isSupported ? 'true' : 'false');
      console.log('WebP support:', isSupported);
      updateImageSources();
    };
    webP.onerror = function() {
      localStorage.setItem('webpSupport', 'false');
      console.log('WebP support: false');
    };
    webP.src = 'data:image/webp;base64,UklGRhoAAABXRUJQVlA4TA0AAAAvAAAAEAcQERGIiP4HAA==';
  } else {
    if (localStorage.getItem('webpSupport') === 'true') {
      updateImageSources();
    }
  }
}

// Cập nhật tất cả các src hình ảnh sang WebP nếu có thể
function updateImageSources() {
  const images = document.querySelectorAll('img:not([data-no-webp])');
  images.forEach(img => {
    const currentSrc = img.getAttribute('src');
    // Nếu là jpg, jpeg, hoặc png thì thay thành webp
    if (currentSrc && /\.(jpe?g|png)$/i.test(currentSrc)) {
      const webpSrc = currentSrc.replace(/\.(jpe?g|png)$/i, '.webp');
      // Thử tải WebP và fallback nếu không tồn tại
      const testImg = new Image();
      testImg.onload = function() {
        img.src = webpSrc;
      };
      testImg.onerror = function() {
        // Giữ nguyên src hiện tại nếu không tìm thấy file WebP
        console.log('WebP not found:', webpSrc);
      };
      testImg.src = webpSrc;
    }
  });
}

// Utility function để tự động chuyển đổi đường dẫn hình ảnh sang WebP khi cần
window.getOptimizedImagePath = function(imagePath) {
  if (localStorage.getItem('webpSupport') === 'true' && /\.(jpe?g|png)$/i.test(imagePath)) {
    return imagePath.replace(/\.(jpe?g|png)$/i, '.webp');
  }
  return imagePath;
};

// Khởi tạo giao diện người dùng dựa trên trạng thái đăng nhập
function initializeUserInterface(isLoggedIn, user = null) {
  const loginBtn = document.getElementById("loginBtn");
  const btnDangTin = document.getElementById("btnDangTin");
  const userProfile = document.querySelector(".user-profile");

  if (isLoggedIn) {
    // Lưu trạng thái đăng nhập vào localStorage để dự phòng
    localStorage.setItem("isLoggedIn", "true");

    // Hiển thị nút "Đăng Tin" và thông tin người dùng
    if (loginBtn) loginBtn.style.display = "none";
    if (btnDangTin) btnDangTin.style.display = "block";
    if (userProfile) userProfile.style.display = "flex";

    // Cập nhật thông tin người dùng
    if (user) {
      const userShortNameElement = document.getElementById("userShortName");
      const userFullnameElement = document.getElementById("userFullname");
      const userEmailElement = document.getElementById("userEmail");

      const fullName = user.displayName || "Người dùng";
      const shortName = getShortName(fullName);

      if (userShortNameElement) userShortNameElement.textContent = shortName;
      if (userFullnameElement) userFullnameElement.textContent = fullName;
      if (userEmailElement) userEmailElement.textContent = user.email || "";

      // Xử lý dropdown khi click
      initializeUserDropdown();
    }
  } else {
    // Xóa trạng thái đăng nhập từ localStorage
    localStorage.removeItem("isLoggedIn");

    // Ẩn nút "Đăng Tin" và thông tin người dùng
    if (loginBtn) loginBtn.style.display = "block";
    if (btnDangTin) btnDangTin.style.display = "none";
    if (userProfile) userProfile.style.display = "none";
  }
}

// Xử lý dropdown menu người dùng
function initializeUserDropdown() {
  const userProfile = document.querySelector(".user-profile");
  const userAvatar = document.querySelector(".user-avatar");

  if (userAvatar && userProfile) {
    console.log("Setting up user dropdown handlers");

    // Đảm bảo xóa tất cả các event listener cũ
    const oldClone = userAvatar.cloneNode(true);
    userAvatar.parentNode.replaceChild(oldClone, userAvatar);

    // Lấy tham chiếu mới sau khi clone
    const newUserAvatar = document.querySelector(".user-avatar");

    // Thêm event listener với debug để theo dõi
    newUserAvatar.addEventListener("click", function (event) {
      event.preventDefault();
      event.stopPropagation();

      userProfile.classList.toggle("active");

      // Hiển thị log để debug
      const isActive = userProfile.classList.contains("active");
      console.log("Menu toggle:", isActive ? "open" : "closed");
      console.log("User profile classes:", userProfile.className);

      // Kiểm tra và điều chỉnh display nếu cần thiết
      const dropdownMenu = userProfile.querySelector(".dropdown-menu");
      if (dropdownMenu) {
        dropdownMenu.style.display = isActive ? "block" : "none";
        console.log(
          "Dropdown menu display set to:",
          dropdownMenu.style.display
        );
      }
    });

    // Đóng dropdown khi click bên ngoài
    document.addEventListener("click", function (event) {
      if (userProfile && !userProfile.contains(event.target)) {
        userProfile.classList.remove("active");
        const dropdownMenu = userProfile.querySelector(".dropdown-menu");
        if (dropdownMenu) {
          dropdownMenu.style.display = "none";
        }
      }
    });

    // Thêm debug để xác nhận việc khởi tạo
    console.log("User dropdown initialized with elements:", {
      avatar: newUserAvatar,
      profile: userProfile,
      dropdown: userProfile.querySelector(".dropdown-menu"),
    });
  } else {
    console.warn("User dropdown elements not found:", {
      avatar: !!userAvatar,
      profile: !!userProfile,
    });
  }
}

// Khởi tạo các thành phần UI khác
function initializeUIComponents() {
  // Điều hướng trang với hamburger menu
  const burger = document.querySelector(".burger");
  const nav = document.querySelector(".nav-links");
  const navLinks = document.querySelectorAll(".nav-links li");

  if (burger) {
    burger.addEventListener("click", () => {
      // Chuyển đổi điều hướng
      nav.classList.toggle("nav-active");

      // Hiệu ứng chuyển động cho các mục menu
      navLinks.forEach((link, index) => {
        if (link.style.animation) {
          link.style.animation = "";
        } else {
          link.style.animation = `navLinkFade 0.5s ease forwards ${
            index / 7 + 0.3
          }s`;
        }
      });

      // Hiệu ứng chuyển động cho burger
      burger.classList.toggle("toggle");
    });
  }

  // Nút cuộn lên trên
  const scrollTopBtn = document.getElementById("scrollTopBtn");
  if (scrollTopBtn) {
    window.addEventListener("scroll", () => {
      if (window.pageYOffset > 300) {
        scrollTopBtn.classList.add("visible");
      } else {
        scrollTopBtn.classList.remove("visible");
      }
    });

    scrollTopBtn.addEventListener("click", () => {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    });
  }

  // Hiệu ứng hover cho card phòng trọ
  const roomCards = document.querySelectorAll(".room-card");
  roomCards.forEach((card) => {
    card.addEventListener("mouseenter", () => {
      card.style.transform = "translateY(-10px)";
    });
    card.addEventListener("mouseleave", () => {
      card.style.transform = "translateY(0)");
    });
  });

  // Khởi tạo chức năng tìm kiếm
  initializeSearchFunctionality();
}

// Xử lý chức năng tìm kiếm
function initSearchFunction() {
  const searchForm = document.querySelector('.search-box');
  const searchInput = document.querySelector('.search-input input');
  const priceSelect = document.querySelector('.search-filters select:first-child');
  const areaSelect = document.querySelector('.search-filters select:last-child');
  const searchButton = document.querySelector('.search-button');

  if (searchButton) {
    searchButton.addEventListener('click', function() {
      performSearch();
    });

    // Cho phép nhấn Enter để tìm kiếm
    if (searchInput) {
      searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
          e.preventDefault();
          performSearch();
        }
      });
    }
  }

  // Hàm thực hiện tìm kiếm
  function performSearch() {
    const location = searchInput ? searchInput.value.trim() : '';
    const price = priceSelect ? priceSelect.value : '';
    const area = areaSelect ? areaSelect.value : '';
    
    // Xây dựng URL tìm kiếm
    let searchUrl = '/pages/phong/phong.html?';
    const params = [];
    
    if (location) {
      params.push('location=' + encodeURIComponent(location));
    }
    
    if (price) {
      params.push('price=' + encodeURIComponent(price));
    }
    
    if (area) {
      params.push('area=' + encodeURIComponent(area));
    }
    
    searchUrl += params.join('&');
    
    // Chuyển hướng đến trang kết quả tìm kiếm
    window.location.href = searchUrl;
  }

  // Kiểm tra nếu có tham số tìm kiếm trong URL hiện tại
  if (window.location.href.includes('/pages/phong/phong.html')) {
    const urlParams = new URLSearchParams(window.location.search);
    
    // Điền lại các tham số tìm kiếm nếu có
    const searchInputs = {
      location: urlParams.get('location'),
      price: urlParams.get('price'),
      area: urlParams.get('area')
    };
    
    // Điền các giá trị từ URL vào form tìm kiếm (nếu có)
    if (searchInput && searchInputs.location) {
      searchInput.value = searchInputs.location;
    }
    
    if (priceSelect && searchInputs.price) {
      priceSelect.value = searchInputs.price;
    }
    
    if (areaSelect && searchInputs.area) {
      areaSelect.value = searchInputs.area;
    }
  }
}

// Hàm lấy tên ngắn gọn từ họ tên đầy đủ
function getShortName(fullName) {
  if (!fullName) return "";

  // Tách tên thành các phần
  const nameParts = fullName.trim().split(" ");

  // Nếu chỉ có một từ, trả về từ đó
  if (nameParts.length === 1) {
    return nameParts[0];
  }

  // Lấy tên (phần cuối cùng)
  return nameParts[nameParts.length - 1];
}

// Hàm đăng xuất
window.logout = function () {
  if (firebase.auth) {
    firebase
      .auth()
      .signOut()
      .then(() => {
        localStorage.removeItem("isLoggedIn");
        window.location.href = window.location.origin + "/index.html";
      })
      .catch((error) => {
        console.error("Lỗi đăng xuất:", error);
        alert("Có lỗi xảy ra khi đăng xuất. Vui lòng thử lại!");
      });
  } else {
    localStorage.removeItem("isLoggedIn");
    window.location.href = window.location.origin + "/index.html";
  }
};

// Firebase Authentication Functions
window.firebaseSignUp = async (email, password, userData, userProfile) => {
  try {
    if (!firebase.auth) {
      throw new Error("Firebase Auth chưa được khởi tạo");
    }

    // Tạo tài khoản mới
    const userCredential = await firebase
      .auth()
      .createUserWithEmailAndPassword(email, password);
    const user = userCredential.user;

    // Cập nhật thông tin hiển thị
    await user.updateProfile({
      displayName: userData.displayName,
      photoURL: userData.photoURL || null,
    });

    // Lưu thông tin chi tiết vào Realtime Database
    await firebase
      .database()
      .ref(`users/${user.uid}`)
      .set({
        ...userProfile,
        uid: user.uid,
        lastLogin: Date.now(),
      });

    return {
      success: true,
      user: user,
    };
  } catch (error) {
    console.error("Lỗi đăng ký:", error);
    return {
      success: false,
      error: error.code,
      message: error.message,
    };
  }
};

window.firebaseSignIn = async (email, password) => {
  try {
    if (!firebase.auth) {
      throw new Error("Firebase Auth chưa được khởi tạo");
    }

    const userCredential = await firebase
      .auth()
      .signInWithEmailAndPassword(email, password);
    const user = userCredential.user;

    // Cập nhật thời gian đăng nhập cuối
    await firebase.database().ref(`users/${user.uid}`).update({
      lastLogin: Date.now(),
    });

    return {
      success: true,
      user: user,
    };
  } catch (error) {
    console.error("Lỗi đăng nhập:", error);
    return {
      success: false,
      error: error.code,
      message: error.message,
    };
  }
};

window.firebaseForgotPassword = async (email) => {
  try {
    if (!firebase.auth) {
      throw new Error("Firebase Auth chưa được khởi tạo");
    }

    await firebase.auth().sendPasswordResetEmail(email);
    return {
      success: true,
    };
  } catch (error) {
    console.error("Lỗi gửi email đặt lại mật khẩu:", error);
    return {
      success: false,
      error: error.code,
      message: error.message,
    };
  }
};

// Các hàm thao tác với Firebase Realtime Database
window.firebaseDB = {
  // Thêm dữ liệu mới với ID tự sinh
  addData: (collection, data) => {
    try {
      const collectionRef = firebase.database().ref(collection);
      const newRef = collectionRef.push();
      newRef.set({
        ...data,
        createdAt: Date.now(),
        id: newRef.key,
      });
      return { success: true, id: newRef.key };
    } catch (error) {
      console.error("Lỗi thêm dữ liệu:", error);
      return { success: false, error };
    }
  },

  // Thêm hoặc cập nhật dữ liệu với ID cụ thể
  setData: (path, data) => {
    try {
      const dataRef = firebase.database().ref(path);
      dataRef.set({
        ...data,
        updatedAt: Date.now(),
      });
      return { success: true };
    } catch (error) {
      console.error("Lỗi đặt dữ liệu:", error);
      return { success: false, error };
    }
  },

  // Cập nhật một phần dữ liệu
  updateData: (path, data) => {
    try {
      const dataRef = firebase.database().ref(path);
      dataRef.update({
        ...data,
        updatedAt: Date.now(),
      });
      return { success: true };
    } catch (error) {
      console.error("Lỗi cập nhật dữ liệu:", error);
      return { success: false, error };
    }
  },

  // Xóa dữ liệu
  deleteData: (path) => {
    try {
      const dataRef = firebase.database().ref(path);
      dataRef.remove();
      return { success: true };
    } catch (error) {
      console.error("Lỗi xóa dữ liệu:", error);
      return { success: false, error };
    }
  },

  // Đọc dữ liệu một lần
  getData: async (path) => {
    try {
      const dataRef = firebase.database().ref(path);
      const snapshot = await dataRef.once("value");
      if (snapshot.exists()) {
        return { success: true, data: snapshot.val() };
      } else {
        return { success: false, data: null };
      }
    } catch (error) {
      console.error("Lỗi đọc dữ liệu:", error);
      return { success: false, error };
    }
  },

  // Lắng nghe thay đổi dữ liệu theo đường dẫn
  listenToData: (path, callback) => {
    const dataRef = firebase.database().ref(path);
    dataRef.on(
      "value",
      (snapshot) => {
        if (snapshot.exists()) {
          callback({ success: true, data: snapshot.val() });
        } else {
          callback({ success: false, data: null });
        }
      },
      (error) => {
        callback({ success: false, error });
      }
    );

    // Trả về đường dẫn để có thể dừng lắng nghe sau này
    return path;
  },

  // Dừng lắng nghe thay đổi
  stopListening: (path) => {
    firebase.database().ref(path).off();
    return { success: true };
  },

  // Tìm kiếm dữ liệu theo trường
  findByField: async (collection, field, value) => {
    try {
      const dataRef = firebase.database().ref(collection);
      const query = dataRef.orderByChild(field).equalTo(value);
      const snapshot = await query.once("value");

      if (snapshot.exists()) {
        const data = [];
        snapshot.forEach((childSnapshot) => {
          data.push({
            id: childSnapshot.key,
            ...childSnapshot.val(),
          });
        });
        return { success: true, data };
      } else {
        return { success: true, data: [] };
      }
    } catch (error) {
      console.error("Lỗi truy vấn dữ liệu:", error);
      return { success: false, error };
    }
  },
};

// Đăng ký Service Worker cho PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('Service Worker đăng ký thành công:', registration.scope);
      })
      .catch(error => {
        console.log('Đăng ký Service Worker thất bại:', error);
      });
  });
}
