const {
  createBot,
  createProvider,
  createFlow,
  addKeyword,
} = require("@bot-whatsapp/bot");

const QRPortalWeb = require("@bot-whatsapp/portal");
const BaileysProvider = require("@bot-whatsapp/provider/baileys");
const MySQLAdapter = require("@bot-whatsapp/database/mysql");
const { default: axios } = require("axios");

/**
 * Declaramos las conexiones de MySQL
 */
const MYSQL_DB_HOST = "viaduct.proxy.rlwy.net";
const MYSQL_DB_USER = "root";
const MYSQL_DB_PASSWORD = "6b5CeF6GCAgegBbE-hC2ggG-23EEaChd";
const MYSQL_DB_NAME = "railway";
const MYSQL_DB_PORT = "17929";

/**
 * Aqui declaramos los flujos hijos, los flujos se declaran de atras para adelante, es decir que si tienes un flujo de este tipo:
 *
 *          Menu Principal
 *           - SubMenu 1
 *             - Submenu 1.1
 *           - Submenu 2
 *             - Submenu 2.1
 *
 * Primero declaras los submenus 1.1 y 2.1, luego el 1 y 2 y al final el principal.
 */

// const myState = state.getMyState();

const getPdf = async ({ name, ssn }) => {
  try {
    const { data } = await axios({
      method: "GET",
      url: "http://localhost:3007/api/usuario/",
      params: { name, ssn },
    });
    console.log(data);

    return data;
  } catch (e) {
    return "Error: " + e.message;
  }
};

const flowOp1 = addKeyword(["1", "uno"])
  .addAnswer(
    "Gracias, por favor ingrese su nombre y apellido paterno",
    { capture: true },
    async (ctx, { flowDynamic, state }) => {
      await state.update({ name: ctx.body });
    }
  )
  .addAnswer(
    `Ahora Ingresa sus ultimos 4 digitos de su seguro social`,
    {
      capture: true,
    },
    async (ctx, { flowDynamic, state }) => {
      await state.update({ ssn: ctx.body });
    }
  )
  .addAnswer(
    [
      "Bienvenido desea recibir su evaluacion por este medio?",
      "1️⃣ Si",
      "2️⃣ No",
    ],
    { capture: true },
    async (ctx, { flowDynamic, state, endFlow }) => {
      if (ctx.body === "1") {
        const myState = state.getMyState();
        const pdf = await getPdf({ name: myState.name, ssn: myState.ssn });
        console.log(pdf);
        await flowDynamic([
          {
            body: " ctx.body",
            media: pdf,
          },
        ]);
        await flowDynamic("Aqui tienes tu PDF");
      } else {
        const myState = state.getMyState();
        return await flowDynamic(
          `Gracias *${myState.name}*! Por cominicarse con el bot de Retinca Care:*`
        );
      }
    }
    // [option1]
  );

const flowOp2 = addKeyword(["2"]).addAnswer(["Opcion en desarrollo..."]);
const flowOp3 = addKeyword(["3"]).addAnswer(["Opcion en desarrollo..."]);

const saludos = [
  "Hola",
  "hola",
  "ola",
  "HOLA",
  "Buenos Dias",
  "Buenas Noches",
  "Buenas Tardes",
  "Buenas",
];

const flowPrincipal = addKeyword(["Hola1"])
  .addAnswer([
    "🙌 Gracias por comunicarse con *Retina Care*",
    "Servicio de Envío de Evaluaciones Médicas",
    "diabetes.  Que desea hacer hoy?",
  ])
  .addAnswer(
    [
      "Porfavor eniva el numero de su eleccion",
      "1️⃣ Recibir mi evaluacion por whatssap",
      "2️⃣ Hablar con alguien en recepcion",
      "3️⃣ Salir",
    ],
    null,
    null,
    [flowOp1, flowOp2, flowOp3]
  );

const main = async () => {
  const adapterDB = new MySQLAdapter({
    host: MYSQL_DB_HOST,
    user: MYSQL_DB_USER,
    database: MYSQL_DB_NAME,
    password: MYSQL_DB_PASSWORD,
    port: MYSQL_DB_PORT,
  });
  const adapterFlow = createFlow([flowPrincipal]);
  const adapterProvider = createProvider(BaileysProvider);
  createBot({
    flow: adapterFlow,
    provider: adapterProvider,
    database: adapterDB,
  });
  QRPortalWeb();
};

main();
