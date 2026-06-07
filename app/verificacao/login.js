import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

const { width } = Dimensions.get("window");

const CORES = {
  fundo: "#F7F1E3",
  papel: "#FFFDF7",

  ouro: "#E4C441",
  ouroEscuro: "#C8A62D",

  tinta: "#1F1B16",
  tintaSuave: "#6B6255",

  borda: "#D8CFBE",
};

export default function Login() {
  const router = useRouter();

  const [nome, setNome] = useState("");

  async function criarPerfil() {
    if (!nome.trim()) {
      Alert.alert(
        "Atenção",
        "Digite seu nome."
      );
      return;
    }

    const usuario = {
      nome: nome.trim(),
      dataCriacao: new Date().toISOString(),
    };

    await AsyncStorage.setItem(
      "@coinvertix_usuario",
      JSON.stringify(usuario)
    );

    router.replace("/abas/home");
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={
        Platform.OS === "ios"
          ? "padding"
          : undefined
      }
    >
      <ScrollView
        contentContainerStyle={
          styles.scroll
        }
        showsVerticalScrollIndicator={
          false
        }
      >
        {/* NUVENS DECORATIVAS */}

        <View style={styles.nuvem1} />
        <View style={styles.nuvem2} />

        {/* PENTÁCULO */}

        <View
          style={
            styles.pentaculoContainer
          }
        >
          <View
            style={styles.pentaculo}
          >
            <Text
              style={
                styles.pentaculoEstrela
              }
            >
              ☆
            </Text>
          </View>
        </View>

        {/* TÍTULO */}

        <Text style={styles.logo}>
          COINVERTIX
        </Text>

        <Text style={styles.subtitulo}>
          Oportunidade, abundância e
          prosperidade.
        </Text>

        {/* CARD */}

        <View style={styles.card}>
          <Text
            style={styles.label}
          >
            Nome do consulente
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Digite seu nome"
            placeholderTextColor={
              CORES.tintaSuave
            }
            value={nome}
            onChangeText={setNome}
          />

          <TouchableOpacity
            style={styles.botao}
            onPress={criarPerfil}
          >
            <Text
              style={
                styles.botaoTexto
              }
            >
              COMEÇAR
            </Text>
          </TouchableOpacity>
        </View>

        {/* FRASE */}

        <View
          style={styles.rodape}
        >
          <Text
            style={
              styles.rodapeTexto
            }
          >
            Assim como o{" "}
            <Text
              style={
                styles.destaque
              }
            >
              Ás de Ouros
            </Text>{" "}
            representa novas
            oportunidades, sua jornada
            financeira começa aqui.
          </Text>
        </View>

        {/* JARDIM */}

        <View style={styles.jardim}>
          <View
            style={styles.jardimLinha}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:
      CORES.fundo,
  },

  scroll: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 40,
  },

  nuvem1: {
    position: "absolute",
    top: 60,
    left: -40,

    width: 140,
    height: 80,

    borderRadius: 50,

    backgroundColor:
      "#FFFFFF90",
  },

  nuvem2: {
    position: "absolute",
    top: 130,
    right: -50,

    width: 160,
    height: 90,

    borderRadius: 50,

    backgroundColor:
      "#FFFFFF70",
  },

  pentaculoContainer: {
    alignItems: "center",
    marginBottom: 24,
  },

  pentaculo: {
    width:
      Math.min(width * 0.3, 120),
    height:
      Math.min(width * 0.3, 120),

    borderRadius: 999,

    backgroundColor:
      CORES.ouro,

    borderWidth: 3,
    borderColor:
      CORES.tinta,

    justifyContent: "center",
    alignItems: "center",

    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 4,
    },

    elevation: 6,
  },

  pentaculoEstrela: {
    fontSize: 58,
    color: CORES.tinta,
    fontWeight: "300",
  },

  logo: {
    textAlign: "center",

    color: CORES.tinta,

    fontSize: 34,
    fontWeight: "700",

    letterSpacing: 4,

    marginBottom: 8,
  },

  subtitulo: {
    textAlign: "center",

    color:
      CORES.tintaSuave,

    fontSize: 15,

    lineHeight: 24,

    marginBottom: 36,

    fontStyle: "italic",
  },

  card: {
    backgroundColor:
      CORES.papel,

    borderWidth: 1,
    borderColor:
      CORES.borda,

    borderRadius: 24,

    padding: 24,

    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 3,
    },

    elevation: 3,
  },

  label: {
    color: CORES.tinta,

    fontSize: 15,
    fontWeight: "600",

    marginBottom: 12,
  },

  input: {
    backgroundColor:
      "#FFFEFB",

    borderWidth: 1.5,
    borderColor:
      CORES.borda,

    borderRadius: 16,

    paddingHorizontal: 18,
    paddingVertical: 16,

    fontSize: 16,

    color: CORES.tinta,
  },

  botao: {
    marginTop: 22,

    backgroundColor:
      CORES.ouro,

    borderWidth: 2,
    borderColor:
      CORES.tinta,

    borderRadius: 18,

    paddingVertical: 18,

    alignItems: "center",
  },

  botaoTexto: {
    color: CORES.tinta,

    fontWeight: "700",

    letterSpacing: 2,

    fontSize: 15,
  },

  rodape: {
    marginTop: 28,

    paddingHorizontal: 12,

    alignItems: "center",
  },

  rodapeTexto: {
    textAlign: "center",

    color:
      CORES.tintaSuave,

    lineHeight: 24,

    fontStyle: "italic",
  },

  destaque: {
    color:
      CORES.ouroEscuro,

    fontWeight: "700",
  },

  jardim: {
    marginTop: 40,
    alignItems: "center",
  },

  jardimLinha: {
    width: "90%",
    height: 2,

    backgroundColor:
      CORES.ouro,

    opacity: 0.5,
  },
});