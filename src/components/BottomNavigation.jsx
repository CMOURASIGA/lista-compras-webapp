import React from 'react';
import { NavLink } from 'react-router-dom';
import { ShoppingCart, List, History, Plus } from 'lucide-react';

const BottomNavigation = () => {
  const activeLinkClass = 'text-primary dark:text-accent';
  const inactiveLinkClass = 'text-text-muted dark:text-text-muted-dark';

  return (
    <nav className="fixed bottom-0 w-full bg-white dark:bg-bg-dark shadow-inner flex justify-around items-center p-2 border-t border-gray-200 dark:border-gray-700">
      <NavLink
        to="/lista"
        className={({ isActive }) =>
          `flex flex-col items-center ${isActive ? activeLinkClass : inactiveLinkClass}`
        }
      >
        <List />
        <span className="text-xs">Lista</span>
      </NavLink>
      <NavLink
        to="/carrinho"
        className={({ isActive }) =>
          `flex flex-col items-center ${isActive ? activeLinkClass : inactiveLinkClass}`
        }
      >
        <ShoppingCart />
        <span className="text-xs">Carrinho</span>
      </NavLink>
      <NavLink
        to="/adicionar"
        className="flex flex-col items-center text-white bg-primary hover:bg-primary-dark rounded-full p-3 shadow-lg -mt-8"
      >
        <Plus />
      </NavLink>
      <NavLink
        to="/historico"
        className={({ isActive }) =>
          `flex flex-col items-center ${isActive ? activeLinkClass : inactiveLinkClass}`
        }
      >
        <History />
        <span className="text-xs">Histórico</span>
      </NavLink>
    </nav>
  );
};

export default BottomNavigation;
