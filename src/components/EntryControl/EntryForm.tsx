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
import { CalendarIcon, Save, X, Search, Info } from "lucide-react";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  supabase,
  getProducers,
  getMunicipalities,
  getCommunities,
  getColors,
  saveEntry,
} from "@/lib/supabase";

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
  analysisDate: Date | null; // Data da Análise
  invoiceNumber: string; // Nota Fiscal
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
    analysisDate: null,
    invoiceNumber: "",
  });

  // State for data from Supabase
  const [producers, setProducers] = useState<any[]>([]);
  const [municipalities, setMunicipalities] = useState<any[]>([]);
  const [communities, setCommunities] = useState<any[]>([]);
  const [filteredCommunities, setFilteredCommunities] = useState<any[]>([]);
  const [colors, setColors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedColor, setSelectedColor] = useState<any>(null);

  // State for producer search
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [openProducerSearch, setOpenProducerSearch] = useState(false);

  // Fetch data from Supabase
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch producers
        const producersData = await getProducers();
        console.log("Fetched producers:", producersData);
        setProducers(producersData);
        setSearchResults(producersData);

        // Fetch municipalities
        const municipalitiesData = await getMunicipalities();
        console.log("Fetched municipalities:", municipalitiesData);
        setMunicipalities(municipalitiesData);

        // Fetch communities from communities_2 table
        const communitiesData = await getCommunities();
        console.log("Fetched communities from communities_2:", communitiesData);
        setCommunities(communitiesData);
        setFilteredCommunities(communitiesData);

        // Fetch colors
        const colorsData = await getColors();
        console.log("Fetched colors:", colorsData);
        setColors(colorsData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleInputChange = (field: keyof EntryFormData, value: any) => {
    setFormData((prev) => {
      const newData = { ...prev, [field]: value };

      // Recalculate totalValue if unitValue or netWeight (now manual) is changed
      if (field === "unitValue" || field === "netWeight") {
        const netWeight = Number(newData.netWeight) || 0;
        const unitValue = Number(newData.unitValue) || 0;
        newData.totalValue = netWeight * unitValue;
      }

      // If municipality changes, filter communities
      if (field === "municipality") {
        const municipalityId = municipalities.find((m) => m.name === value)?.id;
        if (municipalityId) {
          const filtered = communities.filter(
            (c) => c.municipality_id === municipalityId,
          );
          setFilteredCommunities(filtered);
        }
      }

      // If colorCode changes, find the corresponding color
      if (field === "colorCode") {
        const colorCode = Number(value);
        const color = colors.find((c) => c.code === colorCode);
        if (color) {
          setSelectedColor(color);
        } else {
          setSelectedColor(null);
        }
      }

      return newData;
    });
  };

  // Search producers by name, id, or COMAPI code
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setSearchResults(producers);
      return;
    }

    const lowerSearchTerm = searchTerm.toLowerCase();
    const filtered = producers.filter(
      (producer) =>
        producer.name.toLowerCase().includes(lowerSearchTerm) ||
        String(producer.id).toLowerCase().includes(lowerSearchTerm) ||
        (producer.cod_na_comapi &&
          producer.cod_na_comapi.toLowerCase().includes(lowerSearchTerm)),
    );

    setSearchResults(filtered);
  }, [searchTerm, producers]);

  const handleProducerChange = (producerId: string) => {
    const producer = producers.find((p) => String(p.id) === producerId);
    if (producer) {
      setFormData((prev) => ({
        ...prev,
        producerId,
        producerName: producer.name,
        // Pre-fill municipality and community from producer data
        municipality: producer.municipality || "",
        community: producer.community || "",
      }));
    }
  };

  const handleProducerSelect = (producerId: string) => {
    // Convert producerId to string to ensure consistent type handling
    const producer = producers.find((p) => String(p.id) === String(producerId));
    if (producer) {
      setFormData((prev) => ({
        ...prev,
        producerId: String(producer.id),
        producerName: producer.name,
        municipality: producer.municipality || "",
        community: producer.community || "",
      }));
    }
    setOpenProducerSearch(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.date && formData.producerId) {
      try {
        // Prepare data for Supabase
        const entryData = {
          date: format(formData.date, "yyyy-MM-dd"),
          producer_id: Number(formData.producerId),
          quantity: Number(formData.quantity) || 0,
          gross_weight: Number(formData.grossWeight) || 0,
          net_weight: Number(formData.netWeight) || 0,
          tare: Number(formData.tare) || 0,
          total_tare: Number(formData.totalTare) || 0,
          unit_value: Number(formData.unitValue) || 0,
          total_value: Number(formData.totalValue) || 0,
          color_code: formData.colorCode || null,
          humidity: Number(formData.humidity) || null,
          apiary: formData.apiary || null,
          lot: formData.lot || null,
          contract: formData.contract || null,
          ce: formData.ce || null,
          anal: formData.anal || null,
          prod: formData.prod || null,
          municipality: formData.municipality || null,
          community: formData.community || null,
          analysis_date: formData.analysisDate
            ? format(formData.analysisDate, "yyyy-MM-dd")
            : null,
          invoice_number: formData.invoiceNumber || null,
        };

        // Save to Supabase
        const savedEntry = await saveEntry(entryData);
        console.log("Entry saved successfully:", savedEntry);

        // Clear form and notify user
        alert("Registro salvo com sucesso!");

        // Reset form data
        setFormData({
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
          analysisDate: null,
          invoiceNumber: "",
        });
        setDate(new Date());
        setSelectedColor(null);
        setOpenProducerSearch(false);
        setSearchTerm("");

        // Call onSubmit if provided
        if (onSubmit) {
          onSubmit(formData as EntryFormData);
        }
      } catch (error) {
        console.error("Error saving entry:", error);
        alert(
          "Erro ao salvar o registro. Verifique o console para mais detalhes.",
        );
      }
    } else {
      alert("Por favor, preencha todos os campos obrigatórios.");
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
                      ? producers.find(
                          (producer) =>
                            String(producer.id) === formData.producerId,
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {" "}
            {/* MODIFICADO: de md:grid-cols-3 para md:grid-cols-2 */}
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
                  {municipalities.map((municipality) => (
                    <SelectItem key={municipality.id} value={municipality.name}>
                      {municipality.id} - {municipality.name}
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
                disabled={!formData.municipality}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma comunidade" />
                </SelectTrigger>
                <SelectContent>
                  {filteredCommunities.map((community) => (
                    <SelectItem key={community.id} value={community.name}>
                      {community.id} - {community.name}
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
              <div className="flex items-center gap-2">
                <Label htmlFor="colorCode">Classificação por Cor</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5 rounded-full p-0"
                      >
                        <Info className="h-3 w-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Digite o código da cor (1-7)</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <Input
                    id="colorCode"
                    type="number"
                    placeholder="Digite o código da cor"
                    value={formData.colorCode?.toString() || ""}
                    onChange={(e) =>
                      handleInputChange("colorCode", e.target.value)
                    }
                    className="w-1/3"
                  />
                  {selectedColor && (
                    <div className="flex items-center gap-2 border rounded px-3 w-2/3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{
                          backgroundColor: selectedColor.hex_color || "#888888",
                        }}
                      />
                      <span>
                        {selectedColor.code} - {selectedColor.name}
                      </span>
                    </div>
                  )}
                </div>
                {/* Color selection buttons removed as requested */}
              </div>
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Contract */}
            <div className="space-y-2">
              <Label htmlFor="contract">Contrato</Label>
              <Input
                id="contract"
                value={formData.contract || ""}
                onChange={(e) => handleInputChange("contract", e.target.value)}
              />
            </div>

            {/* Invoice Number (Nota Fiscal) */}
            <div className="space-y-2">
              <Label htmlFor="invoiceNumber">Nota Fiscal</Label>
              <Input
                id="invoiceNumber"
                value={formData.invoiceNumber || ""}
                onChange={(e) =>
                  handleInputChange("invoiceNumber", e.target.value)
                }
                placeholder="Número da nota fiscal"
              />
            </div>

            {/* Analysis Date (Data da Análise) */}
            <div className="space-y-2">
              <Label htmlFor="analysisDate">Data da Análise</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.analysisDate && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.analysisDate ? (
                      format(formData.analysisDate, "dd/MM/yyyy")
                    ) : (
                      <span>Selecione uma data</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.analysisDate || undefined}
                    onSelect={(date) => {
                      handleInputChange("analysisDate", date);
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
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
