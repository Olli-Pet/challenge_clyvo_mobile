import React, { useState } from "react";
import {
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
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import { useCriarPet } from "@/hooks/usePets";
import { Especie, ESPECIES, paraDataIso } from "@/services/api/petsApi";
import { ErroApi } from "@/services/api/clienteApi";
import { avisarEEntao, avisar } from "@/services/avisar";

import Header from "@/components/Header";

export default function AdicionarPet() {
  const [nome, setNome] = useState("");
  const [raca, setRaca] = useState("");
  const [nascimento, setNascimento] = useState("");
  const [cor, setCor] = useState("");
  const [porte, setPorte] = useState("");
  const [sexo, setSexo] = useState("");

  const [especie, setEspecie] = useState<Especie>("CAO");
  const [info, setInfo] = useState("");

  const { mutateAsync: cadastrarPet, isPending: loading } = useCriarPet();

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
  
  const formatarData = (text: string) => {

    const apenasNumeros = text.replace(/\D/g, "");
    
    let dataFormatada = apenasNumeros;
    
    if (apenasNumeros.length > 2 && apenasNumeros.length <= 4) {
      dataFormatada = `${apenasNumeros.slice(0, 2)}/${apenasNumeros.slice(2)}`;
    } else if (apenasNumeros.length > 4) {
      dataFormatada = `${apenasNumeros.slice(0, 2)}/${apenasNumeros.slice(2, 4)}/${apenasNumeros.slice(4, 8)}`;
    }
    
    setNascimento(dataFormatada);
  };

  const handleSalvarPet = async () => {
    if (!nome || !raca || !cor || !porte) {
      Alert.alert("Ops!", "Preencha pelo menos Nome, Raça, Cor e Porte, diva!");
      return;
    }

    if (!paraDataIso(nascimento)) {
      Alert.alert("Ops!", "Informe a data de nascimento no formato dd/mm/aaaa.");
      return;
    }

    try {
      const petCriado = await cadastrarPet({
        nome,
        raca,
        especie,
        nascimento,
        cor,
        porte,
        sexo: sexo || "Não informado",
        info: info || "Este pet não possui uma biografia cadastrada.",
      });

      avisarEEntao("Sucesso!", `${petCriado.nome} foi adicionado à sua família! 🐾`, () =>
        router.replace("/Home")
      );
    } catch (error: any) {
      console.error("Erro ao cadastrar o pet:", error);
      avisar(
        "Erro ao salvar",
        error instanceof ErroApi
          ? error.message
          : "Não conseguimos cadastrar o pet. Tente novamente."
      );
    }
  };

  const alternarSexo = () => {
    if (sexo === "Macho") setSexo("Fêmea");
    else if (sexo === "Fêmea") setSexo("Não informado");
    else setSexo("Macho");
  };

  const alternarPorte = () => {
    if (porte === "Pequeno") setPorte("Médio");
    else if (porte === "Médio") setPorte("Grande");
    else setPorte("Pequeno");
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FDCB5C" />
      <Header />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
      >
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

            <Text style={styles.label}>Espécie</Text>
            <View style={styles.especies}>
              {ESPECIES.map((item) => (
                <TouchableOpacity
                  key={item.valor}
                  style={[
                    styles.especieChip,
                    especie === item.valor && styles.especieChipAtivo,
                  ]}
                  onPress={() => setEspecie(item.valor)}
                >
                  <Text
                    style={[
                      styles.especieTexto,
                      especie === item.valor && styles.especieTextoAtivo,
                    ]}
                  >
                    {item.rotulo}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Raça</Text>
            <TextInput 
              style={styles.input} 
              value={raca} 
              onChangeText={raca => setRaca(raca)} 
              placeholder="Ex: Cavalo"
            />

            <View style={styles.row}>
              <View style={styles.flex1}>
                <Text style={styles.label}>Data de nascimento</Text>
                <TextInput 
                  style={styles.input} 
                  value={nascimento} 
                  onChangeText={formatarData} 
                  placeholder="DD/MM/AAAA" 
                  keyboardType="numeric"
                  maxLength={10} 
                />
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
                <TouchableOpacity style={styles.selectInput} onPress={alternarPorte}>
                  <Text>{porte || "Selecionar"}</Text>
                  <Ionicons name="chevron-down" size={20} color="black" />
                </TouchableOpacity>
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
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF" },
  scrollContent: { paddingBottom: 120 }, 
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
  input: { height: 45, borderWidth: 1.5, borderColor: "#FDCB5C", borderRadius: 20, paddingHorizontal: 15, marginBottom: 15, backgroundColor: "#FFF", elevation: 2, color: "#000" },
  textArea: { height: 100, textAlignVertical: "top", paddingTop: 10 },
  row: { flexDirection: "row", marginBottom: 5 },
  flex1: { flex: 1 },
  especies: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 4 },
  especieChip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: "#E0E0E0",
    backgroundColor: "#FFF",
  },
  especieChipAtivo: { backgroundColor: "#FFF6DF", borderColor: "#FDCB5C" },
  especieTexto: { fontSize: 13, color: "#555" },
  especieTextoAtivo: { color: "#8A6A10", fontWeight: "700" },
  selectInput: { height: 45, borderWidth: 1.5, borderColor: "#FDCB5C", borderRadius: 20, paddingHorizontal: 15, flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: "#FFF", elevation: 2 },
  addButton: { backgroundColor: "#FDCB5C", height: 45, width: 150, borderRadius: 22.5, alignSelf: "flex-end", justifyContent: "center", alignItems: "center", marginTop: 10, elevation: 3 },
  addButtonText: { fontWeight: "bold", fontSize: 16 }
});