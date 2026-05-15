import React from "react";
import { TouchableOpacity, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

export default function BotaoIA() {
  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.fab} 
        activeOpacity={0.7}
        onPress={() => router.push("/ChatAI")} // Garanta que o nome da rota está certo
      >
        <Ionicons name="chatbubble-ellipses-outline" size={28} color="black" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 20,
    bottom: 90, // Ajustado para ficar acima da Navbar
    zIndex: 999, // Para garantir que fique em cima de tudo
  },
  fab: {
    backgroundColor: '#FDCB5C', // Amarelo padrão OMi PET
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    // Sombra para dar o efeito "flutuante" do seu design
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  }
});