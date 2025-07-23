import React, { useState, useEffect } from 'react';
import { useUserData } from '../contexts/UserDataContext';
import { BarChart3, Calendar, Filter, TrendingUp, Package, DollarSign } from 'lucide-react';

const Historico = () => {
  const { userData } = useUserData();
  const [estatisticas, setEstatisticas] = useState({});
  const [loading, setLoading] = useState(true);
  const [filtroMes, setFiltroMes] = useState('todos');

  useEffect(() => {
    if (userData.historico) {
      // Converter dados do histórico para o formato esperado
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

  const calcularGastosPorCategoria = () => {
    const gastosPorCategoria = {};
    
    historicoFiltrado.forEach(compra => {
      compra.itens.forEach(item => {
        const categoria = item.categoria;
        const valor = item.preco * item.quantidade;
        gastosPorCategoria[categoria] = (gastosPorCategoria[categoria] || 0) + valor;
      });
    });

    return gastosPorCategoria;
  };

  const gastosPorCategoria = calcularGastosPorCategoria();
  const totalGastos = Object.values(gastosPorCategoria).reduce((sum, valor) => sum + valor, 0);

  const categorias = [
    { nome: 'Grãos e Cereais', cor: 'bg-yellow-500', emoji: '🌾' },
    { nome: 'Carnes e Peixes', cor: 'bg-red-500', emoji: '🥩' },
    { nome: 'Laticínios', cor: 'bg-blue-500', emoji: '🥛' },
    { nome: 'Frutas', cor: 'bg-green-500', emoji: '🍎' },
    { nome: 'Verduras e Legumes', cor: 'bg-emerald-500', emoji: '🥬' },
    { nome: 'Bebidas', cor: 'bg-purple-500', emoji: '🥤' },
    { nome: 'Limpeza', cor: 'bg-cyan-500', emoji: '🧽' },
    { nome: 'Higiene', cor: 'bg-pink-500', emoji: '🧴' },
    { nome: 'Padaria', cor: 'bg-orange-500', emoji: '🍞' },
    { nome: 'Congelados', cor: 'bg-indigo-500', emoji: '🧊' },
    { nome: 'Outros', cor: 'bg-gray-500', emoji: '📦' }
  ];

  const getEmojiForCategory = (categoria) => {
    return categorias.find(c => c.nome === categoria)?.emoji || '📦';
  };

  const getColorForCategory = (categoria) => {
    return categorias.find(c => c.nome === categoria)?.cor || 'bg-gray-500';
  };

  if (loading || userData.isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando histórico...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-20 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-6 rounded-b-3xl shadow-lg mb-6">
        <div className="flex items-center space-x-3 mb-4">
          <BarChart3 className="w-8 h-8" />
          <h1 className="text-2xl font-bold">Histórico</h1>
        </div>
        <p className="text-purple-100">Acompanhe seus gastos e estatísticas</p>
      </div>

      <div className="px-4">
        {/* Estatísticas Cards */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-2xl shadow-sm p-4 text-center">
            <DollarSign className="w-6 h-6 mx-auto mb-2 text-green-600" />
            <div className="text-2xl font-bold text-green-600">R$ {estatisticas.totalGasto?.toFixed(2)}</div>
            <div className="text-sm text-gray-600">Total Gasto</div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-4 text-center">
            <Package className="w-6 h-6 mx-auto mb-2 text-blue-600" />
            <div className="text-2xl font-bold text-blue-600">{estatisticas.comprasRealizadas}</div>
            <div className="text-sm text-gray-600">Compras</div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-4 text-center">
            <TrendingUp className="w-6 h-6 mx-auto mb-2 text-purple-600" />
            <div className="text-2xl font-bold text-purple-600">{estatisticas.itensComprados}</div>
            <div className="text-sm text-gray-600">Itens Total</div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-4 text-center">
            <Calendar className="w-6 h-6 mx-auto mb-2 text-orange-600" />
            <div className="text-2xl font-bold text-orange-600">R$ {estatisticas.gastoMedio?.toFixed(2)}</div>
            <div className="text-sm text-gray-600">Gasto Médio</div>
          </div>
        </div>

        {/* Categoria Favorita */}
        <div className="bg-white rounded-2xl shadow-sm p-4 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center space-x-2">
            <span>🏆</span>
            <span>Categoria Favorita</span>
          </h3>
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{getEmojiForCategory(estatisticas.categoriaFavorita)}</span>
            <span className="font-medium text-gray-800 text-lg">{estatisticas.categoriaFavorita}</span>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-2xl shadow-sm p-4 mb-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center space-x-2">
              <Calendar className="w-5 h-5" />
              <span>Histórico de Compras</span>
            </h2>
            <select
              value={filtroMes}
              onChange={(e) => setFiltroMes(e.target.value)}
              className="px-3 py-2 bg-gray-50 border-0 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 transition-all"
            >
              <option value="todos">Todos os meses</option>
              <option value="atual">Mês atual</option>
            </select>
          </div>
        </div>

        {/* Lista do Histórico */}
        <div className="space-y-4 mb-6">
          {historicoFiltrado.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl shadow-sm">
              <div className="text-6xl mb-4">📊</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Nenhuma compra encontrada</h3>
              <p className="text-gray-600">Finalize algumas compras para ver o histórico</p>
            </div>
          ) : (
            historicoFiltrado.map((compra, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-sm p-4">
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>{formatarData(compra.data)}</span>
                  </div>
                  <div className="text-lg font-bold text-green-600">
                    R$ {compra.valorTotal.toFixed(2)}
                  </div>
                </div>
                
                <div className="space-y-3">
                  {compra.itens.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                      <div className="flex items-center space-x-3">
                        <span className="text-xl">{getEmojiForCategory(item.categoria)}</span>
                        <div>
                          <span className="font-medium text-gray-800">{item.nome}</span>
                          <div className="text-sm text-gray-500 flex items-center space-x-2">
                            <span className="bg-gray-100 px-2 py-1 rounded-full text-xs">
                              {item.quantidade}x
                            </span>
                            <span className={`px-2 py-1 rounded-full text-white text-xs ${
                              getColorForCategory(item.categoria)
                            }`}>
                              {item.categoria}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-sm font-medium text-gray-700">
                        R$ {(item.preco * item.quantidade).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="text-sm text-gray-600 text-center">
                    {compra.itens.length} {compra.itens.length === 1 ? 'item' : 'itens'} comprados
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Gráfico de Gastos por Categoria */}
        {historicoFiltrado.length > 0 && Object.keys(gastosPorCategoria).length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-purple-600" />
              <span>Gastos por Categoria</span>
            </h3>
            <div className="space-y-4">
              {Object.entries(gastosPorCategoria)
                .sort(([,a], [,b]) => b - a)
                .map(([categoria, gastoCategoria]) => {
                  const porcentagem = totalGastos > 0 ? (gastoCategoria / totalGastos) * 100 : 0;
                  const corBarra = getColorForCategory(categoria);
                  
                  return (
                    <div key={categoria} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">{getEmojiForCategory(categoria)}</span>
                          <span className="font-medium text-gray-800">{categoria}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-gray-800">R$ {gastoCategoria.toFixed(2)}</div>
                          <div className="text-xs text-gray-500">{porcentagem.toFixed(1)}%</div>
                        </div>
                      </div>
                      
                      <div className="bg-gray-200 rounded-full h-3 relative overflow-hidden">
                        <div
                          className={`${corBarra} h-3 rounded-full transition-all duration-700 ease-out`}
                          style={{ width: `${Math.max(porcentagem, 2)}%` }}
                        ></div>
                        {porcentagem >= 15 && (
                          <div className="absolute inset-0 flex items-center justify-center text-white text-xs font-medium">
                            {porcentagem.toFixed(1)}%
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
            
            {/* Resumo do total */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <div className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                  <DollarSign className="w-4 h-4" />
                  <span>Total Geral:</span>
                </div>
                <div className="text-xl font-bold text-gray-800">R$ {totalGastos.toFixed(2)}</div>
              </div>
            </div>
          </div>
        )}

        {/* Mensagem quando não há dados para o gráfico */}
        {historicoFiltrado.length > 0 && Object.keys(gastosPorCategoria).length === 0 && (
          <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
            <div className="text-gray-500">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-lg font-medium mb-2">Gráfico não disponível</h3>
              <p className="text-sm">Não há dados suficientes para gerar o gráfico de gastos por categoria.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Historico;