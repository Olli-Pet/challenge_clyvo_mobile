import { chamarApi, ErroApi } from "./clienteApi";

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
  perfil?: string;
  nome?: string;
  expiraEm?: string;
};

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
export async function garantirCadastroNaClinica(cpf?: string): Promise<boolean> {
  try {
    await registrarContaNaClinica({ cpf });
    return true;
  } catch (erro) {
    if (erro instanceof ErroApi) {
      // 409 = CPF ja usado por OUTRO cadastro. E um conflito real de dados,
      // diferente de "ja registrado", que a API trata como sucesso.
      if (erro.status === 409) {
        console.warn("CPF ja vinculado a outro cadastro na clinica:", erro.message);
        return false;
      }
      console.warn(`Clinica indisponivel (${erro.status}): ${erro.message}`);
      return false;
    }
    console.warn("Falha inesperada ao vincular a conta da clinica:", erro);
    return false;
  }
}
