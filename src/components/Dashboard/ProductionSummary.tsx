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
        productionByColor: Array<{ color: string; percentage: number }>;
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
            { color: "Âmbar Claro", percentage: 35 },
            { color: "Âmbar", percentage: 25 },
            { color: "Âmbar Escuro", percentage: 20 },
            { color: "Extra Âmbar Claro", percentage: 15 },
            { color: "Branco Água", percentage: 5 },
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

    // Placeholder for chart rendering - in a real app, you would use a charting library like recharts
    const renderBarChart = () => {
        if (
            !productionData.productionByMunicipality ||
            productionData.productionByMunicipality.length === 0
        ) {
            return (
                <div className="h-[300px] w-full bg-background border rounded-md p-4 flex items-center justify-center">
                    <p className="text-muted-foreground">Nenhum dado disponível</p>
                </div>
            );
        }

        return (
            <div className="h-[300px] w-full bg-background border rounded-md p-4 flex items-end justify-between gap-2">
                {productionData.productionByMunicipality.map((item, index) => {
                    const heightPercentage =
                        (item.production /
                            Math.max(
                                ...productionData.productionByMunicipality.map(
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
                            <span className="text-xs font-medium">{item.production} kg</span>
                        </div>
                    );
                })}
            </div>
        );
    };

    const renderLineChart = () => {
        return (
            <div className="h-[300px] w-full bg-background border rounded-md p-4 relative">
                <div className="absolute inset-0 flex items-center justify-center">
                    <LineChart className="h-32 w-32 text-muted-foreground" />
                    <span className="absolute text-sm text-muted-foreground">
                        Gráfico de tendência de produção
                    </span>
                </div>
            </div>
        );
    };

    const renderPieChart = () => {
        return (
            <div className="h-[300px] w-full bg-background border rounded-md p-4 relative">
                <div className="absolute inset-0 flex items-center justify-center">
                    <PieChart className="h-32 w-32 text-muted-foreground" />
                    <span className="absolute text-sm text-muted-foreground">
                        Gráfico de classificação por cor
                    </span>
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
                            {productionData.totalProduction} kg
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
                            {productionData.averagePerProducer} kg
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {productionData.totalProducers} produtores ativos
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
                        <div className="text-2xl font-bold">
                            {productionData.productionByColor[0].color}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Cor predominante ({productionData.productionByColor[0].percentage}
                            %)
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
