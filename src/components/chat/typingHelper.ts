/**
 * Format typing users array into readable text
 * Examples:
 * - [] => ""
 * - ["Alice"] => "Alice is typing"
 * - ["Alice", "Bob"] => "Alice & Bob are typing"
 * - ["Alice", "Bob", "Charlie"] => "3 people are typing"
 */
export const getTypingText = (users: string[]): string => {
    if (users.length === 0) return "";
    if (users.length === 1) return `${users[0]} is typing`;
    if (users.length === 2) return `${users[0]} & ${users[1]} are typing`;
    if (users.length > 2) return `${users.length} people are typing`;
    return "";
};
