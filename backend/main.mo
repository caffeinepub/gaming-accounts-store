import Map "mo:core/Map";
import Array "mo:core/Array";
import Float "mo:core/Float";
import Order "mo:core/Order";
import Principal "mo:core/Principal";
import Text "mo:core/Text";
import Runtime "mo:core/Runtime";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Result "mo:core/Result";
import Migration "migration";

import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

// Apply migration using with clause
(with migration = Migration.run)
actor {
  public type ProductCategory = {
    id : Nat;
    name : Text;
    description : Text;
  };

  public type Product = {
    id : Nat;
    gameName : Text;
    categoryId : Nat;
    title : Text;
    description : Text;
    accountDetails : Text;
    price : Nat;
    available : Bool;
  };

  public type PaymentMethod = {
    #paypal;
    #cryptocurrency;
    #ukGiftCard;
    #payIn3Installments;
  };

  public type OrderApprovalStatus = {
    #pending;
    #approved;
    #declined;
  };

  public type Order = {
    productId : Nat;
    buyer : Principal;
    buyerUsername : Text;
    buyerEmail : Text;
    buyerContact : Text;
    paymentMethod : PaymentMethod;
    status : Text;
    approvalStatus : OrderApprovalStatus;
    giftCardNumber : Text;
    giftCardBalance : Text;
  };

  public type UserProfile = {
    username : Text;
    email : Text;
    contact : Text;
  };

  public type StoreSettings = {
    paypalWalletAddress : Text;
    bitcoinWalletAddress : Text;
    ethereumWalletAddress : Text;
  };

  public type SubscriptionTier = {
    id : Nat;
    name : Text;
    monthlyPrice : Float;
    yearlyPrice : Float;
    perks : [Text];
    freeTrialEnabled : Bool;
  };

  let products = Map.empty<Nat, Product>();
  let categories = Map.empty<Nat, ProductCategory>();
  let orders = Map.empty<Nat, Order>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  let adminUsernames = Map.empty<Text, ()>();
  let usernameIndex = Map.empty<Text, Principal>();
  let subscriptionTiers = Map.empty<Nat, SubscriptionTier>();

  var nextCategoryId = 1;
  var nextProductId = 1;
  var nextOrderId = 1;
  var nextSubscriptionTierId = 1;

  var storeSettings : StoreSettings = {
    paypalWalletAddress = "";
    bitcoinWalletAddress = "";
    ethereumWalletAddress = "";
  };

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public shared ({ caller }) func updatePaypalWalletAddress(address : Text) : async { #ok; #err : Text } {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      return #err("Unauthorized: Only admins can update store settings");
    };
    storeSettings := { storeSettings with paypalWalletAddress = address };
    #ok;
  };

  public shared ({ caller }) func updateBitcoinWalletAddress(address : Text) : async { #ok; #err : Text } {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      return #err("Unauthorized: Only admins can update store settings");
    };
    storeSettings := { storeSettings with bitcoinWalletAddress = address };
    #ok;
  };

  public shared ({ caller }) func updateEthereumWalletAddress(address : Text) : async { #ok; #err : Text } {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      return #err("Unauthorized: Only admins can update store settings");
    };
    storeSettings := { storeSettings with ethereumWalletAddress = address };
    #ok;
  };

  public query ({ caller }) func getStoreSettings() : async StoreSettings {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view store settings");
    };
    storeSettings;
  };

  public shared ({ caller }) func updateSubscriptionTierPrices(id : Nat, monthlyPrice : Float, yearlyPrice : Float) : async { #ok; #err : Text } {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      return #err("Unauthorized: Only admins can update subscription tier prices");
    };
    switch (subscriptionTiers.get(id)) {
      case (null) { #err("Subscription tier not found") };
      case (?tier) {
        let updatedTier : SubscriptionTier = {
          id;
          name = tier.name;
          monthlyPrice;
          yearlyPrice;
          perks = tier.perks;
          freeTrialEnabled = tier.freeTrialEnabled;
        };
        subscriptionTiers.add(id, updatedTier);
        #ok;
      };
    };
  };

  public shared ({ caller }) func setSubscriptionTierFreeTrial(id : Nat, enabled : Bool) : async { #ok; #err : Text } {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      return #err("Unauthorized: Only admins can update subscription tier free trial");
    };
    switch (subscriptionTiers.get(id)) {
      case (null) { #err("Subscription tier not found") };
      case (?tier) {
        let updatedTier : SubscriptionTier = {
          id;
          name = tier.name;
          monthlyPrice = tier.monthlyPrice;
          yearlyPrice = tier.yearlyPrice;
          perks = tier.perks;
          freeTrialEnabled = enabled;
        };
        subscriptionTiers.add(id, updatedTier);
        #ok;
      };
    };
  };

  public shared ({ caller }) func createSubscriptionTier(
    name : Text,
    monthlyPrice : Float,
    yearlyPrice : Float,
    perks : [Text],
    freeTrialEnabled : Bool,
  ) : async { #ok : SubscriptionTier; #err : Text } {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      return #err("Unauthorized: Only admins can create subscription tiers");
    };

    let id = nextSubscriptionTierId;
    let tier : SubscriptionTier = {
      id;
      name;
      monthlyPrice;
      yearlyPrice;
      perks;
      freeTrialEnabled;
    };

    subscriptionTiers.add(id, tier);
    nextSubscriptionTierId += 1;
    #ok(tier);
  };

  public shared ({ caller }) func deleteSubscriptionTier(id : Nat) : async { #ok; #err : Text } {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      return #err("Unauthorized: Only admins can delete subscription tiers");
    };
    switch (subscriptionTiers.containsKey(id)) {
      case (true) {
        subscriptionTiers.remove(id);
        #ok;
      };
      case (false) {
        #err("Subscription tier not found");
      };
    };
  };

  public query func getSubscriptionTiers() : async [SubscriptionTier] {
    subscriptionTiers.values().toArray();
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get their profile");
    };
    userProfiles.get(caller);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    if (profile.username.contains(#char ' ')) {
      Runtime.trap("Username cannot contain spaces");
    };
    if (profile.username != "") {
      switch (usernameIndex.get(profile.username)) {
        case (?existingPrincipal) {
          if (existingPrincipal != caller) {
            Runtime.trap("Username already taken");
          };
        };
        case (null) {};
      };
      switch (userProfiles.get(caller)) {
        case (?oldProfile) {
          if (oldProfile.username != "" and oldProfile.username != profile.username) {
            usernameIndex.remove(oldProfile.username);
          };
        };
        case (null) {};
      };
      usernameIndex.add(profile.username, caller);
    };
    userProfiles.add(caller, profile);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public query func isUsernameAvailable(username : Text) : async Bool {
    if (username.contains(#char ' ')) {
      return false;
    };
    not usernameIndex.containsKey(username);
  };

  public shared ({ caller }) func createUsername(username : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can set usernames");
    };
    if (username.contains(#char ' ')) {
      Runtime.trap("Username cannot contain spaces");
    };
    switch (usernameIndex.get(username)) {
      case (?existingPrincipal) {
        if (existingPrincipal != caller) {
          Runtime.trap("Username already taken");
        };
      };
      case (null) {};
    };
    switch (userProfiles.get(caller)) {
      case (?oldProfile) {
        if (oldProfile.username != "" and oldProfile.username != username) {
          usernameIndex.remove(oldProfile.username);
        };
      };
      case (null) {};
    };
    usernameIndex.add(username, caller);
    switch (userProfiles.get(caller)) {
      case (null) {
        let profile : UserProfile = {
          username;
          email = "";
          contact = "";
        };
        userProfiles.add(caller, profile);
      };
      case (?existing) {
        userProfiles.add(
          caller,
          { existing with username },
        );
      };
    };
  };

  public query func hasUsername(user : Principal) : async Bool {
    switch (userProfiles.get(user)) {
      case (null) { false };
      case (?profile) { profile.username != "" };
    };
  };

  public query func getUsernameByPrincipal(user : Principal) : async ?Text {
    switch (userProfiles.get(user)) {
      case (null) { null };
      case (?profile) {
        if (profile.username == "") { null } else { ?profile.username };
      };
    };
  };

  public shared ({ caller }) func addAdminUser(username : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can modify whitelist");
    };
    adminUsernames.add(username, ());
  };

  public shared ({ caller }) func removeAdminUser(username : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can modify whitelist");
    };
    adminUsernames.remove(username);
  };

  public query func isAdminUsername(username : Text) : async Bool {
    adminUsernames.containsKey(username);
  };

  public shared ({ caller }) func addCategory(name : Text, description : Text) : async { #ok; #err : Text } {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      return #err("Unauthorized: Only admins can add categories");
    };

    let id = nextCategoryId;
    let category : ProductCategory = {
      id;
      name;
      description;
    };

    categories.add(id, category);
    nextCategoryId += 1;
    #ok;
  };

  public shared ({ caller }) func updateCategory(id : Nat, name : Text, description : Text) : async { #ok; #err : Text } {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      return #err("Unauthorized: Only admins can update categories");
    };

    let category : ProductCategory = {
      id;
      name;
      description;
    };
    categories.add(id, category);
    #ok;
  };

  public shared ({ caller }) func deleteCategory(id : Nat) : async { #ok; #err : Text } {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      return #err("Unauthorized: Only admins can delete categories");
    };

    categories.remove(id);
    #ok;
  };

  public shared ({ caller }) func addProduct(gameName : Text, categoryId : Nat, title : Text, description : Text, accountDetails : Text, price : Nat, available : Bool) : async { #ok; #err : Text } {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      return #err("Unauthorized: Only admins can create products");
    };
    let id = nextProductId;
    let product : Product = {
      id;
      gameName;
      categoryId;
      title;
      description;
      accountDetails;
      price;
      available;
    };
    products.add(id, product);
    nextProductId += 1;
    #ok;
  };

  public shared ({ caller }) func updateProduct(
    id : Nat,
    gameName : Text,
    categoryId : Nat,
    title : Text,
    description : Text,
    accountDetails : Text,
    price : Nat,
    available : Bool,
  ) : async { #ok; #err : Text } {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      return #err("Unauthorized: Only admins can update products");
    };
    let product : Product = {
      id;
      gameName;
      categoryId;
      title;
      description;
      accountDetails;
      price;
      available;
    };
    products.add(id, product);
    #ok;
  };

  public shared ({ caller }) func deleteProduct(id : Nat) : async { #ok; #err : Text } {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      return #err("Unauthorized: Only admins can delete products");
    };
    products.remove(id);
    #ok;
  };

  public shared ({ caller }) func placeOrder(
    buyerPrincipal : Principal,
    username : Text,
    email : Text,
    contactInfo : Text,
    productId : Nat,
    paymentMethod : PaymentMethod,
    giftCardNumber : Text,
    giftCardBalance : Text,
  ) : async { #ok; #err : Text } {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      return #err("Unauthorized: Only store users can place orders");
    };

    switch (products.get(productId)) {
      case (null) {
        return #err("Product does not exist. The available products might have changed due to concurrent purchases. Please refresh your basket. ");
      };
      case (?product) {
        if (not product.available) {
          return #err("Product was already purchased. The available products might have changed due to concurrent purchases. Please refresh your basket. ");
        };

        let order : Order = {
          buyer = buyerPrincipal;
          buyerUsername = username;
          buyerEmail = email;
          buyerContact = contactInfo;
          productId;
          paymentMethod;
          status = "";
          approvalStatus = #pending;
          giftCardNumber;
          giftCardBalance;
        };

        orders.add(nextOrderId, order);
        nextOrderId += 1;

        let updatedProduct : Product = {
          product with available = false;
        };
        products.add(productId, updatedProduct);

        #ok;
      };
    };
  };

  public query ({ caller }) func getOrders() : async [Order] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all orders");
    };
    orders.values().toArray();
  };

  public shared ({ caller }) func approveOrder(orderId : Nat) : async { #ok; #err : Text } {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      return #err("Unauthorized: Only admins can approve orders");
    };
    switch (orders.get(orderId)) {
      case (null) { #err("Order not found") };
      case (?order) {
        let updatedOrder = { order with approvalStatus = #approved };
        orders.add(orderId, updatedOrder);
        #ok;
      };
    };
  };

  public shared ({ caller }) func declineOrder(orderId : Nat) : async { #ok; #err : Text } {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      return #err("Unauthorized: Only admins can decline orders");
    };
    switch (orders.get(orderId)) {
      case (null) { #err("Order not found") };
      case (?order) {
        let updatedOrder = { order with approvalStatus = #declined };
        orders.add(orderId, updatedOrder);
        #ok;
      };
    };
  };

  public query ({ caller }) func getOrdersByBuyer(principal : Principal) : async [Order] {
    if (caller != principal and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own orders");
    };
    orders.values().toArray().filter(func(order) { order.buyer == principal });
  };

  public query ({ caller }) func getOrderById(id : Nat) : async Order {
    switch (orders.get(id)) {
      case (null) { Runtime.trap("Order does not exist.") };
      case (?order) {
        if (caller != order.buyer and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only view your orders");
        };
        order;
      };
    };
  };

  public query func getCategoryById(id : Nat) : async ProductCategory {
    switch (categories.get(id)) {
      case (null) { Runtime.trap("Category does not exist.") };
      case (?category) { category };
    };
  };

  public query func getProductById(id : Nat) : async Product {
    switch (products.get(id)) {
      case (null) { Runtime.trap("Product does not exist.") };
      case (?product) { product };
    };
  };

  public query func getAllCategories() : async [ProductCategory] {
    categories.values().toArray();
  };

  public query func getAvailableProducts() : async [Product] {
    products.values().toArray().filter(func(p) { p.available });
  };

  public query ({ caller }) func getUserOrders(user : Principal) : async [Order] {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your orders");
    };
    orders.values().toArray().filter(func(order) { order.buyer == user });
  };

  public query ({ caller }) func getAllOrders() : async [Order] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all orders");
    };
    orders.values().toArray();
  };

  module Product {
    public func compare(product1 : Product, product2 : Product) : Order.Order {
      switch (Text.compare(product1.gameName, product2.gameName)) {
        case (#equal) { Text.compare(product1.title, product2.title) };
        case (order) { order };
      };
    };

    public func compareByPrice(product1 : Product, product2 : Product) : Order.Order {
      Nat.compare(product1.price, product2.price);
    };
  };
};
