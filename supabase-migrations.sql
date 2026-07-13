-- Run this in Supabase SQL Editor

-- Track processed deposit transactions (prevents double-crediting)
CREATE TABLE IF NOT EXISTS deposit_txns (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  tx_hash text NOT NULL,
  currency text NOT NULL DEFAULT 'USDT',
  amount numeric NOT NULL,
  network text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(tx_hash, network)
);

-- Leveraged positions
CREATE TABLE IF NOT EXISTS positions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  symbol text NOT NULL,
  side text NOT NULL CHECK (side IN ('long', 'short')),
  size numeric NOT NULL,       -- position size in base currency
  entry_price numeric NOT NULL,
  leverage int NOT NULL DEFAULT 1,
  margin numeric NOT NULL,     -- USDT locked as margin
  created_at timestamptz DEFAULT now(),
  closed_at timestamptz,
  close_price numeric,
  pnl numeric,
  status text DEFAULT 'open' CHECK (status IN ('open', 'closed', 'liquidated'))
);

-- Solana wallet address for SPL USDT deposits
ALTER TABLE users ADD COLUMN IF NOT EXISTS solana_address text;
