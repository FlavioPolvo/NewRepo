import React, { useState, useMemo, useEffect } from "react";
import { supabase, getProducers, updateProducer } from "@/lib/supabase"; // Adicionado updateProducer
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
import { Producer } from "@/types/supabase";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import EditModal from "@/components/EditModal"; // Adicionado
import ProducerEditForm from "@/components/ProducerEditForm"; // Adicionado

const AllProducersPage: React.FC = () => {
  const [producers, setProducers] = useState<Producer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const navigate = useNavigate();
  
  // Estados para edição
  const [editingProducer, setEditingProducer] = useState<any | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const fetchProducers = async () => {
    setLoading(true);
    try {
      const data = await getProducers();
      setProducers(data || []);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Erro ao buscar produtores");
      setProducers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducers();
  }, []);

  const filteredProducers = useMemo(() => {
    return producers.filter(
      (producer) =>
        producer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (producer.municipality &&
          producer.municipality.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (producer.cod_na_comapi &&
          producer.cod_na_comapi.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [producers, searchTerm]);

  const paginatedProducers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredProducers.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredProducers, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredProducers.length / itemsPerPage);

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1);
  };

  const handleExportToXLS = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredProducers.map(p => ({
      Nome: p.name,
      "Código COMAPI": p.cod_na_comapi || "",
      Município: p.municipality || "",
      CPF: p.cpf || "",
      Status: p.status || "",
    })));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Produtores");
    XLSX.writeFile(workbook, `produtores_export_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleExportToPDF = () => {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [["Nome", "Código COMAPI", "Município", "CPF", "Status"]],
      body: filteredProducers.map(p => [
        p.name,
        p.cod_na_comapi || "",
        p.municipality || "",
        p.cpf || "",
        p.status || "",
      ]),
    });
    doc.save(`produtores_export_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  // Funções para edição
  const handleEdit = (producer: any) => {
    setEditingProducer({...producer});
  };

  const handleSave = async () => {
    if (!editingProducer) return;
    
    setIsSaving(true);
    try {
      await updateProducer(editingProducer.id, editingProducer);
      // Atualizar a lista de produtores após salvar
      await fetchProducers();
      setEditingProducer(null);
    } catch (error) {
      console.error("Erro ao atualizar produtor:", error);
      alert("Erro ao salvar as alterações. Por favor, tente novamente.");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return <div className="p-4 text-center">Carregando produtores...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">Erro: {error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <header className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-primary">Todos os Produtores</h1>
        <Button variant="outline" onClick={() => navigate("/")}>
          <HomeIcon className="mr-2 h-4 w-4" /> Voltar para Home
        </Button>
      </header>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Input
          type="text"
          placeholder="Buscar por nome, município ou código COMAPI..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm flex-grow"
        />
        <div className="flex gap-2 ml-auto">
            <Button variant="outline" onClick={handleExportToXLS} disabled={filteredProducers.length === 0}>
                <FileSpreadsheet className="mr-2 h-4 w-4" /> Exportar XLS
            </Button>
            <Button variant="outline" onClick={handleExportToPDF} disabled={filteredProducers.length === 0}>
                <FilePdf className="mr-2 h-4 w-4" /> Exportar PDF
            </Button>
        </div>
      </div>

      {paginatedProducers.length === 0 && !loading && (
        <p className="text-center text-muted-foreground">Nenhum produtor encontrado.</p>
      )}

      {paginatedProducers.length > 0 && (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Código COMAPI</TableHead>
                <TableHead>Município</TableHead>
                <TableHead>CPF</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedProducers.map((producer) => (
                <TableRow key={producer.id}>
                  <TableCell>{producer.name}</TableCell>
                  <TableCell>{producer.cod_na_comapi || ""}</TableCell>
                  <TableCell>{producer.municipality || ""}</TableCell>
                  <TableCell>{producer.cpf || ""}</TableCell>
                  <TableCell>{producer.status || ""}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(producer)}>
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
                Total de produtores: {filteredProducers.length}
            </div>
          </div>
        </>
      )}

      {/* Modal de Edição */}
      {editingProducer && (
        <EditModal
          isOpen={!!editingProducer}
          onClose={() => setEditingProducer(null)}
          onSave={handleSave}
          title="Editar Produtor"
          isSaving={isSaving}
        >
          <ProducerEditForm
            producer={editingProducer}
            onChange={setEditingProducer}
          />
        </EditModal>
      )}
    </div>
  );
};

export default AllProducersPage;
