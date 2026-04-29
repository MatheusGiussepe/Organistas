import { useEffect } from 'react';

/**
 * Modal genérico:
 *  - Fecha clicando fora (no overlay)
 *  - Fecha apertando ESC
 *  - Bloqueia scroll do fundo enquanto aberto
 *
 * Props:
 *   open     boolean   - se está aberto
 *   onClose  function  - chamada para fechar (ESC, clique fora, X)
 *   title    string    - título do modal
 *   size     'md'|'lg' - largura máxima (default 'md')
 *   children          - conteúdo do modal
 *   footer            - rodapé opcional (botões de ação)
 */
export default function Modal({ open, onClose, title, size = 'md', children, footer }) {
  // Fecha com tecla ESC
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    window.addEventListener('keydown', onKey);
    // Trava o scroll do body enquanto modal está aberto
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="modal-overlay"
      onClick={(e) => { if (e.target === e.currentTarget) onClose?.(); }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className={'modal modal-' + size}>
        <header className="modal-header">
          <h3 id="modal-title">{title}</h3>
          <button className="modal-close" onClick={onClose} aria-label="Fechar">
            ×
          </button>
        </header>
        <div className="modal-body">{children}</div>
        {footer && <footer className="modal-footer">{footer}</footer>}
      </div>
    </div>
  );
}
