import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  renderWithProviders,
  routerMocks,
  resetAllMocks,
  mockSuccessfulFetch,
  mockPendingFetch,
} from "../../../utils/test-utils";

// Mock next/navigation before importing the component
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(() => "/reset-password"),
  useSearchParams: jest.fn(),
}));

// Import component after mocks are set up
import ResetPasswordPage from "@/app/(auth)/reset-password/page";
import { useRouter, useSearchParams } from "next/navigation";

describe("Reset Password Page", () => {
  const mockToken = "valid-reset-token-123";

  beforeEach(() => {
    resetAllMocks();

    // Setup useRouter mock before each test
    (useRouter as jest.Mock).mockReturnValue({
      push: routerMocks.push,
      replace: routerMocks.replace,
      prefetch: routerMocks.prefetch,
      back: routerMocks.back,
      forward: routerMocks.forward,
      refresh: routerMocks.refresh,
    });

    // Setup useSearchParams mock with token by default
    (useSearchParams as jest.Mock).mockReturnValue(
      new URLSearchParams({ token: mockToken })
    );
  });

  describe("Token Validation", () => {
    it("shows invalid reset link message when no token is provided", () => {
      // Override the default mock to return no token
      (useSearchParams as jest.Mock).mockReturnValue(new URLSearchParams());

      renderWithProviders(<ResetPasswordPage />);

      expect(screen.getByText("Invalid Reset Link")).toBeInTheDocument();
      expect(
        screen.getByText(
          "This password reset link is invalid or has expired."
        )
      ).toBeInTheDocument();
      expect(screen.getByText("Request a new reset link")).toBeInTheDocument();
    });

    it("renders form when valid token is provided", () => {
      renderWithProviders(<ResetPasswordPage />);

      expect(screen.getByText("Set new password")).toBeInTheDocument();
      expect(screen.getByLabelText("New Password")).toBeInTheDocument();
      expect(
        screen.getByLabelText("Confirm new password")
      ).toBeInTheDocument();
    });

    it("includes token in hidden input field", () => {
      renderWithProviders(<ResetPasswordPage />);

      const hiddenTokenInput = document.querySelector(
        'input[name="token"]'
      ) as HTMLInputElement;
      expect(hiddenTokenInput).toBeInTheDocument();
      expect(hiddenTokenInput).toHaveAttribute("type", "hidden");
      expect(hiddenTokenInput).toHaveValue(mockToken);
    });
  });

  describe("Rendering", () => {
    it("renders reset password form with all required fields", () => {
      renderWithProviders(<ResetPasswordPage />);

      expect(screen.getByText("Set new password")).toBeInTheDocument();
      expect(
        screen.getByText("Enter your new password below.")
      ).toBeInTheDocument();
      expect(screen.getByLabelText("New Password")).toBeInTheDocument();
      expect(
        screen.getByLabelText("Confirm new password")
      ).toBeInTheDocument();

      expect(
        screen.getByRole("button", { name: /reset password/i })
      ).toBeInTheDocument();
    });

    it("renders back to login link", () => {
      renderWithProviders(<ResetPasswordPage />);

      const loginLink = screen.getByText("Back to login");
      expect(loginLink).toBeInTheDocument();
      expect(loginLink.closest("a")).toHaveAttribute("href", "/login");
    });

    it("has proper input attributes", () => {
      renderWithProviders(<ResetPasswordPage />);

      const passwordInput = screen.getByLabelText("New Password");
      expect(passwordInput).toHaveAttribute("type", "password");
      expect(passwordInput).toHaveAttribute("name", "password");
      expect(passwordInput).toHaveAttribute("autocomplete", "new-password");
      expect(passwordInput).toHaveAttribute("minlength", "8");
      expect(passwordInput).toBeRequired();

      const confirmPasswordInput = screen.getByLabelText(
        "Confirm new password"
      );
      expect(confirmPasswordInput).toHaveAttribute("type", "password");
      expect(confirmPasswordInput).toHaveAttribute("name", "confirmPassword");
      expect(confirmPasswordInput).toHaveAttribute(
        "autocomplete",
        "new-password"
      );
      expect(confirmPasswordInput).toBeRequired();
    });
  });

  describe("Form Submission", () => {
    it("submits form with valid password", async () => {
      const user = userEvent.setup();

      mockSuccessfulFetch({ message: "Password reset successful" });

      renderWithProviders(<ResetPasswordPage />);

      const passwordInput = screen.getByLabelText("New Password");
      const confirmPasswordInput = screen.getByLabelText(
        "Confirm new password"
      );
      const submitButton = screen.getByRole("button", {
        name: /reset password/i,
      });

      await user.type(passwordInput, "newpassword123");
      await user.type(confirmPasswordInput, "newpassword123");
      await user.click(submitButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith("/api/auth/reset-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            token: mockToken,
            password: "newpassword123",
          }),
        });
      });

      await waitFor(
        () => {
          expect(
            screen.getByText("Password reset successful!")
          ).toBeInTheDocument();
        },
        { timeout: 3000 }
      );
    });

    it("redirects to login after successful password reset", async () => {
      const user = userEvent.setup();

      mockSuccessfulFetch({ message: "Password reset successful" });

      renderWithProviders(<ResetPasswordPage />);

      const passwordInput = screen.getByLabelText("New Password");
      const confirmPasswordInput = screen.getByLabelText(
        "Confirm new password"
      );
      const submitButton = screen.getByRole("button", {
        name: /reset password/i,
      });

      await user.type(passwordInput, "newpassword123");
      await user.type(confirmPasswordInput, "newpassword123");
      await user.click(submitButton);

      await waitFor(
        () => {
          expect(routerMocks.push).toHaveBeenCalledWith("/login");
        },
        { timeout: 3000 }
      );
    });

    it("shows loading state during submission", async () => {
      const user = userEvent.setup();

      mockPendingFetch();
      renderWithProviders(<ResetPasswordPage />);

      const passwordInput = screen.getByLabelText("New Password");
      const confirmPasswordInput = screen.getByLabelText(
        "Confirm new password"
      );
      const submitButton = screen.getByRole("button", {
        name: /reset password/i,
      });

      await user.type(passwordInput, "newpassword123");
      await user.type(confirmPasswordInput, "newpassword123");
      await user.click(submitButton);

      expect(
        await screen.findByText("Resetting password...")
      ).toBeInTheDocument();
    });

    it("disables form inputs during submission", async () => {
      const user = userEvent.setup();

      mockPendingFetch();

      renderWithProviders(<ResetPasswordPage />);

      const passwordInput = screen.getByLabelText("New Password");
      const confirmPasswordInput = screen.getByLabelText(
        "Confirm new password"
      );
      const submitButton = screen.getByRole("button", {
        name: /reset password/i,
      });

      await user.type(passwordInput, "newpassword123");
      await user.type(confirmPasswordInput, "newpassword123");
      await user.click(submitButton);

      await waitFor(() => {
        expect(passwordInput).toBeDisabled();
        expect(confirmPasswordInput).toBeDisabled();
        expect(submitButton).toBeDisabled();
      });
    });
  });

  describe("Error Handling", () => {
    it("displays error message on password reset failure", async () => {
      const user = userEvent.setup();

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ error: "Invalid or expired token" }),
      });

      renderWithProviders(<ResetPasswordPage />);

      const passwordInput = screen.getByLabelText("New Password");
      const confirmPasswordInput = screen.getByLabelText(
        "Confirm new password"
      );
      const submitButton = screen.getByRole("button", {
        name: /reset password/i,
      });

      await user.type(passwordInput, "newpassword123");
      await user.type(confirmPasswordInput, "newpassword123");
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText("Invalid or expired token")
        ).toBeInTheDocument();
      });

      expect(submitButton).not.toBeDisabled();
    });

    it("displays generic error message on network failure", async () => {
      const user = userEvent.setup();

      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error("Network error")
      );

      renderWithProviders(<ResetPasswordPage />);

      const passwordInput = screen.getByLabelText("New Password");
      const confirmPasswordInput = screen.getByLabelText(
        "Confirm new password"
      );
      const submitButton = screen.getByRole("button", {
        name: /reset password/i,
      });

      await user.type(passwordInput, "newpassword123");
      await user.type(confirmPasswordInput, "newpassword123");
      await user.click(submitButton);

      await waitFor(
        () => {
          expect(
            screen.getByText("Network error. Please try again.")
          ).toBeInTheDocument();
        },
        { timeout: 5000 }
      );

      expect(submitButton).not.toBeDisabled();
    });

    it("displays fallback error message when API returns no error message", async () => {
      const user = userEvent.setup();

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({}),
      });

      renderWithProviders(<ResetPasswordPage />);

      const passwordInput = screen.getByLabelText("New Password");
      const confirmPasswordInput = screen.getByLabelText(
        "Confirm new password"
      );
      const submitButton = screen.getByRole("button", {
        name: /reset password/i,
      });

      await user.type(passwordInput, "newpassword123");
      await user.type(confirmPasswordInput, "newpassword123");
      await user.click(submitButton);

      await waitFor(
        () => {
          expect(
            screen.getByText("Password reset failed")
          ).toBeInTheDocument();
        },
        { timeout: 5000 }
      );

      expect(submitButton).not.toBeDisabled();
    });

    it("does not redirect on failed password reset", async () => {
      const user = userEvent.setup();

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ error: "Invalid token" }),
      });

      renderWithProviders(<ResetPasswordPage />);

      const passwordInput = screen.getByLabelText("New Password");
      const confirmPasswordInput = screen.getByLabelText(
        "Confirm new password"
      );
      const submitButton = screen.getByRole("button", {
        name: /reset password/i,
      });

      await user.type(passwordInput, "newpassword123");
      await user.type(confirmPasswordInput, "newpassword123");
      await user.click(submitButton);

      await waitFor(
        () => {
          expect(screen.getByText("Invalid token")).toBeInTheDocument();
        },
        { timeout: 5000 }
      );

      expect(routerMocks.push).not.toHaveBeenCalled();
    });
  });

  describe("Form Validation", () => {
    it("shows error when passwords do not match", async () => {
      const user = userEvent.setup();
      renderWithProviders(<ResetPasswordPage />);

      const passwordInput = screen.getByLabelText("New Password");
      const confirmPasswordInput = screen.getByLabelText(
        "Confirm new password"
      );
      const submitButton = screen.getByRole("button", {
        name: /reset password/i,
      });

      await user.type(passwordInput, "password123");
      await user.type(confirmPasswordInput, "password456");
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText("Passwords do not match")).toBeInTheDocument();
      });
    });

    it("shows error when password is too short", async () => {
      const user = userEvent.setup();
      renderWithProviders(<ResetPasswordPage />);

      const passwordInput = screen.getByLabelText("New Password");
      const confirmPasswordInput = screen.getByLabelText(
        "Confirm new password"
      );
      const submitButton = screen.getByRole("button", {
        name: /reset password/i,
      });

      await user.type(passwordInput, "pass");
      await user.type(confirmPasswordInput, "pass");
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText("Password must be at least 8 characters")
        ).toBeInTheDocument();
      });
    });

    it("requires password field", () => {
      renderWithProviders(<ResetPasswordPage />);

      const passwordInput = screen.getByLabelText("New Password");
      expect(passwordInput).toBeRequired();
    });

    it("requires confirm password field", () => {
      renderWithProviders(<ResetPasswordPage />);

      const confirmPasswordInput = screen.getByLabelText(
        "Confirm new password"
      );
      expect(confirmPasswordInput).toBeRequired();
    });
  });

  describe("Accessibility", () => {
    it("has proper labels for all form inputs", () => {
      renderWithProviders(<ResetPasswordPage />);

      expect(screen.getByLabelText("New Password")).toBeInTheDocument();
      expect(
        screen.getByLabelText("Confirm new password")
      ).toBeInTheDocument();
    });

    it("has proper button role and accessible name", () => {
      renderWithProviders(<ResetPasswordPage />);

      const submitButton = screen.getByRole("button", {
        name: /reset password/i,
      });
      expect(submitButton).toBeInTheDocument();
    });

    it("shows password requirements hint", () => {
      renderWithProviders(<ResetPasswordPage />);

      expect(
        screen.getByText("Must be at least 8 characters")
      ).toBeInTheDocument();
    });
  });

  describe("Success State", () => {
    it("disables form after successful reset", async () => {
      const user = userEvent.setup();

      mockSuccessfulFetch({ message: "Password reset successful" });

      renderWithProviders(<ResetPasswordPage />);

      const passwordInput = screen.getByLabelText("New Password");
      const confirmPasswordInput = screen.getByLabelText(
        "Confirm new password"
      );
      const submitButton = screen.getByRole("button", {
        name: /reset password/i,
      });

      await user.type(passwordInput, "newpassword123");
      await user.type(confirmPasswordInput, "newpassword123");
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText("Password reset successful!")
        ).toBeInTheDocument();
      });

      expect(passwordInput).toBeDisabled();
      expect(confirmPasswordInput).toBeDisabled();
      expect(submitButton).toBeDisabled();
    });

    it("shows redirecting message after success", async () => {
      const user = userEvent.setup();

      mockSuccessfulFetch({ message: "Password reset successful" });

      renderWithProviders(<ResetPasswordPage />);

      const passwordInput = screen.getByLabelText("New Password");
      const confirmPasswordInput = screen.getByLabelText(
        "Confirm new password"
      );
      const submitButton = screen.getByRole("button", {
        name: /reset password/i,
      });

      await user.type(passwordInput, "newpassword123");
      await user.type(confirmPasswordInput, "newpassword123");
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText("Redirecting to login...")).toBeInTheDocument();
      });
    });
  });
});