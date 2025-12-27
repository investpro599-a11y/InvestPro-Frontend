"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { investmentApi } from "@/lib";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { FileUpload } from "@/components/ui/file-upload";
import { Bitcoin, Copy } from "lucide-react";
import { useState } from "react";
import { handleFormSubmissionResponse, extractMessage } from "@/lib/messages";

const investmentFormSchema = z.object({
  amount: z.coerce.number().min(1, { message: "Investment amount is required." }),
  plan: z.enum(["6months", "12months", "18months"], {
    required_error: "You need to select an investment plan.",
  }),
  paymentMethod: z.string().default('usdt_trc20'),
  transactionProof: z.any().optional(),
  notes: z.string().optional(),
});

type InvestmentFormValues = z.infer<typeof investmentFormSchema>;

const TRC_ID = "TKEoUy3Yt5AuJMyyz18wuT8EoinndnLnqn";

export function InvestmentForm() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const form = useForm<InvestmentFormValues>({
    resolver: zodResolver(investmentFormSchema),
    defaultValues: {
      amount: undefined,
      plan: undefined,
      paymentMethod: 'usdt_trc20',
      notes: "",
    },
  });

  const createInvestmentMutation = useMutation({
    mutationFn: async (data: InvestmentFormValues) => {
      const formData = new FormData();
      formData.append("amount", String(data.amount));
      formData.append("plan", data.plan);
      formData.append("paymentMethod", 'usdt_trc20');
      if (data.notes) formData.append("notes", data.notes);
      if (selectedFile) formData.append("transactionProof", selectedFile);
      return investmentApi.create(formData);
    },
    onSuccess: (response) => {
      const toastConfig = handleFormSubmissionResponse(response, "create");
      toast(toastConfig);
      
      form.reset();
      setSelectedFile(null);
      queryClient.invalidateQueries({ queryKey: ["investments"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard/stats"] });
    },
    onError: (error: any) => {
      const message = extractMessage(error);
      toast({
        variant: "destructive",
        title: "Investment Creation Failed",
        description: message,
      });
    },
  });

  const onSubmit = (data: InvestmentFormValues) => {
    createInvestmentMutation.mutate(data);
  };

  const handleFileSelect = (file: File | null) => {
    setSelectedFile(file);
    form.setValue("transactionProof", file);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(TRC_ID);
      toast({
        title: "Copied!",
        description: "TRC20 address copied to clipboard.",
        duration: 2000,
      });
    } catch {
      toast({
        title: "Copy failed",
        description: "Could not copy address.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Investment</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Investment Amount (PKR)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Enter amount" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="plan"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Investment Plan</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Plan" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="6months">6 Months (7% Monthly ROI)</SelectItem>
                        <SelectItem value="12months">12 Months (8% Monthly ROI)</SelectItem>
                        <SelectItem value="18months">18 Months (9% Monthly ROI)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Bitcoin className="h-5 w-5 text-green-600" />
                <span className="font-medium">Payment Method: USDT TRC20</span>
              </div>
              
              <FormField
                control={form.control}
                name="paymentMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>TRC20 ID</FormLabel>
                    <div className="flex items-center gap-2">
                      <FormControl>
                        <Input 
                          value={TRC_ID}
                          disabled
                          className="bg-gray-50 font-mono text-sm"
                        />
                      </FormControl>
                      <Button type="button" size="icon" variant="outline" onClick={handleCopy} aria-label="Copy TRC20 address">
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-sm text-gray-500">
                      Send your USDT to this TRC20 address. Make sure to use the TRC20 network.
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FileUpload
              onFileSelect={handleFileSelect}
              selectedFile={selectedFile}
              label="Transaction Proof"
              description="Upload screenshot of your USDT transfer (JPG, PNG, PDF - max 5MB)"
              accept="image/*,.pdf"
              maxSize={5}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Notes</FormLabel>
                  <FormControl>
                    <Textarea rows={3} placeholder="Any additional information..." {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline" onClick={() => {
                form.reset();
                setSelectedFile(null);
              }}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={createInvestmentMutation.isPending}
                className="bg-green-600 hover:bg-green-700"
              >
                {createInvestmentMutation.isPending ? "Creating..." : "Create Investment"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
