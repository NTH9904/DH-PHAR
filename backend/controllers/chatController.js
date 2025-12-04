const ChatMessage = require('../models/ChatMessage');

// @desc    Send message
// @route   POST /api/chat/message
// @access  Public
exports.sendMessage = async (req, res) => {
  try {
    const { sessionId, message, userName, userEmail, userPhone } = req.body;

    if (!sessionId || !message) {
      return res.status(400).json({
        success: false,
        message: 'Session ID và nội dung tin nhắn là bắt buộc'
      });
    }

    // Find or create chat session
    let chat = await ChatMessage.findOne({ sessionId });

    if (!chat) {
      chat = new ChatMessage({
        sessionId,
        userName: userName || 'Khách',
        userEmail,
        userPhone,
        userId: req.user ? req.user._id : null,
        messages: []
      });
    }

    // Add user message
    chat.messages.push({
      sender: 'user',
      content: message,
      timestamp: new Date()
    });

    // Generate bot response
    const botResponse = generateBotResponse(message);
    
    chat.messages.push({
      sender: 'bot',
      content: botResponse,
      timestamp: new Date()
    });

    chat.lastMessageAt = new Date();
    await chat.save();

    res.status(200).json({
      success: true,
      data: {
        userMessage: chat.messages[chat.messages.length - 2],
        botMessage: chat.messages[chat.messages.length - 1]
      }
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi gửi tin nhắn'
    });
  }
};

// @desc    Get chat history
// @route   GET /api/chat/history/:sessionId
// @access  Public
exports.getChatHistory = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const chat = await ChatMessage.findOne({ sessionId });

    if (!chat) {
      return res.status(200).json({
        success: true,
        data: {
          messages: []
        }
      });
    }

    res.status(200).json({
      success: true,
      data: {
        messages: chat.messages,
        userName: chat.userName
      }
    });
  } catch (error) {
    console.error('Error getting chat history:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy lịch sử chat'
    });
  }
};

// @desc    Get all chats (Admin)
// @route   GET /api/chat/all
// @access  Private/Admin
exports.getAllChats = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const query = {};
    if (status) query.status = status;

    const chats = await ChatMessage.find(query)
      .sort({ lastMessageAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await ChatMessage.countDocuments(query);

    res.status(200).json({
      success: true,
      data: chats,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Error getting all chats:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách chat'
    });
  }
};

// @desc    Update chat status
// @route   PUT /api/chat/:sessionId/status
// @access  Private/Admin
exports.updateChatStatus = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { status } = req.body;

    const chat = await ChatMessage.findOneAndUpdate(
      { sessionId },
      { status },
      { new: true }
    );

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy chat'
      });
    }

    res.status(200).json({
      success: true,
      data: chat
    });
  } catch (error) {
    console.error('Error updating chat status:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật trạng thái chat'
    });
  }
};

// Bot response generator
function generateBotResponse(message) {
  const lowerMessage = message.toLowerCase();

  // Tư vấn thuốc
  if (lowerMessage.includes('thuốc') || lowerMessage.includes('tư vấn')) {
    return 'Tôi có thể giúp bạn tư vấn về thuốc. Bạn đang tìm thuốc gì hoặc có triệu chứng gì? Để được tư vấn chi tiết hơn, vui lòng liên hệ dược sĩ qua Zalo hoặc hotline 0344864576.';
  }

  // Giá cả
  if (lowerMessage.includes('giá') || lowerMessage.includes('bao nhiêu')) {
    return 'Để biết giá chính xác của sản phẩm, bạn có thể tìm kiếm trên website hoặc liên hệ hotline 0344864576. Chúng tôi cam kết giá tốt nhất thị trường!';
  }

  // Đơn hàng
  if (lowerMessage.includes('đơn hàng') || lowerMessage.includes('order') || lowerMessage.includes('kiểm tra')) {
    return 'Để kiểm tra đơn hàng, vui lòng cung cấp mã đơn hàng hoặc số điện thoại đặt hàng. Bạn cũng có thể đăng nhập vào tài khoản để xem chi tiết đơn hàng.';
  }

  // Giao hàng
  if (lowerMessage.includes('giao hàng') || lowerMessage.includes('ship') || lowerMessage.includes('vận chuyển')) {
    return 'Chúng tôi giao hàng nhanh trong 2-4 giờ tại nội thành. Miễn phí ship cho đơn hàng trên 500.000đ. Các khu vực khác từ 1-3 ngày.';
  }

  // Liên hệ
  if (lowerMessage.includes('liên hệ') || lowerMessage.includes('hotline') || lowerMessage.includes('zalo')) {
    return 'Bạn có thể liên hệ với chúng tôi qua:\n📞 Hotline: 0344864576\n💬 Zalo: 0344864576\n📧 Email: dhpharmacy@gmail.com\nChúng tôi hỗ trợ 24/7!';
  }

  // Chào hỏi
  if (lowerMessage.includes('xin chào') || lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
    return 'Xin chào! Tôi là trợ lý ảo của DH Pharmacy. Tôi có thể giúp bạn tư vấn về thuốc, kiểm tra đơn hàng, hoặc giải đáp thắc mắc. Bạn cần hỗ trợ gì?';
  }

  // Cảm ơn
  if (lowerMessage.includes('cảm ơn') || lowerMessage.includes('thanks') || lowerMessage.includes('thank you')) {
    return 'Rất vui được hỗ trợ bạn! Nếu có thêm câu hỏi, đừng ngại liên hệ nhé. Chúc bạn sức khỏe! 💊';
  }

  // Default response
  return 'Cảm ơn bạn đã liên hệ! Để được hỗ trợ tốt nhất, vui lòng:\n• Liên hệ dược sĩ qua Zalo: 0344864576\n• Gọi hotline: 0344864576\n• Hoặc mô tả chi tiết vấn đề của bạn để tôi có thể hỗ trợ tốt hơn.';
}

module.exports = exports;
