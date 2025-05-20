document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const userSearchInput = document.getElementById('userSearchInput');
    const roleFilter = document.getElementById('roleFilter');
    const usersTableBody = document.getElementById('usersTableBody');
    const totalUsers = document.getElementById('totalUsers');
    const totalEntries = document.getElementById('totalEntries');
    const createAdminBtn = document.getElementById('createAdminBtn');
    const createAdminModal = document.getElementById('createAdminModal');
    const newAdminUsername = document.getElementById('newAdminUsername');
    const newAdminPassword = document.getElementById('newAdminPassword');
    const confirmCreateAdmin = document.getElementById('confirmCreateAdmin');
    const cancelCreateAdmin = document.getElementById('cancelCreateAdmin');
    const closeModal = document.querySelector('.close-modal');
    const userMenuBtn = document.getElementById('userMenuBtn');
    const userDropdown = document.getElementById('userDropdown');
    const logoutBtn = document.getElementById('logoutBtn');
    const username = document.getElementById('username');

    let users = [];

    // Event Listeners
    userSearchInput.addEventListener('input', debounce(filterUsers, 300));
    roleFilter.addEventListener('change', filterUsers);
    createAdminBtn.addEventListener('click', () => createAdminModal.style.display = 'block');
    confirmCreateAdmin.addEventListener('click', createAdminUser);
    cancelCreateAdmin.addEventListener('click', () => createAdminModal.style.display = 'none');
    closeModal.addEventListener('click', () => createAdminModal.style.display = 'none');
    userMenuBtn.addEventListener('click', toggleUserMenu);
    logoutBtn.addEventListener('click', logout);

    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === createAdminModal) {
            createAdminModal.style.display = 'none';
        }
    });

    // Initialize
    loadUserInfo();
    loadUsers();

    function loadUserInfo() {
        fetch('/api/user/info', {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            },
            credentials: 'include'
        })
        .then(response => response.json())
        .then(data => {
            username.textContent = data.username;
        })
        .catch(error => {
            console.error('Error loading user info:', error);
        });
    }

    function loadUsers() {
        showLoading();
        fetch('/admin/all-users', {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            },
            credentials: 'include'
        })
        .then(response => {
            if (!response.ok) {
                if (response.status === 401) {
                    window.location.href = '/login.html';
                    return;
                }
                throw new Error('Failed to load users');
            }
            return response.json();
        })
        .then(data => {
            users = data;
            updateStats();
            displayUsers(users);
            hideLoading();
        })
        .catch(error => {
            console.error('Error loading users:', error);
            showNotification('Error loading users', 'error');
            hideLoading();
        });
    }

    function updateStats() {
        totalUsers.textContent = users.length;
        const entriesCount = users.reduce((total, user) => total + (user.journalEntries?.length || 0), 0);
        totalEntries.textContent = entriesCount;
    }

    function displayUsers(usersToDisplay) {
        usersTableBody.innerHTML = '';
        usersToDisplay.forEach(user => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${sanitizeHTML(user.username)}</td>
                <td>
                    <span class="user-role ${user.roles.includes('ADMIN') ? 'admin' : 'user'}">
                        ${user.roles.includes('ADMIN') ? 'Admin' : 'User'}
                    </span>
                </td>
                <td>${user.journalEntries?.length || 0}</td>
                <td>${user.lastActive ? new Date(user.lastActive).toLocaleString() : 'Never'}</td>
                <td class="user-actions">
                    <button class="action-btn view" onclick="viewUserEntries('${user.id}')">
                        <i class="fas fa-eye"></i> View
                    </button>
                    ${!user.roles.includes('ADMIN') ? `
                        <button class="action-btn delete" onclick="deleteUser('${user.id}')">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    ` : ''}
                </td>
            `;
            usersTableBody.appendChild(tr);
        });
    }

    function filterUsers() {
        const searchTerm = userSearchInput.value.toLowerCase();
        const roleValue = roleFilter.value;

        const filteredUsers = users.filter(user => {
            const matchesSearch = user.username.toLowerCase().includes(searchTerm);
            const matchesRole = roleValue === 'all' || 
                (roleValue === 'ADMIN' && user.roles.includes('ADMIN')) ||
                (roleValue === 'USER' && !user.roles.includes('ADMIN'));
            return matchesSearch && matchesRole;
        });

        displayUsers(filteredUsers);
    }

    function createAdminUser() {
        const username = newAdminUsername.value.trim();
        const password = newAdminPassword.value.trim();

        if (!username || !password) {
            showNotification('Please fill in all fields', 'error');
            return;
        }

        showLoading();
        fetch('/admin/create-admin-user', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({ username, password, roles: ['ADMIN'] })
        })
        .then(response => {
            if (!response.ok) throw new Error('Failed to create admin user');
            showNotification('Admin user created successfully', 'success');
            createAdminModal.style.display = 'none';
            newAdminUsername.value = '';
            newAdminPassword.value = '';
            loadUsers();
        })
        .catch(error => {
            console.error('Error creating admin user:', error);
            showNotification('Error creating admin user', 'error');
        })
        .finally(() => {
            hideLoading();
        });
    }

    function viewUserEntries(userId) {
        showLoading();
        fetch(`/admin/user/${userId}/entries`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            },
            credentials: 'include'
        })
        .then(response => {
            if (!response.ok) throw new Error('Failed to load user entries');
            return response.json();
        })
        .then(entries => {
            // TODO: Display entries in a modal or new page
            console.log('User entries:', entries);
            hideLoading();
        })
        .catch(error => {
            console.error('Error loading user entries:', error);
            showNotification('Error loading user entries', 'error');
            hideLoading();
        });
    }

    function deleteUser(userId) {
        if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            return;
        }

        showLoading();
        fetch(`/admin/user/${userId}`, {
            method: 'DELETE',
            credentials: 'include'
        })
        .then(response => {
            if (!response.ok) throw new Error('Failed to delete user');
            showNotification('User deleted successfully', 'success');
            loadUsers();
        })
        .catch(error => {
            console.error('Error deleting user:', error);
            showNotification('Error deleting user', 'error');
        })
        .finally(() => {
            hideLoading();
        });
    }

    function toggleUserMenu() {
        const isVisible = userDropdown.style.display === 'block';
        userDropdown.style.display = isVisible ? 'none' : 'block';
    }

    function logout() {
        fetch('/logout', {
            method: 'POST',
            credentials: 'include'
        })
        .then(() => {
            window.location.href = '/login.html';
        })
        .catch(error => {
            console.error('Error logging out:', error);
            showNotification('Error logging out', 'error');
        });
    }

    function showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        const container = document.getElementById('notificationContainer');
        container.appendChild(notification);

        // Remove old notifications
        while (container.children.length > 3) {
            container.removeChild(container.firstChild);
        }

        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }

    function showLoading() {
        document.body.classList.add('loading');
    }

    function hideLoading() {
        document.body.classList.remove('loading');
    }

    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    function sanitizeHTML(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}); 