# Playtest Battlefield Mirror Plan

## Objetivo

Implementar apenas o espelhamento visual do campo no `/playtest`, com dois battlefields visiveis:

- jogador local embaixo
- oponente em cima
- mao e interacoes completas continuam apenas no lado do jogador local

Esta fase nao inclui ainda:

- validacao por turno
- interacao completa no lado do oponente
- multiplayer em rede
- regras de prioridade

## Escopo Da Primeira Fase

### 1. Suportar dois jogadores no estado inicial

Atualizar o `GameProvider` para inicializar dois jogadores no estado do jogo.

Regras desta fase:

- `localPlayerId` continua sendo o jogador principal
- um `opponentPlayerId` sera criado junto no bootstrap
- o deck do oponente sera uma copia do mesmo deck do jogador local para validar layout

Arquivos principais:

- `src/features/playtest/store/GameProvider.tsx`
- `src/lib/game/initial-state.ts`

### 2. Expor dados do jogador local e do oponente

Expandir `useGameStore` para retornar dados separados por jogador.

Dados esperados:

- `player`
- `opponentPlayer`
- `allZones`
- `opponentZones`
- `battlefieldLands`
- `battlefieldNonLands`
- `opponentBattlefieldLands`
- `opponentBattlefieldNonLands`

Arquivos principais:

- `src/features/playtest/hooks/useGameStore.ts`
- `src/lib/game/selectors.ts`

### 3. Duplicar a renderizacao do battlefield

Alterar o `Playmat` para renderizar duas areas de campo.

Comportamento esperado:

- topo: battlefield do oponente
- base: battlefield do jogador local
- zona da mao continua apenas para o jogador local
- deck, cemitério e exile continuam inicialmente ligados ao jogador local

Arquivo principal:

- `src/features/playtest/components/Playmat.tsx`

### 4. Reaproveitar o componente do campo

Adaptar `BattlefieldArea` para suportar orientacoes diferentes sem duplicar toda a implementacao.

Props sugeridas:

- `orientation: "top" | "bottom"`
- `interactive: boolean`
- `playerName`
- `life`

Comportamento:

- `interactive={false}` para o lado do oponente nesta fase
- HUD do oponente simplificada

Arquivo principal:

- `src/features/playtest/components/playmat/BattlefieldArea.tsx`

### 5. Manter o lado do oponente somente leitura

Nesta etapa, o campo do oponente deve ser apenas visual.

Nao fazer ainda:

- drag para o battlefield do oponente
- drop no lado do oponente
- tap no lado do oponente
- alteracao de vida do oponente por clique

Isso reduz o risco de quebrar o fluxo atual do jogador local.

### 6. Popular o oponente com um deck realista

Para validar visual e espacamento, o oponente deve receber uma copia do mesmo deck carregado no playtest.

Objetivo:

- battlefield do oponente nao ficar vazio durante a avaliacao do layout
- preparar o terreno para uma fase futura com deck separado

## Estrategia Tecnica

### Fase 1A. Estado

- criar dois players no `GameProvider`
- carregar o deck inicial no jogador local
- clonar o deck inicial para o oponente com novos `ownerId`, `controllerId` e zonas corretas

### Fase 1B. Selectors e hook

- manter os selectors genericos por `playerId`
- compor tudo no `useGameStore`
- evitar alterar a API atual mais do que o necessario

### Fase 1C. UI

- adicionar uma segunda area de battlefield no topo
- manter a area inferior como principal
- nao inverter carta com `transform` global ainda
- se necessario, usar apenas mudanca de ordem visual e espacamento

## Riscos

### 1. Acoplamento ao jogador local

Hoje o `Playmat` e o `useGameStore` assumem fortemente um unico jogador.

Impacto:

- parte da logica atual precisara ser generalizada
- sem cuidado, o codigo do jogador local pode regressar

### 2. Drag and drop

O sistema de drag atual foi construido em torno de um unico battlefield principal.

Mitigacao nesta fase:

- nao tornar o lado do oponente interativo ainda

### 3. Crescimento de complexidade visual

Dois battlefields ocupam mais espaco vertical.

Mitigacao:

- HUD enxuta
- campo do oponente mais compacto
- mao continua aparecendo apenas uma vez

## Fora De Escopo Nesta Fase

- bloquear acoes fora do turno do jogador
- limitar jogadas por `activePlayerId`
- controlar prioridade
- suportar dois decks diferentes via UI
- sincronizacao multiplayer real

## Resultado Esperado

Ao final desta fase, o `/playtest` deve:

- mostrar dois campos de batalha
- mostrar o jogador local embaixo
- mostrar o oponente em cima
- manter o fluxo atual do jogador local funcionando
- deixar o lado do oponente somente leitura

## Ordem Recomendada De Implementacao

1. `GameProvider`
2. `useGameStore`
3. `Playmat`
4. `BattlefieldArea`
5. refinamento visual do campo espelhado

## Decisao Atual

Para a primeira implementacao, o oponente deve usar uma copia do mesmo deck carregado no playtest.
