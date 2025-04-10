 //Xử lý chuyển đổi giữa các trang tin tức theo danh mục
document.addEventListener("DOMContentLoaded", function() {
    // Lấy tất cả các nút danh mục
    const categoryButtons = document.querySelectorAll(".category-btn");
    
    // Xác định trang hiện tại để đặt trạng thái active
    const currentPath = window.location.pathname;
    const currentPage = currentPath.split("/").pop();
    
    // Thiết lập trạng thái active cho nút phù hợp
    categoryButtons.forEach(button => {
        // Lấy danh mục từ thuộc tính data hoặc văn bản
        const category = button.getAttribute("data-category") || 
                         button.textContent.trim().toLowerCase();
        
        // Thiết lập trạng thái active dựa trên URL hiện tại
        if ((currentPage === "tintuc.html" && (category === "all" || category === "tất cả")) ||
            (currentPage === `tintuc-${category}.html`) ||
            (currentPage === `tintuc-thitruong.html` && category === "thị trường") ||
            (currentPage === `tintuc-meohay.html` && category === "mẹo hay") ||
            (currentPage === `tintuc-phaply.html` && category === "pháp lý") ||
            (currentPage === `tintuc-doisong.html` && category === "đời sống")) {
            button.classList.add("active");
        } else {
            button.classList.remove("active");
        }
        
        // Thêm sự kiện click cho nút
        button.addEventListener("click", function() {
            // Xác định cần chuyển đến trang nào dựa trên vị trí hiện tại và danh mục
            let targetUrl = "";
            
            // Kiểm tra xem đang ở trong thư mục tintuc/ hay ở trang gốc tintuc.html
            const isInSubfolder = currentPath.includes("/tintuc/");
            
            // Xác định danh mục từ nút được nhấp
            const buttonCategory = this.getAttribute("data-category") || 
                                   this.textContent.trim().toLowerCase();
            
            // Xây dựng URL đích dựa trên vị trí hiện tại
            if (buttonCategory === "all" || buttonCategory === "tất cả") {
                // Chuyển đến trang chính tin tức
                targetUrl = isInSubfolder ? "../tintuc.html" : "./tintuc.html";
            } else {
                // Chuyển đến trang danh mục tương ứng
                let categorySlug = "";
                
                // Ánh xạ tên danh mục tiếng Việt sang slug
                if (buttonCategory === "thị trường" || buttonCategory === "thitruong") {
                    categorySlug = "thitruong";
                } else if (buttonCategory === "mẹo hay" || buttonCategory === "meohay") {
                    categorySlug = "meohay";
                } else if (buttonCategory === "pháp lý" || buttonCategory === "phaply") {
                    categorySlug = "phaply";
                } else if (buttonCategory === "đời sống" || buttonCategory === "doisong") {
                    categorySlug = "doisong";
                } else {
                    categorySlug = buttonCategory; // Trường hợp đã có slug sẵn
                }
                
                // Tạo URL tương ứng
                targetUrl = isInSubfolder ? 
                    `./tintuc-${categorySlug}.html` : 
                    `./tintuc/tintuc-${categorySlug}.html`;
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