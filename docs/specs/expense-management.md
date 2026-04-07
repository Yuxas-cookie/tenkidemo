# 経費管理（レシート読み取り）機能 仕様書

- **ステータス**: 確定
- **作成日**: 2026-04-08
- **目的**: レシート写真をアップロードし、AIが自動で金額・品目を抽出。現場別の経費管理を実現

---

## 概要

### フロー
```
レシート写真アップロード → Gemini Vision APIで読み取り
→ 金額・日付・店舗・品目を自動抽出 → カテゴリ自動分類
→ 現場紐付け（任意） → 経費一覧に登録
```

### 画面
- **新規ページ**: `/expenses` — 経費管理
- **サイドメニュー追加**: 「経費管理」（Receipt アイコン）

---

## 確定仕様

### レシート読み取り（Gemini Vision API）
- 画像アップロード → Gemini 2.0 Flash で OCR
- 抽出項目: 金額、日付、店舗名、品目リスト
- カテゴリ自動分類: 材料費/交通費/工具・消耗品/食費/その他
- APIキー: `GEMINI_API_KEY` を .env.local に設定
- APIキー未設定時: モックデータで動作

### 経費データ
```typescript
interface Expense {
  id: string;
  date: string;
  storeName: string;
  amount: number;
  category: "material" | "transport" | "tool" | "food" | "other";
  items: { name: string; price: number }[];
  siteId: string | null;  // null = 紐付けなし
  receiptImage: string;   // base64
  createdAt: string;
}
```

### カテゴリ
| ID | ラベル | アイコン | 色 |
|----|--------|---------|-----|
| material | 材料費 | 🎨 | blue |
| transport | 交通費 | 🚗 | green |
| tool | 工具・消耗品 | 🔧 | amber |
| food | 食費・飲料 | 🍱 | orange |
| other | その他 | 📦 | gray |

### 現場紐付け
- 登録時に現場を選択（任意）
- 「紐付けなし」も選択可能
- 現場別フィルターで経費を絞り込み

### 一覧表示
- 日付降順でカード表示
- フィルター: カテゴリ / 現場 / 期間
- 月別サマリー（カテゴリ別の合計）
- 現場別サマリー

---

## MVP除外
- CSV/PDF出力
- 編集・削除機能（デモでは追加のみ）
- 写真の永続保存（リロードでリセット）
