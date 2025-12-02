// Sidebar Toggle Functionality
(function() {
    // Create toggle button
    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'sidebar-toggle';
    toggleBtn.innerHTML = '<span class="sidebar-toggle-icon">◀</span>';
    toggleBtn.setAttribute('title', 'Thu gọn/Mở rộng sidebar');
    document.body.appendChild(toggleBtn);

    const sidebar = document.querySelector('.admin-sidebar');
    const content = document.querySelector('.admin-content');

    // Check saved state
    const isCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
    if (isCollapsed) {
        sidebar.classList.add('collapsed');
        content.classList.add('expanded');
        toggleBtn.classList.add('collapsed');
    }

    // Toggle function
    toggleBtn.addEventListener('click', function() {
        const collapsed = sidebar.classList.toggle('collapsed');
        content.classList.toggle('expanded');
        toggleBtn.classList.toggle('collapsed');
        
        // Save state
        localStorage.setItem('sidebarCollapsed', collapsed);
    });

    // Add text wrapping for nav items
    const navLinks = document.querySelectorAll('.admin-nav a');
    navLinks.forEach(link => {
        const text = link.textContent.trim();
        const icon = text.split(' ')[0]; // Get emoji/icon
        const label = text.substring(icon.length).trim();
        link.innerHTML = `${icon} <span>${label}</span>`;
    });
})();
