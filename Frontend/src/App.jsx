import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Header } from './components/Header'
import { Footer } from './components/Footer'
import { HomePage } from './pages/HomePage'
import { CartProvider } from './store/cartStore'
import { AuthProvider } from './store/authStore'

function App() {
  const [showVendedorModal, setShowVendedorModal] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)

  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <div className="min-h-screen flex flex-col">
            <Header
        onOpenVendedorModal={() => setShowVendedorModal(true)}
        onOpenAuthModal={() => setShowAuthModal(true)}
      />
            <main className="flex-grow">
              <Routes>
                <Route
                  path="/"
                  element={
                    <HomePage
                      showVendedorModal={showVendedorModal}
                      setShowVendedorModal={setShowVendedorModal}
                      showAuthModal={showAuthModal}
                      setShowAuthModal={setShowAuthModal}
                    />
                  }
                />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  )
}

export default App
