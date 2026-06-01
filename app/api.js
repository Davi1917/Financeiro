const BASE_URL = 'https://economia.awesomeapi.com.br/json';

export async function buscarMoedas() {
  const resposta = await fetch(
    `${BASE_URL}/available/uniq`
  );

  if (!resposta.ok) {
    throw new Error('Erro ao carregar moedas');
  }

  return await resposta.json();
}

export async function converter(origem, destino) {
  const resposta = await fetch(
    `${BASE_URL}/last/${origem}-${destino}`
  );

  if (!resposta.ok) {
    throw new Error('Erro ao converter moeda');
  }

  return await resposta.json();
}