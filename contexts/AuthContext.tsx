import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";

import { auth } from "@/services/firebaseConfig";
import {
  carregarPerfil,
  encerrarSessao,
  obterSessao,
  salvarSessao,
  UsuarioSessao,
} from "@/services/sessao";
import { garantirVinculoAntesDeNavegar } from "@/services/api/autenticacaoApi";

type EstadoAutenticacao = {
  /** Perfil do usuário logado, ou null se não há sessão. */
  usuario: UsuarioSessao | null;
  /** true enquanto a sessão salva está sendo restaurada, na abertura do app. */
  carregando: boolean;
  /** Registra o usuário recém-autenticado (login e cadastro chamam isto). */
  entrar: (usuario: UsuarioSessao) => Promise<void>;
  /** Encerra a sessão no Firebase e no dispositivo. */
  sair: () => Promise<void>;
};

const ContextoAutenticacao = createContext<EstadoAutenticacao | null>(null);

export function ProvedorAutenticacao({ children }: { children: React.ReactNode }) {
  const [usuario, setUsuario] = useState<UsuarioSessao | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let ativo = true;

    const cancelarInscricao = onAuthStateChanged(auth, async (usuarioFirebase) => {
      if (!usuarioFirebase) {
        if (ativo) {
          setUsuario(null);
          setCarregando(false);
        }
        return;
      }

      try {
        const sessaoLocal = await obterSessao();
        if (ativo && sessaoLocal) {
          setUsuario(sessaoLocal);
        }

        const perfil = await carregarPerfil(usuarioFirebase.uid);
        if (!ativo) return;

        if (perfil) {

          const perfilNaClinica = await garantirVinculoAntesDeNavegar(
            perfil.tipo === "tutor" ? perfil.cpf : undefined
          );
          if (!ativo) return;

          const efetivo = perfilNaClinica
            ? { ...perfil, tipo: perfilNaClinica }
            : perfil;

          await salvarSessao(efetivo);
          setUsuario(efetivo);
        } else if (!sessaoLocal) {

          setUsuario(null);
        }
      } catch (erro) {
        console.warn("Falha ao restaurar a sessão:", erro);
      } finally {
        if (ativo) setCarregando(false);
      }
    });

    return () => {
      ativo = false;
      cancelarInscricao();
    };
  }, []);

  const valor = useMemo<EstadoAutenticacao>(
    () => ({
      usuario,
      carregando,
      entrar: async (novoUsuario) => {
        await salvarSessao(novoUsuario);
        setUsuario(novoUsuario);
      },
      sair: async () => {
        await encerrarSessao();
        setUsuario(null);
      },
    }),
    [usuario, carregando]
  );

  return (
    <ContextoAutenticacao.Provider value={valor}>{children}</ContextoAutenticacao.Provider>
  );
}

export function useAutenticacao(): EstadoAutenticacao {
  const contexto = useContext(ContextoAutenticacao);

  if (!contexto) {
    throw new Error("useAutenticacao precisa estar dentro de ProvedorAutenticacao");
  }

  return contexto;
}
