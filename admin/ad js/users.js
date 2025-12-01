// Admin Users scripts
async function loadUsers() {
  try {
    // Replace with API call when available
    // const usersResponse = await window.API.users.getAll();
    // const users = usersResponse.data || [];
    // TODO: render users into #users-list
  } catch (error) {
    console.error('Error loading users:', error);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadUsers);
} else {
  loadUsers();
}
