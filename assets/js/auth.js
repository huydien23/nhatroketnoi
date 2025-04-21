// Hàm kiểm tra định dạng form
function validateForm(formId) {
  const form = document.getElementById(formId);
  if (!form) return false;

  const inputs = form.querySelectorAll("input[required]");
  let isValid = true;

  inputs.forEach((input) => {
    if (!input.value.trim()) {
      isValid = false;
      input.classList.add("error");
    } else {
      input.classList.remove("error");
    }
  });

  return isValid;
}

// Hàm hiển thị loading
function showLoading(buttonId) {
  const button = document.getElementById(buttonId);
  if (button) {
    button.classList.add("loading");
    button.disabled = true;
  }
}

// Hàm ẩn loading
function hideLoading(buttonId) {
  const button = document.getElementById(buttonId);
  if (button) {
    button.classList.remove("loading");
    button.disabled = false;
  }
}

// Hàm hiển thị thông báo lỗi
function showError(message) {
  const errorElement = document.getElementById("errorMessage");
  if (errorElement) {
    errorElement.textContent = message;
    errorElement.style.display = "block";
  } else {
    alert(message);
  }
}

// Hàm đăng nhập bằng Firebase
async function login(event) {
  // Prevent default form submission
  if (event) {
    event.preventDefault();
  }

  // Kiểm tra định dạng form
  if (!validateForm("loginForm")) {
    showError("Vui lòng điền đầy đủ thông tin đăng nhập!");
    return false;
  }

  // Hiển thị loading
  showLoading("loginButton");

  try {
    const email = $("#username").val();
    const password = $("#password").val();

    // Kiểm tra xem window.firebaseSignIn có tồn tại không
    if (typeof window.firebaseSignIn !== "function") {
      console.error("Hàm firebaseSignIn không tồn tại!");
      showError(
        "Chức năng đăng nhập chưa được khởi tạo. Vui lòng tải lại trang."
      );
      hideLoading("loginButton");
      return false;
    }

    // Gọi hàm đăng nhập từ Firebase
    const result = await window.firebaseSignIn(email, password);
    console.log("Login result:", result); // Add debug log

    if (result.success) {
      // Lưu trạng thái đăng nhập vào localStorage để sử dụng sau này
      localStorage.setItem("isLoggedIn", "true");

      // Kiểm tra xem window.notifications có tồn tại không
      if (window.notifications) {
        // Hiển thị thông báo thành công với animation
        window.notifications.success(
          "Đăng nhập thành công! Chuyển hướng đến trang chủ..."
        );
      } else {
        // Fallback khi không có hệ thống thông báo
        alert("Đăng nhập thành công!");
      }

      // Delay để người dùng thấy thông báo trước khi chuyển hướng
      setTimeout(() => {
        window.location.href = "../../index.html";
      }, 1500);
    } else {
      // Xử lý lỗi cụ thể
      let errorMessage = "Đăng nhập thất bại. Vui lòng thử lại!";

      if (
        result.error === "auth/invalid-login-credentials" ||
        result.error === "auth/invalid-credential"
      ) {
        errorMessage = "Email hoặc mật khẩu không chính xác!";
      } else if (result.error === "auth/user-not-found") {
        errorMessage = "Không tìm thấy tài khoản với email này!";
      } else if (result.error === "auth/wrong-password") {
        errorMessage = "Mật khẩu không chính xác!";
      } else if (result.error === "auth/too-many-requests") {
        errorMessage = "Đã đăng nhập thất bại nhiều lần. Vui lòng thử lại sau!";
      } else if (result.message) {
        // Sử dụng thông báo lỗi trực tiếp từ Firebase nếu có
        errorMessage = result.message;
      }

      console.error("Login error:", result.error); // Add error logging

      // Hiển thị lỗi
      if (window.notifications) {
        window.notifications.error(errorMessage);
      } else {
        showError(errorMessage);
      }

      hideLoading("loginButton");
    }
  } catch (error) {
    console.error("Lỗi khi xử lý đăng nhập:", error);

    if (window.notifications) {
      window.notifications.error(
        "Đã xảy ra lỗi trong quá trình đăng nhập. Vui lòng thử lại sau."
      );
    } else {
      showError(
        "Đã xảy ra lỗi trong quá trình đăng nhập. Vui lòng thử lại sau."
      );
    }

    hideLoading("loginButton");
  }

  return false;
}

// Hàm đăng ký bằng Firebase
async function register(event) {
  if (event) {
    event.preventDefault();
  }

  if (!validateForm("registerForm")) {
    showError("Vui lòng điền đầy đủ thông tin đăng ký!");
    return false;
  }

  showLoading("registerButton");

  try {
    const email = $("#email").val();
    const password = $("#password").val();
    const fullName = $("#full_name").val();
    const phone = $("#phone_number").val();

    // Kiểm tra dữ liệu trước khi gửi
    if (!email || !password || !fullName || !phone) {
      showError("Vui lòng điền đầy đủ thông tin!");
      hideLoading("registerButton");
      return false;
    }

    // Chỉ truyền displayName là chuỗi String đơn giản
    const userData = {
      displayName: fullName, // Đảm bảo displayName là chuỗi đơn giản
      phoneNumber: phone,
    };

    // Tạo một đối tượng riêng cho dữ liệu chi tiết người dùng để lưu vào database
    const userProfile = {
      fullName: fullName,
      email: email,
      phoneNumber: phone,
      createdAt: new Date().toISOString(),
    };

    // Gọi hàm đăng ký với userData đã được định dạng lại
    const result = await window.firebaseSignUp(
      email,
      password,
      userData,
      userProfile
    );
    console.log("Kết quả đăng ký:", result);

    if (result.success) {
      // Reset form và chuyển hướng
      document.getElementById("registerForm").reset();

      if (window.notifications) {
        window.notifications.success("Đăng ký thành công!");
      } else {
        alert("Đăng ký thành công!");
      }

      setTimeout(() => {
        window.location.href = "../../pages/auth/dangnhap.html";
      }, 1500);
    } else {
      let errorMessage = "Đăng ký thất bại. Vui lòng thử lại!";

      // Xử lý các loại lỗi
      if (result.error === "auth/email-already-in-use") {
        errorMessage =
          "Email này đã được sử dụng! Vui lòng sử dụng email khác hoặc đăng nhập.";
      } else if (result.error === "auth/invalid-value-(display-name)") {
        errorMessage = "Tên hiển thị không hợp lệ!";
      } else if (result.error === "auth/weak-password") {
        errorMessage =
          "Mật khẩu yếu! Vui lòng chọn mật khẩu có ít nhất 6 ký tự.";
      } else if (result.message) {
        errorMessage = result.message;
      }

      // Hiển thị lỗi
      if (window.notifications) {
        window.notifications.error(errorMessage);
      } else {
        showError(errorMessage);
      }
      hideLoading("registerButton");
    }
  } catch (error) {
    console.error("Lỗi đăng ký:", error);
    showError(error.message || "Đã có lỗi xảy ra khi đăng ký!");
    hideLoading("registerButton");
  }

  return false;
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
function logout() {
  // Kiểm tra xem Firebase Auth có tồn tại không
  if (typeof firebase !== "undefined" && firebase.auth) {
    firebase
      .auth()
      .signOut()
      .then(() => {
        localStorage.removeItem("isLoggedIn");
        window.location.href = "../../index.html";
        alert("Đăng xuất thành công!");
      })
      .catch((error) => {
        console.error("Lỗi đăng xuất:", error);
      });
  } else {
    // Fallback nếu Firebase chưa được khởi tạo
    localStorage.removeItem("isLoggedIn");
    window.location.href = "../../index.html";
    alert("Đăng xuất thành công!");
  }
}

// Hàm khởi tạo thông tin người dùng và nút cuộn lên đầu trang
function initializeUserProfile() {
  const userProfile = document.querySelector(".user-profile");
  const loginBtn = document.getElementById("loginBtn");
  const btnDangTin = document.getElementById("btnDangTin");

  console.log("Initializing user profile...");
  console.log("Login button:", loginBtn);
  console.log("Đăng Tin button:", btnDangTin);

  // Sử dụng Firebase Auth để kiểm tra trạng thái đăng nhập
  if (typeof firebase !== "undefined" && firebase.auth) {
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        // Đã đăng nhập
        console.log("Người dùng đã đăng nhập:", user.displayName);
        localStorage.setItem("isLoggedIn", "true");

        // Hiển thị nút "Đăng Tin" và thông tin người dùng
        if (loginBtn) loginBtn.style.display = "none";
        if (btnDangTin) btnDangTin.style.display = "block";
        if (userProfile) userProfile.style.display = "flex";

        // Cập nhật thông tin người dùng
        const userShortNameElement = document.getElementById("userShortName");
        const userFullnameElement = document.getElementById("userFullname");
        const userEmailElement = document.getElementById("userEmail");

        const fullName = user.displayName || "Người dùng";
        const shortName = getShortName(fullName);

        if (userShortNameElement) userShortNameElement.textContent = shortName;
        if (userFullnameElement) userFullnameElement.textContent = fullName;
        if (userEmailElement) userEmailElement.textContent = user.email || "";

        // Xử lý dropdown khi click
        const userAvatar = document.querySelector(".user-avatar");
        if (userAvatar) {
          userAvatar.addEventListener("click", function (event) {
            event.stopPropagation();
            userProfile.classList.toggle("active");
          });

          // Đóng dropdown khi click bên ngoài
          document.addEventListener("click", function (event) {
            if (!userProfile.contains(event.target)) {
              userProfile.classList.remove("active");
            }
          });
        }
      } else {
        // Chưa đăng nhập
        console.log("Chưa đăng nhập");
        localStorage.removeItem("isLoggedIn");

        // Ẩn nút "Đăng Tin" và thông tin người dùng
        if (loginBtn) loginBtn.style.display = "block";
        if (btnDangTin) btnDangTin.style.display = "none";
        if (userProfile) userProfile.style.display = "none";
      }
    });
  } else {
    // Fallback khi Firebase chưa sẵn sàng - kiểm tra localStorage
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    console.log("Using localStorage fallback. isLoggedIn:", isLoggedIn);

    if (isLoggedIn) {
      // Giả lập đã đăng nhập
      if (loginBtn) loginBtn.style.display = "none";
      if (btnDangTin) btnDangTin.style.display = "block";
      if (userProfile) userProfile.style.display = "flex";
    } else {
      // Giả lập chưa đăng nhập
      if (loginBtn) loginBtn.style.display = "block";
      if (btnDangTin) btnDangTin.style.display = "none";
      if (userProfile) userProfile.style.display = "none";
    }
  }
}

// Hàm khởi tạo nút cuộn lên đầu trang
function initializeScrollTopButton() {
  const scrollTopBtn = document.getElementById("scrollTopBtn");
  if (!scrollTopBtn) return;

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
}

// Hàm xử lý quên mật khẩu
async function forgotPassword(event) {
  if (event) {
    event.preventDefault();
  }

  const email = $("#email").val();
  if (!email) {
    showError("Vui lòng nhập email của bạn!");
    return false;
  }

  showLoading("forgotPasswordButton");

  try {
    // Kiểm tra xem window.firebaseForgotPassword có tồn tại không
    if (typeof window.firebaseForgotPassword !== "function") {
      console.error("Hàm firebaseForgotPassword không tồn tại!");
      showError(
        "Chức năng quên mật khẩu chưa được khởi tạo. Vui lòng tải lại trang."
      );
      hideLoading("forgotPasswordButton");
      return false;
    }

    const result = await window.firebaseForgotPassword(email);
    console.log("Forgot password result:", result);

    if (result.success) {
      if (window.notifications) {
        window.notifications.success(
          "Đã gửi email khôi phục mật khẩu! Vui lòng kiểm tra hộp thư của bạn."
        );
      } else {
        alert(
          "Đã gửi email khôi phục mật khẩu! Vui lòng kiểm tra hộp thư của bạn."
        );
      }

      // Chuyển về trang đăng nhập sau 3 giây
      setTimeout(() => {
        window.location.href = "../../pages/auth/dangnhap.html";
      }, 3000);
    } else {
      let errorMessage =
        "Không thể gửi email khôi phục mật khẩu. Vui lòng thử lại!";

      if (result.error === "auth/user-not-found") {
        errorMessage = "Không tìm thấy tài khoản với email này!";
      } else if (result.error === "auth/invalid-email") {
        errorMessage = "Email không hợp lệ!";
      } else if (result.error === "auth/too-many-requests") {
        errorMessage = "Quá nhiều yêu cầu. Vui lòng thử lại sau!";
      }

      if (window.notifications) {
        window.notifications.error(errorMessage);
      } else {
        showError(errorMessage);
      }
    }
  } catch (error) {
    console.error("Lỗi khi xử lý quên mật khẩu:", error);
    showError("Đã xảy ra lỗi. Vui lòng thử lại sau!");
  }

  hideLoading("forgotPasswordButton");
  return false;
}

// Khởi tạo các chức năng khi trang đã tải xong
document.addEventListener("DOMContentLoaded", function () {
  console.log("DOM fully loaded - initializing auth features");
  initializeUserProfile();
  initializeScrollTopButton();

  // Xử lý nút Đăng Tin
  const btnDangTin = document.getElementById("btnDangTin");
  if (btnDangTin) {
    btnDangTin.addEventListener("click", function (event) {
      if (!localStorage.getItem("isLoggedIn")) {
        event.preventDefault();
        alert("Vui lòng đăng nhập để sử dụng tính năng đăng tin!");
        window.location.href = "../../pages/auth/dangnhap.html";
      }
    });
  }

  const registerForm = document.getElementById("registerForm");
  if (registerForm) {
    registerForm.addEventListener("submit", register);
  }

  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", login);
  }

  const forgotPasswordForm = document.getElementById("forgotPasswordForm");
  if (forgotPasswordForm) {
    forgotPasswordForm.addEventListener("submit", forgotPassword);
  }

  // Xử lý nút đăng xuất
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", function (event) {
      event.preventDefault();
      logout();
    });
  }
});

// Đảm bảo rằng hàm logout có thể được gọi từ HTML
window.logout = logout;
