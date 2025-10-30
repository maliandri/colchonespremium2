import { Mail, Phone, MapPin } from 'lucide-react';

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="gradient-primary text-white mt-auto">
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Información de la empresa */}
          <div>
            <h3 className="text-white text-xl font-semibold mb-4">Aluminé Hogar</h3>
            <p className="text-purple-100 mb-4">
              Tu mejor descanso comienza aquí. Ofrecemos los mejores colchones y almohadas de Neuquén.
            </p>
            <img
              src="https://res.cloudinary.com/dlshym1te/image/upload/f_auto,q_auto/Alumine%CC%81_Hogar-logo"
              alt="Aluminé Hogar"
              className="h-12 w-auto opacity-80"
              onError={(e) => {
                e.target.src = '/assets/logo.png';
              }}
            />
          </div>

          {/* Enlaces rápidos */}
          <div>
            <h3 className="text-white text-xl font-semibold mb-4">Enlaces Rápidos</h3>
            <ul className="space-y-2">
              <li>
                <a href="#inicio" className="hover:text-primary transition-colors">
                  Inicio
                </a>
              </li>
              <li>
                <a href="#productos" className="hover:text-primary transition-colors">
                  Productos
                </a>
              </li>
              <li>
                <a href="#contacto" className="hover:text-primary transition-colors">
                  Contacto
                </a>
              </li>
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h3 className="text-white text-xl font-semibold mb-4">Contacto</h3>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                <span>Neuquén, Argentina</span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-primary flex-shrink-0" />
                <a href="tel:+542995123456" className="hover:text-primary transition-colors">
                  +54 299 512 3456
                </a>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-primary flex-shrink-0" />
                <a
                  href="mailto:info@colchonespremium.com"
                  className="hover:text-primary transition-colors"
                >
                  info@colchonespremium.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-500">
          <p>&copy; {currentYear} Colchones Premium. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
};
