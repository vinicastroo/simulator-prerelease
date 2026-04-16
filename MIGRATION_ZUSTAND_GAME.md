# Migração Zustand — /game (Multiplayer)

## Estratégia

Migrar `MultiplayerGameProvider.tsx` de múltiplos `useState`/`useReducer`/`useRef`
para um store Zustand com `subscribeWithSelector`, mantendo a API pública (`useMultiplayerGameContext`)
**completamente inalterada** — zero mudanças necessárias em consumidores.

---

## Status atual

| Fase | Status |
|---|---|
| Fase 1 — Store Zustand | ✅ Concluído |
| Fase 2 — Validação | ⏳ Pendente (validação manual no browser) |
| Fase 3 — Subscriptions granulares | ✅ Concluído (useMultiplayerGameStore + useMemo/useCallback) |

---

## O que mudou (Fase 1)

### `src/features/game/store/MultiplayerGameProvider.tsx`

**Antes:**
- 15 hooks separados: `useReducer` (state, isConnected), `useState` × 11, `useRef` × 5
- `stateRef.current` para acessar state fresco em callbacks assíncronos
- `versionRef.current` para versão fresca no action queue
- `useMemo` gigante embrulhando tudo no context value

**Depois:**
- 1 store Zustand com `subscribeWithSelector`
- `get().gameState` substitui `stateRef.current` — sem ref manual
- `get().stateVersion` substitui `versionRef.current` — sem ref manual
- `actionQueue`, `processing`, `actionRetryCount` ficam em closures (não-reativos)
- Pusher subscription permanece em `useEffect` no Provider, chama ações do store diretamente
- `useMultiplayerGameContext()` usa `useStore(store, selector)` por campo — subscriptions granulares já prontas

### Arquivos que NÃO mudaram

| Arquivo | Motivo |
|---|---|
| `src/features/game/hooks/useMultiplayerGameStore.ts` | Consome `useMultiplayerGameContext()` — API inalterada |
| `src/features/game/components/MultiplayerPlaymat.tsx` | Consome `useMultiplayerGameContext()` — API inalterada |
| `src/app/game/[id]/MultiplayerPlaytestClient.tsx` | Usa `<MultiplayerGameProvider>` — props inalteradas |

---

## Checklist de validação manual (Fase 2)

### Fluxo básico
- [ ] Abrir `/game` — lista de salas carrega
- [ ] Criar nova sala — host entra na lobby
- [ ] Guest entra na sala — ambos ficam "prontos"
- [ ] Jogo inicia — roll de primeiro jogador anima corretamente
- [ ] Mão inicial aparece para ambos os jogadores

### Actions e sincronização
- [ ] Mover carta para battlefield — aparece no oponente em tempo real
- [ ] Tapar / destapar carta — sincroniza
- [ ] Tap com ping (shift+click) — animação aparece no oponente
- [ ] Embaralhar grimório — contador de shuffle do oponente incrementa
- [ ] Scry, surveil, mill

### Undo/redo (no-ops em multiplayer)
- [ ] Ctrl+Z não desfaz nada (comportamento esperado)

### Mulligan
- [ ] Mulligan funciona para host
- [ ] Mulligan funciona para guest
- [ ] Toast "X mulligou N vez(es)" aparece para o oponente

### Reset
- [ ] Solicitar reset — modal aparece para ambos
- [ ] Cancelar reset — modal fecha
- [ ] Ambos aceitam reset — jogo reinicia

### Reconexão
- [ ] Desconectar internet e reconectar — estado ressincroniza via resyncState

### Conflito de versão (409)
- [ ] Duas ações simultâneas — rebase funciona sem divergência de estado

---

## Fase 3 — Subscriptions granulares (pós-validação)

Após validação, `MultiplayerPlaymat.tsx` pode migrar de `useMultiplayerGameContext()` (re-renderiza
em qualquer mudança) para subscriptions diretas no store:

```ts
// Antes (re-renderiza quando qualquer campo do ctx muda)
const { state, localPlayerId, isConnected } = useMultiplayerGameContext();

// Depois (re-renderiza só quando state muda)
const store = useMultiplayerGameStore();
const state = useStore(store, s => s.gameState);
const isConnected = useStore(store, s => s.isConnected);
```

Para isso, precisará exportar o `MultiplayerGameStoreContext` ou um hook
`useMultiplayerGameStoreApi()` do provider.

**Candidatos prioritários em `MultiplayerPlaymat.tsx`:**
- `isConnected` — lido só para o badge de conexão
- `opponentShuffleCount` — lido só para a animação de shuffle
- `isActionPending` — lido só para o spinner
- `mulliganToastMessage` — lido só para o toast
