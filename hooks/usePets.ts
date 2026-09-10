import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  atualizarPet,
  criarPet,
  DadosPet,
  listarMeusPets,
  listarTodosOsPets,
  Pet,
  removerPet,
} from "@/services/api/petsApi";

/** Chaves de cache. Centralizadas para não haver divergência entre telas. */
export const chavesPets = {
  todos: ["pets"] as const,
  meus: ["pets", "meus"] as const,
  daClinica: ["pets", "clinica"] as const,
};

/** Pets do tutor autenticado. */
export function useMeusPets() {
  return useQuery({
    queryKey: chavesPets.meus,
    queryFn: listarMeusPets,
  });
}

/** Todos os pets da clínica (perfil veterinário). */
export function usePetsDaClinica() {
  return useQuery({
    queryKey: chavesPets.daClinica,
    queryFn: listarTodosOsPets,
  });
}

/**
 * Cadastra um pet. Ao concluir, invalida as listas para que a Home e as demais
 * telas já mostrem o novo pet assim que forem exibidas.
 */
export function useCriarPet() {
  const clienteQuery = useQueryClient();

  return useMutation({
    mutationFn: (dados: DadosPet) => criarPet(dados),
    onSuccess: () => {
      clienteQuery.invalidateQueries({ queryKey: chavesPets.todos });
    },
  });
}

/** Atualiza um pet existente (dados cadastrais ou evolução do prontuário). */
export function useAtualizarPet() {
  const clienteQuery = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dados }: { id: number; dados: DadosPet }) =>
      atualizarPet(id, dados),
    onSuccess: () => {
      clienteQuery.invalidateQueries({ queryKey: chavesPets.todos });
    },
  });
}

/** Remove um pet. */
export function useRemoverPet() {
  const clienteQuery = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => removerPet(id),
    onSuccess: () => {
      clienteQuery.invalidateQueries({ queryKey: chavesPets.todos });
    },
  });
}

export type { Pet };
