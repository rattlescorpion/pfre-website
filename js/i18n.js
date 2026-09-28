/* =====================================================
   PROPERTY FINDER RE — i18n v3.0
   All 22 Official Indian Languages + English
   Custom dropdown · HTML-safe translation
   ===================================================== */
(() => {
  'use strict';

  /* ══ ALL 22 SCHEDULED LANGUAGES + ENGLISH ══ */
  const LANG_META = {
    en:  { name:'English',      native:'English',        flag:'🇬🇧', font:'',                          dir:'ltr' },
    hi:  { name:'Hindi',        native:'हिंदी',           flag:'🇮🇳', font:'Noto Sans Devanagari',       dir:'ltr' },
    mr:  { name:'Marathi',      native:'मराठी',           flag:'🇮🇳', font:'Noto Sans Devanagari',       dir:'ltr' },
    gu:  { name:'Gujarati',     native:'ગુજરાતી',          flag:'🇮🇳', font:'Noto Sans Gujarati',         dir:'ltr' },
    ta:  { name:'Tamil',        native:'தமிழ்',           flag:'🇮🇳', font:'Noto Sans Tamil',            dir:'ltr' },
    te:  { name:'Telugu',       native:'తెలుగు',           flag:'🇮🇳', font:'Noto Sans Telugu',           dir:'ltr' },
    kn:  { name:'Kannada',      native:'ಕನ್ನಡ',            flag:'🇮🇳', font:'Noto Sans Kannada',          dir:'ltr' },
    ml:  { name:'Malayalam',    native:'മലയാളം',           flag:'🇮🇳', font:'Noto Sans Malayalam',        dir:'ltr' },
    bn:  { name:'Bengali',      native:'বাংলা',            flag:'🇮🇳', font:'Noto Sans Bengali',          dir:'ltr' },
    pa:  { name:'Punjabi',      native:'ਪੰਜਾਬੀ',            flag:'🇮🇳', font:'Noto Sans Gurmukhi',         dir:'ltr' },
    or:  { name:'Odia',         native:'ଓଡ଼ିଆ',            flag:'🇮🇳', font:'Noto Sans Oriya',            dir:'ltr' },
    as:  { name:'Assamese',     native:'অসমীয়া',           flag:'🇮🇳', font:'Noto Sans Bengali',          dir:'ltr' },
    ur:  { name:'Urdu',         native:'اردو',             flag:'🇮🇳', font:'Noto Nastaliq Urdu',         dir:'rtl' },
    kok: { name:'Konkani',      native:'कोंकणी',            flag:'🇮🇳', font:'Noto Sans Devanagari',       dir:'ltr' },
    mai: { name:'Maithili',     native:'मैथिली',            flag:'🇮🇳', font:'Noto Sans Devanagari',       dir:'ltr' },
    ks:  { name:'Kashmiri',     native:'کٲشُر',            flag:'🇮🇳', font:'Noto Nastaliq Urdu',         dir:'rtl' },
    sd:  { name:'Sindhi',       native:'سنڌي',             flag:'🇮🇳', font:'Noto Nastaliq Urdu',         dir:'rtl' },
    sa:  { name:'Sanskrit',     native:'संस्कृत',            flag:'🇮🇳', font:'Noto Sans Devanagari',       dir:'ltr' },
    ne:  { name:'Nepali',       native:'नेपाली',            flag:'🇮🇳', font:'Noto Sans Devanagari',       dir:'ltr' },
    doi: { name:'Dogri',        native:'डोगरी',             flag:'🇮🇳', font:'Noto Sans Devanagari',       dir:'ltr' },
    mni: { name:'Manipuri',     native:'মৈতৈলোন্',           flag:'🇮🇳', font:'Noto Sans Bengali',          dir:'ltr' },
    bo:  { name:'Bodo',         native:'बड़ो',               flag:'🇮🇳', font:'Noto Sans Devanagari',       dir:'ltr' },
    sat: { name:'Santali',      native:'ᱥᱟᱱᱛᱟᱲᱤ',           flag:'🇮🇳', font:'Noto Sans Ol Chiki',         dir:'ltr' }
  };

  /* ══ TRANSLATIONS ══ */
  const T = {
    en: {
      'Home':'Home','Properties':'Properties','Projects':'Projects',
      'Services':'Services','About':'About','Tools':'Tools',
      'Blog':'Blog','Contact':'Contact','Our Team':'Our Team',
      'About Us':'About Us','Testimonials':'Testimonials','FAQ':'FAQ',
      'NRI Corner':'NRI Corner','All Properties':'All Properties',
      'Neighbourhoods':'Neighbourhoods','Calculators':'Calculators',
      'TDS Calculators':'TDS Calculators','Measurement Converter':'Measurement Converter',
      'Property Insurance':'Property Insurance','Price Trends':'Price Trends',
      'Reminders':'Reminders','Get In Touch':'Get In Touch',
      'Call Now':'Call Now','WhatsApp Us':'WhatsApp Us',
      'View All':'View All','Read More':'Read More','Search':'Search',
      'Browse Properties':'Browse Properties','Post Property FREE':'Post Property FREE',
      'For Sale':'For Sale','For Rent':'For Rent','New Launch':'New Launch',
      'Ready to Move In':'Ready to Move In','Under Construction':'Under Construction',
      'Commercial':'Commercial','Featured Properties':'Featured Properties',
      'Our Services':'Our Services','Quick Links':'Quick Links',
      'Privacy Policy':'Privacy Policy','All rights reserved.':'All rights reserved.',
      'Beds':'Beds','Baths':'Baths','sq.ft':'sq.ft','Buy':'Buy','Rent':'Rent',
      'Office Hours':'Office Hours','Office Address':'Office Address'
    },
    hi: {
      'Home':'होम','Properties':'संपत्ति','Projects':'प्रोजेक्ट',
      'Services':'सेवाएं','About':'हमारे बारे में','Tools':'उपकरण',
      'Blog':'ब्लॉग','Contact':'संपर्क','Our Team':'हमारी टीम',
      'About Us':'हमारे बारे में','Testimonials':'प्रशंसापत्र',
      'FAQ':'अक्सर पूछे जाने वाले सवाल','NRI Corner':'एनआरआई कॉर्नर',
      'All Properties':'सभी संपत्तियां','Neighbourhoods':'इलाके',
      'Calculators':'कैलकुलेटर','TDS Calculators':'टीडीएस कैलकुलेटर',
      'Measurement Converter':'माप कनवर्टर','Property Insurance':'संपत्ति बीमा',
      'Price Trends':'मूल्य रुझान','Reminders':'अनुस्मारक',
      'Get In Touch':'संपर्क करें','Call Now':'अभी कॉल करें',
      'WhatsApp Us':'व्हाट्सएप करें','View All':'सभी देखें',
      'Read More':'और पढ़ें','Search':'खोजें',
      'Browse Properties':'संपत्ति ब्राउज़ करें','Post Property FREE':'संपत्ति मुफ्त पोस्ट करें',
      'For Sale':'बिक्री के लिए','For Rent':'किराए के लिए',
      'New Launch':'नई लॉन्च','Ready to Move In':'तुरंत बसने योग्य',
      'Under Construction':'निर्माणाधीन','Commercial':'व्यावसायिक',
      'Featured Properties':'विशेष संपत्तियां','Our Services':'हमारी सेवाएं',
      'Quick Links':'त्वरित लिंक','Privacy Policy':'गोपनीयता नीति',
      'All rights reserved.':'सर्वाधिकार सुरक्षित।',
      'Beds':'बेडरूम','Baths':'बाथरूम','sq.ft':'वर्ग फुट',
      'Buy':'खरीदें','Rent':'किराया',
      'Office Hours':'कार्यालय समय','Office Address':'कार्यालय का पता'
    },
    mr: {
      'Home':'मुखपृष्ठ','Properties':'मालमत्ता','Projects':'प्रकल्प',
      'Services':'सेवा','About':'आमच्याबद्दल','Tools':'साधने',
      'Blog':'ब्लॉग','Contact':'संपर्क','Our Team':'आमची टीम',
      'About Us':'आमच्याबद्दल','Testimonials':'अभिप्राय',
      'FAQ':'वारंवार विचारले जाणारे प्रश्न','NRI Corner':'एनआरआय कॉर्नर',
      'All Properties':'सर्व मालमत्ता','Neighbourhoods':'परिसर',
      'Calculators':'कॅल्क्युलेटर','TDS Calculators':'टीडीएस कॅल्क्युलेटर',
      'Measurement Converter':'माप रूपांतरक','Property Insurance':'मालमत्ता विमा',
      'Price Trends':'किंमत कल','Reminders':'स्मरणपत्रे',
      'Get In Touch':'संपर्क करा','Call Now':'आत्ता कॉल करा',
      'WhatsApp Us':'व्हाट्सअॅप करा','View All':'सर्व पाहा',
      'Read More':'अधिक वाचा','Search':'शोधा',
      'Browse Properties':'मालमत्ता पाहा','Post Property FREE':'मालमत्ता मोफत पोस्ट करा',
      'For Sale':'विक्रीसाठी','For Rent':'भाड्यासाठी',
      'New Launch':'नवीन लॉन्च','Ready to Move In':'लगेच राहण्यायोग्य',
      'Under Construction':'बांधकाम सुरू','Commercial':'व्यावसायिक',
      'Featured Properties':'विशेष मालमत्ता','Our Services':'आमच्या सेवा',
      'Quick Links':'जलद दुवे','Privacy Policy':'गोपनीयता धोरण',
      'All rights reserved.':'सर्व हक्क राखीव.',
      'Beds':'बेडरूम','Baths':'बाथरूम','sq.ft':'चौ.फूट',
      'Buy':'खरेदी','Rent':'भाडे',
      'Office Hours':'कार्यालयीन वेळ','Office Address':'कार्यालयाचा पत्ता'
    },
    gu: {
      'Home':'ઘર','Properties':'મિલ્કત','Projects':'પ્રોજેક્ટ',
      'Services':'સેવાઓ','About':'અમારા વિશે','Tools':'સાધનો',
      'Blog':'બ્લૉગ','Contact':'સંપર્ક','Our Team':'અમારી ટીમ',
      'Testimonials':'પ્રશંસાપત્ર','FAQ':'વારંવાર પૂછાતા પ્રશ્નો',
      'All Properties':'બધી મિલ્કત','Calculators':'કૅલ્ક્યુલેટર',
      'Get In Touch':'સંપર્ક કરો','Call Now':'હવે કૉલ કરો',
      'WhatsApp Us':'વ્હૉટ્સએપ કરો','View All':'બધું જુઓ',
      'Read More':'વધુ વાંચો','Search':'શોધો',
      'For Sale':'વેચવા માટે','For Rent':'ભાડા માટે',
      'New Launch':'નવી લૉન્ચ','Ready to Move In':'તરત રહેવા યોગ્ય',
      'Under Construction':'નિર્માણ હેઠળ','Commercial':'વ્યાપારી',
      'Quick Links':'ઝડપી લિંક','Privacy Policy':'ગોપનીયતા નીતિ',
      'All rights reserved.':'સર્વ હક્કો અબાધિત.',
      'Beds':'બેડરૂમ','Baths':'બાથરૂમ','Buy':'ખરીદો','Rent':'ભાડું'
    },
    ta: {
      'Home':'முகப்பு','Properties':'சொத்துக்கள்','Projects':'திட்டங்கள்',
      'Services':'சேவைகள்','About':'எங்களைப் பற்றி','Tools':'கருவிகள்',
      'Blog':'வலைப்பதிவு','Contact':'தொடர்பு','Our Team':'எங்கள் குழு',
      'Testimonials':'சான்றுகள்','FAQ':'அடிக்கடி கேட்கப்படும் கேள்விகள்',
      'All Properties':'அனைத்து சொத்துகள்','Calculators':'கணிப்பான்கள்',
      'Get In Touch':'தொடர்பு கொள்ளுங்கள்','Call Now':'இப்போது அழைக்கவும்',
      'WhatsApp Us':'வாட்ஸ்அப் செய்யுங்கள்','View All':'அனைத்தையும் பார்க்க',
      'Read More':'மேலும் படிக்க','Search':'தேடு',
      'For Sale':'விற்பனைக்கு','For Rent':'வாடகைக்கு',
      'New Launch':'புதிய அறிமுகம்','Ready to Move In':'உடனடியாக குடியேறலாம்',
      'Under Construction':'கட்டுமானத்தில்','Commercial':'வணிக',
      'Quick Links':'விரைவு இணைப்புகள்','Privacy Policy':'தனியுரிமைக் கொள்கை',
      'All rights reserved.':'அனைத்து உரிமைகளும் பாதுகாக்கப்பட்டவை.',
      'Beds':'படுக்கையறைகள்','Baths':'குளியலறைகள்','Buy':'வாங்கு','Rent':'வாடகை'
    },
    te: {
      'Home':'హోమ్','Properties':'ఆస్తులు','Projects':'ప్రాజెక్టులు',
      'Services':'సేవలు','About':'మా గురించి','Tools':'సాధనాలు',
      'Blog':'బ్లాగ్','Contact':'సంప్రదించు','Our Team':'మా బృందం',
      'Testimonials':'సాక్ష్యాలు','FAQ':'తరచుగా అడిగే ప్రశ్నలు',
      'All Properties':'అన్ని ఆస్తులు','Calculators':'కాలిక్యులేటర్లు',
      'Get In Touch':'సంప్రదించండి','Call Now':'ఇప్పుడు కాల్ చేయండి',
      'WhatsApp Us':'వాట్సాప్ చేయండి','View All':'అన్నీ చూడండి',
      'Read More':'మరింత చదవండి','Search':'వెతకండి',
      'For Sale':'అమ్మకానికి','For Rent':'అద్దెకు',
      'New Launch':'కొత్త లాంచ్','Ready to Move In':'వెంటనే మారవచ్చు',
      'Under Construction':'నిర్మాణంలో','Commercial':'వాణిజ్య',
      'Quick Links':'త్వరిత లింకులు','Privacy Policy':'గోప్యతా విధానం',
      'All rights reserved.':'అన్ని హక్కులు సురక్షితం.',
      'Beds':'పడకగదులు','Baths':'బాత్రూమ్‌లు','Buy':'కొనండి','Rent':'అద్దె'
    },
    kn: {
      'Home':'ಮನೆ','Properties':'ಆಸ್ತಿಗಳು','Projects':'ಯೋಜನೆಗಳು',
      'Services':'ಸೇವೆಗಳು','About':'ನಮ್ಮ ಬಗ್ಗೆ','Tools':'ಉಪಕರಣಗಳು',
      'Blog':'ಬ್ಲಾಗ್','Contact':'ಸಂಪರ್ಕ','Our Team':'ನಮ್ಮ ತಂಡ',
      'Testimonials':'ಪ್ರಶಂಸಾ ಪತ್ರಗಳು','FAQ':'ಪದೇ ಪದೇ ಕೇಳಲಾಗುವ ಪ್ರಶ್ನೆಗಳು',
      'All Properties':'ಎಲ್ಲಾ ಆಸ್ತಿಗಳು','Calculators':'ಕ್ಯಾಲ್ಕುಲೇಟರ್‌ಗಳು',
      'Get In Touch':'ಸಂಪರ್ಕಿಸಿ','Call Now':'ಈಗ ಕರೆ ಮಾಡಿ',
      'WhatsApp Us':'ವಾಟ್ಸಾಪ್ ಮಾಡಿ','View All':'ಎಲ್ಲವನ್ನೂ ನೋಡಿ',
      'Read More':'ಇನ್ನಷ್ಟು ಓದಿ','Search':'ಹುಡುಕಿ',
      'For Sale':'ಮಾರಾಟಕ್ಕೆ','For Rent':'ಬಾಡಿಗೆಗೆ',
      'New Launch':'ಹೊಸ ಲಾಂಚ್','Ready to Move In':'ತಕ್ಷಣ ಹೋಗಬಹುದು',
      'Under Construction':'ನಿರ್ಮಾಣ ಹಂತದಲ್ಲಿ','Commercial':'ವಾಣಿಜ್ಯ',
      'Quick Links':'ತ್ವರಿತ ಲಿಂಕ್‌ಗಳು','Privacy Policy':'ಗೌಪ್ಯತಾ ನೀತಿ',
      'All rights reserved.':'ಎಲ್ಲಾ ಹಕ್ಕುಗಳನ್ನು ಕಾಯ್ದಿರಿಸಲಾಗಿದೆ.',
      'Beds':'ಮಲಗುವ ಕೋಣೆ','Baths':'ಸ್ನಾನಗೃಹ','Buy':'ಖರೀದಿಸಿ','Rent':'ಬಾಡಿಗೆ'
    },
    ml: {
      'Home':'ഹോം','Properties':'സ്വത്തുക്കൾ','Projects':'പ്രോജക്ടുകൾ',
      'Services':'സേവനങ്ങൾ','About':'ഞങ്ങളെക്കുറിച്ച്','Tools':'ഉപകരണങ്ങൾ',
      'Blog':'ബ്ലോഗ്','Contact':'ബന്ധപ്പെടുക','Our Team':'ഞങ്ങളുടെ ടീം',
      'Testimonials':'സാക്ഷ്യങ്ങൾ','FAQ':'പതിവ് ചോദ്യങ്ങൾ',
      'All Properties':'എല്ലാ സ്വത്തുക്കളും','Calculators':'കാൽക്കുലേറ്ററുകൾ',
      'Get In Touch':'ബന്ധപ്പെടുക','Call Now':'ഇപ്പോൾ വിളിക്കൂ',
      'WhatsApp Us':'വാട്ട്സ്ആപ്പ് ചെയ്യൂ','View All':'എല്ലാം കാണുക',
      'Read More':'കൂടുതൽ വായിക്കുക','Search':'തിരയുക',
      'For Sale':'വിൽക്കാൻ','For Rent':'വാടകയ്ക്ക്',
      'New Launch':'പുതിയ ലോഞ്ച്','Ready to Move In':'ഉടൻ മാറാം',
      'Under Construction':'നിർമ്മാണത്തിൽ','Commercial':'വാണിജ്യ',
      'Quick Links':'ദ്രുത ലിങ്കുകൾ','Privacy Policy':'സ്വകാര്യതാ നയം',
      'All rights reserved.':'എല്ലാ അവകാശങ്ങളും നിക്ഷിപ്തം.',
      'Beds':'കിടപ്പുമുറി','Baths':'കുളിമുറി','Buy':'വാങ്ങുക','Rent':'വാടക'
    },
    bn: {
      'Home':'হোম','Properties':'সম্পত্তি','Projects':'প্রকল্প',
      'Services':'সেবাসমূহ','About':'আমাদের সম্পর্কে','Tools':'সরঞ্জাম',
      'Blog':'ব্লগ','Contact':'যোগাযোগ','Our Team':'আমাদের দল',
      'Testimonials':'সাক্ষ্যসমূহ','FAQ':'প্রায়শই জিজ্ঞাসিত প্রশ্ন',
      'All Properties':'সকল সম্পত্তি','Calculators':'ক্যালকুলেটর',
      'Get In Touch':'যোগাযোগ করুন','Call Now':'এখনই কল করুন',
      'WhatsApp Us':'হোয়াটসঅ্যাপ করুন','View All':'সব দেখুন',
      'Read More':'আরও পড়ুন','Search':'খুঁজুন',
      'For Sale':'বিক্রয়ের জন্য','For Rent':'ভাড়ার জন্য',
      'New Launch':'নতুন লঞ্চ','Ready to Move In':'এখনই উঠতে পারবেন',
      'Under Construction':'নির্মাণাধীন','Commercial':'বাণিজ্যিক',
      'Quick Links':'দ্রুত লিঙ্ক','Privacy Policy':'গোপনীয়তা নীতি',
      'All rights reserved.':'সর্বস্বত্ব সংরক্ষিত।',
      'Beds':'শোওয়ার ঘর','Baths':'বাথরুম','Buy':'কিনুন','Rent':'ভাড়া'
    },
    pa: {
      'Home':'ਹੋਮ','Properties':'ਜਾਇਦਾਦ','Projects':'ਪ੍ਰੋਜੈਕਟ',
      'Services':'ਸੇਵਾਵਾਂ','About':'ਸਾਡੇ ਬਾਰੇ','Tools':'ਸਾਧਨ',
      'Blog':'ਬਲੌਗ','Contact':'ਸੰਪਰਕ','Our Team':'ਸਾਡੀ ਟੀਮ',
      'Testimonials':'ਪ੍ਰਸ਼ੰਸਾ ਪੱਤਰ','FAQ':'ਅਕਸਰ ਪੁੱਛੇ ਜਾਣ ਵਾਲੇ ਸਵਾਲ',
      'All Properties':'ਸਾਰੀਆਂ ਜਾਇਦਾਦਾਂ','Calculators':'ਕੈਲਕੁਲੇਟਰ',
      'Get In Touch':'ਸੰਪਰਕ ਕਰੋ','Call Now':'ਹੁਣੇ ਕਾਲ ਕਰੋ',
      'WhatsApp Us':'ਵਟਸਐਪ ਕਰੋ','View All':'ਸਭ ਵੇਖੋ',
      'Read More':'ਹੋਰ ਪੜ੍ਹੋ','Search':'ਖੋਜੋ',
      'For Sale':'ਵੇਚਣ ਲਈ','For Rent':'ਕਿਰਾਏ ਲਈ',
      'New Launch':'ਨਵੀਂ ਲਾਂਚ','Ready to Move In':'ਤੁਰੰਤ ਜਾ ਸਕਦੇ ਹੋ',
      'Under Construction':'ਉਸਾਰੀ ਅਧੀਨ','Commercial':'ਵਪਾਰਕ',
      'Quick Links':'ਤੇਜ਼ ਲਿੰਕ','Privacy Policy':'ਗੋਪਨੀਯਤਾ ਨੀਤੀ',
      'All rights reserved.':'ਸਾਰੇ ਅਧਿਕਾਰ ਸੁਰੱਖਿਅਤ।',
      'Beds':'ਸੌਣ ਵਾਲਾ ਕਮਰਾ','Baths':'ਬਾਥਰੂਮ','Buy':'ਖਰੀਦੋ','Rent':'ਕਿਰਾਇਆ'
    },
    ur: {
      'Home':'ہوم','Properties':'جائیداد','Projects':'پراجیکٹ',
      'Services':'خدمات','About':'ہمارے بارے میں','Tools':'آلات',
      'Blog':'بلاگ','Contact':'رابطہ','Our Team':'ہماری ٹیم',
      'Testimonials':'تعریفیں','FAQ':'اکثر پوچھے گئے سوالات',
      'All Properties':'تمام جائیدادیں','Calculators':'حساب کتاب',
      'Get In Touch':'رابطہ کریں','Call Now':'ابھی کال کریں',
      'WhatsApp Us':'واٹس ایپ کریں','View All':'سب دیکھیں',
      'Read More':'مزید پڑھیں','Search':'تلاش',
      'For Sale':'فروخت کے لیے','For Rent':'کرایہ کے لیے',
      'New Launch':'نئی لانچ','Quick Links':'فوری لنک',
      'Privacy Policy':'رازداری کی پالیسی',
      'All rights reserved.':'جملہ حقوق محفوظ ہیں۔',
      'Beds':'بیڈروم','Baths':'باتھ روم','Buy':'خریدیں','Rent':'کرایہ'
    }
    /* Other languages fall back to English for untranslated strings */
  };

  /* ── Lazy load Google Fonts for a script ── */
  const loadedFonts = new Set();
  function loadFont(fontName) {
    if (!fontName || loadedFonts.has(fontName)) return;
    loadedFonts.add(fontName);
    const l = document.createElement('link');
    l.rel = 'stylesheet';
    l.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(fontName)}:wght@400;600;700&display=swap`;
    document.head.appendChild(l);
  }

  /* ── HTML-safe translation (preserves child elements like <em>) ── */
  function safeTranslateEl(el, map) {
    if (el.children.length === 0) {
      const orig = el.getAttribute('data-en') || el.textContent.trim();
      if (!el.getAttribute('data-en') && orig) el.setAttribute('data-en', orig);
      const tx = map[orig] || T.en[orig];
      if (tx && tx !== orig) el.textContent = tx;
      return;
    }
    /* Mixed content — only walk text nodes, skip element children */
    el.childNodes.forEach(node => {
      if (node.nodeType !== Node.TEXT_NODE) return;
      const raw = node.textContent; const trimmed = raw.trim();
      if (!trimmed) return;
      if (!node._orig) node._orig = trimmed;
      const tx = map[node._orig] || T.en[node._orig];
      if (tx && tx !== node._orig) node.textContent = raw.replace(node._orig, tx);
    });
  }

  const SAFE_SEL = [
    '.nav-link','.mobile-menu a','.footer-col a','.footer-col h4',
    '.section-label','.badge','.stat-label','.dash-label','.area-nav-btn',
    '.filter-tab','.search-tab','.hero-badge','.breadcrumb span:not(.breadcrumb-sep)'
  ];
  const MIXED_SEL = ['.section-title','.page-hero h1','.cta-section h2'];

  function translate(lang) {
    const map = T[lang] || T.en;
    SAFE_SEL.forEach(s => document.querySelectorAll(s).forEach(el => safeTranslateEl(el, map)));
    MIXED_SEL.forEach(s => document.querySelectorAll(s).forEach(el => safeTranslateEl(el, map)));
    document.querySelectorAll('input[placeholder]').forEach(inp => {
      const orig = inp.getAttribute('data-en-ph') || inp.placeholder;
      if (!inp.getAttribute('data-en-ph')) inp.setAttribute('data-en-ph', orig);
      const tx = map[inp.getAttribute('data-en-ph')];
      if (tx) inp.placeholder = tx;
    });
    const meta = LANG_META[lang];
    if (meta) {
      if (meta.font) loadFont(meta.font);
      document.body.style.fontFamily = meta.font ? `'${meta.font}','DM Sans',sans-serif` : '';
      document.documentElement.dir = meta.dir || 'ltr';
    }
    document.documentElement.lang = lang;
  }

  /* ════════════════════════════════════
     CUSTOM LANGUAGE DROPDOWN
  ════════════════════════════════════ */
  function buildDropdown() {
    if (document.getElementById('langDropdown')) return;

    const cur = getLang();
    const curMeta = LANG_META[cur] || LANG_META.en;

    /* Wrapper */
    const wrap = document.createElement('div');
    wrap.id = 'langDropdown';
    wrap.className = 'lang-dropdown';
    wrap.innerHTML = `
      <button class="lang-trigger" id="langTrigger"
              aria-haspopup="listbox" aria-expanded="false"
              aria-label="Select language">
        <span class="lang-flag" id="ldFlag">${curMeta.flag}</span>
        <span class="lang-name" id="ldName">${curMeta.native}</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="2.5"><path d="M6 9l6 6 6-6"/></svg>
      </button>
      <div class="lang-menu" id="langMenu" role="listbox" aria-label="Language options">
        <div class="lang-menu-header">🌐 Select Language</div>
        <div class="lang-menu-scroll">
          ${Object.entries(LANG_META).map(([code, m]) =>
            `<div class="lang-option${code===cur?' active':''}" role="option"
                  aria-selected="${code===cur}" data-lang="${code}"
                  tabindex="0">
               <span class="lo-flag">${m.flag}</span>
               <span class="lo-native">${m.native}</span>
               <span class="lo-english">${m.name}</span>
             </div>`
          ).join('')}
        </div>
      </div>`;

    /* Insert before hamburger */
    const ham = document.getElementById('hamburger');
    if (ham) ham.parentNode.insertBefore(wrap, ham);

    /* Toggle dropdown */
    const trigger = document.getElementById('langTrigger');
    const menu    = document.getElementById('langMenu');
    trigger.addEventListener('click', e => {
      e.stopPropagation();
      const open = menu.classList.toggle('open');
      trigger.setAttribute('aria-expanded', String(open));
    });
    /* Close on outside click */
    document.addEventListener('click', () => {
      menu.classList.remove('open');
      trigger.setAttribute('aria-expanded', 'false');
    });
    /* Option click */
    menu.querySelectorAll('.lang-option').forEach(opt => {
      opt.addEventListener('click', e => {
        e.stopPropagation();
        setLang(opt.dataset.lang);
        menu.classList.remove('open');
        trigger.setAttribute('aria-expanded','false');
      });
      opt.addEventListener('keydown', e => { if (e.key === 'Enter') opt.click(); });
    });
    /* Close on Escape */
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') { menu.classList.remove('open'); trigger.setAttribute('aria-expanded','false'); }
    });
  }

  function updateDropdownDisplay(lang) {
    const meta = LANG_META[lang] || LANG_META.en;
    const flag = document.getElementById('ldFlag');
    const name = document.getElementById('ldName');
    if (flag) flag.textContent = meta.flag;
    if (name) name.textContent = meta.native;
    document.querySelectorAll('.lang-option').forEach(o => {
      const active = o.dataset.lang === lang;
      o.classList.toggle('active', active);
      o.setAttribute('aria-selected', String(active));
    });
  }

  function getLang() {
    try { return localStorage.getItem('pfre_lang') || 'en'; } catch { return 'en'; }
  }

  
/* ═══════════════════════════════════════════════════
   DATA-I18N ATTRIBUTE SUPPORT
   Usage: <button data-i18n="nav.home">Home</button>
   Architecture: centralized key-based translation
═══════════════════════════════════════════════════ */
const I18N_KEYS = {
  en: {
    'nav.home':'Home','nav.properties':'Properties','nav.projects':'Projects',
    'nav.services':'Services','nav.about':'About','nav.blog':'Blog',
    'nav.contact':'Contact','nav.tools':'Tools','nav.careers':'Careers',
    'nav.team':'Our Team','nav.faq':'FAQ','nav.testimonials':'Testimonials',
    'btn.search':'Search','btn.submit':'Submit','btn.call':'Call Now',
    'btn.whatsapp':'WhatsApp','btn.apply':'Apply Now','btn.view_all':'View All',
    'btn.read_more':'Read More','btn.post_free':'Post Property FREE',
    'btn.get_quote':'Get a Quote','btn.enquire':'Send Enquiry',
    'btn.back':'Go Back','btn.clear':'Clear','btn.save':'Save',
    'btn.export':'Export CSV','btn.print':'Print',
    'form.name':'Full Name','form.phone':'Mobile Number','form.email':'Email Address',
    'form.message':'Message / Requirements','form.budget':'Budget',
    'form.locality':'Preferred Locality','form.config':'Configuration',
    'form.intent':'Looking to','form.submit':'Submit Enquiry',
    'form.required':'This field is required',
    'form.invalid_phone':'Please enter a valid 10-digit phone number',
    'form.invalid_email':'Please enter a valid email address',
    'label.for_sale':'For Sale','label.for_rent':'For Rent',
    'label.new_launch':'New Launch','label.ready':'Ready to Move',
    'label.under_construction':'Under Construction',
    'label.bhk_1':'1 BHK','label.bhk_2':'2 BHK','label.bhk_3':'3 BHK',
    'label.commercial':'Commercial','label.plot':'Plot / Land',
    'footer.rights':'All rights reserved.',
    'footer.address':'Address','footer.hours':'Office Hours',
    'footer.follow':'Follow Us','footer.quick':'Quick Links',
    'misc.loading':'Loading…','misc.no_results':'No results found',
    'misc.error':'Something went wrong. Please try again.',
    'misc.success':'Success!','misc.copied':'Copied to clipboard',
  },
  hi: {
    'nav.home':'होम','nav.properties':'संपत्ति','nav.projects':'प्रोजेक्ट',
    'nav.services':'सेवाएं','nav.about':'हमारे बारे में','nav.blog':'ब्लॉग',
    'nav.contact':'संपर्क','nav.tools':'उपकरण','nav.careers':'करियर',
    'nav.team':'हमारी टीम','nav.faq':'प्रश्न','nav.testimonials':'समीक्षाएं',
    'btn.search':'खोजें','btn.submit':'जमा करें','btn.call':'कॉल करें',
    'btn.whatsapp':'व्हाट्सएप','btn.apply':'अभी आवेदन करें',
    'btn.view_all':'सभी देखें','btn.read_more':'और पढ़ें',
    'btn.post_free':'मुफ्त पोस्ट करें','btn.get_quote':'कोटेशन प्राप्त करें',
    'btn.enquire':'पूछताछ भेजें','btn.back':'वापस जाएं',
    'btn.clear':'साफ करें','btn.save':'सहेजें',
    'form.name':'पूरा नाम','form.phone':'मोबाइल नंबर','form.email':'ईमेल पता',
    'form.message':'संदेश','form.budget':'बजट','form.locality':'पसंदीदा इलाका',
    'form.config':'विन्यास','form.intent':'इरादा','form.submit':'पूछताछ भेजें',
    'form.required':'यह फ़ील्ड आवश्यक है',
    'form.invalid_phone':'कृपया वैध 10-अंकीय फ़ोन नंबर दर्ज करें',
    'form.invalid_email':'कृपया वैध ईमेल पता दर्ज करें',
    'label.for_sale':'बिक्री के लिए','label.for_rent':'किराए के लिए',
    'label.new_launch':'नई लॉन्च','label.ready':'तुरंत बसने योग्य',
    'label.under_construction':'निर्माणाधीन','label.commercial':'व्यावसायिक',
    'label.plot':'भूखंड','label.bhk_1':'1 बीएचके','label.bhk_2':'2 बीएचके','label.bhk_3':'3 बीएचके',
    'footer.rights':'सर्वाधिकार सुरक्षित।','footer.address':'पता',
    'footer.hours':'कार्यालय समय','footer.follow':'हमें फॉलो करें',
    'footer.quick':'त्वरित लिंक',
    'misc.loading':'लोड हो रहा है…','misc.no_results':'कोई परिणाम नहीं मिला',
    'misc.error':'कुछ गलत हुआ। कृपया पुनः प्रयास करें।',
    'misc.success':'सफलता!','misc.copied':'क्लिपबोर्ड में कॉपी किया',
  },
  mr: {
    'nav.home':'मुखपृष्ठ','nav.properties':'मालमत्ता','nav.projects':'प्रकल्प',
    'nav.services':'सेवा','nav.about':'आमच्याबद्दल','nav.blog':'ब्लॉग',
    'nav.contact':'संपर्क','nav.tools':'साधने','nav.careers':'करिअर',
    'btn.search':'शोधा','btn.submit':'सादर करा','btn.call':'कॉल करा',
    'btn.whatsapp':'व्हाट्सअॅप','btn.apply':'आता अर्ज करा',
    'btn.view_all':'सर्व पाहा','btn.read_more':'अधिक वाचा',
    'btn.post_free':'मोफत पोस्ट करा','btn.enquire':'चौकशी पाठवा',
    'btn.back':'मागे जा','btn.clear':'साफ करा','btn.save':'जतन करा',
    'form.name':'पूर्ण नाव','form.phone':'मोबाइल नंबर','form.email':'ईमेल पत्ता',
    'form.message':'संदेश','form.budget':'बजेट','form.locality':'पसंतीचे ठिकाण',
    'form.submit':'चौकशी पाठवा','form.required':'हे फील्ड आवश्यक आहे',
    'label.for_sale':'विक्रीसाठी','label.for_rent':'भाड्यासाठी',
    'label.new_launch':'नवीन लॉन्च','label.ready':'लगेच राहण्यायोग्य',
    'label.under_construction':'बांधकाम सुरू',
    'footer.rights':'सर्व हक्क राखीव.',
    'misc.loading':'लोड होत आहे…','misc.no_results':'कोणतेही परिणाम आढळले नाहीत',
    'misc.error':'काहीतरी चूक झाली. पुन्हा प्रयत्न करा.',
  },
  gu: {
    'nav.home':'ઘર','nav.properties':'મિલ્કત','nav.services':'સેવાઓ',
    'nav.about':'અમારા વિશે','nav.blog':'બ્લૉગ','nav.contact':'સંપર્ક',
    'btn.search':'શોધો','btn.submit':'સબમિટ','btn.call':'કૉલ કરો',
    'btn.whatsapp':'વ્હૉટ્સએપ','btn.view_all':'બધું જુઓ','btn.read_more':'વધુ વાંચો',
    'btn.enquire':'પૂછપરછ','form.name':'પૂરું નામ','form.phone':'મોબાઇલ',
    'form.required':'આ ફીલ્ડ જરૂરી છે','label.for_sale':'વેચવા માટે',
    'label.for_rent':'ભાડા માટે','footer.rights':'સર્વ હક્કો અબાધિત.',
  },
  ta: {
    'nav.home':'முகப்பு','nav.properties':'சொத்துக்கள்','nav.services':'சேவைகள்',
    'nav.about':'எங்களைப் பற்றி','nav.blog':'வலைப்பதிவு','nav.contact':'தொடர்பு',
    'btn.search':'தேடு','btn.submit':'சமர்ப்பி','btn.call':'அழைக்கவும்',
    'btn.whatsapp':'வாட்ஸ்அப்','btn.view_all':'அனைத்தையும் பார்','btn.read_more':'மேலும் படி',
    'btn.enquire':'விசாரணை','form.name':'முழு பெயர்','form.phone':'மொபைல்',
    'form.required':'இந்த புலம் தேவை','label.for_sale':'விற்பனைக்கு',
    'label.for_rent':'வாடகைக்கு','footer.rights':'அனைத்து உரிமைகளும் பாதுகாக்கப்பட்டவை.',
  },
  te: {
    'nav.home':'హోమ్','nav.properties':'ఆస్తులు','nav.services':'సేవలు',
    'btn.search':'వెతకు','btn.submit':'సమర్పించు','btn.call':'కాల్ చేయి',
    'btn.whatsapp':'వాట్సాప్','btn.view_all':'అన్నీ చూడు','btn.read_more':'మరింత చదువు',
    'form.name':'పూర్తి పేరు','form.phone':'మొబైల్','form.required':'ఈ ఫీల్డ్ అవసరం',
    'label.for_sale':'అమ్మకానికి','label.for_rent':'అద్దెకు',
    'footer.rights':'అన్ని హక్కులు సురక్షితం.',
  },
  kn: {
    'nav.home':'ಮನೆ','nav.properties':'ಆಸ್ತಿಗಳು','nav.services':'ಸೇವೆಗಳು',
    'btn.search':'ಹುಡುಕಿ','btn.submit':'ಸಲ್ಲಿಸಿ','btn.call':'ಕರೆ ಮಾಡಿ',
    'btn.whatsapp':'ವಾಟ್ಸಾಪ್','btn.view_all':'ಎಲ್ಲ ನೋಡಿ',
    'form.name':'ಪೂರ್ಣ ಹೆಸರು','form.phone':'ಮೊಬೈಲ್',
    'form.required':'ಈ ಕ್ಷೇತ್ರ ಅಗತ್ಯ','label.for_sale':'ಮಾರಾಟಕ್ಕೆ','label.for_rent':'ಬಾಡಿಗೆಗೆ',
    'footer.rights':'ಎಲ್ಲಾ ಹಕ್ಕುಗಳನ್ನು ಕಾಯ್ದಿರಿಸಲಾಗಿದೆ.',
  },
  ml: {
    'nav.home':'ഹോം','nav.properties':'സ്വത്തുക്കൾ','nav.services':'സേവനങ്ങൾ',
    'btn.search':'തിരയുക','btn.submit':'സമർപ്പിക്കുക','btn.call':'വിളിക്കൂ',
    'btn.whatsapp':'വാട്ട്സ്ആപ്പ്','btn.view_all':'എല്ലാം കാണുക',
    'form.name':'പൂർണ്ണ നാമം','form.phone':'മൊബൈൽ',
    'form.required':'ഈ ഫീൽഡ് ആവശ്യമാണ്','label.for_sale':'വിൽക്കാൻ','label.for_rent':'വാടകയ്ക്ക്',
    'footer.rights':'എല്ലാ അവകാശങ്ങളും നിക്ഷിപ്തം.',
  },
  bn: {
    'nav.home':'হোম','nav.properties':'সম্পত্তি','nav.services':'সেবাসমূহ',
    'btn.search':'খুঁজুন','btn.submit':'জমা দিন','btn.call':'কল করুন',
    'btn.whatsapp':'হোয়াটসঅ্যাপ','btn.view_all':'সব দেখুন',
    'form.name':'পূর্ণ নাম','form.phone':'মোবাইল',
    'form.required':'এই ক্ষেত্রটি প্রয়োজন','label.for_sale':'বিক্রয়ের জন্য','label.for_rent':'ভাড়ার জন্য',
    'footer.rights':'সর্বস্বত্ব সংরক্ষিত।',
  },
  pa: {
    'nav.home':'ਹੋਮ','nav.properties':'ਜਾਇਦਾਦ','nav.services':'ਸੇਵਾਵਾਂ',
    'btn.search':'ਖੋਜੋ','btn.submit':'ਜਮ੍ਹਾਂ ਕਰੋ','btn.call':'ਕਾਲ ਕਰੋ',
    'btn.whatsapp':'ਵਟਸਐਪ','btn.view_all':'ਸਭ ਵੇਖੋ',
    'form.name':'ਪੂਰਾ ਨਾਮ','form.phone':'ਮੋਬਾਈਲ',
    'form.required':'ਇਹ ਫੀਲਡ ਲੋੜੀਂਦਾ ਹੈ','label.for_sale':'ਵੇਚਣ ਲਈ','label.for_rent':'ਕਿਰਾਏ ਲਈ',
    'footer.rights':'ਸਾਰੇ ਅਧਿਕਾਰ ਸੁਰੱਖਿਅਤ।',
  },
  ur: {
    'nav.home':'ہوم','nav.properties':'جائیداد','nav.services':'خدمات',
    'btn.search':'تلاش','btn.submit':'جمع کریں','btn.call':'کال کریں',
    'btn.whatsapp':'واٹس ایپ','btn.view_all':'سب دیکھیں',
    'form.name':'پورا نام','form.phone':'موبائل',
    'form.required':'یہ فیلڈ ضروری ہے','label.for_sale':'فروخت کے لیے','label.for_rent':'کرایہ کے لیے',
    'footer.rights':'جملہ حقوق محفوظ ہیں۔',
  },
};

/* Apply data-i18n translations */
function applyDataI18n(lang) {
  const keys = I18N_KEYS[lang] || I18N_KEYS.en;
  const fallback = I18N_KEYS.en;
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    const val = keys[key] || fallback[key];
    if (!val) return;
    /* Preserve child elements, only change text nodes */
    if (el.children.length === 0) {
      el.textContent = val;
    } else {
      el.childNodes.forEach(n => {
        if (n.nodeType === Node.TEXT_NODE && n.textContent.trim()) {
          n._origI18n = n._origI18n || n.textContent.trim();
          const translated = keys[n._origI18n] || fallback[n._origI18n] || val;
          n.textContent = n.textContent.replace(n._origI18n, translated);
        }
      });
    }
  });
  /* Translate placeholders */
  document.querySelectorAll('[data-i18n-ph]').forEach(el => {
    const key = el.dataset.i18nPh;
    const val = keys[key] || fallback[key];
    if (val) el.placeholder = val;
  });
  /* Translate aria-labels */
  document.querySelectorAll('[data-i18n-aria]').forEach(el => {
    const key = el.dataset.i18nAria;
    const val = keys[key] || fallback[key];
    if (val) el.setAttribute('aria-label', val);
  });
}

/* Validation messages in current language */
window.getI18nMsg = (key, lang) => {
  lang = lang || (typeof getLang === 'function' ? getLang() : 'en');
  return (I18N_KEYS[lang] || I18N_KEYS.en)[key] || I18N_KEYS.en[key] || key;
};

window.setLang = (lang) => {
    try { localStorage.setItem('pfre_lang', lang); } catch {}
    translate(lang);
    applyDataI18n(lang);
    updateDropdownDisplay(lang);
    if (window.showToast) {
      const m = LANG_META[lang];
      window.showToast(`${m.flag} ${m.native} selected`, 'success');
    }
  };

  function init() {
    buildDropdown();
    const lang = getLang();
    if (lang !== 'en') { translate(lang); applyDataI18n(lang); }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
