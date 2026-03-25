# old-kana-converter

変体仮名のマッピングを使ってテキストを変換する小さなウェブアプリケーションです。

## 前提
- Node.js（推奨: 16+）
- npm
- Python 3（CSV エクスポート用スクリプト実行時）

## 開発（ローカル）
1. 依存関係をインストール:
```bash
npm install
```

2. 開発サーバを起動（Vite）:
```bash
npm run dev
```
ブラウザで http://localhost:5173 を開き、動作を確認してください。

## ビルド / 公開
1. ビルド:
```bash
npm run build
```
ビルド成果物は dist/ に出力されます（vite.config.js の outDir）。

2. ビルド成果物をローカルで確認（プレビュー）:
```bash
npm run preview
```

## CSV エクスポート（変体仮名一覧を取得）
リモートの表を取得して CSV を生成します（ネットワーク必須）:
```bash
python scripts/export_csv.py
```
出力: `out/mapper.csv`（上書き保存）

README_EXPORTER.md に仕様の詳細があります。

## 主要ファイル
- index.html — アプリ本体（UI）
- src/main.js — フロントエンドのロジック（src/mapper.json を fetch）
- src/mapper.json — 変換マップ（編集して変換を追加／修正）
- scripts/export_csv.py — 変体仮名一覧を取得して out/mapper.csv を生成するスクリプト
- out/mapper.csv — エクスポート結果（スクリプトで生成）
- vite.config.js — ビルド設定（outDir: dist）

## 変更を反映する流れ
- 開発中: `npm run dev` を実行してブラウザでリロードすれば src/mapper.json の変更を確認できます。
- 本番用ビルド: `npm run build` → `npm run preview` で確認。

## 注意事項
- `scripts/export_csv.py` は外部サイト（https://cid.ninjal.ac.jp/kana/list/）を取得してパースします。ネットワーク状態に依存し、既存 `out/mapper.csv` を上書きします。必要なら事前にバックアップしてください。

## ライセンス
リポジトリの LICENSE を参照してください（無ければプロジェクトオーナーに確認してください）。