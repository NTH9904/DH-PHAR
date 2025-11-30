// Script to fix cart items that have slug instead of product ID
// Run this in browser console if you have cart issues

async function fixCart() {
    console.log('🔧 Fixing cart...');
    
    const cart = window.Cart.getCart();
    console.log('Current cart:', cart);
    
    if (cart.items.length === 0) {
        console.log('✅ Cart is empty, nothing to fix');
        return;
    }
    
    const fixedItems = [];
    
    for (const item of cart.items) {
        try {
            // Try to get product by ID first
            let product;
            try {
                const response = await window.API.products.getById(item.productId);
                product = response.data;
                console.log(`✅ Item ${item.productId} is already correct`);
                fixedItems.push(item);
            } catch (err) {
                // If failed, it might be a slug, try to get by slug
                console.log(`⚠️ Item ${item.productId} might be a slug, trying to fix...`);
                const response = await window.API.products.getBySlug(item.productId);
                product = response.data;
                
                // Add with correct ID
                fixedItems.push({
                    productId: product._id,
                    quantity: item.quantity
                });
                console.log(`✅ Fixed: ${item.productId} → ${product._id}`);
            }
        } catch (error) {
            console.error(`❌ Could not fix item ${item.productId}:`, error);
        }
    }
    
    // Save fixed cart
    const newCart = { items: fixedItems };
    window.Cart.saveCart(newCart);
    window.Cart.updateCartUI();
    
    console.log('✅ Cart fixed!', newCart);
    console.log('Please refresh the page');
}

// Auto-run if this script is loaded
if (typeof window !== 'undefined' && window.Cart && window.API) {
    console.log('Cart fix script loaded. Run fixCart() to fix your cart.');
}
