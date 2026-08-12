import LegalLayout from "@/components/legal/LegalLayout";
import LegalSection from "@/components/legal/LegalSection";
import LegalInfoBox from "@/components/legal/LegalInfoBox";
import LegalLastUpdated from "@/components/legal/LegalLastUpdated";

import { LEGAL } from "@/lib/legal/legalConfig";

export const metadata = {
  title: `Cambios, Devoluciones y Reembolsos | ${LEGAL.companyName}`,
  description:
    "Conoce las condiciones aplicables a cambios, devoluciones, cancelaciones y reembolsos de productos adquiridos en Xhunco Café.",
};

export default function DevolucionesPage() {
  return (
    <LegalLayout
      title="Cambios, Devoluciones y Reembolsos"
      description="Conoce las condiciones aplicables a cambios, devoluciones, cancelaciones y reembolsos de tus pedidos."
      currentSlug="devoluciones"
      badge="Devoluciones"
    >
      {/* =========================================
          INTRODUCCIÓN
      ========================================= */}

      <div className="mb-8">
        <p className="text-base leading-8 text-gray-700">
          En {LEGAL.companyName} buscamos que los productos
          adquiridos a través de nuestros canales sean entregados
          correctamente y correspondan con las características del
          pedido realizado.
        </p>

        <p className="mt-4 text-base leading-8 text-gray-700">
          Esta Política de Cambios, Devoluciones y Reembolsos
          establece las condiciones generales aplicables cuando
          un cliente necesita reportar una incidencia, solicitar un
          cambio, devolver un producto o gestionar un reembolso.
        </p>

        <LegalLastUpdated />
      </div>

      <LegalInfoBox type="info" title="Sobre esta Política">
        La procedencia de un cambio, devolución o reembolso podrá
        depender de las características del producto, motivo de la
        solicitud, estado del producto, información proporcionada
        y circunstancias particulares de cada operación.
      </LegalInfoBox>

      {/* =========================================
          1. ALCANCE
      ========================================= */}

      <LegalSection
        number="1"
        title="Alcance de esta Política"
        id="alcance"
      >
        <p>
          Esta Política aplica a los productos adquiridos a través
          del sitio web, plataforma digital, canales de atención o
          cualquier otro medio de venta habilitado por Xhunco Café.
        </p>

        <p>
          Las condiciones específicas podrán variar dependiendo de
          la naturaleza del producto, disponibilidad, motivo de la
          solicitud y circunstancias particulares de la operación.
        </p>

        <LegalInfoBox type="info" title="Condiciones aplicables">
          Cuando una promoción, producto o servicio tenga
          condiciones particulares de cambio, devolución o
          reembolso, estas podrán ser informadas al cliente durante
          el proceso de compra.
        </LegalInfoBox>
      </LegalSection>

      {/* =========================================
          2. PRODUCTOS ELEGIBLES
      ========================================= */}

      <LegalSection
        number="2"
        title="Productos que pueden ser objeto de cambio o devolución"
        id="productos-elegibles"
      >
        <p>
          Dependiendo de las circunstancias de cada operación,
          podrán ser considerados para cambio o devolución los
          productos que presenten alguna incidencia atribuible al
          proceso de preparación, surtido o entrega.
        </p>

        <p>
          Entre otros casos, podrán revisarse situaciones como:
        </p>

        <ul className="list-disc space-y-2 pl-6">
          <li>
            Producto diferente al solicitado.
          </li>

          <li>
            Producto faltante respecto del pedido realizado.
          </li>

          <li>
            Producto que presente daños atribuibles al manejo o
            entrega.
          </li>

          <li>
            Producto con algún defecto que afecte su funcionamiento
            o características esenciales.
          </li>

          <li>
            Cualquier otra incidencia que razonablemente deba ser
            revisada por Xhunco Café.
          </li>
        </ul>

        <LegalInfoBox type="info" title="Evaluación de la solicitud">
          La recepción de una solicitud no implica automáticamente
          que el cambio o devolución sea aprobado. Cada caso será
          revisado conforme a sus circunstancias particulares.
        </LegalInfoBox>
      </LegalSection>

      {/* =========================================
          3. PRODUCTOS NO ELEGIBLES
      ========================================= */}

      <LegalSection
        number="3"
        title="Productos que pueden estar sujetos a restricciones"
        id="restricciones"
      >
        <p>
          Algunos productos o situaciones pueden estar sujetos a
          restricciones debido a su naturaleza, condiciones de
          conservación, uso, personalización o características
          particulares.
        </p>

        <p>
          En particular, podrán existir restricciones para:
        </p>

        <ul className="list-disc space-y-2 pl-6">
          <li>
            Productos que hayan sido utilizados de manera distinta
            a la finalidad para la que fueron destinados.
          </li>

          <li>
            Productos que hayan sido modificados o alterados por el
            cliente.
          </li>

          <li>
            Productos personalizados o preparados bajo
            especificaciones particulares del cliente, cuando
            corresponda.
          </li>

          <li>
            Productos cuyo estado haya cambiado por un manejo,
            almacenamiento o conservación inadecuados después de
            su entrega.
          </li>

          <li>
            Solicitudes que no correspondan con las condiciones
            aplicables a la operación.
          </li>
        </ul>

        <LegalInfoBox type="warning" title="Restricciones">
          Las restricciones anteriores no limitan los derechos que
          correspondan al consumidor conforme a la legislación
          aplicable.
        </LegalInfoBox>
      </LegalSection>

      {/* =========================================
          4. PRODUCTOS DAÑADOS, DEFECTUOSOS O INCORRECTOS
      ========================================= */}

      <LegalSection
        number="4"
        title="Productos dañados, defectuosos o incorrectos"
        id="productos-danados"
      >
        <p>
          Si recibes un producto dañado, defectuoso o diferente al
          solicitado, deberás comunicarlo a Xhunco Café mediante
          nuestros canales de atención.
        </p>

        <p>
          Para facilitar la revisión de la incidencia, podremos
          solicitar información como:
        </p>

        <ul className="list-disc space-y-2 pl-6">
          <li>
            Número o referencia del pedido.
          </li>

          <li>
            Nombre del cliente.
          </li>

          <li>
            Descripción de la incidencia.
          </li>

          <li>
            Fotografías del producto o empaque, cuando resulten
            necesarias.
          </li>

          <li>
            Información adicional que permita identificar y revisar
            el problema.
          </li>
        </ul>

        <LegalInfoBox type="warning" title="Importante">
          Te recomendamos conservar el producto, empaque y demás
          elementos relacionados con el pedido hasta que la
          incidencia haya sido revisada y se determine la solución
          correspondiente.
        </LegalInfoBox>
      </LegalSection>

      {/* =========================================
          5. PLAZO PARA REPORTAR
      ========================================= */}

      <LegalSection
        number="5"
        title="Plazo para reportar una incidencia"
        id="plazo"
      >
        <p>
          Las incidencias relacionadas con productos dañados,
          faltantes, incorrectos o defectuosos deberán comunicarse
          a Xhunco Café lo antes posible después de recibir el
          pedido.
        </p>

        <p>
          El momento en que se reporte una incidencia podrá ser
          considerado para determinar las circunstancias de la
          operación y las acciones que correspondan.
        </p>

        <p>
          Cuando exista un plazo específico establecido para una
          determinada promoción, producto, servicio u operación,
          dicho plazo podrá ser informado en las condiciones
          correspondientes.
        </p>

        <LegalInfoBox type="info" title="Recomendación">
          Para facilitar la atención de cualquier incidencia,
          recomendamos reportarla inmediatamente después de
          identificarla.
        </LegalInfoBox>
      </LegalSection>

      {/* =========================================
          6. REQUISITOS
      ========================================= */}

      <LegalSection
        number="6"
        title="Requisitos para solicitar un cambio o devolución"
        id="requisitos"
      >
        <p>
          Para solicitar un cambio, devolución o revisión de una
          incidencia, podremos requerir información suficiente para
          identificar la operación y evaluar la solicitud.
        </p>

        <p>
          Dependiendo del caso, podremos solicitar:
        </p>

        <ul className="list-disc space-y-2 pl-6">
          <li>
            Datos del cliente que realizó la compra.
          </li>

          <li>
            Número o referencia del pedido.
          </li>

          <li>
            Descripción de la situación.
          </li>

          <li>
            Evidencia fotográfica o documental cuando resulte
            necesaria.
          </li>

          <li>
            Información sobre el estado y uso del producto.
          </li>

          <li>
            Información adicional razonablemente necesaria para
            resolver la solicitud.
          </li>
        </ul>

        <LegalInfoBox type="info" title="Información completa">
          Proporcionar información clara y suficiente permite
          agilizar la revisión de la solicitud y determinar la
          solución correspondiente.
        </LegalInfoBox>
      </LegalSection>

      {/* =========================================
          7. PROCEDIMIENTO
      ========================================= */}

      <LegalSection
        number="7"
        title="Procedimiento para solicitar un cambio o devolución"
        id="procedimiento"
      >
        <p>
          Para iniciar una solicitud, el cliente podrá comunicarse
          con Xhunco Café mediante los canales de atención
          disponibles.
        </p>

        <p>
          Una vez recibida la solicitud, podremos realizar las
          siguientes acciones:
        </p>

        <ul className="list-disc space-y-2 pl-6">
          <li>
            Identificar el pedido y la operación correspondiente.
          </li>

          <li>
            Revisar la información proporcionada.
          </li>

          <li>
            Solicitar información o evidencia adicional cuando
            resulte necesario.
          </li>

          <li>
            Determinar la procedencia de la solicitud.
          </li>

          <li>
            Comunicar al cliente las acciones que correspondan.
          </li>
        </ul>

        <p>
          La solución podrá consistir, según las circunstancias del
          caso y lo que resulte legalmente aplicable, en un cambio,
          reposición, devolución, reembolso u otra alternativa
          razonable.
        </p>

        <LegalInfoBox type="info" title="Revisión de solicitudes">
          La recepción de una solicitud no constituye por sí misma
          una autorización de devolución o reembolso. La solicitud
          deberá ser revisada antes de determinar la solución
          correspondiente.
        </LegalInfoBox>
      </LegalSection>

      {/* =========================================
          8. CAMBIOS DE PRODUCTOS
      ========================================= */}

      <LegalSection
        number="8"
        title="Cambios de productos"
        id="cambios-productos"
      >
        <p>
          Cuando proceda un cambio de producto, Xhunco Café podrá
          coordinar con el cliente la sustitución correspondiente.
        </p>

        <p>
          La posibilidad de realizar un cambio podrá depender de la
          disponibilidad del producto solicitado, las características
          de la operación y las condiciones aplicables al caso.
        </p>

        <p>
          Cuando el producto originalmente solicitado no se
          encuentre disponible, podremos comunicar al cliente las
          alternativas disponibles para resolver la situación.
        </p>

        <LegalInfoBox type="info" title="Disponibilidad">
          Un cambio estará sujeto a la disponibilidad del producto
          correspondiente y a las condiciones aplicables a la
          operación.
        </LegalInfoBox>
      </LegalSection>

      {/* =========================================
          9. DEVOLUCIONES
      ========================================= */}

      <LegalSection
        number="9"
        title="Devoluciones"
        id="devoluciones"
      >
        <p>
          Cuando una devolución sea procedente, Xhunco Café
          proporcionará al cliente las instrucciones necesarias
          para realizarla.
        </p>

        <p>
          Dependiendo de las circunstancias, podremos indicar la
          forma en que deberá entregarse o enviarse el producto,
          así como cualquier información necesaria para identificar
          la devolución.
        </p>

        <p>
          El producto deberá conservarse en las condiciones
          correspondientes mientras se determina la solución de la
          incidencia, salvo que por la naturaleza del problema ello
          no sea posible o resulte innecesario.
        </p>

        <LegalInfoBox type="warning" title="No envíes productos sin autorización">
          No recomendamos enviar productos por cuenta propia antes
          de recibir instrucciones de Xhunco Café, ya que la
          devolución deberá coordinarse de acuerdo con las
          características de cada caso.
        </LegalInfoBox>
      </LegalSection>

      {/* =========================================
          10. REEMBOLSOS
      ========================================= */}

      <LegalSection
        number="10"
        title="Reembolsos"
        id="reembolsos"
      >
        <p>
          Cuando corresponda un reembolso, este se realizará de
          acuerdo con las condiciones de la operación y el método
          de pago utilizado, cuando técnicamente sea posible.
        </p>

        <p>
          El tiempo necesario para que un reembolso se refleje
          puede depender de la institución financiera, proveedor
          de pagos o método utilizado para realizar la operación.
        </p>

        <p>
          El hecho de que Xhunco Café haya iniciado un reembolso no
          significa necesariamente que este se refleje de manera
          inmediata en la cuenta del cliente.
        </p>

        <LegalInfoBox type="info" title="Tiempo de reflejo">
          Los tiempos de aplicación de un reembolso pueden depender
          del método de pago y de los procesos de la institución
          financiera o proveedor correspondiente.
        </LegalInfoBox>
      </LegalSection>

      {/* =========================================
          11. GASTOS DE DEVOLUCIÓN
      ========================================= */}

      <LegalSection
        number="11"
        title="Gastos relacionados con devoluciones"
        id="gastos"
      >
        <p>
          La responsabilidad respecto de los gastos relacionados
          con una devolución dependerá de la causa que origine la
          solicitud y de las condiciones aplicables a la operación.
        </p>

        <p>
          Cuando una devolución sea consecuencia de un error
          atribuible a Xhunco Café, un producto incorrecto, un
          defecto o una circunstancia que corresponda ser atendida
          por nosotros, se determinarán las acciones y gastos que
          correspondan conforme a la legislación aplicable y a las
          circunstancias del caso.
        </p>

        <p>
          En otros supuestos, cualquier costo relacionado con el
          traslado o devolución podrá depender de las condiciones
          comerciales aplicables.
        </p>

        <LegalInfoBox type="info" title="Evaluación caso por caso">
          Los gastos relacionados con una devolución serán
          determinados considerando el motivo de la solicitud y las
          circunstancias particulares de la operación.
        </LegalInfoBox>
      </LegalSection>

      {/* =========================================
          12. PEDIDOS PERSONALIZADOS
      ========================================= */}

      <LegalSection
        number="12"
        title="Pedidos personalizados o especiales"
        id="personalizados"
      >
        <p>
          Algunos productos o pedidos pueden prepararse conforme a
          especificaciones particulares solicitadas por el cliente.
        </p>

        <p>
          Debido a sus características, estos pedidos pueden estar
          sujetos a condiciones particulares respecto de cambios o
          devoluciones.
        </p>

        <p>
          Las condiciones específicas podrán comunicarse al cliente
          antes de confirmar la operación cuando resulte necesario.
        </p>

        <LegalInfoBox type="info" title="Pedidos especiales">
          Las condiciones aplicables a productos personalizados,
          preparados bajo especificaciones particulares o pedidos
          especiales podrán variar dependiendo de la naturaleza de
          la operación.
        </LegalInfoBox>
      </LegalSection>

      {/* =========================================
          13. PROMOCIONES Y DESCUENTOS
      ========================================= */}

      <LegalSection
        number="13"
        title="Pedidos realizados con promociones o descuentos"
        id="promociones"
      >
        <p>
          Los pedidos realizados utilizando promociones,
          descuentos, códigos promocionales o beneficios especiales
          podrán estar sujetos a condiciones particulares.
        </p>

        <p>
          Cuando una promoción establezca condiciones específicas
          sobre cambios, devoluciones, cancelaciones o reembolsos,
          dichas condiciones podrán comunicarse al cliente antes
          o durante la realización de la operación.
        </p>

        <p>
          En ningún caso las condiciones de una promoción
          pretenderán limitar los derechos que correspondan al
          consumidor conforme a la legislación aplicable.
        </p>
      </LegalSection>

      {/* =========================================
          14. CASOS EN LOS QUE NO PROCEDE
      ========================================= */}

      <LegalSection
        number="14"
        title="Casos en los que puede no proceder una devolución"
        id="no-procede"
      >
        <p>
          Una solicitud podrá ser improcedente cuando, después de
          la revisión correspondiente, se determine que no existe
          una causa que justifique el cambio, devolución o
          reembolso conforme a las condiciones de la operación y
          la legislación aplicable.
        </p>

        <p>
          Entre otras circunstancias, podrán considerarse:
        </p>

        <ul className="list-disc space-y-2 pl-6">
          <li>
            Daños ocasionados por un uso o manejo inadecuado del
            producto.
          </li>

          <li>
            Alteraciones realizadas por el cliente.
          </li>

          <li>
            Información insuficiente que impida identificar la
            operación, cuando sea indispensable para revisarla.
          </li>

          <li>
            Solicitudes que no correspondan con las condiciones
            aplicables al producto u operación.
          </li>

          <li>
            Situaciones en las que exista una causa legal o
            contractual que impida la devolución.
          </li>
        </ul>

        <LegalInfoBox type="warning" title="Derechos del consumidor">
          Cualquier determinación respecto de una devolución se
          realizará respetando los derechos que correspondan al
          consumidor conforme a la legislación aplicable.
        </LegalInfoBox>
      </LegalSection>

      {/* =========================================
          15. CANCELACIONES
      ========================================= */}

      <LegalSection
        number="15"
        title="Cancelación de pedidos"
        id="cancelaciones"
      >
        <p>
          Las solicitudes de cancelación deberán comunicarse a
          Xhunco Café lo antes posible después de realizar el
          pedido.
        </p>

        <p>
          La posibilidad de cancelar una operación podrá depender
          del estado en que se encuentre el pedido. Por ejemplo, un
          pedido que todavía no haya iniciado su preparación podrá
          tener condiciones diferentes a uno que ya se encuentre
          preparado, enviado o en proceso de entrega.
        </p>

        <p>
          Cuando una cancelación resulte procedente y corresponda
          realizar un reembolso, este se gestionará conforme a las
          condiciones aplicables a la operación y al método de pago
          utilizado.
        </p>

        <LegalInfoBox type="info" title="Solicita la cancelación cuanto antes">
          Si deseas cancelar un pedido, comunícate con nosotros lo
          antes posible para determinar si la operación todavía
          puede detenerse.
        </LegalInfoBox>
      </LegalSection>

      {/* =========================================
          16. CAMBIOS A LA POLÍTICA
      ========================================= */}

      <LegalSection
        number="16"
        title="Cambios a esta Política"
        id="cambios-politica"
      >
        <p>
          Xhunco Café podrá modificar, actualizar o complementar
          esta Política de Cambios, Devoluciones y Reembolsos
          cuando resulte necesario debido a cambios legales,
          regulatorios, operativos, tecnológicos o comerciales.
        </p>

        <p>
          La versión vigente estará disponible permanentemente en
          nuestro sitio web dentro del Centro Legal de Xhunco Café.
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
          17. CONTACTO
      ========================================= */}

      <LegalSection
        number="17"
        title="Contacto"
        id="contacto"
      >
        <p>
          Si tienes dudas, deseas solicitar un cambio o devolución,
          reportar una incidencia o consultar el estado de un
          reembolso, puedes comunicarte con Xhunco Café mediante
          los siguientes medios:
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
        Esta Política de Cambios, Devoluciones y Reembolsos
        corresponde a la versión{" "}
        <strong>{LEGAL.version}</strong> actualmente publicada
        en el Centro Legal de Xhunco Café.
      </LegalInfoBox>
    </LegalLayout>
  );
}