import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface _SERVICE {
  'create_event' : ActorMethod<
    [
      string,
      bigint,
      string,
      bigint,
      bigint,
      [] | [number],
      [] | [Array<Principal>],
    ],
    { 'Ok' : string } |
      { 'Err' : string }
  >,
  'get_event' : ActorMethod<
    [string],
    {
        'Ok' : {
          'id' : string,
          'organizer' : Principal,
          'whitelist' : [] | [Array<Principal>],
          'date' : bigint,
          'name' : string,
          'ticket_price' : bigint,
          'tickets_sold' : bigint,
          'total_tickets' : bigint,
          'funds_collected' : bigint,
          'location' : string,
          'max_resale_multiplier' : [] | [number],
        }
      } |
      { 'Err' : string }
  >,
  'get_events_by_organizer' : ActorMethod<
    [Principal],
    Array<
      {
        'id' : string,
        'organizer' : Principal,
        'whitelist' : [] | [Array<Principal>],
        'date' : bigint,
        'name' : string,
        'ticket_price' : bigint,
        'tickets_sold' : bigint,
        'total_tickets' : bigint,
        'funds_collected' : bigint,
        'location' : string,
        'max_resale_multiplier' : [] | [number],
      }
    >
  >,
  'get_ticket' : ActorMethod<
    [bigint],
    {
        'Ok' : {
          'id' : bigint,
          'owner' : Principal,
          'metadata' : {
            'image_url' : [] | [string],
            'seat' : [] | [string],
            'tier' : [] | [string],
            'event_id' : string,
          },
          'transfer_history' : Array<[bigint, Principal]>,
          'original_price' : bigint,
        }
      } |
      { 'Err' : string }
  >,
  'get_tickets_by_owner' : ActorMethod<
    [Principal],
    Array<
      {
        'id' : bigint,
        'owner' : Principal,
        'metadata' : {
          'image_url' : [] | [string],
          'seat' : [] | [string],
          'tier' : [] | [string],
          'event_id' : string,
        },
        'transfer_history' : Array<[bigint, Principal]>,
        'original_price' : bigint,
      }
    >
  >,
  'icrc7_metadata' : ActorMethod<
    [bigint],
    {
        'Ok' : {
          'image_url' : [] | [string],
          'seat' : [] | [string],
          'tier' : [] | [string],
          'event_id' : string,
        }
      } |
      { 'Err' : string }
  >,
  'icrc7_owner_of' : ActorMethod<
    [bigint],
    { 'Ok' : Principal } |
      { 'Err' : string }
  >,
  'icrc7_transfer_history' : ActorMethod<
    [bigint],
    { 'Ok' : Array<[bigint, Principal]> } |
      { 'Err' : string }
  >,
  'purchase_ticket' : ActorMethod<
    [string],
    { 'Ok' : bigint } |
      { 'Err' : string }
  >,
  'transfer_ticket' : ActorMethod<
    [bigint, Principal, [] | [bigint]],
    { 'Ok' : null } |
      { 'Err' : string }
  >,
  'withdraw_funds' : ActorMethod<
    [string, bigint],
    { 'Ok' : null } |
      { 'Err' : string }
  >,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
