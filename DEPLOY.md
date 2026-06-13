# 允藝設計工作室 · 上線部署指南

本專案為 **靜態 HTML + Supabase**，與晶刻相同概念：

- **Supabase**：作品、預約、圖片、後台登入
- **Vercel**：網站上線

---

## 方案 C：新建 Supabase（你目前選這個）

### 1. 用新 Email 註冊 Supabase

1. 打開 https://supabase.com
2. 用**另一個 Email** 註冊（不要跟晶刻舊帳號混用）
3. **New Project**
   - Name：`yunyi-design`
   - Database Password：自己記好
   - Region：**Asia Pacific → Singapore**（或 Tokyo）

### 2. 跑 SQL

1. Supabase → **SQL Editor** → **New query**
2. 複製 `supabase/schema.sql` 全部內容
3. 按 **Run**
4. 若專案已存在，依序執行 `supabase/migration-*.sql`（含 `migration-admin-auth-rls.sql`）
5. 左側 **Table Editor** 確認有 `works`、`inquiries`

### 3. 建立後台密碼

在 `.env` 與 Vercel 設定：

```env
VITE_ADMIN_PASSWORD=你的後台密碼
```

執行 `npm run config` 後，後台 `/admin.html` 只需輸入此密碼登入。

### 4. 拿 API 金鑰

1. **Settings → General** → 複製 **Project URL**
2. **Settings → API Keys** → 複製 **Publishable key**

### 5. 本地設定 `.env`

在專案根目錄：

```bash
copy .env.example .env
```

編輯 `.env`：

```env
VITE_SUPABASE_URL=https://你的新專案.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_你的金鑰
VITE_ADMIN_PASSWORD=你的後台密碼
```

### 6. 產生設定檔並預覽

```bash
npm install
npm run config
npm run dev
```

打開 http://localhost:5500

- 作品頁：`/works.html`
- 後台：`/admin.html`（用 `.env` 設定的後台密碼）

---

## Vercel 上線

### 1. 推上 GitHub

```bash
git init
git add .
git commit -m "yunyi design studio supabase ready"
git push
```

不要 push `.env`（已在 `.gitignore`）。

### 2. Vercel 匯入

1. https://vercel.com → **Add New → Project**
2. 選 GitHub 倉庫
3. 建置設定：

| 項目 | 值 |
|------|-----|
| Build Command | `npm run build` |
| Output Directory | `.` |
| Install Command | `npm install` |

### 3. 環境變數

| Name | Value |
|------|--------|
| `VITE_SUPABASE_URL` | 新 Supabase Project URL |
| `VITE_SUPABASE_ANON_KEY` | Publishable key |
| `VITE_ADMIN_PASSWORD` | 後台密碼 |

改完變數要 **Redeploy**。

---

## 後台登入

後台只需輸入 **管理密碼**（`.env` / Vercel 的 `VITE_ADMIN_PASSWORD`），不需 Email 帳號。

---

## 常見問題

### 作品載入失敗

- 確認 `.env` 或 Vercel 三個變數填對
- 確認 Supabase 新專案 **沒有** 用量超限
- 重新執行 `npm run config`

### 圖片上傳失敗

- 確認 SQL 已建立 `work-images` 儲存桶
- 若曾執行 `migration-admin-auth-rls.sql`，請改執行 `migration-restore-password-admin-rls.sql`

### 後台密碼不對

- 用的是 `.env` / Vercel 的 `VITE_ADMIN_PASSWORD`
- 改完要 `npm run config` 或 Vercel Redeploy
