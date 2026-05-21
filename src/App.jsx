import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import Voluntarios from './paginas/Voluntarios';
import Horas from './paginas/Horas';
import Certificados from './paginas/Certificados';

function App() {
  return (
    <BrowserRouter>
      <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
        <nav
          style={{
            background: '#1e3a5f',
            padding: '12px 24px',
            display: 'flex',
            gap: '20px',
            alignItems: 'center'
          }}
        >
          <span style={{ color: '#fff', fontWeight: 700, fontSize: '18px' }}>
            Voluntariado
          </span>
          {[
            { to: '/voluntarios', label: 'Voluntarios' },
            { to: '/horas', label: 'Horas' },
            { to: '/certificados', label: 'Certificados' }
          ].map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              style={({ isActive }) => ({
                color: isActive ? '#93c5fd' : '#cbd5e1',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: isActive ? 600 : 400,
                padding: '4px 8px',
                borderRadius: '4px',
                background: isActive ? 'rgba(255,255,255,0.1)' : 'transparent'
              })}
            >
              {label}
            </NavLink>
          ))}
        </nav>

        <main style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
          <Routes>
            <Route path="/" element={<Voluntarios />} />
            <Route path="/voluntarios" element={<Voluntarios />} />
            <Route path="/horas" element={<Horas />} />
            <Route path="/certificados" element={<Certificados />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
