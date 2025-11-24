import { isToday, isYesterday, subDays, isAfter } from "date-fns";

export type HistoryItem = {
  chatId: string;
  title: string;
  paperId: string;
  paperTitle: string;
  createdAt: string; // Ensure your API returns this
};

export type GroupedHistory = {
  label: string;
  items: HistoryItem[];
};

export function groupChatsByDate(chats: HistoryItem[]): GroupedHistory[] {
  const groups: Record<string, HistoryItem[]> = {
    Today: [],
    Yesterday: [],
    "Previous 7 Days": [],
    "Older": [],
  };

  chats.forEach((chat) => {
    const date = new Date(chat.createdAt);
    if (isToday(date)) {
      groups["Today"].push(chat);
    } else if (isYesterday(date)) {
      groups["Yesterday"].push(chat);
    } else if (isAfter(date, subDays(new Date(), 7))) {
      groups["Previous 7 Days"].push(chat);
    } else {
      groups["Older"].push(chat);
    }
  });

  // Convert to array and filter empty groups
  return Object.entries(groups)
    .map(([label, items]) => ({ label, items }))
    .filter((group) => group.items.length > 0);
}