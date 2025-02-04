/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useCallback, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Check, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ResponseViewerProps {
  submissions: any[];
  onStatusUpdate: (
    id: string,
    status: 'approved' | 'rejected'
  ) => Promise<void>;
}

interface ResponseAnalysis {
  type: 'list' | 'chart';
  data: any;
  total: number;
}

export function ResponseViewer({
  submissions,
  onStatusUpdate,
}: ResponseViewerProps) {
  const { toast } = useToast();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('summary');

  const pendingSubmissions = useMemo(
    () => submissions.filter((sub) => sub.status === 'pending'),
    [submissions]
  );

  const currentSubmission = pendingSubmissions[currentIndex];

  const excludedFields = ['id', 'created_at', 'status'];

  function analyzeResponses(responses: any[], field: string): ResponseAnalysis {
    const values = responses.map((r) => r[field]);
    const uniqueValues = new Set(values);

    // If more than 80% of values are unique, show as list
    if (uniqueValues.size > values.length * 0.8) {
      return {
        type: 'list',
        data: Array.from(uniqueValues),
        total: values.length,
      };
    }

    // Otherwise show as chart
    const frequency: { [key: string]: number } = {};
    values.forEach((value) => {
      frequency[value] = (frequency[value] || 0) + 1;
    });

    return {
      type: 'chart',
      data: frequency,
      total: values.length,
    };
  }
  const handlePrevious = useCallback(() => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  }, []);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) =>
      Math.min(pendingSubmissions.length - 1, prev + 1)
    );
  }, [pendingSubmissions.length]);

  const handleStatusUpdate = useCallback(
    async (status: 'approved' | 'rejected') => {
      if (!currentSubmission) return;
      try {
        await onStatusUpdate(currentSubmission.id, status);
        toast({
          title: 'Status Updated',
          description: `Application ${
            status === 'approved' ? 'approved' : 'rejected'
          } successfully.`,
        });
        setCurrentIndex(0);
      } catch (error) {
        toast({
          title: 'Error',
          description: `Failed to update application status. Please try again. ${error}`,
          variant: 'destructive',
        });
      }
    },
    [currentSubmission, onStatusUpdate]
  );

  if (pendingSubmissions.length === 0) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <p className="text-lg text-muted-foreground">No pending applications</p>
      </div>
    );
  }

  return (
    <div className="container px-4 sm:px-0 space-y-6">
      <Card className="border-0 shadow-none">
        <CardHeader className="border-b px-0 pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold">
              {activeTab === 'summary'
                ? 'All Responses'
                : 'Pending Applications'}
            </CardTitle>
            {activeTab === 'individual' && (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handlePrevious}
                    disabled={currentIndex === 0}
                    className="h-8 w-8"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span>
                    {currentIndex + 1} of {pendingSubmissions.length}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleNext}
                    disabled={currentIndex === pendingSubmissions.length - 1}
                    className="h-8 w-8"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-2"
                    onClick={() => handleStatusUpdate('rejected')}
                  >
                    <X className="h-4 w-4" />
                    Reject
                  </Button>
                  <Button
                    size="sm"
                    className="gap-2"
                    onClick={() => handleStatusUpdate('approved')}
                  >
                    <Check className="h-4 w-4" />
                    Approve
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="px-0 bg">
          <Tabs defaultValue="summary" onValueChange={setActiveTab}>
            <TabsList className="mb-4 w-full justify-start">
              <TabsTrigger value="summary">Summary</TabsTrigger>
              <TabsTrigger value="individual">Individual</TabsTrigger>
            </TabsList>
            <TabsContent value="summary">
              <div className="grid gap-8">
                {Object.keys(submissions[0])
                  .filter((key) => !excludedFields.includes(key))
                  .map((field) => {
                    const analysis = analyzeResponses(submissions, field);

                    return (
                      <section key={field} className="space-y-4">
                        <h3 className="text-lg font-semibold capitalize">
                          {field.replace(/([A-Z])/g, ' $1').trim()}
                          <span className="ml-2 text-sm font-normal text-muted-foreground">
                            {analysis.total} responses
                          </span>
                        </h3>

                        {analysis.type === 'chart' ? (
                          <div className="rounded-lg border bg-card p-4">
                            <div className="h-[300px] w-full">
                              <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                  data={Object.entries(analysis.data).map(
                                    ([name, value]) => ({ name, value })
                                  )}
                                >
                                  <XAxis
                                    dataKey="name"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                  />
                                  <YAxis
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) => `${value}`}
                                  />
                                  <Tooltip
                                    cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
                                    contentStyle={{
                                      backgroundColor: 'hsl(var(--background))',
                                      border: '1px solid hsl(var(--border))',
                                      borderRadius: '6px',
                                      fontSize: '12px',
                                    }}
                                  />
                                  <Bar
                                    dataKey="value"
                                    fill="hsl(var(--primary))"
                                    radius={[4, 4, 0, 0]}
                                  />
                                </BarChart>
                              </ResponsiveContainer>
                            </div>
                          </div>
                        ) : (
                          <ScrollArea className="h-[200px] w-full rounded-lg border">
                            <div className="divide-y">
                              {(analysis.data as string[]).map((value, i) => (
                                <div key={i} className="p-3 text-sm">
                                  {value}
                                </div>
                              ))}
                            </div>
                          </ScrollArea>
                        )}
                      </section>
                    );
                  })}
              </div>
            </TabsContent>
            <TabsContent value="individual">
              <div className="rounded-lg border bg-card">
                <div className="divide-y">
                  {Object.entries(currentSubmission)
                    .filter(([key]) => !excludedFields.includes(key))
                    .map(([key, value]) => (
                      <div key={key} className="p-4">
                        <h3 className="mb-1 font-medium capitalize text-sm text-muted-foreground">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </h3>
                        <ScrollArea className="h-[100px] w-full">
                          <p className="text-sm whitespace-pre-wrap">
                            {value as string}
                          </p>
                        </ScrollArea>
                      </div>
                    ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
