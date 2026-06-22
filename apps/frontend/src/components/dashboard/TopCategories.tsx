import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { CategoryStat } from '../../types';

interface TopCategoriesProps {
  categories: CategoryStat[];
}

export const TopCategories: React.FC<TopCategoriesProps> = ({ categories }) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Top Categories</CardTitle>
        <button className="text-sm text-primary hover:text-primary/80 font-medium">View all</button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {categories.map((category) => (
            <div key={category.name} className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground w-28 flex-shrink-0">{category.name}</span>
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${category.value}%`,
                    backgroundColor: category.color,
                  }}
                />
              </div>
              <span className="text-sm font-medium text-foreground w-10 text-right">{category.value}%</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
