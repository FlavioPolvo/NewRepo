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
    productionByColor: Array<{ color: string; percentage: number }>;
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

        const entriesData: EntryRecord[] = entriesResult.map((e: any) => ({
          id: e.id,
          date: new Date(e.date),
          producerId: e.producer_id,
          producerName: e.producers?.name || "N/A", // Corrigido para e.producers.name
          municipality:
            e.producers?.municipality || e.municipality_id?.toString() || "N/A", // Usar do producer ou o ID
          community: e.producers?.community || "N/A", // Usar do producer
          quantity: e.quantity,
          grossWeight: e.gross_weight,
          netWeight: e.net_weight,
          tare: e.tare,
          totalTare: e.total_tare, // Adicionado, estava faltando no schema original mas presente no mock
          unitValue: e.unit_value,
          totalValue: e.total_value,
          colorCode: e.color_code,
          humidity: e.humidity,
          apiary: e.apiary || "",
          lot: e.lot || "",
          contract: e.contract || "",
        }));
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
          const colorInfo = colorsData.find((c) => c.code === entry.colorCode);
          if (!colorInfo) {
            console.warn(`No color found for code: ${entry.colorCode}`);
            return; // Skip if color not found
          }
          const colorName = colorInfo.name;
          if (!productionByColor[colorName]) {
            productionByColor[colorName] = {
              production: 0,
              hexColor: colorInfo.hexColor,
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

  return { data, loading, error };
};
