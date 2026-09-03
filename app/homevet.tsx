import React, { useState } from "react";
import { SafeAreaView, ScrollView, View, Text, TouchableOpacity, StyleSheet, StatusBar, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { usePetsDaClinica } from "@/hooks/usePets";
import { Pet } from "@/services/api/petsApi";
import { useAutenticacao } from "@/contexts/AuthContext";

import ModalProntuarioVetCompleto from "@/components/ModalProntuarioVetCompleto";
import ModalPerfilVet from "@/components/ModalPerfilVet";

type PetComTutor = Pet & { nomeTutor: string };

export default function HomeVet() {
  const { usuario } = useAutenticacao();
  const nomeVet = usuario?.nome || "Médico(a)";

  // A API já devolve o nome do responsável de cada pet, então basta renomear
  // o campo para o formato que os componentes desta tela esperam.
  const { data: pets = [], isPending: carregando } = usePetsDaClinica();
  const todosOsPets: PetComTutor[] = pets.map((pet) => ({
    ...pet,
    nomeTutor: pet.nomeResponsavel,
  }));

  const [modalProntuarioVisible, setModalProntuarioVisible] = useState(false);
  const [idSelecionado, setIdSelecionado] = useState<number | null>(null);
  const [modalPerfilVisible, setModalPerfilVisible] = useState(false);

  // Deriva da consulta para o prontuário refletir a última evolução salva.
  const petSelecionado = todosOsPets.find((pet) => pet.id === idSelecionado) ?? null;

  const abrirProntuario = (pet: PetComTutor) => {
    setIdSelecionado(pet.id);
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

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.welcomeBanner}>
          <View style={styles.bannerRow}>
            <View>
              <Text style={styles.bannerTitle}>Painel Clínico Geral</Text>
              <Text style={styles.bannerSub}>Olá, {nomeVet}!</Text>
            </View>
            <TouchableOpacity style={styles.perfilBtn} onPress={() => setModalPerfilVisible(true)}>
              <Ionicons name="person-circle-outline" size={32} color="#FFF" />
            </TouchableOpacity>
          </View>
          <Text style={styles.bannerDesc}>Gerencie prontuários e adicione históricos de consultas.</Text>
        </View>

        <View style={styles.sectionHeader}>
          <Ionicons name="git-pull-request-outline" size={20} color="#66A6FA" />
          <Text style={styles.sectionTitle}>Pacientes Cadastrados ({todosOsPets.length})</Text>
        </View>

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
            <Text style={styles.emptyText}>Nenhum paciente cadastrado na clínica.</Text>
          )}
        </View>

      </ScrollView>

      <ModalProntuarioVetCompleto
        visible={modalProntuarioVisible}
        onClose={() => setModalProntuarioVisible(false)}
        pet={petSelecionado}
      />

      <ModalPerfilVet
        visible={modalPerfilVisible}
        onClose={() => setModalPerfilVisible(false)}
      />

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#FFF" },
  loadingText: { marginTop: 10, fontSize: 14, color: "#666" },
  scrollContent: { paddingBottom: 120 },
  welcomeBanner: { backgroundColor: "#66A6FA", padding: 20, borderBottomLeftRadius: 20, borderBottomRightRadius: 20, marginBottom: 20 },
  bannerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginTop: 50 },
  bannerTitle: { fontSize: 22, fontWeight: "bold", color: "#FFF" },
  bannerSub: { fontSize: 15, color: "#E0EEFF", marginTop: 2, fontWeight: "600" },
  bannerDesc: { fontSize: 13, color: "#D0E8FF", marginTop: 8 },
  perfilBtn: { padding: 4 },
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