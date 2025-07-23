import React from 'react';
import CategoryChart from '../components/CategoryChart';
, { useState, useEffect } from 'react';
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

  if (loading || userData.isLoading) {
    return (
      const categoriasMock = [
  { nome: 'Grãos', valor: 40 },
  { nome: 'Carnes', valor: 30 },
  { nome: 'Bebidas', valor: 20 },
  { nome: 'Outros', valor: 10 }
];

<div className="flex justify-center items-center h-64">
        const categoriasMock = [
  { nome: 'Grãos', valor: 40 },
  { nome: 'Carnes', valor: 30 },
  { nome: 'Bebidas', valor: 20 },
  { nome: 'Outros', valor: 10 }
];

<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    const categoriasMock = [
  { nome: 'Grãos', valor: 40 },
  { nome: 'Carnes', valor: 30 },
  { nome: 'Bebidas', valor: 20 },
  { nome: 'Outros', valor: 10 }
];

<div className="p-4">
      {/* Estatísticas */}
      const categoriasMock = [
  { nome: 'Grãos', valor: 40 },
  { nome: 'Carnes', valor: 30 },
  { nome: 'Bebidas', valor: 20 },
  { nome: 'Outros', valor: 10 }
];

<div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <h2 className="text-lg font-semibold mb-4 text-gray-800">📊 Estatísticas</h2>
        const categoriasMock = [
  { nome: 'Grãos', valor: 40 },
  { nome: 'Carnes', valor: 30 },
  { nome: 'Bebidas', valor: 20 },
  { nome: 'Outros', valor: 10 }
];

<div className="grid grid-cols-2 gap-4">
          const categoriasMock = [
  { nome: 'Grãos', valor: 40 },
  { nome: 'Carnes', valor: 30 },
  { nome: 'Bebidas', valor: 20 },
  { nome: 'Outros', valor: 10 }
];

<div className="text-center">
            const categoriasMock = [
  { nome: 'Grãos', valor: 40 },
  { nome: 'Carnes', valor: 30 },
  { nome: 'Bebidas', valor: 20 },
  { nome: 'Outros', valor: 10 }
];

<div className="text-2xl font-bold text-green-600">R$ {estatisticas.totalGasto?.toFixed(2)}</div>
            const categoriasMock = [
  { nome: 'Grãos', valor: 40 },
  { nome: 'Carnes', valor: 30 },
  { nome: 'Bebidas', valor: 20 },
  { nome: 'Outros', valor: 10 }
];

<div className="text-sm text-gray-600">Total Gasto</div>
          </div>
          const categoriasMock = [
  { nome: 'Grãos', valor: 40 },
  { nome: 'Carnes', valor: 30 },
  { nome: 'Bebidas', valor: 20 },
  { nome: 'Outros', valor: 10 }
];

<div className="text-center">
            const categoriasMock = [
  { nome: 'Grãos', valor: 40 },
  { nome: 'Carnes', valor: 30 },
  { nome: 'Bebidas', valor: 20 },
  { nome: 'Outros', valor: 10 }
];

<div className="text-2xl font-bold text-blue-600">{estatisticas.comprasRealizadas}</div>
            const categoriasMock = [
  { nome: 'Grãos', valor: 40 },
  { nome: 'Carnes', valor: 30 },
  { nome: 'Bebidas', valor: 20 },
  { nome: 'Outros', valor: 10 }
];

<div className="text-sm text-gray-600">Compras Realizadas</div>
          </div>
          const categoriasMock = [
  { nome: 'Grãos', valor: 40 },
  { nome: 'Carnes', valor: 30 },
  { nome: 'Bebidas', valor: 20 },
  { nome: 'Outros', valor: 10 }
];

<div className="text-center">
            const categoriasMock = [
  { nome: 'Grãos', valor: 40 },
  { nome: 'Carnes', valor: 30 },
  { nome: 'Bebidas', valor: 20 },
  { nome: 'Outros', valor: 10 }
];

<div className="text-2xl font-bold text-purple-600">{estatisticas.itensComprados}</div>
            const categoriasMock = [
  { nome: 'Grãos', valor: 40 },
  { nome: 'Carnes', valor: 30 },
  { nome: 'Bebidas', valor: 20 },
  { nome: 'Outros', valor: 10 }
];

<div className="text-sm text-gray-600">Itens Comprados</div>
          </div>
          const categoriasMock = [
  { nome: 'Grãos', valor: 40 },
  { nome: 'Carnes', valor: 30 },
  { nome: 'Bebidas', valor: 20 },
  { nome: 'Outros', valor: 10 }
];

<div className="text-center">
            const categoriasMock = [
  { nome: 'Grãos', valor: 40 },
  { nome: 'Carnes', valor: 30 },
  { nome: 'Bebidas', valor: 20 },
  { nome: 'Outros', valor: 10 }
];

<div className="text-2xl font-bold text-orange-600">R$ {estatisticas.gastoMedio?.toFixed(2)}</div>
            const categoriasMock = [
  { nome: 'Grãos', valor: 40 },
  { nome: 'Carnes', valor: 30 },
  { nome: 'Bebidas', valor: 20 },
  { nome: 'Outros', valor: 10 }
];

<div className="text-sm text-gray-600">Gasto Médio</div>
          </div>
        </div>
        const categoriasMock = [
  { nome: 'Grãos', valor: 40 },
  { nome: 'Carnes', valor: 30 },
  { nome: 'Bebidas', valor: 20 },
  { nome: 'Outros', valor: 10 }
];

<div className="mt-4 p-3 bg-gray-50 rounded-md">
          const categoriasMock = [
  { nome: 'Grãos', valor: 40 },
  { nome: 'Carnes', valor: 30 },
  { nome: 'Bebidas', valor: 20 },
  { nome: 'Outros', valor: 10 }
];

<div className="text-sm text-gray-600">Categoria Favorita:</div>
          const categoriasMock = [
  { nome: 'Grãos', valor: 40 },
  { nome: 'Carnes', valor: 30 },
  { nome: 'Bebidas', valor: 20 },
  { nome: 'Outros', valor: 10 }
];

<div className="font-medium text-gray-800">{estatisticas.categoriaFavorita}</div>
        </div>
      </div>

      {/* Filtros */}
      const categoriasMock = [
  { nome: 'Grãos', valor: 40 },
  { nome: 'Carnes', valor: 30 },
  { nome: 'Bebidas', valor: 20 },
  { nome: 'Outros', valor: 10 }
];

<div className="bg-white rounded-lg shadow-md p-4 mb-4">
        const categoriasMock = [
  { nome: 'Grãos', valor: 40 },
  { nome: 'Carnes', valor: 30 },
  { nome: 'Bebidas', valor: 20 },
  { nome: 'Outros', valor: 10 }
];

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
      const categoriasMock = [
  { nome: 'Grãos', valor: 40 },
  { nome: 'Carnes', valor: 30 },
  { nome: 'Bebidas', valor: 20 },
  { nome: 'Outros', valor: 10 }
];

<div className="space-y-4">
        {historicoFiltrado.length === 0 ? (
          const categoriasMock = [
  { nome: 'Grãos', valor: 40 },
  { nome: 'Carnes', valor: 30 },
  { nome: 'Bebidas', valor: 20 },
  { nome: 'Outros', valor: 10 }
];

<div className="text-center py-8 text-gray-500">
            const categoriasMock = [
  { nome: 'Grãos', valor: 40 },
  { nome: 'Carnes', valor: 30 },
  { nome: 'Bebidas', valor: 20 },
  { nome: 'Outros', valor: 10 }
];

<div className="text-4xl mb-2">📊</div>
            <p>Nenhuma compra encontrada</p>
            <p className="text-sm">Finalize algumas compras para ver o histórico</p>
          </div>
        ) : (
          historicoFiltrado.map((compra, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md p-4">
              const categoriasMock = [
  { nome: 'Grãos', valor: 40 },
  { nome: 'Carnes', valor: 30 },
  { nome: 'Bebidas', valor: 20 },
  { nome: 'Outros', valor: 10 }
];

<div className="flex justify-between items-center mb-3">
                const categoriasMock = [
  { nome: 'Grãos', valor: 40 },
  { nome: 'Carnes', valor: 30 },
  { nome: 'Bebidas', valor: 20 },
  { nome: 'Outros', valor: 10 }
];

<div className="text-sm text-gray-600">
                  📅 {formatarData(compra.data)}
                </div>
                const categoriasMock = [
  { nome: 'Grãos', valor: 40 },
  { nome: 'Carnes', valor: 30 },
  { nome: 'Bebidas', valor: 20 },
  { nome: 'Outros', valor: 10 }
];

<div className="text-lg font-bold text-green-600">
                  R$ {compra.valorTotal.toFixed(2)}
                </div>
              </div>
              
              const categoriasMock = [
  { nome: 'Grãos', valor: 40 },
  { nome: 'Carnes', valor: 30 },
  { nome: 'Bebidas', valor: 20 },
  { nome: 'Outros', valor: 10 }
];

<div className="space-y-2">
                {compra.itens.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center py-1 border-b border-gray-100 last:border-b-0">
                    <div>
                      <span className="font-medium">{item.nome}</span>
                      <span className="text-sm text-gray-600 ml-2">
                        ({item.quantidade}x • {item.categoria})
                      </span>
                    </div>
                    const categoriasMock = [
  { nome: 'Grãos', valor: 40 },
  { nome: 'Carnes', valor: 30 },
  { nome: 'Bebidas', valor: 20 },
  { nome: 'Outros', valor: 10 }
];

<div className="text-sm font-medium">
                      R$ {(item.preco * item.quantidade).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
              
              const categoriasMock = [
  { nome: 'Grãos', valor: 40 },
  { nome: 'Carnes', valor: 30 },
  { nome: 'Bebidas', valor: 20 },
  { nome: 'Outros', valor: 10 }
];

<div className="mt-3 pt-2 border-t border-gray-200">
                const categoriasMock = [
  { nome: 'Grãos', valor: 40 },
  { nome: 'Carnes', valor: 30 },
  { nome: 'Bebidas', valor: 20 },
  { nome: 'Outros', valor: 10 }
];

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
        const categoriasMock = [
  { nome: 'Grãos', valor: 40 },
  { nome: 'Carnes', valor: 30 },
  { nome: 'Bebidas', valor: 20 },
  { nome: 'Outros', valor: 10 }
];

<div className="bg-white rounded-lg shadow-md p-4 mt-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">📈 Gastos por Categoria</h3>
          const categoriasMock = [
  { nome: 'Grãos', valor: 40 },
  { nome: 'Carnes', valor: 30 },
  { nome: 'Bebidas', valor: 20 },
  { nome: 'Outros', valor: 10 }
];

<div className="space-y-3">
            {['Grãos', 'Laticínios', 'Frutas', 'Carnes', 'Padaria', 'Limpeza', 'Outros'].map((categoria) => {
              const gastoCategoria = historicoFiltrado.reduce((total, compra) => {
                return total + compra.itens
                  .filter(item => item.categoria === categoria)
                  .reduce((subtotal, item) => subtotal + (item.preco * item.quantidade), 0);
              }, 0);
              
              const porcentagem = estatisticas.totalGasto > 0 ? (gastoCategoria / estatisticas.totalGasto) * 100 : 0;
              
              if (gastoCategoria > 0) {
                return (
                  <div key={categoria} className="flex items-center">
                    const categoriasMock = [
  { nome: 'Grãos', valor: 40 },
  { nome: 'Carnes', valor: 30 },
  { nome: 'Bebidas', valor: 20 },
  { nome: 'Outros', valor: 10 }
];

<div className="w-20 text-sm text-gray-600">{categoria}</div>
                    const categoriasMock = [
  { nome: 'Grãos', valor: 40 },
  { nome: 'Carnes', valor: 30 },
  { nome: 'Bebidas', valor: 20 },
  { nome: 'Outros', valor: 10 }
];

<div className="flex-1 mx-3">
                      const categoriasMock = [
  { nome: 'Grãos', valor: 40 },
  { nome: 'Carnes', valor: 30 },
  { nome: 'Bebidas', valor: 20 },
  { nome: 'Outros', valor: 10 }
];

<div className="bg-gray-200 rounded-full h-4">
                        <div
                          className="bg-blue-500 h-4 rounded-full"
                          style={{ width: `${porcentagem}%` }}
                        ></div>
                      </div>
                    </div>
                    const categoriasMock = [
  { nome: 'Grãos', valor: 40 },
  { nome: 'Carnes', valor: 30 },
  { nome: 'Bebidas', valor: 20 },
  { nome: 'Outros', valor: 10 }
];

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


<CategoryChart categorias={categoriasMock} />