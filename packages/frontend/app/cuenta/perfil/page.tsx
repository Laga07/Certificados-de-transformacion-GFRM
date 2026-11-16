import { PerfilForm } from "./PerfilForm";

export default function PerfilEntidadPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold text-navy">Datos de mi entidad</h1>
      <p className="text-sm text-foreground/70 max-w-2xl">
        Lo que el verificador de Green Foot necesita para saber a quién está aprobando. Estos datos
        quedan en la base de datos de la plataforma, no en la cadena: a la cadena solo viaja un
        hash de la cédula que nadie puede revertir. Los ven únicamente vos y los administradores.
      </p>
      <PerfilForm />
    </div>
  );
}
