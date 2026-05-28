function BadgeEstado({ estado, mapa }) {
  const config = mapa?.[estado] ?? { label: estado, color: '#6b7280' };
  return (
    <span
      className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold"
      style={{
        background: config.color + '20',
        color: config.color,
      }}
    >
      {config.label}
    </span>
  );
}

export default BadgeEstado;
