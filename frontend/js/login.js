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

                // Redirect: prefer explicit `redirect` query param, otherwise send to appropriate page
                const redirectParam = new URLSearchParams(window.location.search).get('redirect');
                if (redirectParam) {
                    window.location.href = redirectParam;
                } else if (response.user && response.user.role === 'admin') {
                    window.location.href = '/admin/pages/dashboard.html';
                } else if (response.user && response.user.role === 'pharmacist') {
                    window.location.href = '/admin/pages/prescriptions.html';
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
    // Redirect to Google OAuth
    window.location.href = '/api/auth/google';
}

function loginWithFacebook() {
    // Redirect to Facebook OAuth
    window.location.href = '/api/auth/facebook';
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