import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface InventoryItem {
    id: bigint;
    lastUpdated: bigint;
    quantity: bigint;
    category: InventoryCategory;
}
export enum InventoryCategory {
    Seals = "Seals",
    Caps = "Caps",
    FilledGallons = "FilledGallons",
    EmptyContainers = "EmptyContainers"
}
export interface backendInterface {
    createInventoryItem(isInstant: boolean): Promise<void>;
    getAllInventoryItems(): Promise<Array<InventoryItem>>;
    getInventoryItem(id: bigint): Promise<InventoryItem>;
}
