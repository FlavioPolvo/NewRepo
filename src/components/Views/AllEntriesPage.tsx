import React, { useState, useMemo, useEffect } from "react";
import { supabase, getEntries, getProducers, getMunicipalities, getColors, updateEntry } from "@/lib/supabase"; // Adicionado updateEntry
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, ArrowRight, Search as SearchIcon, Home as HomeIcon, FileSpreadsheet, FileText as FilePdf, Edit } from "lucide-react"; // Adicionado Edit
import { useNavigate } from "react-router-dom";
import { Entry, Producer, Municipality, Color, Community } from "@/types/supabase";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import EditModal from "@/components/EditModal"; // Adicionado
import EntryEditForm from "@/components/EntryEditForm"; // Adicionado

// Interface para Entry com nomes de produtor, município e cor
interface EnrichedEntry {
  id: number;
  date: string;
  producer_name?: string;
  municipality_name?: string;
  color_name?: string;
  community_name?: string;
  lot?: string | null;
  anal?: string | null;
  net_weight: number;
  unit_value: number;
  total_value: number;
  producer_id?: number | null;
  color_code?: string | null;
  // Campos adicionais para edição
  municipality?: string;
  community?: string;
  quantity?: number;
  gross_weight?: number;
  tare?: number;
  total_tare?: number;
  humidity?: number;
  apiary?: string;
  contract?: string;
  analysis_date?: string;
  invoice_number?: string;
}

const AllEntriesPage: React.FC = () => {
  const [entries, setEntries] = useState<EnrichedEntry[]>([]);
  const [producers, setProducers] = useState<Producer[]>([]);
  const [municipalities, setMunicipalities] = useState<Municipality[]>([]);
  const [colors, setColors] = useState<Color[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const navigate = useNavigate();
  
  // Estados para edição
  const [editingEntry, setEditingEntry] = useState<any | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [entriesData, producersData, municipalitiesData, colorsData] = await Promise.all([
        getEntries(),
        getProducers(),
        getMunicipalities(),
        getColors(),
      ]);

      setProducers(producersData || []);
      setMunicipalities(municipalitiesData || []);
      setColors(colorsData || []);

      // Enrich entries with names
      const enrichedEntriesData = (entriesData || []).map((entry) => {
        return {
          id: entry.id,
          date: entry.date,
          lot: entry.lot,
          anal: entry.anal,
          net_weight: entry.net_weight,
          unit_value: entry.unit_value, 
          total_value: entry.total_value,
          producer_id: entry.producer_id,
          color_code: entry.color_code,
          producer_name: entry.producers?.name || "",
          municipality_name: entry.municipality || "",
          community_name: entry.community || "",
          color_name: (colorsData || []).find(c => String(c.code) === String(entry.color_code))?.name || `Cor ${entry.color_code}`,
          // Campos adicionais para edição
          municipality: entry.municipality,
          community: entry.community,
          quantity: entry.quantity,
          gross_weight: entry.gross_weight,
          tare: entry.tare,
          total_tare: entry.total_tare,
          humidity: entry.humidity,
          apiary: entry.apiary,
          contract: entry.contract,
          analysis_date: entry.analysis_date,
          invoice_number: entry.invoice_number,
        };
      });

      setEntries(enrichedEntriesData);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Erro ao buscar dados das entradas");
      setEntries([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredEntries = useMemo(() => {
    return entries.filter(
      (entry) =>
        (entry.producer_name && entry.producer_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (entry.municipality_name && entry.municipality_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (entry.lot && entry.lot.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (entry.community_name && entry.community_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (entry.anal && entry.anal.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (entry.date && format(new Date(entry.date), "dd/MM/yyyy").includes(searchTerm))
    );
  }, [entries, searchTerm]);

  const paginatedEntries = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredEntries.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredEntries, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredEntries.length / itemsPerPage);

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1);
  };

  const handleExportToXLS = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredEntries.map(e => ({
      Data: format(new Date(e.date), "dd/MM/yyyy", { locale: ptBR }),
      Produtor: e.producer_name,
      Município: e.municipality_name || "",
      Comunidade: e.community_name || "",
      Lote: e.lot || "",
      "Anal.": e.anal || "",
      Cor: e.color_name || "",
      "Peso Líquido (kg)": e.net_weight.toFixed(2),
      "Valor Unit. (R$)": e.unit_value.toFixed(2),
      "Valor Total (R$)": e.total_value.toFixed(2),
    })));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Entradas");
    XLSX.writeFile(workbook, `entradas_export_${new Date().toISOString().split("T")[0]}.xlsx`);
  };

  const handleExportToPDF = () => {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [["Data", "Produtor", "Município", "Comunidade", "Lote", "Anal.", "Cor", "Peso Líquido (kg)", "Valor Unit. (R$)", "Valor Total (R$)"]],
      body: filteredEntries.map(e => [
        format(new Date(e.date), "dd/MM/yyyy", { locale: ptBR }),
        e.producer_name,
        e.municipality_name || "",
        e.community_name || "",
        e.lot || "",
        e.anal || "",
        e.color_name || "",
        e.net_weight.toFixed(2),
        e.unit_value.toFixed(2),
        e.total_value.toFixed(2),
      ]),
    });
    doc.save(`entradas_export_${new Date().toISOString().split("T")[0]}.pdf`);
  };

  // Funções para edição
  const handleEdit = (entry: EnrichedEntry) => {
    // Converter para o formato esperado pelo EntryEditForm
    const entryForEdit = {
      id: entry.id,
      date: new Date(entry.date),
      producerId: entry.producer_id,
      producerName: entry.producer_name,
      municipality: entry.municipality,
      community: entry.community,
      lot: entry.lot,
      anal: entry.anal,
      colorCode: entry.color_code,
      colorName: entry.color_name,
      netWeight: entry.net_weight,
      unitValue: entry.unit_value,
      totalValue: entry.total_value,
      quantity: entry.quantity,
      grossWeight: entry.gross_weight,
      tare: entry.tare,
      totalTare: entry.total_tare,
      humidity: entry.humidity,
      apiary: entry.apiary,
      contract: entry.contract,
      analysisDate: entry.analysis_date ? new Date(entry.analysis_date) : undefined,
      invoiceNumber: entry.invoice_number,
    };
    
    setEditingEntry(entryForEdit);
  };

  const handleSave = async () => {
    if (!editingEntry) return;
    
    setIsSaving(true);
    try {
      await updateEntry(String(editingEntry.id), editingEntry);
      // Atualizar a lista de entradas após salvar
      await fetchData();
      setEditingEntry(null);
    } catch (error) {
      console.error("Erro ao atualizar entrada:", error);
      alert("Erro ao salvar as alterações. Por favor, tente novamente.");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return <div className="p-4 text-center">Carregando entradas...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">Erro: {error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <header className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-primary">Todas as Entradas</h1>
        <Button variant="outline" onClick={() => navigate("/")}>
          <HomeIcon className="mr-2 h-4 w-4" /> Voltar para Home
        </Button>
      </header>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Input
          type="text"
          placeholder="Buscar por produtor, município, lote, comunidade, anal ou data (dd/mm/aaaa)..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-lg flex-grow"
        />
        <div className="flex gap-2 ml-auto">
            <Button variant="outline" onClick={handleExportToXLS} disabled={filteredEntries.length === 0}>
                <FileSpreadsheet className="mr-2 h-4 w-4" /> Exportar XLS
            </Button>
            <Button variant="outline" onClick={handleExportToPDF} disabled={filteredEntries.length === 0}>
                <FilePdf className="mr-2 h-4 w-4" /> Exportar PDF
            </Button>
        </div>
      </div>

      {paginatedEntries.length === 0 && !loading && (
        <p className="text-center text-muted-foreground">Nenhuma entrada encontrada.</p>
      )}

      {paginatedEntries.length > 0 && (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Produtor</TableHead>
                <TableHead>Município</TableHead>
                <TableHead>Comunidade</TableHead>
                <TableHead>Lote</TableHead>
                <TableHead>Anal.</TableHead>
                <TableHead>Cor</TableHead>
                <TableHead>Peso Líquido (kg)</TableHead>
                <TableHead>Valor Unit. (R$)</TableHead>
                <TableHead>Valor Total (R$)</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedEntries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>{format(new Date(entry.date), "dd/MM/yyyy", { locale: ptBR })}</TableCell>
                  <TableCell>{entry.producer_name}</TableCell>
                  <TableCell>{entry.municipality_name || ""}</TableCell>
                  <TableCell>{entry.community_name || ""}</TableCell>
                  <TableCell>{entry.lot || ""}</TableCell>
                  <TableCell>{entry.anal || ""}</TableCell>
                  <TableCell>{entry.color_name || ""}</TableCell>
                  <TableCell>{entry.net_weight.toFixed(2)}</TableCell>
                  <TableCell>{entry.unit_value.toFixed(2)}</TableCell>
                  <TableCell>{entry.total_value.toFixed(2)}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(entry)}>
                      <Edit className="h-4 w-4 mr-1" /> Editar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="mt-6 flex flex-wrap justify-between items-center gap-4">
            <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Itens por página:</span>
                <Select value={String(itemsPerPage)} onValueChange={handleItemsPerPageChange}>
                    <SelectTrigger className="w-[80px]">
                        <SelectValue placeholder={itemsPerPage} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="25">25</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                        <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="flex items-center gap-2">
                <Button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  variant="outline"
                  size="icon"
                  title="Primeira Página"
                >
                  &lt;&lt;
                </Button>
                <Button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  variant="outline"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" /> Anterior
                </Button>
                <span className="text-sm text-muted-foreground">
                  Página {currentPage} de {totalPages}
                </span>
                <Button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages || totalPages === 0}
                  variant="outline"
                >
                  Próxima <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages || totalPages === 0}
                  variant="outline"
                  size="icon"
                  title="Última Página"
                >
                  &gt;&gt;
                </Button>
            </div>
            <div className="text-sm text-muted-foreground">
                Total de entradas: {filteredEntries.length}
            </div>
          </div>
        </>
      )}

      {/* Modal de Edição */}
      {editingEntry && (
        <EditModal
          isOpen={!!editingEntry}
          onClose={() => setEditingEntry(null)}
          onSave={handleSave}
          title="Editar Entrada"
          isSaving={isSaving}
        >
          <EntryEditForm
            entry={editingEntry}
            onChange={setEditingEntry}
          />
        </EditModal>
      )}
    </div>
  );
};

export default AllEntriesPage;
