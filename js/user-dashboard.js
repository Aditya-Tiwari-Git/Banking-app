// Get current user from session
let currentUser = null;

// Mock tickets data
let tickets = [
    {
        id: 'TKT-001',
        subject: 'Unable to access online banking',
        category: 'Online Banking',
        priority: 'High',
        status: 'In Progress',
        description: 'I cannot log into my online banking account. The page keeps showing an error message.',
        created: '2025-01-08T10:30:00Z',
        updated: '2025-01-08T14:20:00Z',
        customerId: 'z123',
        assignedTo: 'e125'
    },
    {
        id: 'TKT-002',
        subject: 'Credit card transaction dispute',
        category: 'Cards & Payments',
        priority: 'Medium',
        status: 'Open',
        description: 'I see a charge on my credit card that I did not authorize.',
        created: '2025-01-07T16:45:00Z',
        updated: '2025-01-07T16:45:00Z',
        customerId: 'z123',
        assignedTo: null
    },
    {
        id: 'TKT-003',
        subject: 'Account balance discrepancy',
        category: 'Account Services',
        priority: 'Low',
        status: 'Resolved',
        description: 'My account balance does not match my calculations.',
        created: '2025-01-05T09:15:00Z',
        updated: '2025-01-06T11:30:00Z',
        customerId: 'z123',
        assignedTo: 'e123'
    }
];

// DOM elements
const sidebar = document.querySelector('.sidebar');
const menuToggle = document.querySelector('.menu-toggle');
const sidebarLinks = document.querySelectorAll('.sidebar-nav a');
const pageContents = document.querySelectorAll('.page-content');
const pageTitle = document.getElementById('pageTitle');
const userName = document.getElementById('userName');
const userDisplayName = document.getElementById('userDisplayName');
const ticketForm = document.getElementById('ticketForm');
const ticketsList = document.getElementById('ticketsList');

// Initialize dashboard
document.addEventListener('DOMContentLoaded', initDashboard);

function initDashboard() {
    // Check authentication
    const userData = sessionStorage.getItem('currentUser');
    if (!userData) {
        window.location.href = 'index.html';
        return;
    }
    
    currentUser = JSON.parse(userData);
    
    // Check if user is actually a user (not engineer)
    if (currentUser.role !== 'user') {
        window.location.href = 'index.html';
        return;
    }
    
    // Set user information
    if (userName) userName.textContent = currentUser.name;
    if (userDisplayName) userDisplayName.textContent = `Welcome back, ${currentUser.name.split(' ')[0]}!`;
    
    // Set up event listeners
    setupEventListeners();
    
    // Load initial data
    loadOverviewData();
    loadUserTickets();
    
    // Show default page
    showPage('overview');
}

function setupEventListeners() {
    // Menu toggle for mobile
    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('open');
        });
    }
    
    // Sidebar navigation
    sidebarLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const pageId = link.getAttribute('data-page');
            showPage(pageId);
            
            // Update active link
            sidebarLinks.forEach(l => l.parentElement.classList.remove('active'));
            link.parentElement.classList.add('active');
            
            // Close mobile menu
            sidebar.classList.remove('open');
        });
    });
    
    // Ticket form submission
    if (ticketForm) {
        ticketForm.addEventListener('submit', handleTicketSubmission);
    }
    
    // File upload handling
    const fileUpload = document.getElementById('ticketAttachment');
    if (fileUpload) {
        fileUpload.addEventListener('change', handleFileUpload);
    }
}

function showPage(pageId) {
    // Hide all pages
    pageContents.forEach(page => page.classList.remove('active'));
    
    // Show selected page
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.add('active');
    }
    
    // Update page title
    const titles = {
        'overview': 'Dashboard Overview',
        'create-ticket': 'Create New Ticket',
        'my-tickets': 'My Tickets',
        'knowledge-base': 'Knowledge Base'
    };
    
    if (pageTitle) {
        pageTitle.textContent = titles[pageId] || 'Dashboard';
    }
    
    // Load page-specific data
    switch (pageId) {
        case 'my-tickets':
            loadUserTickets();
            break;
        case 'overview':
            loadOverviewData();
            break;
    }
}

function loadOverviewData() {
    // Update stats based on user's tickets
    const userTickets = tickets.filter(ticket => ticket.customerId === currentUser.id);
    const totalTickets = userTickets.length;
    const pendingTickets = userTickets.filter(ticket => 
        ticket.status === 'Open' || ticket.status === 'In Progress'
    ).length;
    const resolvedTickets = userTickets.filter(ticket => 
        ticket.status === 'Resolved'
    ).length;
    const highPriorityTickets = userTickets.filter(ticket => 
        ticket.priority === 'High' || ticket.priority === 'Critical'
    ).length;
    
    // Update stat cards
    updateStatCard(0, totalTickets, `+${Math.floor(totalTickets * 0.2)} this week`);
    updateStatCard(1, pendingTickets, pendingTickets > 0 ? 'Awaiting response' : 'All caught up');
    updateStatCard(2, resolvedTickets, `${Math.round((resolvedTickets / totalTickets) * 100) || 0}% resolved`);
    updateStatCard(3, highPriorityTickets, highPriorityTickets > 0 ? 'Needs attention' : 'Looking good');
}

function updateStatCard(index, value, change) {
    const statCards = document.querySelectorAll('.stat-card');
    if (statCards[index]) {
        const numberElement = statCards[index].querySelector('.stat-number');
        const changeElement = statCards[index].querySelector('.stat-change');
        
        if (numberElement) numberElement.textContent = value;
        if (changeElement) changeElement.textContent = change;
    }
}

function handleTicketSubmission(e) {
    e.preventDefault();
    
    const formData = {
        subject: document.getElementById('ticketSubject').value,
        category: document.getElementById('ticketCategory').value,
        priority: document.getElementById('ticketPriority').value,
        description: document.getElementById('ticketDescription').value
    };
    
    // Generate ticket ID
    const ticketId = 'TKT-' + String(tickets.length + 1).padStart(3, '0');
    
    // Create new ticket
    const newTicket = {
        id: ticketId,
        subject: formData.subject,
        category: formData.category,
        priority: formData.priority,
        status: 'Open',
        description: formData.description,
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
        customerId: currentUser.id,
        assignedTo: null
    };
    
    // Add to tickets array
    tickets.push(newTicket);
    
    // Show success message
    showNotification('Ticket created successfully!', 'success');
    
    // Reset form
    ticketForm.reset();
    
    // Switch to My Tickets page
    setTimeout(() => {
        showPage('my-tickets');
        document.querySelector('[data-page="my-tickets"]').parentElement.classList.add('active');
        document.querySelector('[data-page="create-ticket"]').parentElement.classList.remove('active');
    }, 1000);
}

function loadUserTickets() {
    if (!ticketsList) return;
    
    const userTickets = tickets.filter(ticket => ticket.customerId === currentUser.id);
    
    if (userTickets.length === 0) {
        ticketsList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-ticket-alt"></i>
                <h3>No tickets yet</h3>
                <p>Create your first support ticket to get help from our team.</p>
                <button class="btn-primary" onclick="showPage('create-ticket')">
                    <i class="fas fa-plus"></i>
                    Create Ticket
                </button>
            </div>
        `;
        return;
    }
    
    // Sort tickets by creation date (newest first)
    userTickets.sort((a, b) => new Date(b.created) - new Date(a.created));
    
    // Generate tickets HTML
    const ticketsHTML = userTickets.map(ticket => `
        <div class="ticket-item">
            <div class="ticket-header">
                <span class="ticket-id">${ticket.id}</span>
                <span class="ticket-status status-${ticket.status.toLowerCase().replace(' ', '-')}">
                    ${ticket.status}
                </span>
            </div>
            <h3 class="ticket-title">${ticket.subject}</h3>
            <div class="ticket-meta">
                <span><i class="fas fa-tag"></i> ${ticket.category}</span>
                <span><i class="fas fa-exclamation-circle"></i> ${ticket.priority}</span>
                <span><i class="fas fa-calendar"></i> ${formatDate(ticket.created)}</span>
            </div>
            <p class="ticket-description">${ticket.description}</p>
            <div class="ticket-actions">
                <button class="btn-sm btn-view" onclick="viewTicket('${ticket.id}')">
                    <i class="fas fa-eye"></i>
                    View Details
                </button>
                ${ticket.status !== 'Resolved' && ticket.status !== 'Closed' ? 
                    `<button class="btn-sm btn-edit" onclick="editTicket('${ticket.id}')">
                        <i class="fas fa-edit"></i>
                        Update
                    </button>` : ''
                }
            </div>
        </div>
    `).join('');
    
    ticketsList.innerHTML = ticketsHTML;
}

function viewTicket(ticketId) {
    const ticket = tickets.find(t => t.id === ticketId);
    if (!ticket) return;
    
    showNotification(`Viewing ticket ${ticketId} details`, 'info');
    // In a real application, this would open a detailed modal or navigate to a detail page
}

function editTicket(ticketId) {
    const ticket = tickets.find(t => t.id === ticketId);
    if (!ticket) return;
    
    showNotification(`Edit functionality for ticket ${ticketId}`, 'info');
    // In a real application, this would open an edit modal or form
}

function handleFileUpload(e) {
    const files = e.target.files;
    if (files.length > 0) {
        const fileNames = Array.from(files).map(file => file.name).join(', ');
        showNotification(`Files selected: ${fileNames}`, 'success');
    }
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
        return 'Today';
    } else if (diffDays === 1) {
        return 'Yesterday';
    } else if (diffDays < 7) {
        return `${diffDays} days ago`;
    } else {
        return date.toLocaleDateString();
    }
}

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        sessionStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    }
}

// Show notification function
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${getNotificationIcon(type)}"></i>
            <span>${message}</span>
        </div>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${getNotificationColor(type)};
        color: white;
        padding: 16px 24px;
        border-radius: 12px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        z-index: 10000;
        animation: slideIn 0.3s ease;
        font-weight: 600;
        max-width: 400px;
    `;
    
    // Add to DOM
    document.body.appendChild(notification);
    
    // Auto remove after 4 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }
    }, 4000);
}

// Helper functions for notifications
function getNotificationIcon(type) {
    switch (type) {
        case 'success': return 'fa-check-circle';
        case 'error': return 'fa-exclamation-circle';
        case 'warning': return 'fa-exclamation-triangle';
        default: return 'fa-info-circle';
    }
}

function getNotificationColor(type) {
    switch (type) {
        case 'success': return '#10b981';
        case 'error': return '#ef4444';
        case 'warning': return '#f59e0b';
        default: return '#3b82f6';
    }
}

// Add empty state styles
const styles = document.createElement('style');
styles.textContent = `
    @keyframes slideIn {
        from {
            opacity: 0;
            transform: translateX(100%);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    @keyframes slideOut {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(100%);
        }
    }
    
    .notification-content {
        display: flex;
        align-items: center;
        gap: 12px;
    }
    
    .empty-state {
        text-align: center;
        padding: 60px 20px;
        background: white;
        border-radius: 16px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
        border: 1px solid #e2e8f0;
    }
    
    .empty-state i {
        font-size: 64px;
        color: #cbd5e1;
        margin-bottom: 24px;
    }
    
    .empty-state h3 {
        font-size: 24px;
        color: #1e293b;
        margin-bottom: 8px;
        font-weight: 700;
    }
    
    .empty-state p {
        color: #64748b;
        margin-bottom: 32px;
        font-size: 16px;
    }
`;
document.head.appendChild(styles);