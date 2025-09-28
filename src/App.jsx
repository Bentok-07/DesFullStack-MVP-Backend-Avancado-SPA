// src/App.jsx

import React from 'react';

// Estilos globais
import './styles/global.css';

// Componentes principais da estrutura
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';

// Rotas da aplicação
import AppRoutes from './routes/AppRoutes';

function App() {
  return (
    <div className="appContainer">
      <Header />

      <div className="content">
        <AppRoutes />
      </div>

      <Footer />
    </div>
  );
}

export default App;
