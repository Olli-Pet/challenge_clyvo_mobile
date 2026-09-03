import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  buscarProtocolo,
  buscarQueixas,
  enviarTriagem,
  excluirTriagem,
  listarMinhasTriagens,
  refazerTriagem,
  RespostaInformada,
} from "@/services/api/triagemApi";

/**
 * Hooks da triagem por questionário.
 *
 * Assim como em usePets, as telas não falam com o HTTP diretamente. As mutações
 * invalidam o histórico, de modo que a lista de triagens se atualiza sozinha
 * após enviar, refazer ou excluir uma avaliação.
 */

export const chavesTriagem = {
  todas: ["triagem"] as const,
  minhas: ["triagem", "minhas"] as const,
  queixas: (petId: number) => ["triagem", "queixas", petId] as const,
  protocolo: (queixaId: number) => ["triagem", "protocolo", queixaId] as const,
};

type DadosTriagem = {
  petId: number;
  queixaId: number;
  respostas: RespostaInformada[];
};

/** Histórico de triagens dos pets do tutor. */
export function useMinhasTriagens() {
  return useQuery({
    queryKey: chavesTriagem.minhas,
    queryFn: listarMinhasTriagens,
  });
}

/**
 * Queixas disponíveis para o pet. Só consulta quando há um pet escolhido —
 * é o que `enabled` controla.
 */
export function useQueixas(petId: number | null) {
  return useQuery({
    queryKey: chavesTriagem.queixas(petId ?? 0),
    queryFn: () => buscarQueixas(petId!),
    enabled: petId !== null,
  });
}

/** Perguntas do protocolo da queixa escolhida. */
export function useProtocolo(queixaId: number | null) {
  return useQuery({
    queryKey: chavesTriagem.protocolo(queixaId ?? 0),
    queryFn: () => buscarProtocolo(queixaId!),
    enabled: queixaId !== null,
  });
}

/** Envia as respostas e recebe a classificação de urgência. */
export function useEnviarTriagem() {
  const clienteQuery = useQueryClient();

  return useMutation({
    mutationFn: (dados: DadosTriagem) => enviarTriagem(dados),
    onSuccess: () => {
      clienteQuery.invalidateQueries({ queryKey: chavesTriagem.minhas });
    },
  });
}

/** Reavalia uma triagem já registrada com novas respostas. */
export function useRefazerTriagem() {
  const clienteQuery = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dados }: { id: number; dados: DadosTriagem }) =>
      refazerTriagem(id, dados),
    onSuccess: () => {
      clienteQuery.invalidateQueries({ queryKey: chavesTriagem.minhas });
    },
  });
}

/** Remove uma triagem do histórico. */
export function useExcluirTriagem() {
  const clienteQuery = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => excluirTriagem(id),
    onSuccess: () => {
      clienteQuery.invalidateQueries({ queryKey: chavesTriagem.minhas });
    },
  });
}
