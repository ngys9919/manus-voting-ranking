import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { NotificationCenter } from "./NotificationCenter";
import { trpc } from "@/lib/trpc";

// Mock the trpc module
vi.mock("@/lib/trpc", () => ({
  trpc: {
    notifications: {
      getNotifications: {
        useQuery: vi.fn(),
      },
      getUnreadCount: {
        useQuery: vi.fn(),
      },
      markAsRead: {
        useMutation: vi.fn(),
      },
      markAllAsRead: {
        useMutation: vi.fn(),
      },
    },
    useUtils: vi.fn(),
  },
}));

describe("NotificationCenter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should display unread count badge", () => {
    const mockGetUnreadCount = vi.fn(() => ({
      data: 3,
      refetch: vi.fn(),
    }));

    const mockGetNotifications = vi.fn(() => ({
      data: [],
      refetch: vi.fn(),
    }));

    const mockMarkAllAsRead = vi.fn(() => ({
      mutate: vi.fn(),
    }));

    vi.mocked(trpc.notifications.getUnreadCount.useQuery).mockImplementation(
      mockGetUnreadCount
    );
    vi.mocked(trpc.notifications.getNotifications.useQuery).mockImplementation(
      mockGetNotifications
    );
    vi.mocked(trpc.notifications.markAllAsRead.useMutation).mockImplementation(
      mockMarkAllAsRead
    );

    render(<NotificationCenter />);

    // Check if badge shows the unread count
    const badge = screen.getByText("3");
    expect(badge).toBeInTheDocument();
  });

  it("should clear badge after marking all as read", async () => {
    let unreadCount = 3;
    let invalidateCalled = false;

    const mockGetUnreadCount = vi.fn(() => ({
      data: unreadCount,
      refetch: vi.fn(),
    }));

    const mockGetNotifications = vi.fn(() => ({
      data: [
        {
          id: 1n,
          userId: 1,
          weeklyChallenge: 1n,
          type: "top_3_ranking",
          title: "Test Notification",
          message: "You made top 3!",
          isRead: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      refetch: vi.fn(),
    }));

    const mockInvalidate = vi.fn(() => {
      unreadCount = 0;
    });

    const mockUseUtils = vi.fn(() => ({
      notifications: {
        getUnreadCount: {
          invalidate: mockInvalidate,
        },
      },
    }));

    const mockMarkAllAsRead = vi.fn((options: any) => ({
      mutate: vi.fn(() => {
        invalidateCalled = true;
        options.onSuccess?.();
      }),
    }));

    vi.mocked(trpc.notifications.getUnreadCount.useQuery).mockImplementation(
      mockGetUnreadCount
    );
    vi.mocked(trpc.notifications.getNotifications.useQuery).mockImplementation(
      mockGetNotifications
    );
    vi.mocked(trpc.notifications.markAllAsRead.useMutation).mockImplementation(
      mockMarkAllAsRead
    );
    vi.mocked(trpc.useUtils).mockImplementation(mockUseUtils);

    const { rerender } = render(<NotificationCenter />);

    // Click the bell to open notifications
    const bellButton = screen.getByRole("button", { name: /notifications/i });
    fireEvent.click(bellButton);

    // Wait for the dropdown to appear
    await waitFor(() => {
      expect(screen.getByText("Mark all as read")).toBeInTheDocument();
    });

    // Click "Mark all as read"
    const markAllButton = screen.getByText("Mark all as read");
    fireEvent.click(markAllButton);

    // Verify that invalidate was called
    expect(invalidateCalled).toBe(true);
    expect(mockInvalidate).toHaveBeenCalled();

    // Re-render with updated unread count
    unreadCount = 0;
    rerender(<NotificationCenter />);

    // Badge should not be visible anymore
    const badges = screen.queryAllByText(/^[0-9]+$/);
    expect(badges.length).toBe(0);
  });

  it("should show 9+ when unread count exceeds 9", () => {
    const mockGetUnreadCount = vi.fn(() => ({
      data: 15,
      refetch: vi.fn(),
    }));

    const mockGetNotifications = vi.fn(() => ({
      data: [],
      refetch: vi.fn(),
    }));

    const mockMarkAllAsRead = vi.fn(() => ({
      mutate: vi.fn(),
    }));

    vi.mocked(trpc.notifications.getUnreadCount.useQuery).mockImplementation(
      mockGetUnreadCount
    );
    vi.mocked(trpc.notifications.getNotifications.useQuery).mockImplementation(
      mockGetNotifications
    );
    vi.mocked(trpc.notifications.markAllAsRead.useMutation).mockImplementation(
      mockMarkAllAsRead
    );

    render(<NotificationCenter />);

    // Check if badge shows "9+"
    const badge = screen.getByText("9+");
    expect(badge).toBeInTheDocument();
  });
});
