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
