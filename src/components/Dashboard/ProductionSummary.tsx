import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon, BarChart3, LineChart, PieChart } from "lucide-react";
import { format } from "date-fns";

interface ProductionSummaryProps {
    productionData?: {
        totalProduction: number;
        averagePerProducer: number;
        totalProducers: number;
        productionByMunicipality: Array<{
            municipality: string;
            production: number;
        }>;
        productionByColor: Array<{
            color: string;
            hexColor?: string; // Modificado por Manus para ser opcional
            percentage: number;
        }>;
        productionTrend: Array<{ month: string; production: number }>;
    };
}

const ProductionSummary: React.FC<ProductionSummaryProps> = ({
    productionData = {
        totalProduction: 12500,
        averagePerProducer: 125,
        totalProducers: 100,
        productionByMunicipality: [
            { municipality: "São Paulo", production: 3200 },
            { municipality: "Rio de Janeiro", production: 2800 },
            { municipality: "Belo Horizonte", production: 2100 },
            { municipality: "Salvador", production: 1900 },
            { municipality: "Recife", production: 1500 },
            { municipality: "Outros", production: 1000 },
        ],
        productionByColor: [
            { color: "Âmbar Claro", hexColor: "#FFBF00", percentage: 35 },
            { color: "Âmbar", hexColor: "#FFC107", percentage: 25 },
            { color: "Âmbar Escuro", hexColor: "#E69500", percentage: 20 },
            { color: "Extra Âmbar Claro", hexColor: "#FFD700", percentage: 15 },
            { color: "Branco Água", hexColor: "#F0F8FF", percentage: 5 },
        ],
        productionTrend: [
            { month: "Jan", production: 950 },
            { month: "Fev", production: 1050 },
            { month: "Mar", production: 1200 },
            { month: "Abr", production: 1100 },
            { month: "Mai", production: 1300 },
            { month: "Jun", production: 1250 },
            { month: "Jul", production: 1150 },
            { month: "Ago", production: 1050 },
            { month: "Set", production: 1100 },
            { month: "Out", production: 1050 },
            { month: "Nov", production: 1150 },
            { month: "Dez", production: 1150 },
        ],
    },
}) => {
    const [date, setDate] = React.useState<Date | undefined>(new Date());
    const [period, setPeriod] = React.useState("monthly");
    const [municipality, setMunicipality] = React.useState("all");
    const [colorFilter, setColorFilter] = React.useState("all");
    const [dateRange, setDateRange] = React.useState<{
        from: Date | undefined;
        to: Date | undefined;
    }>({
        from: new Date(new Date().setMonth(new Date().getMonth() - 3)),
        to: new Date(),
    });

    // Filter data based on selections
    const filteredData = React.useMemo(() => {
        // Aggregate productionByMunicipality to remove duplicates before filtering or direct use
        const aggregatedMunicipalities: Record<string, number> = {};
        productionData.productionByMunicipality.forEach(item => {
            const key = item.municipality.trim(); // Use trimmed municipality name as key
            if (aggregatedMunicipalities[key]) {
                aggregatedMunicipalities[key] += item.production;
            } else {
                aggregatedMunicipalities[key] = item.production;
            }
        });
        const uniqueProductionByMunicipality = Object.entries(aggregatedMunicipalities).map(
            ([mun, prod]) => ({ municipality: mun, production: prod })
        ).sort((a, b) => b.production - a.production);

        let filtered = {
            ...productionData,
            productionByMunicipality: uniqueProductionByMunicipality // Start with aggregated data
        };

        // Apply municipality filter if not 'all'
        if (municipality !== "all") {
            filtered = {
                ...filtered,
                productionByMunicipality:
                    uniqueProductionByMunicipality.filter( // Filter from aggregated data
                        (item) => item.municipality.toLowerCase() === municipality.toLowerCase(), // Ensure case-insensitive comparison
                    ),
            };
        }

        // Apply color filter if not 'all'
        if (colorFilter !== "all") {
            filtered = {
                ...filtered,
                productionByColor: productionData.productionByColor.filter(
                    (item) => item.color.toLowerCase() === colorFilter.toLowerCase(), // Ensure case-insensitive comparison
                ),
            };
        }

        return filtered;
    }, [productionData, municipality, colorFilter]);

    // Placeholder for chart rendering - in a real app, you would use a charting library like recharts
    const renderBarChart = () => {
        if (
            !filteredData.productionByMunicipality ||
            filteredData.productionByMunicipality.length === 0
        ) {
            return (
                <div className="h-[300px] w-full bg-background border rounded-md p-4 flex items-center justify-center">
                    <p className="text-muted-foreground">Nenhum dado disponível</p>
                </div>
            );
        }

        return (
            <div className="h-[300px] w-full bg-background border rounded-md p-4 flex items-end justify-between gap-2">
                {filteredData.productionByMunicipality.map((item, index) => {
                    const heightPercentage =
                        (item.production /
                            Math.max(
                                ...filteredData.productionByMunicipality.map(
                                    (i) => i.production,
                                ),
                            )) *
                        100;
                    return (
                        <div
                            key={index}
                            className="flex flex-col items-center justify-end h-full"
                        >
                            <div
                                className="w-12 bg-primary rounded-t-md"
                                style={{ height: `${heightPercentage}%` }}
                            />
                            <span className="text-xs mt-2 text-center">
                                {item.municipality}
                            </span>
                            <span className="text-xs font-medium">
                                {item.production.toFixed(2)} kg
                            </span>
                        </div>
                    );
                })}
            </div>
        );
    };

    const renderLineChart = () => {
        if (
            !filteredData.productionTrend ||
            filteredData.productionTrend.length === 0
        ) {
            return (
                <div className="h-[300px] w-full bg-background border rounded-md p-4 flex items-center justify-center">
                    <p className="text-muted-foreground">Nenhum dado disponível</p>
                </div>
            );
        }

        // Find the max value for scaling
        const maxProduction = Math.max(
            ...filteredData.productionTrend.map((item) => item.production),
        );

        return (
            <div className="h-[300px] w-full bg-background border rounded-md p-4 relative">
                <div className="absolute top-4 left-4">
                    <h3 className="text-sm font-medium">Tendência de Produção</h3>
                </div>
                <div className="h-full w-full flex items-end justify-between gap-1 pt-8">
                    {filteredData.productionTrend.map((item, index) => {
                        const heightPercentage = (item.production / maxProduction) * 80; // 80% of container height
                        return (
                            <div
                                key={index}
                                className="flex flex-col items-center justify-end h-full"
                            >
                                <div
                                    className="w-6 bg-blue-500 rounded-t-md"
                                    style={{ height: `${heightPercentage}%` }}
                                />
                                <span className="text-xs mt-2 rotate-45 origin-top-left">
                                    {item.month}
                                </span>
                                <span className="text-xs font-medium hidden md:block">
                                    {item.production.toFixed(0)}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    const renderPieChart = () => {
        if (
            !filteredData.productionByColor ||
            filteredData.productionByColor.length === 0
        ) {
            return (
                <div className="h-[300px] w-full bg-background border rounded-md p-4 flex items-center justify-center">
                    <p className="text-muted-foreground">Nenhum dado disponível</p>
                </div>
            );
        }

        // Calculate total for the pie chart
        const total = filteredData.productionByColor.reduce((sum: number, item) => sum + item.percentage, 0);
        let cumulativePercentage = 0;

        return (
            <div className="h-[300px] w-full bg-background border rounded-md p-4 relative">
                <div className="flex flex-col items-center justify-center h-full">
                    <div className="relative w-48 h-48 mb-4">
                        {/* Render actual pie chart segments */}
                        {filteredData.productionByColor.map((item, index) => {
                            const startAngle = (cumulativePercentage / total) * 360;
                            cumulativePercentage += item.percentage;
                            const endAngle = (cumulativePercentage / total) * 360;

                            return (
                                <div
                                    key={index}
                                    className="absolute inset-0 rounded-full overflow-hidden"
                                    style={{
                                        background: `conic-gradient(transparent ${startAngle}deg, ${item.hexColor || "#888888"} ${startAngle}deg ${endAngle}deg, transparent ${endAngle}deg)`,
                                        clipPath: "circle(50%)",
                                    }}
                                />
                            );
                        })}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="bg-background rounded-full w-24 h-24 flex items-center justify-center">
                                <span className="text-sm font-medium">
                                    Total: {typeof total === 'number' ? total.toFixed(1) : total}%
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 w-full max-w-md">
                        {filteredData.productionByColor.map((item, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <div
                                    className="w-4 h-4 rounded-full"
                                    style={{ backgroundColor: item.hexColor || "#888888" }}
                                />
                                <span className="text-sm">
                                    {item.color} ({item.percentage.toFixed(1)}%)
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="w-full bg-background p-6 rounded-lg">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <h2 className="text-2xl font-bold">Resumo de Produção</h2>

                <div className="flex flex-col sm:flex-row gap-4 flex-wrap">
                    <Select value={period} onValueChange={setPeriod}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Período" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="daily">Diário</SelectItem>
                            <SelectItem value="weekly">Semanal</SelectItem>
                            <SelectItem value="monthly">Mensal</SelectItem>
                            <SelectItem value="yearly">Anual</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={municipality} onValueChange={setMunicipality}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Município" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos</SelectItem>
                            {productionData.productionByMunicipality.map((item, index) => (
                                <SelectItem key={index} value={item.municipality.toLowerCase()}>
                                    {item.municipality}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={colorFilter} onValueChange={setColorFilter}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Classificação por Cor" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todas as cores</SelectItem>
                            {productionData.productionByColor.map((item, index) => (
                                <SelectItem key={index} value={item.color.toLowerCase()}>
                                    {item.color}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                className="w-[220px] justify-start text-left font-normal"
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {dateRange.from && dateRange.to ? (
                                    <>
                                        {format(dateRange.from, "dd/MM/yyyy")} -{" "}
                                        {format(dateRange.to, "dd/MM/yyyy")}
                                    </>
                                ) : (
                                    <span>Selecione um período</span>
                                )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <div className="flex flex-col space-y-2 p-2">
                                <div className="grid gap-2">
                                    <div className="grid gap-1">
                                        <label className="text-sm font-medium">De</label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    className="w-full justify-start text-left font-normal"
                                                >
                                                    {dateRange.from ? (
                                                        format(dateRange.from, "dd/MM/yyyy")
                                                    ) : (
                                                        <span>Selecione uma data</span>
                                                    )}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0">
                                                <Calendar
                                                    mode="single"
                                                    selected={dateRange.from}
                                                    onSelect={(date) =>
                                                        setDateRange((prev) => ({ ...prev, from: date }))
                                                    }
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                    <div className="grid gap-1">
                                        <label className="text-sm font-medium">Até</label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    className="w-full justify-start text-left font-normal"
                                                >
                                                    {dateRange.to ? (
                                                        format(dateRange.to, "dd/MM/yyyy")
                                                    ) : (
                                                        <span>Selecione uma data</span>
                                                    )}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0">
                                                <Calendar
                                                    mode="single"
                                                    selected={dateRange.to}
                                                    onSelect={(date) =>
                                                        setDateRange((prev) => ({ ...prev, to: date }))
                                                    }
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                </div>
                                <div className="flex justify-end">
                                    <Button
                                        size="sm"
                                        onClick={() => {
                                            setDateRange({
                                                from: new Date(
                                                    new Date().setMonth(new Date().getMonth() - 3),
                                                ),
                                                to: new Date(),
                                            });
                                        }}
                                    >
                                        Aplicar
                                    </Button>
                                </div>
                            </div>
                        </PopoverContent>
                    </Popover>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Produção Total
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {filteredData.totalProduction.toFixed(2)} kg
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Período selecionado
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Média por Produtor
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {typeof filteredData.averagePerProducer === "number"
                                ? filteredData.averagePerProducer.toFixed(2)
                                : "0.00"}{" "}
                            kg
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {filteredData.totalProducers} produtores ativos
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Classificação por Cor
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2">
                            {filteredData.productionByColor &&
                                filteredData.productionByColor.length > 0 && (
                                    <div
                                        className="w-4 h-4 rounded-full"
                                        style={{
                                            backgroundColor:
                                                filteredData.productionByColor[0] &&
                                                    filteredData.productionByColor[0]?.hexColor
                                                    ? filteredData.productionByColor[0]?.hexColor
                                                    : "#888888",
                                        }}
                                    />
                                )}
                            <div className="text-2xl font-bold">
                                {filteredData.productionByColor &&
                                    filteredData.productionByColor.length > 0
                                    ? filteredData.productionByColor[0].color
                                    : "Sem dados"}
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {filteredData.productionByColor &&
                                filteredData.productionByColor.length > 0
                                ? `Cor predominante (${filteredData.productionByColor[0].percentage.toFixed(1)}%)`
                                : "Nenhuma cor registrada"}
                        </p>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="municipality" className="w-full">
                <TabsList className="mb-4">
                    <TabsTrigger value="municipality" className="flex items-center">
                        <BarChart3 className="mr-2 h-4 w-4" />
                        Por Município
                    </TabsTrigger>
                    <TabsTrigger value="trend" className="flex items-center">
                        <LineChart className="mr-2 h-4 w-4" />
                        Tendência
                    </TabsTrigger>
                    <TabsTrigger value="color" className="flex items-center">
                        <PieChart className="mr-2 h-4 w-4" />
                        Por Cor
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="municipality">{renderBarChart()}</TabsContent>

                <TabsContent value="trend">{renderLineChart()}</TabsContent>

                <TabsContent value="color">{renderPieChart()}</TabsContent>
            </Tabs>
        </div>
    );
};

export default ProductionSummary;
