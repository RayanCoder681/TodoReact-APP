import { Trash } from "lucide-react";
type Priority="Urgente" | "Moyenne" | "Basse"

type Todo = {
  id:  number;
  text: string;
  priority: Priority;
}

type Props = {
    todo : Todo
    onDelete: () => void
    isSelected :boolean
    onToggleSelect:(id :  number) => void
}


const TodoItem = ({todo , onDelete, isSelected , onToggleSelect} : Props) => {
    return(
        <li className="p-3">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <label htmlFor={`todo-checkbox-${todo.id}`} className="flex items-center gap-3 cursor-pointer">
                        <input 
                        id={`todo-checkbox-${todo.id}`}
                        type="checkbox" 
                        className="checkbox checkbox-primary 
                        checkbox-sm"
                        checked={isSelected}
                        aria-label={`Marquer "${todo.text}" comme complétée`}
                        onChange={() => onToggleSelect(todo.id)}
                        />
                        <span className="text-md font-bold">
                            <span>{todo.text}</span>
                        </span>
                        <span 
                            className =
                            {'badge badge-sm badge-soft ${todo.priority === "Urgente" ? "badge-error" : todo.priority === "Moyenne" ? "badge-warning" : "badge-success"}'}
                            >
                            {todo.priority}
                        </span>
                    </label>
                </div>
               
                    <button 
                    onClick = {onDelete}
                    className="btn btn-sm btn-error btn-soft"
                    title="Supprimer cette tâche"
                    aria-label="Supprimer cette tâche">
                        <Trash className="w-4 h-4 "/>
                    </button>
                
            </div>
        </li>

    )
}
export default TodoItem