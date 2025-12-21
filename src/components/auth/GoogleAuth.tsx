// "use client";
// import { useGoogleLogin, TokenResponse } from "@react-oauth/google";
// import { useState } from "react";
// import { FcGoogle } from "react-icons/fc";

// const GoogleAuth = ({ authType }: { authType: string }) => {
//   const [isGoogleLoading, setIsGoogleLoading] = useState<boolean | null>(null);

//   const googleAuth = useGoogleLogin({
//     flow: "auth-code",
//     onSuccess: (response: TokenResponse) => {
//       console.log(response);
//       setIsGoogleLoading(true);
//     },
//     onError: () => console.log("failed"),
//   });

//   return (
//     <button
//       type="button"
//       onClick={() => googleAuth()}
//       className="w-full flex items-center justify-center border border-gray-300 rounded-lg py-2 hover:bg-gray-100 transition cursor-pointer"
//     >
//       <FcGoogle size={22} className="mr-2" />
//       {authType} with Google
//     </button>
//   );
// };

// export default GoogleAuth;
