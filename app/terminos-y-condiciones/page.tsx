import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import {
    ArrowLeft,
    BriefcaseBusiness,
    CheckCircle2,
    Clock3,
    FileText,
    LockKeyhole,
    Scale,
    ShieldCheck,
} from "lucide-react";

export const metadata: Metadata = {
    title: "Términos y condiciones | Despacho RC",
    description: "Consulta los términos generales de uso de la plataforma de Despacho RC.",
};

const sections = [
    { id: "aceptacion", label: "Aceptación y alcance" },
    { id: "servicio", label: "Uso de la plataforma" },
    { id: "cuenta", label: "Cuenta y seguridad" },
    { id: "informacion", label: "Información y documentos" },
    { id: "responsabilidades", label: "Responsabilidades" },
    { id: "disponibilidad", label: "Disponibilidad y cambios" },
    { id: "propiedad", label: "Propiedad intelectual" },
    { id: "privacidad", label: "Privacidad" },
    { id: "contacto", label: "Contacto" },
];

export default function TermsAndConditionsPage() {
    return (
        <main className="min-h-screen bg-slate-50 text-slate-800">
            <header className="border-b border-white/10 bg-navy-950 text-white">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
                    <Link href="/auth/login" className="inline-flex items-center gap-2 text-sm font-semibold text-white/80 transition hover:text-white">
                        <ArrowLeft size={17} aria-hidden="true" />
                        Volver al inicio de sesión
                    </Link>
                    <span className="hidden text-sm font-semibold tracking-wide text-white/70 sm:block">DESPACHO RC</span>
                </div>
            </header>

            <section className="relative overflow-hidden bg-navy-950 px-5 pb-16 pt-8 text-white sm:px-8 sm:pb-20 sm:pt-12">
                <div className="pointer-events-none absolute -right-20 -top-36 h-96 w-96 rounded-full bg-blue-400/10 blur-3xl" />
                <div className="relative mx-auto max-w-5xl">
                    <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-blue-100">
                        <Scale size={15} aria-hidden="true" />
                        Información legal
                    </div>
                    <h1 className="max-w-3xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl">Términos y condiciones</h1>
                    <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
                        Estas condiciones describen las reglas generales para acceder y utilizar la plataforma de Despacho RC y los servicios relacionados.
                    </p>
                    <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-slate-300">
                        <span className="inline-flex items-center gap-2"><Clock3 size={16} aria-hidden="true" />Última actualización: 8 de octubre de 2026</span>
                        <span className="inline-flex items-center gap-2"><FileText size={16} aria-hidden="true" />Lectura aproximada: 5 minutos</span>
                    </div>
                </div>
            </section>

            <div className="mx-auto grid max-w-7xl gap-8 px-5 py-10 sm:px-8 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-12 lg:py-14">
                <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:sticky lg:top-8">
                    <p className="mb-4 text-xs font-bold uppercase tracking-[0.14em] text-slate-500">En esta página</p>
                    <nav aria-label="Secciones de términos y condiciones">
                        <ol className="space-y-1">
                            {sections.map((section, index) => (
                                <li key={section.id}>
                                    <a href={`#${section.id}`} className="group flex items-start gap-3 rounded-lg px-2.5 py-2 text-sm text-slate-600 transition hover:bg-navy-50 hover:text-navy-700">
                                        <span className="mt-0.5 text-xs font-semibold tabular-nums text-slate-400 group-hover:text-navy-600">{String(index + 1).padStart(2, "0")}</span>
                                        {section.label}
                                    </a>
                                </li>
                            ))}
                        </ol>
                    </nav>
                </aside>

                <article className="min-w-0 rounded-2xl border border-slate-200 bg-white px-6 py-8 shadow-sm sm:px-10 sm:py-10">
                    <div className="mb-9 rounded-xl border border-blue-100 bg-blue-50/70 p-5 sm:p-6">
                        <div className="flex gap-3.5">
                            <div className="mt-0.5 rounded-lg bg-white p-2 text-navy-700 shadow-sm"><ShieldCheck size={20} aria-hidden="true" /></div>
                            <div>
                                <h2 className="font-semibold text-navy-900">Un acuerdo claro para usar el servicio</h2>
                                <p className="mt-1.5 text-sm leading-6 text-slate-600">Al crear una cuenta o utilizar la plataforma, aceptas estas condiciones. Si no estás de acuerdo, por favor no utilices el servicio.</p>
                            </div>
                        </div>
                    </div>

                    <div className="divide-y divide-slate-100">
                        <section id="aceptacion" className="scroll-mt-8 py-7 first:pt-0">
                            <SectionTitle number="01" title="Aceptación y alcance" icon={<CheckCircle2 size={19} />} />
                            <div className="terms-copy">
                                <p>Estos términos regulan el acceso y uso de la plataforma digital de Despacho RC (la “Plataforma”), incluyendo las herramientas para consultar actividades, compartir documentos y dar seguimiento a servicios profesionales.</p>
                                <p>Al registrarte, iniciar sesión o utilizar cualquier función de la Plataforma, confirmas que leíste y aceptas estas condiciones. Si utilizas el servicio en representación de una organización, declaras que tienes facultades para obligarla conforme a estos términos.</p>
                            </div>
                        </section>

                        <section id="servicio" className="scroll-mt-8 py-7">
                            <SectionTitle number="02" title="Uso de la plataforma" icon={<BriefcaseBusiness size={19} />} />
                            <div className="terms-copy">
                                <p>La Plataforma facilita la comunicación y el seguimiento de los servicios contratados con Despacho RC. Las funciones disponibles pueden variar según el perfil de usuario, la organización y el servicio acordado.</p>
                                <p>Te comprometes a utilizarla de forma lícita, de buena fe y conforme a estas condiciones. No debes interferir con su funcionamiento, intentar acceder a cuentas o datos ajenos, introducir código malicioso ni usar el servicio para fines fraudulentos o no autorizados.</p>
                            </div>
                        </section>

                        <section id="cuenta" className="scroll-mt-8 py-7">
                            <SectionTitle number="03" title="Cuenta y seguridad" icon={<LockKeyhole size={19} />} />
                            <div className="terms-copy">
                                <p>Debes proporcionar información veraz y mantenerla actualizada. Eres responsable de resguardar tus credenciales y de la actividad realizada desde tu cuenta. Notifica a Despacho RC tan pronto como tengas conocimiento de un uso no autorizado o de un incidente de seguridad.</p>
                                <p>Podemos suspender temporalmente el acceso cuando sea necesario para proteger la cuenta, la Plataforma o a otros usuarios, o cuando exista un incumplimiento de estos términos. Siempre que resulte razonable, te informaremos el motivo y los pasos para recuperar el acceso.</p>
                            </div>
                        </section>

                        <section id="informacion" className="scroll-mt-8 py-7">
                            <SectionTitle number="04" title="Información y documentos" icon={<FileText size={19} />} />
                            <div className="terms-copy">
                                <p>Conservas los derechos sobre la información y los documentos que compartas. Nos autorizas a alojarlos, organizarlos y procesarlos únicamente en la medida necesaria para operar la Plataforma y prestar los servicios solicitados.</p>
                                <p>Debes tener autorización para compartir la información que cargues y procurar que sea completa, legible y actual. La Plataforma sirve como canal de gestión y comunicación; salvo acuerdo expreso por escrito, cargar un documento no equivale a su revisión, aprobación o presentación ante una autoridad.</p>
                                <p>Conserva tus propios respaldos y evita cargar información ajena al servicio o que no estés autorizado a compartir.</p>
                            </div>
                        </section>

                        <section id="responsabilidades" className="scroll-mt-8 py-7">
                            <SectionTitle number="05" title="Responsabilidades" icon={<Scale size={19} />} />
                            <div className="terms-copy">
                                <p>La Plataforma se proporciona como una herramienta de apoyo al servicio profesional acordado. Las obligaciones, entregables, honorarios y plazos específicos se determinan en la propuesta, contrato o comunicación de servicio aplicable.</p>
                                <p>El usuario es responsable de entregar información correcta y a tiempo, atender solicitudes relacionadas con su servicio y verificar que los datos enviados sean los adecuados. Despacho RC procurará prestar el servicio con cuidado profesional y comunicar cualquier incidencia relevante.</p>
                                <p>La información disponible en la Plataforma no sustituye asesoría profesional individualizada ni constituye, por sí sola, una garantía de resultado.</p>
                            </div>
                        </section>

                        <section id="disponibilidad" className="scroll-mt-8 py-7">
                            <SectionTitle number="06" title="Disponibilidad y cambios" icon={<Clock3 size={19} />} />
                            <div className="terms-copy">
                                <p>Trabajamos para mantener la Plataforma disponible y segura, pero pueden presentarse interrupciones por mantenimiento, actualizaciones, fallas de terceros o situaciones fuera de nuestro control. Cuando sea posible, procuraremos comunicar los mantenimientos programados.</p>
                                <p>Podemos actualizar, añadir o retirar funciones para mejorar el servicio. Si un cambio modifica sustancialmente estas condiciones, publicaremos la versión vigente en esta página y actualizaremos la fecha indicada arriba. El uso posterior a su entrada en vigor implica la aceptación de la versión actualizada.</p>
                            </div>
                        </section>

                        <section id="propiedad" className="scroll-mt-8 py-7">
                            <SectionTitle number="07" title="Propiedad intelectual" icon={<FileText size={19} />} />
                            <div className="terms-copy">
                                <p>La Plataforma, su diseño, marcas, textos, software y demás materiales son propiedad de Despacho RC o se utilizan con autorización. Estos términos te conceden un permiso personal, limitado, revocable y no transferible para usarla conforme a su finalidad.</p>
                                <p>No puedes copiar, modificar, distribuir, vender ni explotar sus componentes, salvo que la ley lo permita o tengas autorización previa por escrito.</p>
                            </div>
                        </section>

                        <section id="privacidad" className="scroll-mt-8 py-7">
                            <SectionTitle number="08" title="Privacidad" icon={<ShieldCheck size={19} />} />
                            <div className="terms-copy">
                                <p>El tratamiento de datos personales relacionado con la Plataforma se describe en el aviso de privacidad correspondiente. Utilizaremos la información necesaria para gestionar tu cuenta, atender solicitudes, operar los servicios y cumplir obligaciones aplicables.</p>
                                <p>Si todavía no se ha publicado un aviso de privacidad, deberá incorporarse antes de utilizar la Plataforma para recopilar datos personales. Puedes contactar a Despacho RC para solicitar información sobre el tratamiento de tus datos.</p>
                            </div>
                        </section>

                        <section id="contacto" className="scroll-mt-8 py-7 pb-0">
                            <SectionTitle number="09" title="Contacto" icon={<BriefcaseBusiness size={19} />} />
                            <div className="terms-copy">
                                <p>Para dudas sobre estos términos, tu cuenta o la operación de la Plataforma, utiliza los canales de contacto que Despacho RC te haya proporcionado para la atención de tu servicio.</p>
                            </div>
                        </section>
                    </div>

                    <div className="mt-10 rounded-xl border border-slate-200 bg-slate-50 p-5 text-sm leading-6 text-slate-600">
                        <p className="font-semibold text-slate-800">Nota sobre esta versión</p>
                        <p className="mt-1">Este texto presenta condiciones generales de uso. Antes de publicar el servicio, Despacho RC debe confirmar que refleje sus prácticas reales y completar los datos de contacto, avisos y acuerdos específicos que correspondan.</p>
                    </div>
                </article>
            </div>

            <footer className="border-t border-slate-200 bg-white px-5 py-6 text-center text-sm text-slate-500 sm:px-8">
                © {new Date().getFullYear()} Despacho RC. Todos los derechos reservados.
            </footer>
        </main>
    );
}

function SectionTitle({ number, title, icon }: { number: string; title: string; icon: ReactNode }) {
    return (
        <div className="mb-4 flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-navy-50 text-navy-700">{icon}</span>
            <div>
                <p className="text-[11px] font-bold tracking-[0.13em] text-slate-400">{number}</p>
                <h2 className="text-lg font-bold tracking-tight text-slate-900 sm:text-xl">{title}</h2>
            </div>
        </div>
    );
}
