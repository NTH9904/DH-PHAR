(function(){
    async function loadProfile() {
        try {
            const response = await window.API.auth.getMe();
            const user = response.user;

            document.getElementById('name').value = user.name || '';
            document.getElementById('email').value = user.email || '';
            document.getElementById('phone').value = user.phone || '';

            await loadAddresses();
        } catch (error) {
            console.error('Error loading profile:', error);
            if (error.message && error.message.includes('401')) {
                window.location.href = '/pages/login.html';
            }
        }
    }

    async function loadAddresses() {
        try {
            const response = await window.API.users.getAddresses();
            const addresses = response.data || [];
            const container = document.getElementById('addresses-list');

            if (addresses.length === 0) {
                container.innerHTML = '<p>Chưa có địa chỉ nào</p>';
                return;
            }

            container.innerHTML = addresses.map((addr) => `
                <div class="card" style="margin-bottom: 16px;">
                    <div class="card-body">
                        <div style="display: flex; justify-content: space-between; align-items: start;">
                            <div>
                                <strong>${addr.name}</strong>
                                ${addr.isDefault ? '<span class="badge badge-primary">Mặc định</span>' : ''}
                                <p style="margin-top: 8px; margin-bottom: 0;">${addr.address}, ${addr.ward}, ${addr.district}, ${addr.city}</p>
                                <p style="margin-top: 4px; color: var(--text-light);">${addr.phone}</p>
                            </div>
                            <div>
                                <button class="btn btn-sm btn-outline" data-action="edit-address" data-id="${addr._id}">Sửa</button>
                                <button class="btn btn-sm btn-outline" data-action="delete-address" data-id="${addr._id}" style="color: var(--error-color);">Xóa</button>
                            </div>
                        </div>
                    </div>
                </div>
            `).join('');

            // attach listeners
            container.querySelectorAll('button[data-action="edit-address"]').forEach(b => {
                b.addEventListener('click', () => editAddress(b.dataset.id));
            });
            container.querySelectorAll('button[data-action="delete-address"]').forEach(b => {
                b.addEventListener('click', () => deleteAddress(b.dataset.id));
            });
        } catch (error) {
            console.error('Error loading addresses:', error);
        }
    }

    async function updateProfile(e) {
        e.preventDefault();
        try {
            await window.API.auth.updateProfile({
                name: document.getElementById('name').value,
                phone: document.getElementById('phone').value
            });
            alert('Cập nhật thành công!');
        } catch (error) {
            alert('Cập nhật thất bại: ' + (error.message || error));
        }
    }

    async function changePassword(e) {
        e.preventDefault();
        const newPassword = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-new-password').value;

        if (newPassword !== confirmPassword) {
            alert('Mật khẩu xác nhận không khớp');
            return;
        }

        try {
            await window.API.auth.changePassword(
                document.getElementById('current-password').value,
                newPassword
            );
            alert('Đổi mật khẩu thành công!');
            document.getElementById('password-form').reset();
        } catch (error) {
            alert('Đổi mật khẩu thất bại: ' + (error.message || error));
        }
    }

    function showAddAddressForm() {
        const name = prompt('Họ tên:');
        const phone = prompt('Số điện thoại:');
        const address = prompt('Địa chỉ:');
        const ward = prompt('Phường/Xã:');
        const district = prompt('Quận/Huyện:');
        const city = prompt('Thành phố:');

        if (name && phone && address && ward && district && city) {
            window.API.users.addAddress({
                name, phone, address, ward, district, city
            }).then(() => {
                loadAddresses();
            }).catch(error => {
                alert('Thêm địa chỉ thất bại: ' + (error.message || error));
            });
        }
    }

    async function deleteAddress(addressId) {
        if (confirm('Bạn có chắc muốn xóa địa chỉ này?')) {
            try {
                await window.API.users.deleteAddress(addressId);
                loadAddresses();
            } catch (error) {
                alert('Xóa địa chỉ thất bại: ' + (error.message || error));
            }
        }
    }

    // basic editAddress implementation (prompt-based)
    function editAddress(addressId) {
        // load addresses to get data
        window.API.users.getAddresses().then(res => {
            const addr = (res.data || []).find(a => a._id === addressId);
            if (!addr) return alert('Không tìm thấy địa chỉ');

            const name = prompt('Họ tên:', addr.name) || addr.name;
            const phone = prompt('Số điện thoại:', addr.phone) || addr.phone;
            const address = prompt('Địa chỉ:', addr.address) || addr.address;
            const ward = prompt('Phường/Xã:', addr.ward) || addr.ward;
            const district = prompt('Quận/Huyện:', addr.district) || addr.district;
            const city = prompt('Thành phố:', addr.city) || addr.city;

            window.API.users.updateAddress(addressId, { name, phone, address, ward, district, city })
                .then(() => loadAddresses())
                .catch(err => alert('Cập nhật địa chỉ thất bại: ' + (err.message || err)));
        }).catch(err => console.error(err));
    }

    // Initialize
    document.addEventListener('DOMContentLoaded', () => {
        // attach form listeners
        const profileForm = document.getElementById('profile-form');
        if (profileForm) profileForm.addEventListener('submit', updateProfile);
        const passwordForm = document.getElementById('password-form');
        if (passwordForm) passwordForm.addEventListener('submit', changePassword);
        const addBtn = document.querySelector('button[data-action="add-address"]');
        if (addBtn) addBtn.addEventListener('click', showAddAddressForm);

        loadProfile();
    });
})();