import React from "react";
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Image, TouchableOpacity } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";

import Header from "@/components/Header";
import Navbar from "@/components/Navbar";

export default function PetProfile() {
  
  return (
    <SafeAreaView style={styles.container}>
      <Header />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* BOTÃO VOLTAR */}
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="black" />
          <Text style={styles.backText}>Voltar</Text>
        </TouchableOpacity>

        {/* HEADER DO PET (IMAGEM E NOME) */}
        <View style={styles.petHeader}>
          <View style={styles.imageContainer}>
            <Image 
              source={require("@/assets/images/dog.png")} // Substitua pela imagem da Nina
              style={styles.petImage} 
            />
          </View>
          
          <View style={styles.nameCard}>
            <View>
              <Text style={styles.petNameText}>Nina</Text>
              <Text style={styles.petBreedText}>pinscher, 2 anos</Text>
            </View>
            <View style={styles.genderIcons}>
              <Ionicons name="male" size={24} color="black" style={{ marginRight: 10 }} />
              <Ionicons name="female" size={24} color="black" />
            </View>
          </View>
        </View>

        {/* BIO PET */}
        <View style={styles.section}>
          <Text style={styles.bioTitle}>BioPet</Text>
          <Text style={styles.bioDescription}>
            Lorem Ipsum is simply dummy text of the printing and typesetting industry. 
            Lorem Ipsum has been the industry's standard dummy text ever since the 1500s.
          </Text>
        </View>

        {/* SOBRE NINA (CARDS PESO/ALTURA) */}
        <Text style={styles.mainSectionTitle}>Sobre Nina</Text>
        <View style={styles.statsContainer}>
          <StatBox label="Peso" value="5,750kg (ideal)" />
          <StatBox label="Altura" value="35cm" />
          <StatBox label="Cor" value="Caramelo" />
        </View>

        {/* ÚLTIMOS INSIGHTS */}
        <View style={styles.sectionTitleRow}>
          <Ionicons name="bulb-outline" size={24} color="black" />
          <Text style={styles.sectionTitle}>Últimos insights</Text>
        </View>
        <View style={styles.insightsContainer}>
          <InsightTag text="Condição física: saudável" />
          <InsightTag text="Pelo: saudável" />
          <InsightTag text="2 refeições (hoje)" />
          <InsightTag text="Não apresenta apatia" />
        </View>

        {/* DATAS */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="calendar-outline" size={24} color="black" />
            <Text style={styles.sectionTitle}>Datas</Text>
          </View>
          <TouchableOpacity><Text style={styles.verCalendario}>ver calendário</Text></TouchableOpacity>
        </View>

        <View style={styles.dateCardsContainer}>
          <DateCard title="Próxima vacina:" detail="Raiva - 25/07" />
          <DateCard title="Próxima consulta:" detail="Prevista para 31/09" />
        </View>

      </ScrollView>

      {/* Botão flutuante de chat (opcional) */}
      <TouchableOpacity style={styles.fab}>
        <Ionicons name="chatbox-ellipses" size={30} color="black" />
      </TouchableOpacity>

      <Navbar />
    </SafeAreaView>
  );
}

// Sub-componentes para limpar o código
const StatBox = ({ label, value }: {label: string; value: string}) => (
  <View style={styles.statBox}>
    <View style={styles.statLabelContainer}><Text style={styles.statLabelText}>{label}</Text></View>
    <Text style={styles.statValueText}>{value}</Text>
  </View>
);

const InsightTag = ({ text } : {text: string;}) => (
  <View style={styles.insightTag}><Text style={styles.insightTagText}>{text}</Text></View>
);

const DateCard = ({ title, detail } : {title: string; detail: string;}) => (
  <View style={styles.dateCard}>
    <Text style={styles.dateCardTitle}>{title}</Text>
    <Text style={styles.dateCardDetail}>{detail}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF" },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 120 },
  backButton: { flexDirection: "row", alignItems: "center", marginVertical: 15 },
  backText: { fontSize: 16, fontWeight: "500" },
  
  petHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 20 },
  imageContainer: { width: 130, height: 130, borderRadius: 65, backgroundColor: '#FDCB5C', overflow: 'hidden', elevation: 5},
  petImage: { width: '100%', height: '100%'},
  nameCard: { backgroundColor: '#FDE4A8', padding: 15, borderRadius: 15, flex: 0.9, elevation: 3, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  petNameText: { fontSize: 20, fontWeight: 'bold' },
  petBreedText: { fontSize: 12, color: '#444' },
  genderIcons: { flexDirection: 'row' },

  section: { marginVertical: 10 },
  bioTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 5 },
  bioDescription: { fontSize: 13, color: '#666', lineHeight: 18 },

  mainSectionTitle: { fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginVertical: 15 },
  statsContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  statBox: { width: '31%', borderWidth: 1, borderColor: '#FDCB5C', borderRadius: 10, alignItems: 'center', paddingVertical: 15, backgroundColor: '#FFF', elevation: 2 },
  statLabelContainer: { position: 'absolute', top: -10, backgroundColor: '#FDCB5C', paddingHorizontal: 10, borderRadius: 10 },
  statLabelText: { fontSize: 11, fontWeight: 'bold' },
  statValueText: { fontSize: 12, fontWeight: '600', textAlign: 'center', marginTop: 5 },

  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 10 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginLeft: 8 },
  insightsContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  insightTag: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#FDCB5C', padding: 10, borderRadius: 12, width: '48%', marginBottom: 10, elevation: 2, alignItems: 'center' },
  insightTagText: { fontSize: 12, fontWeight: '500' },

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
  verCalendario: { fontSize: 14, color: '#333' },
  dateCardsContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  dateCard: { width: '48%', backgroundColor: '#FDCB5C', padding: 15, borderRadius: 12, elevation: 3, alignItems: 'center' },
  dateCardTitle: { fontSize: 13, fontWeight: '500', textAlign: 'center' },
  dateCardDetail: { fontSize: 13, fontWeight: 'bold', textAlign: 'center', marginTop: 4 },

  fab: { position: 'absolute', right: 20, bottom: 90, backgroundColor: '#FDCB5C', width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', elevation: 5 }
});