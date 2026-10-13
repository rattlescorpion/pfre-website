/**
 * js/i18n.js
 * Property Finder Real Estate - Mumbai
 * Unified Internationalization Engine - Version 4.0
 * English + All 22 Scheduled Indian Languages
 */

(() => {
  'use strict';

  /* ============================================================
     1. LANGUAGE DEFINITIONS & METADATA
     ============================================================ */

  const LANG_META = {
    en: { name: 'English', native: 'English', flag: '🇮🇳', font: '', dir: 'ltr' },
    hi: { name: 'Hindi', native: 'हिंदी', flag: '🇮🇳', font: 'Noto Sans Devanagari', dir: 'ltr' },
    mr: { name: 'Marathi', native: 'मराठी', flag: '🇮🇳', font: 'Noto Sans Devanagari', dir: 'ltr' },
    gu: { name: 'Gujarati', native: 'ગુજરાતી', flag: '🇮🇳', font: 'Noto Sans Gujarati', dir: 'ltr' },
    ta: { name: 'Tamil', native: 'தமிழ்', flag: '🇮🇳', font: 'Noto Sans Tamil', dir: 'ltr' },
    te: { name: 'Telugu', native: 'తెలుగు', flag: '🇮🇳', font: 'Noto Sans Telugu', dir: 'ltr' },
    kn: { name: 'Kannada', native: 'ಕನ್ನಡ', flag: '🇮🇳', font: 'Noto Sans Kannada', dir: 'ltr' },
    ml: { name: 'Malayalam', native: 'മലയാളം', flag: '🇮🇳', font: 'Noto Sans Malayalam', dir: 'ltr' },
    bn: { name: 'Bengali', native: 'বাংলা', flag: '🇮🇳', font: 'Noto Sans Bengali', dir: 'ltr' },
    pa: { name: 'Punjabi', native: 'ਪੰਜਾਬੀ', flag: '🇮🇳', font: 'Noto Sans Gurmukhi', dir: 'ltr' },
    or: { name: 'Odia', native: 'ଓଡ଼ିଆ', flag: '🇮🇳', font: 'Noto Sans Oriya', dir: 'ltr' },
    as: { name: 'Assamese', native: 'অসমীয়া', flag: '🇮🇳', font: 'Noto Sans Bengali', dir: 'ltr' },
    ur: { name: 'Urdu', native: 'اردو', flag: '🇮🇳', font: 'Noto Nastaliq Urdu', dir: 'rtl' },
    kok: { name: 'Konkani', native: 'कोंकणी', flag: '🇮🇳', font: 'Noto Sans Devanagari', dir: 'ltr' },
    mai: { name: 'Maithili', native: 'मैथिली', flag: '🇮🇳', font: 'Noto Sans Devanagari', dir: 'ltr' },
    ks: { name: 'Kashmiri', native: 'کٲشُر', flag: '🇮🇳', font: 'Noto Nastaliq Urdu', dir: 'rtl' },
    sd: { name: 'Sindhi', native: 'سنڌي', flag: '🇮🇳', font: 'Noto Nastaliq Urdu', dir: 'rtl' },
    sa: { name: 'Sanskrit', native: 'संस्कृत', flag: '🇮🇳', font: 'Noto Sans Devanagari', dir: 'ltr' },
    ne: { name: 'Nepali', native: 'नेपाली', flag: '🇮🇳', font: 'Noto Sans Devanagari', dir: 'ltr' },
    doi: { name: 'Dogri', native: 'डोगरी', flag: '🇮🇳', font: 'Noto Sans Devanagari', dir: 'ltr' },
    mni: { name: 'Manipuri', native: 'মৈতৈলোন্', flag: '🇮🇳', font: 'Noto Sans Bengali', dir: 'ltr' },
    bo: { name: 'Bodo', native: 'बड़ो', flag: '🇮🇳', font: 'Noto Sans Devanagari', dir: 'ltr' },
    sat: { name: 'Santali', native: 'ᱥᱟᱱᱛᱟᱲᱤ', flag: '🇮🇳', font: 'Noto Sans Ol Chiki', dir: 'ltr' }
  };

  const STORAGE_KEY_PRIMARY = 'pfre_lang';
  const STORAGE_KEY_SECONDARY = 'pfre_language';
  const DEFAULT_LANG = 'en';

  /* ============================================================
     2. TEXT-BASED PHRASE TRANSLATION DICTIONARY
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
      'Ready to Find Your Perfect Property?': 'Ready to Find Your Perfect Property?',
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
      'Search by locality, project, or property type…': 'Search by locality, project, or property type…',
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
      'Browse Properties by Locality': 'इलाके के अनुसार संपत्तियां खोजें',
      'Client Stories': 'ग्राहकों के अनुभव',
      'What Our Clients Say': 'हमारे ग्राहक क्या कहते हैं',
      'Knowledge Hub': 'ज्ञान केंद्र',
      'Latest Insights': 'नवीनतम अपडेट्स',
      'Ready to Find Your Perfect Property?': 'क्या आप अपनी आदर्श संपत्ति खोजने के लिए तैयार हैं?',
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
      'Search by locality, project, or property type…': 'इलाके, प्रोजेक्ट या प्रकार द्वारा खोजें…',
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
      'Complete Real Estate Services': 'परिपूर्ण रिअल इस्टेट सेवा',
      'Why Choose Us': 'आम्हाला का निवडावे',
      'Featured Projects': 'प्रमुख प्रकल्प',
      'Browse Properties by Locality': 'परिसरानुसार मालमत्ता शोधा',
      'Client Stories': 'ग्राहकांचे अनुभव',
      'What Our Clients Say': 'आमचे ग्राहक काय म्हणतात',
      'Knowledge Hub': 'माहिती केंद्र',
      'Latest Insights': 'नवीनतम घडामोडी',
      'Ready to Find Your Perfect Property?': 'आपली परिपूर्ण मालमत्ता शोधण्यास तयार आहात?',
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
      'Search by locality, project, or property type…': 'परिसर, प्रकल्प किंवा प्रकारानुसार शोधा…',
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
      'All rights reserved.': 'அனைத்து உரிமைகளும் பாதுகாக்கப்பட்டவை.',
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
      'All rights reserved.': 'ಎಲ್ಲಾ ಹಕ್ಕುಗಳನ್ನು ಕಾಯ್ದಿರಿಸಲಾಗಿದೆ.',
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
      'brand.name': 'Property Finder Real Estate',
      'brand.tagline': 'Your Trusted Real Estate Partner in Mumbai',
      'brand.rera': 'MahaRERA: A51800000412',
      'brand.established': 'Established 2018',

      'nav.home': 'Home',
      'nav.properties': 'Properties',
      'nav.projects': 'Projects',
      'nav.services': 'Services',
      'nav.about': 'About Us',
      'nav.blog': 'Blog',
      'nav.contact': 'Contact Us',
      'nav.tools': 'Tools',
      'nav.careers': 'Careers',
      'nav.team': 'Our Team',
      'nav.faq': 'FAQ',
      'nav.testimonials': 'Testimonials',
      'nav.calculators': 'Calculators',
      'nav.neighbourhoods': 'Neighbourhoods',
      'nav.admin': 'Admin Portal',
      'nav.crm': 'CRM & Directory',
      'nav.login': 'Agent Login',
      'nav.post_property': 'Post Property',
      'nav.call_now': 'Call +91 93269 90050',
      'nav.commercial': 'Commercial',
      'nav.residential': 'Residential',
      'nav.buy': 'Buy',
      'nav.rent': 'Rent',
      'nav.invest': 'Invest',

      'btn.search': 'Search',
      'btn.submit': 'Submit',
      'btn.call': 'Call Now',
      'btn.whatsapp': 'WhatsApp',
      'btn.apply': 'Apply Now',
      'btn.view_all': 'View All',
      'btn.read_more': 'Read More',
      'btn.post_free': 'Post Property FREE',
      'btn.get_quote': 'Get a Quote',
      'btn.enquire': 'Enquire Now',
      'btn.back': 'Go Back',
      'btn.clear': 'Clear',
      'btn.save': 'Save Property',
      'btn.export': 'Export CSV',
      'btn.print': 'Print',
      'btn.get_in_touch': 'Get In Touch',
      'btn.view_details': 'View Details',
      'btn.book_visit': 'Schedule Site Visit',
      'btn.filter': 'Filter Results',
      'btn.reset': 'Reset Filters',
      'btn.calculate': 'Calculate',
      'btn.explore_projects': 'Explore Projects',
      'btn.download_brochure': 'Download Brochure',
      'btn.share': 'Share Listing',
      'btn.close': 'Close',
      'btn.back_to_top': 'Back to Top',
      'btn.accept': 'Accept',
      'btn.decline': 'Decline',
      'btn.learn_more': 'Learn More',

      'hero.badge': 'MahaRERA Registered Real Estate Consultant',
      'hero.title': 'Find Your Ideal Home in Mumbai',
      'hero.subtitle': 'Verified residential apartments, outright resale flats, and commercial workspaces across Mumbai Western Suburbs.',
      'hero.search_placeholder': 'Search locality, project, or landmark…',
      'hero.tab_all': 'All Listings',
      'hero.tab_buy': 'Buy Property',
      'hero.tab_rent': 'Rent Property',
      'hero.tab_commercial': 'Commercial Space',

      'catalog.title': 'Browse Real Estate Listings',
      'catalog.subtitle': 'Handpicked premium properties with clear titles and OC adjudication.',
      'catalog.sort_label': 'Sort By',
      'catalog.sort_newest': 'Newest Additions',
      'catalog.sort_price_asc': 'Price: Low to High',
      'catalog.sort_price_desc': 'Price: High to Low',
      'catalog.sort_area_desc': 'Carpet Area: Largest First',
      'catalog.filter_locality': 'Select Locality',
      'catalog.filter_bhk': 'Bedrooms (BHK)',
      'catalog.filter_budget': 'Budget Range',
      'catalog.filter_status': 'Possession Status',
      'catalog.results_count': 'properties found matching your criteria',
      'catalog.no_results': 'No matching properties found. Try clearing your filters.',

      'prop.price_label': 'Quoted Price',
      'prop.carpet_area': 'Carpet Area',
      'prop.builtup_area': 'Built-up Area',
      'prop.configuration': 'Configuration',
      'prop.bathrooms': 'Bathrooms',
      'prop.balcony': 'Balconies',
      'prop.floor': 'Floor Level',
      'prop.total_floors': 'Total Floors',
      'prop.facing': 'Facing',
      'prop.furnishing': 'Furnishing Status',
      'prop.parking': 'Covered Parking',
      'prop.age': 'Property Age',
      'prop.ownership': 'Ownership Type',
      'prop.rera_id': 'MahaRERA Registration',
      'prop.possession': 'Possession Date',
      'prop.society_name': 'Society / Complex Name',
      'prop.address': 'Exact Address',
      'prop.amenities': 'Amenities & Features',
      'prop.overview': 'Property Overview',
      'prop.location_advantages': 'Location Advantages & Connectivity',
      'prop.floor_plan': 'Architectural Floor Plan',
      'prop.loan_available': 'Home Loan Pre-Approved by Major Banks',
      'prop.schedule_tour': 'Book a Free In-Person Site Inspection',
      'prop.ready_oc': 'Ready Possession with OC',
      'prop.under_construction': 'Under Construction',

      'spec.carpet': 'Carpet Area',
      'spec.bhk': 'Configuration',
      'spec.baths': 'Bathrooms',
      'spec.floor': 'Floor Level',
      'spec.rera': 'MahaRERA ID',

      'proj.badge': 'Premier New Launches & Townships',
      'proj.title': 'Top Residential & Commercial Projects',
      'proj.developer': 'Developer',
      'proj.starting_price': 'Starting From',
      'proj.possession_target': 'Target Possession',
      'proj.rera_approved': 'MahaRERA Approved Project',
      'proj.launch': 'New Launch',
      'proj.uc': 'Under Construction',
      'proj.ready': 'Ready to Move',

      'calc.title': 'Mumbai Real Estate Financial Calculators',
      'calc.subtitle': 'Accurate financial tools tailored for Maharashtra stamp duty, home loans, and property transactions.',
      'calc.emi_title': 'Home Loan EMI Calculator',
      'calc.loan_amount': 'Loan Amount (₹)',
      'calc.interest_rate': 'Interest Rate (% p.a.)',
      'calc.tenure_years': 'Tenure (Years)',
      'calc.monthly_emi': 'Monthly EMI',
      'calc.principal_amount': 'Total Principal',
      'calc.total_interest': 'Total Interest Payable',
      'calc.total_payment': 'Total Amount Payable',
      'calc.stamp_title': 'Maharashtra Stamp Duty & Registration Estimator',
      'calc.prop_value': 'Property Agreement Value (₹)',
      'calc.stamp_duty_payable': 'Estimated Stamp Duty (6%)',
      'calc.reg_charges': 'Registration Charges (Fixed ₹30,000 / 1%)',
      'calc.metro_cess': 'Metro Cess & Local Body Tax',
      'calc.total_government_cost': 'Total Government Charges',
      'calc.tds_title': 'Section 194-IA TDS Calculator (Property > ₹50 Lakhs)',
      'calc.tds_amount': 'TDS Deductible (1%)',
      'calc.net_to_seller': 'Net Payable to Seller (99%)',
      'calc.converter_title': 'Mumbai Land & Area Unit Converter',

      'form.name': 'Full Name',
      'form.phone': 'Phone / WhatsApp Number',
      'form.email': 'Email Address',
      'form.message': 'Your Requirement / Message',
      'form.budget': 'Budget Range',
      'form.locality': 'Preferred Locality',
      'form.config': 'Configuration',
      'form.intent': 'Looking to',
      'form.submit': 'Submit Inquiry',
      'form.required': 'This field is required',
      'form.invalid_phone': 'Please enter a valid 10-digit phone number',
      'form.invalid_email': 'Please enter a valid email address',

      'crm.title': 'Centralized Contact Directory & Real Estate CRM',
      'crm.total_contacts': 'Total Directory Contacts',
      'crm.active_buyers': 'Active Hot Buyers',
      'crm.active_landlords': 'Verified Landlords',
      'crm.channel_partners': 'Channel Partners',
      'crm.search_contacts': 'Search contacts by name, phone, PAN, or complex…',
      'crm.all_filter': 'All Records',
      'crm.vip_filter': 'VIP Starred',
      'crm.add_contact': 'Add New Contact',
      'crm.edit_contact': 'Edit Contact',
      'crm.delete_confirm': 'Are you sure you want to permanently delete this contact from the database?',
      'crm.phone_label': 'Primary Phone',
      'crm.wa_label': 'WhatsApp',
      'crm.rems_type': 'Contact Role',
      'crm.pan_label': 'PAN Number',
      'crm.sync_status': 'Synchronized with PostgreSQL Database',

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
      'footer.address': 'Shop No. 2, Ground Floor, Baf-Hira Nagar, Jankalyan Nagar Road, Malad West, Mumbai, Maharashtra 400095',
      'footer.hours': 'Office Hours: 10:00 AM – 8:00 PM',
      'footer.follow': 'Follow Us',
      'footer.quick': 'Quick Links',
      'footer.privacy_policy': 'Privacy Policy',
      'footer.terms': 'Terms of Service',

      'cookie.text': 'We use cookies and offline storage to ensure the fastest browsing performance for Mumbai real estate listings.',
      'cookie.accept': 'Accept Cookies',
      'cookie.decline': 'Decline',
      'offline.banner': 'You are currently browsing in offline mode. Cached listings remain accessible.',

      'misc.loading': 'Loading…',
      'misc.no_results': 'No results found',
      'misc.error': 'Something went wrong. Please try again.',
      'misc.success': 'Success!',
      'misc.copied': 'Copied to clipboard'
    },

    hi: {
      'brand.name': 'प्रॉपर्टी फाइंडर रियल एस्टेट',
      'brand.tagline': 'मुंबई में आपका विश्वसनीय रियल एस्टेट पार्टनर',
      'brand.rera': 'महारेरा: A51800000412',
      'brand.established': 'स्थापना २०१८',

      'nav.home': 'मुख्य पृष्ठ',
      'nav.properties': 'प्रॉपर्टीज',
      'nav.projects': 'प्रोजेक्ट्स',
      'nav.services': 'सेवाएं',
      'nav.about': 'हमारे बारे में',
      'nav.blog': 'ब्लॉग',
      'nav.contact': 'संपर्क करें',
      'nav.tools': 'टूल्स',
      'nav.careers': 'करियर',
      'nav.team': 'हमारी टीम',
      'nav.faq': 'अक्सर पूछे जाने वाले सवाल',
      'nav.testimonials': 'समीक्षाएं',
      'nav.calculators': 'कैलकुलेटर',
      'nav.neighbourhoods': 'इलाके और लोकेलिटी',
      'nav.admin': 'एडमिन पोर्टल',
      'nav.crm': 'सीआरएम और डायरेक्टरी',
      'nav.login': 'एजेंट लॉगिन',
      'nav.post_property': 'प्रॉपर्टी लिस्ट करें',
      'nav.call_now': 'कॉल करें +91 93269 90050',
      'nav.commercial': 'कमर्शियल ऑफिस',
      'nav.residential': 'आवासीय फ्लैट्स',
      'nav.buy': 'खरीदें',
      'nav.rent': 'किराया',
      'nav.invest': 'निवेश',

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
      'btn.export': 'निर्यात CSV',
      'btn.print': 'प्रिंट करें',
      'btn.get_in_touch': 'संपर्क करें',
      'btn.view_details': 'विवरण देखें',
      'btn.book_visit': 'साइट विजिट बुक करें',
      'btn.filter': 'फ़िल्टर लगाएं',
      'btn.reset': 'रीसेट करें',
      'btn.calculate': 'गणना करें',
      'btn.explore_projects': 'प्रोजेक्ट्स देखें',
      'btn.download_brochure': 'ब्रोशर डाउनलोड करें',
      'btn.share': 'शेयर करें',
      'btn.close': 'बंद करें',
      'btn.back_to_top': 'ऊपर जाएं',
      'btn.accept': 'स्वीकार करें',
      'btn.decline': 'अस्वीकार करें',
      'btn.learn_more': 'और जानें',

      'hero.badge': 'महारेरा पंजीकृत रियल एस्टेट सलाहकार',
      'hero.title': 'मुंबई में अपना मनपसंद घर खोजें',
      'hero.subtitle': 'मुंबई वेस्टर्न सबर्ब्स में सत्यापित फ्लैट, रीसेल अपार्टमेंट और कमर्शियल ऑफिस स्पेस।',
      'hero.search_placeholder': 'इलाका, प्रोजेक्ट या लैंडमार्क खोजें…',
      'hero.tab_all': 'सभी प्रॉपर्टीज',
      'hero.tab_buy': 'घर खरीदें',
      'hero.tab_rent': 'किराए पर लें',
      'hero.tab_commercial': 'कमर्शियल स्पेस',

      'catalog.title': 'रियल एस्टेट लिस्टिंग्स देखें',
      'catalog.subtitle': 'साफ़ टाइटल और ओसी प्रमाणित प्रीमियम रेसिडेंशियल व कमर्शियल यूनिट्स।',
      'catalog.sort_label': 'क्रमबद्ध करें',
      'catalog.sort_newest': 'नवीनतम लिस्टिंग्स',
      'catalog.sort_price_asc': 'कीमत: कम से ज्यादा',
      'catalog.sort_price_desc': 'कीमत: ज्यादा से कम',
      'catalog.sort_area_desc': 'क्षेत्रफल: बड़ा पहले',
      'catalog.filter_locality': 'इलाका चुनें',
      'catalog.filter_bhk': 'कमरे (बीएचके)',
      'catalog.filter_budget': 'बजट सीमा',
      'catalog.filter_status': 'पजेशन स्थिति',
      'catalog.results_count': 'प्रॉपर्टीज आपकी पसंद के अनुसार उपलब्ध हैं',
      'catalog.no_results': 'कोई मेल खाती प्रॉपर्टी नहीं मिली। कृपया फ़िल्टर बदलें।',

      'prop.price_label': 'मांगी गई कीमत',
      'prop.carpet_area': 'कारपेट एरिया',
      'prop.builtup_area': 'बिल्ट-अप एरिया',
      'prop.configuration': 'कॉन्फ़िगरेशन',
      'prop.bathrooms': 'बाथरूम्स',
      'prop.balcony': 'बालकनी',
      'prop.floor': 'मंजिल क्रमांक',
      'prop.total_floors': 'कुल मंजिलें',
      'prop.facing': 'दिशा / फेसिंग',
      'prop.furnishing': 'फर्निशिंग की स्थिति',
      'prop.parking': 'कवर्ड पार्किंग',
      'prop.age': 'इमारत की उम्र',
      'prop.ownership': 'स्वामित्व का प्रकार',
      'prop.rera_id': 'महारेरा रजिस्ट्रेशन नंबर',
      'prop.possession': 'पजेशन तारीख',
      'prop.society_name': 'सोसायटी / बिल्डिंग का नाम',
      'prop.address': 'सटीक पता',
      'prop.amenities': 'सुविधाएं और एमेनिटीज',
      'prop.overview': 'प्रॉपर्टी का विवरण',
      'prop.location_advantages': 'आसपास की कनेक्टिविटी और सुविधाएं',
      'prop.floor_plan': 'फ्लोर प्लान',
      'prop.loan_available': 'प्रमुख बैंकों द्वारा होम लोन प्री-अप्रूव्ड',
      'prop.schedule_tour': 'निःशुल्क साइट विजिट बुक करें',
      'prop.ready_oc': 'ओसी प्राप्त रेडी पजेशन',
      'prop.under_construction': 'निर्माणाधीन प्रोजेक्ट',

      'spec.carpet': 'कारपेट एरिया',
      'spec.bhk': 'कॉन्फ़िगरेशन',
      'spec.baths': 'बाथरूम',
      'spec.floor': 'मंजिल',
      'spec.rera': 'महारेरा क्रमांक',

      'proj.badge': 'प्रीमियम नए प्रोजेक्ट्स और टाउनशिप्स',
      'proj.title': 'प्रमुख आवासीय और व्यावसायिक टाउनशिप',
      'proj.developer': 'डेवलपर / बिल्डर',
      'proj.starting_price': 'शुरुआती कीमत',
      'proj.possession_target': 'पजेशन समय सीमा',
      'proj.rera_approved': 'महारेरा अधिकृत प्रोजेक्ट',
      'proj.launch': 'नया लॉन्च',
      'proj.uc': 'निर्माणाधीन',
      'proj.ready': 'रेडी टू मूव',

      'calc.title': 'मुंबई रियल एस्टेट वित्तीय कैलकुलेटर',
      'calc.subtitle': 'महाराष्ट्र स्टाम्प ड्यूटी, होम लोन ईएमआई और प्रॉपर्टी टैक्स की सटीक गणना।',
      'calc.emi_title': 'होम लोन ईएमआई कैलकुलेटर',
      'calc.loan_amount': 'लोन राशि (₹)',
      'calc.interest_rate': 'ब्याज दर (% वार्षिक)',
      'calc.tenure_years': 'अवधि (वर्ष)',
      'calc.monthly_emi': 'मासिक ईएमआई',
      'calc.principal_amount': 'मूलधन राशि',
      'calc.total_interest': 'कुल देय ब्याज',
      'calc.total_payment': 'कुल भुगतान राशि',
      'calc.stamp_title': 'महाराष्ट्र स्टाम्प ड्यूटी और रजिस्ट्रेशन अनुमानक',
      'calc.prop_value': 'प्रॉपर्टी एग्रीमेंट वैल्यू (₹)',
      'calc.stamp_duty_payable': 'अनुमानित स्टाम्प ड्यूटी (६%)',
      'calc.reg_charges': 'रजिस्ट्रेशन शुल्क (निश्चित ₹३०,००० / १%)',
      'calc.metro_cess': 'मेट्रो सेस एवं स्थानीय कर (१%)',
      'calc.total_government_cost': 'कुल सरकारी शुल्क',
      'calc.tds_title': 'धारा 194-IA टीडीएस कैलकुलेटर (₹५० लाख से अधिक)',
      'calc.tds_amount': 'काटने योग्य टीडीएस (१%)',
      'calc.net_to_seller': 'विक्रेता को देय शुद्ध राशि (९९%)',
      'calc.converter_title': 'भूमि और क्षेत्रफल इकाई परिवर्तक',

      'form.name': 'पूरा नाम',
      'form.phone': 'फ़ोन / व्हाट्सएप नंबर',
      'form.email': 'ईमेल पता',
      'form.message': 'आपकी आवश्यकता / संदेश',
      'form.budget': 'बजट सीमा',
      'form.locality': 'पसंदीदा इलाका',
      'form.config': 'विन्यास',
      'form.intent': 'इरादा',
      'form.submit': 'पूछताछ भेजें',
      'form.required': 'यह फ़ील्ड आवश्यक है',
      'form.invalid_phone': 'कृपया वैध 10-अंकीय फ़ोन नंबर दर्ज करें',
      'form.invalid_email': 'कृपया वैध ईमेल पता दर्ज करें',

      'crm.title': 'केंद्रीय संपर्क निर्देशिका एवं रियल एस्टेट सीआरएम',
      'crm.total_contacts': 'कुल डायरेक्टरी संपर्क',
      'crm.active_buyers': 'सक्रिय खरीदार',
      'crm.active_landlords': 'सत्यापित मकान मालिक',
      'crm.channel_partners': 'चैनल पार्टनर्स',
      'crm.search_contacts': 'नाम, फोन, पैन या सोसायटी द्वारा खोजें…',
      'crm.all_filter': 'सभी रिकॉर्ड्स',
      'crm.vip_filter': 'वीआईपी स्टार रिकॉर्ड्स',
      'crm.add_contact': 'नया संपर्क जोड़ें',
      'crm.edit_contact': 'संपर्क संपादित करें',
      'crm.delete_confirm': 'क्या आप वाकई इस संपर्क को डेटाबेस से स्थायी रूप से हटाना चाहते हैं?',
      'crm.phone_label': 'प्राथमिक फोन',
      'crm.wa_label': 'व्हाट्सएप',
      'crm.rems_type': 'संपर्क भूमिका',
      'crm.pan_label': 'पैन कार्ड नंबर',
      'crm.sync_status': 'पोस्टग्रेस डेटाबेस के साथ सिंक स्थिति सक्रिय',

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
      'footer.address': 'दुकान क्र. २, बाफ-हीरा नगर, जानकल्याण नगर रोड, मालाड वेस्ट, मुंबई - ४०००९५',
      'footer.hours': 'कार्यालय समय: प्रातः 10:00 से रात्रि 8:00 तक',
      'footer.follow': 'हमें फॉलो करें',
      'footer.quick': 'त्वरित लिंक',
      'footer.privacy_policy': 'गोपनीयता नीति',
      'footer.terms': 'सेवा की शर्तें',

      'cookie.text': 'हम मुंबई रियल एस्टेट लिस्टिंग्स को त्वरित लोड करने के लिए कुकीज़ और ऑफ़लाइन स्टोरेज का उपयोग करते हैं।',
      'cookie.accept': 'स्वीकार करें',
      'cookie.decline': 'अस्वीकार करें',
      'offline.banner': 'आप वर्तमान में ऑफ़लाइन मोड में हैं। कैश्ड प्रॉपर्टीज उपलब्ध हैं।',

      'misc.loading': 'लोड हो रहा है…',
      'misc.no_results': 'कोई परिणाम नहीं मिला',
      'misc.error': 'कुछ गलत हुआ। कृपया पुनः प्रयास करें।',
      'misc.success': 'सफलता!',
      'misc.copied': 'क्लिपबोर्ड में कॉपी किया'
    },

    mr: {
      'brand.name': 'प्रॉपर्टी फाइंडर रिअल इस्टेट',
      'brand.tagline': 'मुंबईतील आपला विश्वासू रिअल इस्टेट भागीदार',
      'brand.rera': 'महारेरा: A51800000412',
      'brand.established': 'स्थापना २०१८',

      'nav.home': 'मुख्य पान',
      'nav.properties': 'प्रॉपर्टीज',
      'nav.projects': 'प्रकल्प',
      'nav.services': 'सेवा',
      'nav.about': 'आमच्याबद्दल',
      'nav.blog': 'ब्लॉग',
      'nav.contact': 'संपर्क साधा',
      'nav.tools': 'साधने',
      'nav.careers': 'करिअर',
      'nav.team': 'आमची टीम',
      'nav.faq': 'नेहमी विचारले जाणारे प्रश्न',
      'nav.testimonials': 'अभिप्राय',
      'nav.calculators': 'कॅल्क्युलेटर',
      'nav.neighbourhoods': 'परिसर आणि विभाग',
      'nav.admin': 'प्रशासक पोर्टल',
      'nav.crm': 'सीआरएम व संपर्क सूची',
      'nav.login': 'प्रतिनिधी लॉगिन',
      'nav.post_property': 'प्रॉपर्टी पोस्ट करा',
      'nav.call_now': 'कॉल करा +91 93269 90050',
      'nav.commercial': 'व्यावसायिक जागा',
      'nav.residential': 'निवासी सदनिका',
      'nav.buy': 'खरेदी',
      'nav.rent': 'भाडेतत्त्व',
      'nav.invest': 'गुंतवणूक',

      'btn.search': 'शोधा',
      'btn.submit': 'सादर करा',
      'btn.call': 'कॉल करा',
      'btn.whatsapp': 'व्हाट्सअॅप',
      'btn.apply': 'अर्ज करा',
      'btn.view_all': 'सर्व पाहा',
      'btn.read_more': 'अधिक वाचा',
      'btn.post_free': 'मोफत पोस्ट करा',
      'btn.get_quote': 'कोटेशन मिळवा',
      'btn.enquire': 'चौकशी पाठवा',
      'btn.back': 'मागे जा',
      'btn.clear': 'साफ करा',
      'btn.save': 'जतन करा',
      'btn.export': 'निर्यात CSV',
      'btn.print': 'प्रिंट',
      'btn.get_in_touch': 'संपर्क साधा',
      'btn.view_details': 'माहिती पहा',
      'btn.book_visit': 'जागा पाहण्यासाठी वेळ ठरवा',
      'btn.filter': 'फिल्टर लावा',
      'btn.reset': 'मूळ स्थितीत आणा',
      'btn.calculate': 'गणना करा',
      'btn.explore_projects': 'प्रकल्प पहा',
      'btn.download_brochure': 'माहितीपुस्तिका डाउनलोड करा',
      'btn.share': 'शेअर करा',
      'btn.close': 'बंद करा',
      'btn.back_to_top': 'वर जा',
      'btn.accept': 'स्वीकारा',
      'btn.decline': 'नाकारा',
      'btn.learn_more': 'अधिक जाणून घ्या',

      'hero.badge': 'महारेरा नोंदणीकृत सल्लागार',
      'hero.title': 'मुंबईत आपले स्वप्नातील घर शोधा',
      'hero.subtitle': 'मालाड, गोरेगाव, अंधेरी आणि बोरिवली परिसरात खात्रीशीर घरे व कार्यालये.',
      'hero.search_placeholder': 'परिसर, प्रकल्प किंवा खूण शोधा…',
      'hero.tab_all': 'सर्व प्रॉपर्टीज',
      'hero.tab_buy': 'घर खरेदी',
      'hero.tab_rent': 'भाडेतत्त्वावर',
      'hero.tab_commercial': 'व्यावसायिक जागा',

      'catalog.title': 'रिअल इस्टेट सूची पहा',
      'catalog.subtitle': 'स्पष्ट टायटल आणि भोगवटा प्रमाणपत्र (ओसी) असलेल्या दर्जेदार सदनिका.',
      'catalog.sort_label': 'क्रमवारी लावा',
      'catalog.sort_newest': 'नवीनतम नोंदी',
      'catalog.sort_price_asc': 'किंमत: कमी ते जास्त',
      'catalog.sort_price_desc': 'किंमत: जास्त ते कमी',
      'catalog.sort_area_desc': 'क्षेत्रफळ: मोठे प्रथम',
      'catalog.filter_locality': 'परिसर निवडा',
      'catalog.filter_bhk': 'खोल्या (बीएचके)',
      'catalog.filter_budget': 'बजेट मर्यादा',
      'catalog.filter_status': 'ताबा स्थिती',
      'catalog.results_count': 'प्रॉपर्टीज उपलब्ध आहेत',
      'catalog.no_results': 'कोणतीही प्रॉपर्टी आढळली नाही. कृपया फिल्टर तपासा.',

      'prop.price_label': 'अपेक्षित किंमत',
      'prop.carpet_area': 'कार्पेट क्षेत्रफळ',
      'prop.builtup_area': 'बिल्ट-अप क्षेत्रफळ',
      'prop.configuration': 'रचना',
      'prop.bathrooms': 'स्नानगृहे',
      'prop.balcony': 'गॅलरी',
      'prop.floor': 'मजला क्रमांक',
      'prop.total_floors': 'एकूण मजले',
      'prop.facing': 'दिशा',
      'prop.furnishing': 'फर्निशिंग स्थिती',
      'prop.parking': 'पार्किंग सुविधा',
      'prop.age': 'इमारतीचे वय',
      'prop.ownership': 'मालकी प्रकार',
      'prop.rera_id': 'महारेरा नोंदणी क्रमांक',
      'prop.possession': 'ताबा मिळण्याची तारीख',
      'prop.society_name': 'सोसायटीचे नाव',
      'prop.address': 'संपूर्ण पत्ता',
      'prop.amenities': 'सुविधा आणि वैशिष्ट्ये',
      'prop.overview': 'प्रॉपर्टीचा आढावा',
      'prop.location_advantages': 'परिसरातील दळणवळण व सुविधा',
      'prop.floor_plan': 'फ्लोअर प्लॅन',
      'prop.loan_available': 'बँकांद्वारे गृहकर्ज पूर्वमंजूर',
      'prop.schedule_tour': 'जागा पाहण्यासाठी विनामूल्य नोंदणी करा',
      'prop.ready_oc': 'ओसी प्राप्त तातडीचा ताबा',
      'prop.under_construction': 'बांधकाम सुरू असलेला प्रकल्प',

      'spec.carpet': 'कार्पेट क्षेत्रफळ',
      'spec.bhk': 'रचना',
      'spec.baths': 'स्नानगृह',
      'spec.floor': 'मजला',
      'spec.rera': 'महारेरा नोंदणी क्र.',

      'proj.badge': 'नवीन निवासी व व्यावसायिक प्रकल्प',
      'proj.title': 'मुंबईतील नामांकित गृहप्रकल्प',
      'proj.developer': 'बांधकाम व्यावसायिक',
      'proj.starting_price': 'किमान किंमत',
      'proj.possession_target': 'ताबा देण्याचा कालावधी',
      'proj.rera_approved': 'महारेरा मान्यताप्राप्त प्रकल्प',
      'proj.launch': 'नवीन लाँच',
      'proj.uc': 'बांधकाम सुरू',
      'proj.ready': 'राहण्यासाठी सज्ज',

      'calc.title': 'मुंबई रिअल इस्टेट आर्थिक कॅल्क्युलेटर',
      'calc.subtitle': 'महाराष्ट्र मुद्रांक शुल्क, गृहकर्ज ईएमआय आणि करविषयक अचूक माहिती.',
      'calc.emi_title': 'गृहकर्ज ईएमआय कॅल्क्युलेटर',
      'calc.loan_amount': 'कर्ज रक्कम (₹)',
      'calc.interest_rate': 'व्याजदर (% वार्षिक)',
      'calc.tenure_years': 'कालावधी (वर्षे)',
      'calc.monthly_emi': 'मासिक हप्ता (ईएमआय)',
      'calc.principal_amount': 'मुद्दल रक्कम',
      'calc.total_interest': 'एकूण देय व्याज',
      'calc.total_payment': 'एकूण परतफेड रक्कम',
      'calc.stamp_title': 'महाराष्ट्र मुद्रांक शुल्क व नोंदणी शुल्क गणक',
      'calc.prop_value': 'दस्तऐवज करार मूल्य (₹)',
      'calc.stamp_duty_payable': 'अपेक्षित मुद्रांक शुल्क (६%)',
      'calc.reg_charges': 'नोंदणी फी (निश्चित ₹३०,००० किंवा १%)',
      'calc.metro_cess': 'मेट्रो उपकर व स्थानिक अधिभार (१%)',
      'calc.total_government_cost': 'एकूण शासकीय शुल्क',
      'calc.tds_title': 'कलम 194-IA टीडीएस कॅल्क्युलेटर (₹५० लाखांपेक्षा जास्त)',
      'calc.tds_amount': 'वजा करावयाचा टीडीएस (१%)',
      'calc.net_to_seller': 'विक्रेत्यास देय निव्वळ रक्कम (९९%)',
      'calc.converter_title': 'जमीन व क्षेत्रफळ रूपांतरक',

      'form.name': 'पूर्ण नाव',
      'form.phone': 'फोन / व्हॉट्सअ‍ॅप क्रमांक',
      'form.email': 'ईमेल पत्ता',
      'form.message': 'तुमची आवश्यकता / संदेश',
      'form.budget': 'अपेक्षित बजेट',
      'form.locality': 'पसंतीचे ठिकाण',
      'form.config': 'रचना',
      'form.intent': 'गरज',
      'form.submit': 'चौकशी पाठवा',
      'form.required': 'हे फील्ड आवश्यक आहे',
      'form.invalid_phone': 'कृपया वैध १० अंकी फोन नंबर प्रविष्ट करा',
      'form.invalid_email': 'कृपया वैध ईमेल पत्ता प्रविष्ट करा',

      'crm.title': 'मध्यवर्ती संपर्क सूची व रिअल इस्टेट सीआरएम',
      'crm.total_contacts': 'एकूण संपर्क संख्या',
      'crm.active_buyers': 'सक्रिय ग्राहक (खरेदीदार)',
      'crm.active_landlords': 'नोंदणीकृत घरमालक',
      'crm.channel_partners': 'चॅनेल पार्टनर्स',
      'crm.search_contacts': 'नाव, फोन, पॅन किंवा इमारतीवरून शोधा…',
      'crm.all_filter': 'सर्व नोंदी',
      'crm.vip_filter': 'महत्त्वाचे संपर्क (व्हीआयपी)',
      'crm.add_contact': 'नवीन संपर्क जोडा',
      'crm.edit_contact': 'संपर्क संपादित करा',
      'crm.delete_confirm': 'आपण खात्रीने हा संपर्क डेटाबेसमधून कायमचा काढून टाकू इच्छिता?',
      'crm.phone_label': 'मुख्य फोन',
      'crm.wa_label': 'व्हॉट्सअ‍ॅप',
      'crm.rems_type': 'संपर्काची भूमिका',
      'crm.pan_label': 'पॅन कार्ड क्रमांक',
      'crm.sync_status': 'पोस्टग्रेस डेटाबेस समक्रमित',

      'label.for_sale': 'विक्रीसाठी',
      'label.for_rent': 'भाड्यासाठी',
      'label.new_launch': 'नवीन लॉन्च',
      'label.ready': 'लगेच राहण्यायोग्य',
      'label.under_construction': 'बांधकाम सुरू',
      'label.commercial': 'व्यावसायिक',
      'label.bhk_1': '१ बीएचके',
      'label.bhk_2': '२ बीएचके',
      'label.bhk_3': '३ बीएचके',
      'label.plot': 'प्लॉट / जमीन',

      'footer.rights': 'सर्व हक्क राखीव.',
      'footer.address': 'दुकान क्र. २, बाफ-हीरा नगर, जनकल्याण नगर रोड, मालाड पश्चिम, मुंबई - ४०००९५',
      'footer.hours': 'कार्यालयीन वेळ: सकाळी १०:०० ते रात्री ८:००',
      'footer.follow': 'आम्हाला फॉलो करा',
      'footer.quick': 'जलद दुवे',
      'footer.privacy_policy': 'गोपनीयता धोरण',
      'footer.terms': 'नियम व अटी',

      'cookie.text': 'आम्ही वेबसाइट जलद चालण्यासाठी कुकीज व ऑफलाइन स्टोरेजचा वापर करतो.',
      'cookie.accept': 'स्वीकारा',
      'cookie.decline': 'नाकारा',
      'offline.banner': 'आपण सध्या ऑफलाइन मोडमध्ये आहात. संग्रहित माहिती उपलब्ध आहे.',

      'misc.loading': 'लोड होत आहे…',
      'misc.no_results': 'कोणतेही परिणाम आढळले नाहीत',
      'misc.error': 'काहीतरी चूक झाली. पुन्हा प्रयत्न करा.',
      'misc.success': 'यशस्वी!',
      'misc.copied': 'क्लिपबोर्डवर कॉपी केले'
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
      'footer.rights': 'அனைத்து உரிமைகளும் பாதுகாக்கப்பட்டவை.'
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
      'footer.rights': 'ಎಲ್ಲಾ ಹಕ್ಕುಗಳನ್ನು ಕಾಯ್ದಿರಿಸಲಾಗಿದೆ.'
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
      'footer.rights': 'എല്ലാ അവകാശങ്ങളും നിക്ഷിപ്തം.'
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
     4. ELEMENT SELECTORS
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

  /* ============================================================
     5. DYNAMIC GOOGLE FONT LOADER
     ============================================================ */

  const loadedFonts = new Set();

  function loadFont(fontName) {
    if (!fontName || loadedFonts.has(fontName)) {
      return;
    }
    loadedFonts.add(fontName);
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(fontName)}:wght@400;500;600;700&display=swap`;
    document.head.appendChild(link);
  }

  /* ============================================================
     6. CSS INJECTION FOR ACCESSIBLE LANGUAGE DROPDOWN
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
        transition: background 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
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
     7. LOCAL PERSISTENCE
     ============================================================ */

  function getLang() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_PRIMARY) || localStorage.getItem(STORAGE_KEY_SECONDARY);
      return LANG_META[stored] ? stored : DEFAULT_LANG;
    } catch (_) {
      return DEFAULT_LANG;
    }
  }

  function saveLang(lang) {
    try {
      localStorage.setItem(STORAGE_KEY_PRIMARY, lang);
      localStorage.setItem(STORAGE_KEY_SECONDARY, lang);
    } catch (_) {
      /* Storage quota exceeded or private browsing context */
    }
  }

  /* ============================================================
     8. SAFE TEXT TRANSLATION ENGINE
     ============================================================ */

  function safeTranslateElement(el, map) {
    if (!el) {
      return;
    }

    if (el.children.length === 0) {
      if (!el.hasAttribute('data-pfre-en')) {
        const original = el.textContent.trim();
        if (original) {
          el.setAttribute('data-pfre-en', original);
        }
      }

      const original = el.getAttribute('data-pfre-en') || '';
      if (!original) {
        return;
      }

      const translated = map[original] || T.en[original] || original;
      if (el.textContent !== translated) {
        el.textContent = translated;
      }
      return;
    }

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
      const translated = map[original] || T.en[original] || original;
      const originalRaw = node._pfreOriginalRaw || raw;

      node.textContent = originalRaw.replace(original, translated);
    });
  }

  /* ============================================================
     9. TEXT-BASED TRANSLATION
     ============================================================ */

  function translate(lang) {
    const safeLang = LANG_META[lang] ? lang : DEFAULT_LANG;
    const map = T[safeLang] || T.en;

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

    document.querySelectorAll('input[placeholder], textarea[placeholder]').forEach(input => {
      if (!input.hasAttribute('data-pfre-en-ph')) {
        input.setAttribute('data-pfre-en-ph', input.placeholder);
      }

      const original = input.getAttribute('data-pfre-en-ph') || '';
      if (!original) {
        return;
      }

      const translated = map[original] || T.en[original] || original;
      input.placeholder = translated;
    });

    const meta = LANG_META[safeLang] || LANG_META.en;
    if (meta.font) {
      loadFont(meta.font);
    }

    document.documentElement.lang = safeLang;
    document.documentElement.dir = meta.dir || 'ltr';

    if (document.body) {
      document.body.style.fontFamily = meta.font
        ? `'${meta.font}', 'DM Sans', sans-serif`
        : '';
    }
  }

  /* ============================================================
     10. KEY-BASED DATA ATTRIBUTE TRANSLATION
     ============================================================ */

  function applyDataI18n(lang) {
    const safeLang = LANG_META[lang] ? lang : DEFAULT_LANG;
    const keys = I18N_KEYS[safeLang] || I18N_KEYS.en;
    const fallback = I18N_KEYS.en;

    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (!key) {
        return;
      }

      const value = keys[key] || fallback[key] || T[safeLang]?.[key] || T.en[key];
      if (!value) {
        return;
      }

      if (el.children.length === 0) {
        el.textContent = value;
        return;
      }

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

        const original = node._pfreI18nOriginal;
        const nodeTranslation = keys[original] || fallback[original] || value;
        const originalRaw = node._pfreI18nRaw || raw;

        node.textContent = originalRaw.replace(original, nodeTranslation);
      });
    });

    document.querySelectorAll('[data-i18n-html]').forEach(el => {
      const key = el.getAttribute('data-i18n-html');
      if (!key) return;
      const htmlContent = keys[key] || fallback[key] || T[safeLang]?.[key] || T.en[key];
      if (htmlContent) {
        el.innerHTML = htmlContent;
      }
    });

    document.querySelectorAll('[data-i18n-placeholder], [data-i18n-ph]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder') || el.getAttribute('data-i18n-ph');
      if (!key) return;
      const value = keys[key] || fallback[key] || T[safeLang]?.[key] || T.en[key];
      if (value) {
        el.placeholder = value;
      }
    });

    document.querySelectorAll('[data-i18n-title]').forEach(el => {
      const key = el.getAttribute('data-i18n-title');
      if (!key) return;
      const value = keys[key] || fallback[key] || T[safeLang]?.[key] || T.en[key];
      if (value) {
        el.setAttribute('title', value);
      }
    });

    document.querySelectorAll('[data-i18n-aria]').forEach(el => {
      const key = el.getAttribute('data-i18n-aria');
      if (!key) return;
      const value = keys[key] || fallback[key] || T[safeLang]?.[key] || T.en[key];
      if (value) {
        el.setAttribute('aria-label', value);
      }
    });

    document.querySelectorAll('[data-i18n-value]').forEach(el => {
      const key = el.getAttribute('data-i18n-value');
      if (!key) return;
      const value = keys[key] || fallback[key] || T[safeLang]?.[key] || T.en[key];
      if (value) {
        el.value = value;
      }
    });
  }

  /* ============================================================
     11. ACCESSIBLE DROPDOWN BUILDER
     ============================================================ */

  function buildDropdown() {
    if (document.getElementById('langDropdown')) {
      return;
    }

    injectStyles();

    const currentLang = getLang();
    const currentMeta = LANG_META[currentLang] || LANG_META.en;

    const wrap = document.createElement('div');
    wrap.id = 'langDropdown';
    wrap.className = 'lang-dropdown';

    const options = Object.entries(LANG_META)
      .map(([code, meta]) => {
        const active = code === currentLang;
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
        <span class="lang-flag" id="ldFlag">${currentMeta.flag}</span>
        <span class="lang-name" id="ldName">${currentMeta.native}</span>
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
        <div class="lang-menu-header">🌐 Select Language</div>
        <div class="lang-menu-scroll">${options}</div>
      </div>
    `;

    const hamburger = document.getElementById('hamburger') || document.querySelector('.hamburger');
    const navActions = document.querySelector('.nav-actions');

    if (hamburger && hamburger.parentNode) {
      hamburger.parentNode.insertBefore(wrap, hamburger);
    } else if (navActions) {
      navActions.appendChild(wrap);
    } else {
      return;
    }

    const trigger = wrap.querySelector('#langTrigger');
    const menu = wrap.querySelector('#langMenu');

    if (!trigger || !menu) {
      return;
    }

    trigger.addEventListener('click', event => {
      event.stopPropagation();
      const open = menu.classList.toggle('open');
      trigger.setAttribute('aria-expanded', String(open));
    });

    document.addEventListener('click', event => {
      if (!wrap.contains(event.target)) {
        menu.classList.remove('open');
        trigger.setAttribute('aria-expanded', 'false');
      }
    });

    menu.querySelectorAll('.lang-option').forEach(option => {
      const chooseLanguage = event => {
        if (event) {
          event.stopPropagation();
        }
        const lang = option.getAttribute('data-lang');
        if (!lang || !LANG_META[lang]) {
          return;
        }
        setLang(lang);
        menu.classList.remove('open');
        trigger.setAttribute('aria-expanded', 'false');
      };

      option.addEventListener('click', chooseLanguage);
      option.addEventListener('keydown', event => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          chooseLanguage(event);
        }
      });
    });

    document.addEventListener('keydown', event => {
      if (event.key !== 'Escape') {
        return;
      }
      menu.classList.remove('open');
      trigger.setAttribute('aria-expanded', 'false');
      trigger.focus();
    });
  }

  /* ============================================================
     12. DROPDOWN UI SYNCHRONIZATION
     ============================================================ */

  function updateDropdownDisplay(lang) {
    const meta = LANG_META[lang] || LANG_META.en;
    const flag = document.getElementById('ldFlag');
    const name = document.getElementById('ldName');

    if (flag) {
      flag.textContent = meta.flag;
    }
    if (name) {
      name.textContent = meta.native;
    }

    document.querySelectorAll('.lang-option').forEach(option => {
      const active = option.getAttribute('data-lang') === lang;
      option.classList.toggle('active', active);
      option.setAttribute('aria-selected', String(active));
    });

    const legacySelects = document.querySelectorAll('.lang-switcher-select, #langSelect');
    legacySelects.forEach(sel => {
      sel.value = lang;
    });
  }

  /* ============================================================
     13. CURRENCY & MEASUREMENT FORMATTERS
     ============================================================ */

  function formatCurrency(amount, lang) {
    const activeLang = lang || getLang();
    const num = Number(amount);
    if (isNaN(num)) return '₹0';

    if (num >= 10000000) {
      const cr = (num / 10000000).toFixed(2).replace(/\.00$/, '');
      if (activeLang === 'hi') return '₹' + cr + ' करोड़';
      if (activeLang === 'mr') return '₹' + cr + ' कोटी';
      return '₹' + cr + ' Cr';
    }

    if (num >= 100000) {
      const lk = (num / 100000).toFixed(2).replace(/\.00$/, '');
      if (activeLang === 'hi') return '₹' + lk + ' लाख';
      if (activeLang === 'mr') return '₹' + lk + ' लाख';
      return '₹' + lk + ' Lakh';
    }

    return '₹' + num.toLocaleString('en-IN');
  }

  function formatArea(sqft, lang) {
    const activeLang = lang || getLang();
    const num = Number(sqft);
    if (isNaN(num)) return '0 sq.ft';

    if (activeLang === 'hi') return num.toLocaleString('en-IN') + ' वर्ग फुट';
    if (activeLang === 'mr') return num.toLocaleString('en-IN') + ' चौ. फूट';
    return num.toLocaleString('en-IN') + ' sq.ft';
  }

  /* ============================================================
     14. GLOBAL SET LANGUAGE CONTROLLER
     ============================================================ */

  function setLang(lang) {
    if (!LANG_META[lang]) {
      lang = DEFAULT_LANG;
    }

    saveLang(lang);
    translate(lang);
    applyDataI18n(lang);
    updateDropdownDisplay(lang);

    if (typeof window.showToast === 'function') {
      const meta = LANG_META[lang];
      window.showToast(`${meta.flag} ${meta.native} selected`, 'success');
    }

    const eventPayload = { detail: { lang, language: lang, meta: LANG_META[lang] } };
    document.dispatchEvent(new CustomEvent('pfre:languageChanged', eventPayload));
    window.dispatchEvent(new CustomEvent('pfre:languageChanged', eventPayload));
  }

  /* ============================================================
     15. GLOBAL MESSAGE GETTERS & UTILITIES
     ============================================================ */

  function getI18nMsg(key, lang) {
    const selectedLang = lang || getLang();
    const languageMap = I18N_KEYS[selectedLang] || I18N_KEYS.en;
    if (languageMap && languageMap[key]) {
      return languageMap[key];
    }
    if (T[selectedLang] && T[selectedLang][key]) {
      return T[selectedLang][key];
    }
    if (I18N_KEYS.en[key]) {
      return I18N_KEYS.en[key];
    }
    if (T.en[key]) {
      return T.en[key];
    }
    return key;
  }

  function refreshTranslations() {
    const lang = getLang();
    translate(lang);
    applyDataI18n(lang);
    updateDropdownDisplay(lang);
  }

  /* ============================================================
     16. GLOBAL APIS & BACKWARD COMPATIBILITY
     ============================================================ */

  window.setLang = setLang;
  window.getLang = getLang;
  window.getI18nMsg = getI18nMsg;
  window.refreshTranslations = refreshTranslations;

  window.pfreI18n = {
    setLanguage: setLang,
    getLanguage: getLang,
    t: getI18nMsg,
    translatePage: refreshTranslations,
    formatCurrency: formatCurrency,
    formatArea: formatArea,
    supportedLanguages: Object.keys(LANG_META),
    translations: I18N_KEYS,
    textDictionary: T,
    meta: LANG_META
  };

  window.PFRE_I18N = {
    languages: LANG_META,
    translations: T,
    keys: I18N_KEYS,
    formatCurrency: formatCurrency,
    formatArea: formatArea
  };

  /* ============================================================
     17. INITIALIZATION LIFECYCLE
     ============================================================ */

  function init() {
    buildDropdown();
    const lang = getLang();
    translate(lang);
    applyDataI18n(lang);
    updateDropdownDisplay(lang);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();