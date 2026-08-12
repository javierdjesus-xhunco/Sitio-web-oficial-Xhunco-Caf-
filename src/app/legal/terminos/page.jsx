import LegalLayout from "@/components/legal/LegalLayout";
import LegalSection from "@/components/legal/LegalSection";
import LegalInfoBox from "@/components/legal/LegalInfoBox";
import LegalLastUpdated from "@/components/legal/LegalLastUpdated";

import { LEGAL } from "@/lib/legal/legalConfig";

export const metadata = {
  title: `Términos y Condiciones | ${LEGAL.companyName}`,
  description:
    "Consulta los términos y condiciones aplicables al uso del sitio web, plataforma, productos y servicios de Xhunco Café.",
};

export default function TerminosPage() {
  return (
    <LegalLayout
      title="Términos y Condiciones"
      description="Consulta las condiciones aplicables al uso del sitio web, plataforma, productos y servicios de Xhunco Café."
      currentSlug="terminos"
      badge="Condiciones"
    >
      {/* =========================================
          INTRODUCCIÓN
      ========================================= */}

      <div className="mb-8">
        <p className="text-base leading-8 text-gray-700">
          Estos Términos y Condiciones regulan el acceso,
          navegación y uso del sitio web, plataforma digital,
          productos y servicios proporcionados por{" "}
          {LEGAL.companyName}.
        </p>

        <p className="mt-4 text-base leading-8 text-gray-700">
          Al acceder, navegar, registrarte o utilizar nuestros
          servicios, aceptas quedar sujeto a los presentes
          Términos y Condiciones, así como a las disposiciones
          legales aplicables.
        </p>

        <LegalLastUpdated />
      </div>

      <LegalInfoBox type="info" title="Importante">
        Te recomendamos leer cuidadosamente estos Términos y
        Condiciones antes de utilizar nuestros servicios. Si no
        estás de acuerdo con alguna de sus disposiciones, deberás
        abstenerte de utilizar los servicios correspondientes.
      </LegalInfoBox>

      {/* =========================================
          1. IDENTIFICACIÓN Y ALCANCE
      ========================================= */}

      <LegalSection
        number="1"
        title="Identificación y alcance"
        id="identificacion"
      >
        <p>
          Los presentes Términos y Condiciones son aplicables al
          uso del sitio web, plataforma digital, sistemas,
          funcionalidades, productos y servicios que sean
          proporcionados por {LEGAL.companyName}.
        </p>

        <p>
          Para efectos de estos Términos y Condiciones, cuando
          hagamos referencia a "Xhunco Café", "Xhunco", "nosotros"
          o "nuestro", nos referimos a la entidad responsable de
          proporcionar los productos y servicios correspondientes.
        </p>

        <p>
          Estos términos podrán complementarse con condiciones
          particulares aplicables a determinados productos,
          servicios, promociones, operaciones o funcionalidades.
        </p>
      </LegalSection>

      {/* =========================================
          2. ACEPTACIÓN
      ========================================= */}

      <LegalSection
        number="2"
        title="Aceptación de los Términos y Condiciones"
        id="aceptacion"
      >
        <p>
          El acceso y utilización de nuestros servicios implica
          que el usuario reconoce haber leído, comprendido y
          aceptado estos Términos y Condiciones.
        </p>

        <p>
          Cuando una operación requiera una aceptación expresa,
          dicha aceptación podrá realizarse mediante los
          mecanismos habilitados dentro de la plataforma o por
          cualquier otro medio establecido para el servicio
          correspondiente.
        </p>

        <LegalInfoBox type="warning" title="Si no estás de acuerdo">
          Si no aceptas estos Términos y Condiciones, deberás
          abstenerte de utilizar las funcionalidades o servicios
          respecto de los cuales su aceptación sea necesaria.
        </LegalInfoBox>
      </LegalSection>

      {/* =========================================
          3. DESCRIPCIÓN DE LOS SERVICIOS
      ========================================= */}

      <LegalSection
        number="3"
        title="Descripción de los productos y servicios"
        id="servicios"
      >
        <p>
          Xhunco Café podrá ofrecer productos, servicios y
          funcionalidades relacionadas con la comercialización
          de café, suministros, productos complementarios,
          distribución y otros servicios que sean incorporados
          posteriormente a nuestra operación.
        </p>

        <p>
          Asimismo, Xhunco Café podrá desarrollar o proporcionar
          herramientas y servicios digitales destinados a la
          gestión de operaciones propias o a la prestación de
          servicios tecnológicos para terceros.
        </p>

        <p>
          Las características, disponibilidad, precios,
          condiciones y alcance de cada producto o servicio
          podrán variar y serán informados a través de los
          canales correspondientes.
        </p>
      </LegalSection>

      {/* =========================================
          4. CUENTA DE USUARIO
      ========================================= */}

      <LegalSection
        number="4"
        title="Cuenta de usuario"
        id="cuenta"
      >
        <p>
          Algunas funcionalidades de nuestra plataforma pueden
          requerir la creación de una cuenta de usuario.
        </p>

        <p>
          El usuario será responsable de proporcionar información
          verdadera, completa y actualizada cuando sea requerida
          para crear o administrar su cuenta.
        </p>

        <p>
          El usuario también será responsable de mantener bajo
          resguardo sus credenciales de acceso y de notificar a
          Xhunco Café cuando detecte un uso no autorizado de su
          cuenta.
        </p>

        <LegalInfoBox type="security" title="Seguridad de la cuenta">
          No compartas tus contraseñas, códigos de acceso o
          credenciales con terceros. Las operaciones realizadas
          mediante una cuenta podrán atribuirse al titular de
          dicha cuenta, salvo que exista evidencia de un acceso
          no autorizado.
        </LegalInfoBox>
      </LegalSection>

      {/* =========================================
    5. PEDIDOS Y CONTRATACIÓN
========================================= */}

<LegalSection
  number="5"
  title="Pedidos y contratación"
  id="pedidos"
>
  <p>
    Los usuarios podrán realizar pedidos de productos o
    solicitar determinados servicios mediante los canales
    habilitados por Xhunco Café.
  </p>

  <p>
    Antes de confirmar una operación, el usuario deberá
    revisar la información correspondiente al pedido,
    incluyendo, cuando resulte aplicable, los productos
    seleccionados, cantidades, precios, costos adicionales,
    método de entrega y demás condiciones aplicables.
  </p>

  <p>
    El envío de una solicitud o pedido no implica
    necesariamente su aceptación automática por parte de
    Xhunco Café. La operación quedará sujeta a la
    disponibilidad de los productos o servicios, así como a
    las condiciones aplicables a la operación.
  </p>

  <p>
    Una vez que el pedido haya sido recibido y aceptado,
    podremos proporcionar al usuario una confirmación o
    actualización mediante los medios de contacto registrados
    en la plataforma.
  </p>

  <p>
    Xhunco Café podrá comunicarse con el usuario cuando sea
    necesario aclarar información, confirmar determinados
    datos, resolver alguna incidencia o completar elementos
    necesarios para procesar el pedido.
  </p>

  <LegalInfoBox type="info" title="Confirmación del pedido">
    La confirmación de un pedido estará sujeta a la
    disponibilidad de los productos o servicios y al
    cumplimiento de las condiciones aplicables a la operación.
  </LegalInfoBox>
</LegalSection>

{/* =========================================
    6. PRECIOS E INFORMACIÓN COMERCIAL
========================================= */}

<LegalSection
  number="6"
  title="Precios e información comercial"
  id="precios"
>
  <p>
    Los precios de los productos y servicios ofrecidos por
    Xhunco Café serán los que se encuentren publicados o
    comunicados a través de los canales comerciales
    correspondientes al momento de realizar una operación,
    salvo que se indique expresamente una condición distinta.
  </p>

  <p>
    Dependiendo del tipo de cliente, producto, volumen de
    compra, canal de venta, promoción o condición comercial
    aplicable, podrán existir diferentes precios, descuentos,
    listas comerciales o condiciones particulares.
  </p>

  <p>
    Los precios podrán modificarse en cualquier momento. Las
    modificaciones no afectarán las operaciones que hayan sido
    previamente confirmadas, salvo que exista una causa que
    legalmente permita modificar, cancelar o ajustar dichas
    condiciones.
  </p>

  <p>
    Cuando corresponda, los precios y cargos adicionales
    aplicables a una operación serán mostrados o comunicados
    antes de su confirmación, de acuerdo con las características
    del canal utilizado y de la operación realizada.
  </p>

  <p>
    Xhunco Café procurará mantener actualizada la información
    comercial publicada en sus canales digitales. No obstante,
    pueden presentarse errores involuntarios en precios,
    descripciones, disponibilidad u otra información.
  </p>

  <LegalInfoBox type="info" title="Información comercial">
    En caso de detectarse un error evidente en el precio,
    descripción, disponibilidad o condiciones de un producto o
    servicio, Xhunco Café podrá revisar la operación y
    comunicarse con el usuario para determinar las acciones
    que correspondan conforme a las condiciones aplicables y a
    la legislación vigente.
  </LegalInfoBox>
</LegalSection>

{/* =========================================
    7. PAGOS
========================================= */}

<LegalSection
  number="7"
  title="Pagos"
  id="pagos"
>
  <p>
    Cuando una operación requiera realizar un pago, el usuario
    deberá utilizar alguno de los métodos de pago habilitados
    por Xhunco Café para la operación correspondiente.
  </p>

  <p>
    Dependiendo del canal, producto o servicio utilizado,
    podrán estar disponibles diferentes métodos de pago. Las
    condiciones específicas de cada operación serán informadas
    al usuario antes o durante el proceso de contratación,
    según corresponda.
  </p>

  <p>
    Cuando el pago sea procesado mediante una plataforma,
    institución financiera, procesador de pagos u otro tercero,
    dicho procesamiento podrá estar sujeto adicionalmente a
    los términos, condiciones y políticas de la entidad que
    proporcione el servicio de pago.
  </p>

  <p>
    La confirmación de un pago dependerá de la autorización y
    confirmación correspondiente por parte del medio o
    proveedor de pago utilizado.
  </p>

  <p>
    En caso de que un pago sea rechazado, cancelado, no
    autorizado o no pueda ser confirmado, Xhunco Café podrá
    suspender, retener o cancelar la operación correspondiente
    hasta que se resuelva la situación, cuando resulte
    aplicable.
  </p>

  <p>
    Xhunco Café podrá solicitar información adicional cuando
    resulte razonablemente necesaria para verificar una
    operación o atender una incidencia relacionada con el pago,
    siempre de conformidad con la legislación aplicable.
  </p>

  <LegalInfoBox type="info" title="Procesamiento de pagos">
    Xhunco Café podrá apoyarse en proveedores externos para
    procesar determinadas operaciones de pago. La información
    necesaria para procesar dichas operaciones podrá quedar
    sujeta también a las políticas y condiciones del proveedor
    correspondiente.
  </LegalInfoBox>
</LegalSection>

{/* =========================================
    8. ENTREGA, ENVÍO Y RECEPCIÓN
========================================= */}

<LegalSection
  number="8"
  title="Entrega, envío y recepción de productos"
  id="entrega"
>
  <p>
    Los productos adquiridos a través de Xhunco Café podrán
    entregarse mediante los métodos de envío, reparto,
    recolección o entrega disponibles para la operación
    correspondiente.
  </p>

  <p>
    La cobertura, disponibilidad, costo y condiciones de
    entrega podrán variar dependiendo de la ubicación del
    cliente, tipo de producto, volumen del pedido, modalidad
    seleccionada y demás condiciones aplicables a la operación.
  </p>

  <p>
    Los tiempos de entrega que se indiquen al realizar un
    pedido tendrán carácter estimado, salvo que Xhunco Café
    indique expresamente que se trata de un plazo determinado.
    Estos tiempos podrán verse afectados por circunstancias
    operativas, logísticas, climáticas, de transporte o por
    situaciones ajenas al control razonable de Xhunco Café.
  </p>

  <p>
    El usuario deberá proporcionar información correcta y
    suficiente para realizar la entrega, incluyendo, cuando
    corresponda, domicilio, referencias, datos de contacto y
    cualquier otra información necesaria para localizar el
    destino.
  </p>

  <p>
    Cuando la entrega no pueda realizarse debido a información
    incorrecta, incompleta, ausencia del destinatario,
    imposibilidad de acceso al domicilio o cualquier otra
    circunstancia atribuible al usuario, podrán aplicarse
    condiciones adicionales de reprogramación, reenvío o
    entrega, según corresponda.
  </p>

  <p>
    Al recibir un pedido, el usuario deberá verificar, en la
    medida razonablemente posible, que los productos recibidos
    correspondan con la operación realizada y comunicar
    oportunamente cualquier incidencia relacionada con la
    entrega.
  </p>

  <LegalInfoBox type="info" title="Tiempos de entrega">
    Los tiempos de entrega podrán variar dependiendo de la
    ubicación, modalidad de entrega y condiciones operativas.
    Cuando exista un tiempo estimado, este podrá estar sujeto a
    circunstancias que se encuentren fuera del control razonable
    de Xhunco Café.
  </LegalInfoBox>
</LegalSection>
{/* =========================================
    9. CAMBIOS, DEVOLUCIONES Y CANCELACIONES
========================================= */}

<LegalSection
  number="9"
  title="Cambios, devoluciones y cancelaciones"
  id="cambios-devoluciones"
>
  <p>
    Las solicitudes de cambio, devolución o cancelación de
    productos estarán sujetas a las condiciones aplicables a
    cada operación, al tipo de producto adquirido y a la
    legislación vigente.
  </p>

  <p>
    Dependiendo de la naturaleza de la operación, podrán
    existir productos o servicios que, por sus características,
    condiciones sanitarias, personalización, preparación o
    cualquier otra circunstancia aplicable, estén sujetos a
    condiciones particulares respecto de cambios, devoluciones
    o cancelaciones.
  </p>

  <p>
    Las solicitudes deberán realizarse a través de los canales
    de atención habilitados por Xhunco Café y dentro de los
    plazos que correspondan conforme a la operación y a las
    políticas aplicables.
  </p>

  <p>
    Para determinar la procedencia de una solicitud, Xhunco
    Café podrá requerir información relacionada con la compra,
    incluyendo número de pedido, comprobante de operación,
    descripción de la incidencia, fotografías u otros elementos
    que permitan revisar el caso.
  </p>

  <p>
    Cuando un cambio, devolución o cancelación resulte
    procedente, Xhunco Café comunicará al usuario el
    procedimiento aplicable y, cuando corresponda, las
    condiciones relacionadas con la entrega, recolección,
    sustitución, reembolso o ajuste correspondiente.
  </p>

  <LegalInfoBox type="info" title="Política específica">
    Las condiciones específicas, plazos y procedimientos
    aplicables a cambios y devoluciones podrán consultarse en
    nuestra Política de Cambios y Devoluciones, disponible en
    el Centro Legal de Xhunco Café.
  </LegalInfoBox>

  <p>
    Lo establecido en esta sección se interpretará de
    conformidad con los derechos que correspondan a los
    consumidores conforme a la legislación aplicable.
  </p>
</LegalSection>

{/* =========================================
    10. PROPIEDAD INTELECTUAL
========================================= */}

<LegalSection
  number="10"
  title="Propiedad intelectual y uso de contenidos"
  id="propiedad-intelectual"
>
  <p>
    Los contenidos disponibles en el sitio web, plataforma y
    demás canales digitales de Xhunco Café, incluyendo de manera
    enunciativa mas no limitativa, textos, fotografías, imágenes,
    gráficos, logotipos, nombres comerciales, diseños, elementos
    visuales, catálogos, materiales audiovisuales, interfaces,
    funcionalidades y demás elementos que formen parte de
    nuestros servicios, podrán encontrarse protegidos por las
    disposiciones aplicables en materia de propiedad intelectual.
  </p>

  <p>
    La utilización de nuestros servicios no otorga al usuario
    ningún derecho de propiedad sobre dichos contenidos,
    elementos, marcas, diseños, software o materiales.
  </p>

  <p>
    Salvo que exista autorización expresa de Xhunco Café o una
    disposición legal que permita lo contrario, queda prohibida
    la reproducción, modificación, distribución, publicación,
    transmisión, comercialización, extracción, explotación o
    utilización no autorizada de los contenidos disponibles en
    nuestros servicios digitales.
  </p>

  <p>
    El nombre, logotipo, identidad visual y demás signos
    distintivos asociados con Xhunco Café podrán constituir
    marcas, nombres comerciales u otros elementos protegidos por
    la legislación aplicable. Su utilización sin autorización
    podrá dar lugar a las acciones que correspondan.
  </p>

  <p>
    En caso de que Xhunco Café proporcione herramientas,
    plataformas, software, sistemas o funcionalidades digitales
    a terceros, los derechos correspondientes sobre dichos
    desarrollos, componentes y materiales se determinarán de
    acuerdo con los contratos, licencias o condiciones específicas
    aplicables a cada servicio.
  </p>

  <LegalInfoBox type="warning" title="Uso autorizado">
    El acceso al sitio web o a cualquiera de nuestros servicios
    digitales no implica la concesión de una licencia general
    para copiar, modificar, distribuir o explotar nuestros
    contenidos, sistemas, marcas o elementos de propiedad
    intelectual.
  </LegalInfoBox>
</LegalSection>

{/* =========================================
    11. CUENTAS DE USUARIO Y CREDENCIALES
========================================= */}

<LegalSection
  number="11"
  title="Cuentas de usuario y credenciales de acceso"
  id="cuentas-usuario"
>
  <p>
    Determinadas funcionalidades de Xhunco Café pueden requerir
    la creación de una cuenta de usuario. El usuario será
    responsable de proporcionar información veraz, actualizada
    y suficiente para la correcta creación y administración de
    su cuenta.
  </p>

  <p>
    Cuando una cuenta requiera credenciales de acceso, el usuario
    deberá mantener bajo resguardo su contraseña, códigos de
    acceso y demás elementos utilizados para autenticarse en la
    plataforma.
  </p>

  <p>
    Las credenciales de acceso son de carácter personal y no
    deberán compartirse con terceros cuando la naturaleza de la
    cuenta o del servicio implique un acceso individual.
  </p>

  <p>
    El usuario será responsable de las actividades realizadas
    mediante su cuenta cuando dichas actividades sean atribuibles
    razonablemente al uso de sus credenciales, salvo que exista
    evidencia de un acceso no autorizado o una situación que
    corresponda investigar por parte de Xhunco Café.
  </p>

  <p>
    Si detectas o sospechas que tus credenciales han sido
    comprometidas, que alguien ha accedido a tu cuenta sin
    autorización o que existe cualquier actividad inusual,
    deberás comunicarlo a Xhunco Café a través de los canales
    de atención disponibles.
  </p>

  <p>
    Xhunco Café podrá suspender temporalmente o limitar el acceso
    a una cuenta cuando resulte necesario para proteger la
    seguridad de la plataforma, prevenir usos indebidos, atender
    incidentes de seguridad o cumplir con obligaciones legales o
    contractuales.
  </p>

  <p>
    Cuando una cuenta deje de ser necesaria o cuando proceda su
    cancelación conforme a las condiciones del servicio, podrán
    aplicarse medidas de cierre, suspensión o eliminación de la
    cuenta y de la información asociada, considerando las
    obligaciones legales y las políticas de conservación
    correspondientes.
  </p>

  <LegalInfoBox type="security" title="Protege tu cuenta">
    Xhunco Café nunca deberá solicitarte que compartas tu
    contraseña o códigos privados de autenticación a través de
    canales no autorizados. Mantén tus credenciales bajo
    resguardo y comunícate con nosotros si detectas actividad
    inusual en tu cuenta.
  </LegalInfoBox>
</LegalSection> 

{/* =========================================
    12. USO PERMITIDO DE LA PLATAFORMA
========================================= */}

<LegalSection
  number="12"
  title="Uso permitido de la plataforma"
  id="uso-plataforma"
>
  <p>
    El usuario deberá utilizar el sitio web, la plataforma y
    los servicios de Xhunco Café de manera lícita, responsable
    y conforme a estos Términos y Condiciones, a las
    instrucciones proporcionadas y a la legislación aplicable.
  </p>

  <p>
    Queda prohibido utilizar nuestros servicios para realizar
    actividades que puedan afectar su funcionamiento, seguridad,
    disponibilidad o integridad, así como para realizar
    actividades ilícitas o contrarias a los derechos de terceros.
  </p>

  <p>
    De manera enunciativa, mas no limitativa, el usuario no
    deberá:
  </p>

  <ul className="list-disc space-y-2 pl-6">
    <li>
      Utilizar la plataforma para realizar actividades
      fraudulentas, ilícitas o contrarias a la legislación
      aplicable.
    </li>

    <li>
      Intentar acceder sin autorización a cuentas, sistemas,
      servidores, bases de datos o información de otros usuarios
      o de Xhunco Café.
    </li>

    <li>
      Introducir código malicioso, virus, archivos dañinos o
      cualquier mecanismo destinado a afectar el funcionamiento
      de nuestros sistemas.
    </li>

    <li>
      Realizar acciones que puedan generar una carga excesiva,
      interferir con la disponibilidad de la plataforma o
      afectar su funcionamiento normal.
    </li>

    <li>
      Utilizar herramientas automatizadas, robots, scrapers u
      otros mecanismos para extraer información de la plataforma
      cuando dicha actividad no haya sido expresamente autorizada.
    </li>

    <li>
      Suplantar la identidad de otra persona, empresa,
      organización o usuario.
    </li>

    <li>
      Utilizar información obtenida mediante la plataforma para
      afectar, acosar, defraudar o perjudicar a terceros.
    </li>

    <li>
      Intentar eludir mecanismos de seguridad, autenticación,
      control de acceso o restricciones implementadas en
      nuestros servicios.
    </li>

    <li>
      Reproducir, copiar, modificar, distribuir o explotar
      contenidos, funcionalidades o elementos de la plataforma
      sin autorización cuando dicha utilización no esté
      permitida por la legislación aplicable.
    </li>
  </ul>

  <p>
    Xhunco Café podrá investigar actividades que razonablemente
    puedan constituir un incumplimiento de estos Términos y
    Condiciones y, cuando resulte procedente, adoptar medidas
    para proteger la plataforma, a sus usuarios, a terceros y
    nuestros derechos.
  </p>

  <LegalInfoBox type="warning" title="Uso indebido">
    El uso indebido de la plataforma podrá dar lugar a la
    suspensión o limitación del acceso a determinadas
    funcionalidades, así como a otras medidas que resulten
    procedentes conforme a estos Términos y Condiciones y a la
    legislación aplicable.
  </LegalInfoBox>
</LegalSection>

{/* =========================================
    13. CONTENIDO PROPORCIONADO POR USUARIOS
========================================= */}

<LegalSection
  number="13"
  title="Contenido proporcionado por usuarios y clientes"
  id="contenido-usuarios"
>
  <p>
    Determinadas funcionalidades de Xhunco Café podrán permitir
    que los usuarios o clientes proporcionen, carguen,
    publiquen, transmitan o incorporen información y contenido
    dentro de nuestros servicios digitales.
  </p>

  <p>
    El usuario será responsable de que el contenido que
    proporcione sea lícito, verdadero, pertinente y que su
    utilización dentro de la plataforma no infrinja derechos de
    terceros, obligaciones contractuales o disposiciones
    legales aplicables.
  </p>

  <p>
    De manera enunciativa, el contenido proporcionado por los
    usuarios podrá incluir información comercial, fotografías,
    logotipos, documentos, descripciones de productos,
    información de contacto u otros materiales relacionados con
    el servicio contratado.
  </p>

  <p>
    Cuando resulte necesario para proporcionar una
    funcionalidad o servicio solicitado, el usuario autoriza a
    Xhunco Café a utilizar, reproducir, almacenar, transmitir o
    procesar dicho contenido únicamente en la medida necesaria
    para operar, mantener, proporcionar y mejorar el servicio
    correspondiente, de acuerdo con las condiciones aplicables.
  </p>

  <p>
    El usuario declara que cuenta con los derechos, permisos o
    autorizaciones necesarios para proporcionar el contenido y
    permitir su utilización conforme a estos Términos y
    Condiciones.
  </p>

  <p>
    Xhunco Café podrá retirar, bloquear o limitar el acceso a
    contenido cuando exista una razón legítima para considerar
    que dicho contenido infringe la legislación aplicable,
    derechos de terceros, estos Términos y Condiciones o las
    condiciones particulares del servicio.
  </p>

  <LegalInfoBox type="info" title="Responsabilidad sobre el contenido">
    Xhunco Café no asume la responsabilidad por la titularidad,
    exactitud o legalidad del contenido proporcionado por los
    usuarios o clientes. La responsabilidad correspondiente
    permanecerá en quien proporcione dicho contenido, sin
    perjuicio de las obligaciones que legalmente correspondan a
    Xhunco Café.
  </LegalInfoBox>
</LegalSection>

{/* =========================================
    14. DISPONIBILIDAD Y MODIFICACIONES
========================================= */}

<LegalSection
  number="14"
  title="Disponibilidad y modificaciones de la plataforma"
  id="disponibilidad"
>
  <p>
    Xhunco Café procurará mantener disponibles y funcionando
    adecuadamente sus sitios web, plataformas y servicios
    digitales. Sin embargo, determinadas funcionalidades
    podrán presentar interrupciones temporales debido a
    mantenimiento, actualizaciones, mejoras, fallas técnicas,
    incidentes de seguridad o circunstancias ajenas al control
    razonable de Xhunco Café.
  </p>

  <p>
    Xhunco Café podrá realizar modificaciones, actualizaciones,
    mejoras, ampliaciones, sustituciones o ajustes a sus
    plataformas, sistemas, funcionalidades, interfaces y
    servicios cuando resulte necesario para mejorar su
    funcionamiento, seguridad, desempeño o adaptación a nuevas
    necesidades operativas, tecnológicas o legales.
  </p>

  <p>
    Algunas modificaciones podrán implicar cambios en la forma
    en que determinadas funcionalidades operan, siempre
    procurando mantener la continuidad razonable de los
    servicios y respetar las obligaciones previamente adquiridas
    con los usuarios o clientes.
  </p>

  <p>
    Cuando una modificación implique cambios relevantes en las
    condiciones de contratación o utilización de un servicio,
    Xhunco Café podrá comunicar dichos cambios mediante los
    mecanismos que correspondan, de acuerdo con la naturaleza
    del servicio y las obligaciones aplicables.
  </p>

  <p>
    Xhunco Café podrá suspender temporalmente determinadas
    funcionalidades cuando resulte necesario para realizar
    mantenimiento, atender incidentes, proteger la seguridad de
    los sistemas, prevenir usos indebidos o cumplir con una
    obligación legal o contractual.
  </p>

  <LegalInfoBox type="info" title="Disponibilidad del servicio">
    Procuramos mantener nuestros servicios disponibles de forma
    continua, pero no podemos garantizar que el sitio web,
    plataforma o todas sus funcionalidades estén disponibles
    en todo momento y sin interrupciones.
  </LegalInfoBox>
</LegalSection>

{/* =========================================
    15. SUSPENSIÓN Y TERMINACIÓN
========================================= */}

<LegalSection
  number="15"
  title="Suspensión y terminación de cuentas o servicios"
  id="suspension-terminacion"
>
  <p>
    Xhunco Café podrá suspender, limitar o terminar el acceso
    de un usuario a una cuenta, funcionalidad o servicio cuando
    exista una causa razonable para ello, de conformidad con
    estos Términos y Condiciones, las condiciones particulares
    del servicio o la legislación aplicable.
  </p>

  <p>
    Entre las circunstancias que podrán dar lugar a una
    suspensión, limitación o terminación se encuentran, de manera
    enunciativa mas no limitativa:
  </p>

  <ul className="list-disc space-y-2 pl-6">
    <li>
      Incumplimiento de estos Términos y Condiciones.
    </li>

    <li>
      Uso fraudulento o ilícito de la plataforma o de los
      servicios.
    </li>

    <li>
      Intentos de acceso no autorizado a sistemas, cuentas o
      información.
    </li>

    <li>
      Actividades que representen un riesgo para la seguridad,
      integridad o disponibilidad de la plataforma.
    </li>

    <li>
      Proporcionar información falsa, engañosa o utilizada con
      fines fraudulentos.
    </li>

    <li>
      Incumplimiento de obligaciones de pago cuando resulten
      aplicables.
    </li>

    <li>
      Solicitud de una autoridad competente o cumplimiento de
      una obligación legal.
    </li>
  </ul>

  <p>
    Cuando las circunstancias lo permitan, Xhunco Café podrá
    comunicar al usuario la razón de la suspensión, limitación o
    terminación y, cuando corresponda, las medidas necesarias
    para resolver la situación.
  </p>

  <p>
    La suspensión o terminación de una cuenta o servicio no
    afectará las obligaciones que por su naturaleza deban
    continuar vigentes después de dicha terminación, incluyendo
    aquellas relacionadas con pagos pendientes, propiedad
    intelectual, confidencialidad, protección de datos,
    responsabilidades o controversias.
  </p>

  <p>
    Cuando corresponda y sea técnicamente posible, la información
    asociada a una cuenta o servicio podrá ser eliminada,
    bloqueada, conservada o entregada conforme a las políticas
    aplicables, las obligaciones legales y las condiciones
    contractuales correspondientes.
  </p>

  <LegalInfoBox type="warning" title="Suspensión por seguridad">
    Xhunco Café podrá limitar temporalmente el acceso a una
    cuenta o servicio cuando sea necesario para proteger la
    plataforma, la información de los usuarios o la seguridad
    de nuestros sistemas.
  </LegalInfoBox>
</LegalSection>

{/* =========================================
    16. LIMITACIÓN DE RESPONSABILIDAD
========================================= */}

<LegalSection
  number="16"
  title="Limitación de responsabilidad"
  id="limitacion-responsabilidad"
>
  <p>
    Xhunco Café procurará proporcionar sus productos, servicios
    y plataformas digitales de manera adecuada y conforme a las
    condiciones aplicables. No obstante, determinadas
    circunstancias pueden encontrarse fuera de nuestro control
    razonable.
  </p>

  <p>
    En la medida permitida por la legislación aplicable, Xhunco
    Café no será responsable por daños, pérdidas o afectaciones
    derivados directamente de circunstancias ajenas a su control
    razonable, incluyendo, de manera enunciativa:
  </p>

  <ul className="list-disc space-y-2 pl-6">
    <li>
      Fallas o interrupciones de servicios de internet,
      telecomunicaciones, energía eléctrica o infraestructura de
      terceros.
    </li>

    <li>
      Fallas, interrupciones o indisponibilidad de servicios
      tecnológicos proporcionados por terceros.
    </li>

    <li>
      Situaciones de caso fortuito o fuerza mayor que impidan o
      dificulten temporalmente la prestación de un servicio.
    </li>

    <li>
      Información incorrecta, incompleta o desactualizada
      proporcionada por el usuario.
    </li>

    <li>
      Uso indebido de las cuentas, credenciales o servicios por
      parte del usuario o de terceros cuando dicho uso no sea
      atribuible razonablemente a Xhunco Café.
    </li>

    <li>
      Daños derivados del incumplimiento de las instrucciones de
      uso, recomendaciones de seguridad o condiciones aplicables
      al servicio.
    </li>
  </ul>

  <p>
    Las limitaciones previstas en esta sección no tendrán como
    finalidad excluir o limitar responsabilidades que no puedan
    excluirse o limitarse conforme a la legislación aplicable,
    incluyendo aquellas que correspondan a los derechos de los
    consumidores.
  </p>

  <p>
    Cuando Xhunco Café preste servicios digitales a empresas,
    negocios u organizaciones, las responsabilidades específicas
    de cada parte podrán establecerse adicionalmente mediante el
    contrato, acuerdo de servicio, acuerdo de tratamiento de
    datos u otros instrumentos aplicables.
  </p>

  <LegalInfoBox type="info" title="Alcance de la responsabilidad">
    Las limitaciones establecidas en estos Términos se aplicarán
    únicamente en la medida permitida por la legislación
    aplicable y no pretenden eliminar derechos o responsabilidades
    que legalmente correspondan.
  </LegalInfoBox>
</LegalSection>
{/* =========================================
    17. RESPONSABILIDAD DEL USUARIO
========================================= */}

<LegalSection
  number="17"
  title="Responsabilidad e indemnización"
  id="responsabilidad-usuario"
>
  <p>
    El usuario será responsable de utilizar los productos,
    servicios y plataformas de Xhunco Café de conformidad con
    estos Términos y Condiciones, las condiciones particulares
    que resulten aplicables y la legislación correspondiente.
  </p>

  <p>
    En la medida permitida por la legislación aplicable, el
    usuario será responsable por los daños, pérdidas,
    reclamaciones, sanciones, costos o gastos que se deriven de
    manera directa de:
  </p>

  <ul className="list-disc space-y-2 pl-6">
    <li>
      El incumplimiento de estos Términos y Condiciones.
    </li>

    <li>
      El uso ilícito, fraudulento o no autorizado de la
      plataforma o de los servicios.
    </li>

    <li>
      El contenido proporcionado por el usuario cuando dicho
      contenido infrinja derechos de terceros o disposiciones
      legales aplicables.
    </li>

    <li>
      El uso de una cuenta o credenciales en contravención de
      las condiciones aplicables.
    </li>

    <li>
      La utilización de los servicios de Xhunco Café para
      perjudicar a terceros o afectar el funcionamiento,
      seguridad o integridad de nuestros sistemas.
    </li>
  </ul>

  <p>
    Cuando una reclamación de un tercero se origine directamente
    por una conducta atribuible al usuario y resulte legalmente
    procedente, el usuario deberá colaborar razonablemente con
    Xhunco Café para atender y resolver dicha situación.
  </p>

  <p>
    Lo anterior no implica que el usuario deba responder por
    circunstancias que no le sean atribuibles ni limita los
    derechos o responsabilidades que no puedan excluirse o
    limitarse conforme a la legislación aplicable.
  </p>

  <LegalInfoBox type="warning" title="Uso responsable">
    El usuario debe utilizar nuestros servicios de manera
    responsable y evitar cualquier conducta que pueda generar
    daños a Xhunco Café, a otros usuarios o a terceros.
  </LegalInfoBox>
</LegalSection>

{/* =========================================
    18. PROPIEDAD INTELECTUAL
========================================= */}

<LegalSection
  number="18"
  title="Propiedad intelectual"
  id="propiedad-intelectual"
>
  <p>
    Los contenidos, elementos, diseños, interfaces, marcas,
    logotipos, nombres comerciales, textos, gráficos, imágenes,
    fotografías, código fuente, código objeto, bases de datos,
    estructuras, funcionalidades, sistemas, software y demás
    elementos que formen parte de los sitios web, plataformas y
    servicios de Xhunco Café podrán estar protegidos por las
    disposiciones aplicables en materia de propiedad intelectual
    y derechos de autor.
  </p>

  <p>
    Salvo que se indique expresamente lo contrario o exista una
    autorización previa por escrito, el uso de los servicios de
    Xhunco Café no otorga al usuario ningún derecho de propiedad,
    licencia o autorización sobre dichos elementos más allá del
    acceso y utilización necesarios para utilizar el servicio
    contratado o permitido.
  </p>

  <p>
    El usuario no podrá copiar, reproducir, modificar,
    distribuir, transmitir, publicar, vender, sublicenciar,
    realizar ingeniería inversa, descompilar, desensamblar,
    explotar comercialmente o utilizar de manera no autorizada
    los elementos protegidos de nuestras plataformas o servicios,
    salvo cuando dicha utilización esté expresamente permitida
    por Xhunco Café o por la legislación aplicable.
  </p>

  <p>
    Las marcas, nombres comerciales, logotipos y demás signos
    distintivos de Xhunco Café pertenecen a sus respectivos
    titulares y no podrán utilizarse sin la autorización
    correspondiente.
  </p>

  <p>
    Cuando Xhunco Café proporcione servicios digitales,
    plataformas, software o herramientas tecnológicas a terceros,
    los derechos sobre el desarrollo tecnológico, código,
    arquitectura, componentes, interfaces, metodologías,
    documentación y demás elementos utilizados para proporcionar
    dichos servicios se determinarán conforme al contrato o
    acuerdo correspondiente.
  </p>

  <p>
    La contratación de un servicio digital no implica, por sí
    misma, la transferencia de la propiedad intelectual de
    Xhunco Café al cliente, salvo que dicha transferencia se
    establezca expresamente mediante un acuerdo escrito.
  </p>

  <LegalInfoBox type="info" title="Propiedad de la tecnología">
    Salvo que exista un acuerdo específico que establezca lo
    contrario, Xhunco Café conserva los derechos que le
    correspondan sobre sus plataformas, software, desarrollos,
    sistemas, diseños, metodologías y demás elementos de
    propiedad intelectual utilizados para proporcionar sus
    servicios.
  </LegalInfoBox>
</LegalSection>

{/* =========================================
    19. CONFIDENCIALIDAD
========================================= */}

<LegalSection
  number="19"
  title="Confidencialidad"
  id="confidencialidad"
>
  <p>
    Xhunco Café reconoce la importancia de proteger la
    información que los usuarios, clientes y terceros
    proporcionen con motivo de la utilización de nuestros
    productos, servicios y plataformas.
  </p>

  <p>
    La información que tenga carácter confidencial y que sea
    proporcionada a Xhunco Café en el marco de una relación
    comercial, contractual o de prestación de servicios será
    tratada con el grado de cuidado razonable que corresponda a
    su naturaleza y conforme a las obligaciones legales y
    contractuales aplicables.
  </p>

  <p>
    Cuando Xhunco Café preste servicios digitales a empresas,
    negocios u organizaciones, la información comercial,
    operativa, técnica o estratégica que el cliente identifique
    como confidencial podrá estar sujeta a obligaciones
    específicas de confidencialidad establecidas mediante el
    contrato, acuerdo de prestación de servicios, acuerdo de
    confidencialidad u otro instrumento aplicable.
  </p>

  <p>
    La obligación de confidencialidad podrá comprender, según
    corresponda, información relacionada con operaciones,
    procesos internos, estrategias comerciales, información
    técnica, documentación, configuraciones, credenciales,
    información de negocio y otros materiales que no sean de
    carácter público.
  </p>

  <p>
    Las obligaciones de confidencialidad no impedirán que Xhunco
    Café revele información cuando dicha revelación sea
    necesaria para cumplir una obligación legal, atender un
    requerimiento de una autoridad competente, proteger los
    derechos de Xhunco Café o de terceros, o cuando exista una
    base jurídica que permita dicha divulgación.
  </p>

  <p>
    La información que sea pública, que haya sido obtenida
    legítimamente de un tercero sin obligación de
    confidencialidad, que haya sido desarrollada
    independientemente o cuya divulgación haya sido autorizada
    por su titular no se considerará confidencial para efectos
    de esta sección.
  </p>

  <LegalInfoBox type="security" title="Protección de información">
    Las obligaciones específicas de confidencialidad aplicables
    a un servicio empresarial o tecnológico podrán establecerse
    mediante acuerdos adicionales entre Xhunco Café y el cliente.
  </LegalInfoBox>
</LegalSection>

{/* =========================================
    20. ENLACES Y SERVICIOS DE TERCEROS
========================================= */}

<LegalSection
  number="20"
  title="Enlaces y servicios de terceros"
  id="terceros"
>
  <p>
    Nuestro sitio web, plataformas y servicios podrán contener
    enlaces, integraciones o referencias a sitios web,
    aplicaciones, plataformas, servicios o herramientas
    proporcionados por terceros.
  </p>

  <p>
    La existencia de dichos enlaces o integraciones tiene como
    finalidad facilitar el acceso a determinados servicios o
    funcionalidades y no implica que Xhunco Café controle,
    administre o respalde necesariamente el contenido, políticas
    o prácticas de dichos terceros.
  </p>

  <p>
    Cuando el usuario acceda a un servicio proporcionado por un
    tercero, podrá quedar sujeto a los términos, condiciones,
    políticas de privacidad y demás reglas establecidas por dicho
    tercero.
  </p>

  <p>
    Xhunco Café no será responsable por las prácticas, contenidos,
    disponibilidad, políticas, condiciones o funcionamiento de
    servicios de terceros que se encuentren fuera de nuestro
    control razonable, salvo que la legislación aplicable
    establezca una responsabilidad diferente.
  </p>

  <p>
    Cuando determinados servicios de terceros sean necesarios
    para proporcionar una funcionalidad de Xhunco Café, podremos
    modificar, sustituir o dejar de utilizar dichos servicios
    cuando resulte necesario por razones operativas, técnicas,
    comerciales, de seguridad o por cambios realizados por el
    propio proveedor.
  </p>

  <LegalInfoBox type="info" title="Servicios externos">
    Antes de proporcionar información personal, realizar un pago
    o utilizar un servicio externo mediante un enlace o
    integración, te recomendamos revisar las condiciones y
    políticas aplicables del proveedor correspondiente.
  </LegalInfoBox>
</LegalSection>
{/* =========================================
    21. MODIFICACIONES Y ACTUALIZACIONES
========================================= */}

<LegalSection
  number="21"
  title="Modificaciones y actualizaciones de los servicios"
  id="modificaciones-servicios"
>
  <p>
    Xhunco Café podrá modificar, actualizar, ampliar, sustituir
    o descontinuar determinadas funcionalidades, productos,
    servicios, contenidos o características de sus plataformas
    digitales cuando resulte necesario por razones técnicas,
    operativas, comerciales, de seguridad, legales o de
    evolución de nuestros servicios.
  </p>

  <p>
    Las modificaciones podrán incluir la incorporación de nuevas
    funcionalidades, cambios en la interfaz, actualización de
    sistemas, mejoras de seguridad, cambios en procesos
    operativos o la sustitución de determinadas herramientas o
    tecnologías utilizadas para proporcionar los servicios.
  </p>

  <p>
    Procuraremos que las modificaciones relevantes que puedan
    afectar de manera significativa la utilización de un servicio
    contratado sean comunicadas mediante los medios que resulten
    razonables o aplicables de acuerdo con la naturaleza del
    servicio.
  </p>

  <p>
    En el caso de servicios digitales proporcionados a empresas,
    negocios u organizaciones, las modificaciones que afecten
    funcionalidades, alcances, niveles de servicio o condiciones
    específicas podrán sujetarse a lo establecido en el contrato
    o acuerdo correspondiente.
  </p>

  <p>
    La actualización o modificación de una funcionalidad no
    implicará necesariamente la eliminación de información
    relacionada con operaciones anteriores cuando exista una
    obligación legal, contractual o una causa legítima para su
    conservación.
  </p>

  <LegalInfoBox type="info" title="Evolución de la plataforma">
    Xhunco Café busca mantener y mejorar continuamente sus
    plataformas y servicios. Algunas funcionalidades podrán
    cambiar con el tiempo como parte de la evolución tecnológica
    y operativa de nuestros servicios.
  </LegalInfoBox>
</LegalSection>
{/* =========================================
    22. SUSPENSIÓN Y TERMINACIÓN
========================================= */}

<LegalSection
  number="22"
  title="Suspensión y terminación de cuentas y servicios"
  id="suspension-terminacion"
>
  <p>
    Xhunco Café podrá suspender, limitar temporalmente o
    terminar el acceso a una cuenta, plataforma o servicio
    cuando resulte necesario para proteger la seguridad de
    nuestros sistemas, prevenir usos indebidos, cumplir con
    obligaciones legales o cuando exista un incumplimiento de
    los presentes Términos y Condiciones o de las condiciones
    específicas del servicio contratado.
  </p>

  <p>
    Entre las situaciones que podrán dar lugar a una suspensión
    o terminación se encuentran, según corresponda, el uso
    fraudulento de los servicios, el acceso no autorizado a
    cuentas o sistemas, la utilización de la plataforma para
    actividades ilícitas, el intento de afectar su
    funcionamiento o seguridad, o el incumplimiento de
    obligaciones contractuales.
  </p>

  <p>
    Cuando las circunstancias lo permitan y no exista una razón
    de seguridad, legal o técnica que impida hacerlo,
    procuraremos informar al usuario sobre la suspensión o
    terminación y, cuando corresponda, sobre las medidas
    necesarias para regularizar la situación.
  </p>

  <p>
    La suspensión o terminación de una cuenta no necesariamente
    implica la eliminación inmediata de los datos relacionados
    con ella. Xhunco Café podrá conservar determinada información
    cuando exista una obligación legal, fiscal, contractual o
    una causa legítima que lo justifique.
  </p>

  <p>
    En el caso de servicios digitales proporcionados a empresas,
    negocios u organizaciones, las condiciones de suspensión,
    terminación, continuidad, recuperación de información y
    demás consecuencias relacionadas con la finalización del
    servicio podrán establecerse específicamente en el contrato
    o acuerdo correspondiente.
  </p>

  <LegalInfoBox type="warning" title="Uso responsable">
    La suspensión o terminación de un servicio se aplicará de
    acuerdo con las circunstancias del caso, las condiciones
    contratadas y la legislación aplicable. Cuando sea
    técnicamente posible, procuraremos preservar la información
    que legalmente deba conservarse.
  </LegalInfoBox>
</LegalSection>

    </LegalLayout>
  );
}