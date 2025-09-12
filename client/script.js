// MovieZone Admin Panel - Static HTML Version
// Converting React functionality to vanilla JavaScript

// Global state management
const AppState = {
    isLoggedIn: false,
    currentUser: null,
    apiBaseUrl: '', // Will be set from environment or default
    movieData: null,
    countdown: 10,
    showContinueSection: false
};

// Utility functions
const utils = {
    // Security: Escape HTML to prevent XSS
    escapeHtml: (text) => {
        if (typeof text !== 'string') return text;
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    // Copy of cn function from React version
    cn: (...classes) => {
        return classes.filter(Boolean).join(' ');
    },

    // API request wrapper
    apiRequest: async (endpoint, options = {}) => {
        const url = `${AppState.apiBaseUrl}${endpoint}`;
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            }
        };

        try {
            const response = await fetch(url, { credentials: 'include', ...defaultOptions, ...options });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    },

    // Toast notification system
    showToast: (title, description, variant = 'default') => {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        
        toast.className = `toast ${variant === 'destructive' ? 'error' : variant === 'success' ? 'success' : ''}`;
        
        // Create title element safely
        const titleEl = document.createElement('div');
        titleEl.style.fontWeight = '600';
        titleEl.style.marginBottom = '0.25rem';
        titleEl.textContent = title; // Safe: uses textContent instead of innerHTML
        
        // Create description element safely  
        const descEl = document.createElement('div');
        descEl.style.fontSize = '0.875rem';
        descEl.style.color = 'hsl(var(--muted-foreground))';
        descEl.textContent = description; // Safe: uses textContent instead of innerHTML
        
        toast.appendChild(titleEl);
        toast.appendChild(descEl);
        container.appendChild(toast);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 3000);
    },

    // Format date
    formatDate: (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    },

    // Copy to clipboard
    copyToClipboard: async (text) => {
        try {
            await navigator.clipboard.writeText(text);
            utils.showToast('Copied!', 'Link copied to clipboard', 'success');
        } catch (err) {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            utils.showToast('Copied!', 'Link copied to clipboard', 'success');
        }
    },

    // Show/hide loading overlay
    showLoading: () => {
        document.getElementById('loading-overlay').classList.remove('hidden');
    },

    hideLoading: () => {
        document.getElementById('loading-overlay').classList.add('hidden');
    },

    // Skeleton loading utilities
    createSkeletonRow: (columns = 5) => {
        const tr = document.createElement('tr');
        for (let i = 0; i < columns; i++) {
            const td = document.createElement('td');
            td.className = 'p-3';
            const skeleton = document.createElement('div');
            skeleton.className = 'skeleton skeleton-text';
            td.appendChild(skeleton);
            tr.appendChild(td);
        }
        return tr;
    },

    createSkeletonCard: () => {
        const div = document.createElement('div');
        div.className = 'skeleton-card';
        
        // Title skeleton
        const titleSkeleton = document.createElement('div');
        titleSkeleton.className = 'skeleton skeleton-text large';
        div.appendChild(titleSkeleton);
        
        // Content skeletons
        for (let i = 0; i < 3; i++) {
            const contentSkeleton = document.createElement('div');
            contentSkeleton.className = 'skeleton skeleton-text';
            div.appendChild(contentSkeleton);
        }
        
        return div;
    },

    showTableSkeleton: (tableId, rows = 5, columns = 5) => {
        // First try to find element by ID directly (in case it's already a tbody)
        let tableBody = document.getElementById(tableId);
        
        // If not found or not a tbody, try looking for tbody within the element
        if (!tableBody || tableBody.tagName !== 'TBODY') {
            tableBody = document.querySelector(`#${tableId} tbody`);
        }
        
        if (!tableBody) {
            console.warn(`Table body not found for ID: ${tableId}`);
            return;
        }
        
        tableBody.innerHTML = '';
        for (let i = 0; i < rows; i++) {
            tableBody.appendChild(utils.createSkeletonRow(columns));
        }
    },

    hideTableSkeleton: (tableId) => {
        // First try to find element by ID directly (in case it's already a tbody)
        let tableBody = document.getElementById(tableId);
        
        // If not found or not a tbody, try looking for tbody within the element
        if (!tableBody || tableBody.tagName !== 'TBODY') {
            tableBody = document.querySelector(`#${tableId} tbody`);
        }
        
        if (tableBody && tableBody.children.length > 0) {
            // Only clear if it contains skeleton rows
            if (tableBody.firstChild?.querySelector('.skeleton')) {
                tableBody.innerHTML = '';
            }
        }
    }
};

// Tab management system
const TabManager = {
    init: () => {
        // Initialize all tab containers
        document.querySelectorAll('[data-tabs]').forEach(tabContainer => {
            const triggers = tabContainer.querySelectorAll('.tabs-trigger');
            
            triggers.forEach(trigger => {
                trigger.addEventListener('click', () => {
                    const tabId = trigger.getAttribute('data-tab');
                    TabManager.switchTab(tabContainer, tabId);
                });
            });
        });
    },

    switchTab: (container, activeTabId) => {
        // Update triggers
        container.querySelectorAll('.tabs-trigger').forEach(trigger => {
            trigger.classList.remove('active');
            if (trigger.getAttribute('data-tab') === activeTabId) {
                trigger.classList.add('active');
            }
        });

        // Update content
        container.querySelectorAll('.tabs-content').forEach(content => {
            content.classList.add('hidden');
            content.classList.remove('active');
        });

        const activeContent = container.querySelector(`#tab-${activeTabId}`);
        if (activeContent) {
            activeContent.classList.remove('hidden');
            activeContent.classList.add('active');
        }
    }
};

// Authentication system
const Auth = {
    init: () => {
        // Set API base URL
        Auth.setApiBaseUrl();
        
        // Check authentication status on page load
        Auth.checkAuthStatus().then(isAuthenticated => {
            if (isAuthenticated) {
                Auth.showAdminPanel();
            } else {
                Auth.showLoginPage();
            }
        });

        // Login form handler
        document.getElementById('login-form').addEventListener('submit', Auth.handleLogin);
        
        // Logout button handler
        document.getElementById('logout-button').addEventListener('click', Auth.handleLogout);
        
        // API Instructions tabs functionality
        const apiTabTriggers = document.querySelectorAll('[data-tab]');
        const apiTabContents = document.querySelectorAll('.tabs-content');
        
        apiTabTriggers.forEach(trigger => {
            trigger.addEventListener('click', () => {
                const targetTab = trigger.getAttribute('data-tab');
                
                // Remove active class from all triggers
                apiTabTriggers.forEach(t => t.classList.remove('active'));
                // Add active class to clicked trigger
                trigger.classList.add('active');
                
                // Hide all tab contents
                apiTabContents.forEach(content => content.classList.add('hidden'));
                // Show target tab content
                const targetContent = document.getElementById(targetTab);
                if (targetContent) {
                    targetContent.classList.remove('hidden');
                }
            });
        });
        
        // Always start with login page visible
        Auth.showLoginPage();
    },

    setApiBaseUrl: () => {
        // Better API URL detection
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            AppState.apiBaseUrl = 'http://localhost:5000';
        } else if (window.location.hostname.includes('netlify.app')) {
            // Netlify proxy setup - API calls go through same origin
            AppState.apiBaseUrl = window.location.origin;
        } else {
            AppState.apiBaseUrl = window.location.origin;
        }
    },

    // Check authentication status with server
    checkAuthStatus: async () => {
        try {
            const response = await utils.apiRequest('/api/auth-status');
            
            if (response && response.authenticated) {
                AppState.isLoggedIn = true;
                AppState.currentUser = response.adminId;
                return true;
            } else {
                AppState.isLoggedIn = false;
                AppState.currentUser = null;
                return false;
            }
        } catch (error) {
            console.error('Error checking auth status:', error);
            AppState.isLoggedIn = false;
            AppState.currentUser = null;
            return false;
        }
    },

    handleLogin: async (e) => {
        e.preventDefault();
        
        const adminId = document.getElementById('admin-id').value.trim();
        const password = document.getElementById('password').value.trim();
        
        // Validate input
        if (!adminId || !password) {
            utils.showToast('Validation Error', 'Please enter both Admin ID and Password', 'destructive');
            return;
        }

        const loginButton = document.getElementById('login-button');
        loginButton.textContent = 'Logging in...';
        loginButton.disabled = true;

        try {
            // Send credentials to server for verification
            const response = await utils.apiRequest('/api/login', {
                method: 'POST',
                body: JSON.stringify({
                    adminId: adminId,
                    adminPassword: password
                })
            });

            if (response && response.success) {
                AppState.isLoggedIn = true;
                AppState.currentUser = response.adminId;
                utils.showToast('Login Successful', response.message || 'Welcome to MovieZone Admin Panel', 'success');
                Auth.showAdminPanel();
            } else {
                utils.showToast('Login Failed', response?.error || 'Invalid credentials. Please try again.', 'destructive');
                // Clear the form
                document.getElementById('admin-id').value = '';
                document.getElementById('password').value = '';
            }
        } catch (error) {
            console.error('Login error:', error);
            utils.showToast('Login Error', error.message || 'An error occurred during login. Please try again.', 'destructive');
            // Clear the form on error
            document.getElementById('admin-id').value = '';
            document.getElementById('password').value = '';
        } finally {
            loginButton.textContent = 'Login';
            loginButton.disabled = false;
        }
    },

    handleLogout: async () => {
        try {
            // Call server logout endpoint
            await utils.apiRequest('/api/logout', {
                method: 'POST'
            });
        } catch (error) {
            console.error('Logout API error:', error);
            // Continue with client-side logout even if server call fails
        }

        // Clear client state
        AppState.isLoggedIn = false;
        AppState.currentUser = null;
        
        // Show login page, hide admin panel
        document.getElementById('login-page').classList.remove('hidden');
        document.getElementById('admin-page').classList.add('hidden');
        document.getElementById('redirect-page').classList.add('hidden');
        
        // Clear form
        document.getElementById('login-form').reset();
        
        utils.showToast('Logged out', 'You have been logged out successfully', 'default');
    },

    showLoginPage: () => {
        // Always show login page first, hide others
        document.getElementById('login-page').classList.remove('hidden');
        document.getElementById('admin-page').classList.add('hidden');
        if (document.getElementById('redirect-page')) {
            document.getElementById('redirect-page').classList.add('hidden');
        }
        
        // Clear any stored login state
        AppState.isLoggedIn = false;
    },

    showAdminPanel: () => {
        // Only show admin panel if properly authenticated
        if (!AppState.isLoggedIn) {
            console.error('Attempted to show admin panel without authentication');
            Auth.showLoginPage();
            return;
        }
        
        // Hide login page, show admin panel
        document.getElementById('login-page').classList.add('hidden');
        document.getElementById('admin-page').classList.remove('hidden');
        if (document.getElementById('redirect-page')) {
            document.getElementById('redirect-page').classList.add('hidden');
        }
        
        // Load admin panel data
        AdminPanel.init();
    }
};

// Admin Panel functionality
const AdminPanel = {
    init: () => {
        AdminPanel.initEventDelegation();
        AdminPanel.loadStatistics();
        AdminPanel.loadRecentLinks();
        AdminPanel.initForms();
        AdminPanel.loadDatabaseTable();
        AdminPanel.loadTokens();
    },

    // Safe event delegation for button clicks (replaces unsafe onclick handlers)
    initEventDelegation: () => {
        // Add click handler to database table
        const databaseTable = document.getElementById('database-table');
        if (databaseTable) {
            databaseTable.addEventListener('click', AdminPanel.handleTableButtonClick);
        }

        // Add click handler to recent links table
        const recentLinksTable = document.querySelector('#recent-links-table');
        if (recentLinksTable) {
            recentLinksTable.addEventListener('click', AdminPanel.handleTableButtonClick);
        }

        // Add click handler to tokens table
        const tokensTable = document.getElementById('tokens-table');
        if (tokensTable) {
            tokensTable.addEventListener('click', AdminPanel.handleTableButtonClick);
        }
    },

    handleTableButtonClick: (e) => {
        const button = e.target.closest('button');
        if (!button) return;

        const action = button.getAttribute('data-action');
        
        // Handle token actions
        if (action === 'toggle-token') {
            const tokenId = button.getAttribute('data-token-id');
            if (tokenId) {
                AdminPanel.toggleToken(parseInt(tokenId));
            }
            return;
        }
        
        if (action === 'delete-token') {
            const tokenId = button.getAttribute('data-token-id');
            const tokenName = button.getAttribute('data-token-name');
            if (tokenId && confirm(`Are you sure you want to delete ${tokenName}?`)) {
                AdminPanel.deleteToken(parseInt(tokenId));
            }
            return;
        }

        // Handle link actions
        const linkId = button.getAttribute('data-link-id');
        const linkType = button.getAttribute('data-link-type');
        const linkName = button.getAttribute('data-link-name');
        const url = button.getAttribute('data-url');

        switch (action) {
            case 'copy':
                if (url) {
                    utils.copyToClipboard(url);
                }
                break;
            case 'edit':
                if (linkId && linkType) {
                    const linkData = CRUDOperations.getLinkData(linkId);
                    if (linkData) {
                        AdminPanel.editLink(linkId, linkType, linkData);
                    }
                }
                break;
            case 'delete':
                if (linkId && linkType) {
                    AdminPanel.deleteLink(linkId, linkType, linkName);
                }
                break;
            default:
                console.warn('Unknown table button action:', action);
        }
    },

    loadStatistics: async () => {
        try {
            const stats = await utils.apiRequest('/api/movie-links/stats');
            
            document.getElementById('total-links').textContent = stats.totalLinks || 0;
            document.getElementById('today-links').textContent = stats.todayLinks || 0;
            document.getElementById('total-views').textContent = stats.totalViews || 0;
            document.getElementById('today-views').textContent = stats.todayViews || 0;
        } catch (error) {
            console.error('Failed to load statistics:', error);
        }
    },

    loadRecentLinks: async () => {
        try {
            const links = await utils.apiRequest('/api/movie-links?limit=5');
            const tbody = document.getElementById('recent-links-table');
            
            if (links.length === 0) {
                const row = document.createElement('tr');
                const cell = document.createElement('td');
                cell.colSpan = 5;
                cell.className = 'text-center text-muted-foreground';
                cell.textContent = 'No recent links';
                row.appendChild(cell);
                tbody.innerHTML = '';
                tbody.appendChild(row);
                return;
            }

            // Clear existing content safely
            tbody.innerHTML = '';

            // Create rows safely using DOM methods
            links.forEach(link => {
                // Store link data safely
                CRUDOperations.storeLinkData(link.id, link);

                const row = document.createElement('tr');

                // Movie name cell (safe with textContent)
                const nameCell = document.createElement('td');
                nameCell.textContent = link.movieName || '';
                row.appendChild(nameCell);

                // Short URL cell with copy button
                const urlCell = document.createElement('td');
                const urlDiv = document.createElement('div');
                urlDiv.className = 'flex items-center space-x-2';

                const code = document.createElement('code');
                code.className = 'text-xs';
                const shortUrl = `${window.location.origin}/m/${link.shortId}`;
                code.textContent = shortUrl;

                const copyBtn = document.createElement('button');
                copyBtn.className = 'button button-outline';
                copyBtn.style.padding = '0.25rem';
                copyBtn.setAttribute('data-action', 'copy');
                copyBtn.setAttribute('data-url', shortUrl);
                copyBtn.innerHTML = '<i data-lucide="copy" style="width: 0.75rem; height: 0.75rem;"></i>';

                urlDiv.appendChild(code);
                urlDiv.appendChild(copyBtn);
                urlCell.appendChild(urlDiv);
                row.appendChild(urlCell);

                // Type cell
                const typeCell = document.createElement('td');
                const typeBadge = document.createElement('span');
                typeBadge.className = 'badge badge-primary';
                typeBadge.textContent = 'Single';
                typeCell.appendChild(typeBadge);
                row.appendChild(typeCell);

                // Views cell
                const viewsCell = document.createElement('td');
                viewsCell.textContent = link.views || 0;
                row.appendChild(viewsCell);

                // Actions cell
                const actionsCell = document.createElement('td');
                const editBtn = document.createElement('button');
                editBtn.className = 'button button-outline';
                editBtn.style.padding = '0.25rem 0.5rem';
                editBtn.setAttribute('data-action', 'edit');
                editBtn.setAttribute('data-link-id', link.id);
                editBtn.setAttribute('data-link-type', 'single');
                editBtn.innerHTML = '<i data-lucide="edit" style="width: 0.75rem; height: 0.75rem;"></i>';
                actionsCell.appendChild(editBtn);
                row.appendChild(actionsCell);

                tbody.appendChild(row);
            });

            // Re-initialize lucide icons
            lucide.createIcons();
        } catch (error) {
            console.error('Failed to load recent links:', error);
        }
    },

    initForms: () => {
        // Single link form
        document.getElementById('single-link-form').addEventListener('submit', AdminPanel.handleSingleLinkSubmit);
        
        // Quality link form
        document.getElementById('quality-link-form').addEventListener('submit', AdminPanel.handleQualityLinkSubmit);
        
        // Episodes form
        document.getElementById('episodes-form').addEventListener('submit', AdminPanel.handleEpisodesSubmit);
        document.getElementById('add-episode').addEventListener('click', AdminPanel.addEpisodeRow);
        
        // Episode remove buttons (event delegation)
        document.getElementById('episodes-form').addEventListener('click', (e) => {
            if (e.target.closest('.remove-episode-btn')) {
                const episodeItem = e.target.closest('.episode-item');
                if (episodeItem) {
                    episodeItem.remove();
                    lucide.createIcons(); // Refresh icons after DOM change
                }
            }
        });

        // Edit episode remove buttons (event delegation)
        const editEpisodesContainer = document.getElementById('edit-episodes-container');
        if (editEpisodesContainer) {
            editEpisodesContainer.addEventListener('click', (e) => {
                if (e.target.closest('.remove-edit-episode-btn')) {
                    const button = e.target.closest('.remove-edit-episode-btn');
                    const index = parseInt(button.getAttribute('data-episode-index'));
                    if (!isNaN(index)) {
                        CRUDOperations.removeEditEpisode(index);
                    }
                }
            });
        }
        
        // Zip form
        document.getElementById('zip-form').addEventListener('submit', AdminPanel.handleZipSubmit);
        
        // Token form
        document.getElementById('token-form').addEventListener('submit', AdminPanel.handleTokenSubmit);
        
        // Copy buttons
        document.getElementById('copy-link').addEventListener('click', () => {
            const link = document.getElementById('generated-link').value;
            if (link) utils.copyToClipboard(link);
        });
        
        document.getElementById('copy-token').addEventListener('click', () => {
            const token = document.getElementById('generated-token').value;
            if (token) utils.copyToClipboard(token);
        });

        // Database search and sort
        document.getElementById('search-links').addEventListener('input', AdminPanel.handleDatabaseSearch);
        document.getElementById('sort-by').addEventListener('change', AdminPanel.handleDatabaseSort);
        document.getElementById('sort-order').addEventListener('change', AdminPanel.handleDatabaseSort);
    },

    handleSingleLinkSubmit: async (e) => {
        e.preventDefault();
        
        const movieName = document.getElementById('movie-name').value;
        const originalLink = document.getElementById('original-link').value;
        const adsEnabled = document.getElementById('ads-enabled').checked;

        try {
            utils.showLoading();
            
            const response = await utils.apiRequest('/api/movie-links', {
                method: 'POST',
                body: JSON.stringify({
                    movieName,
                    originalLink,
                    adsEnabled
                })
            });

            const shortUrl = `${window.location.origin}/m/${response.shortId}`;
            
            // Show generated link
            document.getElementById('generated-link').value = shortUrl;
            document.getElementById('generated-link-container').classList.remove('hidden');
            
            // Clear form
            e.target.reset();
            document.getElementById('ads-enabled').checked = true;
            
            utils.showToast('Success!', 'Short link generated successfully', 'success');
            
            // Refresh recent links and stats
            AdminPanel.loadRecentLinks();
            AdminPanel.loadStatistics();
            
        } catch (error) {
            utils.showToast('Error', 'Failed to generate short link', 'destructive');
        } finally {
            utils.hideLoading();
        }
    },

    handleQualityLinkSubmit: async (e) => {
        e.preventDefault();
        
        const movieName = document.getElementById('quality-movie-name').value;
        const quality480p = document.getElementById('quality-480p').value;
        const quality720p = document.getElementById('quality-720p').value;
        const quality1080p = document.getElementById('quality-1080p').value;
        const adsEnabled = document.getElementById('quality-ads-enabled').checked;

        // Validate at least one quality link
        if (!quality480p && !quality720p && !quality1080p) {
            utils.showToast('Error', 'Please provide at least one quality link', 'destructive');
            return;
        }

        try {
            utils.showLoading();
            
            const qualityLinks = {};
            if (quality480p) qualityLinks.quality480p = quality480p;
            if (quality720p) qualityLinks.quality720p = quality720p;
            if (quality1080p) qualityLinks.quality1080p = quality1080p;

            const response = await utils.apiRequest('/api/quality-movie-links', {
                method: 'POST',
                body: JSON.stringify({
                    movieName,
                    ...qualityLinks,
                    adsEnabled
                })
            });

            const shortUrl = `${window.location.origin}/m/${response.shortId}`;
            
            utils.showToast('Success!', `Quality link generated: ${shortUrl}`, 'success');
            utils.copyToClipboard(shortUrl);
            
            // Clear form
            e.target.reset();
            document.getElementById('quality-ads-enabled').checked = true;
            
            // Refresh data
            AdminPanel.loadRecentLinks();
            AdminPanel.loadStatistics();
            
        } catch (error) {
            utils.showToast('Error', 'Failed to generate quality link', 'destructive');
        } finally {
            utils.hideLoading();
        }
    },

    handleEpisodesSubmit: async (e) => {
        e.preventDefault();
        
        const seriesName = document.getElementById('series-name').value;
        const startFromEpisode = parseInt(document.getElementById('start-episode').value) || 1;
        const adsEnabled = document.getElementById('episodes-ads-enabled').checked;

        // Collect episode data
        const episodes = [];
        const episodeItems = document.querySelectorAll('.episode-item');
        
        episodeItems.forEach((item, index) => {
            const quality480p = item.querySelector('.quality-480p').value;
            const quality720p = item.querySelector('.quality-720p').value;
            const quality1080p = item.querySelector('.quality-1080p').value;
            
            if (quality480p || quality720p || quality1080p) {
                episodes.push({
                    episodeNumber: startFromEpisode + index,
                    quality480p,
                    quality720p,
                    quality1080p
                });
            }
        });

        if (episodes.length === 0) {
            utils.showToast('Error', 'Please provide at least one episode with quality links', 'destructive');
            return;
        }

        try {
            utils.showLoading();
            
            const response = await utils.apiRequest('/api/quality-episodes', {
                method: 'POST',
                body: JSON.stringify({
                    seriesName,
                    startFromEpisode,
                    episodes,
                    adsEnabled
                })
            });

            const shortUrl = `${window.location.origin}/e/${response.shortId}`;
            
            utils.showToast('Success!', `Episodes link generated: ${shortUrl}`, 'success');
            utils.copyToClipboard(shortUrl);
            
            // Clear form
            e.target.reset();
            AdminPanel.resetEpisodesContainer();
            
            // Refresh data
            AdminPanel.loadStatistics();
            
        } catch (error) {
            utils.showToast('Error', 'Failed to generate episodes link', 'destructive');
        } finally {
            utils.hideLoading();
        }
    },

    handleZipSubmit: async (e) => {
        e.preventDefault();
        
        const movieName = document.getElementById('zip-movie-name').value;
        const fromEpisode = parseInt(document.getElementById('from-episode').value);
        const toEpisode = parseInt(document.getElementById('to-episode').value);
        const quality480p = document.getElementById('zip-480p').value;
        const quality720p = document.getElementById('zip-720p').value;
        const quality1080p = document.getElementById('zip-1080p').value;
        const adsEnabled = document.getElementById('zip-ads-enabled').checked;

        if (!quality480p && !quality720p && !quality1080p) {
            utils.showToast('Error', 'Please provide at least one quality zip link', 'destructive');
            return;
        }

        try {
            utils.showLoading();
            
            const qualityLinks = {};
            if (quality480p) qualityLinks.quality480p = quality480p;
            if (quality720p) qualityLinks.quality720p = quality720p;
            if (quality1080p) qualityLinks.quality1080p = quality1080p;

            const response = await utils.apiRequest('/api/quality-zips', {
                method: 'POST',
                body: JSON.stringify({
                    movieName,
                    fromEpisode,
                    toEpisode,
                    ...qualityLinks,
                    adsEnabled
                })
            });

            const shortUrl = `${window.location.origin}/z/${response.shortId}`;
            
            utils.showToast('Success!', `Zip link generated: ${shortUrl}`, 'success');
            utils.copyToClipboard(shortUrl);
            
            // Clear form
            e.target.reset();
            document.getElementById('zip-ads-enabled').checked = true;
            
            // Refresh data
            AdminPanel.loadStatistics();
            
        } catch (error) {
            utils.showToast('Error', 'Failed to generate zip link', 'destructive');
        } finally {
            utils.hideLoading();
        }
    },

    handleTokenSubmit: async (e) => {
        e.preventDefault();
        
        const tokenName = document.getElementById('token-name').value;
        const tokenType = document.getElementById('token-type').value;

        try {
            utils.showLoading();
            
            const response = await utils.apiRequest('/api/tokens', {
                method: 'POST',
                body: JSON.stringify({
                    name: tokenName,
                    type: tokenType
                })
            });

            // Show generated token
            document.getElementById('generated-token').value = response.token;
            document.getElementById('generated-token-container').classList.remove('hidden');
            
            utils.showToast('Success!', 'API token generated successfully', 'success');
            
            // Clear form
            e.target.reset();
            
            // Refresh tokens table
            AdminPanel.loadTokens();
            
        } catch (error) {
            utils.showToast('Error', 'Failed to generate token', 'destructive');
        } finally {
            utils.hideLoading();
        }
    },

    addEpisodeRow: () => {
        const container = document.getElementById('episodes-container');
        const episodeCount = container.children.length + 1;
        const startFrom = parseInt(document.getElementById('start-episode').value) || 1;
        const episodeNumber = startFrom + episodeCount - 1;
        
        const episodeDiv = document.createElement('div');
        episodeDiv.className = 'episode-item border p-4 rounded-lg';
        episodeDiv.innerHTML = `
            <div class="flex justify-between items-center mb-3">
                <h4 class="font-medium">Episode ${episodeNumber}</h4>
                <button type="button" class="button button-outline remove-episode-btn" style="padding: 0.25rem 0.5rem;">
                    <i data-lucide="trash-2" style="width: 0.75rem; height: 0.75rem;"></i>
                </button>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                <input type="url" class="input quality-480p" placeholder="480p link" />
                <input type="url" class="input quality-720p" placeholder="720p link" />
                <input type="url" class="input quality-1080p" placeholder="1080p link" />
            </div>
        `;
        
        container.appendChild(episodeDiv);
        lucide.createIcons();
    },

    resetEpisodesContainer: () => {
        const container = document.getElementById('episodes-container');
        container.innerHTML = `
            <div class="episode-item border p-4 rounded-lg">
                <h4 class="font-medium mb-3">Episode 1</h4>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <input type="url" class="input quality-480p" placeholder="480p link" />
                    <input type="url" class="input quality-720p" placeholder="720p link" />
                    <input type="url" class="input quality-1080p" placeholder="1080p link" />
                </div>
            </div>
        `;
    },

    loadDatabaseTable: async () => {
        try {
            // Show skeleton loading
            utils.showTableSkeleton('database-table', 5, 8);
            
            // Fetch all types of links in parallel
            const [singleLinks, qualityLinks, episodes, zipLinks] = await Promise.all([
                utils.apiRequest('/api/movie-links').catch(() => []),
                utils.apiRequest('/api/quality-movie-links').catch(() => []),
                utils.apiRequest('/api/quality-episodes').catch(() => []),
                utils.apiRequest('/api/quality-zips').catch(() => [])
            ]);

            // Combine all links with type information
            const allLinks = [
                ...singleLinks.map(link => ({ ...link, type: 'Single', shortUrl: `/m/${link.shortId || link.short_id}` })),
                ...qualityLinks.map(link => ({ ...link, type: 'Quality', shortUrl: `/m/${link.shortId || link.short_id}` })),
                ...episodes.map(link => ({ ...link, type: 'Episodes', shortUrl: `/e/${link.shortId || link.short_id}`, movieName: link.seriesName || link.series_name })),
                ...zipLinks.map(link => ({ ...link, type: 'Quality Zip', shortUrl: `/z/${link.shortId || link.short_id}` }))
            ];

            const tbody = document.getElementById('database-table');
            
            // Hide skeleton loading
            utils.hideTableSkeleton('database-table');
            
            if (allLinks.length === 0) {
                tbody.innerHTML = '<tr><td colspan="8" class="text-center text-muted-foreground">No links found</td></tr>';
                return;
            }

            // Store data for search/filter functionality
            AdminPanel.allLinksData = allLinks;

            // Sort by date (newest first)
            allLinks.sort((a, b) => {
                const dateA = new Date(a.dateAdded || a.date_added).getTime();
                const dateB = new Date(b.dateAdded || b.date_added).getTime();
                return dateB - dateA;
            });

            // Clear existing content safely
            tbody.innerHTML = '';

            // Create rows safely using DOM methods
            allLinks.forEach(link => {
                // Store link data safely
                CRUDOperations.storeLinkData(link.id, link);

                const row = document.createElement('tr');

                // ID cell
                const idCell = document.createElement('td');
                idCell.textContent = link.id || '';
                row.appendChild(idCell);

                // Movie name cell (safe)
                const nameCell = document.createElement('td');
                nameCell.textContent = link.movieName || link.movie_name || '';
                row.appendChild(nameCell);

                // Short ID cell
                const shortIdCell = document.createElement('td');
                const shortIdCode = document.createElement('code');
                shortIdCode.className = 'text-xs';
                shortIdCode.textContent = link.shortId || link.short_id || '';
                shortIdCell.appendChild(shortIdCode);
                row.appendChild(shortIdCell);

                // Views cell
                const viewsCell = document.createElement('td');
                viewsCell.textContent = link.views || 0;
                row.appendChild(viewsCell);

                // Ads status cell
                const adsCell = document.createElement('td');
                const adsBadge = document.createElement('span');
                const adsEnabled = (link.adsEnabled !== undefined ? link.adsEnabled : link.ads_enabled);
                adsBadge.className = `badge ${adsEnabled ? 'badge-primary' : 'badge-secondary'}`;
                adsBadge.textContent = adsEnabled ? 'Enabled' : 'Disabled';
                adsCell.appendChild(adsBadge);
                row.appendChild(adsCell);

                // Type cell
                const typeCell = document.createElement('td');
                const typeBadge = document.createElement('span');
                typeBadge.className = 'badge badge-outline';
                typeBadge.textContent = link.type || '';
                typeCell.appendChild(typeBadge);
                row.appendChild(typeCell);

                // Date cell
                const dateCell = document.createElement('td');
                dateCell.textContent = utils.formatDate(link.dateAdded || link.date_added);
                row.appendChild(dateCell);

                // Actions cell with safe event delegation
                const actionsCell = document.createElement('td');
                const actionsDiv = document.createElement('div');
                actionsDiv.className = 'flex space-x-2';

                // Copy button
                const copyBtn = document.createElement('button');
                copyBtn.className = 'button button-outline';
                copyBtn.style.padding = '0.25rem 0.5rem';
                copyBtn.title = 'Copy Link';
                copyBtn.setAttribute('data-action', 'copy');
                copyBtn.setAttribute('data-url', `${window.location.origin}${link.shortUrl}`);
                copyBtn.innerHTML = '<i data-lucide="copy" style="width: 0.75rem; height: 0.75rem;"></i>';

                // Edit button
                const editBtn = document.createElement('button');
                editBtn.className = 'button button-outline';
                editBtn.style.padding = '0.25rem 0.5rem';
                editBtn.title = 'Edit';
                editBtn.setAttribute('data-action', 'edit');
                editBtn.setAttribute('data-link-id', link.id);
                editBtn.setAttribute('data-link-type', link.type);
                editBtn.setAttribute('data-link-name', link.movieName || link.movie_name || 'this link');
                editBtn.innerHTML = '<i data-lucide="edit" style="width: 0.75rem; height: 0.75rem;"></i>';

                // Delete button
                const deleteBtn = document.createElement('button');
                deleteBtn.className = 'button button-outline';
                deleteBtn.style.padding = '0.25rem 0.5rem';
                deleteBtn.title = 'Delete';
                deleteBtn.setAttribute('data-action', 'delete');
                deleteBtn.setAttribute('data-link-id', link.id);
                deleteBtn.setAttribute('data-link-type', link.type);
                deleteBtn.setAttribute('data-link-name', link.movieName || link.movie_name || 'this link');
                deleteBtn.innerHTML = '<i data-lucide="trash-2" style="width: 0.75rem; height: 0.75rem;"></i>';

                actionsDiv.appendChild(copyBtn);
                actionsDiv.appendChild(editBtn);
                actionsDiv.appendChild(deleteBtn);
                actionsCell.appendChild(actionsDiv);
                row.appendChild(actionsCell);

                tbody.appendChild(row);
            });

            lucide.createIcons();
        } catch (error) {
            console.error('Failed to load database table:', error);
            utils.hideTableSkeleton('database-table');
            document.getElementById('database-table').innerHTML = '<tr><td colspan="8" class="text-center text-destructive">Failed to load links</td></tr>';
        }
    },

    loadTokens: async () => {
        try {
            // Show skeleton loading
            utils.showTableSkeleton('tokens-table', 3, 6);
            
            const tokens = await utils.apiRequest('/api/tokens');
            const tbody = document.getElementById('tokens-table');
            
            // Hide skeleton loading
            utils.hideTableSkeleton('tokens-table');
            
            if (tokens.length === 0) {
                const row = document.createElement('tr');
                const cell = document.createElement('td');
                cell.colSpan = 6;
                cell.className = 'text-center text-muted-foreground';
                cell.textContent = 'No tokens found';
                row.appendChild(cell);
                tbody.innerHTML = '';
                tbody.appendChild(row);
                return;
            }

            // Clear existing content safely
            tbody.innerHTML = '';

            // Create rows safely using DOM methods
            tokens.forEach(token => {
                const row = document.createElement('tr');

                // Token name cell (safe)
                const nameCell = document.createElement('td');
                nameCell.textContent = token.name || '';
                row.appendChild(nameCell);

                // Type cell
                const typeCell = document.createElement('td');
                const typeBadge = document.createElement('span');
                typeBadge.className = 'badge badge-secondary';
                typeBadge.textContent = token.type || '';
                typeCell.appendChild(typeBadge);
                row.appendChild(typeCell);

                // Token cell (truncated)
                const tokenCell = document.createElement('td');
                const tokenCode = document.createElement('code');
                tokenCode.className = 'text-xs';
                tokenCode.textContent = (token.token || '').substring(0, 20) + '...';
                tokenCell.appendChild(tokenCode);
                row.appendChild(tokenCell);

                // Status cell
                const statusCell = document.createElement('td');
                const statusBadge = document.createElement('span');
                statusBadge.className = `badge ${token.isActive ? 'badge-primary' : 'badge-secondary'}`;
                statusBadge.textContent = token.isActive ? 'Active' : 'Inactive';
                statusCell.appendChild(statusBadge);
                row.appendChild(statusCell);

                // Created date cell
                const dateCell = document.createElement('td');
                dateCell.textContent = utils.formatDate(token.createdAt);
                row.appendChild(dateCell);

                // Actions cell with safe event delegation
                const actionsCell = document.createElement('td');
                const actionsDiv = document.createElement('div');
                actionsDiv.className = 'flex space-x-2';

                // Toggle button
                const toggleBtn = document.createElement('button');
                toggleBtn.className = 'button button-outline';
                toggleBtn.style.padding = '0.25rem 0.5rem';
                toggleBtn.setAttribute('data-action', 'toggle-token');
                toggleBtn.setAttribute('data-token-id', token.id);
                toggleBtn.innerHTML = '<i data-lucide="power" style="width: 0.75rem; height: 0.75rem;"></i>';

                // Delete button
                const deleteBtn = document.createElement('button');
                deleteBtn.className = 'button button-outline';
                deleteBtn.style.padding = '0.25rem 0.5rem';
                deleteBtn.setAttribute('data-action', 'delete-token');
                deleteBtn.setAttribute('data-token-id', token.id);
                deleteBtn.setAttribute('data-token-name', token.name || 'this token');
                deleteBtn.innerHTML = '<i data-lucide="trash-2" style="width: 0.75rem; height: 0.75rem;"></i>';

                actionsDiv.appendChild(toggleBtn);
                actionsDiv.appendChild(deleteBtn);
                actionsCell.appendChild(actionsDiv);
                row.appendChild(actionsCell);

                tbody.appendChild(row);
            });

            lucide.createIcons();
        } catch (error) {
            console.error('Failed to load tokens:', error);
            utils.hideTableSkeleton('tokens-table');
            document.getElementById('tokens-table').innerHTML = '<tr><td colspan="6" class="text-center text-destructive">Failed to load tokens</td></tr>';
        }
    },

    editLink: (id, type) => {
        utils.showToast('Edit Feature', `Edit functionality for ${type} links will be implemented in the next update`, 'default');
    },

    deleteLink: async (id, type) => {
        if (!confirm(`Are you sure you want to delete this ${type} link?`)) return;
        
        try {
            let endpoint;
            switch (type) {
                case 'Single':
                    endpoint = `/api/movie-links/${id}`;
                    break;
                case 'Quality':
                    endpoint = `/api/quality-movie-links/${id}`;
                    break;
                case 'Episodes':
                    endpoint = `/api/quality-episodes/${id}`;
                    break;
                case 'Quality Zip':
                    endpoint = `/api/quality-zips/${id}`;
                    break;
                default:
                    endpoint = `/api/movie-links/${id}`;
            }
            
            await utils.apiRequest(endpoint, { method: 'DELETE' });
            utils.showToast('Success!', `${type} link deleted successfully`, 'success');
            AdminPanel.loadDatabaseTable();
            AdminPanel.loadRecentLinks();
            AdminPanel.loadStatistics();
        } catch (error) {
            utils.showToast('Error', `Failed to delete ${type} link`, 'destructive');
        }
    },

    toggleToken: async (id) => {
        try {
            await utils.apiRequest(`/api/tokens/${id}/toggle`, { method: 'PATCH' });
            utils.showToast('Success!', 'Token status updated', 'success');
            AdminPanel.loadTokens();
        } catch (error) {
            utils.showToast('Error', 'Failed to update token status', 'destructive');
        }
    },

    deleteToken: async (id) => {
        if (!confirm('Are you sure you want to delete this token?')) return;
        
        try {
            await utils.apiRequest(`/api/tokens/${id}`, { method: 'DELETE' });
            utils.showToast('Success!', 'Token deleted successfully', 'success');
            AdminPanel.loadTokens();
        } catch (error) {
            utils.showToast('Error', 'Failed to delete token', 'destructive');
        }
    },

    // Store all links for search/sort functionality
    allLinksData: [],

    handleDatabaseSearch: () => {
        AdminPanel.renderFilteredLinks();
    },

    handleDatabaseSort: () => {
        AdminPanel.renderFilteredLinks();
    },

    renderFilteredLinks: () => {
        const searchTerm = document.getElementById('search-links').value.toLowerCase();
        const sortBy = document.getElementById('sort-by').value;
        const sortOrder = document.getElementById('sort-order').value;

        let filteredLinks = AdminPanel.allLinksData.filter(link => {
            const movieName = (link.movieName || link.movie_name || '').toLowerCase();
            const shortId = (link.shortId || link.short_id || '').toLowerCase();
            const type = (link.type || '').toLowerCase();
            
            return movieName.includes(searchTerm) || 
                   shortId.includes(searchTerm) || 
                   type.includes(searchTerm);
        });

        // Sort filtered results
        filteredLinks.sort((a, b) => {
            if (sortBy === 'name') {
                const nameA = (a.movieName || a.movie_name || '').toLowerCase();
                const nameB = (b.movieName || b.movie_name || '').toLowerCase();
                const comparison = nameA.localeCompare(nameB);
                return sortOrder === 'asc' ? comparison : -comparison;
            } else {
                const dateA = new Date(a.dateAdded || a.date_added).getTime();
                const dateB = new Date(b.dateAdded || b.date_added).getTime();
                const comparison = dateA - dateB;
                return sortOrder === 'asc' ? comparison : -comparison;
            }
        });

        const tbody = document.getElementById('database-table');
        
        if (filteredLinks.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" class="text-center text-muted-foreground">No links found matching your search</td></tr>';
            return;
        }

        // Clear existing content
        tbody.innerHTML = '';

        // Create rows safely using DOM methods
        filteredLinks.forEach(link => {
            // Store link data safely
            CRUDOperations.storeLinkData(link.id, link);

            const row = document.createElement('tr');

            // Create cells with safe text content
            const cells = [
                link.id,
                link.movieName || link.movie_name || '',
                link.shortId || link.short_id || '',
                link.views || 0,
                '', // ads status - will be handled separately
                link.type || '',
                utils.formatDate(link.dateAdded || link.date_added),
                '' // actions - will be handled separately
            ];

            cells.forEach((content, index) => {
                const cell = document.createElement('td');
                
                if (index === 2) { // Short ID cell with code styling
                    const code = document.createElement('code');
                    code.className = 'text-xs';
                    code.textContent = content;
                    cell.appendChild(code);
                } else if (index === 4) { // Ads status cell
                    const span = document.createElement('span');
                    const adsEnabled = (link.adsEnabled !== undefined ? link.adsEnabled : link.ads_enabled);
                    span.className = `badge ${adsEnabled ? 'badge-primary' : 'badge-secondary'}`;
                    span.textContent = adsEnabled ? 'Enabled' : 'Disabled';
                    cell.appendChild(span);
                } else if (index === 5) { // Type cell
                    const span = document.createElement('span');
                    span.className = 'badge badge-outline';
                    span.textContent = content;
                    cell.appendChild(span);
                } else if (index === 7) { // Actions cell
                    const actionsDiv = document.createElement('div');
                    actionsDiv.className = 'flex space-x-2';

                    // Copy button
                    const copyBtn = document.createElement('button');
                    copyBtn.className = 'button button-outline';
                    copyBtn.style.padding = '0.25rem 0.5rem';
                    copyBtn.title = 'Copy Link';
                    copyBtn.setAttribute('data-action', 'copy');
                    copyBtn.setAttribute('data-url', window.location.origin + (link.shortUrl || ''));
                    copyBtn.innerHTML = '<i data-lucide="copy" style="width: 0.75rem; height: 0.75rem;"></i>';

                    // Edit button
                    const editBtn = document.createElement('button');
                    editBtn.className = 'button button-outline';
                    editBtn.style.padding = '0.25rem 0.5rem';
                    editBtn.title = 'Edit';
                    editBtn.setAttribute('data-action', 'edit');
                    editBtn.setAttribute('data-link-id', link.id);
                    editBtn.setAttribute('data-link-type', link.type);
                    editBtn.innerHTML = '<i data-lucide="edit" style="width: 0.75rem; height: 0.75rem;"></i>';

                    // Delete button
                    const deleteBtn = document.createElement('button');
                    deleteBtn.className = 'button button-outline';
                    deleteBtn.style.padding = '0.25rem 0.5rem';
                    deleteBtn.title = 'Delete';
                    deleteBtn.setAttribute('data-action', 'delete');
                    deleteBtn.setAttribute('data-link-id', link.id);
                    deleteBtn.setAttribute('data-link-type', link.type);
                    deleteBtn.setAttribute('data-link-name', link.movieName || link.movie_name || link.seriesName || link.series_name || 'this item');
                    deleteBtn.innerHTML = '<i data-lucide="trash-2" style="width: 0.75rem; height: 0.75rem;"></i>';

                    actionsDiv.appendChild(copyBtn);
                    actionsDiv.appendChild(editBtn);
                    actionsDiv.appendChild(deleteBtn);
                    cell.appendChild(actionsDiv);
                } else {
                    cell.textContent = content;
                }

                row.appendChild(cell);
            });

            tbody.appendChild(row);
        });

        lucide.createIcons();
    }
};


// Router functionality
const Router = {
    init: () => {
        const path = window.location.pathname;
        
        // Check if this is a short link path
        if (path.startsWith('/m/') || path.startsWith('/e/') || path.startsWith('/z/')) {
            const shortId = path.split('/')[2];
            const linkType = path.startsWith('/m/') ? 'movie' : 
                           path.startsWith('/e/') ? 'episode' : 'zip';
            
            Router.handleShortLink(linkType, shortId);
            return;
        }
        
        // Check if this is admin route
        if (path === '/admin') {
            const isLoggedIn = localStorage.getItem('moviezone_admin_logged_in');
            if (isLoggedIn === 'true') {
                Auth.showAdminPanel();
            } else {
                Router.showLoginPage();
            }
            return;
        }
        
        // Default to login page
        Router.showLoginPage();
    },

    showLoginPage: () => {
        document.getElementById('login-page').classList.remove('hidden');
        document.getElementById('admin-page').classList.add('hidden');
        document.getElementById('redirect-page').classList.add('hidden');
    },

    handleShortLink: async (linkType, shortId) => {
        try {
            // Fetch link data from API
            const apiUrl = AppState.apiBaseUrl.includes('localhost') 
                ? 'https://full-links.onrender.com' 
                : 'https://full-links.onrender.com';
                
            const response = await fetch(`${apiUrl}/api/resolve/${linkType}/${shortId}`);
            
            if (!response.ok) {
                throw new Error('Link not found or expired');
            }
            
            const linkData = await response.json();
            
            // Show redirect page with link data
            AppState.movieData = linkData;
            RedirectPage.showWithData(linkData);
            
        } catch (error) {
            console.error('Error resolving short link:', error);
            RedirectPage.showError('Link expired or not found');
        }
    }
};

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Set API base URL
    AppState.apiBaseUrl = window.location.origin.includes('localhost') 
        ? 'http://localhost:5000' 
        : window.location.origin;

    // Initialize router first
    Router.init();
    
    // Initialize components
    TabManager.init();
    Auth.init();
    ModalManager.init();
    RedirectPage.init();
    
    // Initialize Lucide icons
    lucide.createIcons();
    
    console.log('MovieZone Admin Panel initialized with CRUD operations');
});

// Handle browser navigation
window.addEventListener('popstate', () => {
    // Reinitialize router
    Router.init();
});

// RedirectPage functionality
const RedirectPage = {
    currentCountdown: 10,
    countdownTimer: null,
    viewsUpdated: false,
    adViewRecorded: false,
    movieData: null,

    init: () => {
        RedirectPage.initScrollButton();
    },

    initScrollButton: () => {
        const scrollButton = document.getElementById('scroll-to-bottom');
        if (scrollButton) {
            scrollButton.addEventListener('click', RedirectPage.scrollToBottom);
        }
    },

    showWithData: (linkData) => {
        console.log('RedirectPage.showWithData called with:', linkData);
        
        // Hide other pages
        document.getElementById('login-page').classList.add('hidden');
        document.getElementById('admin-page').classList.add('hidden');
        document.getElementById('redirect-page').classList.remove('hidden');

        // Store movie data
        RedirectPage.movieData = linkData;
        AppState.movieData = linkData;

        // Reset state
        RedirectPage.viewsUpdated = false;
        RedirectPage.adViewRecorded = false;
        RedirectPage.currentCountdown = 10;

        // Show appropriate UI based on ads status and link type
        if (!linkData.adsEnabled || linkData.skipTimer) {
            RedirectPage.showNoAdsUI(linkData);
        } else {
            RedirectPage.showCountdownUI(linkData);
        }
    },

    showNoAdsUI: (linkData) => {
        // Hide all redirect sections first
        RedirectPage.hideAllSections();

        if (linkData.linkType === "quality") {
            RedirectPage.showQualitySelection(linkData);
        } else if (linkData.linkType === "episode") {
            RedirectPage.showEpisodeSelection(linkData);
        } else if (linkData.linkType === "zip") {
            RedirectPage.showZipSelection(linkData);
        } else {
            // Single link - redirect immediately
            window.location.href = linkData.originalLink;
        }
    },

    showCountdownUI: (linkData) => {
        // Hide all redirect sections first
        RedirectPage.hideAllSections();

        // Show countdown section
        document.getElementById('redirect-countdown').classList.remove('hidden');

        // Update movie title
        const movieTitle = linkData.linkType === "episode" ? linkData.seriesName : linkData.movieName;
        document.getElementById('movie-title').textContent = `🎬 ${movieTitle}`;

        // Update view count if ads enabled and not recently viewed
        if (linkData.adsEnabled && !linkData.skipTimer && !RedirectPage.viewsUpdated) {
            RedirectPage.updateViews(linkData);
        }

        // Start countdown timer
        RedirectPage.startCountdown();

        // Prevent scrolling during countdown
        RedirectPage.preventScrolling(true);
    },

    hideAllSections: () => {
        document.getElementById('redirect-loading').classList.add('hidden');
        document.getElementById('redirect-not-found').classList.add('hidden');
        document.getElementById('redirect-countdown').classList.add('hidden');
        document.getElementById('redirect-quality-noads').classList.add('hidden');
        document.getElementById('redirect-episodes-noads').classList.add('hidden');
        document.getElementById('redirect-zip-noads').classList.add('hidden');
    },

    showQualitySelection: (linkData) => {
        document.getElementById('redirect-quality-noads').classList.remove('hidden');
        
        // Update title
        document.getElementById('quality-movie-title').textContent = linkData.movieName;

        // Generate quality buttons
        const container = document.getElementById('quality-buttons-container');
        container.innerHTML = '';

        const qualityLinks = linkData.qualityLinks || {};
        const availableQualities = Object.entries(qualityLinks)
            .filter(([_, url]) => url)
            .map(([quality, url]) => ({ quality: quality.replace('quality', '').replace('p', 'p'), url }));

        availableQualities.forEach(({ quality, url }) => {
            const button = document.createElement('button');
            button.style.cssText = `
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border: none;
                padding: 15px 30px;
                border-radius: 8px;
                cursor: pointer;
                font-size: 1.1rem;
                font-weight: bold;
                transition: transform 0.3s ease;
                width: 100%;
            `;
            button.textContent = `Continue (${quality})`;
            button.addEventListener('click', () => RedirectPage.handleContinue(url));
            button.addEventListener('mouseenter', (e) => e.target.style.transform = 'scale(1.05)');
            button.addEventListener('mouseleave', (e) => e.target.style.transform = 'scale(1)');
            container.appendChild(button);
        });
    },

    showEpisodeSelection: (linkData) => {
        document.getElementById('redirect-episodes-noads').classList.remove('hidden');
        
        // Update title
        document.getElementById('episodes-series-title').textContent = linkData.seriesName;

        // Generate episode buttons
        const container = document.getElementById('episodes-container');
        container.innerHTML = '';

        const episodes = linkData.episodes || [];
        
        episodes.forEach((episode, index) => {
            const episodeDiv = document.createElement('div');
            episodeDiv.style.cssText = `
                border: 2px solid #495057;
                border-radius: 12px;
                padding: 20px;
                background: #343a40;
            `;

            const episodeTitle = document.createElement('h3');
            episodeTitle.style.cssText = `
                font-size: 1.2rem;
                margin-bottom: 15px;
                color: white;
                font-weight: bold;
            `;
            episodeTitle.textContent = `Episode ${episode.episodeNumber}`;
            episodeDiv.appendChild(episodeTitle);

            const buttonContainer = document.createElement('div');
            buttonContainer.style.cssText = `
                display: flex;
                flex-direction: column;
                gap: 10px;
            `;

            // Create quality buttons
            if (episode.quality480p) {
                const button = RedirectPage.createEpisodeButton(episode.quality480p, '480p', '#28a745', '#20c997');
                buttonContainer.appendChild(button);
            }
            if (episode.quality720p) {
                const button = RedirectPage.createEpisodeButton(episode.quality720p, '720p', '#007bff', '#0056b3');
                buttonContainer.appendChild(button);
            }
            if (episode.quality1080p) {
                const button = RedirectPage.createEpisodeButton(episode.quality1080p, '1080p', '#6f42c1', '#5a32a3');
                buttonContainer.appendChild(button);
            }

            episodeDiv.appendChild(buttonContainer);
            container.appendChild(episodeDiv);
        });
    },

    createEpisodeButton: (url, quality, color1, color2) => {
        const button = document.createElement('button');
        button.style.cssText = `
            background: linear-gradient(135deg, ${color1} 0%, ${color2} 100%);
            color: white;
            border: none;
            padding: 12px 25px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 1rem;
            font-weight: bold;
            transition: transform 0.3s ease;
        `;
        button.textContent = `Download ${quality}`;
        button.addEventListener('click', () => RedirectPage.handleContinue(url));
        button.addEventListener('mouseenter', (e) => e.target.style.transform = 'scale(1.05)');
        button.addEventListener('mouseleave', (e) => e.target.style.transform = 'scale(1)');
        return button;
    },

    showZipSelection: (linkData) => {
        document.getElementById('redirect-zip-noads').classList.remove('hidden');
        
        // Update title
        document.getElementById('zip-movie-title').textContent = linkData.movieName;
        
        // Update episode range
        const rangeText = `Choose quality to download episodes ${linkData.fromEpisode} to ${linkData.toEpisode}:`;
        document.getElementById('zip-episode-range').textContent = rangeText;

        // Generate quality buttons
        const container = document.getElementById('zip-buttons-container');
        container.innerHTML = '';

        const qualityLinks = linkData.qualityLinks || {};
        const availableQualities = Object.entries(qualityLinks)
            .filter(([_, url]) => url)
            .map(([quality, url]) => ({ quality: quality.replace('quality', '').replace('p', 'p'), url }));

        availableQualities.forEach(({ quality, url }) => {
            const button = document.createElement('button');
            button.style.cssText = `
                background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
                color: white;
                border: 3px solid #dc3545;
                padding: 15px 25px;
                border-radius: 8px;
                cursor: pointer;
                font-size: 1.1rem;
                font-weight: bold;
                transition: transform 0.3s ease;
                width: 100%;
                min-height: 60px;
            `;
            const fromEp = String(linkData.fromEpisode).padStart(2, '0');
            const toEp = String(linkData.toEpisode).padStart(2, '0');
            button.textContent = `DOWNLOAD (E${fromEp}-${toEp}) ${quality}`;
            button.addEventListener('click', () => RedirectPage.handleContinue(url));
            button.addEventListener('mouseenter', (e) => e.target.style.transform = 'scale(1.05)');
            button.addEventListener('mouseleave', (e) => e.target.style.transform = 'scale(1)');
            container.appendChild(button);
        });
    },

    startCountdown: () => {
        RedirectPage.currentCountdown = 10;
        RedirectPage.updateCountdownDisplay();

        RedirectPage.countdownTimer = setInterval(() => {
            RedirectPage.currentCountdown--;
            RedirectPage.updateCountdownDisplay();

            if (RedirectPage.currentCountdown <= 0) {
                clearInterval(RedirectPage.countdownTimer);
                RedirectPage.onCountdownComplete();
            }
        }, 1000);
    },

    updateCountdownDisplay: () => {
        const countdownEl = document.getElementById('countdown-number');
        const progressCircle = document.getElementById('progress-circle');
        
        if (countdownEl) {
            countdownEl.textContent = RedirectPage.currentCountdown;
        }

        if (progressCircle) {
            const circumference = 2 * Math.PI * 65; // radius = 65
            const progress = RedirectPage.currentCountdown / 10;
            const offset = circumference * (1 - progress);
            progressCircle.style.strokeDashoffset = offset;
        }
    },

    onCountdownComplete: () => {
        // Record ad view for timer skip functionality
        if (RedirectPage.movieData && !RedirectPage.adViewRecorded) {
            RedirectPage.recordAdView(RedirectPage.movieData);
        }

        // Show scroll button and download section
        document.getElementById('scroll-button-section').classList.remove('hidden');
        RedirectPage.setupDownloadSection();

        // Re-enable scrolling
        RedirectPage.preventScrolling(false);
    },

    setupDownloadSection: () => {
        const downloadSection = document.getElementById('download-section');
        downloadSection.classList.remove('hidden');

        // Based on link type, show appropriate download options
        if (RedirectPage.movieData.linkType === "quality") {
            RedirectPage.setupQualityDownloadSection();
        } else if (RedirectPage.movieData.linkType === "episode") {
            RedirectPage.setupEpisodeDownloadSection();
        } else if (RedirectPage.movieData.linkType === "zip") {
            RedirectPage.setupZipDownloadSection();
        } else {
            // Single link
            RedirectPage.setupSingleDownloadSection();
        }
    },

    setupQualityDownloadSection: () => {
        const downloadSection = document.getElementById('download-section');
        const qualityLinks = RedirectPage.movieData.qualityLinks || {};
        
        // Clear existing content safely
        downloadSection.innerHTML = '';

        // Create header safely
        const header = document.createElement('header');
        header.style.cssText = 'background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px 20px; text-align: center;';
        
        const headerTitle = document.createElement('h1');
        headerTitle.style.cssText = 'font-size: 2rem; margin-bottom: 10px; font-weight: bold;';
        headerTitle.textContent = RedirectPage.movieData.movieName || 'Movie'; // Safe textContent
        
        const headerSubtitle = document.createElement('p');
        headerSubtitle.style.cssText = 'font-size: 1.1rem;';
        headerSubtitle.textContent = 'Choose your preferred quality';
        
        header.appendChild(headerTitle);
        header.appendChild(headerSubtitle);

        // Create main container
        const mainContainer = document.createElement('div');
        mainContainer.style.cssText = 'max-width: 800px; margin: 40px auto; padding: 0 20px;';

        // Create buttons container
        const buttonsContainer = document.createElement('div');
        buttonsContainer.style.cssText = 'display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 40px;';

        const availableQualities = Object.entries(qualityLinks)
            .filter(([_, url]) => url)
            .map(([quality, url]) => ({ quality: quality.replace('quality', '').replace('p', 'p'), url }));

        // Create buttons safely using DOM methods
        availableQualities.forEach(({ quality, url }) => {
            const button = document.createElement('button');
            button.style.cssText = `
                background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
                color: white;
                border: none;
                padding: 20px;
                border-radius: 12px;
                cursor: pointer;
                font-size: 1.2rem;
                font-weight: bold;
                transition: transform 0.3s ease;
                text-align: center;
                box-shadow: 0 4px 15px rgba(40, 167, 69, 0.3);
            `;

            // Create content safely
            const icon = document.createElement('div');
            icon.style.cssText = 'font-size: 1.5rem; margin-bottom: 8px;';
            icon.textContent = '📥';

            const text = document.createElement('div');
            text.textContent = `Download ${quality}`; // Safe textContent

            button.appendChild(icon);
            button.appendChild(text);

            // Safe event handlers
            button.addEventListener('click', () => RedirectPage.handleContinue(url));
            button.addEventListener('mouseenter', (e) => e.target.style.transform = 'scale(1.05)');
            button.addEventListener('mouseleave', (e) => e.target.style.transform = 'scale(1)');

            buttonsContainer.appendChild(button);
        });

        mainContainer.appendChild(buttonsContainer);
        downloadSection.appendChild(header);
        downloadSection.appendChild(mainContainer);
    },

    setupSingleDownloadSection: () => {
        const downloadSection = document.getElementById('download-section');
        
        // Clear existing content safely
        downloadSection.innerHTML = '';

        // Create header safely
        const header = document.createElement('header');
        header.style.cssText = 'background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px 20px; text-align: center;';
        
        const headerTitle = document.createElement('h1');
        headerTitle.style.cssText = 'font-size: 2rem; margin-bottom: 10px; font-weight: bold;';
        headerTitle.textContent = RedirectPage.movieData.movieName || 'Movie'; // Safe textContent
        
        const headerSubtitle = document.createElement('p');
        headerSubtitle.style.cssText = 'font-size: 1.1rem;';
        headerSubtitle.textContent = 'Your download is ready';
        
        header.appendChild(headerTitle);
        header.appendChild(headerSubtitle);

        // Create main container
        const mainContainer = document.createElement('div');
        mainContainer.style.cssText = 'max-width: 600px; margin: 40px auto; padding: 0 20px; text-align: center;';

        // Create download button safely
        const button = document.createElement('button');
        button.style.cssText = `
            background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
            color: white;
            border: none;
            padding: 20px 40px;
            border-radius: 12px;
            cursor: pointer;
            font-size: 1.3rem;
            font-weight: bold;
            transition: transform 0.3s ease;
            box-shadow: 0 4px 15px rgba(40, 167, 69, 0.3);
        `;

        // Create button content safely
        const icon = document.createElement('span');
        icon.style.cssText = 'font-size: 1.5rem; margin-right: 10px;';
        icon.textContent = '📥';

        const buttonText = document.createTextNode('Download Now');

        button.appendChild(icon);
        button.appendChild(buttonText);

        // Safe event handlers
        const originalLink = RedirectPage.movieData.originalLink;
        if (originalLink) {
            button.addEventListener('click', () => RedirectPage.handleContinue(originalLink));
        }
        button.addEventListener('mouseenter', (e) => e.target.style.transform = 'scale(1.05)');
        button.addEventListener('mouseleave', (e) => e.target.style.transform = 'scale(1)');

        mainContainer.appendChild(button);
        downloadSection.appendChild(header);
        downloadSection.appendChild(mainContainer);
    },

    handleContinue: (url) => {
        window.location.href = url;
    },

    scrollToBottom: () => {
        const downloadSection = document.getElementById('download-section');
        if (downloadSection) {
            downloadSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    },

    preventScrolling: (prevent) => {
        if (prevent) {
            document.body.style.overflow = 'hidden';
            document.documentElement.style.overflow = 'hidden';
            
            const preventScroll = (e) => {
                e.preventDefault();
                e.stopPropagation();
                return false;
            };
            
            const preventKeyboardScroll = (e) => {
                if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '].includes(e.key)) {
                    e.preventDefault();
                    return false;
                }
            };

            document.addEventListener('wheel', preventScroll, { passive: false });
            document.addEventListener('touchmove', preventScroll, { passive: false });
            document.addEventListener('keydown', preventKeyboardScroll, { passive: false });
            
            // Store event listeners for later removal
            window.scrollPreventListeners = { preventScroll, preventKeyboardScroll };
        } else {
            document.body.style.overflow = 'auto';
            document.documentElement.style.overflow = 'auto';
            
            if (window.scrollPreventListeners) {
                document.removeEventListener('wheel', window.scrollPreventListeners.preventScroll);
                document.removeEventListener('touchmove', window.scrollPreventListeners.preventScroll);
                document.removeEventListener('keydown', window.scrollPreventListeners.preventKeyboardScroll);
                window.scrollPreventListeners = null;
            }
        }
    },

    updateViews: async (linkData) => {
        if (RedirectPage.viewsUpdated) return;
        RedirectPage.viewsUpdated = true;

        try {
            const endpoint = linkData.linkType === "quality" ? 'quality-movie-links' :
                            linkData.linkType === "episode" ? 'quality-episodes' :
                            linkData.linkType === "zip" ? 'quality-zips' :
                            'movie-links';
            
            await utils.apiRequest(`/api/${endpoint}/${linkData.shortId}/views`, {
                method: "PATCH"
            });
        } catch (error) {
            console.error('Failed to update views:', error);
        }
    },

    recordAdView: async (linkData) => {
        if (RedirectPage.adViewRecorded) return;
        RedirectPage.adViewRecorded = true;

        try {
            await utils.apiRequest('/api/record-ad-view', {
                method: "POST",
                body: JSON.stringify({
                    shortId: linkData.shortId,
                    linkType: linkData.linkType || 'single'
                })
            });
        } catch (error) {
            console.error('Failed to record ad view:', error);
        }
    },

    showError: (message) => {
        // Hide other pages
        document.getElementById('login-page').classList.add('hidden');
        document.getElementById('admin-page').classList.add('hidden');
        document.getElementById('redirect-page').classList.remove('hidden');

        // Hide all redirect sections
        RedirectPage.hideAllSections();

        // Show not found section
        document.getElementById('redirect-not-found').classList.remove('hidden');
        
        // Update error message if needed
        const errorText = document.querySelector('#redirect-not-found p');
        if (errorText && message) {
            errorText.textContent = message;
        }
    },

    showLoading: () => {
        // Hide other pages
        document.getElementById('login-page').classList.add('hidden');
        document.getElementById('admin-page').classList.add('hidden');
        document.getElementById('redirect-page').classList.remove('hidden');

        // Hide all redirect sections
        RedirectPage.hideAllSections();

        // Show loading section
        document.getElementById('redirect-loading').classList.remove('hidden');
    }
};

// Modal Management System
const ModalManager = {
    init: () => {
        ModalManager.initSingleEditModal();
        ModalManager.initQualityEditModal();
        ModalManager.initEpisodeEditModal();
        ModalManager.initZipEditModal();
        ModalManager.initTokenEditModal();
        ModalManager.initDeleteModal();
    },

    initSingleEditModal: () => {
        const modal = document.getElementById('edit-single-modal');
        const closeBtn = document.getElementById('close-edit-single-modal');
        const cancelBtn = document.getElementById('cancel-edit-single');
        const form = document.getElementById('edit-single-form');

        closeBtn?.addEventListener('click', () => ModalManager.closeModal('edit-single-modal'));
        cancelBtn?.addEventListener('click', () => ModalManager.closeModal('edit-single-modal'));
        
        form?.addEventListener('submit', CRUDOperations.handleEditSingleSubmit);
    },

    initQualityEditModal: () => {
        const closeBtn = document.getElementById('close-edit-quality-modal');
        const cancelBtn = document.getElementById('cancel-edit-quality');
        const form = document.getElementById('edit-quality-form');

        closeBtn?.addEventListener('click', () => ModalManager.closeModal('edit-quality-modal'));
        cancelBtn?.addEventListener('click', () => ModalManager.closeModal('edit-quality-modal'));
        
        form?.addEventListener('submit', CRUDOperations.handleEditQualitySubmit);
    },

    initEpisodeEditModal: () => {
        const closeBtn = document.getElementById('close-edit-episode-modal');
        const cancelBtn = document.getElementById('cancel-edit-episode');
        const addBtn = document.getElementById('add-edit-episode');
        const form = document.getElementById('edit-episode-form');

        closeBtn?.addEventListener('click', () => ModalManager.closeModal('edit-episode-modal'));
        cancelBtn?.addEventListener('click', () => ModalManager.closeModal('edit-episode-modal'));
        addBtn?.addEventListener('click', CRUDOperations.addEditEpisode);
        
        form?.addEventListener('submit', CRUDOperations.handleEditEpisodeSubmit);
    },

    initZipEditModal: () => {
        const closeBtn = document.getElementById('close-edit-zip-modal');
        const cancelBtn = document.getElementById('cancel-edit-zip');
        const form = document.getElementById('edit-zip-form');

        closeBtn?.addEventListener('click', () => ModalManager.closeModal('edit-zip-modal'));
        cancelBtn?.addEventListener('click', () => ModalManager.closeModal('edit-zip-modal'));
        
        form?.addEventListener('submit', CRUDOperations.handleEditZipSubmit);
    },

    initTokenEditModal: () => {
        const closeBtn = document.getElementById('close-edit-token-modal');
        const cancelBtn = document.getElementById('cancel-edit-token');
        const form = document.getElementById('edit-token-form');

        closeBtn?.addEventListener('click', () => ModalManager.closeModal('edit-token-modal'));
        cancelBtn?.addEventListener('click', () => ModalManager.closeModal('edit-token-modal'));
        
        form?.addEventListener('submit', CRUDOperations.handleEditTokenSubmit);
    },

    initDeleteModal: () => {
        const closeBtn = document.getElementById('close-delete-modal');
        const cancelBtn = document.getElementById('cancel-delete-btn');
        const confirmBtn = document.getElementById('confirm-delete-btn');

        closeBtn?.addEventListener('click', () => ModalManager.closeModal('delete-confirmation-modal'));
        cancelBtn?.addEventListener('click', () => ModalManager.closeModal('delete-confirmation-modal'));
        confirmBtn?.addEventListener('click', CRUDOperations.handleConfirmDelete);
    },

    openModal: (modalId) => {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('hidden');
            document.body.style.overflow = 'hidden'; // Prevent background scroll
        }
    },

    closeModal: (modalId) => {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('hidden');
            document.body.style.overflow = 'auto'; // Re-enable scroll
        }
    }
};

// Safe Data Store for Link Objects (to avoid JSON in onclick)
const LinkDataStore = new Map();

// CRUD Operations
const CRUDOperations = {
    currentEditingId: null,
    currentEditingType: null,
    currentDeletingId: null,
    currentDeletingType: null,

    // Store link data safely
    storeLinkData: (linkId, linkData) => {
        LinkDataStore.set(linkId.toString(), linkData);
    },

    // Get stored link data
    getLinkData: (linkId) => {
        return LinkDataStore.get(linkId.toString());
    },

    // Single Link Operations
    openEditSingle: (linkId, linkData) => {
        CRUDOperations.currentEditingId = linkId;
        CRUDOperations.currentEditingType = 'single';

        // Populate form
        document.getElementById('edit-single-movie-name').value = linkData.movieName || linkData.movie_name || '';
        document.getElementById('edit-single-original-link').value = linkData.originalLink || linkData.original_link || '';
        document.getElementById('edit-single-ads-enabled').checked = linkData.adsEnabled !== undefined ? linkData.adsEnabled : (linkData.ads_enabled !== undefined ? linkData.ads_enabled : true);

        ModalManager.openModal('edit-single-modal');
    },

    handleEditSingleSubmit: async (e) => {
        e.preventDefault();
        
        const originalLink = document.getElementById('edit-single-original-link').value.trim();
        const adsEnabled = document.getElementById('edit-single-ads-enabled').checked;

        if (!originalLink) {
            utils.showToast('Error', 'Please enter a valid original link', 'destructive');
            return;
        }

        try {
            await utils.apiRequest(`/api/movie-links/${CRUDOperations.currentEditingId}`, {
                method: 'PATCH',
                body: JSON.stringify({
                    originalLink,
                    adsEnabled
                })
            });

            utils.showToast('Success', 'Link updated successfully!', 'success');
            ModalManager.closeModal('edit-single-modal');
            AdminPanel.loadAllLinks(); // Refresh the links table
        } catch (error) {
            console.error('Error updating single link:', error);
            utils.showToast('Error', 'Failed to update link', 'destructive');
        }
    },

    // Quality Link Operations
    openEditQuality: (linkId, linkData) => {
        CRUDOperations.currentEditingId = linkId;
        CRUDOperations.currentEditingType = 'quality';

        // Populate form
        document.getElementById('edit-quality-movie-name').value = linkData.movieName || linkData.movie_name || '';
        document.getElementById('edit-quality-480p').value = linkData.quality480p || linkData.quality_480p || '';
        document.getElementById('edit-quality-720p').value = linkData.quality720p || linkData.quality_720p || '';
        document.getElementById('edit-quality-1080p').value = linkData.quality1080p || linkData.quality_1080p || '';
        document.getElementById('edit-quality-ads-enabled').checked = linkData.adsEnabled !== undefined ? linkData.adsEnabled : (linkData.ads_enabled !== undefined ? linkData.ads_enabled : true);

        ModalManager.openModal('edit-quality-modal');
    },

    handleEditQualitySubmit: async (e) => {
        e.preventDefault();
        
        const quality480p = document.getElementById('edit-quality-480p').value.trim();
        const quality720p = document.getElementById('edit-quality-720p').value.trim();
        const quality1080p = document.getElementById('edit-quality-1080p').value.trim();
        const adsEnabled = document.getElementById('edit-quality-ads-enabled').checked;

        if (!quality480p && !quality720p && !quality1080p) {
            utils.showToast('Error', 'Please provide at least one quality link', 'destructive');
            return;
        }

        try {
            await utils.apiRequest(`/api/quality-movie-links/${CRUDOperations.currentEditingId}`, {
                method: 'PATCH',
                body: JSON.stringify({
                    quality480p: quality480p || null,
                    quality720p: quality720p || null,
                    quality1080p: quality1080p || null,
                    adsEnabled
                })
            });

            utils.showToast('Success', 'Quality link updated successfully!', 'success');
            ModalManager.closeModal('edit-quality-modal');
            AdminPanel.loadAllLinks();
        } catch (error) {
            console.error('Error updating quality link:', error);
            utils.showToast('Error', 'Failed to update quality link', 'destructive');
        }
    },

    // Episode Operations
    openEditEpisode: (linkId, linkData) => {
        CRUDOperations.currentEditingId = linkId;
        CRUDOperations.currentEditingType = 'episode';

        // Populate form
        document.getElementById('edit-episode-series-name').value = linkData.seriesName || linkData.series_name || '';
        document.getElementById('edit-episode-start-from').value = linkData.startFromEpisode || linkData.start_from_episode || 1;
        document.getElementById('edit-episode-ads-enabled').checked = linkData.adsEnabled !== undefined ? linkData.adsEnabled : (linkData.ads_enabled !== undefined ? linkData.ads_enabled : true);

        // Populate episodes
        CRUDOperations.currentEditEpisodes = linkData.episodes || [];
        CRUDOperations.renderEditEpisodes();

        ModalManager.openModal('edit-episode-modal');
    },

    currentEditEpisodes: [],

    renderEditEpisodes: () => {
        const container = document.getElementById('edit-episodes-container');
        container.innerHTML = '';

        CRUDOperations.currentEditEpisodes.forEach((episode, index) => {
            const episodeDiv = document.createElement('div');
            episodeDiv.className = 'border rounded-lg p-4 space-y-3';
            // Create episode header safely
            const headerDiv = document.createElement('div');
            headerDiv.className = 'flex justify-between items-center';

            const headerTitle = document.createElement('h5');
            headerTitle.className = 'font-semibold';
            headerTitle.textContent = `Episode ${episode.episodeNumber || (index + 1)}`;

            const removeBtn = document.createElement('button');
            removeBtn.type = 'button';
            removeBtn.className = 'text-red-600 hover:text-red-800 remove-edit-episode-btn';
            removeBtn.setAttribute('data-episode-index', index);
            removeBtn.innerHTML = '<i data-lucide="trash-2" class="w-4 h-4"></i>';

            headerDiv.appendChild(headerTitle);
            headerDiv.appendChild(removeBtn);

            episodeDiv.appendChild(headerDiv);
            
            // Create form content div safely
            const formContentDiv = document.createElement('div');
            const gridDiv = document.createElement('div');
            gridDiv.className = 'grid grid-cols-1 gap-3';

            // Create 480p input
            const div480 = document.createElement('div');
            const label480 = document.createElement('label');
            label480.className = 'block text-sm font-medium mb-1';
            label480.textContent = '480p Link';
            const input480 = document.createElement('input');
            input480.type = 'url';
            input480.className = 'w-full p-2 border rounded text-sm';
            input480.value = episode.quality480p || '';
            input480.addEventListener('change', (e) => {
                CRUDOperations.updateEditEpisode(index, 'quality480p', e.target.value);
            });
            div480.appendChild(label480);
            div480.appendChild(input480);

            // Create 720p input
            const div720 = document.createElement('div');
            const label720 = document.createElement('label');
            label720.className = 'block text-sm font-medium mb-1';
            label720.textContent = '720p Link';
            const input720 = document.createElement('input');
            input720.type = 'url';
            input720.className = 'w-full p-2 border rounded text-sm';
            input720.value = episode.quality720p || '';
            input720.addEventListener('change', (e) => {
                CRUDOperations.updateEditEpisode(index, 'quality720p', e.target.value);
            });
            div720.appendChild(label720);
            div720.appendChild(input720);

            // Create 1080p input
            const div1080 = document.createElement('div');
            const label1080 = document.createElement('label');
            label1080.className = 'block text-sm font-medium mb-1';
            label1080.textContent = '1080p Link';
            const input1080 = document.createElement('input');
            input1080.type = 'url';
            input1080.className = 'w-full p-2 border rounded text-sm';
            input1080.value = episode.quality1080p || '';
            input1080.addEventListener('change', (e) => {
                CRUDOperations.updateEditEpisode(index, 'quality1080p', e.target.value);
            });
            div1080.appendChild(label1080);
            div1080.appendChild(input1080);

            gridDiv.appendChild(div480);
            gridDiv.appendChild(div720);
            gridDiv.appendChild(div1080);
            formContentDiv.appendChild(gridDiv);

            // Append both parts to episode div
            episodeDiv.appendChild(formContentDiv);
            container.appendChild(episodeDiv);
        });

        // Reinitialize Lucide icons for the new content
        lucide.createIcons();
    },

    addEditEpisode: () => {
        const startFromEpisode = parseInt(document.getElementById('edit-episode-start-from').value) || 1;
        const newEpisodeNumber = startFromEpisode + CRUDOperations.currentEditEpisodes.length;
        
        CRUDOperations.currentEditEpisodes.push({
            episodeNumber: newEpisodeNumber,
            quality480p: '',
            quality720p: '',
            quality1080p: ''
        });
        
        CRUDOperations.renderEditEpisodes();
    },

    removeEditEpisode: (index) => {
        CRUDOperations.currentEditEpisodes.splice(index, 1);
        
        // Renumber episodes
        const startFromEpisode = parseInt(document.getElementById('edit-episode-start-from').value) || 1;
        CRUDOperations.currentEditEpisodes.forEach((episode, i) => {
            episode.episodeNumber = startFromEpisode + i;
        });
        
        CRUDOperations.renderEditEpisodes();
    },

    updateEditEpisode: (index, field, value) => {
        if (CRUDOperations.currentEditEpisodes[index]) {
            CRUDOperations.currentEditEpisodes[index][field] = value;
        }
    },

    handleEditEpisodeSubmit: async (e) => {
        e.preventDefault();
        
        const seriesName = document.getElementById('edit-episode-series-name').value.trim();
        const startFromEpisode = parseInt(document.getElementById('edit-episode-start-from').value);
        const adsEnabled = document.getElementById('edit-episode-ads-enabled').checked;

        if (!seriesName || !startFromEpisode || CRUDOperations.currentEditEpisodes.length === 0) {
            utils.showToast('Error', 'Please fill in all required fields and add at least one episode', 'destructive');
            return;
        }

        try {
            await utils.apiRequest(`/api/quality-episodes/${CRUDOperations.currentEditingId}`, {
                method: 'PATCH',
                body: JSON.stringify({
                    seriesName,
                    startFromEpisode,
                    episodes: CRUDOperations.currentEditEpisodes,
                    adsEnabled
                })
            });

            utils.showToast('Success', 'Episode series updated successfully!', 'success');
            ModalManager.closeModal('edit-episode-modal');
            AdminPanel.loadAllLinks();
        } catch (error) {
            console.error('Error updating episode series:', error);
            utils.showToast('Error', 'Failed to update episode series', 'destructive');
        }
    },

    // Zip Operations
    openEditZip: (linkId, linkData) => {
        CRUDOperations.currentEditingId = linkId;
        CRUDOperations.currentEditingType = 'zip';

        // Populate form
        document.getElementById('edit-zip-movie-name').value = linkData.movieName || linkData.movie_name || '';
        document.getElementById('edit-zip-from-episode').value = linkData.fromEpisode || linkData.from_episode || '';
        document.getElementById('edit-zip-to-episode').value = linkData.toEpisode || linkData.to_episode || '';
        document.getElementById('edit-zip-quality-480p').value = linkData.quality480p || linkData.quality_480p || '';
        document.getElementById('edit-zip-quality-720p').value = linkData.quality720p || linkData.quality_720p || '';
        document.getElementById('edit-zip-quality-1080p').value = linkData.quality1080p || linkData.quality_1080p || '';
        document.getElementById('edit-zip-ads-enabled').checked = linkData.adsEnabled !== undefined ? linkData.adsEnabled : (linkData.ads_enabled !== undefined ? linkData.ads_enabled : true);

        ModalManager.openModal('edit-zip-modal');
    },

    handleEditZipSubmit: async (e) => {
        e.preventDefault();
        
        const movieName = document.getElementById('edit-zip-movie-name').value.trim();
        const fromEpisode = parseInt(document.getElementById('edit-zip-from-episode').value);
        const toEpisode = parseInt(document.getElementById('edit-zip-to-episode').value);
        const quality480p = document.getElementById('edit-zip-quality-480p').value.trim();
        const quality720p = document.getElementById('edit-zip-quality-720p').value.trim();
        const quality1080p = document.getElementById('edit-zip-quality-1080p').value.trim();
        const adsEnabled = document.getElementById('edit-zip-ads-enabled').checked;

        if (!movieName || !fromEpisode || !toEpisode || fromEpisode > toEpisode) {
            utils.showToast('Error', 'Please provide valid movie name and episode range', 'destructive');
            return;
        }

        if (!quality480p && !quality720p && !quality1080p) {
            utils.showToast('Error', 'Please provide at least one quality link', 'destructive');
            return;
        }

        try {
            await utils.apiRequest(`/api/quality-zips/${CRUDOperations.currentEditingId}`, {
                method: 'PATCH',
                body: JSON.stringify({
                    movieName,
                    fromEpisode,
                    toEpisode,
                    quality480p: quality480p || null,
                    quality720p: quality720p || null,
                    quality1080p: quality1080p || null,
                    adsEnabled
                })
            });

            utils.showToast('Success', 'Quality zip updated successfully!', 'success');
            ModalManager.closeModal('edit-zip-modal');
            AdminPanel.loadAllLinks();
        } catch (error) {
            console.error('Error updating quality zip:', error);
            utils.showToast('Error', 'Failed to update quality zip', 'destructive');
        }
    },

    // Token Operations
    openEditToken: (tokenId, tokenData) => {
        CRUDOperations.currentEditingId = tokenId;
        CRUDOperations.currentEditingType = 'token';

        // Populate form
        document.getElementById('edit-token-name').value = tokenData.name || '';
        document.getElementById('edit-token-type').value = tokenData.type || '';
        document.getElementById('edit-token-active').checked = tokenData.isActive !== undefined ? tokenData.isActive : (tokenData.is_active !== undefined ? tokenData.is_active : true);

        ModalManager.openModal('edit-token-modal');
    },

    handleEditTokenSubmit: async (e) => {
        e.preventDefault();
        
        const isActive = document.getElementById('edit-token-active').checked;

        try {
            await utils.apiRequest(`/api/tokens/${CRUDOperations.currentEditingId}`, {
                method: 'PATCH',
                body: JSON.stringify({
                    isActive
                })
            });

            utils.showToast('Success', 'Token updated successfully!', 'success');
            ModalManager.closeModal('edit-token-modal');
            AdminPanel.loadAllTokens(); // Refresh tokens table
        } catch (error) {
            console.error('Error updating token:', error);
            utils.showToast('Error', 'Failed to update token', 'destructive');
        }
    },

    // Delete Operations
    openDeleteConfirmation: (itemId, itemType, itemName) => {
        CRUDOperations.currentDeletingId = itemId;
        CRUDOperations.currentDeletingType = itemType;

        const message = `Are you sure you want to delete "${itemName}"? This action cannot be undone.`;
        document.getElementById('delete-confirmation-message').textContent = message;

        ModalManager.openModal('delete-confirmation-modal');
    },

    handleConfirmDelete: async () => {
        const { currentDeletingId, currentDeletingType } = CRUDOperations;

        if (!currentDeletingId || !currentDeletingType) {
            utils.showToast('Error', 'Invalid deletion request', 'destructive');
            return;
        }

        try {
            let endpoint;
            switch (currentDeletingType) {
                case 'single':
                    endpoint = `/api/movie-links/${currentDeletingId}`;
                    break;
                case 'quality':
                    endpoint = `/api/quality-movie-links/${currentDeletingId}`;
                    break;
                case 'episode':
                    endpoint = `/api/quality-episodes/${currentDeletingId}`;
                    break;
                case 'zip':
                    endpoint = `/api/quality-zips/${currentDeletingId}`;
                    break;
                case 'token':
                    endpoint = `/api/tokens/${currentDeletingId}`;
                    break;
                default:
                    throw new Error('Unknown deletion type');
            }

            await utils.apiRequest(endpoint, {
                method: 'DELETE'
            });

            utils.showToast('Success', 'Item deleted successfully!', 'success');
            ModalManager.closeModal('delete-confirmation-modal');
            
            // Refresh appropriate table
            if (currentDeletingType === 'token') {
                AdminPanel.loadAllTokens();
            } else {
                AdminPanel.loadAllLinks();
            }

            // Reset delete state
            CRUDOperations.currentDeletingId = null;
            CRUDOperations.currentDeletingType = null;
        } catch (error) {
            console.error('Error deleting item:', error);
            utils.showToast('Error', 'Failed to delete item', 'destructive');
        }
    }
};

// Update AdminPanel to use new CRUD operations
AdminPanel.editLink = (linkId, linkType, linkData) => {
    switch (linkType) {
        case 'single':
            CRUDOperations.openEditSingle(linkId, linkData);
            break;
        case 'quality':
            CRUDOperations.openEditQuality(linkId, linkData);
            break;
        case 'episode':
            CRUDOperations.openEditEpisode(linkId, linkData);
            break;
        case 'zip':
            CRUDOperations.openEditZip(linkId, linkData);
            break;
        case 'token':
            CRUDOperations.openEditToken(linkId, linkData);
            break;
        default:
            utils.showToast('Error', 'Unknown link type for editing', 'destructive');
    }
};

AdminPanel.deleteLink = (linkId, linkType, linkName) => {
    CRUDOperations.openDeleteConfirmation(linkId, linkType, linkName || 'this item');
};

// Export for global access
window.AdminPanel = AdminPanel;
window.RedirectPage = RedirectPage;
window.ModalManager = ModalManager;
window.CRUDOperations = CRUDOperations;
window.utils = utils;