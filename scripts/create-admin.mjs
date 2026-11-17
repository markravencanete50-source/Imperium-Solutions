// Creates (or updates) a Firebase user and gives it the admin claim.
// Usage: npm run admin:create -- person@company.com a-strong-password
import { getAuth } from "firebase-admin/auth";
import { initAdmin } from "./_admin.mjs";

const [email, password] = process.argv.slice(2);
if (!email || !password || password.length < 8) {
  console.error("Usage: npm run admin:create -- email password (password of 8 characters or more)");
  process.exit(1);
}

initAdmin();
const auth = getAuth();
let user;
try {
  user = await auth.getUserByEmail(email);
  await auth.updateUser(user.uid, { password });
  console.log(`Updated the password for ${email}`);
} catch (err) {
  if (err.code !== "auth/user-not-found") throw err;
  user = await auth.createUser({ email, password, emailVerified: true });
  console.log(`Created ${email}`);
}
await auth.setCustomUserClaims(user.uid, { admin: true });
console.log("Admin claim set. Sign in at /admin/login. An already signed in user must sign out and back in.");
