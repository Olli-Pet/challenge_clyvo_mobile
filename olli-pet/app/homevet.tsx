import React, { useEffect, useState } from "react";
import { SafeAreaView, ScrollView, View, Text, TouchableOpacity, StyleSheet, StatusBar, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useNavigation } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Reaproveitando seus componentes e o modal de prontuário adaptado
import Header from "@/components/Header";
import Navbar from "@/components/Navbar"; 
import ModalProntuarioVet from "@/components/ModalProntuarioVet";

interface Pet {
  id: string;
  nome: string;
  raca: string;
  uidTutor: string;
  info: string;
}

interface Tutor {
  uid: string;
  nome: string;
}

export default function HomeVet() {
  const [todosOsPets, setTodosOsPets] = useState<(Pet & { nomeTutor: string })[]>([]);
  const [carregando, setCarregando] = useState(true);
  
  // Controle do Modal de Prontuário do Vet
  const [modalProntuarioVisible, setModalProntuarioVisible] = useState(false);
  const [petSelecionado, setPetSelecionado] = useState<Pet | null>(null);

  const navigation = useNavigation();

  const carregarDadosGerais = async () => {
    try {
      setCarregando(true);

      // 1. Pegar todos os pets e todos os tutores cadastrados no aparelho
      const petsRaw = await AsyncStorage.getItem("@olli_pets");
      const tutoresRaw = await AsyncStorage.getItem("@olli_usuarios_cadastrados");

      const listaPets: Pet[] = petsRaw ? JSON.parse(petsRaw) : [];
      const listaTutores: Tutor[] = tutoresRaw ? JSON.parse(tutoresRaw) : [];

      // 2. Cruzar os dados para descobrir o nome do dono de cada pet
      const petsComTutor = listaPets.map(pet => {
        const tutor = listaTutores.find(t => t.uid === pet.uidTutor);
        return {
          ...pet,
          nomeTutor: tutor ? tutor.nome : "Tutor Desconhecido"
        };
      });

      setTodosOsPets(petsComTutor);
    } catch (error) {
      console.error("Erro ao carregar dados na Home do Vet:", error);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarDadosGerais();
    const unsubscribe = navigation.addListener("focus", () => {
      carregarDadosGerais();
    });
    return unsubscribe;
  }, [navigation]);

  const abrirProntuario = (pet: Pet) => {
    setPetSelecionado(pet);
    setModalProntuarioVisible(true);
  };

  if (carregando) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#66A6FA" />
        <Text style={styles.loadingText}>Carregando painel médico...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#66A6FA" />
      
      {/* Header adaptada que já fizemos */}
      <Header />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* BANNER DE BOAS-VINDAS VET */}
        <View style={styles.welcomeBanner}>
          <Text style={styles.bannerTitle}>Painel Clínico Geral</Text>
          <Text style={styles.bannerSub}>Gerencie prontuários e adicione históricos de consultas.</Text>
        </View>

        <View style={styles.sectionHeader}>
          <Ionicons name="git-pull-request-outline" size={20} color="#66A6FA" />
          <Text style={styles.sectionTitle}>Pacientes Cadastrados ({todosOsPets.length})</Text>
        </View>

        {/* LISTAGEM DOS PETS DO SISTEMA */}
        <View style={styles.listaContainer}>
          {todosOsPets.map((pet) => (
            <TouchableOpacity 
              key={pet.id} 
              style={styles.pacienteCard}
              activeOpacity={0.7}
              onPress={() => abrirProntuario(pet)}
            >
              <View style={styles.avatarMed}>
                <Ionicons name="paw" size={24} color="#FFF" />
              </View>
              
              <View style={styles.infoMed}>
                <Text style={styles.petName}>{pet.nome}</Text>
                <Text style={styles.petDetails}>{pet.raca}</Text>
                <Text style={styles.tutorName}>Responsável: {pet.nomeTutor}</Text>
              </View>

              <Ionicons name="chevron-forward" size={20} color="#66A6FA" />
            </TouchableOpacity>
          ))}

          {todosOsPets.length === 0 && (
            <Text style={styles.emptyText}>Nenhum paciente encontrado no sistema local.</Text>
          )}
        </View>

      </ScrollView>

      {/* MODAL DE PRONTUÁRIO COM ACESSO A ADIÇÃO DE CONSULTA */}
      <ModalProntuarioVet 
        visible={modalProntuarioVisible}
        onClose={() => {
          setModalProntuarioVisible(false);
          carregarDadosGerais(); // Recarrega se o vet salvou algo novo
        }}
        pet={petSelecionado}
      />

      <Navbar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#FFF" },
  loadingText: { marginTop: 10, fontSize: 14, color: "#666" },
  scrollContent: { paddingBottom: 120 },
  welcomeBanner: { backgroundColor: "#66A6FA", padding: 20, borderBottomLeftRadius: 20, borderBottomRightRadius: 20, marginBottom: 20 },
  bannerTitle: { fontSize: 22, fontWeight: "bold", color: "#FFF" },
  bannerSub: { fontSize: 13, color: "#E0EEFF", marginTop: 4 },
  sectionHeader: { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, marginBottom: 15, gap: 8 },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: "#333" },
  listaContainer: { paddingHorizontal: 20 },
  pacienteCard: { flexDirection: "row", alignItems: "center", backgroundColor: "#FFF", borderRadius: 16, padding: 15, marginBottom: 12, elevation: 2, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 },
  avatarMed: { width: 50, height: 50, borderRadius: 25, backgroundColor: "#66A6FA", justifyContent: "center", alignItems: "center" },
  infoMed: { flex: 1, marginLeft: 15 },
  petName: { fontSize: 16, fontWeight: "bold", color: "#222" },
  petDetails: { fontSize: 13, color: "#666", marginTop: 2 },
  tutorName: { fontSize: 12, color: "#444", fontWeight: "600", marginTop: 4, backgroundColor: "#EBF3FF", alignSelf: "flex-start", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  emptyText: { textAlign: "center", color: "#999", marginTop: 40, fontStyle: "italic" }
});