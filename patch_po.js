const fs = require('fs');
let code = fs.readFileSync('client/src/pages/PurchaseOrdersPage.tsx', 'utf-8');

code = code.replace(
  "import { GET_PURCHASE_ORDERS, GET_PROCUREMENT_REQUESTS, GET_VENDORS, CREATE_PURCHASE_ORDER, UPDATE_PO_STATUS } from '../graphql/queries'",
  "import { GET_PURCHASE_ORDERS, GET_PROCUREMENT_REQUESTS, GET_VENDORS, CREATE_PURCHASE_ORDER, UPDATE_PO_STATUS, APPROVE_PURCHASE_ORDER, DENY_PURCHASE_ORDER } from '../graphql/queries'"
);

const hooks = `  const [approvePO] = useMutation<any>(APPROVE_PURCHASE_ORDER, {
    refetchQueries: [{ query: GET_PURCHASE_ORDERS }]
  })
  const [denyPO] = useMutation<any>(DENY_PURCHASE_ORDER, {
    refetchQueries: [{ query: GET_PURCHASE_ORDERS }]
  })

  const handleApprove = async (id: string) => {
    if (!currentUser) return;
    try {
      await approvePO({ variables: { id, approverId: currentUser.id } });
    } catch (err) {
      alert("Failed to approve PO");
    }
  }

  const handleDeny = async (id: string) => {
    if (!currentUser) return;
    const reason = window.prompt("Enter reason for denial:");
    if (reason === null) return;
    try {
      await denyPO({ variables: { id, approverId: currentUser.id, reason: reason || "No reason provided" } });
    } catch (err) {
      alert("Failed to deny PO");
    }
  }

  const [poFormData`;

code = code.replace("  const [poFormData", hooks);

const details = `                  <div><strong>Vendor:</strong> {po.vendor.name}</div>
                  <div><strong>Subtotal:</strong> ${"$"}{po.subtotal.toFixed(2)}</div>
                  <div><strong>Date:</strong> {new Date(po.createdAt).toLocaleDateString()}</div>
                  {po.denialReason && <div style={{ color: 'var(--color-danger)', marginTop: '0.5rem' }}><strong>Denial Reason:</strong> {po.denialReason}</div>}
                </div>`;

code = code.replace("                  <div><strong>Date:</strong> {new Date(po.createdAt).toLocaleDateString()}</div>\n                </div>", details);

const buttons = `{currentUser && (currentUser.role === 'ADMIN' || currentUser.role === 'APPROVER') && po.status === 'PENDING_APPROVAL' && (
                  <div style={{ display: 'flex', gap: '0.5rem', borderTop: '1px solid var(--color-border)', paddingTop: '1rem', marginBottom: '1rem' }}>
                    <Button variant="primary" onClick={() => handleApprove(po.id)}>Approve</Button>
                    <Button variant="danger" onClick={() => handleDeny(po.id)}>Deny</Button>
                  </div>
                )}
                {currentUser && (currentUser.role === 'ADMIN' || currentUser.role === 'BUYER') && po.status !== 'RECEIVED' && po.status !== 'CLOSED' && po.status !== 'CANCELLED' && po.status !== 'PENDING_APPROVAL' && po.status !== 'DENIED' && (
                  <div style={{ display: 'flex', gap: '0.5rem', borderTop: '1px solid var(--color-border)', paddingTop: '1rem' }}>
                    {po.status === 'APPROVED' && <Button variant="secondary" onClick={() => updatePOStatus({ variables: { input: { id: po.id, status: 'ISSUED' } } })}>Issue PO</Button>}
                    {po.status === 'DRAFT' && <Button variant="secondary" onClick={() => updatePOStatus({ variables: { input: { id: po.id, status: 'ISSUED' } } })}>Issue PO</Button>}
                    {po.status === 'ISSUED' && <Button variant="secondary" onClick={() => updatePOStatus({ variables: { input: { id: po.id, status: 'ACKNOWLEDGED' } } })}>Mark Acknowledged</Button>}
                    <Button variant="danger" onClick={() => updatePOStatus({ variables: { input: { id: po.id, status: 'CANCELLED' } } })}>Cancel PO</Button>
                  </div>
                )}`;

code = code.replace(/\{currentUser && \(currentUser\.role === 'ADMIN' \|\| currentUser\.role === 'BUYER'\) && po\.status !== 'RECEIVED' && po\.status !== 'CLOSED' && po\.status !== 'CANCELLED' && \([\s\S]*?\)\}/, buttons);

fs.writeFileSync('client/src/pages/PurchaseOrdersPage.tsx', code);
