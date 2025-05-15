import { useState, useEffect } from "react";
import {
    supabase,
    getProducers,
    getEntries,
    getMunicipalities,
    getColors,
} from "@/lib/supabase";

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
    producerId: string;
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

export interface ReportData {
    producers: Producer[];
    entries: EntryRecord[];
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
        }>;
        productionByMunicipality: Array<{
            municipality: string;
            production: number;
        }>;
        productionTrend: Array<{ month: string; production: number }>;
    };
}

// Hook para gerenciar os dados dos relatórios
export const useReportData = () => {
    const [data, setData] = useState<ReportData>({
        producers: [],
        entries: [],
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

    // Function to refresh data
    const refreshData = async () => {
        try {
            setLoading(true);
            setError(null);
            console.log("Refreshing data from Supabase...");

            const producersResult = await getProducers();
            const entriesResult = await getEntries();
            const municipalitiesResult = await getMunicipalities();
            const colorsResult = await getColors();

            console.log("Raw producersResult:", producersResult);
            console.log("Raw entriesResult:", entriesResult);
            console.log("Raw municipalitiesResult:", municipalitiesResult);
            console.log("Raw colorsResult:", colorsResult);

            const producersData: Producer[] = producersResult.map((p: any) => ({
                id: String(p.id), // Convert to string for consistency
                name: p.name,
                cod_na_comapi: p.cod_na_comapi,
                municipality: p.municipality || "",
                community: p.community || "",
            }));

            const entriesData: EntryRecord[] = entriesResult.map((e: any) => {
                console.log("Processing entry:", e);
                const comapiCode = String(e.producer_id); // Assuming e.producer_id is the COMAPI code
                const producerDetails = producersData.find(p => p.cod_na_comapi === comapiCode);

                return {
                    id: String(e.id),
                    date: new Date(e.date),
                    producerId: comapiCode, // This is the COMAPI code
                    producerName: producerDetails?.name || "",
                    municipality: e.municipality || producerDetails?.municipality || "", // Prioritize municipality from entry, fallback to producer
                    community: e.community || producerDetails?.community || "",   // Prioritize community from entry, fallback to producer
                    quantity: e.quantity || 0,
                    grossWeight: e.gross_weight || 0,
                    netWeight: e.net_weight || 0,
                    tare: e.tare || 0,
                    totalTare: e.total_tare || 0,
                    unitValue: e.unit_value || 0,
                    totalValue: e.total_value || 0,
                    colorCode: e.color_code || "",
                    humidity: e.humidity || 0,
                    apiary: e.apiary || "",
                    lot: e.lot || "",
                    contract: e.contract || "",
                    analysisDate: e.analysis_date ? new Date(e.analysis_date) : null,
                    invoiceNumber: e.invoice_number || "",
                };
            });
            console.log("Processed entriesData:", entriesData);

            const municipalitiesData: Municipality[] = municipalitiesResult.map(
                (m: any) => ({
                    id: m.id,
                    name: m.name,
                    region: m.region,
                }),
            );

            const colorsData: Color[] = colorsResult.map((c: any) => ({
                id: c.id,
                code: c.code,
                name: c.name,
                hexColor: c.hex_color,
            }));
            console.log("Processed colorsData:", colorsData);

            entriesData.sort((a, b) => a.date.getTime() - b.date.getTime());

            const totalProduction = entriesData.reduce(
                (sum, entry) => sum + (entry.netWeight || 0),
                0,
            );
            const uniqueProducers = new Set(
                entriesData.map((entry) => entry.producerId),
            );
            const totalProducers = uniqueProducers.size;
            const averagePerProducer =
                totalProducers > 0 ? totalProduction / totalProducers : 0;

            const productionByMonth: { [key: string]: number } = {};
            const months = [
                "Jan",
                "Fev",
                "Mar",
                "Abr",
                "Mai",
                "Jun",
                "Jul",
                "Ago",
                "Set",
                "Out",
                "Nov",
                "Dez",
            ];
            entriesData.forEach((entry) => {
                const entryDate = new Date(entry.date);
                const monthYear = `${months[entryDate.getMonth()]}/${entryDate.getFullYear()}`;
                productionByMonth[monthYear] =
                    (productionByMonth[monthYear] || 0) + (entry.netWeight || 0);
            });
            const productionByMonthArray = Object.entries(productionByMonth).map(
                ([month, production]) => ({ month, production }),
            );
            productionByMonthArray.sort((a, b) => {
                const [monthA, yearA] = a.month.split("/");
                const [monthB, yearB] = b.month.split("/");
                if (yearA !== yearB) return parseInt(yearA) - parseInt(yearB);
                return months.indexOf(monthA) - months.indexOf(monthB);
            });

            const productionByColor: {
                [key: string]: { production: number; hexColor: string };
            } = {};
            entriesData.forEach((entry) => {
                if (!entry.colorCode) {
                    console.warn("Entry with no colorCode:", entry);
                    return;
                }

                const colorCodeStr = String(entry.colorCode);
                const colorInfo = colorsData.find(
                    (c) => String(c.code) === colorCodeStr,
                );

                if (!colorInfo) {
                    console.warn(`No color found for code: ${entry.colorCode}`);
                    return;
                }

                const colorName = colorInfo.name || `Cor ${entry.colorCode}`;
                if (!productionByColor[colorName]) {
                    productionByColor[colorName] = {
                        production: 0,
                        hexColor: colorInfo.hexColor || "#999999",
                    };
                }
                productionByColor[colorName].production += entry.netWeight || 0;
            });

            const productionByColorArray = Object.entries(productionByColor)
                .map(([color, data]) => ({
                    color,
                    hexColor: data.hexColor,
                    percentage:
                        totalProduction > 0 ? (data.production / totalProduction) * 100 : 0,
                }))
                .sort((a, b) => b.percentage - a.percentage);

            console.log("Calculated productionByColorArray:", productionByColorArray);

            const productionByMunicipality: { [key: string]: number } = {};
            entriesData.forEach((entry) => {
                const municipalityName = entry.municipality || "Desconhecido";
                productionByMunicipality[municipalityName] =
                    (productionByMunicipality[municipalityName] || 0) +
                    (entry.netWeight || 0);
            });
            const productionByMunicipalityArray = Object.entries(
                productionByMunicipality,
            ).map(([municipality, production]) => ({ municipality, production }));

            const finalData = {
                producers: producersData,
                entries: entriesData,
                municipalities: municipalitiesData,
                colors: colorsData,
                productionSummary: {
                    totalProduction,
                    averagePerProducer,
                    totalProducers,
                    productionByMonth: productionByMonthArray,
                    productionByColor: productionByColorArray,
                    productionByMunicipality: productionByMunicipalityArray,
                    productionTrend: productionByMonthArray,
                },
            };
            console.log("Final data to be set:", finalData);
            setData(finalData);
        } catch (err) {
            console.error("Erro detalhado no fetchData do useReportData:", err);
            setError(
                err instanceof Error
                    ? err.message
                    : "Ocorreu um erro desconhecido ao buscar os dados.",
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);
                console.log("Fetching data from Supabase...");

                const producersResult = await getProducers();
                const entriesResult = await getEntries();
                const municipalitiesResult = await getMunicipalities();
                const colorsResult = await getColors();

                console.log("Raw producersResult:", producersResult);
                console.log("Raw entriesResult:", entriesResult);
                console.log("Raw municipalitiesResult:", municipalitiesResult);
                console.log("Raw colorsResult:", colorsResult);

                const producersData: Producer[] = producersResult.map((p: any) => ({
                    id: p.id,
                    name: p.name, // Corrigido de nome_completo
                    cod_na_comapi: p.cod_na_comapi,
                    municipality: p.municipality || "",
                    community: p.community || "",
                }));

                const entriesData: EntryRecord[] = entriesResult.map((e: any) => {
                    // Ensure we have valid data for each entry
                    console.log("Processing entry:", e);
                    return {
                        id: e.id,
                        date: new Date(e.date),
                        producerId: e.producer_id,
                        producerName: e.producers?.name || "N/A",
                        municipality: e.municipality || e.producers?.municipality || "N/A",
                        community: e.community || e.producers?.community || "N/A",
                        quantity: e.quantity || 0,
                        grossWeight: e.gross_weight || 0,
                        netWeight: e.net_weight || 0,
                        tare: e.tare || 0,
                        totalTare: e.total_tare || 0,
                        unitValue: e.unit_value || 0,
                        totalValue: e.total_value || 0,
                        colorCode: e.color_code || "",
                        humidity: e.humidity || 0,
                        apiary: e.apiary || "",
                        lot: e.lot || "",
                        contract: e.contract || "",
                        analysisDate: e.analysis_date ? new Date(e.analysis_date) : null,
                        invoiceNumber: e.invoice_number || "",
                    };
                });
                console.log("Processed entriesData:", entriesData);

                const municipalitiesData: Municipality[] = municipalitiesResult.map(
                    (m: any) => ({
                        id: m.id,
                        name: m.name,
                        region: m.region,
                    }),
                );

                const colorsData: Color[] = colorsResult.map((c: any) => ({
                    id: c.id,
                    code: c.code,
                    name: c.name,
                    hexColor: c.hex_color,
                }));
                console.log("Processed colorsData:", colorsData);

                entriesData.sort((a, b) => a.date.getTime() - b.date.getTime());

                const totalProduction = entriesData.reduce(
                    (sum, entry) => sum + (entry.netWeight || 0),
                    0,
                );
                const uniqueProducers = new Set(
                    entriesData.map((entry) => entry.producerId),
                );
                const totalProducers = uniqueProducers.size;
                const averagePerProducer =
                    totalProducers > 0 ? totalProduction / totalProducers : 0;

                const productionByMonth: { [key: string]: number } = {};
                const months = [
                    "Jan",
                    "Fev",
                    "Mar",
                    "Abr",
                    "Mai",
                    "Jun",
                    "Jul",
                    "Ago",
                    "Set",
                    "Out",
                    "Nov",
                    "Dez",
                ];
                entriesData.forEach((entry) => {
                    const entryDate = new Date(entry.date);
                    const monthYear = `${months[entryDate.getMonth()]}/${entryDate.getFullYear()}`;
                    productionByMonth[monthYear] =
                        (productionByMonth[monthYear] || 0) + (entry.netWeight || 0);
                });
                const productionByMonthArray = Object.entries(productionByMonth).map(
                    ([month, production]) => ({ month, production }),
                );
                productionByMonthArray.sort((a, b) => {
                    const [monthA, yearA] = a.month.split("/");
                    const [monthB, yearB] = b.month.split("/");
                    if (yearA !== yearB) return parseInt(yearA) - parseInt(yearB);
                    return months.indexOf(monthA) - months.indexOf(monthB);
                });

                const productionByColor: {
                    [key: string]: { production: number; hexColor: string };
                } = {};
                entriesData.forEach((entry) => {
                    if (!entry.colorCode) {
                        console.warn("Entry with no colorCode:", entry);
                        return; // Skip entries without color code
                    }

                    // Convert colorCode to string for comparison if needed
                    const colorCodeStr = String(entry.colorCode);
                    const colorInfo = colorsData.find(
                        (c) => String(c.code) === colorCodeStr,
                    );

                    if (!colorInfo) {
                        console.warn(`No color found for code: ${entry.colorCode}`);
                        return; // Skip if color not found
                    }

                    const colorName = colorInfo.name || `Cor ${entry.colorCode}`;
                    if (!productionByColor[colorName]) {
                        productionByColor[colorName] = {
                            production: 0,
                            hexColor: colorInfo.hexColor || "#999999",
                        };
                    }
                    productionByColor[colorName].production += entry.netWeight || 0;
                });

                // Sort colors by production amount (descending)
                const productionByColorArray = Object.entries(productionByColor)
                    .map(([color, data]) => ({
                        color,
                        hexColor: data.hexColor,
                        percentage:
                            totalProduction > 0
                                ? (data.production / totalProduction) * 100
                                : 0,
                    }))
                    .sort((a, b) => b.percentage - a.percentage);

                console.log(
                    "Calculated productionByColorArray:",
                    productionByColorArray,
                );

                const productionByMunicipality: { [key: string]: number } = {};
                entriesData.forEach((entry) => {
                    const municipalityName = entry.municipality || "Desconhecido";
                    productionByMunicipality[municipalityName] =
                        (productionByMunicipality[municipalityName] || 0) +
                        (entry.netWeight || 0);
                });
                const productionByMunicipalityArray = Object.entries(
                    productionByMunicipality,
                ).map(([municipality, production]) => ({ municipality, production }));

                const finalData = {
                    producers: producersData,
                    entries: entriesData,
                    municipalities: municipalitiesData,
                    colors: colorsData,
                    productionSummary: {
                        totalProduction,
                        averagePerProducer,
                        totalProducers,
                        productionByMonth: productionByMonthArray,
                        productionByColor: productionByColorArray,
                        productionByMunicipality: productionByMunicipalityArray,
                        productionTrend: productionByMonthArray,
                    },
                };
                console.log("Final data to be set:", finalData);
                setData(finalData);
            } catch (err) {
                console.error("Erro detalhado no fetchData do useReportData:", err);
                setError(
                    err instanceof Error
                        ? err.message
                        : "Ocorreu um erro desconhecido ao buscar os dados.",
                );
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return { data, loading, error, refreshData };
};
