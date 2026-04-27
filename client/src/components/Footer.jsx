import { MapPin, Phone, Mail, Instagram, Facebook } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-[#0a0f0d] border-t border-[#1e3028] mt-16 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/courts" className="flex items-center gap-2 font-bold text-tennis-400 text-xl mb-4">
              <span className="text-2xl">🎾</span>
              <span className="text-[#e8f5ee]">TennisCourts</span>
            </Link>
            <p className="text-muted text-sm leading-relaxed mb-6">
              Najnowocześniejszy kompleks tenisowy w Warszawie. Profesjonalne korty, oświetlenie LED i pasja do sportu.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-muted hover:text-tennis-400 transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-muted hover:text-tennis-400 transition-colors">
                <Instagram size={20} />
              </a>
            </div>
          </div>

          {/* Contact */}
          <div className="md:col-span-1">
            <h3 className="text-[#e8f5ee] font-semibold tracking-wider uppercase text-sm mb-4">Kontakt</h3>
            <ul className="space-y-3">
              <li className="flex items-start text-sm text-muted">
                <MapPin size={16} className="mr-2 mt-0.5 text-tennis-500 shrink-0" />
                <span>ul. Piaseczyńska 71<br />02-073 Warszawa</span>
              </li>
              <li className="flex items-center text-sm text-muted">
                <Phone size={16} className="mr-2 text-tennis-500 shrink-0" />
                <span>+48 22 123 45 67</span>
              </li>
              <li className="flex items-center text-sm text-muted">
                <Mail size={16} className="mr-2 text-tennis-500 shrink-0" />
                <span>recepcja@tenniscourts.pl</span>
              </li>
            </ul>
          </div>

          {/* Godziny otwarcia */}
          <div className="md:col-span-1">
            <h3 className="text-[#e8f5ee] font-semibold tracking-wider uppercase text-sm mb-4">Godziny otwarcia</h3>
            <ul className="space-y-2 text-sm text-muted">
              <li className="flex justify-between">
                <span>Pon - Ptk</span>
                <span className="text-[#e8f5ee]">07:00 - 22:00</span>
              </li>
              <li className="flex justify-between">
                <span>Sobota</span>
                <span className="text-[#e8f5ee]">08:00 - 20:00</span>
              </li>
              <li className="flex justify-between">
                <span>Niedziela</span>
                <span className="text-[#e8f5ee]">08:00 - 18:00</span>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-1">
            <h3 className="text-[#e8f5ee] font-semibold tracking-wider uppercase text-sm mb-4">Na skróty</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/courts" className="text-muted hover:text-tennis-400 transition-colors">Rezerwacja kortów</Link></li>
              <li><Link to="/login" className="text-muted hover:text-tennis-400 transition-colors">Zaloguj się</Link></li>
              <li><a href="#" className="text-muted hover:text-tennis-400 transition-colors">Regulamin obiektu</a></li>
              <li><a href="#" className="text-muted hover:text-tennis-400 transition-colors">Polityka prywatności</a></li>
            </ul>
          </div>

        </div>
        
        <div className="border-t border-[#1e3028] mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-muted text-xs">
            &copy; {new Date().getFullYear()} TennisCourts. Wszelkie prawa zastrzeżone.
          </p>
          <p className="text-muted text-xs">
            Projekt edukacyjny.
          </p>
        </div>
      </div>
    </footer>
  );
}
