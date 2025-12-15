// tests/pages/Login.test.tsx
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  renderWithProviders,
  createMockUser,
  routerMocks,
  resetAllMocks,
  mockSuccessfulFetch,
  mockPendingFetch,
} from "../../../utils/test-utils";

// Mock next/navigation before importing the component
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(() => "/login"),
  useSearchParams: jest.fn(() => new URLSearchParams()),
}));

// Import component after mocks are set up
import VerifyEmail from "@/app/(auth)/verify-email/page";
import { useRouter } from "next/navigation";

describe("Login Page", () => {
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
  });

  describe("Rendering", () => {
    it("renders login form with all required fields", () => {
      renderWithProviders(<VerifyEmail />);

      expect(screen.getByText("Verify your email")).toBeInTheDocument();
      expect(screen.getByLabelText("Email Address")).toBeInTheDocument();
      expect(screen.getByLabelText("Verification code")).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /verify email/i })
      ).toBeInTheDocument();
    });


    it("renders back to login link", () => {
      renderWithProviders(<VerifyEmail />);

      const signUpLink = screen.getByText("Back to login");
      expect(signUpLink).toBeInTheDocument();
      expect(signUpLink.closest("a")).toHaveAttribute("href", "/login");
    });

    it("has proper input attributes", () => {
      renderWithProviders(<VerifyEmail />);

      const emailInput = screen.getByLabelText("Email Address");
      expect(emailInput).toHaveAttribute("type", "email");
      expect(emailInput).toHaveAttribute("name", "email");
      expect(emailInput).toHaveAttribute("autocomplete", "email");
      expect(emailInput).toBeRequired();

      const otpInput = screen.getByLabelText("Verification code");
      expect(otpInput).toHaveAttribute("type", "text");
      expect(otpInput).toHaveAttribute("name", "otp");
      expect(otpInput).toBeRequired();
    });
  });

  describe("Form Submission", () => {
    it("submits form with valid credentials", async () => {
      const user = userEvent.setup();
      const mockUser = createMockUser({
        email: "test@example.com",
      });

      mockSuccessfulFetch({ user: mockUser });

      renderWithProviders(
        <VerifyEmail />
      );

      const emailInput = screen.getByLabelText("Email Address");
      const otpInput = screen.getByLabelText("Verification code");
      const submitButton = screen.getByRole("button", { name: /verify email/i });

      await user.type(emailInput, "test@example.com");
      await user.type(otpInput, "123456");
      await user.click(submitButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith("/api/auth/verify-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "test@example.com",
            otp: "123456",
          })
        });
      });

      await waitFor(() => {
        expect(routerMocks.push).toHaveBeenCalledWith("/login");
      },{
        timeout:3000
      });
    });

    it("shows loading state during submission", async () => {
      const user = userEvent.setup();

      mockPendingFetch();
      renderWithProviders(<VerifyEmail />);

      const emailInput = screen.getByLabelText("Email Address");
      const otpInput = screen.getByLabelText("Verification code");
      const submitButton = screen.getByRole("button", { name: /verify email/i });

      await user.type(emailInput, "test@example.com");
      await user.type(otpInput, "123456");
      await user.click(submitButton);

      // Check for loading text
      expect(await screen.findByText("Verifying...")).toBeInTheDocument();
    });

    it("disables form inputs during submission", async () => {
      const user = userEvent.setup();

      mockPendingFetch();

      renderWithProviders(<VerifyEmail />);

      const emailInput = screen.getByLabelText("Email Address");
      const otpInput = screen.getByLabelText("Verification code");
      const submitButton = screen.getByRole("button", { name: /verify email/i });

      await user.type(emailInput, "test@example.com");
      await user.type(otpInput, "123456");
      await user.click(submitButton);

      // Inputs should be disabled during submission
      await waitFor(() => {
        expect(emailInput).toBeDisabled();
        expect(otpInput).toBeDisabled();
        expect(submitButton).toBeDisabled();
      });
    });
  });

  describe("Error Handling", () => {
    it("displays error message on login failure", async () => {
      const user = userEvent.setup();

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ error: "Invalid credentials" }),
      });

      renderWithProviders(<VerifyEmail />);

      const emailInput = screen.getByLabelText("Email Address");
      const otpInput = screen.getByLabelText("Verification code");
      const submitButton = screen.getByRole("button", { name: /verify email/i });

      await user.type(emailInput, "wrong@example.com");
      await user.type(otpInput, "wrongpassword");

      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText("Invalid credentials")).toBeInTheDocument();
      });

      expect(submitButton).not.toBeDisabled();
    });

    it("displays generic error message on network failure", async () => {
      const user = userEvent.setup();

      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error("Network error")
      );

      renderWithProviders(<VerifyEmail />);

      const emailInput = screen.getByLabelText("Email Address");
      const otpInput = screen.getByLabelText("Verification code");
      const submitButton = screen.getByRole("button", { name: /verify email/i });

      await user.type(emailInput, "test@example.com");
      await user.type(otpInput, "123456");

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

      renderWithProviders(<VerifyEmail />);

      const emailInput = screen.getByLabelText("Email Address");
      const otpInput = screen.getByLabelText("Verification code");
      const submitButton = screen.getByRole("button", { name: /verify email/i });

      await user.type(emailInput, "test@example.com");
      await user.type(otpInput, "123456");

      await user.click(submitButton);

      await waitFor(
        () => {
          expect(screen.getByText("Verification failed")).toBeInTheDocument();
        },
        { timeout: 5000 }
      );

      expect(submitButton).not.toBeDisabled();
    });

    it("does not redirect on failed login", async () => {
      const user = userEvent.setup();

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ error: "Invalid credentials" }),
      });

      renderWithProviders(<VerifyEmail />);

      const emailInput = screen.getByLabelText("Email Address");
      const otpInput = screen.getByLabelText("Verification code");
      const submitButton = screen.getByRole("button", { name: /verify email/i });

      await user.type(emailInput, "wrong@example.com");
      await user.type(otpInput, "wrongpassword");

      await user.click(submitButton);

      await waitFor(
        () => {
          expect(screen.getByText("Invalid credentials")).toBeInTheDocument();
        },
        { timeout: 5000 }
      );

      expect(routerMocks.push).not.toHaveBeenCalled();
    });
  });

  describe("Form Validation", () => {
    it("requires email field", async () => {
      const user = userEvent.setup();
      renderWithProviders(<VerifyEmail />);

      const emailInput = screen.getByLabelText("Email Address");
      const submitButton = screen.getByRole("button", { name: /verify email/i });

      await user.click(submitButton);

      expect(emailInput).toBeInvalid();
    });

    it("requires password field", async () => {
      const user = userEvent.setup();
      renderWithProviders(<VerifyEmail />);

      const otpInput = screen.getByLabelText("Verification code");
      const submitButton = screen.getByRole("button", { name: /verify email/i });

      await user.click(submitButton);

      expect(otpInput).toBeInvalid();
    });

    it("accepts valid email format", async () => {
      const user = userEvent.setup();
      renderWithProviders(<VerifyEmail />);

      const emailInput = screen.getByLabelText("Email Address");

      await user.type(emailInput, "valid@example.com");

      expect(emailInput).toHaveValue("valid@example.com");
      expect(emailInput).toBeValid();
    });
  });



  describe("Accessibility", () => {
    it("has proper labels for all form inputs", () => {
      renderWithProviders(<VerifyEmail />);

      expect(screen.getByLabelText("Email Address")).toBeInTheDocument();
      expect(screen.getByLabelText("Verification code")).toBeInTheDocument();
    });

    it("has proper button role and accessible name", () => {
      renderWithProviders(<VerifyEmail />);

      const submitButton = screen.getByRole("button", { name: /verify email/i });
      expect(submitButton).toBeInTheDocument();
    });

    it("displays error messages in accessible way", async () => {
      const user = userEvent.setup();

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ error: "Invalid credentials" }),
      });
      renderWithProviders(<VerifyEmail />);

      await user.type(
        screen.getByLabelText("Email Address"),
        "test@example.com"
      );
      await user.type(screen.getByLabelText("Verification code"), "Verification code");
      await user.click(screen.getByRole("button", { name: /verify email/i }));

      await waitFor(() => {
        const errorMessage = screen.getByText("Invalid credentials");
        expect(errorMessage).toBeInTheDocument();
        expect(errorMessage).toBeVisible();
      });
    });
  });


});
