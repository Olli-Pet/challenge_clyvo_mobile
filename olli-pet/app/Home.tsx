import React, { useEffect, useState } from "react";
import { SafeAreaView, ScrollView, View, Text, TouchableOpacity, StyleSheet, StatusBar, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useNavigation } from "expo-router";

import AsyncStorage from "@react-native-async-storage/async-storage";

import Header from "@/components/Header";
import Navbar from "@/components/Navbar";
import PetCircle from "@/components/PetCircle";
import CardEventos from "@/components/CardEventos";
import BotaoIA from "@/components/BotaoIA";

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

interface EventoSelecionado {
  title: string;
  petName: string;
  date: string;
  doctor: string;
  clinic: string;
  description: string;
}

export default function Home() {
  const [meusPets, setMeusPets] = useState<Pet[]>([]);
  const [carregando, setCarregando] = useState(true);
  
  const [modalDescricaoVisible, setModalDescricaoVisible] = useState(false);
  const [eventoParaExibir, setEventoParaExibir] = useState<EventoSelecionado | null>(null);
  
  const navigation = useNavigation();

  const carregarDadosLocais = async () => {
    try {
      setCarregando(true);

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
    } catch (error) {
      console.error("Erro ao carregar dados locais na Home:", error);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarDadosLocais();

    const unsubscribe = navigation.addListener("focus", () => {
      carregarDadosLocais();
    });

    return unsubscribe;
  }, [navigation]);

  const abrirDescricaoEvento = (title: string, date: string, description: string) => {
    if (meusPets.length === 0) return;
    
    setEventoParaExibir({
      title,
      petName: meusPets[0].nome, 
      date,
      doctor: "André Rosa",
      clinic: "WE Vets",
      description
    });
    setModalDescricaoVisible(true);
  };

  const navegarParaPerfil = (pet: Pet) => {
    router.push({
      pathname: "/petprofile",
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

  const nomePetPrincipal = meusPets.length > 0 ? meusPets[0].nome : "Pet";

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
              onPress={() => router.push("/addpet")}
            >
              <Ionicons name="add" size={35} color="black" />
            </TouchableOpacity>
            <Text style={styles.petName}>Adicionar</Text>
          </View>
        </ScrollView>

        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="list" size={24} color="black" />
            <Text style={styles.sectionTitle}>Últimos Eventos</Text>
          </View>
          
          <TouchableOpacity onPress={() => router.push("/historicopet")}>
            <Text style={styles.verTudo}>ver tudo</Text>
          </TouchableOpacity>
        </View>

        {meusPets.length > 0 ? (
          <View>
            <CardEventos 
              title="Cirurgia de castração"
              petName={nomePetPrincipal}
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
              petName={nomePetPrincipal}
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
          <View style={styles.noEventsContainer}>
            <Text style={styles.noEventsText}>Adicione um pet para começar a registrar eventos.</Text>
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