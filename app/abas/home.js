import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

export default function Home() {
  const router = useRouter();

  const [usuario, setUsuario] = useState(null);
  const [transacoes, setTransacoes] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  async function carregarDados() {
    try {
      const usuarioSalvo = await AsyncStorage.getItem('usuario');
      const transacoesSalvas = await AsyncStorage.getItem('transacoes');

      if (usuarioSalvo) {
        setUsuario(JSON.parse(usuarioSalvo));
      }

      if (transacoesSalvas) {
        setTransacoes(JSON.parse(transacoesSalvas));
      }
    } catch (erro) {
      console.log(erro);
    }
  }

  useEffect(() => {
    carregarDados();
  }, []);

  const atualizar = async () => {
    setRefreshing(true);
    await carregarDados();
    setRefreshing(false);
  };

  const logout = async () => {
    await AsyncStorage.removeItem('usuario');
    router.replace('/verificacao/login');
  };

  const receitas = transacoes
    .filter(t => t.tipo === 'receita')
    .reduce((a, b) => a + Number(b.valor), 0);

  const despesas = transacoes
    .filter(t => t.tipo === 'despesa')
    .reduce((a, b) => a + Number(b.valor), 0);

  const saldo = receitas - despesas;

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={atualizar}
        />
      }
    >
      {/* CABEÇALHO */}

      <View style={styles.header}>
        <View>
          <Text style={styles.bemvindo}>
            Olá, {usuario?.nome || 'Visitante'} 👋
          </Text>

          <Text style={styles.subtitulo}>
            Bem-vindo ao Coinverter
          </Text>
        </View>

        <TouchableOpacity onPress={logout}>
          <Text style={styles.sair}>Sair</Text>
        </TouchableOpacity>
      </View>

      {/* SALDO */}

      <View style={styles.cardSaldo}>
        <Text style={styles.labelSaldo}>
          Saldo Atual
        </Text>

        <Text style={styles.valorSaldo}>
          R$ {saldo.toFixed(2)}
        </Text>
      </View>

      {/* RESUMO */}

      <View style={styles.linha}>
        <View style={styles.cardReceita}>
          <Text style={styles.labelResumo}>
            Receitas
          </Text>

          <Text style={styles.valorReceita}>
            R$ {receitas.toFixed(2)}
          </Text>
        </View>

        <View style={styles.cardDespesa}>
          <Text style={styles.labelResumo}>
            Despesas
          </Text>

          <Text style={styles.valorDespesa}>
            R$ {despesas.toFixed(2)}
          </Text>
        </View>
      </View>

      {/* ACESSOS RÁPIDOS */}

      <Text style={styles.titulo}>
        Ações rápidas
      </Text>

      <View style={styles.grid}>
        <TouchableOpacity style={styles.atalho}>
          <Text style={styles.icone}>💰</Text>
          <Text style={styles.textoAtalho}>
            Nova Receita
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.atalho}>
          <Text style={styles.icone}>🧾</Text>
          <Text style={styles.textoAtalho}>
            Nova Despesa
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.atalho}>
          <Text style={styles.icone}>🎯</Text>
          <Text style={styles.textoAtalho}>
            Metas
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.atalho}>
          <Text style={styles.icone}>📊</Text>
          <Text style={styles.textoAtalho}>
            Relatórios
          </Text>
        </TouchableOpacity>
      </View>

      {/* ÚLTIMAS TRANSAÇÕES */}

      <Text style={styles.titulo}>
        Últimas transações
      </Text>

      <View style={styles.card}>
        {transacoes.length === 0 ? (
          <Text style={styles.vazio}>
            Nenhuma transação registrada.
          </Text>
        ) : (
          transacoes
            .slice(-5)
            .reverse()
            .map((item) => (
              <View
                key={item.id}
                style={styles.transacao}
              >
                <View>
                  <Text style={styles.nomeTransacao}>
                    {item.descricao}
                  </Text>

                  <Text style={styles.data}>
                    {item.data}
                  </Text>
                </View>

                <Text
                  style={[
                    styles.valorTransacao,
                    item.tipo === 'receita'
                      ? styles.receita
                      : styles.despesa,
                  ]}
                >
                  {item.tipo === 'receita'
                    ? '+'
                    : '-'}
                  R$ {Number(item.valor).toFixed(2)}
                </Text>
              </View>
            ))
        )}
      </View>
    </ScrollView>
  );
}

const VERDE = "#22C55E";
const VERDE_ESCURO = "#16A34A";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FFFA",
  },

  hero: {
    height: 280,
    backgroundColor: VERDE,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },

  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#FFFFFF22",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },

  logo: {
    fontSize: 42,
  },

  titulo: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "800",
    letterSpacing: 0.5,
  },

  subtitulo: {
    color: "#DCFCE7",
    fontSize: 15,
    textAlign: "center",
    marginTop: 8,
    lineHeight: 22,
  },

  conteudo: {
    flex: 1,
    paddingHorizontal: 24,
    marginTop: -40,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    padding: 24,

    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 15,
    shadowOffset: {
      width: 0,
      height: 5,
    },

    elevation: 6,
  },

  secaoTitulo: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 18,
  },

  input: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",

    borderRadius: 16,

    paddingHorizontal: 18,
    paddingVertical: 16,

    fontSize: 16,
    color: "#111827",

    marginBottom: 16,
  },

  avatarContainer: {
    alignItems: "center",
    marginBottom: 24,
  },

  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
  },

  avatarPlaceholder: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: VERDE,

    justifyContent: "center",
    alignItems: "center",
  },

  avatarTexto: {
    color: "#fff",
    fontSize: 40,
    fontWeight: "800",
  },

  trocarFoto: {
    marginTop: 12,
  },

  trocarFotoTexto: {
    color: VERDE_ESCURO,
    fontWeight: "600",
  },

  botao: {
    backgroundColor: VERDE,
    paddingVertical: 18,
    borderRadius: 18,
    alignItems: "center",
    marginTop: 10,
  },

  botaoDesabilitado: {
    opacity: 0.5,
  },

  botaoTexto: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
  },

  rodape: {
    marginTop: 28,
    alignItems: "center",
  },

  rodapeTexto: {
    color: "#6B7280",
    fontSize: 13,
    textAlign: "center",
    lineHeight: 20,
  },

  destaque: {
    color: VERDE_ESCURO,
    fontWeight: "700",
  },

  erro: {
    color: "#DC2626",
    textAlign: "center",
    marginBottom: 12,
    fontWeight: "500",
  },

  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});