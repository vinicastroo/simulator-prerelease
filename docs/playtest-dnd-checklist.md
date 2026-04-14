# Checklist de implementacao - DnD no Playtest

## Preparacao

- [x] Adicionar dependencias `@dnd-kit/core` e `@dnd-kit/utilities`.
- [x] Definir plano de migracao de drag-and-drop para `@dnd-kit` no `Playmat`.

## Implementacao

- [x] Substituir eventos nativos de HTML5 DnD por `DndContext` com sensores (`PointerSensor`).
- [x] Manter layout principal do `Playmat` e preservar zonas (mao, campo, grimorio, cemiterio, exilio).
- [x] Implementar `useDroppable` para as zonas de destino.
- [x] Implementar `useDraggable` para cartas da mao, topo de pilhas e cartas no campo.
- [x] Aplicar snap-to-grid de `40px` no drop do campo de batalha.
- [x] Limitar posicionamento no campo de batalha para nao sair do container.
- [x] Atualizar `zIndex` ao soltar no campo para trazer a carta para frente.
- [x] Renderizar icones de custo de mana no canto superior esquerdo das cartas no campo.
- [x] Garantir que carta virada (tapped) nao fique rotacionada enquanto esta sendo arrastada.
- [x] Aplicar memoizacao em componentes de carta para reduzir re-renderizacao desnecessaria.
- [x] Desativar drag nativo de imagens para evitar ghost do navegador.
- [x] Exibir drag overlay para feedback visual durante o arraste.
- [x] Aumentar dimensoes visuais das cartas no campo de batalha.
- [x] Mapear atalho `T` para virar/desvirar a carta destacada no campo.
- [x] Implementar zoom do campo de batalha com scroll do mouse e controles +/-.
- [x] Permitir mover cartas do campo para mao/cemiterio/exilio arrastando para as zonas.
- [x] Remover drag overlay (carta fantasma) durante arraste.
- [x] Exibir preview maior da carta ao hover (painel lateral).
- [x] Posicionar preview de hover acima da carta destacada.
- [x] Exibir poder/resistencia em dois quadrinhos no canto inferior de criaturas no campo.
- [x] Destacar visualmente todas as drop areas (mao/campo/cemiterio/exilio/grimorio) durante arraste.
- [x] Resolver drop por area geometrica (cursor dentro da zona), inclusive saindo do campo para a mao.
- [x] Usar posicao real do ponteiro durante drag para resolver drop em cemiterio/exilio.

## Validacao

- [x] Verificar lint do arquivo alterado (`Playmat.tsx`).
- [x] Executar typecheck (`pnpm exec tsc --noEmit`).
- [ ] Validar manualmente a experiencia de DnD em `/playtest` no navegador.
- [ ] Validar comportamento em viewport desktop e mobile.
- [ ] Confirmar que a carta segue o cursor ao arrastar da mao para o campo.
- [ ] Validar zoom do campo com wheel do mouse e botoes de controle.
