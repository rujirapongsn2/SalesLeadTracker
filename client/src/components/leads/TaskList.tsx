import { useState, useEffect } from "react";
import { Check, Plus, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Task {
  id: number;
  leadId: number;
  description: string;
  completed: boolean;
  createdAt: Date;
}

interface TaskListProps {
  leadId: number;
}

export const TaskList = ({ leadId }: TaskListProps) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskText, setNewTaskText] = useState("");
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Load tasks for this lead
  useEffect(() => {
    const loadTasks = async () => {
      if (!leadId) return;
      
      try {
        setIsLoading(true);
        // In a real app, this would be an API call
        // For now, we'll use localStorage to persist tasks
        const storedTasks = localStorage.getItem(`lead_tasks_${leadId}`);
        if (storedTasks) {
          setTasks(JSON.parse(storedTasks));
        } else {
          setTasks([]);
        }
      } catch (error) {
        console.error("Failed to load tasks:", error);
        toast({
          title: "Error",
          description: "Failed to load tasks",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadTasks();
  }, [leadId, toast]);

  // Save tasks to localStorage whenever they change
  useEffect(() => {
    if (tasks.length > 0 || localStorage.getItem(`lead_tasks_${leadId}`)) {
      localStorage.setItem(`lead_tasks_${leadId}`, JSON.stringify(tasks));
    }
  }, [tasks, leadId]);

  const addTask = () => {
    if (!newTaskText.trim()) return;
    
    const newTask: Task = {
      id: Date.now(),
      leadId,
      description: newTaskText.trim(),
      completed: false,
      createdAt: new Date(),
    };
    
    setTasks([...tasks, newTask]);
    setNewTaskText("");
    setIsAddingTask(false);
    
    toast({
      title: "Task added",
      description: "New task has been added",
    });
  };

  const toggleTaskCompletion = (taskId: number) => {
    setTasks(
      tasks.map(task => 
        task.id === taskId 
          ? { ...task, completed: !task.completed } 
          : task
      )
    );
  };

  const deleteTask = (taskId: number) => {
    setTasks(tasks.filter(task => task.id !== taskId));
    
    toast({
      title: "Task deleted",
      description: "Task has been removed",
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Tasks</h3>
        {!isAddingTask && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setIsAddingTask(true)}
            className="flex items-center gap-1"
          >
            <Plus className="h-4 w-4" />
            Add Task
          </Button>
        )}
      </div>

      {isAddingTask && (
        <div className="flex items-center gap-2">
          <Input
            placeholder="Enter task description..."
            value={newTaskText}
            onChange={(e) => setNewTaskText(e.target.value)}
            className="flex-1"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') addTask();
              if (e.key === 'Escape') {
                setIsAddingTask(false);
                setNewTaskText("");
              }
            }}
          />
          <Button variant="default" size="sm" onClick={addTask}>
            <Check className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => {
              setIsAddingTask(false);
              setNewTaskText("");
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {isLoading ? (
        <div className="py-8 text-center text-gray-500">Loading tasks...</div>
      ) : tasks.length === 0 ? (
        <div className="py-8 text-center text-gray-500">
          No tasks yet. Add a task to get started.
        </div>
      ) : (
        <ul className="space-y-2">
          {tasks.map((task) => (
            <li 
              key={task.id} 
              className="flex items-center justify-between p-3 border rounded-md hover:bg-gray-50"
            >
              <div className="flex items-center gap-3">
                <Checkbox 
                  checked={task.completed}
                  onCheckedChange={() => toggleTaskCompletion(task.id)}
                  id={`task-${task.id}`}
                />
                <label 
                  htmlFor={`task-${task.id}`}
                  className={`text-sm ${task.completed ? 'line-through text-gray-500' : ''}`}
                >
                  {task.description}
                </label>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => deleteTask(task.id)}
                className="text-gray-400 hover:text-red-500"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};


