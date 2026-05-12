import React from "react";
import { SafeAreaView, ScrollView, View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import Header from "@/components/Header";
import Navbar from "@/components/Navbar";
import PetCircle from "@/components/PetCircle";
import CardEventos from "@/components/CardEventos";

export default function Home() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FFF" }}>
      <Header />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        
        {/* CARROSSEL DE PETS */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.petsCarousel}>
          <PetCircle 
            name="Nina" 
            selected 
            onPress={() => router.push("/PetProfile")} 
          />
          <PetCircle name="Pipo" />
          <PetCircle name="Totó" />

          {/* BOTÃO ADICIONAR (Mantive aqui por ser único) */}
          <View style={styles.petItem}>
            <TouchableOpacity style={styles.addButton}>
              <Ionicons name="add" size={35} color="black" />
            </TouchableOpacity>
            <Text style={styles.petName}>Adicionar</Text>
          </View>
        </ScrollView>

        {/* TÍTULO SEÇÃO */}
        <View style={styles.sectionHeader}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="list" size={24} color="black" />
            <Text style={styles.sectionTitle}>Últimos Eventos</Text>
          </View>
          <TouchableOpacity><Text style={styles.verTudo}>ver tudo</Text></TouchableOpacity>
        </View>

        {/* LISTA DE EVENTOS COM O NOVO COMPONENTE */}
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

      <Navbar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  petsCarousel: { paddingVertical: 20, paddingLeft: 20 },
  petItem: { alignItems: "center", marginRight: 20 },
  addButton: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: "#FDCB5C", justifyContent: "center", alignItems: "center",
  },
  petName: { marginTop: 5, fontSize: 14, fontWeight: "500" },
  sectionHeader: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: 20, marginTop: 10, marginBottom: 15,
  },
  sectionTitle: { fontSize: 20, fontWeight: "bold", marginLeft: 10 },
  verTudo: { fontSize: 16, color: "#333" },
});