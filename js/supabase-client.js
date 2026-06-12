const WORK_CATEGORIES = ['景觀設計', '公設設計', '室內設計', '彩色配置圖'];

const WORK_IMAGE_BUCKET = 'work-images';

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

async function fetchWorks() {
    const client = getSupabaseClient();
    const { data, error } = await client
        .from('works')
        .select('*')
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
    const client = getSupabaseClient();
    const { error } = await client.from('works').delete().eq('id', id);

    if (error) {
        throw new Error(error.message);
    }
}

async function uploadWorkImage(file) {
    const client = getSupabaseClient();
    const watermarkedFile = await applyLogoWatermark(file);
    const extension = watermarkedFile.name.split('.').pop() || 'jpg';
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`;

    const { error } = await client.storage
        .from(WORK_IMAGE_BUCKET)
        .upload(fileName, watermarkedFile, { upsert: false });

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
