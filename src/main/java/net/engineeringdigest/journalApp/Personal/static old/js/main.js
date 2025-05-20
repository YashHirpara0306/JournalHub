// DOM Elements
const preloader = document.getElementById('preloader');
const landingSection = document.getElementById('landingSection');
const userDashboard = document.getElementById('userDashboard');
const adminDashboard = document.getElementById('adminDashboard');
const authModal = document.getElementById('authModal');

// State
let currentUser = null;
let isAdmin = false;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Hide preloader
    setTimeout(() => {
        preloader.style.display = 'none';
    }, 1000);

    // Check for existing session
    const token = localStorage.getItem('authToken');
    if (token) {
        checkAuthStatus();
    }
});

// Auth Modal
function showAuthModal(form = 'login') {
    authModal.style.display = 'block';
    toggleAuthForm(form);
}

function closeAuthModal() {
    authModal.style.display = 'none';
}

function toggleAuthForm(form) {
    document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
    document.getElementById(`${form}Form`).classList.add('active');
}

// Navigation
function showSection(section) {
    [landingSection, userDashboard, adminDashboard].forEach(s => s.style.display = 'none');
    section.style.display = 'block';
}

function scrollToFeatures() {
    document.getElementById('features').scrollIntoView({ behavior: 'smooth' });
}

// Toast Notifications
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        <span>${message}</span>
    `;
    
    document.getElementById('toastContainer').appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Auth Status Check
async function checkAuthStatus() {
    try {
        const response = await fetch('/journal', {
            headers: {
                'Authorization': `Basic ${localStorage.getItem('authToken')}`
            }
        });

        if (response.ok) {
            const user = await response.json();
            currentUser = user;
            isAdmin = user.roles.includes('ADMIN');
            
            if (isAdmin) {
                showSection(adminDashboard);
                document.getElementById('adminDisplayName').textContent = user.username;
                loadAdminDashboard();
            } else {
                showSection(userDashboard);
                document.getElementById('userDisplayName').textContent = user.username;
                loadUserDashboard();
            }
        } else {
            logout();
        }
    } catch (error) {
        console.error('Auth check failed:', error);
        logout();
    }
}

// Logout
function logout() {
    localStorage.removeItem('authToken');
    currentUser = null;
    isAdmin = false;
    showSection(landingSection);
    showToast('Logged out successfully');
}

// Window Events
window.onclick = (event) => {
    if (event.target === authModal) {
        closeAuthModal();
    }
}; 