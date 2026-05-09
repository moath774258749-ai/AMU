import { Outlet } from 'react-router-dom';
import { BottomNav } from './BottomNav';
import styles from './Layout.module.css';

export function Layout() {
  return (
    <div className={styles.layout}>
      <main className={styles.main}>
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
