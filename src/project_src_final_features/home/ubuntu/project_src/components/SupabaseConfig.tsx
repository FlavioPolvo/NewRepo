import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2, Copy, Database, Key } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface SupabaseConfigProps {
  onConfigured?: () => void;
}

const SupabaseConfig: React.FC<SupabaseConfigProps> = ({ onConfigured }) => {
  const [supabaseUrl, setSupabaseUrl] = useState(
    import.meta.env.VITE_SUPABASE_URL || "",
  );
  const [supabaseKey, setSupabaseKey] = useState(
    import.meta.env.VITE_SUPABASE_ANON_KEY || "",
  );
  const [activeTab, setActiveTab] = useState("config");
  const [testStatus, setTestStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [sqlScript, setSqlScript] = useState("");

  // Load SQL script from the schema.sql file
  React.useEffect(() => {
    fetch("/src/lib/schema.sql")
      .then((response) => response.text())
      .then((text) => setSqlScript(text))
      .catch((error) => console.error("Error loading SQL script:", error));
  }, []);

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(sqlScript);
  };

  const testConnection = async () => {
    if (!supabaseUrl || !supabaseKey) {
      setErrorMessage("URL e chave do Supabase s�o obrigat�rios");
      setTestStatus("error");
      return;
    }

    setTestStatus("loading");
    try {
      // Try to fetch a simple query to test the connection
      const { error } = await supabase
        .from("producers")
        .select("count", { count: "exact" })
        .limit(0);

      if (error) {
        throw error;
      }

      setTestStatus("success");
      setErrorMessage("");

      // Call the onConfigured callback if provided
      if (onConfigured) {
        onConfigured();
      }
    } catch (error: any) {
      setTestStatus("error");
      setErrorMessage(error.message || "Erro ao conectar com o Supabase");
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Configuração do Supabase</CardTitle>
        <CardDescription>
          Configure a conexão com o Supabase para armazenar e gerenciar os dados
          do sistema
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="config">Configuração</TabsTrigger>
            <TabsTrigger value="schema">Esquema SQL</TabsTrigger>
            <TabsTrigger value="help">Ajuda</TabsTrigger>
          </TabsList>

          <TabsContent value="config" className="space-y-4">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="supabaseUrl">URL do Projeto Supabase</Label>
                <div className="flex">
                  <Database className="mr-2 h-4 w-4 mt-3 text-muted-foreground" />
                  <Input
                    id="supabaseUrl"
                    placeholder="https://xyzproject.supabase.co"
                    value={supabaseUrl}
                    onChange={(e) => setSupabaseUrl(e.target.value)}
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  URL do seu projeto no Supabase (encontrado nas configurações
                  do projeto)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="supabaseKey">Chave Anônima do Supabase</Label>
                <div className="flex">
                  <Key className="mr-2 h-4 w-4 mt-3 text-muted-foreground" />
                  <Input
                    id="supabaseKey"
                    type="password"
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    value={supabaseKey}
                    onChange={(e) => setSupabaseKey(e.target.value)}
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Chave anônima (anon key) do seu projeto no Supabase
                </p>
              </div>
            </div>

            <Separator className="my-4" />

            <div className="flex justify-end">
              <Button
                onClick={testConnection}
                disabled={testStatus === "loading"}
              >
                {testStatus === "loading" ? "Testando..." : "Testar Conexão"}
              </Button>
            </div>

            {testStatus === "success" && (
              <Alert variant="default" className="bg-green-50 border-green-200">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-800">
                  Conexão bem-sucedida!
                </AlertTitle>
                <AlertDescription className="text-green-700">
                  A conexão com o Supabase foi estabelecida com sucesso.
                </AlertDescription>
              </Alert>
            )}

            {testStatus === "error" && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Erro de conexão</AlertTitle>
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            )}
          </TabsContent>

          <TabsContent value="schema" className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="sqlScript">
                  Script SQL para Criação do Banco de Dados
                </Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyToClipboard}
                >
                  <Copy className="h-4 w-4 mr-1" /> Copiar
                </Button>
              </div>
              <Textarea
                id="sqlScript"
                value={sqlScript}
                onChange={(e) => setSqlScript(e.target.value)}
                className="font-mono h-[400px] overflow-auto"
              />
              <p className="text-sm text-muted-foreground">
                Execute este script SQL no editor SQL do Supabase para criar as
                tabelas necessárias
              </p>
            </div>
          </TabsContent>

          <TabsContent value="help" className="space-y-4">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">
                Como configurar o Supabase
              </h3>
              <ol className="list-decimal pl-5 space-y-2">
                <li>
                  Crie uma conta no{" "}
                  <a
                    href="https://supabase.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline"
                  >
                    Supabase
                  </a>
                </li>
                <li>Crie um novo projeto</li>
                <li>
                  Vá para Configurações &gt; API para obter a URL e a chave
                  anônima
                </li>
                <li>Copie esses valores para os campos na aba Configuração</li>
                <li>V� para o Editor SQL no Supabase</li>
                <li>Cole o script SQL da aba Esquema SQL e execute-o</li>
                <li>Teste a conex�o na aba Configura��o</li>
              </ol>

              <h3 className="text-lg font-medium mt-6">
                Estrutura do Banco de Dados
              </h3>
              <p>O banco de dados cont�m as seguintes tabelas:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  <strong>producers</strong> - Cadastro de produtores
                </li>
                <li>
                  <strong>entries</strong> - Registros de entrada de produtos
                </li>
                <li>
                  <strong>municipalities</strong> - Municípios cadastrados
                </li>
                <li>
                  <strong>colors</strong> - Classificação de cores do mel
                </li>
              </ul>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between">
        <p className="text-sm text-muted-foreground">
          As credenciais são armazenadas apenas no navegador
        </p>
      </CardFooter>
    </Card>
  );
};

export default SupabaseConfig;
