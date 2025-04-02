// Cấu hình chat bot
const AI_CONFIG = {
    apiEndpoint: 'https://api.openai.com/v1/chat/completions',
    apiKey: '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',
    model: 'gpt-3.5-turbo',
    maxTokens: 150,
    temperature: 0.7
};

// Cấu hình ngữ cảnh cho AI
const AI_CONTEXT = `Bạn là trợ lý AI của website Nhà Trọ Kết Nối, một nền tảng kết nối người thuê với chủ nhà trọ uy tín tại Cần Thơ.
Thông tin quan trọng:
- Giá phòng trọ: 1.5 triệu - 5 triệu/tháng
- Khu vực: Ninh Kiều, Bình Thuỷ, Cái Răng
- Liên hệ: 0123.456.789, huydien23@nhatroketnoi.com
- Địa chỉ: Toàn nhà khu I Đại học Nam Cần Thơ

Hãy trả lời ngắn gọn, thân thiện và hữu ích.`;

// Thêm tin nhắn vào giao diện chat
async function getAIResponse(message) {
    const fallbackResponses = {
        greeting: ['Xin chào! Tôi có thể giúp gì cho bạn?', 'Chào bạn! Bạn cần tìm thông tin gì về nhà trọ?'],
        price: ['Giá phòng trọ trên website chúng tôi dao động từ 1.5 triệu đến 5 triệu/tháng tùy theo vị trí và tiện nghi. Bạn có thể xem chi tiết tại trang danh sách phòng.'],
        location: ['Chúng tôi có nhiều phòng trọ tại các quận Ninh Kiều, Bình Thuỷ, Cái Răng của TP Cần Thơ. Bạn muốn tìm phòng ở khu vực nào?'],
        contact: ['Bạn có thể liên hệ với chúng tôi qua số điện thoại: 0123.456.789 hoặc email: huydien23@nhatroketnoi.com'],
        default: ['Xin lỗi, tôi không hiểu câu hỏi của bạn. Bạn có thể hỏi về giá phòng, địa chỉ, hoặc cách liên hệ với chúng tôi.']
    };

    try {
        // Kiểm tra các từ khóa trong tin nhắn
        const lowerMessage = message.toLowerCase();
        if (lowerMessage.includes('xin chào') || lowerMessage.includes('hello') || lowerMessage.includes('chào')) {
            return fallbackResponses.greeting[Math.floor(Math.random() * fallbackResponses.greeting.length)];
        }
        if (lowerMessage.includes('giá') || lowerMessage.includes('phí')) {
            return fallbackResponses.price[0];
        }
        if (lowerMessage.includes('địa chỉ') || lowerMessage.includes('vị trí')) {
            return fallbackResponses.location[0];
        }
        if (lowerMessage.includes('liên hệ') || lowerMessage.includes('số điện thoại')) {
            return fallbackResponses.contact[0];
        }

        // Gọi API OpenAI để lấy phản hồi
        const response = await fetch(AI_CONFIG.apiEndpoint, {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${AI_CONFIG.apiKey}`
            },
            body: JSON.stringify({
            model: AI_CONFIG.model,
            messages: [
                { role: 'system', content: AI_CONTEXT },
                { role: 'user', content: message }
            ],
            max_tokens: AI_CONFIG.maxTokens,
            temperature: AI_CONFIG.temperature
            })
        });

        if (!response.ok) {
            console.error('API Error:', await response.text());
            throw new Error('API request failed');
        }

        const data = await response.json();
        return data.choices[0].message.content;
    } catch (error) {
        console.error('Error fetching AI response:', error);
        return fallbackResponses.default[0];
    }
}

window.getAIResponse = getAIResponse;
