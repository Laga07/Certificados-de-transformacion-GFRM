import Link from "next/link";

export const metadata = { title: "Términos de uso" };

// Borrador de terminos para la fase de red de prueba. Antes de operar con fondos reales,
// revision por un abogado en Costa Rica (plan de produccion, seccion E).
export default function TerminosPage() {
  return (
    <article className="prose-sm max-w-2xl flex flex-col gap-5">
      <div>
        <span className="tag-mono">Vigente desde el 16 de noviembre de 2026 · Red de prueba</span>
        <h1 className="text-3xl font-heading italic font-semibold text-navy mt-3">Términos de uso</h1>
      </div>

      <Seccion titulo="1. Qué es esta plataforma">
        La plataforma &ldquo;Certificado de Transformación&rdquo; es operada por Green Foot Recycling
        Materials (&ldquo;Green Foot&rdquo;), Costa Rica. Registra en la red Polygon la trazabilidad de
        residuos valorizables (plástico, cartón y papel, tetrapack, vidrio y metales) desde quien los
        separa hasta quien los transforma, y emite un token digital (Certificado de Transformación)
        que representa kilogramos efectivamente transformados.
      </Seccion>

      <Seccion titulo="2. Fase de prueba">
        Mientras la plataforma opere sobre la red de prueba Polygon Amoy, <strong>ningún token, saldo
        ni certificado tiene valor económico</strong>. El &ldquo;USDT&rdquo; utilizado es un token de
        prueba sin respaldo. Los datos y registros de esta fase pueden reiniciarse al pasar a la red
        principal. Green Foot avisará con antelación por el correo de la cuenta.
      </Seccion>

      <Seccion titulo="3. Cuenta y wallet">
        Para usar la plataforma necesitás una cuenta (correo y contraseña) y una wallet compatible
        con Polygon. Sos responsable de custodiar tu contraseña y las claves de tu wallet: Green Foot
        no puede recuperar claves privadas ni revertir transacciones en la cadena. Una wallet solo
        puede tener un rol (separador, intermediario, transformador o comprador).
      </Seccion>

      <Seccion titulo="4. Verificación de entidades">
        Intermediarios y transformadores deben cargar sus datos y documentos y ser aprobados por
        Green Foot antes de operar. Green Foot puede rechazar, suspender o revocar una verificación
        si detecta información falsa, incumplimiento de estos términos o de la normativa aplicable
        (incluida la Ley 8839 para la Gestión Integral de Residuos).
      </Seccion>

      <Seccion titulo="5. Registros en la cadena">
        Lo que se registra en Polygon es público e inmutable. A la cadena solo viajan hashes de la
        cédula y el nombre, nunca los datos en claro. Al registrar una entrega, un traspaso o una
        transformación declarás que la información es veraz. Las mermas se atribuyen y descuentan
        según las reglas del contrato, visibles en el código verificado.
      </Seccion>

      <Seccion titulo="6. Reparto de ventas">
        En cada venta primaria de un certificado el contrato acredita automáticamente el 35 % a los
        separadores, 20 % a los intermediarios, 30 % al transformador y 15 % a Green Foot, con los
        descuentos por merma que correspondan. Cada participante retira su saldo cuando quiera; Green
        Foot no custodia fondos de terceros.
      </Seccion>

      <Seccion titulo="7. Limitación de responsabilidad">
        La plataforma se ofrece &ldquo;tal cual&rdquo;. Green Foot no responde por fallas de la red
        Polygon, de las wallets, de proveedores externos, ni por pérdidas derivadas del uso de una
        red de prueba. En la medida que la ley lo permita, la responsabilidad de Green Foot se limita
        al monto efectivamente pagado a Green Foot por el usuario en los doce meses previos.
      </Seccion>

      <Seccion titulo="8. Cambios y contacto">
        Green Foot puede actualizar estos términos; los cambios relevantes se avisan por correo y
        rigen desde su publicación. Consultas: <strong>aaroncaldered@gmail.com</strong>. Ver también la{" "}
        <Link href="/privacidad" className="text-forest hover:underline">Política de privacidad</Link>.
      </Seccion>
    </article>
  );
}

function Seccion({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-1">
      <h2 className="font-heading font-semibold text-navy">{titulo}</h2>
      <p className="text-sm text-foreground/80">{children}</p>
    </section>
  );
}
