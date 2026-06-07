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

const STORAGE_USUARIO = "@coinvertix_usuario";

const CORES = {
  fundo:      "#F7F1E3",
  papel:      "#FFFDF7",
  ouro:       "#E4C441",
  ouroEscuro: "#C8A62D",
  tinta:      "#1F1B16",
  tintaSuave: "#6B6255",
  borda:      "#D8CFBE",
  erro:       "#DC2626",
  erroFundo:  "#FEE2E2",
};

export default function Perfil() {
  const router = useRouter();

  const [perfil, setPerfil]       = useState(null);
  const [modalNome, setModalNome] = useState(false);
  const [novoNome, setNovoNome]   = useState("");

  useEffect(() => {
    carregarPerfil();
  }, []);

  async function carregarPerfil() {
    const dados = await AsyncStorage.getItem(STORAGE_USUARIO);
    if (dados) setPerfil(JSON.parse(dados));
  }

  async function salvarPerfil(novoPerfil) {
    setPerfil(novoPerfil);
    await AsyncStorage.setItem(STORAGE_USUARIO, JSON.stringify(novoPerfil));
  }

  async function trocarFoto() {
    const permissao = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissao.granted) {
      Alert.alert("Permissão necessária", "Precisamos acessar sua galeria.");
      return;
    }

    const resultado = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!resultado.canceled) {
      salvarPerfil({ ...perfil, foto: resultado.assets[0].uri });
    }
  }

  async function alterarNome() {
    if (!novoNome.trim()) return;
    await salvarPerfil({ ...perfil, nome: novoNome.trim() });
    setModalNome(false);
    setNovoNome("");
  }

  function limparHistorico() {
    Alert.alert(
      "Limpar histórico",
      "Deseja apagar todo o histórico de conversões?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Limpar",
          style: "destructive",
          onPress: async () => {
            await salvarPerfil({
              ...perfil,
              totalConversoes: 0,
              ultimaConversao: null,
            });
          },
        },
      ]
    );
  }

  function logout() {
    Alert.alert("Sair", "Deseja encerrar sua sessão?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Sair",
        style: "destructive",
        onPress: async () => {
          await AsyncStorage.removeItem(STORAGE_USUARIO); // ← mesma chave do login
          router.replace("/verificacao/login");
        },
      },
    ]);
  }

  if (!perfil) {
    return (
      <View style={styles.center}>
        <Text style={styles.carregando}>Carregando perfil...</Text>
      </View>
    );
  }

  const inicial = perfil.nome?.[0]?.toUpperCase();

  return (
    <>
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* HERO */}
        <View style={styles.hero}>
          <View style={styles.nuvem1} />
          <View style={styles.nuvem2} />

          <TouchableOpacity onPress={trocarFoto} style={styles.avatarWrap}>
            {perfil.foto ? (
              <Image source={{ uri: perfil.foto }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarLetra}>{inicial}</Text>
              </View>
            )}
            <View style={styles.avatarBadge}>
              <Text style={styles.avatarBadgeIcone}>📷</Text>
            </View>
          </TouchableOpacity>

          <Text style={styles.nome}>{perfil.nome}</Text>
          <Text style={styles.subtitulo}>Seu conversor global de moedas</Text>

          <View style={styles.appTagContainer}>
            <Text style={styles.appTag}>✦ COINVERTIX ✦</Text>
          </View>
        </View>

        {/* ESTATÍSTICAS */}
        <Text style={styles.secaoTitulo}>✦ Estatísticas</Text>

        <View style={styles.grid}>
          <View style={styles.card}>
            <Text style={styles.cardIcone}>🔄</Text>
            <Text style={styles.cardNumero}>{perfil.totalConversoes || 0}</Text>
            <Text style={styles.cardLabel}>Conversões</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardIcone}>📅</Text>
            <Text style={[styles.cardNumero, { fontSize: 14 }]}>
              {perfil.dataCriacao
                ? new Date(perfil.dataCriacao).toLocaleDateString("pt-BR")
                : "—"}
            </Text>
            <Text style={styles.cardLabel}>Membro desde</Text>
          </View>
        </View>

        {/* ÚLTIMA CONVERSÃO */}
        {perfil.ultimaConversao && (
          <>
            <Text style={styles.secaoTitulo}>✦ Última Conversão</Text>
            <View style={styles.ultimaCard}>
              <Text style={styles.ultimaDe}>
                {perfil.ultimaConversao.valor} {perfil.ultimaConversao.origem}
              </Text>
              <Text style={styles.ultimaSeta}>↓</Text>
              <Text style={styles.ultimaPara}>
                {Number(perfil.ultimaConversao.resultado).toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                })}{" "}
                {perfil.ultimaConversao.destino}
              </Text>
            </View>
          </>
        )}

        {/* PREFERÊNCIAS */}
        <Text style={styles.secaoTitulo}>✦ Preferências</Text>

        <View style={styles.lista}>
          <TouchableOpacity style={styles.item} onPress={() => { setNovoNome(perfil?.nome || ""); setModalNome(true); }}>
            <Text style={styles.itemIcone}>👤</Text>
            <Text style={styles.itemTexto}>Alterar nome</Text>
            <Text style={styles.itemSeta}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.item} onPress={trocarFoto}>
            <Text style={styles.itemIcone}>📷</Text>
            <Text style={styles.itemTexto}>Trocar foto</Text>
            <Text style={styles.itemSeta}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.item, { borderBottomWidth: 0 }]} onPress={limparHistorico}>
            <Text style={styles.itemIcone}>🗑</Text>
            <Text style={styles.itemTexto}>Limpar histórico</Text>
            <Text style={styles.itemSeta}>›</Text>
          </TouchableOpacity>
        </View>

        {/* LOGOUT */}
        <TouchableOpacity style={styles.logout} onPress={logout}>
          <Text style={styles.logoutTexto}>Sair</Text>
        </TouchableOpacity>

        {/* RODAPÉ */}
        <View style={styles.rodape}>
          <View style={styles.divisor} />
          <Text style={styles.rodapeTexto}>
            Assim como o{" "}
            <Text style={styles.destaque}>Ás de Ouros</Text>
            {" "}revela riquezas ocultas,{"\n"}cada conversão abre novos caminhos.
          </Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* MODAL ALTERAR NOME */}
      <Modal transparent animationType="slide" visible={modalNome}>
        <View style={styles.modalFundo}>
          <View style={styles.modal}>
            <Text style={styles.modalTitulo}>Alterar nome</Text>

            <Text style={styles.inputLabel}>Nome do consulente</Text>
            <TextInput
              style={styles.input}
              value={novoNome}
              onChangeText={setNovoNome}
              placeholder="Seu nome"
              placeholderTextColor={CORES.tintaSuave}
              autoFocus
            />

            <TouchableOpacity style={styles.salvar} onPress={alterarNome}>
              <Text style={styles.salvarTexto}>SALVAR</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelar}
              onPress={() => setModalNome(false)}
            >
              <Text style={styles.cancelarTexto}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CORES.fundo,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: CORES.fundo,
  },

  carregando: {
    color: CORES.tintaSuave,
    fontStyle: "italic",
  },

  // Hero
  hero: {
    backgroundColor: CORES.tinta,
    alignItems: "center",
    paddingTop: 70,
    paddingBottom: 40,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    marginBottom: 28,
    overflow: "hidden",
  },
  nuvem1: {
    position: "absolute", top: 30, left: -40,
    width: 130, height: 70, borderRadius: 50,
    backgroundColor: "#FFFFFF08",
  },
  nuvem2: {
    position: "absolute", top: 90, right: -50,
    width: 150, height: 80, borderRadius: 50,
    backgroundColor: "#FFFFFF06",
  },

  avatarWrap: { position: "relative", marginBottom: 16 },
  avatar: {
    width: 110, height: 110,
    borderRadius: 55,
    borderWidth: 3,
    borderColor: CORES.ouro,
  },
  avatarPlaceholder: {
    width: 110, height: 110,
    borderRadius: 55,
    backgroundColor: CORES.ouroEscuro,
    borderWidth: 3,
    borderColor: CORES.ouro,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarLetra: {
    color: CORES.tinta,
    fontSize: 42,
    fontWeight: "800",
  },
  avatarBadge: {
    position: "absolute",
    bottom: 2, right: 2,
    width: 30, height: 30,
    borderRadius: 15,
    backgroundColor: CORES.ouro,
    borderWidth: 2,
    borderColor: CORES.tinta,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarBadgeIcone: { fontSize: 13 },

  nome: {
    color: CORES.ouro,
    fontSize: 26,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  subtitulo: {
    color: "#FFFFFF66",
    marginTop: 4,
    fontSize: 13,
    fontStyle: "italic",
  },
  appTagContainer: { marginTop: 14 },
  appTag: {
    color: CORES.ouroEscuro,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 3,
  },

  // Seção
  secaoTitulo: {
    fontSize: 14,
    fontWeight: "700",
    color: CORES.tintaSuave,
    letterSpacing: 2,
    marginHorizontal: 20,
    marginBottom: 14,
  },

  // Grid stats
  grid: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 20,
    marginBottom: 28,
  },
  card: {
    flex: 1,
    backgroundColor: CORES.papel,
    borderWidth: 1,
    borderColor: CORES.borda,
    borderRadius: 20,
    padding: 18,
    alignItems: "center",
  },
  cardIcone: { fontSize: 22, marginBottom: 8 },
  cardNumero: {
    fontSize: 26,
    fontWeight: "800",
    color: CORES.tinta,
  },
  cardLabel: {
    color: CORES.tintaSuave,
    fontSize: 12,
    marginTop: 4,
  },

  // Última conversão
  ultimaCard: {
    backgroundColor: CORES.papel,
    marginHorizontal: 20,
    marginBottom: 28,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: CORES.ouro,
    padding: 22,
    alignItems: "center",
  },
  ultimaDe: {
    fontSize: 16,
    fontWeight: "600",
    color: CORES.tintaSuave,
  },
  ultimaSeta: {
    fontSize: 22,
    color: CORES.ouroEscuro,
    marginVertical: 6,
  },
  ultimaPara: {
    fontSize: 26,
    fontWeight: "800",
    color: CORES.tinta,
  },

  // Lista de preferências
  lista: {
    backgroundColor: CORES.papel,
    marginHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: CORES.borda,
    marginBottom: 16,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: CORES.borda,
    gap: 12,
  },
  itemIcone: { fontSize: 18, width: 28 },
  itemTexto: {
    flex: 1,
    fontSize: 16,
    color: CORES.tinta,
    fontWeight: "500",
  },
  itemSeta: {
    fontSize: 20,
    color: CORES.tintaSuave,
    fontWeight: "300",
  },

  // Logout
  logout: {
    marginHorizontal: 20,
    marginBottom: 28,
    backgroundColor: CORES.erroFundo,
    borderWidth: 1,
    borderColor: "#FECACA",
    padding: 18,
    borderRadius: 18,
    alignItems: "center",
  },
  logoutTexto: {
    color: CORES.erro,
    fontWeight: "700",
    letterSpacing: 1,
  },

  // Rodapé
  rodape: {
    alignItems: "center",
    gap: 16,
    marginHorizontal: 20,
  },
  divisor: {
    width: "70%",
    height: 1.5,
    backgroundColor: CORES.ouro,
    opacity: 0.5,
  },
  rodapeTexto: {
    textAlign: "center",
    color: CORES.tintaSuave,
    lineHeight: 22,
    fontStyle: "italic",
    fontSize: 13,
  },
  destaque: {
    color: CORES.ouroEscuro,
    fontWeight: "700",
  },

  // Modal
  modalFundo: {
    flex: 1,
    backgroundColor: "#00000066",
    justifyContent: "flex-end",
  },
  modal: {
    backgroundColor: CORES.papel,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 28,
    borderTopWidth: 2,
    borderColor: CORES.ouro,
  },
  modalTitulo: {
    fontSize: 20,
    fontWeight: "700",
    color: CORES.tinta,
    letterSpacing: 0.5,
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 13,
    color: CORES.tintaSuave,
    fontWeight: "600",
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: "#FFFEFB",
    borderWidth: 1.5,
    borderColor: CORES.borda,
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 16,
    fontSize: 16,
    color: CORES.tinta,
  },
  salvar: {
    backgroundColor: CORES.ouro,
    borderWidth: 2,
    borderColor: CORES.tinta,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 16,
  },
  salvarTexto: {
    color: CORES.tinta,
    fontWeight: "700",
    letterSpacing: 2,
    fontSize: 15,
  },
  cancelar: {
    paddingVertical: 14,
    alignItems: "center",
  },
  cancelarTexto: {
    color: CORES.tintaSuave,
    fontSize: 14,
  },
});