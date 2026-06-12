const worksGrid = document.getElementById('works-grid');
const worksEmpty = document.getElementById('works-empty');

function createWorkCard(work) {
    const article = document.createElement('article');
    article.className = 'work-card';
    article.innerHTML = `
        <div class="work-card-image">
            <img src="${work.image}" alt="${work.title}">
        </div>
        <div class="work-card-body">
            <span class="work-card-category">${work.category || '設計作品'}</span>
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

async function loadWorks() {
    try {
        if (!isSupabaseConfigured()) {
            worksEmpty.hidden = false;
            worksEmpty.textContent = '請先設定 Supabase 連線。';
            return;
        }

        const works = await fetchWorks();
        worksGrid.innerHTML = '';

        if (works.length === 0) {
            worksEmpty.hidden = false;
            worksEmpty.textContent = '目前尚無作品，請稍後再來。';
            return;
        }

        worksEmpty.hidden = true;
        works.forEach((work) => {
            worksGrid.appendChild(createWorkCard(work));
        });
    } catch {
        worksEmpty.hidden = false;
        worksEmpty.textContent = '作品載入失敗，請確認 Supabase 設定。';
    }
}

loadWorks();
