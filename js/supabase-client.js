const WORK_CATEGORIES = ['景觀設計', '公設設計', '室內設計', '彩色配置圖'];

const WORK_IMAGE_BUCKET = 'work-images';
const WORK_LIST_SELECT = 'id,title,category,description,image_url,year,area,location,featured,created_at';
const WORK_ADMIN_SELECT = `${WORK_LIST_SELECT},gallery_urls`;
const STORAGE_PUBLIC_PATH = `/storage/v1/object/public/${WORK_IMAGE_BUCKET}/`;
const STORAGE_CACHE_SECONDS = 31536000;

function getAppConfig() {
    return window.APP_CONFIG || {};
}

function isSupabaseConfigured() {
    const config = getAppConfig();
    return Boolean(config.supabaseUrl && config.supabaseAnonKey);
}

function getSupabaseClient() {
    if (!window.supabase) {
        throw new Error('Supabase SDK 尚未載入');
    }

    if (!isSupabaseConfigured()) {
        throw new Error('請先在 .env 設定 VITE_SUPABASE_URL 與 VITE_SUPABASE_ANON_KEY，並執行 npm run config');
    }

    const config = getAppConfig();

    if (!window.__yunyiSupabase) {
        window.__yunyiSupabase = window.supabase.createClient(
            config.supabaseUrl,
            config.supabaseAnonKey
        );
    }

    return window.__yunyiSupabase;
}

function getAdminPassword() {
    return getAppConfig().adminPassword || '';
}

function mapWorkFromDb(work) {
    return {
        id: work.id,
        title: work.title,
        category: work.category,
        description: work.description,
        image: work.image_url,
        gallery: Array.isArray(work.gallery_urls) ? work.gallery_urls : [],
        year: work.year,
        area: work.area,
        location: work.location,
        featured: work.featured,
        createdAt: work.created_at
    };
}

function mapWorkToDb(payload) {
    return {
        title: payload.title,
        category: payload.category,
        description: payload.description,
        image_url: payload.image,
        gallery_urls: Array.isArray(payload.gallery) ? payload.gallery : [],
        year: payload.year,
        area: payload.area,
        location: payload.location,
        featured: Boolean(payload.featured)
    };
}

async function fetchWorks(options = {}) {
    const client = getSupabaseClient();
    const select = options.includeGallery ? WORK_ADMIN_SELECT : WORK_LIST_SELECT;
    const { data, error } = await client
        .from('works')
        .select(select)
        .order('created_at', { ascending: false });

    if (error) {
        throw new Error(error.message);
    }

    return (data || []).map(mapWorkFromDb);
}

async function fetchWorkById(id) {
    const client = getSupabaseClient();
    const { data, error } = await client
        .from('works')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        throw new Error(error.message);
    }

    return mapWorkFromDb(data);
}

async function createWork(payload) {
    const client = getSupabaseClient();
    const { data, error } = await client
        .from('works')
        .insert(mapWorkToDb(payload))
        .select('*')
        .single();

    if (error) {
        throw new Error(error.message);
    }

    return mapWorkFromDb(data);
}

async function updateWork(id, payload) {
    const client = getSupabaseClient();
    const { data, error } = await client
        .from('works')
        .update(mapWorkToDb(payload))
        .eq('id', id)
        .select('*')
        .single();

    if (error) {
        throw new Error(error.message);
    }

    return mapWorkFromDb(data);
}

async function deleteWork(id) {
    const work = await fetchWorkById(id);
    await deleteStorageImages([work.image, ...(work.gallery || [])]);

    const client = getSupabaseClient();
    const { error } = await client.from('works').delete().eq('id', id);

    if (error) {
        throw new Error(error.message);
    }
}

function getStoragePathFromUrl(url) {
    if (!url || typeof url !== 'string') {
        return null;
    }

    const index = url.indexOf(STORAGE_PUBLIC_PATH);
    if (index === -1) {
        return null;
    }

    return decodeURIComponent(url.slice(index + STORAGE_PUBLIC_PATH.length));
}

async function deleteStorageImages(urls) {
    const paths = [...new Set(urls.map(getStoragePathFromUrl).filter(Boolean))];
    if (paths.length === 0) {
        return;
    }

    const client = getSupabaseClient();
    const { error } = await client.storage.from(WORK_IMAGE_BUCKET).remove(paths);

    if (error) {
        throw new Error(error.message);
    }
}

async function uploadWorkImage(file) {
    const client = getSupabaseClient();
    const watermarkedFile = await applyLogoWatermark(file);
    const compressedFile = await compressImageFile(watermarkedFile);
    const extension = compressedFile.name.split('.').pop() || 'jpg';
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`;

    const { error } = await client.storage
        .from(WORK_IMAGE_BUCKET)
        .upload(fileName, compressedFile, {
            upsert: false,
            cacheControl: String(STORAGE_CACHE_SECONDS)
        });

    if (error) {
        throw new Error(error.message);
    }

    const { data } = client.storage.from(WORK_IMAGE_BUCKET).getPublicUrl(fileName);
    return data.publicUrl;
}

async function submitInquiry(payload) {
    const phone = payload.phone?.trim() || '';
    const email = payload.email?.trim() || '';
    const lineId = payload.line_id?.trim() || '';

    if (!phone && !email && !lineId) {
        throw new Error('電話、信箱或 Line ID 請至少填寫一項');
    }

    const client = getSupabaseClient();
    const { error } = await client.from('inquiries').insert({
        name: payload.name,
        phone,
        email,
        line_id: lineId,
        service: payload.service || '',
        message: payload.message
    });

    if (error) {
        throw new Error(error.message);
    }
}

function mapInquiryFromDb(inquiry) {
    return {
        id: inquiry.id,
        name: inquiry.name,
        phone: inquiry.phone,
        email: inquiry.email,
        lineId: inquiry.line_id,
        service: inquiry.service,
        message: inquiry.message,
        createdAt: inquiry.created_at
    };
}

async function fetchInquiries() {
    const client = getSupabaseClient();
    const { data, error } = await client
        .from('inquiries')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        throw new Error(error.message);
    }

    return (data || []).map(mapInquiryFromDb);
}

async function deleteInquiry(id) {
    const client = getSupabaseClient();
    const { error } = await client.from('inquiries').delete().eq('id', id);

    if (error) {
        throw new Error(error.message);
    }
}

const DEFAULT_SITE_SETTINGS = {
    siteName: '允藝設計工作室',
    siteNameEn: 'Yun Yi Design Studio',
    tagline: '允執厥中，匠心獨藝',
    footerDesc: '引領空間美學與法規安全的完美平衡',
    serviceHours: '週一至週五 10:00 - 18:00',
    serviceArea: '大台北、桃園、新竹',
    phone: '02-1234-5678',
    email: 'hello@yunyidesign.com',
    lineId: '@yunyidesign',
    contactIntro: '歡迎留下您的需求，我們將於 1-2 個工作天內與您聯繫。',
    aboutIntro: '我們相信，好的空間不只是好看，更應該在日常中穩定運作，並符合法規與安全。',
    philosophy1: '允藝設計工作室以「允執厥中，匠心獨藝」為核心，結合室內美學與工程審查專業，協助客戶在設計理想與法規要求之間取得最佳平衡。',
    philosophy2: '我們不追求浮華堆砌，而是透過比例、材質、光線與動線，讓空間回到生活本身，成為能長久使用的場域。',
    serviceScope: '住宅室內設計與裝修規劃\n商業空間與展示設計\n室內裝修許可與送審協助\n工程法規諮詢與圖面審查\n施工監造與材料搭配建議',
    statYears: '10+',
    statProjects: '120+',
    statCompliance: '100%',
    heroImageLarge: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80',
    heroImageSmall1: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=500&q=80',
    heroImageSmall2: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=500&q=80'
};

function mapSiteSettingsFromDb(row) {
    if (!row) {
        return { ...DEFAULT_SITE_SETTINGS };
    }

    return {
        siteName: row.site_name || DEFAULT_SITE_SETTINGS.siteName,
        siteNameEn: row.site_name_en || DEFAULT_SITE_SETTINGS.siteNameEn,
        tagline: row.tagline || DEFAULT_SITE_SETTINGS.tagline,
        footerDesc: row.footer_desc || DEFAULT_SITE_SETTINGS.footerDesc,
        serviceHours: row.service_hours || DEFAULT_SITE_SETTINGS.serviceHours,
        serviceArea: row.service_area || DEFAULT_SITE_SETTINGS.serviceArea,
        phone: row.phone || DEFAULT_SITE_SETTINGS.phone,
        email: row.email || DEFAULT_SITE_SETTINGS.email,
        lineId: row.line_id || DEFAULT_SITE_SETTINGS.lineId,
        contactIntro: row.contact_intro || DEFAULT_SITE_SETTINGS.contactIntro,
        aboutIntro: row.about_intro || DEFAULT_SITE_SETTINGS.aboutIntro,
        philosophy1: row.philosophy_1 || DEFAULT_SITE_SETTINGS.philosophy1,
        philosophy2: row.philosophy_2 || DEFAULT_SITE_SETTINGS.philosophy2,
        serviceScope: row.service_scope || DEFAULT_SITE_SETTINGS.serviceScope,
        statYears: row.stat_years || DEFAULT_SITE_SETTINGS.statYears,
        statProjects: row.stat_projects || DEFAULT_SITE_SETTINGS.statProjects,
        statCompliance: row.stat_compliance || DEFAULT_SITE_SETTINGS.statCompliance,
        heroImageLarge: row.hero_image_large || DEFAULT_SITE_SETTINGS.heroImageLarge,
        heroImageSmall1: row.hero_image_small_1 || DEFAULT_SITE_SETTINGS.heroImageSmall1,
        heroImageSmall2: row.hero_image_small_2 || DEFAULT_SITE_SETTINGS.heroImageSmall2,
        updatedAt: row.updated_at
    };
}

function mapSiteSettingsToDb(payload) {
    return {
        site_name: payload.siteName?.trim() || DEFAULT_SITE_SETTINGS.siteName,
        site_name_en: payload.siteNameEn?.trim() || DEFAULT_SITE_SETTINGS.siteNameEn,
        tagline: payload.tagline?.trim() || '',
        footer_desc: payload.footerDesc?.trim() || '',
        service_hours: payload.serviceHours?.trim() || '',
        service_area: payload.serviceArea?.trim() || '',
        phone: payload.phone?.trim() || '',
        email: payload.email?.trim() || '',
        line_id: payload.lineId?.trim() || '',
        contact_intro: payload.contactIntro?.trim() || '',
        about_intro: payload.aboutIntro?.trim() || '',
        philosophy_1: payload.philosophy1?.trim() || '',
        philosophy_2: payload.philosophy2?.trim() || '',
        service_scope: payload.serviceScope?.trim() || '',
        stat_years: payload.statYears?.trim() || '',
        stat_projects: payload.statProjects?.trim() || '',
        stat_compliance: payload.statCompliance?.trim() || '',
        hero_image_large: payload.heroImageLarge?.trim() || DEFAULT_SITE_SETTINGS.heroImageLarge,
        hero_image_small_1: payload.heroImageSmall1?.trim() || DEFAULT_SITE_SETTINGS.heroImageSmall1,
        hero_image_small_2: payload.heroImageSmall2?.trim() || DEFAULT_SITE_SETTINGS.heroImageSmall2,
        updated_at: new Date().toISOString()
    };
}

async function fetchSiteSettings() {
    const client = getSupabaseClient();
    const { data, error } = await client
        .from('site_settings')
        .select('*')
        .eq('id', 'default')
        .maybeSingle();

    if (error) {
        throw new Error(error.message);
    }

    return mapSiteSettingsFromDb(data);
}

async function updateSiteSettings(payload) {
    const client = getSupabaseClient();
    const { data, error } = await client
        .from('site_settings')
        .upsert({ id: 'default', ...mapSiteSettingsToDb(payload) })
        .select('*')
        .single();

    if (error) {
        throw new Error(error.message);
    }

    return mapSiteSettingsFromDb(data);
}
