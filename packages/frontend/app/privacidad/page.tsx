import Link from "next/link";

export const metadata = { title: "Política de privacidad" };

// Borrador alineado a la Ley 8968 (Proteccion de la Persona frente al Tratamiento de sus
// Datos Personales) y su reglamento. Revisar con un abogado antes de mainnet.
export default function PrivacidadPage() {
  return (
    <article className="max-w-2xl flex flex-col gap-5">
      <div>
        <span className="tag-mono">Vigente desde el 16 de noviembre de 2026</span>
        <h1 className="text-3xl font-heading italic font-semibold text-navy mt-3">Política de privacidad</h1>
      </div>

      <Seccion titulo="1. Responsable">
        Green Foot Recycling Materials, Costa Rica, es responsable del tratamiento de los datos
        personales recogidos en esta plataforma, conforme a la Ley 8968 y su reglamento. Contacto:{" "}
        <strong>aaroncaldered@gmail.com</strong>.
      </Seccion>

      <Seccion titulo="2. Qué datos recogemos">
        <ul className="list-disc pl-5 flex flex-col gap-1">
          <li>De la cuenta: correo electrónico y contraseña (guardada solo como hash).</li>
          <li>De la wallet: dirección pública vinculada mediante una firma criptográfica.</li>
          <li>
            De la entidad: nombre o razón social, cédula física o jurídica, representante, teléfono,
            correo de contacto, dirección, provincia y cantón, y los documentos que adjuntés
            (cédula, personería, permisos).
          </li>
          <li>Técnicos: dirección IP y registros de acceso, para seguridad y límites de uso.</li>
        </ul>
      </Seccion>

      <Seccion titulo="3. Para qué los usamos">
        Para operar tu cuenta, verificar la identidad de intermediarios y transformadores antes de
        aprobarlos, prevenir fraude, cumplir obligaciones legales y comunicarnos con vos sobre la
        plataforma. No vendemos datos personales ni los usamos para publicidad de terceros.
      </Seccion>

      <Seccion titulo="4. Qué va a la cadena y qué no">
        En la red Polygon, que es pública e inmutable, <strong>nunca</strong> se escribe tu cédula ni
        tu nombre en claro: solo un hash calculado con un secreto que únicamente conoce el servidor,
        de modo que no puede revertirse. Sí queda público lo operativo: dirección de la wallet,
        rol, provincia y cantón, pesos, lotes y transacciones. Esa información no se puede borrar.
      </Seccion>

      <Seccion titulo="5. Quién accede">
        Tus datos de entidad y documentos los ven únicamente vos y el personal autorizado de Green
        Foot que realiza la verificación. Proveedores que nos dan servicio (alojamiento, correo
        transaccional, nodos de la red) tratan datos solo por nuestra cuenta y bajo contrato.
      </Seccion>

      <Seccion titulo="6. Conservación y seguridad">
        Conservamos los datos mientras tu cuenta esté activa y el tiempo adicional que exija la ley.
        Aplicamos contraseñas con hash, cifrado en tránsito, control de acceso por rol y respaldos
        periódicos. Ningún sistema es infalible: avisaremos sin demora ante una brecha que te afecte.
      </Seccion>

      <Seccion titulo="7. Tus derechos">
        Podés acceder, rectificar, actualizar y pedir la eliminación de tus datos personales, y
        revocar tu consentimiento, escribiéndonos al correo indicado. Atenderemos en el plazo legal.
        Lo registrado en la cadena no puede modificarse ni borrarse por su naturaleza técnica.
        También podés acudir a la Agencia de Protección de Datos de los Habitantes (Prodhab).
      </Seccion>

      <Seccion titulo="8. Cambios">
        Si cambiamos esta política de forma relevante, te lo avisaremos por correo. Ver también los{" "}
        <Link href="/terminos" className="text-forest hover:underline">Términos de uso</Link>.
      </Seccion>
    </article>
  );
}

function Seccion({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-1">
      <h2 className="font-heading font-semibold text-navy">{titulo}</h2>
      <div className="text-sm text-foreground/80">{children}</div>
    </section>
  );
}
