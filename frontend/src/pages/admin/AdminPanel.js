import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getChannels, deleteChannel, getChannelLists, deleteChannelList, deleteAllManualChannels } from '../../services/api';

const AdminPanel = () => {
  const [channels, setChannels] = useState([]);
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('lists');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [ch, ls] = await Promise.all([getChannels({}), getChannelLists()]);
      setChannels(ch);
      setLists(ls);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteList = async (listId, listName) => {
    if (window.confirm(`¿Eliminar toda la lista "${listName}"? Esto borrará todos sus canales.`)) {
      try {
        await deleteChannelList(listId);
        setLists(lists.filter(l => l.list_id !== listId));
        setChannels(channels.filter(c => c.list_id !== listId));
      } catch (error) {
        alert('Error al eliminar lista');
      }
    }
  };

  const handleDeleteChannel = async (id, name) => {
    if (window.confirm(`¿Eliminar "${name}"?`)) {
      try {
        await deleteChannel(id);
        setChannels(channels.filter(c => c.id !== id));
      } catch (error) {
        alert('Error al eliminar');
      }
    }
  };

  if (loading) return <div className="p-8 text-white">Cargando...</div>;

  const manualChannels = channels.filter(c => !c.list_id);

  return (
    <div className="p-8 text-white">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Panel de Administración</h1>
        <div className="flex gap-3">
          <Link to="/admin/import-m3u" className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded font-medium">
            📋 Importar M3U
          </Link>
          <Link to="/admin/add-channel" className="bg-stream-blue hover:bg-blue-700 px-4 py-2 rounded font-medium">
            + Agregar Canal
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button onClick={() => setActiveTab('lists')} className={`px-4 py-2 rounded font-medium ${activeTab === 'lists' ? 'bg-stream-blue' : 'bg-gray-700 hover:bg-gray-600'}`}>
          📊 Listas ({lists.length})
        </button>
        <button onClick={() => setActiveTab('channels')} className={`px-4 py-2 rounded font-medium ${activeTab === 'channels' ? 'bg-stream-blue' : 'bg-gray-700 hover:bg-gray-600'}`}>
          📺 Canales manuales ({manualChannels.length})
        </button>
      </div>

      {/* Listas importadas */}
      {activeTab === 'lists' && (
        <div className="space-y-3">
          {lists.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p className="text-lg mb-4">No hay listas importadas</p>
              <Link to="/admin/import-m3u" className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded">
                Importar primera lista M3U
              </Link>
            </div>
          ) : (
            lists.map(list => (
              <div key={list.list_id} className="bg-gray-800 rounded-lg p-4 flex items-center justify-between">
                <div>
                  <p className="font-semibold">{list.list_name}</p>
                  <p className="text-sm text-gray-400">{list.count} canales • ID: {list.list_id}</p>
                </div>
                <button
                  onClick={() => handleDeleteList(list.list_id, list.list_name)}
                  className="bg-stream-blue hover:bg-blue-700 px-4 py-2 rounded text-sm font-medium"
                >
                  🗑️ Borrar lista completa
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* Canales manuales */}
      {activeTab === 'channels' && (
        <div className="bg-gray-800 rounded-lg overflow-hidden">
          <div className="p-4 bg-gray-700 flex justify-between items-center">
            <h2 className="font-semibold">Canales agregados manualmente ({manualChannels.length})</h2>
            {manualChannels.length > 0 && (
              <button
                onClick={async () => {
                  if (window.confirm(`¿Eliminar TODOS los ${manualChannels.length} canales? Esta acción no se puede deshacer.`)) {
                    try {
                      await deleteAllManualChannels();
                      setChannels(channels.filter(c => c.list_id));
                    } catch (e) {
                      alert('Error al eliminar');
                    }
                  }
                }}
                className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-sm font-medium"
              >
                🗑️ Borrar todos
              </button>
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="p-3 text-left">Canal</th>
                  <th className="p-3 text-left">Categoría</th>
                  <th className="p-3 text-left">País</th>
                  <th className="p-3 text-left">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {manualChannels.map(channel => (
                  <tr key={channel.id} className="border-t border-gray-700">
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        {channel.logo ? (
                          <img src={channel.logo} alt={channel.name} className="w-10 h-10 object-contain bg-white rounded p-1" onError={(e) => e.target.style.display = 'none'} />
                        ) : (
                          <div className="w-10 h-10 bg-gray-600 rounded flex items-center justify-center">📺</div>
                        )}
                        <span className="font-medium">{channel.name}</span>
                      </div>
                    </td>
                    <td className="p-3"><span className="bg-stream-blue px-2 py-1 rounded text-xs">{channel.category}</span></td>
                    <td className="p-3 text-gray-400">{channel.country}</td>
                    <td className="p-3">
                      <button onClick={() => handleDeleteChannel(channel.id, channel.name)} className="bg-stream-blue hover:bg-blue-700 px-3 py-1 rounded text-xs">
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
