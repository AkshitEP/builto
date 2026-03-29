# 🚀 Builto — AI Startup Factory

> Describe your startup idea. AI agents validate, plan, architect, and build it for you.

**Builto** is an AI-powered platform that takes a raw startup idea and runs it through a pipeline of specialized AI agents — from market validation to working MVP code — all with human-in-the-loop approval at every stage.

---

## ✨ Features

| Agent | What It Does |
|-------|-------------|
| 🔍 **Validator** | 4-stage market/competitor/risk analysis with real-time web research |
| 📋 **Planner** | Breaks idea into phases & tasks with dynamic checklists |
| 🏗️ **Tech Architect** | Designs system architecture and tech stack |
| 💼 **Business Strategist** | Revenue models, GTM strategy, financial projections |
| 💻 **Developer** | Generates actual MVP code with live preview |

### Key Highlights
- **Multi-Agent Pipeline** — Each agent specializes in one domain and passes context to the next
- **Web Research** — Validator searches the web (via Tavily + DuckDuckGo) for real market data
- **Human-in-the-Loop** — Approve/reject at each stage before proceeding
- **Live Code Preview** — Developer agent generates and renders code in-browser
- **Auth & Persistence** — GitHub OAuth + Supabase PostgreSQL for saving projects

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | [Next.js 16](https://nextjs.org) (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| LLM | [Groq Cloud](https://console.groq.com) (Llama 3.3 70B) |
| Web Search | [Tavily](https://tavily.com) + DuckDuckGo |
| Auth | NextAuth.js (GitHub OAuth) |
| Database | Supabase PostgreSQL + Prisma ORM |
| State | Zustand (with localStorage persistence) |
| UI | Framer Motion + Lucide Icons |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or pnpm
- Groq Cloud API key (free at [console.groq.com](https://console.groq.com))
- Supabase project (free tier works)

### 1. Clone the repo
```bash
git clone https://github.com/akshitep/builto.git
cd builto
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment
```bash
cp .env.example .env
```

Fill in your `.env` with:
- **`DATABASE_URL`** / **`DIRECT_URL`** — from [Supabase Dashboard](https://supabase.com/dashboard) → Settings → Database
- **`NEXTAUTH_SECRET`** — generate with `openssl rand -base64 32`
- **`GITHUB_CLIENT_ID`** / **`GITHUB_CLIENT_SECRET`** — from [GitHub OAuth Apps](https://github.com/settings/developers)
- **`GROQ_API_KEY`** — free at [console.groq.com](https://console.groq.com)
- **`TAVILY_API_KEY`** — free at [tavily.com](https://tavily.com) (1,000 calls/month)

### 4. Set up the database
```bash
npx prisma generate
npx prisma db push
```

### 5. Run the dev server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and start building!

---

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages & API routes
│   ├── api/
│   │   ├── chat/           # Groq Cloud LLM endpoint
│   │   ├── validate/       # Validator Agent API (web search)
│   │   └── plan/           # Planner Agent API
│   ├── auth/               # Auth pages
│   └── page.tsx            # Main dashboard
├── components/             # React components
│   ├── agent-views/        # Per-agent result displays
│   └── ...
├── lib/
│   ├── agents/             # AI Agent implementations
│   │   ├── validator/      # 4-stage validation pipeline
│   │   │   ├── nodes/      # Market, Competitor, Risk, Strategic
│   │   │   ├── prompts/    # LLM prompt templates
│   │   │   └── tools/      # Web search with caching
│   │   ├── planner/        # Task decomposition & planning
│   │   │   ├── nodes/      # Decomposer, Implementation Planner
│   │   │   ├── prompts/    # LLM prompt templates
│   │   │   └── store.ts    # Zustand task state
│   │   └── *.ts            # Other agents
│   ├── llm/                # LLM client wrappers
│   ├── orchestrator/       # Agent pipeline orchestration
│   └── auth.ts             # NextAuth config
├── store/                  # Zustand global state
└── types/                  # TypeScript type definitions
```

---

## 🔒 Security

- All API keys are loaded from environment variables only
- `.env` is gitignored — secrets never touch source control
- Server-side API routes handle all LLM and search calls
- OAuth tokens managed by NextAuth.js with secure session handling

---

## 🚢 Deployment

### Vercel (Recommended)
1. Push to GitHub
2. Import project at [vercel.com/new](https://vercel.com/new)
3. Add all environment variables from `.env.example`
4. Deploy!

### Environment Variables for Production
Set these in your hosting provider's dashboard:
```
DATABASE_URL
DIRECT_URL
NEXTAUTH_SECRET
NEXTAUTH_URL=https://your-domain.com
GITHUB_CLIENT_ID
GITHUB_CLIENT_SECRET
GROQ_API_KEY
GROQ_MODEL=llama-3.3-70b-versatile
TAVILY_API_KEY
```

---

## 📝 License

MIT

---

## 🤝 Contributing

Contributions welcome! Please open an issue first to discuss what you'd like to change.

---

Built with ❤️ and AI agents
