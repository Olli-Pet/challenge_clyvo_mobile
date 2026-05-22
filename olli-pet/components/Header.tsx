import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import ModalMenu from './ModalMenu';
import ModalPerfil from './ModalPerfil';
import ModalGerenciarPets from './ModalGerenciarPets';

export default function Header() {
  const [menuVisible, setMenuVisible] = useState(false);
  const [perfilVisible, setPerfilVisible] = useState(false);
  const [gerenciarVisible, setGerenciarVisible] = useState(false);

  return (
    <View style={styles.header}>
      <View style={styles.logoContainer}>
        <Image 
          source={require("../app/assets/images/olli-logo.png")}
          style={styles.logoImage}
          resizeMode="contain"
        />
      </View>

      <TouchableOpacity activeOpacity={0.7} onPress={() => setMenuVisible(true)}>
        <Ionicons name="menu" size={32} color="black" />
      </TouchableOpacity>

      <ModalMenu 
        visible={menuVisible} 
        onClose={() => setMenuVisible(false)}
        onOpenPerfil={() => setPerfilVisible(true)}
        onOpenGerenciar={() => setGerenciarVisible(true)}
      />

      <ModalPerfil 
        visible={perfilVisible} 
        onClose={() => setPerfilVisible(false)} 
      />

      <ModalGerenciarPets 
        visible={gerenciarVisible} 
        onClose={() => setGerenciarVisible(false)} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: "#FDCB5C",
    paddingHorizontal: 20,
    paddingTop: 70,
    paddingBottom: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    zIndex: 999, 
  },
  logoContainer: {
    justifyContent: "center",
    alignItems: "flex-start",
  },
  logoImage: {
    width: 100,
    height: 40,
  }
});