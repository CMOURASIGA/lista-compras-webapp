
import React, { useState, useEffect } from 'react';
import { useUserData } from '../contexts/UserDataContext';
import CategoryChart from '../components/CategoryChart';

const Historico = () => {
  const { userData } = useUserData();
  const [estatisticas, setEstatisticas] = useState({});
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

      const totalGasto = historicoFormatado.reduce((soma, compra) => soma + compra.valorTotal, 0);
      const itensComprados = historicoFormatado.reduce((soma, compra) => {
        return soma + compra.itens.reduce((qtd, item) => qtd + item.quantidade, 0);
      }, 0);

      const categorias = {};
      historicoFormatado.forEach(compra => {
        compra.itens.forEach(item => {
          categorias[item.categoria] = (categorias[item.categoria] || 0) + item.quantidade;
        });
      });

      const categoriaFavorita = Object.entries(categorias).sort((a, b) => b[1] - a[1])[0]?.[0] || '-';

      setEstatisticas({
        totalGasto,
        comprasRealizadas: historicoFormatado.length,
        itensComprados,
        gastoMedio: historicoFormatado.length > 0 ? totalGasto / historicoFormatado.length : 0,
        categoriaFavorita
      });

      setLoading(false);
    }
  }, [userData.historico]);

  const formatarData = (data) => {
    if (typeof data === 'string' && data.includes('/')) {
      return data;
    }
    return new Date(data).toLocaleDateString('pt-BR');
  };

  const historicoFormatado = userData.historico ? userData.historico.map(item => ({
    data: item.data,
    valorTotal: item.total || (item.preco * item.quantidade),
    itens: [{
      nome: item.item,
      quantidade: item.quantidade,
      categoria: item.categoria,
      preco: item.preco
    }]
  })) : [];

  const historicoFiltrado = filtroMes === 'todos'
    ? historicoFormatado
    : historicoFormatado.filter(compra => {
        const dataCompra = new Date(compra.data.split('/').reverse().join('-'));
        const mesAtual = new Date();
        return dataCompra.getMonth() === mesAtual.getMonth() &&
               dataCompra.getFullYear() === mesAtual.getFullYear();
      });

  const gastoCategoriaReal = {};
  historicoFiltrado.forEach(compra => {
    compra.itens.forEach(item => {
      const categoria = item.categoria || 'Outros';
      gastoCategoriaReal[categoria] = (gastoCategoriaReal[categoria] || 0) + (item.preco * item.quantidade);
    });
  });
  const categoriasParaGrafico = Object.entries(gastoCategoriaReal).map(([nome, valor]) => ({ nome, valor }));

  if (loading || userData.isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <h2 className="text-lg font-semibold mb-4 text-gray-800">📊 Estatísticas</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center"><div className="text-2xl font-bold text-green-600">R$ {estatisticas.totalGasto?.toFixed(2)}</div><div className="text-sm text-gray-600">Total Gasto</div></div>
          <div className="text-center"><div className="text-2xl font-bold text-blue-600">{estatisticas.comprasRealizadas}</div><div className="text-sm text-gray-600">Compras Realizadas</div></div>
          <div className="text-center"><div className="text-2xl font-bold text-purple-600">{estatisticas.itensComprados}</div><div className="text-sm text-gray-600">Itens Comprados</div></div>
          <div className="text-center"><div className="text-2xl font-bold text-orange-600">R$ {estatisticas.gastoMedio?.toFixed(2)}</div><div className="text-sm text-gray-600">Gasto Médio</div></div>
        </div>
        <div className="mt-4 p-3 bg-gray-50 rounded-md"><div className="text-sm text-gray-600">Categoria Favorita:</div><div className="font-medium text-gray-800">{estatisticas.categoriaFavorita}</div></div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-4 mb-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800">📝 Histórico de Compras</h2>
          <select
            value={filtroMes}
            onChange={(e) => setFiltroMes(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="todos">Todos os meses</option>
            <option value="atual">Mês atual</option>
          </select>
        </div>
      </div>

      {historicoFiltrado.map((compra, index) => (
        <div key={index} className="bg-white rounded-lg shadow-md p-4 mb-4">
          <div className="flex justify-between items-center mb-3">
            <div className="text-sm text-gray-600">📅 {formatarData(compra.data)}</div>
            <div className="text-lg font-bold text-green-600">R$ {compra.valorTotal.toFixed(2)}</div>
          </div>
          <div className="space-y-2">
            {compra.itens.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center py-1 border-b border-gray-100 last:border-b-0">
                <div>
                  <span className="font-medium">{item.nome}</span>
                  <span className="text-sm text-gray-600 ml-2">({item.quantidade}x • {item.categoria})</span>
                </div>
                <div className="text-sm font-medium">R$ {(item.preco * item.quantidade).toFixed(2)}</div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {categoriasParaGrafico.length > 0 && (
        <CategoryChart categorias={categoriasParaGrafico} />
      )}
    </div>
  );
};

export default Historico;
