import React from 'react'
import { Link } from 'react-router-dom'

const Header = () => {
  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
      <div className="container">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-3">
            <img src="/MaletaSF.png" alt="SelectFlow" className="w-8 h-8" />
            <img src="/SelectFlow_2.png" alt="SelectFlow" className="h-6" />
          </Link>
          
          <div className="flex items-center gap-4">
            <Link to="/login" className="btn btn-ghost">
              Entrar
            </Link>
            <Link to="/register" className="btn btn-primary">
              Cadastrar-se
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header