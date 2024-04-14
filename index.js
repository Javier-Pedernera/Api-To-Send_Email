const express = require('express');
const bodyParser = require('body-parser');
const { Resend } = require('resend');
const fs = require('fs');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(cors()); // Usa el middleware CORS

const resend = new Resend(process.env.RESEND_API_KEY);



app.get("/", (req, res) => { res.send("Express on Vercel"); });

const templatePath = 'template.html';
console.log(templatePath);
// const emailTemplate = fs.readFileSync(templatePath, 'utf8');
app.post('/send-email', async (req, res) => {
  const { nombre, apellidos, empresa, productoServicio, email, movil, pais, descripcion, consentimiento, empleados } = req.body;

  fs.readFile(templatePath, 'utf8', async (err, data) => {
    if (err) {
      console.error('Error al leer el archivo HTML:', err);
      res.status(500).json({ error: 'Error interno del servidor' });
      return;
    }
    console.log(data);
    let html = data.replace('{{nombre}}', nombre)
      .replace('{{apellidos}}', apellidos)
      .replace('{{empresa}}', empresa)
      .replace('{{productoServicio}}', productoServicio)
      .replace('{{email}}', email)
      .replace('{{movil}}', movil)
      .replace('{{pais}}', pais)
      .replace('{{descripcion}}', descripcion)
      .replace('{{consentimiento}}', consentimiento ? 'Sí' : 'No')
      .replace('{{empleados}}', empleados);

    try {
      const { data, error } = await resend.emails.send({
          from: 'Cliente Gescotec <jpedernera@gescotec.cl>',
          to: ['contactanos@gescotec.cl'],
          subject: 'Formulario de contacto- Gescotec',
          html: html,
          replyTo: email
        });
      if (error) {
        console.log(error);
        res.status(400).json({ error: 'Error al enviar el correo electrónico' });
      } else {
        res.status(200).json({ message: 'Correo electrónico enviado correctamente' });
      }
    } catch (err) {
      console.error('Error al enviar el correo electrónico:', err);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});