import React from 'react';
import styles from './Avatar.module.css';
import appStyles from '../../App.module.css'; // Importa estilos gerais

function Avatar() {
  return (
    <div className={`${appStyles.box} ${styles.avatarBox}`}>
      <h2>Avatar</h2>
      {/* Aqui você vai inserir a imagem do avatar */}
      <div className={styles.avatarPlaceholder}>
        <p>Sua imagem aqui</p>
      </div>
    </div>
  );
}

export default Avatar;