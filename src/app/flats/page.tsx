'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Layout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import { flatsApi } from '@/lib/api';
import {
  Building2,
  MapPin,
  TrendingUp,
  DollarSign,
  Percent,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  Clock,
  Layers,
  Home,
  Info,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Upload,
  Image as ImageIcon,
  Tv,
  Bed,
  Sofa,
  KeyRound,
  Utensils,
  Coffee,
  Wallet,
  ArrowUpRight,
  Receipt,
  Check,
  PackageCheck,
  Plus,
  Trash2,
  X,
  AlertCircle,
  RefreshCw,
  Send,
  Sliders,
  CreditCard,
  UserCheck,
  Zap,
  Droplets,
  Wifi,
  Snowflake,
  Landmark,
  Lock,
  Coins
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from 'sonner';
import { Flat, FlatInvestment, InventoryItem, AirbnbWalletData, PropertyWithdrawal, AdminTreasury, AdminCapitalTransaction } from '@shared/schema';

// Safe USD currency formatter
const formatUSD = (val?: number | string | null) => {
  if (val === undefined || val === null || val === '') return "$0";
  const num = Number(val);
  if (isNaN(num)) return "$0";
  return "$" + num.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
};

  // Category icon helper for furnishing inventory
  const getCategoryIcon = (category: string) => {
    const cat = (category || '').toLowerCase();
    if (cat.includes('bed')) return <Bed className="h-4 w-4 text-sky-500 dark:text-sky-400" />;
    if (cat.includes('living') || cat.includes('sofa')) return <Sofa className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />;
    if (cat.includes('elect') || cat.includes('tv')) return <Tv className="h-4 w-4 text-purple-500 dark:text-purple-400" />;
    if (cat.includes('smart') || cat.includes('tech') || cat.includes('lock')) return <KeyRound className="h-4 w-4 text-amber-500 dark:text-amber-400" />;
    if (cat.includes('kitchen') || cat.includes('dining')) return <Utensils className="h-4 w-4 text-rose-500 dark:text-rose-400" />;
    if (cat.includes('coffee')) return <Coffee className="h-4 w-4 text-yellow-500 dark:text-yellow-400" />;
    return <PackageCheck className="h-4 w-4 text-teal-500 dark:text-teal-400" />;
  };

  const DEFAULT_UTILITY_POLICY = "100% of the following operating bills are fully managed, paid, and absorbed by the on-ground Superhost team with zero additional investor liability:";
  const DEFAULT_UTILITY_BILLS = [
    "Electricity & Power",
    "Water & Sewerage",
    "1Gbps Fiber Wi-Fi",
    "Central HVAC / AC",
    "Netflix & Disney+",
    "Turnover Cleaning",
  ];

  const getUtilityIcon = (bill: string) => {
    const b = (bill || '').toLowerCase();
    if (b.includes('elect') || b.includes('power') || b.includes('solar')) return <Zap className="h-4 w-4 text-amber-500 shrink-0" />;
    if (b.includes('water') || b.includes('sewer')) return <Droplets className="h-4 w-4 text-sky-500 shrink-0" />;
    if (b.includes('wifi') || b.includes('wi-fi') || b.includes('internet') || b.includes('fiber')) return <Wifi className="h-4 w-4 text-indigo-500 shrink-0" />;
    if (b.includes('hvac') || b.includes('ac') || b.includes('air') || b.includes('cool') || b.includes('heat')) return <Snowflake className="h-4 w-4 text-cyan-500 shrink-0" />;
    if (b.includes('tv') || b.includes('netflix') || b.includes('stream') || b.includes('disney')) return <Tv className="h-4 w-4 text-purple-500 shrink-0" />;
    return <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />;
  };

// Preset furnishing package builder
const getRecommendedInventory = (totalPrice: number): InventoryItem[] => [
  { name: "Master Suite: King Platform Bed & Memory Foam Mattress", category: "Bedroom", costUsd: Math.round(totalPrice * 0.12), description: "Hotel-grade luxury king bed set with premium hybrid mattress" },
  { name: "Living Room: Designer 6-Piece Sectional Sofa & Table", category: "Living Room", costUsd: Math.round(totalPrice * 0.14), description: "Stain-resistant fabric sectional with marble accent coffee table" },
  { name: "Entertainment: 65\" 4K Smart TV & Audio Soundbar", category: "Electronics", costUsd: Math.round(totalPrice * 0.08), description: "Integrated with Netflix, Disney+, and smart guest concierge" },
  { name: "Security: Keyless Smart Digital Deadbolt & Doorbell", category: "Smart Tech", costUsd: Math.round(totalPrice * 0.03), description: "Automated unique guest PIN codes synchronized with booking calendar" },
  { name: "Dining & Kitchen: Complete 6-Person Dining Set & Cookware", category: "Kitchen", costUsd: Math.round(totalPrice * 0.10), description: "Hardwood dining table, chef cookware set, and premium dinnerware" },
  { name: "Coffee Station: Nespresso Barista Espresso Setup", category: "Kitchen", costUsd: Math.round(totalPrice * 0.02), description: "Complimentary coffee bar setup designed for 5-star reviews" },
  { name: "Linens & Spa Essentials: Egyptian Cotton Linens (3 sets)", category: "Supplies", costUsd: Math.round(totalPrice * 0.05), description: "Hotel-grade towels, duvet inserts, luxury pillows, and bathrobes" },
  { name: "Professional Staging, HDR Photography & STR Licensing", category: "Setup", costUsd: Math.round(totalPrice * 0.08), description: "Short term vacation rental license, city registration & photo shoot" },
  { name: "Lease Security Deposit & Reserve Fund", category: "Operations", costUsd: Math.round(totalPrice * 0.38), description: "Initial building lease deposit, utility setup & operating reserve" },
];

const DEFAULT_PROPERTY_IMAGE = 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80';

// Client-side image compressor so uploaded pictures store reliably in MongoDB across local & deployed environments
const compressImageFile = (file: File, maxDimension = 1280, quality = 0.82): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error(`Failed to read ${file.name}`));
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const img = new window.Image();
      img.onerror = () => resolve(dataUrl);
      img.onload = () => {
        try {
          let { width, height } = img;
          if (width > maxDimension || height > maxDimension) {
            if (width >= height) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            } else {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(dataUrl);
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        } catch {
          resolve(dataUrl);
        }
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  });
};

// Reusable multi-picture sequential carousel (displays pictures one after another with auto-slide + controls)
function PropertyImageCarousel({
  images,
  title,
  heightClass = 'h-56',
  autoPlayMs = 3500,
  showThumbnails = false,
  children,
}: {
  images?: string[];
  title: string;
  heightClass?: string;
  autoPlayMs?: number;
  showThumbnails?: boolean;
  children?: React.ReactNode;
}) {
  const validImages = Array.isArray(images) && images.filter(Boolean).length > 0
    ? images.filter(Boolean)
    : [DEFAULT_PROPERTY_IMAGE];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (currentIndex >= validImages.length) {
      setCurrentIndex(0);
    }
  }, [validImages.length, currentIndex]);

  useEffect(() => {
    if (validImages.length <= 1 || isPaused || !autoPlayMs) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % validImages.length);
    }, autoPlayMs);
    return () => clearInterval(timer);
  }, [validImages.length, isPaused, autoPlayMs]);

  const goPrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + validImages.length) % validImages.length);
  };

  const goNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % validImages.length);
  };

  return (
    <div className="space-y-2">
      <div
        className={`relative ${heightClass} w-full overflow-hidden bg-slate-100 dark:bg-slate-800 select-none`}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        {validImages.map((imgSrc, idx) => (
          <img
            key={`${idx}-${imgSrc.slice(0, 32)}`}
            src={imgSrc}
            alt={`${title} - Photo ${idx + 1}`}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
              idx === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
            }`}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/30 z-10 pointer-events-none" />

        {validImages.length > 1 && (
          <>
            {/* Prev / Next Controls */}
            <button
              type="button"
              onClick={goPrev}
              aria-label="Previous picture"
              className="absolute left-2.5 top-1/2 -translate-y-1/2 z-20 h-8 w-8 rounded-full bg-slate-950/70 hover:bg-slate-950 text-white border border-white/20 flex items-center justify-center backdrop-blur-sm transition-all shadow-md"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={goNext}
              aria-label="Next picture"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 z-20 h-8 w-8 rounded-full bg-slate-950/70 hover:bg-slate-950 text-white border border-white/20 flex items-center justify-center backdrop-blur-sm transition-all shadow-md"
            >
              <ChevronRight className="h-4 w-4" />
            </button>

            {/* Counter Badge */}
            <div className="absolute top-3 right-3 z-20 bg-slate-950/75 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-white/20 backdrop-blur-md flex items-center gap-1">
              <ImageIcon className="h-3 w-3 text-sky-400" />
              <span>{currentIndex + 1} / {validImages.length}</span>
            </div>

            {/* Dot Indicators */}
            <div className="absolute bottom-3 right-3 z-20 flex items-center gap-1.5 bg-slate-950/60 px-2 py-1 rounded-full backdrop-blur-sm border border-white/10">
              {validImages.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentIndex(idx);
                  }}
                  aria-label={`View picture ${idx + 1}`}
                  className={`h-1.5 rounded-full transition-all ${
                    idx === currentIndex ? 'w-4 bg-emerald-400' : 'w-1.5 bg-white/60 hover:bg-white'
                  }`}
                />
              ))}
            </div>
          </>
        )}

        <div className="relative z-20 w-full h-full pointer-events-none">
          {children}
        </div>
      </div>

      {/* Optional Thumbnail Strip for Detail / Inspect Modals */}
      {showThumbnails && validImages.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {validImages.map((imgSrc, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrentIndex(idx)}
              className={`relative h-14 w-20 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                idx === currentIndex
                  ? 'border-emerald-500 ring-2 ring-emerald-500/30 scale-[1.02]'
                  : 'border-slate-200 dark:border-slate-800 opacity-70 hover:opacity-100'
              }`}
            >
              <img src={imgSrc} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
              <span className="absolute bottom-0.5 right-1 bg-slate-950/80 text-white text-[9px] font-bold px-1 rounded">
                #{idx + 1}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function PropertyInvestmentPageContent() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const queryClient = useQueryClient();

  const searchParams = useSearchParams();
  const tabQuery = searchParams?.get('tab');

  const [activeTab, setActiveTab] = useState<'marketplace' | 'wallet' | 'admin'>((tabQuery as any) || 'marketplace');

  useEffect(() => {
    if (tabQuery === 'marketplace' || tabQuery === 'wallet' || tabQuery === 'admin') {
      setActiveTab(tabQuery as any);
    }
  }, [tabQuery]);
  const [selectedFlat, setSelectedFlat] = useState<Flat | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isInspectModalOpen, setIsInspectModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [isAdminAddModalOpen, setIsAdminAddModalOpen] = useState(false);
  const [isAdminPayoutModalOpen, setIsAdminPayoutModalOpen] = useState(false);
  const [selectedInvestmentForPayout, setSelectedInvestmentForPayout] = useState<FlatInvestment | null>(null);

  // User Investment Form State
  const [investmentSharePercent, setInvestmentSharePercent] = useState<number>(100);
  const [paymentMethod, setPaymentMethod] = useState<'Platform Wallet' | 'USDT (TRC-20)' | 'Bank Transfer'>('Platform Wallet');
  const [paymentProof, setPaymentProof] = useState<string>('');

  // User Dedicated Property Rental Withdrawal State
  const [withdrawAmount, setWithdrawAmount] = useState<string>('');
  const [withdrawMethod, setWithdrawMethod] = useState<string>('USDT (TRC-20)');
  const [withdrawAddress, setWithdrawAddress] = useState<string>(user?.walletAddress || '');

  // Admin Treasury Operations State
  const [treasuryActionType, setTreasuryActionType] = useState<'inject' | 'rent' | 'profit' | 'utility' | null>(null);
  const [treasuryActionAmount, setTreasuryActionAmount] = useState<string>('');
  const [treasuryActionNote, setTreasuryActionNote] = useState<string>('');

  // Admin Payout Form State (supports Daily micro-payouts and Monthly rent runs)
  const [payoutType, setPayoutType] = useState<'monthly' | 'daily'>('monthly');
  const [payoutDaysCount, setPayoutDaysCount] = useState<number>(30);
  const [payoutAmount, setPayoutAmount] = useState<string>('');
  const [payoutMonthYear, setPayoutMonthYear] = useState<string>('October 2026');
  const [payoutNote, setPayoutNote] = useState<string>('Monthly rental dividend');

  // Admin Add Property Form State
  const [newPropTitle, setNewPropTitle] = useState('');
  const [newPropUnitType, setNewPropUnitType] = useState('2-Bedroom Luxury Suite');
  const [newPropLocation, setNewPropLocation] = useState('Miami, Florida, USA');
  const [newPropPrice, setNewPropPrice] = useState('3000');
  const [newPropRent, setNewPropRent] = useState('520');
  const [newPropDailyRate, setNewPropDailyRate] = useState('55');
  const [newPropYield, setNewPropYield] = useState('21');
  const [newPropDesc, setNewPropDesc] = useState('');
  const [newPropFeatures, setNewPropFeatures] = useState('Prime Location, Smart Lock, Resort Pool, High Occupancy, 100% Bills Covered');
  const [newPropImages, setNewPropImages] = useState('');
  const [newPropImageList, setNewPropImageList] = useState<string[]>([DEFAULT_PROPERTY_IMAGE]);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [newPropInventory, setNewPropInventory] = useState<InventoryItem[]>([]);

  // Admin Edit Existing Property Photos State
  const [editingPhotosFlat, setEditingPhotosFlat] = useState<Flat | null>(null);
  const [editingPhotosList, setEditingPhotosList] = useState<string[]>([]);
  const [editingPhotoUrlInput, setEditingPhotoUrlInput] = useState('');

  // Admin Full Edit Property (Pricing, Values, Inventory Components & Utility Bills) State
  const [editingPropertyFlat, setEditingPropertyFlat] = useState<Flat | null>(null);
  const [editPropTitle, setEditPropTitle] = useState('');
  const [editPropUnitType, setEditPropUnitType] = useState('');
  const [editPropLocation, setEditPropLocation] = useState('');
  const [editPropPrice, setEditPropPrice] = useState('');
  const [editPropRent, setEditPropRent] = useState('');
  const [editPropDailyRate, setEditPropDailyRate] = useState('');
  const [editPropYield, setEditPropYield] = useState('');
  const [editPropDesc, setEditPropDesc] = useState('');
  const [editPropFeatures, setEditPropFeatures] = useState('');
  const [editPropStatus, setEditPropStatus] = useState<'available' | 'in_setup' | 'active' | 'fully_occupied'>('available');
  const [editPropInventory, setEditPropInventory] = useState<InventoryItem[]>([]);
  const [editPropUtilityPolicy, setEditPropUtilityPolicy] = useState(DEFAULT_UTILITY_POLICY);
  const [editPropUtilityBills, setEditPropUtilityBills] = useState<string[]>([...DEFAULT_UTILITY_BILLS]);
  const [newEditBillInput, setNewEditBillInput] = useState('');
  const [editCustomItemName, setEditCustomItemName] = useState('');
  const [editCustomItemCategory, setEditCustomItemCategory] = useState('Bedroom');
  const [editCustomItemCost, setEditCustomItemCost] = useState('');
  const [editCustomItemDesc, setEditCustomItemDesc] = useState('');
  const [isInspectEditing, setIsInspectEditing] = useState(false);

  const openEditPropertyModal = (flat: Flat) => {
    setEditingPropertyFlat(flat);
    setEditPropTitle(flat.title || '');
    setEditPropUnitType(flat.unitType || '2-Bedroom Luxury Suite');
    setEditPropLocation(flat.location || '');
    setEditPropPrice(String(flat.totalPriceUsd || 3000));
    setEditPropRent(String(flat.monthlyRentUsd || 550));
    setEditPropDailyRate(String(flat.dailyRateUsd || 65));
    setEditPropYield(String(flat.annualYieldPercent || 20));
    setEditPropDesc(flat.description || '');
    setEditPropFeatures(Array.isArray(flat.features) ? flat.features.join(', ') : '');
    setEditPropStatus(flat.status || 'available');
    setEditPropInventory(
      Array.isArray(flat.inventory) && flat.inventory.length > 0
        ? flat.inventory.map(item => ({ ...item }))
        : getRecommendedInventory(Number(flat.totalPriceUsd) || 3000)
    );
    setEditPropUtilityPolicy(flat.utilityPolicyText || DEFAULT_UTILITY_POLICY);
    setEditPropUtilityBills(
      Array.isArray(flat.utilityBills) && flat.utilityBills.length > 0
        ? [...flat.utilityBills]
        : [...DEFAULT_UTILITY_BILLS]
    );
    setNewEditBillInput('');
    setEditCustomItemName('');
    setEditCustomItemCost('');
    setEditCustomItemDesc('');
  };

  // Admin Bank/Account Payout & Direct Credit State
  const [payoutBankAccount, setPayoutBankAccount] = useState<string>('');
  const [payoutDestination, setPayoutDestination] = useState<string>('Bank Account & Property Wallet');
  const [selectedInvestorForCredit, setSelectedInvestorForCredit] = useState<any | null>(null);
  const [creditAmount, setCreditAmount] = useState<string>('');
  const [creditMonthYear, setCreditMonthYear] = useState<string>('October 2026');
  const [creditPropertyTitle, setCreditPropertyTitle] = useState<string>('');
  const [creditBankAccount, setCreditBankAccount] = useState<string>('');
  const [creditDestination, setCreditDestination] = useState<string>('Investor Bank Account & Property Wallet');
  const [creditNote, setCreditNote] = useState<string>('Monthly return on property investment');

  const handleReplaceSingleImage = async (
    file: File | undefined,
    index: number,
    targetSetter: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error(`${file.name} is not an image file`);
      return;
    }
    setIsUploadingImages(true);
    try {
      const compressed = await compressImageFile(file);
      targetSetter((prev) => {
        const copy = [...prev];
        copy[index] = compressed;
        return copy;
      });
      toast.success(`Changed picture #${index + 1}`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to replace picture');
    } finally {
      setIsUploadingImages(false);
    }
  };

  const handleUploadPropertyFiles = async (
    files: FileList | null,
    targetSetter: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    if (!files || files.length === 0) return;
    setIsUploadingImages(true);
    try {
      const fileArray = Array.from(files);
      const compressedList: string[] = [];
      for (const file of fileArray) {
        if (!file.type.startsWith('image/')) {
          toast.error(`${file.name} is not an image file`);
          continue;
        }
        const compressed = await compressImageFile(file);
        compressedList.push(compressed);
      }
      if (compressedList.length > 0) {
        targetSetter((prev) => {
          // If only the default placeholder was there, replace it with the uploaded photo(s); otherwise append one after another
          const base = prev.length === 1 && prev[0] === DEFAULT_PROPERTY_IMAGE ? [] : prev;
          return [...base, ...compressedList];
        });
        toast.success(`Added ${compressedList.length} picture${compressedList.length > 1 ? 's' : ''}`);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to process selected pictures');
    } finally {
      setIsUploadingImages(false);
    }
  };

  const handleAddImageUrl = (
    rawInput: string,
    clearInput: () => void,
    targetSetter: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    const urls = rawInput
      .split(/[\n,]+/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (urls.length === 0) {
      toast.error('Please paste at least one image URL');
      return;
    }
    targetSetter((prev) => {
      const base = prev.length === 1 && prev[0] === DEFAULT_PROPERTY_IMAGE ? [] : prev;
      return [...base, ...urls];
    });
    clearInput();
    toast.success(`Added ${urls.length} image URL${urls.length > 1 ? 's' : ''}`);
  };

  const moveImageInList = (
    index: number,
    direction: -1 | 1,
    targetSetter: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    targetSetter((prev) => {
      const nextIndex = index + direction;
      if (nextIndex < 0 || nextIndex >= prev.length) return prev;
      const copy = [...prev];
      const [item] = copy.splice(index, 1);
      copy.splice(nextIndex, 0, item);
      return copy;
    });
  };

  // Admin Custom Inventory Item Builder State
  const [customItemName, setCustomItemName] = useState('');
  const [customItemCategory, setCustomItemCategory] = useState('Bedroom');
  const [customItemCost, setCustomItemCost] = useState('');

  const handleAddCustomInventoryItem = () => {
    if (!customItemName.trim()) {
      toast.error('Please enter an item name');
      return;
    }
    const cost = Number(customItemCost) || 0;
    setNewPropInventory(prev => [
      ...prev,
      {
        name: customItemName.trim(),
        category: customItemCategory,
        costUsd: cost,
        description: `${customItemCategory} furnishing & setup item`,
      }
    ]);
    setCustomItemName('');
    setCustomItemCost('');
  };

  const openInspectModal = (flat: Flat) => {
    setSelectedFlat(flat);
    setIsInspectEditing(false);
    setIsInspectModalOpen(true);
  };

  // Fetch all Property Listings
  const { data: flats = [], isLoading: isLoadingFlats } = useQuery<Flat[]>({
    queryKey: ['flats'],
    queryFn: flatsApi.getAll,
  });

  // Fetch dedicated Property Wallet & active units data
  const { data: walletData, isLoading: isLoadingWallet } = useQuery<AirbnbWalletData>({
    queryKey: ['airbnbWallet'],
    queryFn: flatsApi.getWallet,
    enabled: !!user,
  });

  // Fetch all investments for Admin
  const { data: allAdminInvestments = [], isLoading: isLoadingAdminInvestments } = useQuery<FlatInvestment[]>({
    queryKey: ['adminFlatInvestments'],
    queryFn: flatsApi.getAllInvestments,
    enabled: isAdmin,
  });

  // User Invest Mutation
  const investMutation = useMutation({
    mutationFn: async ({ flatId, amountUsd, ownershipSharePercent, paymentMethod, paymentProof }: {
      flatId: number;
      amountUsd: number;
      ownershipSharePercent: number;
      paymentMethod: string;
      paymentProof?: string;
    }) => {
      return await flatsApi.invest(flatId, { amountUsd, ownershipSharePercent, paymentMethod, paymentProof });
    },
    onSuccess: (data) => {
      toast.success(data.message || 'Investment submitted successfully! Pending admin approval.');
      queryClient.invalidateQueries({ queryKey: ['flats'] });
      queryClient.invalidateQueries({ queryKey: ['airbnbWallet'] });
      queryClient.invalidateQueries({ queryKey: ['adminFlatInvestments'] });
      setIsDetailModalOpen(false);
      setSelectedFlat(null);
      setPaymentProof('');
      setActiveTab('wallet');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to submit investment');
    },
  });

  // Admin Approve Investment Mutation
  const approveInvestmentMutation = useMutation({
    mutationFn: async (id: number) => {
      return await flatsApi.approveInvestment(id);
    },
    onSuccess: () => {
      toast.success('Investment approved! Property moved into on-ground setup phase.');
      queryClient.invalidateQueries({ queryKey: ['adminFlatInvestments'] });
      queryClient.invalidateQueries({ queryKey: ['flats'] });
      queryClient.invalidateQueries({ queryKey: ['airbnbWallet'] });
    },
    onError: (err: any) => toast.error(err.message || 'Approval failed'),
  });

  // Admin Reject Investment Mutation
  const rejectInvestmentMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: number; reason?: string }) => {
      return await flatsApi.rejectInvestment(id, reason);
    },
    onSuccess: () => {
      toast.info('Investment request rejected.');
      queryClient.invalidateQueries({ queryKey: ['adminFlatInvestments'] });
      queryClient.invalidateQueries({ queryKey: ['flats'] });
    },
    onError: (err: any) => toast.error(err.message || 'Rejection failed'),
  });

  // Admin Advance Phase Mutation
  const phaseMutation = useMutation({
    mutationFn: async ({ id, phase }: { id: number; phase: string }) => {
      return await flatsApi.updateSetupPhase(id, phase);
    },
    onSuccess: () => {
      toast.success('Operational phase updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['adminFlatInvestments'] });
      queryClient.invalidateQueries({ queryKey: ['flats'] });
      queryClient.invalidateQueries({ queryKey: ['airbnbWallet'] });
    },
    onError: (err: any) => toast.error(err.message || 'Failed to update phase'),
  });

  // Admin Create Property Mutation
  const createPropertyMutation = useMutation({
    mutationFn: async (data: any) => {
      return await flatsApi.createFlat(data);
    },
    onSuccess: () => {
      toast.success('New property listed successfully!');
      queryClient.invalidateQueries({ queryKey: ['flats'] });
      setIsAdminAddModalOpen(false);
      // Reset form
      setNewPropTitle('');
      setNewPropDesc('');
      setNewPropImages('');
      setNewPropImageList([DEFAULT_PROPERTY_IMAGE]);
      setNewPropInventory([]);
    },
    onError: (err: any) => toast.error(err.message || 'Failed to create property'),
  });

  // Admin Update Property Images Mutation
  const updatePropertyImagesMutation = useMutation({
    mutationFn: async ({ id, images }: { id: number; images: string[] }) => {
      return await flatsApi.updateFlat(id, { images });
    },
    onSuccess: () => {
      toast.success('Property pictures updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['flats'] });
      queryClient.invalidateQueries({ queryKey: ['airbnbWallet'] });
      queryClient.invalidateQueries({ queryKey: ['adminFlatInvestments'] });
      setEditingPhotosFlat(null);
      setEditingPhotosList([]);
      setEditingPhotoUrlInput('');
    },
    onError: (err: any) => toast.error(err.message || 'Failed to update property pictures'),
  });

  // Admin Full Update Property (Pricing, Values, Inventory & Utility Bills) Mutation
  const updatePropertyDetailsMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<Flat> }) => {
      return await flatsApi.updateFlat(id, updates);
    },
    onSuccess: (updatedFlat) => {
      toast.success('Property pricing, inventory values & specifications updated!');
      queryClient.invalidateQueries({ queryKey: ['flats'] });
      queryClient.invalidateQueries({ queryKey: ['airbnbWallet'] });
      queryClient.invalidateQueries({ queryKey: ['adminFlatInvestments'] });
      if (selectedFlat && updatedFlat && selectedFlat.id === updatedFlat.id) {
        setSelectedFlat(updatedFlat);
      }
      setEditingPropertyFlat(null);
      setIsInspectEditing(false);
    },
    onError: (err: any) => toast.error(err.message || 'Failed to update property values'),
  });

  // Admin Delete Property Mutation
  const deletePropertyMutation = useMutation({
    mutationFn: async (id: number) => {
      return await flatsApi.deleteFlat(id);
    },
    onSuccess: () => {
      toast.success('Property listing deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['flats'] });
    },
    onError: (err: any) => toast.error(err.message || 'Failed to delete property'),
  });

  // Admin Disburse Rental Dividend Mutation (supports daily, monthly, and bank account transfer)
  const disburseMutation = useMutation({
    mutationFn: async ({ id, amountUsd, monthYear, note, payoutType, daysCount, bankAccount, destination }: { id: number; amountUsd: number; monthYear: string; note: string; payoutType?: string; daysCount?: number; bankAccount?: string; destination?: string }) => {
      return await flatsApi.disburseRentalPayout(id, { amountUsd, monthYear, note, payoutType, daysCount, bankAccount, destination });
    },
    onSuccess: () => {
      toast.success('Monthly return sent to investor account & notification delivered!');
      queryClient.invalidateQueries({ queryKey: ['adminFlatInvestments'] });
      queryClient.invalidateQueries({ queryKey: ['adminPropertyInvestors'] });
      queryClient.invalidateQueries({ queryKey: ['airbnbWallet'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications/unread'] });
      setIsAdminPayoutModalOpen(false);
      setSelectedInvestmentForPayout(null);
    },
    onError: (err: any) => toast.error(err.message || 'Failed to disburse dividend'),
  });

  // Fetch all users & property investors summary for Admin
  const { data: allPropertyInvestors = [], isLoading: isLoadingInvestors } = useQuery<any[]>({
    queryKey: ['adminPropertyInvestors'],
    queryFn: flatsApi.getInvestors,
    enabled: isAdmin,
  });

  // Admin Direct Credit to Any Investor's Bank / Property Account Mutation
  const creditInvestorMutation = useMutation({
    mutationFn: async ({ userId, data }: { userId: number; data: { amountUsd: number; monthYear?: string; propertyTitle?: string; bankAccount?: string; destination?: string; note?: string } }) => {
      return await flatsApi.creditInvestor(userId, data);
    },
    onSuccess: () => {
      toast.success('Funds added to investor account & notification sent!');
      queryClient.invalidateQueries({ queryKey: ['adminPropertyInvestors'] });
      queryClient.invalidateQueries({ queryKey: ['adminFlatInvestments'] });
      queryClient.invalidateQueries({ queryKey: ['airbnbWallet'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications/unread'] });
      setSelectedInvestorForCredit(null);
      setCreditAmount('');
    },
    onError: (err: any) => toast.error(err.message || 'Failed to send money to investor account'),
  });

  // Admin Run End-of-Month Auto-Returns & Notify All Investors Mutation
  const runMonthlyReturnsMutation = useMutation({
    mutationFn: async (monthYear?: string) => {
      return await flatsApi.runMonthlyReturns(monthYear);
    },
    onSuccess: (res) => {
      toast.success(res.message || 'End-of-month property returns & notifications processed!');
      queryClient.invalidateQueries({ queryKey: ['adminPropertyInvestors'] });
      queryClient.invalidateQueries({ queryKey: ['adminFlatInvestments'] });
      queryClient.invalidateQueries({ queryKey: ['airbnbWallet'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications/unread'] });
    },
    onError: (err: any) => toast.error(err.message || 'Failed to run monthly returns'),
  });

  // User Dedicated Property Rental Withdrawal Mutation
  const withdrawRentalMutation = useMutation({
    mutationFn: async (data: { amountUsd: number; paymentMethod: string; walletAddressOrAccount: string }) => {
      return await flatsApi.requestWithdrawal(data);
    },
    onSuccess: (data) => {
      toast.success(data.message || 'Withdrawal request submitted! Processing within 24 hours.');
      queryClient.invalidateQueries({ queryKey: ['airbnbWallet'] });
      setIsWithdrawModalOpen(false);
      setWithdrawAmount('');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to submit withdrawal');
    },
  });

  // Execute Admin Treasury Action
  const executeTreasuryAction = async () => {
    const amt = Number(treasuryActionAmount);
    if (isNaN(amt) || amt <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    try {
      if (treasuryActionType === 'inject') {
        await flatsApi.injectCapital(amt, treasuryActionNote);
        toast.success(`Successfully injected $${amt.toLocaleString()} operating reserve`);
      } else if (treasuryActionType === 'rent') {
        await flatsApi.recordGrossRent(amt, treasuryActionNote);
        toast.success(`Recorded $${amt.toLocaleString()} gross Airbnb rent collection`);
      } else if (treasuryActionType === 'profit') {
        await flatsApi.withdrawAdminProfit(amt, treasuryActionNote);
        toast.success(`Withdrew $${amt.toLocaleString()} platform management profit`);
      } else if (treasuryActionType === 'utility') {
        await flatsApi.payUtilityExpense(amt, treasuryActionNote);
        toast.success(`Recorded $${amt.toLocaleString()} utility bill payment`);
      }
      queryClient.invalidateQueries({ queryKey: ['adminTreasury'] });
      queryClient.invalidateQueries({ queryKey: ['adminTreasuryTxs'] });
      setTreasuryActionType(null);
      setTreasuryActionAmount('');
      setTreasuryActionNote('');
    } catch (err: any) {
      toast.error(err.message || 'Failed to execute treasury action');
    }
  };

  // Admin Seed Demo Test Data Mutation
  const seedDemoMutation = useMutation({
    mutationFn: async () => {
      return await flatsApi.seedDemoData();
    },
    onSuccess: (data) => {
      toast.success(data.message || 'Demo test data seeded successfully!');
      queryClient.invalidateQueries({ queryKey: ['flats'] });
      queryClient.invalidateQueries({ queryKey: ['airbnbWallet'] });
      queryClient.invalidateQueries({ queryKey: ['adminFlatInvestments'] });
    },
    onError: (err: any) => toast.error(err.message || 'Failed to seed demo data'),
  });

  const openPropertyDetail = (flat: Flat) => {
    setSelectedFlat(flat);
    setInvestmentSharePercent(100);
    setPaymentMethod('Platform Wallet');
    setPaymentProof('');
    setIsDetailModalOpen(true);
  };

  const handleConfirmInvest = () => {
    if (!selectedFlat) return;
    const fullPrice = selectedFlat.totalPriceUsd || 0;
    const calculatedAmount = Math.round(fullPrice * (investmentSharePercent / 100));

    investMutation.mutate({
      flatId: selectedFlat.id,
      amountUsd: calculatedAmount,
      ownershipSharePercent: investmentSharePercent,
      paymentMethod,
      paymentProof,
    });
  };

  const myInvestments = walletData?.investments || [];
  const myPayouts = walletData?.payouts || [];
  const propertyBalance = walletData?.balanceUsd || 0;
  const propertyTotalEarned = walletData?.totalEarnedUsd || 0;
  const activeUnitsCount = walletData?.activeUnitsCount || 0;
  const totalPropertyInvested = myInvestments.reduce((sum, inv) => sum + (inv.amountUsd || 0), 0);

  // Selected flat investment calculation
  const currentPrice = selectedFlat?.totalPriceUsd || 0;
  const currentRent = selectedFlat?.monthlyRentUsd || 0;
  const userInvestAmount = Math.round(currentPrice * (investmentSharePercent / 100));
  const userExpectedMonthlyRent = Math.round(currentRent * (investmentSharePercent / 100));

  return (
    <Layout>
      <div className="py-5 sm:py-7">
        <div className="max-w-7xl mx-auto px-3 sm:px-5 md:px-6 lg:px-8 space-y-6">
          {/* Dashboard Header */}
          <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-sky-500/25 [html.light_&]:bg-white [html.light_&]:border-slate-200/80 shadow-md">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-sky-500 border-2 border-sky-400/40 shadow-lg flex items-center justify-center text-white shrink-0">
                  <Building2 className="w-7 h-7 sm:w-8 sm:h-8" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl md:text-3xl font-black font-display text-white [html.light_&]:text-slate-900">
                    Property <span className="gradient-text-primary">Investment</span>
                  </h1>
                  <p className="text-slate-300 [html.light_&]:text-slate-600 mt-0.5 text-xs sm:text-sm font-medium">
                    Acquire managed vacation rentals & luxury short-term rental packages. Earn steady, monthly rental dividends.
                  </p>
                </div>
              </div>

              <div className="mt-1 md:mt-0 flex flex-col sm:flex-row gap-2 sm:gap-3">
                <Button
                  variant="outline"
                  onClick={() => setActiveTab(activeTab === 'wallet' ? 'marketplace' : 'wallet')}
                  className="bg-sky-500/10 border-sky-400/30 text-sky-200 [html.light_&]:text-sky-800 [html.light_&]:bg-sky-50 hover:bg-sky-500/25 font-bold flex items-center space-x-2 w-full sm:w-auto rounded-xl"
                >
                  <Wallet className="h-4 w-4" />
                  <span>{activeTab === 'wallet' ? 'Browse Properties' : 'My Rental Wallet'}</span>
                </Button>
                {isAdmin && (
                  <Button
                    onClick={() => {
                      setNewPropInventory(getRecommendedInventory(Number(newPropPrice) || 3000));
                      setIsAdminAddModalOpen(true);
                    }}
                    className="bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 text-white font-bold shadow-lg shadow-sky-500/25 flex items-center space-x-2 w-full sm:w-auto rounded-xl"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Property</span>
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Top Banner: Investment Guarantee & Returns */}
          <div className="relative overflow-hidden rounded-3xl p-5 sm:p-6 bg-gradient-to-r from-amber-950/40 via-[#1c1917]/60 to-amber-950/30 [html.light_&]:from-[#fffbeb] [html.light_&]:via-[#fef3c7] [html.light_&]:to-[#fffbeb] border border-amber-500/30 [html.light_&]:border-amber-300 shadow-md">
            <div className="flex items-center gap-4 sm:gap-5">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-amber-500/20 [html.light_&]:bg-amber-100 border border-amber-400/40 [html.light_&]:border-amber-300 flex items-center justify-center text-amber-400 [html.light_&]:text-amber-700 shrink-0 shadow-inner">
                <Lock className="w-7 h-7 sm:w-8 sm:h-8" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[11px] sm:text-xs uppercase font-extrabold tracking-wider text-amber-300/90 [html.light_&]:text-amber-800 block mb-0.5">
                  SUPERHOST MANAGED • 100% BILLS INCLUDED
                </span>
                <h2 className="text-2xl sm:text-3xl font-black font-display text-amber-100 [html.light_&]:text-amber-950 tracking-tight">
                  18% – 21% Annual Return
                </h2>
                <p className="text-xs sm:text-sm font-semibold text-amber-300/80 [html.light_&]:text-amber-800/90 mt-0.5">
                  Withdrawable: <span className="text-emerald-400 [html.light_&]:text-emerald-700 font-extrabold">{formatUSD(propertyBalance)} USD</span> (Dedicated Property Rental Wallet)
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  queryClient.invalidateQueries({ queryKey: ['airbnbWallet'] });
                  queryClient.invalidateQueries({ queryKey: ['flats'] });
                  toast.success('Stats refreshed');
                }}
                className="text-amber-400 [html.light_&]:text-amber-700 hover:bg-amber-500/20 rounded-full h-9 w-9 shrink-0"
                title="Refresh Stats"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Centered Tab Switcher: Available Properties vs My Portfolio & Wallet vs Admin */}
          <div className="flex justify-center my-2">
            <div className="inline-flex bg-[#07182b] [html.light_&]:bg-slate-200/80 p-1.5 rounded-full border border-sky-500/20 [html.light_&]:border-slate-300 shadow-inner">
              <button
                onClick={() => setActiveTab('marketplace')}
                className={`px-7 py-2 rounded-full text-sm font-extrabold transition-all duration-200 ${
                  activeTab === 'marketplace'
                    ? "bg-gradient-to-r from-blue-600 via-sky-500 to-indigo-600 text-white shadow-lg shadow-sky-500/30 [html.light_&]:bg-blue-600 [html.light_&]:text-white"
                    : "text-slate-400 [html.light_&]:text-slate-600 hover:text-white [html.light_&]:hover:text-slate-900"
                }`}
              >
                Available Properties
              </button>
              <button
                onClick={() => setActiveTab('wallet')}
                className={`px-7 py-2 rounded-full text-sm font-extrabold transition-all duration-200 flex items-center gap-2 ${
                  activeTab === 'wallet'
                    ? "bg-gradient-to-r from-blue-600 via-sky-500 to-indigo-600 text-white shadow-lg shadow-sky-500/30 [html.light_&]:bg-blue-600 [html.light_&]:text-white"
                    : "text-slate-400 [html.light_&]:text-slate-600 hover:text-white [html.light_&]:hover:text-slate-900"
                }`}
              >
                <span>My Portfolio & Wallet</span>
                {activeUnitsCount > 0 && (
                  <span className="px-2 py-0.5 text-xs rounded-full bg-emerald-500 text-slate-950 font-black">
                    {activeUnitsCount}
                  </span>
                )}
              </button>
              {isAdmin && (
                <button
                  onClick={() => setActiveTab('admin')}
                  className={`px-7 py-2 rounded-full text-sm font-extrabold transition-all duration-200 flex items-center gap-2 ${
                    activeTab === 'admin'
                      ? "bg-gradient-to-r from-blue-600 via-sky-500 to-indigo-600 text-white shadow-lg shadow-sky-500/30 [html.light_&]:bg-blue-600 [html.light_&]:text-white"
                      : "text-slate-400 [html.light_&]:text-slate-600 hover:text-white [html.light_&]:hover:text-slate-900"
                  }`}
                >
                  <span>Admin Desk</span>
                  {allAdminInvestments.filter(i => i.status === 'pending_approval').length > 0 && (
                    <span className="px-2 py-0.5 text-xs rounded-full bg-amber-500 text-white font-extrabold animate-bounce">
                      {allAdminInvestments.filter(i => i.status === 'pending_approval').length}
                    </span>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* 6 Stat Cards Grid matching Deployed InvestPro */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3.5 sm:gap-4 md:gap-5">
            {/* Card 1: Total Balance */}
            <Card className="glass-card bg-[#0e2238]/90 [html.light_&]:bg-white/95 border-sky-500/20 [html.light_&]:border-slate-200/80 rounded-2xl shadow-md">
              <CardContent className="p-4 sm:p-5">
                <div className="flex items-start justify-between">
                  <div className="space-y-1.5 min-w-0">
                    <p className="text-xs sm:text-sm font-bold text-slate-300 [html.light_&]:text-slate-600 truncate">
                      Dedicated Property Wallet
                    </p>
                    <p className="text-xl sm:text-2xl font-black font-display text-white [html.light_&]:text-slate-900 tracking-tight">
                      {formatUSD(propertyBalance)}
                    </p>
                  </div>
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-teal-500/15 [html.light_&]:bg-teal-50 border border-teal-400/30 [html.light_&]:border-teal-200 text-teal-400 [html.light_&]:text-teal-600 flex items-center justify-center shrink-0">
                    <Wallet className="w-5 h-5" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Card 2: Total Investment */}
            <Card className="glass-card bg-[#0e2238]/90 [html.light_&]:bg-white/95 border-emerald-500/20 [html.light_&]:border-slate-200/80 rounded-2xl shadow-md">
              <CardContent className="p-4 sm:p-5">
                <div className="flex items-start justify-between">
                  <div className="space-y-1.5 min-w-0">
                    <p className="text-xs sm:text-sm font-bold text-slate-300 [html.light_&]:text-slate-600 truncate">
                      Total Property Investment
                    </p>
                    <p className="text-xl sm:text-2xl font-black font-display text-emerald-400 [html.light_&]:text-emerald-600 tracking-tight">
                      {formatUSD(totalPropertyInvested)}
                    </p>
                  </div>
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-500/15 [html.light_&]:bg-emerald-50 border border-emerald-400/30 [html.light_&]:border-emerald-200 text-emerald-400 [html.light_&]:text-emerald-600 flex items-center justify-center shrink-0">
                    <Coins className="w-5 h-5" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Card 3: Total Withdraw / Rental Paid */}
            <Card className="glass-card bg-[#0e2238]/90 [html.light_&]:bg-white/95 border-rose-500/20 [html.light_&]:border-slate-200/80 rounded-2xl shadow-md">
              <CardContent className="p-4 sm:p-5">
                <div className="flex items-start justify-between">
                  <div className="space-y-1.5 min-w-0">
                    <p className="text-xs sm:text-sm font-bold text-slate-300 [html.light_&]:text-slate-600 truncate">
                      Total Rental Dividends Paid
                    </p>
                    <p className="text-xl sm:text-2xl font-black font-display text-rose-400 [html.light_&]:text-rose-600 tracking-tight">
                      {formatUSD(propertyTotalEarned)}
                    </p>
                  </div>
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-rose-500/15 [html.light_&]:bg-rose-50 border border-rose-400/30 [html.light_&]:border-rose-200 text-rose-400 [html.light_&]:text-rose-600 flex items-center justify-center shrink-0">
                    <ArrowUpRight className="w-5 h-5" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Card 4: Target Annual Yield */}
            <Card className="glass-card bg-[#0e2238]/90 [html.light_&]:bg-white/95 border-teal-500/20 [html.light_&]:border-slate-200/80 rounded-2xl shadow-md">
              <CardContent className="p-4 sm:p-5">
                <div className="flex items-start justify-between">
                  <div className="space-y-1.5 min-w-0">
                    <p className="text-xs sm:text-sm font-bold text-slate-300 [html.light_&]:text-slate-600 truncate">
                      Target Annual Yield
                    </p>
                    <p className="text-xl sm:text-2xl font-black font-display text-teal-400 [html.light_&]:text-teal-600 tracking-tight">
                      18% – 21% / yr
                    </p>
                  </div>
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-teal-500/15 [html.light_&]:bg-teal-50 border border-teal-400/30 [html.light_&]:border-teal-200 text-teal-400 [html.light_&]:text-teal-600 flex items-center justify-center shrink-0">
                    <Percent className="w-5 h-5" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Card 5: Available Listings */}
            <Card className="glass-card bg-[#0e2238]/90 [html.light_&]:bg-white/95 border-amber-500/20 [html.light_&]:border-slate-200/80 rounded-2xl shadow-md">
              <CardContent className="p-4 sm:p-5">
                <div className="flex items-start justify-between">
                  <div className="space-y-1.5 min-w-0">
                    <p className="text-xs sm:text-sm font-bold text-slate-300 [html.light_&]:text-slate-600 truncate">
                      Available Listings
                    </p>
                    <p className="text-xl sm:text-2xl font-black font-display text-amber-400 [html.light_&]:text-amber-600 tracking-tight">
                      {flats.length} Vacation Suites
                    </p>
                  </div>
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-500/15 [html.light_&]:bg-amber-50 border border-amber-400/30 [html.light_&]:border-amber-200 text-amber-400 [html.light_&]:text-amber-600 flex items-center justify-center shrink-0">
                    <Building2 className="w-5 h-5" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Card 6: My Active Units */}
            <Card className="glass-card bg-[#0e2238]/90 [html.light_&]:bg-white/95 border-sky-500/20 [html.light_&]:border-slate-200/80 rounded-2xl shadow-md">
              <CardContent className="p-4 sm:p-5">
                <div className="flex items-start justify-between">
                  <div className="space-y-1.5 min-w-0">
                    <p className="text-xs sm:text-sm font-bold text-slate-300 [html.light_&]:text-slate-600 truncate">
                      My Operating Units
                    </p>
                    <p className="text-xl sm:text-2xl font-black font-display text-white [html.light_&]:text-slate-900 tracking-tight">
                      {activeUnitsCount} Properties
                    </p>
                  </div>
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-sky-500/15 [html.light_&]:bg-sky-50 border border-sky-400/30 [html.light_&]:border-sky-200 text-sky-400 [html.light_&]:text-sky-600 flex items-center justify-center shrink-0">
                    <Home className="w-5 h-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* TAB 1: AVAILABLE PROPERTIES MARKETPLACE */}
          {activeTab === 'marketplace' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black font-display text-white [html.light_&]:text-slate-900">
                    Featured Investment Properties
                  </h2>
                  <p className="text-slate-300 [html.light_&]:text-slate-600 text-xs sm:text-sm font-medium mt-0.5">
                    Each property includes a complete furnishing package, professional staging, smart tech, and ongoing Superhost management.
                  </p>
                </div>
              </div>

              {isLoadingFlats ? (
                <div className="py-24 text-center">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-r-transparent mb-4" />
                  <p className="text-slate-400 text-sm">Loading verified property listings...</p>
                </div>
              ) : flats.length === 0 ? (
                <div className="text-center py-20 bg-white/5 border border-sky-500/20 rounded-3xl p-8">
                  <Building2 className="h-12 w-12 text-slate-400 mx-auto mb-3" />
                  <h3 className="text-lg font-bold text-white [html.light_&]:text-slate-900">No Properties Available</h3>
                  <p className="text-slate-400 text-sm mt-1">New listings will appear here shortly.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {flats.map((flat) => (
                    <Card
                      key={flat.id}
                      className="glass-card bg-[#0e2238]/90 [html.light_&]:bg-white border-sky-500/20 [html.light_&]:border-slate-200/80 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col group"
                    >
                      {/* Multi-Picture Sequential Carousel Header with Badges */}
                      <PropertyImageCarousel
                        images={flat.images}
                        title={flat.title}
                        heightClass="h-56"
                        autoPlayMs={3500}
                      >
                        {/* Top Badges */}
                        <div className="absolute top-3 left-3 flex items-center gap-2">
                          <span className="bg-emerald-500 text-slate-950 font-black text-xs px-3 py-1 rounded-full shadow-md">
                            {flat.annualYieldPercent || 20}% Annual Yield
                          </span>
                          <span className="bg-blue-600/90 text-white font-bold text-xs px-3 py-1 rounded-full backdrop-blur-md">
                            {flat.unitType || '2-Bedroom Flat'}
                          </span>
                        </div>

                        {/* Location Pill */}
                        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 text-xs font-semibold text-white bg-slate-900/80 backdrop-blur-md px-3 py-1 rounded-lg border border-white/20">
                          <MapPin className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                          <span className="truncate max-w-[200px]">{flat.location || 'United States'}</span>
                        </div>
                      </PropertyImageCarousel>

                      {/* Card Content */}
                      <CardContent className="p-5 flex-1 flex flex-col justify-between">
                        <div>
                          <h3 className="text-lg font-black font-display text-white [html.light_&]:text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1 mb-1.5">
                            {flat.title}
                          </h3>
                          <p className="text-slate-300 [html.light_&]:text-slate-600 text-xs line-clamp-2 mb-4 leading-relaxed">
                            {flat.description}
                          </p>

                          {/* Financial Box */}
                          <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-[#091a2e]/60 [html.light_&]:bg-slate-50 border border-sky-500/15 [html.light_&]:border-slate-200/70 mb-4">
                            <div>
                              <span className="text-[11px] font-bold text-slate-400 [html.light_&]:text-slate-500 block uppercase">Total Setup Cost</span>
                              <span className="text-lg font-black font-display text-white [html.light_&]:text-slate-900">{formatUSD(flat.totalPriceUsd)}</span>
                            </div>
                            <div>
                              <span className="text-[11px] font-bold text-slate-400 [html.light_&]:text-slate-500 block uppercase">Est. Monthly Rent</span>
                              <span className="text-lg font-black font-display text-emerald-400 [html.light_&]:text-emerald-600">{formatUSD(flat.monthlyRentUsd)} / mo</span>
                            </div>
                          </div>

                          {/* Inventory Preview Teaser */}
                          <div
                            onClick={() => openInspectModal(flat)}
                            className="p-2.5 rounded-xl bg-sky-500/10 [html.light_&]:bg-sky-50 border border-sky-400/20 [html.light_&]:border-sky-200 text-xs text-sky-200 [html.light_&]:text-sky-800 flex items-center justify-between mb-4 cursor-pointer hover:bg-sky-500/20 [html.light_&]:hover:bg-sky-100 transition-colors"
                          >
                            <div className="flex items-center gap-2">
                              <Tv className="h-4 w-4 text-sky-500 shrink-0" />
                              <span>Includes complete <strong>{flat.inventory?.length || 9}-item</strong> furnishings</span>
                            </div>
                            <span className="font-bold text-blue-500 dark:text-sky-400">Inspect &rarr;</span>
                          </div>

                          {/* Features List */}
                          {flat.features && flat.features.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mb-5">
                              {flat.features.slice(0, 3).map((feat, idx) => (
                                <span
                                  key={idx}
                                  className="text-[11px] px-2.5 py-1 rounded-lg bg-sky-500/10 [html.light_&]:bg-slate-100 text-slate-300 [html.light_&]:text-slate-700 border border-sky-500/20 [html.light_&]:border-slate-200"
                                >
                                  {feat}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-2 pt-2">
                          <div className="grid grid-cols-2 gap-2">
                            <Button
                              variant="outline"
                              onClick={() => openInspectModal(flat)}
                              className="w-full py-2.5 rounded-xl font-bold text-xs border-sky-400/30 text-sky-200 [html.light_&]:text-slate-700 [html.light_&]:border-slate-300 hover:bg-sky-500/10 [html.light_&]:hover:bg-slate-100"
                            >
                              Inspect Items
                            </Button>
                            <Button
                              onClick={() => openPropertyDetail(flat)}
                              className="w-full py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 text-white shadow-md shadow-sky-500/25"
                            >
                              Acquire Unit &rarr;
                            </Button>
                          </div>
                          {isAdmin && (
                            <div className="grid grid-cols-2 gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                  setEditingPhotosFlat(flat);
                                  setEditingPhotosList(
                                    Array.isArray(flat.images) && flat.images.length > 0
                                      ? [...flat.images]
                                      : [DEFAULT_PROPERTY_IMAGE]
                                  );
                                  setEditingPhotoUrlInput('');
                                }}
                                className="w-full py-2 rounded-xl font-bold text-xs bg-sky-500/10 border-sky-400/35 text-sky-300 [html.light_&]:text-sky-700 [html.light_&]:bg-sky-50 hover:bg-sky-500/20 flex items-center justify-center gap-1.5"
                              >
                                <ImageIcon className="h-3.5 w-3.5 shrink-0" />
                                <span>Photos ({flat.images?.length || 1})</span>
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => openEditPropertyModal(flat)}
                                className="w-full py-2 rounded-xl font-bold text-xs bg-emerald-500/10 border-emerald-400/35 text-emerald-300 [html.light_&]:text-emerald-700 [html.light_&]:bg-emerald-50 hover:bg-emerald-500/20 flex items-center justify-center gap-1.5"
                              >
                                <Sliders className="h-3.5 w-3.5 shrink-0" />
                                <span>Edit Pricing &amp; Values</span>
                              </Button>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

        {/* TAB 2: MY PROPERTIES & DEDICATED WALLET */}
        {activeTab === 'wallet' && (
          <div className="space-y-8">
            {/* Automatic End-of-Month Return Notification Alert for Investor */}
            {(myPayouts.length > 0 || myInvestments.length > 0) && (
              <div className="p-5 rounded-3xl bg-gradient-to-r from-emerald-950/60 via-[#08242b]/80 to-teal-950/50 [html.light_&]:from-emerald-50 [html.light_&]:via-teal-50/70 [html.light_&]:to-emerald-50 border border-emerald-500/35 [html.light_&]:border-emerald-300 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start sm:items-center gap-3.5">
                  <div className="h-12 w-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 [html.light_&]:text-emerald-700 shrink-0">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500 text-slate-950">
                        Automated Monthly Return Notice
                      </span>
                      {myPayouts[0] && (
                        <span className="text-xs font-bold text-emerald-300 [html.light_&]:text-emerald-800">
                          Latest: {new Date(myPayouts[0].paidAt).toLocaleDateString()} ({myPayouts[0].monthYear})
                        </span>
                      )}
                    </div>
                    {myPayouts[0] ? (
                      <p className="text-xs sm:text-sm font-semibold text-white [html.light_&]:text-slate-900 mt-1">
                        Admin has sent you a return of <strong className="text-emerald-400 [html.light_&]:text-emerald-700">{formatUSD(myPayouts[0].amountUsd)} USD</strong> on the property <strong>&ldquo;{myPayouts[0].flatTitle}&rdquo;</strong> you invested in ({myPayouts[0].monthYear}).
                      </p>
                    ) : (
                      <p className="text-xs sm:text-sm font-semibold text-white [html.light_&]:text-slate-900 mt-1">
                        Your monthly property investment return notifications are automatically delivered at the end of each month once Admin disburses your rental yield.
                      </p>
                    )}
                    <p className="text-[11px] text-slate-300 [html.light_&]:text-slate-600 mt-0.5">
                      Automatic end-of-month notification schedule active • Returns are credited directly to your registered investor account.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Dedicated Property Wallet Hero Card */}
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-sky-500/25 [html.light_&]:bg-white [html.light_&]:border-slate-200/80 shadow-md">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                <div className="space-y-3">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 [html.light_&]:bg-blue-50 text-blue-400 [html.light_&]:text-blue-700 border border-blue-400/20 text-xs font-bold">
                    <ShieldCheck className="h-4 w-4 text-blue-500" />
                    <span>Isolated Property USD Ledger • Independent Balance</span>
                  </div>
                  <div>
                    <span className="text-xs uppercase font-bold text-slate-400 [html.light_&]:text-slate-500 block tracking-wider">Available Rental Balance</span>
                    <div className="text-4xl sm:text-5xl font-black font-display text-white [html.light_&]:text-slate-900 tracking-tight mt-1 flex items-baseline gap-2">
                      <span>{formatUSD(propertyBalance)}</span>
                      <span className="text-emerald-400 [html.light_&]:text-emerald-600 text-2xl font-bold">USD</span>
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-300 [html.light_&]:text-slate-600 max-w-xl">
                    All monthly rental dividends from your property operations are credited here in USD. These funds remain strictly separated from general platform accounts.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 items-stretch lg:items-center">
                  <div className="p-4 rounded-2xl bg-[#091a2e]/60 [html.light_&]:bg-slate-50 border border-sky-500/15 [html.light_&]:border-slate-200/70 text-center sm:text-left">
                    <span className="text-[11px] text-slate-400 [html.light_&]:text-slate-500 font-bold block uppercase">Total Rental Earned</span>
                    <span className="text-2xl font-black font-display text-emerald-400 [html.light_&]:text-emerald-600">{formatUSD(propertyTotalEarned)} USD</span>
                    <span className="text-[11px] text-slate-400 [html.light_&]:text-slate-500 block mt-0.5">Lifetime distributed rent</span>
                  </div>
                  <Button
                    onClick={() => {
                      if (propertyBalance <= 0) {
                        toast.info("Your rental balance is currently $0. Payouts are credited monthly as rental revenue is distributed.");
                      } else {
                        setIsWithdrawModalOpen(true);
                      }
                    }}
                    className="py-4 px-6 rounded-xl font-bold bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 text-white shadow-lg shadow-sky-500/25 transition-all hover:scale-[1.02]"
                  >
                    <ArrowUpRight className="h-5 w-5 mr-1" />
                    Withdraw Rental Profit
                  </Button>
                </div>
              </div>
            </div>

            {/* My Active Properties Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Home className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  My Acquired Properties ({myInvestments.length})
                </h3>
              </div>

              {isLoadingWallet ? (
                <div className="py-12 text-center text-slate-500 dark:text-slate-400">Loading your portfolio...</div>
              ) : myInvestments.length === 0 ? (
                <div className="text-center py-16 bg-white dark:bg-[#091a2e]/60 border border-slate-200 dark:border-sky-500/20 rounded-2xl p-8 max-w-md mx-auto shadow-md">
                  <Building2 className="h-10 w-10 text-emerald-600 dark:text-emerald-400 mx-auto mb-3 opacity-80" />
                  <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No Properties Acquired Yet</h4>
                  <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm mb-6 leading-relaxed">
                    You have not acquired any properties yet. Choose an available unit to launch your passive income stream.
                  </p>
                  <Button
                    onClick={() => setActiveTab('marketplace')}
                    className="bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold px-6 py-2.5 rounded-xl hover:shadow-lg hover:shadow-emerald-500/25"
                  >
                    Explore Properties
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {myInvestments.map((inv) => {
                    const isPending = inv.status === 'pending_approval';
                    const isLive = inv.setupPhase === 'live_on_airbnb';

                    return (
                      <Card key={inv.id} className="bg-white dark:bg-[#091a2e]/90 border border-slate-200 dark:border-sky-500/20 rounded-2xl p-6 shadow-md">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-6">
                          <div className="flex items-center gap-4">
                            <div className="h-20 w-20 rounded-2xl bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0 border border-slate-200 dark:border-white/10">
                              <img
                                src={inv.flat?.images?.[0] || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=400&q=80'}
                                alt="Property"
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <h4 className="text-xl font-bold text-slate-900 dark:text-white">{inv.flat?.title || `Property #${inv.flatId}`}</h4>
                                {isPending ? (
                                  <Badge className="bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/40">
                                    ⏳ PENDING ADMIN APPROVAL
                                  </Badge>
                                ) : isLive ? (
                                  <Badge className="bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40">
                                    LIVE & EARNING RENT
                                  </Badge>
                                ) : (
                                  <Badge className="bg-sky-500/20 text-sky-700 dark:text-sky-300 border border-sky-500/40">
                                    IN ON-GROUND SETUP
                                  </Badge>
                                )}
                              </div>
                              <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2 flex-wrap">
                                <MapPin className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                                <span>{inv.flat?.location || "United States"}</span>
                                <span>•</span>
                                <span>Acquisition: {new Date(inv.createdAt).toLocaleDateString()}</span>
                                <span>•</span>
                                <span className="font-semibold text-slate-700 dark:text-slate-300">{inv.ownershipSharePercent || 100}% Ownership</span>
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-6 text-center lg:text-right border-t lg:border-t-0 pt-4 lg:pt-0 border-slate-200 dark:border-slate-800">
                            <div>
                              <span className="text-[11px] text-slate-500 dark:text-slate-400 uppercase font-semibold block">Total Cost</span>
                              <span className="text-lg font-extrabold text-slate-900 dark:text-white">{formatUSD(inv.amountUsd)}</span>
                            </div>
                            <div>
                              <span className="text-[11px] text-slate-500 dark:text-slate-400 uppercase font-semibold block">Monthly Rental</span>
                              <span className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400">{formatUSD(inv.monthlyRentUsd)}/mo</span>
                            </div>
                            <div>
                              <span className="text-[11px] text-slate-500 dark:text-slate-400 uppercase font-semibold block">Total Earned</span>
                              <span className="text-lg font-extrabold text-slate-900 dark:text-white">{formatUSD(inv.totalPaidUsd || 0)}</span>
                            </div>
                          </div>
                        </div>

                        {/* 3-Step Lifecycle Visual Progress Bar */}
                        <div className="bg-slate-50 dark:bg-slate-950/60 p-4 rounded-xl border border-slate-200 dark:border-sky-500/15">
                          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-3 uppercase tracking-wider">Unit Setup & Operational Status</span>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div className={`flex items-center gap-2 p-2.5 rounded-lg text-xs font-bold border ${!isPending
                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400'
                                : 'bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300'
                              }`}>
                              {!isPending ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <Clock className="h-4 w-4 shrink-0 animate-spin" />}
                              <span>1. {isPending ? "Pending Admin Approval" : "Acquisition Approved"}</span>
                            </div>
                            <div className={`flex items-center gap-2 p-2.5 rounded-lg text-xs font-bold border ${isLive
                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400'
                                : !isPending
                                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300'
                                  : 'bg-slate-200 dark:bg-slate-900 border-transparent text-slate-400'
                              }`}>
                              {isLive ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <Clock className="h-4 w-4 shrink-0" />}
                              <span>2. Furnishing & Staging</span>
                            </div>
                            <div className={`flex items-center gap-2 p-2.5 rounded-lg text-xs font-bold border ${isLive
                                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-700 dark:text-emerald-300 shadow-sm'
                                : 'bg-slate-200 dark:bg-slate-900 border-transparent text-slate-400'
                              }`}>
                              {isLive ? <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" /> : <Clock className="h-4 w-4 shrink-0" />}
                              <span>3. Live & Earning Rent</span>
                            </div>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Monthly Rental Payouts Ledger */}
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Receipt className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                Monthly Rental Statements & Payouts ({myPayouts.length})
              </h3>

              {myPayouts.length === 0 ? (
                <div className="text-center py-10 bg-slate-50 dark:bg-[#091a2e]/40 border border-slate-200 dark:border-sky-500/20 rounded-2xl p-6 text-slate-500 dark:text-slate-400 text-xs sm:text-sm">
                  No monthly rental payouts recorded yet. Payouts are deposited on a regular 30-day cycle once units are live on vacation rental channels.
                </div>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-sky-500/20 bg-white dark:bg-[#091a2e]/80 shadow-md">
                  <table className="w-full text-left text-sm text-slate-700 dark:text-slate-300">
                    <thead className="bg-slate-100 dark:bg-slate-950/80 text-xs uppercase font-bold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-sky-500/20">
                      <tr>
                        <th className="px-6 py-4">Date</th>
                        <th className="px-6 py-4">Property</th>
                        <th className="px-6 py-4">Billing Month</th>
                        <th className="px-6 py-4">Amount (USD)</th>
                        <th className="px-6 py-4">Notes</th>
                        <th className="px-6 py-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                      {myPayouts.map((payout) => (
                        <tr key={payout.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                          <td className="px-6 py-4 text-xs">{new Date(payout.paidAt).toLocaleDateString()}</td>
                          <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">{payout.flatTitle}</td>
                          <td className="px-6 py-4 text-xs font-semibold text-emerald-600 dark:text-emerald-400">{payout.monthYear}</td>
                          <td className="px-6 py-4 font-extrabold text-slate-900 dark:text-white">{formatUSD(payout.amountUsd)}</td>
                          <td className="px-6 py-4 text-xs text-slate-500 dark:text-slate-400">{payout.note || "Monthly rental revenue"}</td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                              <Check className="h-3 w-3" /> Credited
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: ADMIN MANAGEMENT (PROPERTIES & APPROVALS) */}
        {activeTab === 'admin' && isAdmin && (
          <div className="space-y-8">
            {/* Admin Header with Quick Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-500/30">
              <div>
                <h2 className="text-xl font-black text-purple-900 dark:text-purple-300 flex items-center gap-2">
                  <Sliders className="h-5 w-5" /> Property Investment Management Portal
                </h2>
                <p className="text-xs sm:text-sm text-purple-700 dark:text-purple-400 mt-1">
                  Approve user property acquisitions, advance on-ground setup phases, add new listings, and disburse monthly rental payouts.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Button
                  type="button"
                  onClick={() => runMonthlyReturnsMutation.mutate(undefined)}
                  disabled={runMonthlyReturnsMutation.isPending}
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold px-4 py-2.5 rounded-xl shadow-md flex items-center gap-2 text-xs sm:text-sm"
                >
                  <Send className="h-4 w-4" />
                  <span>{runMonthlyReturnsMutation.isPending ? 'Sending Monthly Returns...' : '⚡ Run End-of-Month Returns & Notify All'}</span>
                </Button>
                <Button
                  onClick={() => {
                    setNewPropInventory(getRecommendedInventory(Number(newPropPrice) || 3000));
                    setIsAdminAddModalOpen(true);
                  }}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-5 py-2.5 rounded-xl shadow-md flex items-center gap-2 text-xs sm:text-sm"
                >
                  <Plus className="h-4 w-4" />
                  + Add New Property Listing
                </Button>
              </div>
            </div>

            {/* Pending Approvals Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <UserCheck className="h-5 w-5 text-amber-500" />
                  Pending Investment Approvals ({allAdminInvestments.filter(i => i.status === 'pending_approval').length})
                </h3>
              </div>

              {allAdminInvestments.filter(i => i.status === 'pending_approval').length === 0 ? (
                <div className="p-8 text-center bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-500 text-sm">
                  No pending investment requests. When users submit an investment request, it appears here for admin verification.
                </div>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-sky-500/20 bg-white dark:bg-[#091a2e]/90 shadow-md">
                  <table className="w-full text-left text-sm text-slate-700 dark:text-slate-300">
                    <thead className="bg-slate-100 dark:bg-slate-950/80 text-xs uppercase font-bold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-sky-500/20">
                      <tr>
                        <th className="px-6 py-4">Investor</th>
                        <th className="px-6 py-4">Property</th>
                        <th className="px-6 py-4">Investment</th>
                        <th className="px-6 py-4">Share</th>
                        <th className="px-6 py-4">Payment Method & Proof</th>
                        <th className="px-6 py-4">Date</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                      {allAdminInvestments.filter(i => i.status === 'pending_approval').map((inv) => (
                        <tr key={inv.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                          <td className="px-6 py-4">
                            <div className="font-bold text-slate-900 dark:text-white">{inv.userName || `User #${inv.userId}`}</div>
                            <div className="text-xs text-slate-500">{inv.userEmail || `ID: ${inv.userId}`}</div>
                          </td>
                          <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">
                            {inv.flat?.title || `Property #${inv.flatId}`}
                          </td>
                          <td className="px-6 py-4 font-extrabold text-emerald-600 dark:text-emerald-400">
                            {formatUSD(inv.amountUsd)}
                          </td>
                          <td className="px-6 py-4">
                            <Badge className="bg-sky-500/10 text-sky-700 dark:text-sky-300 border border-sky-500/20">
                              {inv.ownershipSharePercent || 100}% Share
                            </Badge>
                          </td>
                          <td className="px-6 py-4 text-xs">
                            <div className="font-semibold text-slate-800 dark:text-slate-200">{inv.paymentMethod}</div>
                            {inv.paymentProof && (
                              <div className="font-mono text-[11px] text-slate-500 truncate max-w-[180px]" title={inv.paymentProof}>
                                Ref: {inv.paymentProof}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 text-xs text-slate-500">
                            {new Date(inv.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                size="sm"
                                onClick={() => approveInvestmentMutation.mutate(inv.id)}
                                disabled={approveInvestmentMutation.isPending}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                              >
                                <Check className="h-3.5 w-3.5 mr-1" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  const reason = prompt("Enter rejection reason (optional):");
                                  rejectInvestmentMutation.mutate({ id: inv.id, reason: reason || undefined });
                                }}
                                disabled={rejectInvestmentMutation.isPending}
                                className="border-rose-300 text-rose-600 hover:bg-rose-50 dark:border-rose-900 dark:text-rose-400 text-xs"
                              >
                                Reject
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Active Investments & Lifecycle Control */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-emerald-500" />
                  Active Investments & Rental Payout Controls ({allAdminInvestments.filter(i => i.status === 'active').length})
                </h3>
              </div>

              {allAdminInvestments.filter(i => i.status === 'active').length === 0 ? (
                <div className="p-8 text-center bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-500 text-sm">
                  No active investments yet. Once user investments are approved, they will appear here for setup tracking and rental payout disbursement.
                </div>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-sky-500/20 bg-white dark:bg-[#091a2e]/90 shadow-md">
                  <table className="w-full text-left text-sm text-slate-700 dark:text-slate-300">
                    <thead className="bg-slate-100 dark:bg-slate-950/80 text-xs uppercase font-bold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-sky-500/20">
                      <tr>
                        <th className="px-6 py-4">Investor</th>
                        <th className="px-6 py-4">Property</th>
                        <th className="px-6 py-4">Amount / Monthly Rent</th>
                        <th className="px-6 py-4">Current Phase</th>
                        <th className="px-6 py-4">Total Paid Out</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                      {allAdminInvestments.filter(i => i.status === 'active').map((inv) => {
                        const isLive = inv.setupPhase === 'live_on_airbnb';

                        return (
                          <tr key={inv.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                            <td className="px-6 py-4">
                              <div className="font-bold text-slate-900 dark:text-white">{inv.userName || `User #${inv.userId}`}</div>
                              <div className="text-xs text-slate-500">{inv.userEmail || `ID: ${inv.userId}`}</div>
                            </td>
                            <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">
                              {inv.flat?.title || `Property #${inv.flatId}`}
                            </td>
                            <td className="px-6 py-4">
                              <div className="font-bold text-slate-900 dark:text-white">{formatUSD(inv.amountUsd)}</div>
                              <div className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">{formatUSD(inv.monthlyRentUsd)}/mo</div>
                            </td>
                            <td className="px-6 py-4">
                              <select
                                value={inv.setupPhase}
                                onChange={(e) => phaseMutation.mutate({ id: inv.id, phase: e.target.value })}
                                className="px-3 py-1.5 rounded-lg text-xs font-bold border border-slate-300 dark:border-sky-500/30 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                              >
                                <option value="furnishing">1. On-Ground Furnishing</option>
                                <option value="live_on_airbnb">2. Live on Airbnb & Earning</option>
                                <option value="completed">3. Completed / Exited</option>
                              </select>
                            </td>
                            <td className="px-6 py-4 font-extrabold text-emerald-600 dark:text-emerald-400">
                              {formatUSD(inv.totalPaidUsd || 0)}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <Button
                                size="sm"
                                onClick={() => {
                                  setSelectedInvestmentForPayout(inv);
                                  setPayoutAmount(String(inv.monthlyRentUsd || (inv.flat?.monthlyRentUsd ?? 0)));
                                  const investorObj = allPropertyInvestors.find((u: any) => u.id === inv.userId);
                                  setPayoutBankAccount(investorObj?.bankOrWalletAccount || '');
                                  setPayoutDestination('Bank Account & Property Wallet');
                                  setIsAdminPayoutModalOpen(true);
                                }}
                                className="bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold text-xs shadow-md"
                              >
                                <DollarSign className="h-3.5 w-3.5 mr-1" />
                                Add Property ROI to Wallet
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Eligible Investors Directory & Direct Bank/Account Deposit Control */}
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Landmark className="h-5 w-5 text-sky-400" />
                    Property Investors & Eligible Users — Bank & Account Controls ({allPropertyInvestors.length})
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    View everyone eligible to invest or currently holding properties. Send monthly returns or add money directly to any investor&apos;s bank account or wallet with instant user notification.
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-sky-500/20 bg-white dark:bg-[#091a2e]/90 shadow-md">
                <table className="w-full text-left text-sm text-slate-700 dark:text-slate-300">
                  <thead className="bg-slate-100 dark:bg-slate-950/80 text-xs uppercase font-bold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-sky-500/20">
                    <tr>
                      <th className="px-5 py-4">User / Eligibility</th>
                      <th className="px-5 py-4">Bank / Wallet Account</th>
                      <th className="px-5 py-4">Property Holdings</th>
                      <th className="px-5 py-4">Monthly Return</th>
                      <th className="px-5 py-4">Account Balance / Earned</th>
                      <th className="px-5 py-4 text-right">Admin Bank / Account Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {isLoadingInvestors ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-xs text-slate-400">
                          Loading investors directory...
                        </td>
                      </tr>
                    ) : (
                      allPropertyInvestors.map((invUser: any) => (
                        <tr key={invUser.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900 dark:text-white">{invUser.fullName || invUser.username}</span>
                              {invUser.investmentsCount > 0 ? (
                                <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30 text-[10px]">
                                  Active Investor ({invUser.investmentsCount})
                                </Badge>
                              ) : (
                                <Badge className="bg-sky-500/10 text-sky-600 dark:text-sky-300 border border-sky-500/25 text-[10px]">
                                  Eligible to Invest
                                </Badge>
                              )}
                            </div>
                            <div className="text-xs text-slate-500">{invUser.email}</div>
                          </td>
                          <td className="px-5 py-4 text-xs font-mono">
                            {invUser.bankOrWalletAccount ? (
                              <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200">
                                {invUser.bankOrWalletAccount}
                              </span>
                            ) : (
                              <span className="text-slate-400 italic">Not set (Admin can enter on transfer)</span>
                            )}
                          </td>
                          <td className="px-5 py-4">
                            <div className="font-extrabold text-slate-900 dark:text-white">{formatUSD(invUser.totalInvestedUsd)}</div>
                            <div className="text-[11px] text-slate-500">
                              {invUser.investments?.length > 0
                                ? invUser.investments.map((i: any) => i.flat?.title || `Unit #${i.flatId}`).join(', ')
                                : 'No units acquired yet'}
                            </div>
                          </td>
                          <td className="px-5 py-4 font-extrabold text-emerald-600 dark:text-emerald-400">
                            {formatUSD(invUser.expectedMonthlyUsd)} / mo
                          </td>
                          <td className="px-5 py-4">
                            <div className="font-extrabold text-sky-600 dark:text-sky-400">{formatUSD(invUser.propertyBalanceUsd)} Balance</div>
                            <div className="text-[11px] text-slate-500">Total Sent: {formatUSD(invUser.propertyTotalEarnedUsd)}</div>
                          </td>
                          <td className="px-5 py-4 text-right">
                            <Button
                              size="sm"
                              onClick={() => {
                                setSelectedInvestorForCredit(invUser);
                                setCreditAmount(String(invUser.expectedMonthlyUsd > 0 ? invUser.expectedMonthlyUsd : 350));
                                setCreditPropertyTitle(invUser.investments?.[0]?.flat?.title || 'Property Investment Portfolio');
                                setCreditBankAccount(invUser.bankOrWalletAccount || '');
                                setCreditDestination('Investor Bank Account & Property Wallet');
                                const now = new Date();
                                const mNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
                                setCreditMonthYear(`${mNames[now.getMonth()]} ${now.getFullYear()}`);
                                setCreditNote('Monthly return on property investment');
                              }}
                              className="bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 text-white font-bold text-xs rounded-xl shadow-sm"
                            >
                              <DollarSign className="h-3.5 w-3.5 mr-1" />
                              Add ROI to User Wallet / Bank
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Properties Catalog & Management */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-sky-500" />
                  All Listed Properties ({flats.length})
                </h3>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-sky-500/20 bg-white dark:bg-[#091a2e]/90 shadow-md">
                <table className="w-full text-left text-sm text-slate-700 dark:text-slate-300">
                  <thead className="bg-slate-100 dark:bg-slate-950/80 text-xs uppercase font-bold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-sky-500/20">
                    <tr>
                      <th className="px-6 py-4">Title</th>
                      <th className="px-6 py-4">Location</th>
                      <th className="px-6 py-4">Setup Cost</th>
                      <th className="px-6 py-4">Est. Monthly Rent</th>
                      <th className="px-6 py-4">Yield</th>
                      <th className="px-6 py-4">Inventory Items</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {flats.map((flat) => (
                      <tr key={flat.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">{flat.title}</td>
                        <td className="px-6 py-4 text-xs text-slate-500 dark:text-slate-400">{flat.location}</td>
                        <td className="px-6 py-4 font-extrabold text-slate-900 dark:text-white">{formatUSD(flat.totalPriceUsd)}</td>
                        <td className="px-6 py-4 font-extrabold text-emerald-600 dark:text-emerald-400">{formatUSD(flat.monthlyRentUsd)}/mo</td>
                        <td className="px-6 py-4 font-bold text-teal-600 dark:text-teal-400">{flat.annualYieldPercent || 19}%</td>
                        <td className="px-6 py-4 text-xs font-semibold text-slate-600 dark:text-slate-300">{flat.inventory?.length || 0} items</td>
                        <td className="px-6 py-4 text-right">
                          <div className="inline-flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => openEditPropertyModal(flat)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800 transition-colors shadow-sm cursor-pointer"
                            >
                              <Sliders className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                              <span>Edit Pricing &amp; Values</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingPhotosFlat(flat);
                                setEditingPhotosList(
                                  Array.isArray(flat.images) && flat.images.length > 0
                                    ? [...flat.images]
                                    : [DEFAULT_PROPERTY_IMAGE]
                                );
                                setEditingPhotoUrlInput('');
                              }}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-300 dark:bg-sky-950/50 dark:text-sky-300 dark:border-sky-800 transition-colors shadow-sm cursor-pointer"
                            >
                              <ImageIcon className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400 shrink-0" />
                              <span>Photos ({flat.images?.length || 1})</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (confirm(`Are you sure you want to delete property "${flat.title}"?`)) {
                                  deletePropertyMutation.mutate(flat.id);
                                }
                              }}
                              disabled={deletePropertyMutation.isPending}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800 transition-colors shadow-sm cursor-pointer"
                            >
                              <Trash2 className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400 shrink-0" />
                              <span className="text-rose-700 dark:text-rose-300 font-bold">Delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ─── MODAL 1: DETAILED ACQUISITION & CO-INVESTMENT MODAL ─────────── */}
        <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
  <DialogContent className="bg-white dark:bg-[#081729] border border-slate-200 dark:border-sky-500/30 text-slate-900 dark:text-white max-w-3xl rounded-3xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto shadow-2xl">
    {selectedFlat && (
      <div>
        <DialogHeader className="mb-4">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 mb-1">
            <Building2 className="h-4 w-4" />
            <span>{selectedFlat.unitType} • {selectedFlat.location}</span>
          </div>
          <DialogTitle className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            {selectedFlat.title}
          </DialogTitle>
          <DialogDescription className="text-slate-600 dark:text-slate-400 text-sm mt-1">
            {selectedFlat.description}
          </DialogDescription>
        </DialogHeader>

        {/* Property Multi-Picture Gallery */}
        <div className="mb-5 rounded-2xl overflow-hidden">
          <PropertyImageCarousel
            images={selectedFlat.images}
            title={selectedFlat.title}
            heightClass="h-60 sm:h-72 rounded-2xl"
            autoPlayMs={3500}
            showThumbnails={true}
          />
        </div>

        {/* Key Financial Summary */}
        <div className="grid grid-cols-3 gap-3 my-5 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-sky-500/20 text-center">
          <div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 uppercase font-semibold block">Total Package</span>
            <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">{formatUSD(selectedFlat.totalPriceUsd)}</span>
          </div>
          <div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 uppercase font-semibold block">Monthly Passive Rent</span>
            <span className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400">{formatUSD(selectedFlat.monthlyRentUsd)}/mo</span>
          </div>
          <div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 uppercase font-semibold block">Annual ROI Yield</span>
            <span className="text-xl sm:text-2xl font-black text-teal-600 dark:text-teal-300">{selectedFlat.annualYieldPercent || 19}%</span>
          </div>
        </div>

        {/* Investment Choice: Full vs Fractional Share */}
        <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 mb-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-extrabold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider flex items-center gap-2">
                <CreditCard className="h-4 w-4" /> Choose Your Investment Share
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                Acquire 100% of this property package or select a co-investment share.
              </p>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-800 dark:text-emerald-300">
              {investmentSharePercent}% Ownership Share
            </span>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {[25, 50, 75, 100].map((percent) => (
              <button
                key={percent}
                type="button"
                onClick={() => setInvestmentSharePercent(percent)}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${investmentSharePercent === percent
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-md'
                    : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-emerald-500'
                  }`}
              >
                {percent}% {percent === 100 ? '(Full Unit)' : 'Share'}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-emerald-500/20 text-xs">
            <div>
              <span className="text-slate-500 dark:text-slate-400 block font-semibold">Your Investment Capital:</span>
              <span className="text-lg font-black text-slate-900 dark:text-white">{formatUSD(userInvestAmount)} USD</span>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400 block font-semibold">Your Est. Monthly Rent:</span>
              <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">{formatUSD(userExpectedMonthlyRent)} USD / mo</span>
            </div>
          </div>

          {/* Payment Method */}
          <div className="pt-3 border-t border-emerald-500/20 space-y-3">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block uppercase">
              Select Payment Source
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('Platform Wallet')}
                className={`p-3 rounded-xl text-left border transition-all ${paymentMethod === 'Platform Wallet'
                    ? 'bg-white dark:bg-slate-800 border-emerald-500 ring-2 ring-emerald-500/20'
                    : 'bg-white/60 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800'
                  }`}
              >
                <div className="font-bold text-xs text-slate-900 dark:text-white">Platform Balance</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Deduct from internal wallet</div>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('USDT (TRC-20)')}
                className={`p-3 rounded-xl text-left border transition-all ${paymentMethod === 'USDT (TRC-20)'
                    ? 'bg-white dark:bg-slate-800 border-emerald-500 ring-2 ring-emerald-500/20'
                    : 'bg-white/60 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800'
                  }`}
              >
                <div className="font-bold text-xs text-slate-900 dark:text-white">USDT (TRC-20) / Crypto</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Direct blockchain deposit</div>
              </button>
            </div>

            {paymentMethod === 'USDT (TRC-20)' && (
              <div className="p-3 rounded-xl bg-slate-900 text-slate-200 text-xs space-y-2 font-mono">
                <div className="text-slate-400 text-[11px]">Official Admin USDT (TRC-20) Deposit Address:</div>
                <div className="font-bold text-emerald-400 select-all break-all">TJ8Ym1P9Xb7L6Qv4Nm2K3Rt5Wz8Hq9Fs2A</div>
                <input
                  type="text"
                  placeholder="Paste Transaction Hash / TxID or payment note..."
                  value={paymentProof}
                  onChange={(e) => setPaymentProof(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs font-sans mt-2"
                />
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="outline"
            onClick={() => setIsDetailModalOpen(false)}
            className="w-full sm:w-auto border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300"
          >
            Close
          </Button>
          <Button
            onClick={handleConfirmInvest}
            disabled={investMutation.isPending}
            className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-extrabold text-sm hover:shadow-lg hover:shadow-emerald-500/30 px-6"
          >
            {investMutation.isPending ? 'Submitting Request...' : `Submit Investment for ${formatUSD(userInvestAmount)}`}
          </Button>
        </DialogFooter>
      </div>
    )}
  </DialogContent>
</Dialog>

{/* ─── MODAL 2: INSPECT FURNISHING & BILLS INVENTORY MODAL ─────────── */ }
<Dialog open={isInspectModalOpen} onOpenChange={setIsInspectModalOpen}>
  <DialogContent className="bg-white dark:bg-[#081729] border border-slate-200 dark:border-sky-500/30 text-slate-900 dark:text-white max-w-2xl rounded-3xl p-6 sm:p-8 max-h-[85vh] overflow-y-auto shadow-2xl">
    {selectedFlat && (
      <div>
        <DialogHeader className="mb-4">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 mb-1">
            <PackageCheck className="h-4 w-4" />
            <span>Physical Asset Transparency & Specification</span>
          </div>
          <DialogTitle className="text-2xl font-black text-slate-900 dark:text-white">
            {selectedFlat.title}
          </DialogTitle>
          <DialogDescription className="text-slate-600 dark:text-slate-400 text-xs">
            Complete itemized physical furnishing catalog and utility inclusion package.
          </DialogDescription>
        </DialogHeader>

        {/* Property Multi-Picture Gallery */}
        <div className="mb-5 rounded-2xl overflow-hidden">
          <PropertyImageCarousel
            images={selectedFlat.images}
            title={selectedFlat.title}
            heightClass="h-52 sm:h-64 rounded-2xl"
            autoPlayMs={3500}
            showThumbnails={true}
          />
        </div>

        {/* Bills Package Box */}
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 mb-5">
          <div className="flex items-center justify-between gap-2 mb-2">
            <h4 className="text-xs font-extrabold uppercase text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
              <Zap className="h-4 w-4 text-emerald-500" /> Utility &amp; Bills Coverage Policy
            </h4>
            {isAdmin && (
              <button
                type="button"
                onClick={() => openEditPropertyModal(selectedFlat)}
                className="text-[11px] font-extrabold text-emerald-600 dark:text-emerald-300 hover:underline flex items-center gap-1"
              >
                <Sliders className="h-3 w-3" /> Edit Policy &amp; Bills
              </button>
            )}
          </div>
          <p className="text-xs text-slate-700 dark:text-slate-300 mb-3 leading-relaxed">
            {selectedFlat.utilityPolicyText || DEFAULT_UTILITY_POLICY}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
            {(Array.isArray(selectedFlat.utilityBills) && selectedFlat.utilityBills.length > 0
              ? selectedFlat.utilityBills
              : DEFAULT_UTILITY_BILLS
            ).map((bill, bIdx) => (
              <div
                key={bIdx}
                className="p-2 rounded-lg bg-white/70 dark:bg-slate-900/70 border border-slate-200 dark:border-white/10 flex items-center gap-2"
              >
                {getUtilityIcon(bill)}
                <span className="truncate">{bill}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Itemized Inventory List */}
        <h4 className="text-xs font-extrabold uppercase text-slate-500 dark:text-slate-400 mb-3 flex items-center justify-between">
          <span>Physical Furnishings Breakdown</span>
          <div className="flex items-center gap-3">
            {isAdmin && (
              <button
                type="button"
                onClick={() => openEditPropertyModal(selectedFlat)}
                className="text-[11px] font-extrabold text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1 normal-case"
              >
                <Sliders className="h-3 w-3" /> Edit Component Prices &amp; Items
              </button>
            )}
            <span>{selectedFlat.inventory?.length || 0} Components</span>
          </div>
        </h4>

        <div className="border border-slate-200 dark:border-sky-500/20 rounded-2xl bg-slate-50 dark:bg-slate-950/80 overflow-hidden divide-y divide-slate-200 dark:divide-slate-800/80 max-h-64 overflow-y-auto">
          {(selectedFlat.inventory && selectedFlat.inventory.length > 0) ? (
            selectedFlat.inventory.map((item, idx) => (
              <div key={idx} className="p-3.5 flex items-center justify-between hover:bg-slate-100 dark:hover:bg-white/5 transition-colors gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 shrink-0">
                    {getCategoryIcon(item.category || item.name)}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-800 dark:text-slate-100">{item.name}</div>
                    {item.description && (
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{item.description}</div>
                    )}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">{formatUSD(item.costUsd)}</span>
                  <span className="text-[10px] text-slate-400 block uppercase font-medium">{item.category}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="p-6 text-center text-xs text-slate-500">
              Standard luxury vacation rental furnishings package.
            </div>
          )}
        </div>

        <DialogFooter className="mt-6 flex flex-wrap justify-between gap-2">
          <Button
            variant="outline"
            onClick={() => setIsInspectModalOpen(false)}
            className="border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300"
          >
            Close Inspection
          </Button>
          <div className="flex flex-wrap items-center gap-2">
            {isAdmin && (
              <Button
                type="button"
                variant="outline"
                onClick={() => openEditPropertyModal(selectedFlat)}
                className="border-sky-500/40 bg-sky-500/10 text-sky-600 dark:text-sky-300 font-bold"
              >
                <Sliders className="h-4 w-4 mr-1.5" />
                Edit Pricing &amp; Values
              </Button>
            )}
            <Button
              onClick={() => {
                setIsInspectModalOpen(false);
                openPropertyDetail(selectedFlat);
              }}
              className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold"
            >
              Proceed to Acquisition &rarr;
            </Button>
          </div>
        </DialogFooter>
      </div>
    )}
  </DialogContent>
</Dialog>

{/* ─── MODAL 3: INVESTOR RENTAL WITHDRAWAL MODAL ───────────────────── */ }
<Dialog open={isWithdrawModalOpen} onOpenChange={setIsWithdrawModalOpen}>
  <DialogContent className="bg-white dark:bg-[#081729] border border-slate-200 dark:border-sky-500/30 text-slate-900 dark:text-white max-w-md rounded-3xl p-6 shadow-2xl">
    <DialogHeader>
      <DialogTitle className="text-2xl font-black flex items-center gap-2">
        <Wallet className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
        Withdraw Rental Yield
      </DialogTitle>
      <DialogDescription className="text-slate-600 dark:text-slate-400 text-xs mt-1">
        Available to withdraw: <strong className="text-emerald-600 dark:text-emerald-400 font-bold">{formatUSD(propertyBalance)} USD</strong>
      </DialogDescription>
    </DialogHeader>

    <div className="space-y-4 my-4">
      <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-sky-500/20 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
        Rental profits are isolated in USD. Withdraw directly to your crypto wallet or banking partner. Requests are processed within 24 hours.
      </div>

      <div>
        <label className="text-xs uppercase font-bold text-slate-500 dark:text-slate-400 block mb-1">
          Withdrawal Amount ($ USD) *
        </label>
        <input
          type="number"
          value={withdrawAmount}
          onChange={(e) => setWithdrawAmount(e.target.value)}
          max={propertyBalance}
          min={1}
          placeholder={`Max: ${propertyBalance}`}
          className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-sky-500/30 text-slate-900 dark:text-white font-black text-lg focus:outline-none focus:border-emerald-400"
        />
      </div>

      <div>
        <label className="text-xs uppercase font-bold text-slate-500 dark:text-slate-400 block mb-1">
          Payment Method *
        </label>
        <select
          value={withdrawMethod}
          onChange={(e) => setWithdrawMethod(e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-sky-500/30 text-slate-900 dark:text-white text-xs font-bold"
        >
          <option value="USDT (TRC-20)">USDT (TRC-20) Crypto Wallet</option>
          <option value="Bank Wire">International Bank Wire</option>
          <option value="PayPal / Wise">PayPal / Wise Account</option>
        </select>
      </div>

      <div>
        <label className="text-xs uppercase font-bold text-slate-500 dark:text-slate-400 block mb-1">
          Recipient Address or Account Details *
        </label>
        <input
          type="text"
          value={withdrawAddress}
          onChange={(e) => setWithdrawAddress(e.target.value)}
          placeholder={withdrawMethod.includes('USDT') ? 'T...' : 'IBAN / Email / Account #'}
          className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-sky-500/30 text-slate-900 dark:text-white font-mono text-xs focus:outline-none focus:border-emerald-400"
        />
      </div>
    </div>

    <DialogFooter className="flex gap-2">
      <Button
        variant="outline"
        onClick={() => setIsWithdrawModalOpen(false)}
        className="w-full sm:w-auto"
      >
        Cancel
      </Button>
      <Button
        onClick={() => {
          const amt = Number(withdrawAmount);
          if (isNaN(amt) || amt <= 0 || amt > propertyBalance) {
            toast.error(`Please enter a valid amount between $1 and $${propertyBalance}`);
            return;
          }
          if (!withdrawAddress) {
            toast.error('Please enter your recipient wallet address or account details');
            return;
          }
          withdrawRentalMutation.mutate({
            amountUsd: amt,
            paymentMethod: withdrawMethod,
            walletAddressOrAccount: withdrawAddress,
          });
        }}
        disabled={withdrawRentalMutation.isPending}
        className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold"
      >
        {withdrawRentalMutation.isPending ? 'Submitting...' : 'Confirm & Request Payout'}
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>

{/* ─── MODAL 4: ADMIN TREASURY ACTION MODAL ────────────────────────── */ }
<Dialog open={!!treasuryActionType} onOpenChange={(open) => !open && setTreasuryActionType(null)}>
  <DialogContent className="bg-white dark:bg-[#081729] border border-slate-200 dark:border-sky-500/30 text-slate-900 dark:text-white max-w-md rounded-3xl p-6 shadow-2xl">
    <DialogHeader>
      <DialogTitle className="text-xl font-black flex items-center gap-2">
        <Landmark className="h-5 w-5 text-purple-500" />
        {treasuryActionType === 'inject' && 'Inject Operational Capital Reserve'}
        {treasuryActionType === 'rent' && 'Record Gross Airbnb Rent Collection'}
        {treasuryActionType === 'profit' && 'Withdraw Net Retained Admin Profit'}
        {treasuryActionType === 'utility' && 'Record Utility & Bills Expense'}
      </DialogTitle>
      <DialogDescription className="text-slate-500 text-xs">
        {treasuryActionType === 'inject' && 'Funds the platform Airbnb operational reserve for property security deposits and liquidity.'}
        {treasuryActionType === 'rent' && 'Records gross guest revenues from Airbnb, Booking.com, and direct tenant stays.'}
        {treasuryActionType === 'profit' && 'Withdraws retained platform management profit to the executive account.'}
        {treasuryActionType === 'utility' && 'Deducts utility payments (power, water, internet) from the platform reserve.'}
      </DialogDescription>
    </DialogHeader>

    <div className="space-y-4 my-4">
      <div>
        <label className="text-xs uppercase font-bold text-slate-500 block mb-1">Amount ($ USD) *</label>
        <input
          type="number"
          value={treasuryActionAmount}
          onChange={(e) => setTreasuryActionAmount(e.target.value)}
          placeholder="e.g. 5000"
          className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-sky-500/30 text-slate-900 dark:text-white font-black text-lg"
        />
      </div>

      <div>
        <label className="text-xs uppercase font-bold text-slate-500 block mb-1">Notes / Reference</label>
        <input
          type="text"
          value={treasuryActionNote}
          onChange={(e) => setTreasuryActionNote(e.target.value)}
          placeholder="e.g. Houston Galleria Airbnb settlement"
          className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-sky-500/30 text-slate-900 dark:text-white text-xs"
        />
      </div>
    </div>

    <DialogFooter className="flex gap-2">
      <Button
        variant="outline"
        onClick={() => setTreasuryActionType(null)}
        className="w-full sm:w-auto"
      >
        Cancel
      </Button>
      <Button
        onClick={executeTreasuryAction}
        className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs"
      >
        Commit Transaction
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>

{/* ─── MODAL 5: ADMIN DISBURSE RENTAL DIVIDEND MODAL ──────────────── */ }
<Dialog open={isAdminPayoutModalOpen} onOpenChange={setIsAdminPayoutModalOpen}>
  <DialogContent className="bg-white dark:bg-[#081729] border border-slate-200 dark:border-sky-500/30 text-slate-900 dark:text-white max-w-md rounded-3xl p-6 shadow-2xl">
    <DialogHeader>
      <DialogTitle className="text-xl font-bold flex items-center gap-2">
        <DollarSign className="h-5 w-5 text-emerald-500" />
        Disburse Rental Yield ({payoutType === 'daily' ? 'Daily' : 'Monthly'})
      </DialogTitle>
      <DialogDescription className="text-slate-500 dark:text-slate-400 text-xs">
        Credited directly to the investor's isolated Property Wallet from the distributable pool.
      </DialogDescription>
    </DialogHeader>

    <div className="space-y-4 my-4">
      {/* Daily vs Monthly Mode Selector */}
      <div>
        <label className="text-xs uppercase font-bold text-slate-500 block mb-1">Payout Frequency Mode</label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => {
              setPayoutType('monthly');
              if (selectedInvestmentForPayout) {
                setPayoutAmount(String(selectedInvestmentForPayout.monthlyRentUsd || (selectedInvestmentForPayout.flat?.monthlyRentUsd ?? 0)));
              }
              setPayoutNote('Monthly rental dividend');
            }}
            className={`p-2.5 rounded-xl text-xs font-bold border transition-all ${payoutType === 'monthly'
                ? 'bg-emerald-500 text-slate-950 border-emerald-500 font-extrabold shadow'
                : 'bg-slate-100 dark:bg-slate-900 border-slate-300 dark:border-slate-800 text-slate-600 dark:text-slate-400'
              }`}
          >
            📅 Monthly Rent Run
          </button>
          <button
            type="button"
            onClick={() => {
              setPayoutType('daily');
              if (selectedInvestmentForPayout) {
                const daily = selectedInvestmentForPayout.dailyRateUsd || (selectedInvestmentForPayout.monthlyRentUsd ? Math.round(selectedInvestmentForPayout.monthlyRentUsd / 30) : 0);
                setPayoutAmount(String(daily));
              }
              setPayoutNote('Daily micro-rental dividend');
            }}
            className={`p-2.5 rounded-xl text-xs font-bold border transition-all ${payoutType === 'daily'
                ? 'bg-emerald-500 text-slate-950 border-emerald-500 font-extrabold shadow'
                : 'bg-slate-100 dark:bg-slate-900 border-slate-300 dark:border-slate-800 text-slate-600 dark:text-slate-400'
              }`}
          >
            🌙 Daily Micro-Payout
          </button>
        </div>
      </div>

      <div>
        <label className="text-xs uppercase font-bold text-slate-500 dark:text-slate-400 block mb-1">
          {payoutType === 'daily' ? 'Target Date / Cycle Label' : 'Billing Month / Period'}
        </label>
        <input
          type="text"
          value={payoutMonthYear}
          onChange={(e) => setPayoutMonthYear(e.target.value)}
          placeholder={payoutType === 'daily' ? 'Oct 25, 2026' : 'October 2026'}
          className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-sky-500/30 text-slate-900 dark:text-white font-bold text-sm"
        />
      </div>

      <div>
        <label className="text-xs uppercase font-bold text-slate-500 dark:text-slate-400 block mb-1">
          Disburse ROI Amount to User Wallet ($ USD) *
        </label>
        {Number(selectedInvestmentForPayout?.amountUsd || 0) > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2">
            {[18, 19, 20, 21, 22].map((annualRoi) => {
              const monthlyVal = Math.round((Number(selectedInvestmentForPayout?.amountUsd || 0) * (annualRoi / 100)) / 12);
              return (
                <button
                  key={annualRoi}
                  type="button"
                  onClick={() => setPayoutAmount(String(monthlyVal))}
                  className="px-2 py-0.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/25 font-bold text-[10px]"
                >
                  {annualRoi}% ROI (${monthlyVal}/mo)
                </button>
              );
            })}
          </div>
        )}
        <input
          type="number"
          value={payoutAmount}
          onChange={(e) => setPayoutAmount(e.target.value)}
          placeholder="e.g. 550"
          className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-sky-500/30 text-emerald-600 dark:text-emerald-400 font-extrabold text-lg"
        />
      </div>

      <div>
        <label className="text-xs uppercase font-bold text-slate-500 dark:text-slate-400 block mb-1">
          Transfer Destination *
        </label>
        <select
          value={payoutDestination}
          onChange={(e) => setPayoutDestination(e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-sky-500/30 text-slate-900 dark:text-white text-xs font-bold"
        >
          <option value="Bank Account & Property Wallet">Investor Bank Account & Property Wallet</option>
          <option value="Direct Bank Account Deposit (IBAN / Wire)">Direct Bank Account Deposit (IBAN / Wire)</option>
          <option value="Dedicated Property Wallet (USD)">Dedicated Property Wallet (USD)</option>
          <option value="USDT (TRC-20) Crypto Wallet">USDT (TRC-20) Crypto Wallet</option>
        </select>
      </div>

      <div>
        <label className="text-xs uppercase font-bold text-slate-500 dark:text-slate-400 block mb-1">
          Investor Bank Account / IBAN / Wallet Address
        </label>
        <input
          type="text"
          value={payoutBankAccount}
          onChange={(e) => setPayoutBankAccount(e.target.value)}
          placeholder="e.g. HBL / Meezan / IBAN / USDT Wallet Address"
          className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-sky-500/30 text-slate-900 dark:text-white font-mono text-xs"
        />
      </div>

      <div>
        <label className="text-xs uppercase font-bold text-slate-500 dark:text-slate-400 block mb-1">Statement Note</label>
        <input
          type="text"
          value={payoutNote}
          onChange={(e) => setPayoutNote(e.target.value)}
          placeholder="e.g. Monthly property investment return"
          className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-sky-500/30 text-slate-900 dark:text-white text-xs"
        />
      </div>
    </div>

    <DialogFooter className="flex gap-2">
      <Button
        variant="outline"
        onClick={() => setIsAdminPayoutModalOpen(false)}
        className="w-full sm:w-auto"
      >
        Cancel
      </Button>
      <Button
        onClick={() => {
          if (!selectedInvestmentForPayout) return;
          disburseMutation.mutate({
            id: selectedInvestmentForPayout.id,
            amountUsd: Number(payoutAmount),
            monthYear: payoutMonthYear,
            note: payoutNote,
            payoutType,
            daysCount: payoutDaysCount,
            bankAccount: payoutBankAccount,
            destination: payoutDestination,
          });
        }}
        disabled={disburseMutation.isPending}
        className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold"
      >
        {disburseMutation.isPending ? "Sending..." : "Send Money & Notify Investor"}
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>

{/* ─── MODAL 6: ADMIN ADD PROPERTY LISTING MODAL ───────────────────── */ }
<Dialog open={isAdminAddModalOpen} onOpenChange={setIsAdminAddModalOpen}>
  <DialogContent className="bg-white dark:bg-[#081729] border border-slate-200 dark:border-sky-500/30 text-slate-900 dark:text-white max-w-3xl rounded-3xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto shadow-2xl">
    <DialogHeader>
      <DialogTitle className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
        <Building2 className="h-6 w-6 text-emerald-500" />
        Add New Property Listing
      </DialogTitle>
      <DialogDescription className="text-slate-500 dark:text-slate-400 text-sm">
        Create a property vacation rental package with complete itemized furnishings breakdown.
      </DialogDescription>
    </DialogHeader>

    <div className="space-y-4 my-4">
      {/* Quick Presets for 1-Bed ($2k) vs 2-Bed ($3k) */}
      <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
        <span className="text-xs uppercase font-extrabold text-slate-500 block mb-2">⚡ Quick Property Specification Presets:</span>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => {
              setNewPropTitle("The Urban Palm 1-Bedroom Suite");
              setNewPropUnitType("1-Bedroom Suite");
              setNewPropPrice("2000");
              setNewPropRent("350");
              setNewPropDailyRate("45");
              setNewPropYield("21");
              setNewPropLocation("Orlando, Florida, USA");
              setNewPropInventory(getRecommendedInventory(2000));
            }}
            className="p-2.5 rounded-xl text-left border border-slate-200 dark:border-slate-800 hover:border-emerald-500 text-xs font-bold transition-all bg-white dark:bg-slate-900"
          >
            <div className="text-emerald-500">🛏️ 1-Bed Flat Preset</div>
            <div className="text-slate-500 text-[11px]">$2,000 Cost • $350/mo Rent</div>
          </button>

          <button
            type="button"
            onClick={() => {
              setNewPropTitle("The Galleria Executive 2-Bedroom Flat");
              setNewPropUnitType("2-Bedroom Luxury Flat");
              setNewPropPrice("3000");
              setNewPropRent("550");
              setNewPropDailyRate("65");
              setNewPropYield("22");
              setNewPropLocation("Houston, Texas, USA");
              setNewPropInventory(getRecommendedInventory(3000));
            }}
            className="p-2.5 rounded-xl text-left border border-slate-200 dark:border-slate-800 hover:border-sky-500 text-xs font-bold transition-all bg-white dark:bg-slate-900"
          >
            <div className="text-sky-500">🏢 2-Bed Flat Preset</div>
            <div className="text-slate-500 text-[11px]">$3,000 Cost • $550/mo Rent</div>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs uppercase font-bold text-slate-500 dark:text-slate-400 block mb-1">Property Title *</label>
          <input
            type="text"
            value={newPropTitle}
            onChange={(e) => setNewPropTitle(e.target.value)}
            placeholder="e.g. Palm Jumeirah Sunset Suite"
            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-sky-500/30 text-slate-900 dark:text-white text-sm"
          />
        </div>
        <div>
          <label className="text-xs uppercase font-bold text-slate-500 dark:text-slate-400 block mb-1">Unit Type *</label>
          <input
            type="text"
            value={newPropUnitType}
            onChange={(e) => setNewPropUnitType(e.target.value)}
            placeholder="e.g. 1-Bedroom Suite, 2-Bedroom Flat"
            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-sky-500/30 text-slate-900 dark:text-white text-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div>
          <label className="text-xs uppercase font-bold text-slate-500 dark:text-slate-400 block mb-1">Location *</label>
          <input
            type="text"
            value={newPropLocation}
            onChange={(e) => setNewPropLocation(e.target.value)}
            placeholder="Miami, FL, USA"
            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-sky-500/30 text-slate-900 dark:text-white text-sm"
          />
        </div>
        <div>
          <label className="text-xs uppercase font-bold text-slate-500 dark:text-slate-400 block mb-1">Upfront Cost ($) *</label>
          <input
            type="number"
            value={newPropPrice}
            onChange={(e) => {
              setNewPropPrice(e.target.value);
              if (newPropInventory.length > 0) {
                setNewPropInventory(getRecommendedInventory(Number(e.target.value) || 3000));
              }
            }}
            placeholder="3000"
            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-sky-500/30 text-slate-900 dark:text-white text-sm font-bold"
          />
        </div>
        <div>
          <label className="text-xs uppercase font-bold text-slate-500 dark:text-slate-400 block mb-1">Monthly Rent ($) *</label>
          <input
            type="number"
            value={newPropRent}
            onChange={(e) => setNewPropRent(e.target.value)}
            placeholder="550"
            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-sky-500/30 text-emerald-600 dark:text-emerald-400 text-sm font-bold"
          />
        </div>
        <div>
          <label className="text-xs uppercase font-bold text-slate-500 dark:text-slate-400 block mb-1">Nightly Rate ($)</label>
          <input
            type="number"
            value={newPropDailyRate}
            onChange={(e) => setNewPropDailyRate(e.target.value)}
            placeholder="65"
            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-sky-500/30 text-sky-500 text-sm font-bold"
          />
        </div>
      </div>

      <div>
        <label className="text-xs uppercase font-bold text-slate-500 dark:text-slate-400 block mb-1">Annual Yield % *</label>
        <input
          type="number"
          value={newPropYield}
          onChange={(e) => setNewPropYield(e.target.value)}
          placeholder="21"
          className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-sky-500/30 text-slate-900 dark:text-white text-sm"
        />
      </div>

      {/* Property Pictures Uploader & Multi-Image Sequential Builder */}
      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-sky-500/25 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <label className="text-xs uppercase font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <ImageIcon className="h-4 w-4 text-sky-500" />
              Property Pictures ({newPropImageList.length} added — displays one after another)
            </label>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Upload one or multiple pictures from your device or paste image URLs. Pictures automatically cycle one after another on the listing.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <label className="cursor-pointer inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-extrabold bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 text-white shadow-md shadow-sky-500/20 transition-all">
              <Upload className="h-3.5 w-3.5" />
              <span>{isUploadingImages ? 'Processing...' : '+ Upload Pictures'}</span>
              <input
                type="file"
                accept="image/*"
                multiple
                disabled={isUploadingImages}
                onChange={(e) => {
                  handleUploadPropertyFiles(e.target.files, setNewPropImageList);
                  e.target.value = '';
                }}
                className="hidden"
              />
            </label>
            {newPropImageList.length > 0 && (
              <button
                type="button"
                onClick={() => setNewPropImageList([])}
                className="px-2.5 py-2 rounded-xl text-[11px] font-bold text-rose-500 hover:bg-rose-500/10 border border-rose-500/20 transition-colors"
              >
                Clear All
              </button>
            )}
          </div>
        </div>

        {/* Optional Image URL Adder */}
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={newPropImages}
            onChange={(e) => setNewPropImages(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddImageUrl(newPropImages, () => setNewPropImages(''), setNewPropImageList);
              }
            }}
            placeholder="Or paste image URL(s) (comma-separated) and click + Add URL..."
            className="flex-1 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-sky-500/30 text-slate-900 dark:text-white text-xs font-mono"
          />
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => handleAddImageUrl(newPropImages, () => setNewPropImages(''), setNewPropImageList)}
            className="text-xs font-bold border-sky-500/30 text-sky-600 dark:text-sky-400 shrink-0 h-9 rounded-xl"
          >
            + Add URL
          </Button>
        </div>

        {/* Ordered Picture Preview Strip */}
        {newPropImageList.length === 0 ? (
          <div className="text-center py-6 rounded-xl border border-dashed border-slate-300 dark:border-slate-800 text-xs text-slate-400">
            No pictures added yet. Click <strong>+ Upload Pictures</strong> above to select one or multiple photos.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
            {newPropImageList.map((imgSrc, idx) => (
              <div
                key={idx}
                className="relative group rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-900 aspect-video shadow-sm"
              >
                <img
                  src={imgSrc}
                  alt={`Property photo ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-transparent to-slate-950/40" />

                <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-md bg-slate-950/80 text-white text-[10px] font-extrabold border border-white/15">
                  {idx === 0 ? '★ #1 Cover' : `#${idx + 1}`}
                </span>

                <div className="absolute top-1.5 right-1.5 flex items-center gap-1">
                  <label
                    className="cursor-pointer px-2 py-0.5 rounded-md bg-sky-600/90 hover:bg-sky-500 text-white text-[10px] font-bold shadow flex items-center gap-1"
                    title="Change this picture"
                  >
                    <span>Change</span>
                    <input
                      type="file"
                      accept="image/*"
                      disabled={isUploadingImages}
                      onChange={(e) => {
                        handleReplaceSingleImage(e.target.files?.[0], idx, setNewPropImageList);
                        e.target.value = '';
                      }}
                      className="hidden"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => setNewPropImageList((prev) => prev.filter((_, i) => i !== idx))}
                    className="h-6 w-6 rounded-full bg-rose-600/90 hover:bg-rose-600 text-white flex items-center justify-center shadow"
                    title="Remove picture"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>

                {newPropImageList.length > 1 && (
                  <div className="absolute bottom-1.5 left-1.5 right-1.5 flex items-center justify-between">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => moveImageInList(idx, -1, setNewPropImageList)}
                      className="px-2 py-0.5 rounded bg-slate-950/80 hover:bg-slate-900 disabled:opacity-30 text-white text-[10px] font-bold border border-white/15"
                      title="Move earlier"
                    >
                      &larr; Prev
                    </button>
                    <button
                      type="button"
                      disabled={idx === newPropImageList.length - 1}
                      onClick={() => moveImageInList(idx, 1, setNewPropImageList)}
                      className="px-2 py-0.5 rounded bg-slate-950/80 hover:bg-slate-900 disabled:opacity-30 text-white text-[10px] font-bold border border-white/15"
                      title="Move later"
                    >
                      Next &rarr;
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <label className="text-xs uppercase font-bold text-slate-500 dark:text-slate-400 block mb-1">
          Key Features & Amenities (comma-separated)
        </label>
        <input
          type="text"
          value={newPropFeatures}
          onChange={(e) => setNewPropFeatures(e.target.value)}
          placeholder="Superhost Managed, Smart Keyless Lock, 100% Bills Covered, High Occupancy, 1Gbps Wi-Fi"
          className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-sky-500/30 text-slate-900 dark:text-white text-sm"
        />
      </div>

      <div>
        <label className="text-xs uppercase font-bold text-slate-500 dark:text-slate-400 block mb-1">Description</label>
        <textarea
          rows={2}
          value={newPropDesc}
          onChange={(e) => setNewPropDesc(e.target.value)}
          placeholder="Describe location highlights, average daily rate (ADR), target guests, and amenities..."
          className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-sky-500/30 text-slate-900 dark:text-white text-sm"
        />
      </div>

      {/* Itemized Furnishing & Setup Package Builder ("The Whole Pack") */}
      <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
          <div>
            <label className="text-xs uppercase font-extrabold text-slate-700 dark:text-slate-300 block">
              Itemized Furnishings & Setup Package ({newPropInventory.length} items)
            </label>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              Total Package Breakdown: <strong className="text-emerald-600 dark:text-emerald-400">${newPropInventory.reduce((s, i) => s + (Number(i.costUsd) || 0), 0).toLocaleString()} USD</strong>
            </span>
          </div>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => setNewPropInventory(getRecommendedInventory(Number(newPropPrice) || 3000))}
            className="text-xs font-bold text-emerald-600 dark:text-emerald-400 border-emerald-500/30 shrink-0"
          >
            ⚡ Auto-Fill Full Package
          </Button>
        </div>

        {/* Custom Item Adder Row */}
        <div className="p-3 mb-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
          <input
            type="text"
            value={customItemName}
            onChange={(e) => setCustomItemName(e.target.value)}
            placeholder="Add custom item (e.g. Balcony Patio Furniture)"
            className="sm:col-span-5 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
          />
          <select
            value={customItemCategory}
            onChange={(e) => setCustomItemCategory(e.target.value)}
            className="sm:col-span-3 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-medium"
          >
            <option value="Bedroom">Bedroom</option>
            <option value="Living Room">Living Room</option>
            <option value="Kitchen">Kitchen</option>
            <option value="Electronics">Electronics</option>
            <option value="Smart Tech">Smart Tech</option>
            <option value="Supplies">Supplies</option>
            <option value="Decor">Decor</option>
            <option value="Operations">Operations</option>
            <option value="Setup">Setup</option>
          </select>
          <input
            type="number"
            value={customItemCost}
            onChange={(e) => setCustomItemCost(e.target.value)}
            placeholder="Cost ($)"
            className="sm:col-span-2 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-bold"
          />
          <Button
            type="button"
            size="sm"
            onClick={handleAddCustomInventoryItem}
            className="sm:col-span-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white h-8"
          >
            + Add
          </Button>
        </div>

        {/* Existing Inventory List (Editable inline) */}
        <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-3 bg-slate-50 dark:bg-slate-950/60 max-h-60 overflow-y-auto space-y-2">
          {newPropInventory.length === 0 ? (
            <div className="text-center py-4 text-xs text-slate-400">
              No items in package. Click "Auto-Fill Full Package" or add custom items above.
            </div>
          ) : (
            newPropInventory.map((item, idx) => (
              <div key={idx} className="grid grid-cols-1 sm:grid-cols-12 items-center gap-2 text-xs p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <div className="sm:col-span-5 flex items-center gap-2 min-w-0">
                  {getCategoryIcon(item.category)}
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) => {
                      const val = e.target.value;
                      setNewPropInventory(prev => prev.map((it, i) => i === idx ? { ...it, name: val } : it));
                    }}
                    className="w-full px-2 py-1 rounded bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 font-bold text-slate-800 dark:text-slate-200 text-xs"
                  />
                </div>
                <div className="sm:col-span-3">
                  <input
                    type="text"
                    value={item.category}
                    onChange={(e) => {
                      const val = e.target.value;
                      setNewPropInventory(prev => prev.map((it, i) => i === idx ? { ...it, category: val } : it));
                    }}
                    className="w-full px-2 py-1 rounded bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs"
                  />
                </div>
                <div className="sm:col-span-3 flex items-center gap-1">
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">$</span>
                  <input
                    type="number"
                    value={item.costUsd}
                    onChange={(e) => {
                      const val = Number(e.target.value) || 0;
                      setNewPropInventory(prev => prev.map((it, i) => i === idx ? { ...it, costUsd: val } : it));
                    }}
                    className="w-full px-2 py-1 rounded bg-slate-50 dark:bg-slate-950 border border-emerald-500/30 font-extrabold text-emerald-600 dark:text-emerald-400 text-xs"
                  />
                </div>
                <div className="sm:col-span-1 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setNewPropInventory(newPropInventory.filter((_, i) => i !== idx))}
                    className="text-rose-500 hover:text-rose-700 p-1"
                    title="Remove item"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>

    <DialogFooter className="flex gap-2">
      <Button
        variant="outline"
        onClick={() => setIsAdminAddModalOpen(false)}
        className="w-full sm:w-auto"
      >
        Cancel
      </Button>
      <Button
        onClick={() => {
          if (!newPropTitle || !newPropLocation) {
            toast.error("Please provide title and location");
            return;
          }
          const price = Number(newPropPrice) || 3000;
          const rent = Number(newPropRent) || 550;
          const daily = Number(newPropDailyRate) || 65;
          const yieldPct = Number(newPropYield) || 21;
          const inv = newPropInventory.length > 0 ? newPropInventory : getRecommendedInventory(price);
          const extraUrls = newPropImages.split(/[\n,]+/).map(s => s.trim()).filter(Boolean);
          const combinedImages = [...newPropImageList, ...extraUrls].filter(Boolean);

          createPropertyMutation.mutate({
            title: newPropTitle,
            unitType: newPropUnitType,
            location: newPropLocation,
            totalPriceUsd: price,
            monthlyRentUsd: rent,
            dailyRateUsd: daily,
            annualYieldPercent: yieldPct,
            description: newPropDesc,
            features: newPropFeatures.split(',').map(s => s.trim()).filter(Boolean),
            images: combinedImages.length > 0 ? combinedImages : [DEFAULT_PROPERTY_IMAGE],
            inventory: inv,
            status: 'available',
          });
        }}
        disabled={createPropertyMutation.isPending || isUploadingImages}
        className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold"
      >
        {createPropertyMutation.isPending ? "Creating Listing..." : "Publish Property Listing"}
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>

{/* ─── MODAL 7: ADMIN MANAGE EXISTING PROPERTY PHOTOS MODAL ───────── */}
<Dialog open={!!editingPhotosFlat} onOpenChange={(open) => !open && setEditingPhotosFlat(null)}>
  <DialogContent className="bg-white dark:bg-[#081729] border border-slate-200 dark:border-sky-500/30 text-slate-900 dark:text-white max-w-2xl rounded-3xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto shadow-2xl">
    <DialogHeader>
      <DialogTitle className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
        <ImageIcon className="h-6 w-6 text-sky-500" />
        Manage Property Pictures
      </DialogTitle>
      <DialogDescription className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm">
        {editingPhotosFlat?.title} — Add multiple pictures that will display one after another on the property card and detail modals.
      </DialogDescription>
    </DialogHeader>

    <div className="space-y-4 my-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs font-extrabold uppercase text-slate-600 dark:text-slate-300">
          {editingPhotosList.length} Picture{editingPhotosList.length === 1 ? '' : 's'} in Sequence
        </span>
        <div className="flex items-center gap-2">
          <label className="cursor-pointer inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-extrabold bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 text-white shadow-md shadow-sky-500/20 transition-all">
            <Upload className="h-3.5 w-3.5" />
            <span>{isUploadingImages ? 'Processing...' : '+ Upload Pictures'}</span>
            <input
              type="file"
              accept="image/*"
              multiple
              disabled={isUploadingImages}
              onChange={(e) => {
                handleUploadPropertyFiles(e.target.files, setEditingPhotosList);
                e.target.value = '';
              }}
              className="hidden"
            />
          </label>
          {editingPhotosList.length > 0 && (
            <button
              type="button"
              onClick={() => setEditingPhotosList([])}
              className="px-2.5 py-2 rounded-xl text-[11px] font-bold text-rose-500 hover:bg-rose-500/10 border border-rose-500/20 transition-colors"
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Add by URL */}
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          value={editingPhotoUrlInput}
          onChange={(e) => setEditingPhotoUrlInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleAddImageUrl(editingPhotoUrlInput, () => setEditingPhotoUrlInput(''), setEditingPhotosList);
            }
          }}
          placeholder="Or paste image URL(s) (comma-separated) and click + Add URL..."
          className="flex-1 px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-sky-500/30 text-slate-900 dark:text-white text-xs font-mono"
        />
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => handleAddImageUrl(editingPhotoUrlInput, () => setEditingPhotoUrlInput(''), setEditingPhotosList)}
          className="text-xs font-bold border-sky-500/30 text-sky-600 dark:text-sky-400 shrink-0 h-9 rounded-xl"
        >
          + Add URL
        </Button>
      </div>

      {/* Live Carousel Preview */}
      {editingPhotosList.length > 0 && (
        <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
          <PropertyImageCarousel
            images={editingPhotosList}
            title={editingPhotosFlat?.title || 'Property'}
            heightClass="h-48 sm:h-56"
            autoPlayMs={3000}
          />
        </div>
      )}

      {/* Sequence Order Grid */}
      {editingPhotosList.length === 0 ? (
        <div className="text-center py-8 rounded-xl border border-dashed border-slate-300 dark:border-slate-800 text-xs text-slate-400">
          No pictures in list. Upload pictures or paste URLs above.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {editingPhotosList.map((imgSrc, idx) => (
            <div
              key={idx}
              className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-900 aspect-video shadow-sm"
            >
              <img src={imgSrc} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-transparent to-slate-950/40" />
              <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-md bg-slate-950/80 text-white text-[10px] font-extrabold border border-white/15">
                {idx === 0 ? '★ #1 Cover' : `#${idx + 1}`}
              </span>
              <div className="absolute top-1.5 right-1.5 flex items-center gap-1">
                <label
                  className="cursor-pointer px-2 py-0.5 rounded-md bg-sky-600/90 hover:bg-sky-500 text-white text-[10px] font-bold shadow flex items-center gap-1"
                  title="Change this picture"
                >
                  <span>Change</span>
                  <input
                    type="file"
                    accept="image/*"
                    disabled={isUploadingImages}
                    onChange={(e) => {
                      handleReplaceSingleImage(e.target.files?.[0], idx, setEditingPhotosList);
                      e.target.value = '';
                    }}
                    className="hidden"
                  />
                </label>
                <button
                  type="button"
                  onClick={() => setEditingPhotosList((prev) => prev.filter((_, i) => i !== idx))}
                  className="h-6 w-6 rounded-full bg-rose-600/90 hover:bg-rose-600 text-white flex items-center justify-center shadow"
                  title="Remove picture"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
              {editingPhotosList.length > 1 && (
                <div className="absolute bottom-1.5 left-1.5 right-1.5 flex items-center justify-between">
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => moveImageInList(idx, -1, setEditingPhotosList)}
                    className="px-2 py-0.5 rounded bg-slate-950/80 hover:bg-slate-900 disabled:opacity-30 text-white text-[10px] font-bold border border-white/15"
                  >
                    &larr; Prev
                  </button>
                  <button
                    type="button"
                    disabled={idx === editingPhotosList.length - 1}
                    onClick={() => moveImageInList(idx, 1, setEditingPhotosList)}
                    className="px-2 py-0.5 rounded bg-slate-950/80 hover:bg-slate-900 disabled:opacity-30 text-white text-[10px] font-bold border border-white/15"
                  >
                    Next &rarr;
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>

    <DialogFooter className="flex gap-2">
      <Button
        variant="outline"
        onClick={() => setEditingPhotosFlat(null)}
        className="w-full sm:w-auto"
      >
        Cancel
      </Button>
      <Button
        onClick={() => {
          if (!editingPhotosFlat) return;
          const extraUrls = editingPhotoUrlInput.split(/[\n,]+/).map(s => s.trim()).filter(Boolean);
          const finalImages = [...editingPhotosList, ...extraUrls].filter(Boolean);
          updatePropertyImagesMutation.mutate({
            id: editingPhotosFlat.id,
            images: finalImages.length > 0 ? finalImages : [DEFAULT_PROPERTY_IMAGE],
          });
        }}
        disabled={updatePropertyImagesMutation.isPending || isUploadingImages}
        className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold"
      >
        {updatePropertyImagesMutation.isPending ? 'Saving Pictures...' : 'Save Pictures'}
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>

{/* ─── MODAL 8: ADMIN SEND MONEY TO INVESTOR BANK / ACCOUNT MODAL ─── */}
<Dialog open={!!selectedInvestorForCredit} onOpenChange={(open) => !open && setSelectedInvestorForCredit(null)}>
  <DialogContent className="bg-white dark:bg-[#081729] border border-slate-200 dark:border-sky-500/30 text-slate-900 dark:text-white max-w-md rounded-3xl p-6 shadow-2xl">
    <DialogHeader>
      <DialogTitle className="text-xl font-black flex items-center gap-2">
        <Landmark className="h-5 w-5 text-emerald-500" />
        Send Return / Add Money to Investor Account
      </DialogTitle>
      <DialogDescription className="text-slate-500 dark:text-slate-400 text-xs">
        Investor: <strong className="text-slate-900 dark:text-white">{selectedInvestorForCredit?.fullName || selectedInvestorForCredit?.username}</strong> ({selectedInvestorForCredit?.email})
      </DialogDescription>
    </DialogHeader>

    <div className="space-y-3.5 my-3">
      {selectedInvestorForCredit?.totalInvestedUsd > 0 && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25">
          <span className="text-[11px] font-bold uppercase text-emerald-700 dark:text-emerald-300 block mb-1.5">
            ⚡ Quick Property ROI Calculator (Invested: {formatUSD(selectedInvestorForCredit.totalInvestedUsd)})
          </span>
          <div className="flex flex-wrap gap-1.5">
            {selectedInvestorForCredit.expectedMonthlyUsd > 0 && (
              <button
                type="button"
                onClick={() => setCreditAmount(String(selectedInvestorForCredit.expectedMonthlyUsd))}
                className="px-2.5 py-1 rounded-lg bg-emerald-500 text-slate-950 font-extrabold text-[11px] shadow-sm"
              >
                Monthly Rent ({formatUSD(selectedInvestorForCredit.expectedMonthlyUsd)})
              </button>
            )}
            {[18, 19, 20, 21, 22].map((annualRoi) => {
              const monthlyVal = Math.round((selectedInvestorForCredit.totalInvestedUsd * (annualRoi / 100)) / 12);
              return (
                <button
                  key={annualRoi}
                  type="button"
                  onClick={() => setCreditAmount(String(monthlyVal))}
                  className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20 font-bold text-[11px]"
                >
                  {annualRoi}% ROI / yr (${monthlyVal}/mo)
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div>
        <label className="text-xs uppercase font-bold text-slate-500 dark:text-slate-400 block mb-1">
          ROI Amount to Add to User Wallet / Bank ($ USD) *
        </label>
        <input
          type="number"
          value={creditAmount}
          onChange={(e) => setCreditAmount(e.target.value)}
          placeholder="e.g. 520"
          className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-sky-500/30 text-emerald-600 dark:text-emerald-400 font-extrabold text-lg"
        />
      </div>

      <div>
        <label className="text-xs uppercase font-bold text-slate-500 dark:text-slate-400 block mb-1">
          Destination Account Type *
        </label>
        <select
          value={creditDestination}
          onChange={(e) => setCreditDestination(e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-sky-500/30 text-slate-900 dark:text-white text-xs font-bold"
        >
          <option value="Investor Bank Account & Property Wallet">Investor Bank Account & Property Wallet</option>
          <option value="Direct Bank Account Deposit (IBAN / Wire)">Direct Bank Account Deposit (IBAN / Wire)</option>
          <option value="Dedicated Property Wallet (USD)">Dedicated Property Wallet (USD)</option>
          <option value="USDT (TRC-20) Crypto Wallet">USDT (TRC-20) Crypto Wallet</option>
        </select>
      </div>

      <div>
        <label className="text-xs uppercase font-bold text-slate-500 dark:text-slate-400 block mb-1">
          Investor Bank Account / IBAN / Wallet Details
        </label>
        <input
          type="text"
          value={creditBankAccount}
          onChange={(e) => setCreditBankAccount(e.target.value)}
          placeholder="e.g. HBL / Meezan Bank / IBAN / USDT Wallet"
          className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-sky-500/30 text-slate-900 dark:text-white font-mono text-xs"
        />
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <div>
          <label className="text-xs uppercase font-bold text-slate-500 dark:text-slate-400 block mb-1">
            Billing Month *
          </label>
          <input
            type="text"
            value={creditMonthYear}
            onChange={(e) => setCreditMonthYear(e.target.value)}
            placeholder="October 2026"
            className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-sky-500/30 text-slate-900 dark:text-white text-xs font-bold"
          />
        </div>
        <div>
          <label className="text-xs uppercase font-bold text-slate-500 dark:text-slate-400 block mb-1">
            Property Reference
          </label>
          <input
            type="text"
            value={creditPropertyTitle}
            onChange={(e) => setCreditPropertyTitle(e.target.value)}
            placeholder="Property Title"
            className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-sky-500/30 text-slate-900 dark:text-white text-xs"
          />
        </div>
      </div>

      <div>
        <label className="text-xs uppercase font-bold text-slate-500 dark:text-slate-400 block mb-1">
          Notification Message / Statement Note
        </label>
        <input
          type="text"
          value={creditNote}
          onChange={(e) => setCreditNote(e.target.value)}
          placeholder="e.g. Monthly return on property you invested in"
          className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-sky-500/30 text-slate-900 dark:text-white text-xs"
        />
      </div>
    </div>

    <DialogFooter className="flex gap-2">
      <Button
        variant="outline"
        onClick={() => setSelectedInvestorForCredit(null)}
        className="w-full sm:w-auto"
      >
        Cancel
      </Button>
      <Button
        onClick={() => {
          if (!selectedInvestorForCredit) return;
          const amt = Number(creditAmount);
          if (isNaN(amt) || amt <= 0) {
            toast.error('Please enter a valid USD amount');
            return;
          }
          creditInvestorMutation.mutate({
            userId: selectedInvestorForCredit.id,
            data: {
              amountUsd: amt,
              monthYear: creditMonthYear,
              propertyTitle: creditPropertyTitle,
              bankAccount: creditBankAccount,
              destination: creditDestination,
              note: creditNote,
            },
          });
        }}
        disabled={creditInvestorMutation.isPending}
        className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold"
      >
        {creditInvestorMutation.isPending ? 'Sending...' : 'Send Money & Notify Investor'}
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>

{/* ─── MODAL 9: ADMIN FULL EDIT PROPERTY PRICING, VALUES, INVENTORY & BILLS MODAL ─── */}
<Dialog open={!!editingPropertyFlat} onOpenChange={(open) => !open && setEditingPropertyFlat(null)}>
  <DialogContent className="bg-white dark:bg-[#081729] border border-slate-200 dark:border-sky-500/30 text-slate-900 dark:text-white max-w-3xl rounded-3xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto shadow-2xl">
    <DialogHeader>
      <DialogTitle className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
        <Sliders className="h-6 w-6 text-emerald-500" />
        Edit Property Pricing, Values &amp; Breakdown
      </DialogTitle>
      <DialogDescription className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm">
        Full Admin Access — Modify property prices, yields, utility bills coverage, and every itemized furnishing component value.
      </DialogDescription>
    </DialogHeader>

    <div className="space-y-5 my-4">
      {/* 1. Core Property Title, Type, Location & Status */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div>
          <label className="text-xs uppercase font-bold text-slate-500 dark:text-slate-400 block mb-1">Property Title *</label>
          <input
            type="text"
            value={editPropTitle}
            onChange={(e) => setEditPropTitle(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-sky-500/30 text-slate-900 dark:text-white text-sm font-bold"
          />
        </div>
        <div>
          <label className="text-xs uppercase font-bold text-slate-500 dark:text-slate-400 block mb-1">Unit Type *</label>
          <input
            type="text"
            value={editPropUnitType}
            onChange={(e) => setEditPropUnitType(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-sky-500/30 text-slate-900 dark:text-white text-sm"
          />
        </div>
        <div>
          <label className="text-xs uppercase font-bold text-slate-500 dark:text-slate-400 block mb-1">Location *</label>
          <input
            type="text"
            value={editPropLocation}
            onChange={(e) => setEditPropLocation(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-sky-500/30 text-slate-900 dark:text-white text-sm"
          />
        </div>
        <div>
          <label className="text-xs uppercase font-bold text-slate-500 dark:text-slate-400 block mb-1">Listing Status</label>
          <select
            value={editPropStatus}
            onChange={(e) => setEditPropStatus(e.target.value as any)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-sky-500/30 text-slate-900 dark:text-white text-sm font-bold"
          >
            <option value="available">Available for Acquisition</option>
            <option value="in_setup">In On-Ground Setup</option>
            <option value="active">Active &amp; Live on Airbnb</option>
            <option value="fully_occupied">Fully Occupied / Sold Out</option>
          </select>
        </div>
      </div>

      {/* 2. Core Financial Pricing & ROI Yield Values */}
      <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs uppercase font-extrabold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
            <DollarSign className="h-4 w-4" /> Property Pricing &amp; ROI Values
          </span>
          <button
            type="button"
            onClick={() => {
              const sum = editPropInventory.reduce((s, i) => s + (Number(i.costUsd) || 0), 0);
              if (sum > 0) {
                setEditPropPrice(String(sum));
                toast.success(`Total Setup Price synced to $${sum.toLocaleString()} USD from components`);
              }
            }}
            className="text-[11px] font-extrabold px-2.5 py-1 rounded-lg bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition-colors"
          >
            Sync Setup Cost from Components (${editPropInventory.reduce((s, i) => s + (Number(i.costUsd) || 0), 0).toLocaleString()})
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div>
            <label className="text-[11px] uppercase font-bold text-slate-600 dark:text-slate-300 block mb-1">Total Setup Cost ($)</label>
            <input
              type="number"
              value={editPropPrice}
              onChange={(e) => setEditPropPrice(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-sky-500/30 text-slate-900 dark:text-white font-black text-sm"
            />
          </div>
          <div>
            <label className="text-[11px] uppercase font-bold text-slate-600 dark:text-slate-300 block mb-1">Monthly Rent ($)</label>
            <input
              type="number"
              value={editPropRent}
              onChange={(e) => setEditPropRent(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-sky-500/30 text-emerald-600 dark:text-emerald-400 font-black text-sm"
            />
          </div>
          <div>
            <label className="text-[11px] uppercase font-bold text-slate-600 dark:text-slate-300 block mb-1">Nightly Rate ($)</label>
            <input
              type="number"
              value={editPropDailyRate}
              onChange={(e) => setEditPropDailyRate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-sky-500/30 text-sky-500 font-black text-sm"
            />
          </div>
          <div>
            <label className="text-[11px] uppercase font-bold text-slate-600 dark:text-slate-300 block mb-1">Annual Yield (%)</label>
            <input
              type="number"
              value={editPropYield}
              onChange={(e) => setEditPropYield(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-sky-500/30 text-teal-600 dark:text-teal-400 font-black text-sm"
            />
          </div>
        </div>
      </div>

      {/* 3. Utility & Bills Coverage Policy Editor */}
      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-sky-500/25 space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs uppercase font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            <Zap className="h-4 w-4 text-amber-500" />
            Utility &amp; Bills Coverage Policy ({editPropUtilityBills.length} bills included)
          </label>
          <button
            type="button"
            onClick={() => {
              setEditPropUtilityPolicy(DEFAULT_UTILITY_POLICY);
              setEditPropUtilityBills([...DEFAULT_UTILITY_BILLS]);
            }}
            className="text-[11px] font-bold text-sky-500 hover:underline"
          >
            Reset to Default Bills
          </button>
        </div>

        <div>
          <label className="text-[11px] uppercase font-bold text-slate-500 block mb-1">Coverage Policy Statement</label>
          <textarea
            rows={2}
            value={editPropUtilityPolicy}
            onChange={(e) => setEditPropUtilityPolicy(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {editPropUtilityBills.map((bill, idx) => (
            <div key={idx} className="flex items-center gap-2 p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              {getUtilityIcon(bill)}
              <input
                type="text"
                value={bill}
                onChange={(e) => {
                  const val = e.target.value;
                  setEditPropUtilityBills(prev => prev.map((b, i) => i === idx ? val : b));
                }}
                className="flex-1 bg-transparent text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setEditPropUtilityBills(prev => prev.filter((_, i) => i !== idx))}
                className="text-rose-500 hover:text-rose-600 p-1"
                title="Remove bill"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={newEditBillInput}
            onChange={(e) => setNewEditBillInput(e.target.value)}
            placeholder="Add another covered utility / bill (e.g. 24/7 Concierge Security)"
            className="flex-1 px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
          />
          <Button
            type="button"
            size="sm"
            onClick={() => {
              if (!newEditBillInput.trim()) return;
              setEditPropUtilityBills(prev => [...prev, newEditBillInput.trim()]);
              setNewEditBillInput('');
            }}
            className="bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl"
          >
            + Add Bill
          </Button>
        </div>
      </div>

      {/* 4. Physical Furnishings Breakdown (9 Components & Prices) Editor */}
      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-sky-500/25 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <label className="text-xs uppercase font-extrabold text-slate-800 dark:text-slate-200 block">
              Physical Furnishings Breakdown ({editPropInventory.length} Components)
            </label>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              Sum of Component Values: <strong className="text-emerald-600 dark:text-emerald-400">${editPropInventory.reduce((s, i) => s + (Number(i.costUsd) || 0), 0).toLocaleString()} USD</strong>
            </span>
          </div>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => setEditPropInventory(getRecommendedInventory(Number(editPropPrice) || 3000))}
            className="text-xs font-bold text-emerald-600 dark:text-emerald-400 border-emerald-500/30 shrink-0"
          >
            ⚡ Auto-Scale Component Prices to ${Number(editPropPrice || 0).toLocaleString()}
          </Button>
        </div>

        {/* Add New Component Row */}
        <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
          <input
            type="text"
            value={editCustomItemName}
            onChange={(e) => setEditCustomItemName(e.target.value)}
            placeholder="Component title (e.g. Coffee Station: Nespresso Setup)"
            className="sm:col-span-4 px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
          />
          <input
            type="text"
            value={editCustomItemDesc}
            onChange={(e) => setEditCustomItemDesc(e.target.value)}
            placeholder="Subtitle / description"
            className="sm:col-span-3 px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
          />
          <select
            value={editCustomItemCategory}
            onChange={(e) => setEditCustomItemCategory(e.target.value)}
            className="sm:col-span-2 px-2 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-medium"
          >
            <option value="Bedroom">Bedroom</option>
            <option value="Living Room">Living Room</option>
            <option value="Kitchen">Kitchen</option>
            <option value="Electronics">Electronics</option>
            <option value="Smart Tech">Smart Tech</option>
            <option value="Supplies">Supplies</option>
            <option value="Decor">Decor</option>
            <option value="Operations">Operations</option>
            <option value="Setup">Setup</option>
          </select>
          <input
            type="number"
            value={editCustomItemCost}
            onChange={(e) => setEditCustomItemCost(e.target.value)}
            placeholder="Price ($)"
            className="sm:col-span-2 px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-xs text-emerald-600 dark:text-emerald-400 font-bold"
          />
          <Button
            type="button"
            size="sm"
            onClick={() => {
              if (!editCustomItemName.trim()) {
                toast.error('Please enter a component name');
                return;
              }
              setEditPropInventory(prev => [
                ...prev,
                {
                  name: editCustomItemName.trim(),
                  category: editCustomItemCategory,
                  costUsd: Number(editCustomItemCost) || 0,
                  description: editCustomItemDesc.trim() || `${editCustomItemCategory} furnishing & setup item`,
                },
              ]);
              setEditCustomItemName('');
              setEditCustomItemCost('');
              setEditCustomItemDesc('');
            }}
            className="sm:col-span-1 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white h-8"
          >
            + Add
          </Button>
        </div>

        {/* Editable Component Rows */}
        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
          {editPropInventory.map((item, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2"
            >
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                <div className="sm:col-span-6 flex items-center gap-2">
                  {getCategoryIcon(item.category)}
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) => {
                      const val = e.target.value;
                      setEditPropInventory(prev => prev.map((it, i) => i === idx ? { ...it, name: val } : it));
                    }}
                    placeholder="Component Name"
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
                  />
                </div>
                <div className="sm:col-span-3">
                  <input
                    type="text"
                    value={item.category}
                    onChange={(e) => {
                      const val = e.target.value;
                      setEditPropInventory(prev => prev.map((it, i) => i === idx ? { ...it, category: val } : it));
                    }}
                    placeholder="Category (e.g. KITCHEN)"
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-xs uppercase font-bold text-slate-600 dark:text-slate-300"
                  />
                </div>
                <div className="sm:col-span-2 flex items-center gap-1">
                  <span className="text-emerald-500 font-black text-xs">$</span>
                  <input
                    type="number"
                    value={item.costUsd}
                    onChange={(e) => {
                      const val = Number(e.target.value) || 0;
                      setEditPropInventory(prev => prev.map((it, i) => i === idx ? { ...it, costUsd: val } : it));
                    }}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-emerald-500/40 text-xs font-black text-emerald-600 dark:text-emerald-400"
                  />
                </div>
                <div className="sm:col-span-1 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setEditPropInventory(prev => prev.filter((_, i) => i !== idx))}
                    className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10"
                    title="Delete component"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <input
                type="text"
                value={item.description || ''}
                onChange={(e) => {
                  const val = e.target.value;
                  setEditPropInventory(prev => prev.map((it, i) => i === idx ? { ...it, description: val } : it));
                }}
                placeholder="Component subtitle / description (e.g. Complimentary coffee bar setup designed for 5-star reviews)"
                className="w-full px-2.5 py-1 rounded-lg bg-slate-50/70 dark:bg-slate-950/60 border border-slate-200/70 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400"
              />
            </div>
          ))}
        </div>
      </div>

      {/* 5. Features & Description */}
      <div className="grid grid-cols-1 gap-3">
        <div>
          <label className="text-xs uppercase font-bold text-slate-500 dark:text-slate-400 block mb-1">
            Key Features &amp; Amenities (comma-separated)
          </label>
          <input
            type="text"
            value={editPropFeatures}
            onChange={(e) => setEditPropFeatures(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-sky-500/30 text-slate-900 dark:text-white text-xs"
          />
        </div>
        <div>
          <label className="text-xs uppercase font-bold text-slate-500 dark:text-slate-400 block mb-1">Description</label>
          <textarea
            rows={2}
            value={editPropDesc}
            onChange={(e) => setEditPropDesc(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-sky-500/30 text-slate-900 dark:text-white text-xs"
          />
        </div>
      </div>
    </div>

    <DialogFooter className="flex flex-col sm:flex-row gap-2">
      <Button
        variant="outline"
        onClick={() => setEditingPropertyFlat(null)}
        className="w-full sm:w-auto"
      >
        Cancel
      </Button>
      <Button
        onClick={() => {
          if (!editingPropertyFlat) return;
          if (!editPropTitle.trim() || !editPropLocation.trim()) {
            toast.error('Title and Location are required');
            return;
          }
          updatePropertyDetailsMutation.mutate({
            id: editingPropertyFlat.id,
            updates: {
              title: editPropTitle.trim(),
              unitType: editPropUnitType.trim(),
              location: editPropLocation.trim(),
              totalPriceUsd: Number(editPropPrice) || 3000,
              monthlyRentUsd: Number(editPropRent) || 550,
              dailyRateUsd: Number(editPropDailyRate) || 65,
              annualYieldPercent: Number(editPropYield) || 20,
              description: editPropDesc,
              features: editPropFeatures.split(',').map(s => s.trim()).filter(Boolean),
              status: editPropStatus,
              inventory: editPropInventory,
              utilityPolicyText: editPropUtilityPolicy,
              utilityBills: editPropUtilityBills.filter(Boolean),
            },
          });
        }}
        disabled={updatePropertyDetailsMutation.isPending}
        className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-extrabold"
      >
        {updatePropertyDetailsMutation.isPending ? 'Saving Changes...' : 'Save All Pricing & Values'}
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
      </div>
    </div>
  </Layout>
);
}

export default function PropertyInvestmentPage() {
  return (
    <Suspense fallback={null}>
      <PropertyInvestmentPageContent />
    </Suspense>
  );
}
