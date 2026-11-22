import { NextResponse, type NextRequest } from "next/server";
import { listUsers } from "@/lib/server/authAdmin";
import { authErrorResponse, authorizeAdmin, latestAudit, toTeamUser } from "@/lib/server/adminRoute";
import { isEmailConfigured } from "@/lib/server/email";

// Admin only: every Auth user with a derived status, plus the latest audit log rows.
export async function GET(request: NextRequest) {
  const auth = await authorizeAdmin(request);
  if ("response" in auth) return auth.response;
  try {
    const [users, audit] = await Promise.all([listUsers(), latestAudit(20)]);
    const team = users.map(toTeamUser).sort((a, b) => (a.createdAt ?? 0) - (b.createdAt ?? 0));
    return NextResponse.json({
      me: auth.caller,
      users: team,
      audit,
      emailConfigured: isEmailConfigured(),
    });
  } catch (err) {
    return authErrorResponse(err, "team list failed");
  }
}
