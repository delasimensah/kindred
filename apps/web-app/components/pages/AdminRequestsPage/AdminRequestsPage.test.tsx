import { screen } from "@testing-library/react";

import { render, setupUser } from "@/test-utils";

import AdminRequestsPage from "./AdminRequestsPage";

const row = {
  requestId: "request_1",
  displayName: "Efua Boateng",
  handle: "efua-boateng",
  bio: "Afro-soul from Accra.",
  note: "I want a home for these songs.",
  email: "efua.boateng@kindredmail.com",
  createdAt: Date.now(),
};

describe("AdminRequestsPage", () => {
  it("approves and declines a pending request", async () => {
    const user = setupUser();
    const onApprove = jest.fn();
    const onDecline = jest.fn();
    render(
      <AdminRequestsPage
        pending={[row]}
        pendingCount={1}
        approvedThisMonth={0}
        declinedThisMonth={0}
        busyId={null}
        onApprove={onApprove}
        onDecline={onDecline}
      />
    );

    expect(screen.getByText("Afro-soul from Accra.")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /approve/i }));
    expect(onApprove).toHaveBeenCalledWith(row.requestId);
    await user.click(screen.getByRole("button", { name: /decline/i }));
    expect(onDecline).toHaveBeenCalledWith(row.requestId);
  });
});
