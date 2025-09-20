export const MOCK_USDC_ABI = {
  address: "0x4bb400aa241f0b7a0fb9ed4327b063ee2583c1e8dc810083f45cc08c378eb091",
  name: "usdc",
  friends: [],
  exposed_functions: [
    {
      name: "mint",
      visibility: "public",
      is_entry: true,
      is_view: false,
      generic_type_params: [],
      params: ["address"],
      return: [],
    },
    {
      name: "get_metadata",
      visibility: "public",
      is_entry: false,
      is_view: true,
      generic_type_params: [],
      params: [],
      return: ["0x1::object::Object\u003C0x1::fungible_asset::Metadata\u003E"],
    },
    {
      name: "mint_with_amount",
      visibility: "public",
      is_entry: true,
      is_view: false,
      generic_type_params: [],
      params: ["address", "u64"],
      return: [],
    },
  ],
  structs: [
    {
      name: "ManagedFungibleAsset",
      is_native: false,
      is_event: false,
      abilities: ["key"],
      generic_type_params: [],
      fields: [
        {
          name: "mint_ref",
          type: "0x1::fungible_asset::MintRef",
        },
        {
          name: "transfer_ref",
          type: "0x1::fungible_asset::TransferRef",
        },
        {
          name: "burn_ref",
          type: "0x1::fungible_asset::BurnRef",
        },
      ],
    },
  ],
} as const;
