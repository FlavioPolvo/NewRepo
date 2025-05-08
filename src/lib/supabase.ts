import { createClient } from "@supabase/supabase-js";

// As chaves da API e a URL do Supabase devem ser carregadas das vari�veis de ambiente.
// Se voc� estiver usando Vite (o que � prov�vel devido � presen�a de 'vite-env.d.ts' no seu projeto),
// certifique-se de que voc� tem um arquivo .env.local na raiz do seu projeto
// com as seguintes vari�veis definidas, prefixadas com VITE_:
// VITE_SUPABASE_URL=https://kjqdtkshdiqfxjhqzcis.supabase.co
// VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtqcWR0a3NoZGlxZnhqaHF6Y2lzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY2MzE2NTQsImV4cCI6MjA2MjIwNzY1NH0.ow0czFzDJik654O8B3aRwazMgzjYjc90JHSiEM1cI24

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Erro Cr�tico: Vari�veis de ambiente do Supabase (VITE_SUPABASE_URL ou VITE_SUPABASE_ANON_KEY) n�o est�o definidas ou n�o foram carregadas corretamente. Verifique seu arquivo .env.local (certifique-se de que as vari�veis come�am com VITE_) e reinicie o servidor de desenvolvimento.");
    throw new Error("Vari�veis de ambiente do Supabase n�o configuradas corretamente para Vite.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function getProducers() {
    const { data, error } = await supabase
        .from("producers")
        .select("*")
        .order("name", { ascending: true }); // Corrigido de nome_completo para name

    if (error) {
        console.error("Error fetching producers:", error);
        throw error;
    }
    return data || [];
}

export async function getEntries() {
    const { data, error } = await supabase
        .from("entries")
        .select(
            `
      *,
      producers:producer_id(id, name, municipality, community)
    ` // Corrigido de nome_completo para name na subquery de producers
        )
        .order("date", { ascending: false });

    if (error) {
        console.error("Error fetching entries:", error);
        throw error;
    }
    return data || [];
}

export async function getMunicipalities() {
    const { data, error } = await supabase
        .from("municipalities")
        .select("*")
        .order("name", { ascending: true });

    if (error) {
        console.error("Error fetching municipalities:", error);
        throw error;
    }
    return data || [];
}

export async function getColors() {
    const { data, error } = await supabase
        .from("colors")
        .select("*")
        .order("code", { ascending: true });

    if (error) {
        console.error("Error fetching colors:", error);
        throw error;
    }
    return data || [];
}

export async function saveProducer(producer: any) {
    // Certifique-se que o objeto producer enviado para c� tem a coluna 'name' e n�o 'nome_completo'
    const { data, error } = await supabase
        .from("producers")
        .upsert(producer)
        .select();

    if (error) {
        console.error("Error saving producer:", error);
        throw error;
    }
    return data?.[0];
}

export async function saveEntry(entry: any) {
    const { data, error } = await supabase.from("entries").upsert(entry).select();

    if (error) {
        console.error("Error saving entry:", error);
        throw error;
    }
    return data?.[0];
}

