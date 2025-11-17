import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Header } from './components/Header'
import { Footer } from './components/Footer'
import { CartModal } from './components/CartModal'
import { WhatsAppButton } from './components/WhatsAppButton'
import { HomePage } from './pages/HomePage'
import { ProductDetail } from './pages/ProductDetail'
import { CartProvider } from './store/cartStore'
import { AuthProvider } from './store/authStore'

function App() {
  const [showVendedorModal, setShowVendedorModal] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showCartModal, setShowCartModal] = useState(false)

  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <div className="min-h-screen flex flex-col">
            <Header
        onOpenVendedorModal={() => setShowVendedorModal(true)}
        onOpenAuthModal={() => setShowAuthModal(true)}
        onOpenCartModal={() => setShowCartModal(true)}
      />
            <CartModal
              isOpen={showCartModal}
              onClose={() => setShowCartModal(false)}
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
                <Route path="/producto/:id" element={<ProductDetail />} />
              </Routes>
            </main>
            <Footer />

            {/* Botón flotante de WhatsApp */}
            <WhatsAppButton />
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  )
}

export default App
