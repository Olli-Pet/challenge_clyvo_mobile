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
} from "react-native";
import { router } from "expo-router";

import OndaTop from "@/components/Onda";
import OndaBottom from "@/components/OndaBottom";
import { Alert, ActivityIndicator } from "react-native";
import { auth, db } from "@/config/firebase"; // Importe o auth e db
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

const PRIMARY_YELLOW = "#FDCB5C";

export default function Cadastro() {
  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCadastro = async () => {
    // 1. Validações básicas
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
      // 2. Criar usuário no Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
      const user = userCredential.user;

      // 3. Salvar dados extras no Firestore (usando o UID do usuário como ID do documento)
      await setDoc(doc(db, "tutores", user.uid), {
        nome: nome,
        cpf: cpf,
        email: email,
        uid: user.uid,
        createdAt: new Date(),
      });

      Alert.alert("Sucesso!", "Conta criada com sucesso!");
      router.replace("/Home"); // Vai para Home e "apaga" a tela de cadastro do histórico

    } catch (error: any) {
      console.error(error);
      let mensagemErro = "Ocorreu um erro ao cadastrar.";
      
      if (error.code === 'auth/email-already-in-use') mensagemErro = "Este e-mail já está em uso!";
      if (error.code === 'auth/invalid-email') mensagemErro = "E-mail inválido!";
      
      Alert.alert("Ops!", mensagemErro);
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
          
          {/* ESPAÇO PARA A SUA LOGO EM IMAGEM */}
          <View style={styles.logoContainer}>
            <Image 
              source={require("@/assets/images/Olli Logo.svg")}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>

          {/* FORMULÁRIO */}
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

{/* BOTÃO CADASTRAR CORRIGIDO */}
<TouchableOpacity 
  style={[styles.button, loading && { opacity: 0.7 }]} 
  activeOpacity={0.8}
  onPress={handleCadastro} // <--- MUDE DE console.log PARA handleCadastro
  disabled={loading}
>
  {loading ? (
    <ActivityIndicator color="#000" />
  ) : (
    <Text style={styles.buttonText}>Cadastrar</Text>
  )}
</TouchableOpacity>

            {/* LINK LOGIN */}
            <TouchableOpacity 
              style={styles.loginLink} 
              onPress={() => router.push("/Index")}
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
  container: {
    flex: 1,
    backgroundColor: "#FFF",
    overflow: "hidden",
  },
  scrollContent: {
    paddingHorizontal: 40,
    paddingTop: 40, // Reduzi um pouco para a imagem caber melhor
    paddingBottom: 40,
    alignItems: "center",
  },
  waveTop: {
    position: "absolute",
    width: 500,
    height: 500,
    borderRadius: 250,
    backgroundColor: PRIMARY_YELLOW,
    top: -280,
    right: -100,
    opacity: 0.7,
  },
  waveBottom: {
    position: "absolute",
    width: 500,
    height: 500,
    borderRadius: 250,
    backgroundColor: PRIMARY_YELLOW,
    bottom: -300,
    left: -150,
    opacity: 0.7,
  },
  logoContainer: {
    marginBottom: 30,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImage: {
    width: 200,   // Ajuste o tamanho conforme a sua imagem
    height: 120,  // Ajuste o tamanho conforme a sua imagem
  },
  form: {
    width: "100%",
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    color: "#000",
    marginBottom: 5,
    marginLeft: 10,
    fontWeight: "500",
  },
  input: {
    width: "100%",
    height: 45,
    borderWidth: 1.5,
    borderColor: PRIMARY_YELLOW,
    borderRadius: 25,
    paddingHorizontal: 20,
    fontSize: 16,
    backgroundColor: "#FFF",
  },
  button: {
    backgroundColor: PRIMARY_YELLOW,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
  },
  loginLink: {
    marginTop: 30,
    alignItems: "center",
  },
  loginLinkText: {
    fontSize: 14,
    color: "#000",
    textDecorationLine: "underline",
    fontWeight: "500",
  },
});