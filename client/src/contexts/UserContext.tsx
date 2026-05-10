import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { gql } from "@apollo/client";
import { useMutation, useQuery } from "@apollo/client/react";

export type UserRole = "ADMIN" | "REQUESTER" | "APPROVER" | "BUYER" | "RECEIVER";

export type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string | null;
  isActive: boolean;
};

type MeQueryData = {
  me: User | null;
};

type LoginMutationData = {
  login: {
    user: User;
  };
};

type LoginMutationVariables = {
  input: {
    email: string;
    password: string;
  };
};

type LogoutMutationData = {
  logout: boolean;
};

type UserContextType = {
  currentUser: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refetchMe: () => Promise<any>;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

const ME_QUERY = gql`
  query Me {
    me {
      id
      name
      email
      role
      department
      isActive
    }
  }
`;

const LOGIN_MUTATION = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      user {
        id
        name
        email
        role
        department
        isActive
      }
    }
  }
`;

const LOGOUT_MUTATION = gql`
  mutation Logout {
    logout
  }
`;

export function UserProvider({ children }: { children: ReactNode }) {
  const { data, loading, refetch } = useQuery<MeQueryData>(ME_QUERY, {
    fetchPolicy: "network-only",
  });

  const [loginMutation] = useMutation<LoginMutationData, LoginMutationVariables>(
    LOGIN_MUTATION
  );

  const [logoutMutation] = useMutation<LogoutMutationData>(LOGOUT_MUTATION);

  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    setCurrentUser(data?.me ?? null);
  }, [data]);

  async function login(email: string, password: string) {
    const result = await loginMutation({
      variables: {
        input: {
          email,
          password,
        },
      },
    });

    const loggedInUser = result.data?.login.user;

    if (!loggedInUser) {
      throw new Error("Login failed. No user returned.");
    }

    setCurrentUser(loggedInUser);
    await refetch();
  }

  async function logout() {
    await logoutMutation();
    setCurrentUser(null);
    await refetch();
  }

  return (
    <UserContext.Provider
      value={{
        currentUser,
        loading,
        login,
        logout,
        refetchMe: refetch,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);

  if (!context) {
    throw new Error("useUser must be used inside UserProvider");
  }

  return context;
}