import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { AuthClient } from '@dfinity/auth-client';
import { Actor, HttpAgent } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';

// ✅ Use Vite env syntax
const CANISTER_ID = import.meta.env.VITE_CANISTER_ID_FINALPROJ_BACKEND;
const INTERNET_IDENTITY_CANISTER_ID = import.meta.env.VITE_CANISTER_ID_INTERNET_IDENTITY;

if (!CANISTER_ID || !INTERNET_IDENTITY_CANISTER_ID) {
  throw new Error('Missing required environment variables');
}

const createActor = (canisterId: string, identity?: any) => {
  const host = window.location.host.includes('localhost')
    ? 'http://127.0.0.1:4943'
    : 'https://ic0.app';

  const agent = new HttpAgent({
    host,
    identity
  });

  if (host.includes('localhost')) {
    agent.fetchRootKey().catch(err => {
      console.warn('Unable to fetch root key:', err);
    });
  }

  return Actor.createActor(
    ({ IDL }) => {
      const Event = IDL.Record({
        id: IDL.Text,
        name: IDL.Text,
        date: IDL.Nat64,
        location: IDL.Text,
        organizer: IDL.Principal,
        ticket_price: IDL.Nat,
        max_resale_multiplier: IDL.Opt(IDL.Float64),
        total_tickets: IDL.Nat,
        tickets_sold: IDL.Nat,
        funds_collected: IDL.Nat,
        whitelist: IDL.Opt(IDL.Vec(IDL.Principal)),
      });

      const TicketMetadata = IDL.Record({
        event_id: IDL.Text,
        seat: IDL.Opt(IDL.Text),
        tier: IDL.Opt(IDL.Text),
        image_url: IDL.Opt(IDL.Text),
      });

      const Ticket = IDL.Record({
        id: IDL.Nat,
        owner: IDL.Principal,
        metadata: TicketMetadata,
        original_price: IDL.Nat,
        transfer_history: IDL.Vec(IDL.Tuple(IDL.Nat64, IDL.Principal)),
      });

      return IDL.Service({
        create_event: IDL.Func(
          [IDL.Text, IDL.Nat64, IDL.Text, IDL.Nat, IDL.Nat, IDL.Opt(IDL.Float64), IDL.Opt(IDL.Vec(IDL.Principal))],
          [IDL.Variant({ Ok: IDL.Text, Err: IDL.Text })],
          []
        ),
        purchase_ticket: IDL.Func([IDL.Text], [IDL.Variant({ Ok: IDL.Nat, Err: IDL.Text })], []),
        transfer_ticket: IDL.Func(
          [IDL.Nat, IDL.Principal, IDL.Opt(IDL.Nat)],
          [IDL.Variant({ Ok: IDL.Null, Err: IDL.Text })],
          []
        ),
        withdraw_funds: IDL.Func(
          [IDL.Text, IDL.Nat],
          [IDL.Variant({ Ok: IDL.Null, Err: IDL.Text })],
          []
        ),
        get_event: IDL.Func([IDL.Text], [IDL.Variant({ Ok: Event, Err: IDL.Text })], ['query']),
        get_ticket: IDL.Func([IDL.Nat], [IDL.Variant({ Ok: Ticket, Err: IDL.Text })], ['query']),
        get_events_by_organizer: IDL.Func([IDL.Principal], [IDL.Vec(Event)], ['query']),
        get_tickets_by_owner: IDL.Func([IDL.Principal], [IDL.Vec(Ticket)], ['query']),
        icrc7_metadata: IDL.Func([IDL.Nat], [IDL.Variant({ Ok: TicketMetadata, Err: IDL.Text })], ['query']),
        icrc7_owner_of: IDL.Func([IDL.Nat], [IDL.Variant({ Ok: IDL.Principal, Err: IDL.Text })], ['query']),
        icrc7_transfer_history: IDL.Func(
          [IDL.Nat],
          [IDL.Variant({ Ok: IDL.Vec(IDL.Tuple(IDL.Nat64, IDL.Principal)), Err: IDL.Text })],
          ['query']
        ),
      });
    },
    { agent, canisterId }
  );
};

interface AuthContextType {
  isAuthenticated: boolean;
  principal: Principal | null;
  authClient: AuthClient | null;
  backendActor: any;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
  error: string | null;
}

export const AuthContext = createContext<AuthContextType>(null!);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState({
    isAuthenticated: false,
    principal: null as Principal | null,
    authClient: null as AuthClient | null,
    backendActor: null as any,
    loading: true,
    error: null as string | null,
  });

  const initializeAuth = async () => {
    try {
      const client = await AuthClient.create({
        idleOptions: {
          idleTimeout: 1000 * 60 * 30,
        }
      });

      const actor = createActor(CANISTER_ID);

      if (await client.isAuthenticated()) {
        const identity = client.getIdentity();
        const principal = identity.getPrincipal();
        const authActor = createActor(CANISTER_ID, identity);

        setState({
          isAuthenticated: true,
          principal,
          authClient: client,
          backendActor: authActor,
          loading: false,
          error: null,
        });
      } else {
        setState(prev => ({
          ...prev,
          authClient: client,
          backendActor: actor,
          loading: false,
        }));
      }
    } catch (error) {
      console.error('Initialization error:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Initialization failed',
      }));
    }
  };

  useEffect(() => {
    initializeAuth();
  }, []);

  const login = async () => {
    if (!state.authClient) return;

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      await state.authClient.login({
        identityProvider: `http://${INTERNET_IDENTITY_CANISTER_ID}.localhost:4943/#authorize`,
        windowOpenerFeatures: `
          width=500,
          height=600,
          toolbar=0,
          scrollbars=1,
          status=1,
          resizable=1,
          location=1,
          menuBar=0
        `,
        onSuccess: async () => {
          const identity = state.authClient!.getIdentity();
          const principal = identity.getPrincipal();
          const actor = createActor(CANISTER_ID, identity);

          setState({
            isAuthenticated: true,
            principal,
            authClient: state.authClient,
            backendActor: actor,
            loading: false,
            error: null,
          });
        },
        onError: (err) => {
          console.error('Login error:', err);
          setState(prev => ({
            ...prev,
            loading: false,
            error: 'Login failed. Please try again.',
          }));
        },
        maxTimeToLive: BigInt(7 * 24 * 60 * 60 * 1000 * 1000 * 1000),
      });
    } catch (error) {
      console.error('Login failed:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Login failed',
      }));
    }
  };

  const logout = async () => {
    if (!state.authClient) return;

    try {
      await state.authClient.logout();
      const actor = createActor(CANISTER_ID);

      setState({
        isAuthenticated: false,
        principal: null,
        authClient: state.authClient,
        backendActor: actor,
        loading: false,
        error: null,
      });
    } catch (error) {
      console.error('Logout failed:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Logout failed',
      }));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
