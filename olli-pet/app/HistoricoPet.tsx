import React, { useEffect, useState } from "react";
import { SafeAreaView, ScrollView, View, Text, TouchableOpacity, StyleSheet, StatusBar, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useNavigation } from "expo-router";

// Importando o AsyncStorage para ler as informações locais
import AsyncStorage from "@react-native-async-storage/async-storage";

import Header from "@/components/Header";
import Navbar from "@/components/Navbar";
import CardEventos from "@/components/CardEventos";
import BotaoIA from "@/components/BotaoIA";

// Definição da tipagem idêntica à da Home
interface Pet {
  id: string;
  nome: string;
  raca: string;
  cor: string;
  porte: string;
  sexo: string;
  nascimento: string;
  info: string;
  uidTutor: string;
}

export default function HistoricoPet() {
  const [meusPets, setMeusPets] = useState<Pet[]>([]);
  const [petSelecionado, setPetSelecionado] = useState<Pet | null>(null);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  // Função para buscar os pets reais atrelados ao usuário logado
  const carregarDadosLocais = async () => {
    try {
      setLoading(true);

      // 1. Pegar usuário ativo
      const usuarioLogadoRaw = await AsyncStorage.getItem("@olli_user_logado");
      const usuarioLogado = usuarioLogadoRaw ? JSON.parse(usuarioLogadoRaw) : null;

      if (!usuarioLogado) {
        router.replace("/");
        return;
      }

      // 2. Buscar todos os pets salvos no aparelho
      const petsExistentesRaw = await AsyncStorage.getItem("@olli_pets");
      const todosOsPets: Pet[] = petsExistentesRaw ? JSON.parse(petsExistentesRaw) : [];

      // 3. Filtrar os pets que pertencem ao usuário logado atual
      const petsDoTutor = todosOsPets.filter(pet => pet.uidTutor === usuarioLogado.uid);

      setMeusPets(petsDoTutor);

      // 4. Seleciona automaticamente o primeiro pet da lista se houver algum
      if (petsDoTutor.length > 0) {
        setPetSelecionado(petsDoTutor[0]);
      } else {
        setPetSelecionado(null);
      }
    } catch (error) {
      console.error("Erro ao ler dados no histórico:", error);
    } finally {
      setLoading(false);
    }
  };

  // Atualiza os dados locais sempre que a tela ganhar foco
  useEffect(() => {
    carregarDadosLocais();

    const unsubscribe = navigation.addListener("focus", () => {
      carregarDadosLocais();
    });

    return unsubscribe;
  }, [navigation]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FDCB5C" />
        <Text style={styles.loadingText}>Carregando histórico...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FDCB5C" />
      
      <Header />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* BOTÃO VOLTAR */}
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="black" />
          <Text style={styles.backText}>Voltar</Text>
        </TouchableOpacity>

        {/* SELETOR DE PETS DINÂMICO (ABAS OVAIS) */}
        {meusPets.length > 0 ? (
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            contentContainerStyle={styles.tabContainer}
          >
            {meusPets.map((pet) => (
              <TouchableOpacity
                key={pet.id}
                style={[
                  styles.tabItem,
                  petSelecionado?.id === pet.id && styles.activeTab
                ]}
                onPress={() => setPetSelecionado(pet)}
              >
                <Text style={styles.tabText}>{pet.nome}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        ) : (
          <View style={styles.noPetsContainer}>
            <Text style={styles.noPetsText}>Cadastre um pet para visualizar o histórico.</Text>
          </View>
        )}

        {/* SEÇÃO BIO DINÂMICA BASEADA NO PET SELECIONADO */}
        {petSelecionado && (
          <View style={styles.bioSection}>
            <Text style={styles.bioTitle}>BioPet - {petSelecionado.nome}</Text>
            <Text style={styles.bioSubInfo}>
              Raça: {petSelecionado.raca} | Porte: {petSelecionado.porte} | Sexo: {petSelecionado.sexo}
            </Text>
            <Text style={styles.bioDescription}>
              {petSelecionado.info}
            </Text>
          </View>
        )}

        {/* LISTA DE EVENTOS (Passando o nome do pet dinâmico) */}
        {petSelecionado ? (
          <View>
            <CardEventos 
              title="Cirurgia de castração"
              petName={petSelecionado.nome}
              date="05/07/2020"
              doctor="André Rosa"
              clinic="WE Vets"
              status="finalizada"
            />

            <CardEventos 
              title="Cirurgia de amputação"
              petName={petSelecionado.nome}
              date="20/05/2020"
              doctor="André Rosa"
              clinic="WE Vets"
              status="finalizada"
            />
          </View>
        ) : (
          meusPets.length > 0 && (
            <Text style={styles.selectAlert}>Selecione um pet para ver os eventos</Text>
          )
        )}
      </ScrollView>

      {/* BOTÕES FLUTUANTES (FAB) */}
      <View style={styles.fabContainer}>
        <TouchableOpacity style={styles.fab}>
          <Ionicons name="document-text-outline" size={24} color="black" />
        </TouchableOpacity>
        <BotaoIA />
      </View>

      <Navbar />
    </SafeAreaView>
  );
}

// Mantivemos rigorosamente seus estilos estéticos, apenas com ajustes para rolagem horizontal das abas se houver muitos pets
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF" },
  scrollContent: { paddingBottom: 100 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#FFF" },
  loadingText: { marginTop: 10, fontSize: 14, color: "#666" },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 15,
  },
  backText: { fontSize: 16, fontWeight: "500", marginLeft: 5 },
  
  // AJUSTE PARA COMPORTAR VÁRIOS PETS EM LINHA SEM QUEBRAR O LAYOUT
  tabContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginVertical: 20,
    height: 50,
  },
  tabItem: {
    backgroundColor: "#FFF",
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 25, 
    marginRight: 12,
    height: 42,
    elevation: 4, 
    shadowColor: "#000", 
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  activeTab: {
    backgroundColor: "#FDCB5C", 
  },
  tabText: {
    fontWeight: "bold",
    fontSize: 15,
    color: "#000",
  },
  bioSection: {
    paddingHorizontal: 25,
    marginBottom: 20,
  },
  bioTitle: { fontSize: 18, fontWeight: "bold" },
  bioSubInfo: { fontSize: 12, color: "#E7B84C", fontWeight: "600", marginTop: 2, marginBottom: 6 },
  bioDescription: { fontSize: 13, color: "#666", lineHeight: 18 },
  
  noPetsContainer: { paddingHorizontal: 20, marginVertical: 25, alignItems: "center" },
  noPetsText: { fontSize: 14, color: "#888", fontStyle: "italic" },
  selectAlert: { textAlign: "center", color: "#999", marginTop: 30, fontStyle: "italic" },

  fabContainer: {
    position: 'absolute',
    right: 20,
    bottom: 90,
  },
  fab: {
    backgroundColor: '#FDCB5C',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    elevation: 5,
  }
});