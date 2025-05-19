import { useState, useEffect, useCallback } from "react";
import {
    supabase,
    getProducers,
    getEntries,
    getMunicipalities,
    getColors,
} from "@/lib/supabase";
import { isWithinInterval, parseISO } from "date-fns";

// Tipos para os dados
export interface Producer {
    id: string;
    name: string;
    cod_na_comapi: string;
    municipality: string;
    community: string;
}

export interface EntryRecord {
    id: string;
    date: Date;
    producerId: string; // Este é o cod_na_comapi
    producerName: string;
    municipality: string;
    community: string;
    quantity: number;
    grossWeight: number;
    netWeight: number;
    tare: number;
    totalTare: number;
    unitValue: number;
    totalValue: number;
    colorCode: string;
    humidity: number;
    apiary: string;
    lot: string;
    contract: string;
    analysisDate: Date | null;
    invoiceNumber: string;
    anal?: string | null; // Campo Anal. adicionado
}

export interface Color {
    id: string;
    code: string;
    name: string;
    hexColor: string;
}

export interface Municipality {
    id: number;
    name: string;
    region: string;
}

export interface ReportFilters {
    municipality?: string | null; // null ou "all" para sem filtro
    colorCode?: string | null;    // null ou "all" para sem filtro
    dateRange?: {
        from?: Date | string | null;
        to?: Date | string | null;
    } | null;
    period?: string | null; // "daily", "weekly", "monthly", "yearly"
}

export interface ReportData {
    producers: Producer[];
    entries: EntryRecord[]; // Entradas não filtradas para uso geral
    filteredEntriesForSummary: EntryRecord[]; // Entradas filtradas para os cards de resumo
    municipalities: Municipality[];
    colors: Color[];
    productionSummary: {
        totalProduction: number;
        averagePerProducer: number;
        totalProducers: number;
        productionByMonth: Array<{ month: string; production: number }>;
        productionByColor: Array<{
            color: string;
            hexColor: string;
            percentage: number;
            production: number; // Valor absoluto da produção
        }>;
        productionByMunicipality: Array<{
            municipality: string;
            production: number;
        }>;
        productionTrend: Array<{ month: string; production: number }>;
    };
}

// Hook para gerenciar os dados dos relatórios
export const useReportData = (filters?: ReportFilters) => {
    const [data, setData] = useState<ReportData>({
        producers: [],
        entries: [],
        filteredEntriesForSummary: [],
        municipalities: [],
        colors: [],
        productionSummary: {
            totalProduction: 0,
            averagePerProducer: 0,
            totalProducers: 0,
            productionByMonth: [],
            productionByColor: [],
            productionByMunicipality: [],
            productionTrend: [],
        },
    });
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async (currentFilters?: ReportFilters) => {
        try {
            setLoading(true);
            setError(null);
            console.log("Fetching data with filters:", currentFilters);

            const producersResult = await getProducers();
            const entriesResult = await getEntries();
            const municipalitiesResult = await getMunicipalities();
            const colorsResult = await getColors();

            const producersData: Producer[] = producersResult.map((p: any) => ({
                id: String(p.id),
                name: p.name,
                cod_na_comapi: p.cod_na_comapi,
                municipality: p.municipality || "",
                community: p.community || "",
            }));

            let allEntriesData: EntryRecord[] = entriesResult.map((e: any) => {
                const comapiCode = String(e.producer_id);
                const producerDetails = producersData.find(p => p.cod_na_comapi === comapiCode);
                return {
                    id: String(e.id),
                    date: new Date(e.date),
                    producerId: comapiCode,
                    producerName: producerDetails?.name || "",
                    municipality: e.municipality || producerDetails?.municipality || "",
                    community: e.community || producerDetails?.community || "",
                    quantity: e.quantity || 0,
                    grossWeight: e.gross_weight || 0,
                    netWeight: e.net_weight || 0,
                    tare: e.tare || 0,
                    totalTare: e.total_tare || 0,
                    unitValue: e.unit_value || 0,
                    totalValue: e.total_value || 0,
                    colorCode: String(e.color_code || ""),
                    humidity: e.humidity || 0,
                    apiary: e.apiary || "",
                    lot: e.lot || "",
                    contract: e.contract || "",
                    analysisDate: e.analysis_date ? new Date(e.analysis_date) : null,
                    invoiceNumber: e.invoice_number || "",
                    anal: e.anal || null,
                };
            });

            const municipalitiesData: Municipality[] = municipalitiesResult.map(
                (m: any) => ({ id: m.id, name: m.name, region: m.region }),
            );

            const colorsData: Color[] = colorsResult.map((c: any) => ({
                id: c.id, code: String(c.code), name: c.name, hexColor: c.hex_color,
            })); 

            // Aplicar filtros para os cards de resumo
            let filteredEntriesForSummary = [...allEntriesData];
            
            if (currentFilters) {
                console.log("Applying filters:", currentFilters);
                
                // Filtro de intervalo de datas
                if (currentFilters.dateRange?.from && currentFilters.dateRange?.to) {
                    const fromDate = typeof currentFilters.dateRange.from === 'string' 
                        ? parseISO(currentFilters.dateRange.from) 
                        : currentFilters.dateRange.from;
                    const toDate = typeof currentFilters.dateRange.to === 'string' 
                        ? parseISO(currentFilters.dateRange.to) 
                        : currentFilters.dateRange.to;
                    
                    if (fromDate && toDate) {
                        console.log(`Filtering by date range: ${fromDate} to ${toDate}`);
                        filteredEntriesForSummary = filteredEntriesForSummary.filter(entry => 
                            isWithinInterval(entry.date, { start: fromDate, end: toDate })
                        );
                    }
                }
                
                // Filtro de município
                if (currentFilters.municipality && currentFilters.municipality !== "all") {
                    console.log(`Filtering by municipality: ${currentFilters.municipality}`);
                    filteredEntriesForSummary = filteredEntriesForSummary.filter(entry => 
                        entry.municipality?.toLowerCase() === currentFilters.municipality?.toLowerCase()
                    );
                }
                
                // Filtro de cor
                if (currentFilters.colorCode && currentFilters.colorCode !== "all") {
                    console.log(`Filtering by color: ${currentFilters.colorCode}`);
                    // Encontrar o código da cor pelo nome
                    const colorInfo = colorsData.find(c => c.name.toLowerCase() === currentFilters.colorCode?.toLowerCase());
                    const colorCodeToFilter = colorInfo ? colorInfo.code : currentFilters.colorCode;
                    
                    filteredEntriesForSummary = filteredEntriesForSummary.filter(entry => 
                        String(entry.colorCode).toLowerCase() === String(colorCodeToFilter).toLowerCase()
                    );
                }
                
                // Filtro de período (afeta principalmente a granularidade dos gráficos)
                // Implementação simplificada - em uma versão mais completa, isso afetaria a agregação dos dados
                if (currentFilters.period) {
                    console.log(`Period filter applied: ${currentFilters.period}`);
                    // A implementação completa dependeria de como o período deve afetar os dados
                    // Por ora, apenas registramos que o filtro foi aplicado
                }
            }

            console.log(`Filtered entries: ${filteredEntriesForSummary.length} of ${allEntriesData.length}`);

            // Cálculos para o productionSummary usando filteredEntriesForSummary
            const totalProduction = filteredEntriesForSummary.reduce(
                (sum, entry) => sum + (entry.netWeight || 0), 0
            );
            
            const uniqueProducersInFiltered = new Set(
                filteredEntriesForSummary.map(entry => entry.producerId)
            );
            
            const totalProducers = uniqueProducersInFiltered.size;
            const averagePerProducer = totalProducers > 0 ? totalProduction / totalProducers : 0;

            // Produção por mês - usando entradas filtradas
            const productionByMonth: { [key: string]: number } = {};
            const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
            
            filteredEntriesForSummary.forEach((entry) => {
                const entryDate = new Date(entry.date);
                const monthYear = `${months[entryDate.getMonth()]}/${entryDate.getFullYear()}`;
                productionByMonth[monthYear] = (productionByMonth[monthYear] || 0) + (entry.netWeight || 0);
            });
            
            const productionByMonthArray = Object.entries(productionByMonth)
                .map(([month, production]) => ({ month, production }))
                .sort((a, b) => {
                    const [monthA, yearA] = a.month.split("/");
                    const [monthB, yearB] = b.month.split("/");
                    if (yearA !== yearB) return parseInt(yearA) - parseInt(yearB);
                    return months.indexOf(monthA) - months.indexOf(monthB);
                });

            // Produção por cor - usando entradas filtradas
            const productionByColorFiltered: { [key: string]: { production: number; hexColor: string } } = {};
            
            filteredEntriesForSummary.forEach((entry) => {
                if (!entry.colorCode) return;
                
                const colorInfo = colorsData.find(c => c.code === String(entry.colorCode));
                if (!colorInfo) return;
                
                const colorName = colorInfo.name || `Cor ${entry.colorCode}`;
                if (!productionByColorFiltered[colorName]) {
                    productionByColorFiltered[colorName] = { 
                        production: 0, 
                        hexColor: colorInfo.hexColor || "#999999" 
                    };
                }
                
                productionByColorFiltered[colorName].production += entry.netWeight || 0;
            });

            const totalProductionForColorPercentage = Object.values(productionByColorFiltered)
                .reduce((sum, data) => sum + data.production, 0);

            const productionByColorArray = Object.entries(productionByColorFiltered)
                .map(([color, data]) => ({
                    color,
                    hexColor: data.hexColor,
                    production: data.production,
                    percentage: totalProductionForColorPercentage > 0 
                        ? (data.production / totalProductionForColorPercentage) * 100 
                        : 0,
                }))
                .sort((a, b) => b.percentage - a.percentage);

            // Produção por município - usando entradas filtradas
            const productionByMunicipalityFiltered: { [key: string]: number } = {};
            
            filteredEntriesForSummary.forEach((entry) => {
                const municipalityName = entry.municipality || "Desconhecido";
                productionByMunicipalityFiltered[municipalityName] = 
                    (productionByMunicipalityFiltered[municipalityName] || 0) + (entry.netWeight || 0);
            });
            
            const productionByMunicipalityArray = Object.entries(productionByMunicipalityFiltered)
                .map(([municipality, production]) => ({ municipality, production }))
                .sort((a, b) => b.production - a.production);

            setData({
                producers: producersData,
                entries: allEntriesData,
                filteredEntriesForSummary: filteredEntriesForSummary,
                municipalities: municipalitiesData,
                colors: colorsData,
                productionSummary: {
                    totalProduction,
                    averagePerProducer,
                    totalProducers,
                    productionByMonth: productionByMonthArray,
                    productionByColor: productionByColorArray,
                    productionByMunicipality: productionByMunicipalityArray,
                    productionTrend: productionByMonthArray, // Usando o mesmo array para tendência
                },
            });
            
            console.log("Data processed successfully with filters");
        } catch (err) {
            console.error("Error in fetchData:", err);
            setError(
                err instanceof Error
                    ? err.message
                    : "Ocorreu um erro desconhecido ao buscar os dados."
            );
        } finally {
            setLoading(false);
        }
    }, []);

    // Efeito para buscar dados quando os filtros mudarem
    useEffect(() => {
        fetchData(filters);
    }, [fetchData, filters]);

    // Retorna os dados, estado de carregamento, erro e função para atualizar dados
    return { 
        data, 
        loading, 
        error, 
        refreshData: () => fetchData(filters) 
    };
};
