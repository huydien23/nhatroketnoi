// Hệ thống quản lý thông báo
class NotificationSystem {
  constructor() {
    this.container = null;
    this.init();
  }

  // Khởi tạo container cho thông báo
  init() {
    if (!this.container) {
      this.container = document.createElement("div");
      this.container.id = "notification-container";
      this.container.style.position = "fixed";
      this.container.style.top = "0";
      this.container.style.right = "0";
      this.container.style.zIndex = "9999";
      document.body.appendChild(this.container);
    }
  }

  /**
   * Hiển thị thông báo
   * @param {string} message - Nội dung thông báo
   * @param {string} type - Loại thông báo: success, error, info, warning
   * @param {number} duration - Thời gian hiển thị (ms)
   */
  show(message, type = "info", duration = 4000) {
    // Tạo icon dựa trên loại thông báo
    let icon = "";
    switch (type) {
      case "success":
        icon = '<i class="fas fa-check-circle notification-icon"></i>';
        break;
      case "error":
        icon = '<i class="fas fa-exclamation-circle notification-icon"></i>';
        break;
      case "warning":
        icon = '<i class="fas fa-exclamation-triangle notification-icon"></i>';
        break;
      case "info":
      default:
        icon = '<i class="fas fa-info-circle notification-icon"></i>';
        break;
    }

    // Tạo notification element
    const notification = document.createElement("div");
    notification.className = `notification ${type}`;
    notification.innerHTML = `
            ${icon}
            <div class="notification-message">${message}</div>
            <span class="notification-close">&times;</span>
        `;

    // Thêm notification vào container
    this.container.appendChild(notification);

    // Xử lý nút đóng thông báo
    const closeButton = notification.querySelector(".notification-close");
    closeButton.addEventListener("click", () => {
      this.dismiss(notification);
    });

    // Tự động ẩn sau thời gian duration
    if (duration > 0) {
      setTimeout(() => {
        this.dismiss(notification);
      }, duration);
    }

    // Trả về notification để có thể tương tác nếu cần
    return notification;
  }

  /**
   * Loại bỏ thông báo
   * @param {HTMLElement} notification - Element thông báo
   */
  dismiss(notification) {
    if (!notification) return;

    notification.classList.add("hide");
    setTimeout(() => {
      if (notification.parentNode === this.container) {
        this.container.removeChild(notification);
      }
    }, 300); // Đợi animation hoàn tất
  }

  // Các phương thức tiện ích
  success(message, duration = 4000) {
    return this.show(message, "success", duration);
  }

  error(message, duration = 5000) {
    return this.show(message, "error", duration);
  }

  warning(message, duration = 4500) {
    return this.show(message, "warning", duration);
  }

  info(message, duration = 4000) {
    return this.show(message, "info", duration);
  }
}

// Tạo instance global để sử dụng trong toàn ứng dụng
window.notifications = new NotificationSystem();
