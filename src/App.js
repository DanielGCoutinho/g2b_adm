import React, { useState, useEffect } from 'react';
import styles from './App.module.css';
import Papa from 'papaparse'; // Para buscar dados da planilha no App

import Avatar from './components/Avatar/Avatar';
import Informacoes from './components/Informacoes/Informacoes';
import Atingimento from './components/Atingimento/Atingimento';
import Cadastro from './components/Cadastro/Cadastro';
import Tabela from './components/Tabela/Tabela';
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
            // Filtra linhas onde pelo menos um valor não é vazio
            const filteredRows = results.data.filter(row => Object.values(row).some(value => value));
            setSpreadsheetData(filteredRows);
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
        <Cadastro /> {/* Cadastro ainda busca os dados por conta própria para as opções de select */}
     
        <Tabela data={spreadsheetData} /> {/* Passando os dados da planilha para Tabela */}
        <Grafico data={spreadsheetData} /> {/* Passando os dados da planilha para Grafico */}
      </main>
    </div>
  );
}

export default App;