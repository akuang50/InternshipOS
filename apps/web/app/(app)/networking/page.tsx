import { EmptyState } from "@/components/states";
import Link from "next/link";

export default function NetworkingPage() {
  return (
    <div className="page">
      <header className="page-head">
        <h1>Networking</h1>
        <p className="lead">Alumni, founders, and referral drafts are next — not this release.</p>
      </header>
      <EmptyState
        title="No people are linked yet"
        body="When this ships, contacts will come from a real source and outreach will be tracked as sent, replied, or referral confirmed. Read receipts will not be invented. For now, the useful move is still the apply queue."
        action={<Link className="btn btn-primary" href="/queue">Open apply queue</Link>}
      />
    </div>
  );
}
