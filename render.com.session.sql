CREATE TABLE public.reviews (
  review_id SERIAL PRIMARY KEY,
  inv_id INT NOT NULL REFERENCES inventory(inv_id) ON DELETE CASCADE,
  account_id INT NOT NULL REFERENCES account(account_id) ON DELETE CASCADE,
  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);