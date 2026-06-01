import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  RefreshControl,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import LineChart from "react-native-chart-kit/dist/line-chart/LineChart";

const STORAGE_TRANSACOES = "@remanexo_transacoes";
const STORAGE_METAS = "@remanexo_metas";
const STORAGE_FAVORITAS = "@remanexo_moedas";

const API =
  "https://economia.awesomeapi.com.br/json/last/USD-BRL,EUR-BRL,BTC-BRL,GBP-BRL,ARS-BRL";

const largura = Dimensions.get("window").width;

export default function Info() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [transacoes, setTransacoes] = useState([]);
  const [metas, setMetas] = useState([]);

  const [cotacoes, setCotacoes] = useState({});
  const [favoritas, setFavoritas] = useState([]);

  async function carregarTudo() {
    try {
      const tx =
        await AsyncStorage.getItem(
          STORAGE_TRANSACOES
        );

      const metasStorage =
        await AsyncStorage.getItem(
          STORAGE_METAS
        );

      const fav =
        await AsyncStorage.getItem(
          STORAGE_FAVORITAS
        );

      setTransacoes(
        tx ? JSON.parse(tx) : []
      );

      setMetas(
        metasStorage
          ? JSON.parse(metasStorage)
          : []
      );

      setFavoritas(
        fav ? JSON.parse(fav) : ["USD"]
      );

      const resposta = await fetch(API);

      const dados =
        await resposta.json();

      setCotacoes(dados);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    carregarTudo();
  }, []);

  const receitas = transacoes
    .filter((t) => t.tipo === "receita")
    .reduce(
      (acc, item) =>
        acc + Number(item.valor),
      0
    );

  const despesas = transacoes
    .filter((t) => t.tipo === "despesa")
    .reduce(
      (acc, item) =>
        acc + Number(item.valor),
      0
    );

  const saldo =
    receitas - despesas;

  const ultimas = [...transacoes]
    .sort((a, b) => b.id - a.id)
    .slice(0, 5);

  const graficoDados =
    transacoes.length > 0
      ? transacoes
          .slice(-7)
          .map((t) =>
            Number(t.valor)
          )
      : [0];

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator
          size="large"
          color="#4CAF50"
        />
      </View>
    );
  }

  return (
    <ScrollView
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            carregarTudo();
          }}
        />
      }
      style={styles.container}
    >
      {/* HERO */}

      <View style={styles.hero}>
        <Text style={styles.heroLabel}>
          Saldo Atual
        </Text>

        <Text style={styles.heroSaldo}>
          R$ {saldo.toFixed(2)}
        </Text>

        <Text style={styles.heroSub}>
          Controle financeiro inteligente
        </Text>
      </View>

      {/* RESUMO */}

      <View style={styles.grid}>
        <View style={styles.cardMini}>
          <Text style={styles.cardIcon}>
            📈
          </Text>

          <Text style={styles.valorVerde}>
            R$ {receitas.toFixed(2)}
          </Text>

          <Text style={styles.label}>
            Receitas
          </Text>
        </View>

        <View style={styles.cardMini}>
          <Text style={styles.cardIcon}>
            📉
          </Text>

          <Text style={styles.valorVermelho}>
            R$ {despesas.toFixed(2)}
          </Text>

          <Text style={styles.label}>
            Despesas
          </Text>
        </View>

        <View style={styles.cardMini}>
          <Text style={styles.cardIcon}>
            🎯
          </Text>

          <Text style={styles.valor}>
            {metas.length}
          </Text>

          <Text style={styles.label}>
            Metas
          </Text>
        </View>

        <View style={styles.cardMini}>
          <Text style={styles.cardIcon}>
            💰
          </Text>

          <Text style={styles.valor}>
            {transacoes.length}
          </Text>

          <Text style={styles.label}>
            Movimentos
          </Text>
        </View>
      </View>

      {/* GRÁFICO */}

      <Text style={styles.section}>
        Evolução Financeira
      </Text>

      <View style={styles.chartCard}>
        <LineChart
          data={{
            labels: graficoDados.map(
              (_, i) => `${i + 1}`
            ),
            datasets: [
              {
                data: graficoDados,
              },
            ],
          }}
          width={largura - 50}
          height={220}
          bezier
          chartConfig={{
            backgroundGradientFrom:
              "#ffffff",
            backgroundGradientTo:
              "#ffffff",
            decimalPlaces: 0,
            color: (opacity) =>
              `rgba(76,175,80,${opacity})`,
            labelColor: (opacity) =>
              `rgba(0,0,0,${opacity})`,
          }}
          style={{
            borderRadius: 20,
          }}
        />
      </View>

      {/* MERCADO */}

      <Text style={styles.section}>
        Mercado de Câmbio
      </Text>

      <View style={styles.marketCard}>
        {Object.values(cotacoes).map(
          (moeda) => (
            <View
              key={moeda.code}
              style={
                styles.moedaLinha
              }
            >
              <View>
                <Text
                  style={
                    styles.moedaNome
                  }
                >
                  {moeda.code}
                </Text>

                <Text
                  style={
                    styles.moedaValor
                  }
                >
                  R${" "}
                  {Number(
                    moeda.bid
                  ).toFixed(2)}
                </Text>
              </View>

              <Text
                style={{
                  color:
                    Number(
                      moeda.pctChange
                    ) >= 0
                      ? "#16A34A"
                      : "#DC2626",
                  fontWeight:
                    "700",
                }}
              >
                {Number(
                  moeda.pctChange
                ).toFixed(2)}
                %
              </Text>
            </View>
          )
        )}
      </View>

      {/* FAVORITAS */}

      <Text style={styles.section}>
        Suas Moedas
      </Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={
          false
        }
      >
        {favoritas.map((codigo) => {
          const moeda =
            cotacoes[
              `${codigo}BRL`
            ];

          if (!moeda) return null;

          return (
            <View
              key={codigo}
              style={
                styles.favoriteCard
              }
            >
              <Text
                style={
                  styles.favoriteCode
                }
              >
                {codigo}
              </Text>

              <Text
                style={
                  styles.favoriteValue
                }
              >
                R${" "}
                {Number(
                  moeda.bid
                ).toFixed(2)}
              </Text>
            </View>
          );
        })}
      </ScrollView>

      {/* METAS */}

      <Text style={styles.section}>
        Metas Financeiras
      </Text>

      {metas.map((meta) => (
        <View
          key={meta.id}
          style={styles.metaCard}
        >
          <Text style={styles.metaNome}>
            {meta.descricao}
          </Text>

          <Text style={styles.metaValor}>
            R$ {meta.valor_acumulado} /
            R$ {meta.valor_alvo}
          </Text>

          <View
            style={
              styles.progressBackground
            }
          >
            <View
              style={[
                styles.progressFill,
                {
                  width: `${Math.min(
                    meta.progresso,
                    100
                  )}%`,
                },
              ]}
            />
          </View>
        </View>
      ))}

      {/* HISTÓRICO */}

      <Text style={styles.section}>
        Últimas Movimentações
      </Text>

      {ultimas.map((item) => (
        <View
          key={item.id}
          style={styles.historyCard}
        >
          <Text>
            {item.descricao}
          </Text>

          <Text
            style={{
              color:
                item.tipo ===
                "receita"
                  ? "#16A34A"
                  : "#DC2626",
              fontWeight: "700",
            }}
          >
            R$ {item.valor}
          </Text>
        </View>
      ))}

      <View
        style={{ height: 40 }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4FFF8",
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  hero: {
    backgroundColor: "#57C785",
    paddingTop: 70,
    paddingBottom: 30,
    alignItems: "center",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },

  heroLabel: {
    color: "#EFFFF4",
  },

  heroSaldo: {
    color: "#fff",
    fontSize: 38,
    fontWeight: "bold",
    marginTop: 6,
  },

  heroSub: {
    color: "#DDF9E7",
    marginTop: 4,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 16,
    justifyContent:
      "space-between",
  },

  cardMini: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 18,
    marginBottom: 12,
  },

  cardIcon: {
    fontSize: 24,
  },

  valor: {
    fontSize: 22,
    fontWeight: "700",
    marginTop: 10,
  },

  valorVerde: {
    fontSize: 22,
    fontWeight: "700",
    color: "#16A34A",
    marginTop: 10,
  },

  valorVermelho: {
    fontSize: 22,
    fontWeight: "700",
    color: "#DC2626",
    marginTop: 10,
  },

  label: {
    color: "#777",
    marginTop: 4,
  },

  section: {
    fontSize: 20,
    fontWeight: "700",
    marginHorizontal: 16,
    marginBottom: 12,
    marginTop: 12,
  },

  chartCard: {
    alignItems: "center",
    marginBottom: 20,
  },

  marketCard: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    borderRadius: 20,
    padding: 16,
  },

  moedaLinha: {
    flexDirection: "row",
    justifyContent:
      "space-between",
    marginBottom: 16,
  },

  moedaNome: {
    fontWeight: "700",
  },

  moedaValor: {
    color: "#666",
  },

  favoriteCard: {
    backgroundColor: "#fff",
    marginLeft: 16,
    padding: 20,
    borderRadius: 20,
    minWidth: 120,
  },

  favoriteCode: {
    fontSize: 18,
    fontWeight: "700",
  },

  favoriteValue: {
    marginTop: 8,
    color: "#16A34A",
  },

  metaCard: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 20,
    padding: 16,
  },

  metaNome: {
    fontWeight: "700",
    fontSize: 16,
  },

  metaValor: {
    color: "#666",
    marginTop: 4,
  },

  progressBackground: {
    height: 10,
    backgroundColor: "#eee",
    borderRadius: 10,
    marginTop: 12,
  },

  progressFill: {
    height: 10,
    backgroundColor: "#57C785",
    borderRadius: 10,
  },

  historyCard: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 20,
    padding: 16,
    flexDirection: "row",
    justifyContent:
      "space-between",
  },
});