import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  RefreshControl,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { LineChart } from "react-native-chart-kit";
import { converter } from "../api"; // ← centralizado

const STORAGE_USUARIO   = "@coinvertix_usuario";
const STORAGE_FAVORITAS = "@coinvertix_moedas";

const PARES = [
  { origem: "USD", destino: "BRL" },
  { origem: "EUR", destino: "BRL" },
  { origem: "BTC", destino: "BRL" },
  { origem: "GBP", destino: "BRL" },
  { origem: "ARS", destino: "BRL" },
];

const largura = Dimensions.get("window").width;

const CORES = {
  fundo:      "#F7F1E3",
  papel:      "#FFFDF7",
  ouro:       "#E4C441",
  ouroEscuro: "#C8A62D",
  tinta:      "#1F1B16",
  tintaSuave: "#6B6255",
  borda:      "#D8CFBE",
  verde:      "#16A34A",
  vermelho:   "#DC2626",
};

export default function Info() {
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [usuario, setUsuario]       = useState(null);
  const [cotacoes, setCotacoes]     = useState([]);  // array normalizado
  const [favoritas, setFavoritas]   = useState([]);

  async function carregarTudo() {
    try {
      const usuarioStr = await AsyncStorage.getItem(STORAGE_USUARIO);
      const favStr     = await AsyncStorage.getItem(STORAGE_FAVORITAS);

      if (usuarioStr) setUsuario(JSON.parse(usuarioStr));
      setFavoritas(favStr ? JSON.parse(favStr) : ["USD", "EUR", "BTC"]);

      // Busca todos os pares em paralelo via api.js (já normalizado)
      const resultados = await Promise.all(
        PARES.map(({ origem, destino }) =>
          converter(origem, destino).catch(() => null)
        )
      );

      const lista = resultados
        .map((res, i) => {
          if (!res) return null;
          const chave = `${PARES[i].origem}${PARES[i].destino}`;
          return res[chave] ? { ...res[chave], par: PARES[i] } : null;
        })
        .filter(Boolean);

      setCotacoes(lista);
    } catch (e) {
      console.log("Info.carregarTudo:", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    carregarTudo();
  }, []);

  // Dados do gráfico — já são Number() graças ao api.js
  const graficoBids   = cotacoes.length >= 2 ? cotacoes.map((m) => m.bid) : [0, 1];
  const graficoLabels = cotacoes.length >= 2 ? cotacoes.map((m) => m.par.origem) : ["", ""];

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={CORES.ouro} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => { setRefreshing(true); carregarTudo(); }}
          tintColor={CORES.ouro}
        />
      }
    >
      {/* HERO */}
      <View style={styles.hero}>
        <View style={styles.simbolo}>
          <Text style={styles.simboloIcone}>☆</Text>
        </View>
        <Text style={styles.heroTitulo}>COINVERTIX</Text>
        <Text style={styles.heroSub}>Mercado de Câmbio</Text>
        {usuario?.nome ? (
          <Text style={styles.heroUsuario}>Olá, {usuario.nome}</Text>
        ) : null}
      </View>

      {/* ESTATÍSTICAS DO PERFIL */}
      <View style={styles.grid}>
        <View style={styles.cardMini}>
          <Text style={styles.cardIcone}>🔄</Text>
          <Text style={styles.cardNumero}>{usuario?.totalConversoes || 0}</Text>
          <Text style={styles.cardLabel}>Conversões</Text>
        </View>

        <View style={styles.cardMini}>
          <Text style={styles.cardIcone}>💱</Text>
          <Text style={styles.cardNumero}>{favoritas.length}</Text>
          <Text style={styles.cardLabel}>Favoritas</Text>
        </View>

        <View style={styles.cardMini}>
          <Text style={styles.cardIcone}>📅</Text>
          <Text style={[styles.cardNumero, { fontSize: 13 }]}>
            {usuario?.dataCriacao
              ? new Date(usuario.dataCriacao).toLocaleDateString("pt-BR")
              : "—"}
          </Text>
          <Text style={styles.cardLabel}>Membro desde</Text>
        </View>

        <View style={styles.cardMini}>
          <Text style={styles.cardIcone}>🌍</Text>
          <Text style={styles.cardNumero}>{cotacoes.length}</Text>
          <Text style={styles.cardLabel}>Pares ao vivo</Text>
        </View>
      </View>

      {/* GRÁFICO */}
      <Text style={styles.secaoTitulo}>✦ Cotações ao Vivo</Text>

      <View style={styles.chartCard}>
        <LineChart
          data={{
            labels: graficoLabels,
            datasets: [{ data: graficoBids }],
          }}
          width={largura - 40}
          height={200}
          bezier
          chartConfig={{
            backgroundGradientFrom: CORES.papel,
            backgroundGradientTo:   CORES.papel,
            decimalPlaces:          2,
            color:      (opacity) => `rgba(200, 166, 45, ${opacity})`,
            labelColor: (opacity) => `rgba(107, 98, 85, ${opacity})`,
            propsForDots: {
              r: "5",
              strokeWidth: "2",
              stroke: CORES.ouroEscuro,
            },
          }}
          style={{ borderRadius: 20 }}
        />
      </View>

      {/* MERCADO */}
      <Text style={styles.secaoTitulo}>✦ Mercado de Câmbio</Text>

      <View style={styles.marketCard}>
        {cotacoes.map((moeda, index) => (
          <View
            key={`${moeda.code}-${index}`}  // ← key única, sem duplicatas
            style={[
              styles.moedaLinha,
              index === cotacoes.length - 1 && { borderBottomWidth: 0 },
            ]}
          >
            <View>
              <Text style={styles.moedaNome}>{moeda.par.origem}</Text>
              <Text style={styles.moedaValor}>
                R$ {moeda.bid.toFixed(2)}
              </Text>
            </View>

            <View style={styles.variacaoContainer}>
              <Text
                style={[
                  styles.variacao,
                  { color: moeda.pctChange >= 0 ? CORES.verde : CORES.vermelho },
                ]}
              >
                {moeda.pctChange >= 0 ? "▲" : "▼"}{" "}
                {Math.abs(moeda.pctChange).toFixed(2)}%
              </Text>
              <Text style={styles.moedaAsk}>
                Venda: R$ {moeda.ask.toFixed(2)}
              </Text>
            </View>
          </View>
        ))}
      </View>

      {/* MOEDAS FAVORITAS */}
      <Text style={styles.secaoTitulo}>✦ Suas Moedas</Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginBottom: 24 }}
      >
        {favoritas.map((codigo) => {
          const moeda = cotacoes.find((m) => m.par.origem === codigo);
          if (!moeda) return null;
          return (
            <View key={codigo} style={styles.favCard}>
              <Text style={styles.favCodigo}>{codigo}</Text>
              <Text style={styles.favValor}>R$ {moeda.bid.toFixed(2)}</Text>
              <Text
                style={[
                  styles.favVariacao,
                  { color: moeda.pctChange >= 0 ? CORES.verde : CORES.vermelho },
                ]}
              >
                {moeda.pctChange >= 0 ? "+" : ""}
                {moeda.pctChange.toFixed(2)}%
              </Text>
            </View>
          );
        })}
      </ScrollView>

      {/* ÚLTIMA CONVERSÃO */}
      {usuario?.ultimaConversao && (
        <>
          <Text style={styles.secaoTitulo}>✦ Última Conversão</Text>
          <View style={styles.ultimaCard}>
            <Text style={styles.ultimaDe}>
              {usuario.ultimaConversao.valor} {usuario.ultimaConversao.origem}
            </Text>
            <Text style={styles.ultimaSeta}>↓</Text>
            <Text style={styles.ultimaPara}>
              {Number(usuario.ultimaConversao.resultado).toLocaleString("pt-BR", {
                minimumFractionDigits: 2,
              })}{" "}
              {usuario.ultimaConversao.destino}
            </Text>
          </View>
        </>
      )}

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
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: CORES.fundo },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: CORES.fundo,
  },

  hero: {
    backgroundColor: CORES.tinta,
    paddingTop: 70,
    paddingBottom: 36,
    alignItems: "center",
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    marginBottom: 24,
  },
  simbolo: {
    width: 64, height: 64,
    borderRadius: 32,
    backgroundColor: CORES.ouro,
    borderWidth: 2.5,
    borderColor: CORES.ouroEscuro,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },
  simboloIcone:  { fontSize: 30, color: CORES.tinta },
  heroTitulo:    { color: CORES.ouro, fontSize: 26, fontWeight: "700", letterSpacing: 5 },
  heroSub:       { color: CORES.borda, fontSize: 13, fontStyle: "italic", marginTop: 4 },
  heroUsuario:   { color: "#FFFFFF88", fontSize: 12, marginTop: 6 },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 24,
  },
  cardMini: {
    width: (largura - 52) / 2,
    backgroundColor: CORES.papel,
    borderWidth: 1,
    borderColor: CORES.borda,
    borderRadius: 20,
    padding: 16,
  },
  cardIcone:  { fontSize: 22 },
  cardNumero: { fontSize: 24, fontWeight: "800", color: CORES.tinta, marginTop: 8 },
  cardLabel:  { color: CORES.tintaSuave, fontSize: 12, marginTop: 4 },

  secaoTitulo: {
    fontSize: 14,
    fontWeight: "700",
    color: CORES.tintaSuave,
    letterSpacing: 2,
    marginHorizontal: 20,
    marginBottom: 14,
  },

  chartCard: {
    alignItems: "center",
    marginBottom: 28,
    marginHorizontal: 20,
    backgroundColor: CORES.papel,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: CORES.borda,
    paddingVertical: 16,
    overflow: "hidden",
  },

  marketCard: {
    backgroundColor: CORES.papel,
    marginHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: CORES.borda,
    padding: 16,
    marginBottom: 28,
  },
  moedaLinha: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: CORES.borda,
  },
  moedaNome:  { fontWeight: "800", fontSize: 16, color: CORES.tinta, letterSpacing: 1 },
  moedaValor: { color: CORES.tintaSuave, fontSize: 13, marginTop: 2 },
  variacaoContainer: { alignItems: "flex-end" },
  variacao:   { fontWeight: "700", fontSize: 14 },
  moedaAsk:   { fontSize: 11, color: CORES.tintaSuave, marginTop: 2 },

  favCard: {
    backgroundColor: CORES.papel,
    marginLeft: 20,
    padding: 18,
    borderRadius: 20,
    minWidth: 110,
    borderWidth: 1,
    borderColor: CORES.borda,
    alignItems: "center",
  },
  favCodigo:   { fontSize: 16, fontWeight: "800", color: CORES.tinta, letterSpacing: 1 },
  favValor:    { fontSize: 14, fontWeight: "600", color: CORES.ouroEscuro, marginTop: 6 },
  favVariacao: { fontSize: 12, fontWeight: "700", marginTop: 4 },

  ultimaCard: {
    backgroundColor: CORES.papel,
    marginHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: CORES.ouro,
    padding: 22,
    alignItems: "center",
    marginBottom: 28,
  },
  ultimaDe:   { fontSize: 16, fontWeight: "600", color: CORES.tintaSuave },
  ultimaSeta: { fontSize: 22, color: CORES.ouroEscuro, marginVertical: 6 },
  ultimaPara: { fontSize: 26, fontWeight: "800", color: CORES.tinta },

  rodape: { alignItems: "center", gap: 16, marginHorizontal: 20 },
  divisor: { width: "70%", height: 1.5, backgroundColor: CORES.ouro, opacity: 0.5 },
  rodapeTexto: {
    textAlign: "center",
    color: CORES.tintaSuave,
    lineHeight: 22,
    fontStyle: "italic",
    fontSize: 13,
  },
  destaque: { color: CORES.ouroEscuro, fontWeight: "700" },
});