import Map "mo:core/Map";
import Array "mo:core/Array";
import Float "mo:core/Float";
import Iter "mo:core/Iter";
import List "mo:core/List";
import Nat "mo:core/Nat";
import Order "mo:core/Order";
import Text "mo:core/Text";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Int "mo:core/Int";
import Migration "migration";

import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

// Apply migration using the with clause
(with migration = Migration.run)
actor {
  let adminPinAttempts = Map.empty<Principal, Nat>();
  let adminPinLockoutTime = Map.empty<Principal, Int>();

  // Product Category
  public type ProductCategory = {
    id : Nat;
    name : Text;
    description : Text;
  };

  // Product
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

  public type ApprovalStatus = {
    #pending;
    #approved;
    #declined;
  };

  // Order type (includes buyerUsername, email, and contact)
  public type Order = {
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

  // User profile type (includes username and contact info)
  public type UserProfile = {
    username : Text;
    email : Text;
    contact : Text;
  };

  public type ProductError = {
    #NotFound;
    #Unauthorized;
    #GenericError : Text;
  };

  public type StoreSettings = {
    paypalWalletAddress : Text;
    bitcoinWalletAddress : Text;
    ethereumWalletAddress : Text;
  };

  public type Result = {
    #ok;
    #err : Text;
  };

  // Subscription Tier type
  public type SubscriptionTier = {
    id : Nat;
    name : Text;
    monthlyPrice : Float;
    yearlyPrice : Float;
    perks : [Text];
    freeTrialEnabled : Bool;
  };

  // Internal State
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
  var nextSubscriptionTierId = 5;
  let tiersInitialized = true; // always true after migration

  var storeSettings : StoreSettings = {
    paypalWalletAddress = "";
    bitcoinWalletAddress = "";
    ethereumWalletAddress = "";
  };

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Store Settings Functions
  public shared ({ caller }) func updatePaypalWalletAddress(address : Text) : async Result {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      return #err("Unauthorized: Only admins can update store settings");
    };
    storeSettings := { storeSettings with paypalWalletAddress = address };
    #ok;
  };

  public shared ({ caller }) func updateBitcoinWalletAddress(address : Text) : async Result {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      return #err("Unauthorized: Only admins can update store settings");
    };
    storeSettings := { storeSettings with bitcoinWalletAddress = address };
    #ok;
  };

  public shared ({ caller }) func updateEthereumWalletAddress(address : Text) : async Result {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      return #err("Unauthorized: Only admins can update store settings");
    };
    storeSettings := { storeSettings with ethereumWalletAddress = address };
    #ok;
  };

  public query func getStoreSettings() : async StoreSettings {
    storeSettings;
  };

  module Category {
    public func compareById(category1 : ProductCategory, category2 : ProductCategory) : Order.Order {
      Nat.compare(category1.id, category2.id);
    };
  };

  // Get all subscription tiers (public, no auth required, always seeded after deploy)
  public query func getSubscriptionTiers() : async [SubscriptionTier] {
    subscriptionTiers.values().toArray();
  };

  // Update subscription tier prices - any authenticated (non-anonymous) principal is allowed.
  // The PIN gate on the frontend is the sole access control layer for these operations.
  public shared ({ caller }) func updateSubscriptionTierPrices(id : Nat, monthlyPrice : Float, yearlyPrice : Float) : async Result {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      return #err("Unauthorized: Must be authenticated to perform this action");
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

  // Set subscription tier free trial - any authenticated (non-anonymous) principal is allowed.
  // The PIN gate on the frontend is the sole access control layer for these operations.
  public shared ({ caller }) func setSubscriptionTierFreeTrial(id : Nat, enabled : Bool) : async Result {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      return #err("Unauthorized: Must be authenticated to perform this action");
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

  // User Profile (required by frontend)
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

  // Username Management
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

  // Admin Whitelist Management
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

  // Case-sensitive lookup of username in the adminUsernames stable map
  public query func isAdminUsername(username : Text) : async Bool {
    adminUsernames.containsKey(username);
  };

  // Product Category Management (Admin only)
  public shared ({ caller }) func addCategory(name : Text, description : Text) : async Result {
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

  public shared ({ caller }) func updateCategory(id : Nat, name : Text, description : Text) : async Result {
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

  public shared ({ caller }) func deleteCategory(id : Nat) : async Result {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      return #err("Unauthorized: Only admins can delete categories");
    };

    categories.remove(id);
    #ok;
  };

  // Product Management
  // Any authenticated (non-anonymous) principal may call these functions.
  // The PIN gate enforced by AdminAccessControl on the frontend is the sole access control layer.
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

  public shared ({ caller }) func addProduct(gameName : Text, categoryId : Nat, title : Text, description : Text, accountDetails : Text, price : Nat, available : Bool) : async Result {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      return #err("Unauthorized: Must be authenticated to add products");
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

  public shared ({ caller }) func updateProduct(id : Nat, gameName : Text, categoryId : Nat, title : Text, description : Text, accountDetails : Text, price : Nat, available : Bool) : async Result {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      return #err("Unauthorized: Must be authenticated to update products");
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

  public shared ({ caller }) func deleteProduct(id : Nat) : async Result {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      return #err("Unauthorized: Must be authenticated to delete products");
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
  ) : async Result {
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

  // Retrieves ALL orders. No filter except by caller being authorized.
  public query ({ caller }) func getOrders() : async [Order] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all orders");
    };
    orders.values().toArray();
  };

  public shared ({ caller }) func approveOrder(orderId : Nat) : async { #ok; #err : Text } {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      return #err("Unauthorized: Only admins can approve orders.");
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
      return #err("Unauthorized: Only admins can decline orders.");
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

  // Returns orders for the given principal. Caller must be that principal or an admin.
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

  // Public Catalogue Queries (no auth required)
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
    categories.values().toArray().sort(Category.compareById);
  };

  public query func getAvailableProducts() : async [Product] {
    products.values().toArray().filter(func(p) { p.available }).sort();
  };

  public query func getAvailableProductsByPrice() : async [Product] {
    products.values().toArray().filter(func(p) { p.available }).sort(Product.compareByPrice);
  };

  // User Order Queries
  public query ({ caller }) func getUserOrders(user : Principal) : async [Order] {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your orders");
    };
    orders.values().toArray().filter(func(order) { order.buyer == user });
  };

  public query ({ caller }) func getOrdersByUsername(username : Text) : async [Order] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can get orders by username");
    };
    orders.values().toArray().filter(func(order) { order.buyerUsername == username });
  };

  public query ({ caller }) func getAllOrders() : async [Order] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all orders");
    };
    orders.values().toArray();
  };

  // Admin PIN Verification System
  // Any authenticated caller may attempt PIN verification (it is the authentication mechanism itself).
  // Anonymous principals (guests) are intentionally allowed so that users can verify the PIN
  // before being granted admin access.
  public shared ({ caller }) func verifyAdminPin(pin : Text) : async {
    #ok : Bool;
    #err : Text;
  } {
    let correctPin = "2006";
    let maxAttempts = 4;
    let lockoutDuration = 3600;

    let now = Time.now() / 1_000_000_000;

    switch (adminPinLockoutTime.get(caller)) {
      case (?lockoutExpiry) {
        if (now < lockoutExpiry) {
          let remainingSeconds = lockoutExpiry - now;
          let minutes = remainingSeconds / 60;
          return #err(
            "Locked out. Try again in " # minutes.toText() # " minutes."
          );
        };
      };
      case (null) {};
    };

    if (pin == correctPin) {
      adminPinAttempts.remove(caller);
      return #ok(true);
    };

    let currentAttempts = switch (adminPinAttempts.get(caller)) {
      case (?attempts) { attempts };
      case (null) { 0 };
    };

    if (currentAttempts + 1 >= maxAttempts) {
      let lockoutExpiry = now + lockoutDuration;
      adminPinLockoutTime.add(caller, lockoutExpiry);
      adminPinAttempts.remove(caller);
      let lockoutDurationMinutes = lockoutDuration / 60;
      return #err(
        "Locked out. Try again in " # lockoutDurationMinutes.toText() # " minutes."
      );
    };

    let remainingAttempts = Int.abs(maxAttempts.toInt() - 1);

    adminPinAttempts.add(
      caller,
      currentAttempts + 1,
    );

    #err(
      "Incorrect PIN. You have " # remainingAttempts.toText() # " attempts remaining."
    );
  };

  // Callers may only check their own lockout status unless they are an admin.
  public shared ({ caller }) func getAdminPinLockoutStatus(principal : Principal) : async { isLockedOut : Bool; remainingSeconds : Int } {
    if (caller != principal and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only check your own lockout status");
    };
    switch (adminPinLockoutTime.get(principal)) {
      case (?lockoutExpiry) {
        let now = Time.now() / 1_000_000_000;
        if (now < lockoutExpiry) {
          let remaining = lockoutExpiry - now;
          return { isLockedOut = true; remainingSeconds = remaining };
        };
      };
      case (null) {};
    };
    { isLockedOut = false; remainingSeconds = 0 };
  };
};
