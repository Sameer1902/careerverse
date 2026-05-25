# CareerVerse

**CareerVerse** is an AI-powered career guidance application built with a React Native (Expo) front‑end, a Node.js/Express API server, and a PostgreSQL (or other) backend. The repository contains three main workspaces:

- `mobile` – the Expo app (React Native).
- `api-server` – the Express API.
- `mockup-sandbox` – design mock‑ups (not needed for running locally).

## Prerequisites

- **Node.js** (v20+ recommended)
- **pnpm** (v9+). Install via `npm i -g pnpm`.
- **Git**
- **Windows PowerShell** (or any terminal that supports `cross-env` style env vars).

## Setup

```bash
# Clone the repo (if not already)
git clone <repo‑url>
cd careerverse

# Install dependencies for the whole workspace
pnpm install
```

### Windows specific fix

The root `package.json` contains a `preinstall` script that only works on Unix shells. It has been replaced with a no‑op for Windows.

## Running the Mobile App locally

```bash
# From the repository root
cd artifacts/mobile

# Start the Expo development server on localhost
pnpm dev
```

The command will start Expo and open a local web preview at `http://localhost:19006`. You can also run it on a connected Android/iOS emulator.

## Running the API server locally

```bash
cd artifacts/api-server
pnpm dev
```

The API will start on the default port (usually `3000`). Adjust any environment variables as needed.

## Fetching the README

The `README.md` you are currently reading is located at the repository root. You can open it directly in any editor or view it in the browser.

## Notes

- If you encounter any permission errors, run the terminal as Administrator.
- Ensure that the environment variables used in `mobile/package.json` (e.g., `REPL_ID`, `OPENAI_API_KEY`) are set in your `.env` or PowerShell session if you need the AI features.

Happy coding! 🎉
