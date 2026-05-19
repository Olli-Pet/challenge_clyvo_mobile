import React, { useState } from "react";
import { 
  View, Text, StyleSheet, SafeAreaView, TextInput, 
  TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform 
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

// Seus componentes de padrão
import Header from "@/components/Header";
import Navbar from "@/components/Navbar";

import { sendMessageToGemini } from "@/services/api/GeminiApi";

export default function ChatAI() {
  const [input, setInput] = useState("");


  const sendMessage = () => {
    if (input.trim() === "") return;
    // Aqui entra a lógica da API que te mostro abaixo
    console.log("Enviando para Gemini:", input);
    setInput("");
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"} 
        style={styles.chatWrapper}
      >
        <View style={styles.chatContainer}>
          {/* Botão Fechar do Print */}
          <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
            <Ionicons name="close" size={28} color="black" />
          </TouchableOpacity>

          <Text style={styles.chatTitle}>OLLIA</Text>

          {/* INPUT AREA */}
          <View style={styles.inputArea}>
            <TextInput 
              style={styles.textInput} 
              placeholder="Digite aqui..."
              value={input}
              onChangeText={setInput}
            />
            <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
              <Ionicons name="chevron-forward" size={24} color="black" />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>

      <Navbar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF" },
  chatWrapper: { flex: 1, paddingHorizontal: 20, paddingTop: 10 },
  chatContainer: {
    flex: 1,
    backgroundColor: "#FDCB5C", // Cor amarela do fundo do chat
    borderRadius: 30,
    padding: 15,
    marginBottom: 80, // Espaço para a Navbar
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  closeButton: { alignSelf: "flex-end" },
  chatTitle: { 
    fontSize: 32, 
    fontWeight: "900", 
    textAlign: "center", 
    marginTop: -10,
    letterSpacing: 2
  },
  messageList: { paddingVertical: 20 },
  messageBubble: {
    backgroundColor: "#FFF",
    padding: 15,
    borderRadius: 15,
    marginBottom: 15,
    width: "85%",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
  },
  olliBubble: { alignSelf: "flex-start" },
  meBubble: { alignSelf: "flex-end" },
  senderName: { fontWeight: "bold", fontSize: 16, marginBottom: 5 },
  messageText: { fontSize: 13, color: "#444", lineHeight: 18 },
  
  inputArea: { 
    flexDirection: "row", 
    alignItems: "center", 
    marginBottom: 10 
  },
  textInput: {
    flex: 1,
    backgroundColor: "#FFF",
    height: 45,
    borderRadius: 22,
    paddingHorizontal: 20,
    elevation: 3,
  },
  sendButton: {
    backgroundColor: "#FFF",
    width: 55,
    height: 45,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
    elevation: 3,
  }
});