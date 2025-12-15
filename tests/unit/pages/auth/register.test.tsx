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
  usePathname: jest.fn(() => "/register"),
  useSearchParams: jest.fn(() => new URLSearchParams()),
}));

// Import component after mocks are set up
import RegisterPage from "@/app/(auth)/register/page";
import { useRouter } from "next/navigation";

describe("Resgister Page", () => {
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
      renderWithProviders(<RegisterPage />);

      expect(screen.getByText("Create your account")).toBeInTheDocument();
      expect(screen.getByLabelText("Username")).toBeInTheDocument();
      expect(screen.getByLabelText("Email Address")).toBeInTheDocument();
      expect(screen.getByLabelText("Password")).toBeInTheDocument();
      expect(screen.getByLabelText("Confirm Password")).toBeInTheDocument();

      expect(
        screen.getByRole("button", { name: /create account/i })
      ).toBeInTheDocument();
    });
    it("renders sign up link", () => {
      renderWithProviders(<RegisterPage />);

      const signInLink = screen.getByText("Sign in");
      expect(signInLink).toBeInTheDocument();
      expect(signInLink.closest("a")).toHaveAttribute("href", "/login");
    });

    it("has proper input attributes", () => {
      renderWithProviders(<RegisterPage />);

      const userNameInput = screen.getByLabelText("Username");
      expect(userNameInput).toHaveAttribute("type", "text");
      expect(userNameInput).toHaveAttribute("name", "name");
      expect(userNameInput).toHaveAttribute("autocomplete", "name");
      expect(userNameInput).toBeRequired();

      const emailInput = screen.getByLabelText("Email Address");
      expect(emailInput).toHaveAttribute("type", "email");
      expect(emailInput).toHaveAttribute("name", "email");
      expect(emailInput).toHaveAttribute("autocomplete", "email");
      expect(emailInput).toBeRequired();

      const passwordInput = screen.getByLabelText("Password");
      expect(passwordInput).toHaveAttribute("type", "password");
      expect(passwordInput).toHaveAttribute("name", "password");
      expect(passwordInput).toHaveAttribute("autocomplete", "new-password");
      expect(passwordInput).toBeRequired();

      const confirmPasswordInput = screen.getByLabelText("Confirm Password");
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
    it("submits form with valid credentials", async () => {
      const user = userEvent.setup();
      const mockUser = createMockUser({
        email: "test@example.com",
      });

      mockSuccessfulFetch({ user: mockUser });

      renderWithProviders(<RegisterPage />);
      const userNameInput = screen.getByLabelText("Username");
      const emailInput = screen.getByLabelText("Email Address");
      const passwordInput = screen.getByLabelText("Password");
      const submitButton = screen.getByRole("button", {
        name: /create account/i,
      });
      const confirmPasswordInput = screen.getByLabelText("Confirm Password");

      await user.type(userNameInput, "test");
      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "password123");
      await user.type(confirmPasswordInput, "password123");

      await user.click(submitButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "test@example.com",
            password: "password123",
            name: "test",
          }),
        });
      });

      await waitFor(
        () => {
          expect(routerMocks.push).toHaveBeenCalledWith("/verify-email");
        },
        { 
          timeout: 3000, 
        }
      );
    });

    it("shows loading state during submission", async () => {
      const user = userEvent.setup();

      mockPendingFetch();
      renderWithProviders(<RegisterPage />);

      const userNameInput = screen.getByLabelText("Username");
      const emailInput = screen.getByLabelText("Email Address");
      const passwordInput = screen.getByLabelText("Password");
      const submitButton = screen.getByRole("button", {
        name: /create account/i,
      });
      const confirmPasswordInput = screen.getByLabelText("Confirm Password");

      await user.type(userNameInput, "test");
      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "password123");
      await user.type(confirmPasswordInput, "password123");

      await user.click(submitButton);

      // Check for loading text
      expect(
        await screen.findByText("Creating account...")
      ).toBeInTheDocument();
    });

    it("disables form inputs during submission", async () => {
      const user = userEvent.setup();

      mockPendingFetch();

      renderWithProviders(<RegisterPage />);

      const userNameInput = screen.getByLabelText("Username");
      const emailInput = screen.getByLabelText("Email Address");
      const passwordInput = screen.getByLabelText("Password");
      const submitButton = screen.getByRole("button", {
        name: /create account/i,
      });
      const confirmPasswordInput = screen.getByLabelText("Confirm Password");

      await user.type(userNameInput, "test");
      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "password123");
      await user.type(confirmPasswordInput, "password123");

      await user.click(submitButton);

      // Inputs should be disabled during submission
      await waitFor(() => {
        expect(emailInput).toBeDisabled();
        expect(passwordInput).toBeDisabled();
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

      renderWithProviders(<RegisterPage />);

      const userNameInput = screen.getByLabelText("Username");
      const emailInput = screen.getByLabelText("Email Address");
      const passwordInput = screen.getByLabelText("Password");
      const submitButton = screen.getByRole("button", {
        name: /create account/i,
      });
      const confirmPasswordInput = screen.getByLabelText("Confirm Password");

      await user.type(userNameInput, "test");
      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "password123");
      await user.type(confirmPasswordInput, "password123");

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

      renderWithProviders(<RegisterPage />);

      const userNameInput = screen.getByLabelText("Username");
      const emailInput = screen.getByLabelText("Email Address");
      const passwordInput = screen.getByLabelText("Password");
      const submitButton = screen.getByRole("button", {
        name: /create account/i,
      });
      const confirmPasswordInput = screen.getByLabelText("Confirm Password");

      await user.type(userNameInput, "test");
      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "password123");
      await user.type(confirmPasswordInput, "password123");

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

      renderWithProviders(<RegisterPage />);

      const userNameInput = screen.getByLabelText("Username");
      const emailInput = screen.getByLabelText("Email Address");
      const passwordInput = screen.getByLabelText("Password");
      const submitButton = screen.getByRole("button", {
        name: /create account/i,
      });
      const confirmPasswordInput = screen.getByLabelText("Confirm Password");

      await user.type(userNameInput, "test");
      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "password123");
      await user.type(confirmPasswordInput, "password123");

      await user.click(submitButton);

      await waitFor(
        () => {
          expect(screen.getByText("Registration failed")).toBeInTheDocument();
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

      renderWithProviders(<RegisterPage />);

      const userNameInput = screen.getByLabelText("Username");
      const emailInput = screen.getByLabelText("Email Address");
      const passwordInput = screen.getByLabelText("Password");
      const submitButton = screen.getByRole("button", {
        name: /create account/i,
      });
      const confirmPasswordInput = screen.getByLabelText("Confirm Password");

      await user.type(userNameInput, "test");
      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "password123");
      await user.type(confirmPasswordInput, "password123");

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
      renderWithProviders(<RegisterPage />);

      const emailInput = screen.getByLabelText("Email Address");
      const submitButton = screen.getByRole("button", {
        name: /create account/i,
      });

      await user.click(submitButton);

      expect(emailInput).toBeInvalid();
    });

    it("compares password and confirmPassword fields", async () => {
      const user = userEvent.setup();
      renderWithProviders(<RegisterPage />);

      const passwordInput = screen.getByLabelText(
        "Password"
      ) as HTMLInputElement;
      const confirmPasswordInput = screen.getByLabelText(
        "Confirm Password"
      ) as HTMLInputElement;

      await user.type(passwordInput, "password123");
      await user.type(confirmPasswordInput, "password12");

      expect(screen.findByText("Passwords do not match"));
    });
    it("checks password validity", async () => {
      const user = userEvent.setup();
      renderWithProviders(<RegisterPage />);

      const passwordInput = screen.getByLabelText(
        "Password"
      ) as HTMLInputElement;

      await user.type(passwordInput, "passw");

      expect(screen.findByText("Password must be at least 8 characters"));
    });
    it("requires password field", async () => {
      const user = userEvent.setup();
      renderWithProviders(<RegisterPage />);

      const passwordInput = screen.getByLabelText("Password");
      const submitButton = screen.getByRole("button", {
        name: /create account/i,
      });

      await user.click(submitButton);

      expect(passwordInput).toBeInvalid();
    });

    it("accepts valid email format", async () => {
      const user = userEvent.setup();
      renderWithProviders(<RegisterPage />);

      const emailInput = screen.getByLabelText("Email Address");

      await user.type(emailInput, "valid@example.com");

      expect(emailInput).toHaveValue("valid@example.com");
      expect(emailInput).toBeValid();
    });
  });

  describe("Accessibility", () => {
    it("has proper labels for all form inputs", () => {
      renderWithProviders(<RegisterPage />);

      expect(screen.getByLabelText("Username")).toBeInTheDocument();
      expect(screen.getByLabelText("Email Address")).toBeInTheDocument();
      expect(screen.getByLabelText("Password")).toBeInTheDocument();
      expect(screen.getByLabelText("Confirm Password")).toBeInTheDocument();
    });

    it("has proper button role and accessible name", () => {
      renderWithProviders(<RegisterPage />);

      const submitButton = screen.getByRole("button", {
        name: /create account/i,
      });
      expect(submitButton).toBeInTheDocument();
    });
  });
});
