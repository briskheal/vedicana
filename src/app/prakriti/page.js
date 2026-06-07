"use client";
import React, { useState } from 'react';
import { Sparkles, ArrowRight, RotateCcw, ShieldCheck, Heart, Leaf, Star, Check } from 'lucide-react';
import AddToCartButton from '../../components/AddToCartButton';

// 10 Curated Authentic Ayurvedic Questions
const questions = [
  {
    id: 1,
    theme: 'Body Frame & Weight',
    question: 'Select the option that best describes your physical frame and weight stability:',
    options: [
      { text: 'Thin, slender, light-boned. Finds it very hard to gain weight.', dosha: 'vata' },
      { text: 'Medium, well-proportioned frame. Stable and moderate weight.', dosha: 'pitta' },
      { text: 'Broad, large, heavy-boned frame. Gains weight easily and finds it hard to lose.', dosha: 'kapha' }
    ]
  },
  {
    id: 2,
    theme: 'Skin Quality & Feel',
    question: 'How does your skin usually feel and look?',
    options: [
      { text: 'Dry, rough, cool to the touch, thin, and prone to cracking.', dosha: 'vata' },
      { text: 'Warm, oily, highly sensitive. Prone to redness, freckles, or acne.', dosha: 'pitta' },
      { text: 'Thick, oily, cool, smooth, soft, with a fair or pale complexion.', dosha: 'kapha' }
    ]
  },
  {
    id: 3,
    theme: 'Hair Characteristics',
    question: 'Choose the description that matches your hair quality:',
    options: [
      { text: 'Dry, frizzy, brittle, coarse, dark, and curly/wavy.', dosha: 'vata' },
      { text: 'Fine, soft, oily. Prone to early greying or balding. Light brown/reddish.', dosha: 'pitta' },
      { text: 'Thick, abundant, strong, dark, wavy, and shiny.', dosha: 'kapha' }
    ]
  },
  {
    id: 4,
    theme: 'Appetite & Digestion',
    question: 'How would you describe your appetite and digestive cycle?',
    options: [
      { text: 'Variable, irregular, and erratic. Prone to bloating, gas, or constipation.', dosha: 'vata' },
      { text: 'Strong and intense. Cannot tolerate skipped meals and gets irritable if hungry.', dosha: 'pitta' },
      { text: 'Constant but slow. Digests slowly. Can easily skip meals without discomfort.', dosha: 'kapha' }
    ]
  },
  {
    id: 5,
    theme: 'Sleep & Dreams',
    question: 'What are your typical sleep patterns and dream themes?',
    options: [
      { text: 'Light, fitful, easily interrupted. Prone to insomnia. Active or fearful dreams.', dosha: 'vata' },
      { text: 'Moderate, sound, and refreshing. Falls asleep easily. Vivid, intense, or fiery dreams.', dosha: 'pitta' },
      { text: 'Deep, heavy, and prolonged. Finds it hard to wake up. Calm, peaceful, or romantic dreams.', dosha: 'kapha' }
    ]
  },
  {
    id: 6,
    theme: 'Weather Preferences',
    question: 'Which weather conditions do you find most uncomfortable?',
    options: [
      { text: 'Dislikes cold, windy, or dry weather. Loves warm, sunny, and humid climates.', dosha: 'vata' },
      { text: 'Dislikes heat, direct sun, or humidity. Loves cool, breezy, or shady climates.', dosha: 'pitta' },
      { text: 'Dislikes damp, cold, cloudy, or rainy weather. Loves warm, dry, and sunny climates.', dosha: 'kapha' }
    ]
  },
  {
    id: 7,
    theme: 'Mental Pace & Decisions',
    question: 'How do you usually process information and make decisions?',
    options: [
      { text: 'Quick-minded, processes information fast. Tends to change decisions frequently.', dosha: 'vata' },
      { text: 'Sharp, logical, highly analytical, extremely decisive, and a good planner.', dosha: 'pitta' },
      { text: 'Calm, deliberate, steady. Takes plenty of time to decide, highly consistent.', dosha: 'kapha' }
    ]
  },
  {
    id: 8,
    theme: 'Stress Response',
    question: 'How do you react emotionally when placed under intense pressure?',
    options: [
      { text: 'Prone to anxiety, worry, fear, and nervous tension.', dosha: 'vata' },
      { text: 'Prone to anger, impatience, irritation, and competitive drive.', dosha: 'pitta' },
      { text: 'Stays calm, peaceful, and patient. Prone to lethargy or complacency.', dosha: 'kapha' }
    ]
  },
  {
    id: 9,
    theme: 'Memory & Learning',
    question: 'What is your memory dynamic and learning speed?',
    options: [
      { text: 'Learns very quickly, but forgets quickly (Excellent Short-Term Memory).', dosha: 'vata' },
      { text: 'Learns moderately, remembers for a very long time (Sharp, Selective Memory).', dosha: 'pitta' },
      { text: 'Learns slowly, but retains permanently (Excellent Long-Term Memory).', dosha: 'kapha' }
    ]
  },
  {
    id: 10,
    theme: 'Activity & Energy',
    question: 'How do you describe your activity pace and physical stamina?',
    options: [
      { text: 'High energy in short bursts. Tires easily. Restless and hyperactive.', dosha: 'vata' },
      { text: 'Goal-oriented, moderate stamina. Focused, intense, and highly driven.', dosha: 'pitta' },
      { text: 'Constant, steady energy. High endurance and stamina. Slow, methodical pace.', dosha: 'kapha' }
    ]
  }
];

// Curated Ayurvedic Balancing Dietary/Lifestyle Recommendations
const doshaGuidance = {
  vata: {
    type: 'Vata (Baat) Dominant',
    tagline: 'The Energy of Movement and Change (Space & Air)',
    description: 'Vata represents the biological energy of movement. When in balance, Vata individuals are creative, energetic, and adaptable. When out of balance, they prone to dry skin, anxiety, coldness, variable digestion, and erratic sleep.',
    dietEat: 'Warm, cooked, moist, heavy, and oily foods. Focus on sweet, sour, and salty tastes. Enjoy cooked rice, hot soups, avocados, ghee, nuts, warm milk, and mild spices like ginger, cardamom, and cinnamon.',
    dietAvoid: 'Cold, dry, raw, and light foods. Limit salads, dry fruits, raw vegetables, cold beverages, carbonated drinks, and bitter or astringent tastes.',
    lifestyle: 'Establish regular daily routines (sleeping and eating at the same time). Stay warm, practice grounding exercises like slow yoga or meditation, and enjoy warm oil self-massages (Abhyanga) daily.',
    remedy: {
      id: 4,
      title: 'Sencial Body Massage Oil',
      slug: 'sencial-body-massage-oil',
      price: 155,
      image: 'https://vedicana.com/wp-content/uploads/2024/08/Untitled-design-7.png',
      description: 'Nurture your body and soothe dry Vata energy with this warming therapeutic oil infused with classical herbs.'
    }
  },
  pitta: {
    type: 'Pitta (Pit) Dominant',
    tagline: 'The Energy of Transformation and Metabolism (Fire & Water)',
    description: 'Pitta represents the bio-energy of transformation, metabolism, and digestion. In balance, Pitta individuals are sharp, intelligent, courageous, and excellent leaders. Out of balance, they prone to skin rashes, acidity, anger, and heat intolerance.',
    dietEat: 'Cooling, refreshing, sweet, bitter, and astringent foods. Enjoy sweet juicy fruits (grapes, melons, apples), green leafy vegetables, cucumbers, coconut water, coriander, mint, and fennel.',
    dietAvoid: 'Hot, spicy, acidic, salty, and oily foods. Avoid chilies, garlic, onions, tomatoes, vinegar, citrus fruits, fermented items, fried foods, and excessive alcohol.',
    lifestyle: 'Keep cool physically and mentally. Avoid intense workouts during mid-day heat. Cultivate moderation, practice cooling breathing techniques (Sitali Pranayama), and make time for leisure and walks in nature.',
    remedy: {
      id: 1,
      title: 'Pure Stevia Drops',
      slug: 'vedicana-stevia-drops',
      price: 150,
      image: 'https://vedicana.com/wp-content/uploads/2024/08/slide-1.png',
      description: 'Cool your inner fire (Pitta) with this 100% natural, calorie-free Ayurvedic sweetener crafted to replace heating white sugars.'
    }
  },
  kapha: {
    type: 'Kapha (Cough/Kaf) Dominant',
    tagline: 'The Energy of Structure and Lubrication (Water & Earth)',
    description: 'Kapha represents the biological energy of structure, stability, and lubrication. In balance, Kapha individuals are calm, loving, patient, strong, and highly stable. Out of balance, they prone to lethargy, slow digestion, sinus congestion, and weight gain.',
    dietEat: 'Warm, light, dry, spicy, and bitter/astringent foods. Enjoy hot soups, steamed green vegetables, beans, legumes, apples, pears, and warming spices (black pepper, ginger, garlic, mustard seeds).',
    dietAvoid: 'Heavy, cold, sweet, oily, and salty foods. Limit dairy products, wheat, red meat, avocados, sweet desserts, cold drinks, and deep-fried items.',
    lifestyle: 'Seek stimulation and variety. Wake up early (before 6 AM), take brisk walks, engage in vigorous exercise, keep warm and dry, and avoid sleeping during the daytime.',
    remedy: {
      id: 3,
      title: 'Vedicana Ayush Kwath',
      slug: 'vedicana-ayush-kwath',
      price: 240,
      image: 'https://vedicana.com/wp-content/uploads/cache/2024/08/Add-a-subheading-2/3896995376.png',
      description: 'Stimulate slow Kapha metabolism, clears nasal pathways, and boost immunity with this warming Ayurvedic herbal tea blend.'
    }
  }
};

export default function PrakritiQuiz() {
  const [step, setStep] = useState('intro'); // 'intro', 'quiz', 'results'
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState([]); // Array of selected doshas

  const handleSelectOption = (dosha) => {
    const updated = [...answers, dosha];
    setAnswers(updated);

    if (currentIdx < questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      // Finished all 10 questions
      setStep('results');
    }
  };

  const handleReset = () => {
    setStep('intro');
    setCurrentIdx(0);
    setAnswers([]);
  };

  // Calculate scores
  const calculateScores = () => {
    if (answers.length === 0) return { vata: 0, pitta: 0, kapha: 0 };
    const counts = { vata: 0, pitta: 0, kapha: 0 };
    answers.forEach(d => {
      counts[d] = (counts[d] || 0) + 1;
    });

    const total = answers.length;
    return {
      vata: Math.round((counts.vata / total) * 100),
      pitta: Math.round((counts.pitta / total) * 100),
      kapha: Math.round((counts.kapha / total) * 100)
    };
  };

  const scores = calculateScores();

  // Determine dominant dosha
  const getDominantDosha = () => {
    const { vata, pitta, kapha } = scores;
    if (vata >= pitta && vata >= kapha) return 'vata';
    if (pitta >= vata && pitta >= kapha) return 'pitta';
    return 'kapha';
  };

  const dominant = getDominantDosha();
  const guidance = doshaGuidance[dominant];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f4fcf6] to-white py-16 font-sans antialiased">
      <div className="max-w-4xl mx-auto px-4">
        
        {/* Intro Step */}
        {step === 'intro' && (
          <div className="bg-white border border-gray-100 rounded-3xl p-8 md:p-12 shadow-xl text-center space-y-6 animate-fade-in-up">
            <div className="inline-block bg-vedicana-green/10 text-vedicana-green text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full">
              Ancient Vedic Diagnostics
            </div>
            <h1 className="text-4xl md:text-5xl font-serif text-vedicana-dark-green leading-tight">
              Ayurvedic Prakriti (Body Type) Assessment
            </h1>
            <div className="w-20 h-1 bg-vedicana-gold mx-auto rounded-full"></div>
            
            <p className="text-gray-750 text-[15px] md:text-base leading-relaxed max-w-2xl mx-auto font-normal">
              According to Ayurveda, every individual is born with a unique combination of three bio-energies (Doshas): 
              <strong className="text-gray-950 font-bold ml-1">Vata (Baat)</strong>, 
              <strong className="text-gray-955 font-bold ml-1">Pitta (Pit)</strong>, and 
              <strong className="text-gray-955 font-bold ml-1">Kapha (Kaf)</strong>. 
              Discovering your Prakriti reveals the key to your ideal diet, fitness routines, sleep requirements, and natural balance.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 text-left">
              <div className="bg-[#f0f7fe] p-5 rounded-2xl border border-blue-100 space-y-2">
                <span className="text-blue-800 font-bold text-xs uppercase tracking-wider block">Vata (Space & Air)</span>
                <p className="text-[11.5px] text-blue-950 font-medium leading-relaxed">Controls respiration, circulation, and sensory pace. Governs light, dry, and quick traits.</p>
              </div>
              <div className="bg-[#fffcf0] p-5 rounded-2xl border border-amber-100 space-y-2">
                <span className="text-amber-800 font-bold text-xs uppercase tracking-wider block">Pitta (Fire & Water)</span>
                <p className="text-[11.5px] text-amber-950 font-medium leading-relaxed">Controls metabolism, body heat, and digestives. Governs sharp, logical, and warm traits.</p>
              </div>
              <div className="bg-[#f2faf3] p-5 rounded-2xl border border-emerald-100 space-y-2">
                <span className="text-emerald-800 font-bold text-xs uppercase tracking-wider block">Kapha (Water & Earth)</span>
                <p className="text-[11.5px] text-emerald-955 font-medium leading-relaxed">Controls physical frame, joints structure, and moisture. Governs calm, strong, and stable traits.</p>
              </div>
            </div>

            <button
              onClick={() => setStep('quiz')}
              className="bg-vedicana-green hover:bg-emerald-700 text-white font-bold uppercase tracking-wider text-xs md:text-sm px-8 py-4 rounded-xl shadow-lg transition-transform hover:-translate-y-0.5 inline-flex items-center gap-2 cursor-pointer mt-6"
            >
              Start Body Type Quiz <ArrowRight size={16} />
            </button>
          </div>
        )}

        {/* Quiz Questions Step */}
        {step === 'quiz' && (
          <div className="bg-white border border-gray-100 rounded-3xl p-8 md:p-12 shadow-xl space-y-8 animate-fade-in-up">
            
            {/* Top Progress Block */}
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs font-semibold text-gray-400 uppercase tracking-widest">
                <span>Diagnostic Category: {questions[currentIdx].theme}</span>
                <span>Question {currentIdx + 1} of 10</span>
              </div>
              <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-vedicana-green h-full transition-all duration-500"
                  style={{ width: `${((currentIdx + 1) / 10) * 100}%` }}
                />
              </div>
            </div>

            {/* Question Text */}
            <div className="space-y-4">
              <span className="text-vedicana-gold font-bold uppercase tracking-wider text-[11px]">VediCana Prakriti Diagnosis</span>
              <h2 className="text-2xl md:text-3xl font-serif text-gray-900 leading-tight">
                {questions[currentIdx].question}
              </h2>
            </div>

            {/* Options List */}
            <div className="grid grid-cols-1 gap-4">
              {questions[currentIdx].options.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(option.dosha)}
                  className="w-full text-left bg-gray-50/40 hover:bg-vedicana-green/5 border border-gray-100 hover:border-vedicana-green/30 p-6 rounded-2xl transition-all duration-200 cursor-pointer shadow-sm hover:shadow group flex justify-between items-center"
                >
                  <span className="text-gray-700 group-hover:text-gray-905 font-medium leading-relaxed text-[14px] md:text-[15px]">
                    {option.text}
                  </span>
                  <span className="w-6 h-6 rounded-full bg-white border border-gray-200 group-hover:border-vedicana-green flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-transparent group-hover:text-vedicana-green font-mono">
                    ✓
                  </span>
                </button>
              ))}
            </div>

          </div>
        )}

        {/* Results Step */}
        {step === 'results' && (
          <div className="space-y-8 animate-fade-in-up">
            
            {/* Bio-Energy Scorecard Card */}
            <div className="bg-white border border-gray-100 rounded-3xl p-8 md:p-12 shadow-xl text-center space-y-6">
              <div className="inline-block bg-vedicana-gold/10 text-vedicana-gold text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full">
                Your Ayurvedic Results
              </div>
              <h2 className="text-4xl md:text-5xl font-serif text-vedicana-dark-green">
                Your Constitutional Prakriti
              </h2>
              <div className="w-20 h-1 bg-vedicana-green mx-auto rounded-full"></div>

              {/* Progress Bars (Percentages Matrix) */}
              <div className="max-w-md mx-auto space-y-4 pt-4 text-left">
                {/* Vata (Baat) */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-blue-700">
                    <span>Vata (Baat)</span>
                    <span>{scores.vata}%</span>
                  </div>
                  <div className="w-full bg-gray-100 h-3.5 rounded-full overflow-hidden border border-gray-200/40">
                    <div 
                      className="bg-gradient-to-r from-blue-400 to-indigo-600 h-full rounded-full transition-all duration-1000 shadow-inner"
                      style={{ width: `${scores.vata}%` }}
                    />
                  </div>
                </div>

                {/* Pitta (Pit) */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-amber-700">
                    <span>Pitta (Pit)</span>
                    <span>{scores.pitta}%</span>
                  </div>
                  <div className="w-full bg-gray-100 h-3.5 rounded-full overflow-hidden border border-gray-200/40">
                    <div 
                      className="bg-gradient-to-r from-amber-400 to-red-500 h-full rounded-full transition-all duration-1000 shadow-inner"
                      style={{ width: `${scores.pitta}%` }}
                    />
                  </div>
                </div>

                {/* Kapha (Cough/Kaf) */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-emerald-700">
                    <span>Kapha (Kough / Kaf)</span>
                    <span>{scores.kapha}%</span>
                  </div>
                  <div className="w-full bg-gray-100 h-3.5 rounded-full overflow-hidden border border-gray-200/40">
                    <div 
                      className="bg-gradient-to-r from-emerald-400 to-teal-600 h-full rounded-full transition-all duration-1000 shadow-inner"
                      style={{ width: `${scores.kapha}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Dominant Analysis Summary */}
              <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100/70 text-left max-w-2xl mx-auto space-y-3 mt-6">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#d4af37] block">Dominant Dosha Constitution</span>
                <h3 className="text-xl font-serif font-bold text-vedicana-dark-green flex items-center gap-2">
                  <span className="bg-vedicana-green w-1.5 h-6 rounded-full inline-block"></span>
                  {guidance.type} Dominant
                </h3>
                <span className="text-sm md:text-base italic text-gray-900 block font-bold">{guidance.tagline}</span>
                <p className="text-base md:text-lg text-gray-900 leading-relaxed font-semibold">{guidance.description}</p>
              </div>
            </div>

            {/* Custom Guidelines and Dietary Advices */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Diet Column */}
              <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-xl space-y-6">
                <h3 className="text-xl font-serif text-vedicana-dark-green font-bold flex items-center gap-2 border-b border-gray-50 pb-3">
                  <Leaf className="text-vedicana-green" size={18} />
                  Prakriti Dietary Guidance
                </h3>
                
                <div className="space-y-4 text-xs md:text-sm leading-relaxed">
                  <div className="space-y-1.5">
                    <span className="font-bold text-vedicana-green uppercase text-[10px] tracking-wider block">✓ Beneficial Foods to Enjoy</span>
                    <p className="text-gray-800 font-medium">{guidance.dietEat}</p>
                  </div>
                  <div className="space-y-1.5 pt-3 border-t border-gray-50">
                    <span className="font-bold text-red-500 uppercase text-[10px] tracking-wider block">✗ Foods to Limit / Avoid</span>
                    <p className="text-gray-800 font-medium">{guidance.dietAvoid}</p>
                  </div>
                </div>
              </div>

              {/* Lifestyle Column */}
              <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-xl space-y-6">
                <h3 className="text-xl font-serif text-vedicana-dark-green font-bold flex items-center gap-2 border-b border-gray-50 pb-3">
                  <ShieldCheck className="text-vedicana-gold" size={18} />
                  Lifestyle &amp; Daily Routine (Dinacharya)
                </h3>
                
                <div className="space-y-4 text-xs md:text-sm leading-relaxed">
                  <div className="space-y-1.5">
                    <span className="font-bold text-vedicana-gold uppercase text-[10px] tracking-wider block">☉ Daily Practices</span>
                    <p className="text-gray-800 font-medium">{guidance.lifestyle}</p>
                  </div>
                  <div className="space-y-2 pt-3 border-t border-gray-50">
                    <span className="font-bold text-vedicana-green uppercase text-[10px] tracking-wider block flex items-center gap-1">
                      <Heart size={10} className="fill-current" /> Balancing Affirmation
                    </span>
                    <p className="text-gray-900 italic font-medium font-serif text-sm">
                      "I align my mind and physical body with the quiet, warm rhythms of nature to cultivate absolute balance."
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Smart Product Recommendations Bridge */}
            <div className="bg-gradient-to-br from-vedicana-dark-green to-[#1b2a1a] rounded-3xl p-8 md:p-12 text-white shadow-2xl space-y-8 relative overflow-hidden">
              <div className="absolute right-0 bottom-0 opacity-10 translate-x-20 translate-y-20 pointer-events-none">
                <Leaf size={300} className="text-white" />
              </div>

              <div className="space-y-2 relative z-10 text-center md:text-left">
                <span className="text-vedicana-gold font-bold uppercase tracking-wider text-xs block">Personalized Balancing Remedy</span>
                <h3 className="text-3xl font-serif font-bold text-white tracking-wide">Recommended VediCana Balancing Care</h3>
                <div className="w-12 h-0.5 bg-vedicana-gold rounded-full my-3 mx-auto md:mx-0"></div>
                <p className="text-slate-300 text-xs md:text-sm max-w-xl font-normal leading-relaxed">
                  To correct your active Dosha offsets and sustain optimal wellness, we suggest integrating this specific organic formulation into your daily routine.
                </p>
              </div>

              {/* Recommended Product Card */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 relative z-10">
                {/* Image slot */}
                <div className="w-24 h-24 md:w-32 md:h-32 bg-white rounded-xl p-2.5 flex items-center justify-center flex-shrink-0 shadow-md">
                  <img 
                    src={guidance.remedy.image} 
                    alt={guidance.remedy.title} 
                    className="w-full h-full object-contain"
                  />
                </div>

                {/* Details */}
                <div className="flex-grow space-y-3 text-center md:text-left">
                  <div className="space-y-1">
                    <span className="bg-vedicana-gold/20 text-vedicana-gold text-[10px] uppercase font-bold px-2 py-0.5 rounded border border-vedicana-gold/30">
                      Balancing Formulation
                    </span>
                    <h4 className="text-xl md:text-2xl font-serif font-bold text-white">{guidance.remedy.title}</h4>
                  </div>
                  <p className="text-slate-200 text-xs leading-relaxed font-normal">{guidance.remedy.description}</p>
                  
                  <div className="flex flex-col sm:flex-row items-center gap-4 pt-3 justify-center md:justify-start">
                    <span className="text-2xl font-semibold text-white">₹{guidance.remedy.price}</span>
                    <div className="w-full sm:w-auto">
                      {/* Direct Add to Cart Hook */}
                      <AddToCartButton 
                        product={{
                          id: guidance.remedy.id,
                          title: guidance.remedy.title,
                          price: guidance.remedy.price,
                          image: guidance.remedy.image,
                          slug: guidance.remedy.slug,
                          description: guidance.remedy.description
                        }}
                        variant="small"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Reset Quiz Controls */}
              <div className="flex justify-center pt-4 relative z-10 border-t border-white/5 mt-4">
                <button
                  onClick={handleReset}
                  className="bg-transparent hover:bg-white/10 text-white/80 hover:text-white px-5 py-2.5 border border-white/10 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <RotateCcw size={12} /> Retake Prakriti Test
                </button>
              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
}
