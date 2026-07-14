interface Order {
  id: string;
  items: { sku: string; quantity: number }[];
}

const computeTotalQuantity = (order: Order): number => {
  return order.items.reduce((total, item) => total + item.quantity, 0);
};

export const buildSampleError = (): Error => {
  const incompleteOrder = { id: "order-42" };
  const order = incompleteOrder as unknown as Order;

  try {
    computeTotalQuantity(order);
    throw new Error("unreachable");
  } catch (error) {
    return error as Error;
  }
};
