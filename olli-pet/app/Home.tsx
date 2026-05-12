import React from "react";
import { View, Text, StyleSheet, SafeAreaView, StatusBar, ScrollView, TouchableOpacity, Image } from "react-native";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import Header from "@/components/Header";
import Navbar from "@/components/Navbar";

export default function Home() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FDCB5C" />

      <Header />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* CARROSSEL DE PETS */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.petsCarousel}>
          <View style={styles.petItem}>
            <View style={styles.petCircleSelected}>
              <Image source={{ uri: 'https://placehold.co/100x100.png' }} style={styles.petImage} />
            </View>
            <Text style={styles.petName}>Nina</Text>
          </View>

          <View style={styles.petItem}>
            <View style={styles.petCircle}>
               <Image source={{ uri: 'https://placehold.co/100x100.png' }} style={styles.petImage} />
            </View>
            <Text style={styles.petName}>Pipo</Text>
          </View>

          <View style={styles.petItem}>
            <View style={styles.petCircle}>
               <Image source={{ uri: 'https://placehold.co/100x100.png' }} style={styles.petImage} />
            </View>
            <Text style={styles.petName}>Totó</Text>
          </View>

          <View style={styles.petItem}>
            <TouchableOpacity style={styles.addButton}>
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
          <TouchableOpacity>
            <Text style={styles.verTudo}>ver tudo</Text>
          </TouchableOpacity>
        </View>

        {/* CARDS DE EVENTOS */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Cirurgia de castração</Text>
            <Text style={styles.cardPetName}>Nina</Text>
          </View>
          <Text style={styles.cardDate}>05/07/2020</Text>
          <View style={styles.cardRow}>
            <Text style={styles.cardInfo}>Médico(a): André Rosa</Text>
            <Text style={styles.cardInfo}>Clínica: WE Vets</Text>
          </View>
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.statusButton}>
              <Text style={styles.buttonText}>Status: finalizada</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.descButton}>
              <Text style={styles.buttonText}>Descrição</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Cirurgia de amputação</Text>
            <Text style={styles.cardPetName}>Pipo</Text>
          </View>
          <Text style={styles.cardDate}>20/05/2020</Text>
          <View style={styles.cardRow}>
            <Text style={styles.cardInfo}>Médico(a): André Rosa</Text>
            <Text style={styles.cardInfo}>Clínica: WE Vets</Text>
          </View>
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.statusButton}>
              <Text style={styles.buttonText}>Status: finalizada</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.descButton}>
              <Text style={styles.buttonText}>Descrição</Text>
            </TouchableOpacity>
          </View>
        </View>

      </ScrollView>

      <Navbar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
  },
  header: {
    backgroundColor: "#FDCB5C",
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  logo: {
    fontSize: 28,
    fontWeight: "900",
    color: "#000",
  },
  logoSub: {
    fontSize: 10,
    marginTop: -5,
    letterSpacing: 2,
    fontWeight: "bold",
  },
  scrollContent: {
    paddingBottom: 100,
  },
  petsCarousel: {
    paddingVertical: 20,
    paddingLeft: 20,
  },
  petItem: {
    alignItems: "center",
    marginRight: 20,
  },
  petCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: "#FDCB5C",
    overflow: "hidden",
  },
  petCircleSelected: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: "#FDCB5C",
    overflow: "hidden",
    elevation: 5,
  },
  petImage: {
    width: "100%",
    height: "100%",
  },
  addButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#FDCB5C",
    justifyContent: "center",
    alignItems: "center",
  },
  petName: {
    marginTop: 5,
    fontSize: 14,
    fontWeight: "500",
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
    flexDirection: "row",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: 10,
  },
  verTudo: {
    fontSize: 16,
    color: "#333",
  },
  card: {
    backgroundColor: "#FFF",
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 15,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#FDCB5C",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  cardPetName: {
    color: "#666",
    fontSize: 16,
  },
  cardDate: {
    color: "#888",
    marginVertical: 4,
  },
  cardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 5,
  },
  cardInfo: {
    fontSize: 13,
    color: "#333",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
  },
  statusButton: {
    backgroundColor: "#FDCB5C",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    flex: 0.48,
    alignItems: "center",
  },
  descButton: {
    backgroundColor: "#FDCB5C",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    flex: 0.48,
    alignItems: "center",
  },
  buttonText: {
    fontWeight: "600",
    fontSize: 13,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    backgroundColor: "#FDCB5C",
    height: 70,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
});