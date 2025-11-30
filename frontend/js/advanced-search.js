// Advanced Search Logic
let selectedDiseases = [];
let selectedSymptoms = [];
let selectedAge = 0;

// Disease tags
document.getElementById('disease-tags').addEventListener('click', function(e) {
    if (e.target.classList.contains('tag')) {
        const disease = e.target.dataset.disease;
        e.target.classList.toggle('active');
        
        if (e.target.classList.contains('active')) {
            selectedDiseases.push(disease);
        } else {
            selectedDiseases = selectedDiseases.filter(d => d !== disease);
        }
    }
});

// Symptom tags
document.getElementById('symptom-tags').addEventListener('click', function(e) {
    if (e.target.classList.contains('tag')) {
        const symptom = e.target.dataset.symptom;
        e.target.classList.toggle('active');
        
        if (e.target.classList.contains('active')) {
            selectedSymptoms.push(symptom);
        } else {
            selectedSymptoms = selectedSymptoms.filter(s => s !== symptom);
        }
    }
});

// Age slider
const ageSlider = document.getElementById('age-slider');
const ageDisplay = document.getElementById('age-display');

ageSlider.addEventListener('input', function(e) {
    selectedAge = parseInt(e.target.value);
    updateAgeDisplay();
});

function updateAgeDisplay() {
    if (selectedAge === 0) {
        ageDisplay.textContent = 'Tất cả độ tuổi';
    } else if (selectedAge < 2) {
        ageDisplay.textContent = `${selectedAge} tuổi (Trẻ sơ sinh)`;
    } else if (selectedAge < 12) {
        ageDisplay.textContent = `${selectedAge} tuổi (Trẻ em)`;
    } else if (selectedAge < 18) {
        ageDisplay.textContent = `${selectedAge} tuổi (Thiếu niên)`;
    } else if (selectedAge < 60) {
        ageDisplay.textContent = `${selectedAge} tuổi (Người lớn)`;
    } else {
        ageDisplay.textContent = `${selectedAge} tuổi (Người cao tuổi)`;
    }
}

// Search button
document.getElementById('search-btn').addEventListener('click', performSearch);

// Reset button
document.getElementById('reset-btn').addEventListener('click', function() {
    // Reset selections
    selectedDiseases = [];
    selectedSymptoms = [];
    selectedAge = 0;
    
    // Reset UI
    document.querySelectorAll('.tag.active').forEach(tag => {
        tag.classList.remove('active');
    });
    ageSlider.value = 0;
    updateAgeDisplay();
    
    // Clear results
    document.getElementById('search-results').innerHTML = '';
});

async function performSearch() {
    const resultsContainer = document.getElementById('search-results');
    
    // Validate
    if (selectedDiseases.length === 0 && selectedSymptoms.length === 0 && selectedAge === 0) {
        resultsContainer.innerHTML = `
            <div class="alert alert-warning">
                Vui lòng chọn ít nhất một tiêu chí tìm kiếm
            </div>
        `;
        return;
    }
    
    // Show loading
    resultsContainer.innerHTML = `
        <div class="text-center">
            <div class="spinner"></div>
            <p>Đang tìm kiếm...</p>
        </div>
    `;
    
    try {
        // Build search query
        const searchTerms = [...selectedDiseases, ...selectedSymptoms].join(' ');
        
        // Call API
        const response = await window.API.products.getAll({
            search: searchTerms,
            limit: 50
        });
        
        let products = response.data || [];
        
        // Filter by age if selected
        if (selectedAge > 0) {
            products = products.filter(product => {
                if (!product.ageGroup) return true; // No age restriction
                
                const min = product.ageGroup.min || 0;
                const max = product.ageGroup.max || 999;
                
                return selectedAge >= min && selectedAge <= max;
            });
        }
        
        // Display results
        if (products.length === 0) {
            resultsContainer.innerHTML = `
                <div class="alert alert-info">
                    <h3>Không tìm thấy sản phẩm phù hợp</h3>
                    <p>Vui lòng thử lại với tiêu chí khác hoặc liên hệ dược sĩ để được tư vấn.</p>
                    <a href="/pages/consultation.html" class="btn btn-primary">Tư vấn dược sĩ</a>
                </div>
            `;
            return;
        }
        
        resultsContainer.innerHTML = `
            <h2 style="margin-bottom: 20px;">
                Tìm thấy ${products.length} sản phẩm phù hợp
            </h2>
            <div class="products-grid">
                ${products.map(product => renderProductCard(product)).join('')}
            </div>
        `;
        
        // Add to cart handlers
        attachCartHandlers();
        
    } catch (error) {
        console.error('Search error:', error);
        resultsContainer.innerHTML = `
            <div class="alert alert-danger">
                Có lỗi xảy ra khi tìm kiếm. Vui lòng thử lại sau.
            </div>
        `;
    }
}

function renderProductCard(product) {
    const imageUrl = product.images?.[0]?.url || 'https://via.placeholder.com/300x300?text=No+Image';
    const price = product.price?.toLocaleString('vi-VN') || '0';
    const originalPrice = product.originalPrice?.toLocaleString('vi-VN');
    
    return `
        <div class="product-card">
            <a href="/pages/product-detail.html?id=${product._id}">
                <img src="${imageUrl}" alt="${product.name}">
            </a>
            <div class="product-info">
                <h3 class="product-name">
                    <a href="/pages/product-detail.html?id=${product._id}">${product.name}</a>
                </h3>
                ${product.genericName ? `<p class="product-generic">${product.genericName}</p>` : ''}
                ${product.ageGroup?.description ? `
                    <span class="badge" style="background: #17a2b8; color: white; font-size: 12px; padding: 4px 8px; border-radius: 4px; display: inline-block; margin: 5px 0;">
                        ${product.ageGroup.description}
                    </span>
                ` : ''}
                <div class="product-price">
                    <span class="price">${price} đ</span>
                    ${originalPrice ? `<span class="original-price">${originalPrice} đ</span>` : ''}
                </div>
                <button class="btn btn-primary btn-block add-to-cart-btn" data-product-id="${product._id}">
                    🛒 Thêm vào giỏ
                </button>
            </div>
        </div>
    `;
}

function attachCartHandlers() {
    document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const productId = this.dataset.productId;
            window.Cart.addToCart(productId, 1);
            
            // Show feedback
            this.textContent = '✅ Đã thêm';
            this.disabled = true;
            setTimeout(() => {
                this.textContent = '🛒 Thêm vào giỏ';
                this.disabled = false;
            }, 2000);
        });
    });
}

// Initialize
updateAgeDisplay();
