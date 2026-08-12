    import LegalLayout from "@/components/legal/LegalLayout";
import LegalSection from "@/components/legal/LegalSection";
import LegalInfoBox from "@/components/legal/LegalInfoBox";
import LegalLastUpdated from "@/components/legal/LegalLastUpdated";

import { LEGAL } from "@/lib/legal/legalConfig";

export const metadata = {
  title: `Política de Envíos | ${LEGAL.companyName}`,
  description:
    "Conoce las condiciones aplicables a la preparación, procesamiento, entrega y seguimiento de los pedidos realizados a Xhunco Café.",
};

export default function EnviosPage() {
  return (
    <LegalLayout
      title="Política de Envíos"
      description="Conoce las condiciones aplicables al procesamiento, preparación, entrega y seguimiento de tus pedidos."
      currentSlug="envios"
      badge="Envíos"
    >
      {/* =========================================
          INTRODUCCIÓN
      ========================================= */}

      <div className="mb-8">
        <p className="text-base leading-8 text-gray-700">
          En {LEGAL.companyName} procuramos que los pedidos
          realizados a través de nuestros canales sean preparados,
          procesados y entregados de manera adecuada y dentro de
          los tiempos establecidos para cada operación.
        </p>

        <p className="mt-4 text-base leading-8 text-gray-700">
          Esta Política de Envíos establece las condiciones
          generales aplicables a la preparación, entrega,
          seguimiento e incidencias relacionadas con los pedidos
          realizados a través de nuestros canales de venta.
        </p>

        <LegalLastUpdated />
      </div>

      <LegalInfoBox type="info" title="Sobre esta Política">
        Las condiciones específicas de cada pedido pueden depender
        de la ubicación de entrega, disponibilidad de los productos,
        modalidad de entrega seleccionada y demás circunstancias
        aplicables a la operación.
      </LegalInfoBox>

      {/* =========================================
          1. ALCANCE DE LA POLÍTICA
      ========================================= */}

      <LegalSection
        number="1"
        title="Alcance de la Política de Envíos"
        id="alcance"
      >
        <p>
          Esta Política de Envíos aplica a los pedidos de
          productos realizados a través del sitio web, plataforma
          digital, canales de atención o cualquier otro medio de
          venta habilitado por Xhunco Café.
        </p>

        <p>
          Las condiciones particulares de una operación podrán
          variar dependiendo del tipo de producto, ubicación del
          cliente, modalidad de entrega, disponibilidad y demás
          circunstancias relacionadas con el pedido.
        </p>

        <LegalInfoBox type="info" title="Condiciones específicas">
          Cuando una operación tenga condiciones particulares de
          entrega, estas podrán ser comunicadas al cliente durante
          el proceso de compra, confirmación o atención del pedido.
        </LegalInfoBox>
      </LegalSection>

      {/* =========================================
          2. COBERTURA DE ENTREGA
      ========================================= */}

      <LegalSection
        number="2"
        title="Cobertura de entrega"
        id="cobertura"
      >
        <p>
          Xhunco Café podrá realizar entregas en las zonas que se
          encuentren habilitadas para cada modalidad de envío o
          servicio disponible.
        </p>

        <p>
          La disponibilidad de una entrega podrá depender de la
          ubicación proporcionada por el cliente, la cobertura
          logística disponible y las condiciones operativas
          aplicables al momento de realizar el pedido.
        </p>

        <p>
          Cuando una dirección se encuentre fuera de la cobertura
          disponible, Xhunco Café podrá comunicarse con el cliente
          para determinar si existe alguna alternativa de entrega.
        </p>

        <LegalInfoBox type="warning" title="Cobertura">
          La disponibilidad de entrega puede variar según la
          ubicación y las condiciones operativas vigentes al
          momento de realizar el pedido.
        </LegalInfoBox>
      </LegalSection>

      {/* =========================================
          3. PROCESAMIENTO DE PEDIDOS
      ========================================= */}

      <LegalSection
        number="3"
        title="Procesamiento y preparación de pedidos"
        id="procesamiento"
      >
        <p>
          Una vez realizado un pedido, Xhunco Café podrá llevar a
          cabo las acciones necesarias para verificar, preparar y
          procesar los productos solicitados.
        </p>

        <p>
          El procesamiento de un pedido puede depender de la
          disponibilidad de los productos, la confirmación de la
          operación, el método de pago seleccionado y cualquier
          otra condición necesaria para completar la compra.
        </p>

        <p>
          Cuando sea necesario, podremos comunicarnos con el
          cliente para confirmar información relacionada con el
          pedido, la entrega o cualquier circunstancia que pueda
          afectar su procesamiento.
        </p>

        <LegalInfoBox type="info" title="Preparación del pedido">
          El tiempo necesario para preparar un pedido puede variar
          dependiendo de los productos solicitados, disponibilidad
          y condiciones de la operación.
        </LegalInfoBox>
      </LegalSection>

      {/* =========================================
          4. TIEMPOS DE ENTREGA
      ========================================= */}

      <LegalSection
        number="4"
        title="Tiempos de entrega"
        id="tiempos"
      >
        <p>
          Los tiempos de entrega pueden variar dependiendo de la
          ubicación del destinatario, disponibilidad de los
          productos, modalidad de entrega seleccionada, condiciones
          logísticas y otros factores relacionados con la
          operación.
        </p>

        <p>
          Cuando se proporcione un tiempo estimado de entrega,
          dicho periodo tendrá carácter orientativo, salvo que
          expresamente se indique una condición diferente.
        </p>

        <p>
          El tiempo total de atención de un pedido puede incluir
          tanto el periodo necesario para su preparación como el
          tiempo requerido para realizar la entrega.
        </p>

        <LegalInfoBox type="info" title="Tiempo estimado">
          Las fechas o tiempos comunicados para una entrega podrán
          estar sujetos a variaciones derivadas de circunstancias
          logísticas, disponibilidad, tráfico, condiciones
          climáticas, causas de fuerza mayor u otras circunstancias
          fuera del control razonable de Xhunco Café.
        </LegalInfoBox>
      </LegalSection>

      {/* =========================================
          5. COSTOS DE ENVÍO
      ========================================= */}

      <LegalSection
        number="5"
        title="Costos de envío"
        id="costos"
      >
        <p>
          Cuando una operación genere un costo de envío, dicho
          costo podrá depender de factores como la ubicación de
          entrega, modalidad seleccionada, características del
          pedido y condiciones comerciales vigentes.
        </p>

        <p>
          Cuando corresponda, el costo de envío será informado al
          cliente antes de completar o confirmar la operación.
        </p>

        <p>
          Las promociones, descuentos o condiciones especiales
          relacionadas con los costos de envío estarán sujetas a
          los términos específicos de cada promoción u oferta.
        </p>

        <LegalInfoBox type="info" title="Costo de entrega">
          Los costos de envío aplicables serán aquellos que se
          encuentren vigentes y que correspondan a las condiciones
          de la operación al momento de realizar el pedido.
        </LegalInfoBox>
      </LegalSection>

      {/* =========================================
          6. DATOS PARA LA ENTREGA
      ========================================= */}

      <LegalSection
        number="6"
        title="Información necesaria para la entrega"
        id="datos-entrega"
      >
        <p>
          Para realizar una entrega correctamente, el cliente
          deberá proporcionar información suficiente, completa y
          actualizada sobre el domicilio y los datos necesarios
          para localizar al destinatario.
        </p>

        <p>
          Dependiendo de la operación, esta información puede
          incluir:
        </p>

        <ul className="list-disc space-y-2 pl-6">
          <li>
            Nombre del destinatario.
          </li>

          <li>
            Calle y número.
          </li>

          <li>
            Colonia o localidad.
          </li>

          <li>
            Municipio y estado.
          </li>

          <li>
            Código postal.
          </li>

          <li>
            Número telefónico de contacto.
          </li>

          <li>
            Referencias adicionales que faciliten la entrega,
            cuando sean necesarias.
          </li>
        </ul>

        <p>
          El cliente será responsable de proporcionar información
          correcta y suficiente para permitir la entrega.
        </p>

        <LegalInfoBox type="warning" title="Datos incorrectos">
          Los errores, omisiones o información insuficiente en los
          datos proporcionados para la entrega pueden ocasionar
          retrasos, imposibilidad de entrega o necesidad de
          coordinar nuevamente la operación.
        </LegalInfoBox>
      </LegalSection>

      {/* =========================================
          7. RECEPCIÓN DEL PEDIDO
      ========================================= */}

      <LegalSection
        number="7"
        title="Recepción del pedido"
        id="recepcion"
      >
        <p>
          El cliente deberá procurar que exista una persona
          disponible para recibir el pedido en el domicilio
          indicado o en el lugar previamente acordado para la
          entrega.
        </p>

        <p>
          Al momento de recibir un pedido, recomendamos verificar
          que los productos y cantidades entregadas correspondan
          con la operación realizada.
        </p>

        <p>
          Cuando resulte posible, cualquier incidencia visible
          relacionada con el estado del paquete o de los productos
          deberá comunicarse a Xhunco Café a la brevedad.
        </p>

        <LegalInfoBox type="info" title="Revisión al recibir">
          Te recomendamos revisar tu pedido al momento de la
          recepción y comunicar cualquier diferencia o incidencia
          mediante nuestros canales de atención.
        </LegalInfoBox>
      </LegalSection>

      {/* =========================================
          8. AUSENCIA O IMPOSIBILIDAD DE ENTREGA
      ========================================= */}

      <LegalSection
        number="8"
        title="Ausencia del destinatario o imposibilidad de entrega"
        id="imposibilidad"
      >
        <p>
          Si el destinatario no se encuentra disponible al momento
          de realizar la entrega, Xhunco Café o el proveedor
          logístico correspondiente podrá intentar establecer
          comunicación con el cliente para coordinar la entrega.
        </p>

        <p>
          Cuando una entrega no pueda realizarse debido a ausencia
          del destinatario, dirección incorrecta, datos
          insuficientes, imposibilidad de acceso o cualquier otra
          circunstancia atribuible a la información proporcionada
          para la entrega, podrán generarse demoras o costos
          adicionales cuando corresponda.
        </p>

        <p>
          Las condiciones específicas para una segunda visita,
          reprogramación o devolución del pedido podrán depender
          de la modalidad de entrega utilizada.
        </p>

        <LegalInfoBox type="warning" title="Entrega no concretada">
          Cuando una entrega no pueda completarse, Xhunco Café
          podrá contactar al cliente para determinar las acciones
          necesarias para resolver la incidencia.
        </LegalInfoBox>
      </LegalSection>

      {/* =========================================
          9. CAMBIOS DE DOMICILIO
      ========================================= */}

      <LegalSection
        number="9"
        title="Cambios en la dirección de entrega"
        id="cambios-domicilio"
      >
        <p>
          Si necesitas modificar la dirección de entrega después
          de realizar un pedido, deberás comunicarlo a Xhunco Café
          lo antes posible mediante nuestros canales de atención.
        </p>

        <p>
          Las modificaciones estarán sujetas a la etapa en la que
          se encuentre el pedido y a la posibilidad operativa de
          realizar el cambio.
        </p>

        <p>
          Una vez que el pedido haya sido preparado, enviado o se
          encuentre en proceso de entrega, es posible que no sea
          posible modificar la dirección originalmente indicada.
        </p>

        <LegalInfoBox type="warning" title="Importante">
          No podemos garantizar que una solicitud de cambio de
          domicilio pueda realizarse cuando el pedido ya se
          encuentre en proceso de preparación, envío o entrega.
        </LegalInfoBox>
      </LegalSection>

      {/* =========================================
          10. RETRASOS E INCIDENCIAS
      ========================================= */}

      <LegalSection
        number="10"
        title="Retrasos e incidencias durante la entrega"
        id="retrasos"
      >
        <p>
          Aunque Xhunco Café procurará cumplir con los tiempos
          estimados de entrega, pueden presentarse circunstancias
          que ocasionen retrasos.
        </p>

        <p>
          Entre estas circunstancias pueden encontrarse:
        </p>

        <ul className="list-disc space-y-2 pl-6">
          <li>
            Condiciones climáticas adversas.
          </li>

          <li>
            Tráfico o restricciones de circulación.
          </li>

          <li>
            Incidencias relacionadas con servicios logísticos.
          </li>

          <li>
            Información incorrecta o insuficiente para realizar
            la entrega.
          </li>

          <li>
            Problemas operativos o técnicos.
          </li>

          <li>
            Situaciones de fuerza mayor o acontecimientos fuera
            del control razonable de Xhunco Café.
          </li>
        </ul>

        <p>
          Cuando tengamos conocimiento de una incidencia que pueda
          afectar de manera relevante una entrega, podremos
          comunicarnos con el cliente para proporcionar información
          disponible y, cuando sea posible, coordinar una solución.
        </p>

        <LegalInfoBox type="info" title="Incidencias">
          Si tu pedido presenta un retraso o alguna incidencia,
          puedes comunicarte con nosotros para solicitar
          información sobre su estado.
        </LegalInfoBox>
      </LegalSection>

      {/* =========================================
          11. PRODUCTOS DAÑADOS, FALTANTES O INCIDENCIAS
      ========================================= */}

      <LegalSection
        number="11"
        title="Productos dañados, faltantes o incidencias"
        id="incidencias"
      >
        <p>
          Si al recibir un pedido identificas productos dañados,
          faltantes, incorrectos o cualquier otra diferencia
          respecto de la operación realizada, deberás comunicarlo
          a Xhunco Café mediante nuestros canales de atención.
        </p>

        <p>
          Para facilitar la revisión de una incidencia, podremos
          solicitar información relacionada con el pedido, así
          como fotografías, evidencia del estado de los productos
          o cualquier otro elemento que resulte razonablemente
          necesario para analizar la situación.
        </p>

        <p>
          Cada incidencia será revisada de acuerdo con las
          circunstancias particulares de la operación y las
          políticas comerciales aplicables.
        </p>

        <LegalInfoBox type="warning" title="Reporte de incidencias">
          Recomendamos comunicar cualquier diferencia, daño o
          faltante lo antes posible después de recibir el pedido
          para facilitar su revisión y atención.
        </LegalInfoBox>
      </LegalSection>

      {/* =========================================
          12. SERVICIOS LOGÍSTICOS DE TERCEROS
      ========================================= */}

      <LegalSection
        number="12"
        title="Servicios logísticos de terceros"
        id="terceros"
      >
        <p>
          Dependiendo de la operación, Xhunco Café podrá utilizar
          servicios de terceros para realizar determinadas
          actividades relacionadas con el transporte o entrega de
          pedidos.
        </p>

        <p>
          Cuando intervenga un proveedor logístico externo, la
          entrega podrá estar sujeta también a las condiciones
          operativas del proveedor correspondiente.
        </p>

        <p>
          Xhunco Café procurará coordinar y dar seguimiento a las
          operaciones de entrega que correspondan, sin perjuicio de
          las circunstancias que dependan directamente del
          proveedor logístico.
        </p>

        <LegalInfoBox type="info" title="Proveedores de entrega">
          La participación de un proveedor logístico no elimina
          nuestros canales de atención. Si tienes una incidencia
          relacionada con tu pedido, puedes comunicarte con
          Xhunco Café para solicitar asistencia.
        </LegalInfoBox>
      </LegalSection>

      {/* =========================================
          13. RESPONSABILIDAD
      ========================================= */}

      <LegalSection
        number="13"
        title="Responsabilidad relacionada con la entrega"
        id="responsabilidad"
      >
        <p>
          Xhunco Café realizará esfuerzos razonables para preparar
          y gestionar correctamente los pedidos y coordinar las
          entregas correspondientes.
        </p>

        <p>
          Sin embargo, determinados retrasos, interrupciones o
          imposibilidades de entrega pueden derivarse de
          circunstancias que se encuentren fuera del control
          razonable de Xhunco Café.
        </p>

        <p>
          Asimismo, el cliente será responsable de proporcionar
          información correcta y suficiente para la entrega y de
          procurar las condiciones necesarias para recibir el
          pedido.
        </p>

        <LegalInfoBox type="info" title="Condiciones de entrega">
          La responsabilidad relacionada con una entrega se
          determinará considerando las circunstancias particulares
          de cada operación y las obligaciones que correspondan a
          cada una de las partes.
        </LegalInfoBox>
      </LegalSection>

      {/* =========================================
          14. CAMBIOS A LA POLÍTICA
      ========================================= */}

      <LegalSection
        number="14"
        title="Cambios a esta Política de Envíos"
        id="cambios"
      >
        <p>
          Xhunco Café podrá modificar, actualizar o complementar
          esta Política de Envíos cuando resulte necesario debido
          a cambios legales, operativos, tecnológicos, logísticos o
          comerciales.
        </p>

        <p>
          La versión vigente de esta Política estará disponible
          permanentemente en nuestro sitio web dentro del Centro
          Legal de Xhunco Café.
        </p>

        <p>
          Cuando resulte necesario, podremos comunicar cambios
          relevantes mediante los mecanismos que correspondan,
          considerando la naturaleza de las modificaciones.
        </p>

        <LegalInfoBox type="info" title="Versión vigente">
          Te recomendamos consultar periódicamente esta Política
          para conocer cualquier modificación o actualización.
        </LegalInfoBox>
      </LegalSection>

      {/* =========================================
          15. CONTACTO
      ========================================= */}

      <LegalSection
        number="15"
        title="Contacto"
        id="contacto"
      >
        <p>
          Si tienes dudas sobre el estado de un pedido, las
          condiciones de entrega o deseas reportar una incidencia,
          puedes comunicarte con Xhunco Café mediante los
          siguientes medios:
        </p>

        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
          <p className="font-semibold text-gray-900">
            {LEGAL.companyName}
          </p>

          <div className="mt-3 space-y-2 text-sm text-gray-600">
            <p>
              <strong>Correo:</strong>{" "}
              <a
                href={`mailto:${LEGAL.legalEmail}`}
                className="text-[#31572c] hover:underline"
              >
                {LEGAL.legalEmail}
              </a>
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

            <p>
              <strong>Domicilio:</strong>{" "}
              {LEGAL.address}
            </p>
          </div>
        </div>
      </LegalSection>

      {/* =========================================
          CIERRE
      ========================================= */}

      <LegalInfoBox type="success" title="Política vigente">
        Esta Política de Envíos corresponde a la versión{" "}
        <strong>{LEGAL.version}</strong> actualmente publicada
        en el Centro Legal de Xhunco Café.
      </LegalInfoBox>
    </LegalLayout>
  );
}