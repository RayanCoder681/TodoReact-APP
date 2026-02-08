import { Trash } from "lucide-react";
import { motion } from "framer-motion";

type Priority = "Urgente" | "Moyenne" | "Basse";

type Todo = {
  id: string;
  text: string;
  priority: Priority;
  userId: string;
};

type Props = {
  todo: Todo;
  onDelete: () => void;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
};

const TodoItem = ({ todo, onDelete, isSelected, onToggleSelect }: Props) => {
  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -10 }}
      className={`p-4 rounded-xl transition-colors border border-transparent ${isSelected ? "bg-primary/20 border-primary/50" : "bg-base-100/50 hover:bg-base-100/80"
        }`}
    >
      <div className="flex justify-between items-center gap-4">
        <label
          htmlFor={`todo-checkbox-${todo.id}`}
          className="flex items-center gap-3 cursor-pointer flex-grow overflow-hidden"
        >
          <input
            id={`todo-checkbox-${todo.id}`}
            type="checkbox"
            className="checkbox checkbox-primary checkbox-sm flex-shrink-0"
            checked={isSelected}
            onChange={() => onToggleSelect(todo.id)}
            aria-label={`Marquer "${todo.text}" comme complétée`}
          />
          <div className="flex flex-col min-w-0">
            <span
              className={`text-md font-medium truncate ${isSelected ? "line-through text-gray-400" : ""
                }`}
            >
              {todo.text}
            </span>
          </div>
          <span
            className={`badge badge-sm flex-shrink-0 ml-auto ${todo.priority === "Urgente"
                ? "badge-error"
                : todo.priority === "Moyenne"
                  ? "badge-warning"
                  : "badge-success"
              }`}
          >
            {todo.priority}
          </span>
        </label>

        <button
          onClick={onDelete}
          className="btn btn-sm btn-ghost text-error hover:bg-error/20"
          title="Supprimer cette tâche"
          aria-label="Supprimer cette tâche"
        >
          <Trash className="w-4 h-4" />
        </button>
      </div>
    </motion.li>
  );
};

export default TodoItem;