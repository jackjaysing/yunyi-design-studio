const worksGrid = document.getElementById('works-grid');
const worksEmpty = document.getElementById('works-empty');
const worksFilter = document.getElementById('works-filter');

let allWorks = [];
let activeCategory = 'all';

function createWorkCard(work) {
    const article = document.createElement('article');
    article.className = 'work-card';
    article.innerHTML = `
        <div class="work-card-image">
            <img src="${work.image}" alt="${work.title}">
        </div>
        <div class="work-card-body">
            <span class="work-card-category">${work.category || '室內設計'}</span>
            <h3>${work.title}</h3>
            <p>${work.description || ''}</p>
            <div class="work-card-meta">
                ${work.location ? `<span>${work.location}</span>` : ''}
                ${work.area ? `<span>${work.area}</span>` : ''}
                ${work.year ? `<span>${work.year}</span>` : ''}
            </div>
        </div>
    `;
    return article;
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
