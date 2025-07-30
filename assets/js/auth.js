// Form validation
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

// Loading states
function showLoading(buttonId) {
  const button = document.getElementById(buttonId);
  if (button) {
    button.classList.add("loading");
    button.disabled = true;
  }
}

function hideLoading(buttonId) {
  const button = document.getElementById(buttonId);
  if (button) {
    button.classList.remove("loading");
    button.disabled = false;
  }
}

// Error handling
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
  if (event) {
    event.preventDefault();
  }

  if (!validateForm("loginForm")) {
    showError("Vui lòng điền đầy đủ thông tin đăng nhập!");
    return false;
  }

  showLoading("loginButton");

  try {
    const email = $("#username").val();
    const password = $("#password").val();

    if (typeof window.firebaseSignIn !== "function") {
      console.error("firebaseSignIn function not found!");
      showError("Chức năng đăng nhập chưa được khởi tạo. Vui lòng tải lại trang.");
      hideLoading("loginButton");
      return false;
    }

    const result = await window.firebaseSignIn(email, password);
    console.log("Login result:", result);

    if (result.success) {
      localStorage.setItem("isLoggedIn", "true");

      if (window.notifications) {
        window.notifications.success("Đăng nhập thành công! Chuyển hướng đến trang chủ...");
      } else {
        alert("Đăng nhập thành công!");
      }

      setTimeout(() => {
        window.location.href = "../../index.html";
      }, 1500);
    } else {
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
        errorMessage = result.message;
      }

      console.error("Login error:", result.error);

      if (window.notifications) {
        window.notifications.error(errorMessage);
      } else {
        showError(errorMessage);
      }

      hideLoading("loginButton");
    }
  } catch (error) {
    console.error("Login error:", error);

    if (window.notifications) {
      window.notifications.error("Đã xảy ra lỗi trong quá trình đăng nhập. Vui lòng thử lại sau.");
    } else {
      showError("Đã xảy ra lỗi trong quá trình đăng nhập. Vui lòng thử lại sau.");
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

  console.log("Initializing user profile...");
  console.log("Login button:", loginBtn);

  // Sử dụng Firebase Auth để kiểm tra trạng thái đăng nhập
  if (typeof firebase !== "undefined" && firebase.auth) {
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        // Đã đăng nhập
        console.log("Người dùng đã đăng nhập:", user.displayName);
        localStorage.setItem("isLoggedIn", "true");

        // Hiển thị thông tin người dùng
        if (loginBtn) loginBtn.style.display = "none";
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

        // Ẩn thông tin người dùng
        if (loginBtn) loginBtn.style.display = "block";
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
      if (userProfile) userProfile.style.display = "flex";
    } else {
      // Giả lập chưa đăng nhập
      if (loginBtn) loginBtn.style.display = "block";
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

  });
}

// Xử lý chuyển đổi giữa các form
const signupTab = document.getElementById("signup-tab");
const loginTab = document.getElementById("login-tab");
const signupForm = document.getElementById("signup-form");
const loginForm = document.getElementById("login-form");
const forgotPasswordLink = document.getElementById("forgot-password-link");
const forgotPasswordForm = document.getElementById("forgot-password-form");
const backToLoginLink = document.getElementById("back-to-login");

if (signupTab && loginTab) {
  // Chuyển đổi giữa form đăng ký và đăng nhập
  signupTab.addEventListener("click", function (e) {
    e.preventDefault();
    showSignupForm();
  });

  loginTab.addEventListener("click", function (e) {
    e.preventDefault();
    showLoginForm();
  });
}

if (forgotPasswordLink) {
  // Chuyển đổi đến form quên mật khẩu
  forgotPasswordLink.addEventListener("click", function (e) {
    e.preventDefault();
    showForgotPasswordForm();
  });
}

if (backToLoginLink) {
  // Quay lại form đăng nhập từ form quên mật khẩu
  backToLoginLink.addEventListener("click", function (e) {
    e.preventDefault();
    showLoginForm();
  });
}

// Xử lý submit form đăng ký
if (signupForm) {
  signupForm.addEventListener("submit", function (e) {
    e.preventDefault();
    handleSignup();
  });
}

// Xử lý submit form đăng nhập
if (loginForm) {
  loginForm.addEventListener("submit", function (e) {
    e.preventDefault();
    handleLogin();
  });
}

// Xử lý submit form quên mật khẩu
if (forgotPasswordForm) {
  forgotPasswordForm.addEventListener("submit", function (e) {
    e.preventDefault();
    handleForgotPassword();
  });
}

// Kiểm tra nếu đã đăng nhập thì chuyển hướng
firebase.auth().onAuthStateChanged(function (user) {
  if (user && window.location.href.includes("auth")) {
    // Nếu đã đăng nhập và đang ở trang auth thì chuyển hướng về trang chủ
    window.location.href = "/index.html";
  }
});

// Validate form khi nhập liệu
initializeFormValidation();

// Hiển thị form đăng ký
function showSignupForm() {
  document.getElementById("signup-tab").classList.add("active");
  document.getElementById("login-tab").classList.remove("active");
  document.getElementById("signup-form").style.display = "block";
  document.getElementById("login-form").style.display = "none";
  document.getElementById("forgot-password-form").style.display = "none";
}

// Hiển thị form đăng nhập
function showLoginForm() {
  document.getElementById("signup-tab").classList.remove("active");
  document.getElementById("login-tab").classList.add("active");
  document.getElementById("signup-form").style.display = "none";
  document.getElementById("login-form").style.display = "block";
  document.getElementById("forgot-password-form").style.display = "none";
}

// Hiển thị form quên mật khẩu
function showForgotPasswordForm() {
  document.getElementById("signup-form").style.display = "none";
  document.getElementById("login-form").style.display = "none";
  document.getElementById("forgot-password-form").style.display = "block";

  // Ẩn tabs
  document.getElementById("auth-tabs").style.display = "none";
}

// Xử lý đăng ký tài khoản
async function handleSignup() {
  // Hiển thị loading
  showLoading();

  // Lấy dữ liệu từ form
  const fullname = document.getElementById("signup-fullname").value;
  const email = document.getElementById("signup-email").value;
  const phone = document.getElementById("signup-phone").value;
  const password = document.getElementById("signup-password").value;
  const confirmPassword = document.getElementById(
    "signup-confirm-password"
  ).value;
  const role = document.querySelector('input[name="role"]:checked').value;
  const acceptTerms = document.getElementById("accept-terms").checked;

  // Kiểm tra mật khẩu khớp nhau
  if (password !== confirmPassword) {
    hideLoading();
    showError("Mật khẩu không khớp");
    return;
  }

  // Kiểm tra chấp nhận điều khoản
  if (!acceptTerms) {
    hideLoading();
    showError("Bạn phải chấp nhận điều khoản sử dụng");
    return;
  }

  try {
    // Tạo tài khoản mới
    const userCredential = await firebase
      .auth()
      .createUserWithEmailAndPassword(email, password);
    const user = userCredential.user;

    // Cập nhật thông tin profile cho user
    await user.updateProfile({
      displayName: fullname,
      photoURL: null, // Avatar mặc định
    });

    // Lưu thông tin chi tiết vào database
    await firebase
      .database()
      .ref("users/" + user.uid)
      .set({
        uid: user.uid,
        fullname: fullname,
        email: email,
        phone: phone,
        role: role,
        memberSince: Date.now(),
        status: "active",
      });

    // Gửi email xác nhận
    await user.sendEmailVerification();

    // Ẩn loading
    hideLoading();

    // Hiển thị thông báo thành công
    Swal.fire({
      title: "Đăng ký thành công!",
      text: "Vui lòng kiểm tra email để xác nhận tài khoản.",
      icon: "success",
      confirmButtonColor: "#3498db",
      confirmButtonText: "Đăng nhập ngay",
    }).then((result) => {
      if (result.isConfirmed) {
        // Chuyển đến form đăng nhập
        showLoginForm();
      }
    });
  } catch (error) {
    hideLoading();

    // Xử lý các lỗi
    let errorMessage = "Đã xảy ra lỗi khi đăng ký tài khoản.";

    switch (error.code) {
      case "auth/email-already-in-use":
        errorMessage = "Email này đã được sử dụng. Vui lòng chọn email khác.";
        break;
      case "auth/invalid-email":
        errorMessage = "Định dạng email không hợp lệ.";
        break;
      case "auth/weak-password":
        errorMessage = "Mật khẩu quá yếu. Vui lòng chọn mật khẩu mạnh hơn.";
        break;
      default:
        console.error("Lỗi đăng ký:", error);
    }

    showError(errorMessage);
  }
}

// Xử lý đăng nhập
async function handleLogin() {
  // Hiển thị loading
  showLoading();

  // Lấy dữ liệu từ form
  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;
  const rememberMe = document.getElementById("remember-me").checked;

  try {
    // Đặt thời gian lưu trạng thái đăng nhập
    await firebase.auth().setPersistence(
      rememberMe
        ? firebase.auth.Auth.Persistence.LOCAL // Lưu vĩnh viễn cho đến khi đăng xuất
        : firebase.auth.Auth.Persistence.SESSION // Chỉ lưu trong phiên hiện tại
    );

    // Thực hiện đăng nhập
    const userCredential = await firebase
      .auth()
      .signInWithEmailAndPassword(email, password);
    const user = userCredential.user;

    // Cập nhật lần đăng nhập gần nhất
    await firebase
      .database()
      .ref("users/" + user.uid)
      .update({
        lastLogin: Date.now(),
      });

    // Ẩn loading
    hideLoading();

    // Chuyển hướng đến trang chủ hoặc trang redirect (nếu có)
    const urlParams = new URLSearchParams(window.location.search);
    const redirectUrl = urlParams.get("redirect") || "/index.html";
    window.location.href = redirectUrl;
  } catch (error) {
    hideLoading();

    // Xử lý các lỗi
    let errorMessage = "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.";

    switch (error.code) {
      case "auth/invalid-email":
        errorMessage = "Định dạng email không hợp lệ.";
        break;
      case "auth/user-disabled":
        errorMessage = "Tài khoản này đã bị khóa.";
        break;
      case "auth/user-not-found":
        errorMessage = "Email hoặc mật khẩu không chính xác.";
        break;
      case "auth/wrong-password":
        errorMessage = "Email hoặc mật khẩu không chính xác.";
        break;
      default:
        console.error("Lỗi đăng nhập:", error);
    }

    showError(errorMessage);
  }
}

// Xử lý quên mật khẩu
async function handleForgotPassword() {
  // Hiển thị loading
  showLoading();

  // Lấy email từ form
  const email = document.getElementById("forgot-email").value;

  try {
    // Gửi email đặt lại mật khẩu
    await firebase.auth().sendPasswordResetEmail(email);

    // Ẩn loading
    hideLoading();

    // Hiển thị thông báo thành công
    Swal.fire({
      title: "Đã gửi email!",
      text: "Vui lòng kiểm tra email để đặt lại mật khẩu.",
      icon: "success",
      confirmButtonColor: "#3498db",
      confirmButtonText: "Quay lại đăng nhập",
    }).then((result) => {
      if (result.isConfirmed) {
        // Chuyển đến form đăng nhập
        showLoginForm();
      }
    });
  } catch (error) {
    hideLoading();

    // Xử lý các lỗi
    let errorMessage = "Đã xảy ra lỗi khi gửi email đặt lại mật khẩu.";

    switch (error.code) {
      case "auth/invalid-email":
        errorMessage = "Định dạng email không hợp lệ.";
        break;
      case "auth/user-not-found":
        errorMessage = "Không tìm thấy tài khoản với email này.";
        break;
      default:
        console.error("Lỗi đặt lại mật khẩu:", error);
    }

    showError(errorMessage);
  }
}

// Khởi tạo validation form
function initializeFormValidation() {
  // Validate form đăng ký
  const signupForm = document.getElementById("signup-form");
  if (signupForm) {
    const fullnameInput = document.getElementById("signup-fullname");
    const emailInput = document.getElementById("signup-email");
    const phoneInput = document.getElementById("signup-phone");
    const passwordInput = document.getElementById("signup-password");
    const confirmPasswordInput = document.getElementById(
      "signup-confirm-password"
    );

    // Validate họ tên
    fullnameInput.addEventListener("input", function () {
      validateFullname(this);
    });

    // Validate email
    emailInput.addEventListener("input", function () {
      validateEmail(this);
    });

    // Validate số điện thoại
    phoneInput.addEventListener("input", function () {
      validatePhone(this);
    });

    // Validate mật khẩu
    passwordInput.addEventListener("input", function () {
      validatePassword(this);
    });

    // Validate xác nhận mật khẩu
    confirmPasswordInput.addEventListener("input", function () {
      validateConfirmPassword(this, passwordInput);
    });
  }

  // Validate form đăng nhập
  const loginForm = document.getElementById("login-form");
  if (loginForm) {
    const emailInput = document.getElementById("login-email");
    const passwordInput = document.getElementById("login-password");

    // Validate email
    emailInput.addEventListener("input", function () {
      validateEmail(this);
    });

    // Validate mật khẩu (chỉ kiểm tra không để trống)
    passwordInput.addEventListener("input", function () {
      validateRequired(this, "Vui lòng nhập mật khẩu");
    });
  }

  // Validate form quên mật khẩu
  const forgotPasswordForm = document.getElementById("forgot-password-form");
  if (forgotPasswordForm) {
    const emailInput = document.getElementById("forgot-email");

    // Validate email
    emailInput.addEventListener("input", function () {
      validateEmail(this);
    });
  }
}

// Validate họ tên
function validateFullname(input) {
  const value = input.value.trim();
  const errorElement = getErrorElement(input);

  if (value === "") {
    showInputError(input, errorElement, "Vui lòng nhập họ tên");
    return false;
  } else if (value.length < 2) {
    showInputError(input, errorElement, "Họ tên phải có ít nhất 2 ký tự");
    return false;
  } else {
    hideInputError(input, errorElement);
    return true;
  }
}

// Validate email
function validateEmail(input) {
  const value = input.value.trim();
  const errorElement = getErrorElement(input);
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (value === "") {
    showInputError(input, errorElement, "Vui lòng nhập email");
    return false;
  } else if (!emailRegex.test(value)) {
    showInputError(input, errorElement, "Email không hợp lệ");
    return false;
  } else {
    hideInputError(input, errorElement);
    return true;
  }
}

// Validate số điện thoại
function validatePhone(input) {
  const value = input.value.trim();
  const errorElement = getErrorElement(input);
  const phoneRegex = /^(0|\+84)[3|5|7|8|9][0-9]{8}$/;

  if (value === "") {
    showInputError(input, errorElement, "Vui lòng nhập số điện thoại");
    return false;
  } else if (!phoneRegex.test(value)) {
    showInputError(input, errorElement, "Số điện thoại không hợp lệ");
    return false;
  } else {
    hideInputError(input, errorElement);
    return true;
  }
}

// Validate mật khẩu
function validatePassword(input) {
  const value = input.value.trim();
  const errorElement = getErrorElement(input);

  if (value === "") {
    showInputError(input, errorElement, "Vui lòng nhập mật khẩu");
    return false;
  } else if (value.length < 6) {
    showInputError(input, errorElement, "Mật khẩu phải có ít nhất 6 ký tự");
    return false;
  } else {
    hideInputError(input, errorElement);
    return true;
  }
}

// Validate xác nhận mật khẩu
function validateConfirmPassword(input, passwordInput) {
  const value = input.value.trim();
  const passwordValue = passwordInput.value.trim();
  const errorElement = getErrorElement(input);

  if (value === "") {
    showInputError(input, errorElement, "Vui lòng xác nhận mật khẩu");
    return false;
  } else if (value !== passwordValue) {
    showInputError(input, errorElement, "Mật khẩu không khớp");
    return false;
  } else {
    hideInputError(input, errorElement);
    return true;
  }
}

// Validate trường bắt buộc
function validateRequired(input, errorMessage) {
  const value = input.value.trim();
  const errorElement = getErrorElement(input);

  if (value === "") {
    showInputError(input, errorElement, errorMessage);
    return false;
  } else {
    hideInputError(input, errorElement);
    return true;
  }
}

// Lấy hoặc tạo phần tử hiển thị lỗi
function getErrorElement(input) {
  let errorElement = input.nextElementSibling;

  // Kiểm tra nếu phần tử kế tiếp là error message
  if (!errorElement || !errorElement.classList.contains("error-message")) {
    // Tạo phần tử mới nếu chưa có
    errorElement = document.createElement("div");
    errorElement.className = "error-message";
    input.parentNode.insertBefore(errorElement, input.nextSibling);
  }

  return errorElement;
}

// Hiển thị lỗi input
function showInputError(input, errorElement, message) {
  input.classList.add("error");
  errorElement.textContent = message;
  errorElement.style.display = "block";
}

// Ẩn lỗi input
function hideInputError(input, errorElement) {
  input.classList.remove("error");
  errorElement.textContent = "";
  errorElement.style.display = "none";
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
  // Sử dụng SweetAlert2 để hiển thị lỗi
  Swal.fire({
    title: "Lỗi!",
    text: message,
    icon: "error",
    confirmButtonColor: "#e74c3c",
    confirmButtonText: "Đóng",
  });
}

// Đăng xuất
function logout() {
  firebase
    .auth()
    .signOut()
    .then(() => {
      // Chuyển hướng về trang chủ
      window.location.href = "/index.html";
    })
    .catch((error) => {
      console.error("Lỗi đăng xuất:", error);
    });
}
