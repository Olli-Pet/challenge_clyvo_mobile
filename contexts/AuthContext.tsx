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

/**
 * Estado de autenticação compartilhado por todo o app.
 *
 * Centraliza aqui o que antes cada tela resolvia por conta própria: quem está
 * logado, se a sessão já foi verificada e como sair. O guard de rotas
 * (app/_layout.tsx) e as telas consomem este contexto em vez de ler o
 * AsyncStorage diretamente.
 */

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

    // O Firebase restaura a sessão do AsyncStorage sozinho na abertura do app;
    // aqui apenas reagimos ao resultado e recuperamos o perfil correspondente.
    const cancelarInscricao = onAuthStateChanged(auth, async (usuarioFirebase) => {
      if (!usuarioFirebase) {
        if (ativo) {
          setUsuario(null);
          setCarregando(false);
        }
        return;
      }

      try {
        // A sessão local responde primeiro, para a tela não esperar a rede.
        const sessaoLocal = await obterSessao();
        if (ativo && sessaoLocal) {
          setUsuario(sessaoLocal);
        }

        const perfil = await carregarPerfil(usuarioFirebase.uid);
        if (!ativo) return;

        if (perfil) {
          await salvarSessao(perfil);
          setUsuario(perfil);
        } else if (!sessaoLocal) {
          // Autenticado no Firebase, mas sem perfil: trata como deslogado
          // para não deixar o app num estado a meio caminho.
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

/** Acessa o estado de autenticação. Só funciona dentro do ProvedorAutenticacao. */
export function useAutenticacao(): EstadoAutenticacao {
  const contexto = useContext(ContextoAutenticacao);

  if (!contexto) {
    throw new Error("useAutenticacao precisa estar dentro de ProvedorAutenticacao");
  }

  return contexto;
}
