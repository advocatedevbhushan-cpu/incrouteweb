import React from "react";
import { motion } from "motion/react";
import { 
  Building2, 
  MapPin, 
  Star, 
  CheckCircle2, 
  ShieldCheck, 
  ArrowRight, 
  Sparkles, 
  HelpCircle, 
  FileText,
  Users,
  TrendingUp,
  Clock
} from "lucide-react";
import { useLang } from "../lib/LanguageContext";
import { useAppNavigate } from "../lib/useAppNavigate";
import TestimonialCarousel from "./TestimonialCarousel";

interface LocalCityLandingProps {
  cityId: "bangalore" | "mumbai" | "delhi";
  setActiveTab?: (tab: string) => void;
}

export default function LocalCityLanding({ cityId, setActiveTab }: LocalCityLandingProps) {
  const { lang } = useLang();
  const navigateToTab = useAppNavigate();

  // City-specific content matrix
  const cityContent = {
    bangalore: {
      nameEn: "Bangalore",
      nameHi: "बेंगलुरु",
      hubEn: "Koramangala, Indiranagar, and HSR Layout",
      hubHi: "कोरमंगला, इंदिरानगर और HSR लेआउट",
      taglineEn: "India's Silicon Valley Startup Registration Headquarters",
      taglineHi: "भारत की सिलिकॉन वैली का स्टार्टअप रजिस्ट्रेशन हेडक्वार्टर",
      statsServed: "800+ Bangalore Startups Registered",
      localCAEn: "Local expert panels specialized in Karnataka DPIIT and Startup India registration.",
      localCAHi: "कर्नाटक DPIIT और स्टार्टअप इंडिया रजिस्ट्रेशन में माहिर लोकल सीए (CA) एक्सपर्ट्स।",
      reviewName: "Ananya Hegde",
      reviewRole: "CEO, Bengaluru FinTech Labs",
      reviewTextEn: "Registering our Pvt Ltd firm from Koramangala was incredibly easy with INCroute. D Bhushan and the team handled our MCA name approval in 24 hours. The best online company registration platform in India by far!",
      reviewTextHi: "INCroute के साथ कोरमंगला से अपनी प्राइवेट लिमिटेड कंपनी रजिस्टर कराना बेहद आसान था। डी भूषण और उनकी टीम ने 24 घंटे में हमारे MCA नाम की मंजूरी करा दी। सच में बेहतरीन!",
      localContextEn: "Fast-track legal filings tailored for technology, SaaS, and AI startups scaling in Bangalore."
    },
    mumbai: {
      nameEn: "Mumbai",
      nameHi: "मुंबई",
      hubEn: "Bandra Kurla Complex (BKC), Nariman Point, and Andheri East",
      hubHi: "बांद्रा कुर्ला कॉम्प्लेक्स (BKC), नरीमन पॉइंट और अंधेरी ईस्ट",
      taglineEn: "The Financial Capital's Premium Corporate Registration Hub",
      taglineHi: "वित्तीय राजधानी का प्रीमियम कॉर्पोरेट रजिस्ट्रेशन हब",
      statsServed: "600+ Mumbai Enterprises Incorporated",
      localCAEn: "Specialized advisors for Maharashtra stamp duty compliance and corporate registry laws.",
      localCAHi: "महाराष्ट्र स्टांप ड्यूटी कंप्लायंस और कॉर्पोरेट रजिस्ट्री कानूनों के विशेषज्ञ सलाहकार।",
      reviewName: "Vikram Mehta",
      reviewRole: "Managing Director, BKC Logistics",
      reviewTextEn: "INCroute provided outstanding support for our LLP registration in Mumbai. Absolute clarity on the online pvt ltd registration price and direct access to expert business compliance support. Highly recommended!",
      reviewTextHi: "INCroute ने मुंबई में हमारे LLP रजिस्ट्रेशन के लिए बेहतरीन सहायता प्रदान की। ऑनलाइन प्राइवेट लिमिटेड रजिस्ट्रेशन की कीमतों पर पूरी स्पष्टता। बहुत-बहुत धन्यवाद!",
      localContextEn: "Premium corporate setups optimized for logistics, retail, finance, and manufacturing giants in Mumbai."
    },
    delhi: {
      nameEn: "Delhi NCR",
      nameHi: "दिल्ली NCR",
      hubEn: "Connaught Place, Okhla, Gurgaon, and Noida",
      hubHi: "कनॉट प्लेस, ओखला, गुड़गांव और नोएडा",
      taglineEn: "Capital Region's Elite Startup & LLP Filing Desk",
      taglineHi: "राजधानी क्षेत्र का एलीट स्टार्टअप और LLP फाइलिंग डेस्क",
      statsServed: "900+ Delhi NCR Firms Registered",
      localCAEn: "Fast-track MCA filings for NCT Delhi, Haryana, and Uttar Pradesh registries.",
      localCAHi: "NCT दिल्ली, हरियाणा और उत्तर प्रदेश रजिस्ट्रियों के लिए फास्ट-ट्रैक MCA फाइलिंग।",
      reviewName: "Rajesh Shrivastava",
      reviewRole: "Founder, Connaught e-Commerce",
      reviewTextEn: "Stunning experience! Instant LLP registration completed in Delhi NCR with zero office visits. They mapped all documents needed for online OPC registration and got our COI issued in 8 working days. Superior service!",
      reviewTextHi: "शानदार अनुभव! बिना एक बार भी ऑफिस जाए दिल्ली NCR में हमारा LLP रजिस्ट्रेशन पूरा हो गया। उन्होंने सभी आवश्यक दस्तावेजों को व्यवस्थित किया और COI दिला दिया।",
      localContextEn: "Statutory compliance roadmaps specifically aligned with Delhi NCR's e-commerce and retail guidelines."
    }
  };

  const current = cityContent[cityId];
  const cityName = lang === "en" ? current.nameEn : current.nameHi;
  const hubs = lang === "en" ? current.hubEn : current.hubHi;
  const tagline = lang === "en" ? current.taglineEn : current.taglineHi;
  const localCA = lang === "en" ? current.localCAEn : current.localCAHi;
  const reviewText = lang === "en" ? current.reviewTextEn : current.reviewTextHi;

  const faqs = [
    {
      q: lang === "en" ? "How long does online company registration take?" : "ऑनलाइन कंपनी रजिस्ट्रेशन में कितना समय लगता है?",
      a: lang === "en" ? "Normally, the entire process—including Name Approval, DSC generation, SPICe+ form filing, and the final Certificate of Incorporation (COI) issuance—takes between 7 to 10 working days, depending on government MCA processing times." : "सामान्य तौर पर, नाम की मंजूरी, DSC बनाने, SPICe+ फॉर्म फाइलिंग और अंतिम COI जारी होने सहित पूरी प्रक्रिया में सरकारी MCA प्रोसेसिंग समय के आधार पर 7 से 10 वर्किंग दिन लगते हैं।"
    },
    {
      q: lang === "en" ? "What are the documents needed for online company registration?" : "ऑनलाइन कंपनी रजिस्ट्रेशन के लिए कौन से दस्तावेज आवश्यक हैं?",
      a: lang === "en" ? "For Directors/Shareholders: PAN Card, Aadhaar Card, Passport-size photo, and latest Bank Statement (not older than 2 months) with current address. For the Office Address: Utility Bill (electricity or water) and a signed No Objection Certificate (NOC) from the property owner." : "डायरेक्टर्स/शेयरधारकों के लिए: पैन कार्ड, आधार कार्ड, पासपोर्ट साइज फोटो और वर्तमान पते वाला बैंक स्टेटमेंट। ऑफिस के पते के लिए: यूटिलिटी बिल (बिजली या पानी) और मालिक से हस्ताक्षरित अनापत्ति प्रमाण पत्र (NOC)।"
    },
    {
      q: lang === "en" ? "Pvt Ltd vs LLP: Which business structure is best for my startup?" : "Pvt Ltd बनाम LLP: मेरे स्टार्टअप के लिए कौन सा ढांचा सबसे अच्छा है?",
      a: lang === "en" ? "Choose a Private Limited Company if you plan to raise institutional venture capital, offer ESOPs to employees, or scale rapidly. Choose a Limited Liability Partnership (LLP) if you have multiple partners, want to keep annual compliance costs low, and do not require immediate VC funding." : "यदि आप वीसी (VC) फंडिंग जुटाना चाहते हैं या ESOPs देना चाहते हैं, तो प्राइवेट लिमिटेड चुनें। यदि आप वार्षिक अनुपालन लागत कम रखना चाहते हैं और वीसी फंडिंग की तत्काल आवश्यकता नहीं है, तो LLP चुनें।"
    }
  ];

  return (
    <div className="space-y-16 text-left">
      
      {/* Hero Banner Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative premium-hero-card border border-brand-gold/30 rounded-3xl p-8 sm:p-12 overflow-hidden shadow-2xl"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-gold/10 blur-3xl rounded-full" />
        
        <div className="space-y-6 relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 bg-brand-gold/15 text-brand-gold text-[10px] font-semibold rounded-full border border-brand-gold/35 uppercase tracking-widest font-mono shadow-md">
            <MapPin className="w-3.5 h-3.5" />
            {cityName} Startup Desk
          </div>
          
          <h1 className="text-3xl sm:text-5xl font-light text-brand-text leading-tight tracking-tight serif">
            Online Pvt Ltd Company Registration in <span className="text-brand-gold italic font-normal font-serif">{cityName}</span>
          </h1>
          
          <p className="text-sm text-brand-text-muted leading-relaxed font-sans">
            {tagline}. Launch your business seamlessly across {hubs} with the best online company registration platform in India. Full ROC compliance & CA-backed filing under ₹999*.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              onClick={() => navigateToTab("services")}
              className="px-6 py-3.5 bg-brand-gold hover:bg-white text-black font-bold text-[10px] tracking-wider uppercase rounded-lg transition-all duration-150 shadow-lg shadow-brand-gold/15 flex items-center gap-2 cursor-pointer"
            >
              Start Registration Online <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <span className="text-xs text-brand-text-muted font-mono bg-brand-bg-lighter border border-brand-border px-3 py-2 rounded-lg">
              {current.statsServed}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Main Content Grid: City Value Props & Testimonial */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch max-w-6xl mx-auto">
        
        {/* Left Column: Local Value Props */}
        <div className="lg:col-span-7 space-y-6 flex flex-col justify-between">
          <div className="bg-brand-bg-lighter border border-brand-border rounded-2xl p-6 sm:p-8 space-y-5 premium-card">
            <div className="flex items-center gap-3 border-b border-brand-border pb-4">
              <div className="p-2 bg-brand-gold/10 border border-brand-gold/20 rounded-lg text-brand-gold">
                <Building2 className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-light text-brand-text serif">Why Founders Choose INCroute in {cityName}</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3.5">
                <CheckCircle2 className="w-4 h-4 text-brand-gold shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-brand-text">Instant MCA Name Feasibility & Filing</h4>
                  <p className="text-[11px] text-brand-text-muted leading-relaxed font-sans">{lang === "en" ? "Immediate checks against Ministry of Corporate Affairs (MCA) database to ensure 100% unique, conflict-free name selections." : "तुरंत MCA डेटाबेस के विरुद्ध नाम की जांच करके 100% सही और सुरक्षित नाम का चयन करना।"}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3.5">
                <CheckCircle2 className="w-4 h-4 text-brand-gold shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-brand-text">Experienced Local Advisory Panel</h4>
                  <p className="text-[11px] text-brand-text-muted leading-relaxed font-sans">{localCA}</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <CheckCircle2 className="w-4 h-4 text-brand-gold shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-brand-text">Complete Post-Incorporation Support</h4>
                  <p className="text-[11px] text-brand-text-muted leading-relaxed font-sans">{lang === "en" ? "From opening local corporate bank accounts to filing ADT-1 and drafting stamped partnership agreements." : "बैंक खाता खोलने से लेकर ADT-1 दाखिल करने और स्टांप युक्त डीड तैयार करने तक पूरा सपोर्ट।"}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live Testimonial Carousel */}
        <div className="lg:col-span-5">
          <TestimonialCarousel  />
        </div>
      </div>

      {/* Comparison Booster segment */}
      <div className="max-w-4xl mx-auto bg-brand-bg-lighter border border-brand-border rounded-2xl p-6 sm:p-8 space-y-6 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-gold/10 text-brand-gold text-[9px] font-semibold rounded-full border border-brand-gold/20 uppercase tracking-widest font-mono">
          <TrendingUp className="w-3 h-3" /> Entity Advisor
        </div>
        <h3 className="text-xl font-light text-brand-text serif">Pvt Ltd vs LLP for Startup: Which is Best for You?</h3>
        <p className="text-xs text-brand-text-muted font-sans leading-relaxed max-w-xl mx-auto">
          Choosing the wrong corporate structure can cost thousands in compliance fees or lock you out of VC funding. Pvt Ltd is the gold standard for raising seed funding and ESOPs, whereas LLP offers limited liability with minimal annual compliance.
        </p>
        <button
          onClick={() => navigateToTab("comparison")}
          className="px-5 py-2.5 border border-brand-gold/40 hover:border-brand-gold hover:bg-brand-gold/10 text-brand-gold text-[9px] font-mono uppercase tracking-widest rounded-lg transition-colors cursor-pointer"
        >
          Compare Entities Side-by-Side
        </button>
      </div>

      {/* City SEO Specific FAQs (Process Questions) */}
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-gold/10 text-brand-gold text-[9px] font-semibold rounded-full border border-brand-gold/20 uppercase tracking-widest font-mono">
            <HelpCircle className="w-3 h-3" /> Process FAQs
          </div>
          <h3 className="text-2xl font-light text-brand-text serif">Filing Guidelines & Requirements</h3>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div key={idx} className="bg-brand-bg-lighter border border-brand-border rounded-xl p-5 space-y-2 hover:border-brand-gold/30 transition-colors">
              <h4 className="text-sm font-semibold text-brand-text flex items-center gap-2">
                <Clock className="w-4 h-4 text-brand-gold shrink-0" />
                {faq.q}
              </h4>
              <p className="text-xs text-brand-text-muted leading-relaxed font-sans pl-6">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
