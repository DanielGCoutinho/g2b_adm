import React from 'react';
import styles from './Atingimento.module.css';
import appStyles from '../../App.module.css';

function Atingimento() {
  const metaAtual = 60; // Exemplo: 60% atingido
  const metaMinima = 75; // Marcação de 75%
  const porcentagemFalta = 100 - metaAtual;

  return (
    <div className={`${appStyles.box} ${styles.atingimentoBox}`}>
      <h2>Atingimento</h2>
      <div className={styles.progressBarContainer}>
        <div className={styles.progressBar} style={{ width: `${metaAtual}%` }}></div>
        <div
          className={styles.minTargetLine}
          style={{ left: `${metaMinima}%` }}
        ></div>
      </div>
      <p>Progresso: **{metaAtual}%**</p>
      <p>Falta para 100%: **{porcentagemFalta}%**</p>
    </div>
  );
}

export default Atingimento;