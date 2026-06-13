const ADMIN_SESSION_KEY = 'yunyi_admin_logged_in';

function isAdminLoggedIn() {
    return localStorage.getItem(ADMIN_SESSION_KEY) === '1';
}

function setAdminLoggedIn(value) {
    if (value) {
        localStorage.setItem(ADMIN_SESSION_KEY, '1');
    } else {
        localStorage.removeItem(ADMIN_SESSION_KEY);
    }
}

function escapeHtml(text) {
    return String(text ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function formatDateTime(value) {
    if (!value) return '';
    return new Date(value).toLocaleString('zh-TW', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function showAdminMessage(text, type = 'success') {
    const adminMessage = document.getElementById('admin-message');
    if (!adminMessage) return;
    adminMessage.textContent = text;
    adminMessage.className = `admin-message admin-message--${type}`;
    adminMessage.hidden = false;
}

function hideAdminMessage() {
    const adminMessage = document.getElementById('admin-message');
    if (adminMessage) adminMessage.hidden = true;
}

function initPasswordToggle() {
    const passwordInput = document.getElementById('password');
    const toggleBtn = document.querySelector('[data-password-toggle]');

    if (!passwordInput || !toggleBtn) {
        return;
    }

    toggleBtn.addEventListener('click', () => {
        const showPassword = passwordInput.type === 'password';
        passwordInput.type = showPassword ? 'text' : 'password';
        toggleBtn.classList.toggle('is-visible', showPassword);
        toggleBtn.setAttribute('aria-pressed', String(showPassword));
        toggleBtn.setAttribute('aria-label', showPassword ? '隱藏密碼' : '顯示密碼');
    });
}

function renderAdminSubnav(currentPage) {
    const subnav = document.getElementById('admin-subnav');
    if (!subnav) return;

    subnav.innerHTML = `
        <a href="admin.html" class="${currentPage === 'works' ? 'active' : ''}">作品管理</a>
        <a href="admin-inquiries.html" class="${currentPage === 'inquiries' ? 'active' : ''}">預約管理</a>
        <a href="admin-settings.html" class="${currentPage === 'settings' ? 'active' : ''}">工作室設定</a>
    `;
}

function initAdminAuth({ currentPage, onLoggedIn }) {
    const loginSection = document.getElementById('login-section');
    const adminSection = document.getElementById('admin-section');
    const loginForm = document.getElementById('login-form');
    const logoutBtn = document.getElementById('logout-btn');

    function showAdmin() {
        loginSection.hidden = true;
        adminSection.hidden = false;
        logoutBtn.hidden = false;
        renderAdminSubnav(currentPage);
    }

    function showLogin() {
        loginSection.hidden = false;
        adminSection.hidden = true;
        logoutBtn.hidden = true;
    }

    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        hideAdminMessage();

        const password = document.getElementById('password').value;

        if (!isSupabaseConfigured()) {
            showAdminMessage('請先設定 Supabase 連線（.env + npm run config）', 'error');
            return;
        }

        if (password !== getAdminPassword()) {
            showAdminMessage('密碼錯誤', 'error');
            return;
        }

        setAdminLoggedIn(true);
        showAdmin();

        try {
            await onLoggedIn();
        } catch (error) {
            showAdminMessage(error.message, 'error');
        }
    });

    logoutBtn.addEventListener('click', () => {
        setAdminLoggedIn(false);
        showLogin();
    });

    if (isAdminLoggedIn()) {
        showAdmin();
        onLoggedIn().catch((error) => {
            setAdminLoggedIn(false);
            showLogin();
            showAdminMessage(error.message, 'error');
        });
    } else {
        showLogin();
    }
}

initPasswordToggle();
