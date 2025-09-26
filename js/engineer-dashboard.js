// Get current user from session
let currentUser = null;

// Mock tickets data (extended from user dashboard)
let allTickets = [
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
        customerName: 'Demo User',
        assignedTo: 'e125',
        assignedGroup: 'Application Support'
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
        customerName: 'Demo User',
        assignedTo: null,
        assignedGroup: null
    },
    {
        id: 'TKT-003',
        subject: 'Network connectivity issues in branch',
        category: 'Technical Issues',
        priority: 'Critical',
        status: 'New',
        description: 'Multiple workstations in downtown branch cannot connect to core banking system.',
        created: '2025-01-08T08:15:00Z',
        updated: '2025-01-08T08:15:00Z',
        customerId: 'z124',
        customerName: 'Branch Manager',
        assignedTo: null,
        assignedGroup: null
    },
    {
        id: 'TKT-004',
        subject: 'Mobile app login failure',
        category: 'Online Banking',
        priority: 'High',
        status: 'Assigned',
        description: 'Users reporting they cannot log into the mobile banking application.',
        created: '2025-01-08T09:30:00Z',
        updated: '2025-01-08T11:45:00Z',
        customerId: 'z125',
        customerName: 'Customer Services',
        assignedTo: 'e125',
        assignedGroup: 'Application Support'
    },
    {
        id: 'TKT-005',
        subject: 'ATM dispensing incorrect amounts',
        category: 'Technical Issues',
        priority: 'High',
        status: 'In Progress',
        description: 'ATM at Main Street location dispensing wrong cash amounts.',
        created: '2025-01-07T14:20:00Z',
        updated: '2025-01-08T10:30:00Z',
        customerId: 'z126',
        customerName: 'ATM Operations',
        assignedTo: 'e123',
        assignedGroup: 'Network Infrastructure'
    },
    {
        id: 'TKT-006',
        subject: 'Security alert system malfunction',
        category: 'Technical Issues',
        priority: 'Critical',
        status: 'Assigned',
        description: 'Fraud detection system not generating alerts for suspicious transactions.',
        created: '2025-01-08T07:45:00Z',
        updated: '2025-01-08T12:15:00Z',
        customerId: 'z127',
        customerName: 'Security Operations',
        assignedTo: 'e126',
        assignedGroup: 'Security Team'
    }
];

// Engineers data
const engineers = {
    'e123': {
        id: 'e123',
        name: 'John Smith',
        email: 'john.smith@banktech.com',
        group: 'Network Infrastructure',
        status: 'online'
    },
    'e124': {
        id: 'e124',
        name: 'Mike Johnson',
        email: 'mike.johnson@banktech.com',
        group: 'Network Infrastructure',
        status: 'online'
    },
    'e125': {
        id: 'e125',
        name: 'Sarah Wilson',
        email: 'sarah.wilson@banktech.com',
        group: 'Application Support',
        status: 'online'
    },
    'e126': {
        id: 'e126',
        name: 'David Brown',
        email: 'david.brown@banktech.com',
        group: 'Security Team',
        status: 'online'
    },
    'e127': {
        id: 'e127',
        name: 'Lisa Anderson',
        email: 'lisa.anderson@banktech.com',
        group: 'Security Team',
        status: 'online'
    }
};

// DOM elements
const sidebar = document.querySelector('.sidebar');
const menuToggle = document.querySelector('.menu-toggle');
const sidebarLinks = document.querySelectorAll('.sidebar-nav a');
const pageContents = document.querySelectorAll('.page-content');
const pageTitle = document.getElementById('pageTitle');
const engineerName = document.getElementById('engineerName');
const engineerGroup = document.getElementById('engineerGroup');

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
    
    // Check if user is actually an engineer
    if (currentUser.role !== 'engineer') {
        window.location.href = 'index.html';
        return;
    }
    
    // Set engineer information
    if (engineerName) engineerName.textContent = currentUser.name;
    if (engineerGroup) engineerGroup.textContent = currentUser.group;
    
    // Set up event listeners
    setupEventListeners();
    
    // Load initial data
    loadDashboardMetrics();
    loadPriorityTickets();
    loadTicketQueue();
    loadAssignedTickets();
    
    // Show default page
    showPage('dashboard');
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
        'dashboard': 'Engineer Dashboard',
        'queue': 'Ticket Queue',
        'assigned': 'Assigned to Me',
        'team': 'Team View',
        'analytics': 'Performance Analytics'
    };
    
    if (pageTitle) {
        pageTitle.textContent = titles[pageId] || 'Dashboard';
    }
    
    // Load page-specific data
    switch (pageId) {
        case 'queue':
            loadTicketQueue();
            break;
        case 'assigned':
            loadAssignedTickets();
            break;
        case 'dashboard':
            loadDashboardMetrics();
            loadPriorityTickets();
            break;
    }
}

function loadDashboardMetrics() {
    const highPriorityTickets = allTickets.filter(ticket => 
        ticket.priority === 'High' || ticket.priority === 'Critical'
    ).length;
    
    const assignedToMe = allTickets.filter(ticket => 
        ticket.assignedTo === currentUser.id
    ).length;
    
    const resolvedToday = allTickets.filter(ticket => 
        ticket.status === 'Resolved' && 
        new Date(ticket.updated).toDateString() === new Date().toDateString()
    ).length;
    
    // Update metric cards
    updateMetricCard('High Priority', highPriorityTickets, '+1 today');
    updateMetricCard('Assigned to Me', assignedToMe, assignedToMe > 5 ? '2 overdue' : 'On track');
    updateMetricCard('Resolved Today', resolvedToday, resolvedToday > 3 ? 'Above average' : 'Good pace');
    updateMetricCard('SLA Performance', '94%', 'On target');
}

function updateMetricCard(title, value, trend) {
    const metricCards = document.querySelectorAll('.metric-card');
    metricCards.forEach(card => {
        const titleElement = card.querySelector('h3');
        if (titleElement && titleElement.textContent === title) {
            const numberElement = card.querySelector('.metric-number');
            const trendElement = card.querySelector('.metric-trend');
            
            if (numberElement) numberElement.textContent = value;
            if (trendElement) trendElement.textContent = trend;
        }
    });
}

function loadPriorityTickets() {
    const priorityTicketsContainer = document.getElementById('priorityTickets');
    if (!priorityTicketsContainer) return;
    
    const priorityTickets = allTickets
        .filter(ticket => ticket.priority === 'High' || ticket.priority === 'Critical')
        .slice(0, 5);
    
    if (priorityTickets.length === 0) {
        priorityTicketsContainer.innerHTML = `
            <div class="no-priority-tickets">
                <i class="fas fa-check-circle"></i>
                <p>No high priority tickets at the moment</p>
            </div>
        `;
        return;
    }
    
    const ticketsHTML = priorityTickets.map(ticket => `
        <div class="priority-ticket-item">
            <div class="ticket-info">
                <h4>${ticket.subject}</h4>
                <p>${ticket.customerName} • ${formatDate(ticket.created)}</p>
            </div>
            <span class="ticket-priority priority-${ticket.priority.toLowerCase()}">${ticket.priority}</span>
        </div>
    `).join('');
    
    priorityTicketsContainer.innerHTML = ticketsHTML;
}

function loadTicketQueue() {
    const queueTableBody = document.getElementById('queueTableBody');
    if (!queueTableBody) return;
    
    // Filter tickets based on current filters
    let filteredTickets = allTickets.filter(ticket => 
        ticket.status !== 'Closed' && ticket.status !== 'Resolved'
    );
    
    const ticketsHTML = filteredTickets.map(ticket => `
        <tr>
            <td><input type="checkbox" data-ticket-id="${ticket.id}"></td>
            <td class="ticket-id-cell">${ticket.id}</td>
            <td><span class="priority-cell priority-${ticket.priority.toLowerCase()}">${ticket.priority}</span></td>
            <td>${ticket.subject}</td>
            <td>${ticket.category}</td>
            <td>${ticket.customerName}</td>
            <td><span class="ticket-status status-${ticket.status.toLowerCase().replace(' ', '-')}">${ticket.status}</span></td>
            <td>${formatDate(ticket.created)}</td>
            <td class="action-btns">
                <button class="btn-action btn-assign" onclick="assignTicket('${ticket.id}')">
                    <i class="fas fa-user-plus"></i>
                </button>
                <button class="btn-action btn-view" onclick="viewTicketDetail('${ticket.id}')">
                    <i class="fas fa-eye"></i>
                </button>
            </td>
        </tr>
    `).join('');
    
    queueTableBody.innerHTML = ticketsHTML;
}

function loadAssignedTickets() {
    const assignedTicketsGrid = document.getElementById('assignedTicketsGrid');
    if (!assignedTicketsGrid) return;
    
    const assignedTickets = allTickets.filter(ticket => ticket.assignedTo === currentUser.id);
    
    if (assignedTickets.length === 0) {
        assignedTicketsGrid.innerHTML = `
            <div class="no-assigned-tickets">
                <i class="fas fa-tasks"></i>
                <h3>No assigned tickets</h3>
                <p>You don't have any tickets assigned to you at the moment.</p>
            </div>
        `;
        return;
    }
    
    const ticketsHTML = assignedTickets.map(ticket => `
        <div class="assigned-ticket-card ${ticket.priority === 'Critical' || ticket.priority === 'High' ? 'urgent' : 'normal'}">
            <div class="ticket-card-header">
                <span class="ticket-card-id">${ticket.id}</span>
                <span class="ticket-card-priority priority-${ticket.priority.toLowerCase()}">${ticket.priority}</span>
            </div>
            <h3 class="ticket-card-title">${ticket.subject}</h3>
            <div class="ticket-card-meta">
                <span><i class="fas fa-user"></i> ${ticket.customerName}</span>
                <span><i class="fas fa-clock"></i> ${formatDate(ticket.created)}</span>
            </div>
            <div class="ticket-card-actions">
                <button class="btn-primary" onclick="updateTicketStatus('${ticket.id}')">
                    <i class="fas fa-edit"></i>
                    Update
                </button>
                <button class="btn-secondary" onclick="reassignTicket('${ticket.id}')">
                    <i class="fas fa-share"></i>
                    Reassign
                </button>
            </div>
        </div>
    `).join('');
    
    assignedTicketsGrid.innerHTML = ticketsHTML;
}

// Ticket management functions
function assignTicket(ticketId) {
    const ticket = allTickets.find(t => t.id === ticketId);
    if (!ticket) return;
    
    // In a real application, this would show a modal to select engineer
    ticket.assignedTo = currentUser.id;
    ticket.assignedGroup = currentUser.group;
    ticket.status = 'Assigned';
    ticket.updated = new Date().toISOString();
    
    showNotification(`Ticket ${ticketId} assigned to you`, 'success');
    loadTicketQueue();
    loadDashboardMetrics();
}

function viewTicketDetail(ticketId) {
    const ticket = allTickets.find(t => t.id === ticketId);
    if (!ticket) return;
    
    // Show ticket detail modal
    showTicketModal(ticket);
}

function updateTicketStatus(ticketId) {
    const ticket = allTickets.find(t => t.id === ticketId);
    if (!ticket) return;
    
    // Cycle through statuses
    const statusFlow = ['Assigned', 'In Progress', 'Resolved'];
    const currentIndex = statusFlow.indexOf(ticket.status);
    const nextStatus = statusFlow[(currentIndex + 1) % statusFlow.length];
    
    ticket.status = nextStatus;
    ticket.updated = new Date().toISOString();
    
    showNotification(`Ticket ${ticketId} status updated to ${nextStatus}`, 'success');
    loadAssignedTickets();
    loadDashboardMetrics();
}

function reassignTicket(ticketId) {
    const ticket = allTickets.find(t => t.id === ticketId);
    if (!ticket) return;
    
    // In a real application, this would show a modal to select engineer
    const engineerIds = Object.keys(engineers).filter(id => id !== currentUser.id);
    const randomEngineerId = engineerIds[Math.floor(Math.random() * engineerIds.length)];
    const newEngineer = engineers[randomEngineerId];
    
    ticket.assignedTo = randomEngineerId;
    ticket.assignedGroup = newEngineer.group;
    ticket.updated = new Date().toISOString();
    
    showNotification(`Ticket ${ticketId} reassigned to ${newEngineer.name}`, 'success');
    loadAssignedTickets();
    loadDashboardMetrics();
}

function refreshQueue() {
    showNotification('Refreshing ticket queue...', 'info');
    setTimeout(() => {
        loadTicketQueue();
        showNotification('Queue refreshed successfully', 'success');
    }, 1000);
}

function showTicketModal(ticket) {
    const modal = document.getElementById('ticketModal');
    const modalTitle = document.getElementById('modalTicketTitle');
    const modalBody = document.getElementById('ticketModalBody');
    
    if (!modal || !modalTitle || !modalBody) return;
    
    modalTitle.textContent = `${ticket.id} - ${ticket.subject}`;
    
    modalBody.innerHTML = `
        <div class="ticket-detail-grid">
            <div class="ticket-detail-section">
                <h4>Ticket Information</h4>
                <div class="detail-item">
                    <label>Priority:</label>
                    <span class="priority-badge priority-${ticket.priority.toLowerCase()}">${ticket.priority}</span>
                </div>
                <div class="detail-item">
                    <label>Category:</label>
                    <span>${ticket.category}</span>
                </div>
                <div class="detail-item">
                    <label>Status:</label>
                    <span class="status-badge status-${ticket.status.toLowerCase().replace(' ', '-')}">${ticket.status}</span>
                </div>
                <div class="detail-item">
                    <label>Created:</label>
                    <span>${formatDateTime(ticket.created)}</span>
                </div>
                <div class="detail-item">
                    <label>Last Updated:</label>
                    <span>${formatDateTime(ticket.updated)}</span>
                </div>
            </div>
            <div class="ticket-detail-section">
                <h4>Customer Information</h4>
                <div class="detail-item">
                    <label>Customer:</label>
                    <span>${ticket.customerName}</span>
                </div>
                <div class="detail-item">
                    <label>Customer ID:</label>
                    <span>${ticket.customerId}</span>
                </div>
            </div>
            <div class="ticket-detail-section full-width">
                <h4>Description</h4>
                <p class="ticket-description">${ticket.description}</p>
            </div>
            <div class="ticket-detail-section full-width">
                <h4>Actions</h4>
                <div class="modal-actions">
                    ${ticket.assignedTo !== currentUser.id ? 
                        `<button class="btn-primary" onclick="assignTicket('${ticket.id}'); closeTicketModal();">
                            <i class="fas fa-user-check"></i>
                            Assign to Me
                        </button>` : 
                        `<button class="btn-primary" onclick="updateTicketStatus('${ticket.id}'); closeTicketModal();">
                            <i class="fas fa-edit"></i>
                            Update Status
                        </button>`
                    }
                    <button class="btn-secondary" onclick="reassignTicket('${ticket.id}'); closeTicketModal();">
                        <i class="fas fa-share"></i>
                        Reassign
                    </button>
                </div>
            </div>
        </div>
    `;
    
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeTicketModal() {
    const modal = document.getElementById('ticketModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
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

function formatDateTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
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

// Close modal when clicking outside
window.addEventListener('click', (e) => {
    const modal = document.getElementById('ticketModal');
    if (e.target === modal) {
        closeTicketModal();
    }
});

// Add additional styles
const styles = document.createElement('style');
styles.textContent = `
    @keyframes slideIn {
        from { opacity: 0; transform: translateX(100%); }
        to { opacity: 1; transform: translateX(0); }
    }
    
    @keyframes slideOut {
        from { opacity: 1; transform: translateX(0); }
        to { opacity: 0; transform: translateX(100%); }
    }
    
    .notification-content {
        display: flex;
        align-items: center;
        gap: 12px;
    }
    
    .no-priority-tickets, .no-assigned-tickets {
        text-align: center;
        padding: 40px 20px;
        color: #64748b;
    }
    
    .no-priority-tickets i, .no-assigned-tickets i {
        font-size: 48px;
        color: #cbd5e1;
        margin-bottom: 16px;
    }
    
    .ticket-detail-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 32px;
    }
    
    .ticket-detail-section.full-width {
        grid-column: 1 / -1;
    }
    
    .ticket-detail-section h4 {
        color: #0f172a;
        font-size: 18px;
        font-weight: 700;
        margin-bottom: 16px;
        padding-bottom: 8px;
        border-bottom: 2px solid #e2e8f0;
    }
    
    .detail-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 0;
        border-bottom: 1px solid #f1f5f9;
    }
    
    .detail-item:last-child {
        border-bottom: none;
    }
    
    .detail-item label {
        font-weight: 600;
        color: #64748b;
    }
    
    .priority-badge, .status-badge {
        padding: 4px 12px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 600;
        text-transform: uppercase;
    }
    
    .modal-actions {
        display: flex;
        gap: 16px;
        margin-top: 16px;
    }
    
    @media (max-width: 768px) {
        .ticket-detail-grid {
            grid-template-columns: 1fr;
        }
    }
`;
document.head.appendChild(styles);