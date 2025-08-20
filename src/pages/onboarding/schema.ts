import { z } from "zod";
import { allowedCombinations } from "./classData"; // Adjust path if needed

export const onboardingSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters."),
    roll: z.number().min(1, "Roll number is required.").max(75, "Roll number must be between 1 and 75."),
    email: z.string().email(),
    branch: z.string().nonempty("Please select a branch."),
    // Division is now optional, as some branches don't have one
    division: z.string().optional(),
  })
  .refine(
    (data) => {
      // Find the selected branch in our data source
      const selectedBranch = allowedCombinations.find(
        (b) => b.code === data.branch
      );

      // If the branch has divisions, a division must be selected
      if (selectedBranch && selectedBranch.divisions.length > 0) {
        return !!data.division; // Return true only if division is not empty
      }

      // If the branch has no divisions, this check passes
      return true;
    },
    {
      // Custom error message if the refinement fails
      message: "Please select a division for this branch.",
      path: ["division"], // Specify that this error applies to the 'division' field
    }
  );