import Link from "next/link";

export const metadata = { title: "Guía de inicio" };

// Onboarding para personas no tecnicas (plan de produccion, C10). Pasos reales en orden.
const PASOS = [
  {
    titulo: "Creá tu cuenta",
    detalle:
      "Con tu correo y una contraseña. Te mandamos un enlace para confirmar el correo: sin eso no podés recuperar la contraseña.",
    enlace: { href: "/crear-cuenta", texto: "Crear cuenta" },
  },
  {
    titulo: "Instalá una wallet",
    detalle:
      "Recomendamos MetaMask (extensión para Chrome, Firefox o Edge, o app para celular). Al crearla te da 12 palabras de respaldo: anotalas en papel y guardalas. Nadie de Green Foot te las va a pedir nunca.",
    enlace: { href: "https://metamask.io/download/", texto: "Descargar MetaMask ↗", externo: true },
  },
  {
    titulo: "Agregá la red Polygon Amoy",
    detalle:
      "Conectá la wallet con el botón de arriba a la derecha. Si está en otra red, la plataforma te ofrece cambiar a Polygon Amoy con un clic (MetaMask pide confirmación una sola vez).",
  },
  {
    titulo: "Conseguí POL de prueba",
    detalle:
      "POL es lo que paga el gas de cada transacción. En la red de prueba es gratis: pedilo al faucet oficial de Polygon con tu dirección. Si sos separador no lo necesitás: quien recibe tu material paga el gas.",
    enlace: { href: "/mercado/faucet", texto: "Ir a faucets" },
  },
  {
    titulo: "Completá los datos de tu entidad",
    detalle:
      "Nombre o razón social, cédula, contacto y documentos. Es lo que el verificador revisa. A la cadena solo viaja un hash irreversible, nunca tu cédula.",
    enlace: { href: "/cuenta/perfil", texto: "Mi entidad" },
  },
  {
    titulo: "Vinculá tu wallet a la cuenta",
    detalle:
      "Firmás un mensaje (gratis, sin gas) para demostrar que la wallet es tuya. Así la plataforma sabe quién está detrás de cada dirección.",
    enlace: { href: "/cuenta", texto: "Mi cuenta" },
  },
  {
    titulo: "Registrate on-chain con tu rol",
    detalle:
      "Separador o comprador: queda listo al instante. Intermediario o transformador: queda pendiente hasta que Green Foot revise tus documentos y verifique tu wallet.",
    enlace: { href: "/#roles", texto: "Elegir rol" },
  },
  {
    titulo: "Operá",
    detalle:
      "Registrar entregas, traspasar lotes, transformar y comprar certificados. Cada acción es una transacción que confirmás en tu wallet.",
    enlace: { href: "/entregas/lotes", texto: "Mis lotes" },
  },
];

export default function GuiaInicioPage() {
  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div>
        <span className="tag-mono">Para empezar</span>
        <h1 className="text-3xl font-heading italic font-semibold text-navy mt-3">Guía de inicio</h1>
        <p className="text-foreground/70 mt-2">
          Ocho pasos, en orden. Si ya tenés una wallet con POL, saltá al paso 5.
        </p>
      </div>

      <ol className="flex flex-col gap-4">
        {PASOS.map((paso, index) => (
          <li key={paso.titulo} className="border border-neutral-300 bg-surface-warm p-4 flex gap-4">
            <span className="font-heading italic text-2xl text-gold shrink-0 w-8">{index + 1}</span>
            <div className="flex flex-col gap-1">
              <h2 className="font-heading font-semibold text-navy">{paso.titulo}</h2>
              <p className="text-sm text-foreground/70">{paso.detalle}</p>
              {paso.enlace ? (
                paso.enlace.externo ? (
                  <a href={paso.enlace.href} target="_blank" rel="noreferrer" className="w-fit label-mono text-forest hover:underline">
                    {paso.enlace.texto}
                  </a>
                ) : (
                  <Link href={paso.enlace.href} className="w-fit label-mono text-forest hover:underline">
                    {paso.enlace.texto} →
                  </Link>
                )
              ) : null}
            </div>
          </li>
        ))}
      </ol>

      <section className="border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 flex flex-col gap-1">
        <strong className="font-heading">Problemas frecuentes</strong>
        <p>
          <strong>&ldquo;gas price below minimum&rdquo;</strong>: Polygon exige una propina mínima. La plataforma ya la fija;
          si tu wallet la baja, subila a 30 gwei al confirmar.
        </p>
        <p>
          <strong>La wallet no responde</strong>: el RPC configurado en MetaMask para Amoy puede estar caído. Cambialo por{" "}
          <span className="font-mono">https://polygon-amoy-bor-rpc.publicnode.com</span>.
        </p>
        <p>
          <strong>&ldquo;La wallet ya tiene un rol asignado&rdquo;</strong>: una dirección solo puede tener un rol. Usá otra
          cuenta de MetaMask para otro rol.
        </p>
      </section>
    </div>
  );
}
