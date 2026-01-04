"use client"
import { useState, useEffect } from "react"
import workspaceApi from "@/api/workspaceApi"
import InviteModal from "./InviteModal"
import { useParams } from "next/navigation";



export default function WorkSpace() {
    const [workspaceId, setWorkspaceId] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // get the workspace id from params 
    const { id } = useParams();

    // Use useEffect to set workspaceId only once when component mounts or id changes
    useEffect(() => {
        if (id) {
            console.log("this is workspace id:", id);
            setWorkspaceId(id as string);
        }
    }, [id]);

    const handleSendInvite = (email: string, description: string) => {
        // TODO: Implement send invite logic here
        console.log("Sending invite to:", email, "with description:", description);
        setIsModalOpen(false);
    };

    return (
        <div className="text-black dark:text-white">
            <h1>this is workspace page</h1>
            <button
                onClick={() => setIsModalOpen(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
            >
                Invite for workspace
            </button>

            {workspaceId && (
                <InviteModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSendInvite={handleSendInvite}
                    workspaceId={workspaceId}
                />
            )}
        </div>
    )
}