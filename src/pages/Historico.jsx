import React, { useState, useEffect } from 'react';
import { useUserData } from '../contexts/UserDataContext';

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
    // Se a data já está no formato brasileiro, retorna como está
    if (typeof data === 'string' && data.includes('/')) {
      return data;
    }
    return new Date(data).toLocaleDateString('pt-BR');
  };

  // Converter dados do histórico para o formato esperado para exibição
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
        const dataCompra = new Date(compra.data.split('/').reverse().join('-')); // Converte DD/MM/YYYY para YYYY-MM-DD
        const mesAtual = new Date();
        return dataCompra.getMonth() === mesAtual.getMonth() &&
               dataCompra.getFullYear() === mesAtual.getFullYear();
      });

  // FUNÇÃO CORRIGIDA: Calcular gastos por categoria dinamicamente
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

  if (loading || userData.isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* Estatísticas */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <h2 className="text-lg font-semibold mb-4 text-gray-800">📊 Estatísticas</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">R$ {estatisticas.totalGasto?.toFixed(2)}</div>
            <div className="text-sm text-gray-600">Total Gasto</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{estatisticas.comprasRealizadas}</div>
            <div className="text-sm text-gray-600">Compras Realizadas</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{estatisticas.itensComprados}</div>
            <div className="text-sm text-gray-600">Itens Comprados</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">R$ {estatisticas.gastoMedio?.toFixed(2)}</div>
            <div className="text-sm text-gray-600">Gasto Médio</div>
          </div>
        </div>
        <div className="mt-4 p-3 bg-gray-50 rounded-md">
          <div className="text-sm text-gray-600">Categoria Favorita:</div>
          <div className="font-medium text-gray-800">{estatisticas.categoriaFavorita}</div>
        </div>
      </div>

      {/* Filtros */}
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

      {/* Lista do Histórico */}
      <div className="space-y-4">
        {historicoFiltrado.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">📊</div>
            <p>Nenhuma compra encontrada</p>
            <p className="text-sm">Finalize algumas compras para ver o histórico</p>
          </div>
        ) : (
          historicoFiltrado.map((compra, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md p-4">
              <div className="flex justify-between items-center mb-3">
                <div className="text-sm text-gray-600">
                  📅 {formatarData(compra.data)}
                </div>
                <div className="text-lg font-bold text-green-600">
                  R$ {compra.valorTotal.toFixed(2)}
                </div>
              </div>
              
              <div className="space-y-2">
                {compra.itens.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center py-1 border-b border-gray-100 last:border-b-0">
                    <div>
                      <span className="font-medium">{item.nome}</span>
                      <span className="text-sm text-gray-600 ml-2">
                        ({item.quantidade}x • {item.categoria})
                      </span>
                    </div>
                    <div className="text-sm font-medium">
                      R$ {(item.preco * item.quantidade).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-3 pt-2 border-t border-gray-200">
                <div className="text-sm text-gray-600">
                  {compra.itens.length} {compra.itens.length === 1 ? 'item' : 'itens'} comprados
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* SEÇÃO CORRIGIDA: Gráfico de Gastos por Categoria */}
      {historicoFiltrado.length > 0 && Object.keys(gastosPorCategoria).length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-4 mt-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">📈 Gastos por Categoria</h3>
          <div className="space-y-3">
            {Object.entries(gastosPorCategoria)
              .sort(([,a], [,b]) => b - a) // Ordenar por valor decrescente
              .map(([categoria, gastoCategoria]) => {
                const porcentagem = totalGastos > 0 ? (gastoCategoria / totalGastos) * 100 : 0;
                
                // Definir cores diferentes para cada categoria
                const cores = {
                  'Grãos e Cereais': 'bg-yellow-500',
                  'Carnes e Peixes': 'bg-red-500',
                  'Laticínios': 'bg-blue-500',
                  'Frutas': 'bg-green-500',
                  'Verduras e Legumes': 'bg-emerald-500',
                  'Bebidas': 'bg-purple-500',
                  'Limpeza': 'bg-cyan-500',
                  'Higiene': 'bg-pink-500',
                  'Padaria': 'bg-orange-500',
                  'Congelados': 'bg-indigo-500',
                  'Outros': 'bg-gray-500'
                };
                
                const corBarra = cores[categoria] || 'bg-gray-500';
                
                return (
                  <div key={categoria} className="flex items-center">
                    <div className="w-32 text-sm text-gray-600 pr-2 truncate" title={categoria}>
                      {categoria}
                    </div>
                    <div className="flex-1 mx-3">
                      <div className="bg-gray-200 rounded-full h-4 relative">
                        <div
                          className={`${corBarra} h-4 rounded-full transition-all duration-500 ease-out`}
                          style={{ width: `${Math.max(porcentagem, 2)}%` }} // Mínimo 2% para visibilidade
                        ></div>
                        {porcentagem >= 10 && (
                          <div className="absolute inset-0 flex items-center justify-center text-white text-xs font-medium">
                            {porcentagem.toFixed(1)}%
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="w-20 text-sm font-medium text-right">
                      R$ {gastoCategoria.toFixed(2)}
                    </div>
                    {porcentagem < 10 && (
                      <div className="w-12 text-xs text-gray-500 text-right ml-2">
                        {porcentagem.toFixed(1)}%
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
          
          {/* Resumo do total */}
          <div className="mt-4 pt-3 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <div className="text-sm font-medium text-gray-700">Total Geral:</div>
              <div className="text-lg font-bold text-gray-800">R$ {totalGastos.toFixed(2)}</div>
            </div>
          </div>
        </div>
      )}

      {/* Mensagem quando não há dados para o gráfico */}
      {historicoFiltrado.length > 0 && Object.keys(gastosPorCategoria).length === 0 && (
        <div className="bg-white rounded-lg shadow-md p-6 mt-6 text-center">
          <div className="text-gray-500">
            <div className="text-4xl mb-2">📊</div>
            <h3 className="text-lg font-medium mb-2">Gráfico não disponível</h3>
            <p className="text-sm">Não há dados suficientes para gerar o gráfico de gastos por categoria.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Historico;