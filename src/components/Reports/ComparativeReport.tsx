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
    Search,
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
import { Input } from "@/components/ui/input";

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
    const [fromDate, setFromDate] = useState<Date | undefined>();
    const [toDate, setToDate] = useState<Date | undefined>();
    const [selectedMunicipality, setSelectedMunicipality] = useState<string>();
    const [selectedProducer, setSelectedProducer] = useState<string>();
    const [selectedColor, setSelectedColor] = useState<string>();
    const [selectedRegion, setSelectedRegion] = useState<string>();
    const [chartType, setChartType] = useState<string>("bar");
    const [isFiltersOpen, setIsFiltersOpen] = useState<boolean>(true);
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [searchResults, setSearchResults] = useState<any[]>([]);

    // Usar o hook para buscar os dados
    const { data: reportHookData, loading, error, refreshData } = useReportData(); // Renomeado para evitar conflito com a variável 'data' em getReportData
    const { producers, entries, municipalities, colors, productionSummary } =
        reportHookData;

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
                ? entry.producerName === selectedProducer // Isso filtra pelo nome do produtor que vem da entrada, pode ser usado para o filtro geral
                : true;

            // Filtrar por cor (agora usando o código diretamente)
            const colorMatch = selectedColor
                ? String(entry.colorCode).trim() === String(selectedColor).trim()
                : true;

            // Filtrar por termo de busca
            const searchMatch = searchTerm
                ? entry.producerName
                    ?.toLowerCase()
                    .includes(searchTerm.toLowerCase()) ||
                entry.municipality
                    ?.toLowerCase()
                    .includes(searchTerm.toLowerCase()) ||
                entry.community?.toLowerCase().includes(searchTerm.toLowerCase())
                : true;

            return (
                dateInRange &&
                municipalityMatch &&
                regionMatch &&
                producerMatch &&
                colorMatch &&
                searchMatch
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
        searchTerm,
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
            // Agrupar por ID do produtor para o gráfico, usando o nome canônico
            const entriesByProducerIdForChart: Record<
                string, // producerId
                {
                    name: string; // Nome canônico do produtor
                    production: number;
                    value: number;
                    municipality: string; // Município canônico do produtor ou da primeira entrada
                    entries: number;
                }
            > = {};

            filteredEntries.forEach((entry) => {
                const producerId = String(entry.producerId);
                const producerDetails = producers.find(p => String(p.id) === producerId);
                const producerName = producerDetails?.name || entry.producerName || "Desconhecido";
                const producerMunicipality = producerDetails?.municipality || entry.municipality || "N/A";

                if (!entriesByProducerIdForChart[producerId]) {
                    entriesByProducerIdForChart[producerId] = {
                        name: producerName,
                        production: 0,
                        value: 0,
                        municipality: producerMunicipality,
                        entries: 0,
                    };
                }
                entriesByProducerIdForChart[producerId].production += entry.netWeight || 0;
                entriesByProducerIdForChart[producerId].value += entry.totalValue || 0;
                entriesByProducerIdForChart[producerId].entries += 1;
                // Atualiza o município se encontrar um mais específico do produtor
                if (entriesByProducerIdForChart[producerId].municipality === "N/A" && producerMunicipality !== "N/A") {
                    entriesByProducerIdForChart[producerId].municipality = producerMunicipality;
                }
            });

            const result = Object.values(entriesByProducerIdForChart) // Usar Object.values para pegar os objetos agregados
                .map((data) => ({
                    name: data.name, // Este é o nome que será usado no gráfico
                    production: parseFloat(data.production.toFixed(2)),
                    value: parseFloat(data.value.toFixed(2)),
                    municipality: data.municipality,
                    entries: data.entries,
                }))
                .sort((a, b) => b.production - a.production);
            return result;
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
                    totalProduction > 0 ? (entriesByColor[color].production / totalProduction) * 100 : 0;
            });

            return Object.entries(entriesByColor).map(([color, data]) => ({
                name: color,
                value: parseFloat(data.production.toFixed(2)),
                percentage: parseFloat(data.percentage.toFixed(2)),
                color: colors.find((c) => c.name === color)?.hexColor || "#999999",
            }));
        }

        return [];
    }, [filteredEntries, reportType, colors, producers]); // Adicionado producers à dependência

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

    // Helper function to get report data based on current tab
    const getReportData = useCallback(() => {
        let title = "";
        let headers: string[] = [];
        let tableData: any[][] = []; // Renomeado para evitar conflito com reportHookData

        if (reportType === "period") {
            title = "Relatório de Produção por Período";
            headers = [
                "Período",
                "Quantidade (kg)",
                "Valor Total (R$)",
                "Média por Produtor",
            ];

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

            tableData = Object.entries(entriesByMonth).map(([monthYear, stats]) => {
                const avgPerProducer = stats.producerCount.size > 0 ? stats.totalWeight / stats.producerCount.size : 0;
                return [
                    monthYear,
                    stats.totalWeight.toFixed(2),
                    `R$ ${stats.totalValue.toFixed(2)}`,
                    `${avgPerProducer.toFixed(1)} kg`,
                ];
            });
        } else if (reportType === "municipality") {
            title = "Relatório de Produção por Município";
            headers = [
                "Município",
                "Quantidade (kg)",
                "Nº de Produtores",
                "Média por Produtor (kg)",
            ];
            const entriesByMunicipality = filteredEntries.reduce<
                Record<string, MunicipalityStats>
            >((acc, entry) => {
                if (!entry.municipality) return acc;
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

            tableData = Object.entries(entriesByMunicipality).map(
                ([municipality, stats]) => {
                    const avgPerProducer = stats.producerCount.size > 0 ? stats.totalWeight / stats.producerCount.size : 0;
                    return [
                        municipality,
                        stats.totalWeight.toFixed(2),
                        stats.producerCount.size,
                        avgPerProducer.toFixed(2),
                    ];
                },
            );
        } else if (reportType === "community") { // Adicionado por Manus
            title = "Relatório de Produção por Comunidade";
            headers = [
                "Comunidade",
                "Quantidade (kg)",
                "Nº de Produtores",
                "Média por Produtor (kg)",
            ];

            type CommunityStats = {
                totalWeight: number;
                producerCount: Set<string>;
            };

            const entriesByCommunity = filteredEntries.reduce<
                Record<string, CommunityStats>
            >((acc, entry) => {
                if (!entry.community) return acc; // Pular entradas sem comunidade
                if (!acc[entry.community]) {
                    acc[entry.community] = {
                        totalWeight: 0,
                        producerCount: new Set(),
                    };
                }
                acc[entry.community].totalWeight += entry.netWeight || 0;
                acc[entry.community].producerCount.add(entry.producerId);
                return acc;
            }, {});

            tableData = Object.entries(entriesByCommunity)
                .map(([communityName, stats]) => {
                    const avgPerProducer = stats.producerCount.size > 0 ? stats.totalWeight / stats.producerCount.size : 0;
                    return [
                        communityName,
                        stats.totalWeight.toFixed(2),
                        stats.producerCount.size,
                        avgPerProducer.toFixed(2),
                    ];
                })
                .sort((aRow, bRow) => {
                    const weightA = parseFloat(aRow[1] as string); // Coluna "Quantidade (kg)"
                    const weightB = parseFloat(bRow[1] as string); // Coluna "Quantidade (kg)"
                    return weightB - weightA; // Ordenar por Quantidade (kg) decrescente
                });
        } else if (reportType === "producer") {
            title = "Relatório de Produção por Produtor";
            headers = [
                "Produtor",
                "Município",
                "Quantidade (kg)",
                "Valor Total (R$)",
                "Valor Médio (R$/kg)",
            ];

            type ProducerReportStats = {
                municipality: string;
                totalWeight: number;
                totalValue: number;
                entryCount: number;
            };

            const entriesByProducerId = filteredEntries.reduce<
                Record<string, ProducerReportStats>
            >((acc, entry) => {
                const producerId = String(entry.producerId);
                if (!acc[producerId]) {
                    acc[producerId] = {
                        municipality: entry.municipality || "N/A",
                        totalWeight: 0,
                        totalValue: 0,
                        entryCount: 0,
                    };
                }
                acc[producerId].totalWeight += entry.netWeight || 0;
                acc[producerId].totalValue += entry.totalValue || 0;
                acc[producerId].entryCount += 1;
                if (acc[producerId].municipality === "N/A" && entry.municipality && entry.municipality.trim() !== "") {
                    acc[producerId].municipality = entry.municipality;
                }
                return acc;
            }, {});

            tableData = Object.entries(entriesByProducerId).map(
                ([producerId, stats]) => {
                    const producerDetails = producers.find(p => String(p.id) === producerId);
                    const producerNameForTable = producerDetails?.name?.trim() || "Desconhecido";
                    const municipalityForTable = producerDetails?.municipality?.trim() || stats.municipality;
                    const avgValue = stats.totalWeight > 0 ? (stats.totalValue / stats.totalValue) : 0; // CORREÇÃO AQUI: stats.totalValue / stats.totalWeight
                    return [
                        producerNameForTable,
                        municipalityForTable,
                        stats.totalWeight.toFixed(2),
                        `R$ ${stats.totalValue.toFixed(2)}`,
                        `R$ ${avgValue.toFixed(2)}`,
                    ];
                }
            )
            .sort((aRow, bRow) => {
                const weightA = parseFloat(aRow[2] as string);
                const weightB = parseFloat(bRow[2] as string);
                return weightB - weightA;
            });

        } else if (reportType === "color") {
            title = "Relatório de Produção por Cor";
            headers = ["Cor", "Quantidade (kg)", "Percentual (%)"];
            const entriesByColor: Record<string, { production: number; percentage: number; hexColor: string }> = {};
            const totalProduction = filteredEntries.reduce((sum, entry) => sum + entry.netWeight, 0);

            filteredEntries.forEach((entry) => {
                const colorInfo = colors.find((c) => String(c.code) === String(entry.colorCode));
                const colorName = colorInfo?.name || `Cor ${entry.colorCode}`;
                const hexColor = colorInfo?.hexColor || "#999999";

                if (!entriesByColor[colorName]) {
                    entriesByColor[colorName] = { production: 0, percentage: 0, hexColor };
                }
                entriesByColor[colorName].production += entry.netWeight;
            });

            tableData = Object.entries(entriesByColor).map(([colorName, stats]) => {
                const percentage = totalProduction > 0 ? (stats.production / totalProduction) * 100 : 0;
                return [
                    colorName,
                    stats.production.toFixed(2),
                    `${percentage.toFixed(2)}%`,
                ];
            });
        }

        return { title, headers, data: tableData }; // Retornar tableData
    }, [reportType, filteredEntries, producers, colors, municipalities]); // Adicionado producers, colors, municipalities às dependências

    // Paginação
    const paginatedData = useMemo(() => {
        const { data: reportContent } = getReportData(); // Usar a variável correta
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return reportContent.slice(startIndex, endIndex);
    }, [getReportData, currentPage, itemsPerPage]);

    const totalPages = useMemo(() => {
        const { data: reportContent } = getReportData(); // Usar a variável correta
        return Math.ceil(reportContent.length / itemsPerPage);
    }, [getReportData, itemsPerPage]);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleItemsPerPageChange = (value: string) => {
        setItemsPerPage(Number(value));
        setCurrentPage(1); // Reset to first page
    };

    // Exportar para Excel
    const exportToExcel = () => {
        const { title, headers, data: reportContent } = getReportData(); // Usar a variável correta
        const ws = XLSX.utils.aoa_to_sheet([headers, ...reportContent]);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, title.substring(0, 30)); // Sheet name limit
        XLSX.writeFile(wb, `${title.replace(/\s+/g, "_")}.xlsx`);
    };

    // Exportar para PDF
    const exportToPdf = () => {
        const { title, headers, data: reportContent } = getReportData(); // Usar a variável correta
        const doc = new jsPDF();
        doc.text(title, 14, 16);
        autoTable(doc, {
            head: [headers],
            body: reportContent,
            startY: 20,
        });
        doc.save(`${title.replace(/\s+/g, "_")}.pdf`);
    };

    // Custom Tooltip para gráficos
    const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-background border p-2 rounded shadow-lg">
                    <p className="label font-semibold">{`${label}`}</p>
                    {payload.map((pld, index) => (
                        <p key={index} style={{ color: pld.color }}>
                            {`${pld.name}: ${pld.value?.toLocaleString("pt-BR", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                            })}`}
                            {reportType === "period" && pld.name === "production" && " kg"}
                            {reportType === "period" && pld.name === "value" && " R$"}
                            {reportType === "municipality" && pld.name === "production" && " kg"}
                            {reportType === "municipality" && pld.name === "producerCount" && " produtores"}
                            {reportType === "municipality" && pld.name === "average" && " kg/produtor"}
                            {reportType === "community" && pld.name === "production" && " kg"}
                            {reportType === "community" && pld.name === "producerCount" && " produtores"}
                            {reportType === "community" && pld.name === "average" && " kg/produtor"}
                            {reportType === "producer" && pld.name === "production" && " kg"}
                            {reportType === "producer" && pld.name === "value" && " R$"}
                            {reportType === "color" && pld.name === "value" && " kg"}
                            {reportType === "color" && pld.name === "percentage" && " %"}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    // Limpar filtros
    const clearFilters = () => {
        setFromDate(undefined); // Modificado por Manus
        setToDate(undefined); // Modificado por Manus
        setSelectedMunicipality(undefined);
        setSelectedProducer(undefined);
        setSelectedColor(undefined);
        setSelectedRegion(undefined);
        setSearchTerm("");
    };

    // Efeito para buscar resultados ao digitar
    useEffect(() => {
        if (searchTerm.length > 2) {
            const results = filteredEntries.filter(
                (entry) =>
                    entry.producerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    entry.municipality?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    entry.community?.toLowerCase().includes(searchTerm.toLowerCase()),
            );
            setSearchResults(results.slice(0, 5)); // Limitar a 5 resultados
        } else {
            setSearchResults([]);
        }
    }, [searchTerm, filteredEntries]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="ml-4 text-lg">Carregando dados do relatório...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-screen text-red-600">
                <X className="h-12 w-12 mb-4" />
                <p className="text-lg">Erro ao carregar dados: {error}</p>
                <Button onClick={refreshData} className="mt-4">
                    <RefreshCw className="mr-2 h-4 w-4" /> Tentar Novamente
                </Button>
            </div>
        );
    }

    const { data: currentReportData, headers: currentReportHeaders, title: currentReportTitle } = getReportData();

    return (
        <Card className={cn("w-full mx-auto shadow-xl", className)}>
            <CardHeader className="bg-muted/50">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <CardTitle className="text-2xl font-bold text-primary">
                        Relatórios Comparativos
                    </CardTitle>
                    <div className="flex items-center space-x-2">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setIsFiltersOpen(!isFiltersOpen)}
                            title={isFiltersOpen ? "Fechar Filtros" : "Abrir Filtros"}
                        >
                            <Filter className="h-5 w-5" />
                        </Button>
                        <Button variant="outline" size="icon" onClick={refreshData} title="Atualizar Dados">
                            <RefreshCw className="h-5 w-5" />
                        </Button>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" size="icon" title="Exportar">
                                    <Download className="h-5 w-5" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-2">
                                <div className="flex flex-col space-y-1">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={exportToExcel}
                                        className="justify-start"
                                    >
                                        <FileSpreadsheet className="mr-2 h-4 w-4" />
                                        Excel (.xlsx)
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={exportToPdf}
                                        className="justify-start"
                                    >
                                        <FilePdf className="mr-2 h-4 w-4" />
                                        PDF (.pdf)
                                    </Button>
                                </div>
                            </PopoverContent>
                        </Popover>
                        <Button variant="outline" size="icon" onClick={() => window.print()} title="Imprimir">
                            <Printer className="h-5 w-5" />
                        </Button>
                    </div>
                </div>
                {isFiltersOpen && (
                    <CardDescription className="mt-4 pt-4 border-t">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 items-end">
                            {/* Filtro de Data Inicial */}
                            <div className="space-y-1">
                                <label htmlFor="fromDate" className="text-sm font-medium">
                                    Data Inicial
                                </label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            id="fromDate"
                                            variant={"outline"}
                                            className={cn(
                                                "w-full justify-start text-left font-normal",
                                                !fromDate && "text-muted-foreground",
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {fromDate ? (
                                                format(fromDate, "PPP", { locale: ptBR })
                                            ) : (
                                                <span>Escolha uma data</span>
                                            )}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar
                                            mode="single"
                                            selected={fromDate}
                                            onSelect={setFromDate}
                                            initialFocus
                                            locale={ptBR}
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>

                            {/* Filtro de Data Final */}
                            <div className="space-y-1">
                                <label htmlFor="toDate" className="text-sm font-medium">
                                    Data Final
                                </label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            id="toDate"
                                            variant={"outline"}
                                            className={cn(
                                                "w-full justify-start text-left font-normal",
                                                !toDate && "text-muted-foreground",
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {toDate ? (
                                                format(toDate, "PPP", { locale: ptBR })
                                            ) : (
                                                <span>Escolha uma data</span>
                                            )}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
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

                            {/* Presets de Data */}
                            <div className="space-y-1">
                                <label htmlFor="datePreset" className="text-sm font-medium">
                                    Período Rápido
                                </label>
                                <Select
                                    onValueChange={(value) => {
                                        const preset = dateRangePresets.find(
                                            (p) => p.value === value,
                                        );
                                        if (preset) applyDateRangePreset(preset);
                                    }}
                                >
                                    <SelectTrigger id="datePreset">
                                        <SelectValue placeholder="Selecione um período" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {dateRangePresets.map((preset) => (
                                            <SelectItem key={preset.value} value={preset.value}>
                                                {preset.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Filtro de Município */}
                            <div className="space-y-1">
                                <label
                                    htmlFor="municipalityFilter"
                                    className="text-sm font-medium"
                                >
                                    Município
                                </label>
                                <Select
                                    value={selectedMunicipality}
                                    onValueChange={setSelectedMunicipality}
                                >
                                    <SelectTrigger id="municipalityFilter">
                                        <SelectValue placeholder="Todos os municípios" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Todos</SelectItem>
                                        {municipalities.map((m) => (
                                            <SelectItem key={m.id} value={m.name!}>
                                                {m.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Filtro de Região */}
                            {regions.length > 0 && (
                                <div className="space-y-1">
                                    <label htmlFor="regionFilter" className="text-sm font-medium">
                                        Região
                                    </label>
                                    <Select
                                        value={selectedRegion}
                                        onValueChange={setSelectedRegion}
                                    >
                                        <SelectTrigger id="regionFilter">
                                            <SelectValue placeholder="Todas as regiões" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Todas</SelectItem>
                                            {regions.map((region) => (
                                                <SelectItem key={region} value={region}>
                                                    {region}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            {/* Filtro de Produtor */}
                            <div className="space-y-1">
                                <label
                                    htmlFor="producerFilter"
                                    className="text-sm font-medium"
                                >
                                    Produtor
                                </label>
                                <Select
                                    value={selectedProducer}
                                    onValueChange={setSelectedProducer}
                                >
                                    <SelectTrigger id="producerFilter">
                                        <SelectValue placeholder="Todos os produtores" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Todos</SelectItem>
                                        {producers.map((p) => (
                                            <SelectItem key={p.id} value={p.name!}>
                                                {p.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Filtro de Cor */}
                            <div className="space-y-1">
                                <label htmlFor="colorFilter" className="text-sm font-medium">
                                    Cor
                                </label>
                                <Select value={selectedColor} onValueChange={setSelectedColor}>
                                    <SelectTrigger id="colorFilter">
                                        <SelectValue placeholder="Todas as cores" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Todas</SelectItem>
                                        {colors.map((c) => (
                                            <SelectItem key={c.id} value={String(c.code!)}>
                                                {c.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Botão Limpar Filtros */}
                            <div className="flex items-end h-full">
                                <Button
                                    variant="ghost"
                                    onClick={clearFilters}
                                    className="w-full text-destructive hover:text-destructive-foreground hover:bg-destructive/90"
                                >
                                    <X className="mr-2 h-4 w-4" /> Limpar Filtros
                                </Button>
                            </div>
                        </div>
                    </CardDescription>
                )}
            </CardHeader>
            <CardContent className="p-6">
                <Tabs value={reportType} onValueChange={setReportType} className="w-full">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                        <TabsList>
                            <TabsTrigger value="period">Por Período</TabsTrigger>
                            <TabsTrigger value="municipality">Por Município</TabsTrigger>
                            <TabsTrigger value="community">Por Comunidade</TabsTrigger>
                            <TabsTrigger value="producer">Por Produtor</TabsTrigger>
                            <TabsTrigger value="color">Por Cor</TabsTrigger>
                        </TabsList>
                        <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium">Tipo de Gráfico:</span>
                            <Select value={chartType} onValueChange={setChartType}>
                                <SelectTrigger className="w-[150px]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="bar">
                                        <BarChart3 className="inline mr-2 h-4 w-4" /> Barras
                                    </SelectItem>
                                    <SelectItem value="line">
                                        <LineChartIcon className="inline mr-2 h-4 w-4" /> Linhas
                                    </SelectItem>
                                    {reportType === "color" && (
                                        <SelectItem value="pie">
                                            <PieChartIcon className="inline mr-2 h-4 w-4" /> Pizza
                                        </SelectItem>
                                    )}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <Separator className="my-6" />

                    <h3 className="text-xl font-semibold mb-4 text-center">
                        {currentReportTitle}
                    </h3>

                    {chartData && chartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={400} className="mb-8">
                            {chartType === "bar" ? (
                                <BarChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" angle={-30} textAnchor="end" height={70} interval={0} />
                                    <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                                    { (reportType === "period" || reportType === "producer") && 
                                        <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                                    }
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend />
                                    <Bar yAxisId="left" dataKey="production" fill="#8884d8" name="Produção (kg)" />
                                    {reportType === "period" && <Bar yAxisId="right" dataKey="value" fill="#82ca9d" name="Valor (R$)" />}
                                    {reportType === "municipality" && <Bar yAxisId="left" dataKey="producerCount" fill="#ffc658" name="Nº Produtores" />}
                                    {reportType === "municipality" && <Bar yAxisId="left" dataKey="average" fill="#ff7300" name="Média/Produtor (kg)" />}
                                    {reportType === "community" && <Bar yAxisId="left" dataKey="producerCount" fill="#ffc658" name="Nº Produtores" />}
                                    {reportType === "community" && <Bar yAxisId="left" dataKey="average" fill="#ff7300" name="Média/Produtor (kg)" />}
                                    {reportType === "producer" && <Bar yAxisId="right" dataKey="value" fill="#82ca9d" name="Valor (R$)" />}
                                    {reportType === "color" && <Bar yAxisId="left" dataKey="value" fill="#8884d8" name="Produção (kg)" />}
                                </BarChart>
                            ) : chartType === "line" ? (
                                <LineChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" angle={-30} textAnchor="end" height={70} interval={0} />
                                    <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                                    { (reportType === "period" || reportType === "producer") && 
                                        <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                                    }
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend />
                                    <Line yAxisId="left" type="monotone" dataKey="production" stroke="#8884d8" name="Produção (kg)" activeDot={{ r: 8 }} />
                                    {reportType === "period" && <Line yAxisId="right" type="monotone" dataKey="value" stroke="#82ca9d" name="Valor (R$)" />}
                                    {reportType === "municipality" && <Line yAxisId="left" type="monotone" dataKey="producerCount" stroke="#ffc658" name="Nº Produtores" />}
                                    {reportType === "municipality" && <Line yAxisId="left" type="monotone" dataKey="average" stroke="#ff7300" name="Média/Produtor (kg)" />}
                                    {reportType === "community" && <Line yAxisId="left" type="monotone" dataKey="producerCount" stroke="#ffc658" name="Nº Produtores" />}
                                    {reportType === "community" && <Line yAxisId="left" type="monotone" dataKey="average" stroke="#ff7300" name="Média/Produtor (kg)" />}
                                    {reportType === "producer" && <Line yAxisId="right" type="monotone" dataKey="value" stroke="#82ca9d" name="Valor (R$)" />}
                                    {reportType === "color" && <Line yAxisId="left" type="monotone" dataKey="value" stroke="#8884d8" name="Produção (kg)" />}
                                </LineChart>
                            ) : (
                                <PieChart>
                                    <Pie
                                        data={chartData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percentage }) => `${name} (${percentage.toFixed(1)}%)`}
                                        outerRadius={120}
                                        fill="#8884d8"
                                        dataKey="value"
                                        nameKey="name"
                                    >
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color || "#8884d8"} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend />
                                </PieChart>
                            )}
                        </ResponsiveContainer>
                    ) : (
                        <div className="text-center py-10 text-muted-foreground">
                            <BarChart3 className="mx-auto h-12 w-12 mb-4 opacity-50" />
                            <p>Nenhum dado disponível para os filtros selecionados.</p>
                        </div>
                    )}

                    {currentReportData.length > 0 && (
                        <>
                            <h4 className="text-lg font-semibold mb-3 mt-8">Dados da Tabela</h4>
                            <div className="overflow-x-auto rounded-md border">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            {currentReportHeaders.map((header) => (
                                                <th
                                                    key={header}
                                                    scope="col"
                                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                                >
                                                    {header}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {paginatedData.map((row, rowIndex) => (
                                            <tr key={rowIndex} className={rowIndex % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                                                {row.map((cell: any, cellIndex: number) => (
                                                    <td
                                                        key={cellIndex}
                                                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-700"
                                                    >
                                                        {cell}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            {/* Paginação */}
                            {totalPages > 1 && (
                                <div className="flex justify-between items-center mt-6">
                                    <div className="flex items-center space-x-2">
                                        <span className="text-sm text-muted-foreground">
                                            Itens por página:
                                        </span>
                                        <Select
                                            value={String(itemsPerPage)}
                                            onValueChange={handleItemsPerPageChange}
                                        >
                                            <SelectTrigger className="w-[70px]">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {[10, 20, 50, 100].map((size) => (
                                                    <SelectItem key={size} value={String(size)}>
                                                        {size}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handlePageChange(currentPage - 1)}
                                            disabled={currentPage === 1}
                                        >
                                            Anterior
                                        </Button>
                                        <span className="text-sm">
                                            Página {currentPage} de {totalPages}
                                        </span>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handlePageChange(currentPage + 1)}
                                            disabled={currentPage === totalPages}
                                        >
                                            Próxima
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </Tabs>
            </CardContent>
            <CardFooter className="border-t pt-6">
                <p className="text-xs text-muted-foreground">
                    Relatório gerado em: {format(new Date(), "dd/MM/yyyy HH:mm:ss", { locale: ptBR })}
                </p>
            </CardFooter>
        </Card>
    );
};

export default ComparativeReport;

