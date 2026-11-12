# Campo Minado

## Especificação

O campo tem 18 colunas por 14 linhas, 40 bombas e 212 casas seguras. Cada casa segura indica quantas bombas há nas oito posições vizinhas, incluindo as diagonais que estiverem dentro do tabuleiro. Uma abertura com zero expande pelas casas de valor zero conectadas por vizinhança e revela também as casas numeradas que as cercam. Revelar uma bomba termina a partida em derrota. Abrir todas as casas seguras dá vitória.

## Contrato para a implementação

Em `src/jogo.js`, exporte as funções síncronas abaixo. Uma posição é `[linha, coluna]`, com índices inteiros de `0` a `13` e de `0` a `17`, respectivamente.

- `criarCampo(minas)` recebe exatamente 40 posições distintas e devolve `{ largura: 18, altura: 14, minas, reveladas: [], status: 'em_andamento' }`. Preserve a ordem recebida em `minas`.
- `revelar(estado, posicao)` devolve o estado atualizado. Em `reveladas`, registre cada casa segura aberta uma única vez como `{ posicao, vizinhas }`, em qualquer ordem. Uma casa já aberta não muda o estado observável. O status é `em_andamento`, `derrota` ou `vitoria`. A bomba acionada não entra na lista de casas seguras.
- Lance `RangeError` para posições inválidas e para uma lista de bombas com quantidade errada ou coordenadas repetidas.

## Casos de teste

- **CM01** confere dimensões, disposição das 40 bombas e estado inicial.
- **CM02–CM03** rejeitam configuração inválida e tentativa de revelar fora do tabuleiro.
- **CM04** confere três bombas vizinhas em uma casa do canto e em uma da borda, incluindo diagonais.
- **CM05** verifica a expansão até um zero distante, a abertura do contorno numerado e a preservação de bombas e da casa isolada.
- **CM06** garante que revelar a mesma casa duas vezes não a duplica.
- **CM07** confirma derrota ao revelar uma bomba.
- **CM08** confirma que 211 casas seguras abertas ainda deixam a partida em andamento e que a abertura da 212ª dá vitória.

## Execução

Com Node.js 24, rode `npm install` e `npm test` na raiz para executar os testes com Jest. Esta entrega mantém a etapa **Red** do TDD: sem `src/jogo.js`, a suíte falha por falta do módulo. Crie esse módulo com o contrato acima e repita `npm test` para executar as asserções.

## Colaborador

Rafael Blasques Morales ([Rafaelmorales14](https://github.com/Rafaelmorales14)).
