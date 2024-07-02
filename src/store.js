import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

export const useStore = create()(
  devtools(
    persist(
      (set, get) => ({
        authToken: null,

        setAuthToken: (token) => {
          set(() => ({
            authToken: token,
          }));
        },

        logout: () => {
          set(() => ({
            authToken: null,
          }));
        },

        cart: [],

        addToCart: (newCartItem) => {
          let updatedCart = [];
          const index = get().cart.findIndex(
            (cartItem) => cartItem.id === newCartItem.id
          );
          if (index === -1) {
            updatedCart = [...get().cart, newCartItem];
          } else {
            updatedCart = [...get().cart];
            updatedCart[index].quantity += newCartItem.quantity;
          }

          set(() => ({
            cart: updatedCart,
          }));
        },

        deleteToCart: (cartItemSelected) => {
          set(() => ({
            cart: get().cart.filter(
              (carItem) => carItem.id !== cartItemSelected.id
            ),
          }));
        },

        clearCart: () => {
          set(() => ({
            cart: [],
          }));
        },

        changeQuantity: (cartItemSelected, quantity) => {
          let updatedCart = [];
          const index = get().cart.findIndex(
            (cartItem) => cartItem.id === cartItemSelected.id
          );
          updatedCart = [...get().cart];
          updatedCart[index].quantity = quantity;
          set(() => ({
            cart: updatedCart,
          }));
        },

        changeQuantitySavedItems: (savedItemSelected, quantity) => {
          let updatedSavedItems = [];
          const index = get().savedItems.findIndex(
            (savedItem) => savedItem.id === savedItemSelected.id
          );
          updatedSavedItems = [...get().savedItems];
          updatedSavedItems[index].quantity = quantity;
          set(() => ({
            savedItems: updatedSavedItems,
          }));
        },

        savedItems: [],

        addToSavedItems: (newSavedItem) => {
          set(() => ({
            savedItems: [...get().savedItems, newSavedItem],
          }));
        },

        deleteToSavedItems: (savedItemSelected) => {
          set(() => ({
            savedItems: get().savedItems.filter(
              (savedItem) => savedItem.id !== savedItemSelected.id
            ),
          }));
        },
      }),
      { name: "ulima-shop-storage" }
    )
  )
);
