import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Image, 
  Alert, 
  ActivityIndicator
} from "react-native";
import { router } from "expo-router";

import AsyncStorage from "@react-native-async-storage/async-storage";

import OndaTop from "@/components/Onda";
import OndaBottom from "@/components/OndaBottom";

const PRIMARY_YELLOW = "#FDCB5C";

export default function Cadastro() {
  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCadastro = async () => {
  
    if (!nome || !cpf || !email || !senha) {
      Alert.alert("Erro", "Preencha todos os campos, diva!");
      return;
    }
    if (senha !== confirmarSenha) {
      Alert.alert("Erro", "As senhas não conferem!");
      return;
    }
    if (senha.length < 6) {
      Alert.alert("Erro", "A senha precisa de pelo menos 6 caracteres.");
      return;
    }

    setLoading(true);

    try {
      const emailNormalizado = email.trim().toLowerCase();

      if (emailNormalizado === "olli@gmail.com") {
        Alert.alert("Erro", "Este e-mail já está reservado como usuário padrão!");
        setLoading(false);
        return;
      }

      const usuariosCadastradosRaw = await AsyncStorage.getItem("@olli_usuarios_cadastrados");
      const listaUsuarios = usuariosCadastradosRaw ? JSON.parse(usuariosCadastradosRaw) : [];

      const usuarioExiste = listaUsuarios.some((u: any) => u.email === emailNormalizado);
      if (usuarioExiste) {
        Alert.alert("Erro", "Este e-mail já está cadastrado neste dispositivo.");
        setLoading(false);
        return;
      }

      const novoUsuarioUid = `user_demo_${Date.now()}`;
      const novoUsuario = {
        uid: novoUsuarioUid,
        nome: nome,
        cpf: cpf,
        email: emailNormalizado,
        senha: senha, 
        createdAt: new Date().toISOString(),
      };

      listaUsuarios.push(novoUsuario);
      await AsyncStorage.setItem("@olli_usuarios_cadastrados", JSON.stringify(listaUsuarios));

      const usuarioLogado = {
        uid: novoUsuario.uid,
        email: novoUsuario.email,
        nome: novoUsuario.nome
      };
      await AsyncStorage.setItem("@olli_user_logado", JSON.stringify(usuarioLogado));

      Alert.alert("Sucesso! ✨", "Cadastro devidamente realizado.");
      router.replace("/home"); 

    } catch (error: any) {
      console.error(error);
      Alert.alert("Erro Local", "Não foi possível seguir com o cadastro.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <OndaTop />
      <OndaBottom />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          
          <View style={styles.logoContainer}>
            <Image 
              source={require("./assets/images/olli-logo.png")}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>

          <View style={styles.form}>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nome completo</Text>
              <TextInput 
                style={styles.input} 
                value={nome} 
                onChangeText={setNome}
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>CPF</Text>
              <TextInput 
                style={styles.input} 
                value={cpf} 
                onChangeText={setCpf}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>E-mail</Text>
              <TextInput 
                style={styles.input} 
                value={email} 
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Senha</Text>
              <TextInput 
                style={styles.input} 
                value={senha} 
                onChangeText={setSenha}
                secureTextEntry
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirmar senha</Text>
              <TextInput 
                style={styles.input} 
                value={confirmarSenha} 
                onChangeText={setConfirmarSenha}
                secureTextEntry
              />
            </View>

            <TouchableOpacity 
              style={[styles.button, loading && { opacity: 0.7 }]} 
              activeOpacity={0.8}
              onPress={handleCadastro} 
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#000" />
              ) : (
                <Text style={styles.buttonText}>Cadastrar</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.loginLink} 
              onPress={() => router.push("/")}
            >
              <Text style={styles.loginLinkText}>Já possuo uma conta</Text>
            </TouchableOpacity>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF", overflow: "hidden" },
  scrollContent: { paddingHorizontal: 40, paddingTop: 40, paddingBottom: 40, alignItems: "center" },
  logoContainer: { marginBottom: 10, width: '100%', alignItems: 'center', justifyContent: 'center' },
  logoImage: { width: 210, height: 240 },
  form: { width: "100%" },
  inputGroup: { marginBottom: 15 },
  label: { fontSize: 14, color: "#000", marginBottom: 5, marginLeft: 10, fontWeight: "500" },
  input: { width: "100%", height: 45, borderWidth: 1.5, borderColor: PRIMARY_YELLOW, borderRadius: 25, paddingHorizontal: 20, fontSize: 16, backgroundColor: "#FFF" },
  button: { backgroundColor: PRIMARY_YELLOW, height: 50, borderRadius: 25, justifyContent: "center", alignItems: "center", marginTop: 20, elevation: 4, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 4 },
  buttonText: { fontSize: 18, fontWeight: "bold", color: "#000" },
  loginLink: { marginTop: 30, alignItems: "center" },
  loginLinkText: { fontSize: 14, color: "#000", textDecorationLine: "underline", fontWeight: "500" },
});