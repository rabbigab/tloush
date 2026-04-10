interface CategoryContentData {
  guideTitle: string
  guideText: string
  priceRange: string
  glossary: { french: string; hebrew: string }[]
  faq: { question: string; answer: string }[]
}

export const CATEGORY_CONTENT: Record<string, CategoryContentData> = {
  plombier: {
    guideTitle: 'Comment choisir un plombier en Israel',
    guideText: `En Israel, les plombiers sont appeles "instalator" (אינסטלטור). Le marche n'est pas reglemente aussi strictement qu'en France, ce qui rend d'autant plus important de choisir un professionnel recommande.

Quelques conseils :
- Demandez toujours un devis ecrit avant l'intervention
- Verifiez qu'il a un numero d'Osek (independant enregistre)
- Les urgences (fuites, chauffe-eau) coutent plus cher le soir et le week-end
- Le calcaire est un probleme majeur en Israel — un bon plombier le sait`,
    priceRange: 'Appel de base : 250-450 NIS. Remplacement chauffe-eau solaire (doud shemesh) : 2,500-5,000 NIS. Debouchage : 300-800 NIS. Renovation salle de bain complete : 15,000-40,000 NIS.',
    glossary: [
      { french: 'Plombier', hebrew: 'אינסטלטור (instalator)' },
      { french: 'Fuite', hebrew: 'נזילה (nezila)' },
      { french: 'Chauffe-eau solaire', hebrew: 'דוד שמש (doud shemesh)' },
      { french: 'Robinet', hebrew: 'ברז (berez)' },
      { french: 'Tuyau', hebrew: 'צינור (tsinor)' },
      { french: 'Debouchage', hebrew: 'פתיחת סתימה (ptikhat stima)' },
    ],
    faq: [
      {
        question: 'Combien coute un plombier en Israel ?',
        answer: "Un appel de base coute entre 250 et 450 NIS + TVA. Les tarifs varient selon l'urgence (soir, Shabbat) et la complexite. Demandez toujours un devis avant l'intervention.",
      },
      {
        question: 'Un plombier peut-il intervenir pendant Shabbat ?',
        answer: "En cas d'urgence (fuite importante, inondation), oui. Attendez-vous a un supplement de 50-100%. En dehors des urgences, la plupart ne travaillent pas le Shabbat.",
      },
      {
        question: 'Quelle est la difference entre un plombier et un instalator ?',
        answer: "Aucune — \"instalator\" est simplement le terme hebreu pour plombier. C'est le meme metier.",
      },
      {
        question: "Comment verifier qu'un plombier est fiable en Israel ?",
        answer: "Verifiez qu'il a un numero d'Osek, demandez des references, et privilegiez les prestataires avec des avis verifies comme sur Tloush Recommande.",
      },
      {
        question: 'Que faire en cas de fuite urgente ?',
        answer: "Coupez l'arrivee d'eau (le robinet general est souvent sur le toit ou dans le local technique de l'immeuble). Appelez ensuite un plombier d'urgence.",
      },
    ],
  },

  electricien: {
    guideTitle: 'Comment choisir un electricien en Israel',
    guideText: `L'electricite en Israel fonctionne en 230V / 50Hz, comme en Europe. Le metier d'electricien est reglemente : un permis (rishion hashmalai) est obligatoire pour les travaux sur le reseau electrique.

Points importants :
- Exigez un electricien avec licence (חשמלאי מוסמך)
- Pour les gros travaux, un certificat de conformite (ishur) est obligatoire
- Le tableau electrique israelien est souvent different du francais
- Les prises israeliennes ont un format specifique (Type H)`,
    priceRange: 'Appel de base : 250-400 NIS. Installation tableau electrique : 2,000-5,000 NIS. Ajout de prises : 150-300 NIS par prise. Mise aux normes appartement : 3,000-8,000 NIS.',
    glossary: [
      { french: 'Electricien', hebrew: 'חשמלאי (hashmalai)' },
      { french: 'Prise electrique', hebrew: 'שקע (sheka)' },
      { french: 'Disjoncteur', hebrew: 'מפסק (mafsek)' },
      { french: 'Tableau electrique', hebrew: 'לוח חשמל (luakh hashmal)' },
      { french: 'Court-circuit', hebrew: 'קצר (katsar)' },
      { french: 'Licence', hebrew: 'רישיון חשמלאי (rishion hashmalai)' },
    ],
    faq: [
      {
        question: 'Les electriciens ont-ils besoin d\'une licence en Israel ?',
        answer: "Oui, c'est obligatoire. La profession est reglementee par la Loi sur l'electricite (חוק החשמל). Demandez a voir le permis avant toute intervention.",
      },
      {
        question: 'Combien coute un electricien en Israel ?',
        answer: "Un appel de base coute 250-400 NIS. L'ajout d'une prise coute 150-300 NIS. Un remplacement de tableau electrique peut aller de 2,000 a 5,000 NIS.",
      },
      {
        question: 'Puis-je utiliser mes appareils francais en Israel ?',
        answer: "Oui, la tension est la meme (230V). Vous aurez juste besoin d'un adaptateur de prise (Type H israelien). Pour les gros appareils, verifiez la frequence (50Hz, identique).",
      },
      {
        question: 'Faut-il un certificat de conformite ?',
        answer: "Pour les travaux importants (nouveau tableau, ajout de circuits), oui. L'electricien doit fournir un \"ishur hashmal\" (certificat de conformite electrique).",
      },
      {
        question: 'Que faire en cas de panne de courant ?',
        answer: "Verifiez d'abord le disjoncteur (mafsek). Si le probleme persiste, contactez la compagnie d'electricite (Hevrat Hashmal) au *103, ou un electricien agree.",
      },
    ],
  },

  peintre: {
    guideTitle: 'Comment choisir un peintre en Israel',
    guideText: `La peinture en Israel a ses specificites : le climat chaud et humide (surtout en bord de mer) impose des peintures adaptees. Le metier n'est pas reglemente, mais un bon peintre fait toute la difference.

Conseils :
- Demandez des photos de chantiers precedents
- Verifiez que le peintre prepare les murs (rebouchage, ponçage) avant de peindre
- La peinture anti-humidite est quasi-obligatoire dans les villes cotieres
- Prevoyez 2-3 couches pour un resultat durable`,
    priceRange: 'Peinture appartement 3 pieces : 3,000-6,000 NIS. Par metre carre : 25-50 NIS (murs), 35-70 NIS (plafond). Peinture exterieure : 40-80 NIS/m2.',
    glossary: [
      { french: 'Peintre', hebrew: 'צבעי (tsavai)' },
      { french: 'Peinture', hebrew: 'צבע (tseva)' },
      { french: 'Mur', hebrew: 'קיר (kir)' },
      { french: 'Plafond', hebrew: 'תקרה (tikra)' },
      { french: 'Enduit', hebrew: 'שפכטל (shpakhtel)' },
      { french: 'Rouleau', hebrew: 'רולר (roler)' },
    ],
    faq: [
      {
        question: 'Combien coute un peintre en Israel ?',
        answer: 'Un appartement 3 pieces coute entre 3,000 et 6,000 NIS selon la qualite de la peinture et la preparation des murs. Comptez 25-50 NIS par metre carre.',
      },
      {
        question: 'Quelle peinture choisir pour un appartement en Israel ?',
        answer: "Privilegiez la peinture acrylique lavable (au moins \"semi-brillant\"). En bord de mer, optez pour une peinture anti-humidite. La marque Tambour est la reference locale.",
      },
      {
        question: 'Combien de temps pour peindre un appartement ?',
        answer: 'Un appartement 3-4 pieces prend generalement 3-5 jours de travail, incluant la preparation des murs et 2-3 couches de peinture.',
      },
      {
        question: 'Faut-il vider l\'appartement avant ?',
        answer: "Idealement, oui. Sinon, le peintre deplacera les meubles au centre et les couvrira. Prevoyez un supplement de 200-500 NIS pour la protection.",
      },
      {
        question: 'Quand est-il preferable de peindre en Israel ?',
        answer: "Le printemps (mars-mai) et l'automne (sept-nov) sont ideaux. Evitez l'ete (la peinture seche trop vite) et l'hiver (humidite).",
      },
    ],
  },

  serrurier: {
    guideTitle: 'Comment choisir un serrurier en Israel',
    guideText: `Les serruriers en Israel sont appeles "manoula'i" (מנעולן). C'est un metier tres demande, surtout pour les urgences (porte claquee, serrure bloquee).

Attention aux arnaques :
- Les prix d'urgence (soir, Shabbat) sont souvent gonfles — demandez un prix ferme AVANT l'intervention
- Certains serruriers cassent la serrure inutilement pour en vendre une neuve
- Privilegiez les serruriers recommandes plutot que ceux trouves sur Google Ads`,
    priceRange: "Ouverture de porte simple : 250-500 NIS. Ouverture d'urgence (nuit/Shabbat) : 400-800 NIS. Changement de serrure : 300-800 NIS. Installation porte blindee : 2,000-6,000 NIS.",
    glossary: [
      { french: 'Serrurier', hebrew: "מנעולן (manoula'n)" },
      { french: 'Serrure', hebrew: "מנעול (man'oul)" },
      { french: 'Cle', hebrew: 'מפתח (mafteakh)' },
      { french: 'Porte blindee', hebrew: 'דלת פלדלת (delet pladalat)' },
      { french: 'Verrou', hebrew: 'בריח (briakh)' },
    ],
    faq: [
      {
        question: 'Combien coute un serrurier en Israel ?',
        answer: "Une ouverture de porte simple coute 250-500 NIS. Les urgences de nuit ou de Shabbat sont majorees (400-800 NIS). Demandez toujours le prix AVANT l'intervention.",
      },
      {
        question: 'Comment eviter les arnaques de serruriers ?',
        answer: "Ne prenez jamais le premier resultat Google Ads. Passez par des recommandations (Tloush, amis). Exigez un devis ferme au telephone avant de dire oui.",
      },
      {
        question: 'Faut-il changer la serrure apres un demenagement ?',
        answer: "Oui, c'est fortement recommande. L'ancien locataire ou proprietaire peut avoir des doubles. Comptez 300-800 NIS pour un changement complet.",
      },
      {
        question: 'Un serrurier peut-il ouvrir une porte sans la casser ?',
        answer: "Un bon serrurier peut ouvrir la plupart des serrures sans dommage. Mefiez-vous de ceux qui proposent systematiquement de casser et remplacer.",
      },
      {
        question: 'Les portes blindees sont-elles obligatoires en Israel ?',
        answer: "Non, mais elles sont tres courantes et recommandees, surtout au rez-de-chaussee. La plupart des appartements israeliens en ont une.",
      },
    ],
  },

  climatisation: {
    guideTitle: 'Comment choisir un technicien climatisation en Israel',
    guideText: `La climatisation est un essentiel en Israel — les etes depassent regulierement 35°C. Le marche est domine par les splits (mini-splits muraux). Un bon technicien fait la difference entre un appareil qui dure 15 ans et un qui tombe en panne apres 3 ans.

A savoir :
- L'entretien annuel est indispensable (nettoyage des filtres, verification du gaz)
- Les marques les plus populaires en Israel : Tadiran, Electra, Midea, Daikin
- Un "mazgan" mal installe consomme beaucoup plus d'electricite
- Prevoyez l'installation AVANT l'ete (les delais explosent en juin-juillet)`,
    priceRange: "Installation split 1 unite : 2,500-4,500 NIS (appareil inclus). Entretien annuel : 200-400 NIS. Recharge gaz : 300-600 NIS. Reparation carte electronique : 500-1,200 NIS.",
    glossary: [
      { french: 'Climatisation', hebrew: 'מזגן (mazgan)' },
      { french: 'Telecommande', hebrew: 'שלט (shelet)' },
      { french: 'Filtre', hebrew: 'פילטר (filter)' },
      { french: 'Chauffage', hebrew: 'חימום (khimum)' },
      { french: 'Unite exterieure', hebrew: 'מפוח (mapuakh)' },
      { french: 'Gaz refrigerant', hebrew: 'גז (gaz)' },
    ],
    faq: [
      {
        question: 'Combien coute une climatisation en Israel ?',
        answer: "L'installation d'un split mural (appareil + pose) coute 2,500-4,500 NIS. Un multi-split pour tout l'appartement : 8,000-15,000 NIS. L'entretien annuel coute 200-400 NIS.",
      },
      {
        question: 'Quand faut-il faire entretenir sa climatisation ?',
        answer: "Au moins une fois par an, idealement au printemps (avant l'ete). Nettoyez les filtres vous-meme tous les 2-3 mois. Un entretien professionnel inclut le nettoyage complet et la verification du gaz.",
      },
      {
        question: 'Quelle marque de climatisation choisir en Israel ?',
        answer: 'Tadiran et Electra sont les marques locales les plus populaires. Daikin et Midea sont des alternatives de qualite. Evitez les marques inconnues sans service apres-vente local.',
      },
      {
        question: 'Ma climatisation fait du bruit, que faire ?',
        answer: "Un bruit anormal peut indiquer : filtres encrassés (nettoyez-les), probleme de fixation de l'unite exterieure, ou manque de gaz. Faites intervenir un technicien.",
      },
      {
        question: "Peut-on chauffer avec la climatisation en Israel ?",
        answer: "Oui, la plupart des splits en Israel sont reversibles (froid et chaud). C'est meme le mode de chauffage le plus courant et le plus economique en Israel.",
      },
    ],
  },

  bricoleur: {
    guideTitle: 'Comment choisir un bricoleur en Israel',
    guideText: `En Israel, un bricoleur (handyman) est la solution ideale pour tous les petits travaux du quotidien : montage de meubles IKEA, fixation d'etageres, petites reparations, accrochage de tableaux, remplacement de poignees, etc. C'est souvent plus economique que de faire appel a un specialiste pour des taches simples.

Conseils :
- Un bon bricoleur est polyvalent : il sait faire un peu de tout (electricite legere, plomberie simple, peinture, assemblage)
- Pour les gros travaux (electricite sur le tableau, plomberie complexe), il faudra quand meme un specialiste licencie
- Demandez un devis au forfait pour eviter les surprises (prix a l'heure peuvent deraper)
- Les bricoleurs les plus demandes interviennent en 24-48h pour les urgences non critiques`,
    priceRange: "Tarif horaire : 120-200 NIS/h. Forfait montage meuble IKEA : 150-400 NIS selon la complexite. Accrochage TV murale : 200-400 NIS. Petit assortiment de reparations (2-3h) : 300-600 NIS.",
    glossary: [
      { french: 'Bricoleur', hebrew: 'הנדימן (handyman)' },
      { french: 'Marteau', hebrew: 'פטיש (patish)' },
      { french: 'Perceuse', hebrew: 'מקדחה (makdekha)' },
      { french: 'Vis', hebrew: 'בורג (boreg)' },
      { french: 'Cheville', hebrew: 'דיבל (dibel)' },
      { french: 'Etagere', hebrew: 'מדף (madaf)' },
    ],
    faq: [
      {
        question: 'Quelle est la difference entre un bricoleur et un artisan specialiste ?',
        answer: 'Un bricoleur (handyman) est polyvalent pour les petits travaux du quotidien : montage, fixation, petites reparations. Un specialiste (plombier, electricien) a une licence et gere les interventions complexes ou reglementees.',
      },
      {
        question: 'Combien coute un bricoleur en Israel ?',
        answer: "Entre 120 et 200 NIS de l'heure. Pour des taches precises, demandez un forfait : 150-400 NIS pour un meuble IKEA, 200-400 NIS pour accrocher une TV, etc.",
      },
      {
        question: 'Un bricoleur peut-il faire de l\'electricite ou de la plomberie ?',
        answer: "Pour les taches simples (remplacer une prise, un robinet), oui. Pour les travaux sur le tableau electrique ou les canalisations principales, il faut un professionnel licencie.",
      },
      {
        question: 'Faut-il fournir les materiaux ou les outils ?',
        answer: "Le bricoleur apporte ses outils. Pour les materiaux (vis, chevilles, peinture), discutez-en avant : soit il les fournit (avec une marge), soit vous les achetez vous-meme.",
      },
      {
        question: 'Comment savoir si un bricoleur est fiable ?',
        answer: "Privilegiez les avis de clients reels, demandez des photos de travaux precedents, et commencez par une petite mission pour tester la qualite avant de lui confier plus.",
      },
    ],
  },
}
