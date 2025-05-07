
"use client";

import { useState } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, AlertCircle, Leaf, CircleOff, Bot } from 'lucide-react';
import { suggestPesticide, type SuggestPesticideInput, type SuggestPesticideOutput } from '@/ai/flows/suggest-pesticide';
import type { Locale, Translations } from '@/i18n/types';
import { Skeleton } from '@/components/ui/skeleton';

interface CropPesticideSuggesterProps {
  locale: Locale;
  translations: Translations;
}

export default function CropPesticideSuggester({ locale, translations }: CropPesticideSuggesterProps) {
  const [suggestions, setSuggestions] = useState<SuggestPesticideOutput['pesticideSuggestions'] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const content = translations.cropSuggester;
  const validationMessages = translations.validation;
  const commonCrops = translations.commonCrops;

  const formSchema = z.object({
    crop: z.string().min(1, { message: validationMessages.cropRequired }),
    problemDescription: z.string()
      .min(1, { message: validationMessages.problemDescriptionRequired })
      .min(10, { message: validationMessages.problemDescriptionMinLength }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      crop: "",
      problemDescription: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setError(null);
    setSuggestions(null);
    try {
      const result = await suggestPesticide(values as SuggestPesticideInput);
      setSuggestions(result.pesticideSuggestions);
    } catch (e) {
      console.error(e);
      setError(content.errorFetching);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section id="crop-suggestions" className="py-12 md:py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <Bot className="mx-auto h-12 w-12 text-primary mb-4" />
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
            {content.title}
          </h2>
          <p className="mt-2 text-lg text-muted-foreground max-w-2xl mx-auto">
            {content.description}
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-2xl mx-auto">
            <div className="grid grid-cols-1 gap-6">
              <Card className="shadow-lg">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Leaf className="h-6 w-6 text-primary" />
                        <CardTitle>{content.cropLabel}</CardTitle>
                    </div>
                  <CardDescription>{content.problemDescriptionHint}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="crop"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{content.cropLabel}</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder={content.cropPlaceholder} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {commonCrops.map((crop) => (
                                <SelectItem key={crop} value={crop}>{crop}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                     <div className="sm:col-span-2"> {/* Ensure Textarea takes full width */}
                      <FormField
                        control={form.control}
                        name="problemDescription"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{content.problemDescriptionLabel}</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder={content.problemDescriptionPlaceholder}
                                className="resize-none min-h-[120px]"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Button type="submit" disabled={isLoading} className="w-full sm:w-auto bg-accent hover:bg-accent/90 text-accent-foreground shadow-md transition-transform hover:scale-105">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Getting Suggestions...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" /> {content.submitButton}
                </>
              )}
            </Button>
          </form>
        </Form>

        {isLoading && !suggestions && (
          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="animate-pulse shadow-lg">
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2 mt-1" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-5/6 mb-4" />
                   <div className="space-y-3">
                      <Skeleton className="h-4 w-1/3 mb-1" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {error && (
          <Alert variant="destructive" className="mt-8 max-w-2xl mx-auto shadow-lg">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {suggestions && suggestions.length > 0 && (
          <div className="mt-12">
            <h2 className="text-3xl font-bold tracking-tight mb-6 text-foreground text-center">
              {content.suggestionsTitle}
            </h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {suggestions.map((pesticide) => (
                <Card key={pesticide.id} className="flex flex-col shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-lg overflow-hidden">
                  <CardHeader className="bg-card-foreground/5">
                    <CardTitle className="text-xl text-primary">{pesticide.name}</CardTitle>
                    <CardDescription className="text-muted-foreground h-12 overflow-hidden text-ellipsis">
                        {pesticide.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow pt-4">
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-semibold text-sm mb-1 text-foreground">{content.suitability}</h4>
                        <p className="text-sm text-muted-foreground">{pesticide.suitabilityExplanation}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm mb-1 text-foreground">{content.applicationInstructions}</h4>
                        <p className="text-sm text-muted-foreground">{pesticide.applicationInstructions}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm mb-1 text-foreground">{content.categories}</h4>
                        <div className="flex flex-wrap gap-1">
                          {pesticide.categories.map((category) => (
                            <Badge key={category} variant="secondary">{category}</Badge>
                          ))}
                        </div>
                      </div>
                       <div>
                        <h4 className="font-semibold text-sm mb-1 text-foreground">{content.crops}</h4>
                        <div className="flex flex-wrap gap-1">
                          {pesticide.crops.map((crop) => (
                            <Badge key={crop} variant="outline">{crop}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
         {suggestions && suggestions.length === 0 && !isLoading && (
          <div className="mt-8 text-center py-12 max-w-md mx-auto">
            <Card className="shadow-lg">
              <CardContent className="pt-6">
                <CircleOff className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold text-foreground">{content.noSuggestions}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{content.noSuggestionsDescription}</p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </section>
  );
}
