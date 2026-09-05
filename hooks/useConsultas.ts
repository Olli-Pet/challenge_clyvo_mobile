import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  buscarPainelDaClinica,
  buscarPendentes,
  cancelarConsulta,
  concluirConsulta,
  confirmarConsulta,
  Consulta,
  EncerramentoConsulta,
  iniciarConsulta,
  listarConsultasDoPet,
  listarMinhasConsultas,
  listarVeterinariosDisponiveis,
  NovaConsulta,
  registrarFalta,
  solicitarConsulta,
} from "@/services/api/consultasApi";

/**
 * Hooks das consultas — agendamento pelo tutor e atendimento pela clínica.
 *
 * Cada mutação invalida as consultas afetadas, então a agenda do veterinário e
 * o histórico do tutor se atualizam sozinhos assim que o status muda.
 */

export const chavesConsultas = {
  todas: ["consultas"] as const,
  minhas: ["consultas", "minhas"] as const,
  doPet: (petId: number) => ["consultas", "pet", petId] as const,
  agenda: ["consultas", "agenda"] as const,
  pendentes: ["consultas", "pendentes"] as const,
  veterinarios: ["veterinarios", "disponiveis"] as const,
};

/** Invalida tudo que exibe consulta, em qualquer perfil. */
function usarInvalidacao() {
  const clienteQuery = useQueryClient();
  return () => {
    clienteQuery.invalidateQueries({ queryKey: chavesConsultas.todas });
  };
}

/* ---------------------------------------------------------------- leitura */

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

/** Veterinários que o tutor pode escolher ao agendar. */
export function useVeterinarios() {
  return useQuery({
    queryKey: chavesConsultas.veterinarios,
    queryFn: listarVeterinariosDisponiveis,
  });
}

/**
 * Painel da clínica (perfil veterinário): solicitações pendentes de qualquer
 * data + os atendimentos do dia informado.
 */
export function useAgenda(data?: string) {
  return useQuery({
    queryKey: [...chavesConsultas.agenda, data ?? "hoje"],
    queryFn: () => buscarPainelDaClinica(data),
  });
}

/** Consultas aguardando confirmação da clínica. */
export function usePendentes() {
  return useQuery({
    queryKey: chavesConsultas.pendentes,
    queryFn: buscarPendentes,
  });
}

/* ---------------------------------------------------------------- escrita */

/** Solicita uma consulta (perfil responsável). */
export function useSolicitarConsulta() {
  const invalidar = usarInvalidacao();

  return useMutation({
    mutationFn: (dados: NovaConsulta) => solicitarConsulta(dados),
    onSuccess: invalidar,
  });
}

/** Cancela a consulta, informando o motivo. */
export function useCancelarConsulta() {
  const invalidar = usarInvalidacao();

  return useMutation({
    mutationFn: ({ id, motivo }: { id: number; motivo: string }) =>
      cancelarConsulta(id, motivo),
    onSuccess: invalidar,
  });
}

/** Confirma a consulta solicitada (perfil veterinário). */
export function useConfirmarConsulta() {
  const invalidar = usarInvalidacao();

  return useMutation({
    mutationFn: (id: number) => confirmarConsulta(id),
    onSuccess: invalidar,
  });
}

/** Inicia o atendimento (perfil veterinário). */
export function useIniciarConsulta() {
  const invalidar = usarInvalidacao();

  return useMutation({
    mutationFn: (id: number) => iniciarConsulta(id),
    onSuccess: invalidar,
  });
}

/** Conclui o atendimento e grava o prontuário (perfil veterinário). */
export function useConcluirConsulta() {
  const clienteQuery = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dados }: { id: number; dados: EncerramentoConsulta }) =>
      concluirConsulta(id, dados),
    onSuccess: () => {
      clienteQuery.invalidateQueries({ queryKey: chavesConsultas.todas });
      // Concluir gera prontuário, que aparece junto dos dados do pet.
      clienteQuery.invalidateQueries({ queryKey: ["pets"] });
    },
  });
}

/** Registra que o paciente não compareceu (perfil veterinário). */
export function useRegistrarFalta() {
  const invalidar = usarInvalidacao();

  return useMutation({
    mutationFn: (id: number) => registrarFalta(id),
    onSuccess: invalidar,
  });
}

export type { Consulta };
