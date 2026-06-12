const workForm = document.getElementById('work-form');
const worksList = document.getElementById('works-list');
const formTitle = document.getElementById('form-title');
const submitBtn = document.getElementById('submit-btn');
const cancelEditBtn = document.getElementById('cancel-edit-btn');
const imageFileInput = document.getElementById('image-file');
const imageUrlInput = document.getElementById('image');
const galleryFilesInput = document.getElementById('gallery-files');
const galleryStatus = document.getElementById('gallery-status');
const coverPreview = document.getElementById('cover-preview');
const galleryPreview = document.getElementById('gallery-preview');

let editingId = null;
let galleryUrls = [];

function updateCoverPreview(message = '已上傳封面圖') {
    const url = imageUrlInput.value.trim();

    if (!url) {
        coverPreview.hidden = true;
        coverPreview.innerHTML = '';
        return;
    }

    coverPreview.hidden = false;
    coverPreview.innerHTML = `
        <img src="${escapeHtml(url)}" alt="封面預覽">
        <span>${escapeHtml(message)}</span>
    `;
}

function updateGalleryPreview() {
    if (galleryUrls.length === 0) {
        galleryStatus.hidden = true;
        galleryStatus.textContent = '';
        galleryPreview.innerHTML = '';
        return;
    }

    galleryStatus.hidden = false;
    galleryStatus.textContent = `已上傳 ${galleryUrls.length} 張詳情圖`;
    galleryPreview.innerHTML = galleryUrls.map((url, index) => `
        <img src="${escapeHtml(url)}" alt="詳情圖 ${index + 1}">
    `).join('');
}

function resetForm() {
    editingId = null;
    workForm.reset();
    imageUrlInput.value = '';
    galleryUrls = [];
    updateCoverPreview();
    updateGalleryPreview();
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
    imageUrlInput.value = work.image;
    galleryUrls = [...(work.gallery || [])];
    updateCoverPreview('目前封面圖');
    updateGalleryPreview();
    document.getElementById('year').value = work.year;
    document.getElementById('area').value = work.area;
    document.getElementById('location').value = work.location;
    document.getElementById('featured').checked = Boolean(work.featured);
    formTitle.textContent = '編輯作品';
    submitBtn.textContent = '儲存變更';
    cancelEditBtn.hidden = false;
}

function appendGalleryUrl(url) {
    galleryUrls.push(url);
    updateGalleryPreview();
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
                <p class="admin-work-sub">${(work.gallery || []).length} 張詳情圖</p>
            </div>
            <div class="admin-work-actions">
                <a href="work-detail.html?id=${encodeURIComponent(work.id)}" class="btn btn-secondary btn-small" target="_blank" rel="noopener">預覽</a>
                <button type="button" class="btn btn-secondary btn-small" data-edit="${work.id}">編輯</button>
                <button type="button" class="btn btn-danger btn-small" data-delete="${work.id}">刪除</button>
            </div>
        `;
        worksList.appendChild(item);
    });
}

async function loadWorks() {
    const works = await fetchWorks();
    renderWorksList(works);
    return works;
}

cancelEditBtn.addEventListener('click', () => {
    resetForm();
    hideAdminMessage();
});

imageFileInput.addEventListener('change', async () => {
    const file = imageFileInput.files[0];
    if (!file) return;

    hideAdminMessage();
    coverPreview.hidden = false;
    coverPreview.innerHTML = `<span>封面圖上傳中…</span>`;
    imageFileInput.disabled = true;

    try {
        const url = await uploadWorkImage(file);
        imageUrlInput.value = url;
        updateCoverPreview('已上傳封面圖');
        showAdminMessage('封面圖上傳成功（已加入浮水印）');
        imageFileInput.value = '';
    } catch (error) {
        updateCoverPreview();
        showAdminMessage(error.message, 'error');
    } finally {
        imageFileInput.disabled = false;
    }
});

galleryFilesInput.addEventListener('change', async () => {
    const files = Array.from(galleryFilesInput.files || []);
    if (files.length === 0) return;

    hideAdminMessage();
    galleryStatus.hidden = false;
    galleryStatus.textContent = `詳情圖上傳中…（${files.length} 張）`;
    galleryFilesInput.disabled = true;

    try {
        for (const file of files) {
            const url = await uploadWorkImage(file);
            appendGalleryUrl(url);
        }
        showAdminMessage(`已上傳 ${files.length} 張詳情圖（已加入浮水印）`);
        galleryFilesInput.value = '';
    } catch (error) {
        updateGalleryPreview();
        showAdminMessage(error.message, 'error');
    } finally {
        galleryFilesInput.disabled = false;
    }
});

workForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    hideAdminMessage();

    const payload = {
        title: document.getElementById('title').value.trim(),
        category: document.getElementById('category').value.trim(),
        description: document.getElementById('description').value.trim(),
        image: imageUrlInput.value.trim(),
        gallery: [...galleryUrls],
        year: document.getElementById('year').value.trim(),
        area: document.getElementById('area').value.trim(),
        location: document.getElementById('location').value.trim(),
        featured: document.getElementById('featured').checked
    };

    if (!payload.image) {
        showAdminMessage('請上傳封面圖', 'error');
        return;
    }

    try {
        if (editingId) {
            await updateWork(editingId, payload);
            showAdminMessage('作品已更新');
        } else {
            await createWork(payload);
            showAdminMessage('作品已新增');
        }

        resetForm();
        await loadWorks();
    } catch (error) {
        showAdminMessage(error.message, 'error');
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
            showAdminMessage(error.message, 'error');
        }
        return;
    }

    if (deleteId) {
        if (!window.confirm('確定要刪除這件作品嗎？')) return;

        try {
            await deleteWork(deleteId);
            showAdminMessage('作品已刪除');
            if (editingId === deleteId) resetForm();
            await loadWorks();
        } catch (error) {
            showAdminMessage(error.message, 'error');
        }
    }
});

initAdminAuth({
    currentPage: 'works',
    onLoggedIn: loadWorks
});
