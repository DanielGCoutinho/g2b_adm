// components/Grafico/Grafico.js
import React, { useState, useEffect } from 'react';
import styles from './Grafico.module.css';
import appStyles from '../../App.module.css';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
  LineChart, Line, XAxis, YAxis, CartesianGrid
} from 'recharts';

function Grafico({ data: initialData }) {
  // --- Estados para os filtros ---
  const [filteredData, setFilteredData] = useState([]);
  const [selectedVendedor, setSelectedVendedor] = useState('');
  const [selectedCliente, setSelectedCliente] = useState('');
  const [selectedItem, setSelectedItem] = useState('');
  const [selectedCanal, setSelectedCanal] = useState('');

  // ESTADOS PARA FILTROS DE DATA
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState('');

  // NOVO ESTADO: Índice do gráfico atual no carrossel
  const [currentChartIndex, setCurrentChartIndex] = useState(0);

  // --- Funções para obter opções únicas para os filtros ---
  const getUniqueOptions = (key, dataToUse = initialData) => {
    if (!dataToUse || !Array.isArray(dataToUse)) return [];
    return [...new Set(dataToUse.map(row => row[key]))].sort();
  };

  // --- Opções para os selectores de texto (Vendedor, Cliente, Item, Canal) ---
  const vendedores = getUniqueOptions('Vendedor');
  const clientes = getUniqueOptions('Cliente');
  const items = getUniqueOptions('Item');
  const canais = getUniqueOptions('Canal');

  // --- Opções para os selectores de Data ---
  const getUniqueYears = () => {
    if (!initialData || !Array.isArray(initialData)) return [];
    const years = initialData.map(row => row.Data instanceof Date ? row.Data.getFullYear() : null)
      .filter(year => year !== null && !isNaN(year));
    return [...new Set(years)].sort((a, b) => a - b);
  };
  const uniqueYears = getUniqueYears();

  const getUniqueMonths = () => {
    let dataForMonthOptions = initialData;
    if (selectedYear) {
        dataForMonthOptions = initialData.filter(row =>
            row.Data instanceof Date && row.Data.getFullYear() === parseInt(selectedYear)
        );
    }

    const monthsInFilteredData = dataForMonthOptions
                                    .map(row => row.Data instanceof Date ? row.Data.getMonth() + 1 : null)
                                    .filter(month => month !== null && !isNaN(month));
    const uniqueMonthsIndexes = [...new Set(monthsInFilteredData)].sort((a, b) => a - b);

    const monthNames = [
        "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
        "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];
    return uniqueMonthsIndexes.map(index => ({ value: index, label: monthNames[index - 1] }));
  };

  // --- Efeito para aplicar os filtros ---
  useEffect(() => {
    let currentFilteredData = initialData;

    // Filtros de texto/categoria
    if (selectedVendedor) {
      currentFilteredData = currentFilteredData.filter(row => row.Vendedor === selectedVendedor);
    }
    if (selectedCliente) {
      currentFilteredData = currentFilteredData.filter(row => row.Cliente === selectedCliente);
    }
    if (selectedItem) {
      currentFilteredData = currentFilteredData.filter(row => row.Item === selectedItem);
    }
    if (selectedCanal) {
      currentFilteredData = currentFilteredData.filter(row => row.Canal === selectedCanal);
    }

    // FILTROS DE DATA
    if (selectedYear) {
      currentFilteredData = currentFilteredData.filter(row =>
        row.Data instanceof Date && row.Data.getFullYear() === parseInt(selectedYear)
      );
    }
    if (selectedMonth) {
      currentFilteredData = currentFilteredData.filter(row =>
        row.Data instanceof Date && (row.Data.getMonth() + 1) === parseInt(selectedMonth)
      );
    }

    setFilteredData(currentFilteredData);
  }, [
    initialData,
    selectedVendedor,
    selectedCliente,
    selectedItem,
    selectedCanal,
    selectedMonth,
    selectedYear
  ]);

  // --- Lógica para o Gráfico de Pizza (Vendas por Canal) ---
  const aggregateChannelPieData = () => {
    const channelSales = {};
    filteredData.forEach(row => {
      const channel = row.Canal;
      let vendasTotal = row['Vendas total'] || 0;

      if (channel && !isNaN(vendasTotal)) {
        channelSales[channel] = (channelSales[channel] || 0) + vendasTotal;
      }
    });

    return Object.keys(channelSales).map(channel => ({
      name: channel,
      value: channelSales[channel],
    }));
  };

  const channelPieChartData = aggregateChannelPieData();
  // Paleta de cores expandida para mais gráficos
  const PIE_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF19A0', '#8A2BE2', '#40E0D0', '#E06C75', '#56B6C2'];

  // --- Lógica para o Gráfico de Pizza (Vendas por Cliente) ---
  const aggregateClientPieData = () => {
    const clientSales = {};
    filteredData.forEach(row => {
      const client = row.Cliente;
      let vendasTotal = row['Vendas total'] || 0;

      if (client && !isNaN(vendasTotal)) {
        clientSales[client] = (clientSales[client] || 0) + vendasTotal;
      }
    });

    // Limitar aos top N clientes para melhor visualização, se houver muitos
    const sortedClients = Object.entries(clientSales)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10); // Ex: top 10 clientes

    const totalTopClients = sortedClients.reduce((sum, [, val]) => sum + val, 0);
    const totalAllClients = Object.values(clientSales).reduce((sum, val) => sum + val, 0);
    const totalOther = totalAllClients - totalTopClients;

    const data = sortedClients.map(([client, value]) => ({ name: client, value }));

    if (totalOther > 0) {
      data.push({ name: 'Outros', value: totalOther });
    }

    return data;
  };

  const clientPieChartData = aggregateClientPieData();

  // --- Lógica para o Gráfico de Pizza (Vendas por Item) ---
  const aggregateItemPieData = () => {
    const itemSales = {};
    filteredData.forEach(row => {
      const item = row.Item;
      let vendasTotal = row['Vendas total'] || 0;

      if (item && !isNaN(vendasTotal)) {
        itemSales[item] = (itemSales[item] || 0) + vendasTotal;
      }
    });

    // Limitar aos top N itens para melhor visualização, se houver muitos
    const sortedItems = Object.entries(itemSales)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10); // Ex: top 10 itens

    const totalTopItems = sortedItems.reduce((sum, [, val]) => sum + val, 0);
    const totalAllItems = Object.values(itemSales).reduce((sum, val) => sum + val, 0);
    const totalOther = totalAllItems - totalTopItems;

    const data = sortedItems.map(([item, value]) => ({ name: item, value }));

    if (totalOther > 0) {
      data.push({ name: 'Outros', value: totalOther });
    }

    return data;
  };

  const itemPieChartData = aggregateItemPieData();


  // --- Lógica para o Gráfico de Linhas (Vendas por Mês e Ano) ---
  const aggregateSalesLineData = () => {
    const salesByMonthAndYear = {};

    filteredData.forEach(row => {
      const dateObject = row.Data;
      let vendasTotal = row['Vendas total'] || 0;

      if (dateObject instanceof Date && !isNaN(vendasTotal)) {
        const monthIndex = dateObject.getMonth();
        const year = dateObject.getFullYear();

        if (!salesByMonthAndYear[monthIndex]) {
          salesByMonthAndYear[monthIndex] = {};
        }
        salesByMonthAndYear[monthIndex][year] = (salesByMonthAndYear[monthIndex][year] || 0) + vendasTotal;
      }
    });

    const monthOrder = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
    const finalLineData = [];

    const yearsInFilteredData = [...new Set(filteredData.map(row => row.Data.getFullYear()))].sort();

    monthOrder.forEach((monthName, index) => {
        const item = { name: monthName.charAt(0).toUpperCase() + monthName.slice(1) };

        yearsInFilteredData.forEach(year => {
            item[year.toString()] = salesByMonthAndYear[index]?.[year] || 0;
        });

        finalLineData.push(item);
    });

    return { finalLineData, yearsInFilteredData };
  };

  const { finalLineData: salesLineChartData, yearsInFilteredData: salesYearsForLineChart } = aggregateSalesLineData();

  // --- Lógica para o Gráfico de Linhas (Quantidade por Mês e Ano) ---
  const aggregateQuantityLineData = () => {
    const quantityByMonthAndYear = {};

    filteredData.forEach(row => {
      const dateObject = row.Data;
      let quantidade = row['Quantidade'] || 0;

      if (dateObject instanceof Date && !isNaN(quantidade)) {
        const monthIndex = dateObject.getMonth();
        const year = dateObject.getFullYear();

        if (!quantityByMonthAndYear[monthIndex]) {
          quantityByMonthAndYear[monthIndex] = {};
        }
        quantityByMonthAndYear[monthIndex][year] = (quantityByMonthAndYear[monthIndex][year] || 0) + quantidade;
      }
    });

    const monthOrder = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
    const finalLineData = [];

    const yearsInFilteredData = [...new Set(filteredData.map(row => row.Data.getFullYear()))].sort();

    monthOrder.forEach((monthName, index) => {
        const item = { name: monthName.charAt(0).toUpperCase() + monthName.slice(1) };

        yearsInFilteredData.forEach(year => {
            item[year.toString()] = quantityByMonthAndYear[index]?.[year] || 0;
        });

        finalLineData.push(item);
    });

    return { finalLineData, yearsInFilteredData };
  };

  const { finalLineData: quantityLineChartData, yearsInFilteredData: quantityYearsForLineChart } = aggregateQuantityLineData();

  // --- Lógica para o Gráfico de Linhas (Média da Margem por Mês e Ano) ---
  const aggregateMarginLineData = () => {
    const marginByMonthAndYear = {};
    const countByMonthAndYear = {}; // Para calcular a média

    filteredData.forEach(row => {
      const dateObject = row.Data;
      let margem = row['Margem'] || 0;

      if (dateObject instanceof Date && !isNaN(margem)) {
        const monthIndex = dateObject.getMonth();
        const year = dateObject.getFullYear();

        if (!marginByMonthAndYear[monthIndex]) {
          marginByMonthAndYear[monthIndex] = {};
          countByMonthAndYear[monthIndex] = {};
        }

        marginByMonthAndYear[monthIndex][year] = (marginByMonthAndYear[monthIndex][year] || 0) + margem;
        countByMonthAndYear[monthIndex][year] = (countByMonthAndYear[monthIndex][year] || 0) + 1;
      }
    });

    const monthOrder = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
    const finalLineData = [];

    const yearsInFilteredData = [...new Set(filteredData.map(row => row.Data.getFullYear()))].sort();

    monthOrder.forEach((monthName, index) => {
        const item = { name: monthName.charAt(0).toUpperCase() + monthName.slice(1) };

        yearsInFilteredData.forEach(year => {
            const totalMargem = marginByMonthAndYear[index]?.[year] || 0;
            const countMargem = countByMonthAndYear[index]?.[year] || 0;
            item[year.toString()] = countMargem > 0 ? (totalMargem / countMargem) : 0;
        });

        finalLineData.push(item);
    });

    return { finalLineData, yearsInFilteredData };
  };

  const { finalLineData: marginLineChartData, yearsInFilteredData: marginYearsForLineChart } = aggregateMarginLineData();

  const hasInitialData = initialData && initialData.length > 0;
  // A verificação de dados para charts agora é mais simples, apenas se há dados filtrados
  const hasFilteredDataForCharts = filteredData.length > 0;

  // --- Array de todos os gráficos para o carrossel ---
  // Cada objeto contém o id, o título e o componente JSX do gráfico
  const allCharts = [
    {
      id: 'channel-pie',
      title: 'Representatividade de Vendas por Canal',
      component: channelPieChartData.length > 0 ? (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={channelPieChartData}
              cx="50%"
              cy="50%"
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
              {channelPieChartData.map((entry, index) => (
                <Cell key={`pie-channel-cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      ) : (
        <p>Sem dados para o gráfico de pizza de canais com os filtros selecionados.</p>
      ),
      hasData: channelPieChartData.length > 0,
    },
    {
      id: 'client-pie',
      title: 'Share de Vendas por Cliente',
      component: clientPieChartData.length > 0 ? (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={clientPieChartData}
              cx="50%"
              cy="50%"
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
              {clientPieChartData.map((entry, index) => (
                <Cell key={`pie-client-cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      ) : (
        <p>Sem dados para o gráfico de pizza de clientes com os filtros selecionados.</p>
      ),
      hasData: clientPieChartData.length > 0,
    },
    {
      id: 'item-pie',
      title: 'Share de Vendas por Item',
      component: itemPieChartData.length > 0 ? (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={itemPieChartData}
              cx="50%"
              cy="50%"
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
              {itemPieChartData.map((entry, index) => (
                <Cell key={`pie-item-cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      ) : (
        <p>Sem dados para o gráfico de pizza de itens com os filtros selecionados.</p>
      ),
      hasData: itemPieChartData.length > 0,
    },
    {
      id: 'sales-line',
      title: `Vendas Total por Mês ${salesYearsForLineChart.length > 0 ? `(${salesYearsForLineChart.join(' vs ')})` : ''}`,
      component: salesLineChartData.length > 0 ? (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            data={salesLineChartData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis formatter={(value) => `R$ ${value.toLocaleString('pt-BR')}`} />
            <Tooltip formatter={(value) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} />
            <Legend />
            {salesYearsForLineChart.map((year, index) => (
                <Line
                    key={`sales-${year}`}
                    type="monotone"
                    dataKey={year.toString()}
                    stroke={PIE_COLORS[index % PIE_COLORS.length]}
                    name={`Vendas ${year}`}
                    activeDot={{ r: 8 }}
                />
            ))}
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <p>Sem dados para o gráfico de linhas de vendas com os filtros selecionados.</p>
      ),
      hasData: salesLineChartData.length > 0,
    },
    {
      id: 'quantity-line',
      title: `Quantidade Total por Mês ${quantityYearsForLineChart.length > 0 ? `(${quantityYearsForLineChart.join(' vs ')})` : ''}`,
      component: quantityLineChartData.length > 0 ? (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            data={quantityLineChartData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip formatter={(value) => `${value.toLocaleString('pt-BR', { maximumFractionDigits: 0 })} unidades`} />
            <Legend />
            {quantityYearsForLineChart.map((year, index) => (
                <Line
                    key={`qty-${year}`}
                    type="monotone"
                    dataKey={year.toString()}
                    stroke={PIE_COLORS[(index + 1) % PIE_COLORS.length]}
                    name={`Quantidade ${year}`}
                    activeDot={{ r: 8 }}
                />
            ))}
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <p>Sem dados para o gráfico de linhas de quantidade com os filtros selecionados.</p>
      ),
      hasData: quantityLineChartData.length > 0,
    },
    {
      id: 'margin-line',
      title: `Média da Margem por Mês ${marginYearsForLineChart.length > 0 ? `(${marginYearsForLineChart.join(' vs ')})` : ''}`,
      component: marginLineChartData.length > 0 ? (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            data={marginLineChartData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis formatter={(value) => `${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}%`} />
            <Tooltip formatter={(value) => `${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}%`} />
            <Legend />
            {marginYearsForLineChart.map((year, index) => (
                <Line
                    key={`margin-${year}`}
                    type="monotone"
                    dataKey={year.toString()}
                    stroke={PIE_COLORS[(index + 2) % PIE_COLORS.length]}
                    name={`Margem ${year}`}
                    activeDot={{ r: 8 }}
                />
            ))}
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <p>Sem dados para o gráfico de linhas de margem com os filtros selecionados.</p>
      ),
      hasData: marginLineChartData.length > 0,
    },
  ];

  // Funções para navegar no carrossel
  const goToPreviousChart = () => {
    setCurrentChartIndex((prevIndex) =>
      prevIndex === 0 ? allCharts.length - 1 : prevIndex - 1
    );
  };

  const goToNextChart = () => {
    setCurrentChartIndex((prevIndex) =>
      prevIndex === allCharts.length - 1 ? 0 : prevIndex + 1
    );
  };

  const currentChart = allCharts[currentChartIndex]; // O gráfico atualmente visível

  return (
    <div className={`${appStyles.box} ${styles.graficoBox}`}>
      <h2>Análise de Vendas</h2>

      {/* --- Controles de Filtro --- */}
      {hasInitialData && (
        <div className={styles.filtersContainer}>
          <label>Vendedor:
            <select value={selectedVendedor} onChange={(e) => setSelectedVendedor(e.target.value)}>
              <option value="">Todos</option>
              {vendedores.map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </label>

          <label>Cliente:
            <select value={selectedCliente} onChange={(e) => setSelectedCliente(e.target.value)}>
              <option value="">Todos</option>
              {clientes.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>

          <label>Item:
            <select value={selectedItem} onChange={(e) => setSelectedItem(e.target.value)}>
              <option value="">Todos</option>
              {items.map(i => <option key={i} value={i}>{i}</option>)}
            </select>
          </label>

          <label>Canal:
            <select value={selectedCanal} onChange={(e) => setSelectedCanal(e.target.value)}>
              <option value="">Todos</option>
              {canais.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>

          {/* FILTROS DE DATA (Mês e Ano) */}
          <label className={styles.dateFilterLabel}>Mês:
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className={styles.dateSelect}
            >
              <option value="">Meses...</option>
              {getUniqueMonths().map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
          </label>

          <label className={styles.dateFilterLabel}>Ano:
            <select
              value={selectedYear}
              onChange={(e) => {
                setSelectedYear(e.target.value);
                setSelectedMonth('');
              }}
              className={styles.dateSelect}
            >
              <option value="">Anos...</option>
              {uniqueYears.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </label>
        </div>
      )}

      {/* --- Carrossel de Gráficos --- */}
      {hasInitialData ? (
        hasFilteredDataForCharts ? (
          // O chartsContainer agora age como o palco para o carrossel e os botões
          <div className={styles.chartsContainer}>
            <button onClick={goToPreviousChart} className={`${styles.carouselButton} ${styles.prevButton}`}>
              &lt;
            </button>
            {/* carouselContainer é o wrapper do gráfico, centralizado no chartsContainer */}
            <div className={styles.carouselContainer}>
              <div className={styles.chartCarouselItem}>
                <h3>{currentChart.title}</h3>
                {currentChart.component}
              </div>
            </div>
            <button onClick={goToNextChart} className={`${styles.carouselButton} ${styles.nextButton}`}>
              &gt;
            </button>
          </div>
        ) : (
          <p>Sem dados para os gráficos com os filtros selecionados.</p>
        )
      ) : (
        <p>Carregando dados dos gráficos...</p>
      )}
    </div>
  );
}

export default Grafico;