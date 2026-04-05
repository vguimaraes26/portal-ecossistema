/**
 * Dados de teste para scrapers
 * Usados quando a rede está indisponível ou em testes
 */

const mockNews = {
  cnn: [
    {
      title: 'Banco Central mantém Selic em 10,5% em decisão unânime',
      url: 'https://www.cnnbrasil.com.br/economia/banco-central-selic',
      summary: 'O Banco Central manteve a taxa Selic em 10,5% ao ano na reunião de hoje do Copom.',
      image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800',
      source: 'CNN Brasil'
    },
    {
      title: 'Dólar fecha em alta com risco fiscal em foco',
      url: 'https://www.cnnbrasil.com.br/economia/dolar-fecha-em-alta',
      summary: 'O dólar fechou em alta de 0,85%, cotado a R$ 4,95, com preocupações sobre o risco fiscal.',
      image: 'https://images.unsplash.com/photo-1460925895917-adf4e565db18?w=800',
      source: 'CNN Brasil'
    },
    {
      title: 'Inflação de março sobe para 0,54%, segundo IBGE',
      url: 'https://www.cnnbrasil.com.br/economia/inflacao-marco',
      summary: 'O IPCA de março registrou alta de 0,54%, acumulando 4,72% nos últimos 12 meses.',
      image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800',
      source: 'CNN Brasil'
    }
  ],

  infomoney: [
    {
      title: 'Petrobras anuncia distribuição de dividendos extraordinários',
      url: 'https://www.infomoney.com.br/petrobras-dividendos',
      summary: 'A Petrobras anunciou distribuição de R$ 15 bilhões em dividendos extraordinários aos acionistas.',
      image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800',
      source: 'Infomoney'
    },
    {
      title: 'Ações da Vale sobem 3% com otimismo no minério de ferro',
      url: 'https://www.infomoney.com.br/vale-acoes',
      summary: 'As ações da Vale fecharam em alta de 3%, impulsionadas pela recuperação nos preços do minério.',
      image: 'https://images.unsplash.com/photo-1553729784-e91953dec042?w=800',
      source: 'Infomoney'
    },
    {
      title: 'Merval fecha com ganhos de 2,5% com perspectiva de reforma tributária',
      url: 'https://www.infomoney.com.br/merval-ganhos',
      summary: 'O índice Merval encerrou em alta de 2,5%, com esperança em avanços na reforma tributária.',
      image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800',
      source: 'Infomoney'
    }
  ],

  portal: [
    {
      title: 'Reforma tributária avança no Congresso com novas propostas',
      url: 'https://www.portaldoconde.com.br/reforma-tributaria',
      summary: 'O Congresso Nacional discute novas propostas para a reforma tributária visando simplificar o sistema.',
      image: 'https://images.unsplash.com/photo-1450101499163-c8917c7b0edc?w=800',
      source: 'Portal do Contador'
    },
    {
      title: 'IRPF 2024: Receita Federal alerta sobre documentos necessários',
      url: 'https://www.portaldoconde.com.br/irpf-2024-documentos',
      summary: 'A Receita Federal orienta sobre documentos essenciais para a declaração do IRPF 2024.',
      image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800',
      source: 'Portal do Contador'
    },
    {
      title: 'Prazo de entrega da ECF se aproxima: confira o calendário',
      url: 'https://www.portaldoconde.com.br/ecf-calendario',
      summary: 'O calendário para entrega da Escrituração Contábil Fiscal está definido para 2024.',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800',
      source: 'Portal do Contador'
    }
  ]
};

module.exports = { mockNews };
