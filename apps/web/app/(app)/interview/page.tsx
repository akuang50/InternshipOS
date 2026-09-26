import { EmptyState } from "@/components/states";
import Link from "next/link";

export default function InterviewPage() {
  return (
    <div className="page">
      <header className="page-head">
        <h1>Interview prep</h1>
        <p className="lead">Technical and behavioral practice is a later module.</p>
      </header>
      <EmptyState
        title="Practice isn't available yet"
        body="The problem bank will be original or licensed. LeetCode and Glassdoor text will not be copied in. Until then, use the application workspace to get a role ready."
        action={<Link className="btn btn-primary" href="/applications">Go to applications</Link>}
      />
    </div>
  );
}
