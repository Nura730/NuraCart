import { useSearchParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import type { Product } from "../types";
import { dummyProducts } from "../assets/assets";
import ProductCard from "../components/ProductCard";
import Loading from "../components/Loading";
import { SearchIcon, Home } from "lucide-react";

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    // Simulate minor network delay for premium feel
    const timer = setTimeout(() => {
      const filtered = dummyProducts.filter((product) => {
        const matchesName = product.name.toLowerCase().includes(query.toLowerCase());
        const matchesDesc = product.description.toLowerCase().includes(query.toLowerCase());
        const matchesCat = product.category.toLowerCase().includes(query.toLowerCase());
        return matchesName || matchesDesc || matchesCat;
      });
      setProducts(filtered);
      setLoading(false);
    }, 400);

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="min-h-screen bg-app-cream py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-app-text-light mb-6">
          <Link to="/" className="hover:text-app-green transition-colors">
            <Home className="size-4" />
          </Link>
          <span>/</span>
          <span className="text-app-green font-medium">Search Results</span>
        </nav>

        {/* Search Query Details */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-app-green flex items-center gap-2">
            <SearchIcon className="size-6 text-app-orange" />
            Search Results for "{query}"
          </h1>
          {!loading && (
            <p className="text-sm text-app-text-light mt-1">
              Found {products.length} {products.length === 1 ? "product" : "products"}
            </p>
          )}
        </div>

        {/* Results */}
        {loading ? (
          <Loading />
        ) : products.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 text-center shadow-xs border border-app-border max-w-lg mx-auto">
            <SearchIcon className="size-16 text-app-text-light/35 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-app-green mb-2">No matching products</h2>
            <p className="text-sm text-app-text-light mb-6">
              We couldn't find anything matching "{query}". Try checking your spelling or search for another term.
            </p>
            <Link
              to="/products"
              className="inline-flex px-6 py-2.5 bg-app-green text-white text-sm font-medium rounded-full hover:bg-app-green-light transition-all"
            >
              Browse All Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 xl:gap-8">
            {products.map((product) => product.stock > 0 && (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResults;
