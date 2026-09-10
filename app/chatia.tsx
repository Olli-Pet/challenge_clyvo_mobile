import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import Header from "@/components/Header";

import { sendMessageToGemini } from "@/services/api/OpenIAApi";

interface Message {
  id: string;
  text: string;
  sender: "me" | "olli";
}

export default function ChatAI() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { id: "1", text: "Olá! Sou a OLLIA. Como posso ajudar você e seu pet hoje?", sender: "olli" }
  ]);
  const [loading, setLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const sendMessage = async () => {
    const textToSend = input.trim();
    if (textToSend === "" || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: textToSend,
      sender: "me"
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);

    try {
      console.log("Enviando para Gemini:", textToSend);
      const response = await sendMessageToGemini(textToSend);

      const olliMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response || "Desculpe, tive um probleminha para processar isso agora.",
        sender: "olli"
      };

      setMessages((prev) => [...prev, olliMessage]);
    } catch (error) {
      console.error("Erro na resposta do Gemini:", error);
      setMessages((prev) => [
        ...prev,
        { id: Date.now().toString(), text: "Ops! Fiquei sem sinal com os meus servidores de ração. Tente de novo!", sender: "olli" }
      ]);
    } finally {
      setLoading(false);

      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"} 
        style={styles.chatWrapper}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <View style={styles.chatContainer}>

          <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
            <Ionicons name="close" size={28} color="black" />
          </TouchableOpacity>

          <Text style={styles.chatTitle}>OLLIA</Text>

          <ScrollView 
            ref={scrollViewRef}
            contentContainerStyle={styles.messageList}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
          >
            {messages.map((item) => (
              <View 
                key={item.id} 
                style={[
                  styles.messageBubble, 
                  item.sender === "me" ? styles.meBubble : styles.olliBubble
                ]}
              >
                <Text style={styles.senderName}>
                  {item.sender === "me" ? "Você" : "Ollia"}
                </Text>
                <Text style={styles.messageText}>{item.text}</Text>
              </View>
            ))}

            {loading && (
              <View style={[styles.messageBubble, styles.olliBubble, { paddingVertical: 10 }]}>
                <ActivityIndicator size="small" color="#FDCB5C" />
              </View>
            )}
          </ScrollView>

          <View style={styles.inputArea}>
            <TextInput 
              style={styles.textInput} 
              placeholder="Digite aqui..."
              placeholderTextColor="#999"
              value={input}
              onChangeText={setInput}
              onSubmitEditing={sendMessage} 
            />
            <TouchableOpacity 
              style={styles.sendButton} 
              onPress={sendMessage}
              disabled={loading}
            >
              <Ionicons 
                name={loading ? "hourglass-outline" : "chevron-forward"} 
                size={24} 
                color="black" 
              />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF" },
  chatWrapper: { flex: 1, paddingHorizontal: 20, paddingTop: 10 },
  chatContainer: {
    flex: 1,
    backgroundColor: "#FDCB5C", 
    borderRadius: 30,
    padding: 15,
    marginBottom: 85, 
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
    letterSpacing: 2,
    color: "#000"
  },
  messageList: { paddingVertical: 15 },
  messageBubble: {
    backgroundColor: "#FFF",
    padding: 12,
    borderRadius: 18,
    marginBottom: 12,
    maxWidth: "85%", 
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  olliBubble: { 
    alignSelf: "flex-start",
    borderTopLeftRadius: 4,
  },
  meBubble: { 
    alignSelf: "flex-end",
    backgroundColor: "#E3F2FD", 
    borderTopRightRadius: 4,
  },
  senderName: { fontWeight: "bold", fontSize: 13, marginBottom: 3, color: "#333" },
  messageText: { fontSize: 14, color: "#111", lineHeight: 19 },
  
  inputArea: { 
    flexDirection: "row", 
    alignItems: "center", 
    marginTop: 5,
    paddingTop: 5
  },
  textInput: {
    flex: 1,
    backgroundColor: "#FFF",
    height: 48,
    borderRadius: 24,
    paddingHorizontal: 20,
    fontSize: 15,
    color: "#000",
    elevation: 3,
  },
  sendButton: {
    backgroundColor: "#FFF",
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
    elevation: 3,
  }
});