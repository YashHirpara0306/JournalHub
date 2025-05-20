document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const editor = document.getElementById('editor');
    const titleInput = document.getElementById('entryTitle');
    const categoryInput = document.getElementById('entryCategory');
    const wordCount = document.getElementById('wordCount');
    const saveBtn = document.getElementById('saveEntry');
    const deleteBtn = document.getElementById('deleteEntry');
    const entriesList = document.getElementById('entriesList');
    const searchInput = document.getElementById('searchInput');
    const userMenuBtn = document.getElementById('userMenuBtn');
    const userDropdown = document.getElementById('userDropdown');
    const logoutBtn = document.getElementById('logoutBtn');
    const adminSection = document.getElementById('adminSection');
    const username = document.getElementById('username');

    let currentEntry = null;
    let autoSaveTimeout = null;

    // Event Listeners
    editor.addEventListener('input', () => {
        updateWordCount();
        scheduleAutoSave();
    });

    titleInput.addEventListener('input', scheduleAutoSave);
    categoryInput.addEventListener('input', scheduleAutoSave);
    saveBtn.addEventListener('click', saveEntry);
    deleteBtn.addEventListener('click', deleteEntry);
    searchInput.addEventListener('input', debounce(searchEntries, 300));
    userMenuBtn.addEventListener('click', toggleUserMenu);
    logoutBtn.addEventListener('click', logout);

    // Initialize
    loadUserInfo();
    loadEntries();

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
            if (data.roles.includes('ROLE_ADMIN')) {
                adminSection.style.display = 'block';
            }
        })
        .catch(error => {
            console.error('Error loading user info:', error);
            showNotification('Error loading user information', 'error');
        });
    }

    function loadEntries() {
        showLoading();
        fetch('/api/entries', {
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
                throw new Error('Failed to load entries');
            }
            return response.json();
        })
        .then(entries => {
            displayEntries(entries);
            hideLoading();
        })
        .catch(error => {
            console.error('Error loading entries:', error);
            showNotification('Error loading entries', 'error');
            hideLoading();
        });
    }

    function displayEntries(entries) {
        entriesList.innerHTML = '';
        if (entries.length === 0) {
            entriesList.innerHTML = '<div class="no-entries">No entries found</div>';
            return;
        }

        entries.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        entries.forEach(entry => {
            const entryElement = createEntryElement(entry);
            entriesList.appendChild(entryElement);
        });
    }

    function createEntryElement(entry) {
        const div = document.createElement('div');
        div.className = 'entry-item';
        if (currentEntry && currentEntry.id === entry.id) {
            div.classList.add('active');
        }

        const preview = entry.content.substring(0, 100).replace(/<[^>]*>/g, '');
        div.innerHTML = `
            <h3>${sanitizeHTML(entry.title || 'Untitled')}</h3>
            <p class="entry-preview">${sanitizeHTML(preview)}${entry.content.length > 100 ? '...' : ''}</p>
            <div class="entry-meta">
                <span class="category">${sanitizeHTML(entry.category || 'Uncategorized')}</span>
                <span class="date">${new Date(entry.createdAt).toLocaleDateString()}</span>
                <span class="word-count">${entry.wordCount || 0} words</span>
            </div>
        `;

        div.addEventListener('click', () => loadEntry(entry.id));
        return div;
    }

    function loadEntry(id) {
        showLoading();
        fetch(`/api/entries/${id}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            },
            credentials: 'include'
        })
        .then(response => {
            if (!response.ok) throw new Error('Failed to load entry');
            return response.json();
        })
        .then(entry => {
            currentEntry = entry;
            titleInput.value = entry.title || '';
            categoryInput.value = entry.category || '';
            editor.innerHTML = entry.content || '';
            updateWordCount();
            document.querySelectorAll('.entry-item').forEach(item => item.classList.remove('active'));
            document.querySelector(`.entry-item:has(h3:contains('${entry.title}'))`).classList.add('active');
            hideLoading();
        })
        .catch(error => {
            console.error('Error loading entry:', error);
            showNotification('Error loading entry', 'error');
            hideLoading();
        });
    }

    function saveEntry() {
        const content = editor.innerHTML;
        const title = titleInput.value.trim();
        const category = categoryInput.value.trim();

        if (!title && !content) {
            showNotification('Please add a title or content', 'error');
            return;
        }

        const entry = {
            title: title || 'Untitled',
            content: content,
            category: category || 'Uncategorized',
            wordCount: countWords(content)
        };

        const method = currentEntry ? 'PUT' : 'POST';
        const url = currentEntry ? `/api/entries/${currentEntry.id}` : '/api/entries';

        showLoading();
        fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(entry)
        })
        .then(response => {
            if (!response.ok) throw new Error('Failed to save entry');
            return response.json();
        })
        .then(savedEntry => {
            currentEntry = savedEntry;
            showNotification('Entry saved successfully', 'success');
            loadEntries();
        })
        .catch(error => {
            console.error('Error saving entry:', error);
            showNotification('Error saving entry', 'error');
        })
        .finally(() => {
            hideLoading();
        });
    }

    function deleteEntry() {
        if (!currentEntry) {
            showNotification('No entry selected', 'error');
            return;
        }

        if (!confirm('Are you sure you want to delete this entry? This action cannot be undone.')) {
            return;
        }

        showLoading();
        fetch(`/api/entries/${currentEntry.id}`, {
            method: 'DELETE',
            credentials: 'include'
        })
        .then(response => {
            if (!response.ok) throw new Error('Failed to delete entry');
            showNotification('Entry deleted successfully', 'success');
            currentEntry = null;
            titleInput.value = '';
            categoryInput.value = '';
            editor.innerHTML = '';
            updateWordCount();
            loadEntries();
        })
        .catch(error => {
            console.error('Error deleting entry:', error);
            showNotification('Error deleting entry', 'error');
        })
        .finally(() => {
            hideLoading();
        });
    }

    function searchEntries() {
        const searchTerm = searchInput.value.toLowerCase();
        const entries = Array.from(entriesList.children);
        
        entries.forEach(entry => {
            const title = entry.querySelector('h3').textContent.toLowerCase();
            const preview = entry.querySelector('.entry-preview').textContent.toLowerCase();
            const category = entry.querySelector('.category').textContent.toLowerCase();
            
            const matches = title.includes(searchTerm) || 
                           preview.includes(searchTerm) || 
                           category.includes(searchTerm);
            
            entry.style.display = matches ? '' : 'none';
        });

        if (!entries.some(entry => entry.style.display === '')) {
            entriesList.innerHTML = '<div class="no-entries">No matching entries found</div>';
        }
    }

    function updateWordCount() {
        const text = editor.innerText || '';
        const words = countWords(text);
        wordCount.textContent = `${words} words`;
    }

    function countWords(text) {
        return text.trim().split(/\s+/).filter(word => word.length > 0).length;
    }

    function scheduleAutoSave() {
        if (autoSaveTimeout) {
            clearTimeout(autoSaveTimeout);
        }
        autoSaveTimeout = setTimeout(saveEntry, 3000);
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

    // Handle page unload
    window.addEventListener('beforeunload', (e) => {
        if (autoSaveTimeout) {
            const message = 'You have unsaved changes. Are you sure you want to leave?';
            e.returnValue = message;
            return message;
        }
    });

    // Handle keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey || e.metaKey) {
            if (e.key === 's') {
                e.preventDefault();
                saveEntry();
            } else if (e.key === 'n') {
                e.preventDefault();
                currentEntry = null;
                titleInput.value = '';
                categoryInput.value = '';
                editor.innerHTML = '';
                updateWordCount();
                titleInput.focus();
            }
        }
    });
}); 
}); 