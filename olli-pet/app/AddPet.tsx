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
  Alert,
  ActivityIndicator,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import AsyncStorage from "@react-native-async-storage/async-storage";

import Header from "@/components/Header";
import Navbar from "@/components/Navbar";
import BotaoIA from "@/components/BotaoIA";

export default function AdicionarPet() {
  const [nome, setNome] = useState("");
  const [raca, setRaca] = useState("");
  const [nascimento, setNascimento] = useState("");
  const [cor, setCor] = useState("");
  const [porte, setPorte] = useState("");
  const [sexo, setSexo] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);

  const obterImagemPet = (termo: string) => {
    const busca = termo.toLowerCase();
    if (busca.includes("cavalo")) {
      return require("./assets/images/cavalo.png"); 
    }
    if (busca.includes("ornitorrinco")) {
      return require("./assets/images/ornitorrinco.png");
    }
    return require("./assets/images/dog.png"); 
  };

  const handleSalvarPet = async () => {

    if (!nome || !raca || !cor || !porte) {
      Alert.alert("Ops!", "Preencha pelo menos Nome, Raça, Cor e Porte, diva!");
      return;
    }

    setLoading(true);

    try {
      const usuarioLogadoRaw = await AsyncStorage.getItem("@olli_user_logado");
      const usuarioLogado = usuarioLogadoRaw ? JSON.parse(usuarioLogadoRaw) : null;
      
      const uidTutorAtivo = usuarioLogado ? usuarioLogado.uid : "user_olli_123";

      const petsExistentesRaw = await AsyncStorage.getItem("@olli_pets");
      const listaPets = petsExistentesRaw ? JSON.parse(petsExistentesRaw) : [];

      const novoPet = {
        id: `pet_${Date.now()}`,
        nome,
        raca,
        sexo: sexo || "Não informado",
        porte,
        nascimento: nascimento || "Não informado",
        cor,
        info: info || "Este pet não possui uma biografia cadastrada.",
        uidTutor: uidTutorAtivo, // Amarra o pet ao dono que está logado
        createdAt: new Date().toISOString(),
      };

      listaPets.push(novoPet);
      await AsyncStorage.setItem("@olli_pets", JSON.stringify(listaPets));

      Alert.alert("Sucesso!", `${nome} foi adicionado à sua família! 🐾`);
      router.replace("/home"); 
    } catch (error: any) {
      console.error(error);
      Alert.alert("Erro ao salvar", "Não conseguimos cadastrar o pet localmente.");
    } finally {
      setLoading(false);
    }
  };

  const alternarSexo = () => {
    if (sexo === "Macho") setSexo("Fêmea");
    else if (sexo === "Fêmea") setSexo("Não informado");
    else setSexo("Macho");
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FDCB5C" />
      
      <Header />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="black" />
          <Text style={styles.backText}>Voltar</Text>
        </TouchableOpacity>

        <Text style={styles.pageTitle}>Adicionar PET</Text>

        <View style={styles.imageSection}>
          <View style={styles.imagePlaceholder}>
            <Image 
              source={obterImagemPet(raca || nome)} 
              style={styles.petAvatar} 
              resizeMode="cover"
            />
          </View>
          <Text style={styles.imageLabel}>Avatar baseado na Raça</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Nome completo</Text>
          <TextInput style={styles.input} value={nome} onChangeText={setNome} />

          <Text style={styles.label}>Raça (Dog, Cavalo, Ornitorrinco)</Text>
          <TextInput 
            style={styles.input} 
            value={raca} 
            onChangeText={raca => setRaca(raca)} 
            placeholder="Ex: Cavalo"
          />

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
              <TouchableOpacity style={styles.selectInput} onPress={alternarSexo}>
                <Text>{sexo || "Selecionar"}</Text>
                <Ionicons name="chevron-down" size={20} color="black" />
              </TouchableOpacity>
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

          <TouchableOpacity 
            style={[styles.addButton, loading && { opacity: 0.7 }]} 
            onPress={handleSalvarPet}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text style={styles.addButtonText}>Adicionar</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
      <BotaoIA />
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
  imagePlaceholder: { width: 120, height: 120, borderRadius: 60, backgroundColor: "#FDCB5C", justifyContent: "center", alignItems: "center", overflow: "hidden", elevation: 4 },
  petAvatar: { width: "100%", height: "100%" },
  imageLabel: { marginTop: 8, fontSize: 14, color: "#333" },
  form: { paddingHorizontal: 25, marginTop: 10 },
  label: { fontSize: 14, fontWeight: "500", marginBottom: 5, color: "#000" },
  subLabel: { fontSize: 11, color: "#666" },
  input: { height: 45, borderWidth: 1.5, borderColor: "#FDCB5C", borderRadius: 20, paddingHorizontal: 15, marginBottom: 15, backgroundColor: "#FFF", elevation: 2 },
  textArea: { height: 100, textAlignVertical: "top", paddingTop: 10 },
  row: { flexDirection: "row", marginBottom: 5 },
  flex1: { flex: 1 },
  selectInput: { height: 45, borderWidth: 1.5, borderColor: "#FDCB5C", borderRadius: 20, paddingHorizontal: 15, flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: "#FFF", elevation: 2 },
  addButton: { backgroundColor: "#FDCB5C", height: 45, width: 150, borderRadius: 22.5, alignSelf: "flex-end", justifyContent: "center", alignItems: "center", marginTop: 10, elevation: 3 },
  addButtonText: { fontWeight: "bold", fontSize: 16 }
});