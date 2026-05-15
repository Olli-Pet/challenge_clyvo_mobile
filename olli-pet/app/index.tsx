import React, { useState } from "react";
import {View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar, ScrollView, Image} from "react-native";
import { router } from "expo-router";

import OndaTop from "@/components/Onda";
import OndaBottom from "@/components/OndaBottom";

export default function Index() {
  const [email, setEmail] = useState("gaby@gmail.com");
  const [senha, setSenha] = useState("123");

  function entrar() {
    router.push("/Home");
  }

  function cadastrar() {
    router.push("/Cadastro");
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#E7B84C" />

      <OndaTop />
      <OndaBottom />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
          {/* ESPAÇO PARA A SUA LOGO EM IMAGEM */}
          <View style={styles.logoContainer}>
            <Image 
              source={require("@/assets/images/Olli Logo.svg")}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>

        <Text style={styles.title}>Bem-vindo de volta</Text>

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
          <Text style={styles.link}>Não possui conta? Cadastre-se</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F2F2",
  },

  content: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 28,
    paddingTop: 110,
    paddingBottom: 120,
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

  logo: {
    fontSize: 62,
    fontWeight: "900",
    textAlign: "center",
    color: "#000",
    letterSpacing: 1,
  },

  logoSub: {
    fontSize: 14,
    textAlign: "center",
    marginTop: -8,
    letterSpacing: 4,
    marginBottom: 25,
    color: "#000",
  },

  title: {
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 28,
    color: "#111",
  },

  inputGroup: {
    marginBottom: 18,
  },

  label: {
    fontSize: 14,
    marginBottom: 7,
    marginLeft: 6,
    color: "#333",
  },

  input: {
    backgroundColor: "#FFF",
    borderRadius: 30,
    paddingHorizontal: 18,
    height: 52,
    borderWidth: 1.5,
    borderColor: "#E7B84C",
    fontSize: 15,
    elevation: 3,
  },

  button: {
    backgroundColor: "#E7B84C",
    height: 52,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
    elevation: 4,
  },

  buttonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#000",
  },

  link: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 14,
    fontWeight: "600",
    color: "#111",
    textDecorationLine: "underline",
  },
});