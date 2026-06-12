require('dotenv').config();
const fs = require('fs');
const path = require('path');

const config = {
    supabaseUrl: (process.env.VITE_SUPABASE_URL || '').trim(),
    supabaseAnonKey: (process.env.VITE_SUPABASE_ANON_KEY || '').trim(),
    adminPassword: (process.env.VITE_ADMIN_PASSWORD || '').trim()
};

const outputPath = path.join(__dirname, '../js/config.js');
const content = `window.APP_CONFIG = ${JSON.stringify(config, null, 4)};\n`;

fs.writeFileSync(outputPath, content, 'utf8');
console.log('已產生 js/config.js');
