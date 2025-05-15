import { createClient } from "@supabase/supabase-js";
import type { Database, Tables, TablesInsert } from "@/types/supabase"; // Assuming types are in a separate file as per previous structure

// Initialize Supabase client
// Ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are in your .env file
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
    console.error("Error: VITE_SUPABASE_URL is not defined.");
    throw new Error("Supabase URL is not defined. Please check your .env file.");
}

if (!supabaseKey) {
    console.error("Error: VITE_SUPABASE_ANON_KEY is not defined.");
    throw new Error(
        "Supabase anon key is not defined. Please check your .env file.",
    );
}

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);

// Function to get all producers
export async function getProducers(): Promise<Tables<"producers">[]> {
    const { data, error } = await supabase.from("producers").select("*");
    if (error) {
        console.error("Error fetching producers:", error);
        throw error;
    }
    return data || [];
}

// Function to get all municipalities
export async function getMunicipalities(): Promise<Tables<"municipalities">[]> {
    const { data, error } = await supabase.from("municipalities").select("*");
    if (error) {
        console.error("Error fetching municipalities:", error);
        throw error;
    }
    return data || [];
}

// Function to get all communities from 'communities' table
export async function getCommunities(): Promise<Tables<"communities">[]> {
    const { data, error } = await supabase.from("communities").select("*");
    if (error) {
        console.error("Error fetching communities:", error);
        throw error;
    }
    return data || [];
}

// Function to get all communities from 'communities_2' table
export async function getCommunitiesFromCommunities2(): Promise<any[]> {
    try {
        const { data, error } = await supabase.from("communities_2").select("*");
        if (error) {
            console.error("Error fetching communities from communities_2:", error);
            throw error;
        }
        return data || [];
    } catch (err) {
        console.error("Error in getCommunitiesFromCommunities2:", err);
        return [];
    }
}

// Function to get all colors
export async function getColors(): Promise<Tables<"colors">[]> {
    const { data, error } = await supabase.from("colors").select("*");
    if (error) {
        console.error("Error fetching colors:", error);
        throw error;
    }
    return data || [];
}

// Function to save a new entry
export async function saveEntry(
    entryData: TablesInsert<"entries">,
): Promise<Tables<"entries"> | null> {
    const { data, error } = await supabase
        .from("entries")
        .insert(entryData)
        .select()
        .single();
    if (error) {
        console.error("Error saving entry:", error);
        throw error;
    }
    return data;
}

// Function to save a new producer
export async function saveProducer(
    producerData: TablesInsert<"producers">,
): Promise<Tables<"producers"> | null> {
    const { data, error } = await supabase
        .from("producers")
        .insert(producerData)
        .select()
        .single();
    if (error) {
        console.error("Error saving producer:", error);
        throw error;
    }
    return data;
}

// Function to get all entries
export async function getEntries(): Promise<Tables<"entries">[]> {
    const { data, error } = await supabase
        .from("entries")
        .select(`
            *,
            producers (
                name,
                municipality,
                community
            )
        `);
    if (error) {
        console.error("Error fetching entries with producer details:", error);
        throw error;
    }
    return data || [];
}

// Ensure all previously defined types (Json, Database, Tables, etc.) are either in this file or correctly imported if they were moved.
// For this example, I'm assuming the types (Database, Tables, TablesInsert) are in '@/types/supabase' as per the import.
// If the type definitions (like the extensive 'export type Database = { ... }') were in this file, they should remain or be correctly referenced.
