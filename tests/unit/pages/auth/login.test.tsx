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
import LoginPage from "@/app/(auth)/login/page";
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
      renderWithProviders(<LoginPage />);

      expect(screen.getByText("Sign in to your account")).toBeInTheDocument();
      expect(screen.getByLabelText("Email Address")).toBeInTheDocument();
      expect(screen.getByLabelText("Password")).toBeInTheDocument();
      expect(screen.getByLabelText("Remember me")).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /sign in/i })
      ).toBeInTheDocument();
    });

    it("renders forgot password link", () => {
      renderWithProviders(<LoginPage />);

      const forgotPasswordLink = screen.getByText("Forgot password?");
      expect(forgotPasswordLink).toBeInTheDocument();
      expect(forgotPasswordLink.closest("a")).toHaveAttribute(
        "href",
        "/request-password-reset"
      );
    });

    it("renders sign up link", () => {
      renderWithProviders(<LoginPage />);

      const signUpLink = screen.getByText("Sign up");
      expect(signUpLink).toBeInTheDocument();
      expect(signUpLink.closest("a")).toHaveAttribute("href", "/register");
    });

    it("has proper input attributes", () => {
      renderWithProviders(<LoginPage />);

      const emailInput = screen.getByLabelText("Email Address");
      expect(emailInput).toHaveAttribute("type", "email");
      expect(emailInput).toHaveAttribute("name", "email");
      expect(emailInput).toHaveAttribute("autocomplete", "email");
      expect(emailInput).toBeRequired();

      const passwordInput = screen.getByLabelText("Password");
      expect(passwordInput).toHaveAttribute("type", "password");
      expect(passwordInput).toHaveAttribute("name", "password");
      expect(passwordInput).toHaveAttribute("autocomplete", "current-password");
      expect(passwordInput).toBeRequired();
    });
  });

  describe("Form Submission", () => {
    it("submits form with valid credentials", async () => {
      const user = userEvent.setup();
      const mockUser = createMockUser({
        email: "test@example.com",
      });

      mockSuccessfulFetch({ user: mockUser });

      const { mockAuthContext, mockAppContext } = renderWithProviders(
        <LoginPage />
      );

      const emailInput = screen.getByLabelText("Email Address");
      const passwordInput = screen.getByLabelText("Password");
      const submitButton = screen.getByRole("button", { name: /sign in/i });

      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "password123");
      await user.click(submitButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "test@example.com",
            password: "password123",
          }),
          credentials: "include",
        });
      });

      await waitFor(() => {
        expect(mockAuthContext.refreshUser).toHaveBeenCalled();
        expect(mockAppContext.setIsRefetch).toHaveBeenCalledWith(true);
        expect(routerMocks.push).toHaveBeenCalledWith("/");
      });
    });

    it("shows loading state during submission", async () => {
      const user = userEvent.setup();

      mockPendingFetch();
      renderWithProviders(<LoginPage />);

      const emailInput = screen.getByLabelText("Email Address");
      const passwordInput = screen.getByLabelText("Password");
      const submitButton = screen.getByRole("button", { name: /sign in/i });

      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "password123");
      await user.click(submitButton);

      // Check for loading text
      expect(await screen.findByText("Signing in...")).toBeInTheDocument();
    });

    it("disables form inputs during submission", async () => {
      const user = userEvent.setup();

      mockPendingFetch();

      renderWithProviders(<LoginPage />);

      const emailInput = screen.getByLabelText("Email Address");
      const passwordInput = screen.getByLabelText("Password");
      const submitButton = screen.getByRole("button", { name: /sign in/i });

      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "password123");
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

      renderWithProviders(<LoginPage />);

      const emailInput = screen.getByLabelText("Email Address");
      const passwordInput = screen.getByLabelText("Password");
      const submitButton = screen.getByRole("button", { name: /sign in/i });

      await user.type(emailInput, "wrong@example.com");
      await user.type(passwordInput, "wrongpassword");

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

      renderWithProviders(<LoginPage />);

      const emailInput = screen.getByLabelText("Email Address");
      const passwordInput = screen.getByLabelText("Password");
      const submitButton = screen.getByRole("button", { name: /sign in/i });

      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "password123");

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

      renderWithProviders(<LoginPage />);

      const emailInput = screen.getByLabelText("Email Address");
      const passwordInput = screen.getByLabelText("Password");
      const submitButton = screen.getByRole("button", { name: /sign in/i });

      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "password123");

      await user.click(submitButton);

      await waitFor(
        () => {
          expect(screen.getByText("Login failed")).toBeInTheDocument();
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

      renderWithProviders(<LoginPage />);

      const emailInput = screen.getByLabelText("Email Address");
      const passwordInput = screen.getByLabelText("Password");
      const submitButton = screen.getByRole("button", { name: /sign in/i });

      await user.type(emailInput, "wrong@example.com");
      await user.type(passwordInput, "wrongpassword");

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
      renderWithProviders(<LoginPage />);

      const emailInput = screen.getByLabelText("Email Address");
      const submitButton = screen.getByRole("button", { name: /sign in/i });

      await user.click(submitButton);

      expect(emailInput).toBeInvalid();
    });

    it("requires password field", async () => {
      const user = userEvent.setup();
      renderWithProviders(<LoginPage />);

      const passwordInput = screen.getByLabelText("Password");
      const submitButton = screen.getByRole("button", { name: /sign in/i });

      await user.click(submitButton);

      expect(passwordInput).toBeInvalid();
    });

    it("accepts valid email format", async () => {
      const user = userEvent.setup();
      renderWithProviders(<LoginPage />);

      const emailInput = screen.getByLabelText("Email Address");

      await user.type(emailInput, "valid@example.com");

      expect(emailInput).toHaveValue("valid@example.com");
      expect(emailInput).toBeValid();
    });
  });

  describe("Remember Me Checkbox", () => {
    it("renders remember me checkbox", () => {
      renderWithProviders(<LoginPage />);

      const rememberCheckbox = screen.getByLabelText("Remember me");
      expect(rememberCheckbox).toBeInTheDocument();
      expect(rememberCheckbox).toHaveAttribute("type", "checkbox");
    });

    it("can be checked and unchecked", async () => {
      const user = userEvent.setup();
      renderWithProviders(<LoginPage />);

      const rememberCheckbox = screen.getByLabelText("Remember me");

      expect(rememberCheckbox).not.toBeChecked();

      await user.click(rememberCheckbox);
      expect(rememberCheckbox).toBeChecked();

      await user.click(rememberCheckbox);
      expect(rememberCheckbox).not.toBeChecked();
    });
  });

  describe("Accessibility", () => {
    it("has proper labels for all form inputs", () => {
      renderWithProviders(<LoginPage />);

      expect(screen.getByLabelText("Email Address")).toBeInTheDocument();
      expect(screen.getByLabelText("Password")).toBeInTheDocument();
      expect(screen.getByLabelText("Remember me")).toBeInTheDocument();
    });

    it("has proper button role and accessible name", () => {
      renderWithProviders(<LoginPage />);

      const submitButton = screen.getByRole("button", { name: /sign in/i });
      expect(submitButton).toBeInTheDocument();
    });

    it("displays error messages in accessible way", async () => {
      const user = userEvent.setup();

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ error: "Invalid credentials" }),
      });
      renderWithProviders(<LoginPage />);

      await user.type(
        screen.getByLabelText("Email Address"),
        "test@example.com"
      );
      await user.type(screen.getByLabelText("Password"), "password");
      await user.click(screen.getByRole("button", { name: /sign in/i }));

      await waitFor(() => {
        const errorMessage = screen.getByText("Invalid credentials");
        expect(errorMessage).toBeInTheDocument();
        expect(errorMessage).toBeVisible();
      });
    });
  });

  describe("Integration with Context", () => {
    it("calls refreshUser after successful login", async () => {
      const user = userEvent.setup();
      mockSuccessfulFetch({ user: createMockUser() });

      const { mockAuthContext } = renderWithProviders(<LoginPage />);

      await user.type(
        screen.getByLabelText("Email Address"),
        "test@example.com"
      );
      await user.type(screen.getByLabelText("Password"), "password123");
      await user.click(screen.getByRole("button", { name: /sign in/i }));

      await waitFor(() => {
        expect(mockAuthContext.refreshUser).toHaveBeenCalled();
      });
    });

    it("calls setIsRefetch after successful login", async () => {
      const user = userEvent.setup();
      mockSuccessfulFetch({ user: createMockUser() });

      const { mockAppContext } = renderWithProviders(<LoginPage />);

      await user.type(
        screen.getByLabelText("Email Address"),
        "test@example.com"
      );
      await user.type(screen.getByLabelText("Password"), "password123");
      await user.click(screen.getByRole("button", { name: /sign in/i }));

      await waitFor(() => {
        expect(mockAppContext.setIsRefetch).toHaveBeenCalledWith(true);
      });
    });
  });
});
