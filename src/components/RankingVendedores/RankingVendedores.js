// src/components/RankingVendedores/RankingVendedores.js
import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import styles from './RankingVendedores.module.css';

function RankingVendedores() {
    const [rankingData, setRankingData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchRankingData = async () => {
            const rankingSpreadsheetUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQbS_7qFSgGIvpJg1Yck5Ozqm2uI7unUlxxjzCjKf1vwVgKZUdrfPCodWhukn2Lf9opNiu9PNniSY0f/pub?gid=148660743&single=true&output=csv";

            try {
                const response = await fetch(rankingSpreadsheetUrl);
                const csvText = await response.text();

                Papa.parse(csvText, {
                    header: true,
                    skipEmptyLines: true,
                    complete: (results) => {
                        const processedData = results.data
                            .filter(row => row['Vendedor'] && row['Pontos'])
                            .map(row => {
                                const pontosString = row['Pontos'].replace('%', '').replace(',', '.');
                                return {
                                    Vendedor: row['Vendedor'],
                                    Pontos: parseFloat(pontosString) || 0
                                };
                            })
                            .sort((a, b) => b.Pontos - a.Pontos);

                        setRankingData(processedData);
                        setLoading(false);
                    },
                    error: (parseError) => {
                        console.error("Erro ao fazer parse do CSV de ranking:", parseError);
                        setError("Erro ao carregar dados do ranking.");
                        setLoading(false);
                    }
                });
            } catch (networkError) {
                console.error("Erro ao buscar dados da planilha de ranking:", networkError);
                setError("Erro de rede ao carregar dados do ranking.");
                setLoading(false);
            }
        };

        fetchRankingData();
    }, []);

    if (loading) {
        return <div className={styles.rankingContainer}>Carregando ranking...</div>;
    }

    if (error) {
        return <div className={styles.rankingContainer} style={{ color: 'red' }}>{error}</div>;
    }

    // Encontrar o ponto máximo para normalizar a barra de progresso
    const maxPoints = rankingData.length > 0 ? Math.max(...rankingData.map(item => item.Pontos)) : 0;

    return (
        <div className={`${styles.rankingContainer} box`}>
            <h2>Ranking de Vendedores</h2>
            <div className={styles.rankingList}>
                {rankingData.map((item, index) => (
                    <div key={index} className={styles.rankingItem}>
                        {/* Bloco do número do ranking */}
                        <div className={styles.rankNumberBlock}>
                            <span className={styles.rankNumber}>{index + 1}</span>
                        </div>
                        
                        {/* Informações do vendedor */}
                        <div className={styles.sellerDetails}>
                            <span className={styles.sellerName}>{item.Vendedor}</span>
                            {/* Pontos formatados como detalhe */}
                            <span className={styles.sellerPointsDetail}>{item.Pontos.toFixed(2)}%</span>
                        </div>

                        {/* Barra de progresso com o valor */}
                        <div className={styles.progressBarWrapper}>
                            <div
                                className={styles.progressBarFill}
                                style={{ width: `${(item.Pontos / maxPoints) * 100}%` }}
                            ></div>
                            <span className={styles.progressBarValue}>{item.Pontos.toFixed(0)}.000</span> {/* Valor sobre a barra */}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default RankingVendedores;