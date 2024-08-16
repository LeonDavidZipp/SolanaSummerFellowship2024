/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/hello_anchor.json`.
 */
export type HelloAnchor = {
  "address": "Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS",
  "metadata": {
    "name": "helloAnchor",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "setData",
      "discriminator": [
        223,
        114,
        91,
        136,
        197,
        78,
        153,
        153
      ],
      "accounts": [
        {
          "name": "myAccount",
          "writable": true
        }
      ],
      "args": [
        {
          "name": "data",
          "type": "u64"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "myAccount",
      "discriminator": [
        246,
        28,
        6,
        87,
        251,
        45,
        50,
        42
      ]
    }
  ],
  "types": [
    {
      "name": "myAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "data",
            "type": "u64"
          }
        ]
      }
    }
  ]
};
