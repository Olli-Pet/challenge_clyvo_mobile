import { chamarApi } from "./clienteApi";

/**
 * Triagem por questionario (Fluxo 1 da API).
 *
 * O tutor escolhe uma queixa, responde um protocolo fechado e a API classifica a
 * urgencia. Os pesos das respostas ficam no servidor de proposito: e a regra clinica
 * que justifica a API existir, e o app nao deve conseguir calcular o resultado sozinho.
 */

/** Faixas de urgencia. Cada uma ja vem com prazo e acao sugerida pela API. */
export type ClassificacaoTriagem =
  | "EMERGENCIA"
  | "URGENTE"
  | "POUCO_URGENTE"
  | "ORIENTACAO";

export type AcaoSugerida = "IR_AGORA" | "AGENDAR" | "ACOMPANHAR" | "AGENDAR_RETORNO";

export type QueixaResumo = {
  id: number;
  nome: string;
  descricao: string;
  ordem: number;
};

export type OpcaoResposta = {
  id: number;
  texto: string;
  ordem: number;
};

export type PerguntaTriagem = {
  id: number;
  texto: string;
  ordem: number;
  obrigatoria: boolean;
  /**
   * Pergunta condicional: so deve ser exibida se a opcao indicada tiver sido
   * escolhida. A API nao cobra resposta de pergunta cuja condicao nao foi satisfeita.
   */
  dependeDeOpcaoId: number | null;
  opcoes: OpcaoResposta[];
};

export type ProtocoloTriagem = {
  queixaId: number;
  nome: string;
  descricao: string;
  perguntas: PerguntaTriagem[];
};

export type RespostaInformada = {
  perguntaId: number;
  opcaoId: number;
};

export type ResultadoTriagem = {
  id: number;
  petId: number;
  nomePet: string;
  queixa: string;
  classificacao: ClassificacaoTriagem;
  prazoRecomendado: string | null;
  recomendaConsulta: boolean;
  acaoSugerida: AcaoSugerida;
  motivoSugerido: string | null;
  observacoesClinicas: string[];
  orientacoes: string[];
  status: string;
  consultaId: number | null;
  expiraEm: string;
  aviso: string;
};

/** Queixas disponiveis para o pet (a API filtra pela especie). */
export function buscarQueixas(petId: number): Promise<QueixaResumo[]> {
  return chamarApi<QueixaResumo[]>(`/triagem/queixas/pet/${petId}`);
}

/** Perguntas do protocolo da queixa escolhida. */
export function buscarProtocolo(queixaId: number): Promise<ProtocoloTriagem> {
  return chamarApi<ProtocoloTriagem>(`/triagem/protocolos/${queixaId}`);
}

/** Envia as respostas e recebe a classificacao de urgencia. */
export function enviarTriagem(dados: {
  petId: number;
  queixaId: number;
  respostas: RespostaInformada[];
}): Promise<ResultadoTriagem> {
  return chamarApi<ResultadoTriagem>("/triagem", { metodo: "POST", corpo: dados });
}

/** Historico de triagens do tutor (a API devolve paginado). */
export async function listarMinhasTriagens(): Promise<ResultadoTriagem[]> {
  const pagina = await chamarApi<{ content: ResultadoTriagem[] }>("/triagem/minhas?size=50");
  return pagina.content ?? [];
}

/** Uma triagem especifica. */
export function buscarTriagem(id: number): Promise<ResultadoTriagem> {
  return chamarApi<ResultadoTriagem>(`/triagem/${id}`);
}

/**
 * Refaz a triagem com novas respostas. A API reavalia do zero, entao a
 * classificacao pode mudar.
 */
export function refazerTriagem(
  id: number,
  dados: { petId: number; queixaId: number; respostas: RespostaInformada[] }
): Promise<ResultadoTriagem> {
  return chamarApi<ResultadoTriagem>(`/triagem/${id}`, { metodo: "PUT", corpo: dados });
}

/** Remove a triagem do historico. */
export function excluirTriagem(id: number): Promise<void> {
  return chamarApi<void>(`/triagem/${id}`, { metodo: "DELETE" });
}

/**
 * Decide se uma pergunta deve aparecer, dadas as respostas ja informadas.
 * Perguntas sem dependencia aparecem sempre.
 */
export function perguntaVisivel(
  pergunta: PerguntaTriagem,
  respostas: RespostaInformada[]
): boolean {
  if (pergunta.dependeDeOpcaoId === null) return true;
  return respostas.some((r) => r.opcaoId === pergunta.dependeDeOpcaoId);
}

/** Aparencia de cada classificacao na tela de resultado. */
export const VISUAL_CLASSIFICACAO: Record<
  ClassificacaoTriagem,
  { rotulo: string; cor: string; icone: string }
> = {
  EMERGENCIA: { rotulo: "Emergência", cor: "#D64545", icone: "alert-circle" },
  URGENTE: { rotulo: "Urgente", cor: "#E8833A", icone: "time" },
  POUCO_URGENTE: { rotulo: "Pouco urgente", cor: "#E7B84C", icone: "calendar" },
  ORIENTACAO: { rotulo: "Orientação", cor: "#4CAF7D", icone: "heart" },
};
