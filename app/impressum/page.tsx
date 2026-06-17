const impressumText = `
Impressum

PunktlyCoinly

Inhaber: PunktlyCoinly
Einzelunternehmen (Kleingewerbe)

34123 Kassel
Deutschland

Kontakt:

E-Mail: serdarsolak@punktlycoinly.de
E-Mail: support@punktlycoinly.de
E-Mail: kontakt@punktlycoinly.de

Verantwortlich für den Inhalt gemäß § 18 Abs. 2 MStV:

Serdar Solak

34123 Kassel

Deutschland
`;

export default function ImpressumPage() {
  return (
    <main className="min-h-screen bg-white p-6 text-slate-800">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-6 text-3xl font-bold">
          Impressum
        </h1>

        <div className="whitespace-pre-wrap leading-7">
          {impressumText}
        </div>
      </div>
    </main>
  );
}