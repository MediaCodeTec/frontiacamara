import { useState, useEffect } from 'react';
import { FaBed, FaChair, FaRunning, FaExclamationTriangle, FaCheckCircle } from 'react-icons/fa';
import { Postura, PosturaData, PosturaConfig } from './types';

function App() {
  const [postura, setPostura] = useState<Postura>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  // Configuración para cada tipo de postura
  const posturaConfig: Record<Exclude<Postura, null>, PosturaConfig> = {
    parado: {
      color: 'from-blue-500 to-blue-600',
      icon: <FaRunning className="text-5xl" />,
      texto: 'De pie',
      descripcion: 'Postura erguida detectada'
    },
    sentado: {
      color: 'from-emerald-500 to-emerald-600',
      icon: <FaChair className="text-5xl" />,
      texto: 'Sentado',
      descripcion: 'Postura sentada detectada'
    },
    echado: {
      color: 'from-amber-500 to-amber-600',
      icon: <FaBed className="text-5xl" />,
      texto: 'Echado',
      descripcion: 'Postura reclinada detectada'
    },
    caido_suelo: {
      color: 'from-rose-500 to-rose-600',
      icon: <FaExclamationTriangle className="text-5xl" />,
      texto: 'Caído',
      descripcion: '¡Posible caída detectada!'
    }
  };

  // Función optimizada para llamar a la API
  const fetchPostura = async (): Promise<PosturaData> => {
    try {
      const response = await fetch('http://localhost:3000/api/postura', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        // Agrega esta opción para evitar caché indeseado
        cache: 'no-store'
      });

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const data: PosturaData = await response.json();
      
      if (!data.postura || !(data.postura in posturaConfig)) {
        throw new Error('Datos de postura inválidos');
      }

      return data;
    } catch (err) {
      console.error('Error en fetchPostura:', err);
      throw new Error('No se pudo obtener la postura');
    }
  };

  useEffect(() => {
    let isMounted = true;

    const updatePostura = async () => {
      try {
        // No mostramos el estado de carga para evitar parpadeo
        const data = await fetchPostura();
        if (isMounted) {
          setPostura(data.postura);
          setError(null);
          setLastUpdated(new Date().toLocaleTimeString());
        }
      } catch (err:any) {
        if (isMounted) {
          setError(err.message);
        }
      }
    };

    const interval = setInterval(updatePostura, 5000);
    updatePostura(); // Llamada inicial

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-6">
        {/* Header */}
        <header className="text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Monitor de Postura</h1>
          <p className="text-gray-600">Sistema de monitoreo en tiempo real</p>
        </header>

        {/* Tarjeta de estado principal - Siempre visible */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-500">
          {error ? (
            <div className="p-6 bg-rose-100 border-l-4 border-rose-500 text-rose-700">
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
              <div className="p-8 flex flex-col items-center text-center space-y-4">
                <div className="bg-white/20 p-5 rounded-full backdrop-blur-sm">
                  {posturaConfig[postura].icon}
                </div>
                <h2 className="text-3xl font-bold">{posturaConfig[postura].texto}</h2>
                <p className="text-white/90">{posturaConfig[postura].descripcion}</p>
                
                <div className="mt-4 bg-white/10 px-4 py-2 rounded-full flex items-center space-x-2">
                  <FaCheckCircle className="text-white/80" />
                  <span className="text-sm">Actualizado: {lastUpdated}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 bg-gray-100 rounded-lg text-center">
              <p className="text-gray-700">
                {loading ? 'Cargando configuración inicial...' : 'No hay datos de postura disponibles'}
              </p>
            </div>
          )}
        </div>

        {/* Resto del componente permanece igual */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="font-semibold text-lg text-gray-800 mb-4">Leyenda de estados</h3>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(posturaConfig).map(([key, config]) => (
              <div key={key} className={`p-4 rounded-lg bg-gradient-to-br ${config.color} text-white`}>
                <div className="flex items-center space-x-3">
                  <div className="bg-white/20 p-2 rounded-full">
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

        <footer className="text-center text-sm text-gray-500 pt-4">
          <p>Sistema actualizado automáticamente cada 5 segundos</p>
          <p className="mt-1">© {new Date().getFullYear()} Monitor de Postura</p>
        </footer>
      </div>
    </div>
  );
}

export default App;