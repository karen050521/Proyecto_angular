const { GoogleGenerativeAI } = require('@google/generative-ai');

const API_KEY = 'AIzaSyB8yCHsaCkzIYGlr5nxo256bJrMFO9hIc0';
const genAI = new GoogleGenerativeAI(API_KEY);

async function listModels() {
  try {
    console.log('🔍 Verificando API Key y listando modelos...\n');
    console.log('🔑 API Key:', API_KEY.substring(0, 20) + '...' + API_KEY.substring(API_KEY.length - 5));
    console.log('');
    
    // Intentar obtener un modelo específico
    console.log('Intentando obtener modelo gemini-pro...');
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
      const result = await model.generateContent('test');
      console.log('✅ gemini-pro funciona correctamente\n');
    } catch (e) {
      console.log('❌ gemini-pro no disponible:', e.message);
      console.log('');
    }

    // Intentar con gemini-1.5-flash
    console.log('Intentando obtener modelo gemini-1.5-flash...');
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const result = await model.generateContent('test');
      console.log('✅ gemini-1.5-flash funciona correctamente\n');
    } catch (e) {
      console.log('❌ gemini-1.5-flash no disponible:', e.message);
      console.log('');
    }

    // Intentar con gemini-1.5-pro
    console.log('Intentando obtener modelo gemini-1.5-pro...');
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
      const result = await model.generateContent('test');
      console.log('✅ gemini-1.5-pro funciona correctamente\n');
    } catch (e) {
      console.log('❌ gemini-1.5-pro no disponible:', e.message);
      console.log('');
    }

    console.log('\n📋 INSTRUCCIONES PARA GENERAR UNA NUEVA API KEY:');
    console.log('================================================');
    console.log('1. Ve a: https://aistudio.google.com/apikey');
    console.log('2. Inicia sesión con tu cuenta de Google');
    console.log('3. Haz clic en "Create API Key"');
    console.log('4. Copia la nueva API key');
    console.log('5. Reemplázala en el archivo gemini.js');
    console.log('');

  } catch (error) {
    console.error('❌ Error al verificar la API:', error.message);
    console.log('\n⚠️  La API key puede estar inválida o deshabilitada');
    console.log('');
    console.log('📋 Para generar una nueva API key:');
    console.log('1. Ve a: https://aistudio.google.com/apikey');
    console.log('2. Crea una nueva API key');
    console.log('3. Reemplázala en gemini.js');
  }
}

listModels();

