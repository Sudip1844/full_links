// MovieZone Admin Panel - Static HTML Version
// Converting React functionality to vanilla JavaScript

// Global state management
const AppState = {
    isLoggedIn: false,
    currentUser: null,
    apiBaseUrl: '', // Will be set from environment or default
    adminCredentials: { id: '', password: '' },
    credentialsLoaded: false,
    movieData: null,
    countdown: 10,
    showContinueSection: false
};

// Utility functions
const utils = {
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
            const response = await fetch(url, { ...defaultOptions, ...options });
            
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
        toast.innerHTML = `
            <div style="font-weight: 600; margin-bottom: 0.25rem;">${title}</div>
            <div style="font-size: 0.875rem; color: hsl(var(--muted-foreground));">${description}</div>
        `;
        
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
        // Check if already logged in
        const isLoggedIn = localStorage.getItem('moviezone_admin_logged_in');
        if (isLoggedIn === 'true') {
            Auth.showAdminPanel();
        }

        // Fetch admin credentials on page load
        Auth.fetchCredentials();

        // Login form handler
        document.getElementById('login-form').addEventListener('submit', Auth.handleLogin);
        
        // Logout button handler
        document.getElementById('logout-button').addEventListener('click', Auth.handleLogout);
    },

    fetchCredentials: async () => {
        try {
            AppState.apiBaseUrl = window.location.origin.includes('localhost') 
                ? 'http://localhost:5000' 
                : window.location.origin;

            const response = await utils.apiRequest('/api/admin-config');
            AppState.adminCredentials.id = response.adminId;
            AppState.adminCredentials.password = response.adminPassword;
            AppState.credentialsLoaded = true;
        } catch (error) {
            console.error('Failed to load admin credentials:', error);
            AppState.credentialsLoaded = true; // Still allow login attempt
        }
    },

    handleLogin: async (e) => {
        e.preventDefault();
        
        if (!AppState.credentialsLoaded) {
            utils.showToast('Please wait', 'Loading admin configuration...', 'default');
            return;
        }

        const formData = new FormData(e.target);
        const adminId = document.getElementById('admin-id').value;
        const password = document.getElementById('password').value;

        const loginButton = document.getElementById('login-button');
        loginButton.textContent = 'Logging in...';
        loginButton.disabled = true;

        // Simulate delay for better UX
        await new Promise(resolve => setTimeout(resolve, 500));

        if (adminId === AppState.adminCredentials.id && password === AppState.adminCredentials.password) {
            localStorage.setItem('moviezone_admin_logged_in', 'true');
            utils.showToast('Login Successful', 'Welcome to MovieZone Admin Panel', 'success');
            Auth.showAdminPanel();
        } else {
            utils.showToast('Login Failed', 'Invalid credentials. Please try again.', 'destructive');
        }

        loginButton.textContent = 'Login';
        loginButton.disabled = false;
    },

    handleLogout: () => {
        localStorage.removeItem('moviezone_admin_logged_in');
        AppState.isLoggedIn = false;
        
        // Show login page, hide admin panel
        document.getElementById('login-page').classList.remove('hidden');
        document.getElementById('admin-page').classList.add('hidden');
        document.getElementById('redirect-page').classList.add('hidden');
        
        // Clear form
        document.getElementById('login-form').reset();
        
        utils.showToast('Logged out', 'You have been logged out successfully', 'default');
    },

    showAdminPanel: () => {
        AppState.isLoggedIn = true;
        
        // Hide login page, show admin panel
        document.getElementById('login-page').classList.add('hidden');
        document.getElementById('admin-page').classList.remove('hidden');
        document.getElementById('redirect-page').classList.add('hidden');
        
        // Load admin panel data
        AdminPanel.init();
    }
};

// Admin Panel functionality
const AdminPanel = {
    init: () => {
        AdminPanel.loadStatistics();
        AdminPanel.loadRecentLinks();
        AdminPanel.initForms();
        AdminPanel.loadDatabaseTable();
        AdminPanel.loadTokens();
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
                tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted-foreground">No recent links</td></tr>';
                return;
            }

            tbody.innerHTML = links.map(link => `
                <tr>
                    <td>${link.movieName}</td>
                    <td>
                        <div class="flex items-center space-x-2">
                            <code class="text-xs">${window.location.origin}/m/${link.shortId}</code>
                            <button onclick="utils.copyToClipboard('${window.location.origin}/m/${link.shortId}')" 
                                    class="button button-outline" style="padding: 0.25rem;">
                                <i data-lucide="copy" style="width: 0.75rem; height: 0.75rem;"></i>
                            </button>
                        </div>
                    </td>
                    <td><span class="badge badge-primary">Single</span></td>
                    <td>${link.views || 0}</td>
                    <td>
                        <button onclick="AdminPanel.editLink(${link.id})" class="button button-outline" style="padding: 0.25rem 0.5rem;">
                            <i data-lucide="edit" style="width: 0.75rem; height: 0.75rem;"></i>
                        </button>
                    </td>
                </tr>
            `).join('');

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
                <button type="button" onclick="this.parentElement.parentElement.remove()" class="button button-outline" style="padding: 0.25rem 0.5rem;">
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
            const links = await utils.apiRequest('/api/movie-links');
            const tbody = document.getElementById('database-table');
            
            if (links.length === 0) {
                tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted-foreground">No links found</td></tr>';
                return;
            }

            tbody.innerHTML = links.map(link => `
                <tr>
                    <td>${link.id}</td>
                    <td>${link.movieName}</td>
                    <td><code class="text-xs">${link.shortId}</code></td>
                    <td>${link.views || 0}</td>
                    <td>
                        <span class="badge ${link.adsEnabled ? 'badge-primary' : 'badge-secondary'}">
                            ${link.adsEnabled ? 'Enabled' : 'Disabled'}
                        </span>
                    </td>
                    <td>${utils.formatDate(link.dateAdded)}</td>
                    <td>
                        <div class="flex space-x-2">
                            <button onclick="AdminPanel.editLink(${link.id})" class="button button-outline" style="padding: 0.25rem 0.5rem;">
                                <i data-lucide="edit" style="width: 0.75rem; height: 0.75rem;"></i>
                            </button>
                            <button onclick="AdminPanel.deleteLink(${link.id})" class="button button-outline" style="padding: 0.25rem 0.5rem;">
                                <i data-lucide="trash-2" style="width: 0.75rem; height: 0.75rem;"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `).join('');

            lucide.createIcons();
        } catch (error) {
            console.error('Failed to load database table:', error);
        }
    },

    loadTokens: async () => {
        try {
            const tokens = await utils.apiRequest('/api/tokens');
            const tbody = document.getElementById('tokens-table');
            
            if (tokens.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted-foreground">No tokens found</td></tr>';
                return;
            }

            tbody.innerHTML = tokens.map(token => `
                <tr>
                    <td>${token.name}</td>
                    <td><span class="badge badge-secondary">${token.type}</span></td>
                    <td><code class="text-xs">${token.token.substring(0, 20)}...</code></td>
                    <td>
                        <span class="badge ${token.isActive ? 'badge-primary' : 'badge-secondary'}">
                            ${token.isActive ? 'Active' : 'Inactive'}
                        </span>
                    </td>
                    <td>${utils.formatDate(token.createdAt)}</td>
                    <td>
                        <div class="flex space-x-2">
                            <button onclick="AdminPanel.toggleToken(${token.id})" class="button button-outline" style="padding: 0.25rem 0.5rem;">
                                <i data-lucide="power" style="width: 0.75rem; height: 0.75rem;"></i>
                            </button>
                            <button onclick="AdminPanel.deleteToken(${token.id})" class="button button-outline" style="padding: 0.25rem 0.5rem;">
                                <i data-lucide="trash-2" style="width: 0.75rem; height: 0.75rem;"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `).join('');

            lucide.createIcons();
        } catch (error) {
            console.error('Failed to load tokens:', error);
        }
    },

    editLink: (id) => {
        utils.showToast('Edit Feature', 'Edit functionality will be implemented in the next update', 'default');
    },

    deleteLink: async (id) => {
        if (!confirm('Are you sure you want to delete this link?')) return;
        
        try {
            await utils.apiRequest(`/api/movie-links/${id}`, { method: 'DELETE' });
            utils.showToast('Success!', 'Link deleted successfully', 'success');
            AdminPanel.loadDatabaseTable();
            AdminPanel.loadRecentLinks();
            AdminPanel.loadStatistics();
        } catch (error) {
            utils.showToast('Error', 'Failed to delete link', 'destructive');
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
    }
};

// Redirect Page functionality
const RedirectPage = {
    show: () => {
        document.getElementById('login-page').classList.add('hidden');
        document.getElementById('admin-page').classList.add('hidden');
        document.getElementById('redirect-page').classList.remove('hidden');
    },

    showWithData: (linkData) => {
        RedirectPage.show();
        AppState.movieData = linkData;
        
        document.getElementById('movie-title').textContent = `${linkData.movieName}`;
        
        // If ads are disabled or timer should be skipped
        if (!linkData.adsEnabled || linkData.skipTimer) {
            RedirectPage.showContinueSection();
        } else {
            RedirectPage.startCountdown();
        }
    },

    showError: (message) => {
        RedirectPage.show();
        document.getElementById('movie-title').textContent = message;
        document.getElementById('timer-section').classList.add('hidden');
        document.getElementById('continue-section').innerHTML = `
            <div class="bg-white/10 backdrop-blur-sm rounded-lg p-6 mb-6">
                <h3 class="text-2xl font-bold mb-4">Link Not Available</h3>
                <p class="text-blue-200">${message}</p>
            </div>
        `;
        document.getElementById('continue-section').classList.remove('hidden');
    },


    startCountdown: () => {
        const countdownElement = document.getElementById('countdown');
        AppState.countdown = 10;
        
        const timer = setInterval(() => {
            AppState.countdown--;
            countdownElement.textContent = AppState.countdown;
            
            if (AppState.countdown <= 0) {
                clearInterval(timer);
                RedirectPage.showContinueSection();
            }
        }, 1000);
    },

    showContinueSection: () => {
        document.getElementById('timer-section').classList.add('hidden');
        document.getElementById('continue-section').classList.remove('hidden');
        
        const movieData = AppState.movieData;
        
        if (movieData.linkType === 'quality' || movieData.linkType === 'episode' || movieData.linkType === 'zip') {
            // Show quality options
            document.getElementById('quality-options').classList.remove('hidden');
            
            const qualityButtons = document.querySelectorAll('.quality-button');
            qualityButtons.forEach(button => {
                button.addEventListener('click', () => {
                    const quality = button.getAttribute('data-quality');
                    RedirectPage.handleQualitySelection(quality);
                });
            });
        } else {
            // Show single continue button
            document.getElementById('single-link-option').classList.remove('hidden');
            document.getElementById('continue-button').addEventListener('click', () => {
                window.location.href = movieData.originalLink;
            });
        }
    },

    handleQualitySelection: (quality) => {
        const movieData = AppState.movieData;
        const qualityKey = `quality${quality}`;
        
        if (movieData[qualityKey]) {
            window.location.href = movieData[qualityKey];
        } else {
            utils.showToast('Not Available', `${quality} quality is not available for this content`, 'destructive');
        }
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
    
    // Initialize Lucide icons
    lucide.createIcons();
    
    console.log('MovieZone Admin Panel initialized');
});

// Handle browser navigation
window.addEventListener('popstate', () => {
    // Reinitialize router
    Router.init();
});

// Export for global access
window.AdminPanel = AdminPanel;
window.utils = utils;