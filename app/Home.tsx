import React, { useState } from "react";
import { SafeAreaView, ScrollView, View, Text, TouchableOpacity, StyleSheet, StatusBar, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import { useMeusPets } from "@/hooks/usePets";
import { useMinhasConsultas } from "@/hooks/useConsultas";
import { Pet } from "@/services/api/petsApi";
import {
  Consulta,
  dataDoEvento,
  DESCRICAO_STATUS,
  situacaoDoCartao,
} from "@/services/api/consultasApi";

import Header from "@/components/Header";
import PetCircle from "@/components/PetCircle";
import CardEventos from "@/components/CardEventos";
import BotaoIA from "@/components/BotaoIA";

import ModalDescricaoEvento from "@/components/ModalDescricaoEvento";

interface EventoSelecionado {
  title: string;
  petName: string;
  date: string;
  doctor: string;
  clinic: string;
  description: string;
}

export default function Home() {
  const [modalDescricaoVisible, setModalDescricaoVisible] = useState(false);
  const [eventoParaExibir, setEventoParaExibir] = useState<EventoSelecionado | null>(null);

  // O TanStack Query cuida do carregamento, do cache e da atualização: ao
  // cadastrar ou excluir um pet, a mutação invalida esta consulta e a lista
  // se refaz sozinha, sem recarregar a tela.
  const { data: meusPets = [], isPending: carregando, isError: clinicaIndisponivel } = useMeusPets();

  // Eventos reais: as consultas dos pets deste tutor, vindas da clínica.
  const { data: consultas = [] } = useMinhasConsultas();

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

  const navegarParaPerfil = (pet: Pet) => {
    router.push({
      pathname: "/PetProfile",
      params: {
        nome: pet.nome,
        raca: pet.raca,
        cor: pet.cor,
        porte: pet.porte,
        sexo: pet.sexo,
        nascimento: pet.nascimento,
        info: pet.info,
      },
    });
  };

  if (carregando) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FDCB5C" />
        <Text style={styles.loadingText}>Carregando seus pets...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FDCB5C" />
      
      <Header />

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
      >
        
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.petsCarousel}
          contentContainerStyle={{ paddingRight: 40 }}
        >
          {meusPets.map((pet) => (
            <PetCircle 
              key={pet.id} 
              name={pet.nome} 
              raca={pet.raca} 
              onPress={() => navegarParaPerfil(pet)} 
            />
          ))}

          {meusPets.length === 0 && (
            <View style={{ justifyContent: "center", paddingHorizontal: 10, marginRight: 10 }}>
              <Text style={{ fontSize: 13, color: "#666", fontStyle: "italic" }}>Nenhum pet cadastrado...</Text>
            </View>
          )}

          <View style={styles.petItem}>
            <TouchableOpacity 
              style={styles.addButton}
              activeOpacity={0.7}
              onPress={() => router.push("/AddPet")}
            >
              <Ionicons name="add" size={35} color="black" />
            </TouchableOpacity>
            <Text style={styles.petName}>Adicionar</Text>
          </View>
        </ScrollView>

        {clinicaIndisponivel && (
          <View style={styles.avisoClinica}>
            <Ionicons name="cloud-offline-outline" size={20} color="#8A6A10" />
            <Text style={styles.avisoClinicaTexto}>
              Não conseguimos falar com a clínica. Verifique se a API está rodando
              (mvnw spring-boot:run) para ver e cadastrar seus pets.
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={styles.cardTriagem}
          activeOpacity={0.85}
          onPress={() => router.push("/Triagem")}
        >
          <View style={styles.triagemIcone}>
            <Ionicons name="pulse" size={26} color="#FFF" />
          </View>
          <View style={styles.triagemTexto}>
            <Text style={styles.triagemTitulo}>Fazer triagem</Text>
            <Text style={styles.triagemSub}>
              Responda algumas perguntas e saiba se seu pet precisa de consulta.
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={22} color="#8A6A10" />
        </TouchableOpacity>

        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="list" size={24} color="black" />
            <Text style={styles.sectionTitle}>Últimos Eventos</Text>
          </View>
          
          <TouchableOpacity onPress={() => router.push("/HistoricoPet")}>
            <Text style={styles.verTudo}>ver tudo</Text>
          </TouchableOpacity>
        </View>

        {meusPets.length === 0 ? (
          <View style={styles.noEventsContainer}>
            <Text style={styles.noEventsText}>Adicione um pet para começar a registrar eventos.</Text>
          </View>
        ) : consultas.length === 0 ? (
          <View style={styles.noEventsContainer}>
            <Text style={styles.noEventsText}>
              Nenhuma consulta registrada ainda. Os atendimentos aparecerão aqui.
            </Text>
          </View>
        ) : (
          <View>
            {consultas.slice(0, 3).map((consulta) => (
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

      <BotaoIA />

      <ModalDescricaoEvento 
        visible={modalDescricaoVisible}
        onClose={() => setModalDescricaoVisible(false)}
        eventData={eventoParaExibir}
      />

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  avisoClinica: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#FFF6DF",
    borderWidth: 1,
    borderColor: "#E7B84C",
    borderRadius: 14,
    padding: 12,
    marginHorizontal: 20,
    marginTop: 20,
  },
  avisoClinicaTexto: { flex: 1, fontSize: 12, color: "#8A6A10", lineHeight: 17 },
  cardTriagem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF6DF",
    borderWidth: 1.5,
    borderColor: "#FDCB5C",
    borderRadius: 18,
    padding: 16,
    marginHorizontal: 20,
    marginTop: 20,
    gap: 12,
  },
  triagemIcone: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#FDCB5C",
    justifyContent: "center",
    alignItems: "center",
  },
  triagemTexto: { flex: 1 },
  triagemTitulo: { fontSize: 16, fontWeight: "bold", color: "#222" },
  triagemSub: { fontSize: 12, color: "#7A6320", marginTop: 2, lineHeight: 16 },
  container: { flex: 1, backgroundColor: "#FFF" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#FFF" },
  loadingText: { marginTop: 10, fontSize: 14, color: "#666" },
  scrollContent: { paddingBottom: 120 },
  petsCarousel: { paddingVertical: 20, paddingLeft: 20, maxHeight: 140 },
  petItem: { alignItems: "center", marginRight: 20 },
  addButton: { width: 80, height: 80, borderRadius: 40, backgroundColor: "#FDCB5C", justifyContent: "center", alignItems: "center", elevation: 3 },
  petName: { marginTop: 5, fontSize: 14, fontWeight: "500", color: "#000" },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, marginTop: 10, marginBottom: 15 },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center' },
  sectionTitle: { fontSize: 20, fontWeight: "bold", marginLeft: 10, color: "#000" },
  verTudo: { fontSize: 16, color: "#333" },
  noEventsContainer: { paddingHorizontal: 20, marginVertical: 15, alignItems: "center" },
  noEventsText: { fontSize: 14, color: "#888", fontStyle: "italic", textAlign: "center" }
});