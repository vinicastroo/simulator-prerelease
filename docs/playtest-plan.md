# MTG Playtest V1 Plan

## Objetivo

Construir uma mesa virtual de Magic: The Gathering para playtest solo, com arquitetura preparada para multiplayer em tempo real no futuro, sem implementar sync nesta fase.

## Decisões Fechadas

- Nova rota: `/playtest`
- Fluxo principal do deck: estado salvo do deck construído no `/simulator`
- URL manual de deck fica apenas como fallback/dev tool
- `/playtest` sem `id` funciona como sandbox de desenvolvimento
- Desktop-first
- entrada principal via `/simulator/[id]`, portanto o fluxo real herda autenticação do simulador
- Drag and drop fica para depois das ações por menu
- Estado via actions serializáveis
- Core de jogo puro fora de React
- Estado multiplayer-first desde o início

## Benchmark Externo

Referência principal: ArcaneTable

O que aproveitar como referência:
- ações/eventos explícitos
- zonas por jogador
- testes de convergência/replay
- deck loader separado

O que não copiar:
- estado acoplado ao runtime visual
- lógica de jogo misturada com animação/render
- dependência de objetos 3D como fonte de verdade

## Análise do Codebase Atual

### O que já existe

- Next.js App Router em TypeScript
- Tailwind + shadcn
- componentes de layout reaproveitáveis
- preview/sidebar/modal patterns
- simulador atual com drag local e canvas
- integração prévia com MTG/Scryfall/S3 em scripts e config de imagem

### O que pode ser reaproveitado

- `src/components/AppShell.tsx`
- componentes UI em `src/components/ui/*`
- padrões visuais de sidebar, modal e preview
- configuração de imagens em `next.config.mjs`
- assets visuais existentes, incluindo símbolos de mana

### Estado atual aprovado

- o layout atual do `/playtest` foi validado visualmente e deve ser preservado como base
- próximos ajustes devem ser incrementais, sem reintroduzir sidebar lateral fixa
- qualquer evolução de UI deve partir do `Playmat` atual, não do layout do `/simulator`
- o botão principal de entrada no playtest deve existir no `/simulator`
- o painel de URL/default não deve aparecer no fluxo vindo de `/playtest/[id]`

### O que conflita com a nova feature

- `src/context/PrereleaseContext.tsx` mistura UI, optimistic updates e banco
- modelagem atual é de kit/deckbuilder, não de partida
- simulador atual depende de Prisma e auth
- estado atual não é multiplayer-first
- lógica atual não está estruturada como reducer serializável

### Conclusão

A nova mesa deve continuar isolada em `/playtest`, mas o fluxo principal de entrada deve sair do `/simulator` com o deck atual já definido.

## Gaps Identificados

### Dependências

Adicionar:
- `zod`
- `vitest`

Possíveis depois:
- biblioteca de DnD, se necessário na fase específica

### Estruturas faltantes

- `src/lib/game/*`
- `src/lib/mtg/*`
- adapter de store para React
- histórico de undo/redo
- action log
- deck loader normalizado
- selectors por jogador e zona

## Estrutura de Pastas Proposta

```text
src/
  app/
    playtest/
      page.tsx
      PlaytestClient.tsx
  features/
    playtest/
      components/
        Playmat.tsx
        ZonePanel.tsx
        Battlefield.tsx
        BattlefieldSection.tsx
        CardView.tsx
        CardPreview.tsx
        CardContextMenu.tsx
        DeckBrowserModal.tsx
        TutorModal.tsx
        TokenModal.tsx
        Hud.tsx
        ActionLogSidebar.tsx
      hooks/
        useGameStore.ts
        useKeyboardShortcuts.ts
        useCardInteractions.ts
        useDeckLoader.ts
      store/
        GameProvider.tsx
        history-store.ts
  lib/
    game/
      types.ts
      actions.ts
      initial-state.ts
      reducer.ts
      selectors.ts
      ids.ts
      log.ts
      history.ts
    mtg/
      deck-schema.ts
      deck-loader.ts
      deck-normalize.ts
      scryfall.ts
      card-fallback.ts
```

## Modelagem de Tipos

### Tipos base

```ts
type PlayerId = string
type CardDefId = string
type CardInstanceId = string

type ZoneName =
  | "library"
  | "hand"
  | "battlefield"
  | "graveyard"
  | "exile"
  | "sideboard"
  | "command"

type TurnPhase =
  | "untap"
  | "upkeep"
  | "draw"
  | "main1"
  | "beginCombat"
  | "declareAttackers"
  | "declareBlockers"
  | "combatDamage"
  | "endCombat"
  | "main2"
  | "end"
  | "cleanup"
```

### CardDefinition

```ts
type CardDefinition = {
  id: CardDefId
  sourceId: string
  name: string
  imageUrl: string | null
  manaCost: string | null
  type: string
  oracleText: string | null
  power: string | null
  toughness: string | null
}
```

### CardInstance

```ts
type CardInstance = {
  id: CardInstanceId
  definitionId: CardDefId
  ownerId: PlayerId
  controllerId: PlayerId
  zone: ZoneName
  tapped: boolean
  faceDown: boolean
  counters: Record<string, number>
  isToken: boolean
  customName: string | null
  tokenData: {
    name: string
    power: string | null
    toughness: string | null
    color: string | null
    type: string | null
    imageUrl: string | null
  } | null
  battlefield: {
    x: number
    y: number
    z: number
    attachedTo: CardInstanceId | null
    attachments: CardInstanceId[]
  } | null
}
```

### PlayerState

```ts
type PlayerState = {
  id: PlayerId
  name: string
  life: number
  lifeHistory: { delta: number; value: number; at: number }[]
  counters: {
    poison: number
    energy: number
    experience: number
    storm: number
    custom: Record<string, number>
  }
  manaPool: {
    W: number
    U: number
    B: number
    R: number
    G: number
    C: number
  }
  zones: Record<ZoneName, CardInstanceId[]>
}
```

### GameState

```ts
type GameState = {
  id: string
  createdAt: number
  players: Record<PlayerId, PlayerState>
  playerOrder: PlayerId[]
  activePlayerId: PlayerId
  priorityPlayerId: PlayerId
  turnNumber: number
  phase: TurnPhase
  cardDefinitions: Record<CardDefId, CardDefinition>
  cardInstances: Record<CardInstanceId, CardInstance>
  log: ActionLogEntry[]
}
```

## Lista de Actions

```ts
type GameAction =
  | { type: "game/initialize"; state: GameState }
  | { type: "game/loadDeck"; playerId: PlayerId; definitions: CardDefinition[]; instances: CardInstance[] }
  | { type: "turn/setPhase"; phase: TurnPhase }
  | { type: "turn/advancePhase" }
  | { type: "turn/passTurn" }
  | { type: "player/changeLife"; playerId: PlayerId; delta: number; at: number }
  | { type: "player/changeCounter"; playerId: PlayerId; counter: string; delta: number }
  | { type: "player/changeMana"; playerId: PlayerId; color: "W" | "U" | "B" | "R" | "G" | "C"; delta: number }
  | { type: "player/clearManaPool"; playerId: PlayerId }
  | { type: "player/rollDie"; playerId: PlayerId; sides: 2 | 4 | 6 | 20; result: number }
  | { type: "zone/shuffle"; playerId: PlayerId; zone: "library" | "sideboard"; orderedIds: CardInstanceId[] }
  | { type: "zone/reorder"; playerId: PlayerId; zone: ZoneName; orderedIds: CardInstanceId[] }
  | { type: "card/move"; cardId: CardInstanceId; from: ZoneName; to: ZoneName; toPlayerId: PlayerId; index?: number }
  | { type: "card/moveMany"; cardIds: CardInstanceId[]; to: ZoneName; toPlayerId: PlayerId; index?: number }
  | { type: "card/draw"; playerId: PlayerId; count: number }
  | { type: "card/mill"; playerId: PlayerId; count: number }
  | { type: "card/revealTop"; playerId: PlayerId; count: number }
  | { type: "card/scry"; playerId: PlayerId; keepOnTopIds: CardInstanceId[]; putOnBottomIds: CardInstanceId[] }
  | { type: "card/tutor"; playerId: PlayerId; cardId: CardInstanceId; from: ZoneName; to: ZoneName }
  | { type: "card/setTapped"; cardId: CardInstanceId; tapped: boolean }
  | { type: "card/setFaceDown"; cardId: CardInstanceId; faceDown: boolean }
  | { type: "card/setBattlefieldPosition"; cardId: CardInstanceId; x: number; y: number; z: number }
  | { type: "card/addCounter"; cardId: CardInstanceId; counter: string; amount: number }
  | { type: "card/removeCounter"; cardId: CardInstanceId; counter: string; amount: number }
  | { type: "card/setCounter"; cardId: CardInstanceId; counter: string; value: number }
  | { type: "card/attach"; sourceId: CardInstanceId; targetId: CardInstanceId }
  | { type: "card/detach"; sourceId: CardInstanceId }
  | { type: "token/create"; playerId: PlayerId; definition: CardDefinition; instance: CardInstance }
  | { type: "token/duplicateFromCard"; sourceCardId: CardInstanceId; newDefinition: CardDefinition; newInstance: CardInstance }
  | { type: "token/delete"; cardId: CardInstanceId }
```

## Princípios de Implementação

- estado do domínio sempre serializável
- reducer puro e determinístico
- random fora do reducer
- lógica de jogo fora de React
- UI state separado de GameState
- `undo/redo` fora do reducer principal
- todos os dispatch points com `// TODO: broadcast`
- TypeScript estrito, sem `any`

## Fases de Implementação

### Fase 1: Core puro

Objetivo:
Criar a base do domínio e garantir testabilidade.

Entregas:
- tipos
- reducer
- selectors
- helper de IDs
- history helper
- action log

Testes mínimos:
- init
- move entre zonas
- tap/untap
- face down/up
- life history
- shuffle por ordem recebida
- attach/detach
- undo/redo bounded

### Fase 2: Deck loader

Objetivo:
Carregar e normalizar deck do S3/CloudFront.

Entregas:
- schema do JSON
- loader por env
- input de URL
- normalização definitions/instances
- fallback Scryfall por nome

Testes mínimos:
- deck válido
- deck inválido
- fallback por nome
- cartas repetidas geram instâncias distintas

### Fase 3: Store adapter

Objetivo:
Conectar reducer puro à UI.

Entregas:
- `useReducer + Context`
- `GameProvider`
- wrapper de history
- dispatch central
- `// TODO: broadcast`

### Fase 4: Shell `/playtest`

Objetivo:
Entregar a primeira mesa funcional.

Entregas:
- rota pública
- playmat base
- input de deck URL
- loading/error state
- preview hover
- zonas estáticas

### Fase 5: Browser do deck e ações de deck

Objetivo:
Habilitar playtest solo útil sem drag.

Entregas:
- deck browser
- busca por nome
- filtro por tipo
- shuffle
- draw X
- mill N
- reveal top
- scry N
- tutor
- mover entre zonas por menu

### Fase 6: Battlefield base

Objetivo:
Renderizar o campo com separação visual.

Entregas:
- battlefield
- `CardView`
- separação visual lands/outros
- face down renderizando como card back
- layout inicial automático

### Fase 7: Interações de carta

Objetivo:
Manipular permanentes no campo.

Entregas:
- tap/untap
- face down/up
- contadores padrão e custom
- menu de contexto
- mover entre zonas por menu

### Fase 8: HUD

Objetivo:
Implementar controles do jogador.

Entregas:
- vida com histórico
- counters do jogador
- mana pool WUBRG+C
- d2/d4/d6/d20
- indicador de fase
- passar fase/turno

### Fase 9: Tokens e attachments

Objetivo:
Completar os recursos principais de mesa.

Entregas:
- modal de token
- criação de token custom
- duplicar carta em token
- attach/detach
- regra de limpeza de vínculo ao sair do battlefield

### Fase 10: Undo/redo, log e atalhos

Objetivo:
Melhorar ergonomia e rastreabilidade.

Entregas:
- undo/redo mínimo 20 ações
- sidebar de log colapsável
- atalhos:
  - `T`
  - `D`
  - `U`
  - `S`
  - `Ctrl+Z`
  - `Space`

Mapeamento sugerido:
- `T`: tap/untap
- `D`: draw 1
- `U`: undo
- `S`: shuffle
- `Ctrl+Z`: undo
- `Space`: avançar fase

### Fase 11: Drag and drop

Objetivo:
Adicionar movimentação direta entre zonas e campo.

Entregas:
- hand -> battlefield
- battlefield -> outras zonas
- drag entre zonas
- posicionamento livre no battlefield

Requisito:
- resultado final sempre gera action serializável

### Fase 12: Hardening

Objetivo:
Preparar a base para multiplayer futuro.

Entregas:
- revisar performance
- lazy loading de imagens
- revisar serialização
- padronizar `// TODO: broadcast`
- documentar envelope futuro de action
- opcional: persistir última deck URL localmente

## Checklist

### Decisões Fechadas

- [x] Criar feature em rota nova `/playtest`
- [x] Restringir origem do deck ao S3/CloudFront nesta v1
- [x] Desktop-first
- [x] Não exigir login nesta v1
- [x] Adiar drag and drop para depois das ações por menu
- [x] Modelar estado multiplayer-first desde o início
- [x] Usar actions serializáveis
- [x] Manter lógica de jogo pura fora de React

### Arquitetura

- [x] Criar `src/lib/game/`
- [x] Criar `src/lib/mtg/`
- [x] Criar `src/features/playtest/`
- [x] Criar `src/app/playtest/`
- [x] Separar `CardDefinition` de `CardInstance`
- [x] Separar `GameState` de `UIState`
- [x] Garantir reducer puro e determinístico
- [x] Garantir que random fique fora do reducer
- [x] Marcar dispatch points com `// TODO: broadcast`

### Tipos de Domínio

- [x] Definir `PlayerId`
- [x] Definir `CardDefId`
- [x] Definir `CardInstanceId`
- [x] Definir `ZoneName`
- [x] Definir `TurnPhase`
- [x] Definir `CardDefinition`
- [x] Definir `CardInstance`
- [x] Definir `PlayerState`
- [x] Definir `GameState`
- [x] Definir `ActionLogEntry`
- [x] Definir `GameAction`

### Actions

- [x] `game/initialize`
- [x] `game/loadDeck`
- [x] `turn/setPhase`
- [x] `turn/advancePhase`
- [x] `turn/passTurn`
- [x] `player/changeLife`
- [x] `player/changeCounter`
- [x] `player/changeMana`
- [x] `player/clearManaPool`
- [x] `player/rollDie`
- [x] `zone/shuffle`
- [x] `zone/reorder`
- [x] `card/move`
- [x] `card/moveMany`
- [x] `card/draw`
- [x] `card/mill`
- [x] `card/revealTop`
- [x] `card/scry`
- [x] `card/tutor`
- [x] `card/setTapped`
- [x] `card/setFaceDown`
- [x] `card/setBattlefieldPosition`
- [x] `card/addCounter`
- [x] `card/removeCounter`
- [x] `card/setCounter`
- [x] `card/attach`
- [x] `card/detach`
- [x] `token/create`
- [x] `token/duplicateFromCard`
- [x] `token/delete`

### Core do Jogo

- [x] Criar `types.ts`
- [x] Criar `actions.ts`
- [x] Criar `initial-state.ts`
- [x] Criar `reducer.ts`
- [x] Criar `selectors.ts`
- [x] Criar `ids.ts`
- [x] Criar `log.ts`
- [x] Criar `history.ts`
- [x] Implementar `createInitialGameState()`
- [x] Implementar selectors por zona
- [x] Implementar selectors por jogador
- [x] Implementar selector de battlefield lands/outros
- [x] Implementar helper bounded de undo/redo

### Deck Loader

- [x] Instalar `zod`
- [x] Criar `deck-schema.ts`
- [x] Criar `deck-loader.ts`
- [x] Criar `deck-normalize.ts`
- [x] Criar `scryfall.ts`
- [x] Criar `card-fallback.ts`
- [x] Validar shape do JSON
- [x] Validar host permitido
- [x] Suportar URL por env
- [x] Suportar URL por input
- [x] Implementar fallback Scryfall por nome
- [x] Fazer batch de nomes únicos
- [x] Normalizar em definitions + instances

### Testes

- [x] Instalar `vitest`
- [x] Criar testes do reducer
- [ ] Criar testes dos selectors
- [x] Criar testes do history helper
- [x] Criar testes do deck normalizer
- [ ] Criar teste de replay determinístico
- [x] Testar init
- [x] Testar move entre zonas
- [x] Testar shuffle por ordem recebida
- [x] Testar draw
- [x] Testar mill
- [ ] Testar tutor
- [x] Testar scry
- [x] Testar tap/untap
- [x] Testar face down/up
- [ ] Testar counters
- [x] Testar token/create
- [x] Testar attach/detach
- [x] Testar history bounded

### Store React

- [x] Criar `GameProvider.tsx`
- [x] Criar `useGameStore.ts`
- [x] Criar wrapper de history
- [x] Implementar `useReducer + Context`
- [x] Separar UI state do state de jogo
- [x] Expor dispatch central
- [x] Marcar `// TODO: broadcast`

### Rota `/playtest`

- [x] Criar `src/app/playtest/page.tsx`
- [x] Criar `PlaytestClient.tsx`
- [x] Adicionar entrada principal a partir do `/simulator`
- [x] Adicionar botão `Playtest` no simulador
- [x] Carregar deck inicial por kit em `/playtest/[id]`
- [x] Tratar URL manual como fallback/dev tool
- [x] Limpar `/playtest/[id]` para o fluxo principal sem deck tools visíveis
- [x] Manter `/playtest` sem `id` como sandbox/dev route
- [x] Exibir loading state no sandbox/dev tools
- [x] Exibir error state no sandbox/dev tools
- [x] Ler deck por env default como fallback no sandbox/dev tools
- [x] Permitir informar deck URL manualmente como fallback no sandbox/dev tools
- [x] Criar rota `/playtest/[id]`
- [x] Documentar que `/playtest/[id]` acompanha o fluxo autenticado do simulador

### Zonas Estáticas

- [x] Criar `Playmat.tsx`
- [x] Criar `ZonePanel.tsx`
- [x] Criar `CardPreview.tsx`
- [x] Renderizar `Library`
- [x] Renderizar `Hand`
- [x] Renderizar `Battlefield`
- [x] Renderizar `Graveyard`
- [x] Renderizar `Exile`
- [ ] Renderizar `Sideboard`
- [ ] Renderizar `Command`
- [x] Exibir contagem por zona
- [x] Exibir preview grande no hover
- [x] Preservar layout atual aprovado do `Playmat`

### Browser do Deck

- [ ] Criar `DeckBrowserModal.tsx`
- [ ] Implementar busca por nome
- [ ] Implementar filtro por tipo
- [ ] Implementar filtro por zona
- [ ] Integrar preview da carta
- [ ] Preparar seleção para tutor

### Ações de Deck

- [x] Implementar shuffle
- [x] Implementar draw 1
- [x] Implementar avançar fase
- [x] Implementar draw X
- [x] Implementar mill N
- [x] Implementar reveal top
- [x] Implementar scry N
- [x] Implementar tutor
- [x] Implementar mover entre zonas por menu
- [x] Integrar action log nessas ações

### Battlefield

- [x] Criar `Battlefield.tsx`
- [x] Criar `BattlefieldSection.tsx`
- [x] Criar `CardView.tsx`
- [x] Separar visualmente lands e nonlands
- [x] Renderizar face down como card back
- [x] Criar layout automático inicial
- [x] Decidir se command zone deve existir nesta v1 — não existe em v1

### Interações de Carta

- [ ] Criar `CardContextMenu.tsx`
- [ ] Criar `useCardInteractions.ts`
- [x] Implementar tap/untap
- [x] Implementar face down/up por ação de UI
- [x] Implementar `+1/+1`
- [x] Implementar `-1/-1`
- [x] Implementar loyalty
- [x] Implementar counter custom
- [x] Implementar mover entre zonas por menu

### HUD

- [ ] Criar `Hud.tsx`
- [x] Criar painel de vida mínimo
- [ ] Criar histórico de vida
- [x] Criar painel de counters do jogador
- [x] Criar painel de mana WUBRG+C
- [x] Criar rolagem d2/d4/d6/d20
- [x] Criar indicador de fase atual
- [x] Criar ação de avançar fase
- [x] Criar ação de passar turno

### Tokens e Attachments

- [ ] Criar `TokenModal.tsx`
- [ ] Permitir token com nome
- [ ] Permitir token com P/T
- [ ] Permitir token com cor
- [ ] Permitir token com tipo
- [ ] Permitir arte opcional
- [ ] Implementar duplicar carta para token
- [ ] Implementar attach
- [ ] Implementar detach
- [ ] Remover vínculo ao sair do battlefield

### Undo/Redo, Log e Atalhos

- [ ] Criar `ActionLogSidebar.tsx`
- [x] Criar `useKeyboardShortcuts.ts`
- [x] Implementar undo
- [x] Implementar redo
- [x] Limitar histórico a no mínimo 20 ações
- [x] Tornar painel de log colapsável no `Playmat`
- [x] Mapear `T`
- [x] Mapear `D`
- [x] Mapear `U`
- [x] Mapear `S`
- [x] Mapear `Ctrl+Z`
- [x] Mapear `Space`
- [x] Bloquear atalhos em inputs
- [ ] Bloquear atalhos em modais

### Drag and Drop

- [x] Escolher abordagem de DnD
- [x] Implementar hand -> battlefield
- [x] Implementar battlefield -> outras zonas
- [x] Implementar drag entre zonas
- [x] Implementar posicionamento livre no battlefield
- [x] Garantir que DnD termine sempre em action serializável
- [x] Manter caminho por menu/contexto funcionando

### Hardening

- [ ] Revisar performance de render
- [ ] Implementar lazy loading de imagens
- [ ] Revisar serialização completa do estado
- [ ] Revisar selectors para evitar rerender desnecessário
- [ ] Padronizar todos os `// TODO: broadcast`
- [ ] Documentar envelope futuro das actions
- [ ] Opcional: persistir última deck URL localmente

## Riscos e Pontos de Atenção

- CORS do bucket do deck
- rate limit do Scryfall
- host de imagem ainda precisa bater com configuração permitida
- snapshots grandes demais no undo/redo
- attachments exigem invariantes fortes
- face down precisa manter identidade interna sem vazar na UI errada
- drag and drop pode contaminar o domínio se não for bem isolado
- performance com 100+ imagens e preview grande

## Decisões Funcionais Recomendadas

- face down no solo:
  - o dono pode ver a identidade real em preview/modal
- token duplicado:
  - copiar estado completo, exceto IDs e vínculos inválidos
- tutor no solo:
  - livre nas zonas permitidas
- attachment:
  - ao sair do battlefield, remover vínculo automaticamente

## Critérios de Qualidade

- sem `any`
- reducer puro
- sem regra de jogo em componente React
- selectors centralizados
- actions reproduzíveis
- testes no core antes de UI avançada
- caminho por menu/contexto deve continuar funcionando mesmo após adicionar DnD
