import React from "react";
import { Modal, View, Text, StyleSheet, TouchableOpacity, TouchableWithoutFeedback } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface ModalDescricaoEventoProps {
  visible: boolean;
  onClose: () => void;
  eventData: {
    title: string;
    petName: string;
    date: string;
    doctor: string;
    clinic: string;
    description: string;
  } | null;
}

export default function ModalDescricaoEvento({ visible, onClose, eventData }: ModalDescricaoEventoProps) {
  if (!eventData) return null;

  return (
    <Modal animationType="fade" transparent={true} visible={visible} onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContent}>

              <View style={styles.header}>
                <Text style={styles.title}>{eventData.title}</Text>
                <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                  <Ionicons name="close" size={24} color="#333" />
                </TouchableOpacity>
              </View>

              <Text style={styles.petName}>Paciente: <Text style={styles.bold}>{eventData.petName}</Text></Text>
              <Text style={styles.subInfo}>Data: {eventData.date} | {eventData.clinic}</Text>
              <Text style={styles.subInfo}>Profissional: {eventData.doctor}</Text>

              <View style={styles.divider} />

              <Text style={styles.sectionTitle}>Descrição do Procedimento</Text>
              <Text style={styles.descriptionText}>{eventData.description}</Text>

              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Text style={styles.closeButtonText}>Fechar</Text>
              </TouchableOpacity>

            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 25,
  },
  modalContent: {
    backgroundColor: "#FFF",
    width: "100%",
    borderRadius: 20,
    padding: 22,
    borderWidth: 1,
    borderColor: "#FDCB5C",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
    flex: 0.9,
  },
  petName: {
    fontSize: 14,
    color: "#555",
    marginBottom: 4,
  },
  subInfo: {
    fontSize: 13,
    color: "#777",
    marginBottom: 2,
  },
  bold: {
    fontWeight: "600",
  },
  divider: {
    height: 1,
    backgroundColor: "#EAEAEA",
    marginVertical: 15,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#E7B84C",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  descriptionText: {
    fontSize: 14,
    color: "#444",
    lineHeight: 20,
    marginBottom: 20,
  },
  closeButton: {
    backgroundColor: "#FDCB5C",
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
  },
  closeButtonText: {
    fontWeight: "bold",
    fontSize: 15,
    color: "#000",
  },
});