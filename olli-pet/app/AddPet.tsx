import React, { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

// Seus componentes reaproveitados
import Header from "@/components/Header";
import Navbar from "@/components/Navbar";

export default function AdicionarPet() {
  const [nome, setNome] = useState("");
  const [raca, setRaca] = useState("");
  const [nascimento, setNascimento] = useState("");
  const [cor, setCor] = useState("");
  const [porte, setPorte] = useState("");
  const [sexo, setSexo] = useState("");
  const [info, setInfo] = useState("");

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

        <Text style={styles.pageTitle}>Adicionar PET</Text>

        {/* SEÇÃO DE IMAGEM */}
        <View style={styles.imageSection}>
          <TouchableOpacity style={styles.imagePlaceholder}>
            <Ionicons name="add" size={40} color="black" />
          </TouchableOpacity>
          <Text style={styles.imageLabel}>Imagem</Text>
        </View>

        {/* FORMULÁRIO */}
        <View style={styles.form}>
          <Text style={styles.label}>Nome completo</Text>
          <TextInput style={styles.input} value={nome} onChangeText={setNome} />

          <Text style={styles.label}>Raça</Text>
          <TextInput style={styles.input} value={raca} onChangeText={setRaca} />

          {/* CAMPOS LADO A LADO */}
          <View style={styles.row}>
            <View style={styles.flex1}>
              <Text style={styles.label}>Data de nascimento{"\n"}<Text style={styles.subLabel}>(opcional)</Text></Text>
              <TextInput style={styles.input} value={nascimento} onChangeText={setNascimento} placeholder="00/00/0000" />
            </View>
            <View style={{ width: 15 }} />
            <View style={styles.flex1}>
              <Text style={styles.label}>Cor</Text>
              <TextInput style={styles.input} value={cor} onChangeText={setCor} />
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.flex1}>
              <Text style={styles.label}>Porte</Text>
              <TextInput style={styles.input} value={porte} onChangeText={setPorte} />
            </View>
            <View style={{ width: 15 }} />
            <View style={styles.flex1}>
              <Text style={styles.label}>Sexo</Text>
              <View style={styles.selectInput}>
                <Text>{sexo || "Selecionar"}</Text>
                <Ionicons name="chevron-down" size={20} color="black" />
              </View>
            </View>
          </View>

          <Text style={styles.label}>Informações adicionais</Text>
          <TextInput 
            style={[styles.input, styles.textArea]} 
            value={info} 
            onChangeText={setInfo} 
            multiline 
            numberOfLines={4} 
          />

          {/* BOTÃO ADICIONAR */}
          <TouchableOpacity style={styles.addButton}>
            <Text style={styles.addButtonText}>Adicionar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Navbar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF" },
  scrollContent: { paddingBottom: 100 },
  backButton: { flexDirection: "row", alignItems: "center", padding: 20 },
  backText: { fontSize: 16, fontWeight: "500", marginLeft: 5 },
  pageTitle: { fontSize: 22, fontWeight: "bold", paddingHorizontal: 20, marginBottom: 10 },
  
  imageSection: { alignItems: "center", marginVertical: 10 },
  imagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#FDCB5C",
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  imageLabel: { marginTop: 8, fontSize: 14, color: "#333" },

  form: { paddingHorizontal: 25, marginTop: 10 },
  label: { fontSize: 14, fontWeight: "500", marginBottom: 5, color: "#000" },
  subLabel: { fontSize: 11, color: "#666" },
  input: {
    height: 45,
    borderWidth: 1.5,
    borderColor: "#FDCB5C",
    borderRadius: 20,
    paddingHorizontal: 15,
    marginBottom: 15,
    backgroundColor: "#FFF",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  textArea: { height: 100, textAlignVertical: "top", paddingTop: 10 },
  row: { flexDirection: "row", marginBottom: 5 },
  flex1: { flex: 1 },
  selectInput: {
    height: 45,
    borderWidth: 1.5,
    borderColor: "#FDCB5C",
    borderRadius: 20,
    paddingHorizontal: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFF",
    elevation: 2,
  },
  addButton: {
    backgroundColor: "#FDCB5C",
    height: 45,
    width: 150,
    borderRadius: 22.5,
    alignSelf: "flex-end",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
  },
  addButtonText: { fontWeight: "bold", fontSize: 16 }
});