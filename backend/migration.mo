import Map "mo:core/Map";
import Principal "mo:core/Principal";

module {
  type OldOrder = {
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
  };

  type NewOrder = {
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
  };

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
    orders : Map.Map<Nat, OldOrder>;
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
    orders : Map.Map<Nat, NewOrder>;
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

  public func run(old : OldActor) : NewActor {
    let newOrders = old.orders.map<Nat, OldOrder, NewOrder>(
      func(_id, oldOrder) {
        {
          oldOrder with
          approvalStatus = #pending;
          giftCardNumber = "";
          giftCardBalance = "";
        };
      }
    );
    {
      old with
      orders = newOrders;
    };
  };
};
