import React from 'react';
import { NavLink } from 'react-router-dom';
import { ShoppingCart, List, History } from 'lucide-react';

const BottomNavigation = () => {
  const activeLinkClass = 'text-blue-600 dark:text-blue-400';
  const inactiveLinkClass = 'text-gray-500 dark:text-gray-400';

  return (
    <nav className="fixed bottom-0 w-full bg-white dark:bg-gray-800 shadow-inner flex justify-around p-2">
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
