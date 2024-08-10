import nodemailer from 'nodemailer';


export const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // Use `true` for port 465, `false` for all other ports
    auth: {
      user: "2021371093@uteq.edu.mx",
      pass: process.env.PASSWORDEMAIL,
    },
    tls: {
      rejectUnauthorized: false
  }
  });

  /*
  const mailOptions = {
    from: '2021371093@uteq.edu.mx',  // El remitente
    to: '2021371093@uteq.edu.mx',  // El destinatario
    subject: 'Asunto del correo',
    text: 'Contenido del correo en texto plano',
    html: '<h1>Contenido del correo en HTML</h1>'  // Opcional, si quieres enviar HTML
};

transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
        return console.log(error);
    }
    console.log('Correo enviado: ' + info.response);
});
*/
