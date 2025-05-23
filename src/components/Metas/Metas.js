// src/components/Metas/Metas.js

import React, { useState, useEffect, useMemo } from 'react';
import styles from './Metas.module.css';
import appStyles from '../../App.module.css';
import Papa from 'papaparse';
import Select from 'react-select';

// Adicione 'refreshKey' como uma prop
function Metas({ refreshKey }) { // <--- AQUI
  const [allMetas, setAllMetas] = useState([]);
  const [vendedorOptions, setVendedorOptions] = useState([]);
  const [selectedVendedores, setSelectedVendedores] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const spreadsheetUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQbS_7qFSgGIvpJg1Yck5Ozqm2uI7unUlxxjzCjKf1vwVgKZUdrfPCodWhukn2Lf9opNiu9PNniSY0f/pub?output=csv";

  useEffect(() => {
    const fetchMetasData = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(spreadsheetUrl);

        if (!response.ok) {
          throw new Error(`Erro HTTP: ${response.status} - ${response.statusText}`);
        }

        const csvText = await response.text();

        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            const loadedMetas = results.data.filter(row =>
              row["Nome da Meta"]
            ).map((row, index) => ({
              id: row["Nome da Meta"] || index,
              nome: row["Nome da Meta"],
              vendedor: row["Vendedor"],
              canal: row["Canal"],
              cliente: row["Cliente"],
              item: row["Item"],
              tipo: row["Tipo"],
              target: row["Target"]
            }));

            setAllMetas(loadedMetas);

            const uniqueVendedores = [...new Set(loadedMetas.map(meta => meta.vendedor).filter(Boolean))];
            const options = uniqueVendedores.map(v => ({ value: v, label: v }));
            setVendedorOptions(options);

            setLoading(false);
          },
          error: (err) => {
            console.error("Erro ao fazer parse do CSV:", err);
            setError("Erro ao processar os dados da planilha.");
            setLoading(false);
          }
        });
      } catch (err) {
        console.error("Erro ao buscar dados da planilha:", err);
        setError(`Não foi possível carregar as metas: ${err.message}.`);
        setLoading(false);
      }
    };

    fetchMetasData();
  }, [spreadsheetUrl, refreshKey]); // <--- AQUI: Adiciona refreshKey como dependência do useEffect

  const filteredMetas = useMemo(() => {
    if (selectedVendedores.length === 0) {
      return allMetas;
    }

    const selectedVendedorNames = selectedVendedores.map(v => v.value);

    return allMetas.filter(meta => {
      const isEveryone = meta.vendedor && meta.vendedor.toLowerCase() === 'todos';
      const isSelected = meta.vendedor && selectedVendedorNames.includes(meta.vendedor);

      return isEveryone || isSelected;
    });
  }, [allMetas, selectedVendedores]);


  if (loading) {
    return (
      <div className={`${appStyles.box} ${styles.metasBox}`}>
        <h2>Minhas Metas</h2>
        <p>Carregando metas...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${appStyles.box} ${styles.metasBox}`}>
        <h2>Minhas Metas</h2>
        <p className={styles.errorMessage}>Erro: {error}</p>
        <p>Por favor, verifique o URL da planilha, os cabeçalhos das colunas ou sua conexão com a internet.</p>
      </div>
    );
  }

  return (
    <div className={`${appStyles.box} ${styles.metasBox}`}>
      <h2>Minhas Metas</h2>

      <div className={styles.filterGroup}>
        <label htmlFor="vendedorFilter">Filtrar por Vendedor:</label>
        <Select
          id="vendedorFilter"
          options={vendedorOptions}
          isMulti
          isClearable={true}
          isSearchable={true}
          placeholder="Selecione um ou mais vendedores..."
          value={selectedVendedores}
          onChange={setSelectedVendedores}
          classNamePrefix="react-select"
        />
      </div>

      <div className={styles.tableContainer}>
        {filteredMetas.length === 0 && selectedVendedores.length > 0 ? (
          <p>Nenhuma meta encontrada para os filtros selecionados, exceto as de "Todos".</p>
        ) : filteredMetas.length === 0 ? (
          <p>Nenhuma meta encontrada na planilha ou os dados não correspondem aos cabeçalhos esperados.</p>
        ) : (
          <table className={styles.metasTable}>
            <thead>
              <tr>
                <th>Nome da Meta</th>
                <th>Vendedor</th>
                <th>Canal</th>
                <th>Cliente</th>
                <th>Item</th>
                <th>Tipo</th>
                <th>Target</th>
              </tr>
            </thead>
            <tbody>
              {filteredMetas.map(meta => (
                <tr key={meta.id}>
                  <td>{meta.nome}</td>
                  <td>{meta.vendedor}</td>
                  <td>{meta.canal}</td>
                  <td>{meta.cliente}</td>
                  <td>{meta.item}</td>
                  <td>{meta.tipo}</td>
                  <td>{meta.target}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default Metas;