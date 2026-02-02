'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ProductCard } from './ProductCard';

export const ProductCarouselView = ({ products, categorias }) => {
  const productsByCategory = {};
  categorias.forEach(categoria => {
    productsByCategory[categoria] = products.filter(p => p.categoria === categoria);
  });

  return (
    <div className="space-y-12">
      {categorias.map((categoria) => {
        const categoryProducts = productsByCategory[categoria];
        if (!categoryProducts || categoryProducts.length === 0) return null;

        return (
          <CategoryCarousel
            key={categoria}
            categoria={categoria}
            products={categoryProducts}
          />
        );
      })}
    </div>
  );
};

const CategoryCarousel = ({ categoria, products }) => {
  const scrollContainerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateScrollButtons = () => {
    if (!scrollContainerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  useEffect(() => {
    updateScrollButtons();
    window.addEventListener('resize', updateScrollButtons);
    return () => window.removeEventListener('resize', updateScrollButtons);
  }, [products]);

  const scroll = (direction) => {
    if (!scrollContainerRef.current) return;
    const scrollAmount = 400;
    const newScrollPosition = direction === 'left'
      ? scrollContainerRef.current.scrollLeft - scrollAmount
      : scrollContainerRef.current.scrollLeft + scrollAmount;

    scrollContainerRef.current.scrollTo({
      left: newScrollPosition,
      behavior: 'smooth'
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">{categoria}</h3>
          <p className="text-sm text-gray-500 mt-1">
            {products.length} producto{products.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
            className={`p-2 rounded-lg transition-colors ${
              canScrollLeft
                ? 'bg-primary text-white hover:bg-purple-700'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
            className={`p-2 rounded-lg transition-colors ${
              canScrollRight
                ? 'bg-primary text-white hover:bg-purple-700'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
            aria-label="Scroll right"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div
        ref={scrollContainerRef}
        onScroll={updateScrollButtons}
        className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {products.map((producto) => (
          <div key={producto._id} className="flex-shrink-0 w-72">
            <ProductCard product={producto} />
          </div>
        ))}
      </div>
    </div>
  );
};
