 //Xử lý chuyển đổi giữa các trang tin tức theo danh mục
document.addEventListener("DOMContentLoaded", function() {
    // Lấy tất cả các nút danh mục
    const categoryButtons = document.querySelectorAll(".category-tag");
    
    // Xác định trang hiện tại để đặt trạng thái active
    const currentPath = window.location.pathname;
    const currentPage = currentPath.split("/").pop();
    
    // Thiết lập trạng thái active cho nút phù hợp
    categoryButtons.forEach(button => {
        const category = button.getAttribute("data-category");
        
        // Thiết lập trạng thái active dựa trên URL hiện tại
        if ((currentPage === "tintuc.html" && category === "all") ||
            (currentPage === `tintuc-${category}.html`)) {
            button.classList.add("active");
        } else {
            button.classList.remove("active");
        }
        
        // Thêm sự kiện click cho nút
        button.addEventListener("click", function(e) {
            e.preventDefault(); // Ngăn chặn hành vi mặc định của thẻ a
            
            // Xóa class active từ tất cả các nút
            categoryButtons.forEach(btn => btn.classList.remove("active"));
            // Thêm class active cho nút được click
            this.classList.add("active");
            
            // Xác định cần chuyển đến trang nào dựa trên vị trí hiện tại và danh mục
            let targetUrl = "";
            
            // Kiểm tra xem đang ở trong thư mục tintuc/ hay ở trang gốc tintuc.html
            const isInSubfolder = currentPath.includes("/tintuc/");
            
            // Xác định danh mục từ nút được nhấp
            const buttonCategory = this.getAttribute("data-category");
            
            // Xây dựng URL đích dựa trên vị trí hiện tại
            if (buttonCategory === "all") {
                // Chuyển đến trang chính tin tức
                targetUrl = isInSubfolder ? "../tintuc.html" : "./tintuc.html";
            } else {
                // Chuyển đến trang danh mục tương ứng
                targetUrl = isInSubfolder ? 
                    `./tintuc-${buttonCategory}.html` : 
                    `./tintuc/tintuc-${buttonCategory}.html`;
            }
            
            // Chuyển hướng đến trang mục tiêu
            window.location.href = targetUrl;
        });
    });
    
    // Tạo hiệu ứng cho nút scroll to top nếu có
    const scrollTopBtn = document.getElementById("scrollTopBtn");
    if (scrollTopBtn) {
        // Hiển thị/ẩn nút dựa trên vị trí cuộn
        window.addEventListener("scroll", function() {
            if (window.pageYOffset > 300) {
                scrollTopBtn.style.display = "block";
                scrollTopBtn.style.opacity = "1";
            } else {
                scrollTopBtn.style.opacity = "0";
                setTimeout(() => {
                    if (window.pageYOffset <= 300) {
                        scrollTopBtn.style.display = "none";
                    }
                }, 300);
            }
        });
        
        // Xử lý sự kiện khi nhấp vào nút
        scrollTopBtn.addEventListener("click", function() {
            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        });
    }
});