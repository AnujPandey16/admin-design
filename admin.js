// Admin Dashboard JavaScript

// Global variables
let locations = [];
let reviews = [];
let currentEditingLocation = null;
let currentEditingReview = null;
let currentDeleteId = null;
let currentDeleteType = null;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    loadFromLocalStorage();
    updateDashboardStats();
    renderLocations();
    renderReviews();
    setupEventListeners();
}

// Local Storage Functions
function saveToLocalStorage() {
    localStorage.setItem('tourism_admin_locations', JSON.stringify(locations));
    localStorage.setItem('tourism_admin_reviews', JSON.stringify(reviews));
}

function loadFromLocalStorage() {
    const savedLocations = localStorage.getItem('tourism_admin_locations');
    const savedReviews = localStorage.getItem('tourism_admin_reviews');
    
    if (savedLocations) {
        locations = JSON.parse(savedLocations);
    }
    
    if (savedReviews) {
        reviews = JSON.parse(savedReviews);
    }
}

// Dashboard Statistics
function updateDashboardStats() {
    const totalLocationsEl = document.getElementById('total-locations');
    const totalReviewsEl = document.getElementById('total-reviews');
    const pendingReviewsEl = document.getElementById('pending-reviews');
    const approvedReviewsEl = document.getElementById('approved-reviews');
    
    if (totalLocationsEl) {
        totalLocationsEl.textContent = locations.length;
    }
    
    if (totalReviewsEl) {
        totalReviewsEl.textContent = reviews.length;
    }
    
    if (pendingReviewsEl) {
        const pendingCount = reviews.filter(review => review.status === 'pending').length;
        pendingReviewsEl.textContent = pendingCount;
    }
    
    if (approvedReviewsEl) {
        const approvedCount = reviews.filter(review => review.status === 'approved').length;
        approvedReviewsEl.textContent = approvedCount;
    }
    
    // Update review page stats
    const pendingCountEl = document.getElementById('pending-count');
    const approvedCountEl = document.getElementById('approved-count');
    
    if (pendingCountEl) {
        pendingCountEl.textContent = reviews.filter(review => review.status === 'pending').length;
    }
    
    if (approvedCountEl) {
        approvedCountEl.textContent = reviews.filter(review => review.status === 'approved').length;
    }
}

// Event Listeners
function setupEventListeners() {
    // Location form submission
    const locationForm = document.getElementById('location-form');
    if (locationForm) {
        locationForm.addEventListener('submit', handleLocationFormSubmit);
    }
    
    // Review form submission
    const editReviewForm = document.getElementById('edit-review-form');
    if (editReviewForm) {
        editReviewForm.addEventListener('submit', handleEditReviewFormSubmit);
    }
    
    // Search functionality
    const locationSearch = document.getElementById('location-search');
    if (locationSearch) {
        locationSearch.addEventListener('input', handleLocationSearch);
    }
    
    const reviewSearch = document.getElementById('review-search');
    if (reviewSearch) {
        reviewSearch.addEventListener('input', handleReviewSearch);
    }
    
    // Filter functionality
    const locationFilter = document.getElementById('location-filter');
    if (locationFilter) {
        locationFilter.addEventListener('change', renderLocations);
    }
    
    const reviewFilter = document.getElementById('review-filter');
    const ratingFilter = document.getElementById('rating-filter');
    if (reviewFilter) {
        reviewFilter.addEventListener('change', renderReviews);
    }
    if (ratingFilter) {
        ratingFilter.addEventListener('change', renderReviews);
    }
    
    // Modal close on outside click
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            closeAllModals();
        }
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeAllModals();
        }
    });
}

// Location Management
function openAddLocationModal() {
    currentEditingLocation = null;
    const modal = document.getElementById('location-modal');
    const modalTitle = document.getElementById('modal-title');
    const form = document.getElementById('location-form');
    
    modalTitle.textContent = 'Add New Location';
    form.reset();
    modal.classList.add('show');
}

function openEditLocationModal(locationId) {
    const location = locations.find(loc => loc.id === locationId);
    if (!location) return;
    
    currentEditingLocation = location;
    const modal = document.getElementById('location-modal');
    const modalTitle = document.getElementById('modal-title');
    
    modalTitle.textContent = 'Edit Location';
    
    // Populate form fields
    document.getElementById('location-name').value = location.name || '';
    document.getElementById('location-category').value = location.category || '';
    document.getElementById('location-status').value = location.status || 'active';
    document.getElementById('location-address').value = location.address || '';
    document.getElementById('location-phone').value = location.phone || '';
    document.getElementById('location-email').value = location.email || '';
    document.getElementById('location-description').value = location.description || '';
    document.getElementById('location-price-range').value = location.priceRange || '';
    document.getElementById('location-hours').value = location.hours || '';
    
    modal.classList.add('show');
}

function closeLocationModal() {
    const modal = document.getElementById('location-modal');
    modal.classList.remove('show');
    currentEditingLocation = null;
}

function handleLocationFormSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const locationData = {
        id: currentEditingLocation ? currentEditingLocation.id : Date.now(),
        name: formData.get('name'),
        category: formData.get('category'),
        status: formData.get('status'),
        address: formData.get('address'),
        phone: formData.get('phone'),
        email: formData.get('email'),
        description: formData.get('description'),
        priceRange: formData.get('priceRange'),
        hours: formData.get('hours'),
        createdAt: currentEditingLocation ? currentEditingLocation.createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    if (currentEditingLocation) {
        // Update existing location
        const index = locations.findIndex(loc => loc.id === currentEditingLocation.id);
        if (index !== -1) {
            locations[index] = locationData;
        }
    } else {
        // Add new location
        locations.push(locationData);
    }
    
    saveToLocalStorage();
    renderLocations();
    updateDashboardStats();
    closeLocationModal();
    
    showNotification(currentEditingLocation ? 'Location updated successfully!' : 'Location added successfully!', 'success');
}

function deleteLocation(locationId) {
    currentDeleteId = locationId;
    currentDeleteType = 'location';
    const modal = document.getElementById('delete-modal');
    modal.classList.add('show');
}

function confirmDelete() {
    if (currentDeleteType === 'location') {
        locations = locations.filter(loc => loc.id !== currentDeleteId);
        renderLocations();
        showNotification('Location deleted successfully!', 'success');
    } else if (currentDeleteType === 'review') {
        reviews = reviews.filter(review => review.id !== currentDeleteId);
        renderReviews();
        showNotification('Review deleted successfully!', 'success');
    }
    
    saveToLocalStorage();
    updateDashboardStats();
    closeDeleteModal();
}

function closeDeleteModal() {
    const modal = document.getElementById('delete-modal');
    modal.classList.remove('show');
    currentDeleteId = null;
    currentDeleteType = null;
}

function renderLocations() {
    const tableBody = document.querySelector('#locations-table tbody');
    if (!tableBody) return;
    
    const searchTerm = document.getElementById('location-search')?.value.toLowerCase() || '';
    const categoryFilter = document.getElementById('location-filter')?.value || '';
    
    let filteredLocations = locations.filter(location => {
        const matchesSearch = location.name.toLowerCase().includes(searchTerm) ||
                            location.address.toLowerCase().includes(searchTerm) ||
                            location.category.toLowerCase().includes(searchTerm);
        const matchesCategory = !categoryFilter || location.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });
    
    if (filteredLocations.length === 0) {
        tableBody.innerHTML = `
            <tr class="empty-state">
                <td colspan="7" class="empty-message">
                    <div class="empty-content">
                        <i class="fas fa-map-marker-alt"></i>
                        <p>${searchTerm || categoryFilter ? 'No locations match your search criteria' : 'No locations added yet'}</p>
                        ${!searchTerm && !categoryFilter ? '<button class="btn-primary" onclick="openAddLocationModal()">Add First Location</button>' : ''}
                    </div>
                </td>
            </tr>
        `;
        return;
    }
    
    tableBody.innerHTML = filteredLocations.map(location => `
        <tr>
            <td data-label="ID">${location.id}</td>
            <td data-label="Name"><strong>${location.name}</strong></td>
            <td data-label="Category">
                <span class="status-badge ${location.category}">${capitalizeFirst(location.category)}</span>
            </td>
            <td data-label="Address" class="truncate">${location.address}</td>
            <td data-label="Rating">
                <div class="rating-display">
                    <div class="rating-stars">
                        ${generateStars(calculateLocationRating(location.id))}
                    </div>
                    <span class="rating-text">${calculateLocationRating(location.id).toFixed(1)}/5</span>
                </div>
            </td>
            <td data-label="Status">
                <span class="status-${location.status}">${capitalizeFirst(location.status)}</span>
            </td>
            <td data-label="Actions">
                <div class="table-actions">
                    <button class="action-btn edit" onclick="openEditLocationModal(${location.id})" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn delete" onclick="deleteLocation(${location.id})" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function handleLocationSearch() {
    renderLocations();
}

// Review Management
function openReviewModal(reviewId) {
    const review = reviews.find(r => r.id === reviewId);
    if (!review) return;
    
    const modal = document.getElementById('review-modal');
    
    // Populate modal with review data
    document.getElementById('reviewer-name').textContent = review.reviewerName || 'Anonymous';
    document.getElementById('review-date').textContent = formatDate(review.createdAt);
    document.getElementById('review-location').textContent = getLocationName(review.locationId);
    document.getElementById('review-text').textContent = review.reviewText;
    document.getElementById('rating-text').textContent = `${review.rating}/5`;
    document.getElementById('current-status').textContent = capitalizeFirst(review.status);
    document.getElementById('current-status').className = `status-badge ${review.status}`;
    
    // Generate stars
    const starsContainer = document.getElementById('review-stars');
    starsContainer.innerHTML = generateStars(review.rating);
    
    // Set current review for actions
    currentEditingReview = review;
    
    modal.classList.add('show');
}

function closeReviewModal() {
    const modal = document.getElementById('review-modal');
    modal.classList.remove('show');
    currentEditingReview = null;
}

function openEditReviewModal(reviewId) {
    const review = reviews.find(r => r.id === reviewId);
    if (!review) return;
    
    currentEditingReview = review;
    const modal = document.getElementById('edit-review-modal');
    
    // Populate form fields
    document.getElementById('edit-reviewer-name').value = review.reviewerName || '';
    document.getElementById('edit-location').value = getLocationName(review.locationId);
    document.getElementById('edit-rating').value = review.rating;
    document.getElementById('edit-review-text').value = review.reviewText || '';
    document.getElementById('edit-status').value = review.status;
    
    modal.classList.add('show');
}

function closeEditReviewModal() {
    const modal = document.getElementById('edit-review-modal');
    modal.classList.remove('show');
    currentEditingReview = null;
}

function handleEditReviewFormSubmit(e) {
    e.preventDefault();
    
    if (!currentEditingReview) return;
    
    const formData = new FormData(e.target);
    const updatedReview = {
        ...currentEditingReview,
        rating: parseInt(formData.get('rating')),
        reviewText: formData.get('reviewText'),
        status: formData.get('status'),
        updatedAt: new Date().toISOString()
    };
    
    const index = reviews.findIndex(r => r.id === currentEditingReview.id);
    if (index !== -1) {
        reviews[index] = updatedReview;
    }
    
    saveToLocalStorage();
    renderReviews();
    updateDashboardStats();
    closeEditReviewModal();
    
    showNotification('Review updated successfully!', 'success');
}

function approveReview() {
    if (!currentEditingReview) return;
    
    const index = reviews.findIndex(r => r.id === currentEditingReview.id);
    if (index !== -1) {
        reviews[index].status = 'approved';
        reviews[index].updatedAt = new Date().toISOString();
    }
    
    saveToLocalStorage();
    renderReviews();
    updateDashboardStats();
    closeReviewModal();
    
    showNotification('Review approved successfully!', 'success');
}

function rejectReview() {
    if (!currentEditingReview) return;
    
    const index = reviews.findIndex(r => r.id === currentEditingReview.id);
    if (index !== -1) {
        reviews[index].status = 'rejected';
        reviews[index].updatedAt = new Date().toISOString();
    }
    
    saveToLocalStorage();
    renderReviews();
    updateDashboardStats();
    closeReviewModal();
    
    showNotification('Review rejected successfully!', 'success');
}

function deleteReview(reviewId) {
    currentDeleteId = reviewId;
    currentDeleteType = 'review';
    const modal = document.getElementById('delete-review-modal');
    modal.classList.add('show');
}

function confirmDeleteReview() {
    reviews = reviews.filter(review => review.id !== currentDeleteId);
    saveToLocalStorage();
    renderReviews();
    updateDashboardStats();
    closeDeleteReviewModal();
    showNotification('Review deleted successfully!', 'success');
}

function closeDeleteReviewModal() {
    const modal = document.getElementById('delete-review-modal');
    modal.classList.remove('show');
    currentDeleteId = null;
    currentDeleteType = null;
}

function renderReviews() {
    const tableBody = document.querySelector('#reviews-table tbody');
    if (!tableBody) return;
    
    const searchTerm = document.getElementById('review-search')?.value.toLowerCase() || '';
    const statusFilter = document.getElementById('review-filter')?.value || '';
    const ratingFilter = document.getElementById('rating-filter')?.value || '';
    
    let filteredReviews = reviews.filter(review => {
        const matchesSearch = review.reviewerName.toLowerCase().includes(searchTerm) ||
                            review.reviewText.toLowerCase().includes(searchTerm) ||
                            getLocationName(review.locationId).toLowerCase().includes(searchTerm);
        const matchesStatus = !statusFilter || review.status === statusFilter;
        const matchesRating = !ratingFilter || review.rating === parseInt(ratingFilter);
        return matchesSearch && matchesStatus && matchesRating;
    });
    
    if (filteredReviews.length === 0) {
        tableBody.innerHTML = `
            <tr class="empty-state">
                <td colspan="8" class="empty-message">
                    <div class="empty-content">
                        <i class="fas fa-star"></i>
                        <p>${searchTerm || statusFilter || ratingFilter ? 'No reviews match your search criteria' : 'No reviews submitted yet'}</p>
                        ${!searchTerm && !statusFilter && !ratingFilter ? '<span>Reviews from users will appear here for moderation</span>' : ''}
                    </div>
                </td>
            </tr>
        `;
        return;
    }
    
    tableBody.innerHTML = filteredReviews.map(review => `
        <tr>
            <td data-label="ID">${review.id}</td>
            <td data-label="User"><strong>${review.reviewerName}</strong></td>
            <td data-label="Location">${getLocationName(review.locationId)}</td>
            <td data-label="Rating">
                <div class="rating-display">
                    <div class="rating-stars">
                        ${generateStars(review.rating)}
                    </div>
                    <span class="rating-text">${review.rating}/5</span>
                </div>
            </td>
            <td data-label="Review" class="truncate-long">${review.reviewText}</td>
            <td data-label="Date">${formatDate(review.createdAt)}</td>
            <td data-label="Status">
                <span class="status-${review.status}">${capitalizeFirst(review.status)}</span>
            </td>
            <td data-label="Actions">
                <div class="table-actions">
                    <button class="action-btn view" onclick="openReviewModal(${review.id})" title="View">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="action-btn edit" onclick="openEditReviewModal(${review.id})" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn delete" onclick="deleteReview(${review.id})" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function handleReviewSearch() {
    renderReviews();
}

// Utility Functions
function generateStars(rating) {
    let starsHtml = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= rating) {
            starsHtml += '<i class="fas fa-star"></i>';
        } else {
            starsHtml += '<i class="far fa-star empty"></i>';
        }
    }
    return starsHtml;
}

function calculateLocationRating(locationId) {
    const locationReviews = reviews.filter(review => 
        review.locationId === locationId && review.status === 'approved'
    );
    
    if (locationReviews.length === 0) return 0;
    
    const totalRating = locationReviews.reduce((sum, review) => sum + review.rating, 0);
    return totalRating / locationReviews.length;
}

function getLocationName(locationId) {
    const location = locations.find(loc => loc.id === locationId);
    return location ? location.name : 'Unknown Location';
}

function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function closeAllModals() {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.classList.remove('show');
    });
    currentEditingLocation = null;
    currentEditingReview = null;
    currentDeleteId = null;
    currentDeleteType = null;
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    
    // Add styles for notification
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        padding: 12px 24px;
        border-radius: 8px;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        z-index: 9999;
        font-size: 14px;
        font-weight: 500;
        opacity: 0;
        transform: translateX(100%);
        transition: all 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Demo data function (can be called from console to add sample data)
window.addDemoData = function() {
    if (locations.length > 0 || reviews.length > 0) {
        if (!confirm('This will replace existing data. Continue?')) return;
    }
    
    locations = [
        {
            id: 1,
            name: 'Central Park',
            category: 'attraction',
            status: 'active',
            address: '123 Park Avenue, New York, NY 10001',
            phone: '+1-555-0123',
            email: 'info@centralpark.com',
            description: 'Beautiful urban park perfect for walking, picnicking, and outdoor activities.',
            priceRange: '$',
            hours: '6:00 AM - 10:00 PM',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        },
        {
            id: 2,
            name: 'Downtown Grill',
            category: 'restaurant',
            status: 'active',
            address: '456 Main Street, Downtown, NY 10002',
            phone: '+1-555-0456',
            email: 'reservations@downtowngrill.com',
            description: 'Fine dining restaurant featuring local cuisine and seasonal ingredients.',
            priceRange: '$$$',
            hours: '11:00 AM - 11:00 PM',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }
    ];
    
    reviews = [
        {
            id: 1,
            locationId: 1,
            reviewerName: 'John Smith',
            rating: 5,
            reviewText: 'Amazing park! Perfect for family outings and the scenery is breathtaking.',
            status: 'approved',
            createdAt: new Date(Date.now() - 86400000).toISOString(),
            updatedAt: new Date(Date.now() - 86400000).toISOString()
        },
        {
            id: 2,
            locationId: 2,
            reviewerName: 'Sarah Johnson',
            rating: 4,
            reviewText: 'Great food and excellent service. The atmosphere is cozy and welcoming.',
            status: 'pending',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }
    ];
    
    saveToLocalStorage();
    renderLocations();
    renderReviews();
    updateDashboardStats();
    showNotification('Demo data added successfully!', 'success');
};

// Clear all data function
window.clearAllData = function() {
    if (confirm('Are you sure you want to delete all data? This action cannot be undone.')) {
        locations = [];
        reviews = [];
        localStorage.removeItem('tourism_admin_locations');
        localStorage.removeItem('tourism_admin_reviews');
        renderLocations();
        renderReviews();
        updateDashboardStats();
        showNotification('All data cleared successfully!', 'success');
    }
};
