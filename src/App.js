// App.js
import React, { useState, useEffect } from 'react';
import styles from './App.module.css';
import Papa from 'papaparse';

import Avatar from './components/Avatar/Avatar';
import Informacoes from './components/Informacoes/Informacoes';
import Atingimento from './components/Atingimento/Atingimento';
import Cadastro from './components/Cadastro/Cadastro';
import TabelaDinamica from './components/Tabeladinamica/Tabeladinamica';
import Grafico from './components/Grafico/Grafico';

function App() {
  const [spreadsheetData, setSpreadsheetData] = useState([]);

  useEffect(() => {
    const fetchSpreadsheetData = async () => {
      const spreadsheetUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQbS_7qFSgGIvpJg1Yck5Ozqm2uI7unUlxxjzCjKf1vwVgKZUdrfPCodWhukn2Lf9opNiu9PNniSY0f/pub?gid=1168365614&single=true&output=csv";

      try {
        const response = await fetch(spreadsheetUrl);
        const csvText = await response.text();

        Papa.parse(csvText, {
          header: true,
          complete: (results) => {
            const processedData = results.data
              .filter(row => Object.values(row).some(value => value))
              .map(row => {
                const dataString = row['Data'];
                let parsedDate = null;
                if (typeof dataString === 'string' && dataString.trim() !== '') {
                  const parts = dataString.split('/');
                  if (parts.length === 3) {
                      // Note que Date(ano, mês-1, dia) - o mês é baseado em 0
                      parsedDate = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
                  }
                }

                return {
                  ...row,
                  'Vendas total': parseFloat(row['Vendas total']?.replace(',', '.') || 0),
                  'Quantidade': parseInt(row['Quantidade'] || 0),
                  'Margem': parseFloat(row['Margem']?.replace(',', '.') || 0),
                  'Data': parsedDate
                };
              });
            setSpreadsheetData(processedData);
          },
          error: (error) => {
            console.error("Erro ao fazer parse do CSV no App:", error);
          }
        });
      } catch (error) {
        console.error("Erro ao buscar dados da planilha no App:", error);
      }
    };

    fetchSpreadsheetData();
  }, []);

  return (
    <div className={styles.appContainer}>
      <header className={styles.header}>
        <h1>Dashboard de Metas</h1>
      </header>
      <main className={styles.mainContent}>
        <div className={styles.topRow}>
          <Avatar />
          <Informacoes />
          <Atingimento />
        </div>
        <Cadastro />

        {/* Removido o filtro de data daqui, agora ele estará dentro de TabelaDinamica */}
      
        <TabelaDinamica data={spreadsheetData} /> {/* Passamos os dados brutos agora */}
        <Grafico data={spreadsheetData} /> {/* Grafico também receberá os dados brutos, se precisar de filtragem, ela será interna ou o App.js vai precisar gerenciar os dados filtrados */}
      </main>
    </div>
  );
}

export default App;