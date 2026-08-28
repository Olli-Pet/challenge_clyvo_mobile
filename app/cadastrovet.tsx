import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, Alert, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db } from "../services/firebaseConfig";
import { salvarSessao } from "../services/sessao";

export default function CadastroVet() {
  const [nome, setNome] = useState("");
  const [crmv, setCrmv] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCadastro = async () => {
    if (!nome.trim() || !crmv.trim() || !email.trim() || !senha.trim()) {
      Alert.alert("Erro", "Preencha os dados médicos!");
      return;
    }

    if (senha.length < 6) {
      Alert.alert("Erro", "A senha precisa ter pelo menos 6 caracteres.");
      return;
    }

    setLoading(true);

    try {
      const emailNormalizado = email.trim().toLowerCase();

      // 1. Cria a conta no Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, emailNormalizado, senha);
      const user = userCredential.user;

      // 2. Monta o perfil. O campo 'tipo' é o que o login usa para direcionar
      //    o veterinário para a home clínica. A senha NÃO é gravada aqui:
      //    quem cuida dela é o Firebase Auth.
      const vetData = {
        uid: user.uid,
        tipo: "vet" as const,
        nome: nome.trim(),
        crmv: crmv.trim(),
        email: emailNormalizado,
        createdAt: serverTimestamp()
      };

      // 3. Salva na coleção unificada 'users', usando o UID gerado pelo Auth
      await setDoc(doc(db, "users", user.uid), vetData);

      // 4. Grava a sessão localmente. createdAt vira Date aqui porque
      //    serverTimestamp() é um marcador resolvido só pelo Firestore.
      await salvarSessao({ ...vetData, createdAt: new Date() });

      Alert.alert("Sucesso", "Doutor(a), seu perfil foi criado!", [
        { text: "Continuar", onPress: () => router.replace("/homevet") }
      ]);

    } catch (error: any) {
      console.error("Erro no cadastro do veterinário:", error);
      let mensagemErro = "Não foi possível realizar o cadastro.";

      if (error.code === "auth/email-already-in-use") {
        mensagemErro = "Este e-mail já está em uso por outra conta. Tente fazer login ou use outro e-mail.";
      } else if (error.code === "auth/invalid-email") {
        mensagemErro = "Formato de e-mail inválido.";
      } else if (error.code === "auth/weak-password") {
        mensagemErro = "A senha escolhida é muito fraca.";
      }

      Alert.alert("Erro de Cadastro", mensagemErro);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
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
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Senha de Acesso</Text>
            <TextInput
              style={styles.input}
              value={senha}
              onChangeText={setSenha}
              placeholder="Mínimo 6 caracteres"
              secureTextEntry
            />
          </View>

          <TouchableOpacity style={styles.button} onPress={handleCadastro} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.buttonText}>Finalizar Cadastro</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
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
