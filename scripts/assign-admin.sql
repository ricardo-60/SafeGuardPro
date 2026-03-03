DO $$ 
DECLARE
  v_user_id UUID;
  v_company_id UUID; -- CORRIGIDO: O ID da empresa é UUID e não INT
BEGIN
  -- 1. Obter o ID do utilizador admin
  SELECT id INTO v_user_id 
  FROM auth.users 
  WHERE email = 'admin@safeguard.com' 
  LIMIT 1;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Atenção: O utilizador admin@safeguard.com não existe na tabela auth.users. Garantir que a conta foi criada.';
  END IF;

  -- 2. Inserir a Empresa Matriz e capturar o ID (que é UUID)
  INSERT INTO public.companies (name, nif, address) 
  VALUES ('SafeGuard HQ', '123456789', 'Sede Central')
  RETURNING id INTO v_company_id;

  -- 3. Inserir na tabela user_roles
  INSERT INTO public.user_roles (user_id, company_id, role)
  VALUES (v_user_id, v_company_id, 'admin');

  RAISE NOTICE '✅ SUCESSO! Empresa % criada e associada ao user %', v_company_id, v_user_id;
END $$;
