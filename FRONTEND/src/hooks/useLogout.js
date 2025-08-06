import { useMutation, useQueryClient } from "@tanstack/react-query";
import { logout } from "../lib/api";
import toast from "react-hot-toast";

const useLogout = () => {
  const queryClient = useQueryClient();

  const { mutate } = useMutation({
    mutationFn: logout,
    onSuccess: async () => {
      // Invalidate and then wait for updated data to be available
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
      toast.success("Logout successful");
    }
  });

  return { logoutMutation: mutate };
}

export default useLogout
