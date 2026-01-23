import { useState, useEffect } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "./firebase";
import { collection, query, where, getDocs, addDoc, deleteDoc, doc } from "firebase/firestore";
import { LoginPage } from "./LoginPage";
import TodoItem from "./TodoItem";
import { Construction } from "lucide-react";

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
    return <div className="flex justify-center items-center min-h-screen">Chargement...</div>;
  }

  if (!userId) {
    return <LoginPage onLoginSuccess={() => {}} />;
  }

  const filteredTodos = filter === "Tous" ? todos : todos.filter((t) => t.priority === filter);
  const urgentCount = todos.filter((t) => t.priority === "Urgente").length;
  const mediumCount = todos.filter((t) => t.priority === "Moyenne").length;
  const lowCount = todos.filter((t) => t.priority === "Basse").length;
  const totalCount = todos.length;

  return (
    <div>
      <h1 className="text-center text-4xl font-bold text-blue-400 my-8">
        Welcome to your Todo App !
      </h1>
      
      <div className="flex justify-end px-4">
        <button onClick={handleLogout} className="btn btn-error btn-sm">
          Déconnexion
        </button>
      </div>

      <div className="flex justify-center">
        <div className="w-2/3 flex flex-col gap-4 my-20 bg-base-300 p-4 rounded-2xl">
          <div className="flex flex-row gap-3">
            <label htmlFor="priority-select" className="sr-only">
              Priorité
            </label>
            <input
              type="text"
              className="input w-full"
              placeholder="Ajouter une tâche..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <select
              id="priority-select"
              className="select w-full"
              value={priority}
              onChange={(e) => setPriority(e.target.value as Priority)}
            >
              <option value="Urgente">Urgente</option>
              <option value="Moyenne">Moyenne</option>
              <option value="Basse">Basse</option>
            </select>
            <button onClick={addTodo} className="btn btn-primary">
              Ajouter
            </button>
          </div>

          <div className="flex flex-col h-fit">
            <div className="flex justify-between gap-3">
              <div className="flex gap-7">
                <button
                  className={`btn btn-soft ${filter === "Tous" ? "btn-primary" : ""}`}
                  onClick={() => setFilter("Tous")}
                >
                  Tous ({totalCount})
                </button>
                <button
                  className={`btn btn-soft ${filter === "Urgente" ? "btn-primary" : ""}`}
                  onClick={() => setFilter("Urgente")}
                >
                  Urgente ({urgentCount})
                </button>
                <button
                  className={`btn btn-soft ${filter === "Moyenne" ? "btn-primary" : ""}`}
                  onClick={() => setFilter("Moyenne")}
                >
                  Moyenne ({mediumCount})
                </button>
                <button
                  className={`btn btn-soft ${filter === "Basse" ? "btn-primary" : ""}`}
                  onClick={() => setFilter("Basse")}
                >
                  Basse ({lowCount})
                </button>
              </div>
              <div>
                <button
                  onClick={finishedSelected}
                  className="btn btn-primary"
                  disabled={selectedTodos.size === 0}
                >
                  Finir la Selection ({selectedTodos.size})
                </button>
              </div>
            </div>

            {filteredTodos.length > 0 ? (
              <ul className="divide-y divide-primary/20">
                {filteredTodos.map((todo) => (
                  <TodoItem
                    key={todo.id}
                    todo={todo}
                    onDelete={() => deleteTodo(todo.id)}
                    isSelected={selectedTodos.has(todo.id)}
                    onToggleSelect={toggleSelectTodo}
                  />
                ))}
              </ul>
            ) : (
              <div className="flex justify-center items-center flex-col p-5">
                <Construction strokeWidth={1} className="w-40 h-40 text-primary" />
                <p className="text-sm">Aucune tâche pour ce filtre</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
