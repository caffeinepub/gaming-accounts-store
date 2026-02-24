import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Order "mo:core/Order";
import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  module ProductCategory {
    public type ProductCategory = {
      id : Nat;
      name : Text;
      description : Text;
    };
  };

  type ProductCategory = ProductCategory.ProductCategory;

  module ProductModel {
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
  };

  type Product = ProductModel.Product;

  // Payment methods
  type PaymentMethod = {
    #paypal;
    #cryptocurrency;
    #ukGiftCard;
    #payIn3Installments;
  };

  // Order type
  type Order = {
    productId : Nat;
    buyer : Principal;
    paymentMethod : PaymentMethod;
    status : Text;
  };

  // User profile type
  public type UserProfile = {
    name : Text;
  };

  // Internal state
  let categories = Map.empty<Nat, ProductCategory>();
  let products = Map.empty<Nat, Product>();
  let orders = Map.empty<Nat, Order>();
  let userProfiles = Map.empty<Principal, UserProfile>();

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

  // ── User Profile Functions ──────────────────────────────────────────────────

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
    userProfiles.add(caller, profile);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  // ── Category Management (Admin only) ───────────────────────────────────────

  public shared ({ caller }) func addCategory(name : Text, description : Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only store owners can add categories");
    };

    let category = {
      id = nextCategoryId;
      name;
      description;
    };

    categories.add(nextCategoryId, category);
    nextCategoryId += 1;
    category.id;
  };

  public shared ({ caller }) func editCategory(id : Nat, name : Text, description : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only store owners can edit categories");
    };

    switch (categories.get(id)) {
      case (null) { Runtime.trap("Category does not exist.") };
      case (?_) {
        let updatedCategory = {
          id;
          name;
          description;
        };
        categories.add(id, updatedCategory);
      };
    };
  };

  public shared ({ caller }) func deleteCategory(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only store owners can delete categories");
    };

    if (not categories.containsKey(id)) {
      Runtime.trap("Category does not exist.");
    };
    categories.remove(id);
  };

  // ── Product Management (Admin only) ────────────────────────────────────────

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

  public shared ({ caller }) func addProduct(gameName : Text, categoryId : Nat, title : Text, description : Text, accountDetails : Text, price : Nat, available : Bool) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only store owners can add products");
    };

    let product = {
      id = nextProductId;
      gameName;
      categoryId;
      title;
      description;
      accountDetails;
      price;
      available;
    };

    products.add(nextProductId, product);
    nextProductId += 1;
    product.id;
  };

  public shared ({ caller }) func editProduct(id : Nat, gameName : Text, categoryId : Nat, title : Text, description : Text, accountDetails : Text, price : Nat, available : Bool) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only store owners can edit products");
    };

    switch (products.get(id)) {
      case (null) { Runtime.trap("Product does not exist.") };
      case (?_) {
        let updatedProduct = {
          id;
          gameName;
          categoryId;
          title;
          description;
          accountDetails;
          price;
          available;
        };
        products.add(id, updatedProduct);
      };
    };
  };

  public shared ({ caller }) func deleteProduct(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only store owners can delete products");
    };

    if (not products.containsKey(id)) {
      Runtime.trap("Product does not exist.");
    };
    products.remove(id);
  };

  // ── Order Management ───────────────────────────────────────────────────────

  public shared ({ caller }) func addOrder(productId : Nat, paymentMethod : PaymentMethod, status : Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only store users can purchase");
    };
    let order = {
      productId = productId;
      buyer = caller;
      paymentMethod;
      status;
    };

    orders.add(nextOrderId, order);
    nextOrderId += 1;
    nextOrderId - 1;
  };

  // Only the order's buyer or an admin may view a specific order
  public query ({ caller }) func getOrderById(id : Nat) : async Order {
    switch (orders.get(id)) {
      case (null) { Runtime.trap("Order does not exist.") };
      case (?order) {
        if (caller != order.buyer and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only view your own orders");
        };
        order;
      };
    };
  };

  // ── Public Catalogue Queries (no auth required) ────────────────────────────

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

  // A user can only query their own orders; admins can query any user's orders
  public query ({ caller }) func getUserOrders(user : Principal) : async [Order] {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own orders");
    };
    orders.values().toArray().filter(func(o) { o.buyer == user });
  };
};
