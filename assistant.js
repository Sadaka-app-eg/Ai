// المحرك الذكي المطور للمساعد الشخصي (أنيس)
class AdvancedSmartAssistant {
    constructor() {
        this.config = null;
        this.memory = JSON.parse(localStorage.getItem('assistant_memory')) || {
            user_habits: [], // العادات المستمرة
            daily_tasks: [],  // المهام اليومية
            parsed_files: [],  // سياق الملفات المقروءة
            interactions_count: 0
        };
    }

    // 1. جلب الإعدادات من الـ JSON
    async loadConfig() {
        try {
            const response = await fetch('config.json');
            this.config = await response.json();
            return this.config;
        } catch (error) {
            console.error("فشل تحميل الإعدادات:", error);
        }
    }

    // 2. خوارزمية تحليل النص المطور واقتراح الحلول الذكية
    analyzeInput(text) {
        this.memory.interactions_count++;
        const cleanedText = text.trim();
        let reply = "";

        // أ) رصد محاولة تنظيم اليوم أو إضافة المهام
        if (/(عايز اعمل|لازم اعمل|ورايا|جدول|مهمة|تذكير)/.test(cleanedText)) {
            reply = this.handleTaskManagement(cleanedText);
        } 
        // ب) رصد تسجيل العادات الشخصية وتذكرها
        else if (/(متعود|دايماً|كل يوم|عاداتي|بحب اعمل)/.test(cleanedText)) {
            reply = this.handleHabitsTracking(cleanedText);
        } 
        // ج) طلب اقتراحات وحلول ذكية بناءً على الذاكرة
        else if (/(اقترح|حل|مشكلة|مخنوق|كسلان|انظم وقتي)/.test(cleanedText)) {
            reply = this.generateContextualSuggestion(cleanedText);
        } 
        // د) رد عام ذكي يربط السياق إذا لم يطابق كلمات مفتاحية
        else {
            reply = this.generateGeneralSmartReply(cleanedText);
        }

        this.saveMemory();
        return reply;
    }

    // محرك إدارة المهام
    handleTaskManagement(text) {
        const taskContent = text.replace(/(عايز اعمل|لازم اعمل|ورايا|جدول|مهمة|تذكير)/g, '').trim();
        if (taskContent) {
            const newTask = {
                id: Date.now(),
                task: taskContent,
                status: 'pending',
                date: new Date().toLocaleDateString()
            };
            this.memory.daily_tasks.push(newTask);
            
            // ربط المهمة بالعادات تلقائياً لو فيه تشابه
            let extraNote = "";
            const matchedHabit = this.memory.user_habits.find(h => taskContent.includes(h.keyword));
            if (matchedHabit) {
                extraNote = `\n\n💡 ملحوظة: ربطت هذه المهمة بعادتك المسجلة سابقاً (${matchedHabit.habit})، بالتوفيق!`;
            }

            return `أبشر، أضفت "${taskContent}" لجدولك اليومي. سأتابعها معك اليوم لضمان إنجازها.${extraNote}`;
        }
        return this.getFormattedTasks();
    }

    // محرك تتبع وتصنيف العادات
    handleHabitsTracking(text) {
        const habitContent = text.replace(/(متعود|دايماً|كل يوم|عاداتي|بحب اعمل)/g, '').trim();
        if (habitContent) {
            // استخراج كلمة مفتاحية لربطها بالمهام مستقبلاً
            const keywords = ["مذاكرة", "كود", "تطوير", "رياضة", "قراءة", "نوم", "صلاة"];
            let foundKeyword = keywords.find(k => habitContent.includes(k)) || "عام";

            this.memory.user_habits.push({
                habit: habitContent,
                keyword: foundKeyword,
                timestamp: Date.now()
            });
            return `تم تسجيل هذه العادة في ذاكرتي العميقة: "${habitContent}". الآن، كلما أضفت مهمة متعلقة بـ (${foundKeyword})، سأقوم بتقديم نصائح مخصصة لك!`;
        }
        return this.getFormattedHabits();
    }

    // خوارزمية الاقتراحات الذكية المعتمدة على السياق (Contextual RAG-like)
    generateContextualSuggestion(text) {
        let suggestion = "";
        
        // إذا كان يشتكي من الكسل أو الوقت
        if (text.includes('كسلان') || text.includes('وقت')) {
            if (this.memory.daily_tasks.filter(t => t.status === 'pending').length > 0) {
                const topTask = this.memory.daily_tasks.find(t => t.status === 'pending').task;
                suggestion = `امسك الورقة والقلم وابدأ بـ 5 دقائق فقط في مهمتك الأولى اليوم: "${topTask}". قاعدة الـ 5 دقائق ستقضي على الكسل تماماً!`;
            } else {
                suggestion = "الوقت ملكك! بما أن جدولك فارغ حالياً، ما رأيك في استغلال الـ 30 دقيقة القادمة لتطوير مهارة جديدة تحبها؟";
            }
        } 
        // اقتراح مبني على العادات القديمة
        else if (this.memory.user_habits.length > 0) {
            const randomHabit = this.memory.user_habits[Math.floor(Math.random() * this.memory.user_habits.length)];
            suggestion = `بناءً على نظام حياتك وعادتك في "${randomHabit.habit}"، أقترح عليك تخصيص مساحتك الخاصة الآن والبدء فوراً لتبقي في قمة إنتاجيتك.`;
        } else {
            suggestion = "لتنظيم يومك واقتراح حلول دقيقة، ابدأ بإخباري عن عاداتك اليومية (مثال: أنا متعود إذاكر الساعة 8 مساءً) وسأتولى الباقي.";
        }
        return `💡 اقتراح مساعدك المخصص:\n${suggestion}`;
    }

    // معالجة قراءة وتحليل الملفات محلياً
    processFileContent(fileName, fileText) {
        // استخراج أهم الكلمات المتكررة في الملف (تحليل نصوص مبسط)
        const words = fileText.toLowerCase().split(/\s+/);
        const uniqueKeywords = [...new Set(words.filter(w => w.length > 4).slice(0, 5))];

        this.memory.parsed_files.push({
            name: fileName,
            keywords: uniqueKeywords,
            date: new Date().toLocaleDateString()
        });
        this.saveMemory();

        return `✅ تمت معالجة الملف: "${fileName}" محلياً.
        🔍 الكلمات المفتاحية المكتشفة: [${uniqueKeywords.join(', ')}].
        🤖 سأقوم باستخدام هذا السياق في محادثاتنا القادمة واقتراح الحلول بناءً عليه!`;
    }

    generateGeneralSmartReply(text) {
        // إذا كان المساعد يعرف عادات للمستخدم، يذكره بها بذكاء وسط الكلام
        if (this.memory.user_habits.length > 0) {
            const oneHabit = this.memory.user_habits[0].habit;
            return `كلامك مفهوم ومسجل. بما أنني أتعلم من أسلوبك، تذكرت عادتك في "${oneHabit}". هل كلامك الحالي مرتبط بها بأي شكل؟`;
        }
        return `فهمت قصدك تماماً. أنا هنا معك، هل تريدني أن أنظم هذه الفكرة في قائمة مهامك، أم تود اقتراحاً ذكياً بخصوصها؟`;
    }

    getFormattedTasks() {
        const pending = this.memory.daily_tasks.filter(t => t.status === 'pending');
        if (pending.length === 0) return "جدولك نظيف اليوم! لا توجد مهام معلقة. هل تريد إضافة شيء؟";
        return "📋 مهامك الحالية المنتظرة:\n" + pending.map((t, i) => `${i+1}. ${t.task}`).join('\n');
    }

    getFormattedHabits() {
        if (this.memory.user_habits.length === 0) return "لم تسجل عادات بعد. قل لي مثلاً: 'أنا متعود أقرأ قبل النوم'.";
        return "🧠 عاداتك المحفوظة في ذاكرتي:\n" + this.memory.user_habits.map((h) => `• ${h.habit}`).join('\n');
    }

    saveMemory() {
        localStorage.setItem('assistant_memory', JSON.stringify(this.memory));
    }
}

// تشغيل المحرك
const assistant = new AdvancedSmartAssistant();
assistant.loadConfig();

