import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  Modal,
  TextInput,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";

export default function Perfil() {
  const router = useRouter();

  const [perfil, setPerfil] = useState(null);

  const [modalNome, setModalNome] = useState(false);
  const [novoNome, setNovoNome] = useState("");

  useEffect(() => {
    carregarPerfil();
  }, []);

  async function carregarPerfil() {
    const dados = await AsyncStorage.getItem("perfil");

    if (dados) {
      setPerfil(JSON.parse(dados));
    }
  }

  async function salvarPerfil(novoPerfil) {
    setPerfil(novoPerfil);
    await AsyncStorage.setItem(
      "perfil",
      JSON.stringify(novoPerfil)
    );
  }

  async function trocarFoto() {
    const permissao =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissao.granted) {
      Alert.alert(
        "Permissão necessária",
        "Precisamos acessar sua galeria."
      );
      return;
    }

    const resultado =
      await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

    if (!resultado.canceled) {
      const uri = resultado.assets[0].uri;

      const atualizado = {
        ...perfil,
        foto: uri,
      };

      salvarPerfil(atualizado);
    }
  }

  async function alterarNome() {
    if (!novoNome.trim()) return;

    const atualizado = {
      ...perfil,
      nome: novoNome.trim(),
    };

    await salvarPerfil(atualizado);

    setModalNome(false);
    setNovoNome("");
  }

  function abrirModalNome() {
    setNovoNome(perfil?.nome || "");
    setModalNome(true);
  }

  function limparHistorico() {
    Alert.alert(
      "Limpar histórico",
      "Deseja apagar todo o histórico de conversões?",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Limpar",
          style: "destructive",
          onPress: async () => {
            const atualizado = {
              ...perfil,
              totalConversoes: 0,
              ultimaConversao: null,
            };

            await salvarPerfil(atualizado);
          },
        },
      ]
    );
  }

  function logout() {
    Alert.alert(
      "Sair",
      "Deseja encerrar sua sessão?",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Sair",
          style: "destructive",
          onPress: async () => {
            await AsyncStorage.removeItem("perfil");
            router.replace("/verificacao/login");
          },
        },
      ]
    );
  }

  if (!perfil) {
    return (
      <View style={styles.center}>
        <Text>Carregando perfil...</Text>
      </View>
    );
  }

  return (
    <>
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* HERO */}

        <View style={styles.hero}>
          <TouchableOpacity onPress={trocarFoto}>
            {perfil.foto ? (
              <Image
                source={{ uri: perfil.foto }}
                style={styles.avatar}
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarLetra}>
                  {perfil.nome?.[0]?.toUpperCase()}
                </Text>
              </View>
            )}
          </TouchableOpacity>

          <Text style={styles.nome}>
            {perfil.nome}
          </Text>

          <Text style={styles.subtitulo}>
            Seu conversor global de moedas
          </Text>
        </View>

        {/* ESTATÍSTICAS */}

        <Text style={styles.secaoTitulo}>
          Estatísticas
        </Text>

        <View style={styles.grid}>
          <View style={styles.card}>
            <Text style={styles.cardNumero}>
              {perfil.totalConversoes || 0}
            </Text>

            <Text style={styles.cardLabel}>
              Conversões
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardNumero}>
              {perfil.moedaPadrao || "BRL"}
            </Text>

            <Text style={styles.cardLabel}>
              Moeda padrão
            </Text>
          </View>
        </View>

        {/* ÚLTIMA CONVERSÃO */}

        {perfil.ultimaConversao && (
          <>
            <Text style={styles.secaoTitulo}>
              Última conversão
            </Text>

            <View style={styles.cardGrande}>
              <Text style={styles.ultima}>
                {perfil.ultimaConversao.valor}
                {" "}
                {perfil.ultimaConversao.origem}
              </Text>

              <Text style={styles.seta}>
                ↓
              </Text>

              <Text style={styles.ultimaResultado}>
                {perfil.ultimaConversao.resultado}
                {" "}
                {perfil.ultimaConversao.destino}
              </Text>
            </View>
          </>
        )}

        {/* CONFIGURAÇÕES */}

        <Text style={styles.secaoTitulo}>
          Preferências
        </Text>

        <View style={styles.lista}>
          <TouchableOpacity
            style={styles.item}
            onPress={abrirModalNome}
          >
            <Text style={styles.itemTexto}>
              👤 Alterar nome
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.item}
            onPress={trocarFoto}
          >
            <Text style={styles.itemTexto}>
              📷 Trocar foto
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.item}
            onPress={limparHistorico}
          >
            <Text style={styles.itemTexto}>
              🗑 Limpar histórico
            </Text>
          </TouchableOpacity>
        </View>

        {/* LOGOUT */}

        <TouchableOpacity
          style={styles.logout}
          onPress={logout}
        >
          <Text style={styles.logoutTexto}>
            Sair
          </Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* MODAL */}

      <Modal
        transparent
        animationType="slide"
        visible={modalNome}
      >
        <View style={styles.modalFundo}>
          <View style={styles.modal}>
            <Text style={styles.modalTitulo}>
              Alterar nome
            </Text>

            <TextInput
              style={styles.input}
              value={novoNome}
              onChangeText={setNovoNome}
              placeholder="Seu nome"
            />

            <TouchableOpacity
              style={styles.salvar}
              onPress={alterarNome}
            >
              <Text style={styles.salvarTexto}>
                Salvar
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const VERDE = "#22C55E";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FFFA",
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  hero: {
    backgroundColor: VERDE,
    alignItems: "center",
    paddingTop: 70,
    paddingBottom: 40,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },

  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 4,
    borderColor: "#fff",
  },

  avatarPlaceholder: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "#16A34A",
    justifyContent: "center",
    alignItems: "center",
  },

  avatarLetra: {
    color: "#fff",
    fontSize: 42,
    fontWeight: "bold",
  },

  nome: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "700",
    marginTop: 16,
  },

  subtitulo: {
    color: "#DCFCE7",
    marginTop: 4,
  },

  secaoTitulo: {
    fontSize: 18,
    fontWeight: "700",
    marginHorizontal: 20,
    marginTop: 24,
    marginBottom: 12,
    color: "#1F2937",
  },

  grid: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 20,
  },

  card: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 18,
    alignItems: "center",
  },

  cardNumero: {
    fontSize: 28,
    fontWeight: "700",
    color: VERDE,
  },

  cardLabel: {
    color: "#6B7280",
    marginTop: 4,
  },

  cardGrande: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    padding: 24,
    borderRadius: 18,
    alignItems: "center",
  },

  ultima: {
    fontSize: 18,
    fontWeight: "600",
  },

  seta: {
    fontSize: 24,
    marginVertical: 10,
  },

  ultimaResultado: {
    fontSize: 20,
    fontWeight: "700",
    color: VERDE,
  },

  lista: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    borderRadius: 18,
  },

  item: {
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },

  itemTexto: {
    fontSize: 16,
    color: "#374151",
  },

  logout: {
    marginTop: 24,
    marginHorizontal: 20,
    backgroundColor: "#FEE2E2",
    padding: 18,
    borderRadius: 18,
    alignItems: "center",
  },

  logoutTexto: {
    color: "#DC2626",
    fontWeight: "700",
  },

  modalFundo: {
    flex: 1,
    backgroundColor: "#00000055",
    justifyContent: "flex-end",
  },

  modal: {
    backgroundColor: "#fff",
    padding: 24,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },

  modalTitulo: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 16,
  },

  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 14,
    padding: 14,
  },

  salvar: {
    backgroundColor: VERDE,
    padding: 16,
    borderRadius: 14,
    marginTop: 16,
    alignItems: "center",
  },

  salvarTexto: {
    color: "#fff",
    fontWeight: "700",
  },
});