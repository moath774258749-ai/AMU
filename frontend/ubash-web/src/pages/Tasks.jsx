import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Twitter, Send, Youtube, Instagram, 
  Gift, ExternalLink, Check, Coins,
  Users, Star
} from 'lucide-react';
import { Header } from '../components/layout/Header';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import useStore from '../store/useStore';
import { useTranslation } from '../i18n/translations';
import styles from './Tasks.module.css';

const iconMap = {
  twitter: Twitter,
  telegram: Send,
  youtube: Youtube,
  instagram: Instagram,
  users: Users,
  gift: Gift,
  star: Star
};

export function Tasks() {
  const { tasks, tasksLoading, fetchTasks, completeTask, language } = useStore();
  const { t } = useTranslation(language);
  const [completingTask, setCompletingTask] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  
  useEffect(() => {
    fetchTasks();
  }, []);
  
  const handleStartTask = (task) => {
    if (task.link) {
      window.open(task.link, '_blank');
    }
  };
  
  const handleCompleteTask = async (task) => {
    setCompletingTask(task._id);
    try {
      const result = await completeTask(task._id);
      setSuccessMessage({
        taskId: task._id,
        reward: result.reward
      });
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error('Failed to complete task:', error);
    } finally {
      setCompletingTask(null);
    }
  };
  
  const availableTasks = tasks.filter(t => !t.completed);
  const completedTasks = tasks.filter(t => t.completed);
  
  const getTaskTitle = (task) => {
    return language === 'ar' && task.titleAr ? task.titleAr : task.title;
  };
  
  const getTaskDescription = (task) => {
    return language === 'ar' && task.descriptionAr ? task.descriptionAr : task.description;
  };
  
  return (
    <div className={styles.page} dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <Header title={t('tasks.title')} showBack />
      
      <div className={styles.content}>
        <p className={styles.subtitle}>{t('tasks.subtitle')}</p>
        
        {/* Available Tasks */}
        {availableTasks.length > 0 && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              {t('tasks.availableTasks')} ({availableTasks.length})
            </h2>
            <div className={styles.tasksList}>
              <AnimatePresence>
                {availableTasks.map((task, index) => {
                  const Icon = iconMap[task.icon] || Star;
                  return (
                    <motion.div
                      key={task._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card className={styles.taskCard}>
                        <CardContent className={styles.taskContent}>
                          <div className={styles.taskLeft}>
                            <div className={`${styles.taskIcon} ${styles[task.type]}`}>
                              <Icon size={20} />
                            </div>
                            <div className={styles.taskInfo}>
                              <h3 className={styles.taskTitle}>{getTaskTitle(task)}</h3>
                              <p className={styles.taskDescription}>
                                {getTaskDescription(task)}
                              </p>
                              <div className={styles.taskReward}>
                                <Coins size={14} />
                                <span>+{task.reward}</span>
                              </div>
                            </div>
                          </div>
                          <div className={styles.taskActions}>
                            {task.link && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleStartTask(task)}
                                icon={<ExternalLink size={16} />}
                              >
                                {t('tasks.goToTask')}
                              </Button>
                            )}
                            <Button
                              variant="primary"
                              size="sm"
                              loading={completingTask === task._id}
                              onClick={() => handleCompleteTask(task)}
                            >
                              {t('tasks.verifyTask')}
                            </Button>
                          </div>
                          
                          {/* Success Animation */}
                          <AnimatePresence>
                            {successMessage?.taskId === task._id && (
                              <motion.div
                                className={styles.successOverlay}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0 }}
                              >
                                <Check size={32} />
                                <span>+{successMessage.reward} {t('common.points')}</span>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </section>
        )}
        
        {/* Completed Tasks */}
        {completedTasks.length > 0 && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              {t('tasks.completedTasks')} ({completedTasks.length})
            </h2>
            <div className={styles.tasksList}>
              {completedTasks.map((task) => {
                const Icon = iconMap[task.icon] || Star;
                return (
                  <Card key={task._id} className={`${styles.taskCard} ${styles.completed}`}>
                    <CardContent className={styles.taskContent}>
                      <div className={styles.taskLeft}>
                        <div className={`${styles.taskIcon} ${styles.done}`}>
                          <Check size={20} />
                        </div>
                        <div className={styles.taskInfo}>
                          <h3 className={styles.taskTitle}>{getTaskTitle(task)}</h3>
                          <div className={styles.taskReward}>
                            <Coins size={14} />
                            <span>+{task.reward}</span>
                          </div>
                        </div>
                      </div>
                      <span className={styles.completedBadge}>
                        {t('common.completed')}
                      </span>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>
        )}
        
        {/* Empty State */}
        {!tasksLoading && tasks.length === 0 && (
          <div className={styles.emptyState}>
            <Star size={48} className={styles.emptyIcon} />
            <p>{t('tasks.noTasks')}</p>
          </div>
        )}
      </div>
    </div>
  );
}
