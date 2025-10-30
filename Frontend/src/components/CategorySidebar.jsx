import { Tag, ChevronRight } from 'lucide-react';

export const CategorySidebar = ({ categorias, selectedCategory, onSelectCategory, productCount }) => {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 sticky top-24">
      <div className="flex items-center space-x-2 mb-6">
        <Tag className="w-6 h-6 text-primary" />
        <h2 className="text-2xl font-bold text-gray-900">Categorías</h2>
      </div>

      <div className="space-y-2">
        {/* Opción "Todas las categorías" */}
        <button
          onClick={() => onSelectCategory('')}
          className={`w-full flex items-center justify-between p-3 rounded-lg transition-all duration-200 ${
            selectedCategory === ''
              ? 'bg-primary text-white shadow-md'
              : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
          }`}
        >
          <div className="flex items-center space-x-3">
            <div className={`w-2 h-2 rounded-full ${
              selectedCategory === '' ? 'bg-white' : 'bg-primary'
            }`} />
            <span className="font-medium">Todas las categorías</span>
          </div>
          {selectedCategory === '' && (
            <ChevronRight className="w-5 h-5" />
          )}
        </button>

        {/* Lista de categorías */}
        {categorias.map((categoria) => {
          const count = productCount[categoria] || 0;
          const isSelected = selectedCategory === categoria;

          return (
            <button
              key={categoria}
              onClick={() => onSelectCategory(categoria)}
              className={`w-full flex items-center justify-between p-3 rounded-lg transition-all duration-200 ${
                isSelected
                  ? 'bg-primary text-white shadow-md'
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-2 h-2 rounded-full ${
                  isSelected ? 'bg-white' : 'bg-primary'
                }`} />
                <span className="font-medium">{categoria}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`text-sm px-2 py-1 rounded-full ${
                  isSelected
                    ? 'bg-white/20 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {count}
                </span>
                {isSelected && (
                  <ChevronRight className="w-5 h-5" />
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Información adicional */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <p className="text-sm text-gray-600">
          Total de productos disponibles
        </p>
        <p className="text-2xl font-bold text-primary mt-1">
          {Object.values(productCount).reduce((a, b) => a + b, 0)}
        </p>
      </div>
    </div>
  );
};
