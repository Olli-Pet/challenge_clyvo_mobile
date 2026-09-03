import React, { useEffect } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { Stack, useRouter, useSegments } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { ProvedorAutenticacao, useAutenticacao } from "@/contexts/AuthContext";

/**
 * Cliente do TanStack Query, criado uma única vez fora do componente para não
 * ser recriado a cada render (o que descartaria o cache).
 */
const clienteQuery = new QueryClient({
  defaultOptions: {
    queries: {
      // Dados da clínica mudam com pouca frequência; um minuto evita
      // refazer a mesma requisição a cada troca de tela.
      staleTime: 60_000,
      retry: 1,
    },
  },
});

/** Telas acessíveis sem estar autenticado. */
const ROTAS_PUBLICAS = ["index", "Cadastro", "cadastrovet"];

/**
 * Guard de navegação: mantém a rota coerente com o estado de autenticação.
 *
 * Quem não está logado é enviado ao login — inclusive ao digitar a URL de uma
 * tela interna direto no navegador. Quem já está logado não fica preso na tela
 * de login ao reabrir o app.
 */
function ControleDeAcesso({ children }: { children: React.ReactNode }) {
  const { usuario, carregando } = useAutenticacao();
  const segmentos = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (carregando) return;

    // Sem segmento, a rota é a raiz (index), que é pública.
    const rotaAtual = segmentos[0] ?? "index";
    const emRotaPublica = ROTAS_PUBLICAS.includes(rotaAtual);

    if (!usuario && !emRotaPublica) {
      router.replace("/");
      return;
    }

    if (usuario && emRotaPublica) {
      router.replace(usuario.tipo === "vet" ? "/homevet" : "/Home");
    }
  }, [usuario, carregando, segmentos, router]);

  // Enquanto a sessão é verificada, evita exibir a tela errada por um instante.
  if (carregando) {
    return (
      <View style={estilos.carregando}>
        <ActivityIndicator size="large" color="#FDCB5C" />
      </View>
    );
  }

  return <>{children}</>;
}

export default function Layout() {
  return (
    <QueryClientProvider client={clienteQuery}>
      <ProvedorAutenticacao>
        <ControleDeAcesso>
          <Stack screenOptions={{ headerShown: false }} />
        </ControleDeAcesso>
      </ProvedorAutenticacao>
    </QueryClientProvider>
  );
}

const estilos = StyleSheet.create({
  carregando: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFF",
  },
});
