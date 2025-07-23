
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const CategoryChart = ({ categorias }) => {
  if (!categorias || categorias.length === 0) return <p className="text-center text-gray-500 mt-4">Sem dados para exibir</p>;

  const data = {
    labels: categorias.map(c => c.nome),
    datasets: [
      {
        data: categorias.map(c => c.valor),
        backgroundColor: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'],
        borderColor: '#fff',
        borderWidth: 2
      }
    ]
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md mt-6">
      <h2 className="text-center font-semibold text-gray-800 dark:text-gray-100 mb-4">📊 Gastos por Categoria</h2>
      <Pie data={data} />
    </div>
  );
};

export default CategoryChart;
