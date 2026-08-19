import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, Alert, ScrollView } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function CadastroVet() {
  const [nome, setNome] = useState("");
  const [crmv, setCrmv] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  const handleCadastro = async () => {
    if (!nome || !crmv || !email || !senha) {
      Alert.alert("Erro", "Preencha os dados médicos!");
      return;
    }

    const novoVet = { uid: Date.now().toString(), nome, crmv, email, senha, tipo: "vet" };

    const existentesRaw = await AsyncStorage.getItem("@olli_usuarios_cadastrados");
    const existentes = existentesRaw ? JSON.parse(existentesRaw) : [];
    existentes.push(novoVet);
    
    await AsyncStorage.setItem("@olli_usuarios_cadastrados", JSON.stringify(existentes));
    
    Alert.alert("Sucesso", "Doutor(a), seu perfil foi criado!", [
      { text: "Ir para Login", onPress: () => router.replace("/") }
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <TouchableOpacity style={styles.back} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#66A6FA" />
          <Text style={styles.backText}>Voltar</Text>
        </TouchableOpacity>

        <Ionicons name="medical" size={60} color="#66A6FA" style={{ alignSelf: "center" }} />
        <Text style={styles.title}>Cadastro Médico Veterinário</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Nome Completo</Text>
          <TextInput style={styles.input} value={nome} onChangeText={setNome} placeholder="Dr(a). ..." />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>CRMV</Text>
          <TextInput style={styles.input} value={crmv} onChangeText={setCrmv} placeholder="00000-UF" />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>E-mail Profissional</Text>
          <TextInput style={styles.input} value={email} onChangeText={setEmail} keyboardType="email-address" />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Senha de Acesso</Text>
          <TextInput style={styles.input} value={senha} onChangeText={setSenha} secureTextEntry />
        </View>

        <TouchableOpacity style={styles.button} onPress={handleCadastro}>
          <Text style={styles.buttonText}>Finalizar Cadastro</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF" },
  content: { padding: 30, justifyContent: "center", marginTop: 50 },
  back: { flexDirection: "row", alignItems: "center", marginBottom: 30 },
  backText: { color: "#66A6FA", marginLeft: 5, fontWeight: "bold" },
  title: { fontSize: 22, fontWeight: "bold", textAlign: "center", marginVertical: 20, color: "#333" },
  inputGroup: { marginBottom: 15 },
  label: { fontSize: 14, color: "#666", marginBottom: 5, marginTop: 50 },
  input: { borderBottomWidth: 2, borderBottomColor: "#66A6FA", height: 40, fontSize: 16 },
  button: { backgroundColor: "#66A6FA", height: 50, borderRadius: 25, justifyContent: "center", alignItems: "center", marginTop: 30 },
  buttonText: { color: "#FFF", fontWeight: "bold", fontSize: 16 }
});