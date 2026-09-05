import { chamarApi } from "./clienteApi";

/**
 * Consultas — o histórico real de atendimentos de cada pet.
 *
 * É a origem dos eventos exibidos na Home e no Histórico. Antes essas telas
 * mostravam exemplos fixos no código, iguais para todo pet de todo usuário.
 */

export type StatusConsulta =
  | "SOLICITADA"
  | "CONFIRMADA"
  | "EM_ATENDIMENTO"
  | "CONCLUIDA"
  | "CANCELADA"
  | "NAO_COMPARECEU";

export type Consulta = {
  id: number;
  petId: number;
  nomePet: string;
  veterinarioId: number;
  nomeVeterinario: string;
  nomeResponsavel: string;
  /** ISO 8601: aaaa-mm-ddThh:mm:ss */
  dataHora: string;
  motivo: string;
  status: StatusConsulta;
  observacoes: string | null;
  proximosStatus: StatusConsulta[];
};

/** Consultas dos pets do tutor autenticado, da mais recente para a mais antiga. */
export async function listarMinhasConsultas(): Promise<Consulta[]> {
  const pagina = await chamarApi<{ content: Consulta[] }>("/consultas/minhas?size=50");
  return pagina.content ?? [];
}

/** Consultas de um pet específico. */
export async function listarConsultasDoPet(petId: number): Promise<Consulta[]> {
  const resposta = await chamarApi<Consulta[] | { content: Consulta[] }>(
    `/consultas/pet/${petId}`
  );
  // A API devolve lista simples aqui, mas aceitar as duas formas evita
  // quebrar caso o endpoint passe a paginar.
  return Array.isArray(resposta) ? resposta : (resposta.content ?? []);
}

export type Veterinario = {
  id: number;
  nome: string;
  email: string;
  cpf: string;
  crmv: string;
  especialidade: string | null;
};

/** Veterinarios que atendem na clinica, para o tutor escolher. */
export function listarVeterinariosDisponiveis(): Promise<Veterinario[]> {
  return chamarApi<Veterinario[]>("/veterinarios/disponiveis");
}

export type NovaConsulta = {
  petId: number;
  veterinarioId: number;
  /** ISO local, sem fuso: aaaa-mm-ddThh:mm:ss */
  dataHora: string;
  motivo: string;
  /** Quando a consulta nasce de uma triagem, o relato vai junto. */
  triagemId?: number | null;
};

/** Solicita uma consulta. Nasce como SOLICITADA, aguardando a clinica. */
export function solicitarConsulta(dados: NovaConsulta): Promise<Consulta> {
  return chamarApi<Consulta>("/consultas", { metodo: "POST", corpo: dados });
}

/** Cancela a consulta. Exige motivo e respeita a antecedencia minima. */
export function cancelarConsulta(id: number, motivo: string): Promise<Consulta> {
  return chamarApi<Consulta>(`/consultas/${id}/cancelar`, {
    metodo: "PATCH",
    corpo: { motivo },
  });
}

/**
 * Avanca a consulta no fluxo da clinica (perfil veterinario):
 * SOLICITADA -> CONFIRMADA -> EM_ATENDIMENTO -> CONCLUIDA.
 */
export function confirmarConsulta(id: number): Promise<Consulta> {
  return chamarApi<Consulta>(`/consultas/${id}/confirmar`, { metodo: "PATCH" });
}

export function iniciarConsulta(id: number): Promise<Consulta> {
  return chamarApi<Consulta>(`/consultas/${id}/iniciar`, { metodo: "PATCH" });
}

export type EncerramentoConsulta = {
  procedimento: string;
  localAtendimento: string;
  observacoes?: string;
};

/**
 * Conclui o atendimento. Encerrar a consulta e o mesmo ato de registrar o
 * prontuario, por isso procedimento e local sao obrigatorios: a API grava os
 * dois na mesma transacao.
 */
export function concluirConsulta(
  id: number,
  dados: EncerramentoConsulta
): Promise<Consulta> {
  return chamarApi<Consulta>(`/consultas/${id}/concluir`, {
    metodo: "PATCH",
    corpo: dados,
  });
}

/** Registra que o paciente nao compareceu. */
export function registrarFalta(id: number): Promise<Consulta> {
  return chamarApi<Consulta>(`/consultas/${id}/falta`, { metodo: "PATCH" });
}

/**
 * Agenda do veterinario logado em UM dia (aaaa-mm-dd). Sem data, a API
 * assume hoje.
 */
export function buscarAgendaDoDia(data?: string): Promise<Consulta[]> {
  return chamarApi<Consulta[]>(`/agenda${data ? `?data=${data}` : ""}`);
}

/** Consultas aguardando confirmacao da clinica (a API devolve paginado). */
export async function buscarPendentes(): Promise<Consulta[]> {
  const pagina = await chamarApi<{ content: Consulta[] }>("/agenda/pendentes?size=50");
  return pagina.content ?? [];
}

/**
 * Painel da clinica: as solicitacoes pendentes mais os atendimentos do dia.
 *
 * A API separa as duas coisas porque /agenda mostra apenas um dia, e uma
 * consulta marcada para a semana que vem nao apareceria ali. Juntar as duas
 * evita que o veterinario perca uma solicitacao por ser de outra data.
 */
export async function buscarPainelDaClinica(data?: string): Promise<Consulta[]> {
  const [pendentes, doDia] = await Promise.all([
    buscarPendentes(),
    buscarAgendaDoDia(data),
  ]);

  const porId = new Map<number, Consulta>();
  [...pendentes, ...doDia].forEach((consulta) => porId.set(consulta.id, consulta));

  return [...porId.values()].sort((a, b) => a.dataHora.localeCompare(b.dataHora));
}

/**
 * Como cada situação aparece no cartão de evento.
 * O CardEventos aceita "finalizada" | "agendada" | "cancelada".
 */
export function situacaoDoCartao(
  status: StatusConsulta
): "finalizada" | "agendada" | "cancelada" {
  switch (status) {
    case "CONCLUIDA":
      return "finalizada";
    case "CANCELADA":
    case "NAO_COMPARECEU":
      return "cancelada";
    default:
      return "agendada";
  }
}

/** Rótulo legível de cada status, para o texto da descrição. */
export const DESCRICAO_STATUS: Record<StatusConsulta, string> = {
  SOLICITADA: "Consulta solicitada, aguardando confirmação da clínica.",
  CONFIRMADA: "Consulta confirmada pela clínica.",
  EM_ATENDIMENTO: "Atendimento em andamento.",
  CONCLUIDA: "Atendimento concluído.",
  CANCELADA: "Consulta cancelada.",
  NAO_COMPARECEU: "O paciente não compareceu à consulta.",
};

/** ISO -> dd/mm/aaaa, formato usado nos cartões. */
export function dataDoEvento(iso: string): string {
  const [data] = iso.split("T");
  const [ano, mes, dia] = data.split("-");
  return `${dia}/${mes}/${ano}`;
}
