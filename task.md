# Slop Museum 開發任務清單

> 基於 PRD v2.0，按開發階段與依賴關係排列。
> 每個任務標註優先級 (P0 = 必須先完成 / P1 = 核心功能 / P2 = 重要但可稍後)。

---

## Phase 0：專案初始化

### 0.1 開發環境與專案骨架

- [x] **P0** 初始化 Next.js 14+ 專案 (App Router, TypeScript)
- [x] **P0** 設定 Tailwind CSS + shadcn/ui
- [x] **P0** 設定 ESLint + Prettier 統一程式碼風格
- [x] **P0** 設定 Git repo + `.gitignore` + `.env.local.example`
- [x] **P0** 建立基本目錄結構：
  ```
  src/
    app/           # App Router 頁面
    components/    # 共用元件
    lib/           # 工具函式、Supabase client、常數
    types/         # TypeScript 型別定義
  ```

### 0.2 Supabase 設定

- [x] **P0** 建立 Supabase 專案
- [x] **P0** 設定環境變數 (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`)
- [x] **P0** 安裝 `@supabase/supabase-js` + `@supabase/ssr`
- [x] **P0** 建立 Supabase client 工具函式 (browser client / server client / middleware client)

### 0.3 資料庫 Schema

- [x] **P0** 撰寫並執行 SQL migration，建立所有資料表：
  - `users` (id, display_name, avatar_url, provider, role, is_banned, created_at)
  - `slops` (id, user_id, title, description, type, url, code_html, code_css, code_js, sandbox_url, preview_image_url, is_anonymous, is_hidden, created_at)
  - `tags` (id, name)
  - `slop_tags` (slop_id, tag_id)
  - `reactions` (id, slop_id, user_id, type, is_anonymous, created_at) + UNIQUE constraint
  - `bookmarks` (user_id, slop_id, created_at) + UNIQUE constraint
  - `reports` (id, slop_id, reporter_id, reason, status, created_at)
- [x] **P0** 插入預設 Tags seed data (`game`, `tool`, `art`, `music`, `useless`, `funny`)
- [x] **P0** 設定 Row Level Security (RLS) policies：
  - `slops`: 所有人可讀（`is_hidden = false`）；作者可寫自己的；admin 可寫所有
  - `reactions`: 所有人可讀；登入用戶可新增/刪除自己的
  - `bookmarks`: 用戶只能讀寫自己的
  - `reports`: 登入用戶可新增；只有 admin 可讀可改狀態
  - `users`: 公開讀取基本資訊；用戶只能改自己的 display_name / avatar_url

### 0.4 部署管線

- [ ] **P0** 連接 Vercel，設定自動部署 (main branch)
- [ ] **P0** 在 Vercel 設定環境變數

---

## Phase 0.5: Quality Assurance & Developer Experience

### 0.5.1 Testing Framework & Fixes

- [x] **P0** Fix blank page issue (Conflicting layout files)
- [ ] **P1** Install and configure Jest with React Testing Library (`jest`, `@testing-library/react`, `@testing-library/jest-dom`).
- [ ] **P1** Create `jest.setup.js` and `jest.config.js` for Next.js App Router.

### 0.5.2 Unit & Integration Tests

- [ ] **P2** Write unit tests for utility functions in `lib/utils.ts`.
- [ ] **P2** Write unit tests for Zod validators.
- [ ] **P2** Write component tests for critical UI components (`SlopCard`, `ReactionBar`, `BookmarkButton`).
- [ ] **P2** Write integration tests for key user flows (e.g., "Submit Slop", "Login") using mock data.

### 0.5.3 Local Development & Admin

- [ ] **P2** Create a mock data seeding script (`scripts/seed.ts`) to populate the database with test users and slops.
- [ ] **P2** Create a database reset script (`scripts/reset-db.ts`) to truncate tables for easier testing.
- [ ] **P2** Create a `/api/dev/login` route to allow instant login as a test user/admin in development.
- [ ] **P2** Implement a `<DevToolbar />` component that only renders in development, providing admin-like shortcuts (e.g., quick delete, impersonate user).

---

## Phase 1：用戶系統

### 1.1 OAuth 認證

- [ ] **P1** 在 Supabase 啟用 Google OAuth provider + 設定 Google Cloud Console credentials
- [ ] **P1** 在 Supabase 啟用 GitHub OAuth provider + 設定 GitHub OAuth App
- [x] **P1** 實作 Next.js middleware 處理 auth session 刷新
- [x] **P1** 建立 `/auth/callback` route handler 處理 OAuth redirect
- [x] **P1** 實作 auth 成功後自動寫入/更新 `users` 表（透過 Supabase trigger 或 API route）

### 1.2 登入/登出 UI

- [x] **P1** 建立 `LoginButton` 元件（Google / GitHub 圖示按鈕）
- [x] **P1** 建立 `UserMenu` 元件（顯示頭像 + dropdown: 我的頁面 / 登出）
- [x] **P1** 建立全站 `Navbar` 元件，整合登入狀態顯示
- [x] **P1** 建立 `AuthProvider` context，提供全局 user 狀態

### 1.3 用戶個人頁

- [x] **P1** 建立 `/user/[id]` 頁面
- [x] **P1** 顯示用戶基本資訊（頭像、名稱、加入時間）
- [x] **P1** 「我的作品」分頁：列出該用戶發布的所有 slops
- [x] **P1** 「收藏」分頁：列出該用戶收藏的所有 slops（僅本人可見）
- [ ] **P1** 反應統計摘要（該用戶所有作品累計獲得的各類反應數）

---

## Phase 2：作品上傳

### 2.1 上傳表單 - 共用部分

- [x] **P1** 建立 `/submit` 頁面（需登入，未登入導向登入）
- [x] **P1** 模式切換 UI（Tab: URL 提交 / Code Snippet 提交）
- [x] **P1** 共用欄位元件：標題輸入、簡介輸入、標籤選擇器（1-3 個，chip 式多選）、匿名勾選
- [x] **P1** 表單驗證（前端 + API route）

### 2.2 模式 A：URL 提交

- [x] **P1** URL 輸入欄位 + 格式驗證
- [x] **P1** API route: 提交 URL 類 slop → 寫入 `slops` + `slop_tags`
- [ ] **P2** OG Image 自動擷取 API route（使用 `fetch` + HTML parser 抓取 `og:image` meta tag）
- [x] **P1** 手動上傳預覽圖（Supabase Storage upload）+ 圖片預覽

### 2.3 模式 B：Code Snippet 提交

- [ ] **P1** 整合程式碼編輯器元件（推薦 CodeMirror 6 或 Monaco Editor）⚠️ 目前使用 Textarea，需升級以符合需求
- [x] **P1** HTML / CSS / JS 三欄切換 Tab
- [x] **P1** 即時預覽面板（本地 iframe 預覽，使用 `srcdoc`）
- [x] **P1** API route: 提交 Code 類 slop → 寫入 `slops` + `slop_tags`
- [x] **P1** 程式碼大小驗證（上限 500KB）
- [x] **P1** 手動上傳預覽圖 + 圖片預覽

### 2.4 圖片上傳服務

- [x] **P1** 建立 Supabase Storage bucket (`slop-previews`)，設定公開讀取
- [x] **P1** 實作圖片上傳 API route（驗證格式 JPEG/PNG/GIF/WebP、大小 ≤ 5MB）
- [ ] **P2** 伺服端圖片壓縮 + 縮圖生成（使用 `sharp`）

---

## Phase 3：作品瀏覽與發現

### 3.1 主頁瀑布流

- [x] **P1** 建立 `/` 首頁，實作卡片式瀑布流佈局（CSS columns 或 Masonry library）
- [x] **P1** `SlopCard` 元件：預覽圖、標題、作者（或 "Anonymous"）、標籤 chips、反應摘要
- [x] **P1** API route: 查詢 slops 列表（按 created_at DESC，join tags + 反應統計）
- [x] **P1** 無限滾動分頁（cursor-based pagination）
- [x] **P1** Loading skeleton 骨架屏

### 3.2 標籤篩選

- [x] **P1** 頁面頂部標籤列表（水平滾動 chip bar）
- [x] **P1** 點擊標籤後篩選列表（URL query param `?tag=game`，支援多標籤）
- [x] **P1** 「全部」按鈕清除篩選

### 3.3 作品詳情頁

- [x] **P1** 建立 `/slop/[id]` 頁面
- [x] **P1** 顯示完整資訊：標題、作者（可點擊進入個人頁）、簡介、標籤、發布時間
- [x] **P1** URL 類作品：顯示「打開作品」按鈕 (`target="_blank"`)
- [x] **P1** Code 類作品：嵌入 iframe 運行沙盒 + 「全螢幕」按鈕
- [x] **P1** 反應區塊（見 Phase 4）
- [x] **P1** 收藏按鈕（見 Phase 4）
- [x] **P1** SEO: 動態生成 `<title>` + `og:image` meta tags（Next.js `generateMetadata`）

---

## Phase 4：社群互動

### 4.1 反應系統 (Reactions)

- [x] **P1** `ReactionBar` 元件：5 個 emoji 按鈕 + 各自計數
- [x] **P1** API route: `POST /api/reactions` — toggle 反應（新增或刪除）
- [x] **P1** API route: `GET /api/slops/[id]/reactions` — 取得某作品的反應統計 + 當前用戶已點的反應
- [x] **P1** 已點擊的反應高亮顯示
- [ ] **P2** 匿名反應選項 UI ⚠️ API 已支援 is_anonymous 參數，但前端無 UI toggle
- [x] **P1** 樂觀更新 (Optimistic UI)：點擊後立即更新計數，API 失敗時回滾

### 4.2 收藏功能

- [x] **P1** `BookmarkButton` 元件（toggle 式，已收藏顯示填充圖示）
- [x] **P1** API route: `POST /api/bookmarks` — toggle 收藏
- [x] **P1** 樂觀更新

### 4.3 檢舉功能

- [x] **P2** 作品詳情頁「檢舉」按鈕 → 彈出 Modal
- [x] **P2** 檢舉 Modal：選擇原因（惡意內容 / 垃圾廣告 / 不當內容）+ 確認送出
- [x] **P2** API route: `POST /api/reports` — 新增檢舉紀錄

---

## Phase 5：Code Sandbox 服務

### 5.1 Sandbox 生成

- [x] **P1** 設計 HTML 模板：將用戶的 HTML/CSS/JS 注入標準 HTML 結構
- [x] **P1** 在 slop 提交時，生成完整 HTML 檔案
- [x] **P1** 上傳至 Supabase Storage（或 Cloudflare R2），取得公開 URL
- [x] **P1** 將 `sandbox_url` 寫入 `slops` 表

### 5.2 安全隔離

- [ ] **P1** 設定 Sandbox 內容的獨立域名/子域名（如 `sandbox.slopmuseum.com`）
- [x] **P1** iframe 嚴格 `sandbox="allow-scripts"` 屬性
- [ ] **P1** Sandbox 頁面 CSP header 設定
- [x] **P1** 前端 iframe 載入超時處理（10 秒）+ 錯誤提示 UI

### 5.3 進階 (可延後)

- [ ] **P2** Cloudflare Workers 動態生成 + R2 儲存（取代 Supabase Storage，獲得更好的全球分發）
- [ ] **P2** Sandbox 自動截圖生成預覽圖（Puppeteer / Playwright in serverless function）

---

## Phase 6：管理員後台

### 6.1 Admin 介面

- [x] **P2** 建立 `/admin` 頁面（僅 `role = admin` 可存取，middleware 驗證）
- [x] **P2** 檢舉列表頁：顯示所有 `status = pending` 的檢舉，附帶作品預覽
- [x] **P2** 管理操作按鈕：「下架作品」（設 `is_hidden = true`）/「刪除作品」/「駁回檢舉」
- [ ] **P2** 用戶管理：封禁用戶（設 `is_banned = true`）⚠️ API 已有 is_banned 檢查，但 Admin UI 缺少封禁按鈕
- [ ] **P2** 被封禁用戶登入後顯示封禁提示，禁止所有寫入操作 ⚠️ API 層已擋 banned 用戶提交，但前端無提示 UI

---

## Phase 7：UI 打磨與上線準備

### 7.1 響應式設計

- [x] **P1** 所有頁面的 Mobile / Tablet / Desktop 響應式適配
- [x] **P1** 瀑布流在不同螢幕寬度下的欄數調整（mobile: 1 欄, tablet: 2 欄, desktop: 3-4 欄）

### 7.2 全站體驗

- [x] **P1** 404 頁面
- [x] **P1** 全局 Error Boundary
- [x] **P1** Loading 狀態統一處理（Suspense + skeleton）
- [x] **P1** Toast 通知元件（操作成功/失敗提示）
- [ ] **P2** 深色模式支援 ⚠️ CSS 變數已定義，但缺少切換按鈕

### 7.3 上線檢查

- [ ] **P1** 環境變數檢查（production Supabase keys、OAuth redirect URLs）
- [ ] **P1** Vercel production 部署 + 自訂域名設定
- [ ] **P1** 基本 Lighthouse 效能檢測 (目標: Performance > 80)
- [ ] **P2** Google Analytics 或 Plausible 埋點

---

## 開發順序建議

```
Phase 0 (專案初始化)
  │
  ▼
Phase 1 (用戶系統) ──────────────────────┐
  │                                       │
  ▼                                       │
Phase 2 (作品上傳) ── Phase 5 (Sandbox)   │
  │                      │                │
  ▼                      ▼                │
Phase 3 (瀏覽與發現) ◄───┘                │
  │                                       │
  ▼                                       │
Phase 4 (社群互動) ◄──────────────────────┘
  │
  ▼
Phase 6 (管理後台)
  │
  ▼
Phase 7 (打磨上線)
```

**關鍵路徑**: Phase 0 → 1 → 2 → 3 → 4 → 7

Phase 5 (Sandbox) 可與 Phase 2 平行開發，初期 Code 類作品可先用 `srcdoc` iframe 本地渲染，後續再遷移至獨立域名。

Phase 6 (Admin) 為 P2 優先級，可在核心功能上線後再補齊。

---
**文件版本**: 1.0
**最後更新**: 2026-02-10
