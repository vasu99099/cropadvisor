
"use client";

import type { Pesticide } from '@/services/product-catalog';
import { useEffect, useState } from 'react';
import { getPesticideProducts } from '@/services/product-catalog';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from '@/components/ui/button';
import { ListFilter, Search, PackageSearch, CircleOff } from 'lucide-react';
import type { Locale, Translations } from '@/i18n/types';
import { Skeleton } from '@/components/ui/skeleton';

interface ProductCatalogProps {
  locale: Locale;
  translations: Translations;
}

export default function ProductCatalog({ locale, translations }: ProductCatalogProps) {
  const [products, setProducts] = useState<Pesticide[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Pesticide[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedCrop, setSelectedCrop] = useState<string>('all');

  const content = translations.productCatalog;

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      const fetchedProducts = await getPesticideProducts();
      setProducts(fetchedProducts);
      setFilteredProducts(fetchedProducts);
      setLoading(false);
    }
    fetchProducts();
  }, []);

  const allCategories = Array.from(new Set(products.flatMap(p => p.categories)));
  const allCrops = Array.from(new Set(products.flatMap(p => p.crops)));

  useEffect(() => {
    let tempProducts = products;

    if (searchTerm) {
      tempProducts = tempProducts.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      tempProducts = tempProducts.filter(product => product.categories.includes(selectedCategory));
    }
    
    if (selectedCrop !== 'all') {
      tempProducts = tempProducts.filter(product => product.crops.includes(selectedCrop));
    }

    setFilteredProducts(tempProducts);
  }, [searchTerm, selectedCategory, selectedCrop, products]);

  return (
    <section id="product-catalog" className="py-12 md:py-20 bg-secondary">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <PackageSearch className="mx-auto h-12 w-12 text-primary mb-4" />
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
            {content.title}
          </h2>
          <p className="mt-2 text-lg text-muted-foreground max-w-2xl mx-auto">
            {content.description}
          </p>
        </div>

        <Card className="mb-8 shadow-lg">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div className="md:col-span-1">
                <label htmlFor="search-product" className="block text-sm font-medium text-foreground mb-1">{content.searchLabel}</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="search-product"
                    type="text"
                    placeholder={content.searchPlaceholder}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="category-filter" className="block text-sm font-medium text-foreground mb-1">{content.categoryFilterLabel}</label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger id="category-filter" className="w-full">
                    <SelectValue placeholder={content.categoryFilterPlaceholder} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{content.allCategories}</SelectItem>
                    {allCategories.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label htmlFor="crop-filter" className="block text-sm font-medium text-foreground mb-1">{content.cropFilterLabel}</label>
                 <Select value={selectedCrop} onValueChange={setSelectedCrop}>
                  <SelectTrigger id="crop-filter" className="w-full">
                    <SelectValue placeholder={content.cropFilterPlaceholder} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{content.allCrops}</SelectItem>
                    {allCrops.map(crop => (
                      <SelectItem key={crop} value={crop}>{crop}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse shadow-lg">
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2 mt-1" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-5/6 mb-4" />
                  <div className="flex flex-wrap gap-2">
                    <Skeleton className="h-6 w-20 rounded-full" />
                    <Skeleton className="h-6 w-24 rounded-full" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.map((product) => (
              <Card key={product.id} className="flex flex-col hover:shadow-xl transition-shadow duration-300 rounded-lg overflow-hidden">
                <CardHeader className="bg-card-foreground/5">
                  <CardTitle className="text-xl text-primary">{product.name}</CardTitle>
                  <CardDescription className="text-muted-foreground h-16 overflow-hidden text-ellipsis">
                    {product.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow pt-4">
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-semibold text-sm mb-1 text-foreground">{content.applicationInstructions}</h4>
                      <p className="text-sm text-muted-foreground">{product.applicationInstructions}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm mb-1 text-foreground">{content.categories}</h4>
                      <div className="flex flex-wrap gap-1">
                        {product.categories.map((category) => (
                          <Badge key={category} variant="secondary">{category}</Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm mb-1 text-foreground">{content.crops}</h4>
                      <div className="flex flex-wrap gap-1">
                        {product.crops.map((crop) => (
                          <Badge key={crop} variant="outline">{crop}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
           <div className="text-center py-12 max-w-md mx-auto">
             <Card className="shadow-lg">
                <CardContent className="pt-6">
                  <CircleOff className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-semibold text-foreground">{content.noProductsFound}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{content.noProductsFoundDescription}</p>
                </CardContent>
              </Card>
          </div>
        )}
      </div>
    </section>
  );
}
