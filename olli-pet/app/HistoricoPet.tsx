import React, { useEffect, useState } from "react";
import { SafeAreaView, ScrollView, View, Text, TouchableOpacity, StyleSheet, StatusBar, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useNavigation } from "expo-router";

import AsyncStorage from "@react-native-async-storage/async-storage";

import Header from "@/components/Header";
import Navbar from "@/components/Navbar";
import CardEventos from "@/components/CardEventos";
import BotaoIA from "@/components/BotaoIA";
import ModalProntuario from "@/components/ModalProntuario";

// IMPORTANDO O NOVO MODAL DE DESCRIÇÃO
import ModalDescricaoEvento from "@/components/ModalDescricaoEvento";

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

// Tipagem para os dados que vão para o modal de descrição
interface EventoSelecionado {
  title: string;
  petName: string;
  date: string;
  doctor: string;
  clinic: string;
  description: string;
}

export default function HistoricoPet() {
  const [meusPets, setMeusPets] = useState<Pet[]>([]);
  const [petSelecionado, setPetSelecionado] = useState<Pet | null>(null);
  const [loading, setLoading] = useState(true);
  
  // ESTADOS DOS DOIS MODAIS distintos
  const [modalProntuarioVisible, setModalProntuarioVisible] = useState(false);
  const [modalDescricaoVisible, setModalDescricaoVisible] = useState(false);
  const [eventoParaExibir, setEventoParaExibir] = useState<EventoSelecionado | null>(null);

  const navigation = useNavigation();

  const carregarDadosLocais = async () => {
    try {
      setLoading(true);
      const usuarioLogadoRaw = await AsyncStorage.getItem("@olli_user_logado");
      const usuarioLogado = usuarioLogadoRaw ? JSON.parse(usuarioLogadoRaw) : null;

      if (!usuarioLogado) {
        router.replace("/");
        return;
      }

      const petsExistentesRaw = await AsyncStorage.getItem("@olli_pets");
      const todosOsPets: Pet[] = petsExistentesRaw ? JSON.parse(petsExistentesRaw) : [];
      const petsDoTutor = todosOsPets.filter(pet => pet.uidTutor === usuarioLogado.uid);

      setMeusPets(petsDoTutor);

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

  useEffect(() => {
    carregarDadosLocais();
    const unsubscribe = navigation.addListener("focus", () => {
      carregarDadosLocais();
    });
    return unsubscribe;
  }, [navigation]);

  // FUNÇÃO AUXILIAR PARA ABRIR O MODAL DE DESCRIÇÃO COM OS DADOS CERTOS
  const abrirDescricaoEvento = (title: string, date: string, description: string) => {
    if (!petSelecionado) return;
    
    setEventoParaExibir({
      title,
      petName: petSelecionado.nome,
      date,
      doctor: "André Rosa",
      clinic: "WE Vets",
      description
    });
    setModalDescricaoVisible(true);
  };

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

        {/* SELETOR DE PETS */}
        {meusPets.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabContainer}>
            {meusPets.map((pet) => (
              <TouchableOpacity
                key={pet.id}
                style={[styles.tabItem, petSelecionado?.id === pet.id && styles.activeTab]}
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

        {/* BIO DO PET */}
        {petSelecionado && (
          <View style={styles.bioSection}>
            <Text style={styles.bioTitle}>BioPet - {petSelecionado.nome}</Text>
            <Text style={styles.bioSubInfo}>
              Raça: {petSelecionado.raca} | Porte: {petSelecionado.porte} | Sexo: {petSelecionado.sexo}
            </Text>
            <Text style={styles.bioDescription}>{petSelecionado.info}</Text>
          </View>
        )}

        {/* LISTA DE EVENTOS COM ACIONAMENTO DO SEGUNDO MODAL */}
        {petSelecionado ? (
          <View>
            <CardEventos 
              title="Cirurgia de castração"
              petName={petSelecionado.nome}
              date="05/07/2020"
              doctor="André Rosa"
              clinic="WE Vets"
              status="finalizada"
              onPressDescricao={() => abrirDescricaoEvento(
                "Cirurgia de castração",
                "05/07/2020",
                "Procedimento cirúrgico eletivo realizado sem intercorrências. O paciente permaneceu estável sob anestesia inalatória. Recomendado repouso absoluto por 10 dias e uso de colar elisabetano."
              )}
            />

            <CardEventos 
              title="Cirurgia de amputação"
              petName={petSelecionado.nome}
              date="20/05/2020"
              doctor="André Rosa"
              clinic="WE Vets"
              status="finalizada"
              onPressDescricao={() => abrirDescricaoEvento(
                "Cirurgia de amputação",
                "20/05/2020",
                "Amputação cirúrgica do membro posterior esquerdo devido a trauma severo prévio. Suturas limpas. Prescrito protocolo analgésico e antibioticoterapia estrita para o pós-operatório imediato."
              )}
            />
          </View>
        ) : (
          meusPets.length > 0 && <Text style={styles.selectAlert}>Selecione um pet para ver os eventos</Text>
        )}
      </ScrollView>

      {/* BOTÕES FLUTUANTES (FAB) */}
      <View style={styles.fabContainer}>
        <TouchableOpacity 
          style={[styles.fab, !petSelecionado && { opacity: 0.5 }]} 
          onPress={() => petSelecionado && setModalProntuarioVisible(true)}
          activeOpacity={0.7}
        >
          <Ionicons name="document-text-outline" size={24} color="black" />
        </TouchableOpacity>
        <BotaoIA />
      </View>

      {/* MODAL 1: PRONTUÁRIO GERAL (BOTÃO FLUTUANTE) */}
      <ModalProntuario 
        visible={modalProntuarioVisible}
        onClose={() => setModalProntuarioVisible(false)}
        pet={petSelecionado}
      />

      {/* MODAL 2: DETALHES DO EVENTO ESPECÍFICO (BOTÃO DESCRIÇÃO) */}
      <ModalDescricaoEvento 
        visible={modalDescricaoVisible}
        onClose={() => setModalDescricaoVisible(false)}
        eventData={eventoParaExibir}
      />

      <Navbar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF" },
  scrollContent: { paddingBottom: 100 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#FFF" },
  loadingText: { marginTop: 10, fontSize: 14, color: "#666" },
  backButton: { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingTop: 15 },
  backText: { fontSize: 16, fontWeight: "500", marginLeft: 5 },
  tabContainer: { flexDirection: "row", paddingHorizontal: 20, marginVertical: 20, height: 50 },
  tabItem: { backgroundColor: "#FFF", paddingVertical: 10, paddingHorizontal: 30, borderRadius: 25, marginRight: 12, height: 42, elevation: 4, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  activeTab: { backgroundColor: "#FDCB5C" },
  tabText: { fontWeight: "bold", fontSize: 15, color: "#000" },
  bioSection: { paddingHorizontal: 25, marginBottom: 20 },
  bioTitle: { fontSize: 18, fontWeight: "bold" },
  bioSubInfo: { fontSize: 12, color: "#E7B84C", fontWeight: "600", marginTop: 2, marginBottom: 6 },
  bioDescription: { fontSize: 13, color: "#666", lineHeight: 18 },
  noPetsContainer: { paddingHorizontal: 20, marginVertical: 25, alignItems: "center" },
  noPetsText: { fontSize: 14, color: "#888", fontStyle: "italic" },
  selectAlert: { textAlign: "center", color: "#999", marginTop: 30, fontStyle: "italic" },
  fabContainer: { position: 'absolute', right: 20, bottom: 90 },
  fab: { backgroundColor: '#FDCB5C', width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginBottom: 10, elevation: 5 }
});