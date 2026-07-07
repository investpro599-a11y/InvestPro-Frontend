'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { toast } from 'sonner';
import { rewardApi, type Reward as RewardType, type RewardBase } from '@/lib/api/reward';
import { fileUploadApi } from '@/lib/api';
import { Loader2, Image as ImageIcon, X } from 'lucide-react';

// Define form schema
const rewardFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().optional(),
  value: z.number().min(0, 'Value must be a positive number'),
  level: z.number().min(1, 'Level must be between 1 and 6').max(6, 'Level must be between 1 and 6'),
  orderInLevel: z.number().default(1),
  isActive: z.boolean().default(true),
  image: z.union([z.instanceof(File), z.undefined()]),
  imageUrl: z.string().optional(),
  requirements: z.object({
    leftLegRequired: z.number().min(0, 'Left leg requirement must be 0 or more'),
    rightLegRequired: z.number().min(0, 'Right leg requirement must be 0 or more')
  })
});

type RewardFormValues = z.infer<typeof rewardFormSchema>;

interface RewardFormProps {
  reward?: RewardType;
  onSuccess?: () => void;
}

export function RewardForm({ reward, onSuccess }: RewardFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    reward?.imageUrl || null
  );

  const form = useForm<RewardFormValues>({
    resolver: zodResolver(rewardFormSchema),
    defaultValues: {
      name: '',
      description: '',
      value: 0,
      level: 1,
      orderInLevel: 1,
      isActive: true,
      image: undefined,
      imageUrl: '',
      requirements: {
        leftLegRequired: 0,
        rightLegRequired: 0
      }
    },
  });

  // Reset form when reward prop changes
  useEffect(() => {
    if (reward) {
      const formValues = {
        name: reward.name || '',
        description: reward.description || '',
        value: reward.value || 0,
        level: reward.level || 1,
        orderInLevel: reward.orderInLevel || 1,
        isActive: reward.isActive ?? true,
        image: undefined,
        imageUrl: reward.imageUrl || '',
        requirements: {
          leftLegRequired: reward.requirements?.leftLegRequired || 0,
          rightLegRequired: reward.requirements?.rightLegRequired || 0
        }
      };
      
      form.reset(formValues);
      setPreviewUrl(reward.imageUrl || null);
    } else {
      form.reset({
        name: '',
        description: '',
        value: 0,
        level: 1,
        orderInLevel: 1,
        isActive: true,
        image: undefined,
        imageUrl: '',
        requirements: {
          leftLegRequired: 0,
          rightLegRequired: 0
        }
      });
      setPreviewUrl(null);
    }
  }, [reward, form]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file');
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Image size should be less than 2MB');
        return;
      }
      form.setValue('image', file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    form.setValue('image', undefined);
    form.setValue('imageUrl', '');
    setPreviewUrl(null);
  };

  const uploadImage = async (file: File): Promise<{ url: string }> => {
    try {
      const result = await fileUploadApi.upload(file);
      return { url: result.url };
    } catch (error: any) {
      console.error('Image upload error:', error);
      throw new Error(error.message || 'Failed to upload image');
    }
  };

  const onSubmit = async (values: RewardFormValues) => {
    try {
      setIsLoading(true);
      
      let imageUrl = values.imageUrl || '';
      
      // Handle image upload only if a new image was selected
      if (values.image && values.image instanceof File) {
        try {
          const uploadResult = await uploadImage(values.image);
          imageUrl = uploadResult.url;
        } catch (error) {
          console.error('Image upload failed, continuing without image', error);
          // Continue without the image if upload fails
        }
      }

      const rewardData: RewardBase = {
        name: values.name,
        description: values.description || null,
        value: values.value,
        level: values.level,
        orderInLevel: values.orderInLevel,
        isActive: values.isActive,
        imageUrl: imageUrl || null,
        requirements: {
          leftLegRequired: values.requirements.leftLegRequired,
          rightLegRequired: values.requirements.rightLegRequired
        }
      };

      // Check for both _id and id since the API might use either
      const rewardId = reward?._id || reward?.id;
      
      if (rewardId) {
        await rewardApi.admin.updateReward(rewardId, rewardData);
        toast.success('Reward updated successfully');
      } else {
        await rewardApi.admin.createReward(rewardData);
        toast.success('Reward created successfully');
      }

      onSuccess?.();
      router.push('/admin/rewards');
      router.refresh();
    } catch (error) {
      console.error('Error saving reward:', error);
      toast.error('Failed to save reward. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="space-y-6">
          {/* Reward Image - Optional */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <FormLabel className="text-sm font-medium text-gray-700">Reward Image</FormLabel>
              <span className="text-xs text-gray-500">(Optional)</span>
            </div>
            <div className="flex items-center space-x-6">
              <div className="flex-shrink-0 relative">
                <div className="h-32 w-32 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 overflow-hidden flex items-center justify-center">
                  {previewUrl ? (
                    <>
                      <img
                        src={previewUrl}
                        alt="Reward preview"
                        className="h-full w-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                        aria-label="Remove image"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </>
                  ) : (
                    <div className="text-gray-400 p-2 text-center">
                      <ImageIcon className="mx-auto h-10 w-10 mb-2" />
                      <p className="text-xs text-gray-500">No image selected</p>
                      <p className="text-[10px] text-gray-400 mt-1">(Optional)</p>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex-1 max-w-xs">
                <div className="flex items-center space-x-3">
                  <label
                    htmlFor="image-upload"
                    className="cursor-pointer rounded-md bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm border border-gray-300 hover:bg-gray-50 transition-colors"
                  >
                    <span className="flex items-center">
                      <ImageIcon className="h-4 w-4 mr-2" />
                      Choose Image
                    </span>
                    <input
                      id="image-upload"
                      type="file"
                      className="sr-only"
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                  </label>
                  {previewUrl && (
                    <button
                      type="button"
                      onClick={removeImage}
                      className="text-sm text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  Recommended: 800x400px JPG, PNG, or GIF (max 2MB)
                </p>
              </div>
            </div>
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            {/* Name */}
            <div className="sm:col-span-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="block text-sm font-medium text-gray-700">
                      Reward Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="Enter reward name"
                        className="mt-1"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="mt-1 text-sm text-red-600" />
                  </FormItem>
                )}
              />
            </div>

            {/* Level */}
            <div className="sm:col-span-2">
              <FormField
                control={form.control}
                name="level"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="block text-sm font-medium text-gray-700">
                      Level (1-6)
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        max={6}
                        className="mt-1"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage className="mt-1 text-sm text-red-600" />
                  </FormItem>
                )}
              />
            </div>

            {/* Description */}
            <div className="sm:col-span-6">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="block text-sm font-medium text-gray-700">
                      Description
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        rows={3}
                        placeholder="Describe this reward..."
                        className="mt-1"
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage className="mt-1 text-sm text-red-600" />
                  </FormItem>
                )}
              />
            </div>

            {/* Value */}
            <div className="sm:col-span-2">
              <FormField
                control={form.control}
                name="value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="block text-sm font-medium text-gray-700">
                      Value ($)
                    </FormLabel>
                    <FormControl>
                      <div className="relative mt-1 rounded-md shadow-sm">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                          <span className="text-gray-500 sm:text-sm">$</span>
                        </div>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          className="pl-8"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="mt-1 text-sm text-red-600" />
                  </FormItem>
                )}
              />
            </div>

            {/* Order in Level */}
            <div className="sm:col-span-2">
              <FormField
                control={form.control}
                name="orderInLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="block text-sm font-medium text-gray-700">
                      Order in Level
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        className="mt-1"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage className="mt-1 text-sm text-red-600" />
                  </FormItem>
                )}
              />
            </div>

            {/* Active Status */}
            <div className="sm:col-span-2 flex items-end">
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="!m-0 text-sm font-medium text-gray-700">
                      Active
                    </FormLabel>
                  </FormItem>
                )}
              />
            </div>

            {/* Requirements Section */}
            <div className="sm:col-span-6 pt-4 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-900">Requirements</h3>
              <p className="mt-1 text-sm text-gray-500">
                Set the requirements for users to earn this reward.
              </p>

              <div className="mt-4 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                {/* Left Leg Required */}
                <div className="sm:col-span-3">
                  <FormField
                    control={form.control}
                    name="requirements.leftLegRequired"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="block text-sm font-medium text-gray-700">
                          Left Leg Volume ($)
                        </FormLabel>
                        <FormControl>
                          <div className="relative mt-1 rounded-md shadow-sm">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                              <span className="text-gray-500 sm:text-sm">$</span>
                            </div>
                            <Input
                              type="number"
                              min="0"
                              step="1"
                              className="pl-8"
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </div>
                        </FormControl>
                        <FormMessage className="mt-1 text-sm text-red-600" />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Right Leg Required */}
                <div className="sm:col-span-3">
                  <FormField
                    control={form.control}
                    name="requirements.rightLegRequired"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="block text-sm font-medium text-gray-700">
                          Right Leg Volume ($)
                        </FormLabel>
                        <FormControl>
                          <div className="relative mt-1 rounded-md shadow-sm">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                              <span className="text-gray-500 sm:text-sm">$</span>
                            </div>
                            <Input
                              type="number"
                              min="0"
                              step="1"
                              className="pl-8"
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </div>
                        </FormControl>
                        <FormMessage className="mt-1 text-sm text-red-600" />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/admin/rewards')}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {reward ? 'Update Reward' : 'Create Reward'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
