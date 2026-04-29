import { useEffect, useMemo, useState } from 'react';
import { api } from '../api/client.js';
import Layout from '../components/Layout.jsx';

/**
 * Visualização simplificada - pensada para pessoas com menos familiaridade.
 * Agrupa por estado, mostra poucos campos, com letras maiores e busca simples.
 */
export default function SimpleList() {
  const [items, setItems] = useState([]);
  const [busca, setBusca] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    api.get('/api/organistas')
      .then((data) => setItems(data || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const grupos = useMemo(() => {
    const q = busca.trim().toLowerCase();
    const filtrados = items.filter((it) => {
      if (!q) return true;
      const blob = [it.nome, it.cidade, it.local_culto, it.estado, it.examinadora, it.encarregado]
        .filter(Boolean).join(' ').toLowerCase();
      return blob.includes(q);
    });

    const map = new Map();
    for (const it of filtrados) {
      const k = it.estado || '—';
      if (!map.has(k)) map.set(k, []);
      map.get(k).push(it);
    }
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b, 'pt-BR'));
  }, [items, busca]);

  return (
    <Layout>
      <div className="page-toolbar">
        <h2>Lista simplificada</h2>
        <input
          type="search"
          placeholder="Buscar (nome, cidade, estado…)"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="search-input search-input-lg"
        />
      </div>

      {error && <div className="alert-error">{error}</div>}

      {loading ? (
        <div className="full-center"><div className="loader" /></div>
      ) : grupos.length === 0 ? (
        <div className="empty-card">Nada encontrado.</div>
      ) : (
        <div className="simple-list">
          {grupos.map(([estado, lista]) => (
            <section key={estado} className="estado-section">
              <header className="estado-header">
                <span aria-hidden>♪</span>
                <h3>{estado}</h3>
                <span className="badge">{lista.length}</span>
              </header>
              <ul className="cards">
                {lista.map((it) => (
                  <li key={it.id} className="card-simple">
                    <div className="card-title">{it.nome || '— Não tem organista —'}</div>
                    <div className="card-row"><b>Cidade:</b> {it.cidade || '—'}</div>
                    <div className="card-row"><b>Local de culto:</b> {it.local_culto || '—'}</div>
                    <div className="card-row"><b>Examinadora:</b> {it.examinadora || '—'}</div>
                    <div className="card-row"><b>Encarregado:</b> {it.encarregado || '—'}</div>
                    <div className="card-row"><b>Status:</b> {it.status || '—'}</div>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </Layout>
  );
}
