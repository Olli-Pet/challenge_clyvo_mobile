import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function Navbar() {
  return (
    <View style={styles.footer}>
      <TouchableOpacity onPress={() => {/* Ação Adicionar */}}>
        <Ionicons name="add" size={35} color="black" />
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/home")}>
        <Ionicons name="home-outline" size={30} color="black" />
      </TouchableOpacity>

      <TouchableOpacity onPress={() => {/* Ação Pets */}}>
        <FontAwesome5 name="paw" size={26} color="black" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    backgroundColor: "#FDCB5C",
    height: 120,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
});