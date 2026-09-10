import React, { useEffect } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { Stack, useRouter, useSegments } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { ProvedorAutenticacao, useAutenticacao } from "@/contexts/AuthContext";

const clienteQuery = new QueryClient({
  defaultOptions: {
    queries: {

      staleTime: 60_000,
      retry: 1,
    },
  },
});

function homeDoPerfil(tipo: string) {
  if (tipo === "vet") return "/homevet" as const;
  if (tipo === "admin") return "/Administracao" as const;
  return "/Home" as const;
}

const ROTAS_PUBLICAS = ["index", "Cadastro", "cadastrovet"];

function ControleDeAcesso({ children }: { children: React.ReactNode }) {
  const { usuario, carregando } = useAutenticacao();
  const segmentos = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (carregando) return;

    const rotaAtual = segmentos[0] ?? "index";
    const emRotaPublica = ROTAS_PUBLICAS.includes(rotaAtual);

    if (!usuario && !emRotaPublica) {
      router.replace("/");
      return;
    }

    if (usuario && emRotaPublica) {
      router.replace(homeDoPerfil(usuario.tipo));
    }
  }, [usuario, carregando, segmentos, router]);

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
