const {
  createBot,
  createProvider,
  createFlow,
  addKeyword,
  EVENTS,
} = require("@bot-whatsapp/bot");

const QRPortalWeb = require("@bot-whatsapp/portal");
const BaileysProvider = require("@bot-whatsapp/provider/baileys");
const MySQLAdapter = require("@bot-whatsapp/database/mysql");
const { default: axios } = require("axios");
// const { delay } = require("@whiskeysockets/baileys");

/**
 * Declaramos las conexiones de MySQL
 */
const MYSQL_DB_HOST = "viaduct.proxy.rlwy.net";
const MYSQL_DB_USER = "root";
const MYSQL_DB_PASSWORD = "4b6BdBe5GDfhd4afGBCGDd22cAgEg5g5";
const MYSQL_DB_NAME = "railway";
const MYSQL_DB_PORT = "40897";
const BASE_URL = "https://nodejs-production-b648.up.railway.app/api/usuario/";

// const MYSQL_DB_HOST = "localhost";
// const MYSQL_DB_USER = "root";
// const MYSQL_DB_PASSWORD = "";
// const MYSQL_DB_NAME = "bot";
// const MYSQL_DB_PORT = "";
// const BASE_URL = "http://localhost:3007/api/usuario/";

const getPdf = async ({ name, ssn }) => {
  try {
    const { data } = await axios({
      method: "GET",
      url: BASE_URL,
      params: { name, ssn },
    });
    // console.log("💻 - file: app.js:43 - getPdf - data:", data);

    return data;
  } catch (e) {
    return "Error: " + e.message;
  }
};
const getInfoUser = async ({ phone }) => {
  try {
    const { data } = await axios({
      method: "GET",
      url: BASE_URL + "byphone",
      params: { phone },
    });
    // console.log("💻 - file: app.js:43 - getPdf - data:", data);

    return data;
  } catch (e) {
    return "Error: " + e.message;
  }
};

const Op1 = addKeyword([
  "1",
  "uno",
  "Recibir mi evaluacion",
  "recibir mi evaluacion por whastapp",
])
  .addAnswer(
    "Porfavor Ingrese su Nombre y Apellidos",
    { capture: true },
    async (ctx, { fallBack, state }) => {
      const soloTexto = "[a-zA-Z]+$";
      if (!ctx.body.trim().match(soloTexto)) {
        return fallBack(
          `Tu Nombre: *${ctx.body.trim()}* No debe tener Numeros.`
        );
      }
      await state.update({ name: ctx.body.trim() });
    }
  )
  .addAnswer(
    "Ahora Necesito los 4 ultimos digitos de tu SSN",
    { capture: true },
    async (ctx, { fallBack, state }) => {
      const soloNumeros = /^([0-9])*$/;
      if (!ctx.body.trim().match(soloNumeros)) {
        return fallBack(`Tu SSN: *${ctx.body.trim()}* Solo deben ser Numeros.`);
      }
      console.log(ctx.body.trim().length);
      if (ctx.body.trim().length !== 4) {
        return fallBack(
          `Tu SSN: *${ctx.body.trim()}* Solo debe tener 4 Digitos.`
        );
      }
      await state.update({ ssn: ctx.body.trim() });
    }
  )
  .addAnswer("Gracias por tu informacion, ahora consultare tu datos!!")
  .addAnswer(
    "Un Momento porfavor",
    null,
    async (_, { fallBack, state, flowDynamic }) => {
      try {
        const myState = state.getMyState();
        const { data } = await getPdf({
          name: myState.name,
          ssn: myState.ssn,
        });
        if (data) {
          console.log("💻 - se encontro informacion:", data.url_format);
          await flowDynamic([
            { media: data.url_format, body: "PDF" },
            {
              body: `Gracias ${data.firstName} ${data.lastName} por utilizar el Bot de Retina Care.`,
            },
          ]);
        } else {
          await flowDynamic([
            {
              body: `Estimado ${myState.name} No se encontraron sus datos.`,
            },
            {
              body: `Gracis Por utilizar el Bot de Retina Care`,
            },
          ]);
        }

        // return flowDynamic([{ media: data, body: "PDF" }]);
      } catch (error) {
        await flowDynamic("Algo paso , consulte con un agente");
      }
    }
  );

const flujoPrincipal = addKeyword("saludo")
  .addAction(async (ctx, { flowDynamic, state }) => {
    try {
      let phone = "";
      const text = ctx.from;
      // const text = "17877877877";
      if (text.charAt(0) === "1") {
        phone = text.split("").slice(1).join("");
        console.log(phone);
      } else {
        phone = text.split("").slice(2).join("");
        console.log(phone);
      }

      const { data } = await getInfoUser({ phone });
      // console.log(data);
      if (data) {
        await state.update({
          url: data.url_format,
          name: `${data.firstName} ${data.lastName}`,
        });

        await flowDynamic([
          {
            body: `Bienvenido *${data.firstName} ${data.lastName}*\n🙌 Gracias por comunicarse con *Retina Care*\nServicio de Envío de Evaluaciones Médicas\ndiabetes.  Que desea hacer hoy?`,
          },
        ]);
      } else {
        await flowDynamic([
          {
            body: `🙌 Gracias por comunicarse con *Retina Care*\nServicio de Envío de Evaluaciones Médicas\ndiabetes.  Que desea hacer hoy?`,
          },
        ]);
      }
    } catch (error) {
      console.log("[ERROR]", error);
    }
  })
  .addAnswer(
    [
      "Porfavor enviar el numero de su eleccion",
      "1️⃣ Recibir mi evaluacion por whatssap(en desarrollo)",
      "2️⃣ Hablar con alguien en recepcion (en desarrollo)",
      "3️⃣ Salir",
    ],
    { capture: true },
    async (ctx, { fallBack, endFlow, flowDynamic, state }) => {
      if (!["1", "2", "3"].includes(ctx.body)) {
        return fallBack(
          `Porfavor Seleccione una opcion Correcta!!\n 1️⃣ Recibir mi evaluacion por whatssap\n 2️⃣ Hablar con alguien en recepcion\n 3️⃣ Salir`
        );
      } else {
        if (ctx.body == "1") {
          const myState = state.getMyState();

          if (state.getMyState()?.url) {
            await flowDynamic("Validando Datos...");
            await flowDynamic([
              { media: myState.url, body: `PDF` },
              {
                body: `Gracias *${myState.name}* por utilizar el Bot de Retina Care.`,
              },
            ]);
            return endFlow();
          }
        }
      }
    },
    [Op1]
  );

const main = async () => {
  const adapterDB = new MySQLAdapter({
    host: MYSQL_DB_HOST,
    user: MYSQL_DB_USER,
    database: MYSQL_DB_NAME,
    password: MYSQL_DB_PASSWORD,
    port: MYSQL_DB_PORT,
  });
  const adapterFlow = createFlow([flujoPrincipal]);
  const adapterProvider = createProvider(BaileysProvider);
  createBot({
    flow: adapterFlow,
    provider: adapterProvider,
    database: adapterDB,
  });
  QRPortalWeb();
};

main();
