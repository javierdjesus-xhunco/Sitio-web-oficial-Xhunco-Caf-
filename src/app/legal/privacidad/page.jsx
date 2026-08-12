import LegalLayout from "@/components/legal/LegalLayout";
import LegalSection from "@/components/legal/LegalSection";
import LegalInfoBox from "@/components/legal/LegalInfoBox";
import LegalLastUpdated from "@/components/legal/LegalLastUpdated";

import { LEGAL } from "@/lib/legal/legalConfig";

export const metadata = {
  title: `Aviso de Privacidad | ${LEGAL.companyName}`,
  description:
    "Conoce cómo Xhunco Café recopila, utiliza, almacena y protege tus datos personales.",
};

export default function PrivacidadPage() {
  return (
    <LegalLayout
      title="Aviso de Privacidad"
      description="Conoce cómo Xhunco Café recopila, utiliza, almacena y protege tus datos personales."
      currentSlug="privacidad"
      badge="Privacidad"
    >
      {/* =========================================
          INTRODUCCIÓN
      ========================================= */}

      <div className="mb-8">
        <p className="text-base leading-8 text-gray-700">
          En {LEGAL.companyName} reconocemos la importancia de
          proteger los datos personales de nuestros clientes,
          usuarios y visitantes. Por ello, adoptamos medidas
          para que el tratamiento de la información personal se
          realice de manera legítima, controlada, informada y
          conforme a la legislación aplicable.
        </p>

        <LegalLastUpdated />
      </div>

      <LegalInfoBox type="security" title="Protección de tus datos">
        Este Aviso de Privacidad explica qué datos personales
        podemos recabar, para qué los utilizamos, cómo los
        protegemos y cuáles son los derechos que puedes ejercer
        respecto de ellos.
      </LegalInfoBox>

      {/* =========================================
          1. RESPONSABLE
      ========================================= */}

      <LegalSection
        number="1"
        title="Responsable del tratamiento de los datos personales"
        id="responsable"
      >
        <p>
          El responsable del tratamiento de los datos personales
          recabados a través de este sitio web, la plataforma
          digital y los canales de atención es {LEGAL.companyName}.
        </p>

        <p>
          Para efectos de este Aviso de Privacidad, el domicilio
          de contacto del responsable se encuentra en{" "}
          <strong>{LEGAL.address}</strong>.
        </p>

        <p>
          Para cualquier asunto relacionado con el tratamiento de
          datos personales, puedes comunicarte mediante el correo
          electrónico:
        </p>

        <p>
          <a
            href={`mailto:${LEGAL.legalEmail}`}
            className="font-semibold text-[#31572c] underline underline-offset-4 hover:text-[#3f6b38]"
          >
            {LEGAL.legalEmail}
          </a>
        </p>
       </LegalSection>

        {/* =========================================
        2. DATOS QUE RECABAMOS
        ========================================= */}

<LegalSection
  number="2"
  title="Datos personales que podemos recabar"
  id="datos-personales"
>
  <p>
    Dependiendo de la relación que mantengas con Xhunco
    Café y de los servicios que utilices, podemos recabar
    las siguientes categorías de datos personales:
  </p>

  <h3 className="font-semibold text-gray-900">
    Datos de identificación y contacto
  </h3>

  <ul className="list-disc space-y-2 pl-6">
    <li>Nombre y apellidos.</li>
    <li>Nombre de la empresa o negocio.</li>
    <li>Correo electrónico.</li>
    <li>Número telefónico.</li>
  </ul>

  <h3 className="font-semibold text-gray-900">
    Datos de domicilio y entrega
  </h3>

  <ul className="list-disc space-y-2 pl-6">
    <li>Calle.</li>
    <li>Número exterior e interior.</li>
    <li>Colonia.</li>
    <li>Municipio.</li>
    <li>Estado.</li>
    <li>Código postal.</li>
  </ul>

  <h3 className="font-semibold text-gray-900">
    Datos relacionados con pedidos y operaciones
  </h3>

  <ul className="list-disc space-y-2 pl-6">
    <li>Productos adquiridos.</li>
    <li>Cantidades solicitadas.</li>
    <li>Importes de las operaciones.</li>
    <li>Información relacionada con el método de entrega.</li>
    <li>Información relacionada con el método de pago utilizado.</li>
    <li>Información necesaria para gestionar y dar seguimiento al pedido.</li>
  </ul>

  <h3 className="font-semibold text-gray-900">
    Datos de facturación
  </h3>

  <p>
    Cuando solicites una factura, podremos solicitar los
    datos fiscales necesarios para su emisión, de acuerdo
    con la legislación fiscal aplicable.
  </p>
</LegalSection>

 {/* =========================================
    3. DATOS SENSIBLES
========================================= */}

<LegalSection
  number="3"
  title="Datos personales sensibles"
  id="datos-sensibles"
>
  <p>
    Xhunco Café no solicita ni requiere datos personales
    sensibles para la operación ordinaria de nuestro sitio
    web, plataforma y servicios.
  </p>

  <p>
    Por lo anterior, no es necesario que proporciones
    información relacionada con aspectos como origen racial o
    étnico, estado de salud, información genética, creencias
    religiosas, opiniones políticas, preferencias sexuales u
    otros datos cuya utilización indebida pueda dar origen a
    discriminación o conlleve un riesgo grave para su titular.
  </p>

  <LegalInfoBox type="warning" title="Información sensible">
    Te recomendamos no proporcionar datos personales sensibles
    a través de nuestro sitio web, formularios, canales de
    atención, correo electrónico, WhatsApp u otros medios de
    contacto cuando dicha información no sea necesaria para la
    prestación de nuestros servicios o la atención de tu
    solicitud.
  </LegalInfoBox>
</LegalSection>

      {/* =========================================
    4. FINALIDADES DEL TRATAMIENTO
========================================= */}

<LegalSection
  number="4"
  title="Finalidades del tratamiento"
  id="finalidades"
>
  <p>
    Los datos personales que recabamos podrán ser tratados
    para las siguientes finalidades primarias, las cuales son
    necesarias para proporcionar nuestros productos, servicios,
    gestionar las operaciones realizadas a través de nuestros
    canales y atender las solicitudes de nuestros usuarios y
    clientes:
  </p>

  <ul className="list-disc space-y-2 pl-6">
    <li>
      Crear, administrar y mantener cuentas de clientes y
      usuarios.
    </li>

    <li>
      Identificar y, cuando corresponda, autenticar a los
      usuarios de nuestra plataforma.
    </li>

    <li>
      Procesar, administrar y dar seguimiento a los pedidos
      realizados.
    </li>

    <li>
      Gestionar la preparación, entrega, envío o recolección
      de los pedidos.
    </li>

    <li>
      Gestionar la información relacionada con las operaciones
      y los métodos de pago utilizados.
    </li>

    <li>
      Atender solicitudes, dudas, aclaraciones, incidencias y
      solicitudes de soporte.
    </li>

    <li>
      Enviar comunicaciones relacionadas con pedidos,
      operaciones, entregas, pagos, servicios solicitados y
      atención al cliente.
    </li>

    <li>
      Emitir y gestionar comprobantes o facturas cuando sean
      solicitados.
    </li>

    <li>
      Mantener registros relacionados con las operaciones
      realizadas y la relación comercial correspondiente.
    </li>

    <li>
      Dar cumplimiento a obligaciones legales, fiscales,
      administrativas o contractuales que resulten aplicables.
    </li>
  </ul>

  <LegalInfoBox type="info" title="Finalidades necesarias">
    Estas finalidades están relacionadas directamente con la
    prestación de los servicios, la gestión de pedidos y la
    atención de la relación comercial con Xhunco Café.
  </LegalInfoBox>
</LegalSection>

{/* =========================================
    5. COMUNICACIONES RELACIONADAS CON TUS OPERACIONES
========================================= */}

<LegalSection
  number="5"
  title="Comunicaciones relacionadas con tus operaciones"
  id="comunicaciones"
>
  <p>
    Cuando realices un pedido, solicites un servicio o
    mantengas una relación comercial con Xhunco Café, podremos
    utilizar tus datos de contacto para enviarte comunicaciones
    necesarias o relacionadas directamente con dichas
    operaciones.
  </p>

  <p>
    Estas comunicaciones pueden incluir, entre otras:
  </p>

  <ul className="list-disc space-y-2 pl-6">
    <li>
      Confirmaciones de pedidos.
    </li>

    <li>
      Actualizaciones sobre el estado de los pedidos.
    </li>

    <li>
      Información relacionada con la preparación, envío,
      entrega o recolección.
    </li>

    <li>
      Avisos relacionados con pagos y operaciones realizadas.
    </li>

    <li>
      Solicitudes de información necesaria para completar
      una operación.
    </li>

    <li>
      Respuestas a solicitudes de soporte, aclaraciones o
      atención al cliente.
    </li>

    <li>
      Comunicaciones relacionadas con cambios o incidencias
      que puedan afectar una operación o servicio solicitado.
    </li>
  </ul>

  <p>
    Dependiendo del servicio utilizado y de los datos de
    contacto proporcionados, estas comunicaciones podrán
    realizarse mediante correo electrónico, WhatsApp,
    notificaciones dentro de la plataforma u otros canales
    habilitados por Xhunco Café.
  </p>

  <LegalInfoBox type="info" title="Comunicaciones operativas">
    Las comunicaciones relacionadas directamente con tus
    pedidos, operaciones, pagos, entregas o solicitudes de
    soporte tienen una finalidad operativa y de atención al
    cliente. Estas comunicaciones son distintas de las
    comunicaciones comerciales o promocionales que puedan
    corresponder a finalidades secundarias.
  </LegalInfoBox>
</LegalSection>

    {/* =========================================
    6. FINALIDADES SECUNDARIAS
========================================= */}

<LegalSection
  number="6"
  title="Finalidades secundarias"
  id="finalidades-secundarias"
>
  <p>
    Además de las finalidades primarias descritas
    anteriormente, Xhunco Café podrá tratar determinados datos
    personales para finalidades secundarias, siempre que exista
    la base legal o el consentimiento que resulte necesario de
    acuerdo con la legislación aplicable.
  </p>

  <p>
    Estas finalidades podrán incluir:
  </p>

  <ul className="list-disc space-y-2 pl-6">
    <li>
      Enviar información sobre productos, servicios, novedades
      y actualizaciones de Xhunco Café.
    </li>

    <li>
      Comunicar promociones, ofertas, campañas comerciales o
      beneficios relacionados con nuestros productos y servicios.
    </li>

    <li>
      Realizar acciones de comunicación y mercadotecnia
      relacionadas con Xhunco Café.
    </li>

    <li>
      Conocer preferencias generales de nuestros clientes y
      usuarios para mejorar nuestros productos, servicios y
      experiencia de usuario.
    </li>

    <li>
      Realizar análisis internos que permitan mejorar el
      funcionamiento, contenido y experiencia de nuestra
      plataforma.
    </li>
  </ul>

  <LegalInfoBox type="info" title="Tu derecho a oponerte">
    Si no deseas que tus datos personales sean utilizados para
    determinadas finalidades secundarias, podrás manifestar tu
    oposición o solicitar la limitación correspondiente a través
    de los medios de contacto establecidos en este Aviso de
    Privacidad, cuando legalmente resulte aplicable.
  </LegalInfoBox>

  <p>
    La negativa para el uso de tus datos personales para
    finalidades secundarias no deberá impedirte acceder a los
    productos o servicios que hayas solicitado, salvo que exista
    una razón legítima y legalmente aplicable que justifique lo
    contrario.
  </p>
</LegalSection>

      {/* =========================================
          7. USO DE LA INFORMACIÓN
      ========================================= */}

      <LegalSection
        number="7"
        title="Uso adecuado de los datos personales"
        id="uso-datos"
      >
        <p>
          Xhunco Café procurará que los datos personales sean
          adecuados, relevantes y necesarios para las finalidades
          para las cuales fueron recabados.
        </p>

        <p>
          No utilizaremos tus datos personales para finalidades
          incompatibles con aquellas informadas en este Aviso de
          Privacidad, salvo que exista una base legal que permita
          dicho tratamiento o se obtenga el consentimiento
          correspondiente cuando sea necesario.
        </p>
      </LegalSection>

{/* =========================================
    8. SERVICIOS DIGITALES
========================================= */}

<LegalSection
  number="8"
  title="Tratamiento de datos en nuestros servicios digitales"
  id="servicios-digitales"
>
  <p>
    Xhunco Café podrá proporcionar productos, servicios y
    funcionalidades mediante medios digitales, incluyendo
    nuestro sitio web, plataforma, cuentas de usuario, sistemas
    de gestión de pedidos y otros canales tecnológicos
    habilitados por Xhunco Café.
  </p>

  <p>
    Para proporcionar estas funcionalidades podremos tratar
    los datos personales necesarios para crear y administrar
    cuentas, identificar usuarios, gestionar perfiles, procesar
    pedidos, administrar operaciones, proporcionar atención al
    cliente y dar seguimiento a los servicios solicitados.
  </p>

  <p>
    El tratamiento de los datos personales realizado mediante
    nuestros servicios digitales se llevará a cabo únicamente
    para las finalidades informadas en este Aviso de Privacidad
    y conforme a la legislación aplicable.
  </p>

  <LegalInfoBox type="info" title="Servicios digitales">
    Las funcionalidades digitales pueden requerir el tratamiento
    de determinados datos personales para permitir el acceso a
    cuentas, gestionar operaciones, procesar pedidos, mantener
    comunicaciones y proporcionar los servicios solicitados.
  </LegalInfoBox>
</LegalSection>
{/* =========================================
    9. XHUNCO COMO PROVEEDOR DE SERVICIOS DIGITALES
       PARA TERCEROS
========================================= */}

<LegalSection
  number="9"
  title="Xhunco como proveedor de servicios digitales para terceros"
  id="proveedor-servicios-terceros"
>
  <p>
    Xhunco Café podrá ofrecer a empresas, negocios,
    organizaciones u otros clientes servicios digitales,
    tecnológicos o de gestión mediante plataformas,
    aplicaciones, sistemas y herramientas desarrolladas,
    administradas o proporcionadas por Xhunco Café.
  </p>

  <p>
    En determinados servicios, Xhunco Café podrá tratar datos
    personales por cuenta de la empresa u organización que
    contrate dichos servicios, cuando sea necesario para
    proporcionar las funcionalidades contratadas.
  </p>

  <p>
    En estos casos, la empresa u organización que contrate el
    servicio podrá determinar las finalidades y condiciones del
    tratamiento de los datos personales que proporcione o que
    sean tratados mediante la plataforma, mientras que Xhunco
    Café podrá realizar las operaciones necesarias para prestar
    el servicio contratado, de acuerdo con las instrucciones y
    condiciones establecidas con dicho cliente.
  </p>

  <p>
    El alcance del tratamiento, las categorías de datos, las
    finalidades, los periodos de conservación, las medidas de
    seguridad y las obligaciones de las partes podrán establecerse
    mediante los contratos, términos de servicio, acuerdos de
    tratamiento de datos u otros instrumentos aplicables al
    servicio contratado.
  </p>

  <LegalInfoBox type="info" title="Tratamiento por cuenta de terceros">
    Cuando Xhunco Café trate datos personales por cuenta de un
    tercero, el tratamiento se limitará a las operaciones
    necesarias para proporcionar el servicio contratado y se
    realizará conforme a las condiciones e instrucciones
    aplicables al servicio.
  </LegalInfoBox>

  <p>
    Los usuarios finales que utilicen una plataforma o servicio
    proporcionado por Xhunco Café para una empresa u organización
    deberán consultar, cuando corresponda, el aviso de privacidad
    y las condiciones de tratamiento de datos de dicha empresa u
    organización, especialmente cuando esta determine las
    finalidades del tratamiento de sus datos personales.
  </p>
</LegalSection>
     {/* =========================================
    10. TRANSFERENCIAS
========================================= */}

<LegalSection
  number="10"
  title="Transferencia de datos personales"
  id="transferencias"
>
  <p>
    Xhunco Café podrá realizar transferencias de datos
    personales cuando sean necesarias para la prestación de
    los servicios, la realización de operaciones solicitadas
    por el titular, el cumplimiento de obligaciones legales o
    fiscales, o cuando exista una base legal que permita dicha
    transferencia.
  </p>

  <p>
    Las transferencias podrán realizarse, según corresponda,
    a autoridades, instituciones, proveedores, prestadores de
    servicios, socios comerciales u otros terceros que
    intervengan legítimamente en la prestación de los servicios
    o en el cumplimiento de las finalidades descritas en este
    Aviso de Privacidad.
  </p>

  <p>
    Cuando resulte aplicable, Xhunco Café procurará que las
    transferencias se realicen bajo condiciones que permitan
    preservar la confidencialidad, integridad y seguridad de
    los datos personales y de conformidad con la legislación
    aplicable.
  </p>

  <p>
    Cuando una transferencia requiera el consentimiento del
    titular, Xhunco Café solicitará dicho consentimiento en los
    términos previstos por la legislación aplicable, salvo que
    exista alguna excepción legal que permita realizarla sin
    dicho consentimiento.
  </p>

  <LegalInfoBox type="info" title="Sobre tus datos personales">
    Xhunco Café no comercializa los datos personales de sus
    clientes o usuarios. Los datos personales podrán ser
    compartidos únicamente cuando exista una finalidad
    legítima, una relación con los servicios proporcionados,
    una obligación legal o una base jurídica que permita dicho
    tratamiento.
  </LegalInfoBox>
</LegalSection>

      {/* =========================================
    11. PROVEEDORES TECNOLÓGICOS
========================================= */}

<LegalSection
  number="11"
  title="Proveedores tecnológicos"
  id="proveedores"
>
  <p>
    Xhunco Café podrá utilizar infraestructura, plataformas,
    aplicaciones y servicios tecnológicos proporcionados por
    terceros para operar, mantener, proteger y mejorar nuestros
    servicios digitales.
  </p>

  <p>
    Estos proveedores podrán intervenir, según corresponda, en
    funciones como:
  </p>

  <ul className="list-disc space-y-2 pl-6">
    <li>
      Alojamiento e infraestructura tecnológica.
    </li>

    <li>
      Almacenamiento y gestión de información.
    </li>

    <li>
      Autenticación y administración de cuentas.
    </li>

    <li>
      Envío y recepción de comunicaciones electrónicas.
    </li>

    <li>
      Mensajería y comunicaciones mediante canales habilitados
      por Xhunco Café.
    </li>

    <li>
      Procesamiento y gestión de determinadas operaciones y
      pagos.
    </li>

    <li>
      Seguridad, monitoreo y protección de nuestros sistemas.
    </li>

    <li>
      Otras funciones tecnológicas necesarias para proporcionar
      nuestros productos y servicios.
    </li>
  </ul>

  <p>
    Los proveedores tecnológicos podrán tener acceso a datos
    personales únicamente en la medida necesaria para
    proporcionar los servicios contratados o realizar las
    funciones correspondientes.
  </p>

  <p>
    Xhunco Café procurará seleccionar proveedores que cuenten
    con medidas razonables de seguridad y confidencialidad y,
    cuando resulte aplicable, establecerá las condiciones
    correspondientes para el tratamiento y protección de los
    datos personales.
  </p>

  <LegalInfoBox type="info" title="Proveedores externos">
    El uso de proveedores tecnológicos no significa que Xhunco
    Café comercialice tus datos personales. El acceso a la
    información se limitará, según corresponda, a las
    operaciones necesarias para proporcionar, mantener,
    proteger o mejorar los servicios.
  </LegalInfoBox>
</LegalSection>

     {/* =========================================
    12. COOKIES Y TECNOLOGÍAS SIMILARES
========================================= */}

<LegalSection
  number="12"
  title="Cookies y tecnologías similares"
  id="cookies"
>
  <p>
    Nuestro sitio web, plataforma y determinados servicios
    digitales pueden utilizar cookies, identificadores y
    tecnologías similares para permitir el funcionamiento de
    determinadas características, mantener sesiones, recordar
    determinadas preferencias, mejorar la experiencia de
    navegación y obtener información técnica relacionada con
    el uso de nuestros servicios.
  </p>

  <p>
    Dependiendo de su finalidad, algunas de estas tecnologías
    pueden ser necesarias para el funcionamiento, seguridad y
    prestación de determinadas funcionalidades de la plataforma,
    mientras que otras pueden utilizarse para mejorar nuestros
    servicios o comprender cómo interactúan los usuarios con
    nuestros canales digitales.
  </p>

  <p>
    La información obtenida mediante estas tecnologías podrá
    estar relacionada con el dispositivo, navegador, sesión,
    preferencias o actividad realizada dentro de nuestros
    servicios digitales, según corresponda a la tecnología
    utilizada.
  </p>

  <p>
    Para obtener información específica sobre las cookies y
    tecnologías similares utilizadas por Xhunco Café, sus
    finalidades, duración y las opciones disponibles para
    administrarlas, consulta nuestra{" "}
    <a
      href="/legal/cookies"
      className="font-semibold text-[#31572c] underline underline-offset-4 hover:text-[#3f6b38]"
    >
      Política de Cookies
    </a>
    .
  </p>

  <LegalInfoBox type="info" title="Administración de cookies">
    Algunas cookies pueden ser necesarias para el correcto
    funcionamiento de nuestros servicios y no podrán
    deshabilitarse cuando sean indispensables para proporcionar
    una funcionalidad solicitada. Otras tecnologías podrán
    administrarse mediante las opciones disponibles en el sitio
    o mediante la configuración del navegador, según corresponda.
  </LegalInfoBox>
</LegalSection>

      {/* =========================================
    13. MEDIDAS DE SEGURIDAD
========================================= */}

<LegalSection
  number="13"
  title="Medidas de seguridad"
  id="seguridad"
>
  <p>
    Xhunco Café implementa y mantiene medidas administrativas,
    técnicas y físicas razonables destinadas a proteger los
    datos personales que se encuentran bajo su responsabilidad
    contra daño, pérdida, alteración, destrucción o acceso, uso
    o tratamiento no autorizado.
  </p>

  <p>
    Las medidas de seguridad aplicables podrán considerar,
    entre otros factores, la naturaleza y cantidad de información
    tratada, las finalidades del tratamiento, los riesgos
    asociados, las características de los sistemas utilizados y
    el tipo de servicio proporcionado.
  </p>

  <p>
    Cuando Xhunco Café preste servicios digitales para terceros,
    las medidas de seguridad aplicables al tratamiento de datos
    realizado por cuenta del cliente podrán complementarse con
    las condiciones, obligaciones y requerimientos establecidos
    en el contrato o acuerdo correspondiente.
  </p>

  <p>
    Xhunco Café podrá revisar y actualizar sus medidas de
    seguridad cuando resulte necesario para mejorar la
    protección de la información y reducir los riesgos asociados
    al tratamiento de datos personales.
  </p>

  <LegalInfoBox type="security" title="Seguridad de la información">
    Ningún sistema de almacenamiento, procesamiento o
    transmisión de información puede garantizar una seguridad
    absoluta. Por ello, también recomendamos mantener bajo
    resguardo tus credenciales de acceso, utilizar contraseñas
    seguras y evitar compartirlas con terceros.
  </LegalInfoBox>
</LegalSection>

     {/* =========================================
    14. CONSERVACIÓN DE LOS DATOS PERSONALES
========================================= */}

<LegalSection
  number="14"
  title="Conservación de los datos personales"
  id="conservacion"
>
  <p>
    Xhunco Café conservará los datos personales durante el
    tiempo que resulte necesario para cumplir con las
    finalidades para las que fueron recabados y mientras exista
    una relación con el titular o una obligación que justifique
    su conservación.
  </p>

  <p>
    El periodo de conservación podrá variar dependiendo de la
    naturaleza de los datos y de la finalidad para la cual fueron
    tratados. Entre otros factores, podremos considerar la
    existencia de una cuenta, pedidos u operaciones realizadas,
    solicitudes de atención, obligaciones fiscales o legales,
    relaciones contractuales y la necesidad de atender posibles
    responsabilidades.
  </p>

  <p>
    Cuando Xhunco Café preste servicios digitales por cuenta de
    terceros, los periodos de conservación de los datos tratados
    mediante dichos servicios podrán establecerse de acuerdo con
    las instrucciones del cliente, las condiciones contractuales
    aplicables y las obligaciones legales correspondientes.
  </p>

  <p>
    Una vez que los datos personales ya no sean necesarios para
    las finalidades correspondientes y no exista una obligación
    legal, contractual o una causa legítima que justifique su
    conservación, se podrán aplicar las medidas correspondientes
    para su eliminación, bloqueo, anonimización o conservación
    conforme a las disposiciones aplicables.
  </p>

  <LegalInfoBox type="info" title="Conservación de información">
    El tiempo de conservación no necesariamente será el mismo
    para todos los datos personales. Dependerá de la finalidad
    del tratamiento, la naturaleza de la información, la relación
    con el titular y las obligaciones que resulten aplicables.
  </LegalInfoBox>
</LegalSection>
     {/* =========================================
    15. DERECHOS ARCO
========================================= */}

<LegalSection
  number="15"
  title="Derechos ARCO"
  id="derechos-arco"
>
  <p>
    Como titular de tus datos personales, puedes ejercer,
    cuando resulte legalmente procedente, los derechos de
    Acceso, Rectificación, Cancelación y Oposición (ARCO).
  </p>

  <ul className="list-disc space-y-2 pl-6">
    <li>
      <strong>Acceso:</strong> conocer qué datos personales
      tenemos sobre ti, cómo los utilizamos y, en los casos
      previstos por la legislación aplicable, obtener acceso
      a dicha información.
    </li>

    <li>
      <strong>Rectificación:</strong> solicitar la corrección
      o actualización de tus datos personales cuando sean
      inexactos, incompletos o se encuentren desactualizados.
    </li>

    <li>
      <strong>Cancelación:</strong> solicitar la eliminación
      de tus datos personales cuando proceda conforme a la
      legislación aplicable y siempre que no exista una causa
      legal que justifique su conservación.
    </li>

    <li>
      <strong>Oposición:</strong> solicitar que dejemos de
      tratar tus datos personales para determinadas finalidades
      cuando exista una causa legítima para ello y resulte
      legalmente procedente.
    </li>
  </ul>

  <p>
    El ejercicio de los derechos ARCO es independiente entre
    sí. El ejercicio de uno de estos derechos no constituye un
    requisito previo para ejercer cualquiera de los demás.
  </p>

  <LegalInfoBox type="info" title="Ejercicio de tus derechos">
    Las solicitudes serán atendidas conforme a los requisitos,
    procedimientos, plazos y excepciones establecidos por la
    legislación aplicable en materia de protección de datos
    personales.
  </LegalInfoBox>
</LegalSection>


{/* =========================================
    16. PROCEDIMIENTO PARA EJERCER DERECHOS ARCO
========================================= */}

<LegalSection
  number="16"
  title="Procedimiento para ejercer derechos ARCO"
  id="procedimiento-arco"
>
  <p>
    Para ejercer cualquiera de los derechos ARCO, puedes
    presentar una solicitud a través del correo electrónico
    destinado para la atención de asuntos relacionados con la
    privacidad y protección de datos personales:
  </p>

  <p>
    <a
      href={`mailto:${LEGAL.legalEmail}`}
      className="font-semibold text-[#31572c] underline underline-offset-4 hover:text-[#3f6b38]"
    >
      {LEGAL.legalEmail}
    </a>
  </p>

  <p>
    La solicitud deberá contener la información necesaria para
    identificar al titular, indicar el derecho que se pretende
    ejercer y proporcionar los elementos que permitan localizar
    los datos personales relacionados con la solicitud.
  </p>

  <p>
    Cuando resulte necesario para verificar la identidad del
    titular o de su representante, Xhunco Café podrá solicitar
    información o documentación adicional conforme a la
    legislación aplicable.
  </p>

  <p>
    Una vez recibida la solicitud, Xhunco Café realizará las
    acciones correspondientes para analizarla y determinar su
    procedencia de acuerdo con la legislación aplicable y con
    las características del tratamiento de datos personales
    relacionado con la solicitud.
  </p>

  <LegalInfoBox type="info" title="Plazos y respuesta">
    La respuesta a las solicitudes de derechos ARCO, así como
    las acciones que correspondan cuando una solicitud resulte
    procedente, se realizarán dentro de los plazos y bajo las
    condiciones establecidos por la legislación aplicable.
  </LegalInfoBox>
</LegalSection>

 {/* =========================================
    17. REVOCACIÓN DEL CONSENTIMIENTO
========================================= */}

<LegalSection
  number="17"
  title="Revocación del consentimiento"
  id="revocacion"
>
  <p>
    Cuando el tratamiento de tus datos personales dependa de
    tu consentimiento, podrás solicitar su revocación en
    cualquier momento, de conformidad con la legislación
    aplicable.
  </p>

  <p>
    La solicitud de revocación podrá presentarse a través del
    correo electrónico destinado para la atención de asuntos
    relacionados con la privacidad y protección de datos
    personales:
  </p>

  <p>
    <a
      href={`mailto:${LEGAL.legalEmail}`}
      className="font-semibold text-[#31572c] underline underline-offset-4 hover:text-[#3f6b38]"
    >
      {LEGAL.legalEmail}
    </a>
  </p>

  <p>
    La revocación podrá hacerse efectiva respecto de aquellos
    tratamientos que tengan como base jurídica el consentimiento
    del titular. La revocación no afectará la licitud del
    tratamiento realizado con anterioridad a la fecha en que
    produzca sus efectos.
  </p>

  <p>
    La revocación podrá estar sujeta a las excepciones,
    limitaciones y condiciones previstas por la legislación
    aplicable, así como a la existencia de obligaciones legales
    o de otras bases jurídicas que permitan continuar con
    determinado tratamiento.
  </p>

  <LegalInfoBox type="info" title="Importante">
    Solicitar la revocación del consentimiento no necesariamente
    implica la eliminación inmediata de todos los datos
    personales. Xhunco Café podrá conservar determinada
    información cuando exista una obligación legal, contractual
    o una causa legítima que lo justifique.
  </LegalInfoBox>
</LegalSection>

     {/* =========================================
    18. LIMITACIÓN DEL USO O DIVULGACIÓN
========================================= */}

<LegalSection
  number="18"
  title="Limitación del uso o divulgación"
  id="limitacion"
>
  <p>
    Puedes solicitar la limitación del uso o divulgación de tus
    datos personales cuando consideres que existe una finalidad
    o tratamiento respecto del cual deseas establecer una
    restricción, siempre que resulte legalmente procedente.
  </p>

  <p>
    La solicitud podrá presentarse a través de los medios de
    contacto establecidos en este Aviso de Privacidad,
    proporcionando la información necesaria para identificar al
    titular y precisar el tratamiento, finalidad o comunicación
    respecto de la cual se solicita la limitación.
  </p>

  <p>
    Xhunco Café analizará cada solicitud y determinará las
    medidas que correspondan considerando la naturaleza de la
    solicitud, las finalidades del tratamiento, las obligaciones
    legales aplicables y las demás circunstancias relevantes.
  </p>

  <p>
    Cuando la solicitud resulte procedente, Xhunco Café aplicará
    las medidas correspondientes dentro del alcance permitido
    por la legislación aplicable.
  </p>

  <LegalInfoBox type="info" title="Limitación">
    La limitación del uso o divulgación podrá estar sujeta a las
    excepciones y condiciones previstas por la legislación
    aplicable y no necesariamente implicará la eliminación de
    los datos personales.
  </LegalInfoBox>
</LegalSection>

    {/* =========================================
    19. MENORES DE EDAD
========================================= */}

<LegalSection
  number="19"
  title="Datos de menores de edad"
  id="menores"
>
  <p>
    Nuestros servicios están dirigidos principalmente a
    personas que cuentan con capacidad legal para contratar,
    realizar operaciones y utilizar los servicios que
    proporciona Xhunco Café.
  </p>

  <p>
    Xhunco Café no busca recabar deliberadamente datos
    personales de menores de edad para finalidades que no sean
    necesarias para la prestación de nuestros servicios.
  </p>

  <p>
    Cuando el tratamiento de datos personales de una persona
    menor de edad resulte necesario para alguna de las
    funcionalidades o servicios proporcionados, dicho
    tratamiento se realizará conforme a las disposiciones
    legales aplicables y, cuando corresponda, con la
    intervención o autorización de quien legalmente deba
    otorgarla.
  </p>

  <LegalInfoBox type="warning" title="Protección de menores">
    Si consideras que un menor de edad nos ha proporcionado
    datos personales de manera indebida, puedes comunicarte con
    nosotros a través de los medios indicados en este Aviso de
    Privacidad para que podamos revisar la situación.
  </LegalInfoBox>
</LegalSection>

   {/* =========================================
    20. CAMBIOS AL AVISO
========================================= */}

<LegalSection
  number="20"
  title="Cambios al Aviso de Privacidad"
  id="cambios"
>
  <p>
    Xhunco Café podrá modificar, actualizar o complementar este
    Aviso de Privacidad cuando resulte necesario debido a
    cambios legales, regulatorios, tecnológicos, operativos o
    en los productos, servicios y funcionalidades que
    proporcionamos.
  </p>

  <p>
    La versión vigente del Aviso de Privacidad estará disponible
    permanentemente en nuestro sitio web, dentro del Centro
    Legal de Xhunco Café.
  </p>

  <p>
    Cuando resulte necesario o legalmente exigible, podremos
    comunicar los cambios mediante los mecanismos que
    correspondan, considerando la naturaleza y alcance de las
    modificaciones realizadas.
  </p>

  <LegalInfoBox type="info" title="Versión vigente">
    Te recomendamos consultar periódicamente este Aviso de
    Privacidad para conocer cualquier modificación o
    actualización.
  </LegalInfoBox>
</LegalSection>

     {/* =========================================
    21. CONTACTO
========================================= */}

<LegalSection
  number="21"
  title="Contacto"
  id="contacto"
>
  <p>
    Si tienes dudas sobre este Aviso de Privacidad, el
    tratamiento de tus datos personales, nuestros servicios
    digitales o deseas ejercer alguno de tus derechos, puedes
    comunicarte con Xhunco Café mediante los siguientes medios:
  </p>

  <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
    <p className="font-semibold text-gray-900">
      {LEGAL.companyName}
    </p>

    <div className="mt-3 space-y-2 text-sm text-gray-600">
      <p>
        <strong>Correo legal:</strong>{" "}
        <a
          href={`mailto:${LEGAL.legalEmail}`}
          className="text-[#31572c] hover:underline"
        >
          {LEGAL.legalEmail}
        </a>
      </p>

      <p>
        <strong>Domicilio:</strong>{" "}
        {LEGAL.address}
      </p>

      <p>
        <strong>Sitio web:</strong>{" "}
        <a
          href={LEGAL.website}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#31572c] hover:underline"
        >
          {LEGAL.website}
        </a>
      </p>
    </div>
  </div>
</LegalSection>

  {/* =========================================
    CIERRE
========================================= */}

<LegalInfoBox type="success" title="Aviso vigente">
  Este Aviso de Privacidad corresponde a la versión{" "}
  <strong>{LEGAL.version}</strong> actualmente publicada
  en el Centro Legal de Xhunco Café. Consulta periódicamente
  esta página para conocer cualquier actualización.
</LegalInfoBox>
</LegalLayout>
  );
}