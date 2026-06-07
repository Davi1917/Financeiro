const BASE_URL = 'https://economia.awesomeapi.com.br/json';

const MOEDAS_ESTATICAS = {
  USD: 'Dólar Americano',
  EUR: 'Euro',
  GBP: 'Libra Esterlina',
  BTC: 'Bitcoin',
  ETH: 'Ethereum',
  ARS: 'Peso Argentino',
  JPY: 'Iene Japonês',
  CAD: 'Dólar Canadense',
  AUD: 'Dólar Australiano',
  CHF: 'Franco Suíço',
  CNY: 'Yuan Chinês',
  MXN: 'Peso Mexicano',
  CLP: 'Peso Chileno',
  COP: 'Peso Colombiano',
  PEN: 'Sol Peruano',
  UYU: 'Peso Uruguaio',
  BOB: 'Boliviano',
  PYG: 'Guarani Paraguaio',
  VES: 'Bolívar Venezuelano',
  NOK: 'Coroa Norueguesa',
  SEK: 'Coroa Sueca',
  DKK: 'Coroa Dinamarquesa',
  NZD: 'Dólar Neozelandês',
  SGD: 'Dólar de Singapura',
  HKD: 'Dólar de Hong Kong',
  KRW: 'Won Sul-Coreano',
  INR: 'Rúpia Indiana',
  ZAR: 'Rand Sul-Africano',
  TRY: 'Lira Turca',
  RUB: 'Rublo Russo',
};

// Cache simples: { chave: { timestamp, dados } }
const cache = new Map();
const TTL = 30000; // 30 segundos

// Atraso entre requisições consecutivas para evitar 429
let ultimaRequisicao = 0;
const MIN_INTERVALO = 1000; // 1 segundo

async function aguardarIntervalo() {
  const agora = Date.now();
  const tempoDecorrido = agora - ultimaRequisicao;
  if (tempoDecorrido < MIN_INTERVALO) {
    await new Promise(resolve => setTimeout(resolve, MIN_INTERVALO - tempoDecorrido));
  }
  ultimaRequisicao = Date.now();
}

export async function buscarMoedas() {
  return MOEDAS_ESTATICAS;
}

export async function converter(origem, destino) {
  const de = origem.trim().toUpperCase();
  const para = destino.trim().toUpperCase();
  const chaveCache = `${de}-${para}`;

  // Verifica cache
  const cached = cache.get(chaveCache);
  if (cached && (Date.now() - cached.timestamp) < TTL) {
    return cached.dados;
  }

  await aguardarIntervalo();

  const par = `${de}-${para}`;
  const chaveEsperada = `${de}${para}`;

  try {
    const resposta = await fetch(`${BASE_URL}/last/${par}`);
    if (!resposta.ok) {
      if (resposta.status === 429) {
        throw new Error('Muitas requisições. Aguarde um momento e tente novamente.');
      }
      if (resposta.status === 404) {
        throw new Error(`Par ${par} não encontrado.`);
      }
      throw new Error(`HTTP ${resposta.status}`);
    }

    const dados = await resposta.json();

    let chaveReal = chaveEsperada;
    if (!dados[chaveReal]) {
      const alternativas = Object.keys(dados);
      const encontrada = alternativas.find(k => 
        k.toUpperCase() === chaveEsperada || 
        k.toUpperCase().replace('-', '') === chaveEsperada
      );
      if (encontrada) chaveReal = encontrada;
      else throw new Error(`Resposta não contém a chave ${chaveEsperada}`);
    }

    const cotacao = dados[chaveReal];
    const normalizada = {
      ...cotacao,
      bid:       Number(cotacao.bid)       || 0,
      ask:       Number(cotacao.ask)       || 0,
      high:      Number(cotacao.high)      || 0,
      low:       Number(cotacao.low)       || 0,
      varBid:    Number(cotacao.varBid)    || 0,
      pctChange: Number(cotacao.pctChange) || 0,
    };

    const resultado = { [chaveEsperada]: normalizada };
    cache.set(chaveCache, { timestamp: Date.now(), dados: resultado });
    return resultado;
  } catch (error) {
    throw new Error(`Falha na conversão ${de}→${para}: ${error.message}`);
  }
}