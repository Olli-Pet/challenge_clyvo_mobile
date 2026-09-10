import { chamarApi, ErroApi } from "./clienteApi";
import { TipoUsuario } from "../sessao";
import { avisar } from "../avisar";

/**
 * Vinculo entre a conta do Firebase e o cadastro da clinica.
 *
 * O app nao faz um segundo login: a API valida o proprio ID token do Firebase.
 * O que falta e dizer a ela o que o Firebase nao sabe — o CPF do tutor.
 */

export type RegistroFirebase = {
  /**
   * Somente numeros, 11 digitos. A API recusa CPF formatado.
   * Obrigatorio para criar um tutor; dispensavel quando o e-mail do token ja
   * pertence a um cadastro da clinica (o caso do veterinario).
   */
  cpf?: string;
  /** Opcional, no formato ISO (aaaa-mm-dd). */
  dataNascimento?: string;
};

export type ContaClinica = {
  token: string;
  tipo?: string;
  /** RESPONSAVEL | VETERINARIO | ADMIN — a API e quem sabe o perfil real. */
  perfil?: string;
  nome?: string;
  expiraEm?: string;
};

/**
 * Traduz o perfil da API para o tipo usado nas telas.
 *
 * A clinica e a autoridade sobre quem e quem: o documento do Firestore e
 * gravado pelo proprio cadastro e nao pode ser a fonte da verdade para
 * permissao — um tutor que se cadastrasse com um e-mail da equipe teria
 * "tutor" gravado la, mas a API o reconhece pelo cadastro dela.
 */
export function tipoDoPerfilDaApi(perfil?: string): TipoUsuario | null {
  if (perfil === "ADMIN") return "admin";
  if (perfil === "VETERINARIO") return "vet";
  if (perfil === "RESPONSAVEL") return "tutor";
  return null;
}

/** Remove pontos e tracos: a API exige 11 digitos crus. */
export function apenasDigitos(valor: string): string {
  return valor.replace(/\D/g, "");
}

/**
 * Cria (ou recupera) o cadastro do tutor na clinica a partir da conta do Firebase.
 *
 * A chamada e idempotente do lado da API, entao pode ser feita apos todo login sem
 * efeito colateral. Nome e e-mail vem do proprio token.
 */
export async function registrarContaNaClinica(dados: RegistroFirebase): Promise<ContaClinica> {
  return chamarApi<ContaClinica>("/auth/registrar", {
    metodo: "POST",
    corpo: {
      cpf: dados.cpf ? apenasDigitos(dados.cpf) : null,
      dataNascimento: dados.dataNascimento ?? null,
    },
  });
}

/**
 * Tempo maximo de espera pelo vinculo antes de liberar a navegacao.
 *
 * O vinculo precisa terminar ANTES das telas internas, senao elas chamam a API
 * como PRE_CADASTRO e recebem 403. Mas se a clinica estiver fora do ar a espera
 * nao pode ser eterna: passado o limite, o app segue e refaz o vinculo depois.
 *
 * Sao 60 segundos porque hospedagens gratuitas hibernam o servico apos alguns
 * minutos sem uso, e a primeira chamada acorda a maquina — o que leva perto de
 * um minuto. Com um limite curto, todo primeiro login do dia falharia.
 * Localmente a resposta vem em milissegundos, entao o valor nunca e atingido.
 */
const LIMITE_DE_ESPERA_MS = 60_000;

/** Resolve com `false` se a promessa nao terminar dentro do limite. */
function comLimiteDeTempo<T>(promessa: Promise<T | null>): Promise<T | null> {
  return Promise.race([
    promessa,
    new Promise<T | null>((resolve) =>
      setTimeout(() => resolve(null), LIMITE_DE_ESPERA_MS)
    ),
  ]);
}

/**
 * Garante o vinculo com a clinica antes de liberar as telas internas.
 *
 * Espera no maximo alguns segundos: o suficiente para o caso normal, sem travar
 * o app quando a API nao responde.
 */
export function garantirVinculoAntesDeNavegar(
  cpf?: string
): Promise<TipoUsuario | null> {
  return comLimiteDeTempo(garantirCadastroNaClinica(cpf));
}

/**
 * Garante o vinculo com a clinica sem interromper o fluxo de login.
 *
 * Para o tutor, cria o cadastro a partir do CPF. Para o veterinario, o CPF nao
 * se aplica: a API reconhece o e-mail do token como um cadastro ja existente e
 * apenas grava o firebase_uid nele — e isso que faz o app ser aceito como
 * VETERINARIO nas rotas da clinica.
 *
 * A API e um complemento: se estiver fora do ar, o app segue funcionando com o
 * Firebase. Por isso as falhas aqui sao registradas mas nao propagadas.
 *
 * @returns true se o vinculo com a clinica esta garantido.
 */
export async function garantirCadastroNaClinica(
  cpf?: string
): Promise<TipoUsuario | null> {
  try {
    const conta = await registrarContaNaClinica({ cpf });
    return tipoDoPerfilDaApi(conta.perfil);
  } catch (erro) {
    if (erro instanceof ErroApi) {
      // 400 e 409 sao problemas com os DADOS enviados: CPF fora do formato,
      // ou ja usado por outro cadastro. O usuario precisa agir, entao avisam.
      if (erro.status === 400 || erro.status === 409) {
        console.warn(`Vinculo com a clinica recusado (${erro.status}):`, erro.message);
        avisar(
          "Cadastro incompleto na clínica",
          `${erro.message}\n\nVocê está logado, mas as consultas e a triagem só ` +
            "funcionarão depois que isso for corrigido."
        );
        return null;
      }

      // 401 e 403 aqui significam que a clinica nao aceitou o token — nao que
      // esteja fora do ar. Nao ha o que o usuario faca alem de entrar de novo,
      // e avisar em toda tela seria ruido: fica so no log.
      if (erro.status === 401 || erro.status === 403) {
        console.warn(`Token recusado pela clinica (${erro.status}): ${erro.message}`);
        return null;
      }

      // Os demais casos sao a API fora do ar: o vinculo se refaz no proximo login.
      console.warn(`Clinica indisponivel (${erro.status}): ${erro.message}`);
      return null;
    }
    console.warn("Falha inesperada ao vincular a conta da clinica:", erro);
    return null;
  }
}
