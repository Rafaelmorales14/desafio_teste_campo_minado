import { test, expect } from '@jest/globals';
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
    expect(estado.largura).toBe(18);
    expect(estado.altura).toBe(14);
    expect(estado.minas).toEqual(minas);
    expect(estado.reveladas).toEqual([]);
    expect(estado.status).toBe('em_andamento');
});

test('CM02 rejeita quantidade errada, duplicatas e posições inválidas das bombas', () => {
    expect(() => criarCampo(minas.slice(1))).toThrow(RangeError);
    expect(() => criarCampo([...minas, [2, 2]])).toThrow(RangeError);
    expect(() => criarCampo([...minas.slice(1), [...minas[1]]])).toThrow(RangeError);
    for (const invalida of [[-1, 0], [14, 0], [0, -1], [0, 18], [0.5, 0]]) {
        expect(() => criarCampo([...minas.slice(1), invalida])).toThrow(RangeError);
    }
});

test('CM03 rejeita revelação fora dos limites', () => {
    for (const posicao of [[-1, 0], [14, 0], [0, -1], [0, 18]]) {
        expect(() => revelar(campo(), posicao)).toThrow(RangeError);
    }
});

test('CM04 conta as vizinhas ortogonais e diagonais no canto e na borda', () => {
    const canto = revelar(campo(), [0, 0]);
    expect(canto.reveladas).toEqual([{ posicao: [0, 0], vizinhas: 3 }]);

    const borda = revelar(campo(), [0, 2]);
    expect(borda.reveladas).toEqual([{ posicao: [0, 2], vizinhas: 3 }]);
});

test('CM05 abre em cadeia as casas com zero e revela o contorno numerado', () => {
    const estado = revelar(campo(), [6, 8]);

    expect(casa(estado, 6, 8)?.vizinhas).toBe(0);
    expect(casa(estado, 2, 10)?.vizinhas).toBe(0);
    expect(casa(estado, 11, 10)?.vizinhas).toBe(3);
    expect(casa(estado, 0, 0)).toBe(undefined);
    for (const [linha, coluna] of minas) {
        expect(casa(estado, linha, coluna)).toBe(undefined);
    }
    expect(estado.status).toBe('em_andamento');
});

test('CM06 repetir uma revelação não duplica a casa', () => {
    const estado = revelar(campo(), [0, 0]);
    const repetido = revelar(estado, [0, 0]);

    expect(repetido.reveladas).toEqual([{ posicao: [0, 0], vizinhas: 3 }]);
    expect(repetido.status).toBe('em_andamento');
});

test('CM07 revelar uma bomba derrota o jogador', () => {
    const estado = revelar(campo(), [0, 1]);
    expect(estado.status).toBe('derrota');
    expect(estado.reveladas).toEqual([]);
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
    expect(estado.reveladas.length).toBe(211);
    expect(estado.status).toBe('em_andamento');

    estado = revelar(estado, [0, 0]);
    expect(estado.reveladas.length).toBe(212);
    expect(new Set(estado.reveladas.map(({ posicao }) => posicao.join(','))).size).toBe(212);
    expect(estado.status).toBe('vitoria');
});
