import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckSquare, 
  Check, 
  ExternalLink, 
  Coins, 
  MessageCircle,
  Twitter,
  Users,
  User,
  Calendar,
  Radio
} from 'lucide-react';
import { useTelegram } from '../context/TelegramContext';
import { tasksApi } from '../services/api';
import Loading, { LoadingCard } from '../components/Loading';
import './Tasks.css';

const TASK_ICONS = {
  telegram: MessageCircle,
  twitter: Twitter,
  discord: Radio,
  referral: Users,
  profile: User,
  streak: Calendar,
  default: CheckSquare,
};

export default function Tasks() {
  const { user, refreshUser, hapticFeedback, showAlert, tg } = useTelegram();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(null);

  useEffect(() => {
    if (user?.id) {
      fetchTasks();
    }
  }, [user?.id]);

  const fetchTasks = async () => {
    try {
      const response = await tasksApi.getAll(user.id);
      setTasks(response.data);
    } catch (err) {
      console.error('Tasks error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteTask = async (task) => {
    if (task.completed || completing === task.id) return;

    // If task has action URL, open it first
    if (task.action_url) {
      if (tg?.openLink) {
        tg.openLink(task.action_url);
      } else {
        window.open(task.action_url, '_blank');
      }
    }

    setCompleting(task.id);
    hapticFeedback('impact');

    try {
      const response = await tasksApi.complete(user.id, task.id);
      
      hapticFeedback('notification');
      
      // Update task in list
      setTasks(prev => prev.map(t => 
        t.id === task.id ? { ...t, completed: true } : t
      ));
      
      // Refresh user data for points update
      await refreshUser();
      
      showAlert(`You earned ${response.data.reward} points!`);
    } catch (err) {
      console.error('Complete task error:', err);
      if (err.response?.data?.error === 'Task already completed') {
        // Already completed, just update UI
        setTasks(prev => prev.map(t => 
          t.id === task.id ? { ...t, completed: true } : t
        ));
      } else {
        showAlert('Failed to complete task. Please try again.');
      }
    } finally {
      setCompleting(null);
    }
  };

  const completedCount = tasks.filter(t => t.completed).length;
  const totalCount = tasks.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  if (loading) {
    return (
      <div className="tasks-page">
        <div className="tasks-header">
          <h1>Tasks</h1>
        </div>
        <div className="tasks-loading">
          {[1, 2, 3, 4].map(i => <LoadingCard key={i} />)}
        </div>
      </div>
    );
  }

  return (
    <div className="tasks-page">
      {/* Header */}
      <motion.div 
        className="tasks-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="tasks-icon">
          <CheckSquare size={32} />
        </div>
        <h1>Complete Tasks</h1>
        <p>Earn points by completing simple tasks</p>
      </motion.div>

      {/* Progress */}
      <motion.div 
        className="tasks-progress card"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
      >
        <div className="progress-header">
          <span>Your Progress</span>
          <span className="progress-count">{completedCount}/{totalCount}</span>
        </div>
        <div className="progress-bar">
          <motion.div 
            className="progress-fill"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, delay: 0.2 }}
          />
        </div>
        <div className="progress-hint">
          Complete all tasks to maximize your rewards!
        </div>
      </motion.div>

      {/* Tasks List */}
      <div className="tasks-list">
        <AnimatePresence>
          {tasks.map((task, index) => {
            const IconComponent = TASK_ICONS[task.icon] || TASK_ICONS.default;
            const isCompleting = completing === task.id;
            
            return (
              <motion.div
                key={task.id}
                className={`task-card card ${task.completed ? 'completed' : ''}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={!task.completed ? { scale: 1.02 } : {}}
                whileTap={!task.completed ? { scale: 0.98 } : {}}
                onClick={() => handleCompleteTask(task)}
              >
                <div className={`task-icon ${task.completed ? 'done' : ''}`}>
                  {task.completed ? <Check size={24} /> : <IconComponent size={24} />}
                </div>
                
                <div className="task-content">
                  <h3 className="task-title">{task.title}</h3>
                  <p className="task-description">{task.description}</p>
                </div>
                
                <div className="task-action">
                  {task.completed ? (
                    <div className="task-completed-badge">
                      <Check size={16} />
                      Done
                    </div>
                  ) : isCompleting ? (
                    <div className="task-completing">
                      <div className="task-spinner"></div>
                    </div>
                  ) : (
                    <div className="task-reward">
                      <Coins size={14} />
                      <span>+{task.reward}</span>
                      {task.action_url && <ExternalLink size={12} />}
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {tasks.length === 0 && (
        <div className="no-tasks">
          <CheckSquare size={48} />
          <p>No tasks available right now</p>
          <span>Check back later for new tasks!</span>
        </div>
      )}
    </div>
  );
}
