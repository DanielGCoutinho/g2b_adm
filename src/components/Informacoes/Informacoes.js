import React from 'react';
import styles from './Informacoes.module.css';
import appStyles from '../../App.module.css';

function Informacoes() {
  return (
    <div className={`${appStyles.box} ${styles.informacoesBox}`}>
      <h2>Informações</h2>
      <p>Nome: **Nome do Usuário**</p>
      <p>Email: **usuario@example.com**</p>
      <p>Cargo: **Gerente de Vendas**</p>
    </div>
  );
}

export default Informacoes; 