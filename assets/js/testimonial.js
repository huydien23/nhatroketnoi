document.addEventListener("DOMContentLoaded", function () {
  const slider = document.getElementById("testimonialsList");
  const cards = document.querySelectorAll(".testimonial-card");
  const prevBtn = document.querySelector(".prev-btn");
  const nextBtn = document.querySelector(".next-btn");
  const dots = document.querySelectorAll(".dot");

  let currentSlide = 0;
  let interval;
  const autoSlideDelay = 5000; // 5 seconds

  function updateSlider() {
    const slideWidth = cards[0].offsetWidth + 20; // Including gap
    slider.style.transform = `translateX(-${currentSlide * slideWidth}px)`;

    // Update active states
    cards.forEach((card, index) => {
      card.classList.remove("active");
      if (index === currentSlide) {
        card.classList.add("active");
      }
    });

    // Update dots
    dots.forEach((dot, index) => {
      dot.classList.toggle("active", index === currentSlide);
    });
  }

  function startAutoSlide() {
    stopAutoSlide();
    interval = setInterval(() => {
      currentSlide = (currentSlide + 1) % cards.length;
      updateSlider();
    }, autoSlideDelay);
  }

  function stopAutoSlide() {
    if (interval) {
      clearInterval(interval);
    }
  }

  // Event listeners
  // nextBtn.addEventListener("click", () => {
  //   currentSlide = (currentSlide + 1) % cards.length;
  //   updateSlider();
  //   stopAutoSlide();
  //   startAutoSlide();
  // });

  // prevBtn.addEventListener("click", () => {
  //   currentSlide = (currentSlide - 1 + cards.length) % cards.length;
  //   updateSlider();
  //   stopAutoSlide();
  //   startAutoSlide();
  // });

  // dots.forEach((dot, index) => {
  //   dot.addEventListener("click", () => {
  //     currentSlide = index;
  //     updateSlider();
  //     stopAutoSlide();
  //     startAutoSlide();
  //   });
  // });

  // // Pause auto-sliding when hovering over slider
  // slider.addEventListener("mouseenter", stopAutoSlide);
  // slider.addEventListener("mouseleave", startAutoSlide);

  // // Initial setup
  // updateSlider();
  // startAutoSlide();

  const reviewForm = document.getElementById("reviewForm");
  const stars = document.querySelectorAll(".rating .fa-star");
  const submitButton = document.getElementById("submitReview");
  let selectedRating = 0;

  // Kiểm tra đăng nhập và hiển thị form đánh giá
  function checkLoginAndShowForm() {
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    if (isLoggedIn) {
      reviewForm.style.display = "block";
    } else {
      reviewForm.style.display = "none";
    }
  }

  // Xử lý sự kiện hover và click cho rating stars
  stars.forEach((star) => {
    star.addEventListener("mouseover", function () {
      const rating = this.dataset.rating;
      stars.forEach((s, index) => {
        if (index < rating) {
          s.classList.remove("far");
          s.classList.add("fas");
        } else {
          s.classList.remove("fas");
          s.classList.add("far");
        }
      });
    });

    star.addEventListener("mouseleave", function () {
      highlightStars(selectedRating);
    });

    star.addEventListener("click", function () {
      selectedRating = this.dataset.rating;
      highlightStars(selectedRating);
      // Add pop animation
      stars.forEach((s, index) => {
        if (index < selectedRating) {
          s.style.animation = "none";
          s.offsetHeight; // Trigger reflow
          s.style.animation = "starPop 0.3s ease forwards";
        }
      });
    });
  });

  // Hàm highlight stars
  function highlightStars(rating) {
    stars.forEach((star, index) => {
      if (index < rating) {
        star.classList.remove("far");
        star.classList.add("fas");
      } else {
        star.classList.remove("fas");
        star.classList.add("far");
      }
    });
  }

  // Xử lý submit đánh giá
  submitButton.addEventListener("click", function () {
    if (!selectedRating) {
      alert("Vui lòng chọn số sao đánh giá!");
      return;
    }

    const content = document.getElementById("reviewContent").value;
    if (!content.trim()) {
      alert("Vui lòng nhập nội dung đánh giá!");
      return;
    }

    // Thêm đánh giá mới vào danh sách
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    const newTestimonial = createTestimonialCard(
      userInfo.name,
      selectedRating,
      content
    );
    document
      .getElementById("testimonialsList")
      .insertBefore(
        newTestimonial,
        document.getElementById("testimonialsList").firstChild
      );

    // Reset form
    selectedRating = 0;
    document.getElementById("reviewContent").value = "";
    highlightStars(0);
  });

  // Hàm tạo testimonial card
  function createTestimonialCard(name, rating, content) {
    const div = document.createElement("div");
    div.className = "testimonial-card";
    div.innerHTML = `
            <div class="testimonial-header">
                <img src="assets/image/user/default-avatar.jpg" alt="${name}">
                <div class="testimonial-info">
                    <h4>${name}</h4>
                    <div class="rating">
                        ${createStarRating(rating)}
                    </div>
                </div>
            </div>
            <p>"${content}"</p>
        `;
    return div;
  }

  // Cập nhật hàm createStarRating
  function createStarRating(rating) {
    return `<div class="rating yellow-stars">
        ${Array(5)
          .fill(0)
          .map(
            (_, i) =>
              `<i class="${
                i < rating ? "fas" : "far"
              } fa-star" style="animation-delay: ${i * 0.1}s"></i>`
          )
          .join("")}
    </div>`;
  }

  // Kiểm tra trạng thái đăng nhập khi tải trang
  checkLoginAndShowForm();

  // Lắng nghe sự kiện đăng nhập/đăng xuất
  window.addEventListener("userLoginStatusChanged", checkLoginAndShowForm);
});
