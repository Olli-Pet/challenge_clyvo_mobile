import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

interface EventCardProps {
  title: string;
  petName: string;
  date: string;
  doctor: string;
  clinic: string;
  status: string;
  onPressDescricao?: () => void; // Nova prop opcional para controlar o clique externo
}

export default function CardEventos({ 
  title, 
  petName, 
  date, 
  doctor, 
  clinic, 
  status, 
  onPressDescricao 
}: EventCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardPetName}>{petName}</Text>
      </View>

      <Text style={styles.cardDate}>{date}</Text>

      <View style={styles.cardRow}>
        <Text style={styles.cardInfo}>Médico(a): {doctor}</Text>
        <Text style={styles.cardInfo}>Clínica: {clinic}</Text>
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.actionButton} activeOpacity={0.7}>
          <Text style={styles.buttonText}>Status: {status}</Text>
        </TouchableOpacity>
        
        {/* Agora este botão dispara a função passada pela tela pai */}
        <TouchableOpacity 
          style={styles.actionButton} 
          activeOpacity={0.7}
          onPress={onPressDescricao}
        >
          <Text style={styles.buttonText}>Descrição</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFF", 
    marginHorizontal: 20, 
    marginBottom: 20,
    padding: 15, 
    borderRadius: 15, 
    borderWidth: 1, 
    borderColor: "#FDCB5C",
    elevation: 4, 
    shadowColor: "#000", 
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, 
    shadowRadius: 4,
  },
  cardHeader: { 
    flexDirection: "row", 
    justifyContent: "space-between",
    alignItems: "center" 
  },
  cardTitle: { 
    fontSize: 18, 
    fontWeight: "bold",
    color: "#000" 
  },
  cardPetName: { 
    color: "#666", 
    fontSize: 16 
  },
  cardDate: { 
    color: "#888", 
    marginVertical: 4,
    fontSize: 14
  },
  cardRow: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    marginTop: 5 
  },
  cardInfo: { 
    fontSize: 13, 
    color: "#333" 
  },
  buttonRow: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    marginTop: 15 
  },
  actionButton: {
    backgroundColor: "#FDCB5C", 
    paddingVertical: 10, 
    borderRadius: 20,
    flex: 0.48, 
    alignItems: "center",
    justifyContent: "center"
  },
  buttonText: { 
    fontWeight: "600", 
    fontSize: 13,
    color: "#000" 
  },
});