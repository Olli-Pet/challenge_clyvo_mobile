import { chamarApi, URL_BASE_API } from "./clienteApi";
import { Veterinario } from "./consultasApi";

/**
 * Administracao da clinica.
 *
 * Cadastrar veterinario deixou de ser publico: a operacao exige o perfil ADMIN,
 * que so a clinica possui. Assim ninguem se declara medico apenas baixando o app.
 */

export type Tutor = {
  id: number;
  nome: string;
  email: string;
  cpf: string;
  dataNascimento: string | null;
};

export type NovoVeterinario = {
  nome: string;
  email: string;
  /** Somente numeros, 11 digitos. */
  cpf: string;
  crmv: string;
  especialidade?: string;
};

/** Equipe clinica completa (inclui inativos, para a administracao acompanhar). */
export async function listarEquipe(): Promise<Veterinario[]> {
  const pagina = await chamarApi<{ content: Veterinario[] }>("/veterinarios?size=100");
  return pagina.content ?? [];
}

/** Tutores cadastrados na clinica. */
export async function listarTutores(): Promise<Tutor[]> {
  const pagina = await chamarApi<{ content: Tutor[] }>("/responsaveis?size=100");
  return pagina.content ?? [];
}

/** Cadastra um veterinario. So a administracao consegue. */
export function cadastrarVeterinario(dados: NovoVeterinario): Promise<Veterinario> {
  return chamarApi<Veterinario>("/veterinarios", { metodo: "POST", corpo: dados });
}

/**
 * Remove o veterinario da equipe.
 *
 * A API desativa em vez de apagar: as consultas e prontuarios que ele assinou
 * continuam no historico, mas ele deixa de aparecer para agendamento e perde
 * o acesso ao aplicativo.
 */
export function removerVeterinario(id: number): Promise<void> {
  return chamarApi<void>(`/veterinarios/${id}`, { metodo: "DELETE" });
}

/**
 * Diz se o e-mail pertence a um veterinario cadastrado pela clinica.
 *
 * Consultado na tela de primeiro acesso ANTES de criar a conta no Firebase, e
 * por isso e a unica chamada que nao envia token — o usuario ainda nao existe.
 */
export async function ehVeterinarioDaEquipe(email: string): Promise<boolean> {
  const resposta = await fetch(
    `${URL_BASE_API}/api/v1/veterinarios/e-da-equipe?email=${encodeURIComponent(email)}`
  );

  if (!resposta.ok) {
    throw new Error(`A clinica nao respondeu (${resposta.status})`);
  }

  return (await resposta.json()) as boolean;
}
