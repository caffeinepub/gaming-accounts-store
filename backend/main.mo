import Array "mo:core/Array";
import Nat "mo:core/Nat";
import Order "mo:core/Order";
import Text "mo:core/Text";
import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";

import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";


actor {
  // Product Category
  type ProductCategory = {
    id : Nat;
    name : Text;
    description : Text;
  };

  // Product
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

  // Payment methods
  type PaymentMethod = {
    #paypal;
    #cryptocurrency;
    #ukGiftCard;
    #payIn3Installments;
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

  public type Result = {
    #ok;
    #err : Text;
  };

  // Internal State
  let products = Map.empty<Nat, Product>();
  let categories = Map.empty<Nat, ProductCategory>();
  let orders = Map.empty<Nat, Order>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  let adminUsernames = Map.empty<Text, ()>();
  let usernameIndex = Map.empty<Text, Principal>();

  var nextCategoryId = 1;
  var nextProductId = 1;
  var nextOrderId = 1;

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  module Category {
    public func compareById(category1 : ProductCategory, category2 : ProductCategory) : Order.Order {
      Nat.compare(category1.id, category2.id);
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

  // Product Management (Admin only)
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
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      return #err("Unauthorized: Only admins can add products");
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

  public shared ({ caller }) func deleteProduct(id : Nat) : async Result {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      return #err("Unauthorized: Only admins can delete products");
    };

    products.remove(id);
    #ok;
  };

  // Order Management
  public shared ({ caller }) func addOrder(productId : Nat, paymentMethod : PaymentMethod, status : Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only store users can purchase");
    };

    let buyerProfile = switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("User profile not found.") };
      case (?profile) { profile };
    };

    let order : Order = {
      productId;
      buyer = caller;
      buyerUsername = buyerProfile.username;
      buyerEmail = buyerProfile.email;
      buyerContact = buyerProfile.contact;
      paymentMethod;
      status;
    };

    orders.add(nextOrderId, order);
    nextOrderId += 1;
    nextOrderId - 1;
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
};
