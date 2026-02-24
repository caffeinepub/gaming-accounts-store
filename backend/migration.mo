import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Principal "mo:core/Principal";

module {
  type OldActor = {
    products : Map.Map<Nat, {
      id : Nat;
      gameName : Text;
      categoryId : Nat;
      title : Text;
      description : Text;
      accountDetails : Text;
      price : Nat;
      available : Bool;
    }>;
    categories : Map.Map<Nat, {
      id : Nat;
      name : Text;
      description : Text;
    }>;
    orders : Map.Map<Nat, {
      productId : Nat;
      buyer : Principal;
      buyerUsername : Text;
      buyerEmail : Text;
      buyerContact : Text;
      paymentMethod : {
        #paypal;
        #cryptocurrency;
        #ukGiftCard;
        #payIn3Installments;
      };
      status : Text;
      approvalStatus : {
        #pending;
        #approved;
        #declined;
      };
      giftCardNumber : Text;
      giftCardBalance : Text;
    }>;
    userProfiles : Map.Map<Principal, {
      username : Text;
      email : Text;
      contact : Text;
    }>;
    adminUsernames : Map.Map<Text, ()>;
    usernameIndex : Map.Map<Text, Principal>;
    subscriptionTiers : Map.Map<Nat, {
      id : Nat;
      name : Text;
      monthlyPrice : Float;
      yearlyPrice : Float;
      perks : [Text];
      freeTrialEnabled : Bool;
    }>;
    nextCategoryId : Nat;
    nextProductId : Nat;
    nextOrderId : Nat;
    nextSubscriptionTierId : Nat;
    tiersInitialized : Bool;
    storeSettings : {
      paypalWalletAddress : Text;
      bitcoinWalletAddress : Text;
      ethereumWalletAddress : Text;
    };
  };

  type NewActor = {
    products : Map.Map<Nat, {
      id : Nat;
      gameName : Text;
      categoryId : Nat;
      title : Text;
      description : Text;
      accountDetails : Text;
      price : Nat;
      available : Bool;
    }>;
    categories : Map.Map<Nat, {
      id : Nat;
      name : Text;
      description : Text;
    }>;
    orders : Map.Map<Nat, {
      productId : Nat;
      buyer : Principal;
      buyerUsername : Text;
      buyerEmail : Text;
      buyerContact : Text;
      paymentMethod : {
        #paypal;
        #cryptocurrency;
        #ukGiftCard;
        #payIn3Installments;
      };
      status : Text;
      approvalStatus : {
        #pending;
        #approved;
        #declined;
      };
      giftCardNumber : Text;
      giftCardBalance : Text;
    }>;
    userProfiles : Map.Map<Principal, {
      username : Text;
      email : Text;
      contact : Text;
    }>;
    adminUsernames : Map.Map<Text, ()>;
    usernameIndex : Map.Map<Text, Principal>;
    subscriptionTiers : Map.Map<Nat, {
      id : Nat;
      name : Text;
      monthlyPrice : Float;
      yearlyPrice : Float;
      perks : [Text];
      freeTrialEnabled : Bool;
    }>;
    nextCategoryId : Nat;
    nextProductId : Nat;
    nextOrderId : Nat;
    nextSubscriptionTierId : Nat;
    tiersInitialized : Bool;
    storeSettings : {
      paypalWalletAddress : Text;
      bitcoinWalletAddress : Text;
      ethereumWalletAddress : Text;
    };
    adminPinAttempts : Map.Map<Principal, Nat>;
    adminPinLockoutTime : Map.Map<Principal, Int>;
  };

  public func run(old : OldActor) : NewActor {
    {
      old with
      adminPinAttempts = Map.empty<Principal, Nat>();
      adminPinLockoutTime = Map.empty<Principal, Int>();
    };
  };
};
