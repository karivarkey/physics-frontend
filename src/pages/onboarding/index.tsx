"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axiosInstance from "@/lib/axios";
import { onboardingSchema } from "./schema";
// 👇 Import the new structured data and types
import { allowedCombinations,type Division } from "./classData"; 
import { useNavigate } from "react-router-dom";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import toast from "react-hot-toast";
import { auth } from "@/lib/firebase";

type FormData = z.infer<typeof onboardingSchema>;

export default function OnboardingPage() {
  // State to hold the divisions available for the selected branch
  const [availableDivisions, setAvailableDivisions] = useState<Division[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      email: auth?.currentUser?.email || "error displaying email",
    },
  });

  // Watch the 'branch' field to reactively disable the division dropdown
  const selectedBranchCode = watch("branch");
  const navigate = useNavigate();

  const handleBranchChange = (branchCode: string) => {
    // 1. Set the branch value in the form
    setValue("branch", branchCode, { shouldValidate: true });
    // 2. Reset the division value since the branch has changed
    setValue("division", "", { shouldValidate: true });

    // 3. Find the selected branch's data
    const selectedBranchData = allowedCombinations.find(
      (b) => b.code === branchCode
    );

    // 4. Update the available divisions state
    setAvailableDivisions(selectedBranchData?.divisions || []);
  };

  const onSubmit = (data: FormData) => {
    // 👇 Logic is now simpler: combine if division exists, otherwise just use branch code
    const payload = {
      ...data,
      class_code: data.division ? `${data.branch}${data.division}` : data.branch,
    };

    axiosInstance.post("/user/onboard", payload)
      .then(() => {
        toast.success("Onboarding completed successfully!");
        navigate('/home');

      })
      .catch((error) => {
        toast.error("Error occurred during onboarding.");
        console.error("Error:", error);
      });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-tr from-gray-50 to-gray-200 p-4">
      <Card className="w-full max-w-lg shadow-lg">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold">
            Welcome to Rajagiri 🚀
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            {/* Name, Roll, Email Inputs (unchanged) */}
            <div>
              <label className="block text-sm font-medium">Name</label>
              <Input {...register("name")} placeholder="John Doe" />
              {errors.name && (
                <p className="text-red-500 text-sm">{errors.name.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium">Roll Number</label>
              <Input
                type="number"
                {...register("roll", { valueAsNumber: true })}
                placeholder="1-75"
              />
              {errors.roll && (
                <p className="text-red-500 text-sm">{errors.roll.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium">Email</label>
              <Input {...register("email")} disabled />
            </div>

            {/* Branch Select */}
            <div>
              <label className="block text-sm font-medium">Branch</label>
              <Select onValueChange={handleBranchChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Branch" />
                </SelectTrigger>
                <SelectContent>
                  {allowedCombinations.map((b) => (
                    <SelectItem key={b.code} value={b.code}>
                      {b.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.branch && (
                <p className="text-red-500 text-sm">{errors.branch.message}</p>
              )}
            </div>

            {/* Division Select (Now dynamic) */}
            <div>
              <label className="block text-sm font-medium">Division</label>
              <Select
                onValueChange={(v) => setValue("division", v, { shouldValidate: true })}
                // 👇 Disable if no branch is selected or the selected branch has no divisions
                disabled={!selectedBranchCode || availableDivisions.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Division" />
                </SelectTrigger>
                <SelectContent>
                  {availableDivisions.map((d) => (
                    <SelectItem key={d.code} value={d.code}>
                      {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.division && (
                <p className="text-red-500 text-sm">{errors.division.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full">
              Complete Onboarding
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}