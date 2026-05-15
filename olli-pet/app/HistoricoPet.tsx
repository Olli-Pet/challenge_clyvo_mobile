import React, { useState } from "react";
import { SafeAreaView, ScrollView, View, Text, TouchableOpacity, StyleSheet, StatusBar } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import Header from "@/components/Header";
import Navbar from "@/components/Navbar";
import CardEventos from "@/components/CardEventos";
import BotaoIA from "@/components/BotaoIA";

export default function HistoricoPet() {
  // Estado para controlar qual pet está selecionado
  const [selectedPet, setSelectedPet] = useState("Nina");
  const pets = ["Nina", "Pipo", "Totó"];

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

        {/* SELETOR DE PETS (ABAS OVAIS IGUAL À IMAGEM) */}
        <View style={styles.tabContainer}>
          {pets.map((pet) => (
            <TouchableOpacity
              key={pet}
              style={[
                styles.tabItem,
                selectedPet === pet && styles.activeTab // Aplica cor se selecionado
              ]}
              onPress={() => setSelectedPet(pet)}
            >
              <Text style={styles.tabText}>{pet}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* SEÇÃO BIO */}
        <View style={styles.bioSection}>
          <Text style={styles.bioTitle}>BioPet</Text>
          <Text style={styles.bioDescription}>
            Lorem Ipsum is simply dummy text of the printing and typesetting industry. 
            Lorem Ipsum has been the industry's standard dummy text ever since the 1500s.
          </Text>
        </View>

        {/* LISTA DE EVENTOS */}
        <CardEventos 
          title="Cirurgia de castração"
          petName={selectedPet}
          date="05/07/2020"
          doctor="André Rosa"
          clinic="WE Vets"
          status="finalizada"
        />

        <CardEventos 
          title="Cirurgia de amputação"
          petName={selectedPet}
          date="20/05/2020"
          doctor="André Rosa"
          clinic="WE Vets"
          status="finalizada"
        />
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF" },
  scrollContent: { paddingBottom: 100 },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 15,
  },
  backText: { fontSize: 16, fontWeight: "500", marginLeft: 5 },
  
  // ESTILO DAS ABAS OVAIS
  tabContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginVertical: 20,
  },
  tabItem: {
    backgroundColor: "#FFF",
    paddingVertical: 10,
    paddingHorizontal: 35,
    borderRadius: 25, // Deixa oval
    elevation: 4, // Sombra Android
    shadowColor: "#000", // Sombra iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  activeTab: {
    backgroundColor: "#FDCB5C", // Cor amarela quando selecionado
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
  bioDescription: { fontSize: 13, color: "#666", marginTop: 4, lineHeight: 18 },
  
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