import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const formSchema = z.object({
    cod_na_comapi: z.string().min(1, { message: "Código obrigatório" }),
    nome_completo: z.string().min(3, { message: "Nome obrigatório" }),
    cpf: z.string().min(11, { message: "CPF inválido" }),
    rg: z.string().optional(),
    nascimento: z.date().optional(),
    sexo: z.string().optional(),
    apelido: z.string().optional(),
    escolaridade: z.string().optional(),
    estado_civil: z.string().optional(),
    endereco: z.string().optional(),
    cod_municipio: z.string().optional(),
    municipio: z.string().optional(),
    uf: z.string().optional(),
    q_colmeia: z.string().optional(),
    cooperativa_vinculado: z.string().optional(),
    data_de_vinculo: z.date().optional(),
    situacao: z.string().optional(),
    prod_de_mel: z.string().optional(),
    dap_validade: z.date().optional(),
    numero_dap: z.string().optional(),
    tam_propriedade: z.string().optional(),
    cod_cert: z.string().optional(),
    organico: z.string().optional(),
    fair_trade: z.string().optional(),
    comunidade: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const ProducerForm = () => {
    const [activeTab, setActiveTab] = useState("personal");

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            cod_na_comapi: "",
            nome_completo: "",
            cpf: "",
            rg: "",
            sexo: "",
            apelido: "",
            escolaridade: "",
            estado_civil: "",
            endereco: "",
            cod_municipio: "",
            municipio: "",
            uf: "",
            q_colmeia: "",
            cooperativa_vinculado: "",
            situacao: "",
            prod_de_mel: "",
            numero_dap: "",
            tam_propriedade: "",
            cod_cert: "",
            organico: "",
            fair_trade: "",
            comunidade: "",
        },
    });

    const onSubmit = (data: FormValues) => {
        console.log("Form submitted:", data);
        // Aqui seria implementada a lógica para salvar os dados
    };

    return (
        <div className="container mx-auto bg-background">
            <Card className="w-full">
                <CardContent className="pt-6">
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <Tabs
                            value={activeTab}
                            onValueChange={setActiveTab}
                            className="w-full"
                        >
                            <TabsList className="grid grid-cols-4 mb-6">
                                <TabsTrigger value="personal">Dados Pessoais</TabsTrigger>
                                <TabsTrigger value="contact">Contato</TabsTrigger>
                                <TabsTrigger value="property">Propriedade</TabsTrigger>
                                <TabsTrigger value="cooperative">Cooperativa</TabsTrigger>
                            </TabsList>

                            <TabsContent value="personal" className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="cod_na_comapi">Código na COMAPI *</Label>
                                        <Input
                                            id="cod_na_comapi"
                                            {...form.register("cod_na_comapi")}
                                            placeholder="Código do produtor"
                                        />
                                        {form.formState.errors.cod_na_comapi && (
                                            <p className="text-sm text-destructive">
                                                {form.formState.errors.cod_na_comapi.message}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="nome_completo">Nome Completo *</Label>
                                        <Input
                                            id="nome_completo"
                                            {...form.register("nome_completo")}
                                            placeholder="Nome completo do produtor"
                                        />
                                        {form.formState.errors.nome_completo && (
                                            <p className="text-sm text-destructive">
                                                {form.formState.errors.nome_completo.message}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="cpf">CPF *</Label>
                                        <Input
                                            id="cpf"
                                            {...form.register("cpf")}
                                            placeholder="000.000.000-00"
                                        />
                                        {form.formState.errors.cpf && (
                                            <p className="text-sm text-destructive">
                                                {form.formState.errors.cpf.message}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="rg">RG</Label>
                                        <Input
                                            id="rg"
                                            {...form.register("rg")}
                                            placeholder="00.000.000-0"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="nascimento">Data de Nascimento</Label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant={"outline"}
                                                    className={cn(
                                                        "w-full justify-start text-left font-normal",
                                                        !form.getValues("nascimento") &&
                                                        "text-muted-foreground",
                                                    )}
                                                >
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {form.getValues("nascimento") ? (
                                                        format(form.getValues("nascimento"), "dd/MM/yyyy")
                                                    ) : (
                                                        <span>Selecione uma data</span>
                                                    )}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={form.getValues("nascimento")}
                                                    onSelect={(date) =>
                                                        form.setValue("nascimento", date as Date)
                                                    }
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="sexo">Sexo</Label>
                                        <Select
                                            onValueChange={(value) => form.setValue("sexo", value)}
                                            defaultValue={form.getValues("sexo")}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecione" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="M">Masculino</SelectItem>
                                                <SelectItem value="F">Feminino</SelectItem>
                                                <SelectItem value="O">Outro</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="apelido">Apelido</Label>
                                        <Input
                                            id="apelido"
                                            {...form.register("apelido")}
                                            placeholder="Apelido do produtor"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="estado_civil">Estado Civil</Label>
                                        <Select
                                            onValueChange={(value) =>
                                                form.setValue("estado_civil", value)
                                            }
                                            defaultValue={form.getValues("estado_civil")}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecione" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="solteiro">Solteiro(a)</SelectItem>
                                                <SelectItem value="casado">Casado(a)</SelectItem>
                                                <SelectItem value="divorciado">
                                                    Divorciado(a)
                                                </SelectItem>
                                                <SelectItem value="viuvo">Viúvo(a)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="escolaridade">Escolaridade</Label>
                                        <Select
                                            onValueChange={(value) =>
                                                form.setValue("escolaridade", value)
                                            }
                                            defaultValue={form.getValues("escolaridade")}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecione" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="fundamental_incompleto">
                                                    Fundamental Incompleto
                                                </SelectItem>
                                                <SelectItem value="fundamental_completo">
                                                    Fundamental Completo
                                                </SelectItem>
                                                <SelectItem value="medio_incompleto">
                                                    Médio Incompleto
                                                </SelectItem>
                                                <SelectItem value="medio_completo">
                                                    Médio Completo
                                                </SelectItem>
                                                <SelectItem value="superior_incompleto">
                                                    Superior Incompleto
                                                </SelectItem>
                                                <SelectItem value="superior_completo">
                                                    Superior Completo
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="contact" className="space-y-4">
                                <div className="grid grid-cols-1 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="endereco">Endereço</Label>
                                        <Input
                                            id="endereco"
                                            {...form.register("endereco")}
                                            placeholder="Endereço completo"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="cod_municipio">Código do Município</Label>
                                        <Input
                                            id="cod_municipio"
                                            {...form.register("cod_municipio")}
                                            placeholder="Código do município"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="municipio">Município</Label>
                                        <Input
                                            id="municipio"
                                            {...form.register("municipio")}
                                            placeholder="Nome do município"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="uf">UF</Label>
                                        <Select
                                            onValueChange={(value) => form.setValue("uf", value)}
                                            defaultValue={form.getValues("uf")}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecione" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="AC">AC</SelectItem>
                                                <SelectItem value="AL">AL</SelectItem>
                                                <SelectItem value="AM">AM</SelectItem>
                                                <SelectItem value="AP">AP</SelectItem>
                                                <SelectItem value="BA">BA</SelectItem>
                                                <SelectItem value="CE">CE</SelectItem>
                                                <SelectItem value="DF">DF</SelectItem>
                                                <SelectItem value="ES">ES</SelectItem>
                                                <SelectItem value="GO">GO</SelectItem>
                                                <SelectItem value="MA">MA</SelectItem>
                                                <SelectItem value="MG">MG</SelectItem>
                                                <SelectItem value="MS">MS</SelectItem>
                                                <SelectItem value="MT">MT</SelectItem>
                                                <SelectItem value="PA">PA</SelectItem>
                                                <SelectItem value="PB">PB</SelectItem>
                                                <SelectItem value="PE">PE</SelectItem>
                                                <SelectItem value="PI">PI</SelectItem>
                                                <SelectItem value="PR">PR</SelectItem>
                                                <SelectItem value="RJ">RJ</SelectItem>
                                                <SelectItem value="RN">RN</SelectItem>
                                                <SelectItem value="RO">RO</SelectItem>
                                                <SelectItem value="RR">RR</SelectItem>
                                                <SelectItem value="RS">RS</SelectItem>
                                                <SelectItem value="SC">SC</SelectItem>
                                                <SelectItem value="SE">SE</SelectItem>
                                                <SelectItem value="SP">SP</SelectItem>
                                                <SelectItem value="TO">TO</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="comunidade">Comunidade</Label>
                                        <Input
                                            id="comunidade"
                                            {...form.register("comunidade")}
                                            placeholder="Nome da comunidade"
                                        />
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="property" className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="tam_propriedade">
                                            Tamanho da Propriedade
                                        </Label>
                                        <Input
                                            id="tam_propriedade"
                                            {...form.register("tam_propriedade")}
                                            placeholder="Tamanho em hectares"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="q_colmeia">Quantidade de Colmeias</Label>
                                        <Input
                                            id="q_colmeia"
                                            {...form.register("q_colmeia")}
                                            placeholder="Número de colmeias"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="prod_de_mel">Produção de Mel</Label>
                                        <Select
                                            onValueChange={(value) =>
                                                form.setValue("prod_de_mel", value)
                                            }
                                            defaultValue={form.getValues("prod_de_mel")}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecione" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="sim">Sim</SelectItem>
                                                <SelectItem value="nao">Não</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="organico">Orgânico</Label>
                                        <Select
                                            onValueChange={(value) =>
                                                form.setValue("organico", value)
                                            }
                                            defaultValue={form.getValues("organico")}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecione" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="sim">Sim</SelectItem>
                                                <SelectItem value="nao">Não</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="fair_trade">Fair Trade</Label>
                                        <Select
                                            onValueChange={(value) =>
                                                form.setValue("fair_trade", value)
                                            }
                                            defaultValue={form.getValues("fair_trade")}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecione" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="sim">Sim</SelectItem>
                                                <SelectItem value="nao">Não</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="cod_cert">Código de Certificação</Label>
                                        <Input
                                            id="cod_cert"
                                            {...form.register("cod_cert")}
                                            placeholder="Código de certificação"
                                        />
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="cooperative" className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="cooperativa_vinculado">
                                            Cooperativa Vinculada
                                        </Label>
                                        <Input
                                            id="cooperativa_vinculado"
                                            {...form.register("cooperativa_vinculado")}
                                            placeholder="Nome da cooperativa"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="data_de_vinculo">Data de Vínculo</Label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant={"outline"}
                                                    className={cn(
                                                        "w-full justify-start text-left font-normal",
                                                        !form.getValues("data_de_vinculo") &&
                                                        "text-muted-foreground",
                                                    )}
                                                >
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {form.getValues("data_de_vinculo") ? (
                                                        format(
                                                            form.getValues("data_de_vinculo"),
                                                            "dd/MM/yyyy",
                                                        )
                                                    ) : (
                                                        <span>Selecione uma data</span>
                                                    )}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={form.getValues("data_de_vinculo")}
                                                    onSelect={(date) =>
                                                        form.setValue("data_de_vinculo", date as Date)
                                                    }
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="situacao">Situação</Label>
                                        <Select
                                            onValueChange={(value) =>
                                                form.setValue("situacao", value)
                                            }
                                            defaultValue={form.getValues("situacao")}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecione" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="ativo">Ativo</SelectItem>
                                                <SelectItem value="inativo">Inativo</SelectItem>
                                                <SelectItem value="pendente">Pendente</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <Separator className="my-4" />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="numero_dap">Número da DAP</Label>
                                        <Input
                                            id="numero_dap"
                                            {...form.register("numero_dap")}
                                            placeholder="Número da DAP"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="dap_validade">Validade da DAP</Label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant={"outline"}
                                                    className={cn(
                                                        "w-full justify-start text-left font-normal",
                                                        !form.getValues("dap_validade") &&
                                                        "text-muted-foreground",
                                                    )}
                                                >
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {form.getValues("dap_validade") ? (
                                                        format(form.getValues("dap_validade"), "dd/MM/yyyy")
                                                    ) : (
                                                        <span>Selecione uma data</span>
                                                    )}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={form.getValues("dap_validade")}
                                                    onSelect={(date) =>
                                                        form.setValue("dap_validade", date as Date)
                                                    }
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                </div>
                            </TabsContent>
                        </Tabs>

                        <div className="mt-6">
                            <p className="text-sm text-muted-foreground mb-2">
                                * Campos obrigatórios
                            </p>
                        </div>
                    </form>
                </CardContent>
                <CardFooter className="flex justify-between">
                    <Button variant="outline">Cancelar</Button>
                    <Button onClick={form.handleSubmit(onSubmit)}>Salvar Produtor</Button>
                </CardFooter>
            </Card>
        </div>
    );
};

export default ProducerForm;