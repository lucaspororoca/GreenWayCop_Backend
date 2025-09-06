const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcrypt');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

exports.authregister = async (name, email, password) => {
  try {
    const { data: existingUser, error: findError } = await supabase
      .from('usuarios')
      .select('id_usuarios')
      .eq('email', email)
      .maybeSingle();

    if (findError) throw findError;
    if (existingUser) throw new Error('E-mail já cadastrado');

    const senhaCriptografada = await bcrypt.hash(password, 10);

    const { data, error } = await supabase
      .from('usuarios')
      .insert([{ nome: name, email, senha: senhaCriptografada }])
      .select('id_usuarios')
      .maybeSingle();

    if (error) throw error;
    return { id: data.id_usuarios };
  } catch (error) {
    throw error;
  }
};