const detailContent = document.getElementById('work-detail-content');
const detailEmpty = document.getElementById('work-detail-empty');

function renderWorkDetail(work) {
    document.title = `${work.title} | 允藝設計工作室`;

    const galleryItems = (work.gallery || []).map((url) => `
        <figure class="work-detail-gallery-item">
            <img src="${escapeHtml(url)}" alt="${escapeHtml(work.title)} 詳情圖">
        </figure>
    `).join('');

    detailContent.innerHTML = `
        <article class="work-detail">
            <div class="work-detail-hero">
                <img src="${escapeHtml(work.image)}" alt="${escapeHtml(work.title)}">
            </div>
            <div class="work-detail-info">
                <span class="work-card-category">${escapeHtml(work.category)}</span>
                <h1 class="work-detail-title">${escapeHtml(work.title)}</h1>
                <div class="work-card-meta work-detail-meta">
                    ${work.location ? `<span>${escapeHtml(work.location)}</span>` : ''}
                    ${work.area ? `<span>${escapeHtml(work.area)}</span>` : ''}
                    ${work.year ? `<span>${escapeHtml(work.year)}</span>` : ''}
                </div>
                <p class="work-detail-desc">${escapeHtml(work.description || '')}</p>
                <a href="contact.html" class="btn btn-primary">預約諮詢</a>
            </div>
            ${galleryItems ? `
                <section class="work-detail-gallery">
                    <h2>作品詳圖</h2>
                    <div class="work-detail-gallery-grid">${galleryItems}</div>
                </section>
            ` : ''}
        </article>
    `;
}

async function loadWorkDetail() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');

    if (!id) {
        detailEmpty.hidden = false;
        detailEmpty.textContent = '找不到這件作品。';
        return;
    }

    try {
        if (!isSupabaseConfigured()) {
            throw new Error('請先設定 Supabase 連線');
        }

        const work = await fetchWorkById(id);
        renderWorkDetail(work);
    } catch {
        detailEmpty.hidden = false;
        detailEmpty.textContent = '找不到這件作品，或載入失敗。';
    }
}

loadWorkDetail();
