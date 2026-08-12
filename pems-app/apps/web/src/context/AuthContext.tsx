import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, type User as FirebaseUser } from "firebase/auth";
import { auth, getUserAccessState, getUserProfile, type UserAccessState } from "../../../../packages/firebase";
import type { User } from "../../../../packages/models";

interface AuthContextType {
  firebaseUser: FirebaseUser | null;
  userProfile: User | null;
  loading: boolean;
  accessState: UserAccessState;
}

const AuthContext = createContext<AuthContextType>({
  firebaseUser: null,
  userProfile: null,
  loading: true,
  accessState: "missing",
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [accessState, setAccessState] = useState<UserAccessState>("missing");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setLoading(true);
      setFirebaseUser(currentUser);

      if (currentUser) {
        try {
          const profile = await getUserProfile(currentUser.uid);
          setUserProfile(profile);
          setAccessState(getUserAccessState(profile));
        } catch (error) {
          console.error("Could not load user profile", error);
          setUserProfile(null);
          setAccessState("missing");
        }
      } else {
        setUserProfile(null);
        setAccessState("missing");
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ firebaseUser, userProfile, loading, accessState }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
