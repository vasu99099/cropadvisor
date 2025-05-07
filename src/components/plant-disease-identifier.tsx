
"use client";

import { useState, useRef, useEffect, type ChangeEvent } from 'react';
import Image from 'next/image';
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, UploadCloud, Camera, XCircle, CheckCircle, AlertCircle, Sparkles, Microscope, Image as ImageIcon, Trash2 } from 'lucide-react';
import { diagnosePlantFromImage, type DiagnosePlantFromImageInput, type DiagnosePlantFromImageOutput } from '@/ai/flows/diagnose-plant-from-image-flow';
import type { Locale, Translations } from '@/i18n/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from "@/hooks/use-toast";
import { Progress } from '@/components/ui/progress';

interface PlantDiseaseIdentifierProps {
  locale: Locale;
  translations: Translations;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export default function PlantDiseaseIdentifier({ locale, translations }: PlantDiseaseIdentifierProps) {
  const [diagnosisResult, setDiagnosisResult] = useState<DiagnosePlantFromImageOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageDataUri, setImageDataUri] = useState<string | null>(null);
  const [showWebcam, setShowWebcam] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { toast } = useToast();
  const content = translations.plantDiseaseIdentifier;

  const formSchema = z.object({
    description: z.string().optional(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: "",
    },
  });

  const handleImageFile = (file: File | null) => {
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      toast({ variant: 'destructive', title: 'File too large', description: `Max file size is ${MAX_FILE_SIZE / 1024 / 1024}MB.` });
      return;
    }
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      toast({ variant: 'destructive', title: 'Invalid file type', description: `Allowed types: ${ALLOWED_IMAGE_TYPES.join(', ')}.` });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUri = reader.result as string;
      setImagePreview(dataUri);
      setImageDataUri(dataUri);
      setShowWebcam(false); // Hide webcam if an image is uploaded
      if (videoRef.current && videoRef.current.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    handleImageFile(file || null);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    const file = event.dataTransfer.files?.[0];
    handleImageFile(file || null);
    event.currentTarget.classList.remove('border-primary');
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.classList.add('border-primary');
  };
  
  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.classList.remove('border-primary');
  };

  const clearImage = () => {
    setImagePreview(null);
    setImageDataUri(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // Reset file input
    }
    setDiagnosisResult(null); // Also clear previous results
  };
  
  const toggleWebcam = async () => {
    if (showWebcam) {
      setShowWebcam(false);
      if (videoRef.current && videoRef.current.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
      setHasCameraPermission(null);
    } else {
      clearImage(); // Clear any uploaded image before showing webcam
      setShowWebcam(true);
    }
  };

  useEffect(() => {
    if (!showWebcam) return;

    const getCameraPermission = async () => {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: content.webcamNotSupported,
          description: 'Your browser does not support webcam access or no camera was found.',
        });
        setShowWebcam(false);
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        setHasCameraPermission(true);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        setShowWebcam(false);
        toast({
          variant: 'destructive',
          title: content.cameraAccessRequiredTitle,
          description: content.webcamError,
        });
      }
    };
    getCameraPermission();
    
    return () => { // Cleanup on component unmount or when webcam is hidden
      if (videoRef.current && videoRef.current.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
      }
    };
  }, [showWebcam, content.webcamError, content.webcamNotSupported, content.cameraAccessRequiredTitle, toast]);

  const captureImageFromWebcam = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUri = canvas.toDataURL('image/webp'); // Use webp for better compression
        setImagePreview(dataUri);
        setImageDataUri(dataUri);
        setShowWebcam(false); // Hide webcam after capture
         if (videoRef.current && videoRef.current.srcObject) {
            (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
            videoRef.current.srcObject = null;
        }
      }
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!imageDataUri) {
      setError(content.errorNoImage);
      toast({ variant: 'destructive', title: 'Missing Image', description: content.errorNoImage });
      return;
    }
    setIsLoading(true);
    setError(null);
    setDiagnosisResult(null);
    try {
      const input: DiagnosePlantFromImageInput = {
        imageDataUri: imageDataUri,
        description: values.description,
      };
      const result = await diagnosePlantFromImage(input);
      setDiagnosisResult(result);
    } catch (e) {
      console.error(e);
      setError(content.errorFetching);
      toast({ variant: 'destructive', title: 'Diagnosis Failed', description: content.errorFetching });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section id="plant-identifier" className="py-12 md:py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <Microscope className="mx-auto h-12 w-12 text-primary mb-4" />
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
            {content.title}
          </h2>
          <p className="mt-2 text-lg text-muted-foreground max-w-2xl mx-auto">
            {content.description}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-6 w-6 text-primary" />
                {content.uploadCardTitle}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {!imagePreview && !showWebcam && (
                    <div
                      className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed border-border rounded-md hover:border-primary transition-colors cursor-pointer"
                      onClick={() => fileInputRef.current?.click()}
                      onDrop={handleDrop}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      role="button"
                      tabIndex={0}
                      aria-label={content.uploadLabel}
                    >
                      <div className="space-y-1 text-center">
                        <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
                        <div className="flex text-sm text-muted-foreground">
                          <FormLabel htmlFor="file-upload" className="relative cursor-pointer rounded-md font-medium text-primary hover:text-primary/80 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary">
                            <span>{content.uploadLabel}</span>
                            <input ref={fileInputRef} id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept={ALLOWED_IMAGE_TYPES.join(',')} />
                          </FormLabel>
                          <p className="pl-1">{content.orDragAndDrop}</p>
                        </div>
                        <p className="text-xs text-muted-foreground">{content.uploadHint}</p>
                      </div>
                    </div>
                  )}

                  {imagePreview && !showWebcam && (
                    <div className="mt-4 relative group">
                      <Image src={imagePreview} alt={content.imagePreviewAlt} width={400} height={300} className="rounded-md mx-auto max-h-60 w-auto object-contain shadow-md" data-ai-hint="plant leaf symptom" />
                      <Button variant="ghost" size="icon" onClick={clearImage} className="absolute top-2 right-2 bg-background/50 hover:bg-destructive/80 hover:text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity" aria-label={content.clearImageButton}>
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </div>
                  )}
                  
                  <Button type="button" variant="outline" onClick={toggleWebcam} className="w-full" disabled={isLoading}>
                    <Camera className="mr-2 h-4 w-4" /> {showWebcam ? content.closeWebcamButton : content.useWebcamButton}
                  </Button>

                  {showWebcam && (
                    <div className="mt-4 space-y-2">
                      <div className="relative w-full aspect-video bg-muted rounded-md overflow-hidden shadow-inner">
                        <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
                        <canvas ref={canvasRef} className="hidden"></canvas>
                         {hasCameraPermission === false && (
                           <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 p-4 text-center">
                             <AlertCircle className="h-8 w-8 text-destructive mb-2" />
                             <p className="text-destructive-foreground font-semibold">{content.cameraAccessRequiredTitle}</p>
                             <p className="text-sm text-destructive-foreground/80">{content.cameraAccessRequiredDescription}</p>
                           </div>
                         )}
                         {hasCameraPermission === null && (
                           <div className="absolute inset-0 flex items-center justify-center bg-black/70">
                             <Loader2 className="h-8 w-8 text-primary-foreground animate-spin" />
                           </div>
                         )}
                      </div>
                      {hasCameraPermission && (
                        <Button type="button" onClick={captureImageFromWebcam} className="w-full" disabled={!hasCameraPermission}>
                          <Camera className="mr-2 h-4 w-4" /> {content.captureFromWebcamButton}
                        </Button>
                      )}
                    </div>
                  )}

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{content.descriptionLabel}</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder={content.descriptionPlaceholder}
                            className="resize-none min-h-[80px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={isLoading || (!imageDataUri && !showWebcam)} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-md transition-transform hover:scale-105">
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {content.submittingButton}
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" /> {content.submitButton}
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Results Area */}
          <div className="space-y-6">
             {isLoading && (
              <Card className="shadow-lg animate-pulse">
                <CardHeader>
                  <Skeleton className="h-7 w-3/5" />
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Skeleton className="h-5 w-24" /> <Skeleton className="h-5 w-16" />
                  </div>
                   <div className="flex items-center space-x-2">
                    <Skeleton className="h-5 w-28" /> <Skeleton className="h-5 w-20" />
                  </div>
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-4 w-4/6" />
                  <Skeleton className="h-4 w-1/2" />
                   <div className="pt-2 space-y-1">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </CardContent>
              </Card>
            )}

            {error && !isLoading && (
              <Alert variant="destructive" className="shadow-lg">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {diagnosisResult && !isLoading && (
              <Card className="shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-primary">
                    <CheckCircle className="h-6 w-6" /> {content.resultsTitle}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="font-semibold text-foreground">{content.isPlantLabel}</span>
                    <span className={diagnosisResult.isPlant ? 'text-green-600' : 'text-red-600'}>
                      {diagnosisResult.isPlant ? content.booleanYes : content.booleanNo}
                    </span>
                  </div>
                  {diagnosisResult.isPlant && diagnosisResult.plantName && (
                    <div className="flex justify-between">
                      <span className="font-semibold text-foreground">{content.plantNameLabel}</span>
                      <span className="text-muted-foreground">{diagnosisResult.plantName}</span>
                    </div>
                  )}
                   <div className="flex justify-between">
                    <span className="font-semibold text-foreground">{content.diseaseIdentifiedLabel}</span>
                     <span className={diagnosisResult.diseaseIdentified ? 'text-red-600 font-medium' : 'text-green-600 font-medium'}>
                        {diagnosisResult.diseaseIdentified ? content.booleanYes : content.booleanNo}
                     </span>
                  </div>

                  {diagnosisResult.diseaseName && (
                    <div className="flex justify-between items-start">
                      <span className="font-semibold text-foreground pt-0.5">{content.diseaseNameLabel}</span>
                      <span className="text-muted-foreground text-right">{diagnosisResult.diseaseName}</span>
                    </div>
                  )}
                  {diagnosisResult.diseaseDescription && (
                     <div>
                        <p className="font-semibold text-foreground mb-0.5">{content.diseaseDescriptionLabel}</p>
                        <p className="text-muted-foreground">{diagnosisResult.diseaseDescription}</p>
                     </div>
                  )}
                  
                  {diagnosisResult.confidenceScore !== undefined && diagnosisResult.diseaseIdentified && (
                    <div>
                      <span className="font-semibold text-foreground">{content.confidenceScoreLabel}</span>
                      <Progress value={diagnosisResult.confidenceScore * 100} className="w-full h-2 mt-1" />
                      <span className="text-xs text-muted-foreground text-right block">{(diagnosisResult.confidenceScore * 100).toFixed(0)}%</span>
                    </div>
                  )}

                  {diagnosisResult.treatmentRecommendations && diagnosisResult.treatmentRecommendations.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">{content.treatmentRecommendationsLabel}</h4>
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                        {diagnosisResult.treatmentRecommendations.map((rec, index) => (
                          <li key={index}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {!diagnosisResult.isPlant && (
                     <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>{content.noPlantDetected}</AlertTitle>
                     </Alert>
                  )}
                   {diagnosisResult.isPlant && !diagnosisResult.diseaseIdentified && !diagnosisResult.diseaseName?.toLowerCase().includes("healthy") && (
                     <Alert>
                         <CheckCircle className="h-4 w-4" />
                        <AlertTitle>{content.noDiseaseDetected}</AlertTitle>
                     </Alert>
                   )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
