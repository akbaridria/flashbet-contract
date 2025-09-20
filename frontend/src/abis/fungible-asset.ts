export const PRIMARY_FUNGIBLE_STORE_ABI = {
  address: "0x1",
  name: "primary_fungible_store",
  friends: [],
  exposed_functions: [
    {
      name: "balance",
      visibility: "public",
      is_entry: false,
      is_view: true,
      generic_type_params: [{ constraints: [] }],
      params: ["address", "0x1::object::Object<T0>"],
      return: ["u64"],
    },
    {
      name: "is_balance_at_least",
      visibility: "public",
      is_entry: false,
      is_view: true,
      generic_type_params: [{ constraints: [] }],
      params: ["address", "0x1::object::Object<T0>", "u64"],
      return: ["bool"],
    },
  ],
  structs: [],
} as const;
