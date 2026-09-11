import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  cadastrarVeterinario,
  listarEquipe,
  NovoVeterinario,
  removerVeterinario,
} from "@/services/api/adminApi";

/** Hooks da administração da clínica: gestão da equipe e visão dos tutores. */

export const chavesAdmin = {
  equipe: ["admin", "equipe"] as const,
};

/** Veterinários cadastrados na clínica. */
export function useEquipe() {
  return useQuery({
    queryKey: chavesAdmin.equipe,
    queryFn: listarEquipe,
  });
}

/** Cadastra um veterinário na equipe. */
export function useCadastrarVeterinario() {
  const clienteQuery = useQueryClient();

  return useMutation({
    mutationFn: (dados: NovoVeterinario) => cadastrarVeterinario(dados),
    onSuccess: () => {
      clienteQuery.invalidateQueries({ queryKey: chavesAdmin.equipe });

      clienteQuery.invalidateQueries({ queryKey: ["veterinarios"] });
    },
  });
}

/** Remove um veterinário da equipe. */
export function useRemoverVeterinario() {
  const clienteQuery = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => removerVeterinario(id),
    onSuccess: () => {
      clienteQuery.invalidateQueries({ queryKey: chavesAdmin.equipe });
      clienteQuery.invalidateQueries({ queryKey: ["veterinarios"] });
    },
  });
}
