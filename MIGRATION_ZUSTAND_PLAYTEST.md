# Migração Zustand — /playtest

## Estratégia

Criar uma rota paralela `/playtest-v2` com a nova stack Zustand.
O `/playtest` original fica **intocado** até tudo funcionar.
Quando validado, o `/playtest-v2` substitui o `/playtest` e os arquivos antigos são deletados.

---

## Status atual

| Fase | Status |
|---|---|
| Fase 0 — Setup | ✅ Concluído |
| Fase 1 — Store Zustand | ✅ Concluído |
| Fase 2 — Rota nova | ✅ Concluído (swap direto — sem rota /playtest-v2) |
| Fase 3 — Validação | ⏳ Pendente (validação manual no browser) |
| Fase 4 — Swap | ✅ Concluído (feito diretamente em /playtest) |
| Fase 5 — Fix multiplayer bridge | ✅ Concluído |

---

## Arquivos que NÃO mudam (reutilizados sem alteração)

| Arquivo | Motivo |
|---|---|
| `src/lib/game/reducer.ts` | Função pura — entra direto no store |
| `src/lib/game/actions.ts` | Tipos de ação não mudam |
| `src/lib/game/types.ts` | GameState shape não muda |
| `src/lib/game/history.ts` | `pushHistory`, `undoHistory`, `redoHistory` reutilizados |
| `src/lib/game/selectors.ts` | Selectors puros — reutilizados no hook |
| Todos os componentes de `src/features/playtest/components/**` | Consomem apenas via `useGameStore()` — não tocam o Provider |

---

## Novos arquivos criados

```
src/features/playtest-v2/
└── store/
    └── useGameStore.tsx        ← Store Zustand + GameStoreProvider + bridge legado

src/app/playtest-v2/
├── page.tsx                    ← Rota /playtest-v2 (sandbox)
├── [id]/page.tsx               ← Rota /playtest-v2/[kit-id] com deck
├── PlaytestClient.tsx          ← Igual ao original mas usa GameStoreProvider
└── error.tsx                   ← Boundary de erro
```

---

## Decisões técnicas

### Store Zustand (`useGameStore.tsx`)

- `createGameStore()` — fábrica que cria uma instância isolada por session
- `GameStoreProvider` — substitui `<GameProvider>`, cria o store em `useRef`
- `LegacyContextBridge` — bridge interna que alimenta o `GameContext` antigo com
  valores do Zustand, permitindo que todos os componentes existentes funcionem
  sem alteração durante a transição
- `useGameStore()` — API 100% idêntica ao hook antigo; internamente usa
  `useStore(store, selector)` para subscriptions granulares
- History/undo-redo reutiliza `src/lib/game/history.ts` sem mudanças
- `_addPing` implementado corretamente (no `GameProvider` antigo o `activePings`
  estava sempre vazio — bug corrigido)

### PlaytestClient.tsx (v2)

- Única diferença do original: importa `GameStoreProvider` e `useGameStore`
  de `@/features/playtest-v2/store/useGameStore` em vez de
  `@/features/playtest/store/GameProvider`
- Todos os outros imports (Playmat, CardBack, etc.) apontam para os componentes
  originais — sem duplicação

---

## Todo list completo

### ✅ Fase 0 — Setup
- [x] `pnpm add zustand zundo`
- [x] `pnpm build` limpo para baseline

### ✅ Fase 1 — Store Zustand
- [x] Criar `src/features/playtest-v2/store/useGameStore.tsx`
  - [x] Store com `gameReducer` + `subscribeWithSelector`
  - [x] Undo/redo com `history.ts` original
  - [x] `activePings` com auto-limpeza (setTimeout)
  - [x] `createGameStore` (fábrica) para suportar múltiplas instâncias por sessão
  - [x] `LegacyContextBridge` para compatibilidade com componentes existentes
  - [x] API pública idêntica ao hook antigo

### ✅ Fase 2 — Rota nova
- [x] Criar `src/app/playtest-v2/error.tsx`
- [x] Criar `src/app/playtest-v2/page.tsx`
- [x] Criar `src/app/playtest-v2/[id]/page.tsx`
- [x] Criar `src/app/playtest-v2/PlaytestClient.tsx`
- [x] `pnpm build` verde com nova rota aparecendo

### ⏳ Fase 3 — Validação (manual no browser)
- [ ] Abrir `/playtest-v2` — campo carrega sem erro
- [ ] Abrir `/playtest-v2/[kit-id]` — deck carrega e mão inicial aparece
- [ ] Mover carta para battlefield
- [ ] Tapar / destapar carta
- [ ] Embaralhar grimório (animação 3 cartas)
- [ ] Ctrl+Z undo / Ctrl+Y redo (5+ ações)
- [ ] Scry, surveil, mill
- [ ] Drag-and-drop entre zonas
- [ ] Setas no battlefield
- [ ] Zoom + pan do battlefield

### ⏳ Fase 4 — Swap (só após Fase 3 verde)
- [ ] Renomear `src/app/playtest` → `src/app/playtest-old` (backup temporário)
- [ ] Renomear `src/app/playtest-v2` → `src/app/playtest`
- [ ] Atualizar imports internos (se houver links cruzados)
- [ ] Deletar `src/app/playtest-old`
- [ ] Deletar `src/features/playtest/store/GameProvider.tsx`
- [ ] Deletar `src/features/playtest/hooks/useGameStore.ts`
- [ ] Mover `src/features/playtest-v2/store/useGameStore.tsx`
      → `src/features/playtest/store/useGameStore.tsx`
- [ ] Remover `LegacyContextBridge` do store (não será mais necessária)
- [ ] `pnpm build` final sem erros

---

## Próximos passos (pós-migração)

Após o swap, os componentes existentes ainda usam o `useGameStore` antigo via
`LegacyContextBridge`. Para extrair o máximo do Zustand, migrar gradualmente
os hot-path components para subscriptions granulares:

```ts
// Antes (re-renderiza em qualquer mudança de state)
const { state } = useGameStore();
const hand = state.players[localPlayerId].zones.hand;

// Depois (só re-renderiza quando hand muda)
const hand = useStore(store, s => s.gameState.players[localPlayerId].zones.hand);
```

Candidatos prioritários: `HandZone`, `BattlefieldArea`, `SideZonePanel`.
