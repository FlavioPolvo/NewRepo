import React, { useState, useMemo, useCallback, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  format,
  isWithinInterval,
  parseISO,
  subMonths,
  startOfMonth,
  endOfMonth,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  CalendarIcon,
  Download,
  Printer,
  BarChart3,
  LineChart as LineChartIcon,
  PieChart as PieChartIcon,
  Loader2,
  FileText as FileSpreadsheet,
  FileText as FilePdf,
  RefreshCw,
  Filter,
  X,
} from "lucide-react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { cn } from "@/lib/utils";
import { useReportData } from "@/hooks/useReportData";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  TooltipProps,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface ComparativeReportProps {
  className?: string;
}

type DateRangePreset = {
  label: string;
  value: string;
  getRange: () => { from: Date; to: Date };
};

const ComparativeReport: React.FC<ComparativeReportProps> = ({
  className = "",
}) => {
  const [reportType, setReportType] = useState<string>("period");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [fromDate, setFromDate] = useState<Date | undefined>(
    subMonths(new Date(), 3),
  );
  const [toDate, setToDate] = useState<Date | undefined>(new Date());
  const [selectedMunicipality, setSelectedMunicipality] = useState<string>();
  const [selectedProducer, setSelectedProducer] = useState<string>();
  const [selectedColor, setSelectedColor] = useState<string>();
  const [selectedRegion, setSelectedRegion] = useState<string>();
  const [chartType, setChartType] = useState<string>("bar");
  const [isFiltersOpen, setIsFiltersOpen] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [searchResults, setSearchResults] = useState<any[]>([]);

  // Usar o hook para buscar os dados
  const { data, loading, error, refreshData } = useReportData();
  const { producers, entries, municipalities, colors, productionSummary } =
    data;

  // Presets de intervalo de datas
  const dateRangePresets: DateRangePreset[] = [
    {
      label: "Último mês",
      value: "last-month",
      getRange: () => {
        const today = new Date();
        const lastMonth = subMonths(today, 1);
        return {
          from: startOfMonth(lastMonth),
          to: endOfMonth(lastMonth),
        };
      },
    },
    {
      label: "Últimos 3 meses",
      value: "last-3-months",
      getRange: () => {
        const today = new Date();
        return {
          from: subMonths(today, 3),
          to: today,
        };
      },
    },
    {
      label: "Últimos 6 meses",
      value: "last-6-months",
      getRange: () => {
        const today = new Date();
        return {
          from: subMonths(today, 6),
          to: today,
        };
      },
    },
    {
      label: "Último ano",
      value: "last-year",
      getRange: () => {
        const today = new Date();
        return {
          from: subMonths(today, 12),
          to: today,
        };
      },
    },
  ];

  // Aplicar preset de intervalo de datas
  const applyDateRangePreset = (preset: DateRangePreset) => {
    const { from, to } = preset.getRange();
    setFromDate(from);
    setToDate(to);
  };

  // Obter regiões únicas dos municípios
  const regions = useMemo(() => {
    const uniqueRegions = new Set<string>();
    municipalities.forEach((municipality) => {
      if (municipality.region) {
        uniqueRegions.add(municipality.region);
      }
    });
    return Array.from(uniqueRegions);
  }, [municipalities]);

  // Filtrar os dados com base nos filtros selecionados
  const filteredEntries = useMemo(() => {
    if (!entries.length) return [];

    return entries.filter((entry) => {
      // Filtrar por data
      const dateInRange =
        fromDate && toDate
          ? isWithinInterval(new Date(entry.date), {
              start: fromDate,
              end: toDate,
            })
          : true;

      // Filtrar por município
      const municipalityMatch = selectedMunicipality
        ? entry.municipality === selectedMunicipality
        : true;

      // Filtrar por região
      const regionMatch = selectedRegion
        ? municipalities.find((m) => m.name === entry.municipality)?.region ===
          selectedRegion
        : true;

      // Filtrar por produtor
      const producerMatch = selectedProducer
        ? entry.producerName === selectedProducer
        : true;

      // Filtrar por cor
      const colorMatch = selectedColor
        ? entry.colorCode === colors.find((c) => c.name === selectedColor)?.code
        : true;

      return (
        dateInRange &&
        municipalityMatch &&
        regionMatch &&
        producerMatch &&
        colorMatch
      );
    });
  }, [
    entries,
    fromDate,
    toDate,
    selectedMunicipality,
    selectedRegion,
    selectedProducer,
    selectedColor,
    colors,
    municipalities,
  ]);

  // Preparar dados para gráficos
  const chartData = useMemo(() => {
    if (!filteredEntries.length) return [];

    if (reportType === "period") {
      // Agrupar por mês
      const entriesByMonth: Record<
        string,
        { production: number; value: number }
      > = {};

      filteredEntries.forEach((entry) => {
        const monthYear = format(new Date(entry.date), "MMM/yyyy", {
          locale: ptBR,
        });
        if (!entriesByMonth[monthYear]) {
          entriesByMonth[monthYear] = { production: 0, value: 0 };
        }
        entriesByMonth[monthYear].production += entry.netWeight;
        entriesByMonth[monthYear].value += entry.totalValue;
      });

      return Object.entries(entriesByMonth).map(([month, data]) => ({
        name: month,
        production: parseFloat(data.production.toFixed(2)),
        value: parseFloat(data.value.toFixed(2)),
      }));
    }

    if (reportType === "municipality") {
      // Agrupar por município
      const entriesByMunicipality: Record<
        string,
        { production: number; producers: Set<string> }
      > = {};

      filteredEntries.forEach((entry) => {
        if (!entriesByMunicipality[entry.municipality]) {
          entriesByMunicipality[entry.municipality] = {
            production: 0,
            producers: new Set(),
          };
        }
        entriesByMunicipality[entry.municipality].production += entry.netWeight;
        entriesByMunicipality[entry.municipality].producers.add(
          entry.producerId,
        );
      });

      return Object.entries(entriesByMunicipality).map(
        ([municipality, data]) => ({
          name: municipality,
          production: parseFloat(data.production.toFixed(2)),
          producerCount: data.producers.size,
          average: parseFloat(
            (data.production / data.producers.size).toFixed(2),
          ),
        }),
      );
    }

    if (reportType === "community") {
      // Agrupar por comunidade
      const entriesByCommunity: Record<
        string,
        { production: number; producers: Set<string> }
      > = {};

      filteredEntries.forEach((entry) => {
        if (!entry.community) return;

        if (!entriesByCommunity[entry.community]) {
          entriesByCommunity[entry.community] = {
            production: 0,
            producers: new Set(),
          };
        }
        entriesByCommunity[entry.community].production += entry.netWeight;
        entriesByCommunity[entry.community].producers.add(entry.producerId);
      });

      return Object.entries(entriesByCommunity).map(([community, data]) => ({
        name: community,
        production: parseFloat(data.production.toFixed(2)),
        producerCount: data.producers.size,
        average: parseFloat((data.production / data.producers.size).toFixed(2)),
      }));
    }

    if (reportType === "producer") {
      // Agrupar por produtor
      const entriesByProducer: Record<
        string,
        { production: number; value: number; municipality: string }
      > = {};

      filteredEntries.forEach((entry) => {
        if (!entriesByProducer[entry.producerName]) {
          entriesByProducer[entry.producerName] = {
            production: 0,
            value: 0,
            municipality: entry.municipality,
          };
        }
        entriesByProducer[entry.producerName].production += entry.netWeight;
        entriesByProducer[entry.producerName].value += entry.totalValue;
      });

      return Object.entries(entriesByProducer).map(([producer, data]) => ({
        name: producer,
        production: parseFloat(data.production.toFixed(2)),
        value: parseFloat(data.value.toFixed(2)),
        municipality: data.municipality,
      }));
    }

    if (reportType === "color") {
      // Agrupar por cor
      const entriesByColor: Record<
        string,
        { production: number; percentage: number }
      > = {};
      const totalProduction = filteredEntries.reduce(
        (sum, entry) => sum + entry.netWeight,
        0,
      );

      filteredEntries.forEach((entry) => {
        const colorName =
          colors.find((c) => String(c.code) === String(entry.colorCode))
            ?.name || `Cor ${entry.colorCode}`;
        if (!entriesByColor[colorName]) {
          entriesByColor[colorName] = { production: 0, percentage: 0 };
        }
        entriesByColor[colorName].production += entry.netWeight;
      });

      // Calcular percentagens
      Object.keys(entriesByColor).forEach((color) => {
        entriesByColor[color].percentage =
          (entriesByColor[color].production / totalProduction) * 100;
      });

      return Object.entries(entriesByColor).map(([color, data]) => ({
        name: color,
        value: parseFloat(data.production.toFixed(2)),
        percentage: parseFloat(data.percentage.toFixed(2)),
        color: colors.find((c) => c.name === color)?.hexColor || "#999999",
      }));
    }

    return [];
  }, [filteredEntries, reportType, colors]);

  // Type definitions for stats objects
  type MonthStats = {
    totalWeight: number;
    totalValue: number;
    producerCount: Set<string>;
  };

  type MunicipalityStats = {
    totalWeight: number;
    producerCount: Set<string>;
  };

  type ProducerStats = {
    municipality: string;
    totalWeight: number;
    totalValue: number;
  };

  type ColorStats = {
    totalWeight: number;
    totalValue: number;
  };

  // Helper function to get report data based on current tab
  const getReportData = useCallback(() => {
    let title = "";
    let headers: string[] = [];
    let data: any[][] = [];

    if (reportType === "period") {
      title = "Relatório de Produção por Período";
      headers = [
        "Período",
        "Quantidade (kg)",
        "Valor Total (R$)",
        "Média por Produtor",
      ];

      // Agrupar entradas por mês
      const entriesByMonth = filteredEntries.reduce<Record<string, MonthStats>>(
        (acc, entry) => {
          const monthYear = format(new Date(entry.date), "MMMM/yyyy", {
            locale: ptBR,
          });
          if (!acc[monthYear]) {
            acc[monthYear] = {
              totalWeight: 0,
              totalValue: 0,
              producerCount: new Set(),
            };
          }
          acc[monthYear].totalWeight += entry.netWeight;
          acc[monthYear].totalValue += entry.totalValue;
          acc[monthYear].producerCount.add(entry.producerId);
          return acc;
        },
        {},
      );

      // Converter para o formato da tabela
      data = Object.entries(entriesByMonth).map(([monthYear, stats]) => {
        const avgPerProducer = stats.totalWeight / stats.producerCount.size;
        return [
          monthYear,
          stats.totalWeight.toFixed(2),
          `R$ ${stats.totalValue.toFixed(2)}`,
          `${avgPerProducer.toFixed(1)} kg`,
        ];
      });

      // Se não houver dados filtrados, mostrar array vazio
      if (data.length === 0) {
        data = [];
      }
    } else if (reportType === "municipality") {
      title = "Relatório de Produção por Município";
      headers = [
        "Município",
        "Região",
        "Quantidade (kg)",
        "Nº de Produtores",
        "Média por Produtor",
      ];

      // Agrupar entradas por município
      const entriesByMunicipality = filteredEntries.reduce<
        Record<string, MunicipalityStats>
      >((acc, entry) => {
        if (!acc[entry.municipality]) {
          acc[entry.municipality] = {
            totalWeight: 0,
            producerCount: new Set(),
          };
        }
        acc[entry.municipality].totalWeight += entry.netWeight;
        acc[entry.municipality].producerCount.add(entry.producerId);
        return acc;
      }, {});

      // Converter para o formato da tabela
      data = Object.entries(entriesByMunicipality).map(
        ([municipality, stats]) => {
          const avgPerProducer = stats.totalWeight / stats.producerCount.size;
          const region =
            municipalities.find((m) => m.name === municipality)?.region || "";
          return [
            municipality,
            region,
            stats.totalWeight.toFixed(2),
            stats.producerCount.size.toString(),
            `${avgPerProducer.toFixed(1)} kg`,
          ];
        },
      );

      // Se não houver dados filtrados, mostrar array vazio
      if (data.length === 0) {
        data = [];
      }
    } else if (reportType === "community") {
      title = "Relatório de Produção por Comunidade";
      headers = [
        "Comunidade",
        "Município",
        "Quantidade (kg)",
        "Nº de Produtores",
        "Média por Produtor",
      ];

      // Agrupar entradas por comunidade
      type CommunityStats = {
        totalWeight: number;
        producerCount: Set<string>;
        municipality: string;
      };

      const entriesByCommunity = filteredEntries.reduce<
        Record<string, CommunityStats>
      >((acc, entry) => {
        if (!entry.community) return acc;

        if (!acc[entry.community]) {
          acc[entry.community] = {
            totalWeight: 0,
            producerCount: new Set(),
            municipality: entry.municipality || "",
          };
        }
        acc[entry.community].totalWeight += entry.netWeight;
        acc[entry.community].producerCount.add(entry.producerId);
        return acc;
      }, {});

      // Converter para o formato da tabela
      data = Object.entries(entriesByCommunity).map(([community, stats]) => {
        const avgPerProducer = stats.totalWeight / stats.producerCount.size;
        return [
          community,
          stats.municipality,
          stats.totalWeight.toFixed(2),
          stats.producerCount.size.toString(),
          `${avgPerProducer.toFixed(1)} kg`,
        ];
      });

      // Se não houver dados filtrados, mostrar array vazio
      if (data.length === 0) {
        data = [];
      }
    } else if (reportType === "producer") {
      title = "Relatório de Produção por Produtor";
      headers = [
        "Produtor",
        "Município",
        "Quantidade (kg)",
        "Valor Total (R$)",
        "Valor Médio (R$/kg)",
      ];

      // Agrupar entradas por produtor
      const entriesByProducer = filteredEntries.reduce<
        Record<string, ProducerStats>
      >((acc, entry) => {
        if (!acc[entry.producerName]) {
          acc[entry.producerName] = {
            municipality: entry.municipality,
            totalWeight: 0,
            totalValue: 0,
          };
        }
        acc[entry.producerName].totalWeight += entry.netWeight;
        acc[entry.producerName].totalValue += entry.totalValue;
        return acc;
      }, {});

      // Converter para o formato da tabela
      data = Object.entries(entriesByProducer).map(([producerName, stats]) => {
        const avgValue = stats.totalValue / stats.totalWeight;
        return [
          producerName,
          stats.municipality,
          stats.totalWeight.toFixed(2),
          `R$ ${stats.totalValue.toFixed(2)}`,
          `R$ ${avgValue.toFixed(2)}`,
        ];
      });

      // Se não houver dados filtrados, mostrar array vazio
      if (data.length === 0) {
        data = [];
      }
    } else if (reportType === "color") {
      title = "Relatório de Produção por Classificação de Cor";
      headers = [
        "Classificação",
        "Quantidade (kg)",
        "Percentual (%)",
        "Valor Médio (R$/kg)",
      ];

      // Agrupar entradas por cor
      const entriesByColor = filteredEntries.reduce<Record<string, ColorStats>>(
        (acc, entry) => {
          const colorName =
            colors.find((c) => c.code === entry.colorCode)?.name ||
            entry.colorCode;
          if (!acc[colorName]) {
            acc[colorName] = {
              totalWeight: 0,
              totalValue: 0,
            };
          }
          acc[colorName].totalWeight += entry.netWeight;
          acc[colorName].totalValue += entry.totalValue;
          return acc;
        },
        {},
      );

      // Calcular total para percentagens
      const totalWeight = Object.values(entriesByColor).reduce(
        (sum, stats) => sum + stats.totalWeight,
        0,
      );

      // Converter para o formato da tabela
      data = Object.entries(entriesByColor).map(([colorName, stats]) => {
        const percentage = (stats.totalWeight / totalWeight) * 100;
        const avgValue = stats.totalValue / stats.totalWeight;
        return [
          colorName,
          stats.totalWeight.toFixed(2),
          `${percentage.toFixed(1)}%`,
          `R$ ${avgValue.toFixed(2)}`,
        ];
      });

      // Se não houver dados filtrados, mostrar array vazio
      if (data.length === 0) {
        data = [];
      }
    }

    return { title, headers, data };
  }, [filteredEntries, reportType, colors, municipalities]);

  const handleExportPDF = () => {
    let title, headers, data;

    if (reportType === "producers-list") {
      title = "Lista Completa de Produtores";
      headers = [
        "ID",
        "Nome",
        "Código COMAPI",
        "Município",
        "Comunidade",
        "Região",
      ];

      // Filtrar produtores conforme os filtros aplicados
      const filteredProducers = producers.filter(
        (producer) =>
          (!selectedMunicipality ||
            producer.municipality === selectedMunicipality) &&
          (!selectedRegion ||
            municipalities.find((m) => m.name === producer.municipality)
              ?.region === selectedRegion),
      );

      data = filteredProducers.map((producer) => [
        producer.id,
        producer.name,
        producer.cod_na_comapi,
        producer.municipality,
        producer.community,
        municipalities.find((m) => m.name === producer.municipality)?.region ||
          "",
      ]);
    } else if (reportType === "entries-list") {
      title = "Registro Completo de Entradas";
      headers = [
        "Data",
        "Produtor",
        "Município",
        "Quantidade",
        "Peso Líq. (kg)",
        "Valor Total (R$)",
        "Classificação",
      ];

      data = filteredEntries.map((entry) => [
        format(new Date(entry.date), "dd/MM/yyyy"),
        entry.producerName,
        entry.municipality,
        entry.quantity.toString(),
        entry.netWeight.toFixed(2),
        `R$ ${entry.totalValue.toFixed(2)}`,
        colors.find((c) => c.code === entry.colorCode)?.name || entry.colorCode,
      ]);
    } else {
      // Usar a função existente para outros tipos de relatório
      const reportData = getReportData();
      title = reportData.title;
      headers = reportData.headers;
      data = reportData.data;
    }

    const doc = new jsPDF();

    // Add title
    doc.setFontSize(16);
    doc.text(title, 14, 20);

    // Add date range if available
    if (fromDate && toDate) {
      doc.setFontSize(12);
      doc.text(
        `Período: ${format(fromDate, "dd/MM/yyyy")} até ${format(toDate, "dd/MM/yyyy")}`,
        14,
        30,
      );
    }

    // Add filters if available
    let yPos = 40;
    if (selectedRegion) {
      doc.text(`Região: ${selectedRegion}`, 14, yPos);
      yPos += 10;
    }
    if (selectedMunicipality) {
      doc.text(`Município: ${selectedMunicipality}`, 14, yPos);
      yPos += 10;
    }
    if (selectedProducer) {
      doc.text(`Produtor: ${selectedProducer}`, 14, yPos);
      yPos += 10;
    }
    if (selectedColor) {
      doc.text(`Classificação por Cor: ${selectedColor}`, 14, yPos);
      yPos += 10;
    }

    // Add table
    autoTable(doc, {
      head: [headers],
      body: data,
      startY: yPos,
      theme: "grid",
      styles: { fontSize: 10 },
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    });

    // Adicionar informações sobre o total de registros
    const finalY = (doc as any).lastAutoTable.finalY || yPos;
    doc.setFontSize(10);

    if (reportType === "producers-list") {
      const filteredProducers = producers.filter(
        (producer) =>
          (!selectedMunicipality ||
            producer.municipality === selectedMunicipality) &&
          (!selectedRegion ||
            municipalities.find((m) => m.name === producer.municipality)
              ?.region === selectedRegion),
      );
      doc.text(
        `Total de produtores: ${filteredProducers.length}`,
        14,
        finalY + 10,
      );
    } else if (reportType === "entries-list") {
      doc.text(
        `Total de registros de entrada: ${filteredEntries.length}`,
        14,
        finalY + 10,
      );
    } else {
      doc.text(
        `Total de registros: ${filteredEntries.length}`,
        14,
        finalY + 10,
      );
    }

    // Save the PDF
    doc.save(
      `relatorio_${reportType}_${new Date().toISOString().split("T")[0]}.pdf`,
    );
  };

  const handleExportExcel = () => {
    let title, headers, data;

    if (reportType === "producers-list") {
      title = "Lista Completa de Produtores";
      headers = [
        "ID",
        "Nome",
        "Código COMAPI",
        "Município",
        "Comunidade",
        "Região",
      ];

      // Filtrar produtores conforme os filtros aplicados
      const filteredProducers = producers.filter(
        (producer) =>
          (!selectedMunicipality ||
            producer.municipality === selectedMunicipality) &&
          (!selectedRegion ||
            municipalities.find((m) => m.name === producer.municipality)
              ?.region === selectedRegion),
      );

      data = filteredProducers.map((producer) => [
        producer.id,
        producer.name,
        producer.cod_na_comapi,
        producer.municipality,
        producer.community,
        municipalities.find((m) => m.name === producer.municipality)?.region ||
          "",
      ]);
    } else if (reportType === "entries-list") {
      title = "Registro Completo de Entradas";
      headers = [
        "Data",
        "Produtor",
        "Município",
        "Comunidade",
        "Quantidade",
        "Peso Bruto (kg)",
        "Peso Líquido (kg)",
        "Valor Unitário (R$)",
        "Valor Total (R$)",
        "Classificação",
        "Umidade (%)",
        "Apiário",
        "Lote",
        "Contrato",
      ];

      data = filteredEntries.map((entry) => [
        format(new Date(entry.date), "dd/MM/yyyy"),
        entry.producerName,
        entry.municipality,
        entry.community,
        entry.quantity,
        entry.grossWeight.toFixed(2),
        entry.netWeight.toFixed(2),
        entry.unitValue.toFixed(2),
        entry.totalValue.toFixed(2),
        colors.find((c) => c.code === entry.colorCode)?.name || entry.colorCode,
        entry.humidity.toFixed(1),
        entry.apiary,
        entry.lot,
        entry.contract,
      ]);
    } else {
      // Usar a função existente para outros tipos de relatório
      const reportData = getReportData();
      title = reportData.title;
      headers = reportData.headers;
      data = reportData.data;
    }

    // Create worksheet for the main report
    const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);

    // Adicionar título como uma célula mesclada no topo
    XLSX.utils.sheet_add_aoa(ws, [[title]], { origin: "A1" });
    ws["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: headers.length - 1 } }];

    // Adicionar filtros aplicados
    let rowIndex = 2; // Começar após o título e cabeçalhos
    if (fromDate && toDate) {
      XLSX.utils.sheet_add_aoa(
        ws,
        [
          [
            `Período: ${format(fromDate, "dd/MM/yyyy")} até ${format(toDate, "dd/MM/yyyy")}`,
          ],
        ],
        { origin: `A${rowIndex}` },
      );
      rowIndex++;
    }

    if (selectedRegion) {
      XLSX.utils.sheet_add_aoa(ws, [[`Região: ${selectedRegion}`]], {
        origin: `A${rowIndex}`,
      });
      rowIndex++;
    }

    if (selectedMunicipality) {
      XLSX.utils.sheet_add_aoa(ws, [[`Município: ${selectedMunicipality}`]], {
        origin: `A${rowIndex}`,
      });
      rowIndex++;
    }

    if (selectedProducer) {
      XLSX.utils.sheet_add_aoa(ws, [[`Produtor: ${selectedProducer}`]], {
        origin: `A${rowIndex}`,
      });
      rowIndex++;
    }

    if (selectedColor) {
      XLSX.utils.sheet_add_aoa(
        ws,
        [[`Classificação por Cor: ${selectedColor}`]],
        { origin: `A${rowIndex}` },
      );
      rowIndex++;
    }

    // Ajustar a origem dos dados para começar após os filtros
    const dataRange = XLSX.utils.decode_range(ws["!ref"] || "A1");
    dataRange.s.r = rowIndex; // Atualizar a linha inicial
    ws["!ref"] = XLSX.utils.encode_range(dataRange);

    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Relatório");

    // Adicionar planilha com todos os produtores
    if (producers.length > 0) {
      const producerHeaders = [
        "ID",
        "Nome",
        "Código COMAPI",
        "Município",
        "Comunidade",
      ];
      const producerData = producers.map((p) => [
        p.id,
        p.name,
        p.cod_na_comapi,
        p.municipality,
        p.community,
      ]);

      const wsProducers = XLSX.utils.aoa_to_sheet([
        producerHeaders,
        ...producerData,
      ]);
      XLSX.utils.book_append_sheet(wb, wsProducers, "Produtores");
    }

    // Adicionar planilha com todas as entradas
    if (entries.length > 0) {
      const entryHeaders = [
        "Data",
        "Produtor",
        "Município",
        "Comunidade",
        "Quantidade",
        "Peso Bruto (kg)",
        "Peso Líquido (kg)",
        "Valor Unitário (R$)",
        "Valor Total (R$)",
        "Classificação",
        "Umidade (%)",
        "Apiário",
        "Lote",
        "Contrato",
      ];

      const entryData = entries.map((e) => [
        format(new Date(e.date), "dd/MM/yyyy"),
        e.producerName,
        e.municipality,
        e.community,
        e.quantity,
        e.grossWeight,
        e.netWeight,
        e.unitValue,
        e.totalValue,
        colors.find((c) => c.code === e.colorCode)?.name || e.colorCode,
        e.humidity,
        e.apiary,
        e.lot,
        e.contract,
        e.invoiceNumber,
        e.analysisDate ? format(new Date(e.analysisDate), "dd/MM/yyyy") : "",
      ]);

      const wsEntries = XLSX.utils.aoa_to_sheet([entryHeaders, ...entryData]);
      XLSX.utils.book_append_sheet(wb, wsEntries, "Entradas");
    }

    // Adicionar planilha com resumo por município
    type MunicipalitySummaryStats = {
      totalWeight: number;
      totalValue: number;
      producers: Set<string>;
    };

    const municipalitySummary: Record<string, MunicipalitySummaryStats> = {};
    filteredEntries.forEach((entry) => {
      if (!municipalitySummary[entry.municipality]) {
        municipalitySummary[entry.municipality] = {
          totalWeight: 0,
          totalValue: 0,
          producers: new Set(),
        };
      }
      municipalitySummary[entry.municipality].totalWeight += entry.netWeight;
      municipalitySummary[entry.municipality].totalValue += entry.totalValue;
      municipalitySummary[entry.municipality].producers.add(entry.producerId);
    });

    const municipalityHeaders = [
      "Município",
      "Região",
      "Produção Total (kg)",
      "Valor Total (R$)",
      "Nº de Produtores",
      "Média por Produtor (kg)",
    ];

    const municipalityData = Object.entries(municipalitySummary).map(
      ([municipality, stats]) => {
        const region =
          municipalities.find((m) => m.name === municipality)?.region || "";
        const avgPerProducer = stats.totalWeight / stats.producers.size;
        return [
          municipality,
          region,
          stats.totalWeight.toFixed(2),
          stats.totalValue.toFixed(2),
          stats.producers.size,
          avgPerProducer.toFixed(2),
        ];
      },
    );

    if (municipalityData.length > 0) {
      const wsMunicipalities = XLSX.utils.aoa_to_sheet([
        municipalityHeaders,
        ...municipalityData,
      ]);
      XLSX.utils.book_append_sheet(
        wb,
        wsMunicipalities,
        "Resumo por Município",
      );
    }

    // Adicionar planilha com resumo por cor
    type ColorSummaryStats = {
      totalWeight: number;
      totalValue: number;
      entries: number;
    };

    const colorSummary: Record<string, ColorSummaryStats> = {};
    filteredEntries.forEach((entry) => {
      const colorName =
        colors.find((c) => c.code === entry.colorCode)?.name || entry.colorCode;
      if (!colorSummary[colorName]) {
        colorSummary[colorName] = {
          totalWeight: 0,
          totalValue: 0,
          entries: 0,
        };
      }
      colorSummary[colorName].totalWeight += entry.netWeight;
      colorSummary[colorName].totalValue += entry.totalValue;
      colorSummary[colorName].entries += 1;
    });

    const totalWeight = Object.values(colorSummary).reduce(
      (sum, stats) => sum + stats.totalWeight,
      0,
    );

    const colorHeaders = [
      "Classificação por Cor",
      "Produção Total (kg)",
      "Percentual (%)",
      "Valor Total (R$)",
      "Valor Médio (R$/kg)",
      "Nº de Entradas",
    ];

    const colorData = Object.entries(colorSummary).map(([colorName, stats]) => {
      const percentage = (stats.totalWeight / totalWeight) * 100;
      const avgValue = stats.totalValue / stats.totalWeight;
      return [
        colorName,
        stats.totalWeight.toFixed(2),
        percentage.toFixed(2),
        stats.totalValue.toFixed(2),
        avgValue.toFixed(2),
        stats.entries,
      ];
    });

    if (colorData.length > 0) {
      const wsColors = XLSX.utils.aoa_to_sheet([colorHeaders, ...colorData]);
      XLSX.utils.book_append_sheet(wb, wsColors, "Resumo por Cor");
    }

    // Generate Excel file
    XLSX.writeFile(
      wb,
      `relatorio_completo_${reportType}_${new Date().toISOString().split("T")[0]}.xlsx`,
    );
  };

  const handlePrint = () => {
    window.print();
  };

  const resetFilters = () => {
    setFromDate(subMonths(new Date(), 3));
    setToDate(new Date());
    setSelectedMunicipality(undefined);
    setSelectedProducer(undefined);
    setSelectedColor(undefined);
    setSelectedRegion(undefined);
  };

  // Renderizar gráfico de barras
  const renderBarChart = () => {
    if (chartData.length === 0) {
      return (
        <div className="h-full w-full flex items-center justify-center">
          <p className="text-muted-foreground">
            Nenhum dado disponível para exibição
          </p>
        </div>
      );
    }

    if (reportType === "period") {
      return (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="name"
              angle={-45}
              textAnchor="end"
              height={70}
              tick={{ fontSize: 12 }}
            />
            <YAxis
              yAxisId="left"
              orientation="left"
              stroke="#8884d8"
              label={{
                value: "Produção (kg)",
                angle: -90,
                position: "insideLeft",
              }}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke="#82ca9d"
              label={{
                value: "Valor (R$)",
                angle: 90,
                position: "insideRight",
              }}
            />
            <Tooltip formatter={(value) => [`${value}`, ""]} />
            <Legend />
            <Bar
              yAxisId="left"
              dataKey="production"
              name="Produção (kg)"
              fill="#8884d8"
            />
            <Bar
              yAxisId="right"
              dataKey="value"
              name="Valor (R$)"
              fill="#82ca9d"
            />
          </BarChart>
        </ResponsiveContainer>
      );
    }

    if (reportType === "municipality") {
      return (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="name"
              angle={-45}
              textAnchor="end"
              height={70}
              tick={{ fontSize: 12 }}
            />
            <YAxis
              yAxisId="left"
              orientation="left"
              stroke="#8884d8"
              label={{
                value: "Produção (kg)",
                angle: -90,
                position: "insideLeft",
              }}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke="#82ca9d"
              label={{
                value: "Média por Produtor (kg)",
                angle: 90,
                position: "insideRight",
              }}
            />
            <Tooltip formatter={(value) => [`${value}`, ""]} />
            <Legend />
            <Bar
              yAxisId="left"
              dataKey="production"
              name="Produção Total (kg)"
              fill="#8884d8"
            />
            <Bar
              yAxisId="right"
              dataKey="average"
              name="Média por Produtor (kg)"
              fill="#82ca9d"
            />
          </BarChart>
        </ResponsiveContainer>
      );
    }

    if (reportType === "producer") {
      return (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="name"
              angle={-45}
              textAnchor="end"
              height={70}
              tick={{ fontSize: 12 }}
            />
            <YAxis
              yAxisId="left"
              orientation="left"
              stroke="#8884d8"
              label={{
                value: "Produção (kg)",
                angle: -90,
                position: "insideLeft",
              }}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke="#82ca9d"
              label={{
                value: "Valor (R$)",
                angle: 90,
                position: "insideRight",
              }}
            />
            <Tooltip formatter={(value) => [`${value}`, ""]} />
            <Legend />
            <Bar
              yAxisId="left"
              dataKey="production"
              name="Produção (kg)"
              fill="#8884d8"
            />
            <Bar
              yAxisId="right"
              dataKey="value"
              name="Valor (R$)"
              fill="#82ca9d"
            />
          </BarChart>
        </ResponsiveContainer>
      );
    }

    if (reportType === "color") {
      return (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="name"
              angle={-45}
              textAnchor="end"
              height={70}
              tick={{ fontSize: 12 }}
            />
            <YAxis
              yAxisId="left"
              orientation="left"
              stroke="#8884d8"
              label={{
                value: "Produção (kg)",
                angle: -90,
                position: "insideLeft",
              }}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke="#82ca9d"
              label={{
                value: "Percentual (%)",
                angle: 90,
                position: "insideRight",
              }}
            />
            <Tooltip formatter={(value) => [`${value}`, ""]} />
            <Legend />
            <Bar
              yAxisId="left"
              dataKey="value"
              name="Produção (kg)"
              fill="#8884d8"
            />
            <Bar
              yAxisId="right"
              dataKey="percentage"
              name="Percentual (%)"
              fill="#82ca9d"
            />
          </BarChart>
        </ResponsiveContainer>
      );
    }

    return null;
  };

  // Renderizar gráfico de linha
  const renderLineChart = () => {
    if (chartData.length === 0) {
      return (
        <div className="h-full w-full flex items-center justify-center">
          <p className="text-muted-foreground">
            Nenhum dado disponível para exibição
          </p>
        </div>
      );
    }

    if (reportType === "period") {
      return (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="name"
              angle={-45}
              textAnchor="end"
              height={70}
              tick={{ fontSize: 12 }}
            />
            <YAxis
              yAxisId="left"
              orientation="left"
              stroke="#8884d8"
              label={{
                value: "Produção (kg)",
                angle: -90,
                position: "insideLeft",
              }}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke="#82ca9d"
              label={{
                value: "Valor (R$)",
                angle: 90,
                position: "insideRight",
              }}
            />
            <Tooltip formatter={(value) => [`${value}`, ""]} />
            <Legend />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="production"
              name="Produção (kg)"
              stroke="#8884d8"
              activeDot={{ r: 8 }}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="value"
              name="Valor (R$)"
              stroke="#82ca9d"
            />
          </LineChart>
        </ResponsiveContainer>
      );
    }

    // Para outros tipos de relatório, o gráfico de linha pode não ser tão adequado
    // mas vamos implementar para consistência
    return renderBarChart();
  };

  // Renderizar gráfico de pizza
  const renderPieChart = () => {
    if (chartData.length === 0) {
      return (
        <div className="h-full w-full flex items-center justify-center">
          <p className="text-muted-foreground">
            Nenhum dado disponível para exibição
          </p>
        </div>
      );
    }

    // Gráfico de pizza é mais adequado para distribuição por cor
    if (reportType === "color") {
      const COLORS = chartData.map((item) => item.color || "#999999");

      return (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={true}
              outerRadius={130}
              fill="#8884d8"
              dataKey="value"
              nameKey="name"
              label={({ name, percent }) =>
                `${name}: ${(percent * 100).toFixed(1)}%`
              }
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip formatter={(value, name) => [`${value} kg`, name]} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      );
    }

    // Para outros tipos de relatório, adaptar os dados para um formato adequado para gráfico de pizza
    const pieData = chartData.map((item) => ({
      name: item.name,
      value:
        reportType === "period" || reportType === "producer"
          ? item.production
          : item.production || item.value,
    }));

    return (
      <ResponsiveContainer width="100%" height="100%">
        <PieChart margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
          <Pie
            data={pieData}
            cx="50%"
            cy="50%"
            labelLine={true}
            outerRadius={130}
            fill="#8884d8"
            dataKey="value"
            nameKey="name"
            label={({ name, percent }) =>
              `${name}: ${(percent * 100).toFixed(1)}%`
            }
          >
            {pieData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={`#${((index * 4321) % 0xffffff).toString(16).padStart(6, "0")}`}
              />
            ))}
          </Pie>
          <Tooltip formatter={(value) => [`${value} kg`, ""]} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    );
  };

  // Renderizar o gráfico selecionado
  const renderChart = () => {
    if (loading) {
      return (
        <div className="h-full w-full flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin mb-2" />
          <p className="ml-2">Carregando dados...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="h-full w-full flex items-center justify-center">
          <p className="text-destructive">Erro ao carregar dados: {error}</p>
        </div>
      );
    }

    switch (chartType) {
      case "bar":
        return renderBarChart();
      case "line":
        return renderLineChart();
      case "pie":
        return renderPieChart();
      default:
        return renderBarChart();
    }
  };

  useEffect(() => {
    // Reset pagination when report type changes
    setCurrentPage(1);
  }, [reportType]);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setSearchResults(producers);
      return;
    }
    // Filter producers based on search term
    const results = producers.filter(
      (producer) =>
        producer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        producer.municipality.toLowerCase().includes(searchTerm.toLowerCase()),
    );
    setSearchResults(results);
  }, [searchTerm, producers]);

  return (
    <div className={cn("bg-background rounded-lg", className)}>
      <Card className="w-full">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsFiltersOpen(!isFiltersOpen)}
              >
                {isFiltersOpen ? (
                  <>
                    <X className="h-4 w-4 mr-1" /> Ocultar Filtros
                  </>
                ) : (
                  <>
                    <Filter className="h-4 w-4 mr-1" /> Mostrar Filtros
                  </>
                )}
              </Button>
              <Button variant="outline" size="sm" onClick={resetFilters}>
                <RefreshCw className="h-4 w-4 mr-1" /> Limpar Filtros
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  refreshData();
                }}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />{" "}
                    Atualizando...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-1" /> Atualizar Dados
                  </>
                )}
              </Button>
            </div>
          </div>
          <Tabs
            value={reportType}
            onValueChange={setReportType}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-7 mb-6">
              <TabsTrigger value="period">Por Período</TabsTrigger>
              <TabsTrigger value="municipality">Por Município</TabsTrigger>
              <TabsTrigger value="community">Por Comunidade</TabsTrigger>
              <TabsTrigger value="producer">Por Produtor</TabsTrigger>
              <TabsTrigger value="color">Por Classificação</TabsTrigger>
              <TabsTrigger value="producers-list">
                Lista de Produtores
              </TabsTrigger>
              <TabsTrigger value="entries-list">
                Registro de Entradas
              </TabsTrigger>
            </TabsList>

            {isFiltersOpen && (
              <div className="mb-6 space-y-4 bg-muted/20 p-4 rounded-lg">
                <div className="flex flex-wrap gap-2 mb-4">
                  {dateRangePresets.map((preset) => (
                    <Button
                      key={preset.value}
                      variant="outline"
                      size="sm"
                      onClick={() => applyDateRangePreset(preset)}
                    >
                      {preset.label}
                    </Button>
                  ))}
                </div>

                <div className="flex flex-col md:flex-row gap-4">
                  {/* Date Range Selector */}
                  <div className="flex flex-col space-y-2 flex-1">
                    <label className="text-sm font-medium">Período</label>
                    <div className="flex gap-2">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !fromDate && "text-muted-foreground",
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {fromDate
                              ? format(fromDate, "dd/MM/yyyy")
                              : "Data inicial"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={fromDate}
                            onSelect={setFromDate}
                            initialFocus
                            locale={ptBR}
                          />
                        </PopoverContent>
                      </Popover>

                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !toDate && "text-muted-foreground",
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {toDate
                              ? format(toDate, "dd/MM/yyyy")
                              : "Data final"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={toDate}
                            onSelect={setToDate}
                            initialFocus
                            locale={ptBR}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>

                  {/* Region Selector */}
                  <div className="flex flex-col space-y-2 flex-1">
                    <label className="text-sm font-medium">Região</label>
                    <Select
                      value={selectedRegion}
                      onValueChange={setSelectedRegion}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma região" />
                      </SelectTrigger>
                      <SelectContent>
                        {regions.map((region) => (
                          <SelectItem key={region} value={region}>
                            {region}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Municipality Selector */}
                  <div className="flex flex-col space-y-2 flex-1">
                    <label className="text-sm font-medium">Município</label>
                    <Select
                      value={selectedMunicipality}
                      onValueChange={setSelectedMunicipality}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um município" />
                      </SelectTrigger>
                      <SelectContent>
                        {municipalities
                          .filter(
                            (m) =>
                              !selectedRegion || m.region === selectedRegion,
                          )
                          .map((municipality) => (
                            <SelectItem
                              key={municipality.id}
                              value={municipality.name}
                            >
                              {municipality.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Producer Selector */}
                  <div className="flex flex-col space-y-2 flex-1">
                    <label className="text-sm font-medium">Produtor</label>
                    <Select
                      value={selectedProducer}
                      onValueChange={setSelectedProducer}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um produtor" />
                      </SelectTrigger>
                      <SelectContent>
                        {producers.map((producer) => (
                          <SelectItem key={producer.id} value={producer.name}>
                            {producer.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Color Classification Selector */}
                  <div className="flex flex-col space-y-2 flex-1">
                    <label className="text-sm font-medium">
                      Classificação por Cor
                    </label>
                    <Select
                      value={selectedColor}
                      onValueChange={setSelectedColor}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma cor" />
                      </SelectTrigger>
                      <SelectContent>
                        {colors.map((color) => (
                          <SelectItem key={color.id} value={color.name}>
                            <div className="flex items-center gap-2">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: color.hexColor }}
                              />
                              {color.code} - {color.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mt-4">
                  {selectedRegion && (
                    <Badge
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      Região: {selectedRegion}
                      <X
                        className="h-3 w-3 ml-1 cursor-pointer"
                        onClick={() => setSelectedRegion(undefined)}
                      />
                    </Badge>
                  )}
                  {selectedMunicipality && (
                    <Badge
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      Município: {selectedMunicipality}
                      <X
                        className="h-3 w-3 ml-1 cursor-pointer"
                        onClick={() => setSelectedMunicipality(undefined)}
                      />
                    </Badge>
                  )}
                  {selectedProducer && (
                    <Badge
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      Produtor: {selectedProducer}
                      <X
                        className="h-3 w-3 ml-1 cursor-pointer"
                        onClick={() => setSelectedProducer(undefined)}
                      />
                    </Badge>
                  )}
                  {selectedColor && (
                    <Badge
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      Cor: {selectedColor}
                      <X
                        className="h-3 w-3 ml-1 cursor-pointer"
                        onClick={() => setSelectedColor(undefined)}
                      />
                    </Badge>
                  )}
                  {fromDate && toDate && (
                    <Badge
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      Período: {format(fromDate, "dd/MM/yyyy")} até{" "}
                      {format(toDate, "dd/MM/yyyy")}
                      <X
                        className="h-3 w-3 ml-1 cursor-pointer"
                        onClick={() => {
                          setFromDate(undefined);
                          setToDate(undefined);
                        }}
                      />
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {/* Chart Type Selector - Only show for comparative reports */}
            {reportType !== "producers-list" &&
              reportType !== "entries-list" && (
                <div className="flex justify-end gap-2 mb-4">
                  <Button
                    variant={chartType === "bar" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setChartType("bar")}
                  >
                    <BarChart3 className="h-4 w-4 mr-1" /> Barras
                  </Button>
                  <Button
                    variant={chartType === "line" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setChartType("line")}
                  >
                    <LineChartIcon className="h-4 w-4 mr-1" /> Linhas
                  </Button>
                  <Button
                    variant={chartType === "pie" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setChartType("pie")}
                  >
                    <PieChartIcon className="h-4 w-4 mr-1" /> Pizza
                  </Button>
                </div>
              )}

            {/* Only show charts for comparative reports */}
            {reportType !== "producers-list" &&
              reportType !== "entries-list" && (
                <div className="h-[400px] w-full bg-muted/10 rounded-lg border">
                  {renderChart()}
                </div>
              )}

            <Separator className="my-6" />

            <div className="overflow-x-auto">
              {reportType === "producers-list" ? (
                <>
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-muted/50">
                        <th className="p-2 text-left">ID</th>
                        <th className="p-2 text-left">Nome</th>
                        <th className="p-2 text-left">Código COMAPI</th>
                        <th className="p-2 text-left">Município</th>
                        <th className="p-2 text-left">Comunidade</th>
                        <th className="p-2 text-left">Região</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr>
                          <td colSpan={6} className="p-4 text-center">
                            <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                            <p>Carregando dados...</p>
                          </td>
                        </tr>
                      ) : producers.length > 0 ? (
                        producers
                          .filter(
                            (producer) =>
                              (!selectedMunicipality ||
                                producer.municipality ===
                                  selectedMunicipality) &&
                              (!selectedRegion ||
                                municipalities.find(
                                  (m) => m.name === producer.municipality,
                                )?.region === selectedRegion),
                          )
                          .slice(
                            (currentPage - 1) * itemsPerPage,
                            currentPage * itemsPerPage,
                          )
                          .map((producer, index) => (
                            <tr
                              key={index}
                              className="border-b hover:bg-muted/20"
                            >
                              <td className="p-2">{producer.id}</td>
                              <td className="p-2">{producer.name}</td>
                              <td className="p-2">{producer.cod_na_comapi}</td>
                              <td className="p-2">{producer.municipality}</td>
                              <td className="p-2">{producer.community}</td>
                              <td className="p-2">
                                {municipalities.find(
                                  (m) => m.name === producer.municipality,
                                )?.region || ""}
                              </td>
                            </tr>
                          ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="p-4 text-center">
                            Nenhum produtor encontrado para os filtros
                            selecionados.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                  <div className="flex justify-between items-center mt-4">
                    <div className="text-sm text-muted-foreground">
                      Mostrando{" "}
                      {Math.min(
                        (currentPage - 1) * itemsPerPage + 1,
                        producers.length,
                      )}{" "}
                      a {Math.min(currentPage * itemsPerPage, producers.length)}{" "}
                      de {producers.length} produtores
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setCurrentPage((prev) => Math.max(prev - 1, 1))
                        }
                        disabled={currentPage === 1}
                      >
                        Anterior
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((prev) => prev + 1)}
                        disabled={
                          currentPage * itemsPerPage >= producers.length
                        }
                      >
                        Próximo
                      </Button>
                    </div>
                  </div>
                </>
              ) : reportType === "entries-list" ? (
                <>
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-muted/50">
                        <th className="p-2 text-left">Data</th>
                        <th className="p-2 text-left">Produtor</th>
                        <th className="p-2 text-left">Município</th>
                        <th className="p-2 text-left">Comunidade</th>
                        <th className="p-2 text-left">Quantidade</th>
                        <th className="p-2 text-left">Peso Bruto (kg)</th>
                        <th className="p-2 text-left">Peso Líquido (kg)</th>
                        <th className="p-2 text-left">Valor Unitário (R$)</th>
                        <th className="p-2 text-left">Valor Total (R$)</th>
                        <th className="p-2 text-left">Classificação</th>
                        <th className="p-2 text-left">Umidade (%)</th>
                        <th className="p-2 text-left">Apiário</th>
                        <th className="p-2 text-left">Lote</th>
                        <th className="p-2 text-left">Nota Fiscal</th>
                        <th className="p-2 text-left">Data da Análise</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr>
                          <td colSpan={13} className="p-4 text-center">
                            <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                            <p>Carregando dados...</p>
                          </td>
                        </tr>
                      ) : filteredEntries.length > 0 ? (
                        filteredEntries
                          .slice(
                            (currentPage - 1) * itemsPerPage,
                            currentPage * itemsPerPage,
                          )
                          .map((entry, index) => (
                            <tr
                              key={index}
                              className="border-b hover:bg-muted/20"
                            >
                              <td className="p-2">
                                {format(new Date(entry.date), "dd/MM/yyyy")}
                              </td>
                              <td className="p-2">{entry.producerName}</td>
                              <td className="p-2">{entry.municipality}</td>
                              <td className="p-2">{entry.community}</td>
                              <td className="p-2">{entry.quantity}</td>
                              <td className="p-2">
                                {entry.grossWeight.toFixed(2)}
                              </td>
                              <td className="p-2">
                                {entry.netWeight.toFixed(2)}
                              </td>
                              <td className="p-2">
                                R$ {entry.unitValue.toFixed(2)}
                              </td>
                              <td className="p-2">
                                R$ {entry.totalValue.toFixed(2)}
                              </td>
                              <td className="p-2">
                                {colors.find(
                                  (c) =>
                                    String(c.code) === String(entry.colorCode),
                                )?.name || `Cor ${entry.colorCode}`}
                              </td>
                              <td className="p-2">
                                {entry.humidity.toFixed(1)}%
                              </td>
                              <td className="p-2">{entry.apiary}</td>
                              <td className="p-2">{entry.lot}</td>
                              <td className="p-2">{entry.invoiceNumber}</td>
                              <td className="p-2">
                                {entry.analysisDate
                                  ? format(
                                      new Date(entry.analysisDate),
                                      "dd/MM/yyyy",
                                    )
                                  : ""}
                              </td>
                            </tr>
                          ))
                      ) : (
                        <tr>
                          <td colSpan={13} className="p-4 text-center">
                            Nenhum registro de entrada encontrado para os
                            filtros selecionados.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                  <div className="flex justify-between items-center mt-4">
                    <div className="text-sm text-muted-foreground">
                      Mostrando{" "}
                      {Math.min(
                        (currentPage - 1) * itemsPerPage + 1,
                        filteredEntries.length,
                      )}{" "}
                      a{" "}
                      {Math.min(
                        currentPage * itemsPerPage,
                        filteredEntries.length,
                      )}{" "}
                      de {filteredEntries.length} registros
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setCurrentPage((prev) => Math.max(prev - 1, 1))
                        }
                        disabled={currentPage === 1}
                      >
                        Anterior
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((prev) => prev + 1)}
                        disabled={
                          currentPage * itemsPerPage >= filteredEntries.length
                        }
                      >
                        Próximo
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-muted/50">
                      {getReportData().headers.map((header, index) => (
                        <th key={index} className="p-2 text-left">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td
                          colSpan={getReportData().headers.length}
                          className="p-4 text-center"
                        >
                          <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                          <p>Carregando dados...</p>
                        </td>
                      </tr>
                    ) : getReportData().data.length > 0 ? (
                      getReportData().data.map((row, index) => (
                        <tr key={index} className="border-b hover:bg-muted/20">
                          {row.map((cell, cellIndex) => (
                            <td key={cellIndex} className="p-2">
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={getReportData().headers.length}
                          className="p-4 text-center"
                        >
                          Nenhum dado encontrado para os filtros selecionados.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div>
            <p className="text-sm text-muted-foreground">
              {reportType === "producers-list" ? (
                <>
                  Total de produtores:{" "}
                  {loading
                    ? "..."
                    : producers.filter(
                        (producer) =>
                          (!selectedMunicipality ||
                            producer.municipality === selectedMunicipality) &&
                          (!selectedRegion ||
                            municipalities.find(
                              (m) => m.name === producer.municipality,
                            )?.region === selectedRegion),
                      ).length}
                </>
              ) : reportType === "entries-list" ? (
                <>
                  Total de registros de entrada:{" "}
                  {loading ? "..." : filteredEntries.length}
                </>
              ) : (
                <>
                  Total de registros: {loading ? "..." : filteredEntries.length}
                </>
              )}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportPDF}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" /> Carregando
                </>
              ) : (
                <>
                  <FilePdf className="h-4 w-4 mr-1" /> PDF
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportExcel}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" /> Carregando
                </>
              ) : (
                <>
                  <FileSpreadsheet className="h-4 w-4 mr-1" /> Excel
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" /> Carregando
                </>
              ) : (
                <>
                  <Printer className="h-4 w-4 mr-1" /> Imprimir
                </>
              )}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ComparativeReport;
