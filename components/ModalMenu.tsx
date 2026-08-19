import React from "react";
import { Modal, View, Text, StyleSheet, TouchableOpacity, TouchableWithoutFeedback } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface ModalMenuProps {
  visible: boolean;
  onClose: () => void;
  onOpenPerfil: () => void;
  onOpenGerenciar: () => void;
}

export default function ModalMenu({ visible, onClose, onOpenPerfil, onOpenGerenciar }: ModalMenuProps) {
  return (
    <Modal animationType="fade" transparent={true} visible={visible} onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.menuContainer}>
              <TouchableOpacity style={styles.menuItem} onPress={() => { onClose(); onOpenPerfil(); }}>
                <Ionicons name="person-outline" size={20} color="black" />
                <Text style={styles.menuText}>Meu Perfil</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.menuItem} onPress={() => { onClose(); onOpenGerenciar(); }}>
                <Ionicons name="paw-outline" size={20} color="black" />
                <Text style={styles.menuText}>Gerenciar Pets</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.2)" },
  menuContainer: { position: "absolute", top: 75, right: 20, backgroundColor: "#FFF", borderRadius: 12, padding: 10, minWidth: 180, elevation: 5, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 3, borderWidth: 1, borderColor: "#FDCB5C" },
  menuItem: { flexDirection: "row", alignItems: "center", paddingVertical: 12, paddingHorizontal: 10 },
  menuText: { fontSize: 14, fontWeight: "500", marginLeft: 10 }
});