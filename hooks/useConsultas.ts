import { useQuery } from "@tanstack/react-query";

import {
  Consulta,
  listarConsultasDoPet,
  listarMinhasConsultas,
} from "@/services/api/consultasApi";

/** Hooks do histórico de consultas — os eventos reais de cada pet. */

export const chavesConsultas = {
  todas: ["consultas"] as const,
  minhas: ["consultas", "minhas"] as const,
  doPet: (petId: number) => ["consultas", "pet", petId] as const,
};

/** Consultas de todos os pets do tutor. */
export function useMinhasConsultas() {
  return useQuery({
    queryKey: chavesConsultas.minhas,
    queryFn: listarMinhasConsultas,
  });
}

/** Consultas de um pet específico. Só busca quando há pet selecionado. */
export function useConsultasDoPet(petId: number | null) {
  return useQuery({
    queryKey: chavesConsultas.doPet(petId ?? 0),
    queryFn: () => listarConsultasDoPet(petId!),
    enabled: petId !== null,
  });
}

export type { Consulta };
