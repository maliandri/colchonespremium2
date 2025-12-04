import { useState, useRef, useEffect } from 'react';
import { X, Send, MessageSquare, Minimize2, Loader2 } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [leadCaptured, setLeadCaptured] = useState(false);
  const messagesEndRef = useRef(null);

  // Inicializar sesión
  useEffect(() => {
    if (!sessionId) {
      const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      setSessionId(newSessionId);
    }
  }, []);

  // Auto-scroll al final de los mensajes
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Abrir chatbot con mensaje de bienvenida
  const handleOpen = () => {
    setIsOpen(true);
    if (messages.length === 0) {
      setMessages([
        {
          role: 'assistant',
          content: '¡Hola! 👋 Soy el asistente virtual de Aluminé Hogar. ¿En qué puedo ayudarte hoy? Puedo ayudarte a encontrar colchones, almohadas, darte precios y más.',
          timestamp: new Date()
        }
      ]);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Llamar a la API del chatbot
      const response = await axios.post(`${API_URL}/chatbot/conversacion`, {
        message: inputMessage,
        conversationHistory: messages,
        sessionId
      });

      const { message: aiResponse, products, leadDetected, leadData, isPurchaseIntent } = response.data;

      // Agregar respuesta del bot
      const botMessage = {
        role: 'assistant',
        content: aiResponse,
        products: products || [],
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);

      // Si se detectó un lead y no se ha capturado antes
      if (leadDetected && !leadCaptured && leadData) {
        setLeadCaptured(true);
        await enviarLead(leadData);
      }

      // Si hay intención de compra y tenemos productos, mostrar botón de acción
      if (isPurchaseIntent && products && products.length > 0) {
        // Opcional: agregar un mensaje con CTA
        setTimeout(() => {
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: '¿Te gustaría que un asesor se comunique contigo para finalizar tu compra? 🛒',
            timestamp: new Date(),
            showContactForm: true
          }]);
        }, 1000);
      }

    } catch (error) {
      console.error('Error al enviar mensaje:', error);

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Disculpa, tuve un problema técnico. ¿Podrías intentar nuevamente?',
        timestamp: new Date(),
        isError: true
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const enviarLead = async (leadData) => {
    try {
      await axios.post(`${API_URL}/chatbot/enviar-lead`, {
        leadData,
        conversationSummary: messages.slice(-5), // Últimos 5 mensajes
        sessionId
      });
      console.log('✅ Lead enviado exitosamente');
    } catch (error) {
      console.error('❌ Error al enviar lead:', error);
    }
  };

  const handleProductClick = (producto) => {
    window.location.href = `/producto/${producto._id}`;
  };

  const handleContactClick = () => {
    const whatsappNumber = '5492995769999';
    const message = encodeURIComponent('Hola, estaba chateando con el bot y me gustaría más información.');
    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');
  };

  return (
    <>
      {/* Botón flotante */}
      {!isOpen && (
        <button
          onClick={handleOpen}
          className="fixed bottom-6 right-6 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-full p-4 shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 hover:scale-110 z-50 group"
          aria-label="Abrir chat"
        >
          <MessageSquare className="w-6 h-6" />
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center animate-pulse">
            IA
          </span>
        </button>
      )}

      {/* Ventana del chat */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col z-50 border border-gray-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-4 rounded-t-2xl flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold">Asistente Virtual</h3>
                <p className="text-xs text-white/80">Con tecnología Gemini AI</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleClose}
                className="hover:bg-white/10 p-2 rounded-lg transition-colors"
                aria-label="Minimizar chat"
              >
                <Minimize2 className="w-5 h-5" />
              </button>
              <button
                onClick={handleClose}
                className="hover:bg-white/10 p-2 rounded-lg transition-colors"
                aria-label="Cerrar chat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Mensajes */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((msg, index) => (
              <div key={index}>
                <div
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white'
                        : msg.isError
                        ? 'bg-red-50 text-red-700 border border-red-200'
                        : 'bg-white text-gray-800 shadow-sm border border-gray-200'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                    <span className="text-xs opacity-60 mt-1 block">
                      {msg.timestamp.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>

                {/* Mostrar productos si los hay */}
                {msg.products && msg.products.length > 0 && (
                  <div className="mt-2 space-y-2">
                    {msg.products.map((producto, idx) => (
                      <div
                        key={idx}
                        className="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => handleProductClick(producto)}
                      >
                        <h4 className="font-semibold text-sm text-gray-800">{producto.nombre}</h4>
                        <p className="text-xs text-gray-600 mt-1">{producto.categoria}</p>
                        <p className="text-purple-600 font-bold mt-1">
                          ${producto.precio?.toLocaleString('es-AR')} ARS
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Mostrar botón de contacto */}
                {msg.showContactForm && (
                  <div className="mt-2">
                    <button
                      onClick={handleContactClick}
                      className="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg transition-colors text-sm font-medium"
                    >
                      💬 Contactar por WhatsApp
                    </button>
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white rounded-2xl px-4 py-3 shadow-sm border border-gray-200">
                  <Loader2 className="w-5 h-5 text-purple-600 animate-spin" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-gray-200 rounded-b-2xl">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Escribe tu mensaje..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !inputMessage.trim()}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-2 rounded-full hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Enviar mensaje"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
