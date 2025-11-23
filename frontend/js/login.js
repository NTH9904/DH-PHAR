async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const submitBtn = e.target.querySelector('button[type="submit"]');

    submitBtn.disabled = true;
    submitBtn.textContent = 'Đang đăng nhập...';

    try {
        const response = await window.API.auth.login(email, password);
        window.API.setToken(response.token);
        window.API.setCurrentUser(response.user);

                // Redirect: prefer explicit `redirect` query param, otherwise send admins to admin dashboard
                const redirectParam = new URLSearchParams(window.location.search).get('redirect');
                if (redirectParam) {
                    window.location.href = redirectParam;
                } else if (response.user && response.user.role === 'admin') {
                    window.location.href = '/admin/pages/dashboard.html';
                } else {
                    window.location.href = '/pages/index.html';
                }
    } catch (error) {
        alert('Đăng nhập thất bại: ' + error.message);
        submitBtn.disabled = false;
        submitBtn.textContent = 'Đăng nhập';
    }
}

function loginWithGoogle() {
    // TODO: Implement Google OAuth
    alert('Tính năng đang phát triển');
}

function loginWithFacebook() {
    // TODO: Implement Facebook OAuth
    alert('Tính năng đang phát triển');
}

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    const googleBtn = document.getElementById('googleLoginBtn');
    if (googleBtn) {
        googleBtn.addEventListener('click', loginWithGoogle);
    }

    const fbBtn = document.getElementById('facebookLoginBtn');
    if (fbBtn) {
        fbBtn.addEventListener('click', loginWithFacebook);
    }
});