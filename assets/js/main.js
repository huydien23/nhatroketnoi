// Điều hướng trang
const burger = document.querySelector('.burger');
const nav = document.querySelector('.nav-links');
const navLinks = document.querySelectorAll('.nav-links li');

burger.addEventListener('click', () => {
    // Chuyển đổi điều hướng
    nav.classList.toggle('nav-active');

    // Hiệu ứng chuyển động
    navLinks.forEach((link, index) => {
        if (link.style.animation) {
            link.style.animation = '';
        } else {
            link.style.animation = `navLinkFade 0.5s ease forwards ${index / 7 + 0.3}s`;
        }
    });

    // Hiệu ứng chuyển động
    burger.classList.toggle('toggle');
});

// Hiệu ứng chuyển động
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Hiệu ứng chuyển động
const roomCards = document.querySelectorAll('.room-card');
roomCards.forEach(card => {
    card.addEventListener('mouseenter', () => {
        card.style.transform = 'translateY(-10px)';
    });
    card.addEventListener('mouseleave', () => {
        card.style.transform = 'translateY(0)';
    });
});

// Kiểm tra định dạng form
const forms = document.querySelectorAll('form');
forms.forEach(form => {
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Kiểm tra định dạng form
        const inputs = form.querySelectorAll('input[required]');
        let isValid = true;

        inputs.forEach(input => {
            if (!input.value.trim()) {
                isValid = false;
                input.classList.add('error');
            } else {
                input.classList.remove('error');
            }
        });

        if (isValid) {
            // Ở đây bạn thường sẽ gửi dữ liệu form đến máy chủ
            alert('Form submitted successfully!');
            form.reset();
        } else {
            alert('Please fill in all required fields.');
        }
    });
});

// Nút cuộn lên trên
const scrollBtn = document.createElement('button');
scrollBtn.innerHTML = '↑';
scrollBtn.className = 'scroll-top';
document.body.appendChild(scrollBtn);

window.addEventListener('scroll', () => {
    if (window.pageYOffset > 300) {
        scrollBtn.style.display = 'block';
    } else {
        scrollBtn.style.display = 'none';
    }
});

scrollBtn.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// Thêm một số CSS cho nút cuộn lên trên
const style = document.createElement('style');
style.textContent = `
    .scroll-top {
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: #3498db;
        color: white;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        border: none;
        cursor: pointer;
        display: none;
        font-size: 20px;
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        transition: background-color 0.3s ease;
    }
    .scroll-top:hover {
        background: #2980b9;
    }
`;
document.head.appendChild(style);

// Chatbot functionality
document.addEventListener('DOMContentLoaded', function() {
    const chatbotContainer = document.querySelector('.chatbot-container');
    const chatbotToggle = document.querySelector('.chatbot-toggle');
    const closeChatbot = document.querySelector('.close-chatbot');
    const messageInput = document.querySelector('.chatbot-input input');
    const sendButton = document.querySelector('.send-message');
    const messagesContainer = document.querySelector('.chatbot-messages');
    let isProcessing = false;

    // Toggle chatbot
    chatbotToggle.addEventListener('click', () => {
        chatbotContainer.classList.add('active');
        messageInput.focus(); // Focus input when opening chat
    });

    closeChatbot.addEventListener('click', () => {
        chatbotContainer.classList.remove('active');
    });

    // Handle sending messages
    async function sendMessage() {
        const message = messageInput.value.trim();
        if (message && !isProcessing) {
            isProcessing = true;
            sendButton.disabled = true;
            
            // Add user message
            addMessage(message, 'user');
            messageInput.value = '';

            // Show typing indicator
            const typingIndicator = addTypingIndicator();

            try {
                // Get AI response
                const response = await getAIResponse(message);
                typingIndicator.remove();
                addMessage(response, 'bot');
            } catch (error) {
                console.error('Chatbot Error:', error);
                typingIndicator.remove();
                addMessage('Xin lỗi, tôi đang gặp sự cố. Vui lòng thử lại sau.', 'bot');
            } finally {
                isProcessing = false;
                sendButton.disabled = false;
                messageInput.focus(); // Focus input after sending
            }
        }
    }

    // Add message to chat
    function addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message');
        messageDiv.classList.add(sender === 'user' ? 'user-message' : 'bot-message');
        messageDiv.textContent = text;
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    // Add typing indicator
    function addTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.classList.add('message', 'bot-message', 'typing-indicator');
        typingDiv.innerHTML = '<span></span><span></span><span></span>';
        messagesContainer.appendChild(typingDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        return typingDiv;
    }

    // Event listeners for sending messages
    sendButton.addEventListener('click', sendMessage);
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !isProcessing) {
            sendMessage();
        }
    });

    // Prevent form submission on enter
    messageInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
        }
    });
}); 