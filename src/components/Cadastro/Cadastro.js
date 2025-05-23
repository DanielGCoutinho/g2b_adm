// src/components/Cadastro/Cadastro.js

import React, { useState, useEffect } from 'react';
import styles from './Cadastro.module.css';
import appStyles from '../../App.module.css';
import Papa from 'papaparse';
import Select from 'react-select';
import Metas from '../Metas/Metas';

// Adicione 'onMetaChange' como uma prop
function Cadastro({ onMetaChange }) { // <--- AQUI

     
  const [data, setData] = useState({
    vendedores: [],
    canais: [],
    clientes: [],
    itens: [],
    allRawData: [],
  });

  const [nomeMeta, setNomeMeta] = useState('');
  const [selectedVendedor, setSelectedVendedor] = useState(null);
  const [selectedCanal, setSelectedCanal] = useState(null);
  const [selectedCliente, setSelectedCliente] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedTipo, setSelectedTipo] = useState(null);
  const [target, setTarget] = useState('');

  const tipos = [
    { value: 'Venda total', label: 'Venda total' },
    { value: 'Margem', label: 'Margem' },
    { value: 'Crescimento', label: 'Crescimento' },
  ];

  useEffect(() => {
    const fetchSpreadsheetData = async () => {
      const spreadsheetUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQVS_T7asfvhpVOox5lLkzaDCneVt-mgRyB4dWWoUBon26FmKZBnfe_Le-plxyAbw/pub?output=csv";

      try {
        const response = await fetch(spreadsheetUrl);
        const csvText = await response.text();

        Papa.parse(csvText, {
          header: true,
          complete: (results) => {
            const rows = results.data.filter(row => Object.values(row).some(value => value));

            const getUniqueOptions = (columnName) => {
              const uniqueValues = [...new Set(rows.map(row => row[columnName]).filter(Boolean))];
              return [
                { value: '', label: 'Todos' },
                ...uniqueValues.map(item => ({ value: item, label: item }))
              ];
            };

            const vendedores = getUniqueOptions('Vendedor');
            const canais = getUniqueOptions('Canal');
            const clientes = getUniqueOptions('Cliente');
            const itens = getUniqueOptions('Item');

            setData({ vendedores, canais, clientes, itens, allRawData: rows });
          },
          error: (error) => {
            console.error("Erro ao fazer parse do CSV:", error);
            alert("Erro ao carregar dados da planilha. Verifique o console.");
          }
        });
      } catch (error) {
        console.error("Erro ao buscar dados da planilha:", error);
        alert("Erro de rede ao buscar a planilha. Verifique sua conexão ou o URL.");
      }
    };

    fetchSpreadsheetData();
  }, []);

  const gasScriptUrl = "https://script.google.com/macros/s/AKfycbxoa5XEHfDWMdhg9N1p865GnszltL2ayL-8DkjT-urg0a30r3eai8b2nfkz4NMymxm5/exec";

  const handleIncluirMeta = async () => {
    if (
      !nomeMeta.trim() ||
      !selectedVendedor || !selectedVendedor.label.trim() ||
      !selectedCanal || !selectedCanal.label.trim() ||
      !selectedCliente || !selectedCliente.label.trim() ||
      !selectedItem || !selectedItem.label.trim() ||
      !selectedTipo || !selectedTipo.label.trim() ||
      !target
    ) {
      alert('Para incluir uma meta, por favor, preencha todos os campos obrigatórios.');
      return;
    }

    const formData = {
      action: 'incluirMeta',
      nomeMeta: nomeMeta,
      vendedor: selectedVendedor.label,
      canal: selectedCanal.label,
      cliente: selectedCliente.label,
      item: selectedItem.label,
      tipo: selectedTipo.label,
      target: target,
    };

    console.log("Dados a serem enviados para inclusão:", formData);

    try {
      await fetch(gasScriptUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      alert('Meta incluída com sucesso! Verifique sua planilha Google Sheets.');

      // Chamada da função de callback para notificar o componente pai
      if (onMetaChange) {
        onMetaChange();
      }

      // Limpa o formulário após o envio
      setNomeMeta('');
      setSelectedVendedor(null);
      setSelectedCanal(null);
      setSelectedCliente(null);
      setSelectedItem(null);
      setSelectedTipo(null);
      setTarget('');

    } catch (error) {
      console.error("Erro ao enviar dados para inclusão:", error);
      alert('Erro ao incluir meta. Por favor, tente novamente ou verifique sua conexão.');
    }
  };

  const handleDeletarMeta = async () => {
    if (!nomeMeta.trim()) {
      alert('Por favor, digite o "Nome da Meta" que deseja deletar.');
      return;
    }

    if (!window.confirm(`Tem certeza que deseja deletar a meta "${nomeMeta}"?`)) {
      return;
    }

    const deleteData = {
      action: 'deletarMeta',
      nomeMeta: nomeMeta.trim(),
    };

    console.log("Dados a serem enviados para exclusão:", deleteData);

    try {
      await fetch(gasScriptUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(deleteData),
      });

      alert(`Requisição para deletar meta "${nomeMeta}" enviada! Verifique sua planilha.`);

      // Chamada da função de callback para notificar o componente pai
      if (onMetaChange) {
        onMetaChange();
      }

      setNomeMeta('');

    } catch (error) {
      console.error("Erro ao enviar dados para exclusão:", error);
      alert('Erro ao deletar meta. Por favor, tente novamente ou verifique sua conexão.');
    }
  };

  return (
    <div className={`${appStyles.box} ${styles.cadastroBox}`}>
      <h2>Minhas Metas</h2>
      <Metas />
      <h2>Cadastro de Metas</h2>
      <div className={styles.formGrid}>
        <div className={styles.formGroup}>
          <label htmlFor="nomeMeta">Nome da Meta:</label>
          <input
            type="text"
            id="nomeMeta"
            placeholder="Ex: Venda Mensal"
            value={nomeMeta}
            onChange={(e) => setNomeMeta(e.target.value)}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="vendedor">Vendedor:</label>
          <Select
            options={data.vendedores}
            placeholder="Selecione ou digite..."
            isClearable={true}
            isSearchable={true}
            value={selectedVendedor}
            onChange={setSelectedVendedor}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="canal">Canal:</label>
          <Select
            options={data.canais}
            placeholder="Selecione ou digite..."
            isClearable={true}
            isSearchable={true}
            value={selectedCanal}
            onChange={setSelectedCanal}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="cliente">Cliente:</label>
          <Select
            options={data.clientes}
            placeholder="Selecione ou digite..."
            isClearable={true}
            isSearchable={true}
            value={selectedCliente}
            onChange={setSelectedCliente}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="item">Item:</label>
          <Select
            options={data.itens}
            placeholder="Selecione ou digite..."
            isClearable={true}
            isSearchable={true}
            value={selectedItem}
            onChange={setSelectedItem}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="tipo">Tipo:</label>
          <Select
            options={tipos}
            placeholder="Selecione ou digite..."
            isClearable={true}
            isSearchable={true}
            value={selectedTipo}
            onChange={setSelectedTipo}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="target">Target:</label>
          <input
            type="number"
            id="target"
            placeholder="Ex: 10000"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
          />
        </div>
      </div>

      <div className={styles.buttons}>
        <button className={styles.includeButton} onClick={handleIncluirMeta}>Incluir Meta</button>
        <button className={styles.deleteButton} onClick={handleDeletarMeta}>Deletar Meta</button>
      </div>
    </div>
  );
}

export default Cadastro;