import { useState, useEffect } from 'react';
import io, { Socket } from 'socket.io-client';
import {
  FaBed,
  FaChair,
  FaRunning,
  FaExclamationTriangle,
  FaCheckCircle
} from 'react-icons/fa';
import { Postura, PosturaData, PosturaConfig } from './types';

function App() {
  const [postura, setPostura] = useState<Postura>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  const posturaConfig: Record<Exclude<Postura, null>, PosturaConfig> = {
    parado: {
      color: 'from-blue-500 to-blue-600',
      icon: <FaRunning className="text-5xl" />,
      texto: 'De pie',
      descripcion: 'Postura erguida detectada',
    },
    sentado: {
      color: 'from-emerald-500 to-emerald-600',
      icon: <FaChair className="text-5xl" />,
      texto: 'Sentado',
      descripcion: 'Postura sentada detectada',
    },
    echado: {
      color: 'from-amber-500 to-amber-600',
      icon: <FaBed className="text-5xl" />,
      texto: 'Echado',
      descripcion: 'Postura reclinada detectada',
    },
    caido_suelo: {
      color: 'from-rose-500 to-rose-600',
      icon: <FaExclamationTriangle className="text-5xl" />,
      texto: 'Caído',
      descripcion: '¡Posible caída detectada!',
    },
  };


  useEffect(() => {
    const socket: Socket = io('https://backiacamara-production.up.railway.app', {
      transports: ['websocket'],
    });

    socket.on('connect', () => {
      console.log('✅ Conectado a Socket.IO');
      setError(null);
    });

    socket.on('nueva_postura', (data: PosturaData) => {
      console.log('📡 Postura recibida:', data);
      if (data.postura && data.postura in posturaConfig) {
        setPostura(data.postura);
        setLastUpdated(new Date().toLocaleTimeString());
      } else {
        setError('Postura inválida recibida');
      }
    });

    socket.on('disconnect', () => {
      console.warn('⚠️ Desconectado');
      setError('Conexión perdida con el servidor');
    });

    socket.on('connect_error', (err) => {
      console.error('❌ Error de conexión:', err);
      setError('No se pudo conectar al servidor');
    });

    return () => {
      socket.disconnect();
    };
  }, []);


  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
      <div className="w-full max-w-2xl space-y-6">
        <header className="text-center">
          <h1 className="mb-2 text-4xl font-bold text-gray-800">Monitor de Postura</h1>
          <p className="text-gray-600">Sistema de monitoreo en tiempo real</p>
        </header>

        <div className="overflow-hidden transition-all duration-500 bg-white shadow-lg rounded-xl">
          {error ? (
            <div className="p-6 border-l-4 bg-rose-100 border-rose-500 text-rose-700">
              <div className="flex items-center space-x-3">
                <FaExclamationTriangle className="text-2xl" />
                <div>
                  <p className="font-bold">Error de conexión</p>
                  <p>{error}</p>
                </div>
              </div>
            </div>
          ) : postura ? (
            <div className={`bg-gradient-to-br ${posturaConfig[postura].color} text-white`}>
              <div className="flex flex-col items-center p-8 space-y-4 text-center">
                <div className="p-5 rounded-full bg-white/20 backdrop-blur-sm">
                  {posturaConfig[postura].icon}
                </div>
                <h2 className="text-3xl font-bold">{posturaConfig[postura].texto}</h2>
                <p className="text-white/90">{posturaConfig[postura].descripcion}</p>
                <div className="flex items-center px-4 py-2 mt-4 space-x-2 rounded-full bg-white/10">
                  <FaCheckCircle className="text-white/80" />
                  <span className="text-sm">Actualizado: {lastUpdated}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center bg-gray-100 rounded-lg">
              <p className="text-gray-700">Esperando datos de postura...</p>
            </div>
          )}
        </div>

        <div className="p-6 bg-white shadow-lg rounded-xl">
          <h3 className="mb-4 text-lg font-semibold text-gray-800">Leyenda de estados</h3>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(posturaConfig).map(([key, config]) => (
              <div key={key} className={`p-4 rounded-lg bg-gradient-to-br ${config.color} text-white`}>
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-full bg-white/20">
                    {config.icon}
                  </div>
                  <div>
                    <p className="font-bold">{config.texto}</p>
                    <p className="text-sm text-white/90">{config.descripcion}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <footer className="pt-4 text-sm text-center text-gray-500">
          <p>Sistema actualizado automáticamente en tiempo real</p>
          <p className="mt-1">© {new Date().getFullYear()} Monitor de Postura</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
