import { Router } from 'express';
import { supabase } from '../db/supabase.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = Router();

// Todas as rotas exigem login
router.use(requireAuth);

/**
 * GET /api/organistas
 * Lista todas as organistas.
 * Querystring opcional: ?estado=SP&busca=texto
 */
router.get('/', async (req, res) => {
  const { estado, busca } = req.query;
  let query = supabase.from('organistas').select('*').order('estado').order('cidade').order('nome');

  if (estado) query = query.eq('estado', estado);
  if (busca) {
    // busca por nome OU cidade
    query = query.or(`nome.ilike.%${busca}%,cidade.ilike.%${busca}%,local_culto.ilike.%${busca}%`);
  }

  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
});

/**
 * GET /api/organistas/:id
 */
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase.from('organistas').select('*').eq('id', id).single();
  if (error) return res.status(404).json({ error: 'Organista não encontrada.' });
  return res.json(data);
});

/**
 * POST /api/organistas  (admin)
 */
router.post('/', requireAdmin, async (req, res) => {
  const payload = pickFields(req.body);
  if (!payload.estado) return res.status(400).json({ error: 'O campo "estado" é obrigatório.' });

  const { data, error } = await supabase.from('organistas').insert(payload).select().single();
  if (error) return res.status(500).json({ error: error.message });
  return res.status(201).json(data);
});

/**
 * PUT /api/organistas/:id  (admin)
 */
router.put('/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;
  const payload = pickFields(req.body);

  const { data, error } = await supabase
    .from('organistas')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
});

/**
 * DELETE /api/organistas/:id  (admin)
 */
router.delete('/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase.from('organistas').delete().eq('id', id);
  if (error) return res.status(500).json({ error: error.message });
  return res.status(204).send();
});

/**
 * Filtra apenas as colunas válidas do payload (evita injeção de campos extras)
 */
function pickFields(body = {}) {
  const allowed = [
    'estado', 'cidade', 'examinadora', 'encarregado',
    'nome', 'instrumento', 'local_culto', 'status',
    'observacoes', 'telefone',
  ];
  const out = {};
  for (const k of allowed) {
    if (body[k] !== undefined) out[k] = body[k] === '' ? null : body[k];
  }
  return out;
}

export default router;
