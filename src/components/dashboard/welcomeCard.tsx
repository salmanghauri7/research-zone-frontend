"use client";

import Image from "next/image";

export default function WelcomeCard() {
  return (
    <div className="bg-white dark:bg-[var(--bg-card-dark)] rounded-3xl px-6 w-full shadow-sm border border-gray-100 dark:border-gray-800 flex items-center justify-between ">
      <div className="flex-1">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">
          Welcome to Research Zone!
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-lg max-w-xl">
          Simplify your research, together.
        </p>

        <div className="mt-5 text-white flex gap-4">
          <button className="p-3 bg-indigo-500 dark:bg-gray-800  rounded-3xl ">
            Discover Papers
          </button>
          <button className="p-3 bg-indigo-500 dark:bg-gray-800  rounded-3xl">
            Create new Workspace
          </button>
        </div>
      </div>
      <div className="ml-8 flex-shrink-0">
        <Image
          src="/robot-arm-illustration.svg"
          alt="Robot illustration"
          width={200}
          height={200}
          className="object-contain"
          priority
        />
      </div>
    </div>
  );
}
