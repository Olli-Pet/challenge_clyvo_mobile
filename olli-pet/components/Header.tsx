import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function Header() {
  return (
    <View style={styles.header}>
      <View>
        <Text style={styles.logo}>Olli</Text>
        <Text style={styles.logoSub}>PET</Text>
      </View>
      <TouchableOpacity activeOpacity={0.7}>
        <Ionicons name="menu" size={32} color="black" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: "#FDCB5C",
    paddingHorizontal: 20,
    paddingTop: 15,
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
  },
  logo: {
    fontSize: 28,
    fontWeight: "900",
    color: "#000",
  },
  logoSub: {
    fontSize: 10,
    marginTop: -5,
    letterSpacing: 2,
    fontWeight: "bold",
    textAlign: 'center'
  },
});