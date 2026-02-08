import { useState, useEffect } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "./firebase";
import { collection, query, where, getDocs, addDoc, deleteDoc, doc } from "firebase/firestore";
import { LoginPage } from "./LoginPage";
import TodoItem from "./TodoItem";
import { Construction, LogOut, Plus, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Priority = "Urgente" | "Moyenne" | "Basse";

type Todo = {
  id: string;
  text: string;
  priority: Priority;
  userId: string;
};

function App() {
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState<string>("");
  const [priority, setPriority] = useState<Priority>("Moyenne");
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filter, setFilter] = useState<Priority | "Tous">("Tous");
  const [selectedTodos, setSelectedTodos] = useState<Set<string>>(new Set());

  // Vérifier si l'utilisateur est connecté
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
        loadTodos(user.uid);
      } else {
        setUserId(null);
        setTodos([]);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  // Charger les tâches depuis Firestore
  const loadTodos = async (uid: string) => {
    try {
      const q = query(collection(db, "todos"), where("userId", "==", uid));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      } as Todo));
      setTodos(data);
    } catch (error) {
      console.error("Erreur lors du chargement des tâches:", error);
    }
  };

  const addTodo = async () => {
    if (input.trim() === "" || !userId) {
      return;
    }

    try {
      await addDoc(collection(db, "todos"), {
        text: input.trim(),
        priority,
        userId,
        createdAt: new Date(),
      });

      setInput("");
      setPriority("Moyenne");
      loadTodos(userId);
    } catch (error) {
      console.error("Erreur lors de l'ajout:", error);
    }
  };

  const deleteTodo = async (id: string) => {
    try {
      await deleteDoc(doc(db, "todos", id));
      loadTodos(userId!);
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  const toggleSelectTodo = (id: string) => {
    const newSelected = new Set(selectedTodos);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedTodos(newSelected);
  };

  const finishedSelected = async () => {
    try {
      for (const id of selectedTodos) {
        await deleteDoc(doc(db, "todos", id));
      }
      setSelectedTodos(new Set());
      loadTodos(userId!);
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (!userId) {
    return <LoginPage onLoginSuccess={() => { }} />;
  }

  const filteredTodos = filter === "Tous" ? todos : todos.filter((t) => t.priority === filter);
  const urgentCount = todos.filter((t) => t.priority === "Urgente").length;
  const mediumCount = todos.filter((t) => t.priority === "Moyenne").length;
  const lowCount = todos.filter((t) => t.priority === "Basse").length;
  const totalCount = todos.length;

  return (
    <div className="min-h-screen py-8 px-4 flex flex-col items-center">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center text-3xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-300 to-purple-400 mb-8"
      >
        Todo App
      </motion.h1>

      <div className="w-full max-w-4xl flex justify-end mb-4">
        <button onClick={handleLogout} className="btn btn-error btn-sm btn-outline shadow-lg">
          <LogOut className="w-4 h-4 mr-2" />
          Déconnexion
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-4xl glass-panel p-6 rounded-2xl flex flex-col gap-6"
      >
        {/* Input Section */}
        <div className="flex flex-col md:flex-row gap-3">
          <input
            type="text"
            className="input w-full glass-input"
            placeholder="Ajouter une tâche..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTodo()}
          />
          <div className="flex gap-2">
            <select
              className="select glass-input md:w-auto w-full"
              value={priority}
              onChange={(e) => setPriority(e.target.value as Priority)}
            >
              <option value="Urgente">Urgente</option>
              <option value="Moyenne">Moyenne</option>
              <option value="Basse">Basse</option>
            </select>
            <button onClick={addTodo} className="btn btn-primary md:w-auto w-full">
              <Plus className="w-5 h-5" />
              <span className="hidden md:inline">Ajouter</span>
            </button>
          </div>
        </div>

        {/* Filters & Actions */}
        <div className="flex flex-col-reverse md:flex-row justify-between gap-4 items-center">
          <div className="flex flex-wrap gap-2 justify-center md:justify-start w-full">
            <button
              className={`btn btn-sm ${filter === "Tous" ? "btn-primary" : "btn-ghost"}`}
              onClick={() => setFilter("Tous")}
            >
              Tous <span className="badge badge-sm">{totalCount}</span>
            </button>
            <button
              className={`btn btn-sm ${filter === "Urgente" ? "btn-error btn-outline" : "btn-ghost"}`}
              onClick={() => setFilter("Urgente")}
            >
              Urgente <span className="badge badge-sm badge-error">{urgentCount}</span>
            </button>
            <button
              className={`btn btn-sm ${filter === "Moyenne" ? "btn-warning btn-outline" : "btn-ghost"}`}
              onClick={() => setFilter("Moyenne")}
            >
              Moyenne <span className="badge badge-sm badge-warning">{mediumCount}</span>
            </button>
            <button
              className={`btn btn-sm ${filter === "Basse" ? "btn-success btn-outline" : "btn-ghost"}`}
              onClick={() => setFilter("Basse")}
            >
              Basse <span className="badge badge-sm badge-success">{lowCount}</span>
            </button>
          </div>

          <AnimatePresence>
            {selectedTodos.size > 0 && (
              <motion.button
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onClick={finishedSelected}
                className="btn btn-success btn-sm w-full md:w-auto"
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Finir ({selectedTodos.size})
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* Todo List */}
        <div className="flex flex-col min-h-[300px]">
          {filteredTodos.length > 0 ? (
            <ul className="space-y-3">
              <AnimatePresence mode="popLayout">
                {filteredTodos.map((todo) => (
                  <TodoItem
                    key={todo.id}
                    todo={todo}
                    onDelete={() => deleteTodo(todo.id)}
                    isSelected={selectedTodos.has(todo.id)}
                    onToggleSelect={toggleSelectTodo}
                  />
                ))}
              </AnimatePresence>
            </ul>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-center items-center flex-col p-10 flex-grow text-gray-400"
            >
              <Construction strokeWidth={1} className="w-24 h-24 mb-4 opacity-50" />
              <p className="text-lg">Aucune tâche pour ce filtre</p>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default App;
