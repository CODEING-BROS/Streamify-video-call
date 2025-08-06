
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { signup } from "../lib/api"; 
import { toast } from "react-hot-toast";

const useSignup = () => {
  
    const queryClient = useQueryClient();

  const {
    mutate,
    isPending,
    error,
  } = useMutation({
    mutationFn: signup,
    onSuccess: async () => {
      // Invalidate and then wait for updated data to be available
      await queryClient.invalidateQueries({ queryKey: ["authUser"] });
      await queryClient.ensureQueryData({ queryKey: ["authUser"] });

      toast.success("Signup successful");
    },
  });

  return {
    signupMutation: mutate,
    isPending,
    error,
  };

}

export default useSignup
