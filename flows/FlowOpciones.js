// const fakeHTTP = async () => {
//   try {
//     console.log("⚡ Server Request!");
//     await delay(1500);
//     console.log("⚡⚡ Server Return!");
//   } catch (error) {
//     console.log(error);
//   }
// };

// const flowCash = addKeyword("cash").addAnswer("Traeme los billetes! 😎");

// const flowOnline = addKeyword("paypal")
//   .addAnswer(
//     "Voy generar un link de paypal",
//     null,
//     async (_, { flowDynamic }) => {
//       await fakeHTTP();
//       await flowDynamic("Esperate.... estoy generando esto toma su tiempo");
//     }
//   )
//   .addAnswer("Aqui lo tienes 😎😎", null, async (_, { flowDynamic }) => {
//     await fakeHTTP();
//     await flowDynamic("http://paypal.com");
//   })
//   .addAnswer("Apurate!");

// const flujoPrincipal = addKeyword("hola")
//   .addAnswer("¿Como estas todo bien?")
//   .addAnswer("Espero que si")
//   .addAnswer(
//     "¿Cual es tu email?",
//     { capture: true },
//     async (ctx, { fallBack, flowDynamic }) => {
//       if (!ctx.body.includes("@")) {
//         return fallBack("Veo que no es um mail *bien*");
//       } else {
//         return flowDynamic("Gracias por tu email");
//       }
//     }
//   )
//   .addAnswer(
//     "Voy a validar tu email...",
//     null,
//     async (ctx, { flowDynamic }) => {
//       await fakeHTTP();
//     }
//   )
//   .addAnswer(
//     "¿Como vas a pagar *paypal* o *cash*?",
//     { capture: true },
//     async (ctx, { flowDynamic }) => {},
//     [flowCash, flowOnline]
//   );
