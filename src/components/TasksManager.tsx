import React, { useState, useEffect } from 'react';
import { 
  googleSignIn, 
  logout, 
  getAccessToken, 
  initAuth 
} from '../services/firebaseAuth';
import { User } from 'firebase/auth';
import { 
  CheckSquare, 
  Square, 
  Trash2, 
  Plus, 
  LogOut, 
  Loader2, 
  Sparkles, 
  PlusCircle, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';

interface TasksManagerProps {
  selectedLang: 'EN' | 'ES';
  onAskVoyager: (text: string) => void;
}

interface GoogleTaskList {
  id: string;
  title: string;
}

interface GoogleTask {
  id: string;
  title: string;
  notes?: string;
  status: 'needsAction' | 'completed';
  updated?: string;
}

const NYC_SUGGESTED_TASKS = [
  { en: "🗽 Visit the Statue of Liberty", es: "🗽 Visitar la Estatua de la Libertad", notes: "Take the ferry from Battery Park to Liberty Island." },
  { en: "🍕 Eat a slice of NY Pizza", es: "🍕 Comer una rebanada de Pizza de NY", notes: "Try a classic dollar slice or a famous spot like Joe's Pizza." },
  { en: "🎭 See a Broadway Show", es: "🎭 Ver un show de Broadway", notes: "Check TKTS booth in Times Square for discounted same-day tickets." },
  { en: "🌉 Walk the Brooklyn Bridge", es: "🌉 Caminar por el puente de Brooklyn", notes: "Walk from Manhattan to Brooklyn at sunset for amazing views." },
  { en: "🚇 Ride the Subway using OMNY", es: "🚇 Viajar en metro usando OMNY", notes: "Tap your phone or contactless card to pay the $2.90 fare." },
  { en: "🌳 Explore Central Park", es: "🌳 Explorar Central Park", notes: "Rent a bike or walk around Bethesda Terrace and the Mall." }
];

export const TasksManager: React.FC<TasksManagerProps> = ({ selectedLang, onAskVoyager }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [needsAuth, setNeedsAuth] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  
  const [taskLists, setTaskLists] = useState<GoogleTaskList[]>([]);
  const [selectedListId, setSelectedListId] = useState<string>('');
  const [tasks, setTasks] = useState<GoogleTask[]>([]);
  
  const [isLoadingLists, setIsLoadingLists] = useState(false);
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [isAddingList, setIsAddingList] = useState(false);
  
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskNotes, setNewTaskNotes] = useState('');
  const [newListName, setNewListName] = useState('');
  const [showAddListForm, setShowAddListForm] = useState(false);
  
  const [error, setError] = useState<string | null>(null);

  // Initialize Auth state
  useEffect(() => {
    const unsubscribe = initAuth(
      async (firebaseUser, token) => {
        setUser(firebaseUser);
        setAccessToken(token);
        setNeedsAuth(false);
        setError(null);
      },
      () => {
        setUser(null);
        setAccessToken(null);
        setNeedsAuth(true);
      }
    );
    return () => unsubscribe();
  }, []);

  // Fetch lists whenever accessToken is retrieved
  useEffect(() => {
    if (accessToken) {
      fetchTaskLists();
    }
  }, [accessToken]);

  // Fetch tasks whenever selectedListId changes
  useEffect(() => {
    if (accessToken && selectedListId) {
      fetchTasks(selectedListId);
    }
  }, [accessToken, selectedListId]);

  const handleLogin = async () => {
    setIsLoggingIn(true);
    setError(null);
    try {
      const result = await googleSignIn();
      if (result) {
        setAccessToken(result.accessToken);
        setUser(result.user);
        setNeedsAuth(false);
      }
    } catch (err: any) {
      console.error('Login failed:', err);
      setError(selectedLang === 'EN' ? 'Sign in failed. Make sure to complete the permission popup.' : 'Error al iniciar sesión. Asegúrate de completar la ventana de permisos.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setTasks([]);
      setTaskLists([]);
      setSelectedListId('');
      setAccessToken(null);
      setUser(null);
      setNeedsAuth(true);
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const fetchTaskLists = async () => {
    if (!accessToken) return;
    setIsLoadingLists(true);
    setError(null);
    try {
      const res = await fetch('https://tasks.googleapis.com/tasks/v1/users/@me/lists', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
      const data = await res.json();
      const lists: GoogleTaskList[] = data.items || [];
      setTaskLists(lists);
      if (lists.length > 0 && !selectedListId) {
        setSelectedListId(lists[0].id);
      }
    } catch (err: any) {
      console.error('Error fetching task lists:', err);
      setError(selectedLang === 'EN' ? 'Failed to fetch Google Task Lists.' : 'No se pudieron obtener las listas de Google Tasks.');
    } finally {
      setIsLoadingLists(false);
    }
  };

  const fetchTasks = async (listId: string) => {
    if (!accessToken) return;
    setIsLoadingTasks(true);
    setError(null);
    try {
      const res = await fetch(`https://tasks.googleapis.com/tasks/v1/lists/${listId}/tasks?showCompleted=true&showHidden=true`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
      const data = await res.json();
      setTasks(data.items || []);
    } catch (err: any) {
      console.error('Error fetching tasks:', err);
      setError(selectedLang === 'EN' ? 'Failed to fetch tasks in the list.' : 'No se pudieron obtener las tareas de la lista.');
    } finally {
      setIsLoadingTasks(false);
    }
  };

  const handleCreateList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken || !newListName.trim()) return;
    setIsAddingList(true);
    setError(null);
    try {
      const res = await fetch('https://tasks.googleapis.com/tasks/v1/users/@me/lists', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}` 
        },
        body: JSON.stringify({ title: newListName.trim() })
      });
      if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
      const newList = await res.json();
      setTaskLists(prev => [newList, ...prev]);
      setSelectedListId(newList.id);
      setNewListName('');
      setShowAddListForm(false);
    } catch (err: any) {
      console.error('Error creating list:', err);
      setError(selectedLang === 'EN' ? 'Failed to create new task list.' : 'No se pudo crear la nueva lista.');
    } finally {
      setIsAddingList(false);
    }
  };

  const handleCreateTask = async (e?: React.FormEvent, titleOverride?: string, notesOverride?: string) => {
    if (e) e.preventDefault();
    const title = titleOverride || newTaskTitle.trim();
    const notes = notesOverride || newTaskNotes.trim();
    
    if (!accessToken || !selectedListId || !title) return;
    setIsAddingTask(true);
    setError(null);
    try {
      const res = await fetch(`https://tasks.googleapis.com/tasks/v1/lists/${selectedListId}/tasks`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}` 
        },
        body: JSON.stringify({ 
          title: title,
          notes: notes
        })
      });
      if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
      const newTask = await res.json();
      setTasks(prev => [newTask, ...prev]);
      if (!titleOverride) {
        setNewTaskTitle('');
        setNewTaskNotes('');
      }
    } catch (err: any) {
      console.error('Error creating task:', err);
      setError(selectedLang === 'EN' ? 'Failed to add task.' : 'No se pudo añadir la tarea.');
    } finally {
      setIsAddingTask(false);
    }
  };

  const handleToggleTaskStatus = async (task: GoogleTask) => {
    if (!accessToken || !selectedListId) return;
    
    const newStatus = task.status === 'completed' ? 'needsAction' : 'completed';
    
    // Optimistic Update
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: newStatus } : t));

    try {
      const res = await fetch(`https://tasks.googleapis.com/tasks/v1/lists/${selectedListId}/tasks/${task.id}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}` 
        },
        body: JSON.stringify({ 
          id: task.id,
          status: newStatus 
        })
      });
      if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
      const updatedTask = await res.json();
      // Sync from server response
      setTasks(prev => prev.map(t => t.id === task.id ? updatedTask : t));
    } catch (err: any) {
      console.error('Error toggling task:', err);
      // Revert optimistic update
      setTasks(prev => prev.map(t => t.id === task.id ? task : t));
      setError(selectedLang === 'EN' ? 'Failed to update task status.' : 'No se pudo actualizar el estado de la tarea.');
    }
  };

  const handleDeleteTask = async (task: GoogleTask) => {
    if (!accessToken || !selectedListId) return;
    
    // EXPLICIT CONFIRMATION MANDATORY
    const confirmMessage = selectedLang === 'EN' 
      ? `Are you sure you want to delete the task "${task.title}"? This cannot be undone.` 
      : `¿Estás seguro de que quieres eliminar la tarea "${task.title}"? Esto no se puede deshacer.`;
      
    const confirmed = window.confirm(confirmMessage);
    if (!confirmed) return;

    // Optimistic delete
    setTasks(prev => prev.filter(t => t.id !== task.id));

    try {
      const res = await fetch(`https://tasks.googleapis.com/tasks/v1/lists/${selectedListId}/tasks/${task.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
    } catch (err: any) {
      console.error('Error deleting task:', err);
      // Revert optimistic delete by re-fetching
      fetchTasks(selectedListId);
      setError(selectedLang === 'EN' ? 'Failed to delete task.' : 'No se pudo eliminar la tarea.');
    }
  };

  const addSuggestedTask = async (suggested: typeof NYC_SUGGESTED_TASKS[0]) => {
    if (!selectedListId) {
      setError(selectedLang === 'EN' ? 'Please select a Task List first.' : 'Por favor, selecciona una lista de tareas primero.');
      return;
    }
    const title = selectedLang === 'EN' ? suggested.en : suggested.es;
    await handleCreateTask(undefined, title, suggested.notes);
  };

  if (needsAuth) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-black/45 border border-white/10 rounded-2xl p-6 text-white font-sans text-center max-h-[380px] md:max-h-[440px]">
        <CheckCircle2 className="w-12 h-12 text-yellow-500 mb-3 animate-pulse" />
        <h3 className="text-sm font-bold uppercase font-mono text-yellow-400 tracking-wider mb-2">
          {selectedLang === 'EN' ? 'Google Tasks Integrator' : 'Integrador de Google Tasks'}
        </h3>
        <p className="text-xs text-neutral-400 max-w-sm mb-5 leading-normal">
          {selectedLang === 'EN' 
            ? 'Connect your personal Google Tasks account to manage and track your NYC learning check-list directly within VOYAGER.' 
            : 'Conecta tu cuenta personal de Google Tasks para gestionar y seguir tu lista de viaje por NYC directamente dentro de VOYAGER.'}
        </p>

        <button 
          onClick={handleLogin}
          disabled={isLoggingIn}
          className="relative inline-flex items-center justify-center px-4 py-2 bg-yellow-500 text-black text-xs font-mono font-bold tracking-wider rounded-xl hover:bg-yellow-400 transition-all cursor-pointer shadow-lg disabled:opacity-50 select-none uppercase active:scale-95"
        >
          {isLoggingIn ? (
            <>
              <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
              {selectedLang === 'EN' ? 'Authorizing...' : 'Autorizando...'}
            </>
          ) : (
            <>
              {selectedLang === 'EN' ? 'Sign in with Google' : 'Iniciar Sesión con Google'}
            </>
          )}
        </button>
        {error && (
          <p className="text-[10px] text-red-400 font-mono mt-3 flex items-center gap-1">
            <AlertCircle className="w-3 h-3 flex-shrink-0" />
            {error}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col bg-black/45 border border-white/10 rounded-2xl p-4 font-sans text-white overflow-hidden max-h-[380px] md:max-h-[440px]">
      
      {/* Header Info & Log out */}
      <div className="flex items-center justify-between border-b border-white/10 pb-2.5 mb-2.5">
        <div className="flex items-center gap-2">
          {user?.photoURL ? (
            <img referrerPolicy="no-referrer" src={user.photoURL} alt="Avatar" className="w-6 h-6 rounded-full border border-yellow-500/30" />
          ) : (
            <div className="w-6 h-6 rounded-full bg-yellow-500 text-black font-bold flex items-center justify-center text-[10px] uppercase">
              {user?.displayName?.substring(0, 1) || 'U'}
            </div>
          )}
          <div className="text-left">
            <h4 className="text-[10px] font-mono font-bold text-yellow-400 line-clamp-1 leading-none mb-0.5">
              {user?.displayName || 'Traveler'}
            </h4>
            <span className="text-[8px] text-neutral-400 line-clamp-1 leading-none">
              {selectedLang === 'EN' ? 'Google Tasks Active' : 'Google Tasks Activo'}
            </span>
          </div>
        </div>
        
        <button 
          onClick={handleLogout}
          title={selectedLang === 'EN' ? 'Sign Out' : 'Cerrar Sesión'}
          className="p-1.5 hover:bg-white/5 rounded-lg text-neutral-400 hover:text-white transition-all cursor-pointer active:scale-90"
        >
          <LogOut className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Task List Selector & Create New List Option */}
      <div className="flex gap-1.5 mb-3 items-center">
        {showAddListForm ? (
          <form onSubmit={handleCreateList} className="flex gap-1.5 w-full">
            <input 
              type="text"
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              placeholder={selectedLang === 'EN' ? 'New list name...' : 'Nombre de lista...'}
              className="flex-1 bg-black/50 border border-white/10 px-2.5 py-1 rounded-xl text-xs font-mono text-white placeholder-neutral-500 focus:outline-none focus:border-yellow-500"
              required
            />
            <button 
              type="submit" 
              disabled={isAddingList}
              className="px-2.5 py-1 bg-yellow-500 hover:bg-yellow-400 text-black rounded-xl text-[10px] font-mono font-bold uppercase transition-all disabled:opacity-50 cursor-pointer"
            >
              {isAddingList ? <Loader2 className="w-3 h-3 animate-spin" /> : (selectedLang === 'EN' ? 'Create' : 'Crear')}
            </button>
            <button 
              type="button" 
              onClick={() => setShowAddListForm(false)}
              className="px-2 py-1 hover:bg-white/5 border border-white/10 rounded-xl text-[10px] font-mono uppercase text-neutral-400 hover:text-white cursor-pointer"
            >
              X
            </button>
          </form>
        ) : (
          <>
            <div className="flex-1 flex items-center bg-black/40 border border-white/10 px-2 py-1 rounded-xl relative">
              <span className="text-[9px] font-mono text-yellow-500/80 font-bold mr-1.5 select-none uppercase">List:</span>
              {isLoadingLists ? (
                <Loader2 className="w-3 h-3 text-neutral-400 animate-spin" />
              ) : (
                <select 
                  value={selectedListId} 
                  onChange={(e) => setSelectedListId(e.target.value)}
                  className="bg-transparent text-xs font-mono font-bold text-neutral-200 outline-none w-full cursor-pointer pr-4"
                >
                  {taskLists.map(list => (
                    <option key={list.id} value={list.id} className="bg-neutral-900 text-white">
                      {list.title}
                    </option>
                  ))}
                </select>
              )}
            </div>
            <button 
              onClick={() => setShowAddListForm(true)}
              title={selectedLang === 'EN' ? 'Create New Task List' : 'Crear nueva lista'}
              className="p-1.5 bg-yellow-500/10 border border-yellow-500/20 hover:bg-yellow-500/20 text-yellow-400 rounded-xl transition-all cursor-pointer active:scale-95 flex items-center justify-center"
            >
              <PlusCircle className="w-4 h-4" />
            </button>
          </>
        )}
      </div>

      {/* Main Container Split: Active Tasks list & Suggested NYC tasks */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-3.5 max-h-[260px] md:max-h-[300px]">
        
        {error && (
          <div className="p-2 bg-red-950/20 border border-red-500/20 rounded-xl flex items-start gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-[9px] text-red-200 font-mono leading-tight">{error}</p>
          </div>
        )}

        {/* Create Task Form */}
        <form onSubmit={(e) => handleCreateTask(e)} className="flex gap-1.5 p-2 bg-black/30 border border-white/5 rounded-xl">
          <input 
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder={selectedLang === 'EN' ? 'Add quick checklist task...' : 'Añadir tarea rápida...'}
            className="flex-1 bg-transparent text-xs font-mono text-white placeholder-neutral-500 focus:outline-none"
            required
          />
          <button 
            type="submit" 
            disabled={isAddingTask}
            className="p-1 bg-yellow-500 hover:bg-yellow-400 text-black rounded-lg transition-all cursor-pointer flex items-center justify-center disabled:opacity-50 active:scale-95"
          >
            {isAddingTask ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
          </button>
        </form>

        {/* Task Items list */}
        <div className="space-y-1.5">
          <span className="block text-[9px] font-mono font-bold tracking-wider text-neutral-400 uppercase">
            {selectedLang === 'EN' ? 'Checklist Tasks' : 'Tareas en Checklist'}
          </span>
          {isLoadingTasks ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-5 h-5 text-yellow-500 animate-spin" />
            </div>
          ) : tasks.length === 0 ? (
            <p className="text-[10px] text-neutral-500 italic py-2 text-center">
              {selectedLang === 'EN' ? 'No tasks found. Try adding one below or quick-adding suggestions.' : 'No hay tareas. Añade una abajo o agrega sugerencias de viaje.'}
            </p>
          ) : (
            <div className="space-y-1">
              {tasks.map(task => (
                <div 
                  key={task.id} 
                  className={`flex items-start gap-2.5 p-2.5 rounded-xl border border-white/5 transition-all hover:border-white/10 ${
                    task.status === 'completed' ? 'bg-neutral-900/30 opacity-60' : 'bg-neutral-950/40'
                  }`}
                >
                  <button 
                    onClick={() => handleToggleTaskStatus(task)}
                    className="p-0.5 text-neutral-400 hover:text-yellow-500 transition-colors cursor-pointer flex-shrink-0 mt-0.5"
                  >
                    {task.status === 'completed' ? (
                      <CheckSquare className="w-4 h-4 text-yellow-500" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                  <div className="flex-1 text-left min-w-0">
                    <p className={`text-xs font-medium text-white leading-snug break-words ${
                      task.status === 'completed' ? 'line-through text-neutral-500' : ''
                    }`}>
                      {task.title}
                    </p>
                    {task.notes && (
                      <p className="text-[9px] text-neutral-400 mt-0.5 leading-normal italic break-words">
                        {task.notes}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button 
                      onClick={() => onAskVoyager(selectedLang === 'EN' ? `Help me study or explain: ${task.title}` : `Ayúdame a estudiar o explícame: ${task.title}`)}
                      title={selectedLang === 'EN' ? 'Ask Voyager' : 'Preguntar a Voyager'}
                      className="p-1 hover:bg-white/5 rounded-md text-neutral-400 hover:text-white transition-all cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3" />
                    </button>
                    <button 
                      onClick={() => handleDeleteTask(task)}
                      title={selectedLang === 'EN' ? 'Delete Task' : 'Eliminar Tarea'}
                      className="p-1 hover:bg-red-500/10 rounded-md text-neutral-400 hover:text-red-400 transition-all cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* NYC Suggested Travel Activities */}
        <div className="space-y-2 border-t border-white/5 pt-3">
          <span className="block text-[9px] font-mono font-bold tracking-wider text-yellow-500 uppercase flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            {selectedLang === 'EN' ? 'Quick Add NYC Travel Challenges' : 'Retos de Viaje en NYC para agregar'}
          </span>
          <div className="grid grid-cols-2 gap-2">
            {NYC_SUGGESTED_TASKS.map((suggested, idx) => (
              <div 
                key={idx} 
                className="p-2 bg-neutral-900/60 border border-white/5 rounded-xl flex flex-col justify-between hover:border-yellow-500/35 transition-all text-left"
              >
                <div>
                  <h5 className="text-[10px] font-bold text-white line-clamp-1">
                    {selectedLang === 'EN' ? suggested.en : suggested.es}
                  </h5>
                  <p className="text-[8px] text-neutral-400 line-clamp-1 mt-0.5">
                    {suggested.notes}
                  </p>
                </div>
                <button
                  onClick={() => addSuggestedTask(suggested)}
                  className="w-fit mt-2 pt-1.5 text-[8px] font-mono font-bold text-yellow-400 hover:text-yellow-300 flex items-center gap-0.5 uppercase cursor-pointer self-end"
                >
                  <Plus className="w-2.5 h-2.5" />
                  {selectedLang === 'EN' ? 'Add Task' : 'Agregar'}
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
