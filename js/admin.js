/* ============================================
   Premium Doodles - Admin Dashboard JavaScript
   ============================================ */

// Current state
let currentPage = 'dashboard';
let currentDogId = null;
let currentLitterId = null;
let currentPuppyId = null;
let currentCustomerId = null;

// Initialize admin dashboard - called after auth is confirmed
function initAdmin() {
    console.log('Initializing admin dashboard...');
    initSidebar();
    loadPage('dashboard');
}

// Export for use by auth script
window.initAdmin = initAdmin;

// Global Search functionality
let searchTimeout = null;

function handleGlobalSearch(query) {
    const resultsContainer = document.getElementById('searchResults');

    // Clear previous timeout
    if (searchTimeout) clearTimeout(searchTimeout);

    // Hide results if query is empty
    if (!query || query.trim().length < 2) {
        resultsContainer.innerHTML = '';
        resultsContainer.style.display = 'none';
        return;
    }

    // Debounce search
    searchTimeout = setTimeout(() => {
        const results = performGlobalSearch(query.trim().toLowerCase());
        displaySearchResults(results, resultsContainer);
    }, 200);
}

function performGlobalSearch(query) {
    const results = [];

    // Search Dogs
    DB.dogs.getAll().forEach(dog => {
        if (matchesSearch(dog, query, ['name', 'breed', 'color'])) {
            results.push({
                type: 'dog',
                id: dog.id,
                title: dog.name,
                subtitle: `${dog.breed || ''} • ${dog.gender || ''}`,
                icon: 'dog'
            });
        }
    });

    // Search Puppies
    DB.puppies.getAll().forEach(puppy => {
        if (matchesSearch(puppy, query, ['name', 'color', 'gender'])) {
            results.push({
                type: 'puppy',
                id: puppy.id,
                title: puppy.name || 'Unnamed Puppy',
                subtitle: `${puppy.color || ''} • ${puppy.gender || ''} • ${puppy.status || ''}`,
                icon: 'heart'
            });
        }
    });

    // Search Customers
    DB.customers.getAll().forEach(customer => {
        if (matchesSearch(customer, query, ['name', 'email', 'phone', 'city', 'state'])) {
            results.push({
                type: 'customer',
                id: customer.id,
                title: customer.name,
                subtitle: customer.email || customer.phone || '',
                icon: 'user'
            });
        }
    });

    // Search Waitlist
    DB.waitlist.getAll().forEach(entry => {
        if (matchesSearch(entry, query, ['name', 'email', 'phone'])) {
            results.push({
                type: 'waitlist',
                id: entry.id,
                title: entry.name,
                subtitle: `Waitlist • ${entry.status || 'pending'}`,
                icon: 'clipboard'
            });
        }
    });

    // Search Litters
    DB.litters.getAll().forEach(litter => {
        const mother = DB.dogs.getById(litter.motherId);
        const father = DB.dogs.getById(litter.fatherId);
        const litterName = `${mother?.name || 'Unknown'} x ${father?.name || 'Unknown'}`;
        if (litterName.toLowerCase().includes(query)) {
            results.push({
                type: 'litter',
                id: litter.id,
                title: litterName,
                subtitle: litter.birthDate ? `Born ${formatDate(litter.birthDate)}` : 'Upcoming',
                icon: 'users'
            });
        }
    });

    return results.slice(0, 10); // Limit to 10 results
}

function matchesSearch(item, query, fields) {
    return fields.some(field => {
        const value = item[field];
        return value && value.toString().toLowerCase().includes(query);
    });
}

function displaySearchResults(results, container) {
    if (results.length === 0) {
        container.innerHTML = '<div class="search-no-results">No results found</div>';
        container.style.display = 'block';
        return;
    }

    const icons = {
        dog: '<circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/>',
        heart: '<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>',
        user: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
        clipboard: '<path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>',
        users: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>'
    };

    container.innerHTML = results.map(result => `
        <div class="search-result-item" onclick="goToSearchResult('${result.type}', '${result.id}')">
            <div class="search-result-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    ${icons[result.icon] || icons.user}
                </svg>
            </div>
            <div class="search-result-content">
                <div class="search-result-title">${escapeHtml(result.title)}</div>
                <div class="search-result-subtitle">${escapeHtml(result.subtitle)}</div>
            </div>
            <div class="search-result-type">${result.type}</div>
        </div>
    `).join('');

    container.style.display = 'block';
}

function goToSearchResult(type, id) {
    // Clear search
    document.getElementById('globalSearch').value = '';
    document.getElementById('searchResults').style.display = 'none';

    // Navigate to the appropriate page/view
    switch (type) {
        case 'dog':
            currentDogId = id;
            loadPage('dogs');
            setTimeout(() => viewDogProfile(id), 100);
            break;
        case 'puppy':
            currentPuppyId = id;
            loadPage('puppies');
            setTimeout(() => viewPuppyProfile(id), 100);
            break;
        case 'customer':
            currentCustomerId = id;
            loadPage('customers');
            setTimeout(() => viewCustomerProfile(id), 100);
            break;
        case 'waitlist':
            loadPage('waitlist');
            break;
        case 'litter':
            currentLitterId = id;
            loadPage('litters');
            setTimeout(() => viewLitterDetails(id), 100);
            break;
    }

    // Update sidebar active state
    const sidebarLinks = document.querySelectorAll('.sidebar-nav a[data-page]');
    sidebarLinks.forEach(l => l.classList.remove('active'));
    const activeLink = document.querySelector(`.sidebar-nav a[data-page="${type === 'litter' ? 'litters' : type + 's'}"]`);
    if (activeLink) activeLink.classList.add('active');
}

// Close search results when clicking outside
document.addEventListener('click', (e) => {
    const searchContainer = document.querySelector('.sidebar-search');
    const resultsContainer = document.getElementById('searchResults');
    if (searchContainer && !searchContainer.contains(e.target)) {
        resultsContainer.style.display = 'none';
    }
});

// Initialize sidebar navigation
function initSidebar() {
    const sidebarLinks = document.querySelectorAll('.sidebar-nav a[data-page]');
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('sidebar');

    sidebarLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = link.dataset.page;
            sidebarLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            loadPage(page);
            if (window.innerWidth <= 1024) {
                sidebar.classList.remove('open');
            }
        });
    });

    sidebarToggle?.addEventListener('click', () => {
        sidebar.classList.toggle('open');
    });
}

// Load page content
function loadPage(page) {
    currentPage = page;
    const mainContent = document.getElementById('main-content');

    switch(page) {
        case 'dashboard':
            mainContent.innerHTML = renderDashboard();
            break;
        case 'dogs':
            mainContent.innerHTML = renderDogsPage();
            break;
        case 'litters':
            mainContent.innerHTML = renderLittersPage();
            break;
        case 'puppies':
            mainContent.innerHTML = renderPuppiesPage();
            break;
        case 'customers':
            mainContent.innerHTML = renderCustomersPage();
            break;
        case 'expenses':
            mainContent.innerHTML = renderExpensesPage();
            break;
        case 'vet-records':
            mainContent.innerHTML = renderVetRecordsPage();
            break;
        case 'waitlist':
            mainContent.innerHTML = renderWaitlistPage();
            break;
        case 'reminders':
            mainContent.innerHTML = renderRemindersPage();
            break;
        case 'birthdays':
            mainContent.innerHTML = renderBirthdaysPage();
            break;
        case 'testimonials':
            mainContent.innerHTML = renderTestimonialsPage();
            break;
        case 'gallery':
            mainContent.innerHTML = renderGalleryPage();
            break;
        case 'faq':
            mainContent.innerHTML = renderFaqPage();
            break;
        case 'site-settings':
            mainContent.innerHTML = renderSiteSettingsPage();
            setTimeout(() => {
                initSiteSettingsTabs();
                // Pre-initialize all photo drop zones across all tabs
                initPhotoDropZone('heroImage');
                initPhotoDropZone('breederPhoto');
                initPhotoDropZone('philosophyPhoto');
            }, 100);
            break;
        case 'reports':
            mainContent.innerHTML = renderReportsPage();
            break;
        case 'documents':
            mainContent.innerHTML = renderDocumentsPage();
            break;
        case 'guardian-applications':
            mainContent.innerHTML = renderGuardianApplicationsPage();
            break;
        case 'contact-messages':
            mainContent.innerHTML = renderContactMessagesPage();
            break;
        case 'settings':
            mainContent.innerHTML = renderSettingsPage();
            break;
    }
}

// ============================================
// DASHBOARD
// ============================================
function renderDashboard() {
    const dogs = DB.dogs.getAll();
    const puppies = DB.puppies.getAll();
    const litters = DB.litters.getAll();
    const customers = DB.customers.getAll();
    const availablePuppies = puppies.filter(p => p.status === 'available').length;
    const upcomingBirthdays = DB.birthdays.getUpcoming(30);
    const upcomingReminders = DB.reminders.getUpcoming(14);

    // Get rabies alerts for dogs at home
    const rabiesAlerts = DB.vetRecords.getExpiringRabies(60);
    const expiredRabies = rabiesAlerts.filter(a => a.isExpired || a.noRecord);
    const expiringRabies = rabiesAlerts.filter(a => !a.isExpired && !a.noRecord);

    // Waitlist notifications
    const waitlistEntries = DB.waitlist.getAll();
    const pendingDeposits = waitlistEntries.filter(e => e.status === 'pending');

    // Check for backup reminder (if not backed up in 7 days)
    const settings = DB.settings.get();
    const lastBackup = settings.lastBackupDate ? new Date(settings.lastBackupDate) : null;
    const daysSinceBackup = lastBackup ? Math.floor((new Date() - lastBackup) / (1000 * 60 * 60 * 24)) : null;
    const needsBackup = !lastBackup || daysSinceBackup >= 7;

    // Build notifications array
    const notifications = [];

    if (needsBackup) {
        notifications.push({
            type: 'warning',
            bgColor: 'bg-yellow-500/10',
            borderColor: 'border-l-yellow-500',
            iconColor: 'text-yellow-400',
            icon: 'database',
            title: 'Backup Reminder',
            message: lastBackup ? `Last backup was ${daysSinceBackup} days ago` : 'No backup on record',
            action: 'backupData()',
            actionText: 'Backup Now'
        });
    }

    if (pendingDeposits.length > 0) {
        notifications.push({
            type: 'info',
            bgColor: 'bg-blue-500/10',
            borderColor: 'border-l-blue-500',
            iconColor: 'text-blue-400',
            icon: 'clipboard',
            title: 'Pending Deposits',
            message: `${pendingDeposits.length} waitlist ${pendingDeposits.length === 1 ? 'entry needs' : 'entries need'} deposit confirmation`,
            action: "loadPage('waitlist')",
            actionText: 'View Waitlist'
        });
    }

    if (expiredRabies.length > 0) {
        notifications.push({
            type: 'danger',
            bgColor: 'bg-red-500/10',
            borderColor: 'border-l-red-500',
            iconColor: 'text-red-400',
            icon: 'alert',
            title: 'Expired Vaccinations',
            message: `${expiredRabies.length} ${expiredRabies.length === 1 ? 'dog has' : 'dogs have'} expired or missing rabies records`,
            action: "loadPage('vet-records')",
            actionText: 'Update Records'
        });
    }

    if (expiringRabies.length > 0) {
        notifications.push({
            type: 'warning',
            bgColor: 'bg-yellow-500/10',
            borderColor: 'border-l-yellow-500',
            iconColor: 'text-yellow-400',
            icon: 'clock',
            title: 'Vaccinations Expiring Soon',
            message: `${expiringRabies.length} ${expiringRabies.length === 1 ? 'dog\'s vaccination expires' : 'dogs\' vaccinations expire'} within 60 days`,
            action: "loadPage('vet-records')",
            actionText: 'View Records'
        });
    }

    // Icon SVGs for notifications
    const notificationIcons = {
        database: '<svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>',
        clipboard: '<svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>',
        alert: '<svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
        clock: '<svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>'
    };

    return `
        <!-- Dashboard Header -->
        <div class="mb-8">
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 class="text-2xl font-bold text-white mb-2">Dashboard</h1>
                    <p class="text-gray-400">Welcome back! Here's an overview of your breeding program.</p>
                </div>
                <div class="flex gap-3">
                    <button onclick="backupData()" class="px-4 py-2 bg-brand-card text-gray-300 font-semibold rounded-lg hover:bg-brand-darker transition-colors flex items-center gap-2">
                        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                            <polyline points="7 10 12 15 17 10"/>
                            <line x1="12" y1="15" x2="12" y2="3"/>
                        </svg>
                        Backup
                    </button>
                    <button onclick="openAddDogModal()" class="px-4 py-2 bg-brand-gold text-brand-dark font-semibold rounded-lg hover:bg-brand-gold-light transition-colors">
                        + Add Dog
                    </button>
                </div>
            </div>
        </div>

        <!-- Notifications -->
        ${notifications.length > 0 ? `
        <div class="space-y-3 mb-8">
            ${notifications.map(n => `
                <div class="flex items-center gap-4 p-4 ${n.bgColor} rounded-xl border-l-4 ${n.borderColor}">
                    <div class="w-10 h-10 rounded-full ${n.bgColor} flex items-center justify-center ${n.iconColor}">
                        ${notificationIcons[n.icon]}
                    </div>
                    <div class="flex-1">
                        <p class="font-semibold text-white">${n.title}</p>
                        <p class="text-sm text-gray-400">${n.message}</p>
                    </div>
                    <button onclick="${n.action}" class="px-3 py-1.5 text-sm bg-brand-card text-gray-300 rounded-lg hover:bg-brand-darker transition-colors">
                        ${n.actionText}
                    </button>
                </div>
            `).join('')}
        </div>
        ` : ''}

        <!-- Stats Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div class="bg-brand-card rounded-xl p-6">
                <div class="flex items-center justify-between mb-4">
                    <div class="w-12 h-12 bg-brand-gold/20 rounded-full flex items-center justify-center">
                        <svg class="w-6 h-6 text-brand-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="10"/>
                            <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
                        </svg>
                    </div>
                    <span class="text-green-400 text-sm">Active</span>
                </div>
                <p class="text-3xl font-bold text-white mb-1">${dogs.length}</p>
                <p class="text-gray-500 text-sm">Total Dogs</p>
            </div>

            <div class="bg-brand-card rounded-xl p-6">
                <div class="flex items-center justify-between mb-4">
                    <div class="w-12 h-12 bg-brand-gold/20 rounded-full flex items-center justify-center">
                        <svg class="w-6 h-6 text-brand-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                        </svg>
                    </div>
                    <span class="text-blue-400 text-sm">Available</span>
                </div>
                <p class="text-3xl font-bold text-white mb-1">${availablePuppies}</p>
                <p class="text-gray-500 text-sm">Available Puppies</p>
            </div>

            <div class="bg-brand-card rounded-xl p-6">
                <div class="flex items-center justify-between mb-4">
                    <div class="w-12 h-12 bg-brand-gold/20 rounded-full flex items-center justify-center">
                        <svg class="w-6 h-6 text-brand-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
                            <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
                        </svg>
                    </div>
                    <span class="text-yellow-400 text-sm">Pending</span>
                </div>
                <p class="text-3xl font-bold text-white mb-1">${waitlistEntries.length}</p>
                <p class="text-gray-500 text-sm">Waitlist Entries</p>
            </div>

            <div class="bg-brand-card rounded-xl p-6">
                <div class="flex items-center justify-between mb-4">
                    <div class="w-12 h-12 bg-brand-gold/20 rounded-full flex items-center justify-center">
                        <svg class="w-6 h-6 text-brand-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                            <circle cx="9" cy="7" r="4"/>
                        </svg>
                    </div>
                    <span class="text-purple-400 text-sm">Total</span>
                </div>
                <p class="text-3xl font-bold text-white mb-1">${customers.length}</p>
                <p class="text-gray-500 text-sm">Happy Families</p>
            </div>
        </div>

        <!-- Quick Actions -->
        <div class="mb-8">
            <h2 class="text-lg font-semibold text-white mb-4">Quick Actions</h2>
            <div class="flex flex-wrap gap-3">
                <button onclick="openAddDogModal()" class="px-4 py-2 bg-brand-gold text-brand-dark font-semibold rounded-lg hover:bg-brand-gold-light transition-colors">
                    Add New Dog
                </button>
                <button onclick="loadPage('litters')" class="px-4 py-2 bg-brand-card text-gray-300 font-semibold rounded-lg hover:bg-brand-darker transition-colors">
                    Add New Litter
                </button>
                <button onclick="loadPage('waitlist')" class="px-4 py-2 bg-brand-card text-gray-300 font-semibold rounded-lg hover:bg-brand-darker transition-colors">
                    View Waitlist
                </button>
                <button onclick="loadPage('expenses')" class="px-4 py-2 bg-brand-card text-gray-300 font-semibold rounded-lg hover:bg-brand-darker transition-colors">
                    Add Expense
                </button>
            </div>
        </div>

        <!-- Two Column Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Recent Dogs -->
            <div class="bg-brand-card rounded-xl overflow-hidden">
                <div class="flex items-center justify-between p-4 border-b border-brand-darker">
                    <h3 class="font-semibold text-white">Recent Dogs</h3>
                    <button onclick="loadPage('dogs')" class="text-sm text-brand-gold hover:text-brand-gold-light">View All</button>
                </div>
                <div class="divide-y divide-brand-darker">
                    ${dogs.length > 0 ? dogs.slice(0, 5).map(dog => `
                        <div class="flex items-center gap-4 p-4 hover:bg-brand-darker/50 transition-colors cursor-pointer" onclick="viewDogDetails('${dog.id}')">
                            <div class="w-10 h-10 bg-brand-gold/20 rounded-full flex items-center justify-center overflow-hidden">
                                ${dog.photo_url ? `<img src="${dog.photo_url}" alt="${escapeHtml(dog.name)}" class="w-full h-full object-cover">` : `<span class="text-brand-gold font-semibold">${escapeHtml(dog.name?.charAt(0) || '?')}</span>`}
                            </div>
                            <div class="flex-1 min-w-0">
                                <p class="font-medium text-white truncate">${escapeHtml(dog.name)}</p>
                                <p class="text-sm text-gray-500">${escapeHtml(dog.breed || 'Unknown breed')}</p>
                            </div>
                            <span class="px-2 py-1 text-xs rounded-full ${dog.status === 'active' ? 'bg-green-500/20 text-green-400' : dog.status === 'guardian' ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-500/20 text-gray-400'}">${escapeHtml(dog.status || 'Active')}</span>
                        </div>
                    `).join('') : `
                        <div class="p-8 text-center text-gray-500">
                            <p>No dogs yet. Add your first dog!</p>
                        </div>
                    `}
                </div>
            </div>

            <!-- Upcoming Events -->
            <div class="bg-brand-card rounded-xl overflow-hidden">
                <div class="flex items-center justify-between p-4 border-b border-brand-darker">
                    <h3 class="font-semibold text-white">Upcoming</h3>
                    <button onclick="loadPage('reminders')" class="text-sm text-brand-gold hover:text-brand-gold-light">View All</button>
                </div>
                <div class="divide-y divide-brand-darker">
                    ${(upcomingBirthdays.length > 0 || upcomingReminders.length > 0) ? `
                        ${upcomingBirthdays.slice(0, 3).map(b => `
                            <div class="flex items-center gap-4 p-4">
                                <div class="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center">
                                    <svg class="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                                        <line x1="16" y1="2" x2="16" y2="6"/>
                                        <line x1="8" y1="2" x2="8" y2="6"/>
                                    </svg>
                                </div>
                                <div class="flex-1 min-w-0">
                                    <p class="font-medium text-white truncate">${escapeHtml(b.entity.name)}'s Birthday</p>
                                    <p class="text-sm text-gray-500">Turning ${b.age} years old</p>
                                </div>
                                <span class="text-sm text-gray-400">${b.daysUntil === 0 ? 'Today!' : b.daysUntil + ' days'}</span>
                            </div>
                        `).join('')}
                        ${upcomingReminders.slice(0, 3).map(r => `
                            <div class="flex items-center gap-4 p-4">
                                <div class="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                                    <svg class="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                                    </svg>
                                </div>
                                <div class="flex-1 min-w-0">
                                    <p class="font-medium text-white truncate">${escapeHtml(r.title)}</p>
                                    <p class="text-sm text-gray-500 truncate">${escapeHtml(r.description || '')}</p>
                                </div>
                                <span class="text-sm text-gray-400">${formatShortDate(r.date)}</span>
                            </div>
                        `).join('')}
                    ` : `
                        <div class="p-8 text-center text-gray-500">
                            <p>No upcoming events</p>
                        </div>
                    `}
                </div>
            </div>
        </div>
    `;
}

// ============================================
// DOGS PAGE
// ============================================
function renderDogsPage() {
    const dogs = DB.dogs.getAll();

    return `
        <!-- Page Header -->
        <div class="mb-8">
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 class="text-2xl font-bold text-white mb-2">Dogs</h1>
                    <p class="text-gray-400">Manage your breeding dogs</p>
                </div>
                <div class="flex items-center gap-3">
                    <div class="relative">
                        <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <circle cx="11" cy="11" r="8"/>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                        </svg>
                        <input type="text" placeholder="Search dogs..." onkeyup="searchDogs(this.value)"
                            class="pl-9 pr-4 py-2 bg-brand-card border border-brand-card rounded-lg text-sm text-gray-300 placeholder-gray-500 focus:outline-none focus:border-brand-gold w-48">
                    </div>
                    <button onclick="openAddDogModal()" class="px-4 py-2 bg-brand-gold text-brand-dark font-semibold rounded-lg hover:bg-brand-gold-light transition-colors">
                        + Add Dog
                    </button>
                </div>
            </div>
        </div>

        <!-- Dogs List -->
        <div class="bg-brand-card rounded-xl overflow-hidden">
            <div id="dogsTableContainer">
                ${renderDogsTable(dogs)}
            </div>
        </div>
    `;
}

function renderDogsTable(dogs) {
    if (dogs.length === 0) {
        return `
            <div class="p-12 text-center">
                <div class="w-16 h-16 bg-brand-gold/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg class="w-8 h-8 text-brand-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10"/>
                        <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
                    </svg>
                </div>
                <p class="text-gray-400 mb-4">No dogs added yet</p>
                <button onclick="openAddDogModal()" class="px-4 py-2 bg-brand-gold text-brand-dark font-semibold rounded-lg hover:bg-brand-gold-light transition-colors">
                    Add Your First Dog
                </button>
            </div>
        `;
    }

    return `
        <div class="overflow-x-auto">
            <table class="w-full">
                <thead class="bg-brand-darker">
                    <tr>
                        <th class="text-left px-4 py-3 text-sm font-semibold text-gray-400">Dog</th>
                        <th class="text-left px-4 py-3 text-sm font-semibold text-gray-400">Breed</th>
                        <th class="text-left px-4 py-3 text-sm font-semibold text-gray-400">Gender</th>
                        <th class="text-left px-4 py-3 text-sm font-semibold text-gray-400">Age</th>
                        <th class="text-left px-4 py-3 text-sm font-semibold text-gray-400">Status</th>
                        <th class="text-left px-4 py-3 text-sm font-semibold text-gray-400">Visibility</th>
                        <th class="text-right px-4 py-3 text-sm font-semibold text-gray-400">Actions</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-brand-darker">
                    ${dogs.map(dog => `
                        <tr class="hover:bg-brand-darker/50 transition-colors">
                            <td class="px-4 py-3">
                                <div class="flex items-center gap-3">
                                    <div class="w-10 h-10 bg-brand-gold/20 rounded-full flex items-center justify-center overflow-hidden">
                                        ${dog.photo_url
                                            ? `<img src="${dog.photo_url}" class="w-full h-full object-cover" alt="${escapeHtml(dog.name)}">`
                                            : `<span class="text-brand-gold font-semibold">${escapeHtml(dog.name?.charAt(0) || '?')}</span>`
                                        }
                                    </div>
                                    <span class="font-medium text-white">${escapeHtml(dog.name)}</span>
                                </div>
                            </td>
                            <td class="px-4 py-3 text-gray-400">${escapeHtml(dog.breed || 'N/A')}</td>
                            <td class="px-4 py-3 text-gray-400">${dog.gender === 'female' ? 'Female' : 'Male'}</td>
                            <td class="px-4 py-3 text-gray-400">${dog.birthday ? calculateAge(dog.birthday) : 'N/A'}</td>
                            <td class="px-4 py-3">
                                <span class="px-2 py-1 text-xs rounded-full ${dog.is_breeding !== false ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}">
                                    ${dog.is_breeding !== false ? 'Breeding' : 'Retired'}
                                </span>
                            </td>
                            <td class="px-4 py-3">
                                <span class="px-2 py-1 text-xs rounded-full ${dog.is_public !== false ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-500/20 text-gray-400'}">
                                    ${dog.is_public !== false ? 'Public' : 'Private'}
                                </span>
                            </td>
                            <td class="px-4 py-3">
                                <div class="flex items-center justify-end gap-2">
                                    <button onclick="viewDogDetails('${dog.id}')" class="p-2 text-gray-400 hover:text-white hover:bg-brand-darker rounded-lg transition-colors" title="View">
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                            <circle cx="12" cy="12" r="3"/>
                                        </svg>
                                    </button>
                                    <button onclick="openEditDogModal('${dog.id}')" class="p-2 text-gray-400 hover:text-blue-400 hover:bg-brand-darker rounded-lg transition-colors" title="Edit">
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                        </svg>
                                    </button>
                                    <button onclick="confirmDeleteDog('${dog.id}')" class="p-2 text-gray-400 hover:text-red-400 hover:bg-brand-darker rounded-lg transition-colors" title="Delete">
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <polyline points="3 6 5 6 21 6"/>
                                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                                        </svg>
                                    </button>
                                </div>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table></div>
    `;
}

function searchDogs(query) {
    const dogs = DB.dogs.getAll().filter(dog =>
        dog.name.toLowerCase().includes(query.toLowerCase()) ||
        (dog.breed && dog.breed.toLowerCase().includes(query.toLowerCase()))
    );
    document.getElementById('dogsTableContainer').innerHTML = renderDogsTable(dogs);
}

// ============================================
// DOG PROFILE VIEW
// ============================================
function viewDogProfile(dogId) {
    currentDogId = dogId;
    const dog = DB.dogs.getById(dogId);
    if (!dog) return;

    const litters = DB.litters.getByDog(dogId);
    const files = DB.files.getByEntity('dog', dogId);

    // Handle photos array (backwards compatibility)
    const photos = dog.photos || (dog.photo ? [dog.photo] : []);
    const hasPhotos = photos.length > 0;

    document.getElementById('main-content').innerHTML = `
        <div class="admin-page-header">
            <h1>
                <a href="#" onclick="loadPage('dogs'); return false;" style="color: var(--text-muted);">Dogs</a> / ${escapeHtml(dog.name)}
            </h1>
            <div class="header-actions">
                <button class="btn btn-outline" onclick="openEditDogModal('${dogId}')">Edit Profile</button>
                <button class="btn btn-primary" onclick="openAddVetVisitModal('${dogId}')">+ Add Vet Visit</button>
            </div>
        </div>

        <div class="profile-header">
            ${hasPhotos ? `
                <div class="photo-gallery-container">
                    <div class="gallery-main">
                        <img src="${photos[0]}" class="profile-photo" alt="${escapeHtml(dog.name)}" id="mainDogPhoto">
                        ${photos.length > 1 ? `
                            <button class="gallery-nav gallery-prev" onclick="changeDogPhoto(-1)">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <polyline points="15 18 9 12 15 6"/>
                                </svg>
                            </button>
                            <button class="gallery-nav gallery-next" onclick="changeDogPhoto(1)">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <polyline points="9 18 15 12 9 6"/>
                                </svg>
                            </button>
                        ` : ''}
                    </div>
                    ${photos.length > 1 ? `
                        <div class="gallery-thumbnails">
                            ${photos.map((photo, index) => `
                                <img src="${photo}" class="gallery-thumb ${index === 0 ? 'active' : ''}"
                                     alt="Photo ${index + 1}" onclick="setDogPhoto(${index})"
                                     data-index="${index}">
                            `).join('')}
                        </div>
                    ` : ''}
                </div>
            ` : `
                <div class="profile-photo-placeholder">
                    <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
                        <circle cx="12" cy="12" r="10"/>
                    </svg>
                </div>
            `}
            <div class="profile-info">
                <h1>${escapeHtml(dog.name)}</h1>
                <p class="breed">${escapeHtml(dog.breed || 'Breed not specified')}</p>
                <div class="profile-meta">
                    <div class="profile-meta-item">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                            <line x1="16" y1="2" x2="16" y2="6"/>
                            <line x1="8" y1="2" x2="8" y2="6"/>
                        </svg>
                        ${dog.birthday ? formatDate(dog.birthday) + ' (' + calculateAge(dog.birthday) + ')' : 'Birthday not set'}
                    </div>
                    <div class="profile-meta-item">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"/>
                        </svg>
                        ${dog.gender === 'female' ? 'Female' : 'Male'}
                    </div>
                    ${dog.weight ? `
                    <div class="profile-meta-item">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M12 3v18"/>
                            <path d="M8 6l4-3 4 3"/>
                        </svg>
                        ${dog.weight} lbs
                    </div>
                    ` : ''}
                </div>
                <div class="profile-badges">
                    <span class="status-badge status-${dog.isBreeding ? 'active' : 'retired'}">${dog.isBreeding ? 'Breeding' : 'Retired'}</span>
                    <span class="status-badge status-${dog.isPublic ? 'public' : 'private'}">${dog.isPublic ? 'Public' : 'Private'}</span>
                    ${dog.isGuardian ? '<span class="status-badge status-guardian">Guardian Home</span>' : ''}
                </div>
            </div>
        </div>

        ${dog.gender === 'female' && dog.isBreeding ? renderHeatTracker(dog) : ''}

        <div class="admin-tabs">
            <button class="admin-tab active" onclick="switchDogTab('info', this)">Information</button>
            <button class="admin-tab" onclick="switchDogTab('litters', this)">Litters (${litters.length})</button>
            <button class="admin-tab" onclick="switchDogTab('health', this)">Health Records</button>
            <button class="admin-tab" onclick="switchDogTab('documents', this)">Documents (${files.length})</button>
        </div>

        <div id="dogTabContent">
            ${renderDogInfoTab(dog)}
        </div>
    `;

    // Store photos for gallery navigation
    window.dogPhotos = photos;
    window.currentPhotoIndex = 0;
}

// Photo gallery navigation functions
function setDogPhoto(index) {
    if (!window.dogPhotos || index < 0 || index >= window.dogPhotos.length) return;

    window.currentPhotoIndex = index;
    document.getElementById('mainDogPhoto').src = window.dogPhotos[index];

    // Update thumbnail active states
    document.querySelectorAll('.gallery-thumb').forEach((thumb, i) => {
        thumb.classList.toggle('active', i === index);
    });
}

function changeDogPhoto(direction) {
    if (!window.dogPhotos) return;

    let newIndex = window.currentPhotoIndex + direction;
    if (newIndex < 0) newIndex = window.dogPhotos.length - 1;
    if (newIndex >= window.dogPhotos.length) newIndex = 0;

    setDogPhoto(newIndex);
}

function switchDogTab(tab, btn) {
    document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');

    const dog = DB.dogs.getById(currentDogId);
    const content = document.getElementById('dogTabContent');

    switch(tab) {
        case 'info':
            content.innerHTML = renderDogInfoTab(dog);
            break;
        case 'litters':
            content.innerHTML = renderDogLittersTab(dog);
            break;
        case 'health':
            content.innerHTML = renderDogHealthTab(dog);
            break;
        case 'documents':
            content.innerHTML = renderDogDocumentsTab(dog);
            break;
    }
}

function renderDogInfoTab(dog) {
    // Build guardian family section if applicable
    let guardianHtml = '';
    if (dog.isGuardian && dog.guardianFamily) {
        const gf = dog.guardianFamily;
        guardianHtml = `
            <div class="admin-card" style="margin-top: 1.5rem;">
                <div class="admin-card-header">
                    <h2>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 0.5rem; vertical-align: middle;">
                            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                            <polyline points="9 22 9 12 15 12 15 22"/>
                        </svg>
                        Guardian Family
                    </h2>
                </div>
                <div class="admin-card-body">
                    <div class="guardian-family-info" style="display: flex; gap: 2rem; align-items: flex-start;">
                        ${gf.photo ? `
                            <img src="${gf.photo}" alt="${escapeHtml(gf.name || 'Guardian Family')}"
                                 style="width: 150px; height: 150px; object-fit: cover; border-radius: 8px; flex-shrink: 0;">
                        ` : `
                            <div style="width: 150px; height: 150px; background: var(--bg-secondary); border-radius: 8px;
                                        display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="1">
                                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                                    <circle cx="9" cy="7" r="4"/>
                                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                                    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                                </svg>
                            </div>
                        `}
                        <div style="flex: 1;">
                            ${gf.name ? `<h3 style="color: var(--accent-gold); margin-bottom: 0.5rem;">${escapeHtml(gf.name)}</h3>` : ''}
                            ${gf.location ? `
                                <p style="color: var(--text-muted); margin-bottom: 1rem;">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: middle; margin-right: 0.25rem;">
                                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                                        <circle cx="12" cy="10" r="3"/>
                                    </svg>
                                    ${escapeHtml(gf.location)}
                                </p>
                            ` : ''}
                            ${gf.notes ? `<p style="color: var(--text-secondary); line-height: 1.6;">${escapeHtml(gf.notes)}</p>` : ''}
                            ${!gf.name && !gf.notes ? '<p style="color: var(--text-muted);">No details provided about this guardian family.</p>' : ''}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    return `
        <div class="admin-card">
            <div class="admin-card-header"><h2>Basic Information</h2></div>
            <div class="admin-card-body">
                <div class="info-grid">
                    <div class="info-item"><label>Name</label><span>${escapeHtml(dog.name)}</span></div>
                    <div class="info-item"><label>Breed</label><span>${escapeHtml(dog.breed || 'N/A')}</span></div>
                    <div class="info-item"><label>Color</label><span>${escapeHtml(dog.color || 'N/A')}</span></div>
                    <div class="info-item"><label>Weight</label><span>${dog.weight ? dog.weight + ' lbs' : 'N/A'}</span></div>
                    <div class="info-item"><label>Birthday</label><span>${dog.birthday ? formatDate(dog.birthday) : 'N/A'}</span></div>
                    <div class="info-item"><label>Registration #</label><span>${escapeHtml(dog.registrationNumber || 'N/A')}</span></div>
                    <div class="info-item"><label>Microchip #</label><span>${escapeHtml(dog.microchip || 'N/A')}</span></div>
                </div>
                ${dog.description ? `<div style="margin-top: 1.5rem;"><label style="display:block;margin-bottom:0.5rem;color:var(--text-muted);font-size:0.85rem;">Description</label><p style="color:var(--text-secondary);">${escapeHtml(dog.description)}</p></div>` : ''}
                ${dog.notes ? `<div style="margin-top: 1rem;"><label style="display:block;margin-bottom:0.5rem;color:var(--text-muted);font-size:0.85rem;">Notes</label><p style="color:var(--text-secondary);">${escapeHtml(dog.notes)}</p></div>` : ''}
            </div>
        </div>
        ${guardianHtml}
    `;
}

function renderHeatTracker(dog) {
    if (!dog.lastHeatDate) {
        return `
            <div class="heat-tracker">
                <h3><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> Heat Cycle Tracker</h3>
                <p style="color: var(--text-muted);">No heat cycle data recorded. <a href="#" onclick="openEditDogModal('${dog.id}'); return false;">Add heat cycle information</a></p>
            </div>
        `;
    }

    const nextHeat = DB.heatCycle.calculateNextHeat(dog.lastHeatDate, dog.cycleLength || 180);
    const daysUntil = DB.heatCycle.getDaysUntilHeat(nextHeat);

    return `
        <div class="heat-tracker">
            <h3><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> Heat Cycle Tracker</h3>
            <div class="heat-info">
                <div class="heat-info-item">
                    <label>Last Heat</label>
                    <div class="value">${formatShortDate(dog.lastHeatDate)}</div>
                </div>
                <div class="heat-info-item">
                    <label>Next Expected</label>
                    <div class="value">${formatShortDate(nextHeat)}</div>
                </div>
                <div class="heat-info-item">
                    <label>Days Until</label>
                    <div class="value ${daysUntil <= 14 ? 'warning' : ''}">${daysUntil}</div>
                </div>
            </div>
        </div>
    `;
}

function renderDogLittersTab(dog) {
    const litters = DB.litters.getByDog(dog.id);

    if (litters.length === 0) {
        return `
            <div class="admin-empty-state">
                <p>No litters recorded for this dog</p>
                <button class="btn btn-primary" onclick="openAddLitterModal('${dog.id}')">Add Litter</button>
            </div>
        `;
    }

    return `
        <div style="margin-bottom: 1rem; text-align: right;">
            <button class="btn btn-primary" onclick="openAddLitterModal('${dog.id}')">+ Add Litter</button>
        </div>
        ${litters.map(litter => {
            const mother = DB.dogs.getById(litter.motherId);
            const father = DB.dogs.getById(litter.fatherId);
            const puppies = DB.puppies.getByLitter(litter.id);
            const available = puppies.filter(p => p.status === 'available').length;
            const reserved = puppies.filter(p => p.status === 'reserved').length;
            const sold = puppies.filter(p => p.status === 'sold' || p.status === 'adopted').length;

            return `
                <div class="litter-card">
                    <div class="litter-header">
                        <div>
                            <h4>${escapeHtml(litter.name || 'Litter')}</h4>
                            <div class="litter-parents">${mother?.name || 'Unknown'} x ${father?.name || 'Unknown'}</div>
                        </div>
                        <div>
                            <span class="status-badge status-${litter.isPublic ? 'public' : 'private'}">${litter.isPublic ? 'Public' : 'Private'}</span>
                        </div>
                    </div>
                    <p style="color: var(--text-secondary); margin: 0.5rem 0;">Born: ${litter.birthDate ? formatDate(litter.birthDate) : 'TBD'}</p>
                    <div class="litter-stats">
                        <div class="litter-stat"><div class="number">${puppies.length}</div><div class="label">Total</div></div>
                        <div class="litter-stat"><div class="number" style="color: var(--success);">${available}</div><div class="label">Available</div></div>
                        <div class="litter-stat"><div class="number" style="color: var(--warning);">${reserved}</div><div class="label">Reserved</div></div>
                        <div class="litter-stat"><div class="number" style="color: var(--danger);">${sold}</div><div class="label">Sold</div></div>
                    </div>
                    <div style="margin-top: 1rem; display: flex; gap: 0.5rem;">
                        <button class="btn btn-small btn-outline" onclick="viewLitterProfile('${litter.id}')">View Litter</button>
                        <button class="btn btn-small btn-outline" onclick="openAddPuppyModal('${litter.id}')">+ Add Puppy</button>
                    </div>
                </div>
            `;
        }).join('')}
    `;
}

function renderDogHealthTab(dog) {
    const vetVisits = dog.vetVisits || [];

    return `
        <div style="margin-bottom: 1rem; text-align: right;">
            <button class="btn btn-primary" onclick="openAddVetVisitModal('${dog.id}')">+ Add Vet Visit</button>
        </div>
        <div class="admin-card">
            <div class="admin-card-header"><h2>Vet Visit History</h2></div>
            <div class="admin-card-body">
                ${vetVisits.length === 0 ? '<p style="color: var(--text-muted);">No vet visits recorded</p>' : `
                    <div class="timeline">
                        ${vetVisits.sort((a, b) => new Date(b.date) - new Date(a.date)).map(visit => `
                            <div class="timeline-item">
                                <div class="timeline-date">${formatDate(visit.date)}</div>
                                <div class="timeline-content">
                                    <h4>${escapeHtml(visit.reason)}</h4>
                                    ${visit.notes ? `<p>${escapeHtml(visit.notes)}</p>` : ''}
                                    ${visit.veterinarian ? `<p style="font-size: 0.85rem; color: var(--text-muted);">Vet: ${escapeHtml(visit.veterinarian)}</p>` : ''}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                `}
            </div>
        </div>
    `;
}

function renderDogDocumentsTab(dog) {
    const files = DB.files.getByEntity('dog', dog.id);

    return `
        <div style="margin-bottom: 1rem; text-align: right;">
            <button class="btn btn-primary" onclick="openUploadDocumentModal('dog', '${dog.id}')">+ Upload Document</button>
        </div>
        <div class="admin-card">
            <div class="admin-card-body">
                ${files.length === 0 ? '<p style="color: var(--text-muted);">No documents uploaded</p>' : `
                    <div class="file-preview" style="flex-wrap: wrap; gap: 1rem;">
                        ${files.map(file => `
                            <div style="background: var(--bg-secondary); padding: 1rem; border-radius: 8px; display: flex; align-items: center; gap: 1rem;">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent-gold)" stroke-width="2">
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                                    <polyline points="14 2 14 8 20 8"/>
                                </svg>
                                <div>
                                    <div style="font-weight: 500;">${escapeHtml(file.name)}</div>
                                    <div style="font-size: 0.8rem; color: var(--text-muted);">${escapeHtml(file.type || 'Document')}</div>
                                </div>
                                <button class="icon-btn delete" onclick="deleteFile('${file.id}')" style="margin-left: auto;">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                                    </svg>
                                </button>
                            </div>
                        `).join('')}
                    </div>
                `}
            </div>
        </div>
    `;
}

// ============================================
// LITTERS PAGE
// ============================================
function renderLittersPage() {
    const litters = DB.litters.getAll();

    return `
        <!-- Page Header -->
        <div class="mb-8">
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 class="text-2xl font-bold text-white mb-2">Litters</h1>
                    <p class="text-gray-400">Manage your litters and puppies</p>
                </div>
                <button onclick="openAddLitterModal()" class="px-4 py-2 bg-brand-gold text-brand-dark font-semibold rounded-lg hover:bg-brand-gold-light transition-colors">
                    + Add Litter
                </button>
            </div>
        </div>

        ${litters.length === 0 ? `
            <div class="bg-brand-card rounded-xl p-12 text-center">
                <div class="w-16 h-16 bg-brand-gold/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg class="w-8 h-8 text-brand-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                        <circle cx="9" cy="7" r="4"/>
                    </svg>
                </div>
                <p class="text-gray-400 mb-4">No litters recorded yet</p>
                <button onclick="openAddLitterModal()" class="px-4 py-2 bg-brand-gold text-brand-dark font-semibold rounded-lg hover:bg-brand-gold-light transition-colors">
                    Add Your First Litter
                </button>
            </div>
        ` : `
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                ${litters.map(litter => {
                    const mother = DB.dogs.getById(litter.mother_id);
                    const father = DB.dogs.getById(litter.father_id);
                    const puppies = DB.puppies.getByLitter(litter.id);

                    return `
                        <div class="bg-brand-card rounded-xl p-6 cursor-pointer hover:bg-brand-darker/50 transition-colors" onclick="viewLitterProfile('${litter.id}')">
                            <div class="flex items-start justify-between mb-4">
                                <div>
                                    <h3 class="font-semibold text-white text-lg">${escapeHtml(litter.name || 'Litter')}</h3>
                                    <p class="text-gray-400 text-sm">${mother?.name || 'Unknown'} x ${father?.name || 'Unknown'}</p>
                                </div>
                                <span class="px-2 py-1 text-xs rounded-full ${litter.is_public !== false ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-500/20 text-gray-400'}">
                                    ${litter.is_public !== false ? 'Public' : 'Private'}
                                </span>
                            </div>
                            <div class="flex items-center gap-4 text-sm text-gray-500">
                                <span>Born: ${litter.birth_date ? formatDate(litter.birth_date) : 'TBD'}</span>
                                <span>•</span>
                                <span>${puppies.length} puppies</span>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `}
    `;
}

// ============================================
// PUPPIES PAGE
// ============================================
function renderPuppiesPage() {
    const puppies = DB.puppies.getAll();

    return `
        <!-- Page Header -->
        <div class="mb-8">
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 class="text-2xl font-bold text-white mb-2">Puppies</h1>
                    <p class="text-gray-400">Manage available and sold puppies</p>
                </div>
                <div class="flex items-center gap-3">
                    <div class="relative">
                        <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <circle cx="11" cy="11" r="8"/>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                        </svg>
                        <input type="text" placeholder="Search puppies..." onkeyup="searchPuppies(this.value)"
                            class="pl-9 pr-4 py-2 bg-brand-card border border-brand-card rounded-lg text-sm text-gray-300 placeholder-gray-500 focus:outline-none focus:border-brand-gold w-48">
                    </div>
                    <button onclick="openAddPuppyModal()" class="px-4 py-2 bg-brand-gold text-brand-dark font-semibold rounded-lg hover:bg-brand-gold-light transition-colors">
                        + Add Puppy
                    </button>
                </div>
            </div>
        </div>

        <!-- Puppies Grid -->
        <div id="puppiesTableContainer">
            ${renderPuppiesTable(puppies)}
        </div>
    `;
}

function renderPuppiesTable(puppies) {
    if (puppies.length === 0) {
        return `
            <div class="bg-brand-card rounded-xl p-12 text-center">
                <div class="w-16 h-16 bg-brand-gold/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg class="w-8 h-8 text-brand-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                </div>
                <p class="text-gray-400 mb-4">No puppies added yet</p>
                <button onclick="openAddPuppyModal()" class="px-4 py-2 bg-brand-gold text-brand-dark font-semibold rounded-lg hover:bg-brand-gold-light transition-colors">
                    Add Your First Puppy
                </button>
            </div>
        `;
    }

    const statusColors = {
        available: 'bg-green-500/20 text-green-400',
        reserved: 'bg-yellow-500/20 text-yellow-400',
        sold: 'bg-blue-500/20 text-blue-400',
        kept: 'bg-purple-500/20 text-purple-400'
    };

    return `
        <div class="bg-brand-card rounded-xl overflow-hidden">
            <div class="overflow-x-auto">
                <table class="w-full">
                    <thead class="bg-brand-darker">
                        <tr>
                            <th class="text-left px-4 py-3 text-sm font-semibold text-gray-400">Puppy</th>
                            <th class="text-left px-4 py-3 text-sm font-semibold text-gray-400">Litter</th>
                            <th class="text-left px-4 py-3 text-sm font-semibold text-gray-400">Gender</th>
                            <th class="text-left px-4 py-3 text-sm font-semibold text-gray-400">Color</th>
                            <th class="text-left px-4 py-3 text-sm font-semibold text-gray-400">Status</th>
                            <th class="text-left px-4 py-3 text-sm font-semibold text-gray-400">Price</th>
                            <th class="text-right px-4 py-3 text-sm font-semibold text-gray-400">Actions</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-brand-darker">
                        ${puppies.map(puppy => {
                            const litter = DB.litters.getById(puppy.litter_id);
                            return `
                                <tr class="hover:bg-brand-darker/50 transition-colors">
                                    <td class="px-4 py-3">
                                        <div class="flex items-center gap-3">
                                            <div class="w-10 h-10 bg-brand-gold/20 rounded-full flex items-center justify-center overflow-hidden">
                                                ${puppy.photo_url
                                                    ? `<img src="${puppy.photo_url}" class="w-full h-full object-cover" alt="${escapeHtml(puppy.name || 'Puppy')}">`
                                                    : `<span class="text-brand-gold font-semibold">${escapeHtml((puppy.name || 'P').charAt(0))}</span>`
                                                }
                                            </div>
                                            <span class="font-medium text-white">${escapeHtml(puppy.name || 'Unnamed')}</span>
                                        </div>
                                    </td>
                                    <td class="px-4 py-3 text-gray-400">${litter ? escapeHtml(litter.name || 'Litter') : 'N/A'}</td>
                                    <td class="px-4 py-3 text-gray-400">${puppy.gender === 'female' ? 'Female' : 'Male'}</td>
                                    <td class="px-4 py-3 text-gray-400">${escapeHtml(puppy.color || 'N/A')}</td>
                                    <td class="px-4 py-3">
                                        <span class="px-2 py-1 text-xs rounded-full ${statusColors[puppy.status] || 'bg-gray-500/20 text-gray-400'}">
                                            ${escapeHtml(puppy.status || 'Unknown')}
                                        </span>
                                    </td>
                                    <td class="px-4 py-3 text-gray-400">${puppy.price ? '$' + Number(puppy.price).toLocaleString() : 'N/A'}</td>
                                    <td class="px-4 py-3">
                                        <div class="flex items-center justify-end gap-2">
                                            <button onclick="previewPuppy('${puppy.id}')" class="p-2 text-gray-400 hover:text-green-400 hover:bg-brand-darker rounded-lg transition-colors" title="Preview on Website">
                                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                                                    <polyline points="15 3 21 3 21 9"/>
                                                    <line x1="10" y1="14" x2="21" y2="3"/>
                                                </svg>
                                            </button>
                                            <button onclick="viewPuppyProfile('${puppy.id}')" class="p-2 text-gray-400 hover:text-white hover:bg-brand-darker rounded-lg transition-colors" title="View Details">
                                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                                    <circle cx="12" cy="12" r="3"/>
                                                </svg>
                                            </button>
                                            <button onclick="openEditPuppyModal('${puppy.id}')" class="p-2 text-gray-400 hover:text-blue-400 hover:bg-brand-darker rounded-lg transition-colors" title="Edit">
                                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                                </svg>
                                            </button>
                                            <button onclick="confirmDeletePuppy('${puppy.id}')" class="p-2 text-gray-400 hover:text-red-400 hover:bg-brand-darker rounded-lg transition-colors" title="Delete">
                                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <polyline points="3 6 5 6 21 6"/>
                                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                                                </svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

function searchPuppies(query) {
    const puppies = DB.puppies.getAll().filter(p =>
        (p.name && p.name.toLowerCase().includes(query.toLowerCase())) ||
        (p.color && p.color.toLowerCase().includes(query.toLowerCase()))
    );
    document.getElementById('puppiesTableContainer').innerHTML = renderPuppiesTable(puppies);
}

// ============================================
// CUSTOMERS PAGE
// ============================================
function renderCustomersPage() {
    const customers = DB.customers.getAll();

    return `
        <div class="admin-page-header">
            <h1>Customers</h1>
            <div class="header-actions">
                <div class="search-box">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                    </svg>
                    <input type="text" placeholder="Search customers..." onkeyup="searchCustomers(this.value)">
                </div>
                <button class="btn btn-primary" onclick="openAddCustomerModal()">+ Add Customer</button>
            </div>
        </div>

        <div class="admin-card">
            <div class="admin-card-body no-padding">
                <div id="customersTableContainer">
                    ${renderCustomersTable(customers)}
                </div>
            </div>
        </div>
    `;
}

function renderCustomersTable(customers) {
    if (customers.length === 0) {
        return `
            <div class="admin-empty-state">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                </svg>
                <p>No customers added yet</p>
                <button class="btn btn-primary" onclick="openAddCustomerModal()">Add Your First Customer</button>
            </div>
        `;
    }

    return `
        <div class="table-responsive"><table class="admin-table">
            <thead>
                <tr>
                    <th>Customer</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Type</th>
                    <th>Puppies</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${customers.map(customer => {
                    const purchases = DB.purchases.getByCustomer(customer.id);
                    return `
                        <tr>
                            <td>
                                <div class="table-name">
                                    <div class="customer-avatar" style="width:40px;height:40px;font-size:1rem;">${customer.name.charAt(0).toUpperCase()}</div>
                                    <span>${escapeHtml(customer.name)}</span>
                                </div>
                            </td>
                            <td>${escapeHtml(customer.email || 'N/A')}</td>
                            <td>${escapeHtml(customer.phone || 'N/A')}</td>
                            <td>
                                ${customer.isGuardian ? '<span class="status-badge status-guardian">Guardian</span>' : ''}
                                ${purchases.length > 0 ? '<span class="status-badge status-active">Buyer</span>' : ''}
                                ${!customer.isGuardian && purchases.length === 0 ? '<span class="status-badge status-private">Lead</span>' : ''}
                            </td>
                            <td>${purchases.length}</td>
                            <td>
                                <div class="actions">
                                    <button class="icon-btn view" onclick="viewCustomerProfile('${customer.id}')" title="View">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                                        </svg>
                                    </button>
                                    <button class="icon-btn edit" onclick="openEditCustomerModal('${customer.id}')" title="Edit">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                        </svg>
                                    </button>
                                    <button class="icon-btn delete" onclick="confirmDeleteCustomer('${customer.id}')" title="Delete">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                                        </svg>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    `;
                }).join('')}
            </tbody>
        </table></div>
    `;
}

function searchCustomers(query) {
    const customers = DB.customers.search(query);
    document.getElementById('customersTableContainer').innerHTML = renderCustomersTable(customers);
}

// ============================================
// REMINDERS PAGE
// ============================================
function renderRemindersPage() {
    const reminders = DB.reminders.getAll().sort((a, b) => new Date(a.date) - new Date(b.date));
    const upcoming = reminders.filter(r => !r.completed && new Date(r.date) >= new Date());
    const past = reminders.filter(r => r.completed || new Date(r.date) < new Date());

    return `
        <div class="admin-page-header">
            <h1>Reminders</h1>
            <div class="header-actions">
                <button class="btn btn-primary" onclick="openAddReminderModal()">+ Add Reminder</button>
            </div>
        </div>

        <div class="admin-tabs">
            <button class="admin-tab active" onclick="switchReminderTab('upcoming', this)">Upcoming (${upcoming.length})</button>
            <button class="admin-tab" onclick="switchReminderTab('past', this)">Past/Completed (${past.length})</button>
        </div>

        <div id="remindersContent">
            ${renderRemindersList(upcoming, false)}
        </div>
    `;
}

function switchReminderTab(tab, btn) {
    document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');

    const reminders = DB.reminders.getAll().sort((a, b) => new Date(a.date) - new Date(b.date));
    const content = document.getElementById('remindersContent');

    if (tab === 'upcoming') {
        const upcoming = reminders.filter(r => !r.completed && new Date(r.date) >= new Date());
        content.innerHTML = renderRemindersList(upcoming, false);
    } else {
        const past = reminders.filter(r => r.completed || new Date(r.date) < new Date());
        content.innerHTML = renderRemindersList(past, true);
    }
}

function renderRemindersList(reminders, isPast) {
    if (reminders.length === 0) {
        return `<div class="admin-empty-state"><p>No reminders</p></div>`;
    }

    return reminders.map(r => `
        <div class="reminder-item" style="background: var(--bg-card); margin-bottom: 0.5rem; border-radius: 8px; ${r.completed ? 'opacity: 0.6;' : ''}">
            <div class="reminder-icon ${r.type || ''}">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                </svg>
            </div>
            <div class="reminder-content" style="flex: 1;">
                <h4 style="${r.completed ? 'text-decoration: line-through;' : ''}">${escapeHtml(r.title)}</h4>
                <p>${escapeHtml(r.description || '')}</p>
            </div>
            <div style="display: flex; align-items: center; gap: 1rem;">
                <div class="reminder-date">${formatShortDate(r.date)}</div>
                ${!isPast && !r.completed ? `
                    <button class="icon-btn" onclick="markReminderComplete('${r.id}')" title="Mark Complete" style="color: var(--success);">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="20 6 9 17 4 12"/>
                        </svg>
                    </button>
                ` : ''}
                <button class="icon-btn delete" onclick="confirmDeleteReminder('${r.id}')" title="Delete">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                    </svg>
                </button>
            </div>
        </div>
    `).join('');
}

// ============================================
// BIRTHDAYS PAGE
// ============================================
function renderBirthdaysPage() {
    const birthdays = DB.birthdays.getUpcoming(365);

    return `
        <div class="admin-page-header">
            <h1>Upcoming Birthdays</h1>
        </div>

        ${birthdays.length === 0 ? `
            <div class="admin-empty-state">
                <p>No birthdays in the next year</p>
            </div>
        ` : `
            <div class="admin-card">
                <div class="admin-card-body no-padding">
                    <div class="reminders-list">
                        ${birthdays.map(b => `
                            <div class="reminder-item">
                                <div class="reminder-icon birthday">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                                        <line x1="16" y1="2" x2="16" y2="6"/>
                                        <line x1="8" y1="2" x2="8" y2="6"/>
                                    </svg>
                                </div>
                                <div class="reminder-content">
                                    <h4>${escapeHtml(b.entity.name)}</h4>
                                    <p>Turning ${b.age} years old • ${b.type === 'puppy' && b.customer ? 'Owner: ' + escapeHtml(b.customer.name) : b.type}</p>
                                </div>
                                <div class="reminder-date">${b.daysUntil === 0 ? 'Today!' : b.daysUntil + ' days'}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `}
    `;
}

// ============================================
// SETTINGS PAGE
// ============================================
function renderSettingsPage() {
    const settings = DB.settings.get();

    return `
        <div class="admin-page-header">
            <h1>Settings</h1>
        </div>

        <div class="admin-card">
            <div class="admin-card-header"><h2>Business Information</h2></div>
            <div class="admin-card-body">
                <form id="settingsForm" onsubmit="saveSettings(event)">
                    <div class="form-row">
                        <div class="form-group">
                            <label>Business Name</label>
                            <input type="text" name="businessName" value="${escapeHtml(settings.businessName || '')}">
                        </div>
                        <div class="form-group">
                            <label>Phone</label>
                            <input type="tel" name="phone" value="${escapeHtml(settings.phone || '')}">
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Email</label>
                            <input type="email" name="email" value="${escapeHtml(settings.email || '')}">
                        </div>
                        <div class="form-group">
                            <label>Address</label>
                            <input type="text" name="address" value="${escapeHtml(settings.address || '')}">
                        </div>
                    </div>
                    <h3 style="margin-top: 2rem;">Social Media</h3>
                    <div class="form-row three-col">
                        <div class="form-group">
                            <label>Instagram</label>
                            <input type="text" name="instagram" value="${escapeHtml(settings.socialMedia?.instagram || '')}" placeholder="@username">
                        </div>
                        <div class="form-group">
                            <label>TikTok</label>
                            <input type="text" name="tiktok" value="${escapeHtml(settings.socialMedia?.tiktok || '')}" placeholder="@username">
                        </div>
                        <div class="form-group">
                            <label>Facebook</label>
                            <input type="text" name="facebook" value="${escapeHtml(settings.socialMedia?.facebook || '')}" placeholder="Page URL">
                        </div>
                    </div>
                    <button type="submit" class="btn btn-primary">Save Settings</button>
                </form>
            </div>
        </div>

        <div class="admin-card" style="margin-top: 2rem;">
            <div class="admin-card-header"><h2>Data Management</h2></div>
            <div class="admin-card-body">
                <p style="color: var(--text-secondary); margin-bottom: 1rem;">Export or import your data for backup purposes.</p>
                <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
                    <button class="btn btn-outline" onclick="exportData()">Export Data</button>
                    <button class="btn btn-outline" onclick="document.getElementById('importFile').click()">Import Data</button>
                    <input type="file" id="importFile" accept=".json" style="display: none;" onchange="importData(event)">
                    <button class="btn btn-danger" onclick="confirmClearData()">Clear All Data</button>
                </div>
            </div>
        </div>
    `;
}

function saveSettings(e) {
    e.preventDefault();
    const form = e.target;
    const settings = {
        businessName: form.businessName.value,
        phone: form.phone.value,
        email: form.email.value,
        address: form.address.value,
        socialMedia: {
            instagram: form.instagram.value,
            tiktok: form.tiktok.value,
            facebook: form.facebook.value
        }
    };
    DB.settings.save(settings);
    showToast('Settings saved successfully', 'success');
}

function exportData() {
    const data = DB.exportData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `premium-doodles-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Data exported successfully', 'success');
}

async function backupData() {
    const data = DB.exportData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sacc-doodles-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);

    // Update last backup date
    const settings = DB.settings.get();
    settings.lastBackupDate = new Date().toISOString();
    await DB.settings.save(settings);

    showToast('Backup created successfully!', 'success');
    loadPage('dashboard');
}

function importData(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const data = JSON.parse(event.target.result);
            DB.importData(data);
            showToast('Data imported successfully', 'success');
            loadPage(currentPage);
        } catch (error) {
            showToast('Error importing data: Invalid file format', 'error');
        }
    };
    reader.readAsText(file);
    e.target.value = '';
}

function confirmClearData() {
    if (confirm('Are you sure you want to clear ALL data? This cannot be undone!')) {
        if (confirm('This will delete all dogs, puppies, litters, customers, and reminders. Are you absolutely sure?')) {
            DB.clearAll();
            showToast('All data has been cleared', 'warning');
            loadPage('dashboard');
        }
    }
}

// ============================================
// MODAL FUNCTIONS
// ============================================
function openModal(title, content, footer = '', large = false) {
    const overlay = document.getElementById('modalOverlay');
    const modal = document.getElementById('modal');
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalBody').innerHTML = content;
    document.getElementById('modalFooter').innerHTML = footer;
    modal.classList.toggle('large', large);
    overlay.classList.add('active');
}

function closeModal() {
    document.getElementById('modalOverlay').classList.remove('active');
}

// Close modal on overlay click
document.getElementById('modalOverlay')?.addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeModal();
});

// Dog Modal
function openAddDogModal() {
    window.location.href = 'dog-profile.html';
}

function openEditDogModal(dogId) {
    window.location.href = `dog-profile.html?id=${dogId}`;
}

function getDogFormHtml(dog = {}) {
    // Handle photos array (support both old single photo and new array format)
    const photos = dog.photos || (dog.photo ? [dog.photo] : []);

    return `
        <div class="form-row">
            <div class="form-group">
                <label>Name <span class="required">*</span></label>
                <input type="text" id="dogName" value="${escapeHtml(dog.name || '')}" required>
            </div>
            <div class="form-group">
                <label>Breed</label>
                <input type="text" id="dogBreed" value="${escapeHtml(dog.breed || '')}">
            </div>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>Gender <span class="required">*</span></label>
                <select id="dogGender" onchange="toggleHeatCycleSection()">
                    <option value="female" ${dog.gender === 'female' ? 'selected' : ''}>Female</option>
                    <option value="male" ${dog.gender === 'male' ? 'selected' : ''}>Male</option>
                </select>
            </div>
            <div class="form-group">
                <label>Birthday</label>
                <input type="date" id="dogBirthday" value="${dog.birthday || ''}">
            </div>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>Color</label>
                <input type="text" id="dogColor" value="${escapeHtml(dog.color || '')}">
            </div>
            <div class="form-group">
                <label>Weight (lbs)</label>
                <input type="number" id="dogWeight" value="${dog.weight || ''}" step="0.1">
            </div>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>Registration #</label>
                <input type="text" id="dogRegistration" value="${escapeHtml(dog.registrationNumber || '')}">
            </div>
            <div class="form-group">
                <label>Microchip #</label>
                <input type="text" id="dogMicrochip" value="${escapeHtml(dog.microchip || '')}">
            </div>
        </div>

        <h3 style="margin: 1.5rem 0 1rem; border-top: 1px solid var(--border-color); padding-top: 1.5rem;">Photos</h3>
        <div class="form-group">
            <label>Upload Photos <span style="color: var(--text-muted); font-weight: normal;">(Drag & drop or click to select)</span></label>

            <!-- Photo Drop Zone - Using label for better mobile support -->
            <label class="photo-drop-zone" id="dogPhotoDropZone" for="dogPhotoFileInput">
                <input type="file" id="dogPhotoFileInput" name="dogPhotoFileInput" accept="image/*" capture="environment" multiple onchange="handleDogPhotoFiles(this.files)">
                <svg class="drop-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                </svg>
                <p class="drop-text">Tap here to add photos</p>
                <p class="drop-hint">Select from camera roll or take a new photo</p>
            </label>

            <!-- Photo Previews -->
            <div class="photo-preview-grid" id="dogPhotoPreviewGrid">
                ${photos.map((url, index) => `
                    <div class="photo-preview-item ${index === 0 ? 'is-primary' : ''}" data-url="${escapeHtml(url)}">
                        <img src="${escapeHtml(url)}" alt="Photo ${index + 1}" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><rect fill=%22%23333%22 width=%22100%22 height=%22100%22/><text x=%2250%22 y=%2255%22 text-anchor=%22middle%22 fill=%22%23666%22 font-size=%2212%22>Error</text></svg>'">
                        <button type="button" class="photo-remove-btn" onclick="removeDogPhoto(this)" title="Remove photo">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                            </svg>
                        </button>
                    </div>
                `).join('')}
            </div>

            <!-- Toggle for URL input -->
            <div class="photo-input-toggle">
                <button type="button" onclick="toggleUrlInputSection()">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                    </svg>
                    Or add photo by URL
                </button>
            </div>

            <!-- URL Input Section (hidden by default) -->
            <div class="url-input-section hidden" id="urlInputSection">
                <div class="url-input-row">
                    <input type="text" id="dogPhotoUrlInput" placeholder="Paste image URL here (https://...)">
                    <button type="button" class="btn btn-small btn-outline" onclick="addDogPhotoByUrl()">Add</button>
                </div>
            </div>
        </div>

        <div class="form-group">
            <label>Description</label>
            <textarea id="dogDescription">${escapeHtml(dog.description || '')}</textarea>
        </div>
        <div class="form-group">
            <label>Notes (Private)</label>
            <textarea id="dogNotes">${escapeHtml(dog.notes || '')}</textarea>
        </div>

        <h3 style="margin: 1.5rem 0 1rem; border-top: 1px solid var(--border-color); padding-top: 1.5rem;">Location & Status</h3>
        <div class="form-row">
            <div class="form-group">
                <label>Where is this dog located?</label>
                <select id="dogLocation" onchange="toggleGuardianSectionByLocation()">
                    <option value="home" ${dog.location !== 'guardian' ? 'selected' : ''}>At My Home</option>
                    <option value="guardian" ${dog.location === 'guardian' ? 'selected' : ''}>In a Guardian Home</option>
                </select>
                <p class="form-hint">Dogs at your home will have rabies shot reminders tracked</p>
            </div>
        </div>
        <div id="guardianSectionTrigger" style="${dog.location === 'guardian' ? '' : 'display:none;'}">
            <div class="form-group">
                <label class="checkbox-label">
                    <input type="checkbox" id="dogIsGuardian" ${dog.isGuardian ? 'checked' : ''} onchange="toggleGuardianSection()"> Show guardian family info on website
                </label>
            </div>
        </div>
        <div id="guardianSection" style="${dog.isGuardian ? '' : 'display:none;'}">
            <div class="form-row">
                <div class="form-group">
                    <label>Guardian Family Name</label>
                    <input type="text" id="guardianFamilyName" value="${escapeHtml(dog.guardianFamily?.name || '')}" placeholder="The Smith Family">
                </div>
                <div class="form-group">
                    <label>Guardian Family Location</label>
                    <input type="text" id="guardianFamilyLocation" value="${escapeHtml(dog.guardianFamily?.location || '')}" placeholder="Phoenix, AZ">
                </div>
            </div>
            <div class="form-group">
                <label>Guardian Family Photo</label>
                ${getPhotoUploadHtml('guardianFamilyPhoto', { currentPhoto: dog.guardianFamily?.photo || '', hint: 'Photo of the guardian family' })}
            </div>
            <div class="form-group">
                <label>About the Guardian Family</label>
                <textarea id="guardianFamilyNotes" placeholder="Tell us about this wonderful family...">${escapeHtml(dog.guardianFamily?.notes || '')}</textarea>
            </div>
        </div>

        <div id="heatCycleSection" style="${dog.gender !== 'male' ? '' : 'display:none;'}">
            <h3 style="margin: 1.5rem 0 1rem; border-top: 1px solid var(--border-color); padding-top: 1.5rem;">Heat Cycle (Females Only)</h3>
            <div class="form-row">
                <div class="form-group">
                    <label>Last Heat Date</label>
                    <input type="date" id="dogLastHeat" value="${dog.lastHeatDate || ''}">
                </div>
                <div class="form-group">
                    <label>Cycle Length (days)</label>
                    <input type="number" id="dogCycleLength" value="${dog.cycleLength || 180}" placeholder="180">
                </div>
            </div>
        </div>
        <div class="form-row" style="margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid var(--border-color);">
            <div class="form-group">
                <label class="checkbox-label">
                    <input type="checkbox" id="dogIsBreeding" ${dog.isBreeding ? 'checked' : ''}> Currently Breeding
                </label>
            </div>
            <div class="form-group">
                <label class="checkbox-label">
                    <input type="checkbox" id="dogIsPublic" ${dog.isPublic ? 'checked' : ''}> Show on Public Website
                </label>
            </div>
        </div>
    `;
}

// ============================================
// Universal Photo Upload System
// Supports drag & drop, file selection, and mobile camera
// ============================================

// Generate HTML for a photo upload zone
function getPhotoUploadHtml(fieldId, options = {}) {
    const {
        multiple = false,
        currentPhoto = '',
        currentPhotos = [],
        label = 'Upload Photo',
        hint = 'Select from camera roll or take a new photo'
    } = options;

    const photos = multiple ? currentPhotos : (currentPhoto ? [currentPhoto] : []);
    const previewHtml = photos.map((url, index) => `
        <div class="photo-preview-item ${index === 0 && multiple ? 'is-primary' : ''}" data-url="${escapeHtml(url)}">
            <img src="${escapeHtml(url)}" alt="Photo ${index + 1}" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><rect fill=%22%23333%22 width=%22100%22 height=%22100%22/><text x=%2250%22 y=%2255%22 text-anchor=%22middle%22 fill=%22%23666%22 font-size=%2212%22>Error</text></svg>'">
            <button type="button" class="photo-remove-btn" onclick="removePhotoFromGrid('${fieldId}', this)" title="Remove photo">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
            </button>
        </div>
    `).join('');

    return `
        <label class="photo-drop-zone" id="${fieldId}DropZone" for="${fieldId}FileInput">
            <input type="file" id="${fieldId}FileInput" name="${fieldId}FileInput" accept="image/*" ${multiple ? 'multiple' : ''} onchange="handlePhotoFiles('${fieldId}', this.files, ${multiple})">
            <svg class="drop-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
            <p class="drop-text">Tap here to add photo${multiple ? 's' : ''}</p>
            <p class="drop-hint">${hint}</p>
        </label>
        <div class="photo-preview-grid" id="${fieldId}PreviewGrid">${previewHtml}</div>
        <div class="photo-input-toggle">
            <button type="button" onclick="togglePhotoUrlInput('${fieldId}')">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                </svg>
                Or add by URL
            </button>
        </div>
        <div class="url-input-section hidden" id="${fieldId}UrlSection">
            <div class="url-input-row">
                <input type="text" id="${fieldId}UrlInput" placeholder="Paste image URL (https://...)">
                <button type="button" class="btn btn-small btn-outline" onclick="addPhotoByUrl('${fieldId}', ${multiple})">Add</button>
            </div>
        </div>
    `;
}

// Handle file selection
function handlePhotoFiles(fieldId, files, multiple = false) {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

    // If single photo mode, clear existing
    if (!multiple) {
        const grid = document.getElementById(fieldId + 'PreviewGrid');
        if (grid) grid.innerHTML = '';
    }

    Array.from(files).forEach(file => {
        if (!allowedTypes.includes(file.type)) {
            showToast(`${file.name} is not a supported image format`, 'error');
            return;
        }
        if (file.size > maxSize) {
            showToast(`${file.name} is too large (max 5MB)`, 'error');
            return;
        }
        processPhotoFile(fieldId, file, multiple);
    });
}

// Process and upload image to Bunny CDN
async function processPhotoFile(fieldId, file, multiple) {
    const grid = document.getElementById(fieldId + 'PreviewGrid');
    if (!grid) return;

    // Show loading placeholder
    const loadingId = 'loading-' + Date.now();
    const loadingItem = document.createElement('div');
    loadingItem.className = 'photo-preview-item loading';
    loadingItem.id = loadingId;
    loadingItem.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; gap: 8px;">
            <div style="width: 24px; height: 24px; border: 3px solid var(--border-color); border-top-color: var(--primary); border-radius: 50%; animation: spin 1s linear infinite;"></div>
            <span style="font-size: 12px; color: var(--text-muted);">Uploading...</span>
        </div>
    `;
    grid.appendChild(loadingItem);

    try {
        // Determine folder based on field ID
        let folder = 'testimonials';
        if (fieldId.includes('dog')) folder = 'dogs';
        if (fieldId.includes('puppy')) folder = 'puppies';
        if (fieldId.includes('litter')) folder = 'litters';

        // Upload to Bunny CDN via uploads.js function
        if (typeof uploadImage !== 'function') {
            throw new Error('Upload function not available. Make sure uploads.js is loaded.');
        }

        const result = await uploadImage(file, folder, {
            compress: true,
            maxWidth: 1200,
            quality: 0.85,
            onProgress: (percent) => {
                const progressText = loadingItem.querySelector('span');
                if (progressText) {
                    progressText.textContent = `${percent}%`;
                }
            }
        });

        // Remove loading placeholder
        loadingItem.remove();

        // Add uploaded photo to grid
        addPhotoToGrid(fieldId, result.url, multiple);
        showToast('Photo uploaded successfully', 'success');

    } catch (error) {
        console.error('Upload error:', error);
        loadingItem.remove();
        showToast(error.message || 'Failed to upload photo', 'error');
    }
}

// Add photo to preview grid
function addPhotoToGrid(fieldId, url, multiple = false) {
    const grid = document.getElementById(fieldId + 'PreviewGrid');
    if (!grid) return;

    const isFirst = grid.querySelectorAll('.photo-preview-item').length === 0;

    const item = document.createElement('div');
    item.className = 'photo-preview-item' + (isFirst && multiple ? ' is-primary' : '');
    item.dataset.url = url;
    item.innerHTML = `
        <img src="${escapeHtml(url)}" alt="Photo" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><rect fill=%22%23333%22 width=%22100%22 height=%22100%22/><text x=%2250%22 y=%2255%22 text-anchor=%22middle%22 fill=%22%23666%22 font-size=%2212%22>Error</text></svg>'">
        <button type="button" class="photo-remove-btn" onclick="removePhotoFromGrid('${fieldId}', this)" title="Remove photo">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
        </button>
    `;
    grid.appendChild(item);
    updateGridPrimaryStatus(fieldId);
}

// Remove photo from grid
function removePhotoFromGrid(fieldId, btn) {
    const item = btn.closest('.photo-preview-item');
    item.remove();
    updateGridPrimaryStatus(fieldId);
}

// Update primary status for grid
function updateGridPrimaryStatus(fieldId) {
    const grid = document.getElementById(fieldId + 'PreviewGrid');
    if (!grid) return;

    const items = grid.querySelectorAll('.photo-preview-item');
    items.forEach((item, index) => {
        if (index === 0) {
            item.classList.add('is-primary');
        } else {
            item.classList.remove('is-primary');
        }
    });
}

// Toggle URL input visibility
function togglePhotoUrlInput(fieldId) {
    const section = document.getElementById(fieldId + 'UrlSection');
    if (!section) return;

    section.classList.toggle('hidden');
    if (!section.classList.contains('hidden')) {
        const input = document.getElementById(fieldId + 'UrlInput');
        if (input) input.focus();
    }
}

// Add photo by URL
function addPhotoByUrl(fieldId, multiple = false) {
    const input = document.getElementById(fieldId + 'UrlInput');
    if (!input) return;

    const url = input.value.trim();

    if (!url) {
        showToast('Please enter a URL', 'error');
        return;
    }

    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        showToast('Please enter a valid URL starting with http:// or https://', 'error');
        return;
    }

    // If single photo mode, clear existing
    if (!multiple) {
        const grid = document.getElementById(fieldId + 'PreviewGrid');
        if (grid) grid.innerHTML = '';
    }

    addPhotoToGrid(fieldId, url, multiple);
    input.value = '';
    showToast('Photo added', 'success');
}

// Get photo URL(s) from grid
function getPhotoFromGrid(fieldId, multiple = false) {
    const grid = document.getElementById(fieldId + 'PreviewGrid');
    if (!grid) return multiple ? [] : '';

    const items = grid.querySelectorAll('.photo-preview-item');
    const urls = Array.from(items).map(item => item.dataset.url).filter(url => url);

    return multiple ? urls : (urls[0] || '');
}

// Initialize drop zone for drag & drop (called after modal opens)
function initPhotoDropZone(fieldId) {
    const dropZone = document.getElementById(fieldId + 'DropZone');
    if (!dropZone) return;

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
    });

    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => dropZone.classList.add('drag-over'), false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => dropZone.classList.remove('drag-over'), false);
    });

    dropZone.addEventListener('drop', (e) => {
        const files = e.dataTransfer.files;
        const multiple = dropZone.querySelector('input[type="file"]')?.hasAttribute('multiple');
        handlePhotoFiles(fieldId, files, multiple);
    }, false);
}

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

// ============================================
// Legacy Dog Photo Functions (for backwards compatibility)
// ============================================

function handleDogPhotoFiles(files) {
    handlePhotoFiles('dogPhoto', files, true);
}

function addPhotoPreview(url) {
    addPhotoToGrid('dogPhoto', url, true);
}

function removeDogPhoto(btn) {
    removePhotoFromGrid('dogPhoto', btn);
}

function updatePrimaryPhotoStatus() {
    updateGridPrimaryStatus('dogPhoto');
}

function toggleUrlInputSection() {
    togglePhotoUrlInput('dogPhoto');
}

function addDogPhotoByUrl() {
    addPhotoByUrl('dogPhoto', true);
}

function getDogPhotoUrls() {
    return getPhotoFromGrid('dogPhoto', true);
}

function addDogPhotoInput() {
    toggleUrlInputSection();
}

function removeDogPhotoInput(btn) {
    removeDogPhoto(btn);
}

// ============================================
// Puppy Photo Upload (Bunny CDN)
// ============================================

async function uploadPuppyPhotosFromInput(files) {
    console.log('uploadPuppyPhotosFromInput called with', files?.length, 'files');

    if (!files || files.length === 0) {
        console.log('No files provided');
        return;
    }

    const grid = document.getElementById('puppyPhotoPreviewGrid');
    const puppyId = document.getElementById('puppyId')?.value || 'new';

    console.log('Grid element:', grid);
    console.log('Puppy ID:', puppyId);

    if (!grid) {
        console.error('Photo grid not found');
        showToast('Photo grid not found', 'error');
        return;
    }

    // Check if Supabase is configured (uploads now go through Edge Function)
    if (!CONFIG.SUPABASE_URL) {
        console.error('Supabase URL not configured');
        showToast('Supabase not configured', 'error');
        return;
    }

    console.log('Starting upload to Bunny CDN via Edge Function...');

    try {
        const result = await uploadPuppyPhotos(puppyId, files, grid);
        console.log('Upload completed:', result);
    } catch (error) {
        console.error('Upload failed:', error);
        showToast('Upload failed: ' + error.message, 'error');
    }
}

// Initialize drag and drop for puppy photos
function initPuppyPhotoDropZone() {
    const dropZone = document.getElementById('puppyPhotoDropZone');
    if (!dropZone) return;

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
    });

    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => dropZone.classList.add('drag-over'), false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => dropZone.classList.remove('drag-over'), false);
    });

    dropZone.addEventListener('drop', (e) => {
        const files = e.dataTransfer.files;
        uploadPuppyPhotosFromInput(files);
    }, false);
}

function toggleGuardianSection() {
    const isGuardian = document.getElementById('dogIsGuardian').checked;
    document.getElementById('guardianSection').style.display = isGuardian ? '' : 'none';
}

function toggleGuardianSectionByLocation() {
    const location = document.getElementById('dogLocation').value;
    const guardianTrigger = document.getElementById('guardianSectionTrigger');
    const guardianSection = document.getElementById('guardianSection');
    const isGuardianCheckbox = document.getElementById('dogIsGuardian');

    if (location === 'guardian') {
        guardianTrigger.style.display = '';
    } else {
        guardianTrigger.style.display = 'none';
        guardianSection.style.display = 'none';
        isGuardianCheckbox.checked = false;
    }
}

function toggleHeatCycleSection() {
    const gender = document.getElementById('dogGender').value;
    document.getElementById('heatCycleSection').style.display = gender === 'female' ? '' : 'none';
}

async function saveDog(dogId = null) {
    // Collect all photo URLs from the preview grid
    const photos = getDogPhotoUrls();

    // Build guardian family object if applicable
    const isGuardian = document.getElementById('dogIsGuardian').checked;
    let guardianFamily = null;
    if (isGuardian) {
        guardianFamily = {
            name: document.getElementById('guardianFamilyName').value.trim(),
            photo: getPhotoFromGrid('guardianFamilyPhoto'),
            location: document.getElementById('guardianFamilyLocation').value.trim(),
            notes: document.getElementById('guardianFamilyNotes').value.trim()
        };
    }

    const location = document.getElementById('dogLocation').value;

    const dog = {
        id: dogId,
        name: document.getElementById('dogName').value.trim(),
        breed: document.getElementById('dogBreed').value.trim(),
        gender: document.getElementById('dogGender').value,
        birthday: document.getElementById('dogBirthday').value,
        color: document.getElementById('dogColor').value.trim(),
        weight: document.getElementById('dogWeight').value,
        registrationNumber: document.getElementById('dogRegistration').value.trim(),
        microchip: document.getElementById('dogMicrochip').value.trim(),
        photos: photos,
        photoUrl: photos[0] || '',
        description: document.getElementById('dogDescription').value.trim(),
        notes: document.getElementById('dogNotes').value.trim(),
        lastHeatDate: document.getElementById('dogLastHeat').value,
        heatCycleDays: parseInt(document.getElementById('dogCycleLength').value) || 180,
        isBreeding: document.getElementById('dogIsBreeding').checked,
        isPublic: document.getElementById('dogIsPublic').checked,
        location: location,
        guardianFamily: guardianFamily
    };

    if (!dog.name) {
        showToast('Please enter a name for the dog', 'error');
        return;
    }

    try {
        await DB.dogs.save(dog);
        closeModal();
        showToast(dogId ? 'Dog updated successfully' : 'Dog added successfully', 'success');

        if (currentPage === 'dogs') {
            loadPage('dogs');
        } else if (currentDogId) {
            viewDogProfile(currentDogId);
        } else {
            loadPage('dashboard');
        }
    } catch (error) {
        console.error('Error saving dog:', error);
        showToast('Error saving dog: ' + error.message, 'error');
    }
}

async function confirmDeleteDog(dogId) {
    if (confirm('Are you sure you want to delete this dog? This will also affect any associated litters.')) {
        await DB.dogs.delete(dogId);
        showToast('Dog deleted successfully', 'success');
        loadPage('dogs');
    }
}

// Litter Modal
function openAddLitterModal(defaultDogId = null) {
    const dogs = DB.dogs.getAll();
    const females = dogs.filter(d => d.gender === 'female');
    const males = dogs.filter(d => d.gender === 'male');

    const content = `
        <div class="form-group">
            <label>Litter Name</label>
            <input type="text" id="litterName" placeholder="e.g., Spring 2024 Litter">
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>Mother <span class="required">*</span></label>
                <select id="litterMother">
                    <option value="">Select Mother</option>
                    ${females.map(d => `<option value="${d.id}" ${d.id === defaultDogId ? 'selected' : ''}>${escapeHtml(d.name)}</option>`).join('')}
                </select>
            </div>
            <div class="form-group">
                <label>Father <span class="required">*</span></label>
                <select id="litterFather">
                    <option value="">Select Father</option>
                    ${males.map(d => `<option value="${d.id}">${escapeHtml(d.name)}</option>`).join('')}
                </select>
            </div>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>Birth Date</label>
                <input type="date" id="litterBirthDate">
            </div>
            <div class="form-group">
                <label>Expected Date</label>
                <input type="date" id="litterExpectedDate">
            </div>
        </div>
        <div class="form-group">
            <label>Notes</label>
            <textarea id="litterNotes"></textarea>
        </div>
        <div class="form-group">
            <label class="checkbox-label">
                <input type="checkbox" id="litterIsPublic"> Show on Public Website
            </label>
        </div>
    `;
    const footer = `
        <button class="btn btn-outline" onclick="closeModal()">Cancel</button>
        <button class="btn btn-primary" onclick="saveLitter()">Add Litter</button>
    `;
    openModal('Add New Litter', content, footer);
}

function saveLitter(litterId = null) {
    const litter = {
        id: litterId,
        name: document.getElementById('litterName').value.trim(),
        motherId: document.getElementById('litterMother').value,
        fatherId: document.getElementById('litterFather').value,
        birthDate: document.getElementById('litterBirthDate').value,
        expectedDate: document.getElementById('litterExpectedDate').value,
        notes: document.getElementById('litterNotes').value.trim(),
        isPublic: document.getElementById('litterIsPublic').checked
    };

    if (!litter.motherId || !litter.fatherId) {
        showToast('Please select both parents', 'error');
        return;
    }

    DB.litters.save(litter);
    closeModal();
    showToast('Litter added successfully', 'success');
    loadPage('litters');
}

// Puppy Modal
// Full-page Add Puppy editor (better UX than modal)
function openAddPuppyModal(litterId = null) {
    const litters = DB.litters.getAll();
    const customers = DB.customers.getAll();

    document.getElementById('main-content').innerHTML = `
        <!-- Header -->
        <div class="mb-6">
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div class="flex items-center gap-4">
                    <button onclick="loadPage('puppies')" class="p-2 text-gray-400 hover:text-white hover:bg-brand-card rounded-lg transition-colors">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
                        </svg>
                    </button>
                    <div>
                        <h1 class="text-2xl font-bold text-white">Add New Puppy</h1>
                        <p class="text-gray-400">Fill in the puppy details below</p>
                    </div>
                </div>
                <button onclick="saveNewPuppy()" class="px-6 py-2 bg-brand-gold text-brand-dark font-semibold rounded-lg hover:bg-brand-gold-light transition-colors">
                    Save Puppy
                </button>
            </div>
        </div>

        <!-- Main Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

            <!-- LEFT: Photos & Video -->
            <div class="lg:col-span-1">
                <!-- Photos Section -->
                <div class="bg-brand-card rounded-xl p-6">
                    <h3 class="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <svg class="w-5 h-5 text-brand-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                            <circle cx="8.5" cy="8.5" r="1.5"/>
                            <polyline points="21 15 16 10 5 21"/>
                        </svg>
                        Photos
                    </h3>

                    <input type="hidden" id="puppyId" value="new">

                    <!-- Photo Upload Zone -->
                    <label class="photo-drop-zone" id="puppyPhotoDropZone" for="puppyPhotoFileInput">
                        <input type="file" id="puppyPhotoFileInput" accept="image/*" multiple style="display: none;"
                            onchange="uploadPuppyPhotosFromInput(this.files)">
                        <svg class="drop-icon" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                            <circle cx="8.5" cy="8.5" r="1.5"/>
                            <polyline points="21 15 16 10 5 21"/>
                        </svg>
                        <p class="drop-text">Tap to add photos</p>
                        <p class="drop-hint">Uploads to Bunny CDN • First photo is main display</p>
                    </label>

                    <!-- Photo Preview Grid -->
                    <div class="photo-preview-grid" id="puppyPhotoPreviewGrid"></div>
                </div>

                <!-- Video Section -->
                <div class="bg-brand-card rounded-xl p-6 mt-6">
                    <h3 class="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <svg class="w-5 h-5 text-brand-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <polygon points="23 7 16 12 23 17 23 7"/>
                            <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
                        </svg>
                        Video
                    </h3>

                    <div id="puppyVideoContainer">
                        <label class="video-drop-zone">
                            <input type="file" accept="video/*" onchange="handlePuppyVideoSelect(this)" style="display: none;">
                            <svg class="drop-icon" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                                <polygon points="23 7 16 12 23 17 23 7"/>
                                <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
                            </svg>
                            <p class="drop-text">Tap to upload video</p>
                            <p class="drop-hint">MP4, WebM, or MOV (max 350MB)</p>
                        </label>
                    </div>
                </div>

                <!-- AI Assistant Card -->
                <div class="bg-gradient-to-br from-purple-900/30 to-purple-800/10 border border-purple-500/30 rounded-xl p-6 mt-6">
                    <h3 class="text-lg font-semibold text-purple-300 mb-3 flex items-center gap-2">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                        </svg>
                        AI Assistant
                    </h3>
                    <p class="text-gray-400 text-sm mb-4">Auto-generate name, description, personality traits, and best suited for.</p>
                    <button id="aiGenerateBtn" onclick="aiGenerateNewPuppyContent()" class="w-full py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                        </svg>
                        Generate Content
                    </button>
                </div>
            </div>

            <!-- RIGHT: Details -->
            <div class="lg:col-span-2 space-y-6">

                <!-- Basic Info -->
                <div class="bg-brand-card rounded-xl p-6">
                    <h3 class="text-lg font-semibold text-white mb-4">Basic Information</h3>

                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div class="form-group">
                            <label class="block text-gray-300 text-sm mb-2">Name</label>
                            <input type="text" id="puppyName" placeholder="Optional - can add later" class="w-full px-4 py-3 bg-brand-darker border border-brand-dark rounded-lg text-white focus:border-brand-gold focus:outline-none">
                        </div>

                        <div class="form-group">
                            <label class="block text-gray-300 text-sm mb-2">Litter <span class="text-red-400">*</span></label>
                            <select id="puppyLitter" class="w-full px-4 py-3 bg-brand-darker border border-brand-dark rounded-lg text-white focus:border-brand-gold focus:outline-none">
                                <option value="">Select Litter</option>
                                ${litters.map(l => {
                                    const mother = DB.dogs.getById(l.motherId);
                                    const father = DB.dogs.getById(l.fatherId);
                                    return `<option value="${l.id}" ${l.id === litterId ? 'selected' : ''}>${escapeHtml(l.name || 'Litter')} (${mother?.name || '?'} x ${father?.name || '?'})</option>`;
                                }).join('')}
                            </select>
                        </div>

                        <div class="form-group">
                            <label class="block text-gray-300 text-sm mb-2">Gender <span class="text-red-400">*</span></label>
                            <select id="puppyGender" class="w-full px-4 py-3 bg-brand-darker border border-brand-dark rounded-lg text-white focus:border-brand-gold focus:outline-none">
                                <option value="female">Female</option>
                                <option value="male">Male</option>
                            </select>
                        </div>

                        <div class="form-group">
                            <label class="block text-gray-300 text-sm mb-2">Color</label>
                            <input type="text" id="puppyColor" placeholder="e.g., Apricot, Black, Phantom" class="w-full px-4 py-3 bg-brand-darker border border-brand-dark rounded-lg text-white focus:border-brand-gold focus:outline-none">
                        </div>

                        <div class="form-group">
                            <label class="block text-gray-300 text-sm mb-2">Birthday</label>
                            <input type="date" id="puppyBirthday" class="w-full px-4 py-3 bg-brand-darker border border-brand-dark rounded-lg text-white focus:border-brand-gold focus:outline-none">
                        </div>

                        <div class="form-group">
                            <label class="block text-gray-300 text-sm mb-2">Price ($)</label>
                            <input type="number" id="puppyPrice" step="100" placeholder="e.g., 3500" class="w-full px-4 py-3 bg-brand-darker border border-brand-dark rounded-lg text-white focus:border-brand-gold focus:outline-none">
                        </div>

                        <div class="form-group">
                            <label class="block text-gray-300 text-sm mb-2">Status</label>
                            <select id="puppyStatus" class="w-full px-4 py-3 bg-brand-darker border border-brand-dark rounded-lg text-white focus:border-brand-gold focus:outline-none">
                                <option value="available">Available</option>
                                <option value="reserved">Reserved</option>
                                <option value="guardian">Guardian</option>
                                <option value="adopted">Adopted</option>
                            </select>
                        </div>

                        <div class="form-group">
                            <label class="block text-gray-300 text-sm mb-2">Customer (if reserved/sold)</label>
                            <select id="puppyCustomer" class="w-full px-4 py-3 bg-brand-darker border border-brand-dark rounded-lg text-white focus:border-brand-gold focus:outline-none">
                                <option value="">No Customer</option>
                                ${customers.map(c => `<option value="${c.id}">${escapeHtml(c.name)}</option>`).join('')}
                            </select>
                        </div>
                    </div>
                </div>

                <!-- Description & Details -->
                <div class="bg-brand-card rounded-xl p-6">
                    <h3 class="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <svg class="w-5 h-5 text-brand-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                            <polyline points="14 2 14 8 20 8"/>
                            <line x1="16" y1="13" x2="8" y2="13"/>
                            <line x1="16" y1="17" x2="8" y2="17"/>
                        </svg>
                        Description & Details
                    </h3>

                    <div class="space-y-4">
                        <div>
                            <label class="block text-gray-300 text-sm mb-2">Description</label>
                            <textarea id="puppyDescription" rows="6" placeholder="Describe this puppy's personality, temperament, and unique traits..." class="w-full px-4 py-3 bg-brand-darker border border-brand-dark rounded-lg text-white placeholder-gray-500 focus:border-brand-gold focus:outline-none resize-none"></textarea>
                        </div>

                        <div>
                            <label class="block text-gray-300 text-sm mb-2">Personality Traits</label>
                            <input type="text" id="puppyPersonality" placeholder="e.g., Playful, Curious, Affectionate" class="w-full px-4 py-3 bg-brand-darker border border-brand-dark rounded-lg text-white placeholder-gray-500 focus:border-brand-gold focus:outline-none">
                        </div>

                        <div>
                            <label class="block text-gray-300 text-sm mb-2">Best Suited For</label>
                            <input type="text" id="puppyBestSuited" placeholder="e.g., Families with children, Active individuals" class="w-full px-4 py-3 bg-brand-darker border border-brand-dark rounded-lg text-white placeholder-gray-500 focus:border-brand-gold focus:outline-none">
                        </div>
                    </div>
                </div>

                <!-- Settings -->
                <div class="bg-brand-card rounded-xl p-6">
                    <h3 class="text-lg font-semibold text-white mb-4">Visibility Settings</h3>
                    <label class="flex items-center gap-3 cursor-pointer">
                        <input type="checkbox" id="puppyIsPublic" checked class="w-4 h-4 accent-brand-gold">
                        <span class="text-gray-300">Show on public website</span>
                    </label>
                </div>

            </div>
        </div>
    `;

    setTimeout(() => initPuppyPhotoDropZone(), 100);
}

function openEditPuppyModal(puppyId) {
    // Use full-page editor for better UX
    openPuppyEditor(puppyId);
}

// Full-page puppy editor (much better than cramped modal)
function openPuppyEditor(puppyId) {
    const puppy = DB.puppies.getById(puppyId);
    if (!puppy) return;

    const litters = DB.litters.getAll();
    const customers = DB.customers.getAll();
    const photoUrl = puppy.photo || puppy.image_url || puppy.photo_url || '';
    const litter = puppy.litter_id ? DB.litters.getById(puppy.litter_id) : null;

    const statusColors = {
        available: 'bg-green-500/20 text-green-400',
        Available: 'bg-green-500/20 text-green-400',
        reserved: 'bg-yellow-500/20 text-yellow-400',
        Reserved: 'bg-yellow-500/20 text-yellow-400',
        sold: 'bg-blue-500/20 text-blue-400',
        adopted: 'bg-blue-500/20 text-blue-400'
    };

    document.getElementById('main-content').innerHTML = `
        <!-- Header -->
        <div class="mb-6">
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div class="flex items-center gap-4">
                    <button onclick="loadPage('puppies')" class="p-2 text-gray-400 hover:text-white hover:bg-brand-card rounded-lg transition-colors">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
                        </svg>
                    </button>
                    <div>
                        <h1 class="text-2xl font-bold text-white">Edit Puppy</h1>
                        <p class="text-gray-400">${escapeHtml(puppy.name || 'Unnamed Puppy')}</p>
                    </div>
                </div>
                <div class="flex items-center gap-3">
                    <button onclick="previewPuppy('${puppyId}')" class="px-4 py-2 bg-brand-card text-gray-300 font-medium rounded-lg hover:bg-brand-darker transition-colors flex items-center gap-2">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                            <polyline points="15 3 21 3 21 9"/>
                            <line x1="10" y1="14" x2="21" y2="3"/>
                        </svg>
                        Preview
                    </button>
                    <button onclick="savePuppyFromEditor('${puppyId}')" class="px-6 py-2 bg-brand-gold text-brand-dark font-semibold rounded-lg hover:bg-brand-gold-light transition-colors">
                        Save Changes
                    </button>
                </div>
            </div>
        </div>

        <!-- Main Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

            <!-- LEFT: Photos & Video -->
            <div class="lg:col-span-1">
                <div class="bg-brand-card rounded-xl p-6">
                    <h3 class="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <svg class="w-5 h-5 text-brand-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                            <circle cx="8.5" cy="8.5" r="1.5"/>
                            <polyline points="21 15 16 10 5 21"/>
                        </svg>
                        Photos
                    </h3>

                    <input type="hidden" id="puppyId" value="${puppyId}">

                    <!-- Photo Upload Zone -->
                    <label class="photo-drop-zone" id="puppyPhotoDropZone" for="puppyPhotoFileInput">
                        <input type="file" id="puppyPhotoFileInput" accept="image/*" multiple style="display: none;"
                            onchange="uploadPuppyPhotosFromInput(this.files)">
                        <svg class="drop-icon" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                            <circle cx="8.5" cy="8.5" r="1.5"/>
                            <polyline points="21 15 16 10 5 21"/>
                        </svg>
                        <p class="drop-text">Tap to add photos</p>
                        <p class="drop-hint">First photo will be the main display</p>
                    </label>

                    <!-- Photo Preview Grid -->
                    <div class="photo-preview-grid" id="puppyPhotoPreviewGrid">
                        ${(puppy.photos || (photoUrl ? [photoUrl] : [])).map((url, index) => `
                            <div class="photo-preview-item ${index === 0 ? 'is-primary' : ''}" data-url="${escapeHtml(url)}">
                                <img src="${escapeHtml(url)}" alt="Puppy photo">
                                <button type="button" class="photo-remove-btn" onclick="removePuppyPhoto(this)" title="Remove">
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                                        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                                    </svg>
                                </button>
                                <button type="button" class="photo-primary-btn" onclick="setPrimaryPhoto(this)" title="Set as primary">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                                    </svg>
                                </button>
                            </div>
                        `).join('')}
                    </div>

                    ${(puppy.photos?.length > 0 || photoUrl) ? `
                        <p class="text-xs text-gray-500 mt-3 flex items-center gap-1">
                            <svg class="w-3 h-3 text-brand-gold" fill="currentColor" viewBox="0 0 24 24">
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                            </svg>
                            Click star to set primary photo
                        </p>
                    ` : ''}
                </div>

                <!-- Video Section -->
                <div class="bg-brand-card rounded-xl p-6 mt-6">
                    <h3 class="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <svg class="w-5 h-5 text-brand-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <polygon points="23 7 16 12 23 17 23 7"/>
                            <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
                        </svg>
                        Video
                    </h3>

                    <div id="puppyVideoContainer">
                        ${puppy.video_url ? `
                            <div class="video-preview">
                                <video src="${escapeHtml(puppy.video_url)}" controls style="max-width: 100%; border-radius: 8px;"></video>
                                <input type="hidden" class="video-url-input" value="${escapeHtml(puppy.video_url)}">
                                <div style="margin-top: 12px; display: flex; gap: 12px; align-items: center; flex-wrap: wrap;">
                                    <label style="display: flex; align-items: center; gap: 6px; cursor: pointer; background: rgba(186, 155, 121, 0.1); padding: 6px 12px; border-radius: 6px; border: 1px solid rgba(186, 155, 121, 0.3);">
                                        <input type="checkbox" class="video-featured-checkbox" ${puppy.video_featured ? 'checked' : ''} onchange="updateVideoFeatured(this)" style="accent-color: rgb(186, 155, 121);">
                                        <span style="font-size: 0.875rem; color: #d1d5db;">Feature video as main display</span>
                                    </label>
                                    <button type="button" class="btn btn-small btn-outline" onclick="removePuppyVideo(this)">
                                        Remove
                                    </button>
                                </div>
                            </div>
                        ` : `
                            <label class="video-drop-zone">
                                <input type="file" accept="video/*" onchange="handlePuppyVideoSelect(this)" style="display: none;">
                                <svg class="drop-icon" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                                    <polygon points="23 7 16 12 23 17 23 7"/>
                                    <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
                                </svg>
                                <p class="drop-text">Tap to upload video</p>
                                <p class="drop-hint">MP4, WebM, or MOV (max 350MB)</p>
                            </label>
                        `}
                    </div>
                </div>

                <!-- AI Card -->
                <div class="bg-gradient-to-br from-purple-900/30 to-purple-800/10 border border-purple-500/30 rounded-xl p-6 mt-6">
                    <h3 class="text-lg font-semibold text-purple-300 mb-3 flex items-center gap-2">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                        </svg>
                        AI Assistant
                    </h3>
                    <p class="text-gray-400 text-sm mb-4">Auto-generate description and personality traits.</p>
                    <button id="aiGenerateBtn" onclick="aiGeneratePuppyContent('${puppyId}')" class="w-full py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                        </svg>
                        Generate Content
                    </button>
                </div>
            </div>

            <!-- MIDDLE: Basic Info -->
            <div class="lg:col-span-1">
                <div class="bg-brand-card rounded-xl p-6">
                    <h3 class="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <svg class="w-5 h-5 text-brand-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                        </svg>
                        Basic Information
                    </h3>

                    <div class="space-y-4">
                        <div>
                            <label class="block text-sm text-gray-400 mb-1">Name</label>
                            <input type="text" id="puppyName" value="${escapeHtml(puppy.name || '')}"
                                class="w-full px-4 py-3 bg-brand-darker border border-brand-card rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-brand-gold">
                        </div>

                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm text-gray-400 mb-1">Gender</label>
                                <select id="puppyGender" class="w-full px-4 py-3 bg-brand-darker border border-brand-card rounded-lg text-white focus:outline-none focus:border-brand-gold">
                                    <option value="male" ${puppy.gender === 'male' || puppy.gender === 'Male' ? 'selected' : ''}>Male</option>
                                    <option value="female" ${puppy.gender === 'female' || puppy.gender === 'Female' ? 'selected' : ''}>Female</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm text-gray-400 mb-1">Color</label>
                                <input type="text" id="puppyColor" value="${escapeHtml(puppy.color || '')}"
                                    class="w-full px-4 py-3 bg-brand-darker border border-brand-card rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-brand-gold">
                            </div>
                        </div>

                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm text-gray-400 mb-1">Birthday</label>
                                <input type="date" id="puppyBirthday" value="${puppy.birthday || puppy.birth_date || ''}"
                                    class="w-full px-4 py-3 bg-brand-darker border border-brand-card rounded-lg text-white focus:outline-none focus:border-brand-gold">
                            </div>
                            <div>
                                <label class="block text-sm text-gray-400 mb-1">Price ($)</label>
                                <input type="number" id="puppyPrice" value="${puppy.price || ''}" step="100"
                                    class="w-full px-4 py-3 bg-brand-darker border border-brand-card rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-brand-gold">
                            </div>
                        </div>

                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm text-gray-400 mb-1">Status</label>
                                <select id="puppyStatus" class="w-full px-4 py-3 bg-brand-darker border border-brand-card rounded-lg text-white focus:outline-none focus:border-brand-gold">
                                    <option value="available" ${puppy.status === 'available' || puppy.status === 'Available' ? 'selected' : ''}>Available</option>
                                    <option value="reserved" ${puppy.status === 'reserved' || puppy.status === 'Reserved' ? 'selected' : ''}>Reserved</option>
                                    <option value="sold" ${puppy.status === 'sold' || puppy.status === 'adopted' ? 'selected' : ''}>Sold</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm text-gray-400 mb-1">Litter</label>
                                <select id="puppyLitter" class="w-full px-4 py-3 bg-brand-darker border border-brand-card rounded-lg text-white focus:outline-none focus:border-brand-gold">
                                    <option value="">Select Litter</option>
                                    ${litters.map(l => `<option value="${l.id}" ${l.id === puppy.litterId || l.id === puppy.litter_id ? 'selected' : ''}>${escapeHtml(l.name || 'Litter')}</option>`).join('')}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label class="block text-sm text-gray-400 mb-1">Customer</label>
                            <select id="puppyCustomer" class="w-full px-4 py-3 bg-brand-darker border border-brand-card rounded-lg text-white focus:outline-none focus:border-brand-gold">
                                <option value="">No Customer</option>
                                ${customers.map(c => `<option value="${c.id}" ${c.id === puppy.customerId || c.id === puppy.customer_id ? 'selected' : ''}>${escapeHtml(c.name)}</option>`).join('')}
                            </select>
                        </div>

                        <div class="pt-2">
                            <label class="flex items-center gap-3 cursor-pointer">
                                <input type="checkbox" id="puppyIsPublic" ${puppy.isPublic || puppy.is_public ? 'checked' : ''}
                                    class="w-5 h-5 rounded border-gray-600 text-brand-gold focus:ring-brand-gold bg-brand-darker">
                                <span class="text-gray-300">Show on Public Website</span>
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            <!-- RIGHT: Description -->
            <div class="lg:col-span-1">
                <div class="bg-brand-card rounded-xl p-6">
                    <h3 class="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <svg class="w-5 h-5 text-brand-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                            <polyline points="14 2 14 8 20 8"/>
                            <line x1="16" y1="13" x2="8" y2="13"/>
                            <line x1="16" y1="17" x2="8" y2="17"/>
                        </svg>
                        Description & Details
                    </h3>

                    <div class="space-y-4">
                        <div>
                            <label class="block text-sm text-gray-400 mb-1">Description</label>
                            <textarea id="puppyDescription" rows="6" placeholder="Tell potential families about this puppy's personality..."
                                class="w-full px-4 py-3 bg-brand-darker border border-brand-card rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-brand-gold resize-none">${escapeHtml(puppy.description || puppy.notes || '')}</textarea>
                        </div>

                        <div>
                            <label class="block text-sm text-gray-400 mb-1">Personality Traits</label>
                            <input type="text" id="puppyPersonality" value="${escapeHtml(puppy.personality || '')}" placeholder="e.g., Playful, Curious, Affectionate"
                                class="w-full px-4 py-3 bg-brand-darker border border-brand-card rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-brand-gold">
                        </div>

                        <div>
                            <label class="block text-sm text-gray-400 mb-1">Best Suited For</label>
                            <input type="text" id="puppyBestSuited" value="${escapeHtml(puppy.bestSuitedFor || puppy.best_suited_for || '')}" placeholder="e.g., Families with children"
                                class="w-full px-4 py-3 bg-brand-darker border border-brand-card rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-brand-gold">
                        </div>
                    </div>
                </div>

                <!-- Quick Info -->
                <div class="bg-brand-darker rounded-xl p-6 mt-6">
                    <h4 class="text-sm font-medium text-gray-400 mb-3">Quick Info</h4>
                    <div class="space-y-2 text-sm">
                        ${litter ? `<p class="text-gray-300"><span class="text-gray-500">Litter:</span> ${escapeHtml(litter.name || 'Unknown')}</p>` : ''}
                        ${puppy.birth_date || puppy.birthday ? `<p class="text-gray-300"><span class="text-gray-500">Born:</span> ${formatDate(puppy.birth_date || puppy.birthday)}</p>` : ''}
                        <p class="text-gray-300"><span class="text-gray-500">ID:</span> ${puppyId.substring(0, 8)}...</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Mobile Bottom Bar -->
        <div class="fixed bottom-0 left-0 right-0 bg-brand-card border-t border-brand-darker p-4 md:hidden z-40">
            <div class="flex gap-3">
                <button onclick="loadPage('puppies')" class="flex-1 py-3 bg-brand-darker text-gray-300 font-medium rounded-lg">
                    Cancel
                </button>
                <button onclick="savePuppyFromEditor('${puppyId}')" class="flex-1 py-3 bg-brand-gold text-brand-dark font-semibold rounded-lg">
                    Save
                </button>
            </div>
        </div>
        <div class="h-20 md:hidden"></div>
    `;

    // Initialize drag and drop for puppy photo uploads
    setTimeout(() => initPuppyPhotoDropZone(), 100);
}

// Save from full-page editor
async function savePuppyFromEditor(puppyId) {
    const personalityEl = document.getElementById('puppyPersonality');
    const bestSuitedEl = document.getElementById('puppyBestSuited');

    // Get photos from Bunny CDN upload grid
    const photos = getPuppyPhotoUrls();
    const videoUrl = getPuppyVideoUrl();
    const videoFeatured = isPuppyVideoFeatured();

    const puppy = {
        id: puppyId,
        name: document.getElementById('puppyName').value.trim(),
        litterId: document.getElementById('puppyLitter').value || null,
        gender: document.getElementById('puppyGender').value,
        color: document.getElementById('puppyColor').value.trim(),
        birthday: document.getElementById('puppyBirthday').value || null,
        price: document.getElementById('puppyPrice').value || null,
        status: document.getElementById('puppyStatus').value,
        customerId: document.getElementById('puppyCustomer').value || null,
        photo: photos[0] || '', // Primary photo for backwards compatibility
        photos: photos, // All photos array
        videoUrl: videoUrl,
        videoFeatured: videoFeatured,
        description: document.getElementById('puppyDescription').value.trim(),
        personality: personalityEl ? personalityEl.value.trim() : '',
        bestSuitedFor: bestSuitedEl ? bestSuitedEl.value.trim() : '',
        isPublic: document.getElementById('puppyIsPublic').checked
    };

    try {
        await DB.puppies.save(puppy);
        showToast('Puppy updated successfully', 'success');
        loadPage('puppies');
    } catch (error) {
        console.error('Error saving puppy:', error);
        showToast('Error saving puppy: ' + error.message, 'error');
    }
}

// Save new puppy from full-page add form
async function saveNewPuppy() {
    const litterId = document.getElementById('puppyLitter').value;

    if (!litterId) {
        showToast('Please select a litter', 'error');
        return;
    }

    // Get photos and video from Bunny CDN uploads
    const photos = getPuppyPhotoUrls();
    const videoUrl = getPuppyVideoUrl();
    const videoFeatured = isPuppyVideoFeatured();

    const puppy = {
        id: null, // New puppy
        name: document.getElementById('puppyName').value.trim(),
        litterId: litterId,
        gender: document.getElementById('puppyGender').value,
        color: document.getElementById('puppyColor').value.trim(),
        birthday: document.getElementById('puppyBirthday').value || null,
        price: document.getElementById('puppyPrice').value || null,
        status: document.getElementById('puppyStatus').value,
        customerId: document.getElementById('puppyCustomer').value || null,
        photo: photos[0] || '', // Primary photo for backwards compatibility
        photos: photos, // All photos array
        videoUrl: videoUrl,
        videoFeatured: videoFeatured,
        description: document.getElementById('puppyDescription').value.trim(),
        personality: document.getElementById('puppyPersonality')?.value.trim() || '',
        bestSuitedFor: document.getElementById('puppyBestSuited')?.value.trim() || '',
        isPublic: document.getElementById('puppyIsPublic').checked
    };

    try {
        await DB.puppies.save(puppy);
        showToast('Puppy added successfully', 'success');
        loadPage('puppies');
    } catch (error) {
        console.error('Error saving puppy:', error);
        showToast('Error saving puppy: ' + error.message, 'error');
    }
}

async function savePuppy(puppyId = null) {
    const personalityEl = document.getElementById('puppyPersonality');
    const bestSuitedEl = document.getElementById('puppyBestSuited');

    // Get photos - support multiple photos from Bunny CDN upload
    const photos = getPhotoFromGrid('puppyPhoto', true) || [];
    const photoUrl = photos[0] || '';

    const puppy = {
        id: puppyId,
        name: document.getElementById('puppyName').value.trim(),
        litterId: document.getElementById('puppyLitter').value || null,
        gender: document.getElementById('puppyGender').value,
        color: document.getElementById('puppyColor').value.trim(),
        birthday: document.getElementById('puppyBirthday').value || null,
        price: document.getElementById('puppyPrice').value || null,
        status: document.getElementById('puppyStatus').value,
        customerId: document.getElementById('puppyCustomer').value || null,
        photo: photoUrl,
        photos: photos,
        description: document.getElementById('puppyDescription').value.trim(),
        personality: personalityEl ? personalityEl.value.trim() : '',
        bestSuitedFor: bestSuitedEl ? bestSuitedEl.value.trim() : '',
        isPublic: document.getElementById('puppyIsPublic').checked
    };

    try {
        await DB.puppies.save(puppy);
        closeModal();
        showToast(puppyId ? 'Puppy updated successfully' : 'Puppy added successfully', 'success');
        loadPage('puppies');
    } catch (error) {
        console.error('Error saving puppy:', error);
        showToast('Error saving puppy: ' + error.message, 'error');
    }
}

async function confirmDeletePuppy(puppyId) {
    if (confirm('Are you sure you want to delete this puppy?')) {
        await DB.puppies.delete(puppyId);
        showToast('Puppy deleted successfully', 'success');
        loadPage('puppies');
    }
}

// Preview puppy on public website
function previewPuppy(puppyId) {
    const puppy = DB.puppies.getById(puppyId);
    if (!puppy) {
        showToast('Puppy not found', 'error');
        return;
    }
    // Open puppy detail page in new tab
    window.open(`puppy-detail.html?id=${puppyId}`, '_blank');
}

// AI Generate content for puppy
async function aiGeneratePuppyContent(puppyId) {
    const puppy = DB.puppies.getById(puppyId);
    if (!puppy) return;

    // Get litter info for context
    const litter = puppy.litter_id ? DB.litters.getById(puppy.litter_id) : null;

    // Build puppy context
    const puppyInfo = {
        name: puppy.name || '',
        gender: puppy.gender || 'unknown',
        color: puppy.color || 'unknown',
        breed: litter?.breed || 'Doodle',
        age: puppy.birthday ? calculateAge(puppy.birthday) : 'young',
        litterName: litter?.name || '',
        parents: litter ? `${litter.dam_name || 'Dam'} x ${litter.sire_name || 'Sire'}` : ''
    };

    // Open AI prompt modal
    openPuppyAIPromptModal(puppyId, puppyInfo);
}

// Open AI prompt modal for puppy content generation
function openPuppyAIPromptModal(puppyId, puppyInfo) {
    const contextDisplay = `
        <div class="bg-brand-darker rounded-lg p-3 mb-4">
            <h5 class="text-xs font-semibold text-gray-400 mb-2">PUPPY CONTEXT</h5>
            <div class="grid grid-cols-2 gap-2 text-xs">
                ${puppyInfo.name ? `<div><span class="text-gray-500">Name:</span> <span class="text-white">${escapeHtml(puppyInfo.name)}</span></div>` : ''}
                <div><span class="text-gray-500">Gender:</span> <span class="text-white">${puppyInfo.gender}</span></div>
                <div><span class="text-gray-500">Color:</span> <span class="text-white">${puppyInfo.color}</span></div>
                <div><span class="text-gray-500">Breed:</span> <span class="text-white">${puppyInfo.breed}</span></div>
                <div><span class="text-gray-500">Age:</span> <span class="text-white">${puppyInfo.age}</span></div>
                ${puppyInfo.parents ? `<div class="col-span-2"><span class="text-gray-500">Parents:</span> <span class="text-white">${escapeHtml(puppyInfo.parents)}</span></div>` : ''}
            </div>
        </div>
    `;

    const modalHTML = `
        <div id="puppyAIPromptOverlay" class="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div class="bg-brand-card rounded-xl p-6 max-w-2xl w-full my-8">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-xl font-bold text-white flex items-center gap-2">
                        <svg class="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                        </svg>
                        Generate Puppy Content with AI
                    </h3>
                    <button onclick="closePuppyAIPromptModal()" class="text-gray-400 hover:text-white">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                    </button>
                </div>

                <p class="text-sm text-gray-400 mb-4">
                    Provide a custom prompt to guide the AI in generating content for this puppy. The AI will generate a description, personality traits, best suited for, and ${!puppyInfo.name ? 'suggest a name' : 'enhance the content'}.
                </p>

                ${contextDisplay}

                <div class="mb-4">
                    <label class="block text-sm text-gray-400 mb-2">Your Custom Prompt</label>
                    <textarea id="puppyAICustomPrompt" rows="5" placeholder="Example: This puppy is very playful and loves to explore. Emphasize their adventurous spirit and family-friendly nature. Suggest they would do well with active families who enjoy outdoor activities." class="w-full px-4 py-3 bg-brand-darker border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none text-sm resize-none"></textarea>
                </div>

                <div class="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3 mb-4">
                    <p class="text-xs text-purple-300">
                        <strong>AI will generate:</strong> Description, Personality Traits, Best Suited For${!puppyInfo.name ? ', and Name Suggestion' : ''}
                    </p>
                </div>

                <div class="flex gap-3 justify-end">
                    <button onclick="closePuppyAIPromptModal()" class="px-4 py-2 bg-brand-darker text-gray-300 rounded-lg hover:bg-gray-700 transition-colors">
                        Cancel
                    </button>
                    <button onclick="generatePuppyContentWithAI('${puppyId}')" class="px-4 py-2 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-500 transition-colors flex items-center gap-2">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                        </svg>
                        Generate Content
                    </button>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Close on overlay click
    document.getElementById('puppyAIPromptOverlay').addEventListener('click', function(e) {
        if (e.target.id === 'puppyAIPromptOverlay') {
            closePuppyAIPromptModal();
        }
    });
}

// Close puppy AI prompt modal
function closePuppyAIPromptModal() {
    const overlay = document.getElementById('puppyAIPromptOverlay');
    if (overlay) {
        overlay.remove();
    }
}

// Generate puppy content using OpenAI
async function generatePuppyContentWithAI(puppyId) {
    const customPrompt = document.getElementById('puppyAICustomPrompt')?.value.trim();

    if (!customPrompt) {
        alert('Please enter a custom prompt to guide the AI generation.');
        return;
    }

    // Get puppy data and context
    const puppy = DB.puppies.getById(puppyId);
    if (!puppy) return;

    const litter = puppy.litter_id ? DB.litters.getById(puppy.litter_id) : null;
    const puppyInfo = {
        name: puppy.name || '',
        gender: puppy.gender || 'unknown',
        color: puppy.color || 'unknown',
        breed: litter?.breed || 'Doodle',
        age: puppy.birthday ? calculateAge(puppy.birthday) : 'young',
        parents: litter ? `${litter.dam_name || 'Dam'} x ${litter.sire_name || 'Sire'}` : ''
    };

    // Build context for AI
    let contextStr = `Breed: ${puppyInfo.breed}, Gender: ${puppyInfo.gender}, Color: ${puppyInfo.color}, Age: ${puppyInfo.age}`;
    if (puppyInfo.name) contextStr = `Name: ${puppyInfo.name}, ` + contextStr;
    if (puppyInfo.parents) contextStr += `, Parents: ${puppyInfo.parents}`;

    // Build the full prompt
    const fullPrompt = `${contextStr}\n\nCustom Instructions: ${customPrompt}\n\nPlease generate the following for this puppy profile in this exact format:\n\nNAME_SUGGESTION: [suggest a cute name based on color/personality if no name provided, or "Keep current name" if name exists]\nDESCRIPTION: [2-3 sentences describing the puppy's personality and appeal]\nPERSONALITY_TRAITS: [comma-separated list of 4-5 personality traits]\nBEST_SUITED_FOR: [comma-separated list of ideal home types/families]`;

    // Show loading state
    const generateBtn = event.target.closest('button');
    const originalBtnText = generateBtn.innerHTML;
    generateBtn.disabled = true;
    generateBtn.innerHTML = `
        <svg class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Generating...
    `;

    try {
        const aiResponse = await callOpenAIForPuppy(fullPrompt);

        // Parse the AI response
        const parsed = parsePuppyAIResponse(aiResponse);

        // Update form fields
        if (parsed.nameSuggestion && !puppy.name) {
            const nameEl = document.getElementById('puppyName');
            if (nameEl && parsed.nameSuggestion !== 'Keep current name') {
                nameEl.value = parsed.nameSuggestion;
            }
        }

        if (parsed.description) {
            const descEl = document.getElementById('puppyDescription');
            if (descEl) descEl.value = parsed.description;
        }

        if (parsed.personalityTraits) {
            const personalityEl = document.getElementById('puppyPersonality');
            if (personalityEl) personalityEl.value = parsed.personalityTraits;
        }

        if (parsed.bestSuitedFor) {
            const bestSuitedEl = document.getElementById('puppyBestSuited');
            if (bestSuitedEl) bestSuitedEl.value = parsed.bestSuitedFor;
        }

        // Close modal
        closePuppyAIPromptModal();

        // Show success message
        showToast('Content generated successfully! Review and edit as needed.', 'success');
    } catch (error) {
        console.error('AI generation error:', error);
        alert('Error generating content: ' + error.message);

        // Restore button
        generateBtn.disabled = false;
        generateBtn.innerHTML = originalBtnText;
    }
}

// Call OpenAI API for puppy content
async function callOpenAIForPuppy(prompt) {
    // Check if API key is configured
    if (!CONFIG.OPENAI_API_KEY || CONFIG.OPENAI_API_KEY === 'your-openai-api-key-here') {
        throw new Error('OpenAI API key not configured. Please add your API key to js/config.js');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${CONFIG.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
            model: 'gpt-4',
            messages: [
                {
                    role: 'system',
                    content: 'You are a professional dog breeder copywriter. Generate warm, engaging, and accurate content for puppy profiles that highlight their personality, temperament, and appeal to potential families. Always follow the exact format requested.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            temperature: 0.7,
            max_tokens: 400
        })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'OpenAI API request failed');
    }

    const data = await response.json();
    return data.choices[0].message.content.trim();
}

// Parse AI response into structured data
function parsePuppyAIResponse(aiText) {
    const result = {
        nameSuggestion: '',
        description: '',
        personalityTraits: '',
        bestSuitedFor: ''
    };

    // Extract each section using regex
    const nameMatch = aiText.match(/NAME_SUGGESTION:\s*(.+?)(?=\n|$)/i);
    const descMatch = aiText.match(/DESCRIPTION:\s*(.+?)(?=\nPERSONALITY_TRAITS:|$)/is);
    const personalityMatch = aiText.match(/PERSONALITY_TRAITS:\s*(.+?)(?=\nBEST_SUITED_FOR:|$)/is);
    const bestSuitedMatch = aiText.match(/BEST_SUITED_FOR:\s*(.+?)$/is);

    if (nameMatch) result.nameSuggestion = nameMatch[1].trim();
    if (descMatch) result.description = descMatch[1].trim();
    if (personalityMatch) result.personalityTraits = personalityMatch[1].trim();
    if (bestSuitedMatch) result.bestSuitedFor = bestSuitedMatch[1].trim();

    return result;
}

// AI Generate for NEW puppy (Add Puppy form)
async function aiGenerateNewPuppyContent() {
    // Gather current form data
    const gender = document.getElementById('puppyGender')?.value || 'unknown';
    const color = document.getElementById('puppyColor')?.value.trim() || 'unknown';
    const litterId = document.getElementById('puppyLitter')?.value;
    const birthday = document.getElementById('puppyBirthday')?.value;
    const name = document.getElementById('puppyName')?.value.trim() || '';

    // Get litter info for breed and parents
    const litter = litterId ? DB.litters.getById(litterId) : null;
    const breed = litter?.breed || 'Doodle';
    const age = birthday ? calculateAge(birthday) : 'young puppy';
    const parents = litter ? `${litter.dam_name || 'Dam'} x ${litter.sire_name || 'Sire'}` : '';

    // Build puppy context
    const puppyInfo = {
        name: name,
        gender: gender,
        color: color,
        breed: breed,
        age: age,
        litterName: litter?.name || '',
        parents: parents
    };

    // Open AI prompt modal with puppy context
    openNewPuppyAIPromptModal(puppyInfo);
}

// Open AI prompt modal for NEW puppy
function openNewPuppyAIPromptModal(puppyInfo) {
    const contextDisplay = `
        <div class="bg-brand-darker rounded-lg p-3 mb-4">
            <h5 class="text-xs font-semibold text-gray-400 mb-2">PUPPY CONTEXT</h5>
            <div class="grid grid-cols-2 gap-2 text-xs">
                ${puppyInfo.name ? `<div><span class="text-gray-500">Name:</span> <span class="text-white">${escapeHtml(puppyInfo.name)}</span></div>` : '<div class="col-span-2"><span class="text-gray-500">Name:</span> <span class="text-purple-300">Will suggest a name</span></div>'}
                <div><span class="text-gray-500">Gender:</span> <span class="text-white">${puppyInfo.gender}</span></div>
                <div><span class="text-gray-500">Color:</span> <span class="text-white">${puppyInfo.color}</span></div>
                <div><span class="text-gray-500">Breed:</span> <span class="text-white">${puppyInfo.breed}</span></div>
                <div><span class="text-gray-500">Age:</span> <span class="text-white">${puppyInfo.age}</span></div>
                ${puppyInfo.parents ? `<div class="col-span-2"><span class="text-gray-500">Parents:</span> <span class="text-white">${escapeHtml(puppyInfo.parents)}</span></div>` : ''}
            </div>
            <div class="mt-2 pt-2 border-t border-gray-700">
                <p class="text-xs text-purple-300"><strong>Context:</strong> This is a PUPPY (not an adult dog)</p>
            </div>
        </div>
    `;

    const modalHTML = `
        <div id="puppyAIPromptOverlay" class="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div class="bg-brand-card rounded-xl p-6 max-w-2xl w-full my-8">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-xl font-bold text-white flex items-center gap-2">
                        <svg class="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                        </svg>
                        Generate Puppy Content with AI
                    </h3>
                    <button onclick="closePuppyAIPromptModal()" class="text-gray-400 hover:text-white">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                    </button>
                </div>

                <p class="text-sm text-gray-400 mb-4">
                    Provide a custom prompt to guide the AI in generating content for this puppy. The AI will generate a name suggestion, description, personality traits, and best suited for.
                </p>

                ${contextDisplay}

                <div class="mb-4">
                    <label class="block text-sm text-gray-400 mb-2">Your Custom Prompt</label>
                    <textarea id="newPuppyAICustomPrompt" rows="5" placeholder="Example: This puppy is very playful and loves to explore. Emphasize their adventurous spirit and family-friendly nature. Suggest they would do well with active families who enjoy outdoor activities." class="w-full px-4 py-3 bg-brand-darker border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none text-sm resize-none"></textarea>
                </div>

                <div class="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3 mb-4">
                    <p class="text-xs text-purple-300">
                        <strong>AI will generate:</strong> ${!puppyInfo.name ? 'Name Suggestion, ' : ''}Description, Personality Traits, Best Suited For
                    </p>
                </div>

                <div class="flex gap-3 justify-end">
                    <button onclick="closePuppyAIPromptModal()" class="px-4 py-2 bg-brand-darker text-gray-300 rounded-lg hover:bg-gray-700 transition-colors">
                        Cancel
                    </button>
                    <button onclick="generateNewPuppyContentWithAI()" class="px-4 py-2 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-500 transition-colors flex items-center gap-2">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                        </svg>
                        Generate Content
                    </button>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Close on overlay click
    document.getElementById('puppyAIPromptOverlay').addEventListener('click', function(e) {
        if (e.target.id === 'puppyAIPromptOverlay') {
            closePuppyAIPromptModal();
        }
    });
}

// Generate content for NEW puppy with AI
async function generateNewPuppyContentWithAI() {
    const customPrompt = document.getElementById('newPuppyAICustomPrompt')?.value.trim();

    if (!customPrompt) {
        alert('Please enter a custom prompt to guide the AI generation.');
        return;
    }

    // Gather form data again
    const gender = document.getElementById('puppyGender')?.value || 'unknown';
    const color = document.getElementById('puppyColor')?.value.trim() || 'unknown';
    const litterId = document.getElementById('puppyLitter')?.value;
    const birthday = document.getElementById('puppyBirthday')?.value;
    const name = document.getElementById('puppyName')?.value.trim() || '';

    const litter = litterId ? DB.litters.getById(litterId) : null;
    const breed = litter?.breed || 'Doodle';
    const age = birthday ? calculateAge(birthday) : 'young puppy';
    const parents = litter ? `${litter.dam_name || 'Dam'} x ${litter.sire_name || 'Sire'}` : '';

    // Build context - emphasize PUPPY
    let contextStr = `This is a PUPPY. Breed: ${breed}, Gender: ${gender}, Color: ${color}, Age: ${age}`;
    if (name) contextStr = `Name: ${name}, ` + contextStr;
    if (parents) contextStr += `, Parents: ${parents}`;

    // Build the full prompt
    const fullPrompt = `${contextStr}\n\nCustom Instructions: ${customPrompt}\n\nPlease generate the following for this PUPPY profile in this exact format:\n\nNAME_SUGGESTION: [suggest a cute puppy name based on color/personality if no name provided, or "Keep current name" if name exists]\nDESCRIPTION: [2-3 sentences describing the puppy's personality and appeal - remember this is a PUPPY, not an adult dog]\nPERSONALITY_TRAITS: [comma-separated list of 4-5 personality traits suitable for a young puppy]\nBEST_SUITED_FOR: [comma-separated list of ideal home types/families for this puppy]`;

    // Show loading state
    const generateBtn = event.target.closest('button');
    const originalBtnText = generateBtn.innerHTML;
    generateBtn.disabled = true;
    generateBtn.innerHTML = `
        <svg class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Generating...
    `;

    try {
        const aiResponse = await callOpenAIForPuppy(fullPrompt);

        // Parse the AI response
        const parsed = parsePuppyAIResponse(aiResponse);

        // Update form fields
        if (parsed.nameSuggestion && !name) {
            const nameEl = document.getElementById('puppyName');
            if (nameEl && parsed.nameSuggestion !== 'Keep current name') {
                nameEl.value = parsed.nameSuggestion;
            }
        }

        if (parsed.description) {
            const descEl = document.getElementById('puppyDescription');
            if (descEl) descEl.value = parsed.description;
        }

        if (parsed.personalityTraits) {
            const personalityEl = document.getElementById('puppyPersonality');
            if (personalityEl) personalityEl.value = parsed.personalityTraits;
        }

        if (parsed.bestSuitedFor) {
            const bestSuitedEl = document.getElementById('puppyBestSuited');
            if (bestSuitedEl) bestSuitedEl.value = parsed.bestSuitedFor;
        }

        // Close modal
        closePuppyAIPromptModal();

        // Show success message
        showToast('Content generated successfully! Review and edit as needed.', 'success');
    } catch (error) {
        console.error('AI generation error:', error);
        alert('Error generating content: ' + error.message);

        // Restore button
        generateBtn.disabled = false;
        generateBtn.innerHTML = originalBtnText;
    }
}

function calculateAge(birthday) {
    if (!birthday) return 'young';
    const birth = new Date(birthday);
    const now = new Date();
    const weeks = Math.floor((now - birth) / (7 * 24 * 60 * 60 * 1000));
    if (weeks < 1) return 'newborn';
    if (weeks < 8) return `${weeks} weeks old`;
    const months = Math.floor(weeks / 4);
    return `${months} month${months !== 1 ? 's' : ''} old`;
}

// Inline customer creation for puppy form
function toggleInlineCustomerForm() {
    const form = document.getElementById('inlineCustomerForm');
    if (form) {
        const isHidden = form.style.display === 'none';
        form.style.display = isHidden ? 'block' : 'none';
        if (isHidden) {
            document.getElementById('inlineCustomerName')?.focus();
        }
    }
}

function saveInlineCustomer() {
    const name = document.getElementById('inlineCustomerName')?.value.trim();
    const email = document.getElementById('inlineCustomerEmail')?.value.trim();
    const phone = document.getElementById('inlineCustomerPhone')?.value.trim();
    const type = document.getElementById('inlineCustomerType')?.value;

    if (!name) {
        showToast('Please enter a customer name', 'error');
        return;
    }

    // Create the customer
    const customer = {
        name,
        email,
        phone,
        isGuardian: type === 'guardian'
    };

    // Save and get the new ID
    const savedCustomer = DB.customers.save(customer);

    // Add to the dropdown and select it
    const select = document.getElementById('puppyCustomer');
    if (select && savedCustomer) {
        const option = document.createElement('option');
        option.value = savedCustomer.id;
        option.textContent = savedCustomer.name;
        option.selected = true;
        select.appendChild(option);
    }

    // Clear and hide the form
    document.getElementById('inlineCustomerName').value = '';
    document.getElementById('inlineCustomerEmail').value = '';
    document.getElementById('inlineCustomerPhone').value = '';
    document.getElementById('inlineCustomerType').value = 'buyer';
    toggleInlineCustomerForm();

    showToast('Customer added and selected', 'success');
}

// Customer Modal
function openAddCustomerModal() {
    const content = getCustomerFormHtml();
    const footer = `
        <button class="btn btn-outline" onclick="closeModal()">Cancel</button>
        <button class="btn btn-primary" onclick="saveCustomer()">Add Customer</button>
    `;
    openModal('Add New Customer', content, footer);
    setTimeout(() => initPhotoDropZone('guardianPhoto'), 100);
}

function openEditCustomerModal(customerId) {
    const customer = DB.customers.getById(customerId);
    if (!customer) return;

    const content = getCustomerFormHtml(customer);
    const footer = `
        <button class="btn btn-outline" onclick="closeModal()">Cancel</button>
        <button class="btn btn-primary" onclick="saveCustomer('${customerId}')">Save Changes</button>
    `;
    openModal('Edit Customer', content, footer);
    setTimeout(() => initPhotoDropZone('guardianPhoto'), 100);
}

function getCustomerFormHtml(customer = {}) {
    return `
        <div class="form-tabs" style="margin-bottom: 1.5rem;">
            <button type="button" class="form-tab active" onclick="switchCustomerFormTab('basic', this)">Basic Info</button>
            <button type="button" class="form-tab" onclick="switchCustomerFormTab('guardian', this)">Guardian Settings</button>
        </div>

        <div id="customerFormBasic">
            <div class="form-group">
                <label>Name <span class="required">*</span></label>
                <input type="text" id="customerName" value="${escapeHtml(customer.name || '')}" required>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Email</label>
                    <input type="email" id="customerEmail" value="${escapeHtml(customer.email || '')}">
                </div>
                <div class="form-group">
                    <label>Phone</label>
                    <input type="tel" id="customerPhone" value="${escapeHtml(customer.phone || '')}">
                </div>
            </div>
            <div class="form-group">
                <label>Address <span class="private-badge">Private</span></label>
                <textarea id="customerAddress" placeholder="Full address (private - not shown on website)">${escapeHtml(customer.address || '')}</textarea>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>City</label>
                    <input type="text" id="customerCity" value="${escapeHtml(customer.city || '')}" placeholder="City">
                </div>
                <div class="form-group">
                    <label>State</label>
                    <input type="text" id="customerState" value="${escapeHtml(customer.state || '')}" placeholder="State">
                </div>
            </div>
            <div class="form-group">
                <label>Notes <span class="private-badge">Private</span></label>
                <textarea id="customerNotes" placeholder="Internal notes (not shown on website)">${escapeHtml(customer.notes || '')}</textarea>
            </div>
        </div>

        <div id="customerFormGuardian" style="display: none;">
            <div class="form-group">
                <label class="toggle-label">
                    <input type="checkbox" id="customerIsGuardian" ${customer.isGuardian ? 'checked' : ''} onchange="toggleGuardianFields()">
                    <span class="toggle-switch"></span>
                    <span>This is a Guardian Home</span>
                </label>
            </div>

            <div id="guardianFields" style="display: ${customer.isGuardian ? 'block' : 'none'};">
                <div class="form-divider"></div>
                <h4 style="color: var(--accent-gold); margin-bottom: 1rem;">Public Information (shown on website)</h4>

                <div class="form-group">
                    <label class="toggle-label">
                        <input type="checkbox" id="customerShowOnWebsite" ${customer.showOnWebsite ? 'checked' : ''}>
                        <span class="toggle-switch"></span>
                        <span>Show on Guardian Homes page</span>
                    </label>
                </div>

                <div class="form-group">
                    <label>Display Name (Public)</label>
                    <input type="text" id="guardianDisplayName" value="${escapeHtml(customer.guardianDisplayName || '')}" placeholder="e.g., The Smith Family">
                </div>
                <div class="form-group">
                    <label>Location (Public)</label>
                    <input type="text" id="guardianLocation" value="${escapeHtml(customer.guardianLocation || '')}" placeholder="e.g., Phoenix, AZ (city/state only)">
                </div>
                <div class="form-group">
                    <label>Guardian Photo</label>
                    ${getPhotoUploadHtml('guardianPhoto', { currentPhoto: customer.guardianPhoto || '', hint: 'Photo for website display' })}
                </div>
                <div class="form-group">
                    <label>Public Bio</label>
                    <textarea id="guardianBio" placeholder="Brief bio shown on website...">${escapeHtml(customer.guardianBio || '')}</textarea>
                </div>

                <div class="form-divider"></div>
                <h4 style="color: var(--text-muted); margin-bottom: 1rem;">Private Guardian Information</h4>

                <div class="form-group">
                    <label>Guardian Since</label>
                    <input type="date" id="guardianSince" value="${customer.guardianSince || ''}">
                </div>
                <div class="form-group">
                    <label>Guardian Notes <span class="private-badge">Private</span></label>
                    <textarea id="guardianNotes" placeholder="Private notes about this guardian home...">${escapeHtml(customer.guardianNotes || '')}</textarea>
                </div>
            </div>
        </div>
    `;
}

function switchCustomerFormTab(tab, btn) {
    document.querySelectorAll('.form-tab').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('customerFormBasic').style.display = tab === 'basic' ? 'block' : 'none';
    document.getElementById('customerFormGuardian').style.display = tab === 'guardian' ? 'block' : 'none';
}

function toggleGuardianFields() {
    const isGuardian = document.getElementById('customerIsGuardian').checked;
    document.getElementById('guardianFields').style.display = isGuardian ? 'block' : 'none';
}

function saveCustomer(customerId = null) {
    const customer = {
        id: customerId,
        name: document.getElementById('customerName').value.trim(),
        email: document.getElementById('customerEmail').value.trim(),
        phone: document.getElementById('customerPhone').value.trim(),
        address: document.getElementById('customerAddress').value.trim(),
        city: document.getElementById('customerCity').value.trim(),
        state: document.getElementById('customerState').value.trim(),
        notes: document.getElementById('customerNotes').value.trim(),
        // Guardian fields
        isGuardian: document.getElementById('customerIsGuardian').checked,
        showOnWebsite: document.getElementById('customerShowOnWebsite')?.checked || false,
        guardianDisplayName: document.getElementById('guardianDisplayName')?.value.trim() || '',
        guardianLocation: document.getElementById('guardianLocation')?.value.trim() || '',
        guardianPhoto: getPhotoFromGrid('guardianPhoto') || '',
        guardianBio: document.getElementById('guardianBio')?.value.trim() || '',
        guardianSince: document.getElementById('guardianSince')?.value || '',
        guardianNotes: document.getElementById('guardianNotes')?.value.trim() || ''
    };

    if (!customer.name) {
        showToast('Please enter a name', 'error');
        return;
    }

    DB.customers.save(customer);
    closeModal();
    showToast(customerId ? 'Customer updated successfully' : 'Customer added successfully', 'success');
    loadPage('customers');
}

async function confirmDeleteCustomer(customerId) {
    if (confirm('Are you sure you want to delete this customer?')) {
        await DB.customers.delete(customerId);
        showToast('Customer deleted successfully', 'success');
        loadPage('customers');
    }
}

// Reminder Modal
function openAddReminderModal() {
    const content = `
        <div class="form-group">
            <label>Title <span class="required">*</span></label>
            <input type="text" id="reminderTitle" required>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>Date <span class="required">*</span></label>
                <input type="date" id="reminderDate" required>
            </div>
            <div class="form-group">
                <label>Type</label>
                <select id="reminderType">
                    <option value="">General</option>
                    <option value="vet">Vet Appointment</option>
                    <option value="vaccine">Vaccination</option>
                    <option value="heat">Heat Cycle</option>
                    <option value="birthday">Birthday</option>
                </select>
            </div>
        </div>
        <div class="form-group">
            <label>Description</label>
            <textarea id="reminderDescription"></textarea>
        </div>
    `;
    const footer = `
        <button class="btn btn-outline" onclick="closeModal()">Cancel</button>
        <button class="btn btn-primary" onclick="saveReminder()">Add Reminder</button>
    `;
    openModal('Add Reminder', content, footer);
}

async function saveReminder() {
    const reminder = {
        title: document.getElementById('reminderTitle').value.trim(),
        date: document.getElementById('reminderDate').value,
        type: document.getElementById('reminderType').value,
        description: document.getElementById('reminderDescription').value.trim(),
        completed: false
    };

    if (!reminder.title || !reminder.date) {
        showToast('Please enter a title and date', 'error');
        return;
    }

    await DB.reminders.save(reminder);
    closeModal();
    showToast('Reminder added successfully', 'success');
    loadPage('reminders');
}

async function markReminderComplete(reminderId) {
    await DB.reminders.markComplete(reminderId);
    showToast('Reminder marked as complete', 'success');
    loadPage('reminders');
}

async function confirmDeleteReminder(reminderId) {
    if (confirm('Delete this reminder?')) {
        await DB.reminders.delete(reminderId);
        showToast('Reminder deleted', 'success');
        loadPage('reminders');
    }
}

// Vet Visit Modal
function openAddVetVisitModal(dogId) {
    currentDogId = dogId;
    const content = `
        <div class="form-group">
            <label>Date <span class="required">*</span></label>
            <input type="date" id="vetDate" required>
        </div>
        <div class="form-group">
            <label>Reason <span class="required">*</span></label>
            <input type="text" id="vetReason" placeholder="e.g., Annual checkup, Vaccination, etc.">
        </div>
        <div class="form-group">
            <label>Veterinarian</label>
            <input type="text" id="vetDoctor">
        </div>
        <div class="form-group">
            <label>Notes</label>
            <textarea id="vetNotes"></textarea>
        </div>
    `;
    const footer = `
        <button class="btn btn-outline" onclick="closeModal()">Cancel</button>
        <button class="btn btn-primary" onclick="saveVetVisit()">Add Visit</button>
    `;
    openModal('Add Vet Visit', content, footer);
}

function saveVetVisit() {
    const visit = {
        date: document.getElementById('vetDate').value,
        reason: document.getElementById('vetReason').value.trim(),
        veterinarian: document.getElementById('vetDoctor').value.trim(),
        notes: document.getElementById('vetNotes').value.trim()
    };

    if (!visit.date || !visit.reason) {
        showToast('Please enter date and reason', 'error');
        return;
    }

    DB.vetVisits.add(currentDogId, visit);
    closeModal();
    showToast('Vet visit added successfully', 'success');
    viewDogProfile(currentDogId);
}

// View profiles
function viewLitterProfile(litterId) {
    currentLitterId = litterId;
    const litter = DB.litters.getById(litterId);
    if (!litter) return;

    // Use snake_case for Supabase columns
    const mother = DB.dogs.getById(litter.mother_id);
    const father = DB.dogs.getById(litter.father_id);
    const puppies = DB.puppies.getByLitter(litterId);

    // Calculate litter stats
    const availableCount = puppies.filter(p => p.status === 'available').length;
    const reservedCount = puppies.filter(p => p.status === 'reserved').length;
    const soldCount = puppies.filter(p => p.status === 'sold').length;

    const statusColors = {
        available: 'bg-green-500/20 text-green-400 border-green-500/30',
        reserved: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
        sold: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
        kept: 'bg-purple-500/20 text-purple-400 border-purple-500/30'
    };

    document.getElementById('main-content').innerHTML = `
        <!-- Page Header with Breadcrumb -->
        <div class="mb-6">
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <div class="flex items-center gap-2 text-sm text-gray-400 mb-2">
                        <a href="#" onclick="loadPage('litters'); return false;" class="hover:text-brand-gold transition-colors">Litters</a>
                        <span>/</span>
                        <span class="text-white">${escapeHtml(litter.name || 'Litter Details')}</span>
                    </div>
                    <h1 class="text-2xl font-bold text-white">${escapeHtml(litter.name || 'Litter Details')}</h1>
                </div>
                <div class="flex items-center gap-3">
                    <button onclick="openEditLitterModal('${litterId}')" class="px-4 py-2 bg-brand-card text-gray-300 font-medium rounded-lg hover:bg-brand-darker border border-brand-card hover:border-brand-gold transition-colors">
                        Edit Litter
                    </button>
                    <button onclick="openAddPuppyModal('${litterId}')" class="px-4 py-2 bg-brand-gold text-brand-dark font-semibold rounded-lg hover:bg-brand-gold-light transition-colors">
                        + Add Puppy
                    </button>
                </div>
            </div>
        </div>

        <!-- Litter Info Card -->
        <div class="bg-brand-card rounded-xl p-6 mb-6">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <!-- Mother -->
                <div class="flex items-center gap-4">
                    <div class="w-14 h-14 bg-pink-500/20 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                        ${mother?.image_url
                            ? `<img src="${mother.image_url}" alt="${escapeHtml(mother.name)}" class="w-full h-full object-cover">`
                            : `<svg class="w-6 h-6 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`
                        }
                    </div>
                    <div>
                        <p class="text-xs text-gray-500 uppercase tracking-wide mb-1">Mother (Dam)</p>
                        <p class="text-white font-semibold">${mother?.name || 'Not assigned'}</p>
                        ${mother?.breed ? `<p class="text-sm text-gray-400">${escapeHtml(mother.breed)}</p>` : ''}
                    </div>
                </div>

                <!-- Father -->
                <div class="flex items-center gap-4">
                    <div class="w-14 h-14 bg-blue-500/20 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                        ${father?.image_url
                            ? `<img src="${father.image_url}" alt="${escapeHtml(father.name)}" class="w-full h-full object-cover">`
                            : `<svg class="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`
                        }
                    </div>
                    <div>
                        <p class="text-xs text-gray-500 uppercase tracking-wide mb-1">Father (Sire)</p>
                        <p class="text-white font-semibold">${father?.name || 'Not assigned'}</p>
                        ${father?.breed ? `<p class="text-sm text-gray-400">${escapeHtml(father.breed)}</p>` : ''}
                    </div>
                </div>

                <!-- Birth Date -->
                <div class="flex items-center gap-4">
                    <div class="w-14 h-14 bg-brand-gold/20 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg class="w-6 h-6 text-brand-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                            <line x1="16" y1="2" x2="16" y2="6"/>
                            <line x1="8" y1="2" x2="8" y2="6"/>
                            <line x1="3" y1="10" x2="21" y2="10"/>
                        </svg>
                    </div>
                    <div>
                        <p class="text-xs text-gray-500 uppercase tracking-wide mb-1">Birth Date</p>
                        <p class="text-white font-semibold">${litter.birth_date ? formatDate(litter.birth_date) : 'Expected'}</p>
                        ${litter.expected_date && !litter.birth_date ? `<p class="text-sm text-gray-400">Due: ${formatDate(litter.expected_date)}</p>` : ''}
                    </div>
                </div>

                <!-- Puppy Stats -->
                <div class="flex items-center gap-4">
                    <div class="w-14 h-14 bg-purple-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                        <span class="text-xl font-bold text-purple-400">${puppies.length}</span>
                    </div>
                    <div>
                        <p class="text-xs text-gray-500 uppercase tracking-wide mb-1">Puppies</p>
                        <div class="flex items-center gap-2 text-sm">
                            ${availableCount > 0 ? `<span class="text-green-400">${availableCount} avail</span>` : ''}
                            ${reservedCount > 0 ? `<span class="text-yellow-400">${reservedCount} rsrvd</span>` : ''}
                            ${soldCount > 0 ? `<span class="text-blue-400">${soldCount} sold</span>` : ''}
                            ${puppies.length === 0 ? `<span class="text-gray-400">None yet</span>` : ''}
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Puppies Section -->
        <div class="mb-4">
            <h2 class="text-lg font-semibold text-white">Puppies in this Litter</h2>
        </div>

        ${puppies.length === 0 ? `
            <div class="bg-brand-card rounded-xl p-12 text-center">
                <div class="w-16 h-16 bg-brand-gold/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg class="w-8 h-8 text-brand-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                </div>
                <p class="text-gray-400 mb-4">No puppies added to this litter yet</p>
                <button onclick="openAddPuppyModal('${litterId}')" class="px-4 py-2 bg-brand-gold text-brand-dark font-semibold rounded-lg hover:bg-brand-gold-light transition-colors">
                    Add First Puppy
                </button>
            </div>
        ` : `
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                ${puppies.map(p => `
                    <div class="bg-brand-card rounded-xl p-5 cursor-pointer hover:bg-brand-darker/50 border border-transparent hover:border-brand-gold/30 transition-all" onclick="viewPuppyProfile('${p.id}')">
                        <div class="flex items-start gap-4">
                            <!-- Photo -->
                            <div class="w-16 h-16 bg-brand-gold/20 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                                ${p.photo_url
                                    ? `<img src="${p.photo_url}" alt="${escapeHtml(p.name || 'Puppy')}" class="w-full h-full object-cover">`
                                    : `<svg class="w-8 h-8 text-brand-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`
                                }
                            </div>
                            <!-- Info -->
                            <div class="flex-1 min-w-0">
                                <h4 class="font-semibold text-white truncate">${escapeHtml(p.name || 'Unnamed')}</h4>
                                <p class="text-sm text-gray-400 mt-1">
                                    ${p.gender === 'female' ? 'Female' : 'Male'}${p.color ? ` • ${escapeHtml(p.color)}` : ''}
                                </p>
                                <div class="mt-2">
                                    <span class="inline-block px-2 py-1 text-xs font-medium rounded-full border ${statusColors[p.status] || 'bg-gray-500/20 text-gray-400 border-gray-500/30'}">
                                        ${(p.status || 'unknown').charAt(0).toUpperCase() + (p.status || 'unknown').slice(1)}
                                    </span>
                                </div>
                                ${p.price ? `<p class="text-brand-gold font-semibold mt-2">$${Number(p.price).toLocaleString()}</p>` : ''}
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `}
    `;
}

function viewPuppyProfile(puppyId) {
    const puppy = DB.puppies.getById(puppyId);
    if (!puppy) return;

    // Use snake_case for Supabase columns
    const litter = puppy.litter_id ? DB.litters.getById(puppy.litter_id) : null;
    const mother = litter ? DB.dogs.getById(litter.mother_id) : null;
    const father = litter ? DB.dogs.getById(litter.father_id) : null;
    const customer = puppy.customer_id ? DB.customers.getById(puppy.customer_id) : null;
    const updates = puppy.updates || [];

    const statusColors = {
        available: 'bg-green-500/20 text-green-400',
        reserved: 'bg-yellow-500/20 text-yellow-400',
        sold: 'bg-blue-500/20 text-blue-400',
        kept: 'bg-purple-500/20 text-purple-400'
    };

    document.getElementById('main-content').innerHTML = `
        <!-- Page Header with Breadcrumb -->
        <div class="mb-6">
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <div class="flex items-center gap-2 text-sm text-gray-400 mb-2">
                        <a href="#" onclick="loadPage('puppies'); return false;" class="hover:text-brand-gold transition-colors">Puppies</a>
                        <span>/</span>
                        <span class="text-white">${escapeHtml(puppy.name || 'Puppy Details')}</span>
                    </div>
                    <h1 class="text-2xl font-bold text-white">${escapeHtml(puppy.name || 'Unnamed Puppy')}</h1>
                    ${mother && father ? `<p class="text-gray-400 mt-1">${mother.name} x ${father.name}</p>` : ''}
                </div>
                <div class="flex items-center gap-3">
                    <button onclick="openEditPuppyModal('${puppyId}')" class="px-4 py-2 bg-brand-card text-gray-300 font-medium rounded-lg hover:bg-brand-darker border border-brand-card hover:border-brand-gold transition-colors">
                        Edit Puppy
                    </button>
                    <button onclick="openAddUpdateModal('${puppyId}')" class="px-4 py-2 bg-brand-gold text-brand-dark font-semibold rounded-lg hover:bg-brand-gold-light transition-colors">
                        + Add Update
                    </button>
                </div>
            </div>
        </div>

        <!-- Puppy Profile Card -->
        <div class="bg-brand-card rounded-xl p-6 mb-6">
            <div class="flex flex-col md:flex-row gap-6">
                <!-- Photo -->
                <div class="flex-shrink-0">
                    <div class="w-40 h-40 bg-brand-gold/20 rounded-xl flex items-center justify-center overflow-hidden">
                        ${puppy.photo_url
                            ? `<img src="${puppy.photo_url}" alt="${escapeHtml(puppy.name || 'Puppy')}" class="w-full h-full object-cover">`
                            : `<svg class="w-16 h-16 text-brand-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`
                        }
                    </div>
                </div>

                <!-- Info Grid -->
                <div class="flex-1 grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                        <p class="text-xs text-gray-500 uppercase tracking-wide mb-1">Gender</p>
                        <p class="text-white font-medium">${puppy.gender === 'female' ? 'Female' : 'Male'}</p>
                    </div>
                    <div>
                        <p class="text-xs text-gray-500 uppercase tracking-wide mb-1">Color</p>
                        <p class="text-white font-medium">${escapeHtml(puppy.color || 'N/A')}</p>
                    </div>
                    <div>
                        <p class="text-xs text-gray-500 uppercase tracking-wide mb-1">Status</p>
                        <span class="inline-block px-2 py-1 text-xs font-medium rounded-full ${statusColors[puppy.status] || 'bg-gray-500/20 text-gray-400'}">
                            ${(puppy.status || 'unknown').charAt(0).toUpperCase() + (puppy.status || 'unknown').slice(1)}
                        </span>
                    </div>
                    <div>
                        <p class="text-xs text-gray-500 uppercase tracking-wide mb-1">Price</p>
                        <p class="text-brand-gold font-semibold">${puppy.price ? '$' + Number(puppy.price).toLocaleString() : 'N/A'}</p>
                    </div>
                    <div>
                        <p class="text-xs text-gray-500 uppercase tracking-wide mb-1">Litter</p>
                        ${litter
                            ? `<a href="#" onclick="viewLitterProfile('${litter.id}'); return false;" class="text-brand-gold hover:text-brand-gold-light">${escapeHtml(litter.name || 'View Litter')}</a>`
                            : `<p class="text-gray-400">Not assigned</p>`
                        }
                    </div>
                    ${puppy.birthday ? `
                    <div>
                        <p class="text-xs text-gray-500 uppercase tracking-wide mb-1">Age</p>
                        <p class="text-white font-medium">${calculatePuppyAge(puppy.birthday)}</p>
                    </div>
                    ` : ''}
                </div>
            </div>
        </div>

        ${customer ? `
            <!-- Customer Card -->
            <div class="bg-brand-card rounded-xl p-6 mb-6">
                <h2 class="text-lg font-semibold text-white mb-4">Customer Information</h2>
                <div class="flex items-center gap-4">
                    <div class="w-12 h-12 bg-brand-gold/20 rounded-full flex items-center justify-center">
                        <span class="text-brand-gold font-bold text-lg">${customer.name.charAt(0).toUpperCase()}</span>
                    </div>
                    <div>
                        <h4 class="text-white font-medium">${escapeHtml(customer.name)}</h4>
                        <div class="flex items-center gap-4 text-sm text-gray-400 mt-1">
                            ${customer.email ? `<a href="mailto:${customer.email}" class="hover:text-brand-gold">${escapeHtml(customer.email)}</a>` : ''}
                            ${customer.phone ? `<a href="tel:${customer.phone}" class="hover:text-brand-gold">${escapeHtml(customer.phone)}</a>` : ''}
                        </div>
                    </div>
                </div>
            </div>
        ` : ''}

        <!-- Updates Section -->
        <div class="bg-brand-card rounded-xl overflow-hidden">
            <div class="flex items-center justify-between p-4 border-b border-brand-darker">
                <h2 class="text-lg font-semibold text-white">Updates & Notes</h2>
                <button onclick="openAddUpdateModal('${puppyId}')" class="px-3 py-1.5 bg-brand-gold text-brand-dark text-sm font-semibold rounded-lg hover:bg-brand-gold-light transition-colors">
                    + Add Update
                </button>
            </div>
            <div class="p-4">
                ${updates.length === 0
                    ? '<p class="text-gray-400 text-center py-4">No updates yet</p>'
                    : updates.sort((a, b) => new Date(b.date) - new Date(a.date)).map(u => `
                        <div class="border-b border-brand-darker last:border-0 py-3 first:pt-0 last:pb-0">
                            <div class="flex items-center justify-between mb-1">
                                <strong class="text-white">${escapeHtml(u.title || 'Update')}</strong>
                                <span class="text-xs text-gray-500">${formatDate(u.date)}</span>
                            </div>
                            <p class="text-gray-400 text-sm">${escapeHtml(u.content)}</p>
                        </div>
                    `).join('')
                }
            </div>
        </div>
    `;
}

function viewCustomerProfile(customerId) {
    const customer = DB.customers.getById(customerId);
    if (!customer) return;

    const purchases = DB.purchases.getByCustomer(customerId);
    const puppies = purchases.map(p => {
        const puppy = DB.puppies.getById(p.puppyId);
        return puppy ? { ...puppy, purchase: p } : null;
    }).filter(Boolean);

    document.getElementById('main-content').innerHTML = `
        <div class="admin-page-header">
            <h1><a href="#" onclick="loadPage('customers'); return false;" style="color: var(--text-muted);">Customers</a> / ${escapeHtml(customer.name)}</h1>
            <div class="header-actions">
                <button class="btn btn-primary" onclick="openAddPurchaseModal('${customerId}')">+ Record Purchase</button>
                <button class="btn btn-outline" onclick="openEditCustomerModal('${customerId}')">Edit Customer</button>
            </div>
        </div>

        <div class="customer-profile-grid">
            <div class="admin-card">
                <div class="admin-card-header">
                    <h2>Contact Information</h2>
                    ${customer.isGuardian ? '<span class="status-badge status-guardian">Guardian Home</span>' : ''}
                </div>
                <div class="admin-card-body">
                    <div class="info-grid">
                        <div class="info-item"><label>Name</label><span>${escapeHtml(customer.name)}</span></div>
                        <div class="info-item"><label>Email</label><span>${customer.email ? `<a href="mailto:${customer.email}">${escapeHtml(customer.email)}</a>` : 'N/A'}</span></div>
                        <div class="info-item"><label>Phone</label><span>${customer.phone ? `<a href="tel:${customer.phone}">${escapeHtml(customer.phone)}</a>` : 'N/A'}</span></div>
                        <div class="info-item"><label>Location</label><span>${customer.city || customer.state ? `${escapeHtml(customer.city || '')}${customer.city && customer.state ? ', ' : ''}${escapeHtml(customer.state || '')}` : 'N/A'}</span></div>
                    </div>
                    ${customer.address ? `
                        <div style="margin-top: 1.5rem; padding-top: 1rem; border-top: 1px solid var(--border-color);">
                            <label style="display:block;color:var(--text-muted);font-size:0.85rem;margin-bottom:0.25rem;">
                                Full Address <span class="private-badge">Private</span>
                            </label>
                            <p>${escapeHtml(customer.address)}</p>
                        </div>
                    ` : ''}
                    ${customer.notes ? `
                        <div style="margin-top: 1rem;">
                            <label style="display:block;color:var(--text-muted);font-size:0.85rem;margin-bottom:0.25rem;">
                                Notes <span class="private-badge">Private</span>
                            </label>
                            <p style="color:var(--text-secondary);">${escapeHtml(customer.notes)}</p>
                        </div>
                    ` : ''}
                </div>
            </div>

            ${customer.isGuardian ? `
                <div class="admin-card">
                    <div class="admin-card-header"><h2>Guardian Home Details</h2></div>
                    <div class="admin-card-body">
                        <div class="info-grid">
                            <div class="info-item">
                                <label>Website Visibility</label>
                                <span class="status-badge ${customer.showOnWebsite ? 'status-public' : 'status-private'}">${customer.showOnWebsite ? 'Visible' : 'Hidden'}</span>
                            </div>
                            <div class="info-item"><label>Display Name</label><span>${escapeHtml(customer.guardianDisplayName || 'Not set')}</span></div>
                            <div class="info-item"><label>Public Location</label><span>${escapeHtml(customer.guardianLocation || 'Not set')}</span></div>
                            <div class="info-item"><label>Guardian Since</label><span>${customer.guardianSince ? formatDate(customer.guardianSince) : 'Not set'}</span></div>
                        </div>
                        ${customer.guardianBio ? `
                            <div style="margin-top: 1rem;">
                                <label style="display:block;color:var(--text-muted);font-size:0.85rem;margin-bottom:0.25rem;">Public Bio</label>
                                <p style="color:var(--text-secondary);">${escapeHtml(customer.guardianBio)}</p>
                            </div>
                        ` : ''}
                        ${customer.guardianNotes ? `
                            <div style="margin-top: 1rem;">
                                <label style="display:block;color:var(--text-muted);font-size:0.85rem;margin-bottom:0.25rem;">
                                    Guardian Notes <span class="private-badge">Private</span>
                                </label>
                                <p style="color:var(--text-secondary);">${escapeHtml(customer.guardianNotes)}</p>
                            </div>
                        ` : ''}
                    </div>
                </div>
            ` : ''}
        </div>

        <div class="admin-card" style="margin-top: 2rem;">
            <div class="admin-card-header">
                <h2>Purchased Puppies (${purchases.length})</h2>
            </div>
            <div class="admin-card-body ${puppies.length === 0 ? '' : 'no-padding'}">
                ${puppies.length === 0 ? '<p style="color: var(--text-muted);">No puppies purchased yet. Click "Record Purchase" to add one.</p>' : `
                    <div class="table-responsive"><table class="admin-table">
                        <thead>
                            <tr>
                                <th>Puppy</th>
                                <th>Litter</th>
                                <th>Purchase Date</th>
                                <th>Price</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${puppies.map(p => {
                                const litter = DB.litters.getById(p.litterId);
                                const mother = litter ? DB.dogs.getById(litter.motherId) : null;
                                const father = litter ? DB.dogs.getById(litter.fatherId) : null;
                                return `
                                    <tr>
                                        <td>
                                            <div class="table-name">
                                                ${p.photo
                                                    ? `<img src="${p.photo}" class="table-avatar" alt="${escapeHtml(p.name || 'Puppy')}">`
                                                    : `<div class="table-avatar" style="display:flex;align-items:center;justify-content:center;color:var(--text-muted);">${(p.name || 'P').charAt(0)}</div>`
                                                }
                                                <span>${escapeHtml(p.name || 'Unnamed')}</span>
                                            </div>
                                        </td>
                                        <td>${mother && father ? `${mother.name} x ${father.name}` : 'Unknown'}</td>
                                        <td>${p.purchase.purchaseDate ? formatDate(p.purchase.purchaseDate) : 'N/A'}</td>
                                        <td>${p.purchase.price ? '$' + Number(p.purchase.price).toLocaleString() : 'N/A'}</td>
                                        <td>
                                            <div class="actions">
                                                <button class="icon-btn view" onclick="viewPuppyProfile('${p.id}')" title="View Puppy">
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                                                    </svg>
                                                </button>
                                                <button class="icon-btn delete" onclick="confirmDeletePurchase('${p.purchase.id}')" title="Remove Purchase">
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                                        <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                                                    </svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table></div>
                `}
            </div>
        </div>
    `;
}

// Purchase Modal Functions
function openAddPurchaseModal(customerId) {
    currentCustomerId = customerId;
    const customer = DB.customers.getById(customerId);
    const availablePuppies = DB.puppies.getAll().filter(p => p.status === 'available' || p.status === 'reserved');
    const litters = DB.litters.getAll();

    const content = `
        <p style="margin-bottom: 1.5rem; color: var(--text-secondary);">Recording a purchase for <strong>${escapeHtml(customer.name)}</strong></p>

        <div class="form-group">
            <label>Select Puppy <span class="required">*</span></label>
            <select id="purchasePuppyId" required>
                <option value="">Choose a puppy...</option>
                ${litters.map(litter => {
                    const mother = DB.dogs.getById(litter.motherId);
                    const father = DB.dogs.getById(litter.fatherId);
                    const litterName = mother && father ? `${mother.name} x ${father.name}` : 'Unknown Litter';
                    const litterPuppies = availablePuppies.filter(p => p.litterId === litter.id);
                    if (litterPuppies.length === 0) return '';
                    return `
                        <optgroup label="${litterName}">
                            ${litterPuppies.map(p => `
                                <option value="${p.id}">${escapeHtml(p.name || 'Unnamed')} - ${p.gender} - ${p.color || 'No color'}</option>
                            `).join('')}
                        </optgroup>
                    `;
                }).join('')}
                ${availablePuppies.filter(p => !p.litterId).length > 0 ? `
                    <optgroup label="No Litter Assigned">
                        ${availablePuppies.filter(p => !p.litterId).map(p => `
                            <option value="${p.id}">${escapeHtml(p.name || 'Unnamed')} - ${p.gender}</option>
                        `).join('')}
                    </optgroup>
                ` : ''}
            </select>
        </div>

        <div class="form-row">
            <div class="form-group">
                <label>Purchase Date <span class="required">*</span></label>
                <input type="date" id="purchaseDate" value="${new Date().toISOString().split('T')[0]}" required>
            </div>
            <div class="form-group">
                <label>Price</label>
                <input type="number" id="purchasePrice" placeholder="0.00" step="0.01" min="0">
            </div>
        </div>

        <div class="form-group">
            <label>Payment Method</label>
            <select id="purchasePaymentMethod">
                <option value="">Select...</option>
                <option value="cash">Cash</option>
                <option value="check">Check</option>
                <option value="card">Credit/Debit Card</option>
                <option value="venmo">Venmo</option>
                <option value="zelle">Zelle</option>
                <option value="paypal">PayPal</option>
                <option value="other">Other</option>
            </select>
        </div>

        <div class="form-group">
            <label>Notes</label>
            <textarea id="purchaseNotes" placeholder="Any notes about this purchase..."></textarea>
        </div>
    `;

    const footer = `
        <button class="btn btn-outline" onclick="closeModal()">Cancel</button>
        <button class="btn btn-primary" onclick="savePurchase()">Record Purchase</button>
    `;

    openModal('Record Puppy Purchase', content, footer);
}

function savePurchase() {
    const puppyId = document.getElementById('purchasePuppyId').value;
    const purchaseDate = document.getElementById('purchaseDate').value;

    if (!puppyId) {
        showToast('Please select a puppy', 'error');
        return;
    }
    if (!purchaseDate) {
        showToast('Please enter a purchase date', 'error');
        return;
    }

    const purchase = {
        customerId: currentCustomerId,
        puppyId: puppyId,
        purchaseDate: purchaseDate,
        price: document.getElementById('purchasePrice').value || null,
        paymentMethod: document.getElementById('purchasePaymentMethod').value || null,
        notes: document.getElementById('purchaseNotes').value.trim()
    };

    DB.purchases.save(purchase);
    closeModal();
    showToast('Purchase recorded successfully', 'success');
    viewCustomerProfile(currentCustomerId);
}

async function confirmDeletePurchase(purchaseId) {
    if (confirm('Are you sure you want to remove this purchase record? The puppy will be marked as available again.')) {
        const purchase = DB.purchases.getById(purchaseId);
        const customerId = purchase?.customerId;
        await DB.purchases.delete(purchaseId);
        showToast('Purchase removed', 'success');
        if (customerId) {
            viewCustomerProfile(customerId);
        }
    }
}

// Add Update Modal
function openAddUpdateModal(puppyId) {
    currentPuppyId = puppyId;
    const content = `
        <div class="form-group">
            <label>Title</label>
            <input type="text" id="updateTitle" placeholder="e.g., New photo, Weight update, etc.">
        </div>
        <div class="form-group">
            <label>Date</label>
            <input type="date" id="updateDate" value="${new Date().toISOString().split('T')[0]}">
        </div>
        <div class="form-group">
            <label>Update</label>
            <textarea id="updateContent" placeholder="Write your update here..."></textarea>
        </div>
    `;
    const footer = `
        <button class="btn btn-outline" onclick="closeModal()">Cancel</button>
        <button class="btn btn-primary" onclick="saveUpdate()">Add Update</button>
    `;
    openModal('Add Update', content, footer);
}

function saveUpdate() {
    const puppy = DB.puppies.getById(currentPuppyId);
    if (!puppy) return;

    if (!puppy.updates) puppy.updates = [];

    puppy.updates.push({
        id: DB.generateId(),
        title: document.getElementById('updateTitle').value.trim(),
        date: document.getElementById('updateDate').value,
        content: document.getElementById('updateContent').value.trim(),
        createdAt: new Date().toISOString()
    });

    DB.puppies.save(puppy);
    closeModal();
    showToast('Update added successfully', 'success');
    viewPuppyProfile(currentPuppyId);
}

// Edit Litter Modal
function openEditLitterModal(litterId) {
    const litter = DB.litters.getById(litterId);
    if (!litter) return;

    const dogs = DB.dogs.getAll();
    const females = dogs.filter(d => d.gender === 'female');
    const males = dogs.filter(d => d.gender === 'male');

    const content = `
        <div class="form-group">
            <label>Litter Name</label>
            <input type="text" id="litterName" value="${escapeHtml(litter.name || '')}">
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>Mother</label>
                <select id="litterMother">
                    <option value="">Select Mother</option>
                    ${females.map(d => `<option value="${d.id}" ${d.id === litter.motherId ? 'selected' : ''}>${escapeHtml(d.name)}</option>`).join('')}
                </select>
            </div>
            <div class="form-group">
                <label>Father</label>
                <select id="litterFather">
                    <option value="">Select Father</option>
                    ${males.map(d => `<option value="${d.id}" ${d.id === litter.fatherId ? 'selected' : ''}>${escapeHtml(d.name)}</option>`).join('')}
                </select>
            </div>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>Birth Date</label>
                <input type="date" id="litterBirthDate" value="${litter.birthDate || ''}">
            </div>
            <div class="form-group">
                <label>Expected Date</label>
                <input type="date" id="litterExpectedDate" value="${litter.expectedDate || ''}">
            </div>
        </div>
        <div class="form-group">
            <label>Notes</label>
            <textarea id="litterNotes">${escapeHtml(litter.notes || '')}</textarea>
        </div>
        <div class="form-group">
            <label class="checkbox-label">
                <input type="checkbox" id="litterIsPublic" ${litter.isPublic ? 'checked' : ''}> Show on Public Website
            </label>
        </div>
    `;
    const footer = `
        <button class="btn btn-outline" onclick="closeModal()">Cancel</button>
        <button class="btn btn-primary" onclick="updateLitter('${litterId}')">Save Changes</button>
    `;
    openModal('Edit Litter', content, footer);
}

function updateLitter(litterId) {
    const litter = {
        id: litterId,
        name: document.getElementById('litterName').value.trim(),
        motherId: document.getElementById('litterMother').value,
        fatherId: document.getElementById('litterFather').value,
        birthDate: document.getElementById('litterBirthDate').value,
        expectedDate: document.getElementById('litterExpectedDate').value,
        notes: document.getElementById('litterNotes').value.trim(),
        isPublic: document.getElementById('litterIsPublic').checked
    };

    DB.litters.save(litter);
    closeModal();
    showToast('Litter updated successfully', 'success');
    viewLitterProfile(litterId);
}

// ============================================
// UTILITY FUNCTIONS
// ============================================
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function calculateAge(birthday) {
    const birth = new Date(birthday);
    const now = new Date();
    let years = now.getFullYear() - birth.getFullYear();
    const monthDiff = now.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) years--;
    if (years === 0) {
        const months = (now.getMonth() - birth.getMonth() + 12) % 12;
        return months === 1 ? '1 month' : `${months} months`;
    }
    return years === 1 ? '1 year' : `${years} years`;
}

function calculatePuppyAge(birthday) {
    const birth = new Date(birthday);
    const now = new Date();
    const diffDays = Math.ceil((now - birth) / (1000 * 60 * 60 * 24));
    if (diffDays < 7) return diffDays === 1 ? '1 day old' : `${diffDays} days old`;
    if (diffDays < 30) { const weeks = Math.floor(diffDays / 7); return weeks === 1 ? '1 week old' : `${weeks} weeks old`; }
    const months = Math.floor(diffDays / 30);
    return months === 1 ? '1 month old' : `${months} months old`;
}

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function formatShortDate(dateString) {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// Toast notifications
function showToast(message, type = 'info') {
    let container = document.getElementById('toastContainer');

    // Create container if it doesn't exist
    if (!container) {
        container = document.createElement('div');
        container.id = 'toastContainer';
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <span>${escapeHtml(message)}</span>
        <button class="toast-close" onclick="this.parentElement.remove()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
        </button>
    `;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 5000);
}

// ============================================
// EXPENSES PAGE
// ============================================
function renderExpensesPage() {
    const expenses = DB.expenses.getAll().sort((a, b) => new Date(b.date) - new Date(a.date));
    const totalAllTime = DB.expenses.getTotal();
    const now = new Date();
    const monthlyTotal = DB.expenses.getMonthlyTotal(now.getFullYear(), now.getMonth());
    const yearlyTotal = DB.expenses.getYearlyTotal(now.getFullYear());
    const categoryTotals = DB.expenses.getTotalByCategory();

    return `
        <div class="admin-page-header">
            <h1>Expenses</h1>
            <div class="header-actions">
                <button class="btn btn-primary" onclick="openAddExpenseModal()">+ Add Expense</button>
            </div>
        </div>

        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-icon" style="background-color: rgba(244, 67, 54, 0.2); color: var(--danger);">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                    </svg>
                </div>
                <div class="stat-info">
                    <h3>$${monthlyTotal.toLocaleString()}</h3>
                    <p>This Month</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon" style="background-color: rgba(255, 152, 0, 0.2); color: var(--warning);">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                </div>
                <div class="stat-info">
                    <h3>$${yearlyTotal.toLocaleString()}</h3>
                    <p>This Year</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon" style="background-color: rgba(156, 39, 176, 0.2); color: #9c27b0;">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                    </svg>
                </div>
                <div class="stat-info">
                    <h3>$${totalAllTime.toLocaleString()}</h3>
                    <p>All Time</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon" style="background-color: rgba(33, 150, 243, 0.2); color: var(--info);">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                    </svg>
                </div>
                <div class="stat-info">
                    <h3>${expenses.length}</h3>
                    <p>Total Entries</p>
                </div>
            </div>
        </div>

        <div class="dashboard-grid">
            <div class="admin-card">
                <div class="admin-card-header">
                    <h2>All Expenses</h2>
                </div>
                <div class="admin-card-body no-padding">
                    ${renderExpensesTable(expenses)}
                </div>
            </div>

            <div class="admin-card">
                <div class="admin-card-header">
                    <h2>By Category</h2>
                </div>
                <div class="admin-card-body">
                    ${Object.keys(categoryTotals).length === 0 ? '<p style="color: var(--text-muted);">No expenses recorded yet</p>' :
                        Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]).map(([cat, total]) => `
                            <div class="category-expense-row" style="display: flex; justify-content: space-between; padding: 0.75rem 0; border-bottom: 1px solid var(--border-color);">
                                <span class="expense-category-badge category-${cat.toLowerCase().replace(/\s+/g, '-')}">${escapeHtml(cat)}</span>
                                <span style="font-weight: 600;">$${total.toLocaleString()}</span>
                            </div>
                        `).join('')
                    }
                </div>
            </div>
        </div>
    `;
}

function renderExpensesTable(expenses) {
    if (expenses.length === 0) {
        return `
            <div class="admin-empty-state">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                </svg>
                <p>No expenses recorded yet</p>
                <button class="btn btn-primary" onclick="openAddExpenseModal()">Add Your First Expense</button>
            </div>
        `;
    }

    return `
        <div class="table-responsive"><table class="admin-table">
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Category</th>
                    <th>Dog</th>
                    <th>Amount</th>
                    <th>Receipt</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${expenses.map(expense => {
                    const dog = expense.dog_id ? DB.dogs.getById(expense.dog_id) : null;
                    return `
                        <tr>
                            <td>${formatShortDate(expense.date)}</td>
                            <td>${escapeHtml(expense.description || 'No description')}</td>
                            <td><span class="expense-category-badge category-${(expense.category || 'other').toLowerCase().replace(/\s+/g, '-')}">${escapeHtml(expense.category || 'Other')}</span></td>
                            <td>${dog ? escapeHtml(dog.name) : '<span style="color:var(--text-muted);">General</span>'}</td>
                            <td style="font-weight: 600; color: var(--danger);">$${Number(expense.amount).toLocaleString()}</td>
                            <td>${expense.receipt_url ? `<a href="${expense.receipt_url}" target="_blank" class="btn btn-small btn-outline">View</a>` : '<span style="color:var(--text-muted);">None</span>'}</td>
                            <td>
                                <div class="actions">
                                    <button class="icon-btn edit" onclick="openEditExpenseModal('${expense.id}')" title="Edit">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                        </svg>
                                    </button>
                                    <button class="icon-btn delete" onclick="confirmDeleteExpense('${expense.id}')" title="Delete">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                                        </svg>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    `;
                }).join('')}
            </tbody>
        </table></div>
    `;
}

function openAddExpenseModal() {
    const dogs = DB.dogs.getAll();
    const content = `
        <div class="form-row">
            <div class="form-group">
                <label>Date <span class="required">*</span></label>
                <input type="date" id="expenseDate" value="${new Date().toISOString().split('T')[0]}" required>
            </div>
            <div class="form-group">
                <label>Amount <span class="required">*</span></label>
                <input type="number" id="expenseAmount" step="0.01" min="0" placeholder="0.00" required>
            </div>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>Category <span class="required">*</span></label>
                <select id="expenseCategory" required>
                    <option value="">Select category...</option>
                    <option value="Advertising">Advertising</option>
                    <option value="Breeding">Breeding</option>
                    <option value="Equipment">Equipment</option>
                    <option value="Food">Food</option>
                    <option value="Grooming">Grooming</option>
                    <option value="Health Testing">Health Testing</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Registration">Registration</option>
                    <option value="Supplies">Supplies</option>
                    <option value="Training">Training</option>
                    <option value="Travel">Travel</option>
                    <option value="Vet/Medical">Vet/Medical</option>
                    <option value="Other">Other</option>
                </select>
            </div>
            <div class="form-group">
                <label>Related Dog (optional)</label>
                <select id="expenseDogId">
                    <option value="">General expense (no specific dog)</option>
                    ${dogs.map(d => `<option value="${d.id}">${escapeHtml(d.name)}</option>`).join('')}
                </select>
            </div>
        </div>
        <div class="form-group">
            <label>Description</label>
            <input type="text" id="expenseDescription" placeholder="What was this expense for?">
        </div>
        <div class="form-group">
            <label>Vendor/Store (optional)</label>
            <input type="text" id="expenseVendor" placeholder="e.g., Chewy, Petco, Vet Clinic">
        </div>
        <div class="form-group">
            <label>Receipt URL (optional)</label>
            <input type="text" id="expenseReceiptUrl" placeholder="https://... or paste image URL">
            <p class="form-hint">You can upload receipt images to a service like Imgur or Google Photos and paste the link here</p>
        </div>
        <div class="form-group">
            <label>Notes (optional)</label>
            <textarea id="expenseNotes" placeholder="Any additional notes..."></textarea>
        </div>
    `;

    openModal('Add Expense', content, `
        <button class="btn btn-outline" onclick="closeModal()">Cancel</button>
        <button class="btn btn-primary" onclick="saveExpense()">Save Expense</button>
    `);
}

function openEditExpenseModal(expenseId) {
    const expense = DB.expenses.getById(expenseId);
    if (!expense) return;

    const dogs = DB.dogs.getAll();
    const categories = ['Advertising', 'Breeding', 'Equipment', 'Food', 'Grooming', 'Health Testing', 'Marketing', 'Registration', 'Supplies', 'Training', 'Travel', 'Vet/Medical', 'Other'];

    const content = `
        <input type="hidden" id="editExpenseId" value="${expenseId}">
        <div class="form-row">
            <div class="form-group">
                <label>Date <span class="required">*</span></label>
                <input type="date" id="expenseDate" value="${expense.date || ''}" required>
            </div>
            <div class="form-group">
                <label>Amount <span class="required">*</span></label>
                <input type="number" id="expenseAmount" step="0.01" min="0" value="${expense.amount || ''}" required>
            </div>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>Category <span class="required">*</span></label>
                <select id="expenseCategory" required>
                    <option value="">Select category...</option>
                    ${categories.map(c => `<option value="${c}" ${expense.category === c ? 'selected' : ''}>${c}</option>`).join('')}
                </select>
            </div>
            <div class="form-group">
                <label>Related Dog (optional)</label>
                <select id="expenseDogId">
                    <option value="">General expense (no specific dog)</option>
                    ${dogs.map(d => `<option value="${d.id}" ${expense.dog_id === d.id ? 'selected' : ''}>${escapeHtml(d.name)}</option>`).join('')}
                </select>
            </div>
        </div>
        <div class="form-group">
            <label>Description</label>
            <input type="text" id="expenseDescription" value="${escapeHtml(expense.description || '')}">
        </div>
        <div class="form-group">
            <label>Vendor/Store (optional)</label>
            <input type="text" id="expenseVendor" value="${escapeHtml(expense.vendor || '')}">
        </div>
        <div class="form-group">
            <label>Receipt URL (optional)</label>
            <input type="text" id="expenseReceiptUrl" value="${escapeHtml(expense.receipt_url || '')}">
        </div>
        <div class="form-group">
            <label>Notes (optional)</label>
            <textarea id="expenseNotes">${escapeHtml(expense.notes || '')}</textarea>
        </div>
    `;

    openModal('Edit Expense', content, `
        <button class="btn btn-outline" onclick="closeModal()">Cancel</button>
        <button class="btn btn-primary" onclick="saveExpense('${expenseId}')">Update Expense</button>
    `);
}

function saveExpense(expenseId = null) {
    const expense = {
        id: expenseId || document.getElementById('editExpenseId')?.value || null,
        date: document.getElementById('expenseDate').value,
        amount: parseFloat(document.getElementById('expenseAmount').value),
        category: document.getElementById('expenseCategory').value,
        dogId: document.getElementById('expenseDogId').value || null,
        description: document.getElementById('expenseDescription').value.trim(),
        vendor: document.getElementById('expenseVendor').value.trim(),
        receiptUrl: document.getElementById('expenseReceiptUrl').value.trim(),
        notes: document.getElementById('expenseNotes').value.trim()
    };

    if (!expense.date || !expense.amount || !expense.category) {
        showToast('Please fill in all required fields', 'error');
        return;
    }

    DB.expenses.save(expense);
    closeModal();
    showToast(expenseId ? 'Expense updated successfully' : 'Expense added successfully', 'success');
    loadPage('expenses');
}

async function confirmDeleteExpense(expenseId) {
    if (confirm('Are you sure you want to delete this expense?')) {
        await DB.expenses.delete(expenseId);
        showToast('Expense deleted', 'success');
        loadPage('expenses');
    }
}

// ============================================
// VET RECORDS PAGE
// ============================================
function renderVetRecordsPage() {
    const records = DB.vetRecords.getAll().sort((a, b) => new Date(b.visit_date) - new Date(a.visit_date));
    const expiringRabies = DB.vetRecords.getExpiringRabies(90);
    const dogsAtHome = DB.dogs.getAll().filter(d => d.location === 'home' || !d.location);

    return `
        <div class="admin-page-header">
            <h1>Vet Records</h1>
            <div class="header-actions">
                <button class="btn btn-primary" onclick="openAddVetRecordModal()">+ Add Record</button>
            </div>
        </div>

        ${expiringRabies.length > 0 ? `
            <div class="admin-card" style="margin-bottom: 2rem; border-left: 4px solid var(--warning);">
                <div class="admin-card-header" style="background: rgba(255, 152, 0, 0.1);">
                    <h2 style="color: var(--warning);">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 0.5rem;">
                            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                        </svg>
                        Rabies Shot Alerts (Dogs at Home)
                    </h2>
                </div>
                <div class="admin-card-body">
                    <div class="rabies-alerts-grid">
                        ${expiringRabies.map(item => `
                            <div class="rabies-alert-item ${item.isExpired ? 'expired' : item.noRecord ? 'no-record' : 'expiring'}">
                                <div class="alert-dog-info">
                                    ${item.dog.image_url ? `<img src="${item.dog.image_url}" class="alert-dog-photo" alt="${escapeHtml(item.dog.name)}" style="width:40px;height:40px;max-width:40px;max-height:40px;border-radius:50%;object-fit:cover;">` :
                                        `<div class="alert-dog-photo placeholder" style="width:40px;height:40px;min-width:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:#262626;color:#9ca3af;">${item.dog.name.charAt(0)}</div>`}
                                    <div>
                                        <strong>${escapeHtml(item.dog.name)}</strong>
                                        <span class="alert-status ${item.isExpired ? 'expired' : item.noRecord ? 'no-record' : 'expiring'}">
                                            ${item.noRecord ? 'No rabies record on file' :
                                              item.isExpired ? `Expired ${Math.abs(item.daysUntil)} days ago` :
                                              `Expires in ${item.daysUntil} days`}
                                        </span>
                                    </div>
                                </div>
                                <button class="btn btn-small ${item.noRecord || item.isExpired ? 'btn-primary' : 'btn-outline'}" onclick="openAddVetRecordModal('${item.dog.id}', 'rabies')">
                                    ${item.noRecord ? 'Add Record' : 'Update'}
                                </button>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        ` : ''}

        <div class="admin-card">
            <div class="admin-card-header">
                <h2>All Vet Records</h2>
                <div style="display: flex; gap: 0.5rem;">
                    <select id="vetRecordDogFilter" onchange="filterVetRecords()" style="padding: 0.5rem; border-radius: 6px; background: var(--bg-secondary); border: 1px solid var(--border-color); color: var(--text-primary);">
                        <option value="">All Dogs</option>
                        ${DB.dogs.getAll().map(d => `<option value="${d.id}">${escapeHtml(d.name)}</option>`).join('')}
                    </select>
                </div>
            </div>
            <div class="admin-card-body no-padding" id="vetRecordsTableContainer">
                ${renderVetRecordsTable(records)}
            </div>
        </div>
    `;
}

function renderVetRecordsTable(records) {
    if (records.length === 0) {
        return `
            <div class="admin-empty-state">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                </svg>
                <p>No vet records yet</p>
                <button class="btn btn-primary" onclick="openAddVetRecordModal()">Add First Record</button>
            </div>
        `;
    }

    return `
        <div class="table-responsive"><table class="admin-table">
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Dog</th>
                    <th>Type</th>
                    <th>Description</th>
                    <th>Expires</th>
                    <th>Document</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${records.map(record => {
                    const dog = DB.dogs.getById(record.dog_id);
                    const isExpired = record.expiration_date && new Date(record.expiration_date) < new Date();
                    return `
                        <tr>
                            <td>${formatShortDate(record.visit_date)}</td>
                            <td>
                                <div class="table-name">
                                    ${dog?.image_url
                                        ? `<img src="${dog.image_url}" class="table-avatar" alt="${escapeHtml(dog?.name || 'Unknown')}" style="width:32px;height:32px;max-width:32px;max-height:32px;border-radius:50%;object-fit:cover;">`
                                        : `<div class="table-avatar" style="width:32px;height:32px;min-width:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:#262626;color:var(--text-muted);">${(dog?.name || 'U').charAt(0)}</div>`
                                    }
                                    <span>${escapeHtml(dog?.name || 'Unknown')}</span>
                                </div>
                            </td>
                            <td><span class="vet-type-badge type-${(record.type || 'other').toLowerCase()}">${escapeHtml(formatVetType(record.type))}</span></td>
                            <td>${escapeHtml(record.reason || record.description || '-')}</td>
                            <td>
                                ${record.expiration_date ?
                                    `<span class="${isExpired ? 'text-danger' : ''}">${formatShortDate(record.expiration_date)}${isExpired ? ' (Expired)' : ''}</span>` :
                                    '<span style="color:var(--text-muted);">N/A</span>'}
                            </td>
                            <td>${record.document_url ? `<a href="${record.document_url}" target="_blank" class="btn btn-small btn-outline">View</a>` : '<span style="color:var(--text-muted);">None</span>'}</td>
                            <td>
                                <div class="actions">
                                    <button class="icon-btn edit" onclick="openEditVetRecordModal('${record.id}')" title="Edit">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                        </svg>
                                    </button>
                                    <button class="icon-btn delete" onclick="confirmDeleteVetRecord('${record.id}')" title="Delete">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                                        </svg>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    `;
                }).join('')}
            </tbody>
        </table></div>
    `;
}

function filterVetRecords() {
    const dogId = document.getElementById('vetRecordDogFilter').value;
    let records = DB.vetRecords.getAll().sort((a, b) => new Date(b.visit_date) - new Date(a.visit_date));
    if (dogId) {
        records = records.filter(r => r.dog_id === dogId);
    }
    document.getElementById('vetRecordsTableContainer').innerHTML = renderVetRecordsTable(records);
}

function formatVetType(type) {
    const types = {
        'rabies': 'Rabies',
        'dhpp': 'DHPP',
        'bordetella': 'Bordetella',
        'leptospirosis': 'Leptospirosis',
        'lyme': 'Lyme',
        'canine-influenza': 'Canine Influenza',
        'heartworm': 'Heartworm Test',
        'fecal': 'Fecal Test',
        'wellness': 'Wellness Exam',
        'dental': 'Dental',
        'spay-neuter': 'Spay/Neuter',
        'microchip': 'Microchip',
        'health-certificate': 'Health Certificate',
        'other': 'Other'
    };
    return types[type] || type || 'Other';
}

function openAddVetRecordModal(preselectedDogId = null, preselectedType = null) {
    const dogs = DB.dogs.getAll();
    const content = `
        <div class="form-row">
            <div class="form-group">
                <label>Dog <span class="required">*</span></label>
                <select id="vetRecordDogId" required>
                    <option value="">Select dog...</option>
                    ${dogs.map(d => `<option value="${d.id}" ${d.id === preselectedDogId ? 'selected' : ''}>${escapeHtml(d.name)}</option>`).join('')}
                </select>
            </div>
            <div class="form-group">
                <label>Visit Date <span class="required">*</span></label>
                <input type="date" id="vetRecordDate" value="${new Date().toISOString().split('T')[0]}" required>
            </div>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>Type <span class="required">*</span></label>
                <select id="vetRecordType" required onchange="toggleExpirationField()">
                    <option value="">Select type...</option>
                    <optgroup label="Vaccinations">
                        <option value="rabies" ${preselectedType === 'rabies' ? 'selected' : ''}>Rabies</option>
                        <option value="dhpp">DHPP (Distemper, Hepatitis, Parvo, Parainfluenza)</option>
                        <option value="bordetella">Bordetella (Kennel Cough)</option>
                        <option value="leptospirosis">Leptospirosis</option>
                        <option value="lyme">Lyme</option>
                        <option value="canine-influenza">Canine Influenza</option>
                    </optgroup>
                    <optgroup label="Tests & Exams">
                        <option value="heartworm">Heartworm Test</option>
                        <option value="fecal">Fecal Test</option>
                        <option value="wellness">Wellness Exam</option>
                        <option value="dental">Dental Cleaning</option>
                    </optgroup>
                    <optgroup label="Procedures">
                        <option value="spay-neuter">Spay/Neuter</option>
                        <option value="microchip">Microchip</option>
                        <option value="health-certificate">Health Certificate</option>
                    </optgroup>
                    <option value="other">Other</option>
                </select>
            </div>
            <div class="form-group" id="expirationGroup">
                <label>Expiration Date (if applicable)</label>
                <input type="date" id="vetRecordExpiration">
                <p class="form-hint">For vaccines: Rabies typically expires in 1-3 years</p>
            </div>
        </div>
        <div class="form-group">
            <label>Description/Notes</label>
            <textarea id="vetRecordDescription" placeholder="Vet name, any notes, results..."></textarea>
        </div>
        <div class="form-group">
            <label>Veterinarian/Clinic</label>
            <input type="text" id="vetRecordClinic" placeholder="Name of vet or clinic">
        </div>
        <div class="form-group">
            <label>Cost (optional)</label>
            <input type="number" id="vetRecordCost" step="0.01" placeholder="0.00">
        </div>
        <div class="form-group">
            <label>Document URL (optional)</label>
            <input type="text" id="vetRecordDocUrl" placeholder="https://... (link to uploaded document/image)">
            <p class="form-hint">Upload documents to a service like Google Drive and paste the link here</p>
        </div>
    `;

    openModal('Add Vet Record', content, `
        <button class="btn btn-outline" onclick="closeModal()">Cancel</button>
        <button class="btn btn-primary" onclick="saveVetRecord()">Save Record</button>
    `, 'large');
}

function openEditVetRecordModal(recordId) {
    const record = DB.vetRecords.getById(recordId);
    if (!record) return;

    const dogs = DB.dogs.getAll();
    const types = [
        { value: 'rabies', label: 'Rabies', group: 'Vaccinations' },
        { value: 'dhpp', label: 'DHPP', group: 'Vaccinations' },
        { value: 'bordetella', label: 'Bordetella', group: 'Vaccinations' },
        { value: 'leptospirosis', label: 'Leptospirosis', group: 'Vaccinations' },
        { value: 'lyme', label: 'Lyme', group: 'Vaccinations' },
        { value: 'canine-influenza', label: 'Canine Influenza', group: 'Vaccinations' },
        { value: 'heartworm', label: 'Heartworm Test', group: 'Tests' },
        { value: 'fecal', label: 'Fecal Test', group: 'Tests' },
        { value: 'wellness', label: 'Wellness Exam', group: 'Tests' },
        { value: 'dental', label: 'Dental', group: 'Tests' },
        { value: 'spay-neuter', label: 'Spay/Neuter', group: 'Procedures' },
        { value: 'microchip', label: 'Microchip', group: 'Procedures' },
        { value: 'health-certificate', label: 'Health Certificate', group: 'Procedures' },
        { value: 'other', label: 'Other', group: '' }
    ];

    const content = `
        <input type="hidden" id="editVetRecordId" value="${recordId}">
        <div class="form-row">
            <div class="form-group">
                <label>Dog <span class="required">*</span></label>
                <select id="vetRecordDogId" required>
                    <option value="">Select dog...</option>
                    ${dogs.map(d => `<option value="${d.id}" ${d.id === record.dog_id ? 'selected' : ''}>${escapeHtml(d.name)}</option>`).join('')}
                </select>
            </div>
            <div class="form-group">
                <label>Visit Date <span class="required">*</span></label>
                <input type="date" id="vetRecordDate" value="${record.visit_date || ''}" required>
            </div>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>Type <span class="required">*</span></label>
                <select id="vetRecordType" required>
                    <option value="">Select type...</option>
                    ${types.map(t => `<option value="${t.value}" ${record.type === t.value ? 'selected' : ''}>${t.label}</option>`).join('')}
                </select>
            </div>
            <div class="form-group">
                <label>Expiration Date (if applicable)</label>
                <input type="date" id="vetRecordExpiration" value="${record.expiration_date || ''}">
            </div>
        </div>
        <div class="form-group">
            <label>Description/Notes</label>
            <textarea id="vetRecordDescription">${escapeHtml(record.reason || record.notes || '')}</textarea>
        </div>
        <div class="form-group">
            <label>Veterinarian/Clinic</label>
            <input type="text" id="vetRecordClinic" value="${escapeHtml(record.vet_name || '')}">
        </div>
        <div class="form-group">
            <label>Cost (optional)</label>
            <input type="number" id="vetRecordCost" step="0.01" value="${record.cost || ''}">
        </div>
        <div class="form-group">
            <label>Document URL (optional)</label>
            <input type="text" id="vetRecordDocUrl" value="${escapeHtml(record.document_url || '')}">
        </div>
    `;

    openModal('Edit Vet Record', content, `
        <button class="btn btn-outline" onclick="closeModal()">Cancel</button>
        <button class="btn btn-primary" onclick="saveVetRecord('${recordId}')">Update Record</button>
    `, 'large');
}

function toggleExpirationField() {
    // Show expiration field for vaccines
    const type = document.getElementById('vetRecordType').value;
    const vaccineTypes = ['rabies', 'dhpp', 'bordetella', 'leptospirosis', 'lyme', 'canine-influenza'];
    // Could add logic to auto-suggest expiration dates based on type
}

function saveVetRecord(recordId = null) {
    const record = {
        id: recordId || document.getElementById('editVetRecordId')?.value || null,
        dogId: document.getElementById('vetRecordDogId').value,
        visitDate: document.getElementById('vetRecordDate').value,
        type: document.getElementById('vetRecordType').value,
        expirationDate: document.getElementById('vetRecordExpiration').value || null,
        description: document.getElementById('vetRecordDescription').value.trim(),
        clinic: document.getElementById('vetRecordClinic').value.trim(),
        cost: parseFloat(document.getElementById('vetRecordCost').value) || null,
        documentUrl: document.getElementById('vetRecordDocUrl').value.trim()
    };

    if (!record.dogId || !record.visitDate || !record.type) {
        showToast('Please fill in all required fields', 'error');
        return;
    }

    // Auto-create expense if cost is entered
    if (record.cost && record.cost > 0) {
        const existingExpense = DB.expenses.getAll().find(e =>
            e.vetRecordId === record.id ||
            (e.dogId === record.dogId && e.date === record.visitDate && e.category === 'Vet/Medical' && e.amount === record.cost)
        );

        if (!existingExpense) {
            const dog = DB.dogs.getById(record.dogId);
            DB.expenses.save({
                date: record.visitDate,
                amount: record.cost,
                category: 'Vet/Medical',
                dogId: record.dogId,
                description: `${formatVetType(record.type)} - ${dog?.name || 'Unknown'}`,
                vendor: record.clinic,
                vetRecordId: record.id
            });
        }
    }

    DB.vetRecords.save(record);
    closeModal();
    showToast(recordId ? 'Vet record updated successfully' : 'Vet record added successfully', 'success');
    loadPage('vet-records');
}

async function confirmDeleteVetRecord(recordId) {
    if (confirm('Are you sure you want to delete this vet record?')) {
        await DB.vetRecords.delete(recordId);
        showToast('Vet record deleted', 'success');
        loadPage('vet-records');
    }
}

// ============================================
// WAITLIST PAGE
// ============================================
function renderWaitlistPage() {
    const waitlist = DB.waitlist.getAll().sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    const stats = DB.waitlist.getStats();
    const pendingDeposits = DB.waitlist.getAwaitingDeposit();

    return `
        <div class="admin-page-header">
            <h1>Waitlist</h1>
            <div class="header-actions">
                <button class="btn btn-outline" onclick="window.open('waitlist.html', '_blank')">View Public Form</button>
                <button class="btn btn-primary" onclick="openAddWaitlistModal()">+ Add Entry</button>
            </div>
        </div>

        <div class="stats-grid" style="margin-bottom: 2rem;">
            <div class="stat-card">
                <div class="stat-icon" style="background: var(--primary-light); color: var(--primary);">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                        <circle cx="9" cy="7" r="4"/>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                    </svg>
                </div>
                <div class="stat-info">
                    <h3>${stats.active + stats.pending}</h3>
                    <p>Active Waitlist</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon" style="background: rgba(255, 152, 0, 0.1); color: var(--warning);">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"/>
                        <polyline points="12 6 12 12 16 14"/>
                    </svg>
                </div>
                <div class="stat-info">
                    <h3>${stats.pending}</h3>
                    <p>Awaiting Deposit</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon" style="background: rgba(76, 175, 80, 0.1); color: var(--success);">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="12" y1="1" x2="12" y2="23"/>
                        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                    </svg>
                </div>
                <div class="stat-info">
                    <h3>$${stats.totalDeposits.toLocaleString()}</h3>
                    <p>Total Deposits</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon" style="background: rgba(33, 150, 243, 0.1); color: #2196F3;">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                        <polyline points="22 4 12 14.01 9 11.01"/>
                    </svg>
                </div>
                <div class="stat-info">
                    <h3>${stats.fulfilled}</h3>
                    <p>Puppies Placed</p>
                </div>
            </div>
        </div>

        ${pendingDeposits.length > 0 ? `
            <div class="admin-card" style="margin-bottom: 2rem; border-left: 4px solid var(--warning);">
                <div class="admin-card-header" style="background: rgba(255, 152, 0, 0.1);">
                    <h2 style="color: var(--warning);">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 0.5rem;">
                            <circle cx="12" cy="12" r="10"/>
                            <polyline points="12 6 12 12 16 14"/>
                        </svg>
                        Pending Deposits (${pendingDeposits.length})
                    </h2>
                </div>
                <div class="admin-card-body">
                    <div class="pending-deposits-grid">
                        ${pendingDeposits.map(entry => `
                            <div class="pending-deposit-item">
                                <div class="deposit-info">
                                    <strong>${escapeHtml(entry.first_name || '')} ${escapeHtml(entry.last_name || '')}</strong>
                                    <span>${escapeHtml(entry.email || '')}</span>
                                    <span style="color: var(--text-muted); font-size: 0.85rem;">Applied ${formatShortDate(entry.created_at)}</span>
                                </div>
                                <button class="btn btn-small btn-primary" onclick="openMarkDepositPaidModal('${entry.id}')">
                                    Mark Deposit Paid
                                </button>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        ` : ''}

        <div class="admin-card">
            <div class="admin-card-header">
                <h2>All Waitlist Entries</h2>
                <div style="display: flex; gap: 0.5rem;">
                    <select id="waitlistStatusFilter" onchange="filterWaitlist()" style="padding: 0.5rem; border-radius: 6px; background: var(--bg-secondary); border: 1px solid var(--border-color); color: var(--text-primary);">
                        <option value="">All Status</option>
                        <option value="pending">Pending Deposit</option>
                        <option value="active">Active</option>
                        <option value="fulfilled">Fulfilled</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                    <div class="search-box">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="11" cy="11" r="8"/>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                        </svg>
                        <input type="text" placeholder="Search..." onkeyup="searchWaitlist(this.value)">
                    </div>
                </div>
            </div>
            <div class="admin-card-body no-padding" id="waitlistTableContainer">
                ${renderWaitlistTable(waitlist)}
            </div>
        </div>
    `;
}

function renderWaitlistTable(entries) {
    if (entries.length === 0) {
        return `
            <div class="admin-empty-state">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
                <p>No waitlist entries yet</p>
                <button class="btn btn-primary" onclick="openAddWaitlistModal()">Add First Entry</button>
            </div>
        `;
    }

    // Filter out cancelled and fulfilled unless specifically filtered
    const activeEntries = entries.filter(e => e.status !== 'cancelled' && e.status !== 'fulfilled');

    return `
        <div class="table-responsive"><table class="admin-table">
            <thead>
                <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Contact</th>
                    <th>Preference</th>
                    <th>Deposit</th>
                    <th>Status</th>
                    <th>Applied</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${entries.map((entry, index) => {
                    const position = DB.waitlist.getPosition(entry.id);
                    const preferenceText = getWaitlistPreferenceText(entry);
                    const firstName = entry.first_name || '';
                    const lastName = entry.last_name || '';
                    return `
                        <tr class="${entry.status === 'cancelled' ? 'row-cancelled' : entry.status === 'fulfilled' ? 'row-fulfilled' : ''}">
                            <td>
                                <span class="waitlist-position ${entry.status === 'active' ? 'active' : ''}">${position || '-'}</span>
                            </td>
                            <td>
                                <div class="table-name">
                                    <div class="table-avatar" style="display:flex;align-items:center;justify-content:center;background:var(--primary-light);color:var(--primary);">
                                        ${(firstName || 'U').charAt(0)}${(lastName || '').charAt(0)}
                                    </div>
                                    <div>
                                        <span>${escapeHtml(firstName)} ${escapeHtml(lastName)}</span>
                                        <small style="display:block;color:var(--text-muted);">${escapeHtml(entry.city || '')}, ${escapeHtml(entry.state || '')}</small>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <div style="font-size: 0.9rem;">
                                    <a href="mailto:${escapeHtml(entry.email || '')}">${escapeHtml(entry.email || '')}</a><br>
                                    <a href="tel:${escapeHtml(entry.phone || '')}">${escapeHtml(entry.phone || '')}</a>
                                </div>
                            </td>
                            <td>
                                <div style="font-size: 0.85rem;">
                                    ${preferenceText}
                                </div>
                            </td>
                            <td>
                                ${entry.deposit_paid
                                    ? `<span class="status-badge status-active">$${entry.deposit_amount || 300} Paid</span>`
                                    : `<span class="status-badge status-pending">Not Paid</span>`
                                }
                            </td>
                            <td>
                                <span class="status-badge status-${entry.status || 'pending'}">${formatWaitlistStatus(entry.status)}</span>
                            </td>
                            <td>${formatShortDate(entry.created_at)}</td>
                            <td>
                                <div class="actions">
                                    <button class="icon-btn view" onclick="viewWaitlistEntry('${entry.id}')" title="View Details">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                            <circle cx="12" cy="12" r="3"/>
                                        </svg>
                                    </button>
                                    <button class="icon-btn edit" onclick="openEditWaitlistModal('${entry.id}')" title="Edit">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                        </svg>
                                    </button>
                                    ${entry.status !== 'fulfilled' && entry.status !== 'cancelled' ? `
                                        <button class="icon-btn" onclick="openWaitlistActionsMenu('${entry.id}')" title="More Actions" style="position:relative;">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                                <circle cx="12" cy="12" r="1"/>
                                                <circle cx="12" cy="5" r="1"/>
                                                <circle cx="12" cy="19" r="1"/>
                                            </svg>
                                        </button>
                                    ` : ''}
                                </div>
                            </td>
                        </tr>
                    `;
                }).join('')}
            </tbody>
        </table></div>
    `;
}

function getWaitlistPreferenceText(entry) {
    const selectedParents = entry.selected_parents || entry.selectedParents || [];
    const selectedBreeds = entry.selected_breeds || entry.selectedBreeds || [];
    const preferenceType = entry.preference_type || entry.preferenceType;

    if (preferenceType === 'parents' && selectedParents.length > 0) {
        const parentNames = selectedParents.map(id => {
            const dog = DB.dogs.getById(id);
            return dog ? escapeHtml(dog.name) : 'Unknown';
        }).join(', ');
        return `<strong>Parents:</strong> ${parentNames}`;
    } else if (selectedBreeds.length > 0) {
        const breeds = selectedBreeds.map(b => b.charAt(0).toUpperCase() + b.slice(1)).join(', ');
        return `<strong>Breed:</strong> ${breeds}`;
    }
    return '<span style="color:var(--text-muted);">Not specified</span>';
}

function formatWaitlistStatus(status) {
    const statuses = {
        'pending': 'Pending Deposit',
        'active': 'Active',
        'fulfilled': 'Fulfilled',
        'cancelled': 'Cancelled'
    };
    return statuses[status] || 'Pending';
}

function filterWaitlist() {
    const status = document.getElementById('waitlistStatusFilter').value;
    let entries = DB.waitlist.getAll().sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    if (status) {
        entries = entries.filter(e => e.status === status);
    }
    document.getElementById('waitlistTableContainer').innerHTML = renderWaitlistTable(entries);
}

function searchWaitlist(query) {
    const entries = DB.waitlist.search(query).sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    document.getElementById('waitlistTableContainer').innerHTML = renderWaitlistTable(entries);
}

function viewWaitlistEntry(entryId) {
    const entry = DB.waitlist.getById(entryId);
    if (!entry) return;

    const preferenceText = getWaitlistPreferenceText(entry);
    const position = DB.waitlist.getPosition(entryId);

    // Handle both snake_case (from DB) and camelCase field names
    const firstName = entry.first_name || entry.firstName || '';
    const lastName = entry.last_name || entry.lastName || '';
    const genderPref = entry.gender_preference || entry.genderPref || '';
    const colorPref = entry.color_preference || entry.colorPref || '';
    const sizePref = entry.size_preference || entry.sizePref || '';
    const preferenceType = entry.preference_type || entry.preferenceType || 'breed';
    const depositPaid = entry.deposit_paid || entry.depositPaid;
    const depositAmount = entry.deposit_amount || entry.depositAmount || 300;
    const depositPaidDate = entry.deposit_paid_date || entry.depositPaidDate;
    const depositPaymentMethod = entry.deposit_payment_method || entry.depositPaymentMethod || '';
    const depositTransfers = entry.deposit_transfers || entry.depositTransfers || [];
    const otherPets = entry.other_pets || entry.otherPets || '';
    const livingSituation = entry.living_situation || entry.livingsituation || '';

    const content = `
        <div class="waitlist-detail">
            <div class="detail-header">
                <div class="waitlist-position-large">#${position || '-'}</div>
                <div>
                    <h3>${escapeHtml(firstName)} ${escapeHtml(lastName)}</h3>
                    <span class="status-badge status-${entry.status || 'pending'}">${formatWaitlistStatus(entry.status)}</span>
                </div>
            </div>

            <div class="detail-section">
                <h4>Contact Information</h4>
                <div class="detail-grid">
                    <div class="detail-item">
                        <label>Email</label>
                        <span><a href="mailto:${escapeHtml(entry.email || '')}">${escapeHtml(entry.email || '')}</a></span>
                    </div>
                    <div class="detail-item">
                        <label>Phone</label>
                        <span><a href="tel:${escapeHtml(entry.phone || '')}">${escapeHtml(entry.phone || '')}</a></span>
                    </div>
                    <div class="detail-item">
                        <label>Location</label>
                        <span>${escapeHtml(entry.city || '')}, ${escapeHtml(entry.state || '')}</span>
                    </div>
                </div>
            </div>

            <div class="detail-section">
                <h4>Puppy Preferences</h4>
                <div class="detail-grid">
                    <div class="detail-item">
                        <label>Preference Type</label>
                        <span>${preferenceType === 'parents' ? 'Specific Parents' : 'Breed Type'}</span>
                    </div>
                    <div class="detail-item">
                        <label>Selection</label>
                        <span>${preferenceText}</span>
                    </div>
                    <div class="detail-item">
                        <label>Gender Preference</label>
                        <span>${genderPref === 'any' ? 'No Preference' : genderPref || 'Not specified'}</span>
                    </div>
                    <div class="detail-item">
                        <label>Color Preference</label>
                        <span>${escapeHtml(colorPref) || 'Not specified'}</span>
                    </div>
                    <div class="detail-item">
                        <label>Size Preference</label>
                        <span>${sizePref === 'any' ? 'No Preference' : sizePref || 'Not specified'}</span>
                    </div>
                </div>
            </div>

            <div class="detail-section">
                <h4>About the Applicant</h4>
                <div class="detail-grid">
                    <div class="detail-item">
                        <label>Living Situation</label>
                        <span>${formatLivingSituation(livingSituation)}</span>
                    </div>
                    <div class="detail-item">
                        <label>Experience</label>
                        <span>${formatExperience(entry.experience)}</span>
                    </div>
                    <div class="detail-item">
                        <label>Other Pets</label>
                        <span>${escapeHtml(otherPets) || 'None'}</span>
                    </div>
                    <div class="detail-item">
                        <label>Children</label>
                        <span>${escapeHtml(entry.children) || 'None'}</span>
                    </div>
                </div>
                ${entry.message ? `
                    <div class="detail-item" style="margin-top: 1rem;">
                        <label>Message</label>
                        <p style="white-space: pre-wrap; background: var(--bg-secondary); padding: 1rem; border-radius: 6px; margin-top: 0.5rem;">${escapeHtml(entry.message)}</p>
                    </div>
                ` : ''}
            </div>

            <div class="detail-section">
                <h4>Deposit Information</h4>
                <div class="detail-grid">
                    <div class="detail-item">
                        <label>Deposit Status</label>
                        <span>${depositPaid ? `Paid ($${depositAmount})` : 'Not Paid'}</span>
                    </div>
                    ${depositPaid ? `
                        <div class="detail-item">
                            <label>Payment Date</label>
                            <span>${formatShortDate(depositPaidDate)}</span>
                        </div>
                        <div class="detail-item">
                            <label>Payment Method</label>
                            <span>${escapeHtml(depositPaymentMethod) || 'Not recorded'}</span>
                        </div>
                    ` : ''}
                </div>
                ${depositTransfers.length > 0 ? `
                    <div class="detail-item" style="margin-top: 1rem;">
                        <label>Transfer History</label>
                        <ul style="margin-top: 0.5rem;">
                            ${depositTransfers.map(t => {
                                const litter = DB.litters.getById(t.toLitterId);
                                return `<li>${formatShortDate(t.date)}: Transferred to ${litter ? escapeHtml(litter.name) : 'Unknown Litter'}</li>`;
                            }).join('')}
                        </ul>
                    </div>
                ` : ''}
            </div>

            <div class="detail-section" style="color: var(--text-muted); font-size: 0.85rem;">
                <p>Applied: ${formatDate(entry.created_at)}</p>
                ${entry.updated_at ? `<p>Last Updated: ${formatDate(entry.updated_at)}</p>` : ''}
            </div>
        </div>
    `;

    const footer = `
        <button class="btn btn-outline" onclick="closeModal()">Close</button>
        ${entry.status !== 'fulfilled' && entry.status !== 'cancelled' ? `
            ${!depositPaid ? `<button class="btn btn-primary" onclick="closeModal(); openMarkDepositPaidModal('${entryId}')">Mark Deposit Paid</button>` : ''}
            <button class="btn btn-outline" onclick="closeModal(); openEditWaitlistModal('${entryId}')">Edit</button>
        ` : ''}
    `;

    openModal('Waitlist Entry Details', content, footer);
}

function formatLivingSituation(value) {
    const options = {
        'house-yard': 'House with Yard',
        'house-no-yard': 'House without Yard',
        'apartment': 'Apartment/Condo',
        'farm': 'Farm/Acreage'
    };
    return options[value] || value || 'Not specified';
}

function formatExperience(value) {
    const options = {
        'first-time': 'First-time Dog Owner',
        'some': 'Some Experience',
        'experienced': 'Experienced Dog Owner',
        'breeder': 'Breeder/Professional'
    };
    return options[value] || value || 'Not specified';
}

function openAddWaitlistModal() {
    const dogs = DB.dogs.getAll();

    const content = `
        <div class="form-section">
            <h4 style="margin-bottom: 1rem;">Contact Information</h4>
            <div class="form-row">
                <div class="form-group">
                    <label>First Name <span class="required">*</span></label>
                    <input type="text" id="waitlistFirstName" required>
                </div>
                <div class="form-group">
                    <label>Last Name <span class="required">*</span></label>
                    <input type="text" id="waitlistLastName" required>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Email <span class="required">*</span></label>
                    <input type="email" id="waitlistEmail" required>
                </div>
                <div class="form-group">
                    <label>Phone <span class="required">*</span></label>
                    <input type="tel" id="waitlistPhone" required>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>City</label>
                    <input type="text" id="waitlistCity">
                </div>
                <div class="form-group">
                    <label>State</label>
                    <input type="text" id="waitlistState">
                </div>
            </div>
        </div>

        <div class="form-section">
            <h4 style="margin-bottom: 1rem;">Preferences</h4>
            <div class="form-group">
                <label>Preference Type</label>
                <select id="waitlistPrefType" onchange="toggleWaitlistPreference()">
                    <option value="breed">Breed Type</option>
                    <option value="parents">Specific Parents</option>
                </select>
            </div>
            <div id="breedPrefSection" class="form-group">
                <label>Breeds (select all that apply)</label>
                <div class="checkbox-grid">
                    <label><input type="checkbox" name="waitlistBreeds" value="goldendoodle"> Goldendoodle</label>
                    <label><input type="checkbox" name="waitlistBreeds" value="bernedoodle"> Bernedoodle</label>
                    <label><input type="checkbox" name="waitlistBreeds" value="aussiedoodle"> Aussiedoodle</label>
                    <label><input type="checkbox" name="waitlistBreeds" value="labradoodle"> Labradoodle</label>
                    <label><input type="checkbox" name="waitlistBreeds" value="sheepadoodle"> Sheepadoodle</label>
                    <label><input type="checkbox" name="waitlistBreeds" value="any"> Any Breed</label>
                </div>
            </div>
            <div id="parentPrefSection" class="form-group" style="display:none;">
                <label>Parents (select all that apply)</label>
                <div class="checkbox-grid">
                    ${dogs.map(d => `<label><input type="checkbox" name="waitlistParents" value="${d.id}"> ${escapeHtml(d.name)}</label>`).join('')}
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Gender Preference</label>
                    <select id="waitlistGenderPref">
                        <option value="any">No Preference</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Size Preference</label>
                    <select id="waitlistSizePref">
                        <option value="any">No Preference</option>
                        <option value="mini">Mini (under 25 lbs)</option>
                        <option value="medium">Medium (25-50 lbs)</option>
                        <option value="standard">Standard (50+ lbs)</option>
                    </select>
                </div>
            </div>
            <div class="form-group">
                <label>Color Preference</label>
                <input type="text" id="waitlistColorPref" placeholder="e.g., Red, Cream, Parti">
            </div>
        </div>

        <div class="form-section">
            <h4 style="margin-bottom: 1rem;">Deposit</h4>
            <div class="form-row">
                <div class="form-group">
                    <label>
                        <input type="checkbox" id="waitlistDepositPaid" onchange="toggleDepositFields()"> Deposit Paid
                    </label>
                </div>
            </div>
            <div id="depositFields" style="display:none;">
                <div class="form-row">
                    <div class="form-group">
                        <label>Amount</label>
                        <input type="number" id="waitlistDepositAmount" value="300">
                    </div>
                    <div class="form-group">
                        <label>Payment Method</label>
                        <select id="waitlistPaymentMethod">
                            <option value="">Select...</option>
                            <option value="cash">Cash</option>
                            <option value="check">Check</option>
                            <option value="venmo">Venmo</option>
                            <option value="zelle">Zelle</option>
                            <option value="paypal">PayPal</option>
                            <option value="credit-card">Credit Card</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label>Payment Date</label>
                    <input type="date" id="waitlistPaymentDate" value="${new Date().toISOString().split('T')[0]}">
                </div>
            </div>
        </div>

        <div class="form-group">
            <label>Notes</label>
            <textarea id="waitlistNotes" rows="3" placeholder="Additional notes about this applicant..."></textarea>
        </div>
    `;

    const footer = `
        <button class="btn btn-outline" onclick="closeModal()">Cancel</button>
        <button class="btn btn-primary" onclick="saveWaitlistEntry()">Add to Waitlist</button>
    `;

    openModal('Add Waitlist Entry', content, footer);
}

function toggleWaitlistPreference() {
    const prefType = document.getElementById('waitlistPrefType').value;
    document.getElementById('breedPrefSection').style.display = prefType === 'breed' ? 'block' : 'none';
    document.getElementById('parentPrefSection').style.display = prefType === 'parents' ? 'block' : 'none';
}

function toggleDepositFields() {
    const isPaid = document.getElementById('waitlistDepositPaid').checked;
    document.getElementById('depositFields').style.display = isPaid ? 'block' : 'none';
}

function saveWaitlistEntry(entryId = null) {
    const firstName = document.getElementById('waitlistFirstName').value.trim();
    const lastName = document.getElementById('waitlistLastName').value.trim();
    const email = document.getElementById('waitlistEmail').value.trim();
    const phone = document.getElementById('waitlistPhone').value.trim();

    if (!firstName || !lastName || !email || !phone) {
        showToast('Please fill in all required fields', 'error');
        return;
    }

    const prefType = document.getElementById('waitlistPrefType').value;
    const selectedBreeds = Array.from(document.querySelectorAll('input[name="waitlistBreeds"]:checked')).map(cb => cb.value);
    const selectedParents = Array.from(document.querySelectorAll('input[name="waitlistParents"]:checked')).map(cb => cb.value);

    const depositPaid = document.getElementById('waitlistDepositPaid').checked;

    const entry = {
        id: entryId,
        firstName,
        lastName,
        email,
        phone,
        city: document.getElementById('waitlistCity').value.trim(),
        state: document.getElementById('waitlistState').value.trim(),
        preferenceType: prefType,
        selectedBreeds: prefType === 'breed' ? selectedBreeds : [],
        selectedParents: prefType === 'parents' ? selectedParents : [],
        genderPref: document.getElementById('waitlistGenderPref').value,
        sizePref: document.getElementById('waitlistSizePref').value,
        colorPref: document.getElementById('waitlistColorPref').value.trim(),
        depositPaid,
        depositAmount: depositPaid ? parseFloat(document.getElementById('waitlistDepositAmount').value) || 300 : 0,
        depositPaymentMethod: depositPaid ? document.getElementById('waitlistPaymentMethod').value : '',
        depositPaidDate: depositPaid ? document.getElementById('waitlistPaymentDate').value : null,
        status: depositPaid ? 'active' : 'pending',
        notes: document.getElementById('waitlistNotes').value.trim()
    };

    DB.waitlist.save(entry);
    closeModal();
    showToast(entryId ? 'Waitlist entry updated' : 'Added to waitlist', 'success');
    loadPage('waitlist');
}

function openEditWaitlistModal(entryId) {
    const entry = DB.waitlist.getById(entryId);
    if (!entry) return;

    const dogs = DB.dogs.getAll();

    // Handle both snake_case (from DB) and camelCase field names
    const firstName = entry.first_name || entry.firstName || '';
    const lastName = entry.last_name || entry.lastName || '';
    const preferenceType = entry.preference_type || entry.preferenceType || 'breed';
    const selectedBreeds = entry.selected_breeds || entry.selectedBreeds || [];
    const selectedParents = entry.selected_parents || entry.selectedParents || [];
    const genderPref = entry.gender_preference || entry.genderPref || 'any';
    const sizePref = entry.size_preference || entry.sizePref || 'any';
    const colorPref = entry.color_preference || entry.colorPref || '';
    const depositPaid = entry.deposit_paid || entry.depositPaid || false;
    const depositAmount = entry.deposit_amount || entry.depositAmount || 300;
    const depositPaymentMethod = entry.deposit_payment_method || entry.depositPaymentMethod || '';
    const depositPaidDate = entry.deposit_paid_date || entry.depositPaidDate || '';

    const content = `
        <div class="form-section">
            <h4 style="margin-bottom: 1rem;">Contact Information</h4>
            <div class="form-row">
                <div class="form-group">
                    <label>First Name <span class="required">*</span></label>
                    <input type="text" id="waitlistFirstName" value="${escapeHtml(firstName)}" required>
                </div>
                <div class="form-group">
                    <label>Last Name <span class="required">*</span></label>
                    <input type="text" id="waitlistLastName" value="${escapeHtml(lastName)}" required>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Email <span class="required">*</span></label>
                    <input type="email" id="waitlistEmail" value="${escapeHtml(entry.email || '')}" required>
                </div>
                <div class="form-group">
                    <label>Phone <span class="required">*</span></label>
                    <input type="tel" id="waitlistPhone" value="${escapeHtml(entry.phone || '')}" required>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>City</label>
                    <input type="text" id="waitlistCity" value="${escapeHtml(entry.city || '')}">
                </div>
                <div class="form-group">
                    <label>State</label>
                    <input type="text" id="waitlistState" value="${escapeHtml(entry.state || '')}">
                </div>
            </div>
        </div>

        <div class="form-section">
            <h4 style="margin-bottom: 1rem;">Preferences</h4>
            <div class="form-group">
                <label>Preference Type</label>
                <select id="waitlistPrefType" onchange="toggleWaitlistPreference()">
                    <option value="breed" ${preferenceType === 'breed' ? 'selected' : ''}>Breed Type</option>
                    <option value="parents" ${preferenceType === 'parents' ? 'selected' : ''}>Specific Parents</option>
                </select>
            </div>
            <div id="breedPrefSection" class="form-group" style="${preferenceType === 'parents' ? 'display:none;' : ''}">
                <label>Breeds (select all that apply)</label>
                <div class="checkbox-grid">
                    <label><input type="checkbox" name="waitlistBreeds" value="goldendoodle" ${selectedBreeds.includes('goldendoodle') ? 'checked' : ''}> Goldendoodle</label>
                    <label><input type="checkbox" name="waitlistBreeds" value="bernedoodle" ${selectedBreeds.includes('bernedoodle') ? 'checked' : ''}> Bernedoodle</label>
                    <label><input type="checkbox" name="waitlistBreeds" value="aussiedoodle" ${selectedBreeds.includes('aussiedoodle') ? 'checked' : ''}> Aussiedoodle</label>
                    <label><input type="checkbox" name="waitlistBreeds" value="labradoodle" ${selectedBreeds.includes('labradoodle') ? 'checked' : ''}> Labradoodle</label>
                    <label><input type="checkbox" name="waitlistBreeds" value="sheepadoodle" ${selectedBreeds.includes('sheepadoodle') ? 'checked' : ''}> Sheepadoodle</label>
                    <label><input type="checkbox" name="waitlistBreeds" value="any" ${selectedBreeds.includes('any') ? 'checked' : ''}> Any Breed</label>
                </div>
            </div>
            <div id="parentPrefSection" class="form-group" style="${preferenceType === 'breed' ? 'display:none;' : ''}">
                <label>Parents (select all that apply)</label>
                <div class="checkbox-grid">
                    ${dogs.map(d => `<label><input type="checkbox" name="waitlistParents" value="${d.id}" ${selectedParents.includes(d.id) ? 'checked' : ''}> ${escapeHtml(d.name)}</label>`).join('')}
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Gender Preference</label>
                    <select id="waitlistGenderPref">
                        <option value="any" ${genderPref === 'any' ? 'selected' : ''}>No Preference</option>
                        <option value="male" ${genderPref === 'male' ? 'selected' : ''}>Male</option>
                        <option value="female" ${genderPref === 'female' ? 'selected' : ''}>Female</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Size Preference</label>
                    <select id="waitlistSizePref">
                        <option value="any" ${sizePref === 'any' ? 'selected' : ''}>No Preference</option>
                        <option value="mini" ${sizePref === 'mini' ? 'selected' : ''}>Mini (under 25 lbs)</option>
                        <option value="medium" ${sizePref === 'medium' ? 'selected' : ''}>Medium (25-50 lbs)</option>
                        <option value="standard" ${sizePref === 'standard' ? 'selected' : ''}>Standard (50+ lbs)</option>
                    </select>
                </div>
            </div>
            <div class="form-group">
                <label>Color Preference</label>
                <input type="text" id="waitlistColorPref" value="${escapeHtml(colorPref)}" placeholder="e.g., Red, Cream, Parti">
            </div>
        </div>

        <div class="form-section">
            <h4 style="margin-bottom: 1rem;">Status & Deposit</h4>
            <div class="form-group">
                <label>Status</label>
                <select id="waitlistStatus">
                    <option value="pending" ${entry.status === 'pending' ? 'selected' : ''}>Pending Deposit</option>
                    <option value="active" ${entry.status === 'active' ? 'selected' : ''}>Active</option>
                    <option value="fulfilled" ${entry.status === 'fulfilled' ? 'selected' : ''}>Fulfilled</option>
                    <option value="cancelled" ${entry.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                </select>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>
                        <input type="checkbox" id="waitlistDepositPaid" ${depositPaid ? 'checked' : ''} onchange="toggleDepositFields()"> Deposit Paid
                    </label>
                </div>
            </div>
            <div id="depositFields" style="${depositPaid ? '' : 'display:none;'}">
                <div class="form-row">
                    <div class="form-group">
                        <label>Amount</label>
                        <input type="number" id="waitlistDepositAmount" value="${depositAmount}">
                    </div>
                    <div class="form-group">
                        <label>Payment Method</label>
                        <select id="waitlistPaymentMethod">
                            <option value="">Select...</option>
                            <option value="cash" ${depositPaymentMethod === 'cash' ? 'selected' : ''}>Cash</option>
                            <option value="check" ${depositPaymentMethod === 'check' ? 'selected' : ''}>Check</option>
                            <option value="venmo" ${depositPaymentMethod === 'venmo' ? 'selected' : ''}>Venmo</option>
                            <option value="zelle" ${depositPaymentMethod === 'zelle' ? 'selected' : ''}>Zelle</option>
                            <option value="paypal" ${depositPaymentMethod === 'paypal' ? 'selected' : ''}>PayPal</option>
                            <option value="credit-card" ${depositPaymentMethod === 'credit-card' ? 'selected' : ''}>Credit Card</option>
                            <option value="other" ${depositPaymentMethod === 'other' ? 'selected' : ''}>Other</option>
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label>Payment Date</label>
                    <input type="date" id="waitlistPaymentDate" value="${depositPaidDate ? depositPaidDate.split('T')[0] : ''}">
                </div>
            </div>
        </div>

        <div class="form-group">
            <label>Notes</label>
            <textarea id="waitlistNotes" rows="3" placeholder="Additional notes about this applicant...">${escapeHtml(entry.notes || '')}</textarea>
        </div>
    `;

    const footer = `
        <button class="btn btn-outline" onclick="closeModal()">Cancel</button>
        <button class="btn btn-danger" onclick="confirmDeleteWaitlistEntry('${entryId}')" style="margin-right: auto;">Delete</button>
        <button class="btn btn-primary" onclick="updateWaitlistEntry('${entryId}')">Save Changes</button>
    `;

    openModal('Edit Waitlist Entry', content, footer);
}

function updateWaitlistEntry(entryId) {
    const entry = DB.waitlist.getById(entryId);
    if (!entry) return;

    const firstName = document.getElementById('waitlistFirstName').value.trim();
    const lastName = document.getElementById('waitlistLastName').value.trim();
    const email = document.getElementById('waitlistEmail').value.trim();
    const phone = document.getElementById('waitlistPhone').value.trim();

    if (!firstName || !lastName || !email || !phone) {
        showToast('Please fill in all required fields', 'error');
        return;
    }

    const prefType = document.getElementById('waitlistPrefType').value;
    const selectedBreeds = Array.from(document.querySelectorAll('input[name="waitlistBreeds"]:checked')).map(cb => cb.value);
    const selectedParents = Array.from(document.querySelectorAll('input[name="waitlistParents"]:checked')).map(cb => cb.value);

    const depositPaid = document.getElementById('waitlistDepositPaid').checked;

    entry.firstName = firstName;
    entry.lastName = lastName;
    entry.email = email;
    entry.phone = phone;
    entry.city = document.getElementById('waitlistCity').value.trim();
    entry.state = document.getElementById('waitlistState').value.trim();
    entry.preferenceType = prefType;
    entry.selectedBreeds = prefType === 'breed' ? selectedBreeds : [];
    entry.selectedParents = prefType === 'parents' ? selectedParents : [];
    entry.genderPref = document.getElementById('waitlistGenderPref').value;
    entry.sizePref = document.getElementById('waitlistSizePref').value;
    entry.colorPref = document.getElementById('waitlistColorPref').value.trim();
    entry.status = document.getElementById('waitlistStatus').value;
    entry.depositPaid = depositPaid;
    entry.depositAmount = depositPaid ? parseFloat(document.getElementById('waitlistDepositAmount').value) || 300 : entry.depositAmount;
    entry.depositPaymentMethod = depositPaid ? document.getElementById('waitlistPaymentMethod').value : entry.depositPaymentMethod;
    entry.depositPaidDate = depositPaid && document.getElementById('waitlistPaymentDate').value ? document.getElementById('waitlistPaymentDate').value : entry.depositPaidDate;
    entry.notes = document.getElementById('waitlistNotes').value.trim();

    DB.waitlist.save(entry);
    closeModal();
    showToast('Waitlist entry updated', 'success');
    loadPage('waitlist');
}

function openMarkDepositPaidModal(entryId) {
    const entry = DB.waitlist.getById(entryId);
    if (!entry) return;

    const firstName = entry.first_name || entry.firstName || '';
    const lastName = entry.last_name || entry.lastName || '';

    const content = `
        <p style="margin-bottom: 1.5rem;">Mark deposit as paid for <strong>${escapeHtml(firstName)} ${escapeHtml(lastName)}</strong></p>
        <div class="form-row">
            <div class="form-group">
                <label>Amount</label>
                <input type="number" id="depositAmount" value="300">
            </div>
            <div class="form-group">
                <label>Payment Method</label>
                <select id="depositPaymentMethod">
                    <option value="">Select...</option>
                    <option value="cash">Cash</option>
                    <option value="check">Check</option>
                    <option value="venmo">Venmo</option>
                    <option value="zelle">Zelle</option>
                    <option value="paypal">PayPal</option>
                    <option value="credit-card">Credit Card</option>
                    <option value="other">Other</option>
                </select>
            </div>
        </div>
        <div class="form-group">
            <label>Payment Date</label>
            <input type="date" id="depositPaymentDate" value="${new Date().toISOString().split('T')[0]}">
        </div>
    `;

    const footer = `
        <button class="btn btn-outline" onclick="closeModal()">Cancel</button>
        <button class="btn btn-primary" onclick="markDepositPaid('${entryId}')">Confirm Payment</button>
    `;

    openModal('Mark Deposit Paid', content, footer);
}

function markDepositPaid(entryId) {
    const amount = parseFloat(document.getElementById('depositAmount').value) || 300;
    const method = document.getElementById('depositPaymentMethod').value;
    const date = document.getElementById('depositPaymentDate').value;

    DB.waitlist.markDepositPaid(entryId, amount, method, date);
    closeModal();
    showToast('Deposit marked as paid', 'success');
    loadPage('waitlist');
}

function openWaitlistActionsMenu(entryId) {
    const entry = DB.waitlist.getById(entryId);
    if (!entry) return;

    const litters = DB.litters.getAll();
    const depositPaid = entry.deposit_paid || entry.depositPaid || false;

    const content = `
        <div style="display: flex; flex-direction: column; gap: 1rem;">
            ${!depositPaid ? `
                <button class="btn btn-primary" style="justify-content: flex-start;" onclick="closeModal(); openMarkDepositPaidModal('${entryId}')">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 0.5rem;">
                        <line x1="12" y1="1" x2="12" y2="23"/>
                        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                    </svg>
                    Mark Deposit Paid
                </button>
            ` : ''}
            ${litters.length > 0 ? `
                <button class="btn btn-outline" style="justify-content: flex-start;" onclick="closeModal(); openAssignLitterModal('${entryId}')">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 0.5rem;">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                        <circle cx="9" cy="7" r="4"/>
                    </svg>
                    Assign to Litter
                </button>
            ` : ''}
            <button class="btn btn-outline" style="justify-content: flex-start; color: var(--success);" onclick="closeModal(); markWaitlistFulfilled('${entryId}')">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 0.5rem;">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                    <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
                Mark as Fulfilled
            </button>
            <button class="btn btn-outline" style="justify-content: flex-start; color: var(--danger);" onclick="closeModal(); cancelWaitlistEntry('${entryId}')">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 0.5rem;">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="15" y1="9" x2="9" y2="15"/>
                    <line x1="9" y1="9" x2="15" y2="15"/>
                </svg>
                Cancel Entry
            </button>
        </div>
    `;

    openModal('Waitlist Actions', content, '<button class="btn btn-outline" onclick="closeModal()">Close</button>');
}

function openAssignLitterModal(entryId) {
    const litters = DB.litters.getAll();
    const entry = DB.waitlist.getById(entryId);

    const firstName = entry.first_name || entry.firstName || '';
    const lastName = entry.last_name || entry.lastName || '';
    const assignedLitterId = entry.assigned_litter_id || entry.assignedLitterId || '';

    const content = `
        <p style="margin-bottom: 1rem;">Assign <strong>${escapeHtml(firstName)} ${escapeHtml(lastName)}</strong> to a litter:</p>
        <div class="form-group">
            <label>Select Litter</label>
            <select id="assignLitterId">
                <option value="">Select a litter...</option>
                ${litters.map(l => {
                    const mother = DB.dogs.getById(l.dam_id || l.motherId);
                    const father = DB.dogs.getById(l.sire_id || l.fatherId);
                    return `<option value="${l.id}" ${assignedLitterId === l.id ? 'selected' : ''}>${escapeHtml(l.name || 'Unnamed')} (${mother?.name || 'Unknown'} x ${father?.name || 'Unknown'})</option>`;
                }).join('')}
            </select>
        </div>
        <div class="form-group">
            <label>Notes</label>
            <textarea id="assignNotes" rows="2" placeholder="Optional notes about this assignment..."></textarea>
        </div>
    `;

    const footer = `
        <button class="btn btn-outline" onclick="closeModal()">Cancel</button>
        <button class="btn btn-primary" onclick="assignToLitter('${entryId}')">Assign</button>
    `;

    openModal('Assign to Litter', content, footer);
}

function assignToLitter(entryId) {
    const litterId = document.getElementById('assignLitterId').value;
    const notes = document.getElementById('assignNotes').value.trim();

    if (!litterId) {
        showToast('Please select a litter', 'error');
        return;
    }

    const entry = DB.waitlist.getById(entryId);
    if (entry.assignedLitterId && entry.assignedLitterId !== litterId) {
        DB.waitlist.transferDeposit(entryId, litterId, notes);
        showToast('Deposit transferred to new litter', 'success');
    } else {
        DB.waitlist.assignToLitter(entryId, litterId);
        showToast('Assigned to litter', 'success');
    }

    closeModal();
    loadPage('waitlist');
}

function markWaitlistFulfilled(entryId) {
    if (confirm('Mark this waitlist entry as fulfilled? This means the customer has received their puppy.')) {
        DB.waitlist.markFulfilled(entryId);
        showToast('Marked as fulfilled', 'success');
        loadPage('waitlist');
    }
}

function cancelWaitlistEntry(entryId) {
    const reason = prompt('Please enter a reason for cancellation (optional):');
    if (reason !== null) {
        DB.waitlist.cancel(entryId, reason);
        showToast('Waitlist entry cancelled', 'success');
        loadPage('waitlist');
    }
}

async function confirmDeleteWaitlistEntry(entryId) {
    if (confirm('Are you sure you want to permanently delete this waitlist entry? This cannot be undone.')) {
        await DB.waitlist.delete(entryId);
        closeModal();
        showToast('Waitlist entry deleted', 'success');
        loadPage('waitlist');
    }
}

// ============================================
// GUARDIAN APPLICATIONS
// ============================================
function renderGuardianApplicationsPage() {
    const applications = DB.guardianApplications.getAll();
    const stats = DB.guardianApplications.getStats();

    return `
        <div class="admin-header">
            <div>
                <h1>Guardian Applications</h1>
                <p class="admin-subtitle">Review applications from potential guardian families</p>
            </div>
        </div>

        <!-- Stats Cards -->
        <div class="stats-grid mb-6">
            <div class="stat-card">
                <div class="stat-icon" style="background: rgba(186, 155, 121, 0.2);">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--brand-gold)" stroke-width="2">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                        <polyline points="9 22 9 12 15 12 15 22"/>
                    </svg>
                </div>
                <div class="stat-content">
                    <p class="stat-value">${stats.total}</p>
                    <p class="stat-label">Total Applications</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon" style="background: rgba(251, 191, 36, 0.2);">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" stroke-width="2">
                        <circle cx="12" cy="12" r="10"/>
                        <polyline points="12 6 12 12 16 14"/>
                    </svg>
                </div>
                <div class="stat-content">
                    <p class="stat-value">${stats.pending}</p>
                    <p class="stat-label">Pending Review</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon" style="background: rgba(34, 197, 94, 0.2);">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                        <polyline points="22 4 12 14.01 9 11.01"/>
                    </svg>
                </div>
                <div class="stat-content">
                    <p class="stat-value">${stats.approved}</p>
                    <p class="stat-label">Approved</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon" style="background: rgba(59, 130, 246, 0.2);">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                    </svg>
                </div>
                <div class="stat-content">
                    <p class="stat-value">${stats.contacted}</p>
                    <p class="stat-label">Contacted</p>
                </div>
            </div>
        </div>

        <!-- Applications Table -->
        <div class="admin-card">
            <div class="card-header">
                <h3>All Applications</h3>
                <div class="filter-group">
                    <select id="guardianStatusFilter" onchange="filterGuardianApplications()" class="form-select">
                        <option value="all">All Statuses</option>
                        <option value="Pending">Pending</option>
                        <option value="Contacted">Contacted</option>
                        <option value="Approved">Approved</option>
                        <option value="Rejected">Rejected</option>
                    </select>
                </div>
            </div>
            <div id="guardianApplicationsTable">
                ${renderGuardianApplicationsTable(applications)}
            </div>
        </div>
    `;
}

function renderGuardianApplicationsTable(applications) {
    if (!applications || applications.length === 0) {
        return `
            <div class="empty-state">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                    <polyline points="9 22 9 12 15 12 15 22"/>
                </svg>
                <h3>No Guardian Applications</h3>
                <p>Guardian home applications will appear here when submitted.</p>
            </div>
        `;
    }

    return `
        <div class="applications-list">
            ${applications.map(app => {
                const statusClass = (app.status || 'Pending').toLowerCase();
                const isRejected = statusClass === 'rejected';
                const isApproved = statusClass === 'approved';

                return `
                <div class="application-list-item ${isRejected ? 'item-rejected' : ''} ${isApproved ? 'item-approved' : ''}">
                    <div class="application-list-header">
                        <div class="applicant-info-row">
                            <div class="sender-avatar-sm ${statusClass === 'pending' ? 'avatar-pending' : ''}">
                                ${(app.name || 'U').charAt(0).toUpperCase()}
                            </div>
                            <div class="applicant-main-info">
                                <div class="applicant-name-row">
                                    <strong class="applicant-name">${app.name || 'Unknown'}</strong>
                                    <span class="status-badge status-${statusClass}">${app.status || 'Pending'}</span>
                                </div>
                                <div class="applicant-contact-row">
                                    <a href="mailto:${app.email}" class="contact-link">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                                            <polyline points="22,6 12,13 2,6"/>
                                        </svg>
                                        ${app.email || 'No email'}
                                    </a>
                                    ${app.phone ? `
                                    <span class="contact-divider">|</span>
                                    <a href="tel:${app.phone}" class="contact-link">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                                        </svg>
                                        ${app.phone}
                                    </a>
                                    ` : ''}
                                </div>
                            </div>
                        </div>
                        <div class="application-meta">
                            <span class="application-date">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                                    <line x1="16" y1="2" x2="16" y2="6"/>
                                    <line x1="8" y1="2" x2="8" y2="6"/>
                                    <line x1="3" y1="10" x2="21" y2="10"/>
                                </svg>
                                ${formatDate(app.created_at)}
                            </span>
                            <div class="application-actions">
                                <button class="btn-action-sm btn-status" onclick="openGuardianStatusMenu('${app.id}')" title="Change Status">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <circle cx="12" cy="12" r="3"/>
                                        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h.09a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.09a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                                    </svg>
                                    Status
                                </button>
                                <button class="btn-action-sm btn-delete" onclick="deleteGuardianApplication('${app.id}')" title="Delete">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <polyline points="3 6 5 6 21 6"/>
                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>

                    <div class="application-details-grid">
                        <div class="detail-box">
                            <label>Address</label>
                            <p>${app.address || 'Not provided'}</p>
                        </div>
                        <div class="detail-box">
                            <label>Home Type</label>
                            <p>${app.home_type || 'Not specified'}</p>
                        </div>
                        <div class="detail-box">
                            <label>Fenced Yard</label>
                            <p class="${app.yard_fenced ? 'text-success' : ''}">${app.yard_fenced ? 'Yes' : 'No'}</p>
                        </div>
                        <div class="detail-box">
                            <label>Gender Preference</label>
                            <p>${app.gender_preference || 'No preference'}</p>
                        </div>
                        <div class="detail-box">
                            <label>Breed Preference</label>
                            <p>${app.breed_preference || 'No preference'}</p>
                        </div>
                    </div>

                    ${app.why_interested ? `
                    <div class="application-reason">
                        <label>Why They're Interested in Being a Guardian</label>
                        <p>${app.why_interested}</p>
                    </div>
                    ` : ''}
                </div>
                `;
            }).join('')}
        </div>
    `;
}

function filterGuardianApplications() {
    const status = document.getElementById('guardianStatusFilter').value;
    let applications = DB.guardianApplications.getAll();

    if (status !== 'all') {
        applications = applications.filter(a => a.status === status);
    }

    document.getElementById('guardianApplicationsTable').innerHTML = renderGuardianApplicationsTable(applications);
}

function viewGuardianApplication(id) {
    const app = DB.guardianApplications.getById(id);
    if (!app) return;

    const modal = document.getElementById('modal');
    modal.innerHTML = `
        <div class="modal-content modal-lg">
            <div class="modal-header">
                <h2>Guardian Application Details</h2>
                <button class="modal-close" onclick="closeModal()">&times;</button>
            </div>
            <div class="modal-body">
                <div class="detail-grid">
                    <div class="detail-section">
                        <h3>Contact Information</h3>
                        <div class="detail-row">
                            <span class="detail-label">Name:</span>
                            <span class="detail-value">${app.name || 'N/A'}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Email:</span>
                            <span class="detail-value"><a href="mailto:${app.email}" class="text-brand-gold">${app.email || 'N/A'}</a></span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Phone:</span>
                            <span class="detail-value"><a href="tel:${app.phone}" class="text-brand-gold">${app.phone || 'N/A'}</a></span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Address:</span>
                            <span class="detail-value">${app.address || 'N/A'}</span>
                        </div>
                    </div>
                    <div class="detail-section">
                        <h3>Home Details</h3>
                        <div class="detail-row">
                            <span class="detail-label">Home Type:</span>
                            <span class="detail-value">${app.home_type || 'N/A'}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Fenced Yard:</span>
                            <span class="detail-value">${app.yard_fenced ? 'Yes' : 'No'}</span>
                        </div>
                    </div>
                    <div class="detail-section">
                        <h3>Preferences</h3>
                        <div class="detail-row">
                            <span class="detail-label">Gender:</span>
                            <span class="detail-value">${app.gender_preference || 'No preference'}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Breed:</span>
                            <span class="detail-value">${app.breed_preference || 'No preference'}</span>
                        </div>
                    </div>
                    <div class="detail-section full-width">
                        <h3>Why They're Interested</h3>
                        <p class="detail-text">${app.why_interested || 'No response provided'}</p>
                    </div>
                    <div class="detail-section">
                        <h3>Application Status</h3>
                        <div class="detail-row">
                            <span class="detail-label">Status:</span>
                            <span class="status-badge status-${app.status?.toLowerCase() || 'pending'}">${app.status || 'Pending'}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Submitted:</span>
                            <span class="detail-value">${formatDate(app.created_at)}</span>
                        </div>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="closeModal()">Close</button>
                <button class="btn btn-primary" onclick="openGuardianStatusMenu('${app.id}')">Change Status</button>
                <button class="btn btn-danger" onclick="deleteGuardianApplication('${app.id}')">Delete</button>
            </div>
        </div>
    `;
    modal.classList.add('active');
}

function openGuardianStatusMenu(id) {
    const app = DB.guardianApplications.getById(id);
    if (!app) return;

    const modal = document.getElementById('modal');
    modal.innerHTML = `
        <div class="modal-content modal-sm">
            <div class="modal-header">
                <h2>Update Status</h2>
                <button class="modal-close" onclick="closeModal()">&times;</button>
            </div>
            <div class="modal-body">
                <p class="mb-4">Select a new status for <strong>${app.name}</strong>'s application:</p>
                <div class="status-options">
                    <button class="btn btn-block ${app.status === 'Pending' ? 'btn-active' : ''}" onclick="updateGuardianStatus('${id}', 'Pending')">
                        <span class="status-badge status-pending">Pending</span>
                    </button>
                    <button class="btn btn-block ${app.status === 'Contacted' ? 'btn-active' : ''}" onclick="updateGuardianStatus('${id}', 'Contacted')">
                        <span class="status-badge status-contacted">Contacted</span>
                    </button>
                    <button class="btn btn-block ${app.status === 'Approved' ? 'btn-active' : ''}" onclick="updateGuardianStatus('${id}', 'Approved')">
                        <span class="status-badge status-approved">Approved</span>
                    </button>
                    <button class="btn btn-block ${app.status === 'Rejected' ? 'btn-active' : ''}" onclick="updateGuardianStatus('${id}', 'Rejected')">
                        <span class="status-badge status-rejected">Rejected</span>
                    </button>
                </div>
            </div>
        </div>
    `;
    modal.classList.add('active');
}

async function updateGuardianStatus(id, status) {
    try {
        await DB.guardianApplications.updateStatus(id, status);
        showToast(`Application status updated to ${status}`, 'success');
        closeModal();
        loadPage('guardian-applications');
    } catch (error) {
        console.error('Error updating status:', error);
        showToast('Failed to update status', 'error');
    }
}

async function deleteGuardianApplication(id) {
    if (confirm('Are you sure you want to delete this application? This cannot be undone.')) {
        try {
            await DB.guardianApplications.delete(id);
            showToast('Application deleted', 'success');
            closeModal();
            loadPage('guardian-applications');
        } catch (error) {
            console.error('Error deleting application:', error);
            showToast('Failed to delete application', 'error');
        }
    }
}

// ============================================
// CONTACT MESSAGES
// ============================================
function renderContactMessagesPage() {
    const messages = DB.contactSubmissions.getAll();
    const stats = DB.contactSubmissions.getStats();

    return `
        <div class="admin-header">
            <div>
                <h1>Contact Messages</h1>
                <p class="admin-subtitle">Messages submitted through your contact form</p>
            </div>
        </div>

        <!-- Stats Cards -->
        <div class="stats-grid mb-6">
            <div class="stat-card">
                <div class="stat-icon" style="background: rgba(186, 155, 121, 0.2);">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--brand-gold)" stroke-width="2">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                        <polyline points="22,6 12,13 2,6"/>
                    </svg>
                </div>
                <div class="stat-content">
                    <p class="stat-value">${stats.total}</p>
                    <p class="stat-label">Total Messages</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon" style="background: rgba(251, 191, 36, 0.2);">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" stroke-width="2">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="12" y1="8" x2="12" y2="12"/>
                        <line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                </div>
                <div class="stat-content">
                    <p class="stat-value">${stats.unread}</p>
                    <p class="stat-label">Unread</p>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon" style="background: rgba(34, 197, 94, 0.2);">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                        <polyline points="22 4 12 14.01 9 11.01"/>
                    </svg>
                </div>
                <div class="stat-content">
                    <p class="stat-value">${stats.read}</p>
                    <p class="stat-label">Read</p>
                </div>
            </div>
        </div>

        <!-- Messages Table -->
        <div class="admin-card">
            <div class="card-header">
                <h3>All Messages</h3>
                <div class="filter-group">
                    <select id="messageStatusFilter" onchange="filterContactMessages()" class="form-select">
                        <option value="all">All Messages</option>
                        <option value="unread">Unread Only</option>
                        <option value="read">Read Only</option>
                    </select>
                </div>
            </div>
            <div id="contactMessagesTable">
                ${renderContactMessagesTable(messages)}
            </div>
        </div>
    `;
}

function renderContactMessagesTable(messages) {
    if (!messages || messages.length === 0) {
        return `
            <div class="empty-state">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                </svg>
                <h3>No Contact Messages</h3>
                <p>Messages from your contact form will appear here.</p>
            </div>
        `;
    }

    return `
        <div class="messages-list">
            ${messages.map(msg => {
                const isUnread = !msg.read;

                return `
                <div class="message-list-item ${isUnread ? 'item-unread' : ''}">
                    <div class="message-list-header">
                        <div class="message-list-sender">
                            <div class="sender-avatar-sm ${isUnread ? 'avatar-unread' : ''}">
                                ${(msg.name || 'U').charAt(0).toUpperCase()}
                            </div>
                            <div class="sender-info-compact">
                                <div class="sender-name-row">
                                    <strong class="sender-name">${msg.name || 'Unknown'}</strong>
                                    ${isUnread ? '<span class="unread-badge">New</span>' : ''}
                                </div>
                                <div class="sender-contact-row">
                                    <a href="mailto:${msg.email}" class="sender-email-link">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display:inline;vertical-align:-2px;margin-right:4px;">
                                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                                            <polyline points="22,6 12,13 2,6"/>
                                        </svg>${msg.email || 'No email'}
                                    </a>
                                    ${msg.phone ? `
                                        <span class="contact-divider">|</span>
                                        <a href="tel:${msg.phone}" class="sender-phone-link">
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display:inline;vertical-align:-2px;margin-right:4px;">
                                                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                                            </svg>${msg.phone}
                                        </a>
                                    ` : '<span class="no-phone-text">(No phone provided)</span>'}
                                </div>
                            </div>
                        </div>
                        <div class="message-list-meta">
                            <span class="message-date-compact">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                                    <line x1="16" y1="2" x2="16" y2="6"/>
                                    <line x1="8" y1="2" x2="8" y2="6"/>
                                    <line x1="3" y1="10" x2="21" y2="10"/>
                                </svg>
                                ${formatDate(msg.created_at)}
                            </span>
                            <div class="message-actions">
                                <a href="mailto:${msg.email}?subject=Re: ${encodeURIComponent(msg.subject || 'Your inquiry')}" class="btn-action-sm btn-reply" title="Reply via Email">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <polyline points="9 17 4 12 9 7"/>
                                        <path d="M20 18v-2a4 4 0 0 0-4-4H4"/>
                                    </svg>
                                    Reply
                                </a>
                                <button class="btn-action-sm btn-delete" onclick="deleteContactMessage('${msg.id}')" title="Delete Message">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <polyline points="3 6 5 6 21 6"/>
                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>

                    <div class="message-list-content">
                        <h4 class="message-subject-line">${msg.subject || 'No Subject'}</h4>
                        <div class="message-full-text">
                            <p>${(msg.message || 'No message content').replace(/\n/g, '<br>')}</p>
                        </div>
                    </div>
                </div>
                `;
            }).join('')}
        </div>
    `;
}

function filterContactMessages() {
    const filter = document.getElementById('messageStatusFilter').value;
    let messages = DB.contactSubmissions.getAll();

    if (filter === 'unread') {
        messages = messages.filter(m => !m.read);
    } else if (filter === 'read') {
        messages = messages.filter(m => m.read);
    }

    document.getElementById('contactMessagesTable').innerHTML = renderContactMessagesTable(messages);
}

async function viewContactMessage(id) {
    const msg = DB.contactSubmissions.getById(id);
    if (!msg) return;

    // Mark as read when viewing
    if (!msg.read) {
        await DB.contactSubmissions.markRead(id);
    }

    const modal = document.getElementById('modal');
    modal.innerHTML = `
        <div class="modal-content modal-lg">
            <div class="modal-header">
                <h2>Contact Message</h2>
                <button class="modal-close" onclick="closeModal()">&times;</button>
            </div>
            <div class="modal-body">
                <div class="message-detail">
                    <div class="message-meta">
                        <div class="meta-row">
                            <strong>From:</strong> ${msg.name || 'Unknown'} &lt;${msg.email || 'N/A'}&gt;
                        </div>
                        ${msg.phone ? `<div class="meta-row"><strong>Phone:</strong> <a href="tel:${msg.phone}" class="text-brand-gold">${msg.phone}</a></div>` : ''}
                        <div class="meta-row">
                            <strong>Subject:</strong> ${msg.subject || 'No Subject'}
                        </div>
                        <div class="meta-row">
                            <strong>Date:</strong> ${formatDate(msg.created_at)}
                        </div>
                    </div>
                    <hr class="my-4 border-brand-card">
                    <div class="message-body">
                        <p style="white-space: pre-wrap;">${msg.message || 'No message content'}</p>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="closeModal()">Close</button>
                <a href="mailto:${msg.email}?subject=Re: ${encodeURIComponent(msg.subject || 'Your inquiry')}" class="btn btn-primary">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="mr-2">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                        <polyline points="22,6 12,13 2,6"/>
                    </svg>
                    Reply via Email
                </a>
                <button class="btn btn-danger" onclick="deleteContactMessage('${msg.id}')">Delete</button>
            </div>
        </div>
    `;
    modal.classList.add('active');

    // Refresh the page to update read status
    loadPage('contact-messages');
}

async function deleteContactMessage(id) {
    if (confirm('Are you sure you want to delete this message? This cannot be undone.')) {
        try {
            await DB.contactSubmissions.delete(id);
            showToast('Message deleted', 'success');
            closeModal();
            loadPage('contact-messages');
        } catch (error) {
            console.error('Error deleting message:', error);
            showToast('Failed to delete message', 'error');
        }
    }
}

// ============================================
// TESTIMONIALS
// ============================================
function renderTestimonialsPage() {
    const testimonials = DB.testimonials.getAll();
    const published = testimonials.filter(t => t.is_public);
    const featured = testimonials.filter(t => t.is_featured && t.is_public);
    const drafts = testimonials.filter(t => !t.is_public);

    return `
        <div class="admin-header">
            <div>
                <h1>Testimonials</h1>
                <p class="admin-subtitle">Customer reviews displayed on your website</p>
            </div>
            <button class="btn btn-primary" onclick="openAddTestimonialModal()">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="12" y1="5" x2="12" y2="19"/>
                    <line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                Add Testimonial
            </button>
        </div>

        <!-- Stats Cards -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 2rem;">
            <div class="admin-card" style="padding: 1.5rem;">
                <div style="display: flex; align-items: center; gap: 1rem;">
                    <div style="width: 48px; height: 48px; border-radius: 12px; background: var(--primary-light); display: flex; align-items: center; justify-content: center;">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                        </svg>
                    </div>
                    <div>
                        <div style="font-size: 28px; font-weight: 700; color: var(--text-primary);">${testimonials.length}</div>
                        <div style="font-size: 14px; color: var(--text-muted);">Total</div>
                    </div>
                </div>
            </div>

            <div class="admin-card" style="padding: 1.5rem;">
                <div style="display: flex; align-items: center; gap: 1rem;">
                    <div style="width: 48px; height: 48px; border-radius: 12px; background: rgba(34, 197, 94, 0.1); display: flex; align-items: center; justify-content: center;">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgb(34, 197, 94)" stroke-width="2">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                            <polyline points="22 4 12 14.01 9 11.01"/>
                        </svg>
                    </div>
                    <div>
                        <div style="font-size: 28px; font-weight: 700; color: var(--text-primary);">${published.length}</div>
                        <div style="font-size: 14px; color: var(--text-muted);">Published</div>
                    </div>
                </div>
            </div>

            <div class="admin-card" style="padding: 1.5rem;">
                <div style="display: flex; align-items: center; gap: 1rem;">
                    <div style="width: 48px; height: 48px; border-radius: 12px; background: rgba(251, 191, 36, 0.1); display: flex; align-items: center; justify-content: center;">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgb(251, 191, 36)" stroke-width="2">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                        </svg>
                    </div>
                    <div>
                        <div style="font-size: 28px; font-weight: 700; color: var(--text-primary);">${featured.length}</div>
                        <div style="font-size: 14px; color: var(--text-muted);">Featured</div>
                    </div>
                </div>
            </div>

            <div class="admin-card" style="padding: 1.5rem;">
                <div style="display: flex; align-items: center; gap: 1rem;">
                    <div style="width: 48px; height: 48px; border-radius: 12px; background: rgba(148, 163, 184, 0.1); display: flex; align-items: center; justify-content: center;">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgb(148, 163, 184)" stroke-width="2">
                            <path d="M9 12h6M12 9v6M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z"/>
                        </svg>
                    </div>
                    <div>
                        <div style="font-size: 28px; font-weight: 700; color: var(--text-primary);">${drafts.length}</div>
                        <div style="font-size: 14px; color: var(--text-muted);">Drafts</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Testimonials Grid -->
        <div class="admin-card">
            <div class="admin-card-body" style="padding: 0;">
                ${testimonials.length === 0 ? `
                    <div class="admin-empty-state" style="padding: 4rem 2rem;">
                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin: 0 auto 1.5rem; opacity: 0.3;">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                        </svg>
                        <h3 style="color: var(--text-primary); margin-bottom: 0.5rem;">No testimonials yet</h3>
                        <p style="color: var(--text-muted); margin-bottom: 2rem;">Start collecting customer reviews to build trust with potential buyers</p>
                        <button class="btn btn-primary" onclick="openAddTestimonialModal()">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="12" y1="5" x2="12" y2="19"/>
                                <line x1="5" y1="12" x2="19" y2="12"/>
                            </svg>
                            Add Your First Testimonial
                        </button>
                    </div>
                ` : `
                    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 1.5rem; padding: 1.5rem;">
                        ${testimonials.map(t => {
                            const familyName = t.customer_name || t.family_name || 'Unknown';
                            const photoUrl = t.photo_url;
                            const rating = t.rating || 5;
                            return `
                            <div class="admin-card" style="padding: 1.5rem; position: relative; border: 2px solid ${t.is_public ? 'var(--success)' : 'var(--border-color)'};">
                                <!-- Status Badges -->
                                <div style="position: absolute; top: 1rem; right: 1rem; display: flex; gap: 0.5rem;">
                                    ${!t.is_public ? `<span class="status-badge status-pending" style="font-size: 11px; padding: 4px 8px;">Draft</span>` : ''}
                                    ${t.is_featured ? `<span class="status-badge" style="background: var(--warning); color: var(--bg-primary); font-size: 11px; padding: 4px 8px;">⭐ Featured</span>` : ''}
                                </div>

                                <!-- Customer Info -->
                                <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem;">
                                    <div style="width: 60px; height: 60px; border-radius: 50%; overflow: hidden; background: var(--bg-tertiary); flex-shrink: 0;">
                                        ${photoUrl ? `
                                            <img src="${escapeHtml(photoUrl)}" alt="${escapeHtml(familyName)}" style="width: 100%; height: 100%; object-fit: cover;">
                                        ` : `
                                            <div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: var(--primary-light); color: var(--primary); font-weight: 600; font-size: 24px;">
                                                ${familyName.charAt(0).toUpperCase()}
                                            </div>
                                        `}
                                    </div>
                                    <div style="flex: 1; min-width: 0;">
                                        <div style="font-weight: 600; color: var(--text-primary); font-size: 16px;">${escapeHtml(familyName)}</div>
                                        ${t.puppy_name ? `<div style="color: var(--text-muted); font-size: 13px; margin-top: 2px;">🐾 Owner of ${escapeHtml(t.puppy_name)}</div>` : ''}
                                        <div style="display: flex; gap: 2px; margin-top: 4px;">
                                            ${Array(5).fill(0).map((_, i) => `
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="${i < rating ? 'var(--warning)' : 'var(--border-color)'}">
                                                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                                                </svg>
                                            `).join('')}
                                        </div>
                                    </div>
                                </div>

                                <!-- Testimonial Content -->
                                <div style="background: var(--bg-secondary); padding: 1rem; border-radius: 8px; margin-bottom: 1rem; border-left: 3px solid var(--primary);">
                                    <p style="margin: 0; line-height: 1.6; color: var(--text-secondary); font-style: italic;">"${escapeHtml(t.content)}"</p>
                                </div>

                                <!-- Footer -->
                                <div style="display: flex; align-items: center; justify-content: space-between; padding-top: 1rem; border-top: 1px solid var(--border-color);">
                                    <div style="display: flex; align-items: center; gap: 1rem; color: var(--text-muted); font-size: 13px;">
                                        <span>Display Order: <strong style="color: var(--text-primary);">#${t.display_order || 0}</strong></span>
                                        ${t.is_public ? `<span class="status-badge status-active" style="font-size: 11px;">Live on Website</span>` : ''}
                                    </div>
                                    <div class="action-buttons">
                                        <button class="btn-icon" title="Edit" onclick="openEditTestimonialModal('${t.id}')">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                            </svg>
                                        </button>
                                        <button class="btn-icon btn-icon-danger" title="Delete" onclick="confirmDeleteTestimonial('${t.id}')">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                                <polyline points="3 6 5 6 21 6"/>
                                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        `}).join('')}
                    </div>
                `}
            </div>
        </div>
    `;
}

function openAddTestimonialModal() {
    const puppies = DB.puppies.getAll();
    const customers = DB.customers.getAll();

    const content = `
        <div class="form-group">
            <label>Family/Customer Name <span class="required">*</span></label>
            <input type="text" id="testimonialCustomerName" required placeholder="The Smith Family">
            <small style="color: var(--text-muted); display: block; margin-top: 4px;">This will be displayed on your website</small>
        </div>

        <div class="form-group">
            <label>Testimonial Content <span class="required">*</span></label>
            <textarea id="testimonialContent" rows="5" required placeholder="Share what the customer said about their experience with your puppies..." style="resize: vertical;"></textarea>
        </div>

        <div class="form-row">
            <div class="form-group">
                <label>Rating</label>
                <select id="testimonialRating">
                    <option value="5" selected>⭐⭐⭐⭐⭐ (5 Stars)</option>
                    <option value="4">⭐⭐⭐⭐ (4 Stars)</option>
                    <option value="3">⭐⭐⭐ (3 Stars)</option>
                    <option value="2">⭐⭐ (2 Stars)</option>
                    <option value="1">⭐ (1 Star)</option>
                </select>
            </div>
            <div class="form-group">
                <label>Puppy Name <small>(optional)</small></label>
                <input type="text" id="testimonialPuppyName" placeholder="e.g., Cooper, Luna, Max">
            </div>
        </div>

        <div class="form-group">
            <label>Customer/Family Photo <small>(optional but recommended)</small></label>
            ${getPhotoUploadHtml('testimonialPhoto', { hint: 'Photo of the family or their puppy. Tap to upload or drag & drop.' })}
            <small style="color: var(--text-muted); display: block; margin-top: 8px;">💡 Photos make testimonials more engaging and trustworthy</small>
        </div>

        <div class="form-row">
            <div class="form-group">
                <label>Display Order</label>
                <input type="number" id="testimonialDisplayOrder" value="0" min="0" placeholder="0">
                <small style="color: var(--text-muted); display: block; margin-top: 4px;">Lower numbers appear first</small>
            </div>
        </div>

        <div style="border-top: 1px solid var(--border-color); padding-top: 1rem; margin-top: 1rem;">
            <div class="form-row">
                <div class="form-group">
                    <label class="checkbox-label">
                        <input type="checkbox" id="testimonialPublic" checked>
                        <span>Publish on website</span>
                    </label>
                    <small style="color: var(--text-muted); display: block; margin-top: 4px; margin-left: 24px;">Show this testimonial to visitors</small>
                </div>
                <div class="form-group">
                    <label class="checkbox-label">
                        <input type="checkbox" id="testimonialFeatured">
                        <span>Feature on homepage</span>
                    </label>
                    <small style="color: var(--text-muted); display: block; margin-top: 4px; margin-left: 24px;">Highlight as a featured review</small>
                </div>
            </div>
        </div>
    `;

    openModal('Add Testimonial', content, `
        <button class="btn btn-outline" onclick="closeModal()">Cancel</button>
        <button class="btn btn-primary" onclick="saveTestimonial()">Save Testimonial</button>
    `);
    setTimeout(() => initPhotoDropZone('testimonialPhoto'), 100);
}

function openEditTestimonialModal(id) {
    const t = DB.testimonials.getById(id);
    if (!t) return;

    const customerName = t.customer_name || t.family_name || '';
    const content = t.content || '';
    const puppyName = t.puppy_name || '';
    const photoUrl = t.photo_url || '';
    const rating = t.rating || 5;
    const displayOrder = t.display_order || 0;
    const isPublic = t.is_public || false;
    const isFeatured = t.is_featured || false;

    const modalContent = `
        <input type="hidden" id="editTestimonialId" value="${id}">

        <div class="form-group">
            <label>Family/Customer Name <span class="required">*</span></label>
            <input type="text" id="testimonialCustomerName" value="${escapeHtml(customerName)}" required placeholder="The Smith Family">
            <small style="color: var(--text-muted); display: block; margin-top: 4px;">This will be displayed on your website</small>
        </div>

        <div class="form-group">
            <label>Testimonial Content <span class="required">*</span></label>
            <textarea id="testimonialContent" rows="5" required placeholder="Share what the customer said about their experience with your puppies..." style="resize: vertical;">${escapeHtml(content)}</textarea>
        </div>

        <div class="form-row">
            <div class="form-group">
                <label>Rating</label>
                <select id="testimonialRating">
                    ${[5,4,3,2,1].map(r => `<option value="${r}" ${rating === r ? 'selected' : ''}>⭐${'⭐'.repeat(r-1)} (${r} Star${r>1?'s':''})</option>`).join('')}
                </select>
            </div>
            <div class="form-group">
                <label>Puppy Name <small>(optional)</small></label>
                <input type="text" id="testimonialPuppyName" value="${escapeHtml(puppyName)}" placeholder="e.g., Cooper, Luna, Max">
            </div>
        </div>

        <div class="form-group">
            <label>Customer/Family Photo <small>(optional but recommended)</small></label>
            ${getPhotoUploadHtml('testimonialPhoto', { currentPhoto: photoUrl, hint: 'Photo of the family or their puppy. Tap to upload or drag & drop.' })}
            <small style="color: var(--text-muted); display: block; margin-top: 8px;">💡 Photos make testimonials more engaging and trustworthy</small>
        </div>

        <div class="form-row">
            <div class="form-group">
                <label>Display Order</label>
                <input type="number" id="testimonialDisplayOrder" value="${displayOrder}" min="0" placeholder="0">
                <small style="color: var(--text-muted); display: block; margin-top: 4px;">Lower numbers appear first</small>
            </div>
        </div>

        <div style="border-top: 1px solid var(--border-color); padding-top: 1rem; margin-top: 1rem;">
            <div class="form-row">
                <div class="form-group">
                    <label class="checkbox-label">
                        <input type="checkbox" id="testimonialPublic" ${isPublic ? 'checked' : ''}>
                        <span>Publish on website</span>
                    </label>
                    <small style="color: var(--text-muted); display: block; margin-top: 4px; margin-left: 24px;">Show this testimonial to visitors</small>
                </div>
                <div class="form-group">
                    <label class="checkbox-label">
                        <input type="checkbox" id="testimonialFeatured" ${isFeatured ? 'checked' : ''}>
                        <span>Feature on homepage</span>
                    </label>
                    <small style="color: var(--text-muted); display: block; margin-top: 4px; margin-left: 24px;">Highlight as a featured review</small>
                </div>
            </div>
        </div>
    `;

    openModal('Edit Testimonial', modalContent, `
        <button class="btn btn-outline" onclick="closeModal()">Cancel</button>
        <button class="btn btn-primary" onclick="saveTestimonial()">Save Changes</button>
    `);
    setTimeout(() => initPhotoDropZone('testimonialPhoto'), 100);
}

async function saveTestimonial() {
    const id = document.getElementById('editTestimonialId')?.value;
    const customerName = document.getElementById('testimonialCustomerName')?.value.trim();
    const content = document.getElementById('testimonialContent')?.value.trim();

    if (!customerName || !content) {
        showToast('Please fill in all required fields', 'error');
        return;
    }

    const photoUrl = getPhotoFromGrid('testimonialPhoto');

    const testimonial = {
        id: id || null,
        customerName: customerName,
        content: content,
        rating: parseInt(document.getElementById('testimonialRating').value),
        puppyName: document.getElementById('testimonialPuppyName')?.value.trim() || '',
        photoUrl: photoUrl || '',
        displayOrder: parseInt(document.getElementById('testimonialDisplayOrder')?.value || 0),
        isPublic: document.getElementById('testimonialPublic').checked,
        isFeatured: document.getElementById('testimonialFeatured').checked
    };

    console.log('Saving testimonial:', testimonial);

    try {
        const result = await DB.testimonials.save(testimonial);
        console.log('Testimonial saved successfully:', result);
        closeModal();
        showToast(id ? 'Testimonial updated successfully' : 'Testimonial added successfully', 'success');
        loadPage('testimonials');
    } catch (error) {
        console.error('Error saving testimonial:', error);
        showToast(`Failed to save testimonial: ${error.message || 'Unknown error'}`, 'error');
    }
}

async function confirmDeleteTestimonial(id) {
    if (confirm('Are you sure you want to delete this testimonial?')) {
        await DB.testimonials.delete(id);
        showToast('Testimonial deleted', 'success');
        loadPage('testimonials');
    }
}

function truncateText(text, maxLength) {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

// ============================================
// GALLERY (HAPPY FAMILIES)
// ============================================
function renderGalleryPage() {
    const galleryItems = DB.gallery.getAll();

    return `
        <div class="admin-header">
            <div>
                <h1>Happy Families Gallery</h1>
                <p class="admin-subtitle">Photos of puppies with their forever families</p>
            </div>
            <button class="btn btn-primary" onclick="openAddGalleryModal()">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="12" y1="5" x2="12" y2="19"/>
                    <line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                Add Photo
            </button>
        </div>

        <div class="admin-card">
            <div class="admin-card-header">
                <h2>Gallery Photos (${galleryItems.length})</h2>
            </div>
            <div class="admin-card-body">
                ${galleryItems.length === 0 ? `
                    <div class="admin-empty-state">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                            <circle cx="8.5" cy="8.5" r="1.5"/>
                            <polyline points="21 15 16 10 5 21"/>
                        </svg>
                        <p>No gallery photos yet</p>
                        <button class="btn btn-primary" onclick="openAddGalleryModal()">Add First Photo</button>
                    </div>
                ` : `
                    <div class="gallery-admin-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1rem;">
                        ${galleryItems.map(item => `
                            <div class="gallery-admin-item" style="position: relative; border-radius: 8px; overflow: hidden; background: var(--bg-secondary);">
                                ${item.image_url ? `
                                    <img src="${escapeHtml(item.image_url)}" alt="${escapeHtml(item.family_name || 'Gallery photo')}" style="width: 100%; aspect-ratio: 1; object-fit: cover;">
                                ` : `
                                    <div style="width: 100%; aspect-ratio: 1; display: flex; align-items: center; justify-content: center; color: var(--text-muted);">
                                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
                                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                                            <circle cx="8.5" cy="8.5" r="1.5"/>
                                            <polyline points="21 15 16 10 5 21"/>
                                        </svg>
                                    </div>
                                `}
                                <div style="padding: 0.75rem;">
                                    <p style="font-weight: 500; margin: 0 0 0.25rem;">${escapeHtml(item.family_name || 'Family')}</p>
                                    ${item.puppy_name ? `<p style="font-size: 0.85rem; color: var(--text-muted); margin: 0;">with ${escapeHtml(item.puppy_name)}</p>` : ''}
                                    <div style="display: flex; gap: 0.5rem; margin-top: 0.5rem;">
                                        ${item.is_approved ? `<span class="status-badge status-active" style="font-size: 0.7rem;">Public</span>` : `<span class="status-badge status-pending" style="font-size: 0.7rem;">Draft</span>`}
                                    </div>
                                    <div style="display: flex; gap: 0.5rem; margin-top: 0.5rem;">
                                        <button class="btn btn-small btn-outline" onclick="openEditGalleryModal('${item.id}')">Edit</button>
                                        <button class="btn btn-small btn-danger" onclick="confirmDeleteGalleryItem('${item.id}')">Delete</button>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                `}
            </div>
        </div>
    `;
}

function openAddGalleryModal() {
    const content = `
        <div class="form-group">
            <label>Photo <span class="required">*</span></label>
            ${getPhotoUploadHtml('galleryPhoto', { hint: 'Photo of puppy with their family' })}
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>Family Name <span class="required">*</span></label>
                <input type="text" id="galleryFamilyName" required placeholder="The Johnson Family">
            </div>
            <div class="form-group">
                <label>Puppy Name</label>
                <input type="text" id="galleryPuppyName" placeholder="Their puppy's name">
            </div>
        </div>
        <div class="form-group">
            <label>Caption / Description</label>
            <textarea id="galleryCaption" rows="2" placeholder="A short description or quote from the family..."></textarea>
        </div>
        <div class="form-group">
            <label class="checkbox-label">
                <input type="checkbox" id="galleryPublic" checked>
                Show on website (public)
            </label>
        </div>
    `;

    openModal('Add Gallery Photo', content, `
        <button class="btn btn-outline" onclick="closeModal()">Cancel</button>
        <button class="btn btn-primary" onclick="saveGalleryItem()">Save Photo</button>
    `);
    setTimeout(() => initPhotoDropZone('galleryPhoto'), 100);
}

function openEditGalleryModal(id) {
    const item = DB.gallery.getById(id);
    if (!item) return;

    const content = `
        <input type="hidden" id="editGalleryId" value="${id}">
        <div class="form-group">
            <label>Photo <span class="required">*</span></label>
            ${getPhotoUploadHtml('galleryPhoto', { currentPhoto: item.photoUrl || '', hint: 'Photo of puppy with their family' })}
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>Family Name <span class="required">*</span></label>
                <input type="text" id="galleryFamilyName" value="${escapeHtml(item.familyName || '')}" required>
            </div>
            <div class="form-group">
                <label>Puppy Name</label>
                <input type="text" id="galleryPuppyName" value="${escapeHtml(item.puppyName || '')}">
            </div>
        </div>
        <div class="form-group">
            <label>Caption / Description</label>
            <textarea id="galleryCaption" rows="2">${escapeHtml(item.caption || '')}</textarea>
        </div>
        <div class="form-group">
            <label class="checkbox-label">
                <input type="checkbox" id="galleryPublic" ${item.isPublic ? 'checked' : ''}>
                Show on website (public)
            </label>
        </div>
    `;

    openModal('Edit Gallery Photo', content, `
        <button class="btn btn-outline" onclick="closeModal()">Cancel</button>
        <button class="btn btn-primary" onclick="saveGalleryItem()">Save Changes</button>
    `);
    setTimeout(() => initPhotoDropZone('galleryPhoto'), 100);
}

function saveGalleryItem() {
    const id = document.getElementById('editGalleryId')?.value;
    const photoUrl = getPhotoFromGrid('galleryPhoto');
    const familyName = document.getElementById('galleryFamilyName').value.trim();

    if (!photoUrl || !familyName) {
        showToast('Please add a photo and fill in the family name', 'error');
        return;
    }

    const item = {
        id: id || null,
        photoUrl,
        familyName,
        puppyName: document.getElementById('galleryPuppyName').value.trim(),
        caption: document.getElementById('galleryCaption').value.trim(),
        isPublic: document.getElementById('galleryPublic').checked
    };

    DB.gallery.save(item);
    closeModal();
    showToast(id ? 'Gallery photo updated' : 'Gallery photo added', 'success');
    loadPage('gallery');
}

async function confirmDeleteGalleryItem(id) {
    if (confirm('Are you sure you want to delete this gallery photo?')) {
        await DB.gallery.delete(id);
        showToast('Gallery photo deleted', 'success');
        loadPage('gallery');
    }
}

// ============================================
// FAQ
// ============================================
function renderFaqPage() {
    const faqs = DB.faq.getAll();
    const categories = ['General', 'Puppies', 'Pricing', 'Health', 'Guardian Program', 'Training', 'Other'];

    return `
        <div class="admin-header">
            <div>
                <h1>FAQ Management</h1>
                <p class="admin-subtitle">Manage frequently asked questions</p>
            </div>
            <div class="header-actions">
                <a href="faq.html" target="_blank" class="btn btn-outline">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                        <polyline points="15 3 21 3 21 9"/>
                        <line x1="10" y1="14" x2="21" y2="3"/>
                    </svg>
                    View Page
                </a>
                <button class="btn btn-primary" onclick="openAddFaqModal()">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="12" y1="5" x2="12" y2="19"/>
                        <line x1="5" y1="12" x2="19" y2="12"/>
                    </svg>
                    Add FAQ
                </button>
            </div>
        </div>

        <div class="admin-card">
            <div class="admin-card-header">
                <h2>All FAQs (${faqs.length})</h2>
            </div>
            <div class="admin-card-body no-padding">
                ${faqs.length === 0 ? `
                    <div class="admin-empty-state">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                            <circle cx="12" cy="12" r="10"/>
                            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                            <line x1="12" y1="17" x2="12.01" y2="17"/>
                        </svg>
                        <p>No FAQs yet</p>
                        <button class="btn btn-primary" onclick="openAddFaqModal()">Add First FAQ</button>
                    </div>
                ` : `
                    <div class="table-responsive"><table class="admin-table" id="faqTable">
                        <thead>
                            <tr>
                                <th style="width: 40px;"></th>
                                <th>Question</th>
                                <th>Category</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody id="faqTableBody">
                            ${faqs.sort((a, b) => (a.display_order || 0) - (b.display_order || 0)).map((faq, index) => `
                                <tr draggable="true" data-faq-id="${faq.id}" data-order="${index}"
                                    ondragstart="handleFaqDragStart(event)"
                                    ondragover="handleFaqDragOver(event)"
                                    ondrop="handleFaqDrop(event)"
                                    ondragend="handleFaqDragEnd(event)"
                                    style="cursor: move;">
                                    <td style="width: 40px; text-align: center;">
                                        <div class="drag-handle" title="Drag to reorder">
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" opacity="0.5">
                                                <line x1="8" y1="6" x2="16" y2="6"/>
                                                <line x1="8" y1="12" x2="16" y2="12"/>
                                                <line x1="8" y1="18" x2="16" y2="18"/>
                                            </svg>
                                        </div>
                                    </td>
                                    <td>
                                        <strong>${escapeHtml(faq.question)}</strong>
                                        <p style="font-size: 0.85rem; color: var(--text-muted); margin: 0.25rem 0 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 400px;">${escapeHtml(truncateText(faq.answer, 100))}</p>
                                    </td>
                                    <td>
                                        <span class="status-badge" style="background: var(--bg-secondary);">${escapeHtml(faq.category || 'General')}</span>
                                    </td>
                                    <td>
                                        ${faq.is_public ? `<span class="status-badge status-active">Public</span>` : `<span class="status-badge status-pending">Draft</span>`}
                                    </td>
                                    <td>
                                        <div class="action-buttons">
                                            <button class="btn-icon" title="Edit" onclick="openEditFaqModal('${faq.id}')">
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                                </svg>
                                            </button>
                                            <button class="btn-icon btn-icon-danger" title="Delete" onclick="confirmDeleteFaq('${faq.id}')">
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                                    <polyline points="3 6 5 6 21 6"/>
                                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                                                </svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table></div>
                `}
            </div>
        </div>
    `;
}

function openAddFaqModal() {
    const categories = ['General', 'Puppies', 'Pricing', 'Health', 'Guardian Program', 'Training', 'Other'];

    const content = `
        <div class="form-group">
            <label>Question <span class="required">*</span></label>
            <input type="text" id="faqQuestion" required placeholder="Enter your frequently asked question">
        </div>
        <div class="form-group">
            <label>Answer <span class="required">*</span></label>
            <textarea id="faqAnswer" rows="6" required placeholder="Provide a detailed answer to help your customers"></textarea>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>Category</label>
                <select id="faqCategory">
                    ${categories.map(c => `<option value="${c}">${c}</option>`).join('')}
                </select>
            </div>
            <div class="form-group">
                <label>Display Order</label>
                <input type="number" id="faqOrder" value="0" min="0" placeholder="0">
            </div>
        </div>
        <div class="form-group" style="margin-top: 1.5rem; padding: 1.25rem; background: rgba(139, 92, 246, 0.1); border: 2px solid rgba(139, 92, 246, 0.2); border-radius: 8px;">
            <label class="checkbox-label" style="display: flex; align-items: flex-start; gap: 0.75rem; cursor: pointer; margin: 0;">
                <input type="checkbox" id="faqPublic" checked style="width: 20px; height: 20px; cursor: pointer; margin-top: 2px; flex-shrink: 0; accent-color: #8b5cf6;">
                <div style="flex: 1;">
                    <div style="font-weight: 600; color: #e5e7eb; font-size: 1rem; margin-bottom: 0.25rem;">Show on public website</div>
                    <div style="font-size: 0.875rem; color: #9ca3af; line-height: 1.5;">When checked, this FAQ will be visible to website visitors on the public FAQ page</div>
                </div>
            </label>
        </div>
    `;

    openModal('Add FAQ', content, `
        <button class="btn btn-outline" onclick="closeModal()">Cancel</button>
        <button class="btn btn-primary" onclick="saveFaq()">Add FAQ</button>
    `);
}

function openEditFaqModal(id) {
    const faq = DB.faq.getById(id);
    if (!faq) return;

    const categories = ['General', 'Puppies', 'Pricing', 'Health', 'Guardian Program', 'Training', 'Other'];

    const content = `
        <input type="hidden" id="editFaqId" value="${id}">
        <div class="form-group">
            <label>Question <span class="required">*</span></label>
            <input type="text" id="faqQuestion" value="${escapeHtml(faq.question || '')}" required placeholder="Enter your frequently asked question">
        </div>
        <div class="form-group">
            <label>Answer <span class="required">*</span></label>
            <textarea id="faqAnswer" rows="6" required placeholder="Provide a detailed answer to help your customers">${escapeHtml(faq.answer || '')}</textarea>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>Category</label>
                <select id="faqCategory">
                    ${categories.map(c => `<option value="${c}" ${faq.category === c ? 'selected' : ''}>${c}</option>`).join('')}
                </select>
            </div>
            <div class="form-group">
                <label>Display Order</label>
                <input type="number" id="faqOrder" value="${faq.displayOrder || 0}" min="0" placeholder="0">
            </div>
        </div>
        <div class="form-group" style="margin-top: 1.5rem; padding: 1.25rem; background: rgba(139, 92, 246, 0.1); border: 2px solid rgba(139, 92, 246, 0.2); border-radius: 8px;">
            <label class="checkbox-label" style="display: flex; align-items: flex-start; gap: 0.75rem; cursor: pointer; margin: 0;">
                <input type="checkbox" id="faqPublic" ${faq.is_public ? 'checked' : ''} style="width: 20px; height: 20px; cursor: pointer; margin-top: 2px; flex-shrink: 0; accent-color: #8b5cf6;">
                <div style="flex: 1;">
                    <div style="font-weight: 600; color: #e5e7eb; font-size: 1rem; margin-bottom: 0.25rem;">Show on public website</div>
                    <div style="font-size: 0.875rem; color: #9ca3af; line-height: 1.5;">When checked, this FAQ will be visible to website visitors on the public FAQ page</div>
                </div>
            </label>
        </div>
    `;

    openModal('Edit FAQ', content, `
        <button class="btn btn-outline" onclick="closeModal()">Cancel</button>
        <button class="btn btn-primary" onclick="saveFaq()">Save Changes</button>
    `);
}

async function saveFaq() {
    const id = document.getElementById('editFaqId')?.value;
    const question = document.getElementById('faqQuestion').value.trim();
    const answer = document.getElementById('faqAnswer').value.trim();

    if (!question || !answer) {
        showToast('Please fill in all required fields', 'error');
        return;
    }

    const faq = {
        id: id || null,
        question,
        answer,
        category: document.getElementById('faqCategory').value,
        displayOrder: parseInt(document.getElementById('faqOrder').value) || 0,
        isPublic: document.getElementById('faqPublic').checked
    };

    await DB.faq.save(faq);
    closeModal();
    showToast(id ? 'FAQ updated' : 'FAQ added', 'success');
    loadPage('faq');
}

async function updateFaqOrder(id, newOrder) {
    const faq = DB.faq.getById(id);
    if (faq) {
        faq.displayOrder = parseInt(newOrder) || 0;
        await DB.faq.save(faq);
    }
}

async function confirmDeleteFaq(id) {
    if (confirm('Are you sure you want to delete this FAQ?')) {
        await DB.faq.delete(id);
        showToast('FAQ deleted', 'success');
        loadPage('faq');
    }
}

// ============================================
// FAQ DRAG AND DROP REORDERING
// ============================================
let draggedFaqElement = null;
let draggedOverElement = null;

function handleFaqDragStart(e) {
    draggedFaqElement = e.currentTarget;
    e.currentTarget.style.opacity = '0.4';
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.currentTarget.innerHTML);
}

function handleFaqDragOver(e) {
    if (e.preventDefault) {
        e.preventDefault();
    }
    e.dataTransfer.dropEffect = 'move';

    const target = e.currentTarget;
    if (draggedFaqElement !== target) {
        draggedOverElement = target;
        target.style.borderTop = '2px solid #8b5cf6';
    }
    return false;
}

function handleFaqDrop(e) {
    if (e.stopPropagation) {
        e.stopPropagation();
    }

    const target = e.currentTarget;
    target.style.borderTop = '';

    if (draggedFaqElement !== target) {
        // Get all FAQ IDs in current order
        const tbody = document.getElementById('faqTableBody');
        const rows = Array.from(tbody.querySelectorAll('tr'));

        // Find positions
        const draggedIndex = rows.indexOf(draggedFaqElement);
        const targetIndex = rows.indexOf(target);

        // Reorder in DOM
        if (draggedIndex < targetIndex) {
            target.parentNode.insertBefore(draggedFaqElement, target.nextSibling);
        } else {
            target.parentNode.insertBefore(draggedFaqElement, target);
        }

        // Update database with new order
        updateFaqOrderAfterDrag();
    }

    return false;
}

function handleFaqDragEnd(e) {
    e.currentTarget.style.opacity = '1';

    // Remove all border highlights
    const allRows = document.querySelectorAll('#faqTableBody tr');
    allRows.forEach(row => {
        row.style.borderTop = '';
    });

    draggedFaqElement = null;
    draggedOverElement = null;
}

async function updateFaqOrderAfterDrag() {
    const tbody = document.getElementById('faqTableBody');
    const rows = Array.from(tbody.querySelectorAll('tr'));

    // Get FAQs in new order and update display_order
    const updates = rows.map((row, index) => {
        const faqId = row.getAttribute('data-faq-id');
        const faq = DB.faq.getById(faqId);
        if (faq) {
            return {
                ...faq,
                displayOrder: index,
                display_order: index
            };
        }
        return null;
    }).filter(Boolean);

    // Save all updates
    try {
        for (const faq of updates) {
            await DB.faq.save(faq);
        }
        showToast('FAQ order updated', 'success');
    } catch (error) {
        console.error('Error updating FAQ order:', error);
        showToast('Failed to update order', 'error');
        loadPage('faq'); // Reload to reset
    }
}

// ============================================
// SITE SETTINGS - Edit all website content
// ============================================
function renderSiteSettingsPage() {
    const content = DB.siteContent.get();

    return `
        <div class="admin-page-header">
            <div>
                <h1>Site Settings</h1>
                <p style="color: var(--text-muted); margin-top: 0.5rem;">Edit your website content, photos, and information</p>
            </div>
        </div>

        <div class="admin-tabs" id="siteSettingsTabs">
            <button class="tab-btn active" data-tab="business">Business Info</button>
            <button class="tab-btn" data-tab="homepage">Homepage</button>
            <button class="tab-btn" data-tab="about">About Page</button>
            <button class="tab-btn" data-tab="values">Values & SACC</button>
            <button class="tab-btn" data-tab="guardian">Guardian Program</button>
            <button class="tab-btn" data-tab="contact">Contact</button>
        </div>

        <div class="tab-content" id="siteSettingsContent">
            <!-- Business Info Tab -->
            <div class="tab-pane active" id="tab-business">
                <div class="admin-card">
                    <div class="admin-card-header">
                        <h2>Business Information</h2>
                    </div>
                    <div class="admin-card-body">
                        <div class="form-row">
                            <div class="form-group">
                                <label>Business Name</label>
                                <input type="text" id="businessName" value="${escapeHtml(content.business?.name || '')}" placeholder="SACC Doodles">
                            </div>
                            <div class="form-group">
                                <label>Tagline</label>
                                <input type="text" id="businessTagline" value="${escapeHtml(content.business?.tagline || '')}" placeholder="Quality Bred Puppies">
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Phone Number</label>
                                <input type="tel" id="businessPhone" value="${escapeHtml(content.business?.phone || '')}" placeholder="480-822-8443">
                            </div>
                            <div class="form-group">
                                <label>Email</label>
                                <input type="email" id="businessEmail" value="${escapeHtml(content.business?.email || '')}" placeholder="email@example.com">
                            </div>
                        </div>
                        <div class="form-group">
                            <label>Location</label>
                            <input type="text" id="businessLocation" value="${escapeHtml(content.business?.location || '')}" placeholder="Gilbert, Arizona">
                        </div>
                        <h3 style="margin: 2rem 0 1rem; padding-top: 1rem; border-top: 1px solid var(--border-color);">Social Media Links</h3>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Instagram URL</label>
                                <input type="url" id="businessInstagram" value="${escapeHtml(content.business?.instagram || '')}" placeholder="https://instagram.com/...">
                            </div>
                            <div class="form-group">
                                <label>TikTok URL</label>
                                <input type="url" id="businessTiktok" value="${escapeHtml(content.business?.tiktok || '')}" placeholder="https://tiktok.com/...">
                            </div>
                        </div>
                        <div class="form-group">
                            <label>Facebook URL</label>
                            <input type="url" id="businessFacebook" value="${escapeHtml(content.business?.facebook || '')}" placeholder="https://facebook.com/...">
                        </div>
                        <button class="btn btn-primary" onclick="saveSiteSettings('business')">Save Business Info</button>
                    </div>
                </div>
            </div>

            <!-- Homepage Tab -->
            <div class="tab-pane" id="tab-homepage">
                <div class="admin-card">
                    <div class="admin-card-header">
                        <h2>Hero Section</h2>
                    </div>
                    <div class="admin-card-body">
                        <div class="form-row">
                            <div class="form-group">
                                <label>Hero Title</label>
                                <input type="text" id="heroTitle" value="${escapeHtml(content.homepage?.heroTitle || '')}" placeholder="SACC Doodles">
                            </div>
                            <div class="form-group">
                                <label>Hero Subtitle</label>
                                <input type="text" id="heroSubtitle" value="${escapeHtml(content.homepage?.heroSubtitle || '')}" placeholder="Raising healthy, happy puppies...">
                            </div>
                        </div>
                        <div class="form-group">
                            <label>Hero Background Image</label>
                            ${getPhotoUploadHtml('heroImage', { currentPhoto: content.homepage?.heroImage || '', hint: 'Large background image for the homepage hero' })}
                        </div>
                        <button class="btn btn-primary" onclick="saveSiteSettings('homepage')">Save Homepage Settings</button>
                    </div>
                </div>

                <div class="admin-card" style="margin-top: 1.5rem;">
                    <div class="admin-card-header">
                        <h2>Section Titles</h2>
                    </div>
                    <div class="admin-card-body">
                        <p style="color: var(--text-muted); margin-bottom: 1.5rem;">Customize the titles and subtitles for each section on the homepage.</p>

                        <h4 style="color: var(--accent-gold); margin-bottom: 1rem;">Dogs Section</h4>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Title</label>
                                <input type="text" id="dogsSectionTitle" value="${escapeHtml(content.homepage?.dogsSection?.title || '')}" placeholder="Our Dogs">
                            </div>
                            <div class="form-group">
                                <label>Subtitle</label>
                                <input type="text" id="dogsSectionSubtitle" value="${escapeHtml(content.homepage?.dogsSection?.subtitle || '')}">
                            </div>
                        </div>

                        <h4 style="color: var(--accent-gold); margin: 1.5rem 0 1rem;">Puppies Section</h4>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Title</label>
                                <input type="text" id="puppiesSectionTitle" value="${escapeHtml(content.homepage?.puppiesSection?.title || '')}" placeholder="Puppies">
                            </div>
                            <div class="form-group">
                                <label>Subtitle</label>
                                <input type="text" id="puppiesSectionSubtitle" value="${escapeHtml(content.homepage?.puppiesSection?.subtitle || '')}">
                            </div>
                        </div>

                        <h4 style="color: var(--accent-gold); margin: 1.5rem 0 1rem;">Guardian Section</h4>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Title</label>
                                <input type="text" id="guardianSectionTitle" value="${escapeHtml(content.homepage?.guardianSection?.title || '')}" placeholder="Guardian Home">
                            </div>
                            <div class="form-group">
                                <label>Subtitle</label>
                                <input type="text" id="guardianSectionSubtitle" value="${escapeHtml(content.homepage?.guardianSection?.subtitle || '')}">
                            </div>
                        </div>

                        <h4 style="color: var(--accent-gold); margin: 1.5rem 0 1rem;">Testimonials Section</h4>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Title</label>
                                <input type="text" id="testimonialsSectionTitle" value="${escapeHtml(content.homepage?.testimonialsSection?.title || '')}" placeholder="Families Say">
                            </div>
                            <div class="form-group">
                                <label>Subtitle</label>
                                <input type="text" id="testimonialsSectionSubtitle" value="${escapeHtml(content.homepage?.testimonialsSection?.subtitle || '')}">
                            </div>
                        </div>

                        <button class="btn btn-primary" onclick="saveSiteSettings('homepage')">Save Homepage Settings</button>
                    </div>
                </div>
            </div>

            <!-- About Tab -->
            <div class="tab-pane" id="tab-about">
                <div class="admin-card">
                    <div class="admin-card-header">
                        <h2>About You / The Breeder</h2>
                    </div>
                    <div class="admin-card-body">
                        <div class="form-group">
                            <label>Your Name</label>
                            <input type="text" id="breederName" value="${escapeHtml(content.about?.breederName || '')}" placeholder="Angela">
                        </div>
                        <div class="form-group">
                            <label>Your Photo</label>
                            ${getPhotoUploadHtml('breederPhoto', { currentPhoto: content.about?.breederPhoto || '', hint: 'A photo of you for the website' })}
                        </div>

                        <h3 style="margin: 2rem 0 1rem; padding-top: 1rem; border-top: 1px solid var(--border-color);">Short Bio (Homepage)</h3>
                        <p style="color: var(--text-muted); margin-bottom: 1rem;">This appears on the homepage in the "Meet" section.</p>
                        <div class="form-group">
                            <label>Paragraph 1</label>
                            <textarea id="shortBio" rows="3">${escapeHtml(content.about?.shortBio || '')}</textarea>
                        </div>
                        <div class="form-group">
                            <label>Paragraph 2</label>
                            <textarea id="shortBio2" rows="2">${escapeHtml(content.about?.shortBio2 || '')}</textarea>
                        </div>

                        <h3 style="margin: 2rem 0 1rem; padding-top: 1rem; border-top: 1px solid var(--border-color);">Full Bio (About Page)</h3>
                        <p style="color: var(--text-muted); margin-bottom: 1rem;">This appears on the full About Us page.</p>
                        <div class="form-group">
                            <label>Paragraph 1</label>
                            <textarea id="fullBio" rows="3">${escapeHtml(content.about?.fullBio || '')}</textarea>
                        </div>
                        <div class="form-group">
                            <label>Paragraph 2</label>
                            <textarea id="fullBio2" rows="3">${escapeHtml(content.about?.fullBio2 || '')}</textarea>
                        </div>
                        <div class="form-group">
                            <label>Paragraph 3</label>
                            <textarea id="fullBio3" rows="3">${escapeHtml(content.about?.fullBio3 || '')}</textarea>
                        </div>

                        <button class="btn btn-primary" onclick="saveSiteSettings('about')">Save About Info</button>
                    </div>
                </div>

                <div class="admin-card" style="margin-top: 1.5rem;">
                    <div class="admin-card-header">
                        <h2>Our Philosophy Section</h2>
                    </div>
                    <div class="admin-card-body">
                        <div class="form-group">
                            <label>Philosophy Image</label>
                            ${getPhotoUploadHtml('philosophyPhoto', { currentPhoto: content.about?.philosophyPhoto || '', hint: 'An image for the philosophy section' })}
                        </div>
                        <div class="form-group">
                            <label>Paragraph 1</label>
                            <textarea id="philosophy1" rows="3">${escapeHtml(content.about?.philosophy1 || '')}</textarea>
                        </div>
                        <div class="form-group">
                            <label>Paragraph 2</label>
                            <textarea id="philosophy2" rows="3">${escapeHtml(content.about?.philosophy2 || '')}</textarea>
                        </div>
                        <div class="form-group">
                            <label>Paragraph 3</label>
                            <textarea id="philosophy3" rows="3">${escapeHtml(content.about?.philosophy3 || '')}</textarea>
                        </div>
                        <button class="btn btn-primary" onclick="saveSiteSettings('about')">Save Philosophy</button>
                    </div>
                </div>
            </div>

            <!-- Values Tab -->
            <div class="tab-pane" id="tab-values">
                <div class="admin-card">
                    <div class="admin-card-header">
                        <h2>What SACC Means</h2>
                    </div>
                    <div class="admin-card-body">
                        <p style="color: var(--text-muted); margin-bottom: 1.5rem;">Define what each letter in SACC represents.</p>

                        <div class="form-row">
                            <div class="form-group">
                                <label>S - Word</label>
                                <input type="text" id="saccSWord" value="${escapeHtml(content.saccMeaning?.s?.word || '')}" placeholder="Smart">
                            </div>
                            <div class="form-group">
                                <label>S - Description</label>
                                <input type="text" id="saccSDesc" value="${escapeHtml(content.saccMeaning?.s?.description || '')}">
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>A - Word</label>
                                <input type="text" id="saccAWord" value="${escapeHtml(content.saccMeaning?.a?.word || '')}" placeholder="Amazing">
                            </div>
                            <div class="form-group">
                                <label>A - Description</label>
                                <input type="text" id="saccADesc" value="${escapeHtml(content.saccMeaning?.a?.description || '')}">
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>C - Word (first)</label>
                                <input type="text" id="saccC1Word" value="${escapeHtml(content.saccMeaning?.c1?.word || '')}" placeholder="Cute">
                            </div>
                            <div class="form-group">
                                <label>C - Description (first)</label>
                                <input type="text" id="saccC1Desc" value="${escapeHtml(content.saccMeaning?.c1?.description || '')}">
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>C - Word (second)</label>
                                <input type="text" id="saccC2Word" value="${escapeHtml(content.saccMeaning?.c2?.word || '')}" placeholder="Cuddly">
                            </div>
                            <div class="form-group">
                                <label>C - Description (second)</label>
                                <input type="text" id="saccC2Desc" value="${escapeHtml(content.saccMeaning?.c2?.description || '')}">
                            </div>
                        </div>
                        <button class="btn btn-primary" onclick="saveSiteSettings('saccMeaning')">Save SACC Meaning</button>
                    </div>
                </div>

                <div class="admin-card" style="margin-top: 1.5rem;">
                    <div class="admin-card-header">
                        <h2>Our Values</h2>
                    </div>
                    <div class="admin-card-body">
                        <h4 style="color: var(--accent-gold); margin-bottom: 1rem;">Value 1</h4>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Title</label>
                                <input type="text" id="value1Title" value="${escapeHtml(content.values?.value1?.title || '')}" placeholder="Health First">
                            </div>
                            <div class="form-group">
                                <label>Description</label>
                                <input type="text" id="value1Desc" value="${escapeHtml(content.values?.value1?.description || '')}">
                            </div>
                        </div>

                        <h4 style="color: var(--accent-gold); margin: 1.5rem 0 1rem;">Value 2</h4>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Title</label>
                                <input type="text" id="value2Title" value="${escapeHtml(content.values?.value2?.title || '')}" placeholder="Family Raised">
                            </div>
                            <div class="form-group">
                                <label>Description</label>
                                <input type="text" id="value2Desc" value="${escapeHtml(content.values?.value2?.description || '')}">
                            </div>
                        </div>

                        <h4 style="color: var(--accent-gold); margin: 1.5rem 0 1rem;">Value 3</h4>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Title</label>
                                <input type="text" id="value3Title" value="${escapeHtml(content.values?.value3?.title || '')}" placeholder="Lifetime Support">
                            </div>
                            <div class="form-group">
                                <label>Description</label>
                                <input type="text" id="value3Desc" value="${escapeHtml(content.values?.value3?.description || '')}">
                            </div>
                        </div>
                        <button class="btn btn-primary" onclick="saveSiteSettings('values')">Save Values</button>
                    </div>
                </div>
            </div>

            <!-- Guardian Tab -->
            <div class="tab-pane" id="tab-guardian">
                <div class="admin-card">
                    <div class="admin-card-header">
                        <h2>Guardian Program Page</h2>
                    </div>
                    <div class="admin-card-body">
                        <div class="form-row">
                            <div class="form-group">
                                <label>Page Title</label>
                                <input type="text" id="guardianPageTitle" value="${escapeHtml(content.guardian?.pageTitle || '')}" placeholder="Guardian Homes">
                            </div>
                            <div class="form-group">
                                <label>Page Subtitle</label>
                                <input type="text" id="guardianPageSubtitle" value="${escapeHtml(content.guardian?.pageSubtitle || '')}">
                            </div>
                        </div>
                        <div class="form-group">
                            <label>Introduction Title</label>
                            <input type="text" id="guardianIntroTitle" value="${escapeHtml(content.guardian?.introTitle || '')}" placeholder="What is a Guardian Home?">
                        </div>
                        <div class="form-group">
                            <label>Introduction Text</label>
                            <textarea id="guardianIntroText" rows="4">${escapeHtml(content.guardian?.introText || '')}</textarea>
                        </div>

                        <h3 style="margin: 2rem 0 1rem; padding-top: 1rem; border-top: 1px solid var(--border-color);">Benefits (one per line)</h3>
                        <div class="form-group">
                            <textarea id="guardianBenefits" rows="6" placeholder="Enter each benefit on a new line">${(content.guardian?.benefits || []).join('\n')}</textarea>
                        </div>

                        <h3 style="margin: 2rem 0 1rem; padding-top: 1rem; border-top: 1px solid var(--border-color);">Requirements (one per line)</h3>
                        <div class="form-group">
                            <textarea id="guardianRequirements" rows="6" placeholder="Enter each requirement on a new line">${(content.guardian?.requirements || []).join('\n')}</textarea>
                        </div>

                        <button class="btn btn-primary" onclick="saveSiteSettings('guardian')">Save Guardian Program</button>
                    </div>
                </div>
            </div>

            <!-- Contact Tab -->
            <div class="tab-pane" id="tab-contact">
                <div class="admin-card">
                    <div class="admin-card-header">
                        <h2>Contact Page</h2>
                    </div>
                    <div class="admin-card-body">
                        <div class="form-row">
                            <div class="form-group">
                                <label>Page Title</label>
                                <input type="text" id="contactPageTitle" value="${escapeHtml(content.contact?.pageTitle || '')}" placeholder="Contact Us">
                            </div>
                            <div class="form-group">
                                <label>Page Subtitle</label>
                                <input type="text" id="contactPageSubtitle" value="${escapeHtml(content.contact?.pageSubtitle || '')}">
                            </div>
                        </div>
                        <div class="form-group">
                            <label>Form Introduction Text</label>
                            <textarea id="contactFormIntro" rows="3">${escapeHtml(content.contact?.formIntro || '')}</textarea>
                        </div>
                        <button class="btn btn-primary" onclick="saveSiteSettings('contact')">Save Contact Settings</button>
                    </div>
                </div>

                <div class="admin-card" style="margin-top: 1.5rem;">
                    <div class="admin-card-header">
                        <h2>Footer</h2>
                    </div>
                    <div class="admin-card-body">
                        <div class="form-group">
                            <label>Footer Tagline</label>
                            <input type="text" id="footerTagline" value="${escapeHtml(content.footer?.tagline || '')}" placeholder="Breeding quality puppies with love and care.">
                        </div>
                        <div class="form-group">
                            <label>Copyright Text</label>
                            <input type="text" id="footerCopyright" value="${escapeHtml(content.footer?.copyright || '')}" placeholder="© 2024 SACC Doodles. All rights reserved.">
                        </div>
                        <button class="btn btn-primary" onclick="saveSiteSettings('footer')">Save Footer</button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Initialize site settings tabs
function initSiteSettingsTabs() {
    const tabs = document.querySelectorAll('#siteSettingsTabs .tab-btn');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active from all tabs and panes
            tabs.forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));

            // Add active to clicked tab and corresponding pane
            tab.classList.add('active');
            const pane = document.getElementById('tab-' + tab.dataset.tab);
            if (pane) pane.classList.add('active');

            // Initialize photo drop zones for the active tab
            setTimeout(() => {
                if (tab.dataset.tab === 'homepage') {
                    initPhotoDropZone('heroImage');
                } else if (tab.dataset.tab === 'about') {
                    initPhotoDropZone('breederPhoto');
                    initPhotoDropZone('philosophyPhoto');
                }
            }, 100);
        });
    });
}

// Save site settings section
async function saveSiteSettings(section) {
    const content = DB.siteContent.get();

    switch (section) {
        case 'business':
            content.business = {
                name: document.getElementById('businessName')?.value.trim() || '',
                tagline: document.getElementById('businessTagline')?.value.trim() || '',
                phone: document.getElementById('businessPhone')?.value.trim() || '',
                email: document.getElementById('businessEmail')?.value.trim() || '',
                location: document.getElementById('businessLocation')?.value.trim() || '',
                instagram: document.getElementById('businessInstagram')?.value.trim() || '',
                tiktok: document.getElementById('businessTiktok')?.value.trim() || '',
                facebook: document.getElementById('businessFacebook')?.value.trim() || ''
            };
            break;

        case 'homepage':
            content.homepage = {
                heroTitle: document.getElementById('heroTitle')?.value.trim() || '',
                heroSubtitle: document.getElementById('heroSubtitle')?.value.trim() || '',
                heroImage: getPhotoFromGrid('heroImage') || '',
                dogsSection: {
                    title: document.getElementById('dogsSectionTitle')?.value.trim() || '',
                    subtitle: document.getElementById('dogsSectionSubtitle')?.value.trim() || ''
                },
                puppiesSection: {
                    title: document.getElementById('puppiesSectionTitle')?.value.trim() || '',
                    subtitle: document.getElementById('puppiesSectionSubtitle')?.value.trim() || ''
                },
                guardianSection: {
                    title: document.getElementById('guardianSectionTitle')?.value.trim() || '',
                    subtitle: document.getElementById('guardianSectionSubtitle')?.value.trim() || ''
                },
                testimonialsSection: {
                    title: document.getElementById('testimonialsSectionTitle')?.value.trim() || '',
                    subtitle: document.getElementById('testimonialsSectionSubtitle')?.value.trim() || ''
                }
            };
            break;

        case 'about':
            content.about = {
                breederName: document.getElementById('breederName')?.value.trim() || '',
                breederPhoto: getPhotoFromGrid('breederPhoto') || '',
                shortBio: document.getElementById('shortBio')?.value.trim() || '',
                shortBio2: document.getElementById('shortBio2')?.value.trim() || '',
                fullBio: document.getElementById('fullBio')?.value.trim() || '',
                fullBio2: document.getElementById('fullBio2')?.value.trim() || '',
                fullBio3: document.getElementById('fullBio3')?.value.trim() || '',
                philosophyPhoto: getPhotoFromGrid('philosophyPhoto') || '',
                philosophy1: document.getElementById('philosophy1')?.value.trim() || '',
                philosophy2: document.getElementById('philosophy2')?.value.trim() || '',
                philosophy3: document.getElementById('philosophy3')?.value.trim() || ''
            };
            break;

        case 'saccMeaning':
            content.saccMeaning = {
                s: { letter: 'S', word: document.getElementById('saccSWord')?.value.trim() || '', description: document.getElementById('saccSDesc')?.value.trim() || '' },
                a: { letter: 'A', word: document.getElementById('saccAWord')?.value.trim() || '', description: document.getElementById('saccADesc')?.value.trim() || '' },
                c1: { letter: 'C', word: document.getElementById('saccC1Word')?.value.trim() || '', description: document.getElementById('saccC1Desc')?.value.trim() || '' },
                c2: { letter: 'C', word: document.getElementById('saccC2Word')?.value.trim() || '', description: document.getElementById('saccC2Desc')?.value.trim() || '' }
            };
            break;

        case 'values':
            content.values = {
                value1: { title: document.getElementById('value1Title')?.value.trim() || '', description: document.getElementById('value1Desc')?.value.trim() || '' },
                value2: { title: document.getElementById('value2Title')?.value.trim() || '', description: document.getElementById('value2Desc')?.value.trim() || '' },
                value3: { title: document.getElementById('value3Title')?.value.trim() || '', description: document.getElementById('value3Desc')?.value.trim() || '' }
            };
            break;

        case 'guardian':
            const benefitsText = document.getElementById('guardianBenefits')?.value || '';
            const requirementsText = document.getElementById('guardianRequirements')?.value || '';
            content.guardian = {
                pageTitle: document.getElementById('guardianPageTitle')?.value.trim() || '',
                pageSubtitle: document.getElementById('guardianPageSubtitle')?.value.trim() || '',
                introTitle: document.getElementById('guardianIntroTitle')?.value.trim() || '',
                introText: document.getElementById('guardianIntroText')?.value.trim() || '',
                benefits: benefitsText.split('\n').map(b => b.trim()).filter(b => b),
                requirements: requirementsText.split('\n').map(r => r.trim()).filter(r => r)
            };
            break;

        case 'contact':
            content.contact = {
                pageTitle: document.getElementById('contactPageTitle')?.value.trim() || '',
                pageSubtitle: document.getElementById('contactPageSubtitle')?.value.trim() || '',
                formIntro: document.getElementById('contactFormIntro')?.value.trim() || ''
            };
            break;

        case 'footer':
            content.footer = {
                tagline: document.getElementById('footerTagline')?.value.trim() || '',
                copyright: document.getElementById('footerCopyright')?.value.trim() || ''
            };
            break;
    }

    await DB.siteContent.save(content);
    showToast('Settings saved successfully!', 'success');
}

// ============================================
// REPORTS
// ============================================
function renderReportsPage() {
    const expenses = DB.expenses.getAll();
    const puppies = DB.puppies.getAll();
    const dogs = DB.dogs.getAll();
    const customers = DB.customers.getAll();
    const litters = DB.litters.getAll();
    const waitlist = DB.waitlist.getAll();

    // Calculate financial stats
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();

    const yearExpenses = expenses.filter(e => new Date(e.date).getFullYear() === currentYear);
    const monthExpenses = expenses.filter(e => {
        const d = new Date(e.date);
        return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
    });

    const totalYearExpenses = yearExpenses.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
    const totalMonthExpenses = monthExpenses.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);

    // Expenses by category
    const expensesByCategory = {};
    yearExpenses.forEach(e => {
        const cat = e.category || 'Uncategorized';
        expensesByCategory[cat] = (expensesByCategory[cat] || 0) + (parseFloat(e.amount) || 0);
    });

    // Puppy stats
    const soldPuppies = puppies.filter(p => p.status === 'sold' || p.status === 'adopted');
    const availablePuppies = puppies.filter(p => p.status === 'available');
    const reservedPuppies = puppies.filter(p => p.status === 'reserved');

    // Calculate revenue from sold puppies
    const totalRevenue = soldPuppies.reduce((sum, p) => {
        if (p.purchase && p.purchase.price) {
            return sum + (parseFloat(p.purchase.price) || 0);
        }
        return sum;
    }, 0);

    // Waitlist stats
    const activeWaitlist = waitlist.filter(w => w.status === 'active' || w.status === 'pending');
    const depositsCollected = activeWaitlist.reduce((sum, w) => sum + (parseFloat(w.depositAmount) || 0), 0);

    // Monthly expense breakdown for chart data
    const monthlyExpenses = {};
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    months.forEach((m, i) => {
        const monthData = yearExpenses.filter(e => new Date(e.date).getMonth() === i);
        monthlyExpenses[m] = monthData.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
    });

    const maxMonthlyExpense = Math.max(...Object.values(monthlyExpenses), 1);

    return `
        <div class="admin-header">
            <div>
                <h1>Reports</h1>
                <p class="admin-subtitle">Financial summaries and business analytics</p>
            </div>
            <div class="header-actions">
                <button class="btn btn-outline" onclick="printReport()">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="6 9 6 2 18 2 18 9"/>
                        <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
                        <rect x="6" y="14" width="12" height="8"/>
                    </svg>
                    Print Report
                </button>
                <button class="btn btn-primary" onclick="exportReportCSV()">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                        <polyline points="7 10 12 15 17 10"/>
                        <line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                    Export CSV
                </button>
            </div>
        </div>

        <!-- Quick Stats -->
        <div class="stats-grid" style="margin-bottom: 2rem;">
            <div class="stat-card">
                <div class="stat-icon" style="background: var(--success-bg);">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--success-color)" stroke-width="2">
                        <line x1="12" y1="1" x2="12" y2="23"/>
                        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                    </svg>
                </div>
                <div class="stat-content">
                    <span class="stat-value">$${totalRevenue.toLocaleString()}</span>
                    <span class="stat-label">Total Revenue</span>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon" style="background: var(--danger-bg);">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--danger-color)" stroke-width="2">
                        <line x1="12" y1="1" x2="12" y2="23"/>
                        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                    </svg>
                </div>
                <div class="stat-content">
                    <span class="stat-value">$${totalYearExpenses.toLocaleString()}</span>
                    <span class="stat-label">${currentYear} Expenses</span>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon" style="background: var(--accent-gold-bg);">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent-gold)" stroke-width="2">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                </div>
                <div class="stat-content">
                    <span class="stat-value">${soldPuppies.length}</span>
                    <span class="stat-label">Puppies Sold</span>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon" style="background: var(--info-bg);">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--info-color)" stroke-width="2">
                        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
                        <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
                    </svg>
                </div>
                <div class="stat-content">
                    <span class="stat-value">$${depositsCollected.toLocaleString()}</span>
                    <span class="stat-label">Deposits Held</span>
                </div>
            </div>
        </div>

        <div class="reports-grid">
            <!-- Monthly Expense Chart -->
            <div class="admin-card report-card">
                <div class="admin-card-header">
                    <h2>${currentYear} Monthly Expenses</h2>
                </div>
                <div class="admin-card-body">
                    <div class="bar-chart">
                        ${months.map(m => `
                            <div class="bar-item">
                                <div class="bar-container">
                                    <div class="bar" style="height: ${(monthlyExpenses[m] / maxMonthlyExpense * 100)}%;" title="$${monthlyExpenses[m].toLocaleString()}"></div>
                                </div>
                                <span class="bar-label">${m}</span>
                            </div>
                        `).join('')}
                    </div>
                    <p style="text-align: center; margin-top: 1rem; color: var(--text-muted); font-size: 0.9rem;">
                        This Month: <strong style="color: var(--text-primary);">$${totalMonthExpenses.toLocaleString()}</strong>
                    </p>
                </div>
            </div>

            <!-- Expenses by Category -->
            <div class="admin-card report-card">
                <div class="admin-card-header">
                    <h2>Expenses by Category</h2>
                </div>
                <div class="admin-card-body">
                    ${Object.keys(expensesByCategory).length === 0 ? `
                        <p style="color: var(--text-muted); text-align: center;">No expenses recorded this year</p>
                    ` : `
                        <div class="category-breakdown">
                            ${Object.entries(expensesByCategory)
                                .sort((a, b) => b[1] - a[1])
                                .map(([cat, amount]) => `
                                    <div class="category-item">
                                        <div class="category-info">
                                            <span class="category-name">${escapeHtml(cat)}</span>
                                            <span class="category-amount">$${amount.toLocaleString()}</span>
                                        </div>
                                        <div class="category-bar">
                                            <div class="category-fill" style="width: ${(amount / totalYearExpenses * 100)}%;"></div>
                                        </div>
                                        <span class="category-percent">${((amount / totalYearExpenses) * 100).toFixed(1)}%</span>
                                    </div>
                                `).join('')}
                        </div>
                    `}
                </div>
            </div>

            <!-- Puppy Statistics -->
            <div class="admin-card report-card">
                <div class="admin-card-header">
                    <h2>Puppy Statistics</h2>
                </div>
                <div class="admin-card-body">
                    <div class="puppy-stats-grid">
                        <div class="puppy-stat">
                            <span class="puppy-stat-value">${puppies.length}</span>
                            <span class="puppy-stat-label">Total Puppies</span>
                        </div>
                        <div class="puppy-stat">
                            <span class="puppy-stat-value" style="color: var(--success-color);">${availablePuppies.length}</span>
                            <span class="puppy-stat-label">Available</span>
                        </div>
                        <div class="puppy-stat">
                            <span class="puppy-stat-value" style="color: var(--warning-color);">${reservedPuppies.length}</span>
                            <span class="puppy-stat-label">Reserved</span>
                        </div>
                        <div class="puppy-stat">
                            <span class="puppy-stat-value" style="color: var(--accent-gold);">${soldPuppies.length}</span>
                            <span class="puppy-stat-label">Sold</span>
                        </div>
                    </div>
                    ${soldPuppies.length > 0 ? `
                        <div style="margin-top: 1.5rem; padding-top: 1rem; border-top: 1px solid var(--border-color);">
                            <p style="color: var(--text-muted); font-size: 0.9rem;">Average Sale Price</p>
                            <p style="font-size: 1.5rem; font-weight: 600; color: var(--accent-gold);">$${(totalRevenue / soldPuppies.length).toLocaleString(undefined, {maximumFractionDigits: 0})}</p>
                        </div>
                    ` : ''}
                </div>
            </div>

            <!-- Breeding Program -->
            <div class="admin-card report-card">
                <div class="admin-card-header">
                    <h2>Breeding Program</h2>
                </div>
                <div class="admin-card-body">
                    <div class="breeding-stats">
                        <div class="breeding-stat-row">
                            <span class="breeding-stat-label">Active Breeding Dogs</span>
                            <span class="breeding-stat-value">${dogs.filter(d => d.status === 'active').length}</span>
                        </div>
                        <div class="breeding-stat-row">
                            <span class="breeding-stat-label">Total Litters</span>
                            <span class="breeding-stat-value">${litters.length}</span>
                        </div>
                        <div class="breeding-stat-row">
                            <span class="breeding-stat-label">Guardian Homes</span>
                            <span class="breeding-stat-value">${customers.filter(c => c.isGuardian).length}</span>
                        </div>
                        <div class="breeding-stat-row">
                            <span class="breeding-stat-label">Total Customers</span>
                            <span class="breeding-stat-value">${customers.length}</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Waitlist Summary -->
            <div class="admin-card report-card">
                <div class="admin-card-header">
                    <h2>Waitlist Summary</h2>
                </div>
                <div class="admin-card-body">
                    <div class="waitlist-stats">
                        <div class="waitlist-stat-row">
                            <span>Active Applications</span>
                            <span class="stat-badge">${activeWaitlist.length}</span>
                        </div>
                        <div class="waitlist-stat-row">
                            <span>Deposits Collected</span>
                            <span class="stat-badge">$${depositsCollected.toLocaleString()}</span>
                        </div>
                        <div class="waitlist-stat-row">
                            <span>Matched to Puppy</span>
                            <span class="stat-badge">${waitlist.filter(w => w.status === 'matched').length}</span>
                        </div>
                        <div class="waitlist-stat-row">
                            <span>Completed</span>
                            <span class="stat-badge">${waitlist.filter(w => w.status === 'completed').length}</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Profit/Loss Summary -->
            <div class="admin-card report-card">
                <div class="admin-card-header">
                    <h2>Profit / Loss</h2>
                </div>
                <div class="admin-card-body">
                    <div class="profit-summary">
                        <div class="profit-row">
                            <span>Total Revenue</span>
                            <span class="profit-positive">+$${totalRevenue.toLocaleString()}</span>
                        </div>
                        <div class="profit-row">
                            <span>${currentYear} Expenses</span>
                            <span class="profit-negative">-$${totalYearExpenses.toLocaleString()}</span>
                        </div>
                        <div class="profit-row profit-total">
                            <span>Net Profit/Loss</span>
                            <span class="${totalRevenue - totalYearExpenses >= 0 ? 'profit-positive' : 'profit-negative'}">${totalRevenue - totalYearExpenses >= 0 ? '+' : '-'}$${Math.abs(totalRevenue - totalYearExpenses).toLocaleString()}</span>
                        </div>
                    </div>
                    <p style="margin-top: 1rem; font-size: 0.85rem; color: var(--text-muted);">
                        Note: Revenue includes all recorded puppy sales. Deposits held are not counted as revenue until sale is complete.
                    </p>
                </div>
            </div>
        </div>
    `;
}

function printReport() {
    window.print();
}

function exportReportCSV() {
    const expenses = DB.expenses.getAll();
    const puppies = DB.puppies.getAll();

    // Create expense CSV
    let csv = 'SACC Doodles Report\\n\\n';
    csv += 'EXPENSES\\n';
    csv += 'Date,Category,Description,Amount,Vendor\\n';

    expenses.forEach(e => {
        csv += `"${e.date || ''}","${e.category || ''}","${(e.description || '').replace(/"/g, '""')}","${e.amount || 0}","${(e.vendor || '').replace(/"/g, '""')}"\\n`;
    });

    csv += '\\nPUPPY SALES\\n';
    csv += 'Puppy Name,Status,Sale Date,Price,Customer\\n';

    puppies.filter(p => p.status === 'sold' || p.status === 'adopted').forEach(p => {
        const customer = p.purchase?.customerId ? DB.customers.getById(p.purchase.customerId) : null;
        csv += `"${(p.name || '').replace(/"/g, '""')}","${p.status}","${p.purchase?.purchaseDate || ''}","${p.purchase?.price || 0}","${(customer?.name || '').replace(/"/g, '""')}"\\n`;
    });

    // Download
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `sacc-doodles-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);

    showToast('Report exported successfully', 'success');
}

// ============================================
// DOCUMENTS
// ============================================
function renderDocumentsPage() {
    const settings = DB.settings.get();
    const customers = DB.customers.getAll();
    const puppies = DB.puppies.getAll();
    const waitlist = DB.waitlist.getAll();

    return `
        <div class="admin-header">
            <div>
                <h1>Documents</h1>
                <p class="admin-subtitle">Generate contracts and agreements</p>
            </div>
        </div>

        <div class="documents-grid">
            <!-- Puppy Sales Contract -->
            <div class="admin-card document-card">
                <div class="admin-card-header">
                    <h2>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                            <polyline points="14 2 14 8 20 8"/>
                        </svg>
                        Puppy Sales Contract
                    </h2>
                </div>
                <div class="admin-card-body">
                    <p class="document-description">Generate a sales contract for a puppy purchase. Includes health guarantee, spay/neuter agreement, and terms of sale.</p>

                    <div class="form-group">
                        <label>Select Customer</label>
                        <select id="contractCustomer">
                            <option value="">Choose a customer...</option>
                            ${customers.map(c => `<option value="${c.id}">${escapeHtml(c.name)}</option>`).join('')}
                        </select>
                    </div>

                    <div class="form-group">
                        <label>Select Puppy</label>
                        <select id="contractPuppy">
                            <option value="">Choose a puppy...</option>
                            ${puppies.filter(p => p.status === 'available' || p.status === 'reserved' || p.status === 'sold' || p.status === 'adopted' || p.status === 'guardian').map(p => `<option value="${p.id}">${escapeHtml(p.name || 'Unnamed')} - ${p.gender || ''} ${p.color || ''}</option>`).join('')}
                        </select>
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label>Sale Price</label>
                            <input type="number" id="contractPrice" placeholder="0.00" step="0.01">
                        </div>
                        <div class="form-group">
                            <label>Contract Date</label>
                            <input type="date" id="contractDate" value="${new Date().toISOString().split('T')[0]}">
                        </div>
                    </div>

                    <button class="btn btn-primary" onclick="generateSalesContract()">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                            <polyline points="14 2 14 8 20 8"/>
                        </svg>
                        Generate Contract
                    </button>
                </div>
            </div>

            <!-- Waitlist Agreement -->
            <div class="admin-card document-card">
                <div class="admin-card-header">
                    <h2>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
                            <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
                        </svg>
                        Waitlist Agreement
                    </h2>
                </div>
                <div class="admin-card-body">
                    <p class="document-description">Generate a waitlist agreement including deposit terms, puppy selection process, and refund policy.</p>

                    <div class="form-group">
                        <label>Select Waitlist Entry</label>
                        <select id="waitlistEntry">
                            <option value="">Choose an applicant...</option>
                            ${waitlist.filter(w => w.status === 'active' || w.status === 'pending').map(w => `<option value="${w.id}">${escapeHtml(w.name)} - ${w.preferredGender || 'Any'} ${w.preferredColor || ''}</option>`).join('')}
                        </select>
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label>Deposit Amount</label>
                            <input type="number" id="waitlistDeposit" value="300" step="0.01">
                        </div>
                        <div class="form-group">
                            <label>Agreement Date</label>
                            <input type="date" id="waitlistDate" value="${new Date().toISOString().split('T')[0]}">
                        </div>
                    </div>

                    <button class="btn btn-primary" onclick="generateWaitlistAgreement()">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                            <polyline points="14 2 14 8 20 8"/>
                        </svg>
                        Generate Agreement
                    </button>
                </div>
            </div>

            <!-- Guardian Home Contract -->
            <div class="admin-card document-card">
                <div class="admin-card-header">
                    <h2>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                            <polyline points="9 22 9 12 15 12 15 22"/>
                        </svg>
                        Guardian Home Contract
                    </h2>
                </div>
                <div class="admin-card-body">
                    <p class="document-description">Generate a guardian home agreement outlining responsibilities, breeding rights, and ownership terms.</p>

                    <div class="form-group">
                        <label>Select Guardian</label>
                        <select id="guardianCustomer">
                            <option value="">Choose a guardian...</option>
                            ${customers.filter(c => c.isGuardian).map(c => `<option value="${c.id}">${escapeHtml(c.name)}</option>`).join('')}
                        </select>
                    </div>

                    <div class="form-group">
                        <label>Select Dog</label>
                        <select id="guardianDog">
                            <option value="">Choose a dog...</option>
                            ${DB.dogs.getAll().map(d => `<option value="${d.id}">${escapeHtml(d.name)} - ${d.breed || ''}</option>`).join('')}
                        </select>
                    </div>

                    <div class="form-group">
                        <label>Contract Date</label>
                        <input type="date" id="guardianDate" value="${new Date().toISOString().split('T')[0]}">
                    </div>

                    <button class="btn btn-primary" onclick="generateGuardianContract()">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                            <polyline points="14 2 14 8 20 8"/>
                        </svg>
                        Generate Contract
                    </button>
                </div>
            </div>

            <!-- Puppy Health Record -->
            <div class="admin-card document-card">
                <div class="admin-card-header">
                    <h2>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                        </svg>
                        Puppy Health Record
                    </h2>
                </div>
                <div class="admin-card-body">
                    <p class="document-description">Generate a health record summary including vaccinations, deworming, and vet visits for a puppy.</p>

                    <div class="form-group">
                        <label>Select Puppy</label>
                        <select id="healthRecordPuppy">
                            <option value="">Choose a puppy...</option>
                            ${puppies.map(p => `<option value="${p.id}">${escapeHtml(p.name || 'Unnamed')} - ${p.gender || ''} ${p.color || ''}</option>`).join('')}
                        </select>
                    </div>

                    <button class="btn btn-primary" onclick="generateHealthRecord()">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                            <polyline points="14 2 14 8 20 8"/>
                        </svg>
                        Generate Health Record
                    </button>
                </div>
            </div>
        </div>
    `;
}

function generateSalesContract() {
    const customerId = document.getElementById('contractCustomer').value;
    const puppyId = document.getElementById('contractPuppy').value;
    const price = document.getElementById('contractPrice').value;
    const date = document.getElementById('contractDate').value;

    if (!customerId || !puppyId) {
        showToast('Please select a customer and puppy', 'error');
        return;
    }

    const customer = DB.customers.getById(customerId);
    const puppy = DB.puppies.getById(puppyId);
    const litter = puppy.litterId ? DB.litters.getById(puppy.litterId) : null;
    const mother = litter ? DB.dogs.getById(litter.motherId) : null;
    const father = litter ? DB.dogs.getById(litter.fatherId) : null;
    const settings = DB.settings.get();

    const contractHtml = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Puppy Sales Contract - SACC Doodles</title>
            <style>
                body { font-family: 'Georgia', serif; max-width: 800px; margin: 0 auto; padding: 40px; line-height: 1.6; }
                h1 { text-align: center; color: #333; border-bottom: 2px solid #d4af37; padding-bottom: 10px; }
                h2 { color: #555; margin-top: 30px; }
                .header { text-align: center; margin-bottom: 30px; }
                .header p { color: #666; }
                .parties { background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0; }
                .puppy-info { background: #fff9e6; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #d4af37; }
                .section { margin: 25px 0; }
                .signature-line { border-bottom: 1px solid #333; width: 250px; display: inline-block; margin: 20px 0; }
                .signature-section { display: flex; justify-content: space-between; margin-top: 50px; }
                .signature-block { text-align: center; }
                .date { color: #666; font-size: 0.9em; }
                ul { margin-left: 20px; }
                li { margin: 10px 0; }
                @media print { body { padding: 20px; } }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>PUPPY SALES CONTRACT</h1>
                <p>SACC Doodles</p>
                <p>Gilbert, Arizona</p>
                <p class="date">Contract Date: ${formatDate(date)}</p>
            </div>

            <div class="parties">
                <h2>Parties</h2>
                <p><strong>Seller:</strong> SACC Doodles (Angela)</p>
                <p><strong>Buyer:</strong> ${escapeHtml(customer.name)}</p>
                ${customer.address ? `<p><strong>Address:</strong> ${escapeHtml(customer.address)}</p>` : ''}
                ${customer.phone ? `<p><strong>Phone:</strong> ${escapeHtml(customer.phone)}</p>` : ''}
                ${customer.email ? `<p><strong>Email:</strong> ${escapeHtml(customer.email)}</p>` : ''}
            </div>

            <div class="puppy-info">
                <h2>Puppy Information</h2>
                <p><strong>Name:</strong> ${escapeHtml(puppy.name || 'To be named by buyer')}</p>
                <p><strong>Gender:</strong> ${puppy.gender || 'N/A'}</p>
                <p><strong>Color:</strong> ${puppy.color || 'N/A'}</p>
                <p><strong>Date of Birth:</strong> ${puppy.dateOfBirth ? formatDate(puppy.dateOfBirth) : 'N/A'}</p>
                ${mother ? `<p><strong>Dam (Mother):</strong> ${escapeHtml(mother.name)}</p>` : ''}
                ${father ? `<p><strong>Sire (Father):</strong> ${escapeHtml(father.name)}</p>` : ''}
                <p><strong>Purchase Price:</strong> $${parseFloat(price || 0).toLocaleString()}</p>
            </div>

            <div class="section">
                <h2>1. Health Guarantee</h2>
                <p>The Seller guarantees that the puppy is in good health at the time of sale and has received age-appropriate vaccinations and deworming. The Seller provides a <strong>two (2) year genetic health guarantee</strong> against life-threatening genetic defects.</p>
                <ul>
                    <li>The Buyer agrees to have the puppy examined by a licensed veterinarian within 72 hours of pickup.</li>
                    <li>If the puppy is found to have a serious health issue, the Buyer must notify the Seller immediately with veterinary documentation.</li>
                    <li>The genetic health guarantee covers hip dysplasia, heart defects, and other hereditary conditions that significantly impact quality of life.</li>
                </ul>
            </div>

            <div class="section">
                <h2>2. Spay/Neuter Agreement</h2>
                <p>This puppy is sold as a <strong>pet only</strong> and must be spayed or neutered by <strong>12 months of age</strong> unless otherwise agreed upon in writing. Proof of spay/neuter must be provided to the Seller.</p>
            </div>

            <div class="section">
                <h2>3. Care Requirements</h2>
                <p>The Buyer agrees to:</p>
                <ul>
                    <li>Provide proper nutrition, shelter, and veterinary care</li>
                    <li>Keep the puppy as an indoor family pet</li>
                    <li>Never surrender the puppy to a shelter - contact the Seller first if rehoming is necessary</li>
                    <li>Follow recommended vaccination and health check schedules</li>
                </ul>
            </div>

            <div class="section">
                <h2>4. Return Policy</h2>
                <p>If for any reason the Buyer cannot keep the puppy, the Seller must be contacted first. SACC Doodles reserves the right of first refusal to take back any puppy/dog at any time.</p>
            </div>

            <div class="section">
                <h2>5. Limitation of Liability</h2>
                <p>The Seller's liability is limited to the purchase price of the puppy. The Seller is not responsible for veterinary bills, training costs, or any other expenses incurred by the Buyer.</p>
            </div>

            <div class="signature-section">
                <div class="signature-block">
                    <div class="signature-line"></div>
                    <p>Seller Signature</p>
                    <p>SACC Doodles</p>
                    <p class="date">Date: ____________</p>
                </div>
                <div class="signature-block">
                    <div class="signature-line"></div>
                    <p>Buyer Signature</p>
                    <p>${escapeHtml(customer.name)}</p>
                    <p class="date">Date: ____________</p>
                </div>
            </div>
        </body>
        </html>
    `;

    openDocumentWindow(contractHtml, 'Puppy Sales Contract');
}

function generateWaitlistAgreement() {
    const waitlistId = document.getElementById('waitlistEntry').value;
    const deposit = document.getElementById('waitlistDeposit').value;
    const date = document.getElementById('waitlistDate').value;

    if (!waitlistId) {
        showToast('Please select a waitlist entry', 'error');
        return;
    }

    const entry = DB.waitlist.getById(waitlistId);

    const agreementHtml = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Waitlist Agreement - SACC Doodles</title>
            <style>
                body { font-family: 'Georgia', serif; max-width: 800px; margin: 0 auto; padding: 40px; line-height: 1.6; }
                h1 { text-align: center; color: #333; border-bottom: 2px solid #d4af37; padding-bottom: 10px; }
                h2 { color: #555; margin-top: 30px; }
                .header { text-align: center; margin-bottom: 30px; }
                .header p { color: #666; }
                .info-box { background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0; }
                .highlight { background: #fff9e6; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #d4af37; }
                .section { margin: 25px 0; }
                .signature-line { border-bottom: 1px solid #333; width: 250px; display: inline-block; margin: 20px 0; }
                .signature-section { display: flex; justify-content: space-between; margin-top: 50px; }
                .signature-block { text-align: center; }
                .date { color: #666; font-size: 0.9em; }
                ul { margin-left: 20px; }
                li { margin: 10px 0; }
                @media print { body { padding: 20px; } }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>WAITLIST AGREEMENT</h1>
                <p>SACC Doodles</p>
                <p>Gilbert, Arizona</p>
                <p class="date">Agreement Date: ${formatDate(date)}</p>
            </div>

            <div class="info-box">
                <h2>Applicant Information</h2>
                <p><strong>Name:</strong> ${escapeHtml(entry.name)}</p>
                ${entry.email ? `<p><strong>Email:</strong> ${escapeHtml(entry.email)}</p>` : ''}
                ${entry.phone ? `<p><strong>Phone:</strong> ${escapeHtml(entry.phone)}</p>` : ''}
            </div>

            <div class="highlight">
                <h2>Puppy Preferences</h2>
                <p><strong>Preferred Gender:</strong> ${entry.preferredGender || 'No Preference'}</p>
                <p><strong>Preferred Color:</strong> ${entry.preferredColor || 'No Preference'}</p>
                <p><strong>Deposit Amount:</strong> $${parseFloat(deposit || 300).toLocaleString()}</p>
            </div>

            <div class="section">
                <h2>1. Deposit Terms</h2>
                <ul>
                    <li>A non-refundable deposit of <strong>$${parseFloat(deposit || 300).toLocaleString()}</strong> is required to secure a place on the waitlist.</li>
                    <li>The deposit will be applied toward the total purchase price of the puppy.</li>
                    <li>Deposits are non-refundable but may be transferred to a future litter if circumstances require.</li>
                </ul>
            </div>

            <div class="section">
                <h2>2. Selection Process</h2>
                <ul>
                    <li>Puppies are selected in order of waitlist position.</li>
                    <li>The Applicant will be notified when puppies are available and given a reasonable timeframe to make a selection.</li>
                    <li>If the Applicant passes on available puppies, their deposit may be applied to a future litter.</li>
                    <li>SACC Doodles reserves the right to retain any puppy for breeding purposes.</li>
                </ul>
            </div>

            <div class="section">
                <h2>3. Communication</h2>
                <ul>
                    <li>The Applicant agrees to respond to communications within 48 hours during puppy selection periods.</li>
                    <li>Failure to respond may result in forfeiting selection priority.</li>
                </ul>
            </div>

            <div class="section">
                <h2>4. Final Purchase</h2>
                <p>Upon selection of a puppy, a separate Sales Contract will be executed. The remaining balance will be due at the time of puppy pickup (typically 8 weeks of age).</p>
            </div>

            <div class="signature-section">
                <div class="signature-block">
                    <div class="signature-line"></div>
                    <p>Breeder Signature</p>
                    <p>SACC Doodles</p>
                    <p class="date">Date: ____________</p>
                </div>
                <div class="signature-block">
                    <div class="signature-line"></div>
                    <p>Applicant Signature</p>
                    <p>${escapeHtml(entry.name)}</p>
                    <p class="date">Date: ____________</p>
                </div>
            </div>
        </body>
        </html>
    `;

    openDocumentWindow(agreementHtml, 'Waitlist Agreement');
}

function generateGuardianContract() {
    const customerId = document.getElementById('guardianCustomer').value;
    const dogId = document.getElementById('guardianDog').value;
    const date = document.getElementById('guardianDate').value;

    if (!customerId || !dogId) {
        showToast('Please select a guardian and dog', 'error');
        return;
    }

    const customer = DB.customers.getById(customerId);
    const dog = DB.dogs.getById(dogId);

    const contractHtml = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Guardian Home Contract - SACC Doodles</title>
            <style>
                body { font-family: 'Georgia', serif; max-width: 800px; margin: 0 auto; padding: 40px; line-height: 1.6; }
                h1 { text-align: center; color: #333; border-bottom: 2px solid #d4af37; padding-bottom: 10px; }
                h2 { color: #555; margin-top: 30px; }
                .header { text-align: center; margin-bottom: 30px; }
                .header p { color: #666; }
                .info-box { background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0; }
                .highlight { background: #fff9e6; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #d4af37; }
                .section { margin: 25px 0; }
                .signature-line { border-bottom: 1px solid #333; width: 250px; display: inline-block; margin: 20px 0; }
                .signature-section { display: flex; justify-content: space-between; margin-top: 50px; }
                .signature-block { text-align: center; }
                .date { color: #666; font-size: 0.9em; }
                ul { margin-left: 20px; }
                li { margin: 10px 0; }
                @media print { body { padding: 20px; } }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>GUARDIAN HOME CONTRACT</h1>
                <p>SACC Doodles</p>
                <p>Gilbert, Arizona</p>
                <p class="date">Contract Date: ${formatDate(date)}</p>
            </div>

            <div class="info-box">
                <h2>Guardian Information</h2>
                <p><strong>Name:</strong> ${escapeHtml(customer.name)}</p>
                ${customer.address ? `<p><strong>Address:</strong> ${escapeHtml(customer.address)}</p>` : ''}
                ${customer.phone ? `<p><strong>Phone:</strong> ${escapeHtml(customer.phone)}</p>` : ''}
                ${customer.email ? `<p><strong>Email:</strong> ${escapeHtml(customer.email)}</p>` : ''}
            </div>

            <div class="highlight">
                <h2>Dog Information</h2>
                <p><strong>Name:</strong> ${escapeHtml(dog.name)}</p>
                <p><strong>Gender:</strong> ${dog.gender || 'N/A'}</p>
                <p><strong>Breed:</strong> ${dog.breed || 'N/A'}</p>
                <p><strong>Date of Birth:</strong> ${dog.dateOfBirth ? formatDate(dog.dateOfBirth) : 'N/A'}</p>
                <p><strong>Color:</strong> ${dog.color || 'N/A'}</p>
            </div>

            <div class="section">
                <h2>1. Purpose of Guardian Home Program</h2>
                <p>SACC Doodles places select breeding dogs in loving guardian homes to ensure our dogs live as cherished family pets while participating in our breeding program. This arrangement benefits both the dog (by living in a home environment) and the breeding program.</p>
            </div>

            <div class="section">
                <h2>2. Guardian Responsibilities</h2>
                <ul>
                    <li>Provide a loving, indoor home environment for the dog</li>
                    <li>Maintain the dog's health with proper nutrition, exercise, and veterinary care</li>
                    <li>Keep the dog at a healthy weight appropriate for breeding</li>
                    <li>Bring the dog to SACC Doodles for breeding, health testing, and whelping as requested</li>
                    <li>Not breed the dog independently or allow unauthorized breeding</li>
                    <li>Allow SACC Doodles to conduct periodic home visits</li>
                    <li>Maintain communication with SACC Doodles regarding the dog's health and well-being</li>
                </ul>
            </div>

            <div class="section">
                <h2>3. Breeder Responsibilities</h2>
                <ul>
                    <li>Cover all breeding-related veterinary expenses</li>
                    <li>Provide initial vaccinations, microchipping, and health testing</li>
                    <li>Cover costs for health testing required for breeding</li>
                    <li>Provide guidance on care, training, and nutrition</li>
                </ul>
            </div>

            <div class="section">
                <h2>4. Breeding Terms</h2>
                <ul>
                    <li><strong>Females:</strong> Will have a maximum of ${dog.gender === 'Female' ? '3-4' : 'N/A'} litters before being spayed</li>
                    <li><strong>Males:</strong> May be used for breeding as needed while maintaining the dog's health and well-being</li>
                    <li>After breeding retirement, the dog will be spayed/neutered and full ownership transfers to the Guardian</li>
                </ul>
            </div>

            <div class="section">
                <h2>5. Ownership</h2>
                <p>SACC Doodles retains ownership of the dog during the breeding period. Upon completion of the breeding program and spay/neuter, full ownership and registration will be transferred to the Guardian at no additional cost.</p>
            </div>

            <div class="section">
                <h2>6. Termination</h2>
                <p>Either party may terminate this agreement with 30 days written notice. If the Guardian terminates, the dog must be returned to SACC Doodles. SACC Doodles may terminate if care standards are not met.</p>
            </div>

            <div class="signature-section">
                <div class="signature-block">
                    <div class="signature-line"></div>
                    <p>Breeder Signature</p>
                    <p>SACC Doodles</p>
                    <p class="date">Date: ____________</p>
                </div>
                <div class="signature-block">
                    <div class="signature-line"></div>
                    <p>Guardian Signature</p>
                    <p>${escapeHtml(customer.name)}</p>
                    <p class="date">Date: ____________</p>
                </div>
            </div>
        </body>
        </html>
    `;

    openDocumentWindow(contractHtml, 'Guardian Home Contract');
}

function generateHealthRecord() {
    const puppyId = document.getElementById('healthRecordPuppy').value;

    if (!puppyId) {
        showToast('Please select a puppy', 'error');
        return;
    }

    const puppy = DB.puppies.getById(puppyId);
    const litter = puppy.litterId ? DB.litters.getById(puppy.litterId) : null;
    const mother = litter ? DB.dogs.getById(litter.motherId) : null;
    const father = litter ? DB.dogs.getById(litter.fatherId) : null;
    const vetRecords = DB.vetRecords.getByAnimal(puppyId, 'puppy');

    const recordHtml = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Puppy Health Record - SACC Doodles</title>
            <style>
                body { font-family: 'Georgia', serif; max-width: 800px; margin: 0 auto; padding: 40px; line-height: 1.6; }
                h1 { text-align: center; color: #333; border-bottom: 2px solid #d4af37; padding-bottom: 10px; }
                h2 { color: #555; margin-top: 30px; border-bottom: 1px solid #ddd; padding-bottom: 5px; }
                .header { text-align: center; margin-bottom: 30px; }
                .header p { color: #666; }
                .puppy-info { background: #fff9e6; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #d4af37; }
                .record-table { width: 100%; border-collapse: collapse; margin: 15px 0; }
                .record-table th, .record-table td { border: 1px solid #ddd; padding: 10px; text-align: left; }
                .record-table th { background: #f5f5f5; }
                .record-table tr:nth-child(even) { background: #fafafa; }
                .no-records { color: #888; font-style: italic; padding: 20px; text-align: center; }
                .date { color: #666; font-size: 0.9em; }
                @media print { body { padding: 20px; } }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>PUPPY HEALTH RECORD</h1>
                <p>SACC Doodles</p>
                <p>Gilbert, Arizona</p>
                <p class="date">Generated: ${formatDate(new Date().toISOString())}</p>
            </div>

            <div class="puppy-info">
                <h2 style="margin-top: 0; border: none;">Puppy Information</h2>
                <p><strong>Name:</strong> ${escapeHtml(puppy.name || 'Unnamed')}</p>
                <p><strong>Gender:</strong> ${puppy.gender || 'N/A'}</p>
                <p><strong>Color:</strong> ${puppy.color || 'N/A'}</p>
                <p><strong>Date of Birth:</strong> ${puppy.dateOfBirth ? formatDate(puppy.dateOfBirth) : 'N/A'}</p>
                ${mother ? `<p><strong>Dam (Mother):</strong> ${escapeHtml(mother.name)}</p>` : ''}
                ${father ? `<p><strong>Sire (Father):</strong> ${escapeHtml(father.name)}</p>` : ''}
                ${puppy.microchipNumber ? `<p><strong>Microchip:</strong> ${escapeHtml(puppy.microchipNumber)}</p>` : ''}
            </div>

            <h2>Vaccination Record</h2>
            ${vetRecords.filter(r => r.type === 'vaccination' || r.type === 'rabies').length > 0 ? `
                <table class="record-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Vaccine</th>
                            <th>Notes</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${vetRecords.filter(r => r.type === 'vaccination' || r.type === 'rabies').map(r => `
                            <tr>
                                <td>${r.date ? formatDate(r.date) : 'N/A'}</td>
                                <td>${escapeHtml(r.description || r.type)}</td>
                                <td>${escapeHtml(r.notes || '-')}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            ` : '<p class="no-records">No vaccination records on file</p>'}

            <h2>Deworming Record</h2>
            ${vetRecords.filter(r => r.type === 'deworming').length > 0 ? `
                <table class="record-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Treatment</th>
                            <th>Notes</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${vetRecords.filter(r => r.type === 'deworming').map(r => `
                            <tr>
                                <td>${r.date ? formatDate(r.date) : 'N/A'}</td>
                                <td>${escapeHtml(r.description || 'Deworming')}</td>
                                <td>${escapeHtml(r.notes || '-')}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            ` : '<p class="no-records">No deworming records on file</p>'}

            <h2>Veterinary Exams</h2>
            ${vetRecords.filter(r => r.type === 'exam' || r.type === 'checkup').length > 0 ? `
                <table class="record-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Type</th>
                            <th>Veterinarian</th>
                            <th>Notes</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${vetRecords.filter(r => r.type === 'exam' || r.type === 'checkup').map(r => `
                            <tr>
                                <td>${r.date ? formatDate(r.date) : 'N/A'}</td>
                                <td>${escapeHtml(r.description || 'Exam')}</td>
                                <td>${escapeHtml(r.veterinarian || '-')}</td>
                                <td>${escapeHtml(r.notes || '-')}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            ` : '<p class="no-records">No exam records on file</p>'}

            <h2>Other Medical Records</h2>
            ${vetRecords.filter(r => !['vaccination', 'rabies', 'deworming', 'exam', 'checkup'].includes(r.type)).length > 0 ? `
                <table class="record-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Type</th>
                            <th>Description</th>
                            <th>Notes</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${vetRecords.filter(r => !['vaccination', 'rabies', 'deworming', 'exam', 'checkup'].includes(r.type)).map(r => `
                            <tr>
                                <td>${r.date ? formatDate(r.date) : 'N/A'}</td>
                                <td>${escapeHtml(r.type || 'Other')}</td>
                                <td>${escapeHtml(r.description || '-')}</td>
                                <td>${escapeHtml(r.notes || '-')}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            ` : '<p class="no-records">No additional medical records on file</p>'}
        </body>
        </html>
    `;

    openDocumentWindow(recordHtml, 'Puppy Health Record');
}

function openDocumentWindow(html, title) {
    const win = window.open('', '_blank');
    win.document.write(html);
    win.document.close();
    win.document.title = title;
    showToast('Document generated - check your new tab', 'success');
}
