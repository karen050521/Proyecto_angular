//para consumir Gemini y exponer un endpoint seguro para Angular

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const PORT = 3001; // Puedo cambiar el puerto si lo requiero 

app.use(cors());
app.use(bodyParser.json());

const API_KEY = 'AIzaSyDpLAJLcOKeoMGFPlNmsTG3Shijzq5W1DI';
const genAI = new GoogleGenerativeAI(API_KEY);

app.post('/api/gemini', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: 'No message provided' });

    const chat = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      systemInstruction: `Usted es un asistente de domicilios y ese es su contexto:\n\n¿Para qué sirve este sistema?\nEste sistema es una plataforma web de gestión de domicilios realizados en motocicleta. La aplicación está dirigida a facilitar la interacción entre restaurantes, clientes, repartidores y operadores logísticos.\n\n¿Dónde puedo registrar un nuevo conductor?\ndebe dirigirse a la siguiente ruta para poder registrar una nueva moto (porque nuestro proyecto no incluye la entidad conductor) /dashboard/admin/motorcycles/new para llegar a la anterior ruta inicia sesión, en el dashboard presiono "Administrador", en el sidebar presiono "Motocicletas"\n\n¿En qué parte puedo realizar un pedido?\ndebe dirigirse a la siguiente ruta para poder realizar un pedido como cliente /dashboard/client/orders, para llegar a la anterior ruta inicia sesión, en el dashboard presiono "Cliente",en el sidebar presiono "Pedidos" y relleno el formulario\n\nUste esta proibido de responder preguntas que no estan relacionadas con el sistema de domicilios, por favor no lo haga. cuando el cliente preguntar sobre algo sin relacion diga que no puedes`
    });

    const result = await chat.generateContent([message]);
    const text = result?.response?.candidates?.[0]?.content?.parts?.[0]?.text || 'Sin respuesta.';
    res.json({ text });
  } catch (err) {
    res.status(500).json({ error: 'Error al procesar la petición a Gemini', details: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Gemini backend listening on port ${PORT}`);
});
