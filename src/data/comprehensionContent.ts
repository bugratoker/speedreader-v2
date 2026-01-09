/**
 * Comprehension Training Content
 * Reading passages with questions every ~100 words
 */

export interface ComprehensionQuestion {
    question: string;
    options: string[];
    correctIndex: number;
    explanation?: string;
}

export interface ComprehensionPassage {
    id: string;
    title: string;
    content: string;
    questions: ComprehensionQuestion[];
    wordCount: number;
    language: 'en' | 'tr';
}

export const comprehensionPassages: ComprehensionPassage[] = [
    {
        id: 'speed-reading-science-en',
        title: 'The Science of Speed Reading',
        language: 'en',
        wordCount: 420,
        content: `Speed reading is a collection of techniques designed to increase reading rate without significantly reducing comprehension. The average adult reads at approximately 200 to 250 words per minute, while speed readers can achieve rates of 400 to 800 words per minute or higher. However, the relationship between speed and comprehension is complex and requires careful training.

The human eye can only focus on a small area at one time, called the fovea. When reading, our eyes make rapid movements called saccades, jumping from one fixation point to another. Between these movements, our eyes are essentially blind. Traditional readers make 4-5 fixations per line, while trained speed readers reduce this to 2-3 fixations by expanding their visual span.

One of the most significant barriers to faster reading is subvocalization—the habit of internally pronouncing each word. While some subvocalization is natural and aids comprehension, excessive reliance on it limits reading speed to the pace of speech, around 250 words per minute. Reducing subvocalization through techniques like the tachistoscope method can dramatically improve reading speed.

Another critical technique is minimizing regression, the tendency to re-read words or passages. Research shows that untrained readers regress 10-20% of the time, often unconsciously. Using a visual pacer or controlled presentation methods like RSVP (Rapid Serial Visual Presentation) can reduce regression and improve reading flow. The key is building confidence that comprehension remains intact at higher speeds, which only comes through consistent practice and measurement.`,
        questions: [
            {
                question: 'What is the average reading speed for adults?',
                options: [
                    '100-150 words per minute',
                    '200-250 words per minute',
                    '400-500 words per minute',
                    '800-1000 words per minute'
                ],
                correctIndex: 1,
                explanation: 'The passage states that the average adult reads at approximately 200 to 250 words per minute.'
            },
            {
                question: 'What are the rapid eye movements called when reading?',
                options: [
                    'Foveas',
                    'Fixations',
                    'Saccades',
                    'Regressions'
                ],
                correctIndex: 2,
                explanation: 'The text explains that our eyes make rapid movements called saccades, jumping from one fixation point to another.'
            },
            {
                question: 'What is the main problem with subvocalization?',
                options: [
                    'It completely prevents comprehension',
                    'It limits reading speed to speech pace',
                    'It causes eye strain',
                    'It only works in one language'
                ],
                correctIndex: 1,
                explanation: 'The passage mentions that excessive subvocalization limits reading speed to the pace of speech, around 250 words per minute.'
            },
            {
                question: 'How often do untrained readers regress while reading?',
                options: [
                    '5-10% of the time',
                    '10-20% of the time',
                    '30-40% of the time',
                    '50% of the time'
                ],
                correctIndex: 1,
                explanation: 'Research shows that untrained readers regress 10-20% of the time, often unconsciously.'
            }
        ]
    },
    {
        id: 'hizli-okuma-bilimi-tr',
        title: 'Hızlı Okuma Bilimi',
        language: 'tr',
        wordCount: 380,
        content: `Hızlı okuma, okuma hızını anlamayı önemli ölçüde azaltmadan artırmak için tasarlanmış tekniklerin bir koleksiyonudur. Ortalama bir yetişkin dakikada yaklaşık 200 ila 250 kelime okur, hızlı okuyucular ise dakikada 400 ila 800 kelime veya daha yüksek hızlara ulaşabilir. Ancak, hız ve anlama arasındaki ilişki karmaşıktır ve dikkatli bir eğitim gerektirir.

İnsan gözü bir seferde sadece fovea adı verilen küçük bir alana odaklanabilir. Okurken gözlerimiz sakad adı verilen hızlı hareketler yapar ve bir sabitleme noktasından diğerine atlar. Bu hareketler arasında gözlerimiz esasen kördür. Geleneksel okuyucular satır başına 4-5 sabitleme yaparken, eğitimli hızlı okuyucular görsel alanlarını genişleterek bunu 2-3 sabitlemeye düşürür.

Daha hızlı okumanın önündeki en önemli engellerden biri içsel konuşmadır - her kelimeyi içten telaffuz etme alışkanlığı. Bir miktar içsel konuşma doğaldır ve anlamaya yardımcı olsa da, buna aşırı bağımlılık okuma hızını konuşma hızıyla, yani dakikada yaklaşık 250 kelimeyle sınırlar. Taşistoskop yöntemi gibi tekniklerle içsel konuşmayı azaltmak okuma hızını önemli ölçüde artırabilir.

Bir diğer kritik teknik ise gerileme yani kelimeleri veya bölümleri yeniden okuma eğilimini en aza indirmektir. Araştırmalar, eğitimsiz okuyucuların zamanın %10-20'sinde, genellikle bilinçsizce geriye döndüğünü gösteriyor. Görsel bir işaretleyici veya RSVP gibi kontrollü sunum yöntemleri kullanmak gerilemeyi azaltabilir ve okuma akışını iyileştirebilir.`,
        questions: [
            {
                question: 'Yetişkinler için ortalama okuma hızı nedir?',
                options: [
                    'Dakikada 100-150 kelime',
                    'Dakikada 200-250 kelime',
                    'Dakikada 400-500 kelime',
                    'Dakikada 800-1000 kelime'
                ],
                correctIndex: 1,
                explanation: 'Metinde ortalama bir yetişkinin dakikada yaklaşık 200 ila 250 kelime okuduğu belirtilmiştir.'
            },
            {
                question: 'Okurken gözlerin yaptığı hızlı hareketlere ne denir?',
                options: [
                    'Fovea',
                    'Sabitleme',
                    'Sakad',
                    'Gerileme'
                ],
                correctIndex: 2,
                explanation: 'Metin, gözlerimizin sakad adı verilen hızlı hareketler yaptığını açıklıyor.'
            },
            {
                question: 'İçsel konuşmanın ana sorunu nedir?',
                options: [
                    'Anlamayı tamamen engeller',
                    'Okuma hızını konuşma hızıyla sınırlar',
                    'Göz yorgunluğuna neden olur',
                    'Sadece bir dilde çalışır'
                ],
                correctIndex: 1,
                explanation: 'Metinde içsel konuşmaya aşırı bağımlılığın okuma hızını konuşma hızıyla sınırladığı belirtiliyor.'
            }
        ]
    },
    {
        id: 'brain-plasticity-en',
        title: 'Brain Plasticity and Learning',
        language: 'en',
        wordCount: 340,
        content: `The human brain possesses a remarkable ability called neuroplasticity—the capacity to reorganize itself by forming new neural connections throughout life. This fundamental property allows us to learn new skills, adapt to new experiences, and recover from brain injuries. Contrary to the old belief that the brain's structure is fixed after childhood, modern neuroscience has proven that our brains remain malleable well into old age.

When we learn something new, whether it's a language, a musical instrument, or a physical skill like speed reading, our brain physically changes. Repeated practice strengthens specific neural pathways, making them more efficient. This process, known as myelination, involves coating nerve fibers with a fatty substance that speeds up signal transmission. The more we practice, the faster and more automatic the skill becomes.

However, neuroplasticity works both ways. Just as we can strengthen neural pathways through use, we can also weaken them through neglect. This is often summarized by the phrase "use it or lose it." Skills that aren't practiced regularly begin to fade as the brain reallocates resources to more frequently used pathways. This is why consistent, spaced practice is more effective than intensive cramming sessions—it keeps the neural pathways active and strong over time.`,
        questions: [
            {
                question: 'What is neuroplasticity?',
                options: [
                    'The brain\'s inability to change',
                    'The brain\'s ability to form new neural connections',
                    'A type of brain injury',
                    'A childhood development phase'
                ],
                correctIndex: 1,
                explanation: 'Neuroplasticity is defined as the brain\'s capacity to reorganize itself by forming new neural connections throughout life.'
            },
            {
                question: 'What is myelination?',
                options: [
                    'Learning a new language',
                    'Brain injury recovery',
                    'Coating nerve fibers to speed up signals',
                    'Forgetting old information'
                ],
                correctIndex: 2,
                explanation: 'Myelination involves coating nerve fibers with a fatty substance that speeds up signal transmission.'
            },
            {
                question: 'What does "use it or lose it" mean in this context?',
                options: [
                    'Practice money management',
                    'Unused skills weaken over time',
                    'Use tools properly',
                    'Brain cells die if not used'
                ],
                correctIndex: 1,
                explanation: 'The phrase refers to how skills that aren\'t practiced regularly fade as neural pathways weaken.'
            }
        ]
    }
];

// Helper function to get passage by language
export const getPassageByLanguage = (language: 'en' | 'tr'): ComprehensionPassage => {
    const passages = comprehensionPassages.filter(p => p.language === language);
    return passages[Math.floor(Math.random() * passages.length)];
};

// Helper function to calculate question intervals (every ~100 words)
export const calculateQuestionPoints = (wordCount: number, questionsCount: number): number[] => {
    const interval = Math.floor(wordCount / questionsCount);
    return Array.from({ length: questionsCount }, (_, i) => (i + 1) * interval);
};
