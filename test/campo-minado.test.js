import { test } from 'node:test';
import assert from 'node:assert/strict';
import { criarCampo, revelar } from '../src/jogo.js';

const minas = [
    [0, 1], [1, 0], [1, 1], [1, 3],
    ...[12, 13].flatMap(linha => Array.from({ length: 18 }, (_, coluna) => [linha, coluna])),
];
const campo = () => criarCampo(structuredClone(minas));
const casa = (estado, linha, coluna) => estado.reveladas.find(
    ({ posicao }) => posicao[0] === linha && posicao[1] === coluna,
);

test('CM01 inicia campo de 18 por 14 com as 40 bombas fornecidas', () => {
    const estado = campo();
    assert.equal(estado.largura, 18);
    assert.equal(estado.altura, 14);
    assert.deepEqual(estado.minas, minas);
    assert.deepEqual(estado.reveladas, []);
    assert.equal(estado.status, 'em_andamento');
});

test('CM02 rejeita quantidade errada, duplicatas e posições inválidas das bombas', () => {
    assert.throws(() => criarCampo(minas.slice(1)), RangeError);
    assert.throws(() => criarCampo([...minas, [2, 2]]), RangeError);
    assert.throws(() => criarCampo([...minas.slice(1), [...minas[1]]]), RangeError);
    for (const invalida of [[-1, 0], [14, 0], [0, -1], [0, 18], [0.5, 0]]) {
        assert.throws(() => criarCampo([...minas.slice(1), invalida]), RangeError);
    }
});

test('CM03 rejeita revelação fora dos limites', () => {
    for (const posicao of [[-1, 0], [14, 0], [0, -1], [0, 18]]) {
        assert.throws(() => revelar(campo(), posicao), RangeError);
    }
});

test('CM04 conta as vizinhas ortogonais e diagonais no canto e na borda', () => {
    const canto = revelar(campo(), [0, 0]);
    assert.deepEqual(canto.reveladas, [{ posicao: [0, 0], vizinhas: 3 }]);

    const borda = revelar(campo(), [0, 2]);
    assert.deepEqual(borda.reveladas, [{ posicao: [0, 2], vizinhas: 3 }]);
});

test('CM05 abre em cadeia as casas com zero e revela o contorno numerado', () => {
    const estado = revelar(campo(), [6, 8]);

    assert.equal(casa(estado, 6, 8)?.vizinhas, 0);
    assert.equal(casa(estado, 2, 10)?.vizinhas, 0);
    assert.equal(casa(estado, 11, 10)?.vizinhas, 3);
    assert.equal(casa(estado, 0, 0), undefined);
    for (const [linha, coluna] of minas) {
        assert.equal(casa(estado, linha, coluna), undefined);
    }
    assert.equal(estado.status, 'em_andamento');
});

test('CM06 repetir uma revelação não duplica a casa', () => {
    const estado = revelar(campo(), [0, 0]);
    const repetido = revelar(estado, [0, 0]);

    assert.deepEqual(repetido.reveladas, [{ posicao: [0, 0], vizinhas: 3 }]);
    assert.equal(repetido.status, 'em_andamento');
});

test('CM07 revelar uma bomba derrota o jogador', () => {
    const estado = revelar(campo(), [0, 1]);
    assert.equal(estado.status, 'derrota');
    assert.deepEqual(estado.reveladas, []);
});

test('CM08 só declara vitória ao abrir a última das 212 casas seguras', () => {
    const posicoesDeMinas = new Set(minas.map(posicao => posicao.join(',')));
    let estado = campo();
    for (let linha = 0; linha < 14; linha += 1) {
        for (let coluna = 0; coluna < 18; coluna += 1) {
            if ((linha !== 0 || coluna !== 0) && !posicoesDeMinas.has(`${linha},${coluna}`)) {
                estado = revelar(estado, [linha, coluna]);
            }
        }
    }
    assert.equal(estado.reveladas.length, 211);
    assert.equal(estado.status, 'em_andamento');

    estado = revelar(estado, [0, 0]);
    assert.equal(estado.reveladas.length, 212);
    assert.equal(new Set(estado.reveladas.map(({ posicao }) => posicao.join(','))).size, 212);
    assert.equal(estado.status, 'vitoria');
});
