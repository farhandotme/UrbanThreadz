"use client";

import axios from "axios";
import React, { useState, useEffect } from "react";
import { signOut, useSession } from "next-auth/react";
import { toast, Toaster } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Image from "next/image";

const addressSchema = z.object({
  street: z.string().min(1, "Street address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zipCode: z.string().min(1, "ZIP code is required"),
  landmark: z.string().optional(),
  country: z.string().min(1, "Country is required"),
});

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits").optional(),
  address: addressSchema,
  profileImage: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const defaultAddress = {
  street: "",
  city: "",
  state: "",
  zipCode: "",
  country: "",
};

const ProfilePage = () => {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [imageUrl, setImageUrl] = useState(session?.user?.image || "https://www.svgrepo.com/show/384670/account-avatar-profile-user.svg");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty, isSubmitting },
    setValue,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: defaultAddress,
      profileImage: session?.user?.image || "https://www.svgrepo.com/show/384670/account-avatar-profile-user.svg",
    },
  });

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError("");
      try {
        const { data } = await axios.get("/api/users/profile");
        const userProfile = {
          name: data.name || session?.user?.name || "",
          email: data.email || session?.user?.email || "",
          phone: data.phone || "",
          address: {
            street: data.address?.street || "",
            city: data.address?.city || "",
            state: data.address?.state || "",
            zipCode: data.address?.zipCode || "",
            country: data.address?.country || "",
          },
          profileImage: session?.user?.image || data.profileImage || "https://www.svgrepo.com/show/384670/account-avatar-profile-user.svg",
        };
        reset(userProfile);
        setImageUrl(userProfile.profileImage);
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          setError("You must be logged in to view your profile.");
        } else {
          setError(`Could not load profile : ${error}`);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [reset, session]);

  const onSubmit = async (data: ProfileFormData) => {
    try {
      const response = await axios.put("/api/users/profile", {
        ...data,
        profileImage: session?.user?.image || data.profileImage,
      });
      toast.success("Profile updated successfully");
      reset(response.data);
    } catch (error) {
      toast.error("Failed to update profile");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) return;
    setDeleting(true);
    try {
      await axios.delete("/api/users/profile");
      toast.success("Account deleted successfully");
      await signOut({ callbackUrl: "/" });
    } catch (error) {
      toast.error("Failed to delete account");
    } finally {
      setDeleting(false);
    }
  };

  const FormField = ({ 
    label, 
    name, 
    type = "text",
    required = false,
    error = "",
    placeholder = "",
  }: { 
    label: string;
    name: string;
    type?: string;
    required?: boolean;
    error?: string;
    placeholder?: string;
  }) => (
    <div className="group">
      <label className="block text-sm font-medium mb-2 text-black dark:text-white transition-colors duration-200">
        {label} {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        {...register(name as any)}
        className={`w-full px-4 py-3 rounded-lg border-2 transition-all duration-200 
          bg-white dark:bg-black 
          text-black dark:text-white 
          placeholder-gray-400 dark:placeholder-gray-500
          ${error 
            ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20' 
            : 'border-gray-200 dark:border-gray-700 focus:border-black dark:focus:border-white hover:border-gray-300 dark:hover:border-gray-600'
          }
          focus:outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10`}
      />
      {error && (
        <p className="text-sm text-red-500 mt-1 animate-in slide-in-from-top-1 duration-200">
          {error}
        </p>
      )}
    </div>
  );

  const LoadingSpinner = () => (
    <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center transition-colors duration-300">
      <div className="text-center">
        <div className="w-12 h-12 border-2 border-gray-200 dark:border-gray-700 border-t-black dark:border-t-white rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400 text-sm">Loading your profile...</p>
      </div>
    </div>
  );

  const ErrorState = () => (
    <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center transition-colors duration-300">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold mb-4 text-black dark:text-white">Something went wrong</h2>
        <p className="text-gray-600 dark:text-gray-400">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-6 px-6 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors duration-200"
        >
          Try Again
        </button>
      </div>
    </div>
  );

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorState />;

  return (
    <>
      <Toaster 
        theme="system"
        toastOptions={{
          style: {
            background: 'var(--background)',
            color: 'var(--foreground)',
            border: '1px solid var(--border)',
          },
        }}
      />
      
      <div className="min-h-screen bg-white dark:bg-black transition-colors duration-300 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-8">
            <div className="relative w-24 h-24 mx-auto mb-4 group">
              <div className="w-full h-full rounded-full overflow-hidden border-3 border-black dark:border-white transition-all duration-300 group-hover:scale-105">
                <Image
                  src={imageUrl}
                  alt="Profile"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/10 dark:group-hover:bg-white/10 transition-all duration-300"></div>
            </div>
            <h1 className="text-3xl font-bold text-black dark:text-white mb-2 tracking-tight">
              Account Settings
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage your personal information and preferences
            </p>
            <div className="w-16 h-1 bg-black dark:bg-white mx-auto mt-4 rounded-full"></div>
          </div>

          {/* Main Form Card */}
          <div className="bg-white dark:bg-black border-2 border-black dark:border-white rounded-2xl shadow-2xl transition-all duration-300 overflow-hidden">
            <div className="p-8">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
                
                {/* Personal Information Section */}
                <section>
                  <div className="flex items-center mb-6">
                    <div className="w-2 h-8 bg-black dark:bg-white rounded-full mr-4"></div>
                    <h2 className="text-xl font-semibold text-black dark:text-white">
                      Personal Information
                    </h2>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      label="Full Name"
                      name="name"
                      required
                      error={errors.name?.message}
                      placeholder="Enter your full name"
                    />
                    <FormField
                      label="Email Address"
                      name="email"
                      type="email"
                      required
                      error={errors.email?.message}
                      placeholder="your@email.com"
                    />
                    <FormField
                      label="Phone Number"
                      name="phone"
                      error={errors.phone?.message}
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>
                </section>

                {/* Address Section */}
                <section>
                  <div className="flex items-center mb-6">
                    <div className="w-2 h-8 bg-black dark:bg-white rounded-full mr-4"></div>
                    <h2 className="text-xl font-semibold text-black dark:text-white">
                      Shipping Address
                    </h2>
                  </div>
                  
                  <div className="space-y-6">
                    <FormField
                      label="Street Address"
                      name="address.street"
                      required
                      error={errors.address?.street?.message}
                      placeholder="123 Main Street, Apt 4B"
                    />
                    
                    <FormField
                      label="Landmark"
                      name="address.landmark"
                      error={errors.address?.landmark?.message}
                      placeholder="Near Central Park, Behind Shopping Mall, etc."
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        label="City"
                        name="address.city"
                        required
                        error={errors.address?.city?.message}
                        placeholder="New York"
                      />
                      <FormField
                        label="State/Province"
                        name="address.state"
                        required
                        error={errors.address?.state?.message}
                        placeholder="NY"
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        label="ZIP/Postal Code"
                        name="address.zipCode"
                        required
                        error={errors.address?.zipCode?.message}
                        placeholder="10001"
                      />
                      <div className="group">
                        <label className="block text-sm font-medium mb-2 text-black dark:text-white transition-colors duration-200">
                          Country <span className="text-red-500 ml-1">*</span>
                        </label>
                        <input
                          type="text"
                          value="India"
                          disabled
                          className="w-full px-4 py-3 rounded-lg border-2 transition-all duration-200 
                            bg-gray-100 dark:bg-gray-800 
                            text-gray-700 dark:text-gray-300 
                            border-gray-200 dark:border-gray-700
                            cursor-not-allowed"
                        />
                      </div>
                    </div>
                  </div>
                </section>

                {/* Action Buttons */}
                <div className="pt-8 border-t-2 border-gray-100 dark:border-gray-800">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <button
                      type="submit"
                      disabled={!isDirty || isSubmitting}
                      className="flex-1 py-4 px-6 bg-black dark:bg-white text-white dark:text-black rounded-xl font-semibold 
                        transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]
                        disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
                        focus:outline-none focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20 focus:ring-offset-2
                        hover:shadow-lg disabled:hover:shadow-none"
                    >
                      {isSubmitting ? (
                        <span className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Saving Changes...
                        </span>
                      ) : (
                        "Save Changes"
                      )}
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => signOut({ callbackUrl: "/" })}
                      className="flex-1 py-4 px-6 bg-white dark:bg-black text-black dark:text-white rounded-xl font-semibold 
                        border-2 border-black dark:border-white transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]
                        focus:outline-none focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20 focus:ring-offset-2
                        hover:bg-gray-50 dark:hover:bg-gray-900 hover:shadow-lg"
                    >
                      Sign Out
                    </button>
                    
                    <button
                      type="button"
                      onClick={handleDelete}
                      disabled={deleting}
                      className="flex-1 py-4 px-6 bg-red-500 text-white rounded-xl font-semibold 
                        transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]
                        hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
                        focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:ring-offset-2
                        hover:shadow-lg disabled:hover:shadow-none"
                    >
                      {deleting ? (
                        <span className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Deleting...
                        </span>
                      ) : (
                        "Delete Account"
                      )}
                    </button>
                  </div>
                  
                  <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-4">
                    Changes are saved automatically to your account
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProfilePage;