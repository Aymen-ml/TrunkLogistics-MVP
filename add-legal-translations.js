import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const enPath = path.join(__dirname, 'client/src/i18n/locales/en.json');
const frPath = path.join(__dirname, 'client/src/i18n/locales/fr.json');

const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const fr = JSON.parse(fs.readFileSync(frPath, 'utf8'));

// Add legal page translations
en.legal = {
  backToHome: "Back to Home",
  lastUpdated: "Last updated",
  
  about: {
    title: "About Us",
    subtitle: "Connecting businesses with trusted logistics providers across South Algeria",
    mission: {
      title: "Our Mission",
      description1: "movelinker is dedicated to revolutionizing the logistics industry in South Algeria by creating a seamless, transparent, and efficient platform that connects businesses with verified truck providers. We believe in empowering both customers and providers through technology, making logistics accessible, reliable, and growth-oriented.",
      description2: "Our platform bridges the gap between supply and demand, ensuring that every shipment reaches its destination safely and on time while providing providers with the tools they need to grow their business."
    },
    whatWeDo: {
      title: "What We Do",
      transport: {
        title: "Transport Services",
        description: "Connect businesses with verified truck providers for safe and reliable transportation of goods across South Algeria."
      },
      fleet: {
        title: "Fleet Management",
        description: "Empower truck providers with tools to manage their fleet, track bookings, and grow their business."
      },
      platform: {
        title: "Digital Platform",
        description: "Provide a user-friendly platform with real-time tracking, transparent pricing, and seamless booking experience."
      }
    },
    whyChoose: {
      title: "Why Choose movelinker?",
      verified: {
        title: "Verified Providers",
        description: "All truck providers undergo thorough verification and document checks"
      },
      transparent: {
        title: "Transparent Pricing",
        description: "Clear, upfront pricing with no hidden fees or surprises"
      },
      reliable: {
        title: "Reliable Service",
        description: "Real-time tracking and professional support throughout your journey"
      },
      growth: {
        title: "Growth Focused",
        description: "Tools and insights to help businesses and providers scale efficiently"
      }
    },
    commitment: {
      title: "Our Commitment",
      description: "We are committed to building the most trusted and efficient logistics platform in South Algeria. Through continuous innovation, customer-first approach, and unwavering dedication to quality, we aim to transform how businesses and truck providers connect and collaborate."
    },
    contact: {
      title: "Get in Touch",
      description: "Have questions or want to learn more? We'd love to hear from you."
    }
  },
  
  terms: {
    title: "Terms of Use",
    subtitle: "Last updated: October 27, 2025",
    intro1: "Welcome to movelinker. These Terms of Use (\"Terms\") govern your access to and use of our platform, services, and features. By accessing or using movelinker, you agree to be bound by these Terms.",
    intro2: "Please read these Terms carefully before using our platform. If you do not agree with these Terms, you must not use our services.",
    acceptance: {
      title: "1. Acceptance of Terms",
      description: "By creating an account or using movelinker, you acknowledge that you have read, understood, and agree to be bound by these Terms. You also agree to comply with all applicable laws and regulations. To use our services, you must:",
      list: [
        "Be at least 18 years old or the age of majority in your jurisdiction",
        "Have the legal capacity to enter into binding contracts",
        "You agree to these Terms and our Privacy Policy",
        "Provide accurate and complete information during registration"
      ]
    },
    services: {
      title: "2. Description of Services",
      description: "movelinker provides a digital platform that:",
      list: [
        "Connects businesses (\"Customers\") with truck service providers (\"Providers\")",
        "Facilitates booking and management of transportation services",
        "Provides tools for fleet management and analytics",
        "Offers real-time tracking and communication features"
      ],
      note: "We do not own or operate any trucks. We are an intermediary platform connecting Customers with independent Providers."
    },
    accounts: {
      title: "3. User Accounts",
      registration: {
        title: "3.1 Account Registration",
        description: "To access certain features, you must create an account. You agree to:",
        list: [
          "Provide accurate, current, and complete information",
          "Maintain and update your information to keep it accurate",
          "Maintain the security of your account credentials",
          "Notify us immediately of any unauthorized access",
          "Be responsible for all activities under your account"
        ]
      },
      types: {
        title: "3.2 Account Types",
        customer: "Customer Account: For businesses seeking transportation services",
        provider: "Provider Account: For truck owners/operators offering services (subject to verification)",
        admin: "Administrator Account: For platform management (by invitation only)"
      },
      verification: {
        title: "3.3 Verification",
        description: "Provider accounts require verification before activation. We reserve the right to:",
        list: [
          "Request additional documentation or information",
          "Verify the authenticity of submitted documents",
          "Approve or reject applications at our discretion",
          "Suspend or terminate accounts that fail verification"
        ]
      }
    },
    conduct: {
      title: "4. User Conduct and Prohibited Activities",
      description: "You agree not to:",
      list: [
        "Violate any laws, regulations, or third-party rights",
        "Provide false, misleading, or fraudulent information",
        "Impersonate any person or entity",
        "Interfere with or disrupt the platform or servers",
        "Attempt to gain unauthorized access to any part of the platform",
        "Use automated systems (bots, scrapers) without permission",
        "Harass, abuse, or harm other users",
        "Post or transmit malicious code or content",
        "Use the platform for any illegal or unauthorized purpose",
        "Circumvent any security features or access controls"
      ]
    },
    bookings: {
      title: "5. Bookings and Transactions",
      process: {
        title: "5.1 Booking Process",
        list: [
          "Customers can search and book available trucks through the platform",
          "Providers can accept or decline booking requests",
          "All bookings are subject to Provider availability and approval",
          "Prices are determined by Providers and displayed before confirmation"
        ]
      },
      payment: {
        title: "5.2 Payment",
        list: [
          "Payment terms are agreed upon between Customers and Providers",
          "movelinker may facilitate payments but is not responsible for payment disputes",
          "All fees and charges must be paid in accordance with agreed terms",
          "Refund policies are determined by individual Providers"
        ]
      },
      cancellation: {
        title: "5.3 Cancellation",
        list: [
          "Cancellation policies vary by Provider",
          "Customers may be subject to cancellation fees",
          "Providers must honor confirmed bookings or face penalties",
          "We reserve the right to cancel bookings in case of fraud or violation"
        ]
      }
    },
    liability: {
      title: "6. Limitation of Liability",
      description: "To the maximum extent permitted by law:",
      list: [
        "movelinker is a platform connecting Customers and Providers",
        "We are not responsible for the quality, safety, or legality of services provided",
        "We are not liable for any direct, indirect, incidental, or consequential damages",
        "Our total liability shall not exceed the fees paid by you in the past 12 months",
        "We do not guarantee uninterrupted or error-free service",
        "Providers are independent contractors, not employees or agents of movelinker"
      ]
    },
    intellectual: {
      title: "7. Intellectual Property",
      description: "All content, features, and functionality on movelinker are owned by us or our licensors and protected by copyright, trademark, and other intellectual property laws. You may not:",
      list: [
        "Copy, modify, or create derivative works",
        "Distribute, sell, or lease any part of the platform",
        "Reverse engineer or attempt to extract source code",
        "Remove or modify any copyright or proprietary notices",
        "Use our trademarks without prior written permission"
      ]
    },
    termination: {
      title: "8. Termination",
      description: "We may suspend or terminate your account:",
      list: [
        "For violation of these Terms",
        "For fraudulent or illegal activity",
        "At your request",
        "For extended inactivity",
        "At our discretion with or without notice"
      ],
      note: "Upon termination, your right to use the platform will immediately cease. We may retain certain information as required by law."
    },
    changes: {
      title: "9. Changes to Terms",
      description: "We reserve the right to modify these Terms at any time. We will notify you of material changes by:",
      list: [
        "Posting the updated Terms on our platform",
        "Sending an email to your registered address",
        "Displaying a notice on the platform"
      ],
      note: "Your continued use of movelinker after changes become effective constitutes acceptance of the new Terms."
    },
    governing: {
      title: "10. Governing Law",
      description: "These Terms shall be governed by and construed in accordance with the laws of Algeria, without regard to its conflict of law provisions. Any disputes arising from these Terms shall be subject to the exclusive jurisdiction of the courts of Algiers, Algeria."
    },
    contact: {
      title: "Contact Us",
      description: "If you have any questions about these Terms of Use, please contact us:"
    }
  },
  
  privacy: {
    title: "Privacy Policy",
    subtitle: "Last updated: October 27, 2025",
    intro1: "At movelinker, we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.",
    intro2: "By using movelinker, you agree to the collection and use of information in accordance with this policy.",
    collection: {
      title: "1. Information We Collect",
      personal: {
        title: "1.1 Personal Information",
        description: "When you create an account or use our services, we may collect:",
        list: [
          "Name, email address, and phone number",
          "Company name and business information",
          "Physical address and contact details",
          "Government-issued identification for verification",
          "Payment and billing information"
        ]
      },
      usage: {
        title: "1.2 Usage Information",
        description: "We automatically collect information about how you use our platform:",
        list: [
          "IP address and device information",
          "Browser type and operating system",
          "Pages visited and features used",
          "Date and time of access",
          "Referring website addresses"
        ]
      },
      location: {
        title: "1.3 Location Information",
        description: "We may collect location data to:",
        list: [
          "Provide location-based services",
          "Match Customers with nearby Providers",
          "Track shipments in real-time",
          "Improve our services and recommendations"
        ]
      }
    },
    usage: {
      title: "2. How We Use Your Information",
      description: "We use collected information to:",
      list: [
        "Provide, operate, and maintain our platform",
        "Process bookings and facilitate transactions",
        "Verify Provider credentials and documents",
        "Send notifications about bookings and updates",
        "Respond to your requests and provide customer support",
        "Analyze usage patterns and improve our services",
        "Detect and prevent fraud or unauthorized activity",
        "Comply with legal obligations",
        "Send marketing communications (with your consent)"
      ]
    },
    sharing: {
      title: "3. Information Sharing and Disclosure",
      description: "We may share your information with:",
      providers: {
        title: "3.1 Service Providers",
        description: "Third-party vendors who assist us with:",
        list: [
          "Payment processing",
          "Data analytics and insights",
          "Cloud storage and hosting",
          "Email and communication services",
          "Customer support tools"
        ]
      },
      users: {
        title: "3.2 Other Users",
        description: "We share limited information to facilitate services:",
        list: [
          "Customers can view Provider profiles and verification status",
          "Providers can view Customer contact information for confirmed bookings",
          "Users can view ratings and reviews"
        ]
      },
      legal: {
        title: "3.3 Legal Requirements",
        description: "We may disclose information when required to:",
        list: [
          "Comply with legal obligations or court orders",
          "Protect our rights, property, or safety",
          "Prevent fraud or security threats",
          "Enforce our Terms of Use"
        ]
      }
    },
    security: {
      title: "4. Data Security",
      description: "We implement appropriate technical and organizational measures to protect your information:",
      list: [
        "Encryption of data in transit and at rest",
        "Regular security assessments and audits",
        "Access controls and authentication",
        "Employee training on data protection",
        "Incident response procedures"
      ],
      note: "However, no method of transmission over the Internet is 100% secure. We cannot guarantee absolute security."
    },
    retention: {
      title: "5. Data Retention",
      description: "We retain your information for as long as necessary to:",
      list: [
        "Provide our services to you",
        "Comply with legal obligations",
        "Resolve disputes and enforce agreements",
        "Maintain business records"
      ],
      note: "When you delete your account, we will delete or anonymize your personal information, except where retention is required by law."
    },
    rights: {
      title: "6. Your Rights",
      description: "You have the right to:",
      list: [
        "Access your personal information",
        "Correct inaccurate or incomplete data",
        "Request deletion of your data",
        "Object to processing of your information",
        "Withdraw consent for marketing communications",
        "Data portability (receive your data in a structured format)",
        "Lodge a complaint with a supervisory authority"
      ],
      note: "To exercise these rights, please contact us using the information provided below."
    },
    cookies: {
      title: "7. Cookies and Tracking",
      description: "We use cookies and similar technologies to:",
      list: [
        "Remember your preferences and settings",
        "Analyze site traffic and usage patterns",
        "Personalize your experience",
        "Provide targeted advertising"
      ],
      note: "You can control cookies through your browser settings. However, disabling cookies may limit your ability to use certain features."
    },
    children: {
      title: "8. Children's Privacy",
      description: "Our services are not intended for individuals under 18 years of age. We do not knowingly collect personal information from children. If you become aware that a child has provided us with personal information, please contact us immediately."
    },
    changes: {
      title: "9. Changes to This Privacy Policy",
      description: "We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the \"Last updated\" date. You are advised to review this Privacy Policy periodically for any changes."
    },
    contact: {
      title: "Contact Us",
      description: "If you have any questions about this Privacy Policy, please contact us:"
    }
  },
  
  cookie: {
    title: "Cookie Policy",
    subtitle: "Last updated: October 27, 2025",
    intro: "This Cookie Policy explains how movelinker uses cookies and similar technologies to recognize you when you visit our platform. It explains what these technologies are and why we use them, as well as your rights to control our use of them.",
    what: {
      title: "1. What Are Cookies?",
      description: "Cookies are small text files that are placed on your device when you visit a website. They are widely used to make websites work more efficiently, provide information to website owners, and improve user experience."
    },
    types: {
      title: "2. Types of Cookies We Use",
      essential: {
        title: "2.1 Essential Cookies",
        description: "These cookies are necessary for the platform to function properly. They enable basic functions like:",
        list: [
          "User authentication and security",
          "Session management",
          "Load balancing",
          "Remembering your preferences"
        ],
        note: "These cookies cannot be disabled as they are essential for the platform to work."
      },
      performance: {
        title: "2.2 Performance Cookies",
        description: "These cookies help us understand how visitors interact with our platform by collecting and reporting information anonymously. They help us:",
        list: [
          "Count visits and traffic sources",
          "Measure and improve platform performance",
          "Identify popular pages and features",
          "Understand navigation patterns"
        ]
      },
      functional: {
        title: "2.3 Functional Cookies",
        description: "These cookies enable enhanced functionality and personalization, such as:",
        list: [
          "Remembering your language preference",
          "Storing your dark/light mode selection",
          "Saving your location settings",
          "Customizing content based on your preferences"
        ]
      },
      targeting: {
        title: "2.4 Targeting/Advertising Cookies",
        description: "These cookies may be set by our advertising partners to:",
        list: [
          "Build a profile of your interests",
          "Show relevant advertisements",
          "Measure advertising effectiveness",
          "Limit how many times you see an ad"
        ]
      }
    },
    thirdParty: {
      title: "3. Third-Party Cookies",
      description: "In addition to our own cookies, we may use third-party cookies to:",
      list: [
        "Analyze platform usage (e.g., Google Analytics)",
        "Provide social media features",
        "Deliver targeted advertising",
        "Enable payment processing"
      ],
      note: "These third parties have their own privacy policies, and we have no control over their cookies."
    },
    control: {
      title: "4. How to Control Cookies",
      browser: {
        title: "4.1 Browser Controls",
        description: "Most browsers allow you to:",
        list: [
          "View and delete cookies",
          "Block cookies from specific websites",
          "Block all cookies",
          "Delete all cookies when you close your browser"
        ],
        note: "Note that disabling cookies may affect the functionality of our platform and many other websites."
      },
      preferences: {
        title: "4.2 Cookie Preferences",
        description: "You can manage your cookie preferences by:",
        list: [
          "Using the cookie banner when you first visit our platform",
          "Accessing your account settings",
          "Contacting us directly"
        ]
      }
    },
    doNotTrack: {
      title: "5. Do Not Track Signals",
      description: "Some browsers include a \"Do Not Track\" (DNT) feature that signals to websites that you do not want to be tracked. Currently, there is no universal standard for how to respond to DNT signals. As such, we do not currently respond to DNT browser signals."
    },
    updates: {
      title: "6. Updates to This Policy",
      description: "We may update this Cookie Policy from time to time to reflect changes in technology, legislation, or our business operations. We will notify you of any material changes by posting the updated policy on our platform."
    },
    contact: {
      title: "Contact Us",
      description: "If you have questions about our use of cookies, please contact us:"
    }
  },
  
  contactInfo: {
    email: "Email",
    phone: "Phone",
    location: "Location"
  }
};

fr.legal = {
  backToHome: "Retour à l'accueil",
  lastUpdated: "Dernière mise à jour",
  
  about: {
    title: "À Propos de Nous",
    subtitle: "Connecter les entreprises aux transporteurs de confiance à travers le sud de l'Algérie",
    mission: {
      title: "Notre Mission",
      description1: "movelinker se consacre à révolutionner l'industrie logistique dans le sud de l'Algérie en créant une plateforme transparente et efficace qui connecte les entreprises aux transporteurs vérifiés. Nous croyons en l'autonomisation des clients et des prestataires grâce à la technologie, rendant la logistique accessible, fiable et orientée vers la croissance.",
      description2: "Notre plateforme comble le fossé entre l'offre et la demande, garantissant que chaque expédition atteint sa destination en toute sécurité et à temps tout en fournissant aux prestataires les outils dont ils ont besoin pour développer leur activité."
    },
    whatWeDo: {
      title: "Ce Que Nous Faisons",
      transport: {
        title: "Services de Transport",
        description: "Connecter les entreprises avec des transporteurs vérifiés pour un transport sûr et fiable des marchandises à travers le sud de l'Algérie."
      },
      fleet: {
        title: "Gestion de Flotte",
        description: "Donner aux transporteurs les outils pour gérer leur flotte, suivre les réservations et développer leur activité."
      },
      platform: {
        title: "Plateforme Digitale",
        description: "Fournir une plateforme conviviale avec suivi en temps réel, tarification transparente et expérience de réservation fluide."
      }
    },
    whyChoose: {
      title: "Pourquoi Choisir movelinker ?",
      verified: {
        title: "Transporteurs Vérifiés",
        description: "Tous les transporteurs font l'objet d'une vérification approfondie et de contrôles de documents"
      },
      transparent: {
        title: "Tarification Transparente",
        description: "Prix clairs et directs sans frais cachés ni surprises"
      },
      reliable: {
        title: "Service Fiable",
        description: "Suivi en temps réel et support professionnel tout au long de votre parcours"
      },
      growth: {
        title: "Axé sur la Croissance",
        description: "Outils et informations pour aider les entreprises et les prestataires à évoluer efficacement"
      }
    },
    commitment: {
      title: "Notre Engagement",
      description: "Nous nous engageons à construire la plateforme logistique la plus fiable et la plus efficace du sud de l'Algérie. Grâce à l'innovation continue, notre approche centrée sur le client et notre dévouement inébranlable à la qualité, nous visons à transformer la façon dont les entreprises et les transporteurs se connectent et collaborent."
    },
    contact: {
      title: "Contactez-nous",
      description: "Des questions ou vous voulez en savoir plus ? Nous serions ravis de vous entendre."
    }
  },
  
  terms: {
    title: "Conditions d'Utilisation",
    subtitle: "Dernière mise à jour : 27 octobre 2025",
    intro1: "Bienvenue sur movelinker. Ces Conditions d'Utilisation (\"Conditions\") régissent votre accès et votre utilisation de notre plateforme, services et fonctionnalités. En accédant ou en utilisant movelinker, vous acceptez d'être lié par ces Conditions.",
    intro2: "Veuillez lire attentivement ces Conditions avant d'utiliser notre plateforme. Si vous n'acceptez pas ces Conditions, vous ne devez pas utiliser nos services.",
    acceptance: {
      title: "1. Acceptation des Conditions",
      description: "En créant un compte ou en utilisant movelinker, vous reconnaissez avoir lu, compris et accepté d'être lié par ces Conditions. Vous acceptez également de vous conformer à toutes les lois et règlements applicables. Pour utiliser nos services, vous devez :",
      list: [
        "Avoir au moins 18 ans ou l'âge de la majorité dans votre juridiction",
        "Avoir la capacité juridique de conclure des contrats contraignants",
        "Accepter ces Conditions et notre Politique de Confidentialité",
        "Fournir des informations exactes et complètes lors de l'inscription"
      ]
    },
    services: {
      title: "2. Description des Services",
      description: "movelinker fournit une plateforme numérique qui :",
      list: [
        "Connecte les entreprises (\"Clients\") avec les prestataires de services de camionnage (\"Prestataires\")",
        "Facilite la réservation et la gestion des services de transport",
        "Fournit des outils pour la gestion de flotte et l'analytique",
        "Offre des fonctionnalités de suivi en temps réel et de communication"
      ],
      note: "Nous ne possédons ni n'exploitons de camions. Nous sommes une plateforme intermédiaire reliant les Clients aux Prestataires indépendants."
    },
    accounts: {
      title: "3. Comptes Utilisateurs",
      registration: {
        title: "3.1 Inscription au Compte",
        description: "Pour accéder à certaines fonctionnalités, vous devez créer un compte. Vous acceptez de :",
        list: [
          "Fournir des informations exactes, actuelles et complètes",
          "Maintenir et mettre à jour vos informations pour les garder exactes",
          "Maintenir la sécurité des identifiants de votre compte",
          "Nous informer immédiatement de tout accès non autorisé",
          "Être responsable de toutes les activités sous votre compte"
        ]
      },
      types: {
        title: "3.2 Types de Comptes",
        customer: "Compte Client : Pour les entreprises cherchant des services de transport",
        provider: "Compte Prestataire : Pour les propriétaires/opérateurs de camions offrant des services (sous réserve de vérification)",
        admin: "Compte Administrateur : Pour la gestion de la plateforme (sur invitation uniquement)"
      },
      verification: {
        title: "3.3 Vérification",
        description: "Les comptes Prestataire nécessitent une vérification avant activation. Nous nous réservons le droit de :",
        list: [
          "Demander des documents ou informations supplémentaires",
          "Vérifier l'authenticité des documents soumis",
          "Approuver ou rejeter les candidatures à notre discrétion",
          "Suspendre ou résilier les comptes qui échouent à la vérification"
        ]
      }
    },
    conduct: {
      title: "4. Conduite des Utilisateurs et Activités Interdites",
      description: "Vous acceptez de ne pas :",
      list: [
        "Violer les lois, règlements ou droits de tiers",
        "Fournir des informations fausses, trompeuses ou frauduleuses",
        "Usurper l'identité de toute personne ou entité",
        "Interférer avec ou perturber la plateforme ou les serveurs",
        "Tenter d'obtenir un accès non autorisé à toute partie de la plateforme",
        "Utiliser des systèmes automatisés (bots, scrapers) sans autorisation",
        "Harceler, abuser ou nuire à d'autres utilisateurs",
        "Publier ou transmettre du code ou du contenu malveillant",
        "Utiliser la plateforme à des fins illégales ou non autorisées",
        "Contourner les fonctionnalités de sécurité ou les contrôles d'accès"
      ]
    },
    bookings: {
      title: "5. Réservations et Transactions",
      process: {
        title: "5.1 Processus de Réservation",
        list: [
          "Les Clients peuvent rechercher et réserver des camions disponibles via la plateforme",
          "Les Prestataires peuvent accepter ou refuser les demandes de réservation",
          "Toutes les réservations sont soumises à la disponibilité et à l'approbation du Prestataire",
          "Les prix sont déterminés par les Prestataires et affichés avant confirmation"
        ]
      },
      payment: {
        title: "5.2 Paiement",
        list: [
          "Les conditions de paiement sont convenues entre les Clients et les Prestataires",
          "movelinker peut faciliter les paiements mais n'est pas responsable des litiges de paiement",
          "Tous les frais et charges doivent être payés conformément aux conditions convenues",
          "Les politiques de remboursement sont déterminées par les Prestataires individuels"
        ]
      },
      cancellation: {
        title: "5.3 Annulation",
        list: [
          "Les politiques d'annulation varient selon le Prestataire",
          "Les Clients peuvent être soumis à des frais d'annulation",
          "Les Prestataires doivent honorer les réservations confirmées ou faire face à des pénalités",
          "Nous nous réservons le droit d'annuler les réservations en cas de fraude ou de violation"
        ]
      }
    },
    liability: {
      title: "6. Limitation de Responsabilité",
      description: "Dans la mesure maximale permise par la loi :",
      list: [
        "movelinker est une plateforme reliant les Clients et les Prestataires",
        "Nous ne sommes pas responsables de la qualité, sécurité ou légalité des services fournis",
        "Nous ne sommes pas responsables des dommages directs, indirects, accessoires ou consécutifs",
        "Notre responsabilité totale ne dépassera pas les frais que vous avez payés au cours des 12 derniers mois",
        "Nous ne garantissons pas un service ininterrompu ou sans erreur",
        "Les Prestataires sont des entrepreneurs indépendants, pas des employés ou agents de movelinker"
      ]
    },
    intellectual: {
      title: "7. Propriété Intellectuelle",
      description: "Tout le contenu, les fonctionnalités et les fonctions sur movelinker sont notre propriété ou celle de nos concédants de licence et sont protégés par les lois sur les droits d'auteur, les marques et autres lois sur la propriété intellectuelle. Vous ne pouvez pas :",
      list: [
        "Copier, modifier ou créer des œuvres dérivées",
        "Distribuer, vendre ou louer toute partie de la plateforme",
        "Faire de l'ingénierie inverse ou tenter d'extraire le code source",
        "Supprimer ou modifier les avis de droits d'auteur ou propriétaires",
        "Utiliser nos marques sans autorisation écrite préalable"
      ]
    },
    termination: {
      title: "8. Résiliation",
      description: "Nous pouvons suspendre ou résilier votre compte :",
      list: [
        "Pour violation de ces Conditions",
        "Pour activité frauduleuse ou illégale",
        "À votre demande",
        "Pour inactivité prolongée",
        "À notre discrétion avec ou sans préavis"
      ],
      note: "Après la résiliation, votre droit d'utiliser la plateforme cessera immédiatement. Nous pouvons conserver certaines informations comme l'exige la loi."
    },
    changes: {
      title: "9. Modifications des Conditions",
      description: "Nous nous réservons le droit de modifier ces Conditions à tout moment. Nous vous informerons des changements importants en :",
      list: [
        "Publiant les Conditions mises à jour sur notre plateforme",
        "Envoyant un email à votre adresse enregistrée",
        "Affichant un avis sur la plateforme"
      ],
      note: "Votre utilisation continue de movelinker après l'entrée en vigueur des modifications constitue l'acceptation des nouvelles Conditions."
    },
    governing: {
      title: "10. Loi Applicable",
      description: "Ces Conditions sont régies et interprétées conformément aux lois de l'Algérie, sans égard à ses dispositions en matière de conflit de lois. Tout litige découlant de ces Conditions sera soumis à la juridiction exclusive des tribunaux d'Alger, Algérie."
    },
    contact: {
      title: "Contactez-nous",
      description: "Si vous avez des questions concernant ces Conditions d'Utilisation, veuillez nous contacter :"
    }
  },
  
  privacy: {
    title: "Politique de Confidentialité",
    subtitle: "Dernière mise à jour : 27 octobre 2025",
    intro1: "Chez movelinker, nous nous engageons à protéger votre vie privée et à assurer la sécurité de vos informations personnelles. Cette Politique de Confidentialité explique comment nous collectons, utilisons, divulguons et protégeons vos informations lorsque vous utilisez notre plateforme.",
    intro2: "En utilisant movelinker, vous acceptez la collecte et l'utilisation des informations conformément à cette politique.",
    collection: {
      title: "1. Informations Que Nous Collectons",
      personal: {
        title: "1.1 Informations Personnelles",
        description: "Lorsque vous créez un compte ou utilisez nos services, nous pouvons collecter :",
        list: [
          "Nom, adresse e-mail et numéro de téléphone",
          "Nom de l'entreprise et informations commerciales",
          "Adresse physique et coordonnées",
          "Pièce d'identité émise par le gouvernement pour vérification",
          "Informations de paiement et de facturation"
        ]
      },
      usage: {
        title: "1.2 Informations d'Utilisation",
        description: "Nous collectons automatiquement des informations sur la façon dont vous utilisez notre plateforme :",
        list: [
          "Adresse IP et informations sur l'appareil",
          "Type de navigateur et système d'exploitation",
          "Pages visitées et fonctionnalités utilisées",
          "Date et heure d'accès",
          "Adresses de sites Web de référence"
        ]
      },
      location: {
        title: "1.3 Informations de Localisation",
        description: "Nous pouvons collecter des données de localisation pour :",
        list: [
          "Fournir des services basés sur la localisation",
          "Associer les Clients avec les Prestataires à proximité",
          "Suivre les expéditions en temps réel",
          "Améliorer nos services et recommandations"
        ]
      }
    },
    usage: {
      title: "2. Comment Nous Utilisons Vos Informations",
      description: "Nous utilisons les informations collectées pour :",
      list: [
        "Fournir, exploiter et maintenir notre plateforme",
        "Traiter les réservations et faciliter les transactions",
        "Vérifier les identifiants et documents des Prestataires",
        "Envoyer des notifications sur les réservations et mises à jour",
        "Répondre à vos demandes et fournir un support client",
        "Analyser les modèles d'utilisation et améliorer nos services",
        "Détecter et prévenir la fraude ou l'activité non autorisée",
        "Se conformer aux obligations légales",
        "Envoyer des communications marketing (avec votre consentement)"
      ]
    },
    sharing: {
      title: "3. Partage et Divulgation d'Informations",
      description: "Nous pouvons partager vos informations avec :",
      providers: {
        title: "3.1 Fournisseurs de Services",
        description: "Des tiers qui nous aident avec :",
        list: [
          "Traitement des paiements",
          "Analyse de données et insights",
          "Stockage et hébergement cloud",
          "Services d'e-mail et de communication",
          "Outils de support client"
        ]
      },
      users: {
        title: "3.2 Autres Utilisateurs",
        description: "Nous partageons des informations limitées pour faciliter les services :",
        list: [
          "Les Clients peuvent voir les profils des Prestataires et leur statut de vérification",
          "Les Prestataires peuvent voir les coordonnées des Clients pour les réservations confirmées",
          "Les utilisateurs peuvent voir les évaluations et avis"
        ]
      },
      legal: {
        title: "3.3 Exigences Légales",
        description: "Nous pouvons divulguer des informations lorsque cela est requis pour :",
        list: [
          "Se conformer aux obligations légales ou aux ordonnances judiciaires",
          "Protéger nos droits, propriété ou sécurité",
          "Prévenir la fraude ou les menaces de sécurité",
          "Faire respecter nos Conditions d'Utilisation"
        ]
      }
    },
    security: {
      title: "4. Sécurité des Données",
      description: "Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos informations :",
      list: [
        "Chiffrement des données en transit et au repos",
        "Évaluations et audits de sécurité réguliers",
        "Contrôles d'accès et authentification",
        "Formation des employés sur la protection des données",
        "Procédures de réponse aux incidents"
      ],
      note: "Cependant, aucune méthode de transmission sur Internet n'est 100% sécurisée. Nous ne pouvons garantir une sécurité absolue."
    },
    retention: {
      title: "5. Conservation des Données",
      description: "Nous conservons vos informations aussi longtemps que nécessaire pour :",
      list: [
        "Vous fournir nos services",
        "Se conformer aux obligations légales",
        "Résoudre les litiges et faire respecter les accords",
        "Maintenir les dossiers commerciaux"
      ],
      note: "Lorsque vous supprimez votre compte, nous supprimerons ou anonymiserons vos informations personnelles, sauf si la conservation est requise par la loi."
    },
    rights: {
      title: "6. Vos Droits",
      description: "Vous avez le droit de :",
      list: [
        "Accéder à vos informations personnelles",
        "Corriger les données inexactes ou incomplètes",
        "Demander la suppression de vos données",
        "Vous opposer au traitement de vos informations",
        "Retirer votre consentement pour les communications marketing",
        "Portabilité des données (recevoir vos données dans un format structuré)",
        "Déposer une plainte auprès d'une autorité de contrôle"
      ],
      note: "Pour exercer ces droits, veuillez nous contacter en utilisant les informations fournies ci-dessous."
    },
    cookies: {
      title: "7. Cookies et Suivi",
      description: "Nous utilisons des cookies et des technologies similaires pour :",
      list: [
        "Mémoriser vos préférences et paramètres",
        "Analyser le trafic et les modèles d'utilisation du site",
        "Personnaliser votre expérience",
        "Fournir de la publicité ciblée"
      ],
      note: "Vous pouvez contrôler les cookies via les paramètres de votre navigateur. Cependant, la désactivation des cookies peut limiter votre capacité à utiliser certaines fonctionnalités."
    },
    children: {
      title: "8. Confidentialité des Enfants",
      description: "Nos services ne sont pas destinés aux personnes de moins de 18 ans. Nous ne collectons pas sciemment d'informations personnelles auprès d'enfants. Si vous apprenez qu'un enfant nous a fourni des informations personnelles, veuillez nous contacter immédiatement."
    },
    changes: {
      title: "9. Modifications de Cette Politique de Confidentialité",
      description: "Nous pouvons mettre à jour cette Politique de Confidentialité de temps en temps. Nous vous informerons de tout changement en publiant la nouvelle Politique de Confidentialité sur cette page et en mettant à jour la date de \"Dernière mise à jour\". Il vous est conseillé de consulter périodiquement cette Politique de Confidentialité pour tout changement."
    },
    contact: {
      title: "Contactez-nous",
      description: "Si vous avez des questions concernant cette Politique de Confidentialité, veuillez nous contacter :"
    }
  },
  
  cookie: {
    title: "Politique des Cookies",
    subtitle: "Dernière mise à jour : 27 octobre 2025",
    intro: "Cette Politique des Cookies explique comment movelinker utilise les cookies et technologies similaires pour vous reconnaître lorsque vous visitez notre plateforme. Elle explique ce que sont ces technologies et pourquoi nous les utilisons, ainsi que vos droits de contrôler notre utilisation de celles-ci.",
    what: {
      title: "1. Qu'est-ce que les Cookies ?",
      description: "Les cookies sont de petits fichiers texte placés sur votre appareil lorsque vous visitez un site Web. Ils sont largement utilisés pour faire fonctionner les sites Web de manière plus efficace, fournir des informations aux propriétaires de sites Web et améliorer l'expérience utilisateur."
    },
    types: {
      title: "2. Types de Cookies Que Nous Utilisons",
      essential: {
        title: "2.1 Cookies Essentiels",
        description: "Ces cookies sont nécessaires au bon fonctionnement de la plateforme. Ils permettent des fonctions de base comme :",
        list: [
          "Authentification et sécurité de l'utilisateur",
          "Gestion de session",
          "Équilibrage de charge",
          "Mémorisation de vos préférences"
        ],
        note: "Ces cookies ne peuvent pas être désactivés car ils sont essentiels au fonctionnement de la plateforme."
      },
      performance: {
        title: "2.2 Cookies de Performance",
        description: "Ces cookies nous aident à comprendre comment les visiteurs interagissent avec notre plateforme en collectant et en rapportant des informations de manière anonyme. Ils nous aident à :",
        list: [
          "Compter les visites et sources de trafic",
          "Mesurer et améliorer les performances de la plateforme",
          "Identifier les pages et fonctionnalités populaires",
          "Comprendre les modèles de navigation"
        ]
      },
      functional: {
        title: "2.3 Cookies Fonctionnels",
        description: "Ces cookies permettent des fonctionnalités améliorées et une personnalisation, telles que :",
        list: [
          "Mémoriser votre préférence de langue",
          "Enregistrer votre sélection de mode sombre/clair",
          "Sauvegarder vos paramètres de localisation",
          "Personnaliser le contenu en fonction de vos préférences"
        ]
      },
      targeting: {
        title: "2.4 Cookies de Ciblage/Publicité",
        description: "Ces cookies peuvent être définis par nos partenaires publicitaires pour :",
        list: [
          "Construire un profil de vos intérêts",
          "Afficher des publicités pertinentes",
          "Mesurer l'efficacité de la publicité",
          "Limiter le nombre de fois où vous voyez une annonce"
        ]
      }
    },
    thirdParty: {
      title: "3. Cookies Tiers",
      description: "En plus de nos propres cookies, nous pouvons utiliser des cookies tiers pour :",
      list: [
        "Analyser l'utilisation de la plateforme (par ex., Google Analytics)",
        "Fournir des fonctionnalités de médias sociaux",
        "Diffuser de la publicité ciblée",
        "Permettre le traitement des paiements"
      ],
      note: "Ces tiers ont leurs propres politiques de confidentialité et nous n'avons aucun contrôle sur leurs cookies."
    },
    control: {
      title: "4. Comment Contrôler les Cookies",
      browser: {
        title: "4.1 Contrôles du Navigateur",
        description: "La plupart des navigateurs vous permettent de :",
        list: [
          "Voir et supprimer les cookies",
          "Bloquer les cookies de sites Web spécifiques",
          "Bloquer tous les cookies",
          "Supprimer tous les cookies lorsque vous fermez votre navigateur"
        ],
        note: "Notez que la désactivation des cookies peut affecter la fonctionnalité de notre plateforme et de nombreux autres sites Web."
      },
      preferences: {
        title: "4.2 Préférences de Cookies",
        description: "Vous pouvez gérer vos préférences de cookies en :",
        list: [
          "Utilisant la bannière de cookies lors de votre première visite sur notre plateforme",
          "Accédant à vos paramètres de compte",
          "Nous contactant directement"
        ]
      }
    },
    doNotTrack: {
      title: "5. Signaux Ne Pas Suivre",
      description: "Certains navigateurs incluent une fonctionnalité \"Ne Pas Suivre\" (DNT) qui signale aux sites Web que vous ne souhaitez pas être suivi. Actuellement, il n'existe pas de norme universelle sur la façon de répondre aux signaux DNT. Par conséquent, nous ne répondons actuellement pas aux signaux DNT du navigateur."
    },
    updates: {
      title: "6. Mises à Jour de Cette Politique",
      description: "Nous pouvons mettre à jour cette Politique des Cookies de temps en temps pour refléter les changements dans la technologie, la législation ou nos opérations commerciales. Nous vous informerons de tout changement important en publiant la politique mise à jour sur notre plateforme."
    },
    contact: {
      title: "Contactez-nous",
      description: "Si vous avez des questions sur notre utilisation des cookies, veuillez nous contacter :"
    }
  },
  
  contactInfo: {
    email: "E-mail",
    phone: "Téléphone",
    location: "Localisation"
  }
};

// Write back
fs.writeFileSync(enPath, JSON.stringify(en, null, 2), 'utf8');
fs.writeFileSync(frPath, JSON.stringify(fr, null, 2), 'utf8');

console.log('✅ Legal page translations added successfully!');
console.log('   Added "legal" section with:');
console.log('   - About Us');
console.log('   - Terms of Use');
console.log('   - Privacy Policy');
console.log('   - Cookie Policy');
console.log('\nRun: npm run i18n:validate to verify');
