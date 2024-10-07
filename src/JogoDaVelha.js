// src/JogoDaVelha.js

import React, { useState, useEffect } from 'react';
import './JogoDaVelha.css';

const JogoDaVelha = () => {
  const [tabuleiro, setTabuleiro] = useState(Array(9).fill(null));
  const [jogador, setJogador] = useState('X');
  const [placar, setPlacar] = useState({ X: 0, O: 0, Empates: 0 });
  const [dificuldade, setDificuldade] = useState('Fácil');
  const [vencedor, setVencedor] = useState(null);

  // Persistindo o estado no localStorage
  useEffect(() => {
    const savedGame = localStorage.getItem('jogoDaVelha');
    if (savedGame) {
      const { tabuleiro, placar, jogador, dificuldade } = JSON.parse(savedGame);
      setTabuleiro(tabuleiro);
      setPlacar(placar);
      setJogador(jogador);
      setDificuldade(dificuldade);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('jogoDaVelha', JSON.stringify({ tabuleiro, placar, jogador, dificuldade }));
  }, [tabuleiro, placar, jogador, dificuldade]);

  const verificarVencedor = (tab) => {
    const combinações = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];

    for (let combinação of combinações) {
      const [a, b, c] = combinação;
      if (tab[a] && tab[a] === tab[b] && tab[a] === tab[c]) {
        return tab[a];
      }
    }
    return null;
  };

  const fazerJogada = (indice) => {
    if (tabuleiro[indice] || vencedor) return;

    const novosTabuleiro = [...tabuleiro];
    novosTabuleiro[indice] = jogador;
    setTabuleiro(novosTabuleiro);

    const ganhador = verificarVencedor(novosTabuleiro);
    if (ganhador) {
      setVencedor(ganhador);
      setPlacar((prev) => ({ ...prev, [ganhador]: prev[ganhador] + 1 }));
    } else if (!novosTabuleiro.includes(null)) {
      setPlacar((prev) => ({ ...prev, Empates: prev.Empates + 1 }));
    } else {
      setJogador(jogador === 'X' ? 'O' : 'X');
    }
  };

  const reiniciarJogo = () => {
    setTabuleiro(Array(9).fill(null));
    setVencedor(null);
    setJogador('X');
  };

  const resetarPlacar = () => {
    setPlacar({ X: 0, O: 0, Empates: 0 });
  };

  const renderizarBotao = (indice) => (
    <button className="btn btn-light border" onClick={() => fazerJogada(indice)}>
      {tabuleiro[indice]}
    </button>
  );

  const jogarComputador = () => {
    const índicesDisponíveis = tabuleiro.map((val, idx) => (val === null ? idx : null)).filter((val) => val !== null);

    if (dificuldade === 'Fácil') {
      const indiceAleatorio = índicesDisponíveis[Math.floor(Math.random() * índicesDisponíveis.length)];
      fazerJogada(indiceAleatorio);
    } else {
      const melhorJogada = minimax(tabuleiro, 'O');
      fazerJogada(melhorJogada);
    }
  };

  const minimax = (tab, jogadorAtual) => {
    const ganhador = verificarVencedor(tab);
    if (ganhador === 'O') return 10; // se o computador vencer
    if (ganhador === 'X') return -10; // se o jogador vencer
    if (!tab.includes(null)) return 0; //  se der empate

    const jogadas = [];
    for (let i = 0; i < tab.length; i++) {
      if (tab[i] === null) {
        const novoTabuleiro = [...tab];
        novoTabuleiro[i] = jogadorAtual;

        const pontuacao = minimax(novoTabuleiro, jogadorAtual === 'O' ? 'X' : 'O');
        jogadas.push({ pontuacao, indice: i });
      }
    }

    if (jogadorAtual === 'O') {
      const melhorJogada = jogadas.reduce((best, move) => (move.pontuacao > best.pontuacao ? move : best), jogadas[0]);
      return melhorJogada.indice; // Vai retornar o índice da melhor jogada
    } else {
      const piorJogada = jogadas.reduce((worst, move) => (move.pontuacao < worst.pontuacao ? move : worst), jogadas[0]);
      return piorJogada.indice; // Vai retornar o índice da pior jogada
    }
  };

  useEffect(() => {
    if (jogador === 'O' && !vencedor) {
      setTimeout(() => {
        jogarComputador();
      }, 500);
    }
  }, [jogador, vencedor, tabuleiro, dificuldade]);

  return (
    <div className="container mt-5">
      <h3 className="text-center">Placar</h3>
      
      {/* Tabela do Placar */}
      <table className="table table-auto text-center">
        <thead>
          <tr>
            <th>Jogador</th>
            <th>Pontos</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>X</td>
            <td>{placar.X}</td>
          </tr>
          <tr>
            <td>O</td>
            <td>{placar.O}</td>
          </tr>
          <tr>
            <td>Empates</td>
            <td>{placar.Empates}</td>
          </tr>
        </tbody>
      </table>

      {/* Dificuldade */}
      <div className="text-center mb-4">
        <label>Dificuldade: </label>
        <select value={dificuldade} onChange={(e) => setDificuldade(e.target.value)}>
          <option value="Fácil">Fácil</option>
          <option value="Difícil">Difícil</option>
        </select>
      </div>

      {/* Tabuleiro do Jogo */}
      <div className="d-flex justify-content-center mb-4">
        {[0, 1, 2].map((row) => (
          <div key={row} className="d-flex flex-column">
            {renderizarBotao(row * 3)}
            {renderizarBotao(row * 3 + 1)}
            {renderizarBotao(row * 3 + 2)}
          </div>
        ))}
      </div>

      <div className="text-center">
        <button className="btn btn-primary mt-3" onClick={reiniciarJogo}>Novo Jogo</button>
        <button className="btn btn-danger mt-3 ml-3" onClick={resetarPlacar}>Zerar Placar</button>
        </div>
    </div>
  );
};

export default JogoDaVelha;