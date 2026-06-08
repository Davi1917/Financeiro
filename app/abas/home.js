import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { buscarMoedas, converter } from '../api';

const { width } = Dimensions.get('window');

const CORES = {
  fundo: '#F7F1E3',
  papel: '#FFFDF7',
  ouro: '#E4C441',
  ouroEscuro: '#C8A62D',
  ouroClaro: '#F0D96A',
  tinta: '#1F1B16',
  tintaSuave: '#6B6255',
  borda: '#D8CFBE',
  bordaOuro: '#C8A62D55',
  destaque: '#8B1A1A',
};

const PARES_RAPIDOS = [
  { origem: 'USD', destino: 'BRL', icone: '🇺🇸', label: 'Dólar' },
  { origem: 'EUR', destino: 'BRL', icone: '🇪🇺', label: 'Euro' },
  { origem: 'BTC', destino: 'BRL', icone: '₿', label: 'Bitcoin' },
  { origem: 'GBP', destino: 'BRL', icone: '🇬🇧', label: 'Libra' },
  { origem: 'ARS', destino: 'BRL', icone: '🇦🇷', label: 'Peso' },
  { origem: 'JPY', destino: 'BRL', icone: '🇯🇵', label: 'Iene' },
];

export default function Home() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  const [usuario, setUsuario] = useState(null);
  const [moedas, setMoedas] = useState({});

  // Conversor
  const [origem, setOrigem] = useState('USD');
  const [destino, setDestino] = useState('BRL');
  const [valor, setValor] = useState('');
  const [resultado, setResultado] = useState(null);
  const [convertendo, setConvertendo] = useState(false);
  const [erroConv, setErroConv] = useState('');

  // Cotações rápidas
  const [cotacoes, setCotacoes] = useState({});
  const [loadingCotacoes, setLoadingCotacoes] = useState(true);

  // Seletor de moeda
  const [selecionando, setSelecionando] = useState(null);
  const [busca, setBusca] = useState('');

  // Controle para evitar carregamento duplicado
  const carregouRef = useRef(false);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();

    if (!carregouRef.current) {
      carregouRef.current = true;
      carregarDados();
    }
  }, []);

  async function carregarDados() {
    try {
      const u = await AsyncStorage.getItem('@coinvertix_usuario');
      if (u) setUsuario(JSON.parse(u));

      const m = await buscarMoedas();
      setMoedas(m);

      // Carrega cotações com pequeno espaçamento para evitar 429
      const mapa = {};
      for (const par of PARES_RAPIDOS) {
        try {
          const res = await converter(par.origem, par.destino);
          if (res) {
            const chave = `${par.origem}${par.destino}`;
            const dados = res[chave];
            if (dados) mapa[par.origem] = Number(dados.bid);
          }
        } catch (err) {
          console.log(`Erro ao carregar ${par.origem}->${par.destino}:`, err.message);
        }
        // Pequena pausa entre requisições (ajuda a evitar 429)
        await new Promise(resolve => setTimeout(resolve, 300));
      }
      setCotacoes(mapa);
    } catch (e) {
      console.log(e);
    } finally {
  console.log('✅ FINALLY - setLoadingCotacoes(false)');
  setLoadingCotacoes(false);
}
  }

  async function executarConversao() {
    if (!valor.trim()) {
      setErroConv('Insira um valor.');
      return;
    }
    setErroConv('');
    setConvertendo(true);
    setResultado(null);
    try {
      const res = await converter(origem, destino);

      const chave = `${origem.toUpperCase()}${destino.toUpperCase()}`;
      const dados = res[chave];
      if (!dados) throw new Error('Par inválido');

      const taxa = dados.bid;
      // Converte valor com formato brasileiro (1.234,56 -> 1234.56)
      let valorNumerico = valor.replace(/\./g, '').replace(',', '.');
      valorNumerico = parseFloat(valorNumerico);
      if (isNaN(valorNumerico)) throw new Error('Valor inválido');
      const total = valorNumerico * taxa;

      setResultado({ taxa, total });

      const perfilStr = await AsyncStorage.getItem('@coinvertix_usuario');
      if (perfilStr) {
        const perfil = JSON.parse(perfilStr);
        await AsyncStorage.setItem('@coinvertix_usuario', JSON.stringify({
          ...perfil,
          totalConversoes: (perfil.totalConversoes || 0) + 1,
          ultimaConversao: { valor, origem, resultado: total.toFixed(2), destino },
        }));
      }
    } catch (e) {
      // Mensagem mais amigável para erro 429
      if (e.message.includes('Muitas requisições') || e.message.includes('429')) {
        setErroConv('Aguarde um instante e tente novamente (muitas requisições).');
      } else {
        setErroConv('Não foi possível converter. Verifique o par.');
      }
      console.log('executarConversao:', e.message);
    } finally {
      setConvertendo(false);
    }
  }

  function inverter() {
    setOrigem(destino);
    setDestino(origem);
    setResultado(null);
  }

  async function logout() {
    await AsyncStorage.removeItem('@coinvertix_usuario');
    router.replace('/verificacao/login');
  }

  const moedasFiltradas = Object.entries(moedas)
    .filter(([code, name]) =>
      code.toLowerCase().includes(busca.toLowerCase()) ||
      String(name).toLowerCase().includes(busca.toLowerCase())
    )
    .slice(0, 40);

  if (selecionando) {
    return (
      <View style={styles.seletorContainer}>
        <View style={styles.seletorHeader}>
          <Text style={styles.seletorTitulo}>
            {selecionando === 'origem' ? 'Moeda de origem' : 'Moeda de destino'}
          </Text>
          <TouchableOpacity onPress={() => { setSelecionando(null); setBusca(''); }}>
            <Text style={styles.seletorFechar}>✕</Text>
          </TouchableOpacity>
        </View>

        <TextInput
          style={styles.seletorBusca}
          placeholder="Buscar moeda..."
          placeholderTextColor={CORES.tintaSuave}
          value={busca}
          onChangeText={setBusca}
          autoFocus
        />

        <ScrollView>
          {moedasFiltradas.map(([code, name]) => (
            <TouchableOpacity
              key={code}
              style={styles.seletorItem}
              onPress={() => {
                if (selecionando === 'origem') setOrigem(code);
                else setDestino(code);
                setSelecionando(null);
                setBusca('');
                setResultado(null);
              }}
            >
              <Text style={styles.seletorCodigo}>{code}</Text>
              <Text style={styles.seletorNome} numberOfLines={1}>{name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: CORES.fundo }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.nuvem1} />
        <View style={styles.nuvem2} />

        <Animated.View style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <View>
            <Text style={styles.saudacao}>Olá, {usuario?.nome || 'Consulente'}</Text>
            <Text style={styles.headerSub}>Que a fortuna guie suas conversões</Text>
          </View>
          <TouchableOpacity onPress={logout} style={styles.sairBtn}>
            <Text style={styles.sairTexto}>Sair</Text>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View style={[styles.simboloContainer, { opacity: fadeAnim }]}>
          <View style={styles.simbolo}>
            <Text style={styles.simboloIcone}>☆</Text>
          </View>
          <Text style={styles.appNome}>COINVERTIX</Text>
          <View style={styles.divisorOuro} />
        </Animated.View>

        <Animated.View style={[styles.card, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <Text style={styles.cardTitulo}>⚗ Conversão de Moedas</Text>

          <Text style={styles.inputLabel}>Valor</Text>
          <TextInput
            style={styles.inputValor}
            placeholder="0,00"
            placeholderTextColor={CORES.tintaSuave}
            keyboardType="numeric"
            value={valor}
            onChangeText={t => { setValor(t); setResultado(null); }}
          />

          <View style={styles.parContainer}>
            <TouchableOpacity
              style={styles.moedaBtn}
              onPress={() => setSelecionando('origem')}
            >
              <Text style={styles.moedaBtnLabel}>De</Text>
              <Text style={styles.moedaBtnCodigo}>{origem}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.inverterBtn} onPress={inverter}>
              <Text style={styles.inverterIcone}>⇄</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.moedaBtn}
              onPress={() => setSelecionando('destino')}
            >
              <Text style={styles.moedaBtnLabel}>Para</Text>
              <Text style={styles.moedaBtnCodigo}>{destino}</Text>
            </TouchableOpacity>
          </View>

          {!!erroConv && <Text style={styles.erro}>{erroConv}</Text>}

          {resultado && (
            <View style={styles.resultadoBox}>
              <Text style={styles.resultadoLabel}>Resultado</Text>
              <Text style={styles.resultadoValor}>
                {Number(valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} {origem}
              </Text>
              <Text style={styles.resultadoSeta}>↓</Text>
              <Text style={styles.resultadoFinal}>
                {resultado.total.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {destino}
              </Text>
              <Text style={styles.resultadoTaxa}>
                Taxa: 1 {origem} = {resultado.taxa.toFixed(4)} {destino}
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.botao, convertendo && styles.botaoDesabilitado]}
            onPress={executarConversao}
            disabled={convertendo}
          >
            {convertendo
              ? <ActivityIndicator color={CORES.tinta} />
              : <Text style={styles.botaoTexto}>CONVERTER</Text>
            }
          </TouchableOpacity>
        </Animated.View>

        <Text style={styles.secaoTitulo}>✦ Cotações do Momento</Text>

        <View style={styles.cotacoesGrid}>
          {loadingCotacoes
            ? <ActivityIndicator color={CORES.ouro} style={{ marginVertical: 20 }} />
            : PARES_RAPIDOS.map(par => (
              <TouchableOpacity
                key={par.origem}
                style={styles.cotacaoCard}
                onPress={() => {
                  setOrigem(par.origem);
                  setDestino(par.destino);
                  setResultado(null);
                }}
              >
                <Text style={styles.cotacaoIcone}>{par.icone}</Text>
                <Text style={styles.cotacaoCodigo}>{par.origem}</Text>
                <Text style={styles.cotacaoValor}>
                  {cotacoes[par.origem]
                    ? `R$ ${cotacoes[par.origem].toFixed(2)}`
                    : '—'}
                </Text>
              </TouchableOpacity>
            ))
          }
        </View>

        <Text style={styles.secaoTitulo}>✦ Utilitários</Text>

        <View style={styles.utilGrid}>
          <TouchableOpacity style={styles.utilCard} onPress={() => { setOrigem('BRL'); setDestino('USD'); setResultado(null); }}>
            <Text style={styles.utilIcone}>🔄</Text>
            <Text style={styles.utilTexto}>BRL → USD</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.utilCard} onPress={() => { setOrigem('BRL'); setDestino('EUR'); setResultado(null); }}>
            <Text style={styles.utilIcone}>🔄</Text>
            <Text style={styles.utilTexto}>BRL → EUR</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.utilCard} onPress={() => { setOrigem('USD'); setDestino('EUR'); setResultado(null); }}>
            <Text style={styles.utilIcone}>💱</Text>
            <Text style={styles.utilTexto}>USD → EUR</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.utilCard} onPress={() => { setOrigem('BTC'); setDestino('BRL'); setResultado(null); }}>
            <Text style={styles.utilIcone}>₿</Text>
            <Text style={styles.utilTexto}>BTC → BRL</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.rodape}>
          <View style={styles.divisorOuro} />
          <Text style={styles.rodapeTexto}>
            Assim como o{' '}
            <Text style={styles.destaque}>Ás de Ouros</Text>
            {' '}revela riquezas ocultas,{'\n'}cada conversão abre novos caminhos.
          </Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  // ... (mantenha todos os estilos exatamente como estavam)
  container: { flex: 1, backgroundColor: CORES.fundo },
  scroll: { paddingHorizontal: 20, paddingTop: 60 },
  nuvem1: { position: 'absolute', top: 40, left: -40, width: 140, height: 80, borderRadius: 50, backgroundColor: '#FFFFFF80' },
  nuvem2: { position: 'absolute', top: 110, right: -50, width: 160, height: 90, borderRadius: 50, backgroundColor: '#FFFFFF60' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 },
  saudacao: { fontSize: 20, fontWeight: '700', color: CORES.tinta, letterSpacing: 0.5 },
  headerSub: { fontSize: 12, color: CORES.tintaSuave, fontStyle: 'italic', marginTop: 2 },
  sairBtn: { borderWidth: 1.5, borderColor: CORES.borda, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12 },
  sairTexto: { color: CORES.tintaSuave, fontSize: 13, fontWeight: '600' },
  simboloContainer: { alignItems: 'center', marginBottom: 28 },
  simbolo: { width: 72, height: 72, borderRadius: 36, backgroundColor: CORES.ouro, borderWidth: 2.5, borderColor: CORES.tinta, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 5, marginBottom: 12 },
  simboloIcone: { fontSize: 34, color: CORES.tinta },
  appNome: { fontSize: 22, fontWeight: '700', letterSpacing: 5, color: CORES.tinta, marginBottom: 16 },
  divisorOuro: { width: '70%', height: 1.5, backgroundColor: CORES.ouro, opacity: 0.6 },
  card: { backgroundColor: CORES.papel, borderWidth: 1, borderColor: CORES.borda, borderRadius: 24, padding: 22, marginBottom: 28, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 10, shadowOffset: { width: 0, height: 3 }, elevation: 3 },
  cardTitulo: { fontSize: 16, fontWeight: '700', color: CORES.tinta, letterSpacing: 0.5, marginBottom: 18 },
  inputLabel: { fontSize: 13, color: CORES.tintaSuave, fontWeight: '600', marginBottom: 8, letterSpacing: 0.5 },
  inputValor: { backgroundColor: '#FFFEFB', borderWidth: 1.5, borderColor: CORES.borda, borderRadius: 16, paddingHorizontal: 18, paddingVertical: 16, fontSize: 28, fontWeight: '700', color: CORES.tinta, marginBottom: 18, textAlign: 'center', letterSpacing: 1 },
  parContainer: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  moedaBtn: { flex: 1, backgroundColor: CORES.fundo, borderWidth: 1.5, borderColor: CORES.borda, borderRadius: 16, paddingVertical: 14, alignItems: 'center' },
  moedaBtnLabel: { fontSize: 11, color: CORES.tintaSuave, fontWeight: '600', letterSpacing: 1, marginBottom: 4 },
  moedaBtnCodigo: { fontSize: 22, fontWeight: '800', color: CORES.tinta, letterSpacing: 1 },
  inverterBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: CORES.ouro, borderWidth: 2, borderColor: CORES.tinta, justifyContent: 'center', alignItems: 'center' },
  inverterIcone: { fontSize: 20, color: CORES.tinta, fontWeight: '700' },
  resultadoBox: { backgroundColor: CORES.fundo, borderWidth: 1.5, borderColor: CORES.ouro, borderRadius: 18, padding: 18, alignItems: 'center', marginBottom: 16 },
  resultadoLabel: { fontSize: 11, color: CORES.tintaSuave, letterSpacing: 2, fontWeight: '600', marginBottom: 8 },
  resultadoValor: { fontSize: 18, fontWeight: '600', color: CORES.tintaSuave },
  resultadoSeta: { fontSize: 22, color: CORES.ouroEscuro, marginVertical: 4 },
  resultadoFinal: { fontSize: 28, fontWeight: '800', color: CORES.tinta, letterSpacing: 0.5 },
  resultadoTaxa: { marginTop: 8, fontSize: 12, color: CORES.tintaSuave, fontStyle: 'italic' },
  erro: { color: CORES.destaque, fontSize: 13, textAlign: 'center', marginBottom: 10, fontStyle: 'italic' },
  botao: { backgroundColor: CORES.ouro, borderWidth: 2, borderColor: CORES.tinta, borderRadius: 18, paddingVertical: 18, alignItems: 'center' },
  botaoDesabilitado: { opacity: 0.5 },
  botaoTexto: { color: CORES.tinta, fontWeight: '700', letterSpacing: 2, fontSize: 15 },
  secaoTitulo: { fontSize: 15, fontWeight: '700', color: CORES.tintaSuave, letterSpacing: 2, marginBottom: 14 },
  cotacoesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 28 },
  cotacaoCard: { width: (width - 60) / 3, backgroundColor: CORES.papel, borderWidth: 1, borderColor: CORES.borda, borderRadius: 18, paddingVertical: 14, alignItems: 'center' },
  cotacaoIcone: { fontSize: 22, marginBottom: 4 },
  cotacaoCodigo: { fontSize: 13, fontWeight: '700', color: CORES.tinta, letterSpacing: 1 },
  cotacaoValor: { fontSize: 12, color: CORES.ouroEscuro, fontWeight: '600', marginTop: 3 },
  utilGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 28 },
  utilCard: { width: (width - 60) / 2, backgroundColor: CORES.papel, borderWidth: 1, borderColor: CORES.borda, borderRadius: 18, paddingVertical: 16, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 },
  utilIcone: { fontSize: 18 },
  utilTexto: { fontSize: 13, fontWeight: '700', color: CORES.tinta, letterSpacing: 0.5 },
  rodape: { alignItems: 'center', marginTop: 4, gap: 16 },
  rodapeTexto: { textAlign: 'center', color: CORES.tintaSuave, lineHeight: 22, fontStyle: 'italic', fontSize: 13 },
  destaque: { color: CORES.ouroEscuro, fontWeight: '700' },
  seletorContainer: { flex: 1, backgroundColor: CORES.fundo, paddingTop: 60 },
  seletorHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 16 },
  seletorTitulo: { fontSize: 20, fontWeight: '700', color: CORES.tinta, letterSpacing: 0.5 },
  seletorFechar: { fontSize: 18, color: CORES.tintaSuave, fontWeight: '700', padding: 8 },
  seletorBusca: { marginHorizontal: 20, marginBottom: 12, backgroundColor: CORES.papel, borderWidth: 1.5, borderColor: CORES.borda, borderRadius: 16, paddingHorizontal: 18, paddingVertical: 14, fontSize: 16, color: CORES.tinta },
  seletorItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: CORES.borda, gap: 12 },
  seletorCodigo: { fontSize: 15, fontWeight: '800', color: CORES.tinta, width: 50, letterSpacing: 1 },
  seletorNome: { fontSize: 14, color: CORES.tintaSuave, flex: 1 },
});