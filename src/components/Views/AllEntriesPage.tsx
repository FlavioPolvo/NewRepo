import React, { useState, useMemo, useEffect } from "react";
import { supabase, getEntries, getProducers, getMunicipalities, getColors } from "@/lib/supabase"; // Ajuste o caminho conforme necessário
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
import { ArrowLeft, ArrowRight, Search as SearchIcon, Home as HomeIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Entry, Producer, Municipality, Color, Community } from "@/types/supabase"; // Tipos agora exportados corretamente
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const ITEMS_PER_PAGE = 30;

// Interface para Entry com nomes de produtor, município e cor
interface EnrichedEntry {
  id: number;
  date: string;
  producer_name?: string;
  municipality_name?: string;
  color_name?: string;
  community_name?: string;
  lot?: string | null;
  net_weight: number;
  unit_value: number;
  total_value: number;
  producer_id?: number | null;
  color_code?: string | null;
  // Outros campos necessários da Entry
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
  const navigate = useNavigate();

  useEffect(() => {
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
            // Fields from the original 'entry' object
            id: entry.id,
            date: entry.date,
            lot: entry.lot,
            net_weight: entry.net_weight,
            unit_value: entry.unit_value, 
            total_value: entry.total_value,
            producer_id: entry.producer_id,
            color_code: entry.color_code,

            // Enriched fields
            producer_name: entry.producers?.name || "Desconhecido", // Nome do produtor via join
            municipality_name: entry.municipality || "N/A", // Município diretamente da entrada
            community_name: entry.community || "N/A",       // Comunidade diretamente da entrada
            
            // Color name enrichment remains the same
            color_name: (colorsData || []).find(c => String(c.code) === String(entry.color_code))?.name || `Cor ${entry.color_code}`,
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
    fetchData();
  }, []);

  const filteredEntries = useMemo(() => {
    return entries.filter(
      (entry) =>
        (entry.producer_name && entry.producer_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (entry.municipality_name && entry.municipality_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (entry.lot && entry.lot.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (entry.community_name && entry.community_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (entry.date && format(new Date(entry.date), "dd/MM/yyyy").includes(searchTerm))
    );
  }, [entries, searchTerm]);

  const paginatedEntries = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredEntries.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredEntries, currentPage]);

  const totalPages = Math.ceil(filteredEntries.length / ITEMS_PER_PAGE);

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

      <div className="mb-4 flex items-center">
        <Input
          type="text"
          placeholder="Buscar por produtor, município, lote, comunidade ou data (dd/mm/aaaa)..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-lg mr-2"
        />
         <Button variant="outline" size="icon">
            <SearchIcon className="h-4 w-4" />
        </Button>
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
                <TableHead>Cor</TableHead>
                <TableHead>Peso Líquido (kg)</TableHead>
                <TableHead>Valor Unit. (R$)</TableHead>
                <TableHead>Valor Total (R$)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedEntries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>{format(new Date(entry.date), "dd/MM/yyyy", { locale: ptBR })}</TableCell>
                  <TableCell>{entry.producer_name}</TableCell>
                  <TableCell>{entry.municipality_name || "N/A"}</TableCell>
                  <TableCell>{entry.community_name || "N/A"}</TableCell>
                  <TableCell>{entry.lot || "N/A"}</TableCell>
                  <TableCell>{entry.color_name || "N/A"}</TableCell>
                  <TableCell>{entry.net_weight.toFixed(2)}</TableCell>
                  <TableCell>{entry.unit_value.toFixed(2)}</TableCell>
                  <TableCell>{entry.total_value.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="mt-6 flex justify-between items-center">
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
              disabled={currentPage === totalPages}
              variant="outline"
            >
              Próxima <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default AllEntriesPage;
