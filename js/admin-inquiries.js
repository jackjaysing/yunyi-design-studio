const inquiriesList = document.getElementById('inquiries-list');
const refreshInquiriesBtn = document.getElementById('refresh-inquiries-btn');

function renderInquiriesList(inquiries) {
    inquiriesList.innerHTML = '';

    if (inquiries.length === 0) {
        inquiriesList.innerHTML = '<p class="admin-empty">目前尚無預約資料。</p>';
        return;
    }

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

async function loadInquiries() {
    const inquiries = await fetchInquiries();
    renderInquiriesList(inquiries);
    return inquiries;
}

refreshInquiriesBtn.addEventListener('click', () => {
    loadInquiries()
        .then(() => showAdminMessage('預約列表已更新'))
        .catch((error) => showAdminMessage(error.message, 'error'));
});

inquiriesList.addEventListener('click', async (event) => {
    const deleteId = event.target.dataset.deleteInquiry;
    if (!deleteId) return;

    if (!window.confirm('確定要刪除這筆預約嗎？')) return;

    try {
        await deleteInquiry(deleteId);
        showAdminMessage('預約已刪除');
        await loadInquiries();
    } catch (error) {
        showAdminMessage(error.message, 'error');
    }
});

initAdminAuth({
    currentPage: 'inquiries',
    onLoggedIn: loadInquiries
});
