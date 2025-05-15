import React, { useState, useMemo, useEffect } from "react";
import { supabase, getProducers } from "@/lib/supabase"; // Ajuste o caminho conforme necessário
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
import { Producer } from "@/types/supabase"; // Ajuste o caminho e a definição do tipo conforme necessário

const ITEMS_PER_PAGE = 10;

const AllProducersPage: React.FC = () => {
  const [producers, setProducers] = useState<Producer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
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
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducers.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredProducers, currentPage]);

  const totalPages = Math.ceil(filteredProducers.length / ITEMS_PER_PAGE);

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

      <div className="mb-4 flex items-center">
        <Input
          type="text"
          placeholder="Buscar por nome, município ou código COMAPI..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm mr-2"
        />
        <Button variant="outline" size="icon">
            <SearchIcon className="h-4 w-4" />
        </Button>
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
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedProducers.map((producer) => (
                <TableRow key={producer.id}>
                  <TableCell>{producer.name}</TableCell>
                  <TableCell>{producer.cod_na_comapi || "N/A"}</TableCell>
                  <TableCell>{producer.municipality || "N/A"}</TableCell>
                  <TableCell>{producer.cpf || "N/A"}</TableCell>
                  <TableCell>{producer.status || "N/A"}</TableCell>
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

export default AllProducersPage;

