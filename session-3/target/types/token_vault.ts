/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/token_vault.json`.
 */
export type TokenVault = {
    address: "7svqDu7iEfv47vCQHCPfXvgZ9pgfqTXEmdepVsZRHNZ1";
    metadata: {
        name: "tokenVault";
        version: "0.1.0";
        spec: "0.1.0";
        description: "Created with Anchor";
    };
    instructions: [
        {
            name: "deposit";
            discriminator: [242, 35, 198, 137, 82, 225, 242, 182];
            accounts: [
                {
                    name: "from";
                    writable: true;
                    signer: true;
                },
                {
                    name: "fromTokenAccount";
                    writable: true;
                },
                {
                    name: "vault";
                    writable: true;
                },
                {
                    name: "vaultTokenAccount";
                    writable: true;
                },
                {
                    name: "mint";
                },
                {
                    name: "tokenProgram";
                    address: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";
                }
            ];
            args: [
                {
                    name: "amount";
                    type: "u64";
                }
            ];
        },
        {
            name: "initialize";
            discriminator: [175, 175, 109, 31, 13, 152, 155, 237];
            accounts: [
                {
                    name: "signer";
                    writable: true;
                    signer: true;
                },
                {
                    name: "manager";
                },
                {
                    name: "vault";
                    writable: true;
                    pda: {
                        seeds: [
                            {
                                kind: "const";
                                value: [118, 97, 117, 108, 116];
                            },
                            {
                                kind: "account";
                                path: "manager";
                            }
                        ];
                    };
                },
                {
                    name: "vaultTokenAccount";
                    writable: true;
                    signer: true;
                },
                {
                    name: "mint";
                },
                {
                    name: "systemProgram";
                    address: "11111111111111111111111111111111";
                },
                {
                    name: "tokenProgram";
                    address: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";
                }
            ];
            args: [];
        },
        {
            name: "withdraw";
            discriminator: [183, 18, 70, 156, 148, 109, 161, 34];
            accounts: [
                {
                    name: "from";
                    writable: true;
                    signer: true;
                },
                {
                    name: "fromTokenAccount";
                    writable: true;
                },
                {
                    name: "vault";
                    writable: true;
                },
                {
                    name: "vaultTokenAccount";
                    writable: true;
                },
                {
                    name: "mint";
                },
                {
                    name: "tokenProgram";
                    address: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";
                }
            ];
            args: [];
        }
    ];
};
