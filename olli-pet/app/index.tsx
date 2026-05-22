import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar, ScrollView, Image, Alert } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

import OndaTop from "@/components/Onda";
import OndaBottom from "@/components/OndaBottom";

export default function Index() {
  const [email, setEmail] = useState("olli@gmail.com");
  const [senha, setSenha] = useState("123");
  const [tipoUsuario, setTipoUsuario] = useState<"tutor" | "vet">("tutor");

  const corAtiva = tipoUsuario === "vet" ? "#66A6FA" : "#E7B84C";

  async function entrar() {
    if (!email || !senha) {
      Alert.alert("Erro", "Preencha tudo, diva!");
      return;
    }

    const emailNormalizado = email.trim().toLowerCase();

    if (tipoUsuario === "vet") {

      if (emailNormalizado === "vet@gmail.com" && senha === "123") {
        await AsyncStorage.setItem("@olli_user_logado", JSON.stringify({ uid: "vet1", nome: "Dr. André", tipo: "vet" }));
        router.push("/homevet");
      } else {
        Alert.alert("Erro", "Veterinário não encontrado!");
      }
    } else {
      await AsyncStorage.setItem("@olli_user_logado", JSON.stringify({ uid: "user1", nome: "Olli", tipo: "tutor" }));
      router.push("/home");
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={corAtiva} />

      <OndaTop color={corAtiva} />
      <OndaBottom color={corAtiva} />

      <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.logoContainer}>
        <Image 
          source={require("./assets/images/olli-logo.png")}
          style={styles.logoImage}
          resizeMode="contain"
        />
      </View>

        <View style={styles.selectorContainer}>
          <TouchableOpacity
            style={[styles.selectorButton, tipoUsuario === "tutor" && { backgroundColor: "#E7B84C" }]}
            onPress={() => setTipoUsuario("tutor")}
          >
            <Text style={[styles.selectorText, tipoUsuario === "tutor" && { color: "#000" }]}>Tutor</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.selectorButton, tipoUsuario === "vet" && { backgroundColor: "#66A6FA" }]}
            onPress={() => setTipoUsuario("vet")}
          >
            <Text style={[styles.selectorText, tipoUsuario === "vet" && { color: "#FFF" }]}>Med Vet</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.title}>{tipoUsuario === "vet" ? "Acesso Clínico" : "Bem-vindo de volta"}</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>E-mail</Text>
          <TextInput
            style={[styles.input, { borderColor: corAtiva }]}
            value={email}
            onChangeText={setEmail}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Senha</Text>
          <TextInput
            style={[styles.input, { borderColor: corAtiva }]}
            value={senha}
            onChangeText={setSenha}
            secureTextEntry
          />
        </View>

        <TouchableOpacity style={[styles.button, { backgroundColor: corAtiva }]} onPress={entrar}>
          <Text style={[styles.buttonText, { color: tipoUsuario === "vet" ? "#FFF" : "#000" }]}>Entrar</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push(tipoUsuario === "vet" ? "/cadastrovet" : "/cadastro")}>
          <Text style={styles.link}>Não possui conta? Cadastre-se</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F2F2F2" },
  content: { flexGrow: 1, justifyContent: "center", paddingHorizontal: 28, paddingTop: 100 },
  logoContainer: { marginBottom: 20, alignItems: 'center' },
  logoImage: { width: 250, height: 150 },
  selectorContainer: { flexDirection: "row", backgroundColor: "#DDD", borderRadius: 25, padding: 4, marginBottom: 20, width: "60%", alignSelf: "center" },
  selectorButton: { flex: 1, paddingVertical: 8, borderRadius: 20, alignItems: "center" },
  selectorText: { fontWeight: "bold", fontSize: 13, color: "#666" },
  title: { fontSize: 20, fontWeight: "bold", textAlign: "center", marginBottom: 20 },
  inputGroup: { marginBottom: 15 },
  label: { fontSize: 14, marginBottom: 5, marginLeft: 10 },
  input: { backgroundColor: "#FFF", borderRadius: 25, paddingHorizontal: 15, height: 45, borderWidth: 1.5 },
  button: { height: 45, borderRadius: 25, justifyContent: "center", alignItems: "center", marginTop: 10, elevation: 3 },
  buttonText: { fontWeight: "bold" },
  link: { textAlign: "center", marginTop: 20, textDecorationLine: "underline" }
});