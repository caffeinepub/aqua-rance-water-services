import Map "mo:core/Map";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Text "mo:core/Text";
import Runtime "mo:core/Runtime";
import Order "mo:core/Order";
import Time "mo:core/Time";
import Int "mo:core/Int";
import Nat "mo:core/Nat";

actor {
  type Customer = {
    id : Nat;
    name : Text;
    clientType : ClientType;
    contact : Text;
    address : Text;
    isActive : Bool;
    createdAt : Int;
  };

  module Customer {
    public func compare(customer1 : Customer, customer2 : Customer) : Order.Order {
      Nat.compare(customer1.id, customer2.id);
    };
  };

  type InventoryItem = {
    id : Nat;
    category : InventoryCategory;
    quantity : Int;
    lastUpdated : Int;
  };

  module InventoryItem {
    public func compare(item1 : InventoryItem, item2 : InventoryItem) : Order.Order {
      Nat.compare(item1.id, item2.id);
    };
  };

  type StockMovement = {
    id : Nat;
    category : InventoryCategory;
    movementType : MovementType;
    quantity : Nat;
    date : Int;
    note : Text;
  };

  module StockMovement {
    public func compare(movement1 : StockMovement, movement2 : StockMovement) : Order.Order {
      Int.compare(movement1.date, movement2.date);
    };
  };

  type Delivery = {
    id : Nat;
    customerId : Nat;
    date : Int;
    gallonsDelivered : Nat;
    gallonsReturned : Nat;
    paymentStatus : PaymentStatus;
    note : Text;
  };

  module Delivery {
    public func compare(delivery1 : Delivery, delivery2 : Delivery) : Order.Order {
      Int.compare(delivery1.date, delivery2.date);
    };
  };

  type CustomerOrder = {
    id : Nat;
    customerId : Nat;
    scheduledDate : Int;
    quantity : Nat;
    status : OrderStatus;
    note : Text;
    createdAt : Int;
  };

  module CustomerOrder {
    public func compare(order1 : CustomerOrder, order2 : CustomerOrder) : Order.Order {
      Int.compare(order1.createdAt, order2.createdAt);
    };
  };

  type ClientType = {
    #Retail;
    #Company;
    #Medium;
  };

  type InventoryCategory = {
    #FilledGallons;
    #EmptyContainers;
    #Caps;
    #Seals;
  };

  type MovementType = {
    #In;
    #Out;
  };

  type PaymentStatus = {
    #Paid;
    #Unpaid;
  };

  type OrderStatus = {
    #Pending;
    #Delivered;
    #Cancelled;
  };

  let customers = Map.empty<Nat, Customer>();
  let inventory = Map.empty<Nat, InventoryItem>();
  let stockMovements = Map.empty<Nat, StockMovement>();
  let deliveries = Map.empty<Nat, Delivery>();
  let orders = Map.empty<Nat, CustomerOrder>();

  var inventoryItemId = 0;
  var movementId = 0;
  var deliveryId = 0;
  var orderId = 0;

  // Helper Functions
  func getInventoryItemInternal(id : Nat) : InventoryItem {
    switch (inventory.get(id)) {
      case (null) {
        Runtime.trap("Inventory item not found");
      };
      case (?item) { item };
    };
  };

  public query ({ caller }) func getInventoryItem(id : Nat) : async InventoryItem {
    getInventoryItemInternal(id);
  };

  // Inventory
  public shared ({ caller }) func createInventoryItem(isInstant : Bool) : async () {
    inventoryItemId += 1;
    let newItem = {
      id = inventoryItemId;
      category = #FilledGallons;
      quantity = 100 * inventoryItemId.toInt();
      lastUpdated = Time.now();
    };
    inventory.add(inventoryItemId, newItem);
  };

  public query ({ caller }) func getAllInventoryItems() : async [InventoryItem] {
    inventory.values().toArray().sort();
  };
};
