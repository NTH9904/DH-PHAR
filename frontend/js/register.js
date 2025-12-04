console.log('📝 Register.js loaded');

async function handleRegister(e) {
    e.preventDefault();
    console.log('=== REGISTER FORM SUBMIT ===');
    
    // Get form values
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    console.log('📝 Form data:', {
        name: name,
        email: email,
        phone: phone,
        passwordLength: password.length,
        confirmPasswordLength: confirmPassword.length
    });

    // Validate passwords match
    if (password !== confirmPassword) {
        console.log('❌ Passwords do not match');
        alert('Mật khẩu xác nhận không khớp');
        return;
    }

    // Validate required fields
    if (!name || !email || !password) {
        console.log('❌ Missing required fields');
        alert('Vui lòng nhập đầy đủ thông tin bắt buộc');
        return;
    }

    // Validate email format
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
        console.log('❌ Invalid email format');
        alert('Email không hợp lệ');
        return;
    }

    // Validate password length
    if (password.length < 6) {
        console.log('❌ Password too short');
        alert('Mật khẩu phải có ít nhất 6 ký tự');
        return;
    }

    // Prepare user data
    const userData = {
        name: name,
        email: email,
        password: password,
        phone: phone || undefined
    };

    console.log('📤 Sending registration request...');
    console.log('User data (without password):', {
        name: userData.name,
        email: userData.email,
        phone: userData.phone
    });

    // Disable submit button
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Đang đăng ký...';

    try {
        // Check if API is available
        if (!window.API || !window.API.auth) {
            throw new Error('API không khả dụng. Vui lòng kiểm tra server đang chạy.');
        }

        console.log('🌐 Calling API.auth.register...');
        const response = await window.API.auth.register(userData);
        
        console.log('📥 Response received:', {
            success: response.success,
            hasToken: !!response.token,
            hasUser: !!response.user
        });

        if (response.success && response.token && response.user) {
            console.log('✅ Registration successful!');
            console.log('User:', response.user);
            
            // Save token and user to localStorage
            console.log('💾 Saving token to localStorage...');
            window.API.setToken(response.token);
            
            console.log('💾 Saving user to localStorage...');
            window.API.setCurrentUser(response.user);
            
            // Show success message with email verification notice
            alert('Đăng ký thành công! Chào mừng ' + response.user.name + '\n\n📧 Vui lòng kiểm tra email để xác thực tài khoản.');
            
            // Redirect to home page
            console.log('🔄 Redirecting to home page...');
            window.location.href = '/pages/index.html';
        } else {
            throw new Error(response.message || 'Đăng ký thất bại');
        }
    } catch (error) {
        console.error('❌ Registration error:', error);
        
        let errorMessage = 'Đăng ký thất bại: ';
        
        if (error.message) {
            errorMessage += error.message;
        } else if (error.toString) {
            errorMessage += error.toString();
        } else {
            errorMessage += 'Lỗi không xác định';
        }
        
        console.log('📢 Showing error to user:', errorMessage);
        alert(errorMessage);
        
        // Re-enable submit button
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 DOM loaded, initializing register form...');
    
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        console.log('✅ Register form found');
        registerForm.addEventListener('submit', handleRegister);
        console.log('✅ Submit handler attached');
    } else {
        console.error('❌ Register form not found!');
    }
    
    // Log API availability
    if (window.API) {
        console.log('✅ API object available');
        console.log('✅ API.auth available:', !!window.API.auth);
    } else {
        console.error('❌ API object not available!');
    }
});
