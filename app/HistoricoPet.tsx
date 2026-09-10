import React, { useState } from "react";
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import { useMeusPets } from "@/hooks/usePets";
import { useConsultasDoPet } from "@/hooks/useConsultas";
import { Pet } from "@/services/api/petsApi";
import {
  Consulta,
  dataDoEvento,
  DESCRICAO_STATUS,
  situacaoDoCartao,
} from "@/services/api/consultasApi";

import Header from "@/components/Header";
import CardEventos from "@/components/CardEventos";
import ModalProntuario from "@/components/ModalProntuario";

import ModalDescricaoEvento from "@/components/ModalDescricaoEvento";

interface EventoSelecionado {
  title: string;
  petName: string;
  date: string;
  doctor: string;
  clinic: string;
  description: string;
}

export default function HistoricoPet() {
  const { data: meusPets = [], isPending: loading } = useMeusPets();

  const [idSelecionado, setIdSelecionado] = useState<number | null>(null);
  const petSelecionado: Pet | null =
    meusPets.find((pet) => pet.id === idSelecionado) ?? meusPets[0] ?? null;
  
  const [modalProntuarioVisible, setModalProntuarioVisible] = useState(false);
  const [modalDescricaoVisible, setModalDescricaoVisible] = useState(false);
  const [eventoParaExibir, setEventoParaExibir] = useState<EventoSelecionado | null>(null);

  const { data: consultas = [], isPending: carregandoConsultas } = useConsultasDoPet(
    petSelecionado?.id ?? null
  );

  const abrirDescricaoEvento = (consulta: Consulta) => {
    setEventoParaExibir({
      title: consulta.motivo,
      petName: consulta.nomePet,
      date: dataDoEvento(consulta.dataHora),
      doctor: consulta.nomeVeterinario,
      clinic: "Olli Pet",
      description: consulta.observacoes || DESCRICAO_STATUS[consulta.status],
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
        
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="black" />
          <Text style={styles.backText}>Voltar</Text>
        </TouchableOpacity>

        {meusPets.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabContainer}>
            {meusPets.map((pet) => (
              <TouchableOpacity
                key={pet.id}
                style={[styles.tabItem, petSelecionado?.id === pet.id && styles.activeTab]}
                onPress={() => setIdSelecionado(pet.id)}
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

        {petSelecionado && (
          <View style={styles.bioSection}>
            <Text style={styles.bioTitle}>BioPet - {petSelecionado.nome}</Text>
            <Text style={styles.bioSubInfo}>
              Raça: {petSelecionado.raca} | Porte: {petSelecionado.porte} | Sexo: {petSelecionado.sexo}
            </Text>
            <Text style={styles.bioDescription}>{petSelecionado.info}</Text>
          </View>
        )}

        {!petSelecionado ? (
          meusPets.length > 0 && (
            <Text style={styles.selectAlert}>Selecione um pet para ver os eventos</Text>
          )
        ) : carregandoConsultas ? (
          <ActivityIndicator color="#FDCB5C" style={{ marginTop: 20 }} />
        ) : consultas.length === 0 ? (
          <Text style={styles.selectAlert}>
            {petSelecionado.nome} ainda não tem consultas registradas.
          </Text>
        ) : (
          <View>
            {consultas.map((consulta) => (
              <CardEventos
                key={consulta.id}
                title={consulta.motivo}
                petName={consulta.nomePet}
                date={dataDoEvento(consulta.dataHora)}
                doctor={consulta.nomeVeterinario}
                clinic="Olli Pet"
                status={situacaoDoCartao(consulta.status)}
                onPressDescricao={() => abrirDescricaoEvento(consulta)}
              />
            ))}
          </View>
        )}
      </ScrollView>

      <View style={styles.fabContainer}>
        <TouchableOpacity 
          style={[styles.fab, !petSelecionado && { opacity: 0.5 }]} 
          onPress={() => petSelecionado && setModalProntuarioVisible(true)}
          activeOpacity={0.7}
        >
          <Ionicons name="document-text-outline" size={24} color="black" />
        </TouchableOpacity>
      </View>

      <ModalProntuario 
        visible={modalProntuarioVisible}
        onClose={() => setModalProntuarioVisible(false)}
        pet={petSelecionado}
      />

      <ModalDescricaoEvento 
        visible={modalDescricaoVisible}
        onClose={() => setModalDescricaoVisible(false)}
        eventData={eventoParaExibir}
      />

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