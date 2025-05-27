// components/TabelaDinamica/TabelaDinamica.js
import React, { useState, useMemo } from 'react';
import Select, { components } from 'react-select';

// Importações do react-beautiful-dnd
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

import styles from './Tabeladinamica.module.css';
import appStyles from '../../App.module.css';

// Funções de formatação (sem alteração)
const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

const formatQuantity = (value) => {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

// Componente para renderizar uma linha e seus filhos (recursivo) (sem alteração)
const TabelaDinamicaLinha = ({ item, level = 0, isExpandedInitially = false }) => {
  const [isExpanded, setIsExpanded] = useState(isExpandedInitially);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const hasChildren = item.children && Object.keys(item.children).length > 0;

  const paddingLeft = level * 20;

  return (
    <>
      <tr className={styles.dynamicTableRow}>
        <td style={{ paddingLeft: `${paddingLeft + 10}px` }}>
          {hasChildren && (
            <span onClick={toggleExpand} className={styles.expandToggle}>
              {isExpanded ? '▼ ' : '► '}
            </span>
          )}
          {item.name}
        </td>
        <td>{formatCurrency(item.totalVendas)}</td>
        <td>{formatQuantity(item.totalQuantidade)}</td>
        <td>{item.mediaMargem.toFixed(2)}%</td>
      </tr>
      {isExpanded && hasChildren && (
        Object.values(item.children).map((childItem) => (
          <TabelaDinamicaLinha
            key={childItem.name}
            item={childItem}
            level={level + 1}
          />
        ))
      )}
    </>
  );
};

// Custom Option Component para incluir o checkbox (sem alteração)
const CustomOption = (props) => {
  const { innerProps, isSelected, label } = props;
  return (
    <components.Option {...props}>
      <div className={styles.customSelectOption}>
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => {}}
        />
        <label>{label}</label>
      </div>
    </components.Option>
  );
};


// Componente principal da tabela dinâmica
function TabelaDinamica({ data }) {
  // Use um id estável para o Droppable
  const DROPPABLE_ID = "grouping-keys";
  const [groupingKeys, setGroupingKeys] = useState(['Vendedor', 'Canal', 'Cliente', 'Item']);

  const [selectedDays, setSelectedDays] = useState([]);
  const [selectedMonths, setSelectedMonths] = useState([]);
  const [selectedYears, setSelectedYears] = useState([]);

  const filterOptions = useMemo(() => {
    const uniqueDays = new Set();
    const uniqueMonths = new Set();
    const uniqueYears = new Set();

    data.forEach(row => {
      if (row.Data instanceof Date) {
        uniqueDays.add(row.Data.getDate());
        uniqueMonths.add(row.Data.getMonth() + 1);
        uniqueYears.add(row.Data.getFullYear());
      }
    });

    const days = Array.from(uniqueDays)
      .sort((a, b) => a - b)
      .map(day => ({ value: String(day), label: String(day) }));

    const monthsMap = {
      1: 'Janeiro', 2: 'Fevereiro', 3: 'Março', 4: 'Abril',
      5: 'Maio', 6: 'Junho', 7: 'Julho', 8: 'Agosto',
      9: 'Setembro', 10: 'Outubro', 11: 'Novembro', 12: 'Dezembro'
    };
    const months = Array.from(uniqueMonths)
      .sort((a, b) => a - b)
      .map(monthNum => ({ value: String(monthNum), label: monthsMap[monthNum] }));

    const years = Array.from(uniqueYears)
      .sort((a, b) => a - b)
      .map(year => ({ value: String(year), label: String(year) }));

    return { days, months, years };
  }, [data]);


  const processData = (dataToProcess) => {
    let currentFilteredData = [...dataToProcess];

    if (selectedDays.length > 0) {
      const selectedDayValues = selectedDays.map(opt => Number(opt.value));
      currentFilteredData = currentFilteredData.filter(row =>
        row.Data && selectedDayValues.includes(row.Data.getDate())
      );
    }

    if (selectedMonths.length > 0) {
      const selectedMonthValues = selectedMonths.map(opt => Number(opt.value));
      currentFilteredData = currentFilteredData.filter(row =>
        row.Data && selectedMonthValues.includes(row.Data.getMonth() + 1)
      );
    }

    if (selectedYears.length > 0) {
      const selectedYearValues = selectedYears.map(opt => Number(opt.value));
      currentFilteredData = currentFilteredData.filter(row =>
        row.Data && selectedYearValues.includes(row.Data.getFullYear())
      );
    }

    const root = {
      name: 'Total Geral',
      children: {},
      totalVendas: 0,
      totalQuantidade: 0,
      totalMargem: 0,
      countMargem: 0,
      mediaMargem: 0
    };

    currentFilteredData.forEach(row => {
      let currentLevel = root;
      currentLevel.totalVendas += row['Vendas total'];
      currentLevel.totalQuantidade += row['Quantidade'];
      currentLevel.totalMargem += row['Margem'];
      currentLevel.countMargem += 1;

      groupingKeys.forEach(key => {
        const groupName = row[key] || 'Não Informado';
        if (!currentLevel.children[groupName]) {
          currentLevel.children[groupName] = {
            name: groupName,
            children: {},
            totalVendas: 0,
            totalQuantidade: 0,
            totalMargem: 0,
            countMargem: 0,
            mediaMargem: 0
          };
        }
        currentLevel = currentLevel.children[groupName];
        currentLevel.totalVendas += row['Vendas total'];
        currentLevel.totalQuantidade += row['Quantidade'];
        currentLevel.totalMargem += row['Margem'];
        currentLevel.countMargem += 1;
      });
    });

    const calculateAverages = (node) => {
      if (node.countMargem > 0) {
        node.mediaMargem = node.totalMargem / node.countMargem;
      }
      for (const childName in node.children) {
        calculateAverages(node.children[childName]);
      }
    };

    calculateAverages(root);

    return root;
  };

  const processedTree = useMemo(() => processData(data), [data, selectedDays, selectedMonths, selectedYears, groupingKeys]);

  // Função para reordenar os itens após o drag-and-drop com react-beautiful-dnd
  const onDragEnd = (result) => {
    // dropped outside the list
    if (!result.destination) {
      return;
    }

    const newGroupingKeys = Array.from(groupingKeys);
    const [removed] = newGroupingKeys.splice(result.source.index, 1);
    newGroupingKeys.splice(result.destination.index, 0, removed);

    setGroupingKeys(newGroupingKeys);
  };


  return (
    <div className={`${appStyles.box} ${styles.tabelaDinamicaBox}`}>
      <h2>Desempenho Detalhado (Tabela Dinâmica)</h2>

      {/* Seção de filtros multiselect (Dia, Mês, Ano) */}
      <div className={styles.filterSection}>
        <div className={styles.filterGroup}>
          <label htmlFor="day-select" className={styles.filterLabel}>Dia:</label>
          <Select
            id="day-select"
            isMulti
            options={filterOptions.days}
            value={selectedDays}
            onChange={setSelectedDays}
            className={styles.reactSelectContainer}
            classNamePrefix="react-select"
            placeholder="Dias..."
            noOptionsMessage={() => "Nenhum dia disponível"}
            hideSelectedOptions={false}
            closeMenuOnSelect={false}
            components={{ Option: CustomOption }}
          />
        </div>

        <div className={styles.filterGroup}>
          <label htmlFor="month-select" className={styles.filterLabel}>Mês:</label>
          <Select
            id="month-select"
            isMulti
            options={filterOptions.months}
            value={selectedMonths}
            onChange={setSelectedMonths}
            className={styles.reactSelectContainer}
            classNamePrefix="react-select"
            placeholder="Meses..."
            noOptionsMessage={() => "Nenhum mês disponível"}
            hideSelectedOptions={false}
            closeMenuOnSelect={false}
            components={{ Option: CustomOption }}
          />
        </div>

        <div className={styles.filterGroup}>
          <label htmlFor="year-select" className={styles.filterLabel}>Ano:</label>
          <Select
            id="year-select"
            isMulti
            options={filterOptions.years}
            value={selectedYears}
            onChange={setSelectedYears}
            className={styles.reactSelectContainer}
            classNamePrefix="react-select"
            placeholder="Anos..."
            noOptionsMessage={() => "Nenhum ano disponível"}
            hideSelectedOptions={false}
            closeMenuOnSelect={false}
            components={{ Option: CustomOption }}
          />
        </div>
      </div>

      {/* Seção para reorganizar as ordens das linhas com react-beautiful-dnd */}
      <div className={`${styles.filterSection} ${styles.groupingOrderSection}`}>
        <label className={styles.filterLabel}>Organizar Linhas por:</label>
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId={DROPPABLE_ID} direction="horizontal">
            {(provided) => (
              <div
                className={styles.groupingKeysList}
                ref={provided.innerRef}
                {...provided.droppableProps}
              >
                {groupingKeys.map((key, index) => (
                  <Draggable key={key} draggableId={key} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps} // <-- ESSENCIAL para arrastar
                        className={`${styles.groupingKeyItem} ${snapshot.isDragging ? styles.isDragging : ''}`}
                        style={{
                          userSelect: 'none',
                          ...provided.draggableProps.style,
                          // Ajuste para garantir que o item arrastado fique visível e por cima
                          backgroundColor: snapshot.isDragging ? '#28a745' : '#007bff',
                          color: 'white',
                          boxShadow: snapshot.isDragging ? '0px 4px 8px rgba(0,0,0,0.2)' : 'none',
                        }}
                      >
                        {key}
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>


      {data.length > 0 ? (
        <div className={styles.tableContainer}>
          <table className={styles.dataTable}>
            <thead>
              <tr>
                <th>Detalhe</th>
                <th>Soma Vendas Total</th>
                <th>Soma Quantidade</th>
                <th>Média Margem</th>
              </tr>
            </thead>
            <tbody>
              <TabelaDinamicaLinha
                item={processedTree}
                isExpandedInitially={true}
              />
            </tbody>
            <tfoot>
              <tr>
                <td className={styles.totalRow}>Total Geral</td>
                <td className={styles.totalRow}>{formatCurrency(processedTree.totalVendas)}</td>
                <td className={styles.totalRow}>{formatQuantity(processedTree.totalQuantidade)}</td>
                <td className={styles.totalRow}>{processedTree.mediaMargem.toFixed(2)}%</td>
              </tr>
            </tfoot>
          </table>
        </div>
      ) : (
        <p>Carregando dados da tabela dinâmica...</p>
      )}
    </div>
  );
}

export default TabelaDinamica;