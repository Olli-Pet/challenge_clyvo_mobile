import React, { useState } from "react";
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Image, TouchableOpacity } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";

import Header from "@/components/Header";
import Navbar from "@/components/Navbar";
import BotaoIA from "@/components/BotaoIA";
import ModalInsights from "@/components/ModalInsights"; // <--- Importando o componente novo

export default function PetProfile() {
  const params = useLocalSearchParams();
  
  const nome = (params.nome as string) || "Pet sem nome";
  const raca = (params.raca as string) || "Não informada";
  const cor = (params.cor as string) || "Não informada";
  const porte = (params.porte as string) || "Não informado";
  const sexo = (params.sexo as string) || "Não informado";
  const nascimento = (params.nascimento as string) || "Não informado";
  const info = (params.info as string) || "Este pet não possui uma biografia cadastrada.";

  const [modalVisivel, setModalVisivel] = useState(false);
  const [insights, setInsights] = useState([
    "Condição física: saudável",
    "Pelo: saudável",
    "Disposição: normal",
    "Alimentação em dia"
  ]);

  const obterImagemPorRaca = (termo: string) => {
    const busca = termo.toLowerCase();
    if (busca.includes("cavalo")) return require("./assets/images/cavalo.png");
    if (busca.includes("ornitorrinco")) return require("./assets/images/ornitorrinco.png");
    return require("./assets/images/dog.png");
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* BOTÃO VOLTAR */}
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="black" />
          <Text style={styles.backText}>Voltar</Text>
        </TouchableOpacity>

        {/* HEADER DO PET */}
        <View style={styles.petHeader}>
          <View style={styles.imageContainer}>
            <Image source={obterImagemPorRaca(raca || nome)} style={styles.petImage} resizeMode="cover" />
          </View>
          
          <View style={styles.nameCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.petNameText}>{nome}</Text>
              <Text style={styles.petBreedText}>{raca}, {nascimento}</Text>
            </View>
            <View style={styles.genderIcons}>
              {sexo.toLowerCase().includes("macho") ? (
                <Ionicons name="male" size={24} color="black" />
              ) : sexo.toLowerCase().includes("fêmea") ? (
                <Ionicons name="female" size={24} color="black" />
              ) : (
                <Ionicons name="help-circle-outline" size={24} color="gray" />
              )}
            </View>
          </View>
        </View>

        {/* BIO PET */}
        <View style={styles.section}>
          <Text style={styles.bioTitle}>BioPet</Text>
          <Text style={styles.bioDescription}>{info}</Text>
        </View>

        {/* SOBRE O PET */}
        <Text style={styles.mainSectionTitle}>Sobre {nome}</Text>
        <View style={styles.statsContainer}>
          <StatBox label="Porte" value={porte} />
          <StatBox label="Nascimento" value={nascimento} />
          <StatBox label="Cor" value={cor} />
        </View>

        {/* INSIGHTS */}
        <View style={styles.sectionHeaderRow}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="bulb-outline" size={24} color="black" />
            <Text style={styles.sectionTitle}>Últimos insights</Text>
          </View>
          
          <TouchableOpacity style={styles.btnGerarInsight} onPress={() => setModalVisivel(true)}>
            <MaterialCommunityIcons name="auto-fix" size={16} color="black" />
            <Text style={styles.btnGerarInsightText}>Gerar Insight</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.insightsContainer}>
          {insights.map((item, index) => (
            <InsightTag key={index} text={item} />
          ))}
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
          <DateCard title="Próxima vacina:" detail="Anual - Pendente" />
          <DateCard title="Próxima consulta:" detail="Rotina preventiva" />
        </View>
      </ScrollView>

      {/* --- O NOSSO COMPONENTE DO MODAL ENCAIXADO AQUI --- */}
      <ModalInsights 
        visivel={modalVisivel}
        onClose={() => setModalVisivel(false)}
        nomePet={nome}
        onInsightsGerados={(novosInsights) => setInsights(novosInsights)}
      />

      <BotaoIA />
      <Navbar />
    </SafeAreaView>
  );
}

// Sub-componentes estruturais mantidos abaixo do arquivo
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
  backText: { fontSize: 16, fontWeight: "500", marginLeft: 5 },
  petHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 20 },
  imageContainer: { width: 130, height: 130, borderRadius: 65, backgroundColor: '#FDCB5C', overflow: 'hidden', elevation: 5},
  petImage: { width: '100%', height: '100%'},
  nameCard: { backgroundColor: '#FDE4A8', padding: 15, borderRadius: 15, flex: 0.9, elevation: 3, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  petNameText: { fontSize: 20, fontWeight: 'bold' },
  petBreedText: { fontSize: 12, color: '#444', marginTop: 2 },
  genderIcons: { flexDirection: 'row', marginLeft: 10 },
  section: { marginVertical: 10 },
  bioTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 5 },
  bioDescription: { fontSize: 13, color: '#666', lineHeight: 18 },
  mainSectionTitle: { fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginVertical: 15 },
  statsContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  statBox: { width: '31%', borderWidth: 1, borderColor: '#FDCB5C', borderRadius: 10, alignItems: 'center', paddingVertical: 15, backgroundColor: '#FFF', elevation: 2 },
  statLabelContainer: { position: 'absolute', top: -10, backgroundColor: '#FDCB5C', paddingHorizontal: 10, borderRadius: 10 },
  statLabelText: { fontSize: 11, fontWeight: 'bold' },
  statValueText: { fontSize: 12, fontWeight: '600', textAlign: 'center', marginTop: 5 },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 10 },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginLeft: 8 },
  btnGerarInsight: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FDE4A8', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: '#FDCB5C' },
  btnGerarInsightText: { fontSize: 12, fontWeight: 'bold', marginLeft: 4, color: 'black' },
  insightsContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  insightTag: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#FDCB5C', padding: 10, borderRadius: 12, width: '48%', marginBottom: 10, elevation: 2, alignItems: 'center' },
  insightTagText: { fontSize: 12, fontWeight: '500' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
  verCalendario: { fontSize: 14, color: '#333' },
  dateCardsContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  dateCard: { width: '48%', backgroundColor: '#FDCB5C', padding: 15, borderRadius: 12, elevation: 3, alignItems: 'center' },
  dateCardTitle: { fontSize: 13, fontWeight: '500', textAlign: 'center' },
  dateCardDetail: { fontSize: 13, fontWeight: 'bold', textAlign: 'center', marginTop: 4 }
});