require('dotenv').config();
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = (process.env.VITE_SUPABASE_URL || '').trim();
const SUPABASE_KEY = (process.env.VITE_SUPABASE_ANON_KEY || '').trim();
const WORKS_DIR = path.join(__dirname, '../assets/works');

const WORK_IMAGE_MAP = [
    {
        title: '靜謐都會宅',
        category: '室內設計',
        description: '以木質與灰調奠定沉穩基調，在有限坪數中創造開闊感與完整收納動線。',
        year: '2025',
        area: '28 坪',
        location: '台北市',
        featured: true,
        cover: 'jingmi-cover.png',
        gallery: ['jingmi-gallery-1.png', 'jingmi-gallery-2.png']
    },
    {
        title: '光之廊道',
        category: '公設設計',
        description: '利用自然採光與材質層次，打造兼具品牌識別與停留感的公共展示空間。',
        year: '2024',
        area: '45 坪',
        location: '新北市',
        featured: true,
        cover: 'guangzhi-cover.png',
        gallery: ['guangzhi-gallery-1.png', 'guangzhi-gallery-2.png']
    },
    {
        title: '庭園序曲',
        category: '景觀設計',
        description: '以低維護植栽與石材動線，串連建築與戶外，營造沉靜內斂的景觀層次。',
        year: '2024',
        area: '120 坪',
        location: '桃園市',
        featured: false,
        cover: 'tingyuan-cover.png',
        gallery: ['tingyuan-gallery-1.png', 'tingyuan-gallery-2.png']
    },
    {
        title: '晨光提案',
        category: '彩色配置圖',
        description: '以暖色與木質為主軸的住宅配色方案，呈現空間氛圍與材質層次，協助業主在施工前確認整體色調。',
        year: '2025',
        area: '30 坪',
        location: '台北市',
        featured: false,
        cover: 'caise-cover.png',
        gallery: ['caise-gallery-1.png', 'caise-gallery-2.png']
    }
];

function localAssetUrl(filename) {
    return `/assets/works/${filename}`;
}

async function supabaseRequest(endpoint, options = {}) {
    const response = await fetch(`${SUPABASE_URL}${endpoint}`, {
        ...options,
        headers: {
            apikey: SUPABASE_KEY,
            Authorization: `Bearer ${SUPABASE_KEY}`,
            ...(options.headers || {})
        }
    });

    if (!response.ok) {
        const text = await response.text();
        throw new Error(`${response.status} ${response.statusText}: ${text}`);
    }

    if (response.status === 204) {
        return null;
    }

    return response.json();
}

async function uploadImage(filename) {
    const filePath = path.join(WORKS_DIR, filename);
    if (!fs.existsSync(filePath)) {
        throw new Error(`找不到圖片：${filePath}`);
    }

    const storagePath = `portfolio/${filename}`;
    const buffer = fs.readFileSync(filePath);

    await supabaseRequest(`/storage/v1/object/work-images/${storagePath}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'image/png',
            'x-upsert': 'true'
        },
        body: buffer
    });

    return `${SUPABASE_URL}/storage/v1/object/public/work-images/${storagePath}`;
}

async function fetchWorks() {
    return supabaseRequest('/rest/v1/works?select=id,title&order=created_at.desc');
}

async function createWork(payload) {
    return supabaseRequest('/rest/v1/works?select=id,title', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Prefer: 'return=representation'
        },
        body: JSON.stringify(payload)
    });
}

async function updateWork(id, payload) {
    return supabaseRequest(`/rest/v1/works?id=eq.${id}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            Prefer: 'return=representation'
        },
        body: JSON.stringify(payload)
    });
}

async function main() {
    if (!SUPABASE_URL || !SUPABASE_KEY) {
        console.log('未設定 Supabase，改為使用本地 assets 路徑：');
        WORK_IMAGE_MAP.forEach((work) => {
            console.log(`- ${work.title}: ${localAssetUrl(work.cover)}`);
        });
        process.exit(0);
    }

    const useUpload = process.argv.includes('--upload');
    const existingWorks = await fetchWorks();

    for (const work of WORK_IMAGE_MAP) {
        const coverUrl = useUpload
            ? await uploadImage(work.cover)
            : localAssetUrl(work.cover);
        const galleryUrls = [];

        for (const filename of work.gallery) {
            galleryUrls.push(useUpload ? await uploadImage(filename) : localAssetUrl(filename));
        }

        const payload = {
            title: work.title,
            category: work.category,
            description: work.description,
            image_url: coverUrl,
            gallery_urls: galleryUrls,
            year: work.year,
            area: work.area,
            location: work.location,
            featured: work.featured
        };

        const match = existingWorks.find((item) => item.title === work.title);

        if (match) {
            await updateWork(match.id, payload);
            console.log(`已更新：${work.title}`);
        } else {
            await createWork(payload);
            console.log(`已新增：${work.title}`);
        }
    }

    console.log(useUpload ? '作品圖片已上傳至 Supabase Storage 並更新資料。' : '作品圖片已更新為本地 assets 路徑。');
}

main().catch((error) => {
    console.error(error.message);
    process.exit(1);
});
