import React from 'react';
import styles from './Grafico.module.css';
import appStyles from '../../App.module.css';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
  LineChart, Line, XAxis, YAxis, CartesianGrid // Novos imports para o gráfico de linhas
} from 'recharts';

function Grafico({ data }) {
  // --- Lógica para o Gráfico de Pizza (Vendas por Canal) ---
  const aggregatePieData = () => {
    const channelSales = {};
    data.forEach(row => {
      const channel = row.Canal;
      let vendasTotal = 0;
      if (row['Vendas total']) { // Coluna "Vendas total" com 't' minúsculo
        const cleanedValue = String(row['Vendas total']).replace(/[^0-9,-]+/g, "").replace(",", ".");
        vendasTotal = parseFloat(cleanedValue);
      }

      if (channel && !isNaN(vendasTotal)) {
        channelSales[channel] = (channelSales[channel] || 0) + vendasTotal;
      }
    });

    return Object.keys(channelSales).map(channel => ({
      name: channel,
      value: channelSales[channel],
    }));
  };

  const pieChartData = aggregatePieData();
  const PIE_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF19A0'];

  // --- Lógica para o Gráfico de Linhas (Vendas por Mês e Ano) ---
  const aggregateLineData = () => {
    const salesByMonthYear = {};

    data.forEach(row => {
      const dateString = row.Data; // Coluna "Data" no formato dd/mm/aaaa
      let vendasTotal = 0;
      if (row['Vendas total']) { // Coluna "Vendas total" com 't' minúsculo
        const cleanedValue = String(row['Vendas total']).replace(/[^0-9,-]+/g, "").replace(",", ".");
        vendasTotal = parseFloat(cleanedValue);
      }

      if (dateString && !isNaN(vendasTotal)) {
        // CORREÇÃO AQUI: Deixar o primeiro elemento vazio para ignorar
        const [, month, year] = dateString.split('/').map(Number);
        const monthYearKey = `${month}-${year}`; // Chave para agrupar (ex: "5-2024")

        if (!salesByMonthYear[monthYearKey]) {
          salesByMonthYear[monthYearKey] = { month: month, year: year, totalSales: 0 };
        }
        salesByMonthYear[monthYearKey].totalSales += vendasTotal;
      }
    });

    // Converter o objeto para um array e ordenar por ano e mês
    const sortedData = Object.values(salesByMonthYear).sort((a, b) => {
      if (a.year !== b.year) {
        return a.year - b.year;
      }
      return a.month - b.month;
    });

    // Juntar os dados de 2024 e 2025 em um único array, por mês
    const finalLineData = [];
    const monthOrder = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"]; // Ordem para exibir os meses

    const sales2024 = Object.fromEntries(monthOrder.map(month => [month, 0]));
    const sales2025 = Object.fromEntries(monthOrder.map(month => [month, 0]));

    sortedData.forEach(item => {
      const monthName = new Date(item.year, item.month - 1).toLocaleString('pt-BR', { month: 'short' });

      if (item.year === 2024) {
        sales2024[monthName] = item.totalSales;
      } else if (item.year === 2025) {
        sales2025[monthName] = item.totalSales;
      }
    });

    monthOrder.forEach(month => {
        const item = { name: month };
        item['2024'] = sales2024[month];
        item['2025'] = sales2025[month];
        finalLineData.push(item);
    });

    return finalLineData;
  };

  const lineChartData = aggregateLineData();

  const hasData = data.length > 0 && (pieChartData.length > 0 || lineChartData.length > 0);

  return (
    <div className={`${appStyles.box} ${styles.graficoBox}`}>
      <h2>Análise de Vendas</h2>
      {hasData ? (
        <div className={styles.chartsContainer}>
          <div className={styles.chartItem}>
            <h3>Representatividade de Vendas por Canal</h3>
            {pieChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`pie-cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p>Sem dados para o gráfico de pizza.</p>
            )}
          </div>

          <div className={styles.chartItem}>
            <h3>Vendas Total por Mês (2024 vs 2025)</h3>
            {lineChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart
                  data={lineChartData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis formatter={(value) => `R$ ${value.toLocaleString('pt-BR')}`} />
                  <Tooltip formatter={(value) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} />
                  <Legend />
                  <Line type="monotone" dataKey="2024" stroke="#8884d8" name="Vendas 2024" activeDot={{ r: 8 }} />
                  <Line type="monotone" dataKey="2025" stroke="#82ca9d" name="Vendas 2025" activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p>Sem dados para o gráfico de linhas.</p>
            )}
          </div>
        </div>
      ) : (
        <p>Carregando dados dos gráficos...</p>
      )}
    </div>
  );
}

export default Grafico;