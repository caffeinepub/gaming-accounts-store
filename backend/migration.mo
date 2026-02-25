import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";

module {
  type ProductCategory = {
    id : Nat;
    name : Text;
    description : Text;
  };

  type Product = {
    id : Nat;
    gameName : Text;
    categoryId : Nat;
    title : Text;
    description : Text;
    accountDetails : Text;
    price : Nat;
    available : Bool;
  };

  type PaymentMethod = {
    #paypal;
    #cryptocurrency;
    #ukGiftCard;
    #payIn3Installments;
  };

  type ApprovalStatus = {
    #pending;
    #approved;
    #declined;
  };

  type Order = {
    productId : Nat;
    buyer : Principal;
    buyerUsername : Text;
    buyerEmail : Text;
    buyerContact : Text;
    paymentMethod : PaymentMethod;
    status : Text;
    approvalStatus : ApprovalStatus;
    giftCardNumber : Text;
    giftCardBalance : Text;
  };

  type UserProfile = {
    username : Text;
    email : Text;
    contact : Text;
  };

  type StoreSettings = {
    paypalWalletAddress : Text;
    bitcoinWalletAddress : Text;
    ethereumWalletAddress : Text;
  };

  type SubscriptionTier = {
    id : Nat;
    name : Text;
    monthlyPrice : Float;
    yearlyPrice : Float;
    perks : [Text];
    freeTrialEnabled : Bool;
  };

  type OldActor = {
    categories : Map.Map<Nat, ProductCategory>;
    products : Map.Map<Nat, Product>;
    orders : Map.Map<Nat, Order>;
    nextCategoryId : Nat;
    nextProductId : Nat;
    nextOrderId : Nat;
    userProfiles : Map.Map<Principal, UserProfile>;
    adminUsernames : Map.Map<Text, ()>;
    usernameIndex : Map.Map<Text, Principal>;
    subscriptionTiers : Map.Map<Nat, SubscriptionTier>;
    nextSubscriptionTierId : Nat;
    storeSettings : StoreSettings;
    tiersInitialized : Bool;
    adminPinAttempts : Map.Map<Principal, Nat>;
    adminPinLockoutTime : Map.Map<Principal, Int>;
  };

  type NewActor = {
    categories : Map.Map<Nat, ProductCategory>;
    products : Map.Map<Nat, Product>;
    orders : Map.Map<Nat, Order>;
    nextCategoryId : Nat;
    nextProductId : Nat;
    nextOrderId : Nat;
    userProfiles : Map.Map<Principal, UserProfile>;
    adminUsernames : Map.Map<Text, ()>;
    usernameIndex : Map.Map<Text, Principal>;
    subscriptionTiers : Map.Map<Nat, SubscriptionTier>;
    nextSubscriptionTierId : Nat;
    storeSettings : StoreSettings;
    tiersInitialized : Bool;
    adminPinAttempts : Map.Map<Principal, Nat>;
    adminPinLockoutTime : Map.Map<Principal, Int>;
  };

  public func run(old : OldActor) : NewActor {
    { old with tiersInitialized = true };
  };
};
