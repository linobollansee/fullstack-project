import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ProductList from "../ProductList";
import { productsApi } from "@/lib/api";

// Mock the API
jest.mock("@/lib/api", () => ({
  productsApi: {
    getAll: jest.fn(),
    delete: jest.fn(),
  },
}));

// Mock window.confirm
global.confirm = jest.fn();

describe("ProductList", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("displays loading state initially", () => {
    (productsApi.getAll as jest.Mock).mockImplementation(
      () => new Promise(() => {})
    );
    render(<ProductList />);
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("displays products after successful fetch", async () => {
    const mockProducts = [
      {
        id: 1,
        name: "Product 1",
        description: "Description 1",
        price: "10.00",
      },
      {
        id: 2,
        name: "Product 2",
        description: "Description 2",
        price: "20.00",
      },
    ];
    (productsApi.getAll as jest.Mock).mockResolvedValue(mockProducts);

    render(<ProductList />);

    await waitFor(() => {
      expect(screen.getByText("Product 1")).toBeInTheDocument();
    });

    expect(screen.getByText("Product 2")).toBeInTheDocument();
    expect(screen.getByText("Description 1")).toBeInTheDocument();
    expect(screen.getByText("$10.00")).toBeInTheDocument();
    expect(screen.getByText("$20.00")).toBeInTheDocument();
  });

  it("displays error message on fetch failure", async () => {
    (productsApi.getAll as jest.Mock).mockRejectedValue(
      new Error("Network error")
    );

    render(<ProductList />);

    await waitFor(() => {
      expect(screen.getByText("Failed to load products")).toBeInTheDocument();
    });
  });

  it("displays message when no products found", async () => {
    (productsApi.getAll as jest.Mock).mockResolvedValue([]);

    render(<ProductList />);

    await waitFor(() => {
      expect(screen.getByText("No products found")).toBeInTheDocument();
    });
  });

  it("deletes product when delete button is clicked and confirmed", async () => {
    const mockProducts = [
      {
        id: 1,
        name: "Product 1",
        description: "Description 1",
        price: "10.00",
      },
      {
        id: 2,
        name: "Product 2",
        description: "Description 2",
        price: "20.00",
      },
    ];
    (productsApi.getAll as jest.Mock).mockResolvedValue(mockProducts);
    (productsApi.delete as jest.Mock).mockResolvedValue(undefined);
    (global.confirm as jest.Mock).mockReturnValue(true);

    const user = userEvent.setup();
    render(<ProductList />);

    await waitFor(() => {
      expect(screen.getByText("Product 1")).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByText("Delete");
    await user.click(deleteButtons[0]);

    expect(global.confirm).toHaveBeenCalledWith(
      "Are you sure you want to delete this product?"
    );
    expect(productsApi.delete).toHaveBeenCalledWith(1);

    await waitFor(() => {
      expect(screen.queryByText("Product 1")).not.toBeInTheDocument();
    });
    expect(screen.getByText("Product 2")).toBeInTheDocument();
  });

  it("does not delete product when deletion is cancelled", async () => {
    const mockProducts = [
      {
        id: 1,
        name: "Product 1",
        description: "Description 1",
        price: "10.00",
      },
    ];
    (productsApi.getAll as jest.Mock).mockResolvedValue(mockProducts);
    (global.confirm as jest.Mock).mockReturnValue(false);

    const user = userEvent.setup();
    render(<ProductList />);

    await waitFor(() => {
      expect(screen.getByText("Product 1")).toBeInTheDocument();
    });

    const deleteButton = screen.getByText("Delete");
    await user.click(deleteButton);

    expect(global.confirm).toHaveBeenCalled();
    expect(productsApi.delete).not.toHaveBeenCalled();
    expect(screen.getByText("Product 1")).toBeInTheDocument();
  });
});
