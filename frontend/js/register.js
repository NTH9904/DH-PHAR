async function handleRegister(e) {
    e.preventDefault();
    
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    if (password !== confirmPassword) {
        alert('Mật khẩu xác nhận không khớp');
        return;
    }

    const userData = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        password: password
    };

    const submitBtn = e.target.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Đang đăng ký...';

    try {
        const response = await window.API.auth.register(userData);
        window.API.setToken(response.token);
        window.API.setCurrentUser(response.user);
        
        alert('Đăng ký thành công!');
        window.location.href = '/pages/index.html';
    } catch (error) {
        alert('Đăng ký thất bại: ' + error.message);
        submitBtn.disabled = false;
        submitBtn.textContent = 'Đăng ký';
    }
}