"use client";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Loader2, Check, AlertCircle, AtSign } from "lucide-react";
import api from "@/utils/axios";
import useDebounce from "@/hooks/useDebounce";
import axios from "axios";
import { useRouter } from "next/navigation";

const checkUsernameAvailability = async (username: string) => {
  const res = await api.post("/api/users/checkUsernameAvailability", {
    username,
  });
  console.log(res);
  if (res.data.data.available) {
    return true;
  }
};

export default function Username() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState<boolean | null>(false);
  const [isCheckingUsername, setIsCheckingUsername] = useState<boolean | null>(
    false
  );
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(
    null
  );
  const [serverError, setServerError] = useState<string | null>(null);

  // React Hook Form setup
  const {
    register,
    handleSubmit,
    watch,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm({
    mode: "onChange",
    defaultValues: {
      username: "",
    },
  });

  // Watch the username input for changes to trigger availability check
  const usernameValue = watch("username");

  // debounce hook to call api only after 800ms user stopped typing
  const debounceValue = useDebounce(usernameValue, 800);
  // indicate user is typing (before debounce settles) and eligible to check
  const isDebouncing =
    !!usernameValue &&
    usernameValue.length >= 3 &&
    usernameValue !== debounceValue;
  // Debounce logic for checking username availability
  useEffect(() => {
    const checkAvailability = async () => {
      if (!debounceValue || debounceValue.length < 3) {
        setUsernameAvailable(null);
        return;
      }

      setIsCheckingUsername(true);
      setServerError(null);
      setUsernameAvailable(null);
      clearErrors("username");

      try {
        const isAvailable = await checkUsernameAvailability(debounceValue);

        if (isAvailable) {
          setUsernameAvailable(true);
        } else {
          setUsernameAvailable(false);
          setError("username", {
            type: "manual",
            message: "This username is already taken.",
          });
        }
      } catch (error) {
        console.error("Error checking username", error);
      } finally {
        setIsCheckingUsername(false);
      }
    };
    checkAvailability();
  }, [debounceValue, setError, clearErrors]);

  const onSubmit = async (form: { username: string }) => {
    if (usernameAvailable === false) return; // Prevent submit if taken

    setServerError(null);
    setIsSubmitting(true);

    try {
      await api.post("/api/users/addUsername", { username: form.username });
      router.push("/onboarding/picture");
      // Optionally navigate to next onboarding step here
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        const message =
          (err.response?.data as { message?: string })?.message ||
          "Failed to save username. Please try again.";

        if (status === 409) {
          // Username conflict from server
          setError("username", {
            type: "server",
            message: message.includes("Username")
              ? message
              : "This username is already taken.",
          });
        } else if (status && status >= 400 && status < 500) {
          setError("username", { type: "server", message });
        } else {
          setServerError("Server temporarily unavailable. Please try again.");
        }
      } else {
        setServerError("Network error. Please check your connection.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-full max-w-md bg-white text-black shadow-xl rounded-2xl p-8 animate-in fade-in zoom-in duration-300">
        {/* Header Section */}
        <h2 className="text-2xl font-semibold text-center mb-2">
          Choose a Username
        </h2>
        <p className="text-center text-gray-500 text-sm mb-6">
          This will be your public handle. You can adjust later.
        </p>

        {serverError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded-lg mb-4 text-sm text-center">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Username Input */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1.5 ml-1">
              Username
            </label>

            <div className="relative">
              {/* Icon Prefix */}
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <AtSign size={18} />
              </div>

              <input
                type="text"
                placeholder="username"
                autoComplete="off"
                {...register("username", {
                  required: "Username is required",
                  minLength: {
                    value: 3,
                    message: "Username must be at least 3 characters",
                  },
                  pattern: {
                    value: /^[a-zA-Z0-9_]+$/,
                    message: "Only letters, numbers, and underscores allowed",
                  },
                })}
                className={`w-full pl-10 pr-10 border rounded-lg px-3 py-2 outline-none transition-all duration-200
                  ${
                    errors.username
                      ? "border-red-500 focus:ring-2 focus:ring-red-100 focus:border-red-500"
                      : usernameAvailable
                      ? "border-green-500 focus:ring-2 focus:ring-green-100 focus:border-green-500"
                      : "border-gray-300 focus:ring-2 focus:ring-black focus:border-black"
                  }
                `}
              />

              {/* Status Icons (Right Side) */}
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                {(isDebouncing || isCheckingUsername) && (
                  <Loader2 size={18} className="animate-spin text-gray-400" />
                )}
                {!isDebouncing &&
                  !isCheckingUsername &&
                  usernameAvailable === true && (
                    <Check size={18} className="text-green-500" />
                  )}
                {!isDebouncing && !isCheckingUsername && errors.username && (
                  <AlertCircle size={18} className="text-red-500" />
                )}
              </div>
            </div>

            {/* Validation Message */}
            {errors.username ? (
              <p className="text-red-500 text-sm mt-1.5 flex items-center">
                {errors.username.message}
              </p>
            ) : isDebouncing || isCheckingUsername ? (
              <p className="text-gray-500 text-sm mt-1.5" aria-live="polite">
                Checking availability...
              </p>
            ) : usernameAvailable ? (
              <p className="text-green-600 text-sm mt-1.5">
                That username is available!
              </p>
            ) : (
              <p className="text-gray-400 text-xs mt-1.5">
                Use letters, numbers, and underscores.
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={
              isSubmitting ||
              isDebouncing ||
              isCheckingUsername ||
              !!errors.username ||
              !usernameAvailable
            }
            className="w-full bg-black text-white rounded-lg py-2 font-semibold hover:opacity-90 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={20} className="mr-2 animate-spin" />
                Saving username...
              </>
            ) : (
              "Continue"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
