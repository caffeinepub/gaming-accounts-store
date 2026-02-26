import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Nat "mo:core/Nat";
import Int "mo:core/Int";

module {
  type OldActor = {
    adminPinAttempts : Map.Map<Principal, Nat>;
    adminPinLockoutTime : Map.Map<Principal, Int>;
    adminSessions : Map.Map<Principal, Bool>;
  };

  type NewActor = {};

  public func run(_old : OldActor) : NewActor {
    {};
  };
};
