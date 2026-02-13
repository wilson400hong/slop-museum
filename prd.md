# Slop Museum 產品需求文件 (PRD)

## 1. 概述

### 1.1 願景 (Vision)

**頌揚不完美的創造 (Celebrate the Imperfect)。**

在 AI/Vibe Coding 時代，快速原型和實驗性作品層出不窮。Slop Museum 旨在成為一個專門收藏和展示這些「半成品」的數位博物館。我們鼓勵創作者分享那些充滿創意、幽默感或獨特想法但可能不夠完美、不夠完整的作品，並為用戶提供一個在「廢料」中「淘金」的獨特發現體驗。

### 1.2 項目名稱

**Slop Museum**

*   **Slop (垃圾內容/半成品)**：重新定義為一種充滿實驗性、可能粗糙但有靈魂或創意的產物。
*   **Museum (博物館)**：賦予這些產物被「策展」、「收藏」和「展示」的價值。

### 1.3 目標用戶 (Target Audience)

*   **創作者 (Creators)**：
    *   喜歡使用 AI/Vibe Coding 進行快速原型開發的工程師、設計師和數位藝術家。
    *   希望在一個低壓力、正向鼓勵的環境中分享自己腦洞大開、有趣、奇怪或實驗性作品的愛好者。
*   **瀏覽者 (Audience)**：
    *   對 AI 生成內容、生成式藝術、獨立遊戲/應用有濃厚興趣的探索者。
    *   尋求靈感、娛樂，或想加入一個圍繞「不完美創造」的次文化社群的用戶。

## 2. 核心功能 (MVP)

我們的 MVP 旨在用最核心的功能驗證產品價值，讓創作者能輕鬆分享，瀏覽者能愉快發現。

### 2.1 用戶系統

*   **註冊/登入**: 支援透過第三方 OAuth (**Google** / **GitHub**) 進行一鍵註冊和登入。免去用戶記憶密碼的負擔。
*   **匿名選項**: 用戶在提交作品或進行互動時，可選擇「匿名」模式。該操作在後台仍與其帳號關聯，但在前台顯示為 "Anonymous"。
*   **用戶個人頁**: 展示用戶發布過的所有作品、獲得的反應統計，以及收藏的作品列表。此為創作者分享動機的核心，MVP 即納入。

### 2.2 作品 (Slop) 上傳與管理

創作者登入後，可提交新作品。上傳時需選擇兩種模式之一：

*   **模式 A：URL 提交**
    *   **輸入欄位**:
        *   作品標題
        *   作品連結 (公開的 URL)
        *   作品簡介 (純文字)
        *   **預覽圖/GIF**: 系統自動擷取目標 URL 的 OG Image 作為預覽圖；若擷取失敗或用戶不滿意，可手動上傳覆蓋。
*   **模式 B：Code Snippet 提交 (程式碼沙盒)**
    *   **輸入欄位**:
        *   作品標題
        *   作品簡介 (純文字)
        *   **程式碼編輯器**: 提供 HTML / CSS / JavaScript 三欄編輯器（類似 CodePen），支援完整的前端作品提交。也可僅貼上 JS 程式碼，系統會自動包裹在標準 HTML 模板中。
        *   **預覽圖/GIF**: 系統在沙盒環境中自動截圖生成預覽圖；用戶也可手動上傳覆蓋。

*   **通用欄位**:
    *   **標籤 (Tags)**: 創作者必須為作品選擇 1-3 個預設標籤，以便分類和發現 (例如: `game`, `tool`, `art`, `music`, `useless`, `funny`)。
    *   **匿名發布**: 可勾選此項進行匿名發布。

*   **上傳限制**:
    *   預覽圖/GIF 最大檔案大小：5MB。
    *   支援格式：JPEG, PNG, GIF, WebP。
    *   系統將自動壓縮並生成縮圖供列表頁使用。

### 2.3 作品瀏覽與發現

*   **主頁**:
    *   以**卡片式瀑布流**展示所有 Slops，預設按**提交時間倒序**排列。
    *   每張卡片應清晰展示**預覽圖/GIF、標題、作者名（或匿名）、標籤、反應統計摘要**。
*   **篩選**:
    *   頁面頂部或側邊提供所有可用的**標籤**列表。
    *   用戶點擊標籤後，主頁列表會篩選出包含該標籤的所有作品。
*   **作品詳情頁**:
    *   所有作品（無論 URL 類或 Code Snippet 類）點擊卡片後，皆進入**作品詳情頁**。
    *   詳情頁展示：標題、作者、簡介、標籤、反應統計、發布時間。
    *   **URL 類作品**：詳情頁提供「打開作品」按鈕，在新分頁中打開外部連結。
    *   **Code Snippet 類作品**：詳情頁內嵌安全的 `<iframe>` 沙盒來運行和展示該作品，並提供「全螢幕」按鈕。
    *   用戶可在詳情頁進行反應和收藏操作。

### 2.4 社群互動

*   **標籤式反應 (Reaction Tags)**:
    *   取代傳統的「讚」或 1-5 星評分。
    *   在每個作品的詳情頁及卡片下方，提供一組預設的 Emoji 反應標籤，供登入用戶點擊。
    *   建議標籤:
        *   😂 **好笑 (Hilarious)**
        *   🤯 **腦洞大開 (Mind-blown)**
        *   🔥 **很酷 (Cool)**
        *   🤔 **這啥？(WTF)**
        *   ✨ **有潛力 (Promising)**
    *   系統會統計每種反應的數量並顯示。
    *   每位用戶對同一作品可給出多種反應，但同一種反應只能點一次（toggle 機制）。
*   **匿名反應**: 用戶在給出反應時，也可選擇匿名。
*   **收藏功能**:
    *   登入用戶可收藏任何作品，收藏的作品會出現在個人頁的「收藏」分頁中。

### 2.5 內容審核 (Moderation)

*   **檢舉機制**: 任何登入用戶可對作品進行檢舉，需選擇檢舉原因（如：惡意內容、垃圾廣告、不當內容）。
*   **管理員後台**: 提供基本的管理介面，管理員可以：
    *   查看被檢舉的作品列表。
    *   下架（隱藏）或刪除違規作品。
    *   封禁違規用戶。
*   **Code Sandbox 安全防護**: 見第 3 節技術考量。

## 3. 技術架構

### 3.1 Tech Stack

| 層級 | 技術 | 說明 |
|---|---|---|
| **前端框架** | Next.js 14+ (App Router) | SSR/SSG 混合渲染，SEO 友好，內建 API Routes |
| **UI 樣式** | Tailwind CSS + shadcn/ui | 快速建構 UI，Modal、Tag 等元件開箱即用 |
| **後端 / BaaS** | Supabase | PostgreSQL + Auth (Google/GitHub OAuth) + Storage + RLS，一站式 MVP 後端 |
| **ORM (可選)** | Prisma | 若需更精細的資料庫控制，可搭配 Supabase PostgreSQL 使用 |
| **圖片儲存 / CDN** | Supabase Storage 或 Cloudflare R2 | 預覽圖/GIF 儲存與分發，R2 免出口費用 |
| **Code Sandbox** | Cloudflare Workers + R2 | 將用戶程式碼生成 HTML 檔案，存放於 R2，透過獨立子域名提供服務 |
| **部署** | Vercel | Next.js 最佳部署平台，免費方案足以支撐 MVP |

### 3.2 架構圖

```
Next.js (Vercel)
  ├── 前端頁面 (App Router + Tailwind + shadcn/ui)
  ├── API Routes (業務邏輯)
  └── Supabase
        ├── PostgreSQL (用戶、作品、反應、收藏、檢舉)
        ├── Auth (Google/GitHub OAuth)
        └── Storage (預覽圖/GIF)

Sandbox 子域名 (Cloudflare Workers + R2)
  └── 用戶提交的 Code → 生成 HTML → iframe 載入
```

### 3.3 Code Sandbox 安全策略

Code Sandbox 是本產品最大的安全風險點，需多層防護：

*   **獨立域名隔離**: Sandbox 內容必須在完全獨立的域名下運行（如 `sandbox.slopmuseum.com`），與主站域名不同源，防止 cookie 竊取和主站 DOM 存取。
*   **iframe sandbox 屬性**: 嚴格設定 `sandbox="allow-scripts"`，不允許 `allow-same-origin`、`allow-popups` 等權限。
*   **Content Security Policy (CSP)**: Sandbox 頁面需設定嚴格的 CSP header，限制網路請求、禁止載入外部資源。
*   **執行限制**:
    *   程式碼大小上限：500KB。
    *   前端可設定 iframe 載入超時（如 10 秒），超時則顯示錯誤提示。
*   **靜態檔案**: Sandbox 內容為純靜態 HTML 檔案（由 Workers 生成後存入 R2），不存在伺服器端程式碼執行風險。

### 3.4 資料模型 (概要)

```
users
  ├── id (UUID, PK)
  ├── display_name
  ├── avatar_url
  ├── provider (google / github)
  ├── role (user / admin)
  ├── is_banned (boolean)
  └── created_at

slops
  ├── id (UUID, PK)
  ├── user_id (FK → users)
  ├── title
  ├── description
  ├── type (url / code)
  ├── url (nullable, for URL type)
  ├── code_html (nullable, for code type)
  ├── code_css (nullable, for code type)
  ├── code_js (nullable, for code type)
  ├── sandbox_url (nullable, generated for code type)
  ├── preview_image_url
  ├── is_anonymous (boolean)
  ├── is_hidden (boolean, for moderation)
  └── created_at

tags
  ├── id (PK)
  └── name (unique)

slop_tags
  ├── slop_id (FK → slops)
  └── tag_id (FK → tags)

reactions
  ├── id (PK)
  ├── slop_id (FK → slops)
  ├── user_id (FK → users)
  ├── type (hilarious / mind_blown / cool / wtf / promising)
  ├── is_anonymous (boolean)
  └── created_at
  └── UNIQUE(slop_id, user_id, type)

bookmarks
  ├── user_id (FK → users)
  ├── slop_id (FK → slops)
  └── created_at
  └── UNIQUE(user_id, slop_id)

reports
  ├── id (PK)
  ├── slop_id (FK → slops)
  ├── reporter_id (FK → users)
  ├── reason (malicious / spam / inappropriate)
  ├── status (pending / reviewed / dismissed)
  └── created_at
```

## 4. 未來展望 (Post-MVP)

依優先級排序：

1.  **進階排序**: 除了最新，增加按「反應熱度」排序。
2.  **搜索功能**: 全站搜索作品標題、簡介、作者。
3.  **競賽/活動 (Slop Jams)**: 定期舉辦主題創作活動，鼓勵社群參與。
4.  **評論系統**: 在作品詳情頁加入文字評論功能。
5.  **LLM 輔助**: 使用大型語言模型自動為作品建議標籤或生成摘要。
6.  **通知系統**: 當作品收到新反應或評論時通知創作者。

---
**文件版本**: 2.0
**最後更新**: 2026-02-10
