import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar, ScrollView, Image, Alert } from "react-native";
import { router } from "expo-router";

// Importamos o AsyncStorage para salvar quem está logado no aparelho
import AsyncStorage from "@react-native-async-storage/async-storage";

import OndaTop from "@/components/Onda";
import OndaBottom from "@/components/OndaBottom";

export default function Index() {
  const [email, setEmail] = useState("olli@gmail.com"); // Padrão já como Olli!
  const [senha, setSenha] = useState("123");

  async function entrar() {
    if (!email || !senha) {
      Alert.alert("Erro", "Por favor, preencha todos os campos.");
      return;
    }

    const emailNormalizado = email.trim().toLowerCase();

    // 1. USUÁRIOS PADRÃO (Olli e Gaby entram direto)
    if (emailNormalizado === "olli@gmail.com" || emailNormalizado === "gaby@gmail.com") {
      const usuarioLogado = {
        uid: emailNormalizado === "olli@gmail.com" ? "user_olli_123" : "user_gaby_456",
        email: emailNormalizado,
        nome: emailNormalizado === "olli@gmail.com" ? "Olli" : "Gaby"
      };

      // Salva no "mini-banco" do celular quem é o usuário logado atual
      await AsyncStorage.setItem("@olli_user_logado", JSON.stringify(usuarioLogado));
      
      router.push("/home");
      return;
    }

    // 2. BUSCAR SE EXISTE UM USUÁRIO DE DEMONSTRAÇÃO CRIADO NO APARELHO
    try {
      const usuariosCadastradosRaw = await AsyncStorage.getItem("@olli_usuarios_cadastrados");
      const listaUsuarios = usuariosCadastradosRaw ? JSON.parse(usuariosCadastradosRaw) : [];

      // Procura se o e-mail digitado existe na nossa lista local
      const usuarioEncontrado = listaUsuarios.find((u: any) => u.email === emailNormalizado && u.senha === senha);

      if (usuarioEncontrado) {
        const usuarioLogado = {
          uid: usuarioEncontrado.uid,
          email: usuarioEncontrado.email,
          nome: usuarioEncontrado.nome
        };

        // Salva que esse usuário de demonstração está ativo
        await AsyncStorage.setItem("@olli_user_logado", JSON.stringify(usuarioLogado));
        router.push("/home");
      } else {
        Alert.alert("Erro de Login", "Usuário não encontrado ou senha incorreta. (Tente olli@gmail.com)");
      }
    } catch (e) {
      Alert.alert("Erro", "Falha ao ler dados locais.");
    }
  }

  function cadastrar() {
    router.push("/cadastro");
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#E7B84C" />

      <OndaTop />
      <OndaBottom />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* LOGO */}
        <View style={styles.logoContainer}>
          <Image 
            source={require("../app/assets/images/Olli Logo.svg")}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.title}>Bem-vindo de volta (Modo Local)</Text>

        {/* EMAIL */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>E-mail</Text>
          <TextInput
            placeholder="Digite seu e-mail"
            placeholderTextColor="#999"
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        {/* SENHA */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Senha</Text>
          <TextInput
            placeholder="Digite sua senha"
            placeholderTextColor="#999"
            style={styles.input}
            value={senha}
            onChangeText={setSenha}
            secureTextEntry
          />
        </View>

        {/* BOTÃO */}
        <TouchableOpacity style={styles.button} onPress={entrar}>
          <Text style={styles.buttonText}>Entrar</Text>
        </TouchableOpacity>

        {/* LINK */}
        <TouchableOpacity onPress={cadastrar}>
          <Text style={styles.link}>Não possui conta? Crie uma de Demonstração</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

// Mantive exatamente os seus estilos visuais impecáveis
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F2F2F2" },
  content: { flexGrow: 1, justifyContent: "center", paddingHorizontal: 28, paddingTop: 110, paddingBottom: 120 },
  logoContainer: { marginBottom: 30, width: '100%', alignItems: 'center', justifyContent: 'center' },
  logoImage: { width: 200, height: 120 },
  title: { fontSize: 24, fontWeight: "700", textAlign: "center", marginBottom: 28, color: "#111" },
  inputGroup: { marginBottom: 18 },
  label: { fontSize: 14, marginBottom: 7, marginLeft: 6, color: "#333" },
  input: { backgroundColor: "#FFF", borderRadius: 30, paddingHorizontal: 18, height: 52, borderWidth: 1.5, borderColor: "#E7B84C", fontSize: 15, elevation: 3 },
  button: { backgroundColor: "#E7B84C", height: 52, borderRadius: 30, justifyContent: "center", alignItems: "center", marginTop: 12, elevation: 4 },
  buttonText: { fontSize: 16, fontWeight: "700", color: "#000" },
  link: { textAlign: "center", marginTop: 20, fontSize: 14, fontWeight: "600", color: "#111", textDecorationLine: "underline" },
});