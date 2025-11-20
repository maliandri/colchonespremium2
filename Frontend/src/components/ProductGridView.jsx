import { ProductCard } from './ProductCard';

export const ProductGridView = ({ products }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {products.map((producto) => (
        <ProductCard key={producto._id} product={producto} />
      ))}
    </div>
  );
};
