export interface WordCluster {
    phrase: string;
    distractors: string[];
}

export const TRAINING_DATA: Record<string, WordCluster[]> = {
    en: [
        { phrase: 'run far away', distractors: ['run far today', 'run fast away', 'fun far away'] },
        { phrase: 'see the light', distractors: ['see the night', 'see the sight', 'be the light'] },
        { phrase: 'read more books', distractors: ['read more looks', 'read more hooks', 'read good books'] },
        { phrase: 'think big now', distractors: ['think big how', 'thing big now', 'think pig now'] },
        { phrase: 'feel the power', distractors: ['feel the tower', 'feel the lower', 'feed the power'] },
        { phrase: 'keep it sharp', distractors: ['keep it shape', 'keep it short', 'keep it smart'] },
        { phrase: 'learn new skill', distractors: ['learn new still', 'learn new spill', 'learn few skill'] },
        { phrase: 'stay in focus', distractors: ['stay in locus', 'stay in force', 'play in focus'] },
        { phrase: 'make it clear', distractors: ['make it clean', 'make it close', 'take it clear'] },
        { phrase: 'move so swift', distractors: ['move so shift', 'move so drift', 'move so sweet'] },
        { phrase: 'be very quick', distractors: ['be very thick', 'be very slick', 'be very quiet'] },
        { phrase: 'chase the dream', distractors: ['chase the cream', 'chase the steam', 'chase the team'] },
        { phrase: 'light a spark', distractors: ['light a stark', 'light a start', 'fight a spark'] },
        { phrase: 'in a flash', distractors: ['in a flask', 'in a clash', 'in a flush'] },
        { phrase: 'feel the storm', distractors: ['feel the store', 'feel the story', 'feel the stone'] },
        { phrase: 'from the heart', distractors: ['from the start', 'from the chart', 'from the heat'] },
    ],
    tr: [
        { phrase: 'koş uzaklara git', distractors: ['koş uzaklara bak', 'koş hızlı git', 'koş uzağa git'] },
        { phrase: 'ışığı gör şimdi', distractors: ['ışığı ör şimdi', 'ışığı gör haydi', 'aşığı gör şimdi'] },
        { phrase: 'çok kitap oku', distractors: ['çok kitap doku', 'çok hitap oku', 'yok kitap oku'] },
        { phrase: 'büyük düşün şimdi', distractors: ['büyük taşın şimdi', 'büyük düşen şimdi', 'küçük düşün şimdi'] },
        { phrase: 'gücü hisset sen', distractors: ['gücü hisset ben', 'gücü kisset sen', 'ucu hisset sen'] },
        { phrase: 'keskin tut onu', distractors: ['keskin yut onu', 'keskin tut yolu', 'keskin at onu'] },
        { phrase: 'yeni hüner öğren', distractors: ['yeni fener öğren', 'yeni hüner eğlen', 'eski hüner öğren'] },
        { phrase: 'odaklan ve kal', distractors: ['saklan ve kal', 'odaklan ve dal', 'odaklan ve çal'] },
        { phrase: 'net olsun herşey', distractors: ['sert olsun herşey', 'net olsun birşey', 'net dolsun herşey'] },
        { phrase: 'hızlı hareket et', distractors: ['hızlı bereket et', 'hızlı hareket git', 'azlı hareket et'] },
        { phrase: 'çok çabuk ol', distractors: ['çok kabuk ol', 'çok çabuk kal', 'yok çabuk ol'] },
        { phrase: 'hayali kovala dur', distractors: ['hayali kovala vur', 'hayali ovala dur', 'hayat kovala dur'] },
        { phrase: 'kıvılcım çak şimdi', distractors: ['kıvılcım bak şimdi', 'kıvılcım çak haydi', 'kıvılcım ak şimdi'] },
        { phrase: 'bir anda oldu', distractors: ['bir yanda oldu', 'bir anda doldu', 'bir anda soldu'] },
        { phrase: 'fırtına gibi es', distractors: ['fırtına gibi kes', 'fırtına dibi es', 'fırtına gibi küs'] },
        { phrase: 'kalpten gelen ses', distractors: ['kalpten gelen his', 'kalpten giden ses', 'harpten gelen ses'] },
    ]
};
