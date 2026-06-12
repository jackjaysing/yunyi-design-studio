const ADMIN_SESSION_KEY = 'yunyi_admin_logged_in';

const loginSection = document.getElementById('login-section');
const adminSection = document.getElementById('admin-section');
const loginForm = document.getElementById('login-form');
const workForm = document.getElementById('work-form');
const worksList = document.getElementById('works-list');
const inquiriesList = document.getElementById('inquiries-list');
const inquiriesBadge = document.getElementById('inquiries-badge');
const worksPanel = document.getElementById('works-panel');
const inquiriesPanel = document.getElementById('inquiries-panel');
const formTitle = document.getElementById('form-title');
const submitBtn = document.getElementById('submit-btn');
const cancelEditBtn = document.getElementById('cancel-edit-btn');
const logoutBtn = document.getElementById('logout-btn');
const refreshInquiriesBtn = document.getElementById('refresh-inquiries-btn');
const adminTabs = document.querySelectorAll('.admin-tab');
const adminMessage = document.getElementById('admin-message');
const imageFileInput = document.getElementById('image-file');
const imageUrlInput = document.getElementById('image');

let editingId = null;
let activeTab = 'works';

function isLoggedIn() {
    return localStorage.getItem(ADMIN_SESSION_KEY) === '1';
}

function setLoggedIn(value) {
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

function showMessage(text, type = 'success') {
    adminMessage.textContent = text;
    adminMessage.className = `admin-message admin-message--${type}`;
    adminMessage.hidden = false;
}

function hideMessage() {
    adminMessage.hidden = true;
}

function showAdmin() {
    loginSection.hidden = true;
    adminSection.hidden = false;
    logoutBtn.hidden = false;
}

function showLogin() {
    loginSection.hidden = false;
    adminSection.hidden = true;
    logoutBtn.hidden = true;
}

function setActiveTab(tab) {
    activeTab = tab;

    adminTabs.forEach((button) => {
        button.classList.toggle('active', button.dataset.tab === tab);
    });

    worksPanel.hidden = tab !== 'works';
    inquiriesPanel.hidden = tab !== 'inquiries';
}

function resetForm() {
    editingId = null;
    workForm.reset();
    formTitle.textContent = '新增作品';
    submitBtn.textContent = '新增作品';
    cancelEditBtn.hidden = true;
    document.getElementById('featured').checked = false;
}

function fillForm(work) {
    editingId = work.id;
    document.getElementById('title').value = work.title;
    document.getElementById('category').value = work.category;
    document.getElementById('description').value = work.description;
    document.getElementById('image').value = work.image;
    document.getElementById('year').value = work.year;
    document.getElementById('area').value = work.area;
    document.getElementById('location').value = work.location;
    document.getElementById('featured').checked = Boolean(work.featured);
    formTitle.textContent = '編輯作品';
    submitBtn.textContent = '儲存變更';
    cancelEditBtn.hidden = false;
    setActiveTab('works');
}

function renderWorksList(works) {
    worksList.innerHTML = '';

    if (works.length === 0) {
        worksList.innerHTML = '<p class="admin-empty">目前尚無作品，請從左側表單新增。</p>';
        return;
    }

    works.forEach((work) => {
        const item = document.createElement('div');
        item.className = 'admin-work-item';
        item.innerHTML = `
            <img src="${escapeHtml(work.image)}" alt="${escapeHtml(work.title)}">
            <div class="admin-work-info">
                <h3>${escapeHtml(work.title)}</h3>
                <p>${escapeHtml(work.category)} · ${escapeHtml(work.year)}${work.featured ? ' · 精選' : ''}</p>
            </div>
            <div class="admin-work-actions">
                <button type="button" class="btn btn-secondary btn-small" data-edit="${work.id}">編輯</button>
                <button type="button" class="btn btn-danger btn-small" data-delete="${work.id}">刪除</button>
            </div>
        `;
        worksList.appendChild(item);
    });
}

function renderInquiriesList(inquiries) {
    inquiriesList.innerHTML = '';

    if (inquiries.length === 0) {
        inquiriesList.innerHTML = '<p class="admin-empty">目前尚無預約資料。</p>';
        inquiriesBadge.hidden = true;
        return;
    }

    inquiriesBadge.hidden = false;
    inquiriesBadge.textContent = String(inquiries.length);

    inquiries.forEach((inquiry) => {
        const item = document.createElement('article');
        item.className = 'admin-inquiry-item';
        item.innerHTML = `
            <div class="admin-inquiry-top">
                <div>
                    <h3>${escapeHtml(inquiry.name)}</h3>
                    <p class="admin-inquiry-meta">${escapeHtml(formatDateTime(inquiry.createdAt))}</p>
                </div>
                <button type="button" class="btn btn-danger btn-small" data-delete-inquiry="${inquiry.id}">刪除</button>
            </div>
            <dl class="admin-inquiry-details">
                <div><dt>電話</dt><dd>${escapeHtml(inquiry.phone)}</dd></div>
                <div><dt>信箱</dt><dd>${escapeHtml(inquiry.email || '—')}</dd></div>
                <div><dt>需求類型</dt><dd>${escapeHtml(inquiry.service || '—')}</dd></div>
            </dl>
            <p class="admin-inquiry-message">${escapeHtml(inquiry.message)}</p>
        `;
        inquiriesList.appendChild(item);
    });
}

async function loadWorks() {
    const works = await fetchWorks();
    renderWorksList(works);
    return works;
}

async function loadInquiries() {
    const inquiries = await fetchInquiries();
    renderInquiriesList(inquiries);
    return inquiries;
}

async function loadAdminData() {
    await Promise.all([loadWorks(), loadInquiries()]);
}

loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    hideMessage();

    const password = document.getElementById('password').value;

    if (!isSupabaseConfigured()) {
        showMessage('請先設定 Supabase 連線（.env + npm run config）', 'error');
        return;
    }

    if (password !== getAdminPassword()) {
        showMessage('密碼錯誤', 'error');
        return;
    }

    setLoggedIn(true);
    showAdmin();
    setActiveTab('works');

    try {
        await loadAdminData();
    } catch (error) {
        showMessage(error.message, 'error');
    }
});

logoutBtn.addEventListener('click', () => {
    setLoggedIn(false);
    resetForm();
    showLogin();
});

cancelEditBtn.addEventListener('click', () => {
    resetForm();
    hideMessage();
});

adminTabs.forEach((button) => {
    button.addEventListener('click', () => {
        setActiveTab(button.dataset.tab);
        if (button.dataset.tab === 'inquiries') {
            loadInquiries().catch((error) => showMessage(error.message, 'error'));
        }
    });
});

refreshInquiriesBtn.addEventListener('click', () => {
    loadInquiries()
        .then(() => showMessage('預約列表已更新'))
        .catch((error) => showMessage(error.message, 'error'));
});

imageFileInput.addEventListener('change', async () => {
    const file = imageFileInput.files[0];
    if (!file) return;

    hideMessage();

    try {
        const url = await uploadWorkImage(file);
        imageUrlInput.value = url;
        showMessage('圖片上傳成功');
    } catch (error) {
        showMessage(error.message, 'error');
    } finally {
        imageFileInput.value = '';
    }
});

workForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    hideMessage();

    const payload = {
        title: document.getElementById('title').value.trim(),
        category: document.getElementById('category').value.trim(),
        description: document.getElementById('description').value.trim(),
        image: document.getElementById('image').value.trim(),
        year: document.getElementById('year').value.trim(),
        area: document.getElementById('area').value.trim(),
        location: document.getElementById('location').value.trim(),
        featured: document.getElementById('featured').checked
    };

    try {
        if (editingId) {
            await updateWork(editingId, payload);
            showMessage('作品已更新');
        } else {
            await createWork(payload);
            showMessage('作品已新增');
        }

        resetForm();
        await loadWorks();
    } catch (error) {
        showMessage(error.message, 'error');
    }
});

worksList.addEventListener('click', async (event) => {
    const editId = event.target.dataset.edit;
    const deleteId = event.target.dataset.delete;

    if (editId) {
        try {
            const works = await loadWorks();
            const work = works.find((item) => item.id === editId);
            if (work) {
                fillForm(work);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        } catch (error) {
            showMessage(error.message, 'error');
        }
        return;
    }

    if (deleteId) {
        if (!window.confirm('確定要刪除這件作品嗎？')) return;

        try {
            await deleteWork(deleteId);
            showMessage('作品已刪除');
            if (editingId === deleteId) resetForm();
            await loadWorks();
        } catch (error) {
            showMessage(error.message, 'error');
        }
    }
});

inquiriesList.addEventListener('click', async (event) => {
    const deleteId = event.target.dataset.deleteInquiry;
    if (!deleteId) return;

    if (!window.confirm('確定要刪除這筆預約嗎？')) return;

    try {
        await deleteInquiry(deleteId);
        showMessage('預約已刪除');
        await loadInquiries();
    } catch (error) {
        showMessage(error.message, 'error');
    }
});

if (isLoggedIn()) {
    showAdmin();
    setActiveTab('works');
    loadAdminData().catch((error) => {
        setLoggedIn(false);
        showLogin();
        showMessage(error.message, 'error');
    });
} else {
    showLogin();
}
