// Textos legales de HomeTest (política de privacidad y condiciones de uso).
//
// BORRADOR redactado a partir de lo que hace la app a 2026-09-28. Debe revisarlo
// un profesional (asesoría / abogado especialista en protección de datos) antes
// de tener usuarios reales: la app trata datos de salud (art. 9 RGPD).
// Los campos [PENDIENTE] se completan al constituir la sociedad.

export interface LegalSection {
  title: string;
  paragraphs: string[];
}

export interface LegalDocument {
  title: string;
  updated: string;
  intro: string;
  sections: LegalSection[];
}

const CONTROLLER_ES =
  "Astor García Amor (persona física; en proceso de constitución de la sociedad que operará HomeTest). Domicilio: [PENDIENTE]. Contacto para privacidad: [EMAIL DE CONTACTO PENDIENTE].";
const CONTROLLER_EN =
  "Astor García Amor (individual; the company that will operate HomeTest is being incorporated). Address: [PENDING]. Privacy contact: [CONTACT EMAIL PENDING].";

export const privacyEs: LegalDocument = {
  title: "Política de privacidad",
  updated: "Última actualización: 28 de septiembre de 2026 (borrador)",
  intro:
    "HomeTest es una aplicación de salud preventiva que te permite registrar y entender tus análisis, tus mediciones y tus hábitos, y compartirlos, si tú quieres, con los profesionales que elijas. Tus datos de salud son tuyos: solo los tratamos para prestarte el servicio, con tu consentimiento explícito, y nunca los vendemos ni los usamos para publicidad.",
  sections: [
    {
      title: "1. Responsable del tratamiento",
      paragraphs: [CONTROLLER_ES],
    },
    {
      title: "2. Qué datos tratamos",
      paragraphs: [
        "Datos de cuenta: nombre, email y contraseña (guardada cifrada por nuestro proveedor de autenticación; nosotros no podemos verla).",
        "Datos de perfil que decides darnos: fecha de nacimiento, sexo, altura, peso, hábitos (actividad, sueño, tabaco, alcohol) y objetivos.",
        "Datos de salud: informes de análisis clínicos que subes (PDF o fotos) y los resultados extraídos de ellos; mediciones que registras (glucosa, tensión arterial y pulso, colesterol, cortisol); fechas de inicio del periodo y predicción del ciclo; registros de bienestar (cómo has dormido, energía, estado de ánimo, notas de texto o audio); entrenamientos; comidas y sus fotos.",
        "Datos de dispositivos y wearables, solo si conectas un servicio y lo autorizas (por ejemplo Health Connect de Android o Huawei Health): pasos, calorías, pulso en reposo, variabilidad de la frecuencia cardiaca, sueño y temperatura (de Huawei Health, por ahora, solo pasos, calorías y distancia, y como máximo el último mes de histórico). Solo leemos; nunca escribimos en esos servicios.",
        "Si eres profesional sanitario: nombre, profesión, especialidad, número de colegiado y colegio, ciudad, idiomas, modalidades de consulta, años de experiencia, presentación, foto y tarifa horaria.",
        "Datos técnicos mínimos para que el servicio funcione de forma segura (por ejemplo, registros de acceso).",
      ],
    },
    {
      title: "3. Para qué los usamos",
      paragraphs: [
        "Prestarte el servicio: guardar tus datos, mostrarte gráficas, tendencias y tu histórico.",
        "Extraer automáticamente los valores de los informes de análisis y de la pantalla del tensiómetro que fotografías, y resumir tus notas del diario, mediante un servicio de inteligencia artificial (ver apartado 5).",
        "Ofrecerte recomendaciones de bienestar de carácter informativo. No son diagnósticos ni sustituyen la valoración de un profesional sanitario.",
        "Compartir tus datos con los profesionales que tú elijas, solo en las categorías que tú marques y durante el tiempo que tú decidas (ver apartado 6).",
        "Mantener la seguridad del servicio y cumplir nuestras obligaciones legales.",
        "No usamos tus datos para publicidad, no los vendemos y no elaboramos perfiles comerciales. Cualquier uso de datos agregados y seudonimizados para mejorar el servicio (por ejemplo, las predicciones del ciclo) requerirá un consentimiento adicional y separado, que podrás dar o retirar cuando quieras; hoy no realizamos ese uso.",
      ],
    },
    {
      title: "4. Base legal",
      paragraphs: [
        "Datos de salud: tu consentimiento explícito (art. 9.2.a RGPD), que das al registrarte y al usar cada función. Puedes retirarlo en cualquier momento, sin que ello afecte a la licitud del tratamiento anterior.",
        "Datos de cuenta y perfil: la ejecución del contrato de servicio que aceptas (art. 6.1.b RGPD).",
        "Datos de profesionales: la relación contractual con HomeTest y nuestro interés legítimo en verificar su identidad y colegiación antes de mostrarlos a los pacientes (art. 6.1.b y 6.1.f RGPD).",
      ],
    },
    {
      title: "5. Con quién compartimos tus datos",
      paragraphs: [
        "Proveedores que tratan datos por nuestra cuenta (encargados del tratamiento), con contrato y garantías del RGPD:",
        "— Supabase: alojamiento de la base de datos, los archivos y la autenticación, en servidores de la Unión Europea (Frankfurt, Alemania).",
        "— Google (API de Gemini): procesa los documentos, fotos y audios que envías para extraer los datos. Solo recibe lo necesario para cada petición.",
        "— Expo (EAS): distribución de la app y de sus actualizaciones. No recibe tus datos de salud.",
        "Servicios que tú conectas (Health Connect, Huawei Health): solo leemos los datos que autorizas en su propia pantalla de permisos.",
        "Profesionales sanitarios que tú elijas: solo pueden leer las categorías que les compartas, mientras el permiso esté activo, y nunca pueden modificar tus datos. Siempre verán tu nombre. HomeTest verifica su identidad y colegiación antes de que puedas compartir datos con ellos.",
        "Autoridades, solo cuando una ley nos obligue.",
      ],
    },
    {
      title: "6. Tu control al compartir con profesionales",
      paragraphs: [
        "Tú decides qué categorías compartes (por ejemplo, análisis, glucosa, tensión, ciclo, bienestar, actividad, nutrición, wearables o perfil), con qué profesional y hasta cuándo.",
        "Puedes revocar un permiso en cualquier momento desde la app (Sharing & privacy); desde ese momento el profesional deja de ver tus datos.",
        "Guardamos el historial de permisos concedidos y revocados como prueba de tu consentimiento.",
      ],
    },
    {
      title: "7. Transferencias internacionales",
      paragraphs: [
        "Tus datos se almacenan en la Unión Europea. Algunos proveedores (por ejemplo, Google para el servicio de IA) pueden tratar datos fuera del Espacio Económico Europeo; en ese caso lo hacen con las garantías del RGPD (decisión de adecuación, como el Marco de Privacidad de Datos UE-EE. UU., o cláusulas contractuales tipo de la Comisión Europea).",
      ],
    },
    {
      title: "8. Cuánto tiempo los conservamos",
      paragraphs: [
        "Mientras tengas la cuenta activa. Si la eliminas, borramos tus datos en un plazo máximo de 30 días, salvo los que debamos conservar por obligación legal y el registro de consentimientos de compartición, que se conserva bloqueado durante los plazos legales de prescripción para poder acreditarlos.",
      ],
    },
    {
      title: "9. Tus derechos",
      paragraphs: [
        "Puedes ejercer tus derechos de acceso, rectificación, supresión, oposición, limitación del tratamiento y portabilidad, y retirar tu consentimiento, escribiendo a [EMAIL DE CONTACTO PENDIENTE].",
        "Si consideras que no hemos atendido bien tu solicitud, puedes reclamar ante la Agencia Española de Protección de Datos (www.aepd.es).",
      ],
    },
    {
      title: "10. Seguridad",
      paragraphs: [
        "Cifrado en tránsito, control de acceso a nivel de base de datos (cada usuario solo puede acceder a sus propios datos y a lo que otros le compartan expresamente), almacenamiento privado de archivos, funciones de IA que exigen sesión iniciada y claves de servicio que nunca se incluyen en la app.",
      ],
    },
    {
      title: "11. Menores",
      paragraphs: ["HomeTest está dirigido a personas mayores de 18 años."],
    },
    {
      title: "12. Cambios en esta política",
      paragraphs: [
        "Si cambiamos esta política de forma relevante, te avisaremos en la app antes de que el cambio se aplique y, cuando haga falta, te pediremos de nuevo tu consentimiento.",
      ],
    },
  ],
};

export const privacyEn: LegalDocument = {
  title: "Privacy Policy",
  updated: "Last updated: 28 September 2026 (draft)",
  intro:
    "HomeTest is a preventive-health app that lets you record and understand your lab tests, measurements and habits, and share them, if you want, with the professionals you choose. Your health data is yours: we only process it to provide the service, with your explicit consent, and we never sell it or use it for advertising.",
  sections: [
    { title: "1. Data controller", paragraphs: [CONTROLLER_EN] },
    {
      title: "2. Data we process",
      paragraphs: [
        "Account data: name, email and password (stored hashed by our authentication provider; we cannot see it).",
        "Profile data you choose to give: date of birth, sex, height, weight, habits (activity, sleep, smoking, alcohol) and goals.",
        "Health data: lab reports you upload (PDF or photos) and the results extracted from them; measurements you log (glucose, blood pressure and pulse, cholesterol, cortisol); period start dates and cycle predictions; wellbeing check-ins (sleep, energy, mood, text or voice notes); workouts; meals and meal photos.",
        "Device and wearable data, only if you connect and authorise a service (e.g. Android Health Connect or Huawei Health): steps, calories, resting heart rate, heart rate variability, sleep and body temperature (from Huawei Health, currently only steps, calories and distance, with at most the last month of history). Read-only; we never write to those services.",
        "If you are a healthcare professional: name, profession, specialty, registration number and professional college, city, languages, consultation modes, years of experience, bio, photo and hourly rate.",
        "Minimal technical data needed to run the service securely (e.g. access logs).",
      ],
    },
    {
      title: "3. Purposes",
      paragraphs: [
        "To provide the service: store your data and show you charts, trends and history.",
        "To automatically extract values from lab reports and blood pressure monitor photos, and to summarise your diary notes, using an AI service (see section 5).",
        "To give you informational wellbeing recommendations. They are not diagnoses and do not replace a healthcare professional.",
        "To share your data with the professionals you choose, only for the categories you select and for as long as you decide (see section 6).",
        "To keep the service secure and meet our legal obligations.",
        "We do not use your data for advertising, we do not sell it and we do not build commercial profiles. Any use of aggregated, pseudonymised data to improve the service (e.g. cycle predictions) will require a separate, additional consent that you can give or withdraw at any time; we do not do this today.",
      ],
    },
    {
      title: "4. Legal basis",
      paragraphs: [
        "Health data: your explicit consent (Art. 9(2)(a) GDPR), which you can withdraw at any time without affecting prior processing.",
        "Account and profile data: performance of the service contract (Art. 6(1)(b) GDPR).",
        "Professionals' data: the contractual relationship with HomeTest and our legitimate interest in verifying their identity and registration before showing them to patients (Art. 6(1)(b) and 6(1)(f) GDPR).",
      ],
    },
    {
      title: "5. Who we share data with",
      paragraphs: [
        "Processors acting on our behalf, under GDPR contracts:",
        "— Supabase: database, file storage and authentication hosting in the European Union (Frankfurt, Germany).",
        "— Google (Gemini API): processes the documents, photos and audio you submit in order to extract data; it receives only what each request needs.",
        "— Expo (EAS): app and update distribution. It does not receive your health data.",
        "Services you connect (Health Connect, Huawei Health): we only read the data you authorise on their own permission screens.",
        "Healthcare professionals you choose: they can only read the categories you share, while the permission is active, and can never modify your data. They will always see your name. HomeTest verifies their identity and registration before you can share with them.",
        "Authorities, only where required by law.",
      ],
    },
    {
      title: "6. Your control when sharing with professionals",
      paragraphs: [
        "You decide which categories you share (e.g. lab results, glucose, blood pressure, cycle, wellbeing, activity, nutrition, wearables or profile), with which professional and until when.",
        "You can revoke a permission at any time in the app (Sharing & privacy); from then on the professional can no longer see your data.",
        "We keep the history of granted and revoked permissions as evidence of your consent.",
      ],
    },
    {
      title: "7. International transfers",
      paragraphs: [
        "Your data is stored in the European Union. Some processors (e.g. Google for the AI service) may process data outside the EEA; if so, they do it under GDPR safeguards (adequacy decisions such as the EU-US Data Privacy Framework, or the European Commission's standard contractual clauses).",
      ],
    },
    {
      title: "8. Retention",
      paragraphs: [
        "While your account is active. If you delete it, we erase your data within 30 days, except data we must keep by law and the record of sharing consents, which is kept blocked for the statutory limitation periods so that it can be evidenced.",
      ],
    },
    {
      title: "9. Your rights",
      paragraphs: [
        "You can exercise your rights of access, rectification, erasure, objection, restriction and portability, and withdraw your consent, by writing to [CONTACT EMAIL PENDING].",
        "You can also lodge a complaint with the Spanish Data Protection Agency (www.aepd.es).",
      ],
    },
    {
      title: "10. Security",
      paragraphs: [
        "Encryption in transit, database-level access control (each user can only access their own data and what others explicitly share with them), private file storage, AI functions that require a signed-in session, and service keys that are never shipped in the app.",
      ],
    },
    { title: "11. Minors", paragraphs: ["HomeTest is intended for people aged 18 or over."] },
    {
      title: "12. Changes",
      paragraphs: [
        "If we materially change this policy, we will notify you in the app before the change applies and ask for your consent again where required.",
      ],
    },
  ],
};

export const termsEs: LegalDocument = {
  title: "Condiciones de uso",
  updated: "Última actualización: 28 de septiembre de 2026 (borrador)",
  intro:
    "Estas condiciones regulan el uso de la app y la web de HomeTest. Al crear una cuenta, las aceptas. Léelas con calma: explican qué es y qué no es HomeTest.",
  sections: [
    { title: "1. Titular del servicio", paragraphs: [CONTROLLER_ES] },
    {
      title: "2. Qué es HomeTest (y qué no es)",
      paragraphs: [
        "HomeTest te ayuda a registrar, organizar y entender tus análisis, mediciones y hábitos, y a compartirlos con profesionales.",
        "HomeTest NO presta asistencia sanitaria, NO realiza diagnósticos y NO sustituye la consulta con un médico. La información y las recomendaciones de la app son orientativas y de bienestar general.",
        "Si tienes una urgencia médica, llama al 112.",
        "Los valores extraídos automáticamente de documentos y fotos pueden contener errores: revísalos y, ante cualquier duda, consulta el informe original y a tu médico.",
      ],
    },
    {
      title: "3. Tu cuenta",
      paragraphs: [
        "Debes ser mayor de 18 años, darnos datos veraces y custodiar tu contraseña. Eres responsable de la actividad de tu cuenta.",
        "Puedes eliminar tu cuenta cuando quieras; tus datos se borrarán según la Política de privacidad.",
      ],
    },
    {
      title: "4. Profesionales",
      paragraphs: [
        "Los profesionales que aparecen en HomeTest son independientes. HomeTest verifica su identidad y su colegiación antes de mostrarlos, y revisa sus tarifas, pero la relación asistencial se establece directamente entre tú y el profesional, que es el único responsable de sus actos profesionales.",
        "Los profesionales solo pueden ver los datos que tú les compartas, mientras el permiso esté activo, y nunca pueden modificarlos.",
        "Si eres profesional, te comprometes a que los datos de tu ficha sean veraces, a estar colegiado y habilitado para ejercer, y a tratar los datos de los pacientes conforme al RGPD y a tu código deontológico.",
      ],
    },
    {
      title: "5. Uso aceptable",
      paragraphs: [
        "No puedes usar HomeTest para fines ilícitos, subir datos de otras personas sin su consentimiento, intentar acceder a datos ajenos ni interferir en el funcionamiento o la seguridad del servicio.",
      ],
    },
    {
      title: "6. Precio y fase actual",
      paragraphs: [
        "HomeTest se encuentra en fase de pruebas y su uso es gratuito. Antes de que cualquier servicio pase a ser de pago, te informaremos del precio y las condiciones, y solo se te cobrará si lo contratas expresamente. Como consumidor, dispondrás del derecho de desistimiento previsto en la ley.",
      ],
    },
    {
      title: "7. Propiedad intelectual",
      paragraphs: [
        "La app, la web y sus contenidos pertenecen a HomeTest o a sus licenciantes. Tus datos son tuyos: solo nos das permiso para tratarlos con el fin de prestarte el servicio.",
      ],
    },
    {
      title: "8. Responsabilidad",
      paragraphs: [
        "Trabajamos para que HomeTest funcione de forma continua y segura, pero no podemos garantizar que esté libre de interrupciones o errores. HomeTest no responde de las decisiones de salud que se tomen únicamente a partir de la información de la app sin consultar a un profesional. Nada de lo anterior limita los derechos que la ley reconoce a los consumidores.",
      ],
    },
    {
      title: "9. Suspensión",
      paragraphs: [
        "Podremos suspender o cerrar cuentas que incumplan estas condiciones, avisándote salvo que la ley o la seguridad del servicio lo impidan.",
      ],
    },
    {
      title: "10. Cambios",
      paragraphs: [
        "Si cambiamos estas condiciones de forma relevante, te avisaremos en la app con antelación. Si no estás de acuerdo, podrás eliminar tu cuenta.",
      ],
    },
    {
      title: "11. Ley aplicable",
      paragraphs: [
        "Estas condiciones se rigen por la ley española. Si eres consumidor, serán competentes los juzgados de tu domicilio.",
      ],
    },
  ],
};

export const termsEn: LegalDocument = {
  title: "Terms of Use",
  updated: "Last updated: 28 September 2026 (draft)",
  intro:
    "These terms govern the use of the HomeTest app and website. By creating an account you accept them. They explain what HomeTest is and what it is not.",
  sections: [
    { title: "1. Service provider", paragraphs: [CONTROLLER_EN] },
    {
      title: "2. What HomeTest is (and is not)",
      paragraphs: [
        "HomeTest helps you record, organise and understand your lab tests, measurements and habits, and share them with professionals.",
        "HomeTest does NOT provide healthcare, does NOT make diagnoses and does NOT replace a doctor. Information and recommendations in the app are for general wellbeing guidance only.",
        "In a medical emergency, call 112.",
        "Values automatically extracted from documents and photos may contain errors: check them and, if in doubt, refer to the original report and your doctor.",
      ],
    },
    {
      title: "3. Your account",
      paragraphs: [
        "You must be 18 or over, provide accurate information and keep your password safe. You are responsible for activity on your account.",
        "You can delete your account at any time; your data will be erased as described in the Privacy Policy.",
      ],
    },
    {
      title: "4. Professionals",
      paragraphs: [
        "Professionals on HomeTest are independent. HomeTest verifies their identity and registration before listing them and reviews their rates, but the care relationship is directly between you and the professional, who is solely responsible for their professional acts.",
        "Professionals can only see the data you share with them, while the permission is active, and can never modify it.",
        "If you are a professional, you agree that your profile is accurate, that you are registered and licensed to practise, and that you will handle patient data in line with the GDPR and your professional code of conduct.",
      ],
    },
    {
      title: "5. Acceptable use",
      paragraphs: [
        "You may not use HomeTest for unlawful purposes, upload other people's data without their consent, try to access data that is not yours, or interfere with the operation or security of the service.",
      ],
    },
    {
      title: "6. Price and current stage",
      paragraphs: [
        "HomeTest is in a testing phase and is free to use. Before any service becomes paid, we will inform you of the price and terms, and you will only be charged if you expressly subscribe. As a consumer, you will have the statutory right of withdrawal.",
      ],
    },
    {
      title: "7. Intellectual property",
      paragraphs: [
        "The app, website and their content belong to HomeTest or its licensors. Your data is yours: you only allow us to process it to provide the service.",
      ],
    },
    {
      title: "8. Liability",
      paragraphs: [
        "We work to keep HomeTest running continuously and securely, but cannot guarantee it will be free of interruptions or errors. HomeTest is not liable for health decisions made solely on the basis of in-app information without consulting a professional. Nothing here limits your statutory consumer rights.",
      ],
    },
    {
      title: "9. Suspension",
      paragraphs: [
        "We may suspend or close accounts that breach these terms, with notice unless the law or the security of the service prevents it.",
      ],
    },
    {
      title: "10. Changes",
      paragraphs: [
        "If we materially change these terms, we will notify you in the app in advance. If you do not agree, you can delete your account.",
      ],
    },
    {
      title: "11. Governing law",
      paragraphs: ["These terms are governed by Spanish law. If you are a consumer, the courts of your place of residence have jurisdiction."],
    },
  ],
};
