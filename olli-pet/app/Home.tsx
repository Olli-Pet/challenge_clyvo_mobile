import React from "react";
import { SafeAreaView, ScrollView, View, Text, TouchableOpacity, StyleSheet, StatusBar } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

// Verifique se os caminhos dos arquivos estão corretos na sua pasta
import Header from "@/components/Header";
import Navbar from "@/components/Navbar";
import PetCircle from "@/components/PetCircle";
import CardEventos from "@/components/CardEventos";
import BotaoIA from "@/components/BotaoIA";

export default function Home() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FDCB5C" />
      
      <Header />

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
      >
        
        {/* CARROSSEL DE PETS */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.petsCarousel}
        >
          <PetCircle 
            name="Nina" 
            selected 
            onPress={() => router.push("/petprofile")} 
          />
          <PetCircle name="Pipo" />
          <PetCircle name="Totó" />

          {/* BOTÃO ADICIONAR */}
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

{/* TÍTULO SEÇÃO */}
<View style={styles.sectionHeader}>
  <View style={styles.sectionTitleRow}>
    <Ionicons name="list" size={24} color="black" />
    <Text style={styles.sectionTitle}>Últimos Eventos</Text>
  </View>
  
  {/* AQUI: O onPress deve ir no TouchableOpacity */}
  <TouchableOpacity onPress={() => router.push("/historicopet")}>
    <Text style={styles.verTudo}>ver tudo</Text>
  </TouchableOpacity>
</View>

        {/* LISTA DE EVENTOS */}
        <CardEventos 
          title="Cirurgia de castração"
          petName="Nina"
          date="05/07/2020"
          doctor="André Rosa"
          clinic="WE Vets"
          status="finalizada"
        />

        <CardEventos 
          title="Cirurgia de amputação"
          petName="Pipo"
          date="20/05/2020"
          doctor="André Rosa"
          clinic="WE Vets"
          status="finalizada"
        />

      </ScrollView>

      <BotaoIA />

      <Navbar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
  },
  scrollContent: {
    paddingBottom: 120, // Espaço para não cobrir o último card com a Navbar
  },
  petsCarousel: {
    paddingVertical: 20,
    paddingLeft: 20,
    maxHeight: 140, // Evita que o scroll horizontal cresça demais
  },
  petItem: {
    alignItems: "center",
    marginRight: 20,
  },
  addButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#FDCB5C",
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  petName: {
    marginTop: 5,
    fontSize: 14,
    fontWeight: "500",
    color: "#000",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 15,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: 10,
    color: "#000",
  },
  verTudo: {
    fontSize: 16,
    color: "#333",
  }
});