
import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  Folder, 
  Plus, 
  ChevronRight, 
  Trash2, 
  Upload, 
  LogIn, 
  LogOut, 
  Search, 
  Filter, 
  MessageCircle, 
  MapPin, 
  Phone, 
  ChevronLeft,
  X,
  PlayCircle,
  Image as ImageIcon,
  ArrowRightLeft,
  CreditCard,
  CheckCircle2
} from 'lucide-react';

// --- Types ---

interface MediaItem {
  id: string;
  type: 'image' | 'video';
  url: string; // Base64 for this demo
  name: string;
}

interface FolderType {
  id: string;
  name: string;
  parentId: string | null;
  childrenIds: string[];
  mediaIds: string[];
}

interface Motorcycle {
  id: string;
  title: string;
  price: number;
  description: string;
  category: 'Scooter' | 'Esportiva' | 'Naked' | 'Trail' | 'Custom' | 'Outras';
  condition: 'Nova' | 'Semi-Nova';
  brand: string;
  mainImage: string;
  mediaIds: string[];
}

// --- Constants ---
const ADMIN_CREDENTIALS = { user: 'DanMF', pass: 'Dan2506' };
const WHATSAPP_NUMBER = '+553182394144';
const DANIEL_NAME = 'Daniel';
const ADDRESS = 'Av. Presidente Antônio Carlos, 1880';

// --- Mock Initial Data ---
const INITIAL_FOLDERS: Record<string, FolderType> = {
  'root': { id: 'root', name: 'Motos', parentId: null, childrenIds: ['folder-1', 'folder-2'], mediaIds: [] },
  'folder-1': { id: 'folder-1', name: 'Fotos e Vídeos Motos', parentId: 'root', childrenIds: ['folder-1-1'], mediaIds: [] },
  'folder-1-1': { id: 'folder-1-1', name: 'Motos Semi-Novas', parentId: 'folder-1', childrenIds: ['folder-sahara'], mediaIds: [] },
  'folder-sahara': { id: 'folder-sahara', name: 'Sahara 300 Adventure', parentId: 'folder-1-1', childrenIds: [], mediaIds: [] },
  'folder-2': { id: 'folder-2', name: 'Propagandas', parentId: 'root', childrenIds: [], mediaIds: [] },
};

const CATEGORIES = ['Scooter', 'Esportiva', 'Naked', 'Trail', 'Custom', 'Outras'];

const App: React.FC = () => {
  // --- State ---
  const [isAdmin, setIsAdmin] = useState(false);
  const [view, setView] = useState<'client' | 'login' | 'admin'>('client');
  const [loginForm, setLoginForm] = useState({ user: '', pass: '' });
  
  // Data State
  const [folders, setFolders] = useState<Record<string, FolderType>>(INITIAL_FOLDERS);
  const [media, setMedia] = useState<Record<string, MediaItem>>({});
  const [motos, setMotos] = useState<Motorcycle[]>([]);
  
  // Admin Navigation
  const [currentFolderId, setCurrentFolderId] = useState('root');
  
  // Client Filters
  const [categoryFilter, setCategoryFilter] = useState<string>('Tudo');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [searchTerm, setSearchTerm] = useState('');

  // UI State
  const [selectedMoto, setSelectedMoto] = useState<Motorcycle | null>(null);

  // --- Persistence ---
  useEffect(() => {
    const savedMotos = localStorage.getItem('moto_forca_motos');
    const savedFolders = localStorage.getItem('moto_forca_folders');
    const savedMedia = localStorage.getItem('moto_forca_media');
    if (savedMotos) setMotos(JSON.parse(savedMotos));
    if (savedFolders) setFolders(JSON.parse(savedFolders));
    if (savedMedia) setMedia(JSON.parse(savedMedia));
  }, []);

  useEffect(() => {
    localStorage.setItem('moto_forca_motos', JSON.stringify(motos));
    localStorage.setItem('moto_forca_folders', JSON.stringify(folders));
    localStorage.setItem('moto_forca_media', JSON.stringify(media));
  }, [motos, folders, media]);

  // --- Helpers ---
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginForm.user === ADMIN_CREDENTIALS.user && loginForm.pass === ADMIN_CREDENTIALS.pass) {
      setIsAdmin(true);
      setView('admin');
    } else {
      alert('Usuário ou senha incorretos');
    }
  };

  const createFolder = () => {
    const name = prompt('Nome da nova pasta:');
    if (!name) return;
    const id = `folder-${Date.now()}`;
    const newFolder: FolderType = {
      id,
      name,
      parentId: currentFolderId,
      childrenIds: [],
      mediaIds: []
    };
    
    setFolders(prev => ({
      ...prev,
      [id]: newFolder,
      [currentFolderId]: {
        ...prev[currentFolderId],
        childrenIds: [...prev[currentFolderId].childrenIds, id]
      }
    }));
  };

  const deleteFolder = (id: string) => {
    if (id === 'root') return;
    if (!confirm('Tem certeza que deseja excluir esta pasta e tudo dentro dela?')) return;
    
    setFolders(prev => {
      const next = { ...prev };
      const parentId = next[id].parentId;
      if (parentId) {
        next[parentId] = {
          ...next[parentId],
          childrenIds: next[parentId].childrenIds.filter(cid => cid !== id)
        };
      }
      delete next[id];
      return next;
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    // Fix: Explicitly type the 'file' parameter to avoid 'unknown' type errors which caused multiple build issues.
    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const id = `media-${Date.now()}-${Math.random()}`;
        const newMedia: MediaItem = {
          id,
          type: file.type.startsWith('video') ? 'video' : 'image',
          url: event.target?.result as string,
          name: file.name
        };

        setMedia(prev => ({ ...prev, [id]: newMedia }));
        setFolders(prev => ({
          ...prev,
          [currentFolderId]: {
            ...prev[currentFolderId],
            mediaIds: [...prev[currentFolderId].mediaIds, id]
          }
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const addMotorcycle = () => {
    const title = prompt('Título da Moto:');
    if (!title) return;
    const price = Number(prompt('Preço (Apenas números):'));
    const category = prompt('Categoria (Scooter, Esportiva, Naked, Trail, Custom, Outras):') as any;
    
    // Auto-pick first image from current folder as main image
    const currentMedia = folders[currentFolderId].mediaIds;
    const mainImgId = currentMedia.find(mId => media[mId].type === 'image');

    const newMoto: Motorcycle = {
      id: `moto-${Date.now()}`,
      title,
      price,
      description: 'Moto em excelente estado, revisada e com garantia Moto Força.',
      category: CATEGORIES.includes(category) ? category : 'Outras',
      condition: 'Semi-Nova',
      brand: 'Honda/Yamaha',
      mainImage: mainImgId ? media[mainImgId].url : 'https://images.unsplash.com/photo-1558981403-c5f91cbba527?q=80&w=1000&auto=format&fit=crop',
      mediaIds: currentMedia
    };

    setMotos(prev => [...prev, newMoto]);
    alert('Moto adicionada ao estoque!');
  };

  const deleteMoto = (id: string) => {
    if (confirm('Excluir esta moto do estoque?')) {
      setMotos(prev => prev.filter(m => m.id !== id));
    }
  };

  const openWhatsApp = (motoTitle: string) => {
    const text = `Olá Daniel, vi a ${motoTitle} no site e gostaria de consultar condições.`;
    const url = `https://wa.me/${WHATSAPP_NUMBER.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  // --- Sub-Components ---

  const Breadcrumbs = () => {
    const path = [];
    let curr = currentFolderId;
    while (curr) {
      path.unshift(folders[curr]);
      curr = folders[curr]?.parentId || '';
    }

    return (
      <div className="flex items-center space-x-2 text-sm text-gray-400 mb-6 overflow-x-auto whitespace-nowrap pb-2">
        {path.map((f, i) => (
          <React.Fragment key={f.id}>
            <button 
              onClick={() => setCurrentFolderId(f.id)}
              className={`hover:text-red-500 transition-colors ${i === path.length - 1 ? 'text-white font-bold underline' : ''}`}
            >
              {f.name}
            </button>
            {i < path.length - 1 && <ChevronRight size={14} />}
          </React.Fragment>
        ))}
      </div>
    );
  };

  const ClientHeader = () => (
    <header className="bg-black border-b border-red-900 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => {setView('client'); setSelectedMoto(null);}}>
          <div className="bg-red-600 p-2 rounded-lg skew-x-[-12deg]">
            <span className="text-white font-black text-xl italic leading-none">MF</span>
          </div>
          <div>
            <h1 className="text-white font-bold text-xl tracking-tight uppercase">Moto Força</h1>
            <p className="text-red-500 text-[10px] font-bold uppercase tracking-[0.2em]">Multi Marcas</p>
          </div>
        </div>

        <nav className="flex items-center space-x-6 text-sm font-semibold uppercase tracking-wider text-gray-300">
          <button onClick={() => setView('client')} className="hover:text-red-500 transition-colors">Estoque</button>
          <button className="hover:text-red-500 transition-colors hidden md:block">Financiamento</button>
          <button className="hover:text-red-500 transition-colors hidden md:block">Sobre Nós</button>
          {isAdmin ? (
            <button onClick={() => setView('admin')} className="bg-red-600 text-white px-4 py-1.5 rounded flex items-center gap-2 hover:bg-red-700 transition-colors">
              <LogIn size={16} /> Painel ADM
            </button>
          ) : (
            <button onClick={() => setView('login')} className="hover:text-red-500 transition-colors">Admin</button>
          )}
        </nav>
      </div>
    </header>
  );

  // --- Main Views ---

  const LoginView = () => (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="bg-zinc-900 p-8 rounded-2xl border border-zinc-800 w-full max-w-md shadow-2xl">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">Acesso Restrito</h2>
          <p className="text-gray-400">Olá Daniel, entre com suas credenciais.</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Usuário</label>
            <input 
              type="text" 
              className="w-full bg-zinc-800 border border-zinc-700 text-white p-3 rounded-lg focus:ring-2 focus:ring-red-600 outline-none"
              value={loginForm.user}
              onChange={e => setLoginForm({...loginForm, user: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Senha</label>
            <input 
              type="password" 
              className="w-full bg-zinc-800 border border-zinc-700 text-white p-3 rounded-lg focus:ring-2 focus:ring-red-600 outline-none"
              value={loginForm.pass}
              onChange={e => setLoginForm({...loginForm, pass: e.target.value})}
            />
          </div>
          <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-bold p-3 rounded-lg transition-all transform hover:scale-[1.02]">
            Entrar
          </button>
          <button type="button" onClick={() => setView('client')} className="w-full text-gray-500 text-sm hover:text-white mt-4">
            Voltar para o site
          </button>
        </form>
      </div>
    </div>
  );

  const AdminView = () => {
    const currentFolder = folders[currentFolderId];
    
    return (
      <div className="min-h-screen bg-black text-white">
        <header className="bg-zinc-900 border-b border-zinc-800 p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold">Painel de Controle</h2>
            <div className="h-6 w-px bg-zinc-700" />
            <button onClick={() => setView('client')} className="text-sm text-gray-400 hover:text-white flex items-center gap-1">
              <ArrowRightLeft size={16} /> Ver Site
            </button>
          </div>
          <button onClick={() => setIsAdmin(false) || setView('client')} className="text-red-500 hover:text-red-400 flex items-center gap-2">
            <LogOut size={18} /> Sair
          </button>
        </header>

        <main className="max-w-7xl mx-auto p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <Breadcrumbs />
            <div className="flex gap-2">
              <button 
                onClick={createFolder}
                className="bg-zinc-800 hover:bg-zinc-700 px-4 py-2 rounded-lg flex items-center gap-2 text-sm transition-colors border border-zinc-700"
              >
                <Plus size={18} /> Nova Pasta
              </button>
              <label className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg flex items-center gap-2 text-sm transition-colors cursor-pointer font-bold">
                <Upload size={18} /> Enviar Arquivos
                <input type="file" multiple className="hidden" onChange={handleFileUpload} accept="image/*,video/*" />
              </label>
              <button 
                onClick={addMotorcycle}
                className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg flex items-center gap-2 text-sm transition-colors font-bold"
              >
                <CheckCircle2 size={18} /> Anunciar Moto
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {/* Folders */}
            {currentFolder.childrenIds.map(childId => (
              <div key={childId} className="group relative">
                <div 
                  onClick={() => setCurrentFolderId(childId)}
                  className="bg-zinc-900 hover:bg-zinc-800 p-4 rounded-xl border border-zinc-800 flex flex-col items-center cursor-pointer transition-all hover:border-red-500/50"
                >
                  <Folder size={48} className="text-red-500 mb-2 group-hover:scale-110 transition-transform" fill="currentColor" fillOpacity={0.2} />
                  <span className="text-sm font-medium truncate w-full text-center">{folders[childId].name}</span>
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); deleteFolder(childId); }}
                  className="absolute -top-2 -right-2 bg-red-600 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}

            {/* Media */}
            {currentFolder.mediaIds.map(mId => {
              const item = media[mId];
              return (
                <div key={mId} className="group relative">
                  <div className="bg-zinc-900 p-2 rounded-xl border border-zinc-800 aspect-square overflow-hidden">
                    {item.type === 'image' ? (
                      <img src={item.url} className="w-full h-full object-cover rounded-lg" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-black relative">
                        <PlayCircle size={32} className="text-white opacity-50" />
                        <span className="absolute bottom-2 left-2 text-[10px] bg-red-600 px-1 rounded">VÍDEO</span>
                      </div>
                    )}
                  </div>
                  <button 
                    onClick={() => {
                      setFolders(prev => ({
                        ...prev,
                        [currentFolderId]: {
                          ...prev[currentFolderId],
                          mediaIds: prev[currentFolderId].mediaIds.filter(id => id !== mId)
                        }
                      }));
                    }}
                    className="absolute -top-2 -right-2 bg-zinc-800 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Current Stock Managed by Dan */}
          <section className="mt-16">
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <div className="w-1 h-8 bg-red-600 rounded-full" />
              Estoque Ativo
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {motos.map(moto => (
                <div key={moto.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden flex shadow-lg">
                  <img src={moto.mainImage} className="w-32 h-32 object-cover" />
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-bold">{moto.title}</h4>
                      <p className="text-green-500 font-bold">R$ {moto.price.toLocaleString('pt-BR')}</p>
                    </div>
                    <button 
                      onClick={() => deleteMoto(moto.id)}
                      className="text-red-500 hover:text-red-400 text-xs flex items-center gap-1 uppercase font-bold"
                    >
                      <Trash2 size={14} /> Remover do Site
                    </button>
                  </div>
                </div>
              ))}
              {motos.length === 0 && (
                <div className="col-span-full py-12 text-center text-gray-500 border-2 border-dashed border-zinc-800 rounded-2xl">
                  Nenhuma moto cadastrada. Use o botão "Anunciar Moto" após criar pastas e enviar fotos.
                </div>
              )}
            </div>
          </section>
        </main>
      </div>
    );
  };

  const ClientView = () => {
    const filteredMotos = motos
      .filter(m => categoryFilter === 'Tudo' || m.category === categoryFilter)
      .filter(m => m.title.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) => sortOrder === 'asc' ? a.price - b.price : b.price - a.price);

    return (
      <div className="min-h-screen bg-black text-white selection:bg-red-600/30">
        <ClientHeader />
        
        {/* Hero Section */}
        <div className="relative h-[60vh] overflow-hidden">
          <img 
            src="https://images.unsplash.com/photo-1599819811279-d5ad9cccf838?q=80&w=2000&auto=format&fit=crop" 
            className="w-full h-full object-cover opacity-60"
            alt="Moto Força Hero"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
            <h2 className="text-4xl md:text-7xl font-black italic uppercase tracking-tighter mb-4 leading-none">
              Acelere sua <span className="text-red-600">Liberdade</span>
            </h2>
            <div className="flex flex-wrap justify-center gap-4 text-xs md:text-sm font-bold uppercase tracking-widest text-gray-300">
              <span className="flex items-center gap-2"><ArrowRightLeft size={16} className="text-red-600" /> Compra & Troca</span>
              <span className="flex items-center gap-2"><CreditCard size={16} className="text-red-600" /> Financia 48x</span>
              <span className="flex items-center gap-2"><CreditCard size={16} className="text-red-600" /> Cartão até 24x</span>
            </div>
            <button 
              onClick={() => document.getElementById('estoque')?.scrollIntoView({ behavior: 'smooth' })}
              className="mt-8 bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-full font-black uppercase tracking-widest flex items-center gap-3 transition-all transform hover:scale-105"
            >
              Ver Estoque <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Filters & Stock */}
        <main id="estoque" className="max-w-7xl mx-auto px-4 py-16">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Filters */}
            <aside className="w-full lg:w-64 space-y-8">
              <div>
                <h3 className="text-sm font-black uppercase tracking-widest text-red-600 mb-4">Filtrar Categoria</h3>
                <div className="flex flex-wrap lg:flex-col gap-2">
                  {['Tudo', ...CATEGORIES].map(cat => (
                    <button
                      key={cat}
                      onClick={() => setCategoryFilter(cat)}
                      className={`px-4 py-2 rounded-lg text-left text-sm font-bold transition-all ${categoryFilter === cat ? 'bg-red-600 text-white shadow-lg' : 'bg-zinc-900 text-gray-400 hover:bg-zinc-800'}`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-black uppercase tracking-widest text-red-600 mb-4">Ordenar Preço</h3>
                <select 
                  className="w-full bg-zinc-900 border border-zinc-800 p-3 rounded-lg text-sm outline-none"
                  value={sortOrder}
                  onChange={e => setSortOrder(e.target.value as any)}
                >
                  <option value="asc">Mais Baratas Primeiro</option>
                  <option value="desc">Mais Caras Primeiro</option>
                </select>
              </div>

              <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800">
                <h4 className="font-bold text-white mb-2">Onde estamos</h4>
                <p className="text-xs text-gray-400 mb-4">{ADDRESS}</p>
                <a 
                  href="https://maps.google.com" 
                  target="_blank" 
                  className="text-red-500 text-xs font-bold uppercase flex items-center gap-1 hover:underline"
                >
                  <MapPin size={14} /> Abrir no Maps
                </a>
              </div>
            </aside>

            {/* Product Grid */}
            <div className="flex-1">
              <div className="flex items-center bg-zinc-900 rounded-xl px-4 py-2 mb-8 border border-zinc-800 focus-within:ring-1 focus-within:ring-red-600 transition-all">
                <Search size={20} className="text-gray-500" />
                <input 
                  type="text" 
                  placeholder="Busque por modelo, exemplo: Sahara 300..."
                  className="bg-transparent border-none outline-none p-3 w-full text-white placeholder-gray-500"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredMotos.map(moto => (
                  <div 
                    key={moto.id} 
                    className="group bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden hover:border-red-600 transition-all shadow-xl hover:-translate-y-1 cursor-pointer"
                    onClick={() => setSelectedMoto(moto)}
                  >
                    <div className="relative h-64 overflow-hidden">
                      <img 
                        src={moto.mainImage} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                        alt={moto.title}
                      />
                      <div className="absolute top-4 left-4 flex gap-2">
                        <span className="bg-red-600 text-white text-[10px] font-black px-2 py-1 rounded uppercase tracking-tighter shadow-lg">{moto.category}</span>
                        <span className="bg-zinc-900/80 backdrop-blur-md text-white text-[10px] font-black px-2 py-1 rounded uppercase tracking-tighter">{moto.condition}</span>
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-bold mb-1 group-hover:text-red-500 transition-colors uppercase tracking-tight">{moto.title}</h3>
                      <p className="text-2xl font-black text-green-500 mb-4">R$ {moto.price.toLocaleString('pt-BR')}</p>
                      <div className="flex items-center gap-3 text-xs text-gray-400 font-bold uppercase tracking-widest border-t border-zinc-800 pt-4">
                        <span className="flex items-center gap-1"><CheckCircle2 size={14} className="text-green-500" /> Garantia</span>
                        <span className="flex items-center gap-1"><CreditCard size={14} className="text-red-500" /> 48x</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {filteredMotos.length === 0 && (
                <div className="text-center py-20 bg-zinc-900/50 rounded-3xl border-2 border-dashed border-zinc-800">
                  <h3 className="text-2xl font-bold text-gray-600 mb-2">Ops! Nenhuma moto encontrada.</h3>
                  <p className="text-gray-500">Tente ajustar seus filtros ou busca.</p>
                </div>
              )}
            </div>
          </div>
        </main>

        <footer className="bg-zinc-900 border-t border-zinc-800 py-12 mt-20">
          <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-12">
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <div className="bg-red-600 p-2 rounded-lg skew-x-[-12deg]">
                  <span className="text-white font-black text-xl italic">MF</span>
                </div>
                <h1 className="text-white font-bold text-xl uppercase tracking-tight">Moto Força</h1>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                Referência em motos multimarcas em Belo Horizonte. Qualidade, transparência e as melhores condições de financiamento para você conquistar sua liberdade sobre duas rodas.
              </p>
            </div>
            <div>
              <h4 className="text-white font-bold mb-6 uppercase tracking-widest text-sm text-red-600">Contato</h4>
              <ul className="space-y-4 text-sm text-gray-400">
                <li className="flex items-center gap-3"><Phone size={18} className="text-red-600" /> {WHATSAPP_NUMBER} (Daniel)</li>
                <li className="flex items-center gap-3"><MapPin size={18} className="text-red-600" /> {ADDRESS}</li>
                <li className="flex items-center gap-3"><MessageCircle size={18} className="text-green-500" /> Atendimento via WhatsApp</li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-6 uppercase tracking-widest text-sm text-red-600">Horário de Funcionamento</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>Segunda a Sexta: 08:00 às 18:00</li>
                <li>Sábado: 08:00 às 13:00</li>
                <li className="text-red-500 font-bold mt-4">Vem pra Moto Força!</li>
              </ul>
            </div>
          </div>
          <div className="text-center text-zinc-600 text-xs mt-16 pt-8 border-t border-zinc-800">
            &copy; {new Date().getFullYear()} Moto Força Multi Marcas. Todos os direitos reservados.
          </div>
        </footer>

        {/* WhatsApp Bubble */}
        <button 
          onClick={() => openWhatsApp('alguma moto')}
          className="fixed bottom-6 right-6 bg-green-500 text-white p-4 rounded-full shadow-2xl hover:bg-green-600 transition-all transform hover:scale-110 z-50 flex items-center justify-center animate-bounce"
        >
          <MessageCircle size={32} />
        </button>

        {/* Product Details Modal */}
        {selectedMoto && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm overflow-y-auto">
            <div className="bg-zinc-900 w-full max-w-5xl rounded-3xl overflow-hidden shadow-2xl border border-zinc-800 relative my-8">
              <button 
                onClick={() => setSelectedMoto(null)}
                className="absolute top-6 right-6 bg-black/50 hover:bg-red-600 text-white p-2 rounded-full z-10 transition-colors"
              >
                <X size={24} />
              </button>

              <div className="flex flex-col lg:flex-row">
                {/* Media Gallery */}
                <div className="lg:w-3/5 bg-black flex flex-col">
                  <div className="h-[400px] md:h-[500px] relative">
                    <img src={selectedMoto.mainImage} className="w-full h-full object-contain" />
                  </div>
                  <div className="p-4 flex gap-2 overflow-x-auto bg-zinc-950">
                    {selectedMoto.mediaIds.map(mId => {
                      const item = media[mId];
                      if (!item) return null;
                      return (
                        <div key={mId} className="flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden border border-zinc-800 cursor-pointer hover:border-red-600 transition-colors">
                          {item.type === 'image' ? (
                            <img src={item.url} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-zinc-900 flex items-center justify-center">
                              <PlayCircle size={24} className="text-red-600" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Details */}
                <div className="lg:w-2/5 p-8 lg:p-12 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <span className="bg-red-600 text-white text-[10px] font-black px-3 py-1 rounded uppercase tracking-widest">{selectedMoto.category}</span>
                      <span className="bg-zinc-800 text-gray-400 text-[10px] font-black px-3 py-1 rounded uppercase tracking-widest">Estoque: {selectedMoto.condition}</span>
                    </div>
                    <h2 className="text-4xl font-black uppercase tracking-tighter mb-2 italic">{selectedMoto.title}</h2>
                    <p className="text-3xl font-black text-green-500 mb-6">R$ {selectedMoto.price.toLocaleString('pt-BR')}</p>
                    
                    <div className="space-y-6">
                      <p className="text-gray-400 text-sm leading-relaxed border-t border-zinc-800 pt-6">
                        {selectedMoto.description}
                      </p>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800">
                          <p className="text-[10px] uppercase font-bold text-gray-500 mb-1 tracking-widest">Financiamento</p>
                          <p className="text-sm font-bold text-white">Até 48 meses</p>
                        </div>
                        <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800">
                          <p className="text-[10px] uppercase font-bold text-gray-500 mb-1 tracking-widest">Cartão de Crédito</p>
                          <p className="text-sm font-bold text-white">Até 24 parcelas</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-12 space-y-4">
                    <button 
                      onClick={() => openWhatsApp(selectedMoto.title)}
                      className="w-full bg-green-500 hover:bg-green-600 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-3 transition-all transform hover:scale-[1.02] shadow-xl"
                    >
                      <MessageCircle size={24} /> Consultar Condições
                    </button>
                    <p className="text-center text-[10px] text-gray-500 uppercase font-black tracking-widest">Falar diretamente com {DANIEL_NAME}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // --- Router ---
  if (view === 'login') return <LoginView />;
  if (view === 'admin') return <AdminView />;
  return <ClientView />;
};

createRoot(document.getElementById('root')!).render(<App />);
