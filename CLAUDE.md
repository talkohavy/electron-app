# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Package manager is **pnpm** (see `pnpm-workspace.yaml` / `.npmrc`).

- `pnpm dev` — run the app in development (electron-vite with HMR).
- `pnpm build` — typecheck (`tsc`) then build. Use `build:mac` / `build:win` / `build:linux` to produce distributables via electron-builder, `build:unpack` for an unpacked dir.
- `pnpm start` — preview a production build (`electron-vite preview`).
- `pnpm tsc` — typecheck both projects (`tsc:node` for main/preload, `tsc:web` for renderer). There is no single combined `tsconfig` for the whole app.
- `pnpm lint` — ESLint over the repo.
- `pnpm format:fix` — Biome formatter over `./src`. `pnpm format:prettier:fix` — Prettier over the whole repo.

There is **no test runner** configured in this project.

Note the split tooling: **Biome** formats `src/`, **Prettier** formats the rest of the repo, and **ESLint** lints. They coexist intentionally.

## Architecture

Standard Electron three-process split, plus a shared layer:

- `src/main` — Node/Electron main process (windows, native APIs, business logic & state).
- `src/preload` — the secure bridge; runs in an isolated context.
- `src/renderer` — React 19 UI (react-router, Tailwind v4).
- `src/common` — code shared across all three (types, constants, utils).

Each process has its own Vite config and path aliases (defined in `electron.vite.config.ts` and mirrored in the tsconfigs): `@root` → `src` (everywhere), plus `@main`, `@preload`, `@renderer` scoped to their process.

### The IPC contract is the backbone

All IPC channel names are string constants centralized in `src/common/constants/api-events.ts` (`ApiEvents`). **Both** the main-process controllers and the preload API import from here — never hardcode a channel string. This is the single source of truth binding the two sides together.

Three IPC directions, wrapped on each side:

| Direction | Main side (`IpcBridgeService`) | Preload side (`IpcService`) |
|---|---|---|
| request/response | `handle(channel, fn)` | `invoke(channel, ...args)` |
| fire-and-forget (renderer→main) | `on(channel, fn)` | `send(channel, ...args)` |
| push (main→renderer) | `emit(window, ...)` / `broadcast(...)` | `subscribe(channel, listener)` → returns unsubscribe |

### Main process: module pattern

`src/main/index.ts` → `start-server.ts` boots the app, creates one `IpcBridgeService`, and calls each feature's `initXModule(bridge)` before creating the window.

Each feature under `src/main/modules/<feature>/` follows:
- `<feature>.module.ts` — an `initXModule(bridge)` factory that instantiates the service + controller and calls `controller.register()`.
- `services/<feature>.service.ts` — holds state and logic; **no IPC knowledge** (e.g. `CounterService` keeps a value and an `onChange` listener set).
- `controllers/<feature>.controller.ts` — the only place IPC is wired. Controllers expose a **single public `register()`** method; each channel is bound in a private method. This convention is enforced by convention, not tooling (see recent git history).

To add a main-process capability: add the channel to `ApiEvents`, add/extend a service, wire it in the controller, and register the module in `start-server.ts`.

### Preload: the curated `window.api`

`src/preload/index.ts` uses `contextBridge` to expose exactly two globals to the renderer: `window.electron` (toolkit helper) and `window.api` (the typed `Api` class). The raw `ipcRenderer` is never exposed.

**Two non-obvious constraints that shape all preload API code** (documented in `src/preload/api/api.ts`):
1. `contextBridge` clones only own enumerable properties and strips prototype methods — so every public API method must be an **arrow-function class field** (see `counter.api.ts`), not a normal method.
2. A normal private field would still be cloned onto `window.api`. The injected `IpcService` is therefore stored in a **hard-private `#ipc`** field so it stays truly internal.

Each feature gets a class in `src/preload/api/features/` composed into `Api`.

### Renderer

- `src/preload/index.d.ts` augments `Window` with `RendererApi = typeof api`, so the renderer is fully typed against the real preload implementation with zero duplication — add a method in the preload API and the renderer sees it immediately.
- `src/renderer/src/lib/ipc/ipc.client.ts` re-exports `window.api` as `ipcClient` so components call `ipcClient.counter.get()` instead of touching the global.
- Use the `useIpcIncomingEvent` hook for main→renderer subscriptions; it handles unsubscribe on unmount. Forgetting to unsubscribe from `ipcRenderer` is the classic Electron memory leak.
- Routing is config-driven via `src/renderer/src/routes.ts` (lazy-loaded page components).
