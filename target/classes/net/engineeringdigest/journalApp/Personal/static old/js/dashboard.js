document.addEventListener('DOMContentLoaded', function() {
    // Initialize variables
    let currentEntry = null;
    const searchInput = document.getElementById('searchInput');
    const entriesList = document.getElementById('entriesList');
    const titleInput = document.getElementById('titleInput');
    const contentInput = document.getElementById('contentInput');
    const saveBtn = document.getElementById('saveBtn');
    const deleteBtn = document.getElementById('deleteBtn');
    const newEntryBtn = document.getElementById('newEntryBtn');
    const newEntryModal = document.getElementById('newEntryModal');
    const createEntryBtn = document.getElementById('createEntryBtn');
    const cancelEntryBtn = document.getElementById('cancelEntryBtn');
    const logoutBtn = document.getElementById('logoutBtn');

    // Fetch entries on load
    fetchEntries();

    // Event Listeners
    searchInput.addEventListener('input', filterEntries);
    saveBtn.addEventListener('click', saveCurrentEntry);
    deleteBtn.addEventListener('click', deleteCurrentEntry);
    newEntryBtn.addEventListener('click', () => newEntryModal.style.display = 'block');
    cancelEntryBtn.addEventListener('click', () => newEntryModal.style.display = 'none');
    createEntryBtn.addEventListener('click', createNewEntry);
    logoutBtn.addEventListener('click', logout);

    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === newEntryModal) {
            newEntryModal.style.display = 'none';
        }
    });

    function fetchEntries() {
        fetch('/journal', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        })
        .then(response => response.json())
        .then(entries => {
            displayEntries(entries);
        })
        .catch(error => {
            console.error('Error fetching entries:', error);
            if (error.status === 401) {
                window.location.href = '/login.html';
            }
        });
    }

    function displayEntries(entries) {
        entriesList.innerHTML = '';
        entries.forEach(entry => {
            const entryElement = document.createElement('div');
            entryElement.className = 'entry-item';
            entryElement.innerHTML = `
                <h3>${entry.title}</h3>
                <p>${entry.content.substring(0, 50)}...</p>
                <small>${new Date(entry.date).toLocaleDateString()}</small>
            `;
            entryElement.addEventListener('click', () => loadEntry(entry));
            entriesList.appendChild(entryElement);
        });
    }

    function loadEntry(entry) {
        currentEntry = entry;
        titleInput.value = entry.title;
        contentInput.value = entry.content;
        
        // Update active state
        document.querySelectorAll('.entry-item').forEach(item => item.classList.remove('active'));
        event.currentTarget.classList.add('active');
    }

    function filterEntries() {
        const searchTerm = searchInput.value.toLowerCase();
        const entryItems = document.querySelectorAll('.entry-item');
        
        entryItems.forEach(item => {
            const title = item.querySelector('h3').textContent.toLowerCase();
            const content = item.querySelector('p').textContent.toLowerCase();
            
            if (title.includes(searchTerm) || content.includes(searchTerm)) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });
    }

    function saveCurrentEntry() {
        if (!currentEntry) return;

        const updatedEntry = {
            title: titleInput.value,
            content: contentInput.value
        };

        fetch(`/journal/id/${currentEntry.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(updatedEntry)
        })
        .then(response => response.json())
        .then(() => {
            fetchEntries();
            showNotification('Entry saved successfully!');
        })
        .catch(error => {
            console.error('Error saving entry:', error);
            showNotification('Error saving entry', 'error');
        });
    }

    function createNewEntry() {
        const newEntry = {
            title: document.getElementById('newEntryTitle').value,
            content: document.getElementById('newEntryContent').value
        };

        fetch('/journal', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(newEntry)
        })
        .then(response => response.json())
        .then(() => {
            newEntryModal.style.display = 'none';
            document.getElementById('newEntryTitle').value = '';
            document.getElementById('newEntryContent').value = '';
            fetchEntries();
            showNotification('New entry created successfully!');
        })
        .catch(error => {
            console.error('Error creating entry:', error);
            showNotification('Error creating entry', 'error');
        });
    }

    function deleteCurrentEntry() {
        if (!currentEntry || !confirm('Are you sure you want to delete this entry?')) return;

        fetch(`/journal/id/${currentEntry.id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        })
        .then(() => {
            currentEntry = null;
            titleInput.value = '';
            contentInput.value = '';
            fetchEntries();
            showNotification('Entry deleted successfully!');
        })
        .catch(error => {
            console.error('Error deleting entry:', error);
            showNotification('Error deleting entry', 'error');
        });
    }

    function showNotification(message, type = 'success') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);

        // Remove notification after 3 seconds
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    function logout() {
        // Clear any stored credentials
        document.cookie = 'JSESSIONID=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        window.location.href = '/';
    }
}); 