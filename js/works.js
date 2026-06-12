const worksGrid = document.getElementById('works-grid');
const worksEmpty = document.getElementById('works-empty');
const worksFilter = document.getElementById('works-filter');

let allWorks = [];
let activeCategory = 'all';

function createWorkCard(work) {
    const link = document.createElement('a');
    link.href = `work-detail.html?id=${encodeURIComponent(work.id)}`;
    link.className = 'work-card-link';
    link.innerHTML = `
        <article class="work-card">
            <div class="work-card-image">
                <img src="${escapeHtml(work.image)}" alt="${escapeHtml(work.title)}">
            </div>
            <div class="work-card-body">
                <span class="work-card-category">${escapeHtml(work.category || '室內設計')}</span>
                <h3>${escapeHtml(work.title)}</h3>
                <p>${escapeHtml(work.description || '')}</p>
                <div class="work-card-meta">
                    ${work.location ? `<span>${escapeHtml(work.location)}</span>` : ''}
                    ${work.area ? `<span>${escapeHtml(work.area)}</span>` : ''}
                    ${work.year ? `<span>${escapeHtml(work.year)}</span>` : ''}
                </div>
                <span class="work-card-more">查看詳情 →</span>
            </div>
        </article>
    `;
    return link;
}

function getFilteredWorks() {
    if (activeCategory === 'all') {
        return allWorks;
    }

    return allWorks.filter((work) => work.category === activeCategory);
}

function renderWorks() {
    const works = getFilteredWorks();
    worksGrid.innerHTML = '';

    if (works.length === 0) {
        worksEmpty.hidden = false;
        worksEmpty.textContent = activeCategory === 'all'
            ? '目前尚無作品，請稍後再來。'
            : `「${activeCategory}」目前尚無作品。`;
        return;
    }

    worksEmpty.hidden = true;
    works.forEach((work) => {
        worksGrid.appendChild(createWorkCard(work));
    });
}

function setActiveFilter(category) {
    activeCategory = category;

    worksFilter.querySelectorAll('.works-filter-btn').forEach((button) => {
        button.classList.toggle('active', button.dataset.category === category);
    });

    renderWorks();
}

async function loadWorks() {
    try {
        if (!isSupabaseConfigured()) {
            worksEmpty.hidden = false;
            worksEmpty.textContent = '請先設定 Supabase 連線。';
            return;
        }

        allWorks = await fetchWorks();
        renderWorks();
    } catch {
        worksEmpty.hidden = false;
        worksEmpty.textContent = '作品載入失敗，請確認 Supabase 設定。';
    }
}

worksFilter.addEventListener('click', (event) => {
    const button = event.target.closest('.works-filter-btn');
    if (!button) return;
    setActiveFilter(button.dataset.category);
});

loadWorks();
