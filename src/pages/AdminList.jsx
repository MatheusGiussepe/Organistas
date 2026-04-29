import { useEffect, useMemo, useState } from 'react';
import { api } from '../api/client.js';
import Layout from '../components/Layout.jsx';
import Modal from '../components/Modal.jsx';

const ESTADOS_BR = [
  'ACRE', 'ALAGOAS', 'AMAPÁ', 'AMAZONAS', 'BAHIA', 'CEARÁ', 'DISTRITO FEDERAL',
  'ESPÍRITO SANTO', 'GOIÁS', 'MARANHÃO', 'MATO GROSSO', 'MATO GROSSO DO SUL',
  'MINAS GERAIS', 'PARÁ', 'PARAÍBA', 'PARANÁ', 'PERNAMBUCO', 'PIAUÍ',
  'RIO DE JANEIRO', 'RIO GRANDE DO NORTE', 'RIO GRANDE DO SUL', 'RONDÔNIA',
  'RORAIMA', 'SANTA CATARINA', 'SÃO PAULO', 'SERGIPE', 'TOCANTINS',
  'INTERNACIONAL',
];

const STATUS_OPTS = ['Oficializada', 'Aprendiz', 'Provisório', 'Não tem organista'];

const EMPTY = {
  estado: '', cidade: '', examinadora: '', encarregado: '', nome: '',
  instrumento: '', local_culto: '', status: '', observacoes: '', telefone: '',
};

export default function AdminList() {
  const [items, setItems] = useState([]);
  const [busca, setBusca] = useState('');
  const [estadoFiltro, setEstadoFiltro] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(null); // null | 'new' | id
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const data = await api.get('/api/organistas');
      setItems(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const q = busca.trim().toLowerCase();
    return items.filter((it) => {
      if (estadoFiltro && it.estado !== estadoFiltro) return false;
      if (!q) return true;
      const blob = [it.nome, it.cidade, it.local_culto, it.examinadora, it.encarregado, it.telefone]
        .filter(Boolean).join(' ').toLowerCase();
      return blob.includes(q);
    });
  }, [items, busca, estadoFiltro]);

  function startNew() {
    setEditing('new');
    setForm(EMPTY);
  }

  function startEdit(item) {
    setEditing(item.id);
    setForm({ ...EMPTY, ...item });
  }

  function cancelEdit() {
    setEditing(null);
    setForm(EMPTY);
  }

  async function save() {
    setSaving(true);
    setError('');
    try {
      if (editing === 'new') {
        await api.post('/api/organistas', form);
      } else {
        await api.put(`/api/organistas/${editing}`, form);
      }
      cancelEdit();
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function remove(item) {
    if (!confirm(`Remover "${item.nome || '(sem nome)'}" de ${item.cidade || item.estado}?`)) return;
    try {
      await api.del(`/api/organistas/${item.id}`);
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <Layout>
      <div className="page-toolbar">
        <h2>Lista detalhada</h2>
        <div className="toolbar-actions">
          <input
            type="search"
            placeholder="Buscar por nome, cidade, local…"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="search-input"
          />
          <select value={estadoFiltro} onChange={(e) => setEstadoFiltro(e.target.value)}>
            <option value="">Todos os estados</option>
            {ESTADOS_BR.map((e) => <option key={e} value={e}>{e}</option>)}
          </select>
          <button className="btn-primary" onClick={startNew}>+ Adicionar</button>
        </div>
      </div>

      {error && <div className="alert-error">{error}</div>}

      <Modal
        open={!!editing}
        onClose={saving ? undefined : cancelEdit}
        title={editing === 'new' ? 'Nova organista' : 'Editar organista'}
        size="lg"
        footer={
          <>
            <button className="btn-ghost" onClick={cancelEdit} disabled={saving}>Cancelar</button>
            <button className="btn-primary" onClick={save} disabled={saving || !form.estado}>
              {saving ? 'Salvando…' : 'Salvar'}
            </button>
          </>
        }
      >
        <div className="grid">
          <Field label="Estado">
            <select value={form.estado || ''} onChange={(e) => setForm({ ...form, estado: e.target.value })}>
              <option value="">Selecione…</option>
              {ESTADOS_BR.map((e) => <option key={e} value={e}>{e}</option>)}
            </select>
          </Field>
          <Field label="Cidade">
            <input value={form.cidade || ''} onChange={(e) => setForm({ ...form, cidade: e.target.value })} />
          </Field>
          <Field label="Nome da organista">
            <input value={form.nome || ''} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
          </Field>
          <Field label="Telefone">
            <input value={form.telefone || ''} onChange={(e) => setForm({ ...form, telefone: e.target.value })} />
          </Field>
          <Field label="Examinadora">
            <input value={form.examinadora || ''} onChange={(e) => setForm({ ...form, examinadora: e.target.value })} />
          </Field>
          <Field label="Encarregado">
            <input value={form.encarregado || ''} onChange={(e) => setForm({ ...form, encarregado: e.target.value })} />
          </Field>
          <Field label="Instrumento">
            <input value={form.instrumento || ''} onChange={(e) => setForm({ ...form, instrumento: e.target.value })} />
          </Field>
          <Field label="Local de culto">
            <input value={form.local_culto || ''} onChange={(e) => setForm({ ...form, local_culto: e.target.value })} />
          </Field>
          <Field label="Status">
            <select value={form.status || ''} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              <option value="">—</option>
              {STATUS_OPTS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>
          <Field label="Observações" wide>
            <textarea
              rows={3}
              value={form.observacoes || ''}
              onChange={(e) => setForm({ ...form, observacoes: e.target.value })}
            />
          </Field>
        </div>
      </Modal>

      {loading ? (
        <div className="full-center"><div className="loader" /></div>
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Examinadora</th>
                <th>Encarregado</th>
                <th>Nome</th>
                <th>Status</th>
                <th>Estado</th>
                <th>Cidade</th>
                <th>Local de culto</th>
                <th>Telefone</th>
                <th>Obs.</th>
                <th aria-label="ações"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((it) => (
                <tr key={it.id}>
                  <td>{it.examinadora}</td>
                  <td>{it.encarregado || '—'}</td>
                  <td>{it.nome || '—'}</td>
                  <td>{it.status || '—'}</td>
                  <td>{it.estado || '—'}</td>
                  <td>{it.cidade || '—'}</td>
                  <td>{it.local_culto || '—'}</td>
                  <td>{it.telefone || '—'}</td>
                  <td title={it.observacoes || ''}>
                    {it.observacoes ? (it.observacoes.length > 30 ? it.observacoes.slice(0, 30) + '…' : it.observacoes) : '—'}
                  </td>
                  <td className="row-actions">
                    <button className="btn-mini" onClick={() => startEdit(it)}>Editar</button>
                    <button className="btn-mini btn-danger" onClick={() => remove(it)}>Excluir</button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={10} className="empty-row">Nenhum registro encontrado.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <p className="muted">{filtered.length} de {items.length} registros</p>
    </Layout>
  );
}

function Field({ label, wide, children }) {
  return (
    <label className={'field' + (wide ? ' field-wide' : '')}>
      <span>{label}</span>
      {children}
    </label>
  );
}
