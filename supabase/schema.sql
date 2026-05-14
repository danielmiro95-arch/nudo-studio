-- Nudo Studio · esquema Supabase
-- Pegar en Supabase Dashboard → SQL Editor → New query → Run.
-- Idempotente: usa CREATE TABLE IF NOT EXISTS y DROP/CREATE triggers.

-- ───────────────────────────────────────────────────────────────
-- PROFILES: extiende auth.users con datos del cliente
-- ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email       TEXT NOT NULL,
  nombre      TEXT,
  apellidos   TEXT,
  telefono    TEXT,
  direccion   TEXT,
  ciudad      TEXT,
  cp          TEXT,
  pais        TEXT DEFAULT 'España',
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Profiles: read own" ON public.profiles;
CREATE POLICY "Profiles: read own"   ON public.profiles FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Profiles: update own" ON public.profiles;
CREATE POLICY "Profiles: update own" ON public.profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Profiles: insert own" ON public.profiles;
CREATE POLICY "Profiles: insert own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- ───────────────────────────────────────────────────────────────
-- CART_ITEMS: una fila por producto en el carrito de un usuario.
-- (No hay tabla "carts" parent — cada user tiene UN carrito activo.)
-- ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.cart_items (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  product_slug  TEXT NOT NULL,
  product_name  TEXT NOT NULL,
  product_meta  TEXT,
  price_cents   INTEGER NOT NULL,
  qty           INTEGER NOT NULL DEFAULT 1 CHECK (qty > 0),
  added_at      TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, product_slug)
);

ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Cart: own only" ON public.cart_items;
CREATE POLICY "Cart: own only" ON public.cart_items FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ───────────────────────────────────────────────────────────────
-- ORDERS: pedidos completados (snapshot del momento de compra)
-- ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.orders (
  id                 UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id            UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status             TEXT NOT NULL DEFAULT 'pending'
                       CHECK (status IN ('pending','paid','shipped','delivered','cancelled','refunded')),
  total_cents        INTEGER NOT NULL,
  shipping_cents     INTEGER NOT NULL DEFAULT 0,
  currency           TEXT NOT NULL DEFAULT 'EUR',
  shipping_nombre    TEXT,
  shipping_email     TEXT,
  shipping_telefono  TEXT,
  shipping_direccion TEXT,
  shipping_ciudad    TEXT,
  shipping_cp        TEXT,
  shipping_pais      TEXT,
  stripe_session_id  TEXT UNIQUE,
  created_at         TIMESTAMPTZ DEFAULT now(),
  updated_at         TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Orders: read own" ON public.orders;
CREATE POLICY "Orders: read own" ON public.orders FOR SELECT USING (auth.uid() = user_id);

-- ───────────────────────────────────────────────────────────────
-- ORDER_ITEMS: items dentro de cada pedido
-- ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.order_items (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id      UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  product_slug  TEXT NOT NULL,
  product_name  TEXT NOT NULL,
  product_meta  TEXT,
  price_cents   INTEGER NOT NULL,
  qty           INTEGER NOT NULL CHECK (qty > 0)
);

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Order items: read via order" ON public.order_items;
CREATE POLICY "Order items: read via order" ON public.order_items FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.orders
    WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()
  ));

-- ───────────────────────────────────────────────────────────────
-- TRIGGER: cuando un usuario se registra en auth.users,
-- crear automáticamente su fila en public.profiles
-- ───────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (new.id, new.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ───────────────────────────────────────────────────────────────
-- TRIGGER: actualizar updated_at automáticamente
-- ───────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_updated_at ON public.profiles;
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

DROP TRIGGER IF EXISTS orders_updated_at ON public.orders;
CREATE TRIGGER orders_updated_at BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
