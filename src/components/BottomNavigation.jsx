
import { ShoppingCartIcon, ClipboardListIcon, ArchiveIcon } from '@heroicons/react/outline';
import { Link, useLocation } from 'react-router-dom';

const BottomNavigation = () => {
  const location = useLocation();
  const current = (path) => location.pathname === path;

  return (
    <nav className="fixed bottom-0 w-full bg-white dark:bg-gray-900 shadow-inner flex justify-around p-2 z-50 border-t border-gray-200 dark:border-gray-700">
      <Link to="/lista" className="flex flex-col items-center text-xs text-gray-700 dark:text-gray-200">
        <ClipboardListIcon className={`h-6 w-6 ${current("/lista") ? "text-blue-500" : ""}`} />
        Lista
      </Link>
      <Link to="/AdicionarItem" className="flex flex-col items-center text-xs text-gray-700 dark:text-gray-200">
        <ArchiveIcon className={`h-6 w-6 ${current("/AdicionarItem") ? "text-blue-500" : ""}`} />
        Adicionar
      </Link>
      <Link to="/carrinho" className="flex flex-col items-center text-xs text-gray-700 dark:text-gray-200">
        <ShoppingCartIcon className={`h-6 w-6 ${current("/carrinho") ? "text-blue-500" : ""}`} />
        Carrinho
      </Link>
      <Link to="/historico" className="flex flex-col items-center text-xs text-gray-700 dark:text-gray-200">
        <ClipboardListIcon className={`h-6 w-6 ${current("/historico") ? "text-blue-500" : ""}`} />
        Histórico
      </Link>
    </nav>
  );
};

export default BottomNavigation;
