/* ============================================================
   PROPERTY FINDER REAL ESTATE
   i18n.js — Unified Internationalization Engine
   Version: 4.0

   Features
   ------------------------------------------------------------
   • English + all 22 Scheduled Indian Languages
   • Text-based translation via T dictionary
   • data-i18n key-based translation
   • data-i18n-ph placeholder translation
   • data-i18n-aria aria-label translation
   • HTML-safe / child-element-safe translation
   • Reversible multi-language switching
   • Custom accessible language dropdown
   • LocalStorage language persistence
   • Dynamic Google Font loading
   • RTL support
   • English fallback for missing translations
   • Safe initialization
   • Global API:
       window.setLang()
       window.getLang()
       window.getI18nMsg()
       window.refreshTranslations()
   ============================================================ */

(() => {
  'use strict';

  /* ============================================================
     1. LANGUAGE DEFINITIONS
     ============================================================ */

  const LANG_META = {
    en: {
      name: 'English',
      native: 'English',
      flag: '🇮🇳',
      font: '',
      dir: 'ltr'
    },

    hi: {
      name: 'Hindi',
      native: 'हिंदी',
      flag: '🇮🇳',
      font: 'Noto Sans Devanagari',
      dir: 'ltr'
    },

    mr: {
      name: 'Marathi',
      native: 'मराठी',
      flag: '🇮🇳',
      font: 'Noto Sans Devanagari',
      dir: 'ltr'
    },

    gu: {
      name: 'Gujarati',
      native: 'ગુજરાતી',
      flag: '🇮🇳',
      font: 'Noto Sans Gujarati',
      dir: 'ltr'
    },

    ta: {
      name: 'Tamil',
      native: 'தமிழ்',
      flag: '🇮🇳',
      font: 'Noto Sans Tamil',
      dir: 'ltr'
    },

    te: {
      name: 'Telugu',
      native: 'తెలుగు',
      flag: '🇮🇳',
      font: 'Noto Sans Telugu',
      dir: 'ltr'
    },

    kn: {
      name: 'Kannada',
      native: 'ಕನ್ನಡ',
      flag: '🇮🇳',
      font: 'Noto Sans Kannada',
      dir: 'ltr'
    },

    ml: {
      name: 'Malayalam',
      native: 'മലയാളം',
      flag: '🇮🇳',
      font: 'Noto Sans Malayalam',
      dir: 'ltr'
    },

    bn: {
      name: 'Bengali',
      native: 'বাংলা',
      flag: '🇮🇳',
      font: 'Noto Sans Bengali',
      dir: 'ltr'
    },

    pa: {
      name: 'Punjabi',
      native: 'ਪੰਜਾਬੀ',
      flag: '🇮🇳',
      font: 'Noto Sans Gurmukhi',
      dir: 'ltr'
    },

    or: {
      name: 'Odia',
      native: 'ଓଡ଼ିଆ',
      flag: '🇮🇳',
      font: 'Noto Sans Oriya',
      dir: 'ltr'
    },

    as: {
      name: 'Assamese',
      native: 'অসমীয়া',
      flag: '🇮🇳',
      font: 'Noto Sans Bengali',
      dir: 'ltr'
    },

    ur: {
      name: 'Urdu',
      native: 'اردو',
      flag: '🇮🇳',
      font: 'Noto Nastaliq Urdu',
      dir: 'rtl'
    },

    kok: {
      name: 'Konkani',
      native: 'कोंकणी',
      flag: '🇮🇳',
      font: 'Noto Sans Devanagari',
      dir: 'ltr'
    },

    mai: {
      name: 'Maithili',
      native: 'मैथिली',
      flag: '🇮🇳',
      font: 'Noto Sans Devanagari',
      dir: 'ltr'
    },

    ks: {
      name: 'Kashmiri',
      native: 'کٲشُر',
      flag: '🇮🇳',
      font: 'Noto Nastaliq Urdu',
      dir: 'rtl'
    },

    sd: {
      name: 'Sindhi',
      native: 'سنڌي',
      flag: '🇮🇳',
      font: 'Noto Nastaliq Urdu',
      dir: 'rtl'
    },

    sa: {
      name: 'Sanskrit',
      native: 'संस्कृत',
      flag: '🇮🇳',
      font: 'Noto Sans Devanagari',
      dir: 'ltr'
    },

    ne: {
      name: 'Nepali',
      native: 'नेपाली',
      flag: '🇮🇳',
      font: 'Noto Sans Devanagari',
      dir: 'ltr'
    },

    doi: {
      name: 'Dogri',
      native: 'डोगरी',
      flag: '🇮🇳',
      font: 'Noto Sans Devanagari',
      dir: 'ltr'
    },

    mni: {
      name: 'Manipuri',
      native: 'মৈতৈলোন্',
      flag: '🇮🇳',
      font: 'Noto Sans Bengali',
      dir: 'ltr'
    },

    bo: {
      name: 'Bodo',
      native: 'बड़ो',
      flag: '🇮🇳',
      font: 'Noto Sans Devanagari',
      dir: 'ltr'
    },

    sat: {
      name: 'Santali',
      native: 'ᱥᱟᱱᱛᱟᱲᱤ',
      flag: '🇮🇳',
      font: 'Noto Sans Ol Chiki',
      dir: 'ltr'
    }
  };

  /* ============================================================
     2. TEXT-BASED TRANSLATION DICTIONARY
     ============================================================ */

  const T = {
    en: {
      'Home': 'Home',
      'Properties': 'Properties',
      'Projects': 'Projects',
      'Services': 'Services',
      'About': 'About',
      'About Us': 'About Us',
      'Our Team': 'Our Team',
      'Tools': 'Tools',
      'Blog': 'Blog',
      'Contact': 'Contact',
      'Testimonials': 'Testimonials',
      'FAQ': 'FAQ',
      'NRI Corner': 'NRI Corner',
      'All Properties': 'All Properties',
      'Neighbourhoods': 'Neighbourhoods',
      'Calculators': 'Calculators',
      'TDS Calculators': 'TDS Calculators',
      'Measurement Converter': 'Measurement Converter',
      'Property Insurance': 'Property Insurance',
      'Price Trends': 'Price Trends',
      'Reminders': 'Reminders',
      'Featured Properties': 'Featured Properties',
      'Handpicked Listings': 'Handpicked Listings',
      'Complete Real Estate Services': 'Complete Real Estate Services',
      'Why Choose Us': 'Why Choose Us',
      'Featured Projects': 'Featured Projects',
      'Browse Properties by Locality': 'Browse Properties by Locality',
      'Client Stories': 'Client Stories',
      'What Our Clients Say': 'What Our Clients Say',
      'Knowledge Hub': 'Knowledge Hub',
      'Latest Insights': 'Latest Insights',
      'Ready to Find Your Perfect Property?':
        'Ready to Find Your Perfect Property?',
      'Get In Touch': 'Get In Touch',
      'Call Now': 'Call Now',
      'WhatsApp Us': 'WhatsApp Us',
      'View All': 'View All',
      'Read More': 'Read More',
      'Search': 'Search',
      'Browse Properties': 'Browse Properties',
      'Post Property FREE': 'Post Property FREE',
      'Buy': 'Buy',
      'Rent': 'Rent',
      'Commercial': 'Commercial',
      'For Sale': 'For Sale',
      'For Rent': 'For Rent',
      'New Launch': 'New Launch',
      'Ready to Move In': 'Ready to Move In',
      'Under Construction': 'Under Construction',
      'Quick Links': 'Quick Links',
      'Property Types': 'Property Types',
      'Contact Us': 'Contact Us',
      'Our Services': 'Our Services',
      'Privacy Policy': 'Privacy Policy',
      'All rights reserved.': 'All rights reserved.',
      'Beds': 'Beds',
      'Baths': 'Baths',
      'sq.ft': 'sq.ft',
      'Office Hours': 'Office Hours',
      'Office Address': 'Office Address',
      'Search by locality, project, or property type…':
        'Search by locality, project, or property type…',
      'Your Search Ends Here.': 'Your Search Ends Here.'
    },

    hi: {
      'Home': 'होम',
      'Properties': 'संपत्तियां',
      'Projects': 'प्रोजेक्ट्स',
      'Services': 'सेवाएं',
      'About': 'हमारे बारे में',
      'About Us': 'हमारे बारे में',
      'Our Team': 'हमारी टीम',
      'Tools': 'टूल्स',
      'Blog': 'ब्लॉग',
      'Contact': 'संपर्क',
      'Testimonials': 'प्रशंसापत्र',
      'FAQ': 'अक्सर पूछे जाने वाले सवाल',
      'NRI Corner': 'एनआरआई कॉर्नर',
      'All Properties': 'सभी संपत्तियां',
      'Neighbourhoods': 'इलाके',
      'Calculators': 'कैलकुलेटर',
      'TDS Calculators': 'टीडीएस कैलकुलेटर',
      'Measurement Converter': 'माप कनवर्टर',
      'Property Insurance': 'संपत्ति बीमा',
      'Price Trends': 'मूल्य रुझान',
      'Reminders': 'अनुस्मारक',
      'Featured Properties': 'विशेष संपत्तियां',
      'Handpicked Listings': 'चयनित संपत्तियां',
      'Complete Real Estate Services': 'संपूर्ण रियल एस्टेट सेवाएं',
      'Why Choose Us': 'हमें क्यों चुनें',
      'Featured Projects': 'प्रमुख प्रोजेक्ट्स',
      'Browse Properties by Locality':
        'इलाके के अनुसार संपत्तियां खोजें',
      'Client Stories': 'ग्राहकों के अनुभव',
      'What Our Clients Say': 'हमारे ग्राहक क्या कहते हैं',
      'Knowledge Hub': 'ज्ञान केंद्र',
      'Latest Insights': 'नवीनतम अपडेट्स',
      'Ready to Find Your Perfect Property?':
        'क्या आप अपनी आदर्श संपत्ति खोजने के लिए तैयार हैं?',
      'Get In Touch': 'संपर्क करें',
      'Call Now': 'अभी कॉल करें',
      'WhatsApp Us': 'व्हाट्सएप करें',
      'View All': 'सभी देखें',
      'Read More': 'और पढ़ें',
      'Search': 'खोजें',
      'Browse Properties': 'संपत्तियां ब्राउज़ करें',
      'Post Property FREE': 'संपत्ति मुफ्त पोस्ट करें',
      'Buy': 'खरीदें',
      'Rent': 'किराया',
      'Commercial': 'व्यावसायिक',
      'For Sale': 'बिक्री के लिए',
      'For Rent': 'किराए के लिए',
      'New Launch': 'नया लॉन्च',
      'Ready to Move In': 'तुरंत रहने योग्य',
      'Under Construction': 'निर्माणाधीन',
      'Quick Links': 'त्वरित लिंक',
      'Property Types': 'संपत्ति के प्रकार',
      'Contact Us': 'संपर्क करें',
      'Our Services': 'हमारी सेवाएं',
      'Privacy Policy': 'गोपनीयता नीति',
      'All rights reserved.': 'सर्वाधिकार सुरक्षित।',
      'Beds': 'बेडरूम',
      'Baths': 'बाथरूम',
      'sq.ft': 'वर्ग फुट',
      'Office Hours': 'कार्यालय समय',
      'Office Address': 'कार्यालय का पता',
      'Search by locality, project, or property type…':
        'इलाके, प्रोजेक्ट या प्रकार द्वारा खोजें…',
      'Your Search Ends Here.': 'आपकी खोज यहाँ समाप्त होती है।'
    },

    mr: {
      'Home': 'मुख्यपृष्ठ',
      'Properties': 'मालमत्ता',
      'Projects': 'प्रकल्प',
      'Services': 'सेवा',
      'About': 'आमच्याबद्दल',
      'About Us': 'आमच्याबद्दल',
      'Our Team': 'आमची टीम',
      'Tools': 'साधने',
      'Blog': 'ब्लॉग',
      'Contact': 'संपर्क',
      'Testimonials': 'अभिप्राय',
      'FAQ': 'नेहमी विचारले जाणारे प्रश्न',
      'NRI Corner': 'एनआरआय कॉर्नर',
      'All Properties': 'सर्व मालमत्ता',
      'Neighbourhoods': 'परिसर',
      'Calculators': 'कॅल्क्युलेटर',
      'TDS Calculators': 'टीडीएस कॅल्क्युलेटर',
      'Measurement Converter': 'माप रूपांतरक',
      'Property Insurance': 'मालमत्ता विमा',
      'Price Trends': 'किंमत कल',
      'Reminders': 'स्मरणपत्रे',
      'Featured Properties': 'विशेष मालमत्ता',
      'Handpicked Listings': 'निवडक यादी',
      'Complete Real Estate Services':
        'परिपूर्ण रिअल इस्टेट सेवा',
      'Why Choose Us': 'आम्हाला का निवडावे',
      'Featured Projects': 'प्रमुख प्रकल्प',
      'Browse Properties by Locality':
        'परिसरानुसार मालमत्ता शोधा',
      'Client Stories': 'ग्राहकांचे अनुभव',
      'What Our Clients Say': 'आमचे ग्राहक काय म्हणतात',
      'Knowledge Hub': 'माहिती केंद्र',
      'Latest Insights': 'नवीनतम घडामोडी',
      'Ready to Find Your Perfect Property?':
        'आपली परिपूर्ण मालमत्ता शोधण्यास तयार आहात?',
      'Get In Touch': 'संपर्क करा',
      'Call Now': 'आत्ता कॉल करा',
      'WhatsApp Us': 'व्हाट्सअॅप करा',
      'View All': 'सर्व पाहा',
      'Read More': 'अधिक वाचा',
      'Search': 'शोधा',
      'Browse Properties': 'मालमत्ता पाहा',
      'Post Property FREE': 'मालमत्ता मोफत पोस्ट करा',
      'Buy': 'खरेदी',
      'Rent': 'भाडे',
      'Commercial': 'व्यावसायिक',
      'For Sale': 'विक्रीसाठी',
      'For Rent': 'भाड्यासाठी',
      'New Launch': 'नवीन लॉन्च',
      'Ready to Move In': 'लगेच राहण्यायोग्य',
      'Under Construction': 'बांधकाम सुरू',
      'Quick Links': 'जलद दुवे',
      'Property Types': 'मालमत्ता प्रकार',
      'Contact Us': 'संपर्क साधा',
      'Our Services': 'आमच्या सेवा',
      'Privacy Policy': 'गोपनीयता धोरण',
      'All rights reserved.': 'सर्व हक्क राखीव.',
      'Beds': 'बेडरूम',
      'Baths': 'बाथरूम',
      'sq.ft': 'चौ.फूट',
      'Office Hours': 'कार्यालयीन वेळ',
      'Office Address': 'कार्यालयाचा पत्ता',
      'Search by locality, project, or property type…':
        'परिसर, प्रकल्प किंवा प्रकारानुसार शोधा…',
      'Your Search Ends Here.': 'आपला शोध इथे संपतो.'
    },

    gu: {
      'Home': 'હોમ',
      'Properties': 'મિલ્કત',
      'Projects': 'પ્રોજેક્ટ',
      'Services': 'સેવાઓ',
      'About': 'અમારા વિશે',
      'About Us': 'અમારા વિશે',
      'Our Team': 'અમારી ટીમ',
      'Tools': 'સાધનો',
      'Blog': 'બ્લોગ',
      'Contact': 'સંપર્ક',
      'Testimonials': 'પ્રશંસાપત્રો',
      'FAQ': 'વારંવાર પૂછાતા પ્રશ્નો',
      'All Properties': 'બધી મિલ્કત',
      'Calculators': 'કૅલ્ક્યુલેટર',
      'Get In Touch': 'સંપર્ક કરો',
      'Call Now': 'હવે કૉલ કરો',
      'WhatsApp Us': 'વ્હોટ્સએપ કરો',
      'View All': 'બધું જુઓ',
      'Read More': 'વધુ વાંચો',
      'Search': 'શોધો',
      'For Sale': 'વેચાણ માટે',
      'For Rent': 'ભાડા માટે',
      'New Launch': 'નવું લોન્ચ',
      'Ready to Move In': 'તરત રહેવા યોગ્ય',
      'Under Construction': 'નિર્માણ હેઠળ',
      'Commercial': 'વ્યાપારી',
      'Quick Links': 'ઝડપી લિંક્સ',
      'Privacy Policy': 'ગોપનીયતા નીતિ',
      'All rights reserved.': 'સર્વ હક્કો અબાધિત.',
      'Beds': 'બેડરૂમ',
      'Baths': 'બાથરૂમ',
      'Buy': 'ખરીદો',
      'Rent': 'ભાડું'
    },

    ta: {
      'Home': 'முகப்பு',
      'Properties': 'சொத்துக்கள்',
      'Projects': 'திட்டங்கள்',
      'Services': 'சேவைகள்',
      'About': 'எங்களைப் பற்றி',
      'Tools': 'கருவிகள்',
      'Blog': 'வலைப்பதிவு',
      'Contact': 'தொடர்பு',
      'Our Team': 'எங்கள் குழு',
      'Testimonials': 'சான்றுகள்',
      'FAQ': 'அடிக்கடி கேட்கப்படும் கேள்விகள்',
      'All Properties': 'அனைத்து சொத்துகள்',
      'Calculators': 'கணிப்பான்கள்',
      'Get In Touch': 'தொடர்பு கொள்ளுங்கள்',
      'Call Now': 'இப்போது அழைக்கவும்',
      'WhatsApp Us': 'வாட்ஸ்அப் செய்யுங்கள்',
      'View All': 'அனைத்தையும் பார்க்க',
      'Read More': 'மேலும் படிக்க',
      'Search': 'தேடு',
      'For Sale': 'விற்பனைக்கு',
      'For Rent': 'வாடகைக்கு',
      'New Launch': 'புதிய அறிமுகம்',
      'Ready to Move In': 'உடனடியாக குடியேறலாம்',
      'Under Construction': 'கட்டுமானத்தில்',
      'Commercial': 'வணிக',
      'Quick Links': 'விரைவு இணைப்புகள்',
      'Privacy Policy': 'தனியுரிமைக் கொள்கை',
      'All rights reserved.':
        'அனைத்து உரிமைகளும் பாதுகாக்கப்பட்டவை.',
      'Beds': 'படுக்கையறைகள்',
      'Baths': 'குளியலறைகள்',
      'Buy': 'வாங்கு',
      'Rent': 'வாடகை'
    },

    te: {
      'Home': 'హోమ్',
      'Properties': 'ఆస్తులు',
      'Projects': 'ప్రాజెక్టులు',
      'Services': 'సేవలు',
      'About': 'మా గురించి',
      'Tools': 'సాధనాలు',
      'Blog': 'బ్లాగ్',
      'Contact': 'సంప్రదించు',
      'Our Team': 'మా బృందం',
      'Testimonials': 'సాక్ష్యాలు',
      'FAQ': 'తరచుగా అడిగే ప్రశ్నలు',
      'All Properties': 'అన్ని ఆస్తులు',
      'Calculators': 'కాలిక్యులేటర్లు',
      'Get In Touch': 'సంప్రదించండి',
      'Call Now': 'ఇప్పుడు కాల్ చేయండి',
      'WhatsApp Us': 'వాట్సాప్ చేయండి',
      'View All': 'అన్నీ చూడండి',
      'Read More': 'మరింత చదవండి',
      'Search': 'వెతకండి',
      'For Sale': 'అమ్మకానికి',
      'For Rent': 'అద్దెకు',
      'New Launch': 'కొత్త లాంచ్',
      'Ready to Move In': 'వెంటనే మారవచ్చు',
      'Under Construction': 'నిర్మాణంలో',
      'Commercial': 'వాణిజ్య',
      'Quick Links': 'త్వరిత లింకులు',
      'Privacy Policy': 'గోప్యతా విధానం',
      'All rights reserved.': 'అన్ని హక్కులు సురక్షితం.',
      'Beds': 'పడకగదులు',
      'Baths': 'బాత్రూమ్‌లు',
      'Buy': 'కొనండి',
      'Rent': 'అద్దె'
    },

    kn: {
      'Home': 'ಮನೆ',
      'Properties': 'ಆಸ್ತಿಗಳು',
      'Projects': 'ಯೋಜನೆಗಳು',
      'Services': 'ಸೇವೆಗಳು',
      'About': 'ನಮ್ಮ ಬಗ್ಗೆ',
      'Tools': 'ಉಪಕರಣಗಳು',
      'Blog': 'ಬ್ಲಾಗ್',
      'Contact': 'ಸಂಪರ್ಕ',
      'Our Team': 'ನಮ್ಮ ತಂಡ',
      'Testimonials': 'ಪ್ರಶಂಸಾ ಪತ್ರಗಳು',
      'FAQ': 'ಪದೇ ಪದೇ ಕೇಳಲಾಗುವ ಪ್ರಶ್ನೆಗಳು',
      'All Properties': 'ಎಲ್ಲಾ ಆಸ್ತಿಗಳು',
      'Calculators': 'ಕ್ಯಾಲ್ಕುಲೇಟರ್‌ಗಳು',
      'Get In Touch': 'ಸಂಪರ್ಕಿಸಿ',
      'Call Now': 'ಈಗ ಕರೆ ಮಾಡಿ',
      'WhatsApp Us': 'ವಾಟ್ಸಾಪ್ ಮಾಡಿ',
      'View All': 'ಎಲ್ಲವನ್ನೂ ನೋಡಿ',
      'Read More': 'ಇನ್ನಷ್ಟು ಓದಿ',
      'Search': 'ಹುಡುಕಿ',
      'For Sale': 'ಮಾರಾಟಕ್ಕೆ',
      'For Rent': 'ಬಾಡಿಗೆಗೆ',
      'New Launch': 'ಹೊಸ ಲಾಂಚ್',
      'Ready to Move In': 'ತಕ್ಷಣ ಹೋಗಬಹುದು',
      'Under Construction': 'ನಿರ್ಮಾಣ ಹಂತದಲ್ಲಿ',
      'Commercial': 'ವಾಣಿಜ್ಯ',
      'Quick Links': 'ತ್ವರಿತ ಲಿಂಕ್‌ಗಳು',
      'Privacy Policy': 'ಗೌಪ್ಯತಾ ನೀತಿ',
      'All rights reserved.':
        'ಎಲ್ಲಾ ಹಕ್ಕುಗಳನ್ನು ಕಾಯ್ದಿರಿಸಲಾಗಿದೆ.',
      'Beds': 'ಮಲಗುವ ಕೋಣೆ',
      'Baths': 'ಸ್ನಾನಗೃಹ',
      'Buy': 'ಖರೀದಿಸಿ',
      'Rent': 'ಬಾಡಿಗೆ'
    },

    ml: {
      'Home': 'ഹോം',
      'Properties': 'സ്വത്തുക്കൾ',
      'Projects': 'പ്രോജക്ടുകൾ',
      'Services': 'സേവനങ്ങൾ',
      'About': 'ഞങ്ങളെക്കുറിച്ച്',
      'Tools': 'ഉപകരണങ്ങൾ',
      'Blog': 'ബ്ലോഗ്',
      'Contact': 'ബന്ധപ്പെടുക',
      'Our Team': 'ഞങ്ങളുടെ ടീം',
      'Testimonials': 'സാക്ഷ്യങ്ങൾ',
      'FAQ': 'പതിവ് ചോദ്യങ്ങൾ',
      'All Properties': 'എല്ലാ സ്വത്തുക്കളും',
      'Calculators': 'കാൽക്കുലേറ്ററുകൾ',
      'Get In Touch': 'ബന്ധപ്പെടുക',
      'Call Now': 'ഇപ്പോൾ വിളിക്കൂ',
      'WhatsApp Us': 'വാട്ട്സ്ആപ്പ് ചെയ്യൂ',
      'View All': 'എല്ലാം കാണുക',
      'Read More': 'കൂടുതൽ വായിക്കുക',
      'Search': 'തിരയുക',
      'For Sale': 'വിൽക്കാൻ',
      'For Rent': 'വാടകയ്ക്ക്',
      'New Launch': 'പുതിയ ലോഞ്ച്',
      'Ready to Move In': 'ഉടൻ മാറാം',
      'Under Construction': 'നിർമ്മാണത്തിൽ',
      'Commercial': 'വാണിജ്യ',
      'Quick Links': 'ദ്രുത ലിങ്കുകൾ',
      'Privacy Policy': 'സ്വകാര്യതാ നയം',
      'All rights reserved.': 'എല്ലാ അവകാശങ്ങളും നിക്ഷിപ്തം.',
      'Beds': 'കിടപ്പുമുറി',
      'Baths': 'കുളിമുറി',
      'Buy': 'വാങ്ങുക',
      'Rent': 'വാടക'
    },

    bn: {
      'Home': 'হোম',
      'Properties': 'সম্পত্তি',
      'Projects': 'প্রকল্প',
      'Services': 'সেবাসমূহ',
      'About': 'আমাদের সম্পর্কে',
      'Tools': 'সরঞ্জাম',
      'Blog': 'ব্লগ',
      'Contact': 'যোগাযোগ',
      'Our Team': 'আমাদের দল',
      'Testimonials': 'সাক্ষ্যসমূহ',
      'FAQ': 'প্রায়শই জিজ্ঞাসিত প্রশ্ন',
      'All Properties': 'সকল সম্পত্তি',
      'Calculators': 'ক্যালকুলেটর',
      'Get In Touch': 'যোগাযোগ করুন',
      'Call Now': 'এখনই কল করুন',
      'WhatsApp Us': 'হোয়াটসঅ্যাপ করুন',
      'View All': 'সব দেখুন',
      'Read More': 'আরও পড়ুন',
      'Search': 'খুঁজুন',
      'For Sale': 'বিক্রয়ের জন্য',
      'For Rent': 'ভাড়ার জন্য',
      'New Launch': 'নতুন লঞ্চ',
      'Ready to Move In': 'এখনই উঠতে পারবেন',
      'Under Construction': 'নির্মাণাধীন',
      'Commercial': 'বাণিজ্যিক',
      'Quick Links': 'দ্রুত লিঙ্ক',
      'Privacy Policy': 'গোপনীয়তা নীতি',
      'All rights reserved.': 'সর্বস্বত্ব সংরক্ষিত।',
      'Beds': 'শোওয়ার ঘর',
      'Baths': 'বাথরুম',
      'Buy': 'কিনুন',
      'Rent': 'ভাড়া'
    },

    pa: {
      'Home': 'ਹੋਮ',
      'Properties': 'ਜਾਇਦਾਦ',
      'Projects': 'ਪ੍ਰੋਜੈਕਟ',
      'Services': 'ਸੇਵਾਵਾਂ',
      'About': 'ਸਾਡੇ ਬਾਰੇ',
      'Tools': 'ਸਾਧਨ',
      'Blog': 'ਬਲੌਗ',
      'Contact': 'ਸੰਪਰਕ',
      'Our Team': 'ਸਾਡੀ ਟੀਮ',
      'Testimonials': 'ਪ੍ਰਸ਼ੰਸਾ ਪੱਤਰ',
      'FAQ': 'ਅਕਸਰ ਪੁੱਛੇ ਜਾਣ ਵਾਲੇ ਸਵਾਲ',
      'All Properties': 'ਸਾਰੀਆਂ ਜਾਇਦਾਦਾਂ',
      'Calculators': 'ਕੈਲਕੁਲੇਟਰ',
      'Get In Touch': 'ਸੰਪਰਕ ਕਰੋ',
      'Call Now': 'ਹੁਣੇ ਕਾਲ ਕਰੋ',
      'WhatsApp Us': 'ਵਟਸਐਪ ਕਰੋ',
      'View All': 'ਸਭ ਵੇਖੋ',
      'Read More': 'ਹੋਰ ਪੜ੍ਹੋ',
      'Search': 'ਖੋਜੋ',
      'For Sale': 'ਵੇਚਣ ਲਈ',
      'For Rent': 'ਕਿਰਾਏ ਲਈ',
      'New Launch': 'ਨਵੀਂ ਲਾਂਚ',
      'Ready to Move In': 'ਤੁਰੰਤ ਜਾ ਸਕਦੇ ਹੋ',
      'Under Construction': 'ਉਸਾਰੀ ਅਧੀਨ',
      'Commercial': 'ਵਪਾਰਕ',
      'Quick Links': 'ਤੇਜ਼ ਲਿੰਕ',
      'Privacy Policy': 'ਗੋਪਨੀਯਤਾ ਨੀਤੀ',
      'All rights reserved.': 'ਸਾਰੇ ਅਧਿਕਾਰ ਸੁਰੱਖਿਅਤ।',
      'Beds': 'ਸੌਣ ਵਾਲਾ ਕਮਰਾ',
      'Baths': 'ਬਾਥਰੂਮ',
      'Buy': 'ਖਰੀਦੋ',
      'Rent': 'ਕਿਰਾਇਆ'
    },

    ur: {
      'Home': 'ہوم',
      'Properties': 'جائیداد',
      'Projects': 'پراجیکٹ',
      'Services': 'خدمات',
      'About': 'ہمارے بارے میں',
      'Tools': 'آلات',
      'Blog': 'بلاگ',
      'Contact': 'رابطہ',
      'Our Team': 'ہماری ٹیم',
      'Testimonials': 'تعریفیں',
      'FAQ': 'اکثر پوچھے گئے سوالات',
      'All Properties': 'تمام جائیدادیں',
      'Calculators': 'حساب کتاب',
      'Get In Touch': 'رابطہ کریں',
      'Call Now': 'ابھی کال کریں',
      'WhatsApp Us': 'واٹس ایپ کریں',
      'View All': 'سب دیکھیں',
      'Read More': 'مزید پڑھیں',
      'Search': 'تلاش',
      'For Sale': 'فروخت کے لیے',
      'For Rent': 'کرایہ کے لیے',
      'New Launch': 'نئی لانچ',
      'Ready to Move In': 'فوری طور پر منتقل ہو سکتے ہیں',
      'Under Construction': 'زیر تعمیر',
      'Commercial': 'تجارتی',
      'Quick Links': 'فوری لنکس',
      'Privacy Policy': 'رازداری کی پالیسی',
      'All rights reserved.': 'جملہ حقوق محفوظ ہیں۔',
      'Beds': 'بیڈروم',
      'Baths': 'باتھ روم',
      'Buy': 'خریدیں',
      'Rent': 'کرایہ'
    }
  };

  /* ============================================================
     3. KEY-BASED DATA-I18N TRANSLATIONS
     ============================================================ */

  const I18N_KEYS = {
    en: {
      'nav.home': 'Home',
      'nav.properties': 'Properties',
      'nav.projects': 'Projects',
      'nav.services': 'Services',
      'nav.about': 'About',
      'nav.blog': 'Blog',
      'nav.contact': 'Contact',
      'nav.tools': 'Tools',
      'nav.careers': 'Careers',
      'nav.team': 'Our Team',
      'nav.faq': 'FAQ',
      'nav.testimonials': 'Testimonials',

      'btn.search': 'Search',
      'btn.submit': 'Submit',
      'btn.call': 'Call Now',
      'btn.whatsapp': 'WhatsApp',
      'btn.apply': 'Apply Now',
      'btn.view_all': 'View All',
      'btn.read_more': 'Read More',
      'btn.post_free': 'Post Property FREE',
      'btn.get_quote': 'Get a Quote',
      'btn.enquire': 'Send Enquiry',
      'btn.back': 'Go Back',
      'btn.clear': 'Clear',
      'btn.save': 'Save',
      'btn.export': 'Export CSV',
      'btn.print': 'Print',
      'btn.get_in_touch': 'Get In Touch',

      'form.name': 'Full Name',
      'form.phone': 'Mobile Number',
      'form.email': 'Email Address',
      'form.message': 'Message / Requirements',
      'form.budget': 'Budget',
      'form.locality': 'Preferred Locality',
      'form.config': 'Configuration',
      'form.intent': 'Looking to',
      'form.submit': 'Submit Enquiry',
      'form.required': 'This field is required',
      'form.invalid_phone':
        'Please enter a valid 10-digit phone number',
      'form.invalid_email':
        'Please enter a valid email address',

      'label.for_sale': 'For Sale',
      'label.for_rent': 'For Rent',
      'label.new_launch': 'New Launch',
      'label.ready': 'Ready to Move',
      'label.under_construction': 'Under Construction',
      'label.bhk_1': '1 BHK',
      'label.bhk_2': '2 BHK',
      'label.bhk_3': '3 BHK',
      'label.commercial': 'Commercial',
      'label.plot': 'Plot / Land',

      'footer.rights': 'All rights reserved.',
      'footer.address': 'Address',
      'footer.hours': 'Office Hours',
      'footer.follow': 'Follow Us',
      'footer.quick': 'Quick Links',

      'misc.loading': 'Loading…',
      'misc.no_results': 'No results found',
      'misc.error': 'Something went wrong. Please try again.',
      'misc.success': 'Success!',
      'misc.copied': 'Copied to clipboard'
    },

    hi: {
      'nav.home': 'होम',
      'nav.properties': 'संपत्तियां',
      'nav.projects': 'प्रोजेक्ट्स',
      'nav.services': 'सेवाएं',
      'nav.about': 'हमारे बारे में',
      'nav.blog': 'ब्लॉग',
      'nav.contact': 'संपर्क',
      'nav.tools': 'टूल्स',
      'nav.careers': 'करियर',
      'nav.team': 'हमारी टीम',
      'nav.faq': 'प्रश्न',
      'nav.testimonials': 'समीक्षाएं',

      'btn.search': 'खोजें',
      'btn.submit': 'जमा करें',
      'btn.call': 'कॉल करें',
      'btn.whatsapp': 'व्हाट्सएप',
      'btn.apply': 'अभी आवेदन करें',
      'btn.view_all': 'सभी देखें',
      'btn.read_more': 'और पढ़ें',
      'btn.post_free': 'मुफ्त पोस्ट करें',
      'btn.get_quote': 'कोटेशन प्राप्त करें',
      'btn.enquire': 'पूछताछ भेजें',
      'btn.back': 'वापस जाएं',
      'btn.clear': 'साफ करें',
      'btn.save': 'सहेजें',
      'btn.get_in_touch': 'संपर्क करें',

      'form.name': 'पूरा नाम',
      'form.phone': 'मोबाइल नंबर',
      'form.email': 'ईमेल पता',
      'form.message': 'संदेश',
      'form.budget': 'बजट',
      'form.locality': 'पसंदीदा इलाका',
      'form.config': 'विन्यास',
      'form.intent': 'इरादा',
      'form.submit': 'पूछताछ भेजें',
      'form.required': 'यह फ़ील्ड आवश्यक है',
      'form.invalid_phone':
        'कृपया वैध 10-अंकीय फ़ोन नंबर दर्ज करें',
      'form.invalid_email':
        'कृपया वैध ईमेल पता दर्ज करें',

      'label.for_sale': 'बिक्री के लिए',
      'label.for_rent': 'किराए के लिए',
      'label.new_launch': 'नई लॉन्च',
      'label.ready': 'तुरंत बसने योग्य',
      'label.under_construction': 'निर्माणाधीन',
      'label.bhk_1': '1 बीएचके',
      'label.bhk_2': '2 बीएचके',
      'label.bhk_3': '3 बीएचके',
      'label.commercial': 'व्यावसायिक',
      'label.plot': 'भूखंड',

      'footer.rights': 'सर्वाधिकार सुरक्षित।',
      'footer.address': 'पता',
      'footer.hours': 'कार्यालय समय',
      'footer.follow': 'हमें फॉलो करें',
      'footer.quick': 'त्वरित लिंक',

      'misc.loading': 'लोड हो रहा है…',
      'misc.no_results': 'कोई परिणाम नहीं मिला',
      'misc.error': 'कुछ गलत हुआ। कृपया पुनः प्रयास करें।',
      'misc.success': 'सफलता!',
      'misc.copied': 'क्लिपबोर्ड में कॉपी किया'
    },

    mr: {
      'nav.home': 'मुख्यपृष्ठ',
      'nav.properties': 'मालमत्ता',
      'nav.projects': 'प्रकल्प',
      'nav.services': 'सेवा',
      'nav.about': 'आमच्याबद्दल',
      'nav.blog': 'ब्लॉग',
      'nav.contact': 'संपर्क',
      'nav.tools': 'साधने',
      'nav.careers': 'करिअर',
      'nav.team': 'आमची टीम',
      'nav.testimonials': 'अभिप्राय',

      'btn.search': 'शोधा',
      'btn.submit': 'सादर करा',
      'btn.call': 'कॉल करा',
      'btn.whatsapp': 'व्हाट्सअॅप',
      'btn.view_all': 'सर्व पाहा',
      'btn.read_more': 'अधिक वाचा',
      'btn.post_free': 'मोफत पोस्ट करा',
      'btn.enquire': 'चौकशी पाठवा',
      'btn.back': 'मागे जा',
      'btn.clear': 'साफ करा',
      'btn.save': 'जतन करा',
      'btn.get_in_touch': 'संपर्क साधा',

      'form.name': 'पूर्ण नाव',
      'form.phone': 'मोबाइल नंबर',
      'form.email': 'ईमेल पत्ता',
      'form.message': 'संदेश',
      'form.budget': 'बजेट',
      'form.locality': 'पसंतीचे ठिकाण',
      'form.submit': 'चौकशी पाठवा',
      'form.required': 'हे फील्ड आवश्यक आहे',

      'label.for_sale': 'विक्रीसाठी',
      'label.for_rent': 'भाड्यासाठी',
      'label.new_launch': 'नवीन लॉन्च',
      'label.ready': 'लगेच राहण्यायोग्य',
      'label.under_construction': 'बांधकाम सुरू',
      'label.commercial': 'व्यावसायिक',
      'label.bhk_1': '१ बीएचके',
      'label.bhk_2': '२ बीएचके',
      'label.bhk_3': '३ बीएचके',

      'footer.rights': 'सर्व हक्क राखीव.',
      'footer.address': 'पत्ता',
      'footer.hours': 'कार्यालयीन वेळ',
      'footer.quick': 'जलद दुवे',

      'misc.loading': 'लोड होत आहे…',
      'misc.no_results': 'कोणतेही परिणाम आढळले नाहीत',
      'misc.error': 'काहीतरी चूक झाली. पुन्हा प्रयत्न करा.'
    },

    gu: {
      'nav.home': 'હોમ',
      'nav.properties': 'મિલ્કત',
      'nav.projects': 'પ્રોજેક્ટ',
      'nav.services': 'સેવાઓ',
      'nav.about': 'અમારા વિશે',
      'nav.blog': 'બ્લૉગ',
      'nav.contact': 'સંપર્ક',
      'nav.tools': 'સાધનો',

      'btn.search': 'શોધો',
      'btn.submit': 'સબમિટ',
      'btn.call': 'કૉલ કરો',
      'btn.whatsapp': 'વ્હૉટ્સએપ',
      'btn.view_all': 'બધું જુઓ',
      'btn.read_more': 'વધુ વાંચો',
      'btn.enquire': 'પૂછપરછ',

      'form.name': 'પૂરું નામ',
      'form.phone': 'મોબાઇલ',
      'form.required': 'આ ફીલ્ડ જરૂરી છે',

      'label.for_sale': 'વેચાણ માટે',
      'label.for_rent': 'ભાડા માટે',

      'footer.rights': 'સર્વ હક્કો અબાધિત.'
    },

    ta: {
      'nav.home': 'முகப்பு',
      'nav.properties': 'சொத்துக்கள்',
      'nav.projects': 'திட்டங்கள்',
      'nav.services': 'சேவைகள்',
      'nav.about': 'எங்களைப் பற்றி',
      'nav.blog': 'வலைப்பதிவு',
      'nav.contact': 'தொடர்பு',

      'btn.search': 'தேடு',
      'btn.submit': 'சமர்ப்பி',
      'btn.call': 'அழைக்கவும்',
      'btn.whatsapp': 'வாட்ஸ்அப்',
      'btn.view_all': 'அனைத்தையும் பார்',
      'btn.read_more': 'மேலும் படி',
      'btn.enquire': 'விசாரணை',

      'form.name': 'முழு பெயர்',
      'form.phone': 'மொபைல்',
      'form.required': 'இந்த புலம் தேவை',

      'label.for_sale': 'விற்பனைக்கு',
      'label.for_rent': 'வாடகைக்கு',

      'footer.rights':
        'அனைத்து உரிமைகளும் பாதுகாக்கப்பட்டவை.'
    },

    te: {
      'nav.home': 'హోమ్',
      'nav.properties': 'ఆస్తులు',
      'nav.services': 'సేవలు',

      'btn.search': 'వెతుకు',
      'btn.submit': 'సమర్పించు',
      'btn.call': 'కాల్ చేయి',
      'btn.whatsapp': 'వాట్సాప్',
      'btn.view_all': 'అన్నీ చూడు',
      'btn.read_more': 'మరింత చదువు',

      'form.name': 'పూర్తి పేరు',
      'form.phone': 'మొబైల్',
      'form.required': 'ఈ ఫీల్డ్ అవసరం',

      'label.for_sale': 'అమ్మకానికి',
      'label.for_rent': 'అద్దెకు',

      'footer.rights': 'అన్ని హక్కులు సురక్షితం.'
    },

    kn: {
      'nav.home': 'ಮನೆ',
      'nav.properties': 'ಆಸ್ತಿಗಳು',
      'nav.services': 'ಸೇವೆಗಳು',

      'btn.search': 'ಹುಡುಕಿ',
      'btn.submit': 'ಸಲ್ಲಿಸಿ',
      'btn.call': 'ಕರೆ ಮಾಡಿ',
      'btn.whatsapp': 'ವಾಟ್ಸಾಪ್',
      'btn.view_all': 'ಎಲ್ಲ ನೋಡಿ',

      'form.name': 'ಪೂರ್ಣ ಹೆಸರು',
      'form.phone': 'ಮೊಬೈಲ್',
      'form.required': 'ಈ ಕ್ಷೇತ್ರ ಅಗತ್ಯ',

      'label.for_sale': 'ಮಾರಾಟಕ್ಕೆ',
      'label.for_rent': 'ಬಾಡಿಗೆಗೆ',

      'footer.rights':
        'ಎಲ್ಲಾ ಹಕ್ಕುಗಳನ್ನು ಕಾಯ್ದಿರಿಸಲಾಗಿದೆ.'
    },

    ml: {
      'nav.home': 'ഹോം',
      'nav.properties': 'സ്വത്തുക്കൾ',
      'nav.services': 'സേവനങ്ങൾ',

      'btn.search': 'തിരയുക',
      'btn.submit': 'സമർപ്പിക്കുക',
      'btn.call': 'വിളിക്കൂ',
      'btn.whatsapp': 'വാട്ട്സ്ആപ്പ്',
      'btn.view_all': 'എല്ലാം കാണുക',

      'form.name': 'പൂർണ്ണ നാമം',
      'form.phone': 'മൊബൈൽ',
      'form.required': 'ഈ ഫീൽഡ് ആവശ്യമാണ്',

      'label.for_sale': 'വിൽക്കാൻ',
      'label.for_rent': 'വാടകയ്ക്ക്',

      'footer.rights':
        'എല്ലാ അവകാശങ്ങളും നിക്ഷിപ്തം.'
    },

    bn: {
      'nav.home': 'হোম',
      'nav.properties': 'সম্পত্তি',
      'nav.services': 'সেবাসমূহ',

      'btn.search': 'খুঁজুন',
      'btn.submit': 'জমা দিন',
      'btn.call': 'কল করুন',
      'btn.whatsapp': 'হোয়াটসঅ্যাপ',
      'btn.view_all': 'সব দেখুন',

      'form.name': 'পূর্ণ নাম',
      'form.phone': 'মোবাইল',
      'form.required': 'এই ক্ষেত্রটি প্রয়োজন',

      'label.for_sale': 'বিক্রয়ের জন্য',
      'label.for_rent': 'ভাড়ার জন্য',

      'footer.rights': 'সর্বস্বত্ব সংরক্ষিত।'
    },

    pa: {
      'nav.home': 'ਹੋਮ',
      'nav.properties': 'ਜਾਇਦਾਦ',
      'nav.services': 'ਸੇਵਾਵਾਂ',

      'btn.search': 'ਖੋਜੋ',
      'btn.submit': 'ਜਮ੍ਹਾਂ ਕਰੋ',
      'btn.call': 'ਕਾਲ ਕਰੋ',
      'btn.whatsapp': 'ਵਟਸਐਪ',
      'btn.view_all': 'ਸਭ ਵੇਖੋ',

      'form.name': 'ਪੂਰਾ ਨਾਮ',
      'form.phone': 'ਮੋਬਾਈਲ',
      'form.required': 'ਇਹ ਫੀਲਡ ਲੋੜੀਂਦਾ ਹੈ',

      'label.for_sale': 'ਵੇਚਣ ਲਈ',
      'label.for_rent': 'ਕਿਰਾਏ ਲਈ',

      'footer.rights': 'ਸਾਰੇ ਅਧਿਕਾਰ ਸੁਰੱਖਿਅਤ।'
    },

    ur: {
      'nav.home': 'ہوم',
      'nav.properties': 'جائیداد',
      'nav.services': 'خدمات',

      'btn.search': 'تلاش',
      'btn.submit': 'جمع کریں',
      'btn.call': 'کال کریں',
      'btn.whatsapp': 'واٹس ایپ',
      'btn.view_all': 'سب دیکھیں',

      'form.name': 'پورا نام',
      'form.phone': 'موبائل',
      'form.required': 'یہ فیلڈ ضروری ہے',

      'label.for_sale': 'فروخت کے لیے',
      'label.for_rent': 'کرایہ کے لیے',

      'footer.rights': 'جملہ حقوق محفوظ ہیں۔'
    }
  };

  /* ============================================================
     4. SELECTORS
     ============================================================ */

  const SAFE_SELECTORS = [
    '.nav-link',
    '.mobile-menu a',
    '.footer-col a',
    '.footer-col h4',
    '.section-label',
    '.badge',
    '.stat-label',
    '.dash-label',
    '.area-nav-btn',
    '.filter-tab',
    '.search-tab',
    '.hero-badge',
    '.breadcrumb span:not(.breadcrumb-sep)',
    '.view-all',
    '.btn-outline',
    '.why-point h4'
  ];

  const MIXED_SELECTORS = [
    '.section-title',
    '.page-hero h1',
    '.cta-section h2',
    '.hero h1'
  ];

  /*
============================================================
     5. FONT LOADER
     ============================================================ */

  const loadedFonts = new Set();

  function loadFont(fontName) {
    if (!fontName || loadedFonts.has(fontName)) {
      return;
    }

    loadedFonts.add(fontName);

    const link = document.createElement('link');

    link.rel = 'stylesheet';
    link.href =
      `https://fonts.googleapis.com/css2?family=${encodeURIComponent(fontName)}` +
      `:wght@400;500;600;700&display=swap`;

    document.head.appendChild(link);
  }

  /* ============================================================
     6. CSS FOR LANGUAGE DROPDOWN
     ============================================================ */

  function injectStyles() {
    if (document.getElementById('pfre-i18n-styles')) {
      return;
    }

    const style = document.createElement('style');

    style.id = 'pfre-i18n-styles';

    style.textContent = `
      .lang-dropdown {
        position: relative;
        display: inline-flex;
        align-items: center;
      }

      .lang-trigger {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 6px 12px;
        background: var(--off-white, #F8FAFC);
        border: 1px solid var(--border, #E2E8F0);
        border-radius: 10px;
        cursor: pointer;
        font-size: 13px;
        font-weight: 600;
        color: var(--text, #0F172A);
        transition:
          background 0.2s ease,
          border-color 0.2s ease,
          box-shadow 0.2s ease;
      }

      .lang-trigger:hover {
        border-color: var(--blue, #2563EB);
        background: #FFFFFF;
      }

      .lang-trigger:focus-visible {
        outline: 2px solid var(--blue, #2563EB);
        outline-offset: 2px;
      }

      .lang-menu {
        position: absolute;
        top: calc(100% + 8px);
        right: 0;
        width: 240px;
        max-width: calc(100vw - 24px);
        background: #FFFFFF;
        border: 1px solid var(--border, #E2E8F0);
        border-radius: 14px;
        box-shadow: 0 16px 36px rgba(0, 0, 0, 0.12);
        display: none;
        z-index: 10000;
        overflow: hidden;
        animation: pfre-i18n-drop-in 0.15s ease-out;
      }

      .lang-menu.open {
        display: block;
      }

      .lang-menu-header {
        padding: 10px 14px;
        font-size: 11px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        border-bottom: 1px solid var(--border, #E2E8F0);
        color: var(--text-muted, #64748B);
      }

      .lang-menu-scroll {
        max-height: 320px;
        overflow-y: auto;
        padding: 4px;
      }

      .lang-option {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 12px;
        border-radius: 8px;
        cursor: pointer;
        font-size: 13px;
        transition: background 0.15s ease;
      }

      .lang-option:hover,
      .lang-option:focus-visible {
        background: var(--off-white, #F1F5F9);
        outline: none;
      }

      .lang-option.active {
        background: rgba(37, 99, 235, 0.10);
        color: var(--blue, #2563EB);
        font-weight: 700;
      }

      .lo-flag {
        width: 22px;
        flex: 0 0 22px;
        text-align: center;
      }

      .lo-native {
        flex: 1;
        font-weight: 600;
      }

      .lo-english {
        font-size: 11px;
        opacity: 0.6;
      }

      [data-theme="dark"] .lang-menu {
        background: #0F1729;
        border-color: #1E293B;
        color: #F8FAFC;
      }

      [data-theme="dark"] .lang-trigger {
        background: #1E293B;
        border-color: #334155;
        color: #F8FAFC;
      }

      [data-theme="dark"] .lang-trigger:hover {
        background: #273449;
      }

      [data-theme="dark"] .lang-menu-header {
        border-color: #1E293B;
        color: #94A3B8;
      }

      [data-theme="dark"] .lang-option:hover,
      [data-theme="dark"] .lang-option:focus-visible {
        background: #1E293B;
      }

      @keyframes pfre-i18n-drop-in {
        from {
          opacity: 0;
          transform: translateY(-6px);
        }

        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @media (max-width: 480px) {
        .lang-menu {
          right: -8px;
          width: 220px;
        }

        .lang-trigger {
          padding: 6px 9px;
        }

        .lang-name {
          max-width: 90px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }
    `;

    document.head.appendChild(style);
  }

  /* ============================================================
     7. STORAGE
     ============================================================ */

  function getLang() {
    try {
      const stored = localStorage.getItem('pfre_lang');

      return LANG_META[stored] ? stored : 'en';
    } catch (_) {
      return 'en';
    }
  }

  function saveLang(lang) {
    try {
      localStorage.setItem('pfre_lang', lang);
    } catch (_) {
      /* Storage may be unavailable in private/restricted contexts. */
    }
  }

  /* ============================================================
     8. SAFE TEXT TRANSLATION
     ============================================================ */

  function safeTranslateElement(el, map) {
    if (!el) {
      return;
    }

    /*
     * Element contains only text.
     * Store the original English text once so switching between
     * languages never attempts to translate an already translated
     * string.
     */
    if (el.children.length === 0) {
      if (!el.hasAttribute('data-pfre-en')) {
        const original = el.textContent.trim();

        if (original) {
          el.setAttribute('data-pfre-en', original);
        }
      }

      const original =
        el.getAttribute('data-pfre-en') || '';

      if (!original) {
        return;
      }

      const translated =
        map[original] ||
        T.en[original] ||
        original;

      if (el.textContent !== translated) {
        el.textContent = translated;
      }

      return;
    }

    /*
     * Mixed HTML content.
     *
     * Example:
     *
     * <h1>
     *   Find <em>Your Perfect Property</em>
     * </h1>
     *
     * Only text nodes are changed.
     * Child elements remain untouched.
     */
    el.childNodes.forEach(node => {
      if (node.nodeType !== Node.TEXT_NODE) {
        return;
      }

      const raw = node.textContent;
      const trimmed = raw.trim();

      if (!trimmed) {
        return;
      }

      if (!node._pfreOriginalText) {
        node._pfreOriginalText = trimmed;
        node._pfreOriginalRaw = raw;
      }

      const original = node._pfreOriginalText;

      const translated =
        map[original] ||
        T.en[original] ||
        original;

      const originalRaw =
        node._pfreOriginalRaw || raw;

      node.textContent =
        originalRaw.replace(original, translated);
    });
  }

  /* ============================================================
     9. TEXT-BASED TRANSLATION
     ============================================================ */

  function translate(lang) {
    const safeLang =
      LANG_META[lang] ? lang : 'en';

    const map =
      T[safeLang] || T.en;

    SAFE_SELECTORS.forEach(selector => {
      document.querySelectorAll(selector).forEach(el => {
        safeTranslateElement(el, map);
      });
    });

    MIXED_SELECTORS.forEach(selector => {
      document.querySelectorAll(selector).forEach(el => {
        safeTranslateElement(el, map);
      });
    });

    /*
     * Placeholder translation.
     */
    document
      .querySelectorAll('input[placeholder], textarea[placeholder]')
      .forEach(input => {
        if (!input.hasAttribute('data-pfre-en-ph')) {
          input.setAttribute(
            'data-pfre-en-ph',
            input.placeholder
          );
        }

        const original =
          input.getAttribute('data-pfre-en-ph') || '';

        if (!original) {
          return;
        }

        const translated =
          map[original] ||
          T.en[original] ||
          original;

        input.placeholder = translated;
      });

    /*
     * Apply language direction and font.
     */
    const meta =
      LANG_META[safeLang] || LANG_META.en;

    if (meta.font) {
      loadFont(meta.font);
    }

    document.documentElement.lang = safeLang;
    document.documentElement.dir = meta.dir || 'ltr';

    if (document.body) {
      document.body.style.fontFamily =
        meta.font
          ? `'${meta.font}', 'DM Sans', sans-serif`
          : '';
    }
  }

  /* ============================================================
     10. DATA-I18N TRANSLATION
     ============================================================ */

  function applyDataI18n(lang) {
    const safeLang =
      LANG_META[lang] ? lang : 'en';

    const keys =
      I18N_KEYS[safeLang] || I18N_KEYS.en;

    const fallback =
      I18N_KEYS.en;

    /*
     * data-i18n
     *
     * Example:
     *
     * <button data-i18n="btn.search">
     *   Search
     * </button>
     */
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.dataset.i18n;

      if (!key) {
        return;
      }

      const value =
        keys[key] ||
        fallback[key];

      if (!value) {
        return;
      }

      /*
       * Pure text element.
       */
      if (el.children.length === 0) {
        el.textContent = value;
        return;
      }

      /*
       * Mixed HTML element.
       *
       * Example:
       *
       * <button data-i18n="btn.call">
       *   <svg>...</svg>
       *   Call Now
       * </button>
       */
      el.childNodes.forEach(node => {
        if (node.nodeType !== Node.TEXT_NODE) {
          return;
        }

        const raw = node.textContent;
        const trimmed = raw.trim();

        if (!trimmed) {
          return;
        }

        if (!node._pfreI18nOriginal) {
          node._pfreI18nOriginal = trimmed;
          node._pfreI18nRaw = raw;
        }

        const original =
          node._pfreI18nOriginal;

        /*
         * Normally the data-i18n key determines the translation.
         * If a text node has its own matching key, preserve it.
         */
        const nodeTranslation =
          keys[original] ||
          fallback[original] ||
          value;

        const originalRaw =
          node._pfreI18nRaw || raw;

        node.textContent =
          originalRaw.replace(
            original,
            nodeTranslation
          );
      });
    });

    /*
     * data-i18n-ph
     */
    document
      .querySelectorAll('[data-i18n-ph]')
      .forEach(el => {
        const key = el.dataset.i18nPh;

        if (!key) {
          return;
        }

        const value =
          keys[key] ||
          fallback[key];

        if (value) {
          el.placeholder = value;
        }
      });

    /*
     * data-i18n-aria
     */
    document
      .querySelectorAll('[data-i18n-aria]')
      .forEach(el => {
        const key = el.dataset.i18nAria;

        if (!key) {
          return;
        }

        const value =
          keys[key] ||
          fallback[key];

        if (value) {
          el.setAttribute(
            'aria-label',
            value
          );
        }
      });
  }

  /*
============================================================
     11. LANGUAGE DROPDOWN
     ============================================================ */

  function buildDropdown() {
    if (document.getElementById('langDropdown')) {
      return;
    }

    injectStyles();

    const currentLang = getLang();

    const currentMeta =
      LANG_META[currentLang] ||
      LANG_META.en;

    const wrap =
      document.createElement('div');

    wrap.id = 'langDropdown';
    wrap.className = 'lang-dropdown';

    const options =
      Object.entries(LANG_META)
        .map(([code, meta]) => {
          const active =
            code === currentLang;

          return `
            <div
              class="lang-option${active ? ' active' : ''}"
              role="option"
              aria-selected="${active}"
              data-lang="${code}"
              tabindex="0"
            >
              <span class="lo-flag">${meta.flag}</span>
              <span class="lo-native">${meta.native}</span>
              <span class="lo-english">${meta.name}</span>
            </div>
          `;
        })
        .join('');

    wrap.innerHTML = `
      <button
        type="button"
        class="lang-trigger"
        id="langTrigger"
        aria-haspopup="listbox"
        aria-expanded="false"
        aria-label="Select language"
      >
        <span
          class="lang-flag"
          id="ldFlag"
        >${currentMeta.flag}</span>

        <span
          class="lang-name"
          id="ldName"
        >${currentMeta.native}</span>

        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
          aria-hidden="true"
        >
          <path d="M6 9l6 6 6-6"></path>
        </svg>
      </button>

      <div
        class="lang-menu"
        id="langMenu"
        role="listbox"
        aria-label="Language options"
      >
        <div class="lang-menu-header">
          🌐 Select Language
        </div>

        <div class="lang-menu-scroll">
          ${options}
        </div>
      </div>
    `;

    /*
     * Find the preferred insertion point.
     */
    const hamburger =
      document.getElementById('hamburger');

    const navActions =
      document.querySelector('.nav-actions');

    if (hamburger && hamburger.parentNode) {
      hamburger.parentNode.insertBefore(
        wrap,
        hamburger
      );
    } else if (navActions) {
      navActions.appendChild(wrap);
    } else {
      /*
       * If the expected navigation elements do not
       * exist, do not throw an error.
       */
      return;
    }

    const trigger =
      wrap.querySelector('#langTrigger');

    const menu =
      wrap.querySelector('#langMenu');

    if (!trigger || !menu) {
      return;
    }

    /* ----------------------------------------------------------
       Toggle
       ---------------------------------------------------------- */

    trigger.addEventListener('click', event => {
      event.stopPropagation();

      const open =
        menu.classList.toggle('open');

      trigger.setAttribute(
        'aria-expanded',
        String(open)
      );
    });

    /* ----------------------------------------------------------
       Outside click
       ---------------------------------------------------------- */

    document.addEventListener('click', event => {
      if (!wrap.contains(event.target)) {
        menu.classList.remove('open');

        trigger.setAttribute(
          'aria-expanded',
          'false'
        );
      }
    });

    /* ----------------------------------------------------------
       Language selection
       ---------------------------------------------------------- */

    menu
      .querySelectorAll('.lang-option')
      .forEach(option => {

        const chooseLanguage = event => {
          if (event) {
            event.stopPropagation();
          }

          const lang =
            option.dataset.lang;

          if (!lang || !LANG_META[lang]) {
            return;
          }

          setLang(lang);

          menu.classList.remove('open');

          trigger.setAttribute(
            'aria-expanded',
            'false'
          );
        };

        option.addEventListener(
          'click',
          chooseLanguage
        );

        option.addEventListener(
          'keydown',
          event => {
            if (
              event.key === 'Enter' ||
              event.key === ' '
            ) {
              event.preventDefault();
              chooseLanguage(event);
            }
          }
        );
      });

    /* ----------------------------------------------------------
       Escape
       ---------------------------------------------------------- */

    document.addEventListener(
      'keydown',
      event => {
        if (event.key !== 'Escape') {
          return;
        }

        menu.classList.remove('open');

        trigger.setAttribute(
          'aria-expanded',
          'false'
        );

        trigger.focus();
      }
    );
  }

  /* ============================================================
     12. DROPDOWN DISPLAY UPDATE
     ============================================================ */

  function updateDropdownDisplay(lang) {
    const meta =
      LANG_META[lang] ||
      LANG_META.en;

    const flag =
      document.getElementById('ldFlag');

    const name =
      document.getElementById('ldName');

    if (flag) {
      flag.textContent = meta.flag;
    }

    if (name) {
      name.textContent = meta.native;
    }

    document
      .querySelectorAll('.lang-option')
      .forEach(option => {

        const active =
          option.dataset.lang === lang;

        option.classList.toggle(
          'active',
          active
        );

        option.setAttribute(
          'aria-selected',
          String(active)
        );
      });
  }

  /* ============================================================
     13. SET LANGUAGE
     ============================================================ */

  function setLang(lang) {
    /*
     * Never allow an invalid language code.
     */
    if (!LANG_META[lang]) {
      lang = 'en';
    }

    saveLang(lang);

    translate(lang);
    applyDataI18n(lang);
    updateDropdownDisplay(lang);

    /*
     * Optional PFRE toast integration.
     */
    if (
      typeof window.showToast === 'function'
    ) {
      const meta =
        LANG_META[lang];

      window.showToast(
        `${meta.flag} ${meta.native} selected`,
        'success'
      );
    }

    /*
     * Optional custom event.
     *
     * Other PFRE website scripts can listen for:
     *
     * document.addEventListener(
     *   'pfre:languageChanged',
     *   event => console.log(event.detail.lang)
     * );
     */
    document.dispatchEvent(
      new CustomEvent(
        'pfre:languageChanged',
        {
          detail: {
            lang,
            meta: LANG_META[lang]
          }
        }
      )
    );
  }

  /* ============================================================
     14. GLOBAL MESSAGE GETTER
     ============================================================ */

  function getI18nMsg(key, lang) {
    const selectedLang =
      lang || getLang();

    const languageMap =
      I18N_KEYS[selectedLang] ||
      I18N_KEYS.en;

    return (
      languageMap[key] ||
      I18N_KEYS.en[key] ||
      key
    );
  }

  /* ============================================================
     15. REFRESH TRANSLATIONS
     ============================================================ */

  function refreshTranslations() {
    const lang = getLang();

    translate(lang);
    applyDataI18n(lang);
    updateDropdownDisplay(lang);
  }

  /* ============================================================
     16. GLOBAL API
     ============================================================ */

  window.setLang =
    setLang;

  window.getLang =
    getLang;

  window.getI18nMsg =
    getI18nMsg;

  window.refreshTranslations =
    refreshTranslations;

  /*
   * Optional read-only language metadata.
   *
   * Useful for other PFRE scripts.
   */
  window.PFRE_I18N = {
    languages: LANG_META,
    translations: T,
    keys: I18N_KEYS
  };

  /* ============================================================
     17. INITIALIZATION
     ============================================================ */

  function init() {
    buildDropdown();

    const lang =
      getLang();

    /*
     * Always apply the language.
     *
     * This also ensures <html lang> and <html dir>
     * are correct even when English is selected.
     */
    translate(lang);
    applyDataI18n(lang);
    updateDropdownDisplay(lang);
  }

  if (
    document.readyState === 'loading'
  ) {
    document.addEventListener(
      'DOMContentLoaded',
      init,
      { once: true }
    );
  } else {
    init();
  }

})();