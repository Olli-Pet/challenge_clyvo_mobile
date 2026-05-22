import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar, ScrollView, Image, Alert } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

// Importamos o AsyncStorage para salvar quem está logado no aparelho
import AsyncStorage from "@react-native-async-storage/async-storage";

import OndaTop from "@/components/Onda";
import OndaBottom from "@/components/OndaBottom";

export default function Index() {
  const [email, setEmail] = useState("olli@gmail.com"); // Padrão já como Olli!
  const [senha, setSenha] = useState("123");
  
  // Controle de Abas: "tutor" ou "vet"
  const [tipoUsuario, setTipoUsuario] = useState<"tutor" | "vet">("tutor");

  // Cores dinâmicas com base na seleção
  const corAtiva = tipoUsuario === "vet" ? "#66A6FA" : "#E7B84C";

  async function entrar() {
    if (!email || !senha) {
      Alert.alert("Erro", "Por favor, preencha todos os campos.");
      return;
    }

    const emailNormalizado = email.trim().toLowerCase();

    // 1. FLUXO EXCLUSIVO DO MÉDICO VETERINÁRIO
    if (tipoUsuario === "vet") {
      // Login padrão de testes para o Veterinário
      if (emailNormalizado === "vet@gmail.com" && senha === "123") {
        const vetLogado = {
          uid: "vet_dr_andre_789",
          email: emailNormalizado,
          nome: "Dr. André Rosa",
          tipo: "vet"
        };
        await AsyncStorage.setItem("@olli_user_logado", JSON.stringify(vetLogado));
        
        Alert.alert("Sucesso", "Acesso Med Vet Autorizado!");
        router.push("/homevet"); // Em breve criaremos essa rota!
        return;
      } else {
        Alert.alert("Erro de Login", "Credenciais de Med Vet incorretas. (Use vet@gmail.com / 123 para testar)");
        return;
      }
    }

    // 2. USUÁRIOS PADRÃO TUTOR (Olli e Gaby entram direto)
    if (emailNormalizado === "olli@gmail.com" || emailNormalizado === "gaby@gmail.com") {
      const usuarioLogado = {
        uid: emailNormalizado === "olli@gmail.com" ? "user_olli_123" : "user_gaby_456",
        email: emailNormalizado,
        nome: emailNormalizado === "olli@gmail.com" ? "Olli" : "Gaby",
        tipo: "tutor"
      };

      await AsyncStorage.setItem("@olli_user_logado", JSON.stringify(usuarioLogado));
      router.push("/home");
      return;
    }

    // 3. BUSCAR SE EXISTE UM USUÁRIO DE DEMONSTRAÇÃO TUTOR CRIADO NO APARELHO
    try {
      const usuariosCadastradosRaw = await AsyncStorage.getItem("@olli_usuarios_cadastrados");
      const listaUsuarios = usuariosCadastradosRaw ? JSON.parse(usuariosCadastradosRaw) : [];

      const usuarioEncontrado = listaUsuarios.find((u: any) => u.email === emailNormalizado && u.senha === senha);

      if (usuarioEncontrado) {
        const usuarioLogado = {
          uid: usuarioEncontrado.uid,
          email: usuarioEncontrado.email,
          nome: usuarioEncontrado.nome,
          tipo: "tutor"
        };

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
      <StatusBar barStyle="dark-content" backgroundColor={corAtiva} />

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

        {/* SELETOR INTERATIVO TUTOR VS MED VET */}
        <View style={styles.selectorContainer}>
          <TouchableOpacity
            style={[styles.selectorButton, tipoUsuario === "tutor" && styles.selectorActiveTutor]}
            activeOpacity={0.8}
            onPress={() => {
              setTipoUsuario("tutor");
              setEmail("olli@gmail.com"); // Coloca o e-mail teste de tutor
            }}
          >
            <Ionicons name="person" size={16} color={tipoUsuario === "tutor" ? "#000" : "#666"} />
            <Text style={[styles.selectorText, tipoUsuario === "tutor" && styles.textActive]}>Responsável</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.selectorButton, tipoUsuario === "vet" && styles.selectorActiveVet]}
            activeOpacity={0.8}
            onPress={() => {
              setTipoUsuario("vet");
              setEmail("vet@gmail.com"); // Sugere o e-mail teste de vet para agilizar
            }}
          >
            <Ionicons name="medical" size={16} color={tipoUsuario === "vet" ? "#FFF" : "#666"} />
            <Text style={[styles.selectorText, tipoUsuario === "vet" && styles.textActiveVet]}>Med Vet</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.title}>
          {tipoUsuario === "vet" ? "Acesso Médico Veterinário" : "Bem-vindo de volta (Modo Local)"}
        </Text>

        {/* EMAIL */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>E-mail</Text>
          <TextInput
            placeholder="Digite seu e-mail"
            placeholderTextColor="#999"
            style={[styles.input, { borderColor: corAtiva }]} // Borda muda de cor dinamicamente!
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
            style={[styles.input, { borderColor: corAtiva }]} // Borda muda de cor dinamicamente!
            value={senha}
            onChangeText={setSenha}
            secureTextEntry
          />
        </View>

        {/* BOTÃO */}
        <TouchableOpacity style={[styles.button, { backgroundColor: corAtiva }]} onPress={entrar}>
          <Text style={[styles.buttonText, { color: tipoUsuario === "vet" ? "#FFF" : "#000" }]}>
            {tipoUsuario === "vet" ? "Acessar Painel Médico" : "Entrar"}
          </Text>
        </TouchableOpacity>

        {/* LINK */}
        {tipoUsuario === "tutor" && (
          <TouchableOpacity onPress={cadastrar}>
            <Text style={styles.link}>Não possui conta? Crie uma de Demonstração</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F2F2F2" },
  content: { flexGrow: 1, justifyContent: "center", paddingHorizontal: 28, paddingTop: 110, paddingBottom: 120 },
  logoContainer: { marginBottom: 20, width: '100%', alignItems: 'center', justifyContent: 'center' },
  logoImage: { width: 200, height: 120 },
  
  // Estilos do Seletor de Perfis
  selectorContainer: { flexDirection: "row", backgroundColor: "#EAEAEA", borderRadius: 30, padding: 4, marginBottom: 25, width: "70%", alignSelf: "center" },
  selectorButton: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 10, borderRadius: 25, gap: 6 },
  selectorActiveTutor: { backgroundColor: "#E7B84C", elevation: 2 },
  selectorActiveVet: { backgroundColor: "#66A6FA", elevation: 2 },
  selectorText: { fontSize: 14, fontWeight: "600", color: "#666" },
  textActive: { color: "#000" },
  textActiveVet: { color: "#FFF" },

  title: { fontSize: 22, fontWeight: "700", textAlign: "center", marginBottom: 28, color: "#111" },
  inputGroup: { marginBottom: 18 },
  label: { fontSize: 14, marginBottom: 7, marginLeft: 6, color: "#333" },
  input: { backgroundColor: "#FFF", borderRadius: 30, paddingHorizontal: 18, height: 52, borderWidth: 1.5, fontSize: 15, elevation: 3 },
  button: { height: 52, borderRadius: 30, justifyContent: "center", alignItems: "center", marginTop: 12, elevation: 4 },
  buttonText: { fontSize: 16, fontWeight: "700" },
  link: { textAlign: "center", marginTop: 20, fontSize: 14, fontWeight: "600", color: "#111", textDecorationLine: "underline" },
});