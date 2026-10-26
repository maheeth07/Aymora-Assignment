# Aymora Spark ✨
> **"Help people discover meaningful compatibility, start natural conversations, and build genuine connections."**

Aymora Spark is an intentional, privacy-conscious dating and meaningful-connection platform built from the ground up to counteract shallow endless-swiping, deceptive engagement mechanics, and public popularity metrics.

---

## 🌟 Core Pillars & Product Architecture

1. **Deterministic & Transparent Compatibility**:
   * Uses **Jaccard Similarity** ($J(A, B) = \frac{|A \cap B|}{|A \cup B|} \times 100$) on verified interests and declared preferences.
   * Explains *why* two people match in human terms without falsely claiming scientific certainty or black-box destiny.
   * Handles edge cases gracefully: empty interests result in an `"unknown"` score (0%) rather than an artificial 100%.

2. **Radical Double-Blind Privacy**:
   * Expressing interest in another member is **strictly private**.
   * Connections and conversation threads only unlock once **both** members have independently expressed mutual interest.
   * Zero public like counters, zero popularity badges, and zero vanity feeds.

3. **Groq AI Conversation Companion**:
   * Generates 3 contextual conversational sparks: **Funny** (witty/playful), **Flirty** (warm/charming), and **Sweet** (sincere/thoughtful).
   * Contextualized on shared interests, bio notes, and recent message turns.
   * **Human in the Loop**: AI drafts are previewed and inserted into the message composer—the user edits the message and clicks Send manually. AI never sends automatically.
   * **Reliable Fallback**: Built-in deterministic contextual fallback engine ensures high-quality suggestions even when offline or without a Groq API key.
   * **Key Security**: `GROQ_API_KEY` is kept strictly on the backend. Never exposed to the frontend client.

4. **Interactive Icebreaker Games**:
   * Curated **"Would You Rather?"** interactive mini-game with 16 original dilemmas.
   * Progress tracking, selection feedback, and easy conversation transitions.

---

## 🏗️ Technical Stack

* **Frontend**: Next.js 16 (App Router), TypeScript, Tailwind CSS, Lucide React.
* **Backend**: Python 3.11, FastAPI, Pydantic v2, Uvicorn, Pytest.
* **AI Service**: Groq API (`llama-3.3-70b-versatile` / configurable model) with structured JSON output and safety constraints.
* **Data Layer**: In-memory repository seeded from realistic fictional profiles and questions, strictly decoupled and ready for MongoDB.

---

## 🎭 Prototype User & Simulated State

To enable instant exploration without requiring signup or login screens, the prototype operates with a simulated active session:
* **Active Demo User**: **Maya Lin** (26, Architectural Designer, Brooklyn, NY)
  * Interests: *Specialty Coffee, Modern Architecture, Analog Photography, Ceramics, Indie Cinema, Bouldering*
* **Pre-Seeded Mutual Match Dynamic**:
  * **Julian Vance** (`user-01`) has already privately expressed interest in Maya. When you click **Express Interest** on Julian's card, a mutual connection triggers immediately, unlocking a conversation thread!
  * **Elena Rostova** (`user-02`) already shares a mutual connection with Maya, with an active message thread ready for testing AI conversation suggestions.
  * **Kaelen Chen** (`user-03`), **Siddharth Mehta** (`user-04`), and others have not yet expressed interest, demonstrating the pending private state.

---

## 🚀 Quickstart Guide

### Prerequisites
* **Node.js** v18+ (tested on Node v22+)
* **Python** 3.10+ (tested on Python 3.11)

---

### Step 1: Start the FastAPI Backend

1. Navigate to the project root:
   ```bash
   # Create and activate virtual environment (if not already created)
   python -m venv backend/venv

   # Windows (PowerShell)
   .\backend\venv\Scripts\Activate.ps1
   # Linux / macOS
   source backend/venv/bin/activate

   # Install dependencies
   pip install -r backend/requirements.txt
   ```

2. Configure environment variables:
   ```bash
   # Backend .env configuration
   cp backend/.env.example backend/.env
   ```
   *(Optional)* Add your `GROQ_API_KEY` to `backend/.env`. If omitted, the backend seamlessly uses its built-in contextual fallback engine.

3. Run the FastAPI development server:
   ```bash
   python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
   ```
   * Live API: `http://127.0.0.1:8000`
   * Interactive OpenAPI Docs: `http://127.0.0.1:8000/docs`

4. Run the automated backend test suite (25 passing tests):
   ```bash
   pytest
   ```

---

### Step 2: Start the Next.js Frontend

1. In a separate terminal, navigate to the `frontend/` directory:
   ```bash
   cd frontend
   npm install
   ```

2. Configure environment variables:
   ```bash
   cp .env.example .env.local
   ```
   *(Defaults to `NEXT_PUBLIC_API_URL=http://127.0.0.1:8000`)*

3. Start the Next.js development server:
   ```bash
   npm run dev
   ```

4. Or verify the production build:
   ```bash
   npm run build
   npm run start
   ```

5. Open your browser at:
   * **Landing Page**: [http://localhost:3000](http://localhost:3000)
   * **Smart Matches**: [http://localhost:3000/discover](http://localhost:3000/discover)
   * **Conversations**: [http://localhost:3000/conversations](http://localhost:3000/conversations)
   * **Would You Rather Game**: [http://localhost:3000/games/would-you-rather](http://localhost:3000/games/would-you-rather)

---

## 📡 API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Service health status and version info |
| `GET` | `/api/profiles` | List candidate profiles with interest filtering |
| `GET` | `/api/profiles/me` | Fetch active simulated logged-in profile (Maya Lin) |
| `GET` | `/api/profiles/{id}` | Retrieve individual profile details and preferences |
| `POST` | `/api/matches` | Calculate deterministic Jaccard similarity & explanations |
| `POST` | `/api/connections/interest` | Register private interest; creates mutual connection if reciprocated |
| `GET` | `/api/connections` | List confirmed mutual connections for a user |
| `GET` | `/api/conversations` | List active mutual conversation threads |
| `GET` | `/api/conversations/{id}` | Get messages and partner context for a thread |
| `POST` | `/api/conversations/{id}/messages` | Post a message to an active conversation thread |
| `POST` | `/api/chat/suggestions` | Generate 3-tone Groq AI conversation starters (Funny, Flirty, Sweet) |
| `GET` | `/api/games/would-you-rather` | Retrieve curated conversation game questions |

---

## 🎨 Visual Identity & Design Tokens

* **Aubergine / Deep Plum (`#3B1E34`)**: Intimacy, depth, and sophistication.
* **Soft Lavender (`#EAE3F7`, `#F5F1FD`)**: Gentle low-contrast surfaces.
* **Warm Cream (`#FAF7F2`)**: Calming, editorial background.
* **Muted Rose (`#D07086`)**: Warm accents and private interest indicators.
* **Subtle Emerald (`#2E7D58`)**: Mutual connection celebrations.
* **Charcoal (`#1F1A24`)**: High-contrast, fatigue-free typography.

---

## 🧪 Test Coverage Summary

The backend test suite (`pytest`) covers 25 comprehensive test scenarios:
* **Jaccard Similarity Engine**: Identical sets (100%), partial overlap (e.g. 33.3%), zero overlap (0%), empty sets (`unknown` status), age filtering, and deterministic tie-breaking.
* **Double-Blind Privacy & Connections**: One-way private registration, reciprocal mutual connection triggering, self-interest prevention, and missing profile handling.
* **Groq AI Service**: Structured 3-tone output generation, mock LLM responses, graceful fallback when no API key is provided, and timeout/error resilience.
* **API Endpoints**: Health, profiles list, profile by id, matches, connections, chat suggestions, and Would You Rather questions.

---

## 🌐 Production Deployment Guide

### Frontend (Vercel)
1. Push this repository to GitHub.
2. Import the `frontend` root directory into [Vercel](https://vercel.com).
3. Set the environment variable `NEXT_PUBLIC_API_URL` to your hosted FastAPI backend URL.
4. Deploy!

### Backend (Render / Railway / Fly.io)
1. Deploy the `backend` directory as a Python web service.
2. Build command: `pip install -r backend/requirements.txt`
3. Start command: `uvicorn backend.main:app --host 0.0.0.0 --port $PORT`
4. Set environment variables:
   * `FRONTEND_ORIGIN`: Your deployed frontend URL (e.g., `https://aymora-spark.vercel.app`)
   * `GROQ_API_KEY`: Your Groq API key from console.groq.com
   * `GROQ_MODEL`: `llama-3.3-70b-versatile`

---

## 🔮 Future Improvements & MongoDB Roadmap

* **Persistent Database**: Transition from the `InMemoryRepository` interface directly to MongoDB using Motor / Beanie. The schema structure in `backend/schemas/` matches document collections 1-to-1:
  * `profiles`: `id`, `name`, `age`, `bio`, `avatar`, `interests`, `preferences`.
  * `interests`: `{ from_user_id, to_user_id, created_at }` with compound index `(from_user_id, to_user_id)`.
  * `conversations`: `{ id, participant_ids, messages: [...] }`.
* **Real-time WebSockets**: Upgrade chat and mutual interest notifications from polling/REST to WebSockets with instant celebratory animations.
* **Voice Notes & Audio Snippets**: Add 30-second audio prompts to complement written bios with authentic vocal tone.

