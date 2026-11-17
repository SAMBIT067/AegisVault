import React from 'react';

export default function PanicButton({ onPanic }) {
  return (
    <button
      onClick={onPanic}
      style={{
        background: '#da3633',
        color: 'white',
        border: 'none',
        padding: '8px 16px',
        borderRadius: '8px',
        fontWeight: 'bold',
        cursor: 'pointer',
        boxShadow: '0 0 10px rgba(218, 54, 51, 0.5)'
      }}
    >
      🚨 Panic Wipe
    </button>
  );
}