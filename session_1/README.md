# session_1: Flare CLI
## Goal:
Create a command line interface tool with the following capabilities:
1. generate: generates new keypair
2. airdrop: request Airdrops
3. send: send SOL from one wallet to another
4. balance: show balance of a wallet

## Setup
```bash
chmod +x setup.sh && ./setup.sh
```

## Features:
### generate
Generates a new private and public key. If an outfile is specified, the string representations as well as byte arrays are saved to it. Otherwise, both public and private key are written to the terminal.

```bash
flare generate [-o <file>]
```

```bash
flare generate [--outfile <file>]
```

### airdrop
Requests the specified amount of SOL from the cluster.

```bash
flare airdrop -a <amount> -r <receiverPublicKey>
```

```bash
flare airdrop --amount <amount> --receiver <receiverPublicKey>
```

### send
Sends the specified amount of SOL.

```bash
flare send -a <amount> -s <senderPrivateKey> -r <receiverPublicKey>
```

```bash
flare send --amount <amount> --sender <senderPrivateKey> --receiver <receiverPublicKey>
```

### balance
Shows the balance of the specified wallet.

```bash
flare balance <publicKey>
```
