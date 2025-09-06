const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

exports.authenticate = async (email, password) => {
  try {
    const { data: user, error } = await supabase
      .from('usuarios')
      .select('id_usuarios, senha')
      .eq('email', email)
      .single();

    if (error || !user) {
      throw new Error('Credenciais inválidas');
    }

    const senhaValida = await bcrypt.compare(password, user.senha);
    if (!senhaValida) {
      throw new Error('Credenciais inválidas');
    }

    const token = jwt.sign(
      { id: user.id_usuarios },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    return token;
  } catch (error) {
    throw error;
  }
};

exports.verifyToken = (token) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) reject(err);
      else resolve(decoded);
    });
  });
};