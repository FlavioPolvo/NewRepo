import React, { useState, useEffect } from "react";
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
import { format } from "date-fns";
import { CalendarIcon, Save, X, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import { Popover as PopoverPrimitive } from "@radix-ui/react-popover";

interface EntryFormProps {
    onSubmit?: (data: EntryFormData) => void;
    onCancel?: () => void;
}

interface EntryFormData {
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
    ce: string; // Certificado de Entrada
    anal: string; // Análise
    prod: string; // Produção
}

const EntryForm: React.FC<EntryFormProps> = ({ onSubmit, onCancel }) => {
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [formData, setFormData] = useState<Partial<EntryFormData>>({
        date: new Date(),
        producerId: "",
        producerName: "",
        municipality: "",
        community: "",
        quantity: 0,
        grossWeight: 0,
        netWeight: 0,
        tare: 0,
        totalTare: 0,
        unitValue: 0,
        totalValue: 0,
        colorCode: "",
        humidity: 0,
        apiary: "",
        lot: "",
        contract: "",
        ce: "",
        anal: "",
        prod: "",
    });

    // Mock data for dropdowns with extended producer information
    const mockProducers = [
        {
            id: "1",
            name: "João Silva",
            cod_na_comapi: "COMAPI001",
            municipality: "São Paulo",
            community: "Comunidade A",
        },
        {
            id: "2",
            name: "Maria Oliveira",
            cod_na_comapi: "COMAPI002",
            municipality: "Rio de Janeiro",
            community: "Comunidade B",
        },
        {
            id: "3",
            name: "Pedro Santos",
            cod_na_comapi: "COMAPI003",
            municipality: "Belo Horizonte",
            community: "Comunidade C",
        },
        {
            id: "4",
            name: "Ana Pereira",
            cod_na_comapi: "COMAPI004",
            municipality: "Salvador",
            community: "Comunidade D",
        },
        {
            id: "5",
            name: "Carlos Mendes",
            cod_na_comapi: "COMAPI005",
            municipality: "São Paulo",
            community: "Comunidade A",
        },
    ];

    const mockMunicipalities = [
        "São Paulo",
        "Rio de Janeiro",
        "Belo Horizonte",
        "Salvador",
    ];

    const mockCommunities = [
        "Comunidade A",
        "Comunidade B",
        "Comunidade C",
        "Comunidade D",
    ];

    // State for producer search
    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState(mockProducers);
    const [openProducerSearch, setOpenProducerSearch] = useState(false);

    const mockColors = [
        { code: "1", name: "Branco Água" },
        { code: "2", name: "Extra Branco" },
        { code: "3", name: "Branco" },
        { code: "4", name: "Âmbar Extra Claro" },
        { code: "5", name: "Âmbar Claro" },
        { code: "6", name: "Âmbar" },
        { code: "7", name: "Âmbar Escuro" },
    ];

    const handleInputChange = (field: keyof EntryFormData, value: any) => {
        setFormData((prev) => {
            const newData = { ...prev, [field]: value };

            // Recalculate totalValue if unitValue or netWeight (now manual) is changed
            if (field === "unitValue" || field === "netWeight") {
                const netWeight = Number(newData.netWeight) || 0;
                const unitValue = Number(newData.unitValue) || 0;
                newData.totalValue = netWeight * unitValue;
            }

            return newData;
        });
    };

    // Search producers by name, id, or COMAPI code
    useEffect(() => {
        if (searchTerm.trim() === "") {
            setSearchResults(mockProducers);
            return;
        }

        const lowerSearchTerm = searchTerm.toLowerCase();
        const filtered = mockProducers.filter(
            (producer) =>
                producer.name.toLowerCase().includes(lowerSearchTerm) ||
                producer.id.toLowerCase().includes(lowerSearchTerm) ||
                producer.cod_na_comapi.toLowerCase().includes(lowerSearchTerm),
        );

        setSearchResults(filtered);
    }, [searchTerm]);

    const handleProducerChange = (producerId: string) => {
        const producer = mockProducers.find((p) => p.id === producerId);
        if (producer) {
            setFormData((prev) => ({
                ...prev,
                producerId,
                producerName: producer.name,
                // Pre-fill municipality and community from producer data
                municipality: producer.municipality,
                community: producer.community,
            }));
        }
    };

    const handleProducerSelect = (producerId: string) => {
        handleProducerChange(producerId);
        setOpenProducerSearch(false);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (onSubmit && formData.date) {
            onSubmit(formData as EntryFormData);
        }
    };

    return (
        <Card className="w-full bg-white">
            <CardContent className="pt-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Date Selection */}
                        <div className="space-y-2">
                            <Label htmlFor="date">Data de Entrada</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant={"outline"}
                                        className={cn(
                                            "w-full justify-start text-left font-normal",
                                            !date && "text-muted-foreground",
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {date ? (
                                            format(date, "dd/MM/yyyy")
                                        ) : (
                                            <span>Selecione uma data</span>
                                        )}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={date}
                                        onSelect={(date) => {
                                            setDate(date);
                                            if (date) {
                                                handleInputChange("date", date);
                                            }
                                        }}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>

                        {/* Producer Selection with Search */}
                        <div className="space-y-2">
                            <Label htmlFor="producer">Produtor</Label>
                            <Popover
                                open={openProducerSearch}
                                onOpenChange={setOpenProducerSearch}
                            >
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        aria-expanded={openProducerSearch}
                                        className="w-full justify-between"
                                    >
                                        {formData.producerId
                                            ? mockProducers.find(
                                                (producer) => producer.id === formData.producerId,
                                            )?.name
                                            : "Buscar produtor..."}
                                        <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[300px] p-0" align="start">
                                    <Command>
                                        <CommandInput
                                            placeholder="Buscar por nome, código ou COMAPI..."
                                            value={searchTerm}
                                            onValueChange={setSearchTerm}
                                        />
                                        <CommandList>
                                            <CommandEmpty>Nenhum produtor encontrado.</CommandEmpty>
                                            <CommandGroup>
                                                {searchResults.map((producer) => (
                                                    <CommandItem
                                                        key={producer.id}
                                                        value={producer.id}
                                                        onSelect={() => handleProducerSelect(producer.id)}
                                                    >
                                                        <div className="flex flex-col">
                                                            <span>{producer.name}</span>
                                                            <span className="text-xs text-muted-foreground">
                                                                ID: {producer.id} | COMAPI:{" "}
                                                                {producer.cod_na_comapi}
                                                            </span>
                                                        </div>
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                        </div>

                        {/* Producer ID */}
                        <div className="space-y-2">
                            <Label htmlFor="producerId">Código do Produtor</Label>
                            <Input
                                id="producerId"
                                value={formData.producerId}
                                readOnly
                                className="bg-gray-100"
                            />
                        </div>
                    </div>

                    <Separator />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4"> {/* MODIFICADO: de md:grid-cols-3 para md:grid-cols-2 */}
                        {/* Municipality */}
                        <div className="space-y-2">
                            <Label htmlFor="municipality">Município</Label>
                            <Select
                                onValueChange={(value) =>
                                    handleInputChange("municipality", value)
                                }
                                value={formData.municipality?.toString()}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione um município" />
                                </SelectTrigger>
                                <SelectContent>
                                    {mockMunicipalities.map((municipality) => (
                                        <SelectItem key={municipality} value={municipality}>
                                            {municipality}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Community */}
                        <div className="space-y-2">
                            <Label htmlFor="community">Comunidade</Label>
                            <Select
                                onValueChange={(value) => handleInputChange("community", value)}
                                value={formData.community?.toString()}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione uma comunidade" />
                                </SelectTrigger>
                                <SelectContent>
                                    {mockCommunities.map((community) => (
                                        <SelectItem key={community} value={community}>
                                            {community}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        {/* Quantity REMOVIDO DAQUI */}
                    </div>

                    <Separator />

                    {/* NOVA SEÇÃO PARA CE, Anal, Quantidade, Prod */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* CE - Certificado de Entrada */}
                        <div className="space-y-2">
                            <Label htmlFor="ce">CE</Label>
                            <Input
                                id="ce"
                                value={formData.ce || ""}
                                onChange={(e) => handleInputChange("ce", e.target.value)}
                            />
                        </div>

                        {/* Anal - Análise */}
                        <div className="space-y-2">
                            <Label htmlFor="anal">Anal.</Label>
                            <Input
                                id="anal"
                                value={formData.anal || ""}
                                onChange={(e) => handleInputChange("anal", e.target.value)}
                            />
                        </div>

                        {/* Quantity */}
                        <div className="space-y-2">
                            <Label htmlFor="quantity">Quantidade</Label>
                            <Input
                                id="quantity"
                                type="number"
                                value={formData.quantity?.toString() || ""}
                                onChange={(e) =>
                                    handleInputChange("quantity", Number(e.target.value))
                                }
                            />
                        </div>

                        {/* Prod - Produção */}
                        <div className="space-y-2">
                            <Label htmlFor="prod">Prod.</Label>
                            <Input
                                id="prod"
                                value={formData.prod || ""}
                                onChange={(e) => handleInputChange("prod", e.target.value)}
                            />
                        </div>
                    </div>

                    <Separator />

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* Tare */}
                        <div className="space-y-2">
                            <Label htmlFor="tare">Tara (kg)</Label>
                            <Input
                                id="tare"
                                type="number"
                                step="0.01"
                                value={formData.tare?.toString() || ""}
                                onChange={(e) =>
                                    handleInputChange("tare", Number(e.target.value))
                                }
                            />
                        </div>

                        {/* Total Tare */}
                        <div className="space-y-2">
                            <Label htmlFor="totalTare">Tara Total (kg)</Label>
                            <Input
                                id="totalTare"
                                type="number"
                                step="0.01"
                                value={formData.totalTare?.toString() || ""}
                                onChange={(e) =>
                                    handleInputChange("totalTare", Number(e.target.value))
                                }
                            />
                        </div>

                        {/* Gross Weight */}
                        <div className="space-y-2">
                            <Label htmlFor="grossWeight">Peso Bruto (kg)</Label>
                            <Input
                                id="grossWeight"
                                type="number"
                                step="0.01"
                                value={formData.grossWeight?.toString() || ""}
                                onChange={(e) =>
                                    handleInputChange("grossWeight", Number(e.target.value))
                                }
                            />
                        </div>

                        {/* Net Weight */}
                        <div className="space-y-2">
                            <Label htmlFor="netWeight">Peso Líquido (kg)</Label>
                            <Input
                                id="netWeight"
                                type="number"
                                step="0.01"
                                value={formData.netWeight?.toString() || ""}
                                onChange={(e) =>
                                    handleInputChange("netWeight", Number(e.target.value))
                                }
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Unit Value */}
                        <div className="space-y-2">
                            <Label htmlFor="unitValue">Valor Unitário (R$)</Label>
                            <Input
                                id="unitValue"
                                type="number"
                                step="0.01"
                                value={formData.unitValue?.toString() || ""}
                                onChange={(e) =>
                                    handleInputChange("unitValue", Number(e.target.value))
                                }
                            />
                        </div>

                        {/* Total Value */}
                        <div className="space-y-2">
                            <Label htmlFor="totalValue">Valor Total (R$)</Label>
                            <Input
                                id="totalValue"
                                type="number"
                                step="0.01"
                                value={formData.totalValue?.toFixed(2) || ""}
                                readOnly
                                className="bg-gray-100"
                            />
                        </div>

                        {/* Color Classification */}
                        <div className="space-y-2">
                            <Label htmlFor="colorCode">Classificação por Cor</Label>
                            <Select
                                onValueChange={(value) => handleInputChange("colorCode", value)}
                                value={formData.colorCode?.toString()}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione uma cor" />
                                </SelectTrigger>
                                <SelectContent>
                                    {mockColors.map((color) => (
                                        <SelectItem key={color.code} value={color.code}>
                                            {color.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <Separator />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Humidity */}
                        <div className="space-y-2">
                            <Label htmlFor="humidity">Umidade (%)</Label>
                            <Input
                                id="humidity"
                                type="number"
                                step="0.1"
                                value={formData.humidity?.toString() || ""}
                                onChange={(e) =>
                                    handleInputChange("humidity", Number(e.target.value))
                                }
                            />
                        </div>

                        {/* Apiary */}
                        <div className="space-y-2">
                            <Label htmlFor="apiary">Apiário</Label>
                            <Input
                                id="apiary"
                                value={formData.apiary || ""}
                                onChange={(e) => handleInputChange("apiary", e.target.value)}
                            />
                        </div>

                        {/* Lot */}
                        <div className="space-y-2">
                            <Label htmlFor="lot">Lote</Label>
                            <Input
                                id="lot"
                                value={formData.lot || ""}
                                onChange={(e) => handleInputChange("lot", e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-1 gap-4"> {/* MODIFICADO: de md:grid-cols-3 para md:grid-cols-1 */}
                        {/* Contract */}
                        <div className="space-y-2">
                            <Label htmlFor="contract">Contrato</Label>
                            <Input
                                id="contract"
                                value={formData.contract || ""}
                                onChange={(e) => handleInputChange("contract", e.target.value)}
                            />
                        </div>
                        {/* CE e Anal REMOVIDOS DAQUI */}
                    </div>
                    {/* Prod REMOVIDO DAQUI (estava em sua própria div) */}
                </form>
            </CardContent>
            <CardFooter className="flex justify-end space-x-2">
                <Button variant="outline" type="button" onClick={onCancel}>
                    <X className="mr-2 h-4 w-4" /> Cancelar
                </Button>
                <Button type="submit" onClick={handleSubmit}>
                    <Save className="mr-2 h-4 w-4" /> Salvar Registro
                </Button>
            </CardFooter>
        </Card>
    );
};

export default EntryForm;

