import React, { useState, useEffect, useMemo, useRef } from 'react';
import styles from './Metas.module.css';
import appStyles from '../../App.module.css';
import Papa from 'papaparse';
import Select from 'react-select';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExpand, faCompress } from '@fortawesome/free-solid-svg-icons';

const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

function Metas({ refreshKey }) {
  const [allMetas, setAllMetas] = useState([]);
  const [vendedorOptions, setVendedorOptions] = useState([]);
  const [selectedVendedores, setSelectedVendedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFullScreen, setIsFullScreen] = useState(false);

  const metasContainerRef = useRef(null);

  // Removida ou comentada a linha const maxRowsToShow = 10;

  const spreadsheetUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQbS_7qFSgGIvpJg1Yck5Ozqm2uI7unUlxxjzCjKf1vwVgKZUdrfPCodWhukn2Lf9opNiu9PNniSY0f/pub?gid=1952795009&single=true&output=csv";

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
            ).map((row, index) => {
              const target = parseFloat(row["Target"]) || 0;
              const atual = parseFloat(row["Atual"]) || 0;
              let atingimento = 0;

              if (target > 0) {
                atingimento = (atual / target) * 100;
              }

              return {
                id: `${row["Nome da Meta"] || 'no-name'}-${index}`,
                nome: row["Nome da Meta"],
                vendedor: row["Vendedor"],
                canal: row["Canal"],
                cliente: row["Cliente"],
                item: row["Item"],
                tipo: row["Tipo"],
                target: target,
                atual: atual,
                atingimento: atingimento
              };
            });

            setAllMetas(loadedMetas);

            const uniqueVendedores = [...new Set(loadedMetas.map(meta => meta.vendedor).filter(Boolean))];
            const options = uniqueVendedores.map(v => ({ value: v, label: v }));
            setVendedorOptions(options);

            console.log("----- DADOS CARREGADOS E OPÇÕES DE VENDEDOR -----");
            console.log("All Metas (primeiros 5):", loadedMetas.slice(0, 5));
            console.log("Vendedor Options:", options);
            console.log("----- KEYS GERADAS (Exemplo das primeiras 5) -----");
            loadedMetas.slice(0,5).forEach(meta => console.log(`Key: ${meta.id}, Nome: ${meta.nome}`));

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
  }, [spreadsheetUrl, refreshKey]);

  useEffect(() => {
    const handleFullScreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement || !!document.webkitFullscreenElement || !!document.mozFullScreenElement || !!document.msFullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullScreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullScreenChange);
    document.addEventListener('mozfullscreenchange', handleFullScreenChange);
    document.addEventListener('MSFullscreenChange', handleFullScreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullScreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullScreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullScreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullScreenChange);
    };
  }, []);

  const toggleFullScreen = () => {
    if (metasContainerRef.current) {
      if (!document.fullscreenElement && !document.webkitFullscreenElement && !document.mozFullScreenElement && !document.msFullscreenElement) {
        if (metasContainerRef.current.requestFullscreen) {
          metasContainerRef.current.requestFullscreen();
        } else if (metasContainerRef.current.mozRequestFullScreen) {
          metasContainerRef.current.mozRequestFullScreen();
        } else if (metasContainerRef.current.webkitRequestFullscreen) {
          metasContainerRef.current.webkitRequestFullscreen();
        } else if (metasContainerRef.current.msRequestFullscreen) {
          metasContainerRef.current.msRequestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if (document.mozCancelFullScreen) {
          document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
        } else if (document.execCommand) { // Fallback para navegadores antigos que usam execCommand
          document.execCommand('exitFullscreen');
        } else if (document.msExitFullscreen) {
          document.msExitFullscreen();
        }
      }
    }
  };


  const filteredMetas = useMemo(() => {
    console.log("----- INÍCIO DA FILTRAGEM -----");
    console.log("Selected Vendedores:", selectedVendedores);
    console.log("Total All Metas antes de filtrar:", allMetas.length);

    if (selectedVendedores.length === 0) {
      console.log("Nenhum vendedor selecionado. Retornando todas as metas.");
      return allMetas;
    }

    // ESTA LINHA PRECISA ESTAR AQUI DENTRO DO useMemo
    const selectedVendedorNames = selectedVendedores.map(v => v.value);
    console.log("Nomes dos vendedores selecionados (values):", selectedVendedorNames);

    const result = allMetas.filter(meta => {
      const isEveryone = meta.vendedor && meta.vendedor.toLowerCase() === 'todos';
      const isSelected = meta.vendedor && selectedVendedorNames.includes(meta.vendedor);

      return isEveryone || isSelected;
    });

    console.log("Metas Filtradas (quantidade):", result.length);
    console.log("----- FIM DA FILTRAGEM -----");

    return result;
  }, [allMetas, selectedVendedores]); // Dependências do useMemo

  const ProgressBar = ({ value }) => {
    const clampedValue = Math.max(0, Math.min(100, value));

    let barColorClass = styles.progressBarRed;
    if (clampedValue >= 75) {
      barColorClass = styles.progressBarGreen;
    } else if (clampedValue >= 50) {
      barColorClass = styles.progressBarYellow;
    }

    return (
      <div className={styles.progressBarContainer} title={`${clampedValue.toFixed(2)}%`}>
        <div className={barColorClass} style={{ width: `${clampedValue}%` }}></div>
        <span className={styles.progressText}>{`${clampedValue.toFixed(2)}%`}</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className={`${appStyles.box} ${styles.metasBox}`}>
        <p>Carregando metas...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${appStyles.box} ${styles.metasBox}`}>
        <p className={styles.errorMessage}>Erro: {error}</p>
        <p>Por favor, verifique o URL da planilha, os cabeçalhos das colunas ou sua conexão com a internet.</p>
      </div>
    );
  }

  // Agora, metasToDisplay receberá todas as metas filtradas, permitindo o scroll
  const metasToDisplay = filteredMetas;

  return (
    <div
      ref={metasContainerRef}
      className={`${appStyles.box} ${styles.metasBox} ${isFullScreen ? styles.fullScreenMode : ''}`}
    >
      <div className={styles.headerWithFullscreen}>
        <h2>Metas ativas</h2>
        <button onClick={toggleFullScreen} className={styles.fullscreenButton} title={isFullScreen ? "Sair da Tela Cheia" : "Tela Cheia"}>
          <FontAwesomeIcon icon={isFullScreen ? faCompress : faExpand} />
        </button>
      </div>

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

      <div className={styles.scrollableTableWrapper}>
        {filteredMetas.length === 0 && selectedVendedores.length > 0 ? (
          <p className={styles.emptyDataMessage}>Nenhuma meta encontrada para os filtros selecionados.</p>
        ) : filteredMetas.length === 0 ? (
          <p className={styles.emptyDataMessage}>Nenhuma meta encontrada na planilha ou os dados não correspondem aos cabeçalhos esperados.</p>
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
                <th>Atual</th>
                <th>Atingimento</th>
              </tr>
            </thead>
            <tbody>
              {metasToDisplay.map(meta => (
                <tr key={meta.id}>
                  <td>{meta.nome}</td>
                  <td>{meta.vendedor}</td>
                  <td>{meta.canal}</td>
                  <td>{meta.cliente}</td>
                  <td>{meta.item}</td>
                  <td>{meta.tipo}</td>
                  <td>{formatCurrency(meta.target)}</td>
                  <td>{formatCurrency(meta.atual)}</td>
                  <td>
                    <ProgressBar value={meta.atingimento} />
                  </td>
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