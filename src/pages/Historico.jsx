import React, { useState, useEffect } from 'react';

const Historico = () => {
  const [historico, setHistorico] = useState([]);
  const [estatisticas, setEstatisticas] = useState({});
  const [loading, setLoading] = useState(true);
  const [filtroMes, setFiltroMes] = useState('todos');

  useEffect(() => {
    // Simular carregamento de dados do histórico
    // Futuramente será integrado com Google Sheets
    const mockHistorico = [
      {
        id: 1,
        data: '2025-01-15',
        itens: [
          { nome: 'Leite', quantidade: 3, categoria: 'Laticínios', preco: 4.50 },
          { nome: 'Pão', quantidade: 2, categoria: 'Padaria', preco: 3.00 }
        ],
        valorTotal: 19.50
      },
      {
        id: 2,
        data: '2025-01-10',
        itens: [
          { nome: 'Arroz', quantidade: 2, categoria: 'Grãos', preco: 8.50 },
          { nome: 'Feijão', quantidade: 1, categoria: 'Grãos', preco: 6.00 },
          { nome: 'Carne', quantidade: 1, categoria: 'Carnes', preco: 25.00 }
        ],
        valorTotal: 48.00
      },
      {
        id: 3,
        data: '2025-01-05',
        itens: [
          { nome: 'Banana', quantidade: 6, categoria: 'Frutas', preco: 1.50 },
          { nome: 'Maçã', quantidade: 4, categoria: 'Frutas', preco: 2.00 }
        ],
        valorTotal: 17.00
      }
    ];

    const mockEstatisticas = {
      totalGasto: 84.50,
      comprasRealizadas: 3,
      itensComprados: 19,
      categoriaFavorita: 'Grãos',
      gastoMedio: 28.17
    };

    setTimeout(() => {
      setHistorico(mockHistorico);
      setEstatisticas(mockEstatisticas);
      setLoading(false);
    }, 1000);
  }, []);

  const formatarData = (data) => {
    return new Date(data).toLocaleDateString('pt-BR');
  };

  const historicoFiltrado = filtroMes === 'todos' 
    ? historico 
    : historico.filter(compra => {
        const dataCompra = new Date(compra.data);
        const mesAtual = new Date();
        return dataCompra.getMonth() === mesAtual.getMonth() && 
               dataCompra.getFullYear() === mesAtual.getFullYear();
      });

  if (loading) {
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
          historicoFiltrado.map((compra) => (
            <div key={compra.id} className="bg-white rounded-lg shadow-md p-4">
              <div className="flex justify-between items-center mb-3">
                <div className="text-sm text-gray-600">
                  📅 {formatarData(compra.data)}
                </div>
                <div className="text-lg font-bold text-green-600">
                  R$ {compra.valorTotal.toFixed(2)}
                </div>
              </div>
              
              <div className="space-y-2">
                {compra.itens.map((item, index) => (
                  <div key={index} className="flex justify-between items-center py-1 border-b border-gray-100 last:border-b-0">
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

      {/* Gráfico Simples de Gastos por Categoria */}
      {historicoFiltrado.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-4 mt-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">📈 Gastos por Categoria</h3>
          <div className="space-y-3">
            {['Grãos', 'Laticínios', 'Frutas', 'Carnes', 'Padaria'].map((categoria) => {
              const gastoCategoria = historicoFiltrado.reduce((total, compra) => {
                return total + compra.itens
                  .filter(item => item.categoria === categoria)
                  .reduce((subtotal, item) => subtotal + (item.preco * item.quantidade), 0);
              }, 0);
              
              const porcentagem = estatisticas.totalGasto > 0 ? (gastoCategoria / estatisticas.totalGasto) * 100 : 0;
              
              if (gastoCategoria > 0) {
                return (
                  <div key={categoria} className="flex items-center">
                    <div className="w-20 text-sm text-gray-600">{categoria}</div>
                    <div className="flex-1 mx-3">
                      <div className="bg-gray-200 rounded-full h-4">
                        <div
                          className="bg-blue-500 h-4 rounded-full"
                          style={{ width: `${porcentagem}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="w-16 text-sm font-medium text-right">
                      R$ {gastoCategoria.toFixed(2)}
                    </div>
                  </div>
                );
              }
              return null;
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default Historico;

