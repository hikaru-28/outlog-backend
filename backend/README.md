# Outlog

**学びを記録し、成長を可視化する学習習慣化サービス**

🔗 **デモ**: [https://outlog-frontend.vercel.app](https://outlog-frontend.vercel.app)

> テストアカウント: email: `test@example.com` / password: `test`

---

## 開発動機

動画や本を読んでもアウトプットせずに終わることが多く、特に本は「読んで満足」で終わってしまう経験が続いていました。プログラミング学習においても、インプットで終わってしまい知識が定着しないという課題を感じていました。

この問題を解決するために、インプットをアウトプットに変換する習慣をサポートするサービスとして **Outlog** を開発しました。アクティブリコール（記憶から情報を能動的に引き出す練習）を活用することで、学習の定着率向上を目指しています。

---

## 機能一覧

| 機能 | 説明 |
|------|------|
| ユーザー認証 | メール・パスワードによる登録・ログイン（JWT） |
| インプット管理 | 本・YouTube・記事などのインプットをCRUD管理 |
| アウトプット記録 | インプットに対してアウトプットを記録・何度でも更新可能 |
| 警告表示 | 登録から24時間経過してもアウトプット未完了のインプットをハイライト |
| ページネーション | インプット一覧を10件ずつページネーション |

---

## 技術スタック

### フロントエンド
| 技術 | 選定理由 |
|------|----------|
| React / TypeScript | コンポーネントベースの開発と型安全性を両立するため |
| Tailwind CSS | ユーティリティファーストで素早くスタイリングできるため |
| shadcn/ui | アクセシビリティに配慮した高品質なUIコンポーネントを活用するため |
| Vite | 高速な開発環境とビルドを実現するため |

### バックエンド
| 技術 | 選定理由 |
|------|----------|
| Node.js / Express / TypeScript | フロントと同じ言語で開発でき、学習コストを抑えられるため |
| PostgreSQL | リレーショナルデータの整合性を保つため |
| Prisma | 型安全なDBアクセスとマイグレーション管理のため |
| JWT | ステートレスな認証でスケーラビリティを確保するため |

### インフラ
| 技術 | 用途 |
|------|------|
| Vercel | フロントエンドのホスティング |
| Render | バックエンドのホスティング |
| Render PostgreSQL | 本番データベース |

---

## 技術選定の詳細

### TypeScript
JavaScriptは動的型付けのため、意図しない型変換によるバグが発生しやすい。TypeScriptを採用することで開発中にコンパイルエラーとして検出でき、本番環境でのバグを未然に防げる。特にフロントとバックエンドで同じ型定義を共有することで、APIのレスポンス形式が変わったときにも即座に気づける。

### PostgreSQL（RDBを選んだ理由）
今回のデータ構造は`User → Input（1対多）→ Output（1対1）`というリレーションが明確に存在する。RDBはこういったテーブル間の関係が明確なデータに向いている。またアウトプット作成時に`isOutputDone`を同時に更新するトランザクション処理が必要だったため、トランザクションが得意なRDBが適切だった。

### Prisma（ORMを採用した理由）
生のSQLではなくORMを採用した理由は主に3つ：

1. **型安全性**: PrismaはスキーマからTypeScriptの型を自動生成するため、DBのカラムが変わったときにコード全体でエラーが出て気づける
2. **SQLインジェクション対策**: Prismaは自動でエスケープ処理をするため、セキュリティリスクを減らせる
3. **マイグレーション管理**: `schema.prisma`を変更して`prisma migrate dev`を実行するだけでマイグレーションファイルが自動生成・実行され、変更履歴も管理される

### JWT認証
セッション認証はサーバー側にセッション情報を保存する必要があるが、JWTはトークン自体に情報が含まれているためサーバー側に状態を持たない（ステートレス）。フロント（Vercel）とバックエンド（Render）が別サーバーに分かれている構成ではセッション共有が難しいため、JWTが適切だった。

### Vercel + Render
| | Vercel+Render | AWS | Heroku |
|--|--|--|--|
| 料金 | 無料 | 有料 | 無料プランなし |
| 設定の簡単さ | 簡単 | 複雑 | 普通 |
| GitHub連携 | 自動デプロイ | 手動設定 | 可能 |

個人開発・学習目的では無料で使えてGitHubと連携できるVercel+Renderが最適だった。環境変数・ビルドコマンド・本番DBの分離など、実務に近いデプロイの概念を学べた。

---

## システム構成

```
outlog/
├── frontend/          # React + TypeScript
│   ├── src/
│   │   ├── api/          # APIクライアント（fetch）
│   │   ├── components/   # 再利用UIコンポーネント
│   │   ├── pages/        # 各画面
│   │   └── types/        # 型定義
│   └── package.json
│
└── backend/           # Express + TypeScript
    ├── src/
    │   ├── controllers/  # ビジネスロジック
    │   ├── middlewares/  # JWT認証
    │   ├── routes/       # ルーティング
    │   └── prisma/       # スキーマ・マイグレーション
    └── package.json
```

---

## DB設計

```
User ──(1対多)──> Input ──(1対1)──> Output
```

| テーブル | 主なカラム |
|---------|-----------|
| users | id, email, password, createdAt |
| inputs | id, userId, title, type, memo, isOutputDone, createdAt |
| outputs | id, inputId, content, createdAt, updatedAt |

---

## API設計

### 認証
| メソッド | パス | 説明 |
|----------|------|------|
| POST | /api/auth/register | ユーザー登録 |
| POST | /api/auth/login | ログイン |

### インプット（要認証）
| メソッド | パス | 説明 |
|----------|------|------|
| GET | /api/inputs | 一覧取得（ページネーション対応） |
| POST | /api/inputs | 登録 |
| PATCH | /api/inputs/:id | 編集 |
| DELETE | /api/inputs/:id | 削除 |

### アウトプット（要認証）
| メソッド | パス | 説明 |
|----------|------|------|
| GET | /api/inputs/:id/output | 取得 |
| POST | /api/inputs/:id/output | 記録 |
| PATCH | /api/inputs/:id/output | 更新 |

---

## 工夫した点

### フロントエンド
- **fetchWithAuthによる共通化**: 全APIリクエストを`fetchWithAuth`に統一し、401エラー時の自動リダイレクトを実装。各APIファイルはエラーをthrowするだけにして、画面側でtry-catchするパターンで責務を分離した
- **ページネーション**: バックエンド側でskip/takeを使ったページネーションを実装し、大量データに対応
- **スケルトンローディング**: データ取得中はスケルトンUIを表示しUXを改善
- **staggerアニメーション**: カードに順番に遅延をつけてリスト表示をスムーズに

### バックエンド
- **トランザクション処理**: アウトプット作成時に`isOutputDone`の更新を`$transaction`でアトミックに処理。片方だけ成功する中途半端な状態を防いだ
- **カスケード削除**: インプット削除時に紐づくアウトプットを先に削除してから親レコードを削除することで外部キー制約エラーを回避
- **多層バリデーション**: フロントとバックエンド両方でバリデーションを実装。フロントは素早いフィードバックのため、バックエンドはAPIを直接叩かれた場合のセキュリティのため

---

## 苦労した点

### Prisma v7への対応
Prisma v7からDB接続URLの設定方法が大きく変わった。v6まで`schema.prisma`に書いていた接続URLを`prisma.config.ts`に移す必要があり、さらに`@prisma/adapter-pg`というアダプターが新たに必要になった。エラーメッセージと公式ドキュメントを読み解きながら対応した。メジャーバージョンアップでは破壊的変更が起きることを体験的に学んだ。

### 型定義パッケージのdependencies管理
Renderでのビルドが`@types/express`が見つからずに失敗した。原因は`devDependencies`に入っていたため本番ビルド時にインストールされなかったこと。`devDependencies`は本番環境では`npm install`でインストールされないことを理解し、TypeScriptのビルドに必要なパッケージは`dependencies`に入れる必要があることを学んだ。

### 環境変数の管理
本番環境で`VITE_API_URL`が`undefined`になりAPIに繋がらなかった。ViteはビルドCHARACTER時に環境変数を埋め込む仕組みのため、`.env`ファイルはgitignoreされておりVercelには届かない。Vercelのダッシュボードで別途環境変数を設定する必要があることを学んだ。ローカルとデプロイ環境で環境変数の管理方法が異なることを理解した。

---

## ローカル環境構築

### 必要なもの
- Node.js 18以上
- PostgreSQL 16以上

### バックエンド

```bash
cd backend
npm install
```

`.env`を作成：
```env
DATABASE_URL="postgresql://ユーザー名@localhost:5432/outlog_dev"
JWT_SECRET="your-secret-key"
```

```bash
npx prisma migrate dev
npm run dev
```

### フロントエンド

```bash
cd frontend
npm install
```

`.env`を作成：
```env
VITE_API_URL=http://localhost:3000/api
```

```bash
npm run dev
```

---

## 今後の展望

- リマインド通知（メール・Push通知）
- タグ・検索・フィルタ機能
- 学習統計・グラフ表示
- SNS共有機能