'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, MessageSquare, Loader2, User, MessageCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import axios from 'axios';

const API_URL = '/api';

export default function BotPage() {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [leadCaptured, setLeadCaptured] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!sessionId) {
      const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      setSessionId(newSessionId);
    }
  }, []);

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        role: 'assistant',
        content: 'Hola! Soy Alumine Bot, el asistente virtual de Alumine Hogar.\n\nEn que puedo ayudarte hoy? Puedo ayudarte a encontrar productos para tu hogar, darte precios, informacion sobre envios y mas.',
        timestamp: new Date()
      }]);
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const extractLeadDataFromText = (text) => {
    const leadData = { nombre: null, email: null, telefono: null };
    const emailMatch = text.match(/[\w.-]+@[\w.-]+\.\w+/);
    if (emailMatch) leadData.email = emailMatch[0];
    const phoneMatch = text.match(/(?:\+54\s?)?(?:9\s?)?(?:11|\d{3,4})\s?\d{3,4}[-\s]?\d{4}/);
    if (phoneMatch) leadData.telefono = phoneMatch[0].replace(/\s+/g, ' ').trim();
    const nombreMatch = text.match(/(?:me llamo|mi nombre es|soy|nombre:?)\s+([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)?)/i);
    if (nombreMatch) leadData.nombre = nombreMatch[1].trim();
    return leadData;
  };

  const enviarSolicitudAsistenciaHumana = async (data) => {
    try {
      await axios.post(`${API_URL}/chatbot?action=lead`, {
        leadData: { ...data, interes: data.consulta, tipoSolicitud: 'asistencia_humana' },
        conversationSummary: data.conversationHistory,
        sessionId
      });
    } catch (error) {
      console.error('Error al enviar solicitud:', error);
    }
  };

  const enviarLead = async (leadData, conversationToSend = null) => {
    try {
      await axios.post(`${API_URL}/chatbot?action=lead`, {
        leadData,
        conversationSummary: conversationToSend || messages,
        sessionId
      });
    } catch (error) {
      console.error('Error al enviar lead:', error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = { role: 'user', content: inputMessage, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputMessage;
    setInputMessage('');
    setIsLoading(true);

    try {
      const lastBotMessage = messages[messages.length - 1];

      if (lastBotMessage?.needsHumanAssistance) {
        const consultaCliente = currentInput;
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: 'Perfecto, ya tengo tu consulta.\n\nAhora necesito tus datos para que un asesor te contacte:\n\nCual es tu nombre?\nY tu email o telefono?',
          timestamp: new Date(),
          waitingForContactData: true,
          consultaCliente: consultaCliente
        }]);
        setIsLoading(false);
        return;
      }

      if (lastBotMessage?.waitingForContactData) {
        const consultaOriginal = lastBotMessage.consultaCliente;
        const allText = messages.map(m => m.content).join(' ') + ' ' + currentInput;
        const leadData = extractLeadDataFromText(allText);
        await enviarSolicitudAsistenciaHumana({
          ...leadData,
          consulta: consultaOriginal,
          conversationHistory: messages
        });
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: 'Listo! Tu solicitud ha sido enviada.\n\nUn asesor se comunicara contigo a la brevedad para ayudarte con tu consulta.\n\nHay algo mas en lo que pueda ayudarte?',
          timestamp: new Date()
        }]);
        setIsLoading(false);
        return;
      }

      const response = await axios.post(`${API_URL}/chatbot?action=conversation`, {
        message: currentInput,
        conversationHistory: messages,
        sessionId
      });

      const { reply: aiResponse, productos: products } = response.data;

      const botMessage = {
        role: 'assistant',
        content: aiResponse,
        products: products || [],
        timestamp: new Date()
      };

      const updatedMessages = [...messages, userMessage, botMessage];
      setMessages(prev => [...prev, botMessage]);

    } catch (error) {
      console.error('Error al enviar mensaje:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Disculpa, tuve un problema tecnico. Podrias intentar nuevamente?',
        timestamp: new Date(),
        isError: true
      }]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleProductClick = (producto) => {
    window.open(`/producto/${producto._id}`, '_blank');
  };

  const handleWhatsAppClick = () => {
    const whatsappNumber = '5492995769999';
    const conversationSummary = messages.slice(-3).map(m => `${m.role === 'user' ? 'Cliente' : 'Bot'}: ${m.content}`).join('\n');
    const message = encodeURIComponent(`Hola, necesito asistencia.\n\nResumen de conversacion:\n${conversationSummary}`);
    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');
  };

  const handleHumanAssistance = () => {
    setMessages(prev => [...prev, {
      role: 'assistant',
      content: 'Perfecto! Voy a conectarte con un asesor humano.\n\nPrimero, cuentame:\nHay algun producto en particular que te interese o tenes alguna consulta especifica?',
      timestamp: new Date(),
      needsHumanAssistance: true
    }]);
  };

  const handleContactClick = () => {
    const whatsappNumber = '5492995769999';
    const message = encodeURIComponent('Hola, estaba chateando con el bot y me gustaria mas informacion.');
    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#2d5016] to-[#4a7c25] text-white shadow-lg">
        <div className="max-w-3xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/" className="p-2 hover:bg-white/10 rounded-lg transition-colors" aria-label="Volver al sitio">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h1 className="font-bold text-lg leading-tight">Alumine Bot</h1>
                <p className="text-xs text-white/70">Asistente virtual de Alumine Hogar</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleWhatsAppClick}
                className="flex items-center gap-1.5 bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg transition-colors text-sm font-medium"
              >
                <MessageCircle className="w-4 h-4" />
                <span className="hidden sm:inline">WhatsApp</span>
              </button>
              <button
                onClick={handleHumanAssistance}
                className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-lg transition-colors text-sm font-medium"
              >
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">Asesor</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
          {messages.map((msg, index) => (
            <div key={index}>
              <div className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] sm:max-w-[70%] rounded-2xl px-4 py-3 ${
                  msg.role === 'user'
                    ? 'bg-[#4a7c25] text-white'
                    : msg.isError
                    ? 'bg-red-50 text-red-700 border border-red-200'
                    : 'bg-white text-gray-800 shadow-sm border border-gray-200'
                }`}>
                  <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                  <span className="text-xs opacity-50 mt-1 block">
                    {msg.timestamp instanceof Date
                      ? msg.timestamp.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
                      : ''}
                  </span>
                </div>
              </div>

              {/* Products */}
              {msg.products && msg.products.length > 0 && (
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-[85%] sm:max-w-[70%]">
                  {msg.products.map((producto, idx) => (
                    <div
                      key={idx}
                      className="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md hover:border-[#4a7c25]/30 transition-all cursor-pointer"
                      onClick={() => handleProductClick(producto)}
                    >
                      <h4 className="font-semibold text-sm text-gray-800">{producto.nombre}</h4>
                      <p className="text-xs text-gray-500 mt-0.5">{producto.categoria}</p>
                      <p className="text-[#2d5016] font-bold mt-1 text-sm">
                        ${producto.precio?.toLocaleString('es-AR')} ARS
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Contact button */}
              {msg.showContactForm && (
                <div className="mt-3 max-w-[85%] sm:max-w-[70%]">
                  <button
                    onClick={handleContactClick}
                    className="w-full bg-green-500 hover:bg-green-600 text-white py-2.5 px-4 rounded-lg transition-colors text-sm font-medium"
                  >
                    Contactar por WhatsApp
                  </button>
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white rounded-2xl px-4 py-3 shadow-sm border border-gray-200">
                <Loader2 className="w-5 h-5 text-[#4a7c25] animate-spin" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="border-t bg-white">
        <form onSubmit={handleSendMessage} className="max-w-3xl mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            <input
              ref={inputRef}
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Escribe tu mensaje..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#4a7c25] focus:border-transparent text-sm"
              disabled={isLoading}
              autoFocus
            />
            <button
              type="submit"
              disabled={isLoading || !inputMessage.trim()}
              className="bg-[#4a7c25] text-white p-3 rounded-full hover:bg-[#2d5016] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
              aria-label="Enviar mensaje"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          <p className="text-center text-xs text-gray-400 mt-2">
            Alumine Hogar - Calidad para tu hogar, precios para vos
          </p>
        </form>
      </div>
    </div>
  );
}
