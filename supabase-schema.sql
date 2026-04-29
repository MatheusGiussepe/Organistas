-- ============================================================
-- Schema do Supabase para a Lista de Organistas
-- Rode este SQL no editor SQL do Supabase (SQL Editor > New query)
-- ============================================================

-- Tabela principal de organistas
CREATE TABLE IF NOT EXISTS organistas (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  estado       TEXT NOT NULL,
  cidade       TEXT,
  examinadora  TEXT,
  encarregado  TEXT,
  nome         TEXT,
  instrumento  TEXT,
  local_culto  TEXT,
  status       TEXT,        -- Oficializada / Aprendiz / Não tem organista / Provisório
  observacoes  TEXT,
  telefone     TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para acelerar buscas comuns
CREATE INDEX IF NOT EXISTS idx_organistas_estado ON organistas(estado);
CREATE INDEX IF NOT EXISTS idx_organistas_cidade ON organistas(cidade);
CREATE INDEX IF NOT EXISTS idx_organistas_nome   ON organistas(nome);

-- Trigger para manter updated_at sempre atualizado
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_organistas_updated_at ON organistas;
CREATE TRIGGER trg_organistas_updated_at
BEFORE UPDATE ON organistas
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();
