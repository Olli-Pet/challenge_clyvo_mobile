import { auth } from "../firebaseConfig";

/**
 * Endereco da API Java (projeto challenge_clyvo).
 *
 * ATENCAO ao trocar de ambiente — este e o unico ponto que precisa mudar:
 *   - Web / iOS simulator ....... http://localhost:8080
 *   - Emulador Android .......... http://10.0.2.2:8080   (localhost la e o proprio emulador)
 *   - Celular fisico (Expo Go) .. http://SEU_IP_NA_REDE:8080  (ex.: http://192.168.0.12:8080)
 */
export const URL_BASE_API = "http://localhost:8080";

/** Erro vindo da API, com o status HTTP preservado para a tela decidir o que mostrar. */
export class ErroApi extends Error {
  constructor(
    public readonly status: number,
    mensagem: string,
    public readonly detalhes?: unknown
  ) {
    super(mensagem);
    this.name = "ErroApi";
  }
}

/**
 * Mensagens para os status que o app pode encontrar. A API responde em varios
 * formatos de erro, entao usamos isto quando nao vier uma mensagem legivel.
 */
function mensagemPadrao(status: number): string {
  switch (status) {
    case 401:
      return "Sua sessao expirou. Entre novamente.";
    case 403:
      return "Voce nao tem permissao para esta acao.";
    case 404:
      return "Nao encontramos o que voce procura.";
    case 409:
      return "Esta operacao conflita com uma regra da clinica.";
    default:
      return status >= 500
        ? "A clinica esta fora do ar no momento. Tente mais tarde."
        : "Nao foi possivel completar a operacao.";
  }
}

/** Extrai a mensagem de erro da resposta, cobrindo os formatos que a API usa. */
async function extrairErro(resposta: Response): Promise<ErroApi> {
  const texto = await resposta.text();

  if (!texto) {
    return new ErroApi(resposta.status, mensagemPadrao(resposta.status));
  }

  try {
    const corpo = JSON.parse(texto);
    // Spring devolve 'message'/'detail'; o handler do projeto pode usar 'erro'.
    // Erros de validacao (400) trazem a lista em 'errors'/'campos'.
    const mensagem =
      corpo.message ?? corpo.detail ?? corpo.erro ?? corpo.error ?? mensagemPadrao(resposta.status);
    return new ErroApi(resposta.status, mensagem, corpo);
  } catch {
    // Resposta que nao e JSON (ex.: erro do servidor em HTML).
    return new ErroApi(resposta.status, mensagemPadrao(resposta.status));
  }
}

/**
 * Faz uma chamada autenticada a API.
 *
 * O ID token do Firebase e obtido a cada chamada: o SDK devolve o token do cache e
 * so renova quando esta perto de expirar, entao isso nao custa uma ida a rede toda vez.
 *
 * @param caminho rota a partir de /api/v1 (ex.: "/triagem/queixas/pet/3")
 */
export async function chamarApi<T>(
  caminho: string,
  opcoes: { metodo?: string; corpo?: unknown } = {}
): Promise<T> {
  const usuario = auth.currentUser;

  if (!usuario) {
    throw new ErroApi(401, "Voce precisa estar logado para acessar a clinica.");
  }

  const token = await usuario.getIdToken();
  const { metodo = "GET", corpo } = opcoes;

  let resposta: Response;
  try {
    resposta = await fetch(`${URL_BASE_API}/api/v1${caminho}`, {
      method: metodo,
      headers: {
        Authorization: `Bearer ${token}`,
        ...(corpo !== undefined ? { "Content-Type": "application/json" } : {}),
      },
      body: corpo !== undefined ? JSON.stringify(corpo) : undefined,
    });
  } catch {
    // fetch so rejeita quando a requisicao nem chegou ao servidor.
    throw new ErroApi(
      0,
      `Nao foi possivel falar com a clinica. Verifique se a API esta rodando em ${URL_BASE_API}.`
    );
  }

  if (!resposta.ok) {
    throw await extrairErro(resposta);
  }

  // 204 e 205 nao tem corpo; devolver undefined evita quebrar o JSON.parse.
  if (resposta.status === 204 || resposta.status === 205) {
    return undefined as T;
  }

  return (await resposta.json()) as T;
}
