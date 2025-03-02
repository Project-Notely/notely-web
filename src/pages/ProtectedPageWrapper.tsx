import { withAuthenticationRequired } from "@auth0/auth0-react";
import ProtectedPage from "./ProtectedPage";

// Create a named wrapper component
const ProtectedPageWrapper = withAuthenticationRequired(ProtectedPage);

// Export the named component
export default ProtectedPageWrapper; 