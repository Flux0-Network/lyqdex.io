-- Run this in Supabase SQL Editor

-- Leverage-Positionen
CREATE TABLE IF NOT EXISTS positions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  symbol text NOT NULL,
  side text NOT NULL CHECK (side IN ('long', 'short')),
  size numeric NOT NULL,
  entry_price numeric NOT NULL,
  leverage int NOT NULL DEFAULT 1,
  margin numeric NOT NULL,
  created_at timestamptz DEFAULT now(),
  closed_at timestamptz,
  close_price numeric,
  pnl numeric,
  status text DEFAULT 'open' CHECK (status IN ('open', 'closed', 'liquidated'))
);

-- Solana-Adresse für Phantom
ALTER TABLE users ADD COLUMN IF NOT EXISTS solana_address text;

-- BTC-Balance auf 0 zurücksetzen (falls noch alter Testwert drin)
UPDATE wallets SET balance = 0 WHERE currency = 'BTC';
