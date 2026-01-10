/**
 * Reading Passages for WPM Assessment
 * Each passage is designed to be readable in about 1 minute at various speeds
 */

export const ASSESSMENT_PASSAGES = {
    en: {
        text: `The art of reading quickly is not about rushing through words, but about training your brain to process information more efficiently. Speed reading techniques have been studied for decades, and researchers have found that the average person reads at about 200 to 250 words per minute. However, with proper training and practice, many people can double or even triple their reading speed while maintaining good comprehension.

One of the most effective techniques is called RSVP, or Rapid Serial Visual Presentation. This method displays words one at a time in a fixed position, eliminating the need for eye movements across the page. By reducing the physical effort of reading, your brain can focus entirely on processing the meaning of each word.

Another powerful approach is Bionic Reading, which highlights the beginning of each word to guide your eyes more efficiently. This technique works because your brain can recognize words from just the first few letters, filling in the rest automatically. Practice makes perfect, and with consistent training, you will notice significant improvements in your reading speed.`,
        wordCount: 176,
    },
    tr: {
        text: `Hızlı okuma sanatı, kelimelerin üzerinden aceleyle geçmek değil, beyninizi bilgiyi daha verimli işleyecek şekilde eğitmektir. Hızlı okuma teknikleri onlarca yıldır araştırılmaktadır ve araştırmacılar, ortalama bir kişinin dakikada yaklaşık 200 ila 250 kelime okuduğunu bulmuştur. Ancak doğru eğitim ve pratikle, birçok kişi iyi anlama seviyesini koruyarak okuma hızını iki veya üç katına çıkarabilir.

En etkili tekniklerden biri RSVP veya Hızlı Seri Görsel Sunum olarak adlandırılır. Bu yöntem, kelimeleri sabit bir konumda tek tek göstererek sayfa boyunca göz hareketlerine olan ihtiyacı ortadan kaldırır. Okumanın fiziksel çabasını azaltarak, beyniniz tamamen her kelimenin anlamını işlemeye odaklanabilir.

Bir diğer güçlü yaklaşım ise Biyonik Okumadır. Bu yöntem, gözlerinizi daha verimli yönlendirmek için her kelimenin başlangıcını vurgular. Bu teknik işe yarar çünkü beyniniz kelimeleri sadece ilk birkaç harften tanıyabilir ve gerisini otomatik olarak tamamlar. Pratik mükemmelleştirir ve tutarlı eğitimle okuma hızınızda önemli iyileşmeler göreceksiniz.`,
        wordCount: 168,
    },
};

// Average WPM benchmarks
export const WPM_BENCHMARKS = {
    slow: 150,
    average: 225,
    fast: 350,
    speedReader: 500,
};

/**
 * Calculate WPM from reading time
 */
export const calculateWPM = (wordCount: number, timeInSeconds: number): number => {
    if (timeInSeconds === 0) return 0;
    const minutes = timeInSeconds / 60;
    return Math.round(wordCount / minutes);
};

/**
 * Get comparison to average reader
 */
export const getComparison = (wpm: number): { type: 'faster' | 'slower' | 'average'; percent: number } => {
    const averageWpm = WPM_BENCHMARKS.average;
    const difference = wpm - averageWpm;
    const percentDiff = Math.round(Math.abs(difference / averageWpm) * 100);

    if (percentDiff <= 10) {
        return { type: 'average', percent: 0 };
    } else if (difference > 0) {
        return { type: 'faster', percent: percentDiff };
    } else {
        return { type: 'slower', percent: percentDiff };
    }
};

/**
 * Get skill level based on WPM
 */
export const getSkillLevel = (wpm: number): string => {
    if (wpm < WPM_BENCHMARKS.slow) return 'assessment.skill.beginner';
    if (wpm < WPM_BENCHMARKS.average) return 'assessment.skill.belowAverage';
    if (wpm < WPM_BENCHMARKS.fast) return 'assessment.skill.average';
    if (wpm < WPM_BENCHMARKS.speedReader) return 'assessment.skill.fastReader';
    return 'assessment.skill.speedReader';
};
