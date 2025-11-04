# 算数ドリル学習アプリ

Next.js + Firebase Auth + AWS Amplifyで構築された一桁の足し算ドリル学習アプリです。

## 機能

- Firebase Authenticationによるメール/パスワード認証
- 1〜9の足し算問題をランダム生成
- 正解/不正解の判定とフィードバック
- ログインユーザーごとの今日解いた問題数の表示
- レスポンシブデザイン（Tailwind CSS使用）

## 技術スタック

- **フレームワーク**: Next.js 14 (Pages Router)
- **言語**: TypeScript
- **認証**: Firebase Authentication
- **スタイリング**: Tailwind CSS
- **ホスティング**: AWS Amplify
- **パッケージ管理**: npm

## 必要な環境変数

プロジェクトルートに `.env.local` ファイルを作成し、以下の環境変数を設定してください：

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

## ローカルでの起動手順

1. **依存関係のインストール**
   ```bash
   npm install
   ```

2. **環境変数の設定**
   - `.env.local.sample` を参考に `.env.local` ファイルを作成
   - Firebase プロジェクトの設定値を入力

3. **開発サーバーの起動**
   ```bash
   npm run dev
   ```

4. **ブラウザでアクセス**
   - http://localhost:3000 にアクセス

## Firebase設定

1. [Firebase Console](https://console.firebase.google.com/) でプロジェクトを作成
2. Authentication を有効化し、メール/パスワード認証を設定
3. プロジェクト設定から API キーなどの情報を取得
4. `.env.local` に設定値を記載

## AWS Amplifyでのデプロイ手順

1. **GitHubリポジトリの準備**
   ```bash
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/your-repo-name.git
   git push -u origin main
   ```

2. **AWS Amplify Console での設定**
   - AWS Amplify Console にアクセス
   - GitHubリポジトリを連携
   - ビルド設定は `amplify.yml` が自動的に使用される

3. **環境変数の設定**
   - Amplify Console の環境変数設定で Firebase の設定値を追加

4. **デプロイ**
   - 自動的にビルド・デプロイが実行される

## プロジェクト構成

```
├── amplify.yml                 # AWS Amplify ビルド設定
├── next.config.ts             # Next.js 設定
├── package.json               # 依存関係
├── tsconfig.json              # TypeScript 設定
├── .env.local.sample          # 環境変数のサンプル
├── src/
│   ├── components/
│   │   ├── Drill.tsx          # 算数ドリルコンポーネント
│   │   └── Layout.tsx         # レイアウトコンポーネント
│   ├── lib/
│   │   └── firebase.ts        # Firebase 設定
│   ├── pages/
│   │   ├── _app.tsx           # アプリケーションのエントリーポイント
│   │   ├── index.tsx          # メインページ（認証ガード付き）
│   │   └── login.tsx          # ログイン・登録ページ
│   └── styles/
│       └── globals.css        # グローバルスタイル
└── public/                    # 静的ファイル
```

## 使用方法

1. アプリにアクセスすると自動的にログインページに遷移
2. 新規ユーザーは「アカウント作成」でメール/パスワードを登録
3. 既存ユーザーはログイン
4. ログイン後、算数ドリル画面で1〜9の足し算問題に挑戦
5. 正解すると次の問題が表示され、解いた問題数がカウントアップ

## 開発コマンド

```bash
# 開発サーバー起動
npm run dev

# プロダクションビルド
npm run build

# プロダクションサーバー起動（ローカル確認用）
npm start

# リント実行
npm run lint
```

## ライセンス

MIT
