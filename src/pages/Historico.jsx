import React, { useState, useEffect } from 'react';
import { useUserData } from '../contexts/UserDataContext';
import { formatCurrency } from '../utils/formatCurrency';
import { BarChart, PieChart, Calendar, TrendingUp, ShoppingBag, Tag } from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const Historico = () => {
  const { userData } = useUserData();
  const [estatisticas, setEstatisticas] = useState({});
  const [chartData, setChartData] = useState({ datasets: [] });
  const [loading, setLoading] = useState(true);
  const [filtroMes, setFiltroMes] = useState('todos');

  useEffect(() => {
    if (userData.historico) {
      const historicoFormatado = userData.historico.map(item => ({
        data: item.data,
        valorTotal: item.total || (item.preco * item.quantidade),
        itens: [{
          nome: item.item,
          quantidade: item.quantidade,
          categoria: item.categoria,
          preco: item.preco
        }]
      }));

      const historicoFiltrado = filtroMes === 'todos'
        ? historicoFormatado
        : historicoFormatado.filter(compra => {
            const dataParts = compra.data.split('/');
            if (dataParts.length !== 3) return false;
            const dataCompra = new Date(dataParts[2], dataParts[1] - 1, dataParts[0]);
            const mesAtual = new Date();
            return dataCompra.getMonth() === mesAtual.getMonth() &&
                   dataCompra.getFullYear() === mesAtual.getFullYear();
          });

      const totalGasto = historicoFiltrado.reduce((soma, compra) => soma + compra.valorTotal, 0);
      const itensComprados = historicoFiltrado.reduce((soma, compra) => {
        return soma + compra.itens.reduce((qtd, item) => qtd + item.quantidade, 0);
      }, 0);

      const categorias = {};
      historicoFiltrado.forEach(compra => {
        compra.itens.forEach(item => {
          categorias[item.categoria] = (categorias[item.categoria] || 0) + (item.preco * item.quantidade);
        });
      });

      const categoriaFavorita = Object.entries(categorias).sort((a, b) => b[1] - a[1])[0]?.[0] || '-';

      setEstatisticas({
        totalGasto,
        comprasRealizadas: historicoFiltrado.length,
        itensComprados,
        gastoMedio: historicoFiltrado.length > 0 ? totalGasto / historicoFiltrado.length : 0,
        categoriaFavorita
      });

      setChartData({
        labels: Object.keys(categorias),
        datasets: [
          {
            label: 'Gasto por Categoria',
            data: Object.values(categorias),
            backgroundColor: [
              'rgba(255, 99, 132, 0.7)',
              'rgba(54, 162, 235, 0.7)',
              'rgba(255, 206, 86, 0.7)',
              'rgba(75, 192, 192, 0.7)',
              'rgba(153, 102, 255, 0.7)',
              'rgba(255, 159, 64, 0.7)',
            ],
            borderColor: [
              'rgba(255, 99, 132, 1)',
              'rgba(54, 162, 235, 1)',
              'rgba(255, 206, 86, 1)',
              'rgba(75, 192, 192, 1)',
              'rgba(153, 102, 255, 1)',
              'rgba(255, 159, 64, 1)',
            ],
            borderWidth: 1,
          },
        ],
      });

      setLoading(false);
    }
  }, [userData.historico, filtroMes]);

  const formatarData = (data) => {
    if (typeof data === 'string' && data.includes('/')) {
      return data;
    }
    return new Date(data).toLocaleDateString('pt-BR');
  };

  const historicoFiltrado = (filtroMes === 'todos'
    ? userData.historico
    : userData.historico.filter(item => {
        const dataParts = item.data.split('/');
        if (dataParts.length !== 3) return false;
        const dataCompra = new Date(dataParts[2], dataParts[1] - 1, dataParts[0]);
        const mesAtual = new Date();
        return dataCompra.getMonth() === mesAtual.getMonth() &&
               dataCompra.getFullYear() === mesAtual.getFullYear();
      })) || [];

  if (loading || userData.isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-4xl mx-auto pb-20">
      {/* Estatísticas */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white flex items-center"><BarChart className="mr-2"/>Estatísticas</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-green-50 dark:bg-green-900/50 rounded-xl">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{formatCurrency(estatisticas.totalGasto)}</div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Total Gasto</div>
          </div>
          <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/50 rounded-xl">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{estatisticas.comprasRealizadas}</div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Compras</div>
          </div>
          <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/50 rounded-xl">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{estatisticas.itensComprados}</div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Itens</div>
          </div>
          <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/50 rounded-xl">
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{formatCurrency(estatisticas.gastoMedio)}</div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Gasto Médio</div>
          </div>
        </div>
        <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
          <div className="text-sm text-gray-600 dark:text-gray-300 flex items-center"><Tag className="mr-2"/>Categoria Favorita:</div>
          <div className="font-semibold text-gray-800 dark:text-white text-lg">{estatisticas.categoriaFavorita}</div>
        </div>
      </div>

      {/* Gráfico */}
      {historicoFiltrado.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white flex items-center"><PieChart className="mr-2"/>Gastos por Categoria</h3>
          <div className="max-w-sm mx-auto">
            <Doughnut data={chartData} />
          </div>
        </div>
      )}

      {/* Filtros e Histórico */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center"><Calendar className="mr-2"/>Histórico de Compras</h2>
          <select
            value={filtroMes}
            onChange={(e) => setFiltroMes(e.target.value)}
            className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
          >
            <option value="todos">Todos os meses</option>
            <option value="atual">Mês atual</option>
          </select>
        </div>

        <div className="space-y-4">
          {historicoFiltrado.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <ShoppingBag className="mx-auto w-12 h-12 mb-4"/>
              <p>Nenhuma compra encontrada</p>
              <p className="text-sm">Finalize algumas compras para ver o histórico</p>
            </div>
          ) : (
            historicoFiltrado.map((compra, index) => (
              <div key={index} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <div className="flex justify-between items-center mb-3">
                  <div className="text-sm text-gray-600 dark:text-gray-300 flex items-center">
                    <Calendar size={16} className="mr-2"/> {formatarData(compra.data)}
                  </div>
                  <div className="text-lg font-bold text-green-600 dark:text-green-400">
                    {formatCurrency(compra.total || (compra.preco * compra.quantidade))}
                  </div>
                </div>
                
                <div className="space-y-2">
                    <div className="flex justify-between items-center py-1 border-b border-gray-200 dark:border-gray-600 last:border-b-0">
                      <div>
                        <span className="font-medium text-gray-800 dark:text-gray-200">{compra.item}</span>
                        <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">
                          ({compra.quantidade}x • {compra.categoria})
                        </span>
                      </div>
                      <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {formatCurrency(compra.preco * compra.quantidade)}
                      </div>
                    </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Historico;
