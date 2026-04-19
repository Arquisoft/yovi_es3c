import { useState } from 'react';
import DialogResult from './DialogResult';
import type { DialogResultProps } from './DialogResult';
import './CollapsibleDialog.css';

const CollapsibleDialog = (props: DialogResultProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
  <div className={`collapsible-dialog-wrapper ${isCollapsed ? 'collapsible-dialog-wrapper--collapsed' : ''}`}>
    <div className="collapsible-dialog">
      <div className="collapsible-dialog__bar" onClick={() => setIsCollapsed(v => !v)}>
        <span className="collapsible-dialog__bar-label">
          {'Resultados de la partida'}
        </span>
        <span className="collapsible-dialog__bar-chevron">
          {isCollapsed ? '▲' : '▼'}
        </span>
      </div>

      {!isCollapsed && (
        <div className="collapsible-dialog__content">
          <DialogResult {...props} />
        </div>
      )}
    </div>
  </div>
);
};

export default CollapsibleDialog;