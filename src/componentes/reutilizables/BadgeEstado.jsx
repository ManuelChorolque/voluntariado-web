function BadgeEstado({ estado, mapa }) {
  const config = mapa?.[estado] ?? { label: estado, color: '#6b7280' };
  return (
    <span
      style={{
        background: config.color + '20',
        color: config.color,
        padding: '2px 10px',
        borderRadius: '12px',
        fontSize: '12px',
        fontWeight: 600,
        display: 'inline-block'
      }}
    >
      {config.label}
    </span>
  );
}

export default BadgeEstado;
