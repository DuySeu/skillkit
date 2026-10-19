# Blockchain security (Solana)

Stack-specific: read this only when the project signs or verifies Solana wallet data. Skip it otherwise.

## Wallet verification

`@solana/web3.js` does not export a `verify` function, so the earlier example's import was wrong. Wallet message signatures are ed25519; verify them with `tweetnacl` and decode the public key with `PublicKey`. The snippet below is unverified (not run against a live wallet): test it with a real signed message before relying on it.

```typescript
import nacl from 'tweetnacl'
import { PublicKey } from '@solana/web3.js'

function verifyWalletOwnership(
  publicKey: string,   // base58 address
  signature: string,   // base64 signature from the wallet
  message: string
): boolean {
  try {
    return nacl.sign.detached.verify(
      new TextEncoder().encode(message),
      Buffer.from(signature, 'base64'),
      new PublicKey(publicKey).toBytes()
    )
  } catch (error) {
    return false
  }
}
```

Use a server-issued, single-use nonce in `message` so a captured signature cannot be replayed.

## Transaction verification

```typescript
async function verifyTransaction(transaction: Transaction) {
  // Verify recipient
  if (transaction.to !== expectedRecipient) {
    throw new Error('Invalid recipient')
  }

  // Verify amount
  if (transaction.amount > maxAmount) {
    throw new Error('Amount exceeds limit')
  }

  // Verify user has sufficient balance
  const balance = await getBalance(transaction.from)
  if (balance < transaction.amount) {
    throw new Error('Insufficient balance')
  }

  return true
}
```

`Transaction` here is a simplified shape (`to`, `amount`, `from`), not the `@solana/web3.js` class, which exposes instructions instead. Adapt the checks to the instruction data.

## Verification steps

- [ ] Wallet signatures verified
- [ ] Transaction details validated
- [ ] Balance checks before transactions
- [ ] No blind transaction signing
