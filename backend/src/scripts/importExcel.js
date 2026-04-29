/**
 * Lê a planilha "lista-organistas.xlsx" (ou o caminho passado como argumento)
 * e popula a tabela `organistas` no Supabase.
 *
 * Uso:
 *   npm run import                 -> usa src/scripts/lista-organistas.xlsx
 *   npm run import -- ./outra.xlsx -> usa o arquivo informado
 *
 * O script é idempotente: por padrão LIMPA a tabela antes de inserir.
 * Para apenas adicionar (sem limpar), passe a flag --append:
 *   npm run import -- --append
 */

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import xlsx from 'xlsx';
import { supabase } from '../db/supabase.js';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const args = process.argv.slice(2);
const append = args.includes('--append');
const fileArg = args.find((a) => !a.startsWith('--'));
const filePath = fileArg
  ? path.resolve(process.cwd(), fileArg)
  : path.join(__dirname, 'lista-organistas.xlsx');

console.log(`📖 Lendo planilha: ${filePath}`);

const workbook = xlsx.readFile(filePath);
// Usamos a aba "Detalhada" porque ela tem todos os campos.
const sheetName = workbook.SheetNames.includes('Detalhada')
  ? 'Detalhada'
  : workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];

// Lê tudo como matriz de arrays
const rows = xlsx.utils.sheet_to_json(sheet, { header: 1, defval: null, blankrows: false });

// A planilha original tem a coluna A vazia. A lib `xlsx` descarta colunas
// vazias à esquerda, então os índices ficam zero-based a partir de "Examinadora":
// 0 Examinadora | 1 Encarregado | 2 Nome | 3 Estado | 4 Cidade
// | 5 Instrumento | 6 Local de culto | 7 Status | 8 Observações | 9 Telefone
const COL = {
  examinadora: 0,
  encarregado: 1,
  nome: 2,
  estado: 3,
  cidade: 4,
  instrumento: 5,
  local_culto: 6,
  status: 7,
  observacoes: 8,
  telefone: 9,
};

const ESTADOS_VALIDOS = new Set([
  'ACRE', 'ALAGOAS', 'AMAPÁ', 'AMAZONAS', 'BAHIA', 'CEARÁ', 'DISTRITO FEDERAL',
  'ESPÍRITO SANTO', 'GOIÁS', 'MARANHÃO', 'MATO GROSSO', 'MATO GROSSO DO SUL',
  'MINAS GERAIS', 'PARÁ', 'PARAÍBA', 'PARANÁ', 'PERNAMBUCO', 'PIAUÍ',
  'RIO DE JANEIRO', 'RIO GRANDE DO NORTE', 'RIO GRANDE DO SUL', 'RONDÔNIA',
  'RORAIMA', 'SANTA CATARINA', 'SÃO PAULO', 'SERGIPE', 'TOCANTINS',
]);

// Países / locais não-brasileiros encontrados na planilha. Tudo que cair aqui
// (ou qualquer estado que não seja brasileiro) é normalizado como "INTERNACIONAL",
// e o país original é preservado nas observações do registro.
const PAISES_INTERNACIONAIS = new Set([
  'INTERNACIONAL', 'ITÁLIA', 'ITALIA',
  'EMIRADOS ÁRABES', 'EMIRADOS ARABES',
  'ESTADOS UNIDOS', 'EUA', 'USA',
]);

const clean = (v) => {
  if (v === null || v === undefined) return null;
  const s = String(v).trim();
  return s === '' ? null : s;
};

// Remove acentos para comparação tolerante (a planilha tem "GOIAS", "CEARA", etc.)
const semAcento = (s) => s.normalize('NFD').replace(/\p{Diacritic}/gu, '');

// Mapa: versão sem acento (uppercase) -> nome canônico com acento
const ESTADOS_BR_NORMALIZADO = new Map(
  [...ESTADOS_VALIDOS].map((e) => [semAcento(e).toUpperCase(), e])
);

const PAISES_INTERNACIONAIS_NORMALIZADO = new Set(
  [...PAISES_INTERNACIONAIS].map((p) => semAcento(p).toUpperCase())
);

/**
 * Decide o "estado" final de um registro:
 *  - Se for um estado brasileiro (com ou sem acento), retorna o nome canônico (com acento).
 *  - Se for um país conhecido OU qualquer outra coisa não-BR, retorna INTERNACIONAL com o país original.
 */
function normalizarEstado(nomeBruto) {
  if (!nomeBruto) return { estado: null, pais: null };
  const original = nomeBruto.trim();
  const chave = semAcento(original).toUpperCase().replace(/\s+/g, ' ');

  if (ESTADOS_BR_NORMALIZADO.has(chave)) {
    return { estado: ESTADOS_BR_NORMALIZADO.get(chave), pais: null };
  }
  if (chave === 'INTERNACIONAL') {
    return { estado: 'INTERNACIONAL', pais: null };
  }
  // Qualquer país conhecido OU qualquer "estado" desconhecido vira INTERNACIONAL,
  // preservando o nome original como país.
  return { estado: 'INTERNACIONAL', pais: original };
}

const records = [];
let estadoAtual = null;
let paisAtual = null;

// Começamos da linha 1 (pulando o cabeçalho)
for (let i = 1; i < rows.length; i++) {
  const row = rows[i] || [];

  // Se a coluna "Estado" (col 4) está preenchida, usamos ela. Caso contrário,
  // muitas linhas da planilha colocam o estado em maiúsculo na coluna 1
  // (linha "ACRE", "AMAZONAS" etc.) - tratamos esse caso para herdar o estado.
  const estadoNaCol = clean(row[COL.estado]);
  const possivelHeaderEstado = clean(row[COL.examinadora]);

  if (estadoNaCol) {
    const norm = normalizarEstado(estadoNaCol);
    estadoAtual = norm.estado;
    paisAtual = norm.pais;
  } else if (
    possivelHeaderEstado &&
    (ESTADOS_VALIDOS.has(possivelHeaderEstado.toUpperCase()) ||
     PAISES_INTERNACIONAIS.has(possivelHeaderEstado.toUpperCase())) &&
    !clean(row[COL.nome])
  ) {
    const norm = normalizarEstado(possivelHeaderEstado);
    estadoAtual = norm.estado;
    paisAtual = norm.pais;
    continue; // linha-cabeçalho, não é dado
  }

  const nome = clean(row[COL.nome]);
  const cidade = clean(row[COL.cidade]);
  const localCulto = clean(row[COL.local_culto]);
  const examinadora = clean(row[COL.examinadora]);
  const encarregado = clean(row[COL.encarregado]);
  const instrumento = clean(row[COL.instrumento]);
  const status = clean(row[COL.status]);
  const observacoes = clean(row[COL.observacoes]);
  const telefone = clean(row[COL.telefone]);

  // Pula linhas totalmente vazias
  if (!nome && !cidade && !localCulto && !examinadora && !encarregado &&
      !instrumento && !status && !observacoes && !telefone) {
    continue;
  }

  // Se ainda não temos um estado definido, pulamos para evitar lixo
  if (!estadoAtual) continue;

  // Se for um registro internacional e tivermos o nome do país, preserva nas observações.
  let observacoesFinal = observacoes;
  if (estadoAtual === 'INTERNACIONAL' && paisAtual) {
    const tag = `País: ${paisAtual}`;
    observacoesFinal = observacoes ? `${tag}. ${observacoes}` : tag;
  }

  records.push({
    estado: estadoAtual,
    cidade,
    examinadora,
    encarregado,
    nome,
    instrumento,
    local_culto: localCulto,
    status,
    observacoes: observacoesFinal,
    telefone,
  });
}

console.log(`✅ ${records.length} registros prontos para importar.`);

if (!append) {
  console.log('🧹 Limpando tabela "organistas" antes de inserir (use --append para evitar isso)...');
  // .neq com um id impossível efetivamente apaga tudo via service_role
  const { error: delErr } = await supabase
    .from('organistas')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000');
  if (delErr) {
    console.error('Erro ao limpar tabela:', delErr.message);
    process.exit(1);
  }
}

// Insere em lotes de 500
const CHUNK = 500;
let inseridos = 0;
for (let i = 0; i < records.length; i += CHUNK) {
  const chunk = records.slice(i, i + CHUNK);
  const { error } = await supabase.from('organistas').insert(chunk);
  if (error) {
    console.error(`Erro no lote ${i}-${i + chunk.length}:`, error.message);
    process.exit(1);
  }
  inseridos += chunk.length;
  console.log(`  -> ${inseridos}/${records.length}`);
}

console.log('🎉 Importação concluída com sucesso.');
process.exit(0);
