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

// Khởi tạo Firebase khi script được tải
document.addEventListener("DOMContentLoaded", function () {
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

  // Các hàm khởi tạo khác ở đây...
  initializeUIComponents();
});

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
      card.style.transform = "translateY(0)";
    });
  });
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
