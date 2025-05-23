import React from 'react';
import styles from './Tabela.module.css';
import appStyles from '../../App.module.css';

// Recebe 'data' como prop
function Tabela({ data }) {
  // As colunas da tabela são baseadas nos cabeçalhos do seu CSV
  const tableHeaders = data.length > 0 ? Object.keys(data[0]) : [];

  return (
    <div className={`${appStyles.box} ${styles.tabelaBox}`}>
      <h2>Desempenho Detalhado</h2>
      {data.length > 0 ? (
        <div className={styles.tableContainer}>
          <table className={styles.dataTable}>
            <thead>
              <tr>
                {tableHeaders.map((header, index) => (
                  <th key={index}>{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {tableHeaders.map((header, colIndex) => (
                    <td key={colIndex}>{row[header]}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p>Carregando dados da tabela...</p>
      )}
    </div>
  );
}

export default Tabela;