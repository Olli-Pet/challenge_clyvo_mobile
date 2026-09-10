import AsyncStorage from "@react-native-async-storage/async-storage";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "./firebaseConfig";


export const CHAVE_SESSAO = "@olli_user_logado";

/** Perfis do app. "admin" e a administracao da clinica, que gere a equipe. */
export type TipoUsuario = "tutor" | "vet" | "admin";

export type UsuarioSessao = {
  uid: string;
  tipo: TipoUsuario;
  nome?: string;
  email?: string;
  cpf?: string;
  crmv?: string;
  [campo: string]: any;
};

const COLECAO_USUARIOS = "users";
const COLECAO_TUTORES_LEGADO = "tutores";

export async function carregarPerfil(uid: string): Promise<UsuarioSessao | null> {
  const refNova = doc(db, COLECAO_USUARIOS, uid);
  const snapNova = await getDoc(refNova);

  if (snapNova.exists()) {
    const dados = snapNova.data();
    return {
      ...dados,
      uid,

      tipo: (dados.tipo as TipoUsuario) ?? "tutor",
    };
  }

  const snapLegado = await getDoc(doc(db, COLECAO_TUTORES_LEGADO, uid));

  if (!snapLegado.exists()) {
    return null;
  }

  const perfilMigrado: UsuarioSessao = {
    ...snapLegado.data(),
    uid,
    tipo: "tutor",
  };

  // Migra para a coleção nova. Se a escrita falhar (ex.: sem permissão nas
  // security rules), o login não deve quebrar: seguimos com os dados legados
  // e tentamos migrar de novo no próximo acesso.
  try {
    await setDoc(refNova, perfilMigrado, { merge: true });
  } catch (erro) {
    console.warn("Não foi possível migrar o perfil para 'users':", erro);
  }

  return perfilMigrado;
}

/** Grava a sessão no dispositivo, para as telas lerem sem ir ao Firestore. */
export async function salvarSessao(usuario: UsuarioSessao): Promise<void> {
  await AsyncStorage.setItem(CHAVE_SESSAO, JSON.stringify(usuario));
}

/** Lê a sessão salva no dispositivo. Retorna null se não houver. */
export async function obterSessao(): Promise<UsuarioSessao | null> {
  const bruto = await AsyncStorage.getItem(CHAVE_SESSAO);
  if (!bruto) return null;

  try {
    return JSON.parse(bruto) as UsuarioSessao;
  } catch {
    // Sessão corrompida: descarta para o app voltar ao login.
    await AsyncStorage.removeItem(CHAVE_SESSAO);
    return null;
  }
}

/**
 * Atualiza o perfil do usuário logado no Firestore E na sessão local,
 * mantendo os dois lados em sincronia.
 *
 * É o caminho a usar sempre que uma tela alterar dados do usuário
 * (nome, CRMV, telefone...), como no ModalPerfil.
 */
export async function atualizarPerfil(
  alteracoes: Partial<UsuarioSessao>
): Promise<UsuarioSessao> {
  const sessaoAtual = await obterSessao();
  const uid = auth.currentUser?.uid ?? sessaoAtual?.uid;

  if (!uid) {
    throw new Error("Nenhum usuário logado para atualizar.");
  }

  await setDoc(doc(db, COLECAO_USUARIOS, uid), alteracoes, { merge: true });

  const atualizado: UsuarioSessao = {
    ...(sessaoAtual ?? { uid, tipo: "tutor" }),
    ...alteracoes,
    uid,
  };

  await salvarSessao(atualizado);
  return atualizado;
}

/**
 * Recarrega o perfil do Firestore e regrava a sessão local.
 * Útil ao abrir o app, para refletir alterações feitas em outro dispositivo.
 */
export async function sincronizarSessao(): Promise<UsuarioSessao | null> {
  const uid = auth.currentUser?.uid;
  if (!uid) return null;

  const perfil = await carregarPerfil(uid);
  if (perfil) {
    await salvarSessao(perfil);
  }
  return perfil;
}

/** Encerra a sessão: sai do Firebase Auth e limpa os dados locais. */
export async function encerrarSessao(): Promise<void> {
  await auth.signOut();
  await AsyncStorage.removeItem(CHAVE_SESSAO);
}
