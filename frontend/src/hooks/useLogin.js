import { useMutation, useQueryClient } from "@tanstack/react-query";
import { login } from "../lib/api";
import { toast } from "react-hot-toast";



const useLogin = () => {

    const queryClient = useQueryClient();

    const { mutate , isPending , error } = useMutation({
    mutationFn: login,
    onSuccess: async () => {
      // Invalidate and then wait for updated data to be available
      await queryClient.invalidateQueries({ queryKey: ["authUser"] });

      toast.success("Login successful");
    },
    onError: (error) => {
      toast.error(error.response.data.message);
    },
  });
  return {
    loginMutation: mutate,
    isPending,
    error,
  };
}

export default useLogin
