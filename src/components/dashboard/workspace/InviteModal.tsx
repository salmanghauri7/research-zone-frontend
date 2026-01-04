"use client"
import { useState } from "react"
import workspaceApi from "@/api/workspaceApi"

interface InviteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSendInvite: (email: string, description: string) => void;
    workspaceId: string;
}

export default function InviteModal({ isOpen, onClose, onSendInvite, workspaceId }: InviteModalProps) {
    const [email, setEmail] = useState("");
    const [description, setDescription] = useState("");

    if (!isOpen) return null;

    const handleSend = async() => {
        try{
        const response = await workspaceApi.sendInvite(email, description, workspaceId);
        }catch(error){
            console.log(error);
        }
        setEmail("");
        setDescription("");
    };

    const handleClose = () => {
        onClose();
        setEmail("");
        setDescription("");
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4"
            onClick={handleClose}
        >
            {/* Backdrop with blur effect */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm dark:bg-black/80" />

            {/* Modal Container */}
            <div
                className="relative w-full max-w-lg transform transition-all"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="bg-white dark:bg-black rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                    {/* Header */}
                    <div className="px-8 pt-8 ">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                Send Workspace Invite
                            </h2>
                            <button
                                onClick={handleClose}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                            Invite a collaborator to join your workspace
                        </p>
                    </div>

                    {/* Form Content */}
                    <div className="px-8 py-6 space-y-6">
                        {/* Email Input */}
                        <div className="space-y-2">
                            <label
                                htmlFor="invite-email"
                                className="block text-sm font-semibold text-gray-700 dark:text-gray-300"
                            >
                                Email Address
                            </label>
                            <input
                                type="email"
                                id="invite-email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="colleague@example.com"
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-black border border-gray-300 dark:border-gray-700 rounded-xl 
                                         text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500
                                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                                         transition-all duration-200"
                            />
                        </div>

                        {/* Description Textarea */}
                        <div className="space-y-2">
                            <label
                                htmlFor="invite-description"
                                className="block text-sm font-semibold text-gray-700 dark:text-gray-300"
                            >
                                Invitation Message
                            </label>
                            <textarea
                                id="invite-description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Add a personal message to your invitation..."
                                rows={5}
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-black border border-gray-300 dark:border-gray-700 rounded-xl 
                                         text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500
                                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                                         transition-all duration-200 resize-none"
                            />
                        </div>
                    </div>

                    {/* Footer with Buttons */}
                    <div className="px-8 pb-5 bg-gray-50 dark:bg-black/50 ">
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={handleClose}
                                className="px-6 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-300 
                                         bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 
                                         rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 
                                         transition-all duration-200 shadow-sm"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSend}
                                disabled={!email.trim()}
                                className="px-6 py-2.5 text-sm font-semibold text-white 
                                         bg-gradient-to-r from-blue-600 to-blue-500 
                                         rounded-lg hover:from-blue-700 hover:to-blue-600 
                                         disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed
                                         transition-all duration-200 shadow-lg shadow-blue-500/30 
                                         hover:shadow-xl hover:shadow-blue-500/40"
                            >
                                Send Invite
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
