import '@testing-library/jest-dom';

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R;
      toHaveAttribute(attr: string, value?: string): R;
      toHaveClass(...classNames: string[]): R;
      toHaveTextContent(text: string | RegExp): R;
      toBeVisible(): R;
      toBeDisabled(): R;
      toBeEnabled(): R;
      toHaveValue(value: string | number | string[]): R;
      toBeChecked(): R;
      toHaveFocus(): R;
      toBeEmptyDOMElement(): R;
      toContainElement(element: HTMLElement | null): R;
      toContainHTML(html: string): R;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      toHaveStyle(css: string | Record<string, any>): R;
    }
  }
}

export {};