import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import {
  CalendarIcon,
  BarChart3,
  Users,
  Package,
  FileText,
  Home,
  Settings,
  Database,
} from "lucide-react";
import ProductionSummary from "./Dashboard/ProductionSummary";
import EntryForm from "./EntryControl/EntryForm";
import ProducerForm from "./Producers/ProducerForm";
import ComparativeReport from "./Reports/ComparativeReport";
import { useReportData } from "@/hooks/useReportData";
import SupabaseConfig from "./SupabaseConfig";

const HomePage = () => {
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  const [activeTab, setActiveTab] = React.useState("dashboard");
  const { data, loading } = useReportData();
  const [showSupabaseConfig, setShowSupabaseConfig] = React.useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation sidebar */}
      <div className="fixed inset-y-0 left-0 w-16 bg-card border-r flex flex-col items-center py-4 gap-6">
        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
          <span>AP</span>
        </div>

        <Button
          variant={activeTab === "dashboard" ? "default" : "ghost"}
          size="icon"
          onClick={() => setActiveTab("dashboard")}
          className="rounded-full"
        >
          <Home className="h-5 w-5" />
        </Button>

        <Button
          variant={activeTab === "producers" ? "default" : "ghost"}
          size="icon"
          onClick={() => setActiveTab("producers")}
          className="rounded-full"
        >
          <Users className="h-5 w-5" />
        </Button>

        <Button
          variant={activeTab === "entry" ? "default" : "ghost"}
          size="icon"
          onClick={() => setActiveTab("entry")}
          className="rounded-full"
        >
          <Package className="h-5 w-5" />
        </Button>

        <Button
          variant={activeTab === "reports" ? "default" : "ghost"}
          size="icon"
          onClick={() => setActiveTab("reports")}
          className="rounded-full"
        >
          <FileText className="h-5 w-5" />
        </Button>

        <div className="mt-auto flex flex-col gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            onClick={() => setShowSupabaseConfig(true)}
          >
            <Database className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full">
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="pl-16 w-full">
        {/* Header */}
        <header className="border-b bg-card">
          <div className="container flex items-center justify-between h-16 px-4">
            <h1 className="text-xl font-semibold">
              Sistema de Gestão de Produção Apícola
            </h1>

            <div className="flex items-center gap-4">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4" />
                    {date ? format(date, "dd/MM/yyyy") : "Selecionar data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>

              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-medium">
                  <span>U</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="container py-6 px-4">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="mb-6">
              <TabsTrigger
                value="dashboard"
                className="flex items-center gap-2"
              >
                <BarChart3 className="h-4 w-4" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger
                value="producers"
                className="flex items-center gap-2"
              >
                <Users className="h-4 w-4" />
                Produtores
              </TabsTrigger>
              <TabsTrigger value="entry" className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                Controle de Entrada
              </TabsTrigger>
              <TabsTrigger value="reports" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Relatórios
              </TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle>Total de Produção</CardTitle>
                    <CardDescription>Produção total de mel</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">
                      {loading
                        ? "Carregando..."
                        : `${data.productionSummary.totalProduction.toFixed(2)} kg`}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Dados atualizados em tempo real
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle>Produtores Ativos</CardTitle>
                    <CardDescription>
                      Total de produtores cadastrados
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">
                      {loading
                        ? "Carregando..."
                        : data.productionSummary.totalProducers}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Produtores com entradas registradas
                    </p>
                    <div className="mt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => setActiveTab("producers")}
                      >
                        <Users className="mr-2 h-4 w-4" /> Ver todos os
                        produtores
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle>Média por Produtor</CardTitle>
                    <CardDescription>
                      Produção média por produtor
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">
                      {loading
                        ? "Carregando..."
                        : `${data.productionSummary.averagePerProducer.toFixed(2)} kg`}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Média calculada com base nas entradas
                    </p>
                    <div className="mt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => setActiveTab("entry")}
                      >
                        <Package className="mr-2 h-4 w-4" /> Ver todas as
                        entradas
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {loading ? (
                <div className="w-full bg-background p-6 rounded-lg flex items-center justify-center h-[400px]">
                  <div className="flex flex-col items-center gap-2">
                    <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-muted-foreground">Carregando dados...</p>
                  </div>
                </div>
              ) : (
                <ProductionSummary productionData={data.productionSummary} />
              )}
            </TabsContent>

            <TabsContent value="producers">
              <Card>
                <CardHeader>
                  <CardTitle>Cadastro de Produtores</CardTitle>
                  <CardDescription>
                    Gerencie os dados dos produtores apícolas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ProducerForm />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="entry">
              <Card>
                <CardHeader>
                  <CardTitle>Controle de Entrada</CardTitle>
                  <CardDescription>
                    Registre a entrada de produtos apícolas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <EntryForm />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reports">
              <Card>
                <CardHeader>
                  <CardTitle>Relatórios Comparativos</CardTitle>
                  <CardDescription>
                    Analise e compare dados de produção
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ComparativeReport />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>

        {/* Supabase Configuration Modal */}
        {showSupabaseConfig && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-background rounded-lg w-full max-w-4xl max-h-[90vh] overflow-auto">
              <div className="p-4 flex justify-between items-center border-b">
                <h2 className="text-xl font-semibold">
                  Configuração do Supabase
                </h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowSupabaseConfig(false)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-x"
                  >
                    <path d="M18 6 6 18" />
                    <path d="m6 6 12 12" />
                  </svg>
                </Button>
              </div>
              <div className="p-4">
                <SupabaseConfig
                  onConfigured={() => setShowSupabaseConfig(false)}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
