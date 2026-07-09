"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { withdrawalApi, investmentApi, commissionApi, dashboardApi } from "@/lib";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { handleFormSubmissionResponse, extractMessage } from "@/lib/messages";
import type { Investment, Commission, Withdrawal } from "../../../shared/schema";

// Form validation schema
const withdrawalFormSchema = z.object({
  amount: z.number().min(10, "Minimum withdrawal amount is 10"),
  type: z.enum(["roi", "commission", "principal"], {
    required_error: "Please select a withdrawal type",
  }),
  method: z.enum(["easypaisa", "jazzcash", "bank_account", "trc20", "others"], {
    required_error: "Please select a withdrawal method",
  }),
  phoneNumber: z.string().optional(),
  accountNumber: z.string().optional(),
  bankName: z.string().optional(),
  trcId: z.string().optional(),
  accountName: z.string().optional(),
  platform: z.string().optional(),
  walletAddress: z.string().optional(),
  notes: z.string().optional(),
}).refine((data) => {
  // Validate required fields based on method
  switch (data.method) {
    case "easypaisa":
    case "jazzcash":
      return data.phoneNumber && data.phoneNumber.trim().length > 0;
    case "bank_account":
      return data.accountNumber && data.accountNumber.trim().length > 0 && 
             data.bankName && data.bankName.trim().length > 0;
    case "trc20":
      return data.trcId && data.trcId.trim().length > 0;
    case "others":
      return data.accountName && data.accountName.trim().length > 0 && 
             data.accountNumber && data.accountNumber.trim().length > 0 &&
             data.platform && data.platform.trim().length > 0;
    default:
      return false;
  }
}, {
  message: "Required fields missing for selected withdrawal method",
  path: ["method"]
});

type WithdrawalFormData = z.infer<typeof withdrawalFormSchema>;

export function WithdrawalForm() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedMethod, setSelectedMethod] = useState<string>("");

  const form = useForm<WithdrawalFormData>({
    resolver: zodResolver(withdrawalFormSchema),
    defaultValues: {
      amount: undefined,
      type: undefined,
      method: undefined,
      phoneNumber: "",
      accountNumber: "",
      bankName: "",
      trcId: "",
      accountName: "",
      platform: "",
      walletAddress: "",
      notes: "",
    },
  });

  // Watch the method field to show/hide relevant fields
  const watchedMethod = form.watch("method");

  // Get user's investments and commissions to show available balance
  const { data: investments = [] } = useQuery<Investment[]>({
    queryKey: ["investments"],
    queryFn: investmentApi.getAll,
  });

  const { data: commissions = [] } = useQuery<Commission[]>({
    queryKey: ["commissions"],
    queryFn: commissionApi.getAll,
  });

  const { data: withdrawals = [] } = useQuery<Withdrawal[]>({
    queryKey: ["withdrawals"],
    queryFn: withdrawalApi.getAll,
  });

  // Get dashboard stats for available balances
  const { data: stats } = useQuery({
    queryKey: ["dashboard/stats"],
    queryFn: dashboardApi.getStats,
  });

  // Use backend-provided available balances
  const availableROI = stats?.availableROI ?? 0;
  const availableCommission = stats?.availableCommission ?? 0;
  const availableMaturedPrincipal = stats?.availablePrincipal ?? 0;
  const totalBalance = stats?.totalBalance ?? 0;

  const createWithdrawalMutation = useMutation({
    mutationFn: withdrawalApi.create,
    onSuccess: (response) => {
      // Use server message if available, otherwise use default
      const toastConfig = handleFormSubmissionResponse(response, 'create');
      toast(toastConfig);
      
      form.reset();
      setSelectedMethod("");
      queryClient.invalidateQueries({ queryKey: ["withdrawals"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard/stats"] });
    },
    onError: (error: any) => {
      // Debug: log the error object
      console.error("Withdrawal creation error:", error);
      let errorMessage = "An unexpected error occurred. Please try again later.";
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      // Only show the toast if the error is not a success response
      if (errorMessage && errorMessage !== 'Withdrawal request created successfully') {
        toast({
          variant: "destructive",
          title: "Withdrawal Request Failed",
          description: errorMessage,
        });
      }
    },
  });

  const onSubmit = (data: WithdrawalFormData) => {
    console.log('Submitting withdrawal data:', data);
    createWithdrawalMutation.mutate(data);
  };

  const renderMethodFields = () => {
    switch (watchedMethod) {
      case "easypaisa":
      case "jazzcash":
        return (
          <FormField
            control={form.control}
            name="phoneNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your phone number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        );
      
      case "bank_account":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="bankName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bank Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter bank name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="accountNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account Number</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter account number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        );
      
      case "trc20":
        return (
          <FormField
            control={form.control}
            name="trcId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>TRC20 ID</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your TRC20 ID" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        );
      
      case "others":
        return (
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="accountName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter account name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="accountNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Account Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter account number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="platform"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Platform</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter platform name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };
  return (
    <Card>
      <CardHeader>
        <CardTitle>Request Withdrawal</CardTitle>
        <div className="text-sm text-gray-600 space-y-1">
          <p><strong>Available Balances:</strong></p>
          <p>• ROI (Your investment returns): ${availableROI.toLocaleString()}</p>
          <p>• Commission (Withdrawable): ${availableCommission.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span title="This is the amount you can withdraw right now. It is your total paid commissions minus any already withdrawn.">ⓘ</span></p>
          <p>• Principal (Matured): ${availableMaturedPrincipal.toLocaleString()}</p>
          <p>• <b>Total Balance:</b> ${totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          <p className="text-xs text-gray-500 mt-2">
            Note: You can only withdraw principal after your investment matures (6, 12, or 18 months). If you have no matured investments, principal withdrawal is disabled.
          </p>
        </div>
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
                    <FormLabel>
                      Withdrawal Amount (USD)
                    </FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="Enter amount in USD" 
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Withdrawal Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="roi">ROI Withdrawal (Available: ${availableROI.toLocaleString()})</SelectItem>
                        <SelectItem value="commission">Commission Withdrawal (Available: ${availableCommission.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })})</SelectItem>
                        <SelectItem value="principal" disabled={availableMaturedPrincipal === 0}>
                          Principal Withdrawal (Available: ${availableMaturedPrincipal.toLocaleString()})
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                    {availableMaturedPrincipal === 0 && (
                      <div className="text-xs text-red-600 mt-1">
                        You cannot withdraw your principal until your investment matures (6, 12, or 18 months).
                      </div>
                    )}
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="method"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Withdrawal Method</FormLabel>
                  <Select onValueChange={(value) => {
                    field.onChange(value);
                    setSelectedMethod(value);
                    // Clear other method fields when method changes
                    form.setValue("phoneNumber", "");
                    form.setValue("accountNumber", "");
                    form.setValue("bankName", "");
                    form.setValue("trcId", "");
                    form.setValue("accountName", "");
                    form.setValue("platform", "");
                    form.setValue("walletAddress", "");
                  }} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Method" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="easypaisa">EasyPaisa</SelectItem>
                      <SelectItem value="jazzcash">JazzCash</SelectItem>
                      <SelectItem value="bank_account">Bank Account</SelectItem>
                      <SelectItem value="trc20">TRC20</SelectItem>
                      <SelectItem value="others">Others</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {watchedMethod && (
              <div className="space-y-6">
                {renderMethodFields()}
              </div>
            )}

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Notes</FormLabel>
                  <FormControl>
                    <Textarea rows={3} placeholder="Any special instructions..." {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline" onClick={() => {
                form.reset();
                setSelectedMethod("");
              }}>
                Cancel
              </Button>
              <Button type="submit" disabled={createWithdrawalMutation.isPending} className="bg-green-600 hover:bg-green-700">
                {createWithdrawalMutation.isPending ? "Submitting..." : "Request Withdrawal"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
