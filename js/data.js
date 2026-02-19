const BODY_PARTS = [
  { id: "head", word: "Head", transcription: "/hed/", ru: "Голова", be: "Галава" },
  { id: "hair", word: "Hair", transcription: "/heər/", ru: "Волосы", be: "Валасы" },
  { id: "forehead", word: "Forehead", transcription: "/ˈfɔːrhed/", ru: "Лоб", be: "Лоб" },
  { id: "eye", word: "Eye", transcription: "/aɪ/", ru: "Глаз", be: "Вока" },
  { id: "ear", word: "Ear", transcription: "/ɪər/", ru: "Ухо", be: "Вуха" },
  { id: "nose", word: "Nose", transcription: "/noʊz/", ru: "Нос", be: "Нос" },
  { id: "cheek", word: "Cheek", transcription: "/tʃiːk/", ru: "Щека", be: "Шчака" },
  { id: "mouth", word: "Mouth", transcription: "/maʊθ/", ru: "Рот", be: "Рот" },
  { id: "lip", word: "Lip", transcription: "/lɪp/", ru: "Губа", be: "Губа" },
  { id: "chin", word: "Chin", transcription: "/tʃɪn/", ru: "Подбородок", be: "Падбародак" },
  { id: "neck", word: "Neck", transcription: "/nek/", ru: "Шея", be: "Шыя" },
  { id: "shoulder", word: "Shoulder", transcription: "/ˈʃoʊldər/", ru: "Плечо", be: "Плячо" },
  { id: "chest", word: "Chest", transcription: "/tʃest/", ru: "Грудь", be: "Грудзі" },
  { id: "arm", word: "Arm", transcription: "/ɑːrm/", ru: "Рука", be: "Рука" },
  { id: "elbow", word: "Elbow", transcription: "/ˈelboʊ/", ru: "Локоть", be: "Локаць" },
  { id: "stomach", word: "Stomach", transcription: "/ˈstʌmək/", ru: "Живот", be: "Жывот" },
  { id: "finger", word: "Finger", transcription: "/ˈfɪŋɡər/", ru: "Палец (руки)", be: "Палец (рукі)" },
  { id: "leg", word: "Leg", transcription: "/leɡ/", ru: "Нога", be: "Нага" },
  { id: "knee", word: "Knee", transcription: "/niː/", ru: "Колено", be: "Калена" },
  { id: "foot", word: "Foot", transcription: "/fʊt/", ru: "Стопа", be: "Ступня" },
  { id: "toe", word: "Toe", transcription: "/toʊ/", ru: "Палец (ноги)", be: "Палец (нагі)" }
];

// Subset for "Build the Body" game — major body parts only
const BUILD_PARTS = ["head", "chest", "stomach", "arm", "leg", "foot"];

function getPartById(id) {
  return BODY_PARTS.find(p => p.id === id);
}
