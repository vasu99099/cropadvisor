
"use client";

import { useEffect, useState } from 'react';
import { getMostPrevalentDiseases, type Disease } from '@/services/disease';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, TrendingUp, Users } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList } from 'recharts';
import type { Locale, Translations } from '@/i18n/types';
import { Skeleton } from '@/components/ui/skeleton';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

interface DiseaseStatsProps {
  locale: Locale;
  translations: Translations;
}

const chartConfig = {
  prevalence: {
    label: "Prevalence",
    color: "hsl(var(--primary))",
  },
};

export default function DiseaseStats({ locale, translations }: DiseaseStatsProps) {
  const [diseases, setDiseases] = useState<Disease[]>([]);
  const [loading, setLoading] = useState(true);
  const content = translations.diseaseStats;

  useEffect(() => {
    async function fetchDiseases() {
      setLoading(true);
      const fetchedDiseases = await getMostPrevalentDiseases();
      setDiseases(fetchedDiseases);
      setLoading(false);
    }
    fetchDiseases();
  }, []);

  const chartData = diseases.map(disease => ({
    name: disease.name,
    prevalence: disease.prevalence,
  })).sort((a, b) => a.prevalence - b.prevalence); // Sort for better visualization in vertical bar chart

  if (loading) {
    return (
      <section id="disease-stats" className="py-12 md:py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Skeleton className="h-12 w-12 mx-auto mb-4 rounded-full" />
            <Skeleton className="h-8 w-3/4 mx-auto mb-2" />
            <Skeleton className="h-6 w-1/2 mx-auto" />
          </div>
          <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-1">
            <Card className="shadow-lg">
              <CardHeader>
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="h-4 w-3/4 mt-1" />
              </CardHeader>
              <CardContent className="h-[300px] md:h-[400px]">
                <Skeleton className="h-full w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="disease-stats" className="py-12 md:py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <TrendingUp className="mx-auto h-12 w-12 text-primary mb-4" />
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
            {content.title}
          </h2>
          <p className="mt-2 text-lg text-muted-foreground max-w-2xl mx-auto">
            {content.description}
          </p>
        </div>

        {diseases.length === 0 && !loading ? (
          <Card className="shadow-lg text-center py-12 max-w-md mx-auto">
            <CardContent className="pt-6">
              <AlertTriangle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold text-foreground">{content.noDataTitle}</h3>
              <p className="text-muted-foreground mt-1">{content.noDataDescription}</p>
            </CardContent>
          </Card>
        ) : (
          <Card className="shadow-lg col-span-1 lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-6 w-6 text-primary" />
                {content.chartTitle}
              </CardTitle>
              <CardDescription>{content.chartDescription}</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] md:h-[400px] pl-0 pr-6 pb-6">
              <ChartContainer config={chartConfig} className="w-full h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} layout="vertical" margin={{ right: 50, left: 20, top: 5, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
                    <YAxis 
                      dataKey="name" 
                      type="category" 
                      width={120} 
                      tickLine={false} 
                      axisLine={false} 
                      stroke="hsl(var(--muted-foreground))"
                      tick={{fontSize: 12}}
                    />
                    <Tooltip
                      cursor={{ fill: 'hsl(var(--muted))' }}
                      content={<ChartTooltipContent indicator="dot" />}
                    />
                    <Bar dataKey="prevalence" fill="var(--color-prevalence)" radius={[0, 4, 4, 0]}>
                       <LabelList dataKey="prevalence" position="right" offset={8} className="fill-foreground" fontSize={12} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        )}
      </div>
    </section>
  );
}
