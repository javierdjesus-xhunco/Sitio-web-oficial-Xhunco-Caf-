import LegalLayout from "@/components/legal/LegalLayout";
import LegalSection from "@/components/legal/LegalSection";
import LegalInfoBox from "@/components/legal/LegalInfoBox";
import LegalLastUpdated from "@/components/legal/LegalLastUpdated";

import { LEGAL } from "@/lib/legal/legalConfig";

export const metadata = {
  title: `Política de Cookies | ${LEGAL.companyName}`,
  description:
    "Conoce cómo Xhunco Café utiliza cookies y tecnologías similares en su sitio web y plataformas digitales.",
};

export default function CookiesPage() {
  return (
    <LegalLayout
      title="Política de Cookies"
      description="Conoce qué son las cookies, cómo las utilizamos y qué opciones tienes para administrarlas."
      currentSlug="cookies"
      badge="Cookies"
    >
      {/* =========================================
          INTRODUCCIÓN
      ========================================= */}

      <div className="mb-8">
        <p className="text-base leading-8 text-gray-700">
          En {LEGAL.companyName} utilizamos cookies y tecnologías
          similares para permitir el funcionamiento de nuestro
          sitio web y determinadas funcionalidades de nuestras
          plataformas digitales, mejorar la experiencia de
          navegación y obtener información relacionada con el uso
          de nuestros servicios.
        </p>

        <LegalLastUpdated />
      </div>

      <LegalInfoBox type="info" title="Sobre esta Política">
        Esta Política de Cookies explica qué son las cookies,
        qué categorías podemos utilizar, para qué pueden servir
        y qué opciones tienes para administrarlas.
      </LegalInfoBox>

      {/* =========================================
          1. ¿QUÉ SON LAS COOKIES?
      ========================================= */}

      <LegalSection
        number="1"
        title="¿Qué son las cookies?"
        id="que-son-cookies"
      >
        <p>
          Las cookies son pequeños archivos o fragmentos de
          información que pueden almacenarse en el navegador o
          dispositivo del usuario cuando visita un sitio web.
        </p>

        <p>
          Estas tecnologías permiten que un sitio recuerde
          determinada información durante una visita o entre
          diferentes sesiones y pueden utilizarse para
          proporcionar funcionalidades, mantener sesiones,
          recordar preferencias, mejorar la seguridad o conocer
          cómo se utilizan determinados servicios digitales.
        </p>

        <p>
          Además de las cookies, determinados servicios pueden
          utilizar tecnologías similares, como identificadores,
          almacenamiento local u otros mecanismos técnicos que
          permiten reconocer un dispositivo o conservar
          determinada información.
        </p>
      </LegalSection>

      {/* =========================================
          2. ¿PARA QUÉ UTILIZAMOS COOKIES?
      ========================================= */}

      <LegalSection
        number="2"
        title="¿Para qué utilizamos cookies?"
        id="finalidades"
      >
        <p>
          Xhunco Café puede utilizar cookies y tecnologías
          similares para diferentes finalidades relacionadas con
          el funcionamiento y mejora de nuestros servicios.
        </p>

        <ul className="list-disc space-y-2 pl-6">
          <li>
            Permitir el funcionamiento de determinadas
            funcionalidades del sitio y la plataforma.
          </li>

          <li>
            Mantener sesiones y facilitar el acceso a cuentas de
            usuario.
          </li>

          <li>
            Recordar determinadas preferencias o configuraciones.
          </li>

          <li>
            Mejorar la seguridad y detectar actividades
            potencialmente indebidas.
          </li>

          <li>
            Comprender cómo los usuarios interactúan con nuestros
            servicios digitales.
          </li>

          <li>
            Mejorar el funcionamiento, contenido y experiencia de
            navegación.
          </li>
        </ul>

        <LegalInfoBox type="info" title="Uso de cookies">
          Las cookies utilizadas dependerán de las
          funcionalidades disponibles en cada momento y de las
          tecnologías integradas en nuestros servicios.
        </LegalInfoBox>
      </LegalSection>

      {/* =========================================
          3. TIPOS DE COOKIES
      ========================================= */}

      <LegalSection
        number="3"
        title="Tipos de cookies que podemos utilizar"
        id="tipos"
      >
        <p>
          Dependiendo de su función y finalidad, las cookies
          utilizadas en nuestros servicios pueden clasificarse
          en diferentes categorías.
        </p>

        <h3 className="font-semibold text-gray-900">
          Cookies necesarias
        </h3>

        <p>
          Son aquellas necesarias para permitir el
          funcionamiento básico del sitio o de determinadas
          funcionalidades solicitadas por el usuario.
        </p>

        <h3 className="font-semibold text-gray-900">
          Cookies de preferencias
        </h3>

        <p>
          Permiten recordar determinadas configuraciones,
          preferencias o elecciones realizadas por el usuario
          para facilitar su navegación.
        </p>

        <h3 className="font-semibold text-gray-900">
          Cookies de funcionamiento y análisis
        </h3>

        <p>
          Pueden utilizarse para obtener información sobre el
          funcionamiento y utilización de nuestros servicios
          digitales, con el objetivo de detectar problemas y
          mejorar su desempeño y experiencia de usuario.
        </p>

        <h3 className="font-semibold text-gray-900">
          Cookies de terceros
        </h3>

        <p>
          Determinadas funcionalidades o servicios integrados en
          nuestra plataforma podrían utilizar tecnologías
          proporcionadas por terceros.
        </p>
      </LegalSection>

      {/* =========================================
          4. COOKIES NECESARIAS
      ========================================= */}

      <LegalSection
        number="4"
        title="Cookies necesarias para el funcionamiento"
        id="necesarias"
      >
        <p>
          Algunas cookies o tecnologías similares pueden ser
          indispensables para proporcionar funcionalidades que
          hayas solicitado o para mantener la seguridad y el
          funcionamiento adecuado de nuestros servicios.
        </p>

        <p>
          Estas tecnologías pueden utilizarse, por ejemplo, para
          mantener una sesión activa, permitir el acceso a una
          cuenta, recordar información necesaria durante una
          operación o proteger determinadas funciones.
        </p>

        <LegalInfoBox type="security" title="Cookies esenciales">
          Cuando una cookie sea técnicamente necesaria para
          proporcionar una funcionalidad solicitada, su
          desactivación podría impedir o afectar el funcionamiento
          de dicha funcionalidad.
        </LegalInfoBox>
      </LegalSection>

      {/* =========================================
          5. TECNOLOGÍAS Y SERVICIOS UTILIZADOS
      ========================================= */}

      <LegalSection
        number="5"
        title="Tecnologías y servicios utilizados"
        id="tecnologias"
      >
        <p>
          Para operar, mantener, proteger, analizar y mejorar
          nuestros servicios digitales, Xhunco Café puede utilizar
          determinadas tecnologías y servicios proporcionados por
          terceros.
        </p>

        <h3 className="font-semibold text-gray-900">
          Google Analytics
        </h3>

        <p>
          Xhunco Café puede utilizar Google Analytics para obtener
          información estadística relacionada con el uso de
          nuestro sitio web, comprender cómo interactúan los
          visitantes con determinadas páginas y mejorar el
          funcionamiento y la experiencia de navegación.
        </p>

        <p>
          La información recopilada mediante estas herramientas
          puede incluir datos técnicos relacionados con el
          dispositivo, navegador, navegación, interacción con el
          sitio y otros datos de carácter estadístico, dependiendo
          de la configuración implementada.
        </p>

        <h3 className="font-semibold text-gray-900">
          Supabase
        </h3>

        <p>
          Xhunco Café utiliza servicios de infraestructura
          tecnológica proporcionados por Supabase para determinadas
          funciones de nuestra plataforma digital, incluyendo,
          según corresponda, autenticación, gestión de sesiones,
          almacenamiento y administración de información necesaria
          para proporcionar determinadas funcionalidades.
        </p>

        <p>
          Las tecnologías utilizadas por estos servicios pueden
          incluir mecanismos técnicos necesarios para mantener
          sesiones, autenticar usuarios, proteger determinadas
          funciones y permitir el funcionamiento de la plataforma.
        </p>

        <LegalInfoBox type="info" title="Tecnologías de terceros">
          Las tecnologías y servicios utilizados pueden cambiar
          conforme evolucionen nuestros servicios digitales.
          Cuando resulte necesario, esta Política de Cookies podrá
          actualizarse para reflejar dichos cambios.
        </LegalInfoBox>
      </LegalSection>

      {/* =========================================
          6. COOKIES DE TERCEROS
      ========================================= */}

      <LegalSection
        number="6"
        title="Cookies y tecnologías de terceros"
        id="terceros"
      >
        <p>
          Algunos servicios, herramientas o funcionalidades
          integrados en nuestros sitios y plataformas pueden ser
          proporcionados por terceros y utilizar sus propias
          cookies o tecnologías similares.
        </p>

        <p>
          En estos casos, el uso de dichas tecnologías puede estar
          sujeto también a las políticas y condiciones del tercero
          correspondiente.
        </p>

        <p>
          Xhunco Café procurará informar sobre las tecnologías de
          terceros que se incorporen a nuestros servicios cuando
          resulte necesario y aplicable.
        </p>

        <LegalInfoBox type="info" title="Servicios externos">
          Te recomendamos consultar las políticas de privacidad y
          cookies de los proveedores externos cuando interactúes
          con servicios proporcionados por terceros.
        </LegalInfoBox>
      </LegalSection>

      {/* =========================================
          7. DURACIÓN
      ========================================= */}

      <LegalSection
        number="7"
        title="Duración de las cookies"
        id="duracion"
      >
        <p>
          Las cookies pueden tener diferentes periodos de
          duración dependiendo de su finalidad y configuración.
        </p>

        <h3 className="font-semibold text-gray-900">
          Cookies de sesión
        </h3>

        <p>
          Permanecen activas durante una sesión de navegación y
          normalmente dejan de estar disponibles cuando se cierra
          el navegador o finaliza la sesión correspondiente.
        </p>

        <h3 className="font-semibold text-gray-900">
          Cookies persistentes
        </h3>

        <p>
          Pueden permanecer almacenadas durante un periodo
          determinado y permitir que determinadas preferencias o
          configuraciones sean reconocidas durante visitas
          posteriores.
        </p>

        <p>
          La duración concreta dependerá de la cookie o tecnología
          utilizada y de su configuración correspondiente.
        </p>
      </LegalSection>

      {/* =========================================
          8. ADMINISTRACIÓN
      ========================================= */}

      <LegalSection
        number="8"
        title="¿Cómo puedes administrar las cookies?"
        id="administracion"
      >
        <p>
          Puedes administrar o eliminar determinadas cookies
          mediante las opciones de configuración de tu navegador.
        </p>

        <p>
          La mayoría de los navegadores permiten consultar,
          bloquear, eliminar o configurar el comportamiento de
          las cookies desde sus opciones de privacidad y
          seguridad.
        </p>

        <p>
          También podrás encontrar opciones específicas de
          administración cuando Xhunco Café implemente mecanismos
          de gestión o consentimiento de cookies dentro de sus
          servicios digitales.
        </p>

        <LegalInfoBox type="warning" title="Desactivación de cookies">
          La desactivación o eliminación de determinadas cookies
          puede afectar el funcionamiento de algunas
          funcionalidades del sitio o de la plataforma.
        </LegalInfoBox>
      </LegalSection>

      {/* =========================================
          9. DATOS PERSONALES
      ========================================= */}

      <LegalSection
        number="9"
        title="Cookies y datos personales"
        id="datos-personales"
      >
        <p>
          Algunas cookies o tecnologías similares pueden estar
          relacionadas con información que permita identificar o
          asociar determinada actividad con un usuario o
          dispositivo.
        </p>

        <p>
          Cuando el uso de cookies implique el tratamiento de
          datos personales, dicho tratamiento se realizará de
          conformidad con nuestro Aviso de Privacidad y la
          legislación aplicable.
        </p>

        <p>
          Para conocer cómo Xhunco Café recaba, utiliza, protege y
          conserva los datos personales, puedes consultar nuestro{" "}
          <a
            href="/legal/privacidad"
            className="font-semibold text-[#31572c] underline underline-offset-4 hover:text-[#3f6b38]"
          >
            Aviso de Privacidad
          </a>
          .
        </p>
      </LegalSection>

      {/* =========================================
          10. CAMBIOS A LA POLÍTICA
      ========================================= */}

      <LegalSection
        number="10"
        title="Cambios a esta Política de Cookies"
        id="cambios"
      >
        <p>
          Xhunco Café podrá modificar o actualizar esta Política
          de Cookies cuando resulte necesario debido a cambios
          legales, regulatorios, tecnológicos, operativos o en
          las funcionalidades de nuestros servicios digitales.
        </p>

        <p>
          La versión vigente estará disponible en nuestro sitio
          web dentro del Centro Legal.
        </p>

        <p>
          Cuando corresponda, comunicaremos los cambios mediante
          los mecanismos que resulten aplicables considerando la
          naturaleza de las modificaciones.
        </p>

        <LegalInfoBox type="info" title="Versión vigente">
          Te recomendamos consultar periódicamente esta Política
          para conocer cualquier modificación o actualización.
        </LegalInfoBox>
      </LegalSection>

      {/* =========================================
          11. CONTACTO
      ========================================= */}

      <LegalSection
        number="11"
        title="Contacto"
        id="contacto"
      >
        <p>
          Si tienes dudas sobre el uso de cookies o tecnologías
          similares en nuestros servicios, puedes comunicarte con
          Xhunco Café mediante los siguientes medios:
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
        Esta Política de Cookies corresponde a la versión{" "}
        <strong>{LEGAL.version}</strong> actualmente publicada
        en el Centro Legal de Xhunco Café.
      </LegalInfoBox>
    </LegalLayout>
  );
}